# Guía de Implementación de Pruebas — Sistema POS Cafetería

Este documento describe cómo implementar y ejecutar cada tipo de prueba del sistema. Corresponde a la sección **3.8 Validación y pruebas del sistema** del informe.

---

## Tabla de contenidos

1. [Pruebas Unitarias (Jest / pytest)](#1-pruebas-unitarias)
2. [Pruebas Funcionales (Supertest / Postman)](#2-pruebas-funcionales)
3. [Pruebas de Integración](#3-pruebas-de-integración)
4. [Pruebas de Aceptación (checklist manual)](#4-pruebas-de-aceptación)
5. [Ejecución rápida](#5-ejecución-rápida)

---

## 1. Pruebas Unitarias

Las pruebas unitarias validan funciones y módulos de forma aislada, sin base de datos ni red.

### Backend Node.js — Jest

#### Instalación

```bash
cd pos-backend
npm install --save-dev jest @types/jest
```

Agregar en `package.json`:

```json
{
  "scripts": {
    "test": "jest --testPathPattern=tests/unit"
  }
}
```

#### Estructura de archivos

```
pos-backend/
└── tests/
    └── unit/
        ├── orderCalculations.test.js
        ├── authMiddleware.test.js
        ├── zodSchemas.test.js
        └── inventoryDiscount.test.js
```

#### Ejemplo — Cálculo de totales de orden

```js
// tests/unit/orderCalculations.test.js
const { calculateOrderTotals } = require('../../utils/orderCalculations');

describe('calculateOrderTotals', () => {
  test('calcula subtotal, impuesto (13%) y total correctamente', () => {
    const items = [
      { price: 20, quantity: 2 },  // 40
      { price: 15, quantity: 1 },  // 15
    ];
    const result = calculateOrderTotals(items);
    expect(result.subtotal).toBe(55);
    expect(result.tax).toBeCloseTo(7.15, 2);    // 13% IVA boliviano
    expect(result.totalWithTax).toBeCloseTo(62.15, 2);
  });

  test('retorna 0 para carrito vacío', () => {
    const result = calculateOrderTotals([]);
    expect(result.subtotal).toBe(0);
    expect(result.totalWithTax).toBe(0);
  });
});
```

#### Ejemplo — Middleware JWT

```js
// tests/unit/authMiddleware.test.js
const jwt = require('jsonwebtoken');
const { isVerifiedUser } = require('../../middlewares/authMiddleware');

describe('isVerifiedUser middleware', () => {
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  const next = jest.fn();

  test('rechaza request sin cookie token', () => {
    const req = { cookies: {} };
    isVerifiedUser(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('rechaza token con firma inválida', () => {
    const req = { cookies: { token: 'token.invalido.firma' } };
    isVerifiedUser(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('acepta token JWT válido y pasa al siguiente middleware', () => {
    const payload = { _id: 'user123', role: 'admin' };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'test-secret');
    const req = { cookies: { token } };
    isVerifiedUser(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.user).toBeDefined();
  });
});
```

#### Ejemplo — Schemas Zod

```js
// tests/unit/zodSchemas.test.js
const { createOrderSchema } = require('../../schemas');

describe('createOrderSchema', () => {
  test('rechaza orden sin items', () => {
    const result = createOrderSchema.safeParse({ tableId: 'abc', items: [] });
    expect(result.success).toBe(false);
  });

  test('rechaza orden sin tableId', () => {
    const result = createOrderSchema.safeParse({
      items: [{ dishId: 'x', quantity: 1, price: 10 }],
    });
    expect(result.success).toBe(false);
  });

  test('acepta orden válida', () => {
    const result = createOrderSchema.safeParse({
      tableId: '507f1f77bcf86cd799439011',
      items: [{ dishId: '507f1f77bcf86cd799439012', quantity: 2, price: 20 }],
      customerDetails: { name: 'Ana', phone: '70012345', guests: 2 },
    });
    expect(result.success).toBe(true);
  });
});
```

#### Ejecución

```bash
cd pos-backend
npm test
```

---

### Orquestador Django — pytest

#### Instalación

```bash
cd api_generador_qr
pip install pytest pytest-django
```

Crear `pytest.ini`:

```ini
[pytest]
DJANGO_SETTINGS_MODULE = api_generador_qr.settings
python_files = tests_*.py
```

#### Ejemplo — Lógica de failover entre bancos

```python
# qrgen/tests_failover.py
import pytest
from unittest.mock import patch, MagicMock
from qrgen.services import QROrchestrator

class TestFailover:
    def test_usa_msc_por_defecto(self):
        """El orquestador intenta MSC primero según PROVIDER_PRIORITY."""
        with patch('qrgen.providers.msc.generate_qr') as mock_msc:
            mock_msc.return_value = {'qr_payload': 'base64...', 'code': 'ABC123'}
            orchestrator = QROrchestrator()
            result = orchestrator.generate(amount=50.00, callback_url='http://test/webhook')
            mock_msc.assert_called_once()
            assert result['provider'] == 'msc'

    def test_failover_a_zas_si_msc_falla(self):
        """Si MSC lanza excepción, debe intentar con ZAS."""
        with patch('qrgen.providers.msc.generate_qr', side_effect=Exception('MSC timeout')), \
             patch('qrgen.providers.zas.generate_qr') as mock_zas:
            mock_zas.return_value = {'qr_payload': 'base64...', 'code': '00000005'}
            orchestrator = QROrchestrator()
            result = orchestrator.generate(amount=50.00, callback_url='http://test/webhook')
            mock_zas.assert_called_once()
            assert result['provider'] == 'zas'

    def test_slot_decimal_unico_para_zas(self):
        """ZAS debe usar un slot decimal único (0–9) para identificar el pago."""
        slot = 5
        amount = 50.00
        expected_amount = 50.05  # amount + 0.0X donde X es el slot
        from qrgen.providers.zas import apply_decimal_slot
        result = apply_decimal_slot(amount, slot)
        assert abs(result - expected_amount) < 0.001
```

#### Ejecución

```bash
cd api_generador_qr
pytest -v
```

---

## 2. Pruebas Funcionales

Las pruebas funcionales verifican que cada endpoint de la API responde correctamente.

### Supertest — API REST Node.js

#### Instalación

```bash
cd pos-backend
npm install --save-dev supertest mongodb-memory-server
```

#### Estructura

```
pos-backend/
└── tests/
    └── functional/
        ├── auth.test.js
        ├── orders.test.js
        ├── menu.test.js
        ├── tables.test.js
        └── inventory.test.js
```

#### Ejemplo — Flujo de autenticación

```js
// tests/functional/auth.test.js
const request = require('supertest');
const app = require('../../app');
const { connectTestDB, disconnectTestDB } = require('../helpers/testDb');

beforeAll(async () => await connectTestDB());
afterAll(async () => await disconnectTestDB());

describe('POST /api/user/register', () => {
  test('registra un nuevo empleado correctamente', async () => {
    const res = await request(app)
      .post('/api/user/register')
      .send({
        name: 'María Cajera',
        email: 'maria@cafe.bo',
        phone: '70011111',
        password: 'Password1!',
        role: 'cashier',
      });
    expect(res.status).toBe(201);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.role).toBe('cashier');
  });

  test('rechaza registro con email duplicado', async () => {
    await request(app).post('/api/user/register').send({
      name: 'Otro Usuario', email: 'maria@cafe.bo', phone: '70022222',
      password: 'Password1!', role: 'waiter',
    });
    const res = await request(app).post('/api/user/register').send({
      name: 'Otro', email: 'maria@cafe.bo', phone: '70033333',
      password: 'Pass2!', role: 'waiter',
    });
    expect(res.status).toBe(409);
  });
});

describe('POST /api/user/login', () => {
  test('devuelve JWT en cookie con credenciales válidas', async () => {
    const res = await request(app)
      .post('/api/user/login')
      .send({ email: 'maria@cafe.bo', password: 'Password1!' });
    expect(res.status).toBe(200);
    expect(res.headers['set-cookie']).toBeDefined();
    expect(res.headers['set-cookie'][0]).toContain('token=');
  });

  test('rechaza contraseña incorrecta con 401', async () => {
    const res = await request(app)
      .post('/api/user/login')
      .send({ email: 'maria@cafe.bo', password: 'WrongPassword' });
    expect(res.status).toBe(401);
  });
});
```

#### Ejemplo — Crear orden

```js
// tests/functional/orders.test.js
const request = require('supertest');
const app = require('../../app');
const { connectTestDB, disconnectTestDB, getAuthCookie, seedData } = require('../helpers/testDb');

let authCookie, tableId, dishId;

beforeAll(async () => {
  await connectTestDB();
  authCookie = await getAuthCookie(app, 'waiter');
  ({ tableId, dishId } = await seedData());
});
afterAll(async () => await disconnectTestDB());

describe('POST /api/order', () => {
  test('crea una orden y descuenta el inventario', async () => {
    const res = await request(app)
      .post('/api/order')
      .set('Cookie', authCookie)
      .send({
        tableId,
        customerDetails: { name: 'Carlos', phone: '70099999', guests: 2 },
        items: [{ dishId, quantity: 2, price: 20 }],
        paymentMethod: 'Efectivo',
      });
    expect(res.status).toBe(201);
    expect(res.body.order.orderStatus).toBe('In Progress');
    expect(res.body.order.bills.totalWithTax).toBeGreaterThan(0);
  });

  test('rechaza orden si la mesa no existe', async () => {
    const res = await request(app)
      .post('/api/order')
      .set('Cookie', authCookie)
      .send({
        tableId: '000000000000000000000000',
        items: [{ dishId, quantity: 1, price: 20 }],
      });
    expect(res.status).toBe(404);
  });
});
```

#### Ejecución

```bash
cd pos-backend
npm run test:functional
```

---

### Postman — Colección de pruebas manuales

Importar la colección `tests/postman/pos_cafeteria.postman_collection.json` en Postman.

Variables de entorno Postman:

| Variable | Valor |
|---|---|
| `BASE_URL` | `http://localhost:8000` |
| `ADMIN_EMAIL` | `admin@cafe.bo` |
| `ADMIN_PASSWORD` | `Admin1234!` |
| `TOKEN` | *(se llena automáticamente al ejecutar Login)* |

Secuencia de ejecución recomendada:

1. **Auth — Register Admin**
2. **Auth — Login** *(guarda token en variable)*
3. **Tables — Create Table**
4. **Menu — Create Category**
5. **Menu — Create Dish**
6. **Orders — Create Order**
7. **Orders — Get All Orders**
8. **Inventory — Check Stock After Order**
9. **Payments QR — Create QR**
10. **WhatsApp — Send Test Message**

---

## 3. Pruebas de Integración

Las pruebas de integración verifican la comunicación entre componentes del sistema.

### Frontend → API Node.js → MongoDB

```js
// tests/integration/orderFlow.test.js
// Prueba completa: crear orden, verificar en BD, verificar descuento de inventario

const request = require('supertest');
const app = require('../../app');
const Insumo = require('../../models/Insumo');
const { connectTestDB, disconnectTestDB, seedFullData, getAuthCookie } = require('../helpers/testDb');

let authCookie, data;

beforeAll(async () => {
  await connectTestDB();
  authCookie = await getAuthCookie(app, 'cashier');
  data = await seedFullData(); // crea mesa, categoría, plato con insumos y stock inicial
});
afterAll(async () => await disconnectTestDB());

test('crear orden descuenta correctamente los insumos del inventario', async () => {
  const insumoAntes = await Insumo.findById(data.insumoId);
  const stockAntes = insumoAntes.stock;

  const res = await request(app)
    .post('/api/order')
    .set('Cookie', authCookie)
    .send({
      tableId: data.tableId,
      customerDetails: { name: 'Test', phone: '70000000', guests: 1 },
      items: [{ dishId: data.dishId, quantity: 2, price: 15 }],
      paymentMethod: 'QR',
    });

  expect(res.status).toBe(201);

  const insumoDespu = await Insumo.findById(data.insumoId);
  // El plato requiere 1 unidad del insumo → 2 unidades consumidas
  expect(insumoDespu.stock).toBe(stockAntes - 2 * data.cantidadPorPlato);
});
```

### API Node.js → Orquestador Django (QR)

```js
// tests/integration/qrPayment.test.js
// Usa nock para interceptar llamadas HTTP al orquestador Django

const nock = require('nock');
const request = require('supertest');
const app = require('../../app');

beforeAll(() => {
  // Mock del orquestador Django en :8500
  nock('http://localhost:8500')
    .post('/api/payment/create/')
    .reply(200, {
      id: 'uuid-test-123',
      status: 'qr_ready',
      qr_payload: 'data:image/png;base64,iVBORw0KGgo=',
      estimated_seconds: 60,
      provider: 'msc',
    });
});

test('crear QR llama al orquestador y retorna datos del pago', async () => {
  // ... autenticar y crear orden previa
  const res = await request(app)
    .post('/api/payment/qr/create')
    .set('Cookie', authCookie)
    .send({ orderId: 'order-id-test', amount: 50.00 });

  expect(res.status).toBe(200);
  expect(res.body.qrPayload).toBeDefined();
  expect(res.body.estimatedSeconds).toBe(60);
  expect(res.body.provider).toBe('msc');
});
```

### Webhook de pago QR → Actualización de orden

```js
// tests/integration/qrWebhook.test.js
test('webhook del orquestador actualiza orden a Pagado', async () => {
  // Crear orden previa con estado pendiente de pago
  const order = await createPendingOrder();

  // Simular webhook del orquestador Django
  const res = await request(app)
    .post('/api/payment/qr/webhook')
    .set('x-webhook-secret', process.env.QR_WEBHOOK_SECRET || 'test-secret')
    .send({
      payment_id: order.paymentData.id,
      status: 'paid',
      amount: order.bills.totalWithTax,
    });

  expect(res.status).toBe(200);

  const updatedOrder = await Order.findById(order._id);
  expect(updatedOrder.paymentStatus).toBe('paid');
  expect(updatedOrder.orderStatus).toBe('Completed');
});
```

### Chatbot Groq — Respuesta en contexto del menú

```js
// tests/integration/groqChatbot.test.js
const nock = require('nock');

test('el chatbot responde con información del menú de la cafetería', async () => {
  nock('https://api.groq.com')
    .post('/openai/v1/chat/completions')
    .reply(200, {
      choices: [{
        message: { content: 'El café americano cuesta Bs. 20.' }
      }]
    });

  const res = await request(app)
    .post('/api/groq/chat')
    .send({ message: '¿Cuánto cuesta el café americano?' });

  expect(res.status).toBe(200);
  expect(res.body.reply).toContain('20');
});
```

#### Ejecución de pruebas de integración

```bash
cd pos-backend
npm run test:integration
```

---

## 4. Pruebas de Aceptación

Las pruebas de aceptación se ejecutan manualmente en el entorno de producción (Oracle Cloud) con usuarios reales o representativos.

### Checklist — Flujo completo de jornada

#### Pre-condiciones
- [ ] Sistema desplegado y accesible en la URL de producción
- [ ] Al menos 1 mesa configurada
- [ ] Al menos 3 platos en el catálogo con insumos asociados
- [ ] Insumos con stock suficiente
- [ ] WhatsApp conectado (verificar estado en panel admin)
- [ ] Orquestador Django corriendo en `:8500`

#### CA-01: Autenticación por roles

| Paso | Acción | Resultado esperado | ✓/✗ |
|---|---|---|---|
| 1 | Login con credenciales de **Admin** | Redirige al dashboard con métricas | |
| 2 | Login con credenciales de **Mesero** | Solo ve Inicio, Órdenes, Mesas y Menú | |
| 3 | Login con credenciales de **Barista** | Solo ve la pantalla KDS | |
| 4 | Intentar acceder a `/dashboard` como Barista | Muestra mensaje de acceso denegado | |
| 5 | Cerrar sesión | Redirige al login, cookie eliminada | |

#### CA-02: Ciclo completo de orden con pago QR

| Paso | Acción | Resultado esperado | ✓/✗ |
|---|---|---|---|
| 1 | Mesero selecciona Mesa 1 | Estado cambia a "En uso" en panel de mesas | |
| 2 | Agrega 2 platos al carrito | Subtotal y total calculados en tiempo real | |
| 3 | Confirma la orden (pago QR) | Orden aparece en KDS del barista | |
| 4 | Barista mueve orden a "Preparando" | Mesero ve actualización en su vista | |
| 5 | Barista marca como "Lista" | Mesero recibe aviso visual | |
| 6 | Cajero genera QR de pago | QR generado con cronómetro de expiración | |
| 7 | Cliente recibe QR por WhatsApp | Mensaje WhatsApp recibido con imagen del QR y monto | |
| 8 | Cliente paga con app bancaria | Sistema actualiza orden a "Pagado" automáticamente | |
| 9 | Cliente recibe confirmación WhatsApp | Mensaje de confirmación de pago recibido | |
| 10 | Cajero genera factura | Documento con ítems, impuesto y total visible | |
| 11 | Mesa queda "Disponible" | Panel de mesas refleja el cambio | |

#### CA-03: Inventario

| Paso | Acción | Resultado esperado | ✓/✗ |
|---|---|---|---|
| 1 | Anotar stock inicial de un insumo | Stock registrado | |
| 2 | Crear y confirmar orden con platos que usan ese insumo | Stock se reduce automáticamente | |
| 3 | Reducir stock manualmente hasta nivel crítico | Indicador "Crítico" visible en lista de insumos | |
| 4 | Registrar reabastecimiento | Stock aumenta y desaparece del panel de alertas | |

#### CA-04: Chatbot WhatsApp

| Paso | Acción | Resultado esperado | ✓/✗ |
|---|---|---|---|
| 1 | Enviar "¿Qué hay en el menú?" al número de WhatsApp del sistema | Bot responde en < 3 segundos con lista de platos | |
| 2 | Preguntar por el precio de un plato específico | Bot responde con el precio actualizado del catálogo | |
| 3 | Actualizar precio de un plato en el sistema | Bot responde con el nuevo precio en consulta posterior | |

#### CA-05: CI/CD — GitHub Actions

| Paso | Acción | Resultado esperado | ✓/✗ |
|---|---|---|---|
| 1 | Hacer push a la rama `main` con un cambio menor | Pipeline inicia automáticamente | |
| 2 | Monitorear el pipeline en GitHub Actions | Build frontend, rsync y pm2 restart completan sin errores | |
| 3 | Verificar tiempo total del pipeline | Menos de 5 minutos | |
| 4 | Acceder a la URL de producción | Cambio visible sin intervención manual | |

---

## 5. Ejecución Rápida

### Ejecutar todas las pruebas del backend

```bash
cd pos-backend
npm run test              # unitarias
npm run test:functional   # funcionales (requiere MongoDB de prueba)
npm run test:integration  # integración (requiere mocks configurados)
```

### Ejecutar pruebas del orquestador Django

```bash
cd api_generador_qr
pytest -v --tb=short
```

### Scripts en `package.json` del backend

```json
{
  "scripts": {
    "test": "jest --testPathPattern=tests/unit --passWithNoTests",
    "test:functional": "jest --testPathPattern=tests/functional --forceExit",
    "test:integration": "jest --testPathPattern=tests/integration --forceExit",
    "test:all": "jest --forceExit",
    "test:coverage": "jest --coverage --forceExit"
  }
}
```

### Generar reporte de cobertura

```bash
cd pos-backend
npm run test:coverage
# Abre coverage/lcov-report/index.html en el navegador
```

---

## Estructura de archivos de prueba

```
pos-backend/
└── tests/
    ├── helpers/
    │   └── testDb.js           # Conexión a MongoDB en memoria, seeds de prueba
    ├── unit/
    │   ├── orderCalculations.test.js
    │   ├── authMiddleware.test.js
    │   ├── zodSchemas.test.js
    │   └── inventoryDiscount.test.js
    ├── functional/
    │   ├── auth.test.js
    │   ├── orders.test.js
    │   ├── menu.test.js
    │   ├── tables.test.js
    │   └── inventory.test.js
    ├── integration/
    │   ├── orderFlow.test.js
    │   ├── qrPayment.test.js
    │   ├── qrWebhook.test.js
    │   └── groqChatbot.test.js
    └── postman/
        └── pos_cafeteria.postman_collection.json

api_generador_qr/
└── qrgen/
    ├── tests_unit.py
    ├── tests_failover.py
    └── tests_webhook.py
```

---

## Herramientas utilizadas

| Herramienta | Versión | Uso |
|---|---|---|
| Jest | ^29 | Pruebas unitarias y funcionales (Node.js) |
| Supertest | ^6 | Pruebas HTTP sobre la API Express |
| mongodb-memory-server | ^9 | MongoDB en memoria para pruebas aisladas |
| nock | ^13 | Mock de llamadas HTTP externas (Django QR, Groq) |
| pytest | ^8 | Pruebas unitarias e integración (Django/Python) |
| pytest-django | ^4 | Integración de pytest con Django |
| Postman | v10+ | Colecciones de pruebas manuales de la API |
