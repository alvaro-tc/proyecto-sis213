"""Banco Mercantil Santa Cruz — módulo de automatización.

API pública:
    MSC_PACKAGE   : str   — paquete Android de la app MSC
    generate_qr(adb, amount, code, cfg) -> str   — payload del QR
    estimate_seconds(cfg) -> int                  — estimado de tiempo
"""
from .automation import generate_qr, estimate_seconds  # noqa: F401

MSC_PACKAGE = "bo.com.bmsc.bancamovil"
