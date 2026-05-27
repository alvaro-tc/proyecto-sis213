import React, { useRef } from "react";
import { motion } from "framer-motion";
import { FaCheck } from "react-icons/fa6";
import { MdPrint, MdClose, MdReceiptLong } from "react-icons/md";

const Invoice = ({ orderInfo, setShowInvoice }) => {
  const invoiceRef = useRef(null);

  const handlePrint = () => {
    const printContent = invoiceRef.current.innerHTML;
    const WinPrint = window.open("", "", "width=900,height=650");
    WinPrint.document.write(`
      <html>
        <head>
          <title>Recibo de Pedido</title>
          <style>
            * { box-sizing: border-box; }
            body { font-family: 'Segoe UI', Arial, sans-serif; padding: 20px; color:#222; background:#fff; }
            .receipt { width: 320px; margin: 0 auto; }
            h2 { text-align:center; margin: 4px 0; }
            .muted { color:#666; font-size:12px; }
            .row { display:flex; justify-content:space-between; font-size:13px; padding:2px 0; }
            hr { border:none; border-top:1px dashed #aaa; margin:10px 0; }
            .total { font-weight:700; font-size:15px; }
            .icon-ok { display:none; }
          </style>
        </head>
        <body><div class="receipt">${printContent}</div></body>
      </html>
    `);
    WinPrint.document.close();
    WinPrint.focus();
    setTimeout(() => {
      WinPrint.print();
      WinPrint.close();
    }, 500);
  };

  if (!orderInfo) return null;

  const paymentLabel =
    orderInfo.paymentMethod === "Cash"
      ? "Efectivo"
      : orderInfo.paymentMethod === "Yape"
      ? "QR (Mercantil)"
      : orderInfo.paymentMethod || "—";

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/70 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.25 }}
        className="w-full max-w-md rounded-2xl bg-theme-card border border-theme-border shadow-2xl overflow-hidden"
      >
        {/* Header strip */}
        <div className="bg-gradient-to-r from-theme-brand to-theme-accent px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-theme-brand-fg">
            <MdReceiptLong size={22} />
            <span className="font-bold tracking-tight">Recibo del Pedido</span>
          </div>
          <button
            onClick={() => setShowInvoice(false)}
            className="text-theme-brand-fg/80 hover:text-theme-brand-fg transition-colors"
          >
            <MdClose size={22} />
          </button>
        </div>

        <div ref={invoiceRef} className="p-5 text-theme-text">
          {/* Check icon */}
          <div className="flex justify-center mb-3 icon-ok">
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, type: "spring", stiffness: 180 }}
              className="w-14 h-14 rounded-full bg-emerald-500/15 border-4 border-emerald-500/40 flex items-center justify-center"
            >
              <FaCheck className="text-emerald-500" size={22} />
            </motion.div>
          </div>

          <h2 className="text-lg font-bold text-center text-theme-text">
            ¡Pedido registrado!
          </h2>
          <p className="text-theme-muted text-center text-xs mt-0.5">
            Gracias por su compra
          </p>

          {/* Order details */}
          <div className="mt-4 rounded-xl bg-theme-base border border-theme-border p-3 text-sm space-y-1.5">
            <div className="flex justify-between row">
              <span className="text-theme-muted">ID</span>
              <span className="font-mono text-theme-text text-xs">
                {Math.floor(new Date(orderInfo.orderDate).getTime())}
              </span>
            </div>
            <div className="flex justify-between row">
              <span className="text-theme-muted">Cliente</span>
              <span className="text-theme-text font-medium">
                {orderInfo.customerDetails?.name || "Cliente"}
              </span>
            </div>
            {orderInfo.customerDetails?.phone && (
              <div className="flex justify-between row">
                <span className="text-theme-muted">Teléfono</span>
                <span className="text-theme-text">{orderInfo.customerDetails.phone}</span>
              </div>
            )}
            <div className="flex justify-between row">
              <span className="text-theme-muted">Tipo</span>
              <span className="text-theme-text capitalize">
                {orderInfo.orderType === "takeaway" ? "Para llevar" : "En mesa"}
              </span>
            </div>
          </div>

          {/* Items */}
          <div className="mt-3">
            <p className="text-[10px] text-theme-muted uppercase tracking-wider font-semibold mb-1.5">
              Artículos
            </p>
            <ul className="rounded-xl border border-theme-border divide-y divide-theme-border overflow-hidden">
              {orderInfo.items.map((item, index) => (
                <li
                  key={index}
                  className="flex justify-between items-center px-3 py-2 text-sm bg-theme-base"
                >
                  <span className="text-theme-text truncate pr-2">
                    {item.name}{" "}
                    <span className="text-theme-muted">×{item.quantity}</span>
                  </span>
                  <span className="text-theme-text font-semibold">
                    Bs {Number(item.price).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Totals */}
          <div className="mt-3 rounded-xl bg-theme-base border border-theme-border p-3 space-y-1 text-sm">
            <div className="flex justify-between row">
              <span className="text-theme-muted">Subtotal</span>
              <span className="text-theme-text">
                Bs {Number(orderInfo.bills.total).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between row">
              <span className="text-theme-muted">Impuestos</span>
              <span className="text-theme-text">
                Bs {Number(orderInfo.bills.tax).toFixed(2)}
              </span>
            </div>
            <div className="border-t border-theme-border my-1" />
            <div className="flex justify-between row total">
              <span className="text-theme-text font-bold">Total</span>
              <span className="text-theme-brand font-bold text-base">
                Bs {Number(orderInfo.bills.totalWithTax).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Payment */}
          <div className="mt-3 text-xs text-theme-muted">
            <p>
              <span className="font-semibold text-theme-text">Pago: </span>
              {paymentLabel}
            </p>
            {orderInfo.paymentMethod === "Yape" &&
              orderInfo.paymentData?.yape_payment_id && (
                <div className="mt-1 space-y-0.5">
                  <p>
                    <span className="font-semibold text-theme-text">ID QR: </span>
                    <span className="font-mono">{orderInfo.paymentData.yape_payment_id}</span>
                  </p>
                  {orderInfo.paymentData.yape_code && (
                    <p>
                      <span className="font-semibold text-theme-text">Código: </span>
                      <span className="font-mono">{orderInfo.paymentData.yape_code}</span>
                    </p>
                  )}
                </div>
              )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 px-5 pb-5 pt-1">
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-theme-brand text-theme-brand-fg font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all"
          >
            <MdPrint size={16} /> Imprimir
          </button>
          <button
            onClick={() => setShowInvoice(false)}
            className="flex-1 py-2.5 rounded-lg bg-theme-elevated border border-theme-border text-theme-text font-semibold text-sm hover:bg-theme-surface transition-colors"
          >
            Cerrar
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Invoice;
