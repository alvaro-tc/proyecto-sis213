from django.contrib import admin
from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ("id", "provider", "status", "requested_amount",
                    "amount_to_pay", "code", "created_at", "paid_at")
    list_filter = ("status", "provider", "validation_method")
    search_fields = ("id", "code", "provider_payment_id", "description")
    readonly_fields = ("id", "created_at", "attempts", "notification",
                       "qr_payload")
    date_hierarchy = "created_at"
