import React, { useEffect, useRef, useState } from "react";
import {
  FaCircleCheck,
  FaCircleXmark,
  FaArrowRotateRight,
  FaBold,
  FaItalic,
  FaUnderline,
  FaListUl,
  FaListOl,
  FaHeading,
  FaQuoteRight,
  FaCode,
  FaArrowRotateLeft,
  FaPaperPlane,
  FaTrash,
  FaRobot,
  FaUser,
  FaBolt,
} from "react-icons/fa6";
import { enqueueSnackbar } from "notistack";
import {
  getGroqStatus,
  getGroqPrompt,
  saveGroqPrompt,
  resetGroqPrompt,
  chatGroq,
  clearGroqHistory,
} from "../../https";
import { Button } from "../ui";

const STATUS_MAP = {
  connected: {
    color: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
    label: "Conectado",
    Icon: FaCircleCheck,
  },
  not_configured: {
    color: "bg-slate-500/15 text-slate-400 border-slate-500/30",
    label: "Sin API key",
    Icon: FaCircleXmark,
  },
  invalid_key: {
    color: "bg-rose-500/15 text-rose-500 border-rose-500/30",
    label: "API key inválida",
    Icon: FaCircleXmark,
  },
  unreachable: {
    color: "bg-rose-500/15 text-rose-500 border-rose-500/30",
    label: "No alcanzable",
    Icon: FaCircleXmark,
  },
  error: {
    color: "bg-rose-500/15 text-rose-500 border-rose-500/30",
    label: "Error",
    Icon: FaCircleXmark,
  },
};

const StatusBadge = ({ status }) => {
  const entry = STATUS_MAP[status] || STATUS_MAP.error;
  const { color, label, Icon } = entry;
  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border ${color}`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </span>
  );
};

const ToolbarButton = ({ onClick, title, children, active }) => (
  <button
    type="button"
    onMouseDown={(e) => {
      e.preventDefault();
      onClick();
    }}
    title={title}
    className={`p-2 rounded-md text-sm transition-colors ${
      active
        ? "bg-theme-brand text-theme-brand-fg"
        : "text-theme-muted hover:text-theme-text hover:bg-theme-elevated"
    }`}
  >
    {children}
  </button>
);

const newSessionId = () =>
  `s-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const GroqPanel = () => {
  const [status, setStatus] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [prompt, setPrompt] = useState("");
  const [originalPrompt, setOriginalPrompt] = useState("");
  const [enabled, setEnabled] = useState(false);
  const [originalEnabled, setOriginalEnabled] = useState(false);
  const [meta, setMeta] = useState({ updatedAt: null, updatedBy: null });
  const [saving, setSaving] = useState(false);
  const [loadingPrompt, setLoadingPrompt] = useState(true);
  const editorRef = useRef(null);

  const [sessionId, setSessionId] = useState(newSessionId);
  const [chatHistory, setChatHistory] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatSending, setChatSending] = useState(false);
  const chatBoxRef = useRef(null);

  const fetchStatus = async () => {
    setLoadingStatus(true);
    try {
      const { data } = await getGroqStatus();
      setStatus(data);
    } catch (err) {
      setStatus({
        success: false,
        status: "unreachable",
        error: err?.response?.data?.message || err.message,
      });
    } finally {
      setLoadingStatus(false);
    }
  };

  const fetchPrompt = async () => {
    setLoadingPrompt(true);
    try {
      const { data } = await getGroqPrompt();
      setPrompt(data.prompt || "");
      setOriginalPrompt(data.prompt || "");
      setEnabled(!!data.enabled);
      setOriginalEnabled(!!data.enabled);
      setMeta({ updatedAt: data.updatedAt, updatedBy: data.updatedBy });
      if (editorRef.current) editorRef.current.innerHTML = data.prompt || "";
    } catch (err) {
      enqueueSnackbar(
        err?.response?.data?.message || "No se pudo cargar el prompt",
        { variant: "error" }
      );
    } finally {
      setLoadingPrompt(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    fetchPrompt();
    const id = setInterval(fetchStatus, 15000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [chatHistory, chatSending]);

  const exec = (cmd, value = null) => {
    document.execCommand(cmd, false, value);
    if (editorRef.current) setPrompt(editorRef.current.innerHTML);
  };

  const handleInput = () => {
    if (editorRef.current) setPrompt(editorRef.current.innerHTML);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await saveGroqPrompt({ prompt, enabled });
      setOriginalPrompt(data.prompt);
      setOriginalEnabled(!!data.enabled);
      setMeta({ updatedAt: data.updatedAt, updatedBy: data.updatedBy });
      enqueueSnackbar("Configuración guardada", { variant: "success" });
    } catch (err) {
      enqueueSnackbar(
        err?.response?.data?.message || "Error al guardar",
        { variant: "error" }
      );
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm("¿Restaurar el prompt por defecto? Se perderán los cambios actuales.")) return;
    try {
      const { data } = await resetGroqPrompt();
      setPrompt(data.prompt);
      setOriginalPrompt(data.prompt);
      if (editorRef.current) editorRef.current.innerHTML = data.prompt;
      setMeta({ updatedAt: data.updatedAt, updatedBy: null });
      enqueueSnackbar("Prompt restaurado", { variant: "info" });
    } catch (err) {
      enqueueSnackbar(
        err?.response?.data?.message || "Error al restaurar",
        { variant: "error" }
      );
    }
  };

  const handleSendChat = async (e) => {
    e?.preventDefault?.();
    const text = chatInput.trim();
    if (!text || chatSending) return;
    const nextHistory = [...chatHistory, { role: "user", text }];
    setChatHistory(nextHistory);
    setChatInput("");
    setChatSending(true);
    try {
      const { data } = await chatGroq({
        message: text,
        history: chatHistory,
        sessionId,
      });
      setChatHistory((h) => [
        ...h,
        { role: "assistant", text: data.reply, elapsedMs: data.elapsedMs },
      ]);
    } catch (err) {
      setChatHistory((h) => [
        ...h,
        {
          role: "error",
          text:
            err?.response?.data?.error ||
            err?.response?.data?.message ||
            err.message,
        },
      ]);
    } finally {
      setChatSending(false);
    }
  };

  const handleClearChat = async () => {
    try {
      await clearGroqHistory({ sessionId });
    } catch {
      /* noop */
    }
    setChatHistory([]);
    setSessionId(newSessionId());
  };

  const dirty = prompt !== originalPrompt || enabled !== originalEnabled;
  const currentStatus = status?.status || "error";
  const canChat = status?.ok && status?.hasApiKey;

  return (
    <div className="px-4 md:px-8 py-6 space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-orange-500/15 text-orange-500 flex items-center justify-center">
            <FaBolt className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-theme-text">Groq API</h1>
            <p className="text-sm text-theme-muted">
              Inferencia rápida en LPU · chatbot de WhatsApp
            </p>
          </div>
        </div>
        <button
          onClick={fetchStatus}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-theme-surface hover:bg-theme-elevated text-theme-text border border-theme-border"
        >
          <FaArrowRotateRight className={loadingStatus ? "animate-spin" : ""} />
          Refrescar estado
        </button>
      </div>

      {/* Status card */}
      <div className="bg-theme-card border border-theme-border rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-theme-muted">
            Estado de la API
          </h2>
          {loadingStatus && !status ? (
            <span className="text-sm text-theme-muted">Comprobando…</span>
          ) : (
            <StatusBadge status={currentStatus} />
          )}
        </div>

        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="flex justify-between gap-2 p-3 rounded-lg bg-theme-surface">
            <dt className="text-theme-muted">API key configurada</dt>
            <dd className="font-medium text-theme-text">
              {status?.hasApiKey ? "Sí" : "No"}
            </dd>
          </div>
          <div className="flex justify-between gap-2 p-3 rounded-lg bg-theme-surface">
            <dt className="text-theme-muted">Modelo</dt>
            <dd className="font-mono font-medium text-theme-text">
              {status?.configuredModel || "—"}
            </dd>
          </div>
          <div className="flex justify-between gap-2 p-3 rounded-lg bg-theme-surface">
            <dt className="text-theme-muted">Modelo disponible</dt>
            <dd className="font-medium text-theme-text">
              {status?.modelAvailable === false ? (
                <span className="text-amber-500">No</span>
              ) : status?.ok ? (
                "Sí"
              ) : (
                "—"
              )}
            </dd>
          </div>
          <div className="flex justify-between gap-2 p-3 rounded-lg bg-theme-surface">
            <dt className="text-theme-muted">Bot WhatsApp</dt>
            <dd
              className={`font-medium ${
                status?.enabled ? "text-emerald-500" : "text-theme-muted"
              }`}
            >
              {status?.enabled ? "Activo" : "Desactivado"}
            </dd>
          </div>
        </dl>

        {status?.error && (
          <div className="p-3 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-600 text-xs font-mono break-all">
            {status.error}
          </div>
        )}
        {status?.modelAvailable === false && (
          <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-600 text-xs">
            El modelo <code className="font-mono">{status?.configuredModel}</code> no
            aparece en la lista de tu cuenta. Modelos disponibles:{" "}
            <span className="font-mono">
              {status?.availableModels?.slice(0, 8).join(", ") || "—"}
              {status?.availableModels?.length > 8 ? "…" : ""}
            </span>
            . Ajusta <code className="font-mono">GROQ_MODEL</code> en{" "}
            <code className="font-mono">pos-backend/.env</code>.
          </div>
        )}
        {!status?.hasApiKey && (
          <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-600 text-sm">
            Define <code className="font-mono">GROQ_API_KEY</code> en{" "}
            <code className="font-mono">pos-backend/.env</code> y reinicia el
            servidor. Puedes generar una clave en{" "}
            <span className="font-mono">console.groq.com</span>.
          </div>
        )}
      </div>

      {/* Chat playground */}
      <div className="bg-theme-card border border-theme-border rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
              <FaRobot />
            </div>
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-theme-muted">
                Probar chatbot
              </h2>
              <p className="text-xs text-theme-muted mt-0.5">
                Simula una conversación con el prompt guardado.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClearChat}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg bg-theme-surface hover:bg-theme-elevated text-theme-muted border border-theme-border"
          >
            <FaTrash className="w-3 h-3" />
            Limpiar conversación
          </button>
        </div>

        <div
          ref={chatBoxRef}
          className="h-[320px] overflow-y-auto p-3 rounded-lg bg-theme-surface border border-theme-border space-y-3"
        >
          {chatHistory.length === 0 && !chatSending && (
            <div className="h-full flex flex-col items-center justify-center text-center text-sm text-theme-muted py-8">
              <FaRobot className="w-8 h-8 mb-2 opacity-50" />
              <p>Escribe un mensaje para probar el bot.</p>
              <p className="text-xs mt-1">Ej: <em>"Hola, quiero un café"</em></p>
            </div>
          )}
          {chatHistory.map((turn, i) => (
            <div
              key={i}
              className={`flex gap-2 ${
                turn.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {turn.role !== "user" && (
                <div
                  className={`h-7 w-7 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${
                    turn.role === "error"
                      ? "bg-rose-500/15 text-rose-500"
                      : "bg-emerald-500/15 text-emerald-500"
                  }`}
                >
                  <FaRobot />
                </div>
              )}
              <div
                className={`max-w-[75%] px-3 py-2 rounded-lg text-sm whitespace-pre-wrap ${
                  turn.role === "user"
                    ? "bg-theme-brand text-theme-brand-fg rounded-br-sm"
                    : turn.role === "error"
                    ? "bg-rose-500/10 border border-rose-500/30 text-rose-600 rounded-bl-sm"
                    : "bg-theme-elevated text-theme-text rounded-bl-sm"
                }`}
              >
                {turn.text}
                {turn.elapsedMs != null && (
                  <div className="text-[10px] opacity-60 mt-1">
                    {turn.elapsedMs} ms
                  </div>
                )}
              </div>
              {turn.role === "user" && (
                <div className="h-7 w-7 rounded-full bg-theme-elevated text-theme-muted flex items-center justify-center text-xs flex-shrink-0">
                  <FaUser />
                </div>
              )}
            </div>
          ))}
          {chatSending && (
            <div className="flex gap-2 justify-start">
              <div className="h-7 w-7 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center text-xs">
                <FaRobot />
              </div>
              <div className="px-3 py-2 rounded-lg bg-theme-elevated text-theme-muted text-sm italic">
                escribiendo…
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSendChat} className="flex gap-2">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder={
              canChat
                ? "Escribe un mensaje como si fueras el cliente…"
                : "Conecta Groq para poder probar"
            }
            disabled={!canChat || chatSending}
            className="flex-1 px-3 py-2 rounded-lg bg-theme-surface border border-theme-border text-theme-text placeholder:text-theme-muted focus:outline-none focus:ring-2 focus:ring-orange-500/40 disabled:opacity-50"
          />
          <Button
            type="submit"
            disabled={!canChat || chatSending || !chatInput.trim()}
            className="bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-50"
          >
            <FaPaperPlane />
          </Button>
        </form>
        {dirty && (
          <p className="text-xs text-amber-500">
            ⚠ Tienes cambios sin guardar en el prompt — la prueba aún usa el
            prompt guardado anterior.
          </p>
        )}
      </div>

      {/* Prompt editor + activar bot */}
      <div className="bg-theme-card border border-theme-border rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-theme-muted">
              Prompt del chatbot
            </h2>
            <p className="text-xs text-theme-muted mt-1">
              Este texto se enviará como instrucción del sistema a Groq cuando
              responda mensajes de WhatsApp.
            </p>
          </div>
          {meta.updatedAt && (
            <span className="text-xs text-theme-muted">
              Actualizado:{" "}
              {new Date(meta.updatedAt).toLocaleString("es-BO")}
              {meta.updatedBy ? ` · ${meta.updatedBy}` : ""}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1 p-2 rounded-lg bg-theme-surface border border-theme-border">
          <ToolbarButton onClick={() => exec("bold")} title="Negrita">
            <FaBold />
          </ToolbarButton>
          <ToolbarButton onClick={() => exec("italic")} title="Cursiva">
            <FaItalic />
          </ToolbarButton>
          <ToolbarButton onClick={() => exec("underline")} title="Subrayado">
            <FaUnderline />
          </ToolbarButton>
          <div className="w-px h-5 bg-theme-border mx-1" />
          <ToolbarButton onClick={() => exec("formatBlock", "<h2>")} title="Título 2">
            <FaHeading />
          </ToolbarButton>
          <ToolbarButton onClick={() => exec("formatBlock", "<h3>")} title="Título 3">
            <span className="text-xs font-bold">H3</span>
          </ToolbarButton>
          <ToolbarButton onClick={() => exec("formatBlock", "<p>")} title="Párrafo">
            <span className="text-xs font-bold">P</span>
          </ToolbarButton>
          <div className="w-px h-5 bg-theme-border mx-1" />
          <ToolbarButton onClick={() => exec("insertUnorderedList")} title="Lista">
            <FaListUl />
          </ToolbarButton>
          <ToolbarButton onClick={() => exec("insertOrderedList")} title="Lista numerada">
            <FaListOl />
          </ToolbarButton>
          <ToolbarButton onClick={() => exec("formatBlock", "<blockquote>")} title="Cita">
            <FaQuoteRight />
          </ToolbarButton>
          <ToolbarButton onClick={() => exec("formatBlock", "<pre>")} title="Código">
            <FaCode />
          </ToolbarButton>
          <div className="w-px h-5 bg-theme-border mx-1" />
          <ToolbarButton onClick={() => exec("undo")} title="Deshacer">
            <FaArrowRotateLeft />
          </ToolbarButton>
          <ToolbarButton onClick={() => exec("redo")} title="Rehacer">
            <FaArrowRotateRight />
          </ToolbarButton>
        </div>

        {loadingPrompt ? (
          <div className="p-6 text-center text-sm text-theme-muted">Cargando prompt…</div>
        ) : (
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleInput}
            className="groq-editor min-h-[260px] max-h-[50vh] overflow-y-auto p-4 rounded-lg bg-theme-surface border border-theme-border text-theme-text focus:outline-none focus:ring-2 focus:ring-orange-500/40"
          />
        )}

        <label className="flex items-center justify-between gap-3 p-3 rounded-lg bg-theme-surface border border-theme-border cursor-pointer">
          <div>
            <div className="text-sm font-medium text-theme-text">
              Activar bot en WhatsApp
            </div>
            <div className="text-xs text-theme-muted">
              Si está activo, los mensajes entrantes de WhatsApp se responderán
              automáticamente con Groq.
            </div>
          </div>
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            className="h-5 w-5 accent-emerald-500"
          />
        </label>

        <div className="flex items-center justify-between flex-wrap gap-3 pt-2">
          <div className="text-xs text-theme-muted">
            {prompt.replace(/<[^>]*>/g, "").length} caracteres ·{" "}
            {dirty ? (
              <span className="text-amber-500 font-medium">Cambios sin guardar</span>
            ) : (
              <span className="text-emerald-500">Guardado</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-2 text-sm rounded-lg bg-theme-surface hover:bg-theme-elevated text-theme-text border border-theme-border"
            >
              Restaurar por defecto
            </button>
            <Button
              type="button"
              disabled={saving || !dirty}
              onClick={handleSave}
              className="bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-50"
            >
              {saving ? "Guardando…" : "Guardar"}
            </Button>
          </div>
        </div>
      </div>

      <style>{`
        .groq-editor h2 { font-size: 1.25rem; font-weight: 700; margin: 0.75rem 0 0.5rem; }
        .groq-editor h3 { font-size: 1.05rem; font-weight: 600; margin: 0.6rem 0 0.4rem; }
        .groq-editor p  { margin: 0.4rem 0; line-height: 1.55; }
        .groq-editor ul { list-style: disc; padding-left: 1.5rem; margin: 0.4rem 0; }
        .groq-editor ol { list-style: decimal; padding-left: 1.5rem; margin: 0.4rem 0; }
        .groq-editor li { margin: 0.2rem 0; }
        .groq-editor blockquote {
          border-left: 3px solid var(--theme-brand, #d97706);
          padding-left: 0.75rem;
          color: var(--theme-muted, #a8a29e);
          margin: 0.5rem 0;
        }
        .groq-editor pre {
          background: rgba(0,0,0,0.25);
          padding: 0.6rem 0.8rem;
          border-radius: 0.4rem;
          font-family: ui-monospace, monospace;
          font-size: 0.85rem;
          white-space: pre-wrap;
        }
        .groq-editor strong { font-weight: 700; }
        .groq-editor em { font-style: italic; }
      `}</style>
    </div>
  );
};

export default GroqPanel;
