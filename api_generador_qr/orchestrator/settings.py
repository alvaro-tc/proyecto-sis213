"""Configuración Django del orquestador api_generador_qr (in-process)."""
import os
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

# Cargar .env si existe
_env_file = BASE_DIR / ".env"
if _env_file.exists():
    for _raw in _env_file.read_text(encoding="utf-8").splitlines():
        _s = _raw.strip()
        if not _s or _s.startswith("#") or "=" not in _s:
            continue
        _k, _v = _s.split("=", 1)
        os.environ.setdefault(_k.strip(), _v.strip().strip('"').strip("'"))

SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY", "dev-insecure-key-cambiame")
DEBUG = os.environ.get("DJANGO_DEBUG", "true").lower() in ("1", "true", "yes")
ALLOWED_HOSTS = [h.strip() for h in
                 os.environ.get("DJANGO_ALLOWED_HOSTS", "*").split(",") if h.strip()]

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "qrgen",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "orchestrator.urls"

TEMPLATES = [{
    "BACKEND": "django.template.backends.django.DjangoTemplates",
    "DIRS": [BASE_DIR / "qrgen" / "templates"],
    "APP_DIRS": True,
    "OPTIONS": {
        "context_processors": [
            "django.template.context_processors.request",
            "django.contrib.auth.context_processors.auth",
            "django.contrib.messages.context_processors.messages",
        ],
    },
}]

WSGI_APPLICATION = "orchestrator.wsgi.application"

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "data" / "orchestrator.sqlite3",
    }
}

(BASE_DIR / "data").mkdir(exist_ok=True)

LANGUAGE_CODE = "es"
TIME_ZONE = "America/La_Paz"
USE_I18N = True
USE_TZ = True

STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_DIRS = []
_static_dir = BASE_DIR / "qrgen" / "static"
if _static_dir.exists():
    STATICFILES_DIRS = [_static_dir]

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# ── Logging ───────────────────────────────────────────────────────────────────
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "verbose": {
            "format": "{asctime} [{levelname}] {name}: {message}",
            "style": "{",
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "verbose",
        },
    },
    "root": {"handlers": ["console"], "level": "INFO"},
    "loggers": {
        "banks": {"handlers": ["console"], "level": "INFO", "propagate": False},
        "providers": {"handlers": ["console"], "level": "INFO", "propagate": False},
        "qrgen": {"handlers": ["console"], "level": "INFO", "propagate": False},
    },
}

# ── Orquestador ───────────────────────────────────────────────────────────────
PROVIDER_PRIORITY = [
    p.strip().lower()
    for p in os.environ.get("PROVIDER_PRIORITY", "msc,zas").split(",")
    if p.strip()
]
DEFAULT_EXPIRES_IN = int(os.environ.get("DEFAULT_EXPIRES_IN", "900"))

# Metadatos de cada provider (sin URL — son in-process ahora)
PROVIDERS = {
    "msc": {
        "label": "Mercantil Santa Cruz",
        "validation_method": "token_concept",
    },
    "zas": {
        "label": "Banco Ganadero (ZAS)",
        "validation_method": "amount_decimals",
    },
}

# ── ADB / Hardware ───────────────────────────────────────────────────────────
# Ruta al ejecutable adb. Si está en PATH, basta con "adb".
ADB_PATH = os.environ.get(
    "ADB_PATH",
    r"C:\Users\alvar\AppData\Local\Microsoft\WinGet\Packages"
    r"\Google.PlatformTools_Microsoft.Winget.Source_8wekyb3d8bbwe\platform-tools\adb.exe",
)
# Serial del dispositivo ADB (vacío = primer dispositivo encontrado)
ADB_DEVICE_SERIAL = os.environ.get("ADB_DEVICE_SERIAL", "34345fb7")

# ── Credenciales de bancos ────────────────────────────────────────────────────
# MSC_PASSWORD se lee directamente en banks/msc/automation.py desde el entorno.
# Se define aquí solo como referencia para el .env.example.
# MSC_PASSWORD = os.environ.get("MSC_PASSWORD", "")  # <- leer del entorno en automation.py
