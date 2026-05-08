import { useEffect, useRef, useState } from "react";
import { MdClose } from "react-icons/md";
import { queryBinancePayOrder } from "../../https";

const BinancePayModal = ({ binanceOrder, totalBs, onPaid, onClose }) => {
  const [status, setStatus] = useState("INITIAL");
  const [secondsLeft, setSecondsLeft] = useState(() => {
    if (!binanceOrder?.expireTime) return 600;
    return Math.max(
      0,
      Math.floor((binanceOrder.expireTime - Date.now()) / 1000)
    );
  });
  const pollRef = useRef(null);

  useEffect(() => {
    if (!binanceOrder?.merchantTradeNo) return;

    const tick = async () => {
      try {
        const { data } = await queryBinancePayOrder({
          merchantTradeNo: binanceOrder.merchantTradeNo,
        });
        if (data?.status) setStatus(data.status);
        if (data?.status === "PAID") {
          clearInterval(pollRef.current);
          onPaid?.(binanceOrder);
        }
      } catch (e) {
        // silencio: seguimos haciendo polling
      }
    };

    pollRef.current = setInterval(tick, 3000);
    return () => clearInterval(pollRef.current);
  }, [binanceOrder, onPaid]);

  useEffect(() => {
    const t = setInterval(
      () => setSecondsLeft((s) => (s > 0 ? s - 1 : 0)),
      1000
    );
    return () => clearInterval(t);
  }, []);

  if (!binanceOrder) return null;

  const qrSrc =
    binanceOrder.qrcodeLink ||
    `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(
      binanceOrder.qrContent || binanceOrder.checkoutUrl || ""
    )}`;

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-theme-card p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-yellow-400 text-black font-bold">
              B
            </span>
            <h2 className="text-theme-text text-lg font-semibold">
              Pagar con Binance
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-theme-muted hover:text-theme-text"
          >
            <MdClose size={22} />
          </button>
        </div>

        <p className="text-xs text-theme-muted mb-4">
          Abre tu app de Binance, toca <b>Escanear</b> y apunta a este QR.
        </p>

        <div className="flex flex-col items-center bg-white rounded-xl p-4">
          <img
            src={qrSrc}
            alt="QR Binance Pay"
            className="w-64 h-64 object-contain"
          />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg bg-theme-base p-3">
            <p className="text-theme-muted text-xs">Total</p>
            <p className="text-theme-text font-semibold">
              Bs {Number(totalBs).toFixed(2)}
            </p>
            <p className="text-theme-muted text-xs mt-1">
              ≈ {Number(binanceOrder.orderAmount).toFixed(2)}{" "}
              {binanceOrder.currency}
            </p>
          </div>
          <div className="rounded-lg bg-theme-base p-3">
            <p className="text-theme-muted text-xs">Expira en</p>
            <p className="text-theme-text font-semibold">
              {mm}:{ss}
            </p>
            <p className="text-theme-muted text-xs mt-1">
              Estado: {status === "PAID" ? "Pagado ✓" : status}
            </p>
          </div>
        </div>

        {binanceOrder.checkoutUrl && (
          <a
            href={binanceOrder.checkoutUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 block text-center bg-yellow-400 hover:bg-yellow-500 text-black font-semibold rounded-lg px-4 py-2"
          >
            Abrir en Binance
          </a>
        )}

        <p className="mt-3 text-[11px] text-theme-muted text-center">
          ID de transacción: {binanceOrder.merchantTradeNo}
        </p>
      </div>
    </div>
  );
};

export default BinancePayModal;
