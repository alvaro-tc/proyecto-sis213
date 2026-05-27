// Tools que el bot de WhatsApp puede invocar vía function-calling.
//
// El bot recibe estas definiciones en cada turno y, cuando confirma con el
// cliente que el pedido es correcto, llama:
//   1. create_order      → registra el pedido en Mongo (paymentStatus: pending)
//   2. send_payment_qr   → crea cobro Yape + envía el QR como imagen por WhatsApp
//
// `executeBotTool({ name, arguments }, ctx)` ejecuta la tool con el contexto
// del chat (phone, customer). El bot NUNCA recibe el phone — se inyecta acá.

const Dish = require("../models/dishModel");
const Order = require("../models/orderModel");
const config = require("../config/config");
const wa = require("./whatsapp");
const orchestrator = require("./qrOrchestratorService");

const BOT_TOOLS = [
    {
        type: "function",
        function: {
            name: "place_order",
            description:
                "Registra un pedido y genera el QR de pago en un solo paso. Úsala SOLO cuando el cliente confirme explícitamente productos, cantidades y modalidad.",
            parameters: {
                type: "object",
                properties: {
                    items: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                name: { type: "string", description: "Nombre exacto del menú" },
                                quantity: { type: "integer", minimum: 1 },
                            },
                            required: ["name", "quantity"],
                        },
                    },
                    orderType: { type: "string", enum: ["takeaway", "dine-in"] },
                    customerName: { type: "string" },
                    notes: { type: "string" },
                },
                required: ["items", "orderType", "customerName"],
            },
        },
    },
];

const TAX_RATE = 0.05;

// Resuelve items por nombre contra la colección Dish. Es flexible con mayúsculas/acentos.
const resolveItems = async (items) => {
    const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
    const dishes = await Dish.find({}).lean();
    const dishIndex = new Map(dishes.map((d) => [norm(d.name), d]));

    const resolved = [];
    const missing = [];
    for (const item of items || []) {
        const key = norm(item.name);
        const dish = dishIndex.get(key) || dishes.find((d) => norm(d.name).includes(key) || key.includes(norm(d.name)));
        if (!dish) {
            missing.push(item.name);
            continue;
        }
        const qty = Math.max(1, Math.floor(item.quantity || 1));
        resolved.push({
            id: String(dish._id),
            dishId: String(dish._id),
            name: dish.name,
            price: Number(dish.price) || 0,
            quantity: qty,
        });
    }
    return { resolved, missing };
};

const computeBills = (items) => {
    const total = items.reduce((acc, it) => acc + (Number(it.price) || 0) * (Number(it.quantity) || 1), 0);
    const tax = Number((total * TAX_RATE).toFixed(2));
    const totalWithTax = Number((total + tax).toFixed(2));
    return { total: Number(total.toFixed(2)), tax, totalWithTax };
};

const buildBotCallbackUrl = () => {
    if (!config.qrPublicWebhookUrl) return undefined;
    const sep = config.qrPublicWebhookUrl.includes("?") ? "&" : "?";
    return config.qrWebhookSecret
        ? `${config.qrPublicWebhookUrl}${sep}secret=${encodeURIComponent(config.qrWebhookSecret)}`
        : config.qrPublicWebhookUrl;
};

const executeBotTool = async ({ name, arguments: args }, ctx = {}) => {
    const { phone, customerName: ctxName } = ctx;
    if (!phone) return { ok: false, error: "no_phone" };

    if (name === "place_order") {
        try {
            // 1. Resolver items
            const { resolved, missing } = await resolveItems(args.items);
            if (missing.length) return { ok: false, error: `No reconozco: ${missing.join(", ")}` };
            if (!resolved.length) return { ok: false, error: "Pedido vacío" };

            // 2. Crear pedido
            const bills = computeBills(resolved);
            const order = new Order({
                customerDetails: {
                    name: args.customerName || ctxName || "Cliente WhatsApp",
                    phone: String(phone),
                    guests: 1,
                },
                items: resolved,
                bills,
                orderType: args.orderType === "dine-in" ? "dine-in" : "takeaway",
                orderStatus: "Pending Payment",
                paymentMethod: "Yape",
                paymentStatus: "pending",
            });
            await order.save();

            const shortId = `#${String(order._id).slice(-6).toUpperCase()}`;

            // 3. Generar QR
            const { ok, payment, raw } = await orchestrator.generate({
                amount: Number(bills.totalWithTax),
                description: `Cafeteria 5 — Pedido ${shortId}`,
                expiresIn: 600,
                callbackUrl: buildBotCallbackUrl(),
            });

            if (!ok || !payment) {
                return { ok: false, error: "Servicio de pagos no disponible temporalmente", orderId: order._id };
            }

            // 4. Guardar payment info y enviar aviso ETA
            order.paymentData = {
                qr_payment_id: payment.payment_id,
                qr_code: payment.code,
                qr_provider: payment.provider,
                qr_amount_to_pay: payment.amount_to_pay,
                qr_status: payment.status,
            };
            await order.save();

            wa.sendQrEtaNotice({
                phone,
                etaSeconds: payment.estimated_seconds || 60,
                providerLabel: payment.provider_label,
                amount: payment.amount,
                customerName: order.customerDetails.name,
            }).catch(() => {});

            // 5. Polling para enviar el QR real (en segundo plano o bloqueante segun necesidad)
            // Aquí lo dejamos bloqueante para que el bot confirme el éxito final.
            const ready = await orchestrator.waitForQrReady(payment.payment_id, { maxMs: 120_000 });
            
            if (ready?.qr_payload) {
                await wa.sendYapePaymentQr({
                    phone,
                    qrPayload: ready.qr_payload,
                    amount: ready.amount,
                    paymentId: ready.payment_id,
                    code: ready.code,
                    customerName: order.customerDetails.name,
                    provider: ready.provider,
                    providerLabel: ready.provider_label,
                    validationMethod: ready.validation_method,
                });
            }

            return {
                ok: true,
                shortId,
                total: bills.totalWithTax,
                qrSent: !!ready?.qr_payload,
                paymentId: payment.payment_id
            };
        } catch (err) {
            return { ok: false, error: err.message };
        }
    }

    return { ok: false, error: `Tool desconocida: ${name}` };
};

module.exports = { BOT_TOOLS, executeBotTool };
