import { useEffect, useRef, useState } from "react";
import { MdClose, MdContentCopy } from "react-icons/md";
import { QRCodeCanvas } from "qrcode.react";
import { queryYapePayment, cancelYapePayment } from "../../https";

// Modal de pago QR (orquestador api_generador_qr — MSC + ZAS con failover).
//
// El payment llega con uno de estos estados:
//   creating  → todavia no hay qr_payload; mostramos contador de ETA.
//   pending   → qr_payload listo, esperando que el cliente pague.
//   paid      → cobro confirmado → cerramos el modal.
//   expired|cancelled|failed → mostrar error.
const YapePayModal = ({ yapePayment, onPaid, onClose }) => {
    const [payment, setPayment] = useState(yapePayment);
    const status = payment?.status || "pending";
    const expiresAt = payment?.expires_at ? new Date(payment.expires_at).getTime() : null;
    const [secondsLeft, setSecondsLeft] = useState(() =>
        expiresAt ? Math.max(0, Math.floor((expiresAt - Date.now()) / 1000)) : 600
    );
    const [etaLeft, setEtaLeft] = useState(() =>
        Math.max(0, Math.ceil(Number(payment?.estimated_seconds) || 0))
    );
    const [copied, setCopied] = useState(false);
    const pollRef = useRef(null);

    useEffect(() => {
        const pid = yapePayment?.payment_id || yapePayment?.id;
        if (!pid) return;
        const tick = async () => {
            try {
                const { data } = await queryYapePayment(pid);
                const p = data?.payment;
                if (!p) return;
                setPayment((prev) => ({ ...prev, ...p }));
                if (Number.isFinite(p.estimated_seconds)) {
                    setEtaLeft(Math.max(0, Math.ceil(p.estimated_seconds)));
                }
                if (p.status === "paid") {
                    clearInterval(pollRef.current);
                    onPaid?.({ ...yapePayment, ...p });
                } else if (["expired", "cancelled", "failed"].includes(p.status)) {
                    clearInterval(pollRef.current);
                }
            } catch {
                // ignoramos; siguiente tick reintenta
            }
        };
        pollRef.current = setInterval(tick, 2500);
        return () => clearInterval(pollRef.current);
    }, [yapePayment, onPaid]);

    useEffect(() => {
        const t = setInterval(() => {
            setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
            setEtaLeft((e) => (e > 0 ? e - 1 : 0));
        }, 1000);
        return () => clearInterval(t);
    }, []);

    const handleClose = async () => {
        const pid = payment?.payment_id || payment?.id;
        if (pid && (status === "pending" || status === "creating")) {
            cancelYapePayment(pid).catch(() => {});
        }
        onClose?.();
    };

    const copyCode = () => {
        if (!payment?.code) return;
        navigator.clipboard?.writeText(payment.code).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        });
    };

    if (!payment) return null;

    const qrPayload = payment.qr_payload || "";
    const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
    const ss = String(secondsLeft % 60).padStart(2, "0");
    const providerLabel = payment.provider_label || (payment.provider || "MSC").toUpperCase();
    const amountToPay = payment.amount_to_pay ?? payment.amount;
    const requested = payment.requested_amount ?? payment.amount;
    const showAmountWarning =
        payment.validation_method === "amount_decimals" &&
        Number(amountToPay).toFixed(2) !== Number(requested).toFixed(2);
    const isCreating = status === "creating" || !qrPayload;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-2xl bg-theme-card border border-theme-border shadow-2xl overflow-hidden">
                {/* Branded header */}
                <div className="bg-gradient-to-r from-theme-brand to-theme-accent px-5 py-3 flex items-center justify-between text-theme-brand-fg">
                    <div className="flex items-center gap-2">
                        <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/20 backdrop-blur-sm font-bold text-xs">
                            QR
                        </span>
                        <div className="leading-tight">
                            <h2 className="text-base font-bold">Pagar con QR</h2>
                            <p className="text-[10px] opacity-80">
                                {providerLabel}
                                {payment.failover_count > 0 && (
                                    <span className="ml-1">· failover x{payment.failover_count}</span>
                                )}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="text-theme-brand-fg/80 hover:text-theme-brand-fg transition-colors"
                    >
                        <MdClose size={22} />
                    </button>
                </div>

                <div className="px-5 pt-4 pb-5">
                    {/* QR frame with corner markers */}
                    <div className="relative mx-auto" style={{ width: 288 }}>
                        {/* Outer gradient ring */}
                        <div className="rounded-2xl p-[3px] bg-gradient-to-br from-theme-brand via-theme-accent to-theme-brand shadow-xl">
                            <div className="relative bg-white rounded-[14px] p-4 flex items-center justify-center">
                                {/* Corner markers */}
                                <span className="absolute top-1.5 left-1.5 w-4 h-4 border-t-2 border-l-2 border-theme-brand rounded-tl-md" />
                                <span className="absolute top-1.5 right-1.5 w-4 h-4 border-t-2 border-r-2 border-theme-brand rounded-tr-md" />
                                <span className="absolute bottom-1.5 left-1.5 w-4 h-4 border-b-2 border-l-2 border-theme-brand rounded-bl-md" />
                                <span className="absolute bottom-1.5 right-1.5 w-4 h-4 border-b-2 border-r-2 border-theme-brand rounded-br-md" />

                                {isCreating ? (
                                    <div className="w-64 h-64 grid place-items-center text-center px-4">
                                        <div>
                                            <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-4 border-amber-700 border-t-transparent" />
                                            <p className="text-sm text-gray-700 font-semibold">
                                                Generando QR…
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Llega en {etaLeft > 0 ? `~${etaLeft}s` : "unos segundos"}
                                            </p>
                                            <p className="text-[10px] text-gray-400 mt-2 max-w-[200px]">
                                                Coordinando con el banco. No cierres la ventana.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <QRCodeCanvas
                                        value={qrPayload}
                                        size={256}
                                        level="H"
                                        includeMargin={false}
                                        imageSettings={{
                                            src: "/coffee.svg",
                                            height: 56,
                                            width: 56,
                                            excavate: true,
                                        }}
                                        className="w-64 h-64"
                                    />
                                )}
                            </div>
                        </div>

                        {/* Floating amount chip */}
                        {!isCreating && (
                            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-theme-brand text-theme-brand-fg px-4 py-1 rounded-full text-xs font-bold shadow-lg border-2 border-theme-card">
                                Bs {Number(amountToPay || 0).toFixed(2)}
                            </div>
                        )}
                    </div>

                <p className="text-[11px] text-theme-muted text-center mt-6">
                    Escanealo desde tu app bancaria. Monto y datos vienen precargados.
                </p>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-lg bg-theme-base p-3">
                        <p className="text-theme-muted text-xs">Pagar exactamente</p>
                        <p className="text-theme-text font-semibold">
                            Bs {Number(amountToPay || 0).toFixed(2)}
                        </p>
                        {showAmountWarning && (
                            <p className="text-[10px] text-amber-500 mt-1">
                                ⚠ Los decimales identifican tu pedido
                            </p>
                        )}
                    </div>
                    <div className="rounded-lg bg-theme-base p-3">
                        <p className="text-theme-muted text-xs">Expira en</p>
                        <p className="text-theme-text font-semibold">
                            {mm}:{ss}
                        </p>
                        <p className="text-theme-muted text-xs mt-1">
                            Estado:{" "}
                            {status === "paid"
                                ? "Pagado ✓"
                                : status === "pending"
                                    ? "Esperando…"
                                    : status === "creating"
                                        ? "Generando…"
                                        : status}
                        </p>
                    </div>
                </div>

                {payment.code && payment.validation_method !== "amount_decimals" && (
                    <div className="mt-3 rounded-lg bg-theme-base p-3 flex items-center justify-between">
                        <div>
                            <p className="text-theme-muted text-xs">Concepto / referencia</p>
                            <p className="text-theme-text font-mono text-lg tracking-wider">
                                {payment.code}
                            </p>
                        </div>
                        <button
                            onClick={copyCode}
                            className="text-theme-muted hover:text-theme-text flex items-center gap-1 text-xs"
                            title="Copiar codigo"
                        >
                            <MdContentCopy size={16} />
                            {copied ? "Copiado" : "Copiar"}
                        </button>
                    </div>
                )}

                {payment.error && status === "failed" && (
                    <p className="mt-3 text-xs text-red-500 text-center">
                        {payment.error}
                    </p>
                )}

                <p className="mt-3 text-[11px] text-theme-muted text-center break-all">
                    ID: {payment.payment_id || payment.id}
                </p>
                </div>
            </div>
        </div>
    );
};

export default YapePayModal;
