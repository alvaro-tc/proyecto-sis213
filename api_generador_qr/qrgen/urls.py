from django.urls import path
from . import views

app_name = "qrgen"

urlpatterns = [
    # HTML
    path("", views.dashboard, name="dashboard"),
    path("generar/", views.generate_view, name="generate"),
    path("generar-varios/", views.generate_batch_view, name="generate_batch"),
    path("historial/", views.history_view, name="history"),
    path("qr/<uuid:pk>/", views.detail_view, name="detail"),
    path("qr/<uuid:pk>/img.png", views.qr_image, name="qr_image"),

    # Partials (HTMX)
    path("partials/payment/<uuid:pk>/", views.partial_payment, name="partial_payment"),
    path("partials/history-rows/", views.partial_history_rows, name="partial_history_rows"),
    path("partials/dashboard-cards/", views.partial_dashboard_cards, name="partial_dashboard_cards"),

    # API JSON
    path("api/qr/generate", views.api_generate, name="api_generate"),
    path("api/qr/generate-batch", views.api_generate_batch, name="api_generate_batch"),
    path("api/qr/list", views.api_list, name="api_list"),
    path("api/qr/<uuid:pk>", views.api_detail, name="api_detail"),
    path("api/qr/<uuid:pk>/cancel", views.api_cancel, name="api_cancel"),
    path("api/health", views.api_health, name="api_health"),
]
