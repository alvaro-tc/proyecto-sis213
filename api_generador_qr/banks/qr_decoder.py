"""Decodifica QRs a partir de bytes PNG usando pyzbar + OpenCV como fallback."""
from __future__ import annotations

import io
from typing import Optional

import cv2
import numpy as np
from PIL import Image
from pyzbar.pyzbar import decode


def decode_qr_from_bytes(png_bytes: bytes) -> Optional[str]:
    """Decodifica el primer QR encontrado en `png_bytes` (PNG).

    Intenta tres estrategias en orden:
    1. pyzbar sobre la imagen en color
    2. pyzbar sobre imagen binarizada (Otsu)
    3. cv2.QRCodeDetector

    Devuelve el payload como str, o None si no se encontró ningún QR.
    """
    img = Image.open(io.BytesIO(png_bytes)).convert("RGB")
    arr = np.array(img)

    for image in (arr, _enhance(arr)):
        results = decode(image)
        if results:
            return results[0].data.decode("utf-8", errors="ignore")

    detector = cv2.QRCodeDetector()
    data, _, _ = detector.detectAndDecode(cv2.cvtColor(arr, cv2.COLOR_RGB2BGR))
    return data or None


def decode_qr_from_file(png_path) -> Optional[str]:
    """Decodifica un QR desde un archivo PNG en disco."""
    from pathlib import Path
    return decode_qr_from_bytes(Path(png_path).read_bytes())


def _enhance(arr: np.ndarray) -> np.ndarray:
    """Binarización con umbral de Otsu para mejorar detección en imágenes borrosas."""
    gray = cv2.cvtColor(arr, cv2.COLOR_RGB2GRAY)
    _, th = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    return th
