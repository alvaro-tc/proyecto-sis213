"""Modelo Payment del orquestador.

Un Payment representa una solicitud de QR del usuario final. Internamente
puede haber tenido varios intentos en distintos bancos (failover), pero la
relacion con el banco activo se guarda en `provider` + `provider_payment_id`.
"""
from __future__ import annotations

import uuid
from django.db import models
from django.utils import timezone


class PaymentStatus(models.TextChoices):
    CREATING = "creating", "Generando"
    PENDING = "pending", "Esperando pago"
    PAID = "paid", "Pagado"
    EXPIRED = "expired", "Expirado"
    CANCELLED = "cancelled", "Cancelado"
    FAILED = "failed", "Fallido"


ACTIVE_STATES = (PaymentStatus.CREATING, PaymentStatus.PENDING)
TERMINAL_STATES = (
    PaymentStatus.PAID, PaymentStatus.EXPIRED,
    PaymentStatus.CANCELLED, PaymentStatus.FAILED,
)


class Payment(models.Model):
    """Solicitud de QR. El orquestador decide en que banco se materializa."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    requested_amount = models.DecimalField(
        max_digits=12, decimal_places=2,
        help_text="Monto en Bs que el usuario quiere cobrar",
    )
    amount_to_pay = models.DecimalField(
        max_digits=12, decimal_places=2, null=True, blank=True,
        help_text="Monto exacto a pagar (ZAS suma centavos como ID; MSC = requested)",
    )
    description = models.CharField(max_length=80, blank=True, default="")
    status = models.CharField(max_length=20, choices=PaymentStatus.choices,
                              default=PaymentStatus.CREATING)
    provider = models.CharField(max_length=20, blank=True, default="",
                                help_text="Provider activo: msc | zas | ...")
    validation_method = models.CharField(
        max_length=30, blank=True, default="",
        help_text="token_concept (MSC) | amount_decimals (ZAS)",
    )
    provider_payment_id = models.CharField(max_length=64, blank=True, default="")
    code = models.CharField(max_length=16, blank=True, default="",
                            help_text="Codigo visible (concepto/motivo del QR)")
    qr_payload = models.TextField(blank=True, default="",
                                  help_text="Texto del QR para renderizar")

    created_at = models.DateTimeField(default=timezone.now)
    expires_at = models.DateTimeField(null=True, blank=True)
    paid_at = models.DateTimeField(null=True, blank=True)

    estimated_seconds = models.FloatField(default=0.0,
                                          help_text="ETA para que el QR este listo (si CREATING)")
    failover_count = models.IntegerField(default=0,
                                         help_text="Numero de providers que fallaron antes del actual")
    callback_url = models.URLField(blank=True, default="", max_length=500,
                                   help_text="Webhook para notificar cambios de estado/ETA y confirmacion de pago")
    error = models.TextField(blank=True, default="")
    notification = models.JSONField(null=True, blank=True)
    attempts = models.JSONField(default=list, blank=True,
                                help_text="Lista de intentos por provider con resultado")
    batch_id = models.UUIDField(null=True, blank=True, db_index=True,
                                help_text="Agrupa varios QR creados juntos")

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["status"]),
            models.Index(fields=["provider"]),
            models.Index(fields=["created_at"]),
        ]

    def __str__(self) -> str:
        return f"{self.id} [{self.provider}] {self.requested_amount} Bs - {self.status}"

    @property
    def is_active(self) -> bool:
        return self.status in (PaymentStatus.CREATING, PaymentStatus.PENDING)

    @property
    def is_expired_by_time(self) -> bool:
        return (self.expires_at is not None
                and self.status == PaymentStatus.PENDING
                and timezone.now() > self.expires_at)

    def record_attempt(self, provider: str, ok: bool, detail: str = "",
                       payment_id: str = "") -> None:
        attempts = list(self.attempts or [])
        attempts.append({
            "provider": provider,
            "ok": ok,
            "detail": detail,
            "provider_payment_id": payment_id,
            "at": timezone.now().isoformat(timespec="seconds"),
        })
        self.attempts = attempts
