"""Registry de providers — in-process (sin HTTP)."""
from __future__ import annotations

from django.conf import settings

from .base import BankProvider
from .msc import MSCProvider
from .zas import ZASProvider


_CLASSES: dict[str, type[BankProvider]] = {
    "msc": MSCProvider,
    "zas": ZASProvider,
}

_cache: dict[str, BankProvider] = {}


def get_provider(name: str) -> BankProvider:
    name = name.lower()
    if name not in _cache:
        cls = _CLASSES.get(name)
        if not cls:
            raise KeyError(f"Provider desconocido: {name}")
        cfg = settings.PROVIDERS.get(name, {})
        _cache[name] = cls(cfg)
    return _cache[name]


def list_priority() -> list[BankProvider]:
    out = []
    seen: set[str] = set()
    for n in settings.PROVIDER_PRIORITY:
        if n in seen or n not in _CLASSES:
            continue
        seen.add(n)
        try:
            out.append(get_provider(n))
        except KeyError:
            continue
    return out


def providers_health() -> list[dict]:
    items = []
    for p in list_priority():
        h = p.health()
        items.append({
            "name": p.name,
            "label": p.label,
            "validation_method": p.validation_method,
            "ok": h.get("ok", False),
            "detail": h.get("detail"),
            "error": h.get("error"),
        })
    return items
