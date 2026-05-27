const http = require("http");
const express = require("express");
const connectDB = require("./config/database");
const config = require("./config/config");
const globalErrorHandler = require("./middlewares/globalErrorHandler");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

const PORT = config.port;
connectDB();

// Middlewares
app.use(cors({
    credentials: true,
    origin: ['http://localhost:5173']
}));
app.use(express.json());
app.use(cookieParser());

// Root Endpoint
app.get("/", (req, res) => {
    res.json({ message: "Hello from POS Server!" });
});

// Other Endpoints
app.use("/api/user", require("./routes/userRoute"));
app.use("/api/order", require("./routes/orderRoute"));
app.use("/api/table", require("./routes/tableRoute"));
app.use("/api/payment", require("./routes/paymentRoute"));
app.use("/api/category", require("./routes/categoryRoute"));
app.use("/api/dish", require("./routes/dishRoute"));
app.use("/api/metric", require("./routes/metricRoute"));
app.use("/api/insumo", require("./routes/insumoRoute"));
app.use("/api/whatsapp", require("./routes/whatsappRoute"));
app.use("/api/groq", require("./routes/groqRoute"));

// Global Error Handler
app.use(globalErrorHandler);

// Server
server.listen(PORT, async () => {
    console.log(`☑️  POS Server is listening on port ${PORT}`);

    // WebSocket admin server (live chat log + events)
    const wsServer = require("./services/wsServer");
    wsServer.init(server);

    // Inicializa el subsistema WhatsApp
    try {
        const wa = require("./services/whatsapp");
        const { processIncomingMessage } = require("./controllers/groqController");
        await wa.init((payload) =>
            processIncomingMessage(payload).catch((e) =>
                console.warn("[wa] handler error:", e.message)
            )
        );
        console.log("☑️  WhatsApp provider iniciado");
    } catch (err) {
        console.error("✖  Error iniciando WhatsApp provider:", err.message);
    }

    // Inicializa el watcher de pagos QR (orquestador api_generador_qr).
    // Hace polling como respaldo cuando los webhooks no llegan.
    try {
        const qrWatcher = require("./services/qrWatcherService");
        qrWatcher.start(5000);
        console.log("☑️  QR watcher iniciado");
    } catch (err) {
        console.error("✖  Error iniciando QR watcher:", err.message);
    }
});
