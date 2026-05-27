import logging

from django.apps import AppConfig

log = logging.getLogger("qrgen")


class QrgenConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "qrgen"
    verbose_name = "Generador de QR"

    def ready(self):
        """Inicia el BankManager (ADB + NotificationListener) al arrancar Django.

        Solo se activa cuando Django está en modo server real (no en manage.py
        migrate, shell, collectstatic, etc.) para evitar arrancar hilos ADB
        en comandos de mantenimiento.
        """
        import os
        import sys

        # Evitar doble arranque en el reloader de desarrollo
        # y en comandos administrativos (migrate, shell, etc.)
        is_management_cmd = (
            len(sys.argv) > 1 and sys.argv[1] in (
                "migrate", "makemigrations", "shell", "shell_plus",
                "collectstatic", "check", "showmigrations",
                "sqlmigrate", "dbshell", "inspectdb",
                "createsuperuser", "changepassword",
                "sync_payments",  # ya no existe pero por si acaso
            )
        )
        if is_management_cmd:
            return

        # En el reloader de desarrollo, el proceso hijo tiene RUN_MAIN=true
        is_reloader_parent = (
            os.environ.get("RUN_MAIN") != "true"
            and os.environ.get("DJANGO_SETTINGS_MODULE")
            and "runserver" in sys.argv
        )
        if is_reloader_parent:
            return

        try:
            from banks import manager as bank_manager
            bank_manager.start()
            log.info("QrgenConfig.ready(): BankManager iniciado")
        except Exception as exc:
            log.exception("QrgenConfig.ready(): no se pudo iniciar BankManager: %s", exc)
