import React, { useEffect, useRef, useState } from "react";
import {
  FaWhatsapp,
  FaCircleCheck,
  FaCircleXmark,
  FaQrcode,
  FaArrowRotateRight,
  FaRightFromBracket,
  FaTrash,
  FaShieldHalved,
  FaCloudArrowUp,
  FaMobileScreen,
  FaCircle,
  FaCopy,
  FaCheck,
} from "react-icons/fa6";
import {
  getWhatsappStatus,
  sendWhatsappTest,
  whatsappLogout,
  whatsappReset,
  whatsappSwitchProvider,
  getWhatsappDiag,
} from "../../https";
import { Button } from "../ui";

// ── helpers ──────────────────────────────────────────────────────────────────

const StatusBadge = ({ status }) => {
  const map = {
    connected:       { color: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30", label: "Conectado",           Icon: FaCircleCheck },
    qr:              { color: "bg-amber-500/15 text-amber-500 border-amber-500/30",       label: "Esperando QR",        Icon: FaQrcode },
    connecting:      { color: "bg-sky-500/15 text-sky-500 border-sky-500/30",             label: "Conectando…",         Icon: FaArrowRotateRight },
    disconnected:    { color: "bg-rose-500/15 text-rose-500 border-rose-500/30",          label: "Desconectado",        Icon: FaCircleXmark },
    unreachable:     { color: "bg-rose-500/15 text-rose-500 border-rose-500/30",          label: "Backend inaccesible", Icon: FaCircleXmark },
    not_initialized: { color: "bg-slate-500/15 text-slate-400 border-slate-500/30",       label: "No iniciado",         Icon: FaCircleXmark },
    not_configured:  { color: "bg-slate-500/15 text-slate-400 border-slate-500/30",       label: "No configurado",      Icon: FaCircleXmark },
  };
  const entry = map[status] || map.disconnected;
  const { color, label, Icon } = entry;
  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border ${color}`}>
      <Icon className="w-4 h-4" />
      {label}
    </span>
  );
};

const WsStatusDot = ({ wsState }) => {
  const map = {
    connecting: "bg-amber-400 animate-pulse",
    open:       "bg-emerald-400",
    closed:     "bg-rose-400",
    error:      "bg-rose-400",
  };
  const label = { connecting: "WS conectando…", open: "WS en vivo", closed: "WS desconectado", error: "WS error" };
  const cls = map[wsState] || "bg-slate-400";
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-theme-muted">
      <span className={`w-2 h-2 rounded-full ${cls}`} />
      {label[wsState] || wsState}
    </span>
  );
};

const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button onClick={copy} className="ml-2 text-theme-muted hover:text-theme-text transition-colors" title="Copiar">
      {copied ? <FaCheck className="w-3 h-3 text-emerald-500" /> : <FaCopy className="w-3 h-3" />}
    </button>
  );
};

const formatTime = (iso) => {
  if (!iso) return "";
  try { return new Date(iso).toLocaleTimeString("es-BO", { hour: "2-digit", minute: "2-digit", second: "2-digit" }); }
  catch { return ""; }
};

// ── component ─────────────────────────────────────────────────────────────────

const WhatsappPanel = () => {
  const [status, setStatus]           = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [phone, setPhone]             = useState("");
  const [message, setMessage]         = useState("");
  const [sending, setSending]         = useState(false);
  const [result, setResult]           = useState(null);
  const [loggingOut, setLoggingOut]   = useState(false);
  const [resetting, setResetting]     = useState(false);
  const [switching, setSwitching]     = useState(false);
  const [diag, setDiag]               = useState(null);
  const [loadingDiag, setLoadingDiag] = useState(false);

  // WebSocket live chat log
  const [chatLog, setChatLog]   = useState([]);
  const [wsState, setWsState]   = useState("closed");
  const wsRef                   = useRef(null);
  const logEndRef               = useRef(null);

  const fetchStatus = async () => {
    setLoadingStatus(true);
    try {
      const { data } = await getWhatsappStatus();
      setStatus(data);
    } catch (err) {
      setStatus({ success: false, status: "unreachable", error: err?.response?.data?.message || err.message });
    } finally {
      setLoadingStatus(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = status?.status === "qr" ? 4000 : 10000;
    const id = setInterval(fetchStatus, interval);
    return () => clearInterval(id);
  }, [status?.status]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── WebSocket connection ──────────────────────────────────────────────────
  const reconnectDelay = useRef(2000);
  const reconnectTimer = useRef(null);
  const unmountedRef   = useRef(false);

  useEffect(() => {
    unmountedRef.current = false;
    // Usa wss:// cuando la página está en HTTPS, y pasa por nginx (sin puerto)
    const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${wsProtocol}//${window.location.host}/ws/admin`;

    const connect = () => {
      if (unmountedRef.current) return;
      let ws;
      try {
        ws = new WebSocket(wsUrl);
      } catch {
        setWsState("error");
        return;
      }
      wsRef.current = ws;
      setWsState("connecting");

      ws.onopen = () => {
        reconnectDelay.current = 2000; // reset backoff al conectar
      };

      ws.onmessage = (evt) => {
        try {
          const event = JSON.parse(evt.data);
          if (event.type === "auth:ok") { setWsState("open"); return; }
          if (event.type === "wa:incoming" || event.type === "wa:reply") {
            setChatLog((prev) => [...prev.slice(-99), event]);
          }
        } catch (_) {}
      };

      ws.onclose = () => {
        setWsState("closed");
        if (unmountedRef.current) return;
        // Backoff exponencial: 2s → 4s → 8s → … máx 30s
        reconnectTimer.current = setTimeout(() => {
          reconnectDelay.current = Math.min(reconnectDelay.current * 2, 30000);
          connect();
        }, reconnectDelay.current);
      };

      ws.onerror = () => {
        setWsState("error");
        ws.close();
      };
    };

    connect();
    return () => {
      unmountedRef.current = true;
      clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, []);

  // Auto-scroll chat log
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatLog]);

  // ── handlers ─────────────────────────────────────────────────────────────
  const handleSend = async (e) => {
    e.preventDefault();
    if (!phone.trim()) return;
    setSending(true);
    setResult(null);
    try {
      const { data } = await sendWhatsappTest({ to: phone.trim(), message: message.trim() });
      setResult({ ok: true, ...data });
    } catch (err) {
      setResult({
        ok: false,
        error: err?.response?.data?.error || err?.response?.data?.message || err.message,
        normalizedPhone: err?.response?.data?.normalizedPhone,
      });
    } finally {
      setSending(false);
    }
  };

  const handleLogout = async () => {
    if (!window.confirm("¿Cerrar la sesión de WhatsApp? Necesitarás escanear el QR otra vez.")) return;
    setLoggingOut(true);
    try {
      await whatsappLogout();
      setTimeout(fetchStatus, 1500);
    } catch (err) {
      alert(err?.response?.data?.error || err.message);
    } finally {
      setLoggingOut(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm(
      "Borrará las credenciales guardadas y reiniciará la sesión desde cero. ¿Continuar?"
    )) return;
    setResetting(true);
    setStatus((s) => ({ ...s, status: "connecting" }));
    try {
      await whatsappReset();
      setTimeout(fetchStatus, 2500);
    } catch (err) {
      alert(err?.response?.data?.error || err.message);
    } finally {
      setResetting(false);
    }
  };

  const handleDiag = async () => {
    setLoadingDiag(true);
    try {
      const { data } = await getWhatsappDiag("***REMOVED***");
      setDiag(data);
    } catch (err) {
      setDiag({ error: err?.response?.data?.error || err.message });
    } finally {
      setLoadingDiag(false);
    }
  };

  const handleSwitchProvider = async (target) => {
    const label = target === "meta" ? "Meta Cloud API" : "WhatsApp Web (Baileys)";
    if (!window.confirm(`¿Cambiar el provider a ${label}? El servicio se reiniciará brevemente.`)) return;
    setSwitching(true);
    try {
      await whatsappSwitchProvider(target);
      setTimeout(fetchStatus, 2000);
    } catch (err) {
      alert(err?.response?.data?.error || err.message);
    } finally {
      setSwitching(false);
    }
  };

  // ── derived state ─────────────────────────────────────────────────────────
  const connected      = status?.status === "connected";
  const prefix         = status?.defaultPrefix || "591";
  const currentProvider = status?.currentProvider || status?.provider || "baileys";
  const isMeta         = currentProvider === "meta";

  const webhookUrl = `${window.location.protocol}//${window.location.host}/api/whatsapp/webhook/meta`;
  const verifyToken = status?.meta?.verifyToken || "—";
  const metaPhoneNumberId = status?.meta?.phoneNumberId || "";
  const metaHasToken = status?.meta?.hasAccessToken || false;

  return (
    <div className="px-4 md:px-8 py-6 space-y-6">

      {/* ── Header ── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
            <FaWhatsapp className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-theme-text">WhatsApp</h1>
            <p className="text-sm text-theme-muted">
              Provider activo:{" "}
              <span className="font-medium text-theme-text">
                {isMeta ? "Meta Cloud API" : "WhatsApp Web (Baileys)"}
              </span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={fetchStatus}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-theme-surface hover:bg-theme-elevated text-theme-text border border-theme-border"
          >
            <FaArrowRotateRight className={loadingStatus ? "animate-spin" : ""} />
            Refrescar
          </button>
          {connected && !isMeta && (
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/30 disabled:opacity-50"
            >
              <FaRightFromBracket />
              {loggingOut ? "Cerrando…" : "Cerrar sesión"}
            </button>
          )}
          {!isMeta && (
            <button
              onClick={handleReset}
              disabled={resetting}
              title="Borra credenciales de Baileys y regenera el QR."
              className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 border border-amber-500/30 disabled:opacity-50"
            >
              <FaTrash />
              {resetting ? "Reiniciando…" : "Borrar credenciales"}
            </button>
          )}
        </div>
      </div>

      {/* ── Provider selector ── */}
      <div className="bg-theme-card border border-theme-border rounded-xl p-5 space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-theme-muted">Seleccionar provider</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Baileys */}
          <button
            onClick={() => !isMeta || handleSwitchProvider("baileys")}
            disabled={switching || !isMeta}
            className={`flex items-start gap-3 p-4 rounded-xl border text-left transition-all ${
              !isMeta
                ? "border-emerald-500/50 bg-emerald-500/8 ring-1 ring-emerald-500/30"
                : "border-theme-border bg-theme-surface hover:bg-theme-elevated"
            } disabled:cursor-default`}
          >
            <FaMobileScreen className={`w-5 h-5 mt-0.5 ${!isMeta ? "text-emerald-500" : "text-theme-muted"}`} />
            <div>
              <div className={`font-medium text-sm ${!isMeta ? "text-emerald-500" : "text-theme-text"}`}>
                WhatsApp Web (Baileys)
              </div>
              <div className="text-xs text-theme-muted mt-0.5">
                Gratis · escanea QR desde tu teléfono · anti-baneo integrado
              </div>
              {!isMeta && (
                <span className="inline-block mt-1.5 text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  Activo
                </span>
              )}
            </div>
          </button>

          {/* Meta Cloud API */}
          <button
            onClick={() => isMeta || handleSwitchProvider("meta")}
            disabled={switching || isMeta}
            className={`flex items-start gap-3 p-4 rounded-xl border text-left transition-all ${
              isMeta
                ? "border-blue-500/50 bg-blue-500/8 ring-1 ring-blue-500/30"
                : "border-theme-border bg-theme-surface hover:bg-theme-elevated"
            } disabled:cursor-default`}
          >
            <FaCloudArrowUp className={`w-5 h-5 mt-0.5 ${isMeta ? "text-blue-400" : "text-theme-muted"}`} />
            <div>
              <div className={`font-medium text-sm ${isMeta ? "text-blue-400" : "text-theme-text"}`}>
                Meta Cloud API (oficial)
              </div>
              <div className="text-xs text-theme-muted mt-0.5">
                API key de Meta · webhook HTTPS · sin QR · sin riesgo de baneo
              </div>
              {isMeta && (
                <span className="inline-block mt-1.5 text-xs font-medium text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">
                  Activo
                </span>
              )}
            </div>
          </button>
        </div>
        {switching && (
          <p className="text-xs text-theme-muted animate-pulse">Cambiando provider…</p>
        )}
      </div>

      {/* ── Estado ── */}
      <div className="bg-theme-card border border-theme-border rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-theme-muted">Estado de conexión</h2>
          {loadingStatus && !status ? (
            <span className="text-sm text-theme-muted">Comprobando…</span>
          ) : (
            <StatusBadge status={status?.status || (status?.reachable === false ? "unreachable" : "disconnected")} />
          )}
        </div>

        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="flex justify-between gap-2 p-3 rounded-lg bg-theme-surface">
            <dt className="text-theme-muted">Prefijo por defecto</dt>
            <dd className="font-mono font-medium text-theme-text">+{prefix}</dd>
          </div>
          <div className="flex justify-between gap-2 p-3 rounded-lg bg-theme-surface">
            <dt className="text-theme-muted">Conectado desde</dt>
            <dd className="font-medium text-theme-text">
              {status?.connectedAt ? new Date(status.connectedAt).toLocaleString("es-BO") : "—"}
            </dd>
          </div>
          {status?.reconnectAttempts > 0 && (
            <div className="flex justify-between gap-2 p-3 rounded-lg bg-theme-surface sm:col-span-2">
              <dt className="text-theme-muted">Intentos de reconexión</dt>
              <dd className="font-medium text-theme-text">{status.reconnectAttempts}</dd>
            </div>
          )}
        </dl>

        {/* QR — sólo Baileys */}
        {!isMeta && status?.status === "qr" && status?.qrDataUrl && (
          <div className="flex flex-col items-center gap-3 p-5 rounded-lg border border-amber-500/30 bg-amber-500/5">
            <p className="text-sm text-theme-text text-center">
              Escanea con WhatsApp → <strong>Dispositivos vinculados</strong> → <strong>Vincular un dispositivo</strong>
            </p>
            <img src={status.qrDataUrl} alt="QR de WhatsApp" className="w-64 h-64 bg-white p-3 rounded-xl shadow-lg" />
            <p className="text-xs text-theme-muted">El código se refresca automáticamente cada pocos segundos.</p>
          </div>
        )}
        {!isMeta && status?.status === "qr" && !status?.qrDataUrl && (
          <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-600 text-sm">
            Generando QR…
          </div>
        )}

        {/* Info Meta */}
        {isMeta && (
          <div className="space-y-3 text-sm">
            {/* Estado de credenciales */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-theme-surface flex items-center justify-between gap-2">
                <span className="text-theme-muted">Phone Number ID</span>
                <span className={`text-xs font-mono font-medium ${metaPhoneNumberId ? "text-emerald-500" : "text-rose-500"}`}>
                  {metaPhoneNumberId || "⚠ no configurado"}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-theme-surface flex items-center justify-between gap-2">
                <span className="text-theme-muted">Access Token</span>
                <span className={`text-xs font-medium ${metaHasToken ? "text-emerald-500" : "text-rose-500"}`}>
                  {metaHasToken ? "✓ configurado" : "⚠ no configurado"}
                </span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-theme-surface space-y-2">
              <p className="text-theme-muted font-medium">Webhook URL (registrar en Meta Developers)</p>
              <div className="flex items-center gap-1 font-mono text-xs text-theme-text break-all">
                {webhookUrl}
                <CopyButton text={webhookUrl} />
              </div>
            </div>
            <div className="p-3 rounded-lg bg-theme-surface space-y-2">
              <p className="text-theme-muted font-medium">Verify Token (META_VERIFY_TOKEN en .env)</p>
              <div className="flex items-center gap-1 font-mono text-xs text-theme-text">
                {verifyToken}
                {verifyToken !== "—" && <CopyButton text={verifyToken} />}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20 text-xs text-blue-400 space-y-1">
              <p className="font-medium">Pasos para activar Meta Cloud API:</p>
              <ol className="list-decimal pl-4 space-y-1 text-theme-muted">
                <li>Ve a <strong>developers.facebook.com</strong> → tu app → WhatsApp → Configuración API.</li>
                <li>Copia el <strong>Phone Number ID</strong> y pégalo en <code>META_PHONE_NUMBER_ID</code> del .env.</li>
                <li>El <strong>Access Token</strong> ya está configurado ✓.</li>
                <li>En <strong>Webhooks</strong>, registra la URL y el Verify Token de arriba.</li>
                <li>Suscribe al campo <code>messages</code>.</li>
                <li>Reinicia el backend con <code>WA_PROVIDER=meta</code> en el .env.</li>
              </ol>
            </div>
          </div>
        )}

        {status?.lastError && (
          <div className="p-3 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-600 text-xs font-mono break-all">
            {status.lastError}
          </div>
        )}
        {status?.error && (
          <div className="p-3 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-600 text-xs font-mono break-all">
            {status.error}
          </div>
        )}
      </div>

      {/* ── Anti-baneo (sólo Baileys) ── */}
      {!isMeta && (
        <div className="bg-theme-card border border-theme-border rounded-xl p-5 space-y-4 text-sm">
          <div className="flex items-center gap-2">
            <FaShieldHalved className="text-emerald-500" />
            <h2 className="text-sm font-semibold uppercase tracking-wide text-theme-muted">Anti-baneo · estado en vivo</h2>
          </div>
          {status?.antiBan ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-theme-surface">
                <div className="text-xs text-theme-muted">Hoy (global)</div>
                <div className="text-base font-semibold text-theme-text">
                  {status.antiBan.globalSentToday} / {status.antiBan.globalCapDaily}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-theme-surface">
                <div className="text-xs text-theme-muted">Último minuto</div>
                <div className="text-base font-semibold text-theme-text">
                  {status.antiBan.globalSentLastMinute} / {status.antiBan.globalCapPerMinute}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-theme-surface">
                <div className="text-xs text-theme-muted">Tope / contacto / día</div>
                <div className="text-base font-semibold text-theme-text">{status.antiBan.perJidCapDaily}</div>
              </div>
              <div className="p-3 rounded-lg bg-theme-surface">
                <div className="text-xs text-theme-muted">Chats activos</div>
                <div className="text-base font-semibold text-theme-text">{status.antiBan.activeChats}</div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-theme-muted">Esperando datos del provider…</p>
          )}
          <ul className="text-theme-muted list-disc pl-5 space-y-1 text-xs">
            <li>No aparece "en línea" 24/7 — el indicador #1 de bots eliminado.</li>
            <li>Delay aleatorio proporcional al texto + "escribiendo…" + marca como leído.</li>
            <li>Cola por chat: no se solapan respuestas al mismo contacto.</li>
            <li>Rate limits en cascada (global y por contacto, por minuto y por día).</li>
            <li>Mensajes mayores a 120 s se ignoran al reconectar.</li>
            <li>Backoff exponencial al reconectar.</li>
          </ul>
        </div>
      )}

      {/* ── Diagnóstico rápido ── */}
      <div className="bg-theme-card border border-theme-border rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-theme-muted">Diagnóstico del sistema</h2>
          <button
            onClick={handleDiag}
            disabled={loadingDiag}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg bg-theme-surface hover:bg-theme-elevated border border-theme-border text-theme-text disabled:opacity-50"
          >
            <FaArrowRotateRight className={loadingDiag ? "animate-spin" : ""} />
            {loadingDiag ? "Verificando…" : "Verificar ahora"}
          </button>
        </div>

        {!diag && !loadingDiag && (
          <p className="text-xs text-theme-muted">Haz clic en "Verificar ahora" para ver el estado completo del sistema.</p>
        )}

        {diag && !diag.error && (
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {/* Bot */}
              <div className={`p-3 rounded-lg border ${diag.bot?.enabled ? "border-emerald-500/30 bg-emerald-500/8" : "border-rose-500/30 bg-rose-500/8"}`}>
                <div className="font-semibold mb-1 text-theme-muted">Bot IA</div>
                <div className={diag.bot?.enabled ? "text-emerald-500" : "text-rose-500"}>
                  {diag.bot?.enabled ? "✓ Habilitado" : "✗ Deshabilitado"}
                </div>
              </div>
              {/* WhatsApp */}
              <div className={`p-3 rounded-lg border ${diag.whatsapp?.status === "connected" ? "border-emerald-500/30 bg-emerald-500/8" : "border-amber-500/30 bg-amber-500/8"}`}>
                <div className="font-semibold mb-1 text-theme-muted">WhatsApp</div>
                <div className={diag.whatsapp?.status === "connected" ? "text-emerald-500" : "text-amber-500"}>
                  {diag.whatsapp?.status} · {diag.whatsapp?.provider}
                </div>
              </div>
              {/* Groq */}
              <div className={`p-3 rounded-lg border ${diag.groq?.ok ? "border-emerald-500/30 bg-emerald-500/8" : "border-rose-500/30 bg-rose-500/8"}`}>
                <div className="font-semibold mb-1 text-theme-muted">Groq IA</div>
                <div className={diag.groq?.ok ? "text-emerald-500" : "text-rose-500"}>
                  {diag.groq?.ok ? `✓ ${diag.groq.model}` : `✗ ${diag.groq?.error || "error"}`}
                </div>
              </div>
            </div>

            {/* Eventos recientes */}
            {diag.recentEvents?.length > 0 && (
              <div className="space-y-1">
                <div className="text-theme-muted font-semibold">Últimos eventos recibidos:</div>
                <div className="max-h-40 overflow-y-auto space-y-1 font-mono">
                  {diag.recentEvents.map((ev, i) => (
                    <div key={i} className={`flex gap-2 p-1.5 rounded text-xs ${
                      ev.type === "error" ? "bg-rose-500/10 text-rose-500" :
                      ev.type === "incoming" ? "bg-emerald-500/10 text-emerald-600" :
                      ev.type === "reply" ? "bg-blue-500/10 text-blue-500" :
                      ev.type === "skipped" ? "bg-amber-500/10 text-amber-600" :
                      "bg-theme-surface text-theme-muted"
                    }`}>
                      <span className="opacity-60 shrink-0">{formatTime(ev.ts)}</span>
                      <span className="shrink-0 font-bold">[{ev.type}]</span>
                      <span className="break-all">
                        {ev.type === "incoming" && `de ${ev.from}${ev.name ? ` (${ev.name})` : ""}: ${ev.message}`}
                        {ev.type === "reply" && `→ ${ev.to}: ${ev.reply}`}
                        {ev.type === "error" && `${ev.stage}: ${ev.error}`}
                        {ev.type === "skipped" && `${ev.from}: ${ev.reason}`}
                        {ev.type === "webhook_received" && `payload Meta — mensajes: ${ev.hasMessages ? "sí" : "no"}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {diag.recentEvents?.length === 0 && (
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-600">
                No se han recibido webhooks aún. Verifica que Meta tenga el webhook configurado y suscrito al campo <strong>messages</strong>.
              </div>
            )}
          </div>
        )}

        {diag?.error && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-600 text-xs font-mono">
            {diag.error}
          </div>
        )}
      </div>

      {/* ── Chat en vivo (WebSocket) ── */}
      <div className="bg-theme-card border border-theme-border rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-theme-muted">Chat en vivo · Groq IA</h2>
          <div className="flex items-center gap-3">
            <WsStatusDot wsState={wsState} />
            {chatLog.length > 0 && (
              <button
                onClick={() => setChatLog([])}
                className="text-xs text-theme-muted hover:text-theme-text"
              >
                Limpiar
              </button>
            )}
          </div>
        </div>

        <div className="h-72 overflow-y-auto rounded-lg bg-theme-surface p-3 space-y-2 text-xs font-mono">
          {chatLog.length === 0 ? (
            <p className="text-theme-muted text-center pt-24">
              {wsState === "open"
                ? "Esperando mensajes entrantes…"
                : "Conectando al servidor…"}
            </p>
          ) : (
            chatLog.map((ev, i) => (
              <div
                key={i}
                className={`flex flex-col gap-0.5 p-2 rounded-lg ${
                  ev.type === "wa:incoming"
                    ? "bg-emerald-500/8 border border-emerald-500/20"
                    : "bg-blue-500/8 border border-blue-500/20 ml-6"
                }`}
              >
                <div className="flex items-center gap-2 text-theme-muted">
                  <FaCircle className={`w-1.5 h-1.5 ${ev.type === "wa:incoming" ? "text-emerald-500" : "text-blue-400"}`} />
                  <span className="font-semibold">
                    {ev.type === "wa:incoming"
                      ? `📨 ${ev.name || ev.from}`
                      : `🤖 IA → ${ev.name || ev.to}`}
                  </span>
                  <span className="ml-auto opacity-60">{formatTime(ev.timestamp)}</span>
                </div>
                <p className="text-theme-text break-words whitespace-pre-wrap pl-3.5">
                  {ev.type === "wa:incoming" ? ev.message : ev.reply}
                </p>
              </div>
            ))
          )}
          <div ref={logEndRef} />
        </div>
      </div>

      {/* ── Enviar mensaje de prueba ── */}
      <form onSubmit={handleSend} className="bg-theme-card border border-theme-border rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-theme-muted">Enviar mensaje de prueba</h2>
        <div className="space-y-1">
          <label className="text-sm text-theme-text">Número (con o sin prefijo)</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={`Ej: 71234567 o ${prefix}71234567`}
            className="w-full px-3 py-2 rounded-lg bg-theme-surface border border-theme-border text-theme-text placeholder:text-theme-muted focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            required
          />
          <p className="text-xs text-theme-muted">
            Si no incluye prefijo se antepondrá <span className="font-mono">+{prefix}</span> automáticamente.
          </p>
        </div>
        <div className="space-y-1">
          <label className="text-sm text-theme-text">Mensaje (opcional)</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            placeholder="Mensaje de prueba desde el dashboard de Cafeteria 5 ✓"
            className="w-full px-3 py-2 rounded-lg bg-theme-surface border border-theme-border text-theme-text placeholder:text-theme-muted focus:outline-none focus:ring-2 focus:ring-emerald-500/40 resize-none"
          />
        </div>
        <div className="flex items-center gap-3">
          <Button
            type="submit"
            disabled={sending || !connected}
            className="bg-emerald-500 hover:bg-emerald-600 text-white"
          >
            <FaWhatsapp className="mr-2" />
            {sending ? "Enviando…" : "Enviar prueba"}
          </Button>
          {!connected && (
            <span className="text-xs text-theme-muted">
              Necesitas que el estado sea <strong>Conectado</strong> para enviar.
            </span>
          )}
        </div>
        {result && (
          <div
            className={`p-3 rounded-lg border text-sm ${
              result.ok
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600"
                : "border-rose-500/30 bg-rose-500/10 text-rose-600"
            }`}
          >
            {result.ok ? (
              <>
                ✓ Mensaje enviado a <span className="font-mono">+{result.normalizedPhone}</span>
                {result.id && <span className="text-xs opacity-70"> (id: {result.id})</span>}
              </>
            ) : (
              <>
                ✕ {result.error}
                {result.normalizedPhone && (
                  <div className="text-xs opacity-70 font-mono">Número normalizado: +{result.normalizedPhone}</div>
                )}
              </>
            )}
          </div>
        )}
      </form>
    </div>
  );
};

export default WhatsappPanel;
