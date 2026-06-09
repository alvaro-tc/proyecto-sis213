# Sistema POS para Cafetería — Grupo 5

Proyecto universitario (UCB, Ingeniería de Software) que implementa un punto de venta completo para cafeterías, con integración de pagos QR bancarios, notificaciones por WhatsApp y chatbot con IA.

---

## Tabla de contenidos

1. [Visión general](#visión-general)
2. [Stack tecnológico](#stack-tecnológico)
3. [Arquitectura](#arquitectura)
4. [Módulos del proyecto](#módulos-del-proyecto)
5. [Configuración de entorno](#configuración-de-entorno)
6. [Instalación y ejecución local](#instalación-y-ejecución-local)
7. [API del backend](#api-del-backend)
8. [Base de datos](#base-de-datos)
9. [Roles de usuario](#roles-de-usuario)
10. [Flujos principales](#flujos-principales)
11. [Pagos QR (Orquestador Django)](#pagos-qr-orquestador-django)
12. [Integración WhatsApp](#integración-whatsapp)
13. [Chatbot con Groq AI](#chatbot-con-groq-ai)
14. [Deploy y CI/CD](#deploy-y-cicd)

---

## Visión general

El sistema permite a una cafetería gestionar órdenes, mesas, menú e inventario desde una interfaz web. Los pagos se procesan mediante QR de bancos bolivianos (Mercantil Santa Cruz y Banco Ganadero). Los clientes reciben confirmaciones y el QR de pago por WhatsApp. Un chatbot con IA responde preguntas entrantes del menú.

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, Redux Toolkit, React Query, React Router 7 |
| Backend | Node.js 20, Express.js, MongoDB (Mongoose), JWT, bcrypt, Zod |
| Orquestador QR | Django 5 (Python), SQLite, ADB (Android Debug Bridge) |
| WhatsApp | Baileys (WhatsApp Web) o Meta Cloud API |
| IA / Chatbot | Groq API — modelo `llama-3.1-8b-instant` |
| WebSocket | ws (Node.js) — eventos en tiempo real |
| Infraestructura | Nginx, PM2, Ubuntu Server |
| CI/CD | GitHub Actions |

---

## Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                         Internet                            │
└──────────────┬──────────────────────────────────────────────┘
               │ HTTPS (443)
       ┌───────▼────────┐
       │     Nginx       │  Reverse proxy + static files
       └───┬────────┬────┘
           │        │
    /api/* │        │ /* (React SPA)
           │        │
  ┌────────▼──┐  ┌──▼──────────────┐
  │  Backend   │  │   Frontend dist  │
  │ Node :8000 │  │ /var/www/pos-..  │
  └────┬───────┘  └─────────────────┘
       │
       ├── MongoDB (local o Atlas)
       ├── WebSocket (/ws)
       ├── Baileys / Meta (WhatsApp)
       ├── Groq API (HTTPS externo)
       └── Orquestador QR
              ┌──────────────────────┐
              │  Django :8500        │
              │  api_generador_qr    │
              └──────┬───────────────┘
                     │ ADB (USB)
              ┌──────▼───────────────┐
              │  Celulares bancarios  │
              │  (MSC / ZAS)         │
              └──────────────────────┘
```

El frontend hace `fetch` solo hacia `/api/...` y `/ws`. Nginx enruta todo internamente. El orquestador Django no está expuesto al exterior directamente — el backend Node es el único que lo llama.

---

## Módulos del proyecto

```
proyecto-sis213/
├── pos-backend/          # API REST + WebSocket + servicios
├── pos-frontend/         # SPA React
├── api_generador_qr/     # Orquestador de pagos QR (Django)
├── deploy/
│   ├── nginx.conf        # Configuración Nginx lista para producción
│   └── setup-server.sh  # Script de aprovisionamiento del servidor
└── .github/workflows/
    └── deploy.yml        # Pipeline CI/CD
```

---

## Configuración de entorno

### Backend — `pos-backend/.env`

```env
PORT=8000
CORS_ORIGINS=http://localhost:5173
MONGODB_URI=mongodb://localhost:27017/cafeteria
JWT_SECRET=cambia-este-secreto

# Orquestador QR
QR_API_URL=http://localhost:8500
QR_API_KEY=
QR_PUBLIC_WEBHOOK_URL=https://tu-dominio.com/api/payment/qr/webhook
QR_WEBHOOK_SECRET=cambia-este-secreto-qr-webhook

# WhatsApp — elegir "baileys" o "meta"
WA_PROVIDER=baileys
WHATSAPP_DEFAULT_PREFIX=591
WHATSAPP_MIN_DELAY_MS=1200
WHATSAPP_MAX_DELAY_MS=4500
WHATSAPP_RATE_PER_MINUTE=25
WHATSAPP_RATE_PER_DAY=800
WHATSAPP_PER_JID_PER_MINUTE=5
WHATSAPP_PER_JID_PER_DAY=30
WHATSAPP_AUTH_DIR=

# Meta Cloud API (solo si WA_PROVIDER=meta)
META_PHONE_NUMBER_ID=
META_ACCESS_TOKEN=
META_VERIFY_TOKEN=

# Groq IA
GROQ_API_KEY=
GROQ_MODEL=llama-3.1-8b-instant
GROQ_API_BASE_URL=https://api.groq.com/openai/v1

BOT_WEBHOOK_SECRET=cambia-este-secreto
```

### Frontend — `pos-frontend/.env`

```env
VITE_BACKEND_URL=http://localhost:8000/
```

En producción se usa `.env.production` con `VITE_BACKEND_URL=/` para que el frontend use rutas relativas (Nginx las proxy-a al backend).

### Orquestador QR — `api_generador_qr/.env`

```env
DJANGO_SECRET_KEY=cambia-esta-clave
DJANGO_DEBUG=true
DJANGO_HOST=0.0.0.0
DJANGO_PORT=8500
DJANGO_ALLOWED_HOSTS=*

PROVIDER_PRIORITY=msc,zas
DEFAULT_EXPIRES_IN=900         # segundos hasta que expira el QR

ADB_PATH=adb
ADB_DEVICE_SERIAL=34345fb7     # serial del celular bancario conectado por USB

MSC_PASSWORD=tu-contraseña
```

---

## Instalación y ejecución local

### Requisitos previos

- Node.js 20+
- Python 3.11+
- MongoDB (local o Atlas)
- (Opcional) ADB instalado y celular bancario conectado por USB para el orquestador QR

### 1. Backend

```bash
cd pos-backend
npm install
cp .env.example .env   # completar variables
npm run dev            # inicia en :8000 con nodemon
```

Para cargar datos iniciales (platos y categorías de ejemplo):

```bash
npm run seed
```

### 2. Frontend

```bash
cd pos-frontend
npm install
cp .env.example .env   # VITE_BACKEND_URL=http://localhost:8000/
npm run dev            # inicia en http://localhost:5173
```

### 3. Orquestador QR (opcional)

```bash
cd api_generador_qr
pip install -r requirements.txt
cp .env.example .env   # completar variables
python manage.py migrate
python manage.py runserver 0.0.0.0:8500
```

---

## API del backend

Todas las rutas bajo `/api`. Las marcadas con **[JWT]** requieren cookie `token` con un JWT válido.

### Autenticación y usuarios

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/api/user/register` | — | Registro de usuario |
| POST | `/api/user/login` | — | Login, setea cookie JWT |
| POST | `/api/user/logout` | — | Cierra sesión |
| GET | `/api/user` | JWT | Datos del usuario actual |
| GET | `/api/user/all` | JWT | Listar todos los usuarios |
| DELETE | `/api/user/:id` | JWT | Eliminar usuario |

### Órdenes

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/api/order` | JWT | Crear orden |
| GET | `/api/order` | JWT | Listar todas las órdenes |
| GET | `/api/order/my` | JWT | Mis órdenes |
| GET | `/api/order/customers/search` | JWT | Buscar clientes |
| GET | `/api/order/:id` | JWT | Obtener orden por ID |
| PUT | `/api/order/:id` | JWT | Actualizar orden |
| POST | `/api/order/:id/confirm-payment` | JWT | Marcar como pagado |

### Pagos QR

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/api/payment/qr/health` | — | Health de todos los bancos |
| POST | `/api/payment/qr/webhook` | — | Webhook del orquestador |
| POST | `/api/payment/qr/create` | JWT | Crear QR |
| GET | `/api/payment/qr/:paymentId` | JWT | Estado del QR |
| POST | `/api/payment/qr/:paymentId/cancel` | JWT | Cancelar QR |
| POST | `/api/payment/qr/:paymentId/send-whatsapp` | JWT | Enviar QR al cliente por WhatsApp |

### Mesas, Categorías, Platos, Insumos

Todas tienen el CRUD estándar bajo `/api/table`, `/api/category`, `/api/dish`, `/api/insumo`. Los endpoints de insumos incluyen:

- `POST /api/insumo/:id/consumo` — Registrar consumo manual
- `POST /api/insumo/:id/reponer` — Reponer stock

### WhatsApp

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/api/whatsapp/status` | JWT | Estado del provider activo |
| GET | `/api/whatsapp/qr` | JWT | QR de conexión (Baileys) |
| POST | `/api/whatsapp/test` | JWT | Enviar mensaje de prueba |
| POST | `/api/whatsapp/logout` | JWT | Desconectar WhatsApp |
| POST | `/api/whatsapp/reset` | JWT | Borrar credenciales |
| POST | `/api/whatsapp/switch-provider` | JWT | Cambiar entre Baileys y Meta |
| GET | `/api/whatsapp/webhook/meta` | — | Verificación del webhook de Meta |
| POST | `/api/whatsapp/webhook/meta` | — | Recepción de mensajes de Meta |

### Métricas y Groq

- `GET /api/metric` [JWT] — Métricas del dashboard (ventas, ingresos, órdenes)
- `POST /api/groq/...` — Endpoints del chatbot IA

---

## Base de datos

MongoDB con los siguientes modelos (Mongoose):

### User
```
name, email, phone, password (bcrypt), role (waiter|barista|admin|customer)
```

### Order
```
customerDetails { name, phone, guests }
orderStatus: Pending Payment | In Progress | Preparing | Ready | Completed | Cancelled
orderType: dine-in | takeaway
items: Array
bills { total, tax, totalWithTax }
table: ref Table
paymentMethod, paymentStatus (pending|paid|failed)
paymentData: datos del orquestador QR
```

### Table
```
tableNo, seats, status (Available|Booked), orderId, bgColor
```

### Dish
```
name, price, category: ref Category
insumosRequeridos: [{ insumo: ref Insumo, cantidad }]
```

### Insumo
```
nombre, unidad, stock, stockMinimo, stockMaximo
costoUnitario, categoria, proveedor
consumos: Array (historial)
```

### Orquestador QR (Django — SQLite)

```
Payment {
  id: UUID
  status: creating | pending | paid | expired | cancelled | failed
  provider: msc | zas
  validation_method: token_concept | amount_decimals
  requested_amount, amount_to_pay
  code: String (código único de validación)
  qr_payload: String (QR en base64)
  created_at, expires_at, paid_at
  estimated_seconds
  failover_count
  callback_url, notification, attempts
}
```

---

## Roles de usuario

| Rol | Acceso |
|---|---|
| `admin` | Dashboard completo: mesas, categorías, platos, empleados, WhatsApp, métricas, insumos |
| `waiter` | Tomar órdenes, gestionar mesas, ver menú |
| `barista` | Panel de preparación de bebidas |
| `cashier` | Cobro, generación de QR, confirmación de pagos |
| `customer` | Portal de cliente: ver su historial de órdenes |

El control de acceso se aplica tanto en el frontend (rutas protegidas por rol) como en el backend (middleware `isVerifiedUser` + validaciones en controladores).

---

## Flujos principales

### Login

```
1. POST /api/user/login  (email + password)
2. Backend valida con bcrypt
3. Genera JWT → cookie httpOnly (1 día)
4. Frontend guarda usuario en Redux
5. Redirige según rol
```

### Crear orden con pago QR

```
1. Mesero/cajero selecciona mesa + items del menú
2. POST /api/order
3. Backend crea la orden, descuenta insumos del stock
4. Si paymentMethod=Yape → POST /api/payment/qr/create
5. Backend contacta al orquestador Django
6. Django devuelve QR + estimated_seconds
7. Frontend muestra QR + cronómetro ETA
8. (Opcional) enviar QR al cliente por WhatsApp
9. Cliente paga con la app bancaria
10a. Webhook del orquestador → backend actualiza orden a paid
10b. Fallback: frontend/backend hace polling cada 5s
11. Notificación WhatsApp de confirmación al cliente
```

### Preparación por el barista

```
1. Barista ve las órdenes con estado "In Progress"
2. Cambia estado a "Preparing"
3. Al terminar, marca como "Ready"
4. Mesero/cajero entrega y cierra como "Completed"
```

---

## Pagos QR (Orquestador Django)

El módulo `api_generador_qr` es un servicio independiente que abstrae la generación de QR de múltiples bancos bolivianos.

### Cómo funciona

1. Recibe solicitud de QR con `amount` y `callback_url`
2. Intenta generar el QR en el banco prioritario (MSC por defecto)
3. Si falla, hace **failover automático** al siguiente banco (ZAS)
4. Usa ADB para controlar la app bancaria en un celular Android conectado por USB
5. Toma el QR generado, lo decodifica con OpenCV/pyzbar
6. Notifica eventos vía webhook al backend Node: `created`, `qr_ready`, `paid`, `failed`

### Validación del pago

- **MSC (token_concept)**: inyecta un código único en el campo "concepto" del QR. Cuando el banco notifica el pago, verifica que el concepto coincida.
- **ZAS (amount_decimals)**: reserva un slot decimal (centavos 0–9) que sirve como identificador único del pago.

### Providers disponibles

| Provider | Banco | Método |
|---|---|---|
| `msc` | Mercantil Santa Cruz | token_concept |
| `zas` | Banco Ganadero | amount_decimals |

### Panel web del orquestador

El orquestador expone un panel web en `:8500`:
- `/` — Dashboard de pagos en tiempo real
- `/generar/` — Generar QR manualmente
- `/historial/` — Historial de pagos
- `/qr/<uuid>/` — Detalle de un pago

---

## Integración WhatsApp

El backend puede enviar y recibir mensajes de WhatsApp a través de dos providers intercambiables en tiempo de ejecución.

### Providers

**Baileys (default)** — WhatsApp Web reverse-engineered:
- No requiere cuenta de negocio de Meta
- Escaneo de QR desde el panel admin (`/home` → pestaña WhatsApp)
- Sesión persistente en `auth_info_baileys/`
- Protecciones anti-baneo: delays aleatorios (1.2–4.5 s), rate limiting (25 msg/min, 800 msg/día)

**Meta Cloud API** — API oficial de WhatsApp Business:
- Requiere cuenta de Meta for Developers
- Configuración via `META_PHONE_NUMBER_ID`, `META_ACCESS_TOKEN`, `META_VERIFY_TOKEN`
- Webhook en `GET/POST /api/whatsapp/webhook/meta`

### Funciones de notificación

| Función | Trigger |
|---|---|
| `notifyOrderStatus(order)` | Cambio de estado de la orden |
| `notifyOrderPaid(order)` | Pago confirmado |
| `sendQrEtaNotice(...)` | Aviso de ETA al enviar QR |

### Cambio de provider en runtime

```http
POST /api/whatsapp/switch-provider
{ "provider": "meta" }
```

---

## Chatbot con Groq AI

El chatbot procesa mensajes entrantes de WhatsApp usando la API de Groq (Llama 3.1 8B Instant).

- Contexto: menú de la cafetería, estado del bot
- Puede responder preguntas sobre productos, precios y disponibilidad
- Se configura con `GROQ_API_KEY` y `GROQ_MODEL`

---

## Deploy y CI/CD

### Infraestructura del servidor

El servidor Ubuntu corre:
- **Nginx** — Reverse proxy + sirve el build del frontend
- **PM2** — Process manager para el backend Node.js
- **Django** — Se corre manualmente o con un servicio systemd en `:8500`

Para aprovisionar un servidor nuevo:

```bash
bash deploy/setup-server.sh
```

### Pipeline GitHub Actions (`.github/workflows/deploy.yml`)

Se activa con cada push a `main` o manualmente.

**Pasos:**
1. Checkout del código
2. Build del frontend (`npm run build`) → genera `/dist`
3. Instalar dependencias del backend (solo producción)
4. Configurar SSH con la clave en GitHub Secrets
5. `rsync` del frontend compilado a `/var/www/pos-frontend`
6. `rsync` del backend a `/opt/pos-backend` (excluye `.env` y `auth_info_baileys/`)
7. Inyectar `QR_API_URL` en el `.env` del servidor
8. `pm2 restart pos-backend`

**Secrets de GitHub necesarios:**

| Secret | Descripción |
|---|---|
| `SSH_PRIVATE_KEY` | Clave privada SSH para conectarse al servidor |
| `SSH_HOST` | IP o dominio del servidor |
| `SSH_USER` | Usuario SSH (ej. `ubuntu`) |
| `QR_API_URL` | URL interna del orquestador Django |

### Nginx

El archivo `deploy/nginx.conf` configura:
- `location /` → frontend React (SPA con fallback a `index.html`)
- `location /api/` → proxy a `http://localhost:8000`
- `location /ws` → WebSocket upgrade a `http://localhost:8000`
- Soporte para WebSocket con headers `Upgrade` y `Connection`

---

## Estructura de carpetas

```
pos-backend/
├── app.js                 # Entrada, registra rutas y middleware
├── config/
│   ├── config.js          # Variables de entorno
│   └── database.js        # Conexión MongoDB
├── controllers/           # Lógica de cada dominio
├── routes/                # Rutas Express
├── models/                # Schemas Mongoose
├── middlewares/           # JWT, validación, errores, rate limiting
├── schemas/index.js       # Validaciones Zod (request body)
└── services/
    ├── whatsapp/          # Providers Baileys y Meta
    ├── qrOrchestratorService.js
    ├── qrWatcherService.js
    ├── groqService.js
    └── wsServer.js

pos-frontend/
├── src/
│   ├── App.jsx            # Router principal + ProtectedRoutes
│   ├── pages/             # Una página por ruta
│   ├── components/        # Por dominio (dashboard, orders, tables…)
│   │   └── ui/            # Componentes Radix UI / shadcn
│   ├── redux/slices/      # userSlice, cartSlice, customerSlice, menuSlice
│   ├── hooks/
│   ├── https/             # Axios configurado con base URL
│   └── i18n/              # Archivos de traducción

api_generador_qr/
├── qrgen/
│   ├── models.py          # Modelo Payment
│   ├── views.py           # Endpoints REST
│   ├── services.py        # Lógica de orquestación y failover
│   └── providers/         # msc.py, zas.py, registry.py
└── banks/
    ├── manager.py         # BankManager + NotificationListener (ADB)
    ├── adb.py
    ├── notifications.py
    └── qr_decoder.py
```
