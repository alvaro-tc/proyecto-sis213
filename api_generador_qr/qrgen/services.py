"""Orquestador in-process: recibe peticiones, decide provider, hace failover.

Estrategia:
- `generate()` crea inmediatamente un Payment en estado CREATING y dispara
  un hilo background que intenta cada provider en orden de prioridad.
- Cada provider llama directamente a las funciones de banks/ (sin HTTP).
- El lock de ADB está en BankManager; los providers lo adquieren en create().
- El NotificationListener (en BankManager) detecta pagos y actualiza la DB
  directamente — no hay polling activo desde aquí.
- Cuando algún provider devuelve un QR utilizable, el Payment pasa a PENDING
  y el frontend lo detecta por polling HTMX.
- Si todos los providers fallan, el Payment queda FAILED.
"""
from __future__ import annotations

import json
import logging
import secrets
import threading
import time
import urllib.request
import uuid
from datetime import timedelta
from decimal import Decimal
from typing import Optional

from django.conf import settings
from django.utils import timezone

from .models import Payment, PaymentStatus
from .providers.base import (CODE_ALPHABET, CODE_LEN,
                              ProviderError, ProviderResult, generate_code)
from .providers.registry import get_provider, list_priority

log = logging.getLogger("qrgen.services")


# Penalizacion (segundos) sumada a la ETA del proximo provider cada vez
# que el anterior falla — refleja el tiempo perdido en el intento previo
# mas el overhead de reintento.
FAILOVER_PENALTY_S = 15.0


def post_webhook(payment: Payment, event: str, extra: Optional[dict] = None) -> None:
    """Envia un POST al callback_url del payment con el estado actual.

    Eventos posibles:
        - "created"           : QR aceptado, en cola
        - "failover"          : un banco fallo, se reintenta con otro
        - "qr_ready"          : QR listo para mostrarse
        - "paid"              : pago confirmado por el banco
        - "expired" / "failed": estados terminales sin pago

    No bloquea ni lanza excepciones. Se ejecuta en un hilo daemon.
    """
    if not payment.callback_url:
        return
    body = {
        "event": event,
        "payment_id": str(payment.id),
        "status": payment.status,
        "provider": payment.provider,
        "estimated_seconds": payment.estimated_seconds,
        "failover_count": payment.failover_count,
        "amount_to_pay": float(payment.amount_to_pay) if payment.amount_to_pay else None,
        "code": payment.code,
        "validation_method": payment.validation_method,
        "error": payment.error or None,
    }
    if extra:
        body.update(extra)
    payload = json.dumps(body).encode("utf-8")
    url = payment.callback_url

    def _send():
        try:
            req = urllib.request.Request(
                url, data=payload,
                headers={"Content-Type": "application/json"},
                method="POST",
            )
            with urllib.request.urlopen(req, timeout=5) as resp:
                resp.read()
            log.info("webhook %s enviado a %s (event=%s)", payment.id, url, event)
        except Exception as exc:  # noqa: BLE001
            log.warning("webhook %s fallo a %s: %s", payment.id, url, exc)

    threading.Thread(target=_send, daemon=True,
                     name=f"webhook-{str(payment.id)[:8]}").start()


# ── Helpers ───────────────────────────────────────────────────────────────────

def _active_codes() -> set[str]:
    """Devuelve los códigos de Payments aún activos (CREATING o PENDING)."""
    return set(
        Payment.objects.filter(
            status__in=[PaymentStatus.CREATING, PaymentStatus.PENDING]
        ).exclude(code="").values_list("code", flat=True)
    )


def _apply_result(payment: Payment, result: ProviderResult) -> None:
    """Copia los campos de un ProviderResult al modelo Payment."""
    payment.provider = result.provider
    payment.validation_method = result.validation_method
    payment.provider_payment_id = result.payment_id
    if result.code:
        payment.code = result.code
    if result.qr_payload:
        payment.qr_payload = result.qr_payload
    if result.amount:
        payment.amount_to_pay = Decimal(str(round(result.amount, 2)))
    if result.estimated_seconds:
        payment.estimated_seconds = result.estimated_seconds
    if result.error:
        payment.error = result.error
    if result.notification:
        payment.notification = result.notification

    status_map = {
        "creating":  PaymentStatus.CREATING,
        "pending":   PaymentStatus.PENDING,
        "paid":      PaymentStatus.PAID,
        "expired":   PaymentStatus.EXPIRED,
        "cancelled": PaymentStatus.CANCELLED,
        "canceled":  PaymentStatus.CANCELLED,
        "failed":    PaymentStatus.FAILED,
    }
    if result.status in status_map:
        payment.status = status_map[result.status]


# ── API pública ────────────────────────────────────────────────────────────────

def generate(amount: float, description: str = "",
             expires_in: Optional[int] = None,
             batch_id: Optional[uuid.UUID] = None,
             callback_url: str = "") -> Payment:
    """Crea un Payment y lanza el flujo de generación en background.

    Calcula la ETA inicial consultando al provider de mayor prioridad
    para que el cliente sepa de entrada cuanto debe esperar.
    """
    if expires_in is None:
        expires_in = settings.DEFAULT_EXPIRES_IN

    # El código único se genera aquí para que esté disponible inmediatamente
    # (MSC lo necesita como concepto del QR).
    code = generate_code(exclude=_active_codes())

    # ETA inicial: el primer provider de la lista de prioridad.
    providers = list_priority()
    initial_eta = providers[0].estimate() if providers else 0.0
    initial_provider = providers[0].name if providers else ""

    payment = Payment.objects.create(
        requested_amount=Decimal(str(round(float(amount), 2))),
        description=description[:80],
        status=PaymentStatus.CREATING,
        code=code,
        batch_id=batch_id,
        callback_url=callback_url or "",
        estimated_seconds=initial_eta,
        provider=initial_provider,
    )
    post_webhook(payment, "created")
    t = threading.Thread(
        target=_run_create,
        args=(payment.id, expires_in),
        daemon=True,
        name=f"qr-create-{str(payment.id)[:8]}",
    )
    t.start()
    return payment


def generate_batch(amount: float, count: int, description: str = "",
                   expires_in: Optional[int] = None,
                   callback_url: str = "") -> list[Payment]:
    """Crea N payments con el mismo monto y un batch_id común."""
    batch_id = uuid.uuid4()
    payments = []
    for _ in range(max(1, int(count))):
        payments.append(generate(amount, description, expires_in, batch_id,
                                  callback_url))
        time.sleep(0.1)   # pequeño stagger para no estresar el ADB lock
    return payments


def cancel(payment: Payment) -> Payment:
    """Cancela un Payment. El provider hace best-effort cancel (no-op si ADB en uso)."""
    if payment.status in (PaymentStatus.PAID, PaymentStatus.EXPIRED,
                          PaymentStatus.CANCELLED):
        return payment
    if payment.provider and payment.provider_payment_id:
        try:
            provider = get_provider(payment.provider)
            provider.cancel(payment.provider_payment_id)
        except Exception:  # noqa: BLE001
            pass
    payment.status = PaymentStatus.CANCELLED
    payment.save(update_fields=["status"])
    return payment


def expire_stale() -> int:
    """Marca como EXPIRED los Payments PENDING cuyo expires_at ya pasó.

    Llamar periódicamente (ej. desde un cron o el listener).
    Devuelve cuántos se expiraron.
    """
    now = timezone.now()
    updated = Payment.objects.filter(
        status=PaymentStatus.PENDING,
        expires_at__lt=now,
    ).update(status=PaymentStatus.EXPIRED)
    if updated:
        log.info("expire_stale: %d payments expirados", updated)
    return updated


# ── Background worker ──────────────────────────────────────────────────────────

def _run_create(payment_id, expires_in: int) -> None:
    """Hilo background: prueba providers en orden de prioridad."""
    providers = list_priority()
    if not providers:
        Payment.objects.filter(id=payment_id).update(
            status=PaymentStatus.FAILED,
            error="Sin providers configurados",
        )
        return

    try:
        payment = Payment.objects.get(id=payment_id)
    except Payment.DoesNotExist:
        return

    amount = float(payment.requested_amount)
    description = payment.description
    code = payment.code  # ya generado en generate()

    # Calcular expires_at
    expires_at = timezone.now() + timedelta(seconds=expires_in)
    payment.expires_at = expires_at
    payment.save(update_fields=["expires_at"])

    for idx, provider in enumerate(providers):
        if payment.status == PaymentStatus.CANCELLED:
            log.info("_run_create: payment %s cancelado antes de crear QR", payment_id)
            return

        # En cada iteracion actualizar la ETA con el provider que se intenta
        # (incluye penalizacion acumulada por failovers previos).
        eta = provider.estimate() + idx * FAILOVER_PENALTY_S
        payment.provider = provider.name
        payment.estimated_seconds = eta
        payment.save(update_fields=["provider", "estimated_seconds"])

        log.info("_run_create: intentando provider=%s eta=%.1fs payment=%s",
                 provider.name, eta, payment_id)
        try:
            result = provider.create(
                amount=amount,
                description=description,
                expires_in=expires_in,
                payment_id=str(payment_id),
                code=code,
            )
        except ProviderError as exc:
            log.warning("Provider %s falló: %s", provider.name, exc)
            payment.record_attempt(provider.name, False, str(exc))
            payment.failover_count = idx + 1
            payment.error = f"{provider.name}: {exc}"
            payment.save(update_fields=["attempts", "failover_count", "error"])
            # Notificar al cliente que la solicitud va a tardar mas.
            next_provider = providers[idx + 1] if idx + 1 < len(providers) else None
            if next_provider:
                next_eta = next_provider.estimate() + (idx + 1) * FAILOVER_PENALTY_S
                post_webhook(payment, "failover", {
                    "failed_provider": provider.name,
                    "failed_reason": str(exc),
                    "next_provider": next_provider.name,
                    "new_estimated_seconds": next_eta,
                    "message": (f"El banco {provider.name} fallo; "
                                f"reintentando con {next_provider.name}. "
                                f"La solicitud demorara ~{next_eta:.0f}s mas."),
                })
            continue
        except Exception as exc:  # noqa: BLE001
            log.exception("Provider %s: error inesperado: %s", provider.name, exc)
            payment.record_attempt(provider.name, False, f"inesperado: {exc}")
            payment.failover_count = idx + 1
            payment.save(update_fields=["attempts", "failover_count"])
            continue

        # Éxito: el result ya tiene status=pending y qr_payload
        _apply_result(payment, result)
        payment.record_attempt(provider.name, True, "qr listo", str(payment_id))
        payment.save()
        log.info("_run_create: QR listo para payment=%s provider=%s",
                 payment_id, provider.name)
        post_webhook(payment, "qr_ready")
        return

    # Todos fallaron
    payment.refresh_from_db()
    payment.status = PaymentStatus.FAILED
    if not payment.error:
        payment.error = "Todos los providers fallaron"
    payment.save(update_fields=["status", "error", "attempts"])
    log.error("_run_create: todos los providers fallaron para payment=%s", payment_id)
    post_webhook(payment, "failed")
