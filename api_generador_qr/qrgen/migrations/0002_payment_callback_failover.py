# Generated manually 2026-05-27

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("qrgen", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="payment",
            name="failover_count",
            field=models.IntegerField(
                default=0,
                help_text="Numero de providers que fallaron antes del actual",
            ),
        ),
        migrations.AddField(
            model_name="payment",
            name="callback_url",
            field=models.URLField(
                blank=True,
                default="",
                max_length=500,
                help_text="Webhook para notificar cambios de estado/ETA y confirmacion de pago",
            ),
        ),
    ]
