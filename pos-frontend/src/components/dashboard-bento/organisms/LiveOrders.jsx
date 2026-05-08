import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Activity } from 'lucide-react';
import { getOrders } from "../../../https";
import OrderCard from "../molecules/OrderCard";
import GlassCard from "../atoms/GlassCard";
import { Badge } from "../../ui/shadcn/badge";
import StatusDot from "../atoms/StatusDot";

const ACTIVE_STATUSES = new Set(["In Progress", "Ready"]);

/**
 * LiveOrders — organismo. Pedidos en vivo con polling cada 8s (TanStack Query).
 * Resalta pedidos nuevos durante 4s para "feel" de tiempo real.
 *
 * Optimización: useMemo para filtrado/ordenado, dedupe por _id para detectar nuevos.
 */
const LiveOrders = ({ limit = 6 }) => {
  const { data, isLoading, isError, dataUpdatedAt } = useQuery({
    queryKey: ["orders", "live"],
    queryFn: getOrders,
    refetchInterval: 8000,
    refetchOnWindowFocus: true,
  });

  const orders = data?.data?.data || [];

  const live = React.useMemo(() => {
    return orders
      .filter((o) => ACTIVE_STATUSES.has(o.orderStatus))
      .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
      .slice(0, limit);
  }, [orders, limit]);

  // Tracking de IDs nuevos para animación (mantiene un set de IDs vistos)
  const seenRef = React.useRef(new Set());
  const [recentlyAdded, setRecentlyAdded] = React.useState(new Set());

  React.useEffect(() => {
    const incoming = new Set();
    live.forEach((o) => {
      if (!seenRef.current.has(o._id)) incoming.add(o._id);
      seenRef.current.add(o._id);
    });
    if (incoming.size) {
      setRecentlyAdded(incoming);
      const t = setTimeout(() => setRecentlyAdded(new Set()), 4000);
      return () => clearTimeout(t);
    }
  }, [live]);

  return (
    <GlassCard tone="card" className="p-5 flex flex-col h-full min-h-0">
      <header className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-500 grid place-items-center" aria-hidden="true">
            <Activity className="h-5 w-5" />
          </span>
          <div>
            <h3 className="font-semibold text-theme-text flex items-center gap-2">
              Pedidos en vivo
              <StatusDot status="ready" />
            </h3>
            <p className="text-xs text-theme-muted">
              Actualiza cada 8s · {live.length} activos
            </p>
          </div>
        </div>
        <Badge variant="outline">
          <span className="sr-only">Última sincronización</span>
          {dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString("es-BO", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "—"}
        </Badge>
      </header>

      <div
        className="flex-1 overflow-y-auto scrollbar-hide -mx-1 px-1 grid grid-cols-1 sm:grid-cols-2 gap-3 content-start"
        role="feed"
        aria-busy={isLoading}
        aria-label="Lista de pedidos activos en tiempo real"
      >
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-theme-elevated/40 animate-pulse" />
          ))
        ) : isError ? (
          <p className="col-span-full text-sm text-rose-500">No se pudieron cargar los pedidos.</p>
        ) : live.length === 0 ? (
          <p className="col-span-full text-sm text-theme-muted py-8 text-center">
            Sin pedidos activos. La cocina respira tranquila ☕
          </p>
        ) : (
          live.map((o) => (
            <OrderCard key={o._id} order={o} isNew={recentlyAdded.has(o._id)} />
          ))
        )}
      </div>
    </GlassCard>
  );
};

export default LiveOrders;
