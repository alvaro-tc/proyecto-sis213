"""Automatización del flujo QR de Mercantil Santa Cruz (MSC).

Portado desde api_msc/msc_api.py eliminando FastAPI, PaymentStore y el
asyncio wrapper. Sólo quedan las funciones puras de automatización ADB.

Identificación de pagos:
    MSC incluye el "concepto" del QR en la notificación al receptor.
    Cada cobro se genera con el `code` único (6 chars) como concepto,
    por lo que el BankManager puede hacer match exacto.

Flujo:
    despertar → ciclar WiFi → relanzar app → login →
    navegar → rellenar (monto + concepto) → confirmar →
    desplazar → guardar → descargar PNG → decodificar QR → devolver payload
"""
from __future__ import annotations

import json
import logging
import os
import time
from pathlib import Path
from typing import Optional

from banks.adb import AdbController
from banks.qr_decoder import decode_qr_from_file

log = logging.getLogger("banks.msc")

# ── Rutas ──────────────────────────────────────────────────────────────────────
HERE       = Path(__file__).parent
_CFG_FILE  = HERE / "config.json"
_QR_DIR    = HERE.parent.parent / "data" / "qrs" / "msc"
_TIMINGS_FILE = HERE.parent.parent / "data" / "msc_timings.json"

_QR_DIR.mkdir(parents=True, exist_ok=True)

import threading
_TIMINGS_LOCK = threading.Lock()


# ── Config ────────────────────────────────────────────────────────────────────

def load_config() -> dict:
    with _CFG_FILE.open("r", encoding="utf-8") as f:
        return json.load(f)


# ── Historial de tiempos ───────────────────────────────────────────────────────

def _read_timings() -> list[float]:
    try:
        return json.loads(_TIMINGS_FILE.read_text(encoding="utf-8"))
    except Exception:
        return []


def _append_timing(elapsed: float) -> None:
    with _TIMINGS_LOCK:
        timings = _read_timings()[-9:]
        timings.append(round(elapsed, 1))
        try:
            _TIMINGS_FILE.parent.mkdir(parents=True, exist_ok=True)
            _TIMINGS_FILE.write_text(json.dumps(timings), encoding="utf-8")
        except Exception as exc:
            log.warning("No se pudo guardar timing: %s", exc)


def estimate_seconds(cfg: Optional[dict] = None) -> int:
    """Estimado conservador de cuánto tarda generate_qr() en segundos.

    Si hay historial real: max(últimas 10) + 80s buffer.
    Sin historial: suma de waits del config + wifi_timeout + overhead.
    """
    timings = _read_timings()
    if timings:
        return int(max(timings)) + 80

    if cfg is None:
        try:
            cfg = load_config()
        except Exception:
            return 180

    waits    = sum(cfg.get("waits", {}).values())
    wifi_t   = cfg.get("wifi_reconnect_timeout_s", 30)
    overhead = cfg.get("estimate_overhead_s", 80)
    return int(waits + wifi_t + overhead)


# ── Pasos del flujo ────────────────────────────────────────────────────────────

def _step_login(adb: AdbController, cfg: dict, password: str) -> None:
    if not password:
        raise RuntimeError("MSC_PASSWORD vacío — revisar .env")
    L, w = cfg["login"], cfg["waits"]

    if not adb.wait_for_text("Acceder", timeout_s=12.0):
        log.warning("login: pantalla de login no detectada, intentando igual")

    adb.tap(*L["password_input"])
    time.sleep(w["after_password_tap_s"])
    adb.text(password)
    time.sleep(w["after_password_text_s"])
    adb.keyevent("KEYCODE_BACK")
    time.sleep(w["after_back_keyboard_s"])
    adb.tap(*L["acceder_button"])
    time.sleep(w["after_acceder_s"])

    if not adb.wait_for_text("Transferencias", timeout_s=15.0):
        raise RuntimeError(
            "Login falló: la home de MSC no cargó. "
            "Posibles causas: contraseña incorrecta, sesión bloqueada o app actualizada."
        )


def _step_navigate(adb: AdbController, cfg: dict) -> None:
    f, w = cfg["flow"], cfg["waits"]

    adb.tap(*f["qr_home_tile"])
    time.sleep(w["after_qr_home_s"])
    if not adb.wait_for_text("Solicitud de cobro QR", timeout_s=10.0):
        raise RuntimeError("Submenú QR no apareció tras tap en home tile")

    adb.tap(*f["solicitud_cobro_qr"])
    time.sleep(w["after_solicitud_s"])
    if not adb.wait_for_any(["Selecciona la cuenta destino", "Caja de Ahorro"], timeout_s=15.0):
        raise RuntimeError("Lista de cuentas no cargó tras tap en 'Solicitud de cobro QR'")

    adb.tap(*f["cuenta_destino_row"])
    time.sleep(w["after_cuenta_s"])
    if not adb.wait_for_text("Detalle de cobro QR", timeout_s=12.0):
        raise RuntimeError("Formulario 'Detalle de cobro QR' no apareció")


def _step_fill(adb: AdbController, cfg: dict, amount_bs: float, concepto: str) -> None:
    f, w = cfg["flow"], cfg["waits"]

    centavos = int(round(amount_bs * 100))
    if centavos <= 0:
        raise RuntimeError(f"Monto inválido: {amount_bs}")

    # Monto
    adb.tap(*f["monto_tile"])
    time.sleep(w["after_monto_tap_s"])
    if not adb.wait_for_text("Aceptar", timeout_s=6.0):
        log.warning("Dialog de monto no detectado, tipeo igual")
    adb.text(str(centavos))
    time.sleep(w["after_monto_text_s"])
    adb.tap(*f["monto_dialog_aceptar"])
    time.sleep(w["after_monto_aceptar_s"])

    # Concepto
    adb.tap(*f["concepto_input"])
    time.sleep(w["after_concepto_tap_s"])
    adb.text(concepto)
    time.sleep(w["after_concepto_text_s"])
    adb.keyevent("KEYCODE_BACK")
    time.sleep(w["after_back_keyboard_s"])

    # Confirmar
    adb.tap(*f["confirmar_button"])
    if not adb.wait_for_text("Se gener", timeout_s=20.0):
        raise RuntimeError(
            "'Confirmar' no produjo pantalla de QR exitoso. "
            "Posibles causas: monto rechazado, sin conexión o app actualizada."
        )
    time.sleep(w["after_confirmar_s"])


def _step_save_pull(adb: AdbController, cfg: dict) -> Path:
    """Desliza para revelar 'Guardar QR', lo toca, descarga el PNG."""
    f, w     = cfg["flow"], cfg["waits"]
    save_dir = cfg.get("msc_qr_save_dir", "/sdcard/Pictures/BancaMovil")

    before = adb.ls(save_dir)

    adb.swipe(*f["scroll_from"], *f["scroll_to"], 300)
    time.sleep(w["after_scroll_s"])

    if not adb.wait_for_text("Guardar QR", timeout_s=8.0):
        log.warning("'Guardar QR' no detectado por uiautomator, tap por coordenada igual")
    adb.tap(*f["guardar_qr_button"])
    time.sleep(w["after_guardar_tap_s"])

    # Esperar a que aparezca el nuevo archivo (hasta 20s)
    deadline = time.time() + 20.0
    fname: Optional[str] = None
    while time.time() < deadline:
        time.sleep(1.0)
        new = adb.ls(save_dir) - before
        if new:
            fname = sorted(new)[-1]
            break

    if not fname:
        raise RuntimeError(
            f"'Guardar QR' no escribió ningún archivo en {save_dir} tras 20s. "
            "Verificar que la app tenga permiso de escritura en almacenamiento."
        )

    time.sleep(w["after_guardar_s"])

    remote = f"{save_dir}/{fname}"
    local  = _QR_DIR / fname
    adb.pull(remote, local)
    adb.rm(remote)

    if not local.exists() or local.stat().st_size < 512:
        raise RuntimeError(f"PNG descargado vacío o corrupto: {local}")
    return local


# ── Función principal ──────────────────────────────────────────────────────────

def generate_qr(adb: AdbController, amount_bs: float, code: str,
                cfg: Optional[dict] = None, password: Optional[str] = None) -> str:
    """Flujo completo de generación de QR MSC.

    Parámetros:
        adb        : AdbController ya configurado
        amount_bs  : monto en bolivianos
        code       : código único de 6 chars (se usa como concepto)
        cfg        : config dict (se carga de config.json si es None)
        password   : contraseña MSC (se lee de MSC_PASSWORD env si es None)

    Devuelve el payload (texto) del QR generado.
    La pantalla se apaga SIEMPRE al final (éxito o error).
    """
    if cfg is None:
        cfg = load_config()
    if password is None:
        password = os.environ.get("MSC_PASSWORD", "")

    if not adb.device_online():
        raise RuntimeError("Dispositivo ADB no conectado o no autorizado")

    pkg = cfg["msc_package"]
    w   = cfg["waits"]
    scr = cfg["screen"]

    t0 = time.time()
    local: Optional[Path] = None
    try:
        log.info("MSC >> despertando y desbloqueando")
        adb.wake_and_unlock(scr["width"], scr["height"])

        log.info("MSC >> ciclando WiFi")
        adb.cycle_wifi(
            disable_wait=w.get("after_wifi_disable_s", 2.0),
            enable_wait=w.get("after_wifi_connect_s", 1.5),
            reconnect_timeout=cfg.get("wifi_reconnect_timeout_s", 30.0),
        )

        log.info("MSC >> relanzando %s", pkg)
        adb.force_stop(pkg)
        time.sleep(0.5)
        adb.launch_app(pkg)
        time.sleep(w["after_launch_s"])

        log.info("MSC >> login")
        _step_login(adb, cfg, password)

        log.info("MSC >> navegando al formulario QR")
        _step_navigate(adb, cfg)

        log.info("MSC >> rellenando monto=%.2f concepto=%s", amount_bs, code)
        _step_fill(adb, cfg, amount_bs, code)

        log.info("MSC >> guardando QR y descargando imagen")
        local = _step_save_pull(adb, cfg)

        adb.force_stop(pkg)

        elapsed = time.time() - t0
        _append_timing(elapsed)
        log.info("MSC >> QR listo en %.1f s", elapsed)

        payload = decode_qr_from_file(local)
        if not payload:
            raise RuntimeError("QR generado pero no se pudo decodificar el payload")
        return payload

    finally:
        # Limpiar PNG local temporal
        if local and local.exists():
            try:
                local.unlink()
            except Exception:
                pass
        # Apagar pantalla siempre
        try:
            adb.screen_off()
        except Exception:
            pass
