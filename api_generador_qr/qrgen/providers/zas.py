"""Provider ZAS (Banco Ganadero) — in-process.

Llama directamente a banks.zas.automation.generate_qr() usando el
AdbController compartido del BankManager.

Sistema de slots:
    ZAS solo envía el monto en la notificación (sin concepto).
    Para distinguir cobros concurrentes del mismo monto base se usa:
        amount_to_pay = requested_amount + slot * 0.01
    con slots 0..9. El slot se reserva antes de adquirir el ADB lock.
"""
from __future__ import annotations

import logging

from .base import BankProvider, ProviderError, ProviderResult

log = logging.getLogger("providers.zas")

ZAS_ESTIMATE_S = 45.0   # estimado fijo en segundos (QR aparece rápido en pantalla)


class ZASProvider(BankProvider):
    name = "zas"
    label = "Banco Ganadero (ZAS)"
    validation_method = "amount_decimals"
    default_estimate_seconds = ZAS_ESTIMATE_S

    def __init__(self, config: dict):
        super().__init__(config)

    def estimate(self) -> float:
        return ZAS_ESTIMATE_S

    def health(self) -> dict:
        try:
            from banks.manager import get_manager
            mgr = get_manager()
            online = mgr.adb.device_online()
            return {
                "ok": online,
                "provider": self.name,
                "label": self.label,
                "device_online": online,
            }
        except Exception as exc:
            return {"ok": False, "provider": self.name, "label": self.label,
                    "error": str(exc)}

    def create(self, amount: float, description: str,
               expires_in: int, payment_id: str, code: str) -> ProviderResult:
        """Genera el QR ZAS con slot de decimales.

        1. Reserva un slot decimal para el monto (amount_to_pay = amount + slot*0.01)
        2. Adquiere el ADB lock del BankManager
        3. Llama a banks.zas.automation.generate_qr()
        4. Devuelve ProviderResult con status=pending
        """
        from banks.manager import get_manager
        from banks.zas.automation import generate_qr, reserve_slot

        # 1. Reservar slot
        try:
            amount_to_pay, slot_index = reserve_slot(amount)
        except RuntimeError as exc:
            raise ProviderError(f"ZAS: {exc}") from exc

        log.info("ZAS: payment=%s monto_base=%.2f slot=%d amount_to_pay=%.2f",
                 payment_id, amount, slot_index, amount_to_pay)

        # 2. Obtener BankManager
        try:
            mgr = get_manager()
        except RuntimeError as exc:
            raise ProviderError(f"ZAS: BankManager no iniciado: {exc}") from exc

        # 3. Generar QR con lock ADB
        log.info("ZAS: adquiriendo lock ADB para payment=%s", payment_id)
        with mgr.adb_lock:
            try:
                payload = generate_qr(
                    adb=mgr.adb,
                    amount_to_pay=amount_to_pay,
                    description=description[:40],
                )
            except Exception as exc:
                raise ProviderError(f"ZAS: error en automatización ADB: {exc}") from exc

        log.info("ZAS: QR generado para payment=%s", payment_id)

        return ProviderResult(
            provider=self.name,
            validation_method=self.validation_method,
            payment_id=payment_id,
            status="pending",
            requested_amount=amount,
            amount=amount_to_pay,   # el cliente paga el monto ajustado por slot
            code=code,
            description=description,
            qr_payload=payload,
            estimated_seconds=ZAS_ESTIMATE_S,
        )

    def cancel(self, payment_id: str) -> None:
        # ZAS: no hay forma de cancelar en mitad del flujo ADB; no-op.
        log.info("ZAS: cancel solicitado para %s (no-op)", payment_id)
