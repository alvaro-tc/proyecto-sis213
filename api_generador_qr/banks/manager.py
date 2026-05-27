"""BankManager — singleton que coordina el dispositivo ADB compartido.

Responsabilidades:
- Mantiene una única instancia de AdbController (un solo teléfono).
- Serializa el acceso al ADB con un threading.Lock (un QR a la vez).
- Arranca el NotificationListener en segundo plano.
- Registra los callbacks de notificación de cada banco (MSC, ZAS).
- Al recibir una notificación, hace matching contra los Payments PENDING
  en la base de datos y los marca como PAID.

Inicio:
    Llamar a BankManager.start() desde qrgen/apps.py::AppConfig.ready().

Parada:
    Llamar a BankManager.stop() (opcional; en desarrollo Django reinicia solo).
"""
from __future__ import annotations

import logging
import re
import threading
import time
from typing import Optional

log = logging.getLogger("banks.manager")

# Importaciones pesadas diferidas para no romper el arranque de Django
# antes de que la app esté lista.
_manager_instance: Optional["BankManager"] = None
_manager_lock = threading.Lock()

RE_AMOUNT = re.compile(r"Bs\.?\s*([0-9]+(?:[\.,][0-9]{1,2})?)")


def get_manager() -> "BankManager":
    """Devuelve la instancia singleton del BankManager."""
    global _manager_instance
    if _manager_instance is None:
        raise RuntimeError("BankManager no inicializado — llamar start() primero")
    return _manager_instance


class BankManager:
    """Singleton que coordina el dispositivo ADB y el listener de notificaciones."""

    def __init__(self):
        from django.conf import settings as djsettings
        from .adb import AdbController
        from .notifications import NotificationListener

        self.adb = AdbController(
            adb_path=djsettings.ADB_PATH,
            serial=djsettings.ADB_DEVICE_SERIAL or None,
        )
        self.adb_lock = threading.Lock()
        self.listener = NotificationListener(self.adb, poll_s=2.0)
        self._started = False

    # ------------------------------------------------------------------
    # Ciclo de vida
    # ------------------------------------------------------------------

    def start(self) -> None:
        if self._started:
            return
        self._register_bank_callbacks()
        self.listener.start()
        self._started = True
        log.info("BankManager: iniciado (device=%s)", self.adb.serial or "auto")

    def stop(self) -> None:
        self.listener.stop()
        self._started = False
        log.info("BankManager: detenido")

    # ------------------------------------------------------------------
    # Registro de bancos
    # ------------------------------------------------------------------

    def _register_bank_callbacks(self) -> None:
        from django.conf import settings as djsettings

        priority = djsettings.PROVIDER_PRIORITY
        if "msc" in priority:
            from .msc import MSC_PACKAGE
            self.listener.register(MSC_PACKAGE, self._on_msc_notif)
            log.info("BankManager: MSC registrado (pkg=%s)", MSC_PACKAGE)

        if "zas" in priority:
            from .zas import ZAS_PACKAGE
            self.listener.register(ZAS_PACKAGE, self._on_zas_notif)
            log.info("BankManager: ZAS registrado (pkg=%s)", ZAS_PACKAGE)

    # ------------------------------------------------------------------
    # Callbacks de notificación
    # ------------------------------------------------------------------

    def _on_msc_notif(self, notif: dict) -> None:
        """Procesa notificaciones MSC: match por código (concepto) + monto."""
        from .notifications import notif_blob
        blob = notif_blob(notif)
        if not blob:
            return

        amounts = _extract_amounts(blob)
        log.debug("MSC notif: %s | amounts=%s", blob[:120], amounts)

        # Buscar el Payment pendiente cuyo code esté en el texto
        payment = _find_msc_payment(blob, amounts)
        if payment:
            _mark_paid(payment, notif)
        else:
            log.info("MSC notif sin match: %s", blob[:200])

    def _on_zas_notif(self, notif: dict) -> None:
        """Procesa notificaciones ZAS: match por monto exacto (decimal-encoded)."""
        from .notifications import notif_blob
        blob = notif_blob(notif)
        if not blob:
            return

        amounts = _extract_amounts(blob)
        log.debug("ZAS notif: %s | amounts=%s", blob[:120], amounts)

        payment = _find_zas_payment(amounts)
        if payment:
            _mark_paid(payment, notif)
        else:
            log.info("ZAS notif sin match: %s", blob[:200])


# ------------------------------------------------------------------
# Helpers de matching contra Django DB
# ------------------------------------------------------------------

def _extract_amounts(text: str) -> list[float]:
    out = []
    for m in RE_AMOUNT.finditer(text or ""):
        try:
            out.append(float(m.group(1).replace(",", ".")))
        except ValueError:
            pass
    return out


def _find_msc_payment(text: str, amounts: list[float]):
    """Busca un Payment MSC pendiente cuyo `code` esté en el texto
    y cuyo `amount_to_pay` coincida."""
    try:
        from qrgen.models import Payment, PaymentStatus
        upper = text.upper()
        amounts_r = {round(a, 2) for a in amounts}
        qs = Payment.objects.filter(provider="msc", status=PaymentStatus.PENDING)
        for p in qs:
            if p.code and p.code.upper() in upper:
                if not amounts_r or round(float(p.amount_to_pay or p.requested_amount), 2) in amounts_r:
                    return p
                else:
                    log.warning("MSC code=%s match pero monto distinto: esperado=%.2f notif=%s",
                                p.code, float(p.amount_to_pay or p.requested_amount), sorted(amounts_r))
    except Exception as exc:
        log.exception("Error buscando payment MSC: %s", exc)
    return None


def _find_zas_payment(amounts: list[float]):
    """Busca un Payment ZAS pendiente cuyo `amount_to_pay` coincida exactamente."""
    if not amounts:
        return None
    try:
        from qrgen.models import Payment, PaymentStatus
        amounts_r = {round(a, 2) for a in amounts}
        qs = Payment.objects.filter(provider="zas", status=PaymentStatus.PENDING)
        for p in qs:
            if round(float(p.amount_to_pay or p.requested_amount), 2) in amounts_r:
                return p
    except Exception as exc:
        log.exception("Error buscando payment ZAS: %s", exc)
    return None


def _mark_paid(payment, notif: dict) -> None:
    """Marca el Payment como PAID y guarda la notificación."""
    try:
        from django.utils import timezone
        from qrgen.models import PaymentStatus
        payment.status = PaymentStatus.PAID
        payment.paid_at = timezone.now()
        payment.notification = {
            k: notif.get(k)
            for k in ("key", "channel", "title", "text", "bigtext", "when", "pkg")
        }
        payment.save(update_fields=["status", "paid_at", "notification"])
        log.info("PAGADO payment=%s provider=%s amount=%.2f",
                 payment.id, payment.provider,
                 float(payment.amount_to_pay or payment.requested_amount))
        try:
            from qrgen.services import post_webhook
            post_webhook(payment, "paid", {"paid_at": payment.paid_at.isoformat(timespec="seconds")})
        except Exception:  # noqa: BLE001
            log.exception("webhook 'paid' fallo para payment=%s", payment.id)
    except Exception as exc:
        log.exception("Error marcando payment como PAID: %s", exc)


# ------------------------------------------------------------------
# API de módulo
# ------------------------------------------------------------------

def start() -> None:
    """Crea e inicia el BankManager singleton. Llamar desde AppConfig.ready()."""
    global _manager_instance
    with _manager_lock:
        if _manager_instance is None:
            _manager_instance = BankManager()
        _manager_instance.start()


def stop() -> None:
    global _manager_instance
    with _manager_lock:
        if _manager_instance:
            _manager_instance.stop()
            _manager_instance = None
