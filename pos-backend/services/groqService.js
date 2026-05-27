const config = require("../config/config");

const API_BASE = (config.groqApiBaseUrl || "https://api.groq.com/openai/v1").replace(/\/$/, "");

const htmlToPlain = (html = "") =>
  String(html)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|h\d|li|ul|ol|blockquote|pre)>/gi, "\n")
    .replace(/<li[^>]*>/gi, "- ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

const authHeader = () => ({
  Authorization: `Bearer ${config.groqApiKey}`,
  "Content-Type": "application/json",
});

const checkGroqConnection = async () => {
  if (!config.groqApiKey) {
    return {
      configured: false,
      reachable: false,
      ok: false,
      status: "not_configured",
      message: "GROQ_API_KEY no está configurada en el backend",
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);

  try {
    const response = await fetch(`${API_BASE}/models`, {
      headers: authHeader(),
      signal: controller.signal,
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        configured: true,
        reachable: true,
        ok: false,
        status:
          response.status === 401 || response.status === 403
            ? "invalid_key"
            : "error",
        httpStatus: response.status,
        error: data?.error?.message || data?.message || `HTTP ${response.status}`,
        model: config.groqModel,
      };
    }

    const ids = Array.isArray(data?.data)
      ? data.data.map((m) => m.id).filter(Boolean)
      : [];
    const modelExists = ids.length === 0 || ids.includes(config.groqModel);

    return {
      configured: true,
      reachable: true,
      ok: true,
      status: "connected",
      model: config.groqModel,
      modelAvailable: modelExists,
      availableModels: ids,
    };
  } catch (err) {
    return {
      configured: true,
      reachable: false,
      ok: false,
      status: "unreachable",
      error: err.name === "AbortError" ? "Timeout al contactar Groq API" : err.message,
      model: config.groqModel,
    };
  } finally {
    clearTimeout(timeout);
  }
};

const chatCompletion = async (body, { timeoutMs = 20000 } = {}) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(`${API_BASE}/chat/completions`, {
      method: "POST",
      headers: authHeader(),
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return {
        ok: false,
        error: data?.error?.message || data?.message || `HTTP ${response.status}`,
        raw: data,
      };
    }
    return { ok: true, data };
  } catch (err) {
    return {
      ok: false,
      error: err.name === "AbortError" ? "Timeout esperando a Groq" : err.message,
    };
  } finally {
    clearTimeout(timeout);
  }
};

/**
 * Genera respuesta vía Groq (OpenAI-compatible chat completions).
 *
 * Soporta function-calling: si pasas opts.tools y opts.executeTool, ejecuta un loop
 * de hasta opts.maxToolRounds rondas en el que el modelo puede llamar tools,
 * recibir el resultado, y producir el mensaje final de texto.
 */
const generateReply = async (userMessage, opts = {}) => {
  if (!config.groqApiKey) return { ok: false, error: "GROQ_API_KEY no configurada" };
  if (!userMessage?.trim()) return { ok: false, error: "Mensaje vacío" };

  const systemText = htmlToPlain(opts.systemPrompt || "");
  const contextText = String(opts.contextBlock || "").trim();
  const history = Array.isArray(opts.history) ? opts.history : [];
  const tools = Array.isArray(opts.tools) && opts.tools.length ? opts.tools : null;
  const executeTool = typeof opts.executeTool === "function" ? opts.executeTool : null;
  const maxToolRounds = Number(opts.maxToolRounds) > 0 ? Number(opts.maxToolRounds) : 3;

  const messages = [];
  if (systemText) messages.push({ role: "system", content: systemText });
  if (contextText) messages.push({ role: "system", content: contextText });
  for (const turn of history) {
    if (!turn?.text) continue;
    const role = turn.role === "model" || turn.role === "assistant" ? "assistant" : "user";
    messages.push({ role, content: String(turn.text) });
  }
  messages.push({ role: "user", content: userMessage });

  const toolEvents = [];

  for (let round = 0; round <= maxToolRounds; round += 1) {
    const body = {
      model: config.groqModel,
      messages,
      temperature: 0.6,
      max_tokens: 600,
    };
    if (tools && executeTool && round < maxToolRounds) {
      body.tools = tools;
      body.tool_choice = "auto";
    }

    const res = await chatCompletion(body);
    if (!res.ok) return { ok: false, error: res.error, raw: res.raw };
    const data = res.data;
    const choice = data?.choices?.[0];
    const msg = choice?.message || {};
    const toolCalls = Array.isArray(msg.tool_calls) ? msg.tool_calls : [];

    if (toolCalls.length && executeTool) {
      // Adjuntamos el assistant turn (con tool_calls) y los tool results
      messages.push({
        role: "assistant",
        content: msg.content || "",
        tool_calls: toolCalls,
      });
      for (const call of toolCalls) {
        const name = call?.function?.name;
        let args = {};
        try { args = JSON.parse(call?.function?.arguments || "{}"); }
        catch (e) { args = { _parseError: e.message, raw: call?.function?.arguments }; }
        let toolResult;
        try {
          toolResult = await executeTool({ name, arguments: args });
        } catch (e) {
          toolResult = { ok: false, error: e.message };
        }
        toolEvents.push({ name, arguments: args, result: toolResult });
        messages.push({
          role: "tool",
          tool_call_id: call.id,
          name,
          content: JSON.stringify(toolResult).slice(0, 3000),
        });
      }
      continue; // siguiente ronda — el modelo lee el resultado y responde
    }

    const text = (msg.content || "").trim();
    if (!text && !toolEvents.length) return { ok: false, error: "Respuesta vacía de Groq", raw: data };
    return { ok: true, text, raw: data, usage: data?.usage, toolEvents };
  }

  return { ok: false, error: "Bot agotó el límite de tool rounds sin emitir respuesta", toolEvents };
};

module.exports = { checkGroqConnection, generateReply, htmlToPlain };
