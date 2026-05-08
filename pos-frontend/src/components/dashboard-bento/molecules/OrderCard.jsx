import * as React from "react";
import { Clock, User, Hash } from "lucide-react";
import { Badge } from "../../ui/shadcn/badge";
import StatusDot from "../atoms/StatusDot";
import GlassCard from "../atoms/GlassCard";
import { cn } from "../../../lib/utils";

/* Mapeo a variantes Badge + StatusDot. Mantiene un único punto de verdad. */
const STATUS_MAP = {
  "In Progress": { dot: "progress",  badge: "warning", label: "En preparación" },
  "Ready":       { dot: "ready",     badge: "success", label: "Listo" },
  "Completed":   { dot: "completed", badge: "secondary", label: "Completado" },
  "Cancelled":   { dot: "cancelled", badge: "danger", label: "Cancelado" },
};

const fmtBs = (n) =>
  `Bs ${Number(n || 0).toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const fmtTime = (iso) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleTimeString("es-BO", { hour: "2-digit", minute: "2-digit" });
  } catch { return "—"; }
};

/**
 * OrderCard — molécula. Tarjeta de pedido en vivo.
 * Compound-friendly: acepta `actions` como render prop para botones.
 */
const OrderCard = ({ order, isNew = false, className, actions }) => {
  const status = STATUS_MAP[order?.orderStatus] || STATUS_MAP["In Progress"];
  const items = order?.items?.length || 0;

  return (
    <GlassCard
      tone="surface"
      className={cn(
        "p-4 flex flex-col gap-3",
        isNew && "ring-2 ring-theme-accent/60 animate-in fade-in slide-in-from-top-2 duration-500",
        className
      )}
      role="article"
      aria-label={`Pedido de ${order?.customerDetails?.name || "cliente"}, ${status.label}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <StatusDot status={status.dot} pulse={status.dot === "progress" || status.dot === "ready"} />
          <div className="min-w-0">
            <p className="font-semibold truncate text-theme-text flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-theme-muted" aria-hidden="true" />
              {order?.customerDetails?.name || "Sin nombre"}
            </p>
            <p className="text-xs text-theme-muted flex items-center gap-1.5">
              <Hash className="h-3 w-3" aria-hidden="true" />
              {order?._id?.slice(-6) || "—"}
              <span className="opacity-50">·</span>
              <Clock className="h-3 w-3" aria-hidden="true" />
              {fmtTime(order?.orderDate)}
            </p>
          </div>
        </div>
        <Badge variant={status.badge}>{status.label}</Badge>
      </div>

      <div className="flex items-end justify-between">
        <p className="text-xs text-theme-muted">
          {items} producto{items === 1 ? "" : "s"}
        </p>
        <p className="text-lg font-bold tabular-nums text-theme-text">
          {fmtBs(order?.bills?.totalWithTax || order?.bills?.total)}
        </p>
      </div>

      {actions && <div className="flex gap-2 pt-2 border-t border-theme-border/60">{actions}</div>}
    </GlassCard>
  );
};

export default React.memo(OrderCard);
