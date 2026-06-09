const config = require('../config/config');
const GroqKey = require('../models/groqKeyModel');

const API_BASE = (config.groqApiBaseUrl || 'https://api.groq.com/openai/v1').replace(/\/$/, '');

const htmlToPlain = (html = '') =>
  String(html)
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|h\d|li|ul|ol|blockquote|pre)>/gi, '\n')
    .replace(/<li[^>]*>/gi, '- ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n[ \t]+/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

// ── Key rotation manager ──────────────────────────────────────────────────────
// Caches active DB keys for 60 s; on 429 or error updates the key's status
// so the next request picks a healthier key.
const keyManager = {
  _cache: null,
  _cacheTime: 0,
  CACHE_TTL_MS: 60_000,

  invalidate() { this._cache = null; },

  async _refresh() {
    try {
      const rows = await GroqKey.find({ active: true }).lean();
      this._cache = rows;
      this._cacheTime = Date.now();
    } catch (_) { /* DB not ready — fall through */ }
  },

  // Returns active keys sorted: non-rate-limited first, then lowest usage %.
  async getOrdered() {
    if (!this._cache || Date.now() - this._cacheTime > this.CACHE_TTL_MS) {
      await this._refresh();
    }
    return (this._cache || [])
      .filter(k => k.lastStatus !== 'invalid')
      .sort((a, b) => {
        const aBlocked = a.lastStatus === 'rate_limited' ? 1 : 0;
        const bBlocked = b.lastStatus === 'rate_limited' ? 1 : 0;
        if (aBlocked !== bBlocked) return aBlocked - bBlocked;
        const aR = a.tokenLimit > 0 ? a.tokenUsed / a.tokenLimit : 0;
        const bR = b.tokenLimit > 0 ? b.tokenUsed / b.tokenLimit : 0;
        return aR - bR;
      });
  },

  // Fire-and-forget token accounting after a successful call.
  recordUsage(id, usage) {
    if (!id || !usage) return;
    const total = (usage.prompt_tokens || 0) + (usage.completion_tokens || 0);
    if (!total) return;
    GroqKey.findByIdAndUpdate(id, {
      $inc: { tokenUsed: total, requestCount: 1 },
      $set: { lastUsed: new Date(), lastStatus: 'ok', lastError: null },
    }).catch(() => {});
    this.invalidate();
  },

  async recordError(id, httpStatus) {
    if (!id) return;
    const st = httpStatus === 429 ? 'rate_limited'
      : (httpStatus === 401 || httpStatus === 403) ? 'invalid'
      : 'error';
    try {
      await GroqKey.findByIdAndUpdate(id, {
        $set: { lastStatus: st, lastError: `HTTP ${httpStatus}`, lastUsed: new Date() },
      });
    } catch (_) {}
    this.invalidate();
  },
};

// ── HTTP helpers ──────────────────────────────────────────────────────────────
const checkGroqConnection = async (apiKey) => {
  const key = apiKey || config.groqApiKey;
  if (!key) {
    return { configured: false, reachable: false, ok: false, status: 'not_configured', message: 'GROQ_API_KEY no configurada' };
  }
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 6000);
  try {
    const res = await fetch(`${API_BASE}/models`, {
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      signal: ctrl.signal,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        configured: true, reachable: true, ok: false,
        status: res.status === 401 || res.status === 403 ? 'invalid_key' : 'error',
        httpStatus: res.status,
        error: data?.error?.message || `HTTP ${res.status}`,
        model: config.groqModel,
      };
    }
    const ids = Array.isArray(data?.data) ? data.data.map(m => m.id).filter(Boolean) : [];
    return {
      configured: true, reachable: true, ok: true, status: 'connected',
      model: config.groqModel,
      modelAvailable: ids.length === 0 || ids.includes(config.groqModel),
      availableModels: ids,
    };
  } catch (err) {
    return {
      configured: true, reachable: false, ok: false, status: 'unreachable',
      error: err.name === 'AbortError' ? 'Timeout al contactar Groq API' : err.message,
      model: config.groqModel,
    };
  } finally {
    clearTimeout(t);
  }
};

// Returns httpStatus on HTTP error so callers can detect 429.
const _chatCompletion = async (body, { timeoutMs = 20000, apiKey } = {}) => {
  const key = apiKey || config.groqApiKey;
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(`${API_BASE}/chat/completions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false, httpStatus: res.status, error: data?.error?.message || `HTTP ${res.status}`, raw: data };
    }
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: err.name === 'AbortError' ? 'Timeout esperando a Groq' : err.message };
  } finally {
    clearTimeout(t);
  }
};

// Shorter max_tokens for simple messages saves ~100–250 tokens per request.
const _adaptiveMaxTokens = (lastMsg) => {
  const l = String(lastMsg).length;
  if (l < 40)  return 250;
  if (l < 150) return 400;
  return 500;
};

// Inner loop: runs tool-calling rounds and returns final text.
const _runMessages = async ({ messages, tools, executeTool, maxToolRounds, apiKey }) => {
  const toolEvents = [];
  let lastUsage = null;

  for (let round = 0; round <= maxToolRounds; round += 1) {
    const body = {
      model: config.groqModel,
      messages,
      temperature: 0.6,
      max_tokens: _adaptiveMaxTokens(messages[messages.length - 1]?.content || ''),
    };
    if (tools && executeTool && round < maxToolRounds) {
      body.tools = tools;
      body.tool_choice = 'auto';
    }

    const res = await _chatCompletion(body, { apiKey });
    if (!res.ok) return { ok: false, ...res };

    const data = res.data;
    lastUsage = data?.usage;
    const msg = data?.choices?.[0]?.message || {};
    const toolCalls = Array.isArray(msg.tool_calls) ? msg.tool_calls : [];

    if (toolCalls.length && executeTool) {
      messages.push({ role: 'assistant', content: msg.content || '', tool_calls: toolCalls });
      for (const call of toolCalls) {
        const name = call?.function?.name;
        let args = {};
        try { args = JSON.parse(call?.function?.arguments || '{}'); } catch (_) {}
        let result;
        try { result = await executeTool({ name, arguments: args }); }
        catch (e) { result = { ok: false, error: e.message }; }
        toolEvents.push({ name, arguments: args, result });
        messages.push({ role: 'tool', tool_call_id: call.id, name, content: JSON.stringify(result).slice(0, 3000) });
      }
      continue;
    }

    const text = (msg.content || '').trim();
    if (!text && !toolEvents.length) return { ok: false, error: 'Respuesta vacía de Groq', raw: data };
    return { ok: true, text, raw: data, usage: lastUsage, toolEvents };
  }
  return { ok: false, error: 'Bot agotó el límite de tool rounds sin emitir respuesta', toolEvents };
};

// ── Public API ────────────────────────────────────────────────────────────────
const generateReply = async (userMessage, opts = {}) => {
  if (!userMessage?.trim()) return { ok: false, error: 'Mensaje vacío' };

  const systemText = htmlToPlain(opts.systemPrompt || '');
  const contextText = String(opts.contextBlock || '').trim();
  const history = Array.isArray(opts.history) ? opts.history : [];
  const tools = Array.isArray(opts.tools) && opts.tools.length ? opts.tools : null;
  const executeTool = typeof opts.executeTool === 'function' ? opts.executeTool : null;
  const maxToolRounds = Number(opts.maxToolRounds) > 0 ? Number(opts.maxToolRounds) : 3;

  const buildMessages = () => {
    const msgs = [];
    if (systemText) msgs.push({ role: 'system', content: systemText });
    if (contextText) msgs.push({ role: 'system', content: contextText });
    for (const turn of history) {
      if (!turn?.text) continue;
      msgs.push({ role: turn.role === 'model' || turn.role === 'assistant' ? 'assistant' : 'user', content: String(turn.text) });
    }
    msgs.push({ role: 'user', content: userMessage });
    return msgs;
  };

  // Build candidate list: up to 3 DB keys (ordered) + env key as last resort.
  const dbKeys = await keyManager.getOrdered();
  const candidates = [
    ...dbKeys.slice(0, 3).map(k => ({ apiKey: k.key, id: k._id })),
  ];
  if (config.groqApiKey) candidates.push({ apiKey: config.groqApiKey, id: null });
  if (!candidates.length) return { ok: false, error: 'GROQ_API_KEY no configurada' };

  for (const { apiKey, id } of candidates) {
    const result = await _runMessages({ messages: buildMessages(), tools, executeTool, maxToolRounds, apiKey });
    if (result.httpStatus === 429) {
      await keyManager.recordError(id, 429);
      continue; // try next key
    }
    if (result.ok) keyManager.recordUsage(id, result.usage);
    else if (result.httpStatus) keyManager.recordError(id, result.httpStatus);
    return result;
  }
  return { ok: false, error: 'Todas las API keys de Groq están agotadas o con error' };
};

module.exports = { checkGroqConnection, generateReply, htmlToPlain, keyManager };
