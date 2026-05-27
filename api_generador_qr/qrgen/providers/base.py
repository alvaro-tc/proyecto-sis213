"""Interfaz común de un provider de QR (in-process).

Cada provider (msc, zas, ...) implementa estos métodos llamando directamente
a las funciones de banks/. No hay HTTP — todo corre en el mismo proceso.
"""
from __future__ import annotations

import secrets
from dataclasses import dataclass, field
from typing import Optional


class ProviderError(Exception):
    """Error reportado por el provider (ej. monto inválido, ADB error)."""


class ProviderTimeout(ProviderError):
    """El provider no completó la operación en el tiempo esperado."""


# ── Alfabeto de códigos únicos (sin O/0/I/1 para evitar confusión visual) ──────
CODE_ALPHABET = "BCDEFGHJKLMNPQRSTUVWXYZ23456789"
CODE_LEN = 6


def generate_code(exclude: set[str] = None) -> str:
    """Genera un código aleatorio de 6 caracteres."""
    exclude = exclude or set()
    for _ in range(200):
        c = "".join(secrets.choice(CODE_ALPHABET) for _ in range(CODE_LEN))
        if c not in exclude:
            return c
    raise RuntimeError("No se pudo generar código único (demasiadas colisiones)")


@dataclass
class ProviderResult:
    """Resultado normalizado de un provider."""
    provider: str
    validation_method: str        # "token_concept" | "amount_decimals"
    payment_id: str               # id en el provider (mismo que Django UUID)
    status: str                   # pending | paid | expired | cancelled | failed
    requested_amount: float
    amount: float                 # lo que el cliente realmente paga
    code: str = ""
    description: str = ""
    qr_payload: Optional[str] = None
    created_at: Optional[str] = None
    expires_at: Optional[str] = None
    paid_at: Optional[str] = None
    notification: Optional[dict] = None
    estimated_seconds: float = 0.0
    error: str = ""
    raw: dict = field(default_factory=dict)


class BankProvider:
    """Contrato que debe implementar cada banco."""

    name: str = ""
    label: str = ""
    validation_method: str = ""
    # ETA por defecto si no se puede calcular dinámicamente (segundos).
    default_estimate_seconds: float = 60.0

    def __init__(self, config: dict):
        self.config = config

    def health(self) -> dict:
        raise NotImplementedError

    def estimate(self) -> float:
        """ETA en segundos para generar un QR con este provider.

        Devuelve el tiempo medio que tarda este banco en producir un QR
        listo para pagar. Se consulta ANTES de iniciar la generación para
        responderle al cliente cuánto debe esperar.
        """
        return float(self.default_estimate_seconds)

    def create(self, amount: float, description: str,
               expires_in: int, payment_id: str,
               code: str) -> ProviderResult:
        """Genera el QR y devuelve un ProviderResult con status=pending.

        Parameters
        ----------
        amount      : monto solicitado (bolivianos)
        description : descripción libre
        expires_in  : segundos de validez
        payment_id  : UUID del Payment Django (se usa como id interno)
        code        : código único de 6 chars (ya generado por el orquestador)
        """
        raise NotImplementedError

    def cancel(self, payment_id: str) -> None:
        """Cancela best-effort (no lanza excepciones)."""
        pass  # La mayoría de banks no pueden cancelar a mitad de flujo ADB
