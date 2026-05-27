"""Loop que expira Payments vencidos y muestra el estado del sistema.

Uso: `python manage.py sync_payments [--interval 30]`

En la arquitectura in-process el NotificationListener (BankManager) detecta
pagos directamente. Este comando sólo sirve para expirar Payments que pasaron
su expires_at sin ser pagados, y para reportar el estado periódicamente.
"""
import time

from django.core.management.base import BaseCommand

from qrgen import services
from qrgen.models import Payment, PaymentStatus


class Command(BaseCommand):
    help = "Expira Payments vencidos y reporta estado cada N segundos."

    def add_arguments(self, parser):
        parser.add_argument("--interval", type=float, default=30.0,
                            help="Segundos entre pasadas (default: 30)")
        parser.add_argument("--once", action="store_true",
                            help="Hace una pasada y termina")

    def handle(self, *args, **opts):
        interval = float(opts["interval"])
        once = opts["once"]
        self.stdout.write(self.style.SUCCESS(
            f"sync_payments iniciado (interval={interval}s)"))
        while True:
            try:
                expired = services.expire_stale()
                active  = Payment.objects.filter(
                    status__in=[PaymentStatus.CREATING, PaymentStatus.PENDING]
                ).count()
                if expired or active:
                    self.stdout.write(
                        f"  expirados={expired} activos={active}"
                    )
            except Exception as exc:  # noqa: BLE001
                self.stderr.write(f"Error en expire_stale: {exc}")
            if once:
                return
            time.sleep(interval)
