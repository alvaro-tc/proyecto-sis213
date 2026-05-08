import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Coffee,
  CircleDollarSign,
  Receipt,
  Armchair,
  Package,
  Clock4,
  ArrowRight,
  Bean,
} from 'lucide-react';

import { getMetrics } from "../../https";
import {
  BentoGrid,
  KpiTile,
  DashboardLayout,
  LiveOrders,
  CaffeineChart,
} from "./index";
import GlassCard from "./atoms/GlassCard";
import { Badge } from "../ui/shadcn/badge";
import { Progress } from "../ui/shadcn/progress";

const fmtBs = (n) =>
  `Bs ${Number(n || 0).toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtInt = (n) => Number(n || 0).toLocaleString("es-BO");

/**
 * HomeBentoOverview — Página principal del dashboard administrativo.
 * Layout Bento con:
 *  - 4 KPI tiles (ventas, pedidos, ocupación, hora pico)
 *  - Tile destacada (brand) con stock simulado de granos
 *  - CaffeineChart (organism, Recharts)
 *  - LiveOrders (organism, polling 8s)
 *  - Sidebar opcional con accesos rápidos en xl+
 *
 * Optimización:
 *  - useQuery con refetchInterval 30s para métricas
 *  - useMemo para cálculos derivados
 *  - React.memo en KpiTile/OrderCard hijos
 */
const HomeBentoOverview = () => {
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["metrics"],
    queryFn: getMetrics,
    refetchInterval: 30000,
  });

  const m = data?.data?.data || {};

  const todayTrend = React.useMemo(() => {
    const series = m.dailySeries || [];
    if (series.length < 2) return null;
    const today = series[series.length - 1].revenue;
    const yest  = series[series.length - 2].revenue;
    if (yest === 0) return today > 0 ? 100 : 0;
    return ((today - yest) / yest) * 100;
  }, [m.dailySeries]);

  // Stock simulado de granos (placeholder — reemplazar con API de insumos cuando exista)
  const beansStock = React.useMemo(() => {
    const used = (m.todayOrders || 0) * 18; // ~18g por taza
    const capacity = 5000; // 5kg
    const remaining = Math.max(capacity - used, 0);
    return { remaining, capacity, pct: Math.round((remaining / capacity) * 100) };
  }, [m.todayOrders]);

  return (
    <DashboardLayout>
      <DashboardLayout.Body>
        <DashboardLayout.Header>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-theme-muted font-semibold">
              Cafetería 5 · Panel administrativo
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-theme-text mt-1">
              Buen día. Aquí está tu cafetería ahora mismo.
            </h2>
          </div>
          <Badge variant="outline" className="self-start">
            <Clock4 className="h-3 w-3" aria-hidden="true" />
            Actualiza cada 30s
          </Badge>
        </DashboardLayout.Header>

        {isError && (
          <p className="text-sm text-rose-500" role="alert">
            No se pudieron cargar las métricas. Intenta recargar la página.
          </p>
        )}

        {/* ── BENTO GRID ── */}
        <BentoGrid>
          {/* KPI: Ingresos del día — destacado en brand */}
          <KpiTile
            tone="brand"
            icon={CircleDollarSign}
            title="Ventas del día"
            value={isLoading ? "—" : fmtBs(m.todayRevenue)}
            hint={`${fmtInt(m.todayOrders || 0)} pedidos hoy`}
            trend={todayTrend}
            loading={isLoading}
            span="lg:col-span-4 lg:row-span-2"
            onClick={() => navigate("/orders")}
            aria-label="Ver detalle de pedidos del día"
          />

          {/* KPI: Pedidos pendientes */}
          <KpiTile
            icon={Receipt}
            title="Órdenes pendientes"
            value={
              isLoading
                ? "—"
                : fmtInt(
                    (m.ordersByStatus?.["In Progress"] || 0) +
                    (m.ordersByStatus?.Ready || 0)
                  )
            }
            hint={`${fmtInt(m.ordersByStatus?.["In Progress"] || 0)} en preparación`}
            loading={isLoading}
            span="lg:col-span-4"
            onClick={() => navigate("/barista")}
          />

          {/* KPI: Ocupación */}
          <KpiTile
            icon={Armchair}
            title="Mesas ocupadas"
            value={isLoading ? "—" : `${m.bookedTables || 0}/${m.totalTables || 0}`}
            hint={`${m.occupancyRate || 0}% de ocupación`}
            loading={isLoading}
            span="lg:col-span-4"
            onClick={() => navigate("/tables")}
          />

          {/* Stock granos */}
          <GlassCard tone="surface" className="p-5 lg:col-span-4 flex flex-col justify-between">
            <header className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span aria-hidden="true" className="h-9 w-9 rounded-xl bg-theme-brand/10 text-theme-brand grid place-items-center">
                  <Bean className="h-4 w-4" />
                </span>
                <p className="text-xs uppercase tracking-widest font-semibold text-theme-muted">
                  Stock de granos
                </p>
              </div>
              <Badge variant={beansStock.pct < 25 ? "danger" : beansStock.pct < 50 ? "warning" : "success"}>
                {beansStock.pct}%
              </Badge>
            </header>
            <div>
              <p className="text-3xl font-bold tabular-nums text-theme-text">
                {(beansStock.remaining / 1000).toFixed(2)} kg
              </p>
              <p className="text-xs text-theme-muted mb-2">de {(beansStock.capacity / 1000).toFixed(0)} kg</p>
              <Progress
                value={beansStock.pct}
                aria-label="Stock de granos restante"
                indicatorClassName={beansStock.pct < 25 ? "bg-rose-500" : "bg-theme-brand"}
              />
            </div>
          </GlassCard>

          {/* Hora pico */}
          <KpiTile
            icon={Coffee}
            title="Hora pico"
            value={isLoading ? "—" : `${m.peakHour?.hour ?? 0}:00`}
            hint={`${fmtInt(m.peakHour?.orders || 0)} pedidos en ese rango`}
            loading={isLoading}
            span="lg:col-span-4"
          />

          {/* Productos / categorías */}
          <KpiTile
            icon={Package}
            title="Catálogo"
            value={isLoading ? "—" : `${fmtInt(m.totalDishes)} productos`}
            hint={`${fmtInt(m.totalCategories || 0)} categorías`}
            loading={isLoading}
            span="lg:col-span-4"
            onClick={() => navigate("/menu")}
          />

          {/* Gráfica cafeína (organism) */}
          <div className="lg:col-span-7 lg:row-span-2 min-h-[360px]">
            <CaffeineChart hourly={m.hourly} loading={isLoading} peakHour={m.peakHour} />
          </div>

          {/* Live Orders (organism) */}
          <div className="lg:col-span-5 lg:row-span-2 min-h-[360px]">
            <LiveOrders limit={6} />
          </div>
        </BentoGrid>

        <div className="flex justify-end mt-2">
          <button
            onClick={() => navigate("/orders")}
            className="inline-flex items-center gap-1 text-sm font-semibold text-theme-brand hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent rounded-md px-2 py-1"
          >
            Ver todos los pedidos <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </DashboardLayout.Body>
    </DashboardLayout>
  );
};

export default HomeBentoOverview;
