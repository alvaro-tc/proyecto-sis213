const { WebSocketServer, WebSocket } = require("ws");
const jwt = require("jsonwebtoken");
const config = require("../config/config");

let wss = null;
const adminClients = new Set();

// Parse cookie string into key→value map
const parseCookies = (cookieHeader = "") =>
    Object.fromEntries(
        cookieHeader.split(";").map((c) => {
            const [k, ...v] = c.trim().split("=");
            return [k.trim(), decodeURIComponent(v.join("="))];
        })
    );

const init = (httpServer) => {
    wss = new WebSocketServer({ server: httpServer, path: "/ws/admin" });

    wss.on("connection", (ws, req) => {
        try {
            const cookies = parseCookies(req.headers.cookie || "");
            const token = cookies.accessToken;
            if (!token) return ws.terminate();

            const decoded = jwt.verify(token, config.accessTokenSecret);
            if (decoded?.role?.toLowerCase() !== "admin") return ws.terminate();

            adminClients.add(ws);
            ws.send(JSON.stringify({ type: "auth:ok" }));

            ws.on("close", () => adminClients.delete(ws));
            ws.on("error", () => adminClients.delete(ws));
        } catch {
            ws.terminate();
        }
    });

    console.log("☑️  WebSocket admin server listo en /ws/admin");
};

const broadcast = (event) => {
    if (!adminClients.size) return;
    const data = JSON.stringify(event);
    for (const ws of adminClients) {
        if (ws.readyState === WebSocket.OPEN) ws.send(data);
    }
};

module.exports = { init, broadcast };
