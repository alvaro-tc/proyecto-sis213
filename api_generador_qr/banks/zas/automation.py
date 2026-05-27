"""Automatización del flujo QR de Banco Ganadero (ZAS / bec.vdb.direct).

Portado desde api_zas/zas_automation.py eliminando FastAPI y asyncio.
Sólo quedan las funciones puras de automatización ADB.

Identificación de pagos (slot de decimales):
    ZAS sólo envía el monto en la notificación, sin concepto visible.
    Para distinguir pagos concurrentes del mismo monto base, se encoda
    el slot en los centavos:
        amount_to_pay = requested_amount + slot * 0.01
    con slots 0..9 (máximo 10 cobros simultáneos del mismo monto base).

Flujo:
    despertar → ciclar WiFi → relanzar app → lápiz (formulario) →
    campo monto → campo motivo → Generar → screenshot loop hasta QR visible
"""
from __future__ import annotations

import logging
import re
import threading
import time
import xml.etree.ElementTree as ET
from typing import List, Optional, Tuple

from banks.adb import AdbController
from banks.qr_decoder import decode_qr_from_bytes

log = logging.getLogger("banks.zas")

# ── Constantes ────────────────────────────────────────────────────────────────

ZAS_PACKAGE = "bec.vdb.direct"
MAX_SLOTS   = 10        # máximo de cobros simultáneos con el mismo monto base
QR_TIMEOUT  = 45.0     # segundos esperando a que aparezca el QR en pantalla
QR_POLL     = 1.5      # segundos entre screenshots

# Coordenadas de respaldo calibradas para 720×1650 (bec.vdb.direct v1.4.1).
# Se usan SÓLO si el UI dump no encuentra los campos dinámicamente.
_BTN_EDIT     = (264, 1381)
_FIELD_MONTO  = (360, 528)
_FIELD_MOTIVO = (360, 674)
_BTN_GENERAR  = (516, 1108)
_SCREEN_W     = 720
_SCREEN_H     = 1650

# Textos que pueden aparecer en el botón "Generar" según la versión del app
_GENERAR_LABELS = ["Generar", "GENERAR", "Cobrar", "COBRAR", "Confirmar"]


# ── Sistema de slots (en-proceso, thread-safe) ─────────────────────────────────

_slot_lock = threading.Lock()


def reserve_slot(requested_amount: float) -> Tuple[float, int]:
    """Reserva el próximo slot disponible para `requested_amount`.

    Consulta la base de datos Django para encontrar qué slots están en uso
    (Payments con provider='zas' y status en CREATING/PENDING del mismo monto
    base). Devuelve (amount_to_pay, slot_index).

    Lanza RuntimeError si los 10 slots están ocupados.
    """
    base = round(requested_amount, 2)
    with _slot_lock:
        used_slots = _get_used_slots(base)
        for slot in range(MAX_SLOTS):
            if slot not in used_slots:
                amount_to_pay = round(base + slot * 0.01, 2)
                return amount_to_pay, slot
    raise RuntimeError(
        f"Todos los slots ZAS ocupados para monto {base:.2f} "
        f"(max {MAX_SLOTS} cobros simultáneos)"
    )


def release_slot(requested_amount: float, slot_index: int) -> None:
    """Marca el slot como liberado (no-op; el slot se libera cuando el
    Payment cambia de estado en la DB)."""
    # La liberación real ocurre porque reserve_slot consulta la DB;
    # no hay estado en memoria que limpiar.
    pass


def _get_used_slots(base: float) -> set[int]:
    """Devuelve el conjunto de slots en uso para `base` (consulta DB)."""
    try:
        from decimal import Decimal
        from qrgen.models import Payment, PaymentStatus
        active = Payment.objects.filter(
            provider="zas",
            status__in=[PaymentStatus.CREATING, PaymentStatus.PENDING],
            requested_amount=Decimal(str(base)),
        )
        slots = set()
        for p in active:
            if p.amount_to_pay is not None:
                diff = round(float(p.amount_to_pay) - base, 4)
                slot = round(diff / 0.01)
                if 0 <= slot < MAX_SLOTS:
                    slots.add(slot)
        return slots
    except Exception as exc:
        log.warning("No se pudo consultar slots ZAS en DB: %s", exc)
        return set()


# ── Detección dinámica de UI (UI Automator) ────────────────────────────────────

def _parse_bounds(bounds_str: str) -> Optional[Tuple[int, int, int, int]]:
    """Parsea '[x1,y1][x2,y2]' y devuelve (x1, y1, x2, y2) o None."""
    m = re.match(r'\[(\d+),(\d+)\]\[(\d+),(\d+)\]', bounds_str or "")
    if not m:
        return None
    return int(m.group(1)), int(m.group(2)), int(m.group(3)), int(m.group(4))


def _center(x1: int, y1: int, x2: int, y2: int) -> Tuple[int, int]:
    return (x1 + x2) // 2, (y1 + y2) // 2


def _find_editable_fields(adb: AdbController) -> List[Tuple[int, int]]:
    """Devuelve las posiciones centrales de los EditText visibles en pantalla,
    ordenadas de arriba a abajo (monto primero, motivo segundo)."""
    xml_str = adb.ui_dump()
    if not xml_str.strip():
        log.warning("ZAS >> ui_dump vacío, no se pueden detectar campos dinámicamente")
        return []
    try:
        root = ET.fromstring(xml_str)
    except ET.ParseError as exc:
        log.warning("ZAS >> error parseando ui_dump: %s", exc)
        return []

    centers: List[Tuple[int, int]] = []
    for node in root.iter("node"):
        cls = node.get("class") or ""
        if "EditText" not in cls:
            continue
        b = _parse_bounds(node.get("bounds", ""))
        if b and b[2] > b[0] and b[3] > b[1]:   # bounds válidos y no-vacíos
            centers.append(_center(*b))

    # Ordenar por coordenada Y (arriba → abajo)
    centers.sort(key=lambda c: c[1])
    log.info("ZAS >> EditText encontrados en pantalla: %s", centers)
    return centers


def _find_button_by_text(adb: AdbController,
                         labels: List[str]) -> Optional[Tuple[int, int]]:
    """Busca un Button/TextView cuyo texto coincida con alguno de `labels`.

    Devuelve el centro del primer match o None.
    """
    xml_str = adb.ui_dump()
    if not xml_str.strip():
        return None
    try:
        root = ET.fromstring(xml_str)
    except ET.ParseError:
        return None

    labels_lower = [l.lower() for l in labels]
    for node in root.iter("node"):
        text = (node.get("text") or "").lower().strip()
        if text in labels_lower:
            b = _parse_bounds(node.get("bounds", ""))
            if b:
                return _center(*b)
    return None


# ── Helpers de pantalla ────────────────────────────────────────────────────────

def _clear_field_and_type(adb: AdbController, coords: Tuple[int, int],
                          value: str) -> None:
    """Enfoca el campo, borra el contenido existente y escribe el nuevo valor.

    Mejoras respecto a la versión anterior:
    - Envía todos los DEL en UN SOLO comando ADB (antes eran 50 llamadas
      individuales → lento y propenso a que el campo pierda foco entre llamadas).
    - Limpieza bidireccional: del final hacia atrás + del inicio hacia adelante.
    - Verifica que el campo esté limpio tocándolo de nuevo antes de escribir.
    """
    x, y = coords

    # 1. Tap para enfocar
    adb.tap(x, y)
    time.sleep(0.5)

    # 2. Ir al final y borrar hacia atrás — UN SOLO comando ADB con 30 DEL
    adb.keyevent("KEYCODE_MOVE_END")
    time.sleep(0.15)
    adb.shell("input", "keyevent", *["KEYCODE_DEL"] * 30)
    time.sleep(0.15)

    # 3. Ir al inicio y borrar hacia adelante por si quedó algo
    adb.keyevent("KEYCODE_MOVE_HOME")
    time.sleep(0.1)
    adb.shell("input", "keyevent", *["KEYCODE_FORWARD_DEL"] * 30)
    time.sleep(0.2)

    # 4. Re-tap para asegurarse de que el campo sigue enfocado
    adb.tap(x, y)
    time.sleep(0.3)

    # 5. Escribir el nuevo valor
    if value:
        adb.text(value)
        time.sleep(0.15)


def _wait_for_qr(adb: AdbController, timeout: float = QR_TIMEOUT,
                 poll: float = QR_POLL) -> Optional[str]:
    """Hace screenshots hasta detectar un QR en pantalla.

    Devuelve el payload del QR o None si se agota el timeout.
    """
    deadline = time.time() + timeout
    while time.time() < deadline:
        png = adb.screencap()
        if png:
            data = decode_qr_from_bytes(png)
            if data:
                log.info("ZAS QR detectado: %s...", data[:40])
                return data
        time.sleep(poll)
    return None


# ── Función principal ──────────────────────────────────────────────────────────

def generate_qr(adb: AdbController, amount_to_pay: float,
                description: str = "",
                wifi_disable_wait: float = 2.0,
                wifi_enable_wait: float = 4.0,
                wifi_reconnect_timeout: float = 30.0) -> str:
    """Flujo completo de generación de QR ZAS.

    Parámetros:
        adb           : AdbController ya configurado
        amount_to_pay : monto exacto incluyendo slot de decimales
        description   : motivo visible al pagador (max 40 chars)

    Devuelve el payload (texto) del QR generado.
    La pantalla se apaga al finalizar.
    """
    if not adb.device_online():
        raise RuntimeError("Dispositivo ADB no conectado o no autorizado")

    log.info("ZAS >> generando QR monto=%.2f motivo=%r", amount_to_pay, description)

    try:
        adb.wake_and_unlock(_SCREEN_W, _SCREEN_H)

        log.info("ZAS >> ciclando WiFi")
        adb.cycle_wifi(
            disable_wait=wifi_disable_wait,
            enable_wait=wifi_enable_wait,
            reconnect_timeout=wifi_reconnect_timeout,
        )

        log.info("ZAS >> relanzando %s", ZAS_PACKAGE)
        adb.force_stop(ZAS_PACKAGE)
        adb.launch_app(ZAS_PACKAGE)

        # Esperar a que el splash desaparezca y cargue la pantalla principal.
        # El splash dura ~6-7 s; buscamos el botón "Ingresar" que SÓLO aparece
        # en la pantalla principal (no en el splash), con timeout de 20 s.
        log.info("ZAS >> esperando que cargue la pantalla principal (timeout=20s)")
        loaded = adb.wait_for_text("Ingresar", timeout_s=20.0, poll_s=1.5)
        if loaded:
            log.info("ZAS >> pantalla principal lista")
        else:
            log.warning("ZAS >> 'Ingresar' no detectado en 20s — continuando igual")
        time.sleep(0.5)   # pequeño margen tras detectar la pantalla

        # ── Abrir formulario con el lápiz ─────────────────────────────────────
        log.info("ZAS >> abriendo formulario (botón editar en %s)", _BTN_EDIT)
        adb.tap(*_BTN_EDIT)
        time.sleep(3)   # dar tiempo para que el formulario termine de abrir

        # ── Detectar campos dinámicamente (robustez ante actualizaciones del app) ──
        fields = _find_editable_fields(adb)

        if len(fields) >= 2:
            field_monto, field_motivo = fields[0], fields[1]
            log.info("ZAS >> campos detectados: monto=%s motivo=%s",
                     field_monto, field_motivo)
        else:
            log.warning(
                "ZAS >> UI dump no encontró 2 EditText (encontró %d). "
                "Usando coordenadas hardcoded %s / %s",
                len(fields), _FIELD_MONTO, _FIELD_MOTIVO,
            )
            field_monto  = _FIELD_MONTO
            field_motivo = _FIELD_MOTIVO

        # ── Monto ─────────────────────────────────────────────────────────────
        log.info("ZAS >> escribiendo monto %.2f en campo %s", amount_to_pay, field_monto)
        _clear_field_and_type(adb, field_monto, f"{amount_to_pay:.2f}")
        adb.keyevent("KEYCODE_BACK")   # cerrar teclado
        time.sleep(0.3)

        # ── Motivo ────────────────────────────────────────────────────────────
        motivo = description[:40] if description else ""
        log.info("ZAS >> escribiendo motivo %r en campo %s", motivo, field_motivo)
        _clear_field_and_type(adb, field_motivo, motivo)
        adb.keyevent("KEYCODE_BACK")   # cerrar teclado
        time.sleep(0.3)

        # ── Botón Generar ─────────────────────────────────────────────────────
        btn = _find_button_by_text(adb, _GENERAR_LABELS)
        if btn:
            log.info("ZAS >> botón Generar detectado en %s", btn)
        else:
            log.warning("ZAS >> botón Generar no detectado, usando coord hardcoded %s",
                        _BTN_GENERAR)
            btn = _BTN_GENERAR

        adb.tap(*btn)
        log.info("ZAS >> esperando QR en pantalla (timeout=%.0fs)", QR_TIMEOUT)

        payload = _wait_for_qr(adb)
        if not payload:
            raise RuntimeError(
                "ZAS: no se pudo leer el QR de la pantalla tras "
                f"{QR_TIMEOUT:.0f}s de espera"
            )

        return payload

    finally:
        try:
            adb.screen_off()
        except Exception:
            pass
