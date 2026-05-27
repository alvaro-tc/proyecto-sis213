"""Vistas HTML (panel admin) + endpoints JSON del orquestador."""
from __future__ import annotations

import io
import json
from datetime import timedelta
from decimal import Decimal, InvalidOperation
from typing import Optional

from django.conf import settings
from django.http import (HttpResponse, HttpResponseBadRequest,
                         HttpResponseNotFound, JsonResponse)
from django.shortcuts import get_object_or_404, redirect, render
from django.urls import reverse
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET, require_POST

from . import services
from .models import Payment, PaymentStatus
from .providers import providers_health


# ---------------- serializacion ----------------
def _payment_to_dict(p: Payment) -> dict:
    return {
        "id": str(p.id),
        "status": p.status,
        "status_label": p.get_status_display(),
        "provider": p.provider,
        "provider_label": settings.PROVIDERS.get(p.provider, {}).get("label", p.provider),
        "validation_method": p.validation_method,
        "provider_payment_id": p.provider_payment_id,
        "requested_amount": float(p.requested_amount),
        "amount_to_pay": float(p.amount_to_pay) if p.amount_to_pay is not None else None,
        "code": p.code,
        "description": p.description,
        "qr_payload": p.qr_payload or None,
        "created_at": p.created_at.isoformat(timespec="seconds") if p.created_at else None,
        "expires_at": p.expires_at.isoformat(timespec="seconds") if p.expires_at else None,
        "paid_at": p.paid_at.isoformat(timespec="seconds") if p.paid_at else None,
        "estimated_seconds": p.estimated_seconds,
        "failover_count": p.failover_count,
        "callback_url": p.callback_url or None,
        "error": p.error,
        "notification": p.notification,
        "attempts": p.attempts,
        "batch_id": str(p.batch_id) if p.batch_id else None,
    }


def _parse_amount(raw) -> Decimal:
    try:
        v = Decimal(str(raw)).quantize(Decimal("0.01"))
        if v <= 0:
            raise InvalidOperation
        return v
    except InvalidOperation as exc:
        raise ValueError("monto invalido") from exc


def _exclude_old_expired(qs):
    """Por defecto ocultamos los expired/cancelled/failed con mas de 15 min."""
    cutoff = timezone.now() - timedelta(minutes=15)
    return qs.exclude(
        status__in=[PaymentStatus.EXPIRED, PaymentStatus.CANCELLED, PaymentStatus.FAILED],
        created_at__lt=cutoff,
    )


def _filter_payments(qs, params):
    status = params.get("status")
    if status:
        qs = qs.filter(status=status)
    provider = params.get("provider")
    if provider:
        qs = qs.filter(provider=provider)
    q = params.get("q")
    if q:
        qs = qs.filter(code__icontains=q) | qs.filter(provider_payment_id__icontains=q)
    if params.get("show_expired") not in ("1", "true", "on"):
        qs = _exclude_old_expired(qs)
    return qs


# ---------------- HTML ----------------
def dashboard(request):
    now = timezone.now()
    today = now.replace(hour=0, minute=0, second=0, microsecond=0)
    qs = Payment.objects.all()
    ctx = {
        "kpis": _build_kpis(qs, today),
        "recent": _exclude_old_expired(qs)[:10],
        "providers": providers_health(),
        "priority": settings.PROVIDER_PRIORITY,
        "statuses": PaymentStatus.choices,
    }
    return render(request, "qrgen/dashboard.html", ctx)


def _build_kpis(qs, today):
    return {
        "active": qs.filter(status__in=[PaymentStatus.CREATING,
                                        PaymentStatus.PENDING]).count(),
        "paid_today": qs.filter(status=PaymentStatus.PAID,
                                paid_at__gte=today).count(),
        "expired_today": qs.filter(status=PaymentStatus.EXPIRED,
                                   created_at__gte=today).count(),
        "failed_today": qs.filter(status=PaymentStatus.FAILED,
                                  created_at__gte=today).count(),
        "total_today": qs.filter(created_at__gte=today).count(),
    }


def generate_view(request):
    if request.method == "POST":
        try:
            amount = _parse_amount(request.POST.get("amount"))
        except ValueError:
            return render(request, "qrgen/generate.html",
                          {"error": "Monto invalido"})
        description = (request.POST.get("description") or "")[:80]
        expires_in = int(request.POST.get("expires_in") or settings.DEFAULT_EXPIRES_IN)
        payment = services.generate(float(amount), description, expires_in)
        return redirect("qrgen:detail", pk=payment.id)
    return render(request, "qrgen/generate.html",
                  {"default_ttl": settings.DEFAULT_EXPIRES_IN})


def generate_batch_view(request):
    if request.method == "POST":
        try:
            amount = _parse_amount(request.POST.get("amount"))
            count = int(request.POST.get("count") or "1")
            count = max(1, min(20, count))
        except (ValueError, TypeError):
            return render(request, "qrgen/generate_batch.html",
                          {"error": "Datos invalidos"})
        description = (request.POST.get("description") or "")[:80]
        expires_in = int(request.POST.get("expires_in") or settings.DEFAULT_EXPIRES_IN)
        payments = services.generate_batch(float(amount), count,
                                           description, expires_in)
        batch_id = payments[0].batch_id if payments else None
        return redirect(reverse("qrgen:history") + f"?batch={batch_id}")
    return render(request, "qrgen/generate_batch.html",
                  {"default_ttl": settings.DEFAULT_EXPIRES_IN})


def history_view(request):
    qs = Payment.objects.all()
    batch = request.GET.get("batch")
    if batch:
        try:
            qs = qs.filter(batch_id=batch)
        except Exception:  # noqa: BLE001
            pass
    qs = _filter_payments(qs, request.GET)
    ctx = {
        "payments": qs[:200],
        "statuses": PaymentStatus.choices,
        "providers": settings.PROVIDERS,
        "params": request.GET,
    }
    return render(request, "qrgen/history.html", ctx)


def detail_view(request, pk):
    payment = get_object_or_404(Payment, pk=pk)
    return render(request, "qrgen/detail.html", {"payment": payment})


def qr_image(request, pk):
    import qrcode  # lazy: solo necesario para esta vista
    payment = get_object_or_404(Payment, pk=pk)
    if not payment.qr_payload:
        return HttpResponseNotFound("Sin payload aun")
    img = qrcode.make(payment.qr_payload, box_size=8, border=2)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return HttpResponse(buf.getvalue(), content_type="image/png")


# ---------------- partials HTMX ----------------
def partial_payment(request, pk):
    payment = get_object_or_404(Payment, pk=pk)
    return render(request, "qrgen/partials/payment_card.html",
                  {"payment": payment})


def partial_history_rows(request):
    qs = Payment.objects.all()
    batch = request.GET.get("batch")
    if batch:
        try:
            qs = qs.filter(batch_id=batch)
        except Exception:  # noqa: BLE001
            pass
    qs = _filter_payments(qs, request.GET)
    return render(request, "qrgen/partials/history_rows.html",
                  {"payments": qs[:200]})


def partial_dashboard_cards(request):
    now = timezone.now()
    today = now.replace(hour=0, minute=0, second=0, microsecond=0)
    return render(request, "qrgen/partials/dashboard_cards.html", {
        "kpis": _build_kpis(Payment.objects.all(), today),
    })


# ---------------- API JSON ----------------
@csrf_exempt
@require_POST
def api_generate(request):
    try:
        body = json.loads(request.body or "{}")
        amount = _parse_amount(body.get("amount"))
    except (ValueError, json.JSONDecodeError):
        return HttpResponseBadRequest("amount invalido")
    description = (body.get("description") or "")[:80]
    expires_in = int(body.get("expires_in") or settings.DEFAULT_EXPIRES_IN)
    callback_url = (body.get("callback_url") or "")[:500]
    payment = services.generate(float(amount), description, expires_in,
                                callback_url=callback_url)
    return JsonResponse(_payment_to_dict(payment), status=201)


@csrf_exempt
@require_POST
def api_generate_batch(request):
    try:
        body = json.loads(request.body or "{}")
        amount = _parse_amount(body.get("amount"))
        count = int(body.get("count") or "1")
        count = max(1, min(20, count))
    except (ValueError, json.JSONDecodeError, TypeError):
        return HttpResponseBadRequest("datos invalidos")
    description = (body.get("description") or "")[:80]
    expires_in = int(body.get("expires_in") or settings.DEFAULT_EXPIRES_IN)
    callback_url = (body.get("callback_url") or "")[:500]
    payments = services.generate_batch(float(amount), count,
                                       description, expires_in,
                                       callback_url=callback_url)
    return JsonResponse({
        "batch_id": str(payments[0].batch_id) if payments else None,
        "payments": [_payment_to_dict(p) for p in payments],
    }, status=201)


@require_GET
def api_list(request):
    qs = _filter_payments(Payment.objects.all(), request.GET)[:500]
    return JsonResponse({"payments": [_payment_to_dict(p) for p in qs]})


@require_GET
def api_detail(request, pk):
    payment = get_object_or_404(Payment, pk=pk)
    return JsonResponse(_payment_to_dict(payment))


@csrf_exempt
@require_POST
def api_cancel(request, pk):
    payment = get_object_or_404(Payment, pk=pk)
    services.cancel(payment)
    payment.refresh_from_db()
    return JsonResponse(_payment_to_dict(payment))


@require_GET
def api_health(request):
    return JsonResponse({
        "ok": True,
        "providers": providers_health(),
        "priority": settings.PROVIDER_PRIORITY,
    })
