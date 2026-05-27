# api_generador_qr — Orquestador de QR (Django)

Orquestador unificado para generar QR de cobro a traves de multiples bancos
bolivianos. Hoy soporta:

| Provider | Validacion | ETA tipica | Banco real |
|----------|-----------|------------|------------|
| **MSC** (Mercantil Santa Cruz) | `token_concept` (codigo en concepto) | ~90 s | Cel. dedicado via ADB |
| **ZAS** (Banco Ganadero) | `amount_decimals` (centavos como ID) | ~45 s | Cel. dedicado via ADB |

El orquestador define un orden de prioridad en `.env`
(`PROVIDER_PRIORITY=msc,zas`) y hace **failover automatico**: si el banco
prioritario tarda demasiado o falla, cancela su QR y reintenta con el
siguiente. **Devuelve siempre una ETA** y **notifica via webhook** cada
vez que la ETA cambia o el pago es confirmado.

---

## Arquitectura

```
┌─────────────────────┐         ┌────────────┐
│ Usuario / app POS   │ HTTP →  │  Django    │  api_generador_qr  :8500
└─────────────────────┘         │ Orquestador │
        ▲                       │            │
        │ webhook POST          │  ┌────────┴────┐
        │ (failover/paid)       │  │  Failover    │
        └───────────────────────┤  │  + ETA       │
                                │  └────────┬────┘
                                └───────────┼─────────┐
                                            ▼         ▼
                                     ┌─────────┐ ┌─────────┐
                                     │ Cel.MSC │ │ Cel.ZAS │
                                     │  (ADB)  │ │  (ADB)  │
                                     └─────────┘ └─────────┘
```

Cada banco se controla directamente via ADB sobre un celular real. El
orquestador toma snapshots de las notificaciones Android para confirmar
los pagos (no hay credenciales API en los bancos).

---

## Instalacion

```bash
cd api_generador_qr
python -m venv .venv
.venv\Scripts\activate          # Windows
pip install -r requirements.txt
copy .env.example .env
python manage.py migrate
python manage.py createsuperuser   # opcional, solo para /django-admin/
```

## Configuracion (`.env`)

```ini
DJANGO_PORT=8500

# Orden de prioridad. El primero se intenta primero; si falla, failover.
PROVIDER_PRIORITY=msc,zas
DEFAULT_EXPIRES_IN=900             # 15 minutos

# ADB
ADB_PATH=adb
ADB_DEVICE_SERIAL=34345fb7

# MSC
MSC_PASSWORD=tu-password-app-msc
```

## Ejecutar

```bash
start.cmd                            # orquestador Django :8500
```

El orquestador arranca el `BankManager` que controla los celulares
(MSC y ZAS) por ADB y el `NotificationListener` que detecta los pagos.

---

# 📡 API REST

Base URL por defecto: `http://localhost:8500`.
Todas las respuestas usan **JSON** y devuelven el mismo schema unificado
de Payment (ver [Schema Payment](#schema-payment)).

| Metodo | Endpoint | Proposito |
|--------|----------|-----------|
| `POST` | `/api/qr/generate`            | Solicitar un QR (devuelve ETA) |
| `POST` | `/api/qr/generate-batch`      | Solicitar N QR del mismo monto |
| `GET`  | `/api/qr/list`                | Listar QR con filtros |
| `GET`  | `/api/qr/<uuid>`              | Detalle/estado actual de un QR |
| `POST` | `/api/qr/<uuid>/cancel`       | Cancelar un QR pendiente |
| `GET`  | `/api/health`                 | Estado de cada banco |

---

## `POST /api/qr/generate`

Solicita la generacion de un QR. Devuelve **inmediatamente** un Payment
en estado `creating` con una **ETA estimada** calculada a partir del
provider de mayor prioridad. La generacion real ocurre en background.

### Request

```json
{
  "amount": 50.00,
  "description": "Mesa 4 — Cafe Aromatica",
  "expires_in": 900,
  "callback_url": "https://mi-pos.local/qr/webhook"
}
```

| Campo | Tipo | Obligatorio | Notas |
|-------|------|-------------|-------|
| `amount`       | number | si | Monto en Bs (decimal con 2 digitos) |
| `description`  | string | no | Maximo 80 chars |
| `expires_in`   | int    | no | Segundos de validez (default 900) |
| `callback_url` | string | no | Webhook para notificaciones asincronas (ver [Webhooks](#webhooks)) |

### Response `201`

```json
{
  "id": "8c2f1a3e-...-...",
  "status": "creating",
  "provider": "msc",
  "validation_method": "",
  "requested_amount": 50.00,
  "amount_to_pay": null,
  "code": "K7HF92",
  "qr_payload": null,
  "estimated_seconds": 90.0,
  "failover_count": 0,
  "callback_url": "https://mi-pos.local/qr/webhook",
  "expires_at": "2026-05-27T15:30:00",
  "created_at": "2026-05-27T15:15:00"
}
```

> **Campo clave:** `estimated_seconds` indica cuanto se espera tardar en
> tener el QR listo. Si el banco prioritario falla, este valor se
> actualizara (ver siguiente seccion) y se enviara un webhook con el
> nuevo valor.

El cliente debe:

1. Mostrar al usuario "Generando QR (≈ `estimated_seconds` s)".
2. Hacer **polling** a `GET /api/qr/<id>` cada 1-2s **o** esperar el
   webhook hasta que `status` cambie a `pending` (QR listo) o `failed`.

---

## Failover y actualizacion de ETA

Cuando el orquestador intenta el primer banco y este falla, automaticamente:

1. Marca el intento en `attempts[]`.
2. Recalcula la ETA usando el **siguiente** provider de la lista de
   prioridad + una penalizacion de 15 s por failover acumulado.
3. Actualiza `failover_count`, `provider` y `estimated_seconds` en el
   Payment.
4. **Envia un POST al `callback_url`** con `event=failover` describiendo
   el banco que fallo, el nuevo provider y la nueva ETA.

Asi, el cliente sabe en cuanto cualquier banco falla que "la solicitud
va a demorar un poco mas".

Si **todos** los providers fallan: `status=failed`, `error` describe el
motivo y se emite `event=failed`.

---

## Webhooks

Si la solicitud incluye `callback_url`, el orquestador hara `POST` a esa
URL con `Content-Type: application/json` en estos eventos:

| `event`      | Cuando |
|--------------|--------|
| `created`    | Inmediatamente despues de aceptar la solicitud (incluye ETA inicial) |
| `failover`   | Un banco fallo; se reintenta con otro (incluye nueva ETA) |
| `qr_ready`   | QR materializado, listo para pagar (`status=pending`) |
| `paid`       | El banco confirmo el pago (`status=paid`) |
| `failed`     | Todos los providers fallaron |
| `expired`    | El QR expiro sin pago |

### Payload del webhook

```json
{
  "event": "failover",
  "payment_id": "8c2f1a3e-...",
  "status": "creating",
  "provider": "zas",
  "estimated_seconds": 60.0,
  "failover_count": 1,
  "amount_to_pay": null,
  "code": "K7HF92",
  "validation_method": "",
  "error": "msc: ADB error en automatizacion",
  "failed_provider": "msc",
  "failed_reason": "ADB error",
  "next_provider": "zas",
  "new_estimated_seconds": 60.0,
  "message": "El banco msc fallo; reintentando con zas. La solicitud demorara ~60s mas."
}
```

Para `event=paid`:

```json
{
  "event": "paid",
  "payment_id": "8c2f1a3e-...",
  "status": "paid",
  "provider": "msc",
  "amount_to_pay": 50.00,
  "code": "K7HF92",
  "validation_method": "token_concept",
  "paid_at": "2026-05-27T15:18:43"
}
```

> **Sin webhook?** Es opcional. Si se omite `callback_url`, el cliente
> debe hacer **polling** a `GET /api/qr/<id>` para observar los mismos
> cambios.

---

## `POST /api/qr/generate-batch`

```json
{ "amount": 25.00, "count": 5, "description": "ventas viernes",
  "callback_url": "https://mi-pos.local/qr/webhook" }
```

Devuelve `batch_id` + array de payments (cada uno con su propia ETA).

---

## `GET /api/qr/<uuid>`

Devuelve el estado actual del Payment con el [schema](#schema-payment)
completo. Es el endpoint de **polling** si no usas webhook.

---

## `GET /api/qr/list`

Query params:

- `status`        — `creating|pending|paid|expired|cancelled|failed`
- `provider`      — `msc|zas`
- `q`             — busca por `code` o `provider_payment_id`
- `show_expired`  — `1` para incluir expirados/fallidos antiguos
- `batch`         — UUID de batch

---

## `POST /api/qr/<uuid>/cancel`

Cancela el QR. Si el banco ya esta procesandolo, se hace best-effort.

---

## `GET /api/health`

```json
{
  "ok": true,
  "providers": [
    { "name": "msc", "label": "Mercantil Santa Cruz", "ok": true,
      "validation_method": "token_concept", "error": null },
    { "name": "zas", "label": "Banco Ganadero (ZAS)", "ok": true,
      "validation_method": "amount_decimals", "error": null }
  ],
  "priority": ["msc", "zas"]
}
```

---

# 💳 Validacion de pagos

El orquestador **NO** consulta APIs bancarias para confirmar pagos
(los bancos bolivianos no las exponen). En su lugar, el `BankManager`
ejecuta un `NotificationListener` que hace polling cada 2s a las
notificaciones push de los celulares (`adb shell dumpsys notification`).

Cada provider tiene un mecanismo distinto para correlacionar la
notificacion con el Payment correcto:

## MSC — `validation_method = "token_concept"`

- En el momento de generar el QR, el orquestador inyecta el campo
  **"Concepto"** del QR con un `code` aleatorio de 6 caracteres (alfabeto
  sin O/0/I/1) — visible en el campo `code` del Payment.
- Cuando MSC envia la notificacion `"Has recibido Bs X"` en el cel.,
  el listener lee tambien el concepto y busca el Payment con ese `code`.
- **Como confirma el cliente que fue pagado:** consultando
  `GET /api/qr/<id>` o esperando webhook `event=paid`. El `code`
  aparece tambien en el comprobante del pagador.
- Monto pagado **= monto solicitado** (sin decimales reservados).

## ZAS — `validation_method = "amount_decimals"`

- ZAS no permite escribir concepto en el QR; solo viaja el monto.
- Para distinguir cobros concurrentes del mismo monto base, el
  orquestador **reserva un slot decimal** (0..9):
  `amount_to_pay = requested_amount + slot * 0.01`.
- Ejemplo: dos cobros de 50.00 Bs simultaneos → uno pide 50.00, otro
  50.01. El frontend muestra `amount_to_pay` prominentemente cuando
  difiere del solicitado.
- Cuando ZAS notifica `"Recibiste Bs 50.01"`, el listener busca el
  Payment con ese `amount_to_pay` exacto y lo marca como `paid`.
- **Solo se pueden tener 10 QR ZAS concurrentes del mismo monto base**
  (slots 0..9).

## Resumen del flujo de validacion

```
┌─────────────┐  POST /api/qr/generate    ┌────────────────┐
│ Cliente POS │ ───────────────────────▶  │  Orquestador   │
└─────────────┘ ◀───────────────────────  │  (Django)      │
                201 + ETA + code/uuid     └────────┬───────┘
                                                   │
                                  ADB automation   │
                                                   ▼
┌─────────────┐  pago real          ┌────────────────────┐
│ Pagador     │ ───────────────────▶│ App banco (cel.)   │
│ (con QR)    │                     │ (MSC o ZAS)        │
└─────────────┘                     └────────┬───────────┘
                                             │ push notification
                                             ▼
                                   ┌────────────────────┐
                                   │ NotificationListener│
                                   │ (parsea dumpsys)    │
                                   └────────┬───────────┘
                                            │ correla por code
                                            │ o por amount_decimals
                                            ▼
┌─────────────┐  webhook event=paid  ┌────────────────────┐
│ Cliente POS │ ◀────────────────────│  Payment.status =  │
└─────────────┘   (o GET /api/qr/id) │      "paid"        │
                                     └────────────────────┘
```

---

# Schema `Payment`

```json
{
  "id":                  "uuid",
  "status":              "creating|pending|paid|expired|cancelled|failed",
  "status_label":        "Esperando pago",
  "provider":            "msc|zas",
  "provider_label":      "Mercantil Santa Cruz",
  "validation_method":   "token_concept|amount_decimals",
  "provider_payment_id": "id interno del banco",
  "requested_amount":    50.00,
  "amount_to_pay":       50.00,
  "code":                "K7HF92",
  "description":         "Mesa 4",
  "qr_payload":          "00020101021126...",
  "created_at":          "2026-05-27T15:15:00",
  "expires_at":          "2026-05-27T15:30:00",
  "paid_at":             null,
  "estimated_seconds":   90.0,
  "failover_count":      0,
  "callback_url":        "https://...",
  "error":               "",
  "notification":        {"title": "...", "text": "..."},
  "attempts":            [
    {"provider": "msc", "ok": false, "detail": "ADB error",
     "at": "2026-05-27T15:15:03"}
  ],
  "batch_id":            null
}
```

### Estados

| Estado | Significa |
|--------|-----------|
| `creating` | El orquestador esta intentando con algun banco |
| `pending`  | QR listo, esperando pago |
| `paid`     | Pago confirmado por el banco |
| `expired`  | TTL vencido sin pago |
| `cancelled`| Cancelado manualmente |
| `failed`   | Todos los providers fallaron |

---

# Panel web

- **Panel** (`/`) — KPIs en vivo + estado de cada banco + ultimos QR.
- **Generar QR** (`/generar/`) — formulario simple.
- **Generar varios QR** (`/generar-varios/`) — lote de N QR.
- **Historial** (`/historial/`) — datatable filtrable.
- **Detalle** (`/qr/<uuid>/`) — vista del QR + metadata + intentos +
  payload crudo. Auto-refresca cada 2s con HTMX.

---

# Estructura del proyecto

```
api_generador_qr/
├── manage.py
├── requirements.txt
├── .env.example
├── start.cmd
├── orchestrator/        Django project (settings/urls/wsgi)
├── banks/               Automatizacion ADB de cada banco
│   ├── manager.py       BankManager + NotificationListener
│   ├── notifications.py Parseo de dumpsys notification
│   ├── msc/             MSC automation
│   └── zas/             ZAS automation
└── qrgen/               App principal
    ├── models.py        Payment + estados
    ├── services.py      Orquestador + failover + webhooks
    ├── views.py         API JSON + vistas HTML + partials HTMX
    ├── urls.py
    ├── providers/
    │   ├── base.py      Contrato BankProvider (incluye estimate())
    │   ├── msc.py       Provider MSC
    │   ├── zas.py       Provider ZAS
    │   └── registry.py  Resuelve providers segun PROVIDER_PRIORITY
    └── migrations/
```

## Agregar un nuevo banco

1. Crear `qrgen/providers/mibanco.py` heredando de `BankProvider` e
   implementar `health()`, `create()`, `cancel()` y `estimate()`.
2. Registrarlo en `qrgen/providers/registry.py::_CLASSES`.
3. Anadir entrada en `PROVIDERS` de `orchestrator/settings.py` y vars en
   `.env`.
4. Implementar la deteccion de pago (registrar callback en
   `NotificationListener` desde `banks/manager.py`).
5. Listo: el orquestador lo intentara segun `PROVIDER_PRIORITY`.
