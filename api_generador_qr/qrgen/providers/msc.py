"""Provider MSC (Mercantil Santa Cruz) — in-process.

Llama directamente a banks.msc.automation.generate_qr() usando el
AdbController compartido del BankManager. El lock de ADB se adquiere aquí
para serializar el acceso al teléfono.
"""
from __future__ import annotations

import logging
import os

from .base import BankProvider, ProviderError, ProviderResult

log = logging.getLogger("providers.msc")


class MSCProvider(BankProvider):
    name = "msc"
    label = "Mercantil Santa Cruz"
    validation_method = "token_concept"
    default_estimate_seconds = 90.0

    def __init__(self, config: dict):
        super().__init__(config)

    def estimate(self) -> float:
        try:
            from banks.msc.automation import estimate_seconds, load_config
            return float(estimate_seconds(load_config()))
        except Exception:
            return float(self.default_estimate_seconds)

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
        """Genera el QR MSC (bloquea hasta obtener el payload).

        Adquiere el ADB lock del BankManager para serializar el acceso al
        teléfono. El `code` único se usa como concepto del QR.
        """
        from banks.manager import get_manager
        from banks.msc.automation import generate_qr, estimate_seconds, load_config

        try:
            cfg = load_config()
        except Exception as exc:
            raise ProviderError(f"MSC: no se pudo cargar config: {exc}") from exc

        password = os.environ.get("MSC_PASSWORD", "")
        if not password:
            raise ProviderError("MSC_PASSWORD no configurado en .env")

        estimated = float(estimate_seconds(cfg))

        try:
            mgr = get_manager()
        except RuntimeError as exc:
            raise ProviderError(f"MSC: BankManager no iniciado: {exc}") from exc

        log.info("MSC: adquiriendo lock ADB para payment=%s monto=%.2f code=%s",
                 payment_id, amount, code)

        with mgr.adb_lock:
            try:
                payload = generate_qr(
                    adb=mgr.adb,
                    amount_bs=amount,
                    code=code,
                    cfg=cfg,
                    password=password,
                )
            except Exception as exc:
                raise ProviderError(f"MSC: error en automatización ADB: {exc}") from exc

        log.info("MSC: QR generado para payment=%s", payment_id)

        return ProviderResult(
            provider=self.name,
            validation_method=self.validation_method,
            payment_id=payment_id,
            status="pending",
            requested_amount=amount,
            amount=amount,          # MSC: el cliente paga el monto exacto
            code=code,
            description=description,
            qr_payload=payload,
            estimated_seconds=estimated,
        )

    def cancel(self, payment_id: str) -> None:
        # MSC no permite cancelar el flujo ADB a mitad de ejecución.
        log.info("MSC: cancel solicitado para %s (no-op)", payment_id)
