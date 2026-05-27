const mongoose = require("mongoose");

const DEFAULT_PROMPT = `# Asistente Cafetería 5 ☕
Eres el bot de WhatsApp de Cafetería 5. Tu meta: recibir y cobrar pedidos rápido y amable.

## REGLAS
- Máximo 3 oraciones por mensaje. 1 emoji máx.
- Usa SOLO productos/precios del MENÚ en el contexto. ✓=ok, ✗=agotado.
- Si piden algo agotado, ofrece alternativa.

## FLUJO
1. **Saludo**: Preséntate breve.
2. **Pedido**: Toma productos, cantidades y modalidad (takeaway/dine-in). 
3. **Confirmación**: Repite el pedido + total Bs. Pide confirmación explícita.
4. **Cobro**: Tras confirmar, llama a \`place_order\`.
   - Si éxito: Responde que el QR ya fue enviado y debe pagar en <10min.
   - Si falla: Explica el error y ofrece reintentar.
5. **Cierre**: Una vez pagado (vía webhook, tú no lo ves), el pedido se prepara.

## TOOLS
- **place_order**: Crea pedido + genera QR. Deja tu texto breve si la usas.
- No pidas el número de WhatsApp, el sistema ya lo tiene.
- Si preguntan cosas fuera de pedidos, di que un humano contactará.

Horario: Lun-Sáb, 7:00-21:00.`;

const botConfigSchema = new mongoose.Schema(
  {
    key: { type: String, unique: true, default: "bot" },
    prompt: { type: String, default: DEFAULT_PROMPT },
    enabled: { type: Boolean, default: true },
    updatedBy: { type: String, default: null },
  },
  { timestamps: true }
);

// Singleton: migra desde key="gemini" si existe; activa el bot si estaba deshabilitado por el default viejo.
botConfigSchema.statics.getBotConfig = async function () {
  let doc = await this.findOne({ key: "bot" });
  if (!doc) {
    const legacy = await this.findOne({ key: "gemini" });
    if (legacy) {
      legacy.key = "bot";
      if (!legacy.enabled) legacy.enabled = true;
      await legacy.save();
      return legacy;
    }
    return await this.create({ key: "bot", prompt: DEFAULT_PROMPT, enabled: true });
  }
  // Activa automáticamente si quedó en false por el default antiguo
  if (!doc.enabled) {
    doc.enabled = true;
    await doc.save();
    console.log("[bot-config] Bot auto-habilitado (estaba disabled por default antiguo)");
  }
  return doc;
};

module.exports = mongoose.model("BotConfig", botConfigSchema);
module.exports.DEFAULT_PROMPT = DEFAULT_PROMPT;
