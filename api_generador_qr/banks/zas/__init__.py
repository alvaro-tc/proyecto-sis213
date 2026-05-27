"""Banco Ganadero (ZAS) — módulo de automatización.

API pública:
    ZAS_PACKAGE           : str   — paquete Android de la app ZAS
    generate_qr(adb, amount, description) -> str   — payload del QR
    reserve_slot(requested_amount) -> tuple[float, int]
        Reserva un slot decimal. Devuelve (amount_to_pay, slot_index).
    release_slot(requested_amount, slot_index) -> None
"""
from .automation import generate_qr, reserve_slot, release_slot  # noqa: F401

ZAS_PACKAGE = "bec.vdb.direct"
