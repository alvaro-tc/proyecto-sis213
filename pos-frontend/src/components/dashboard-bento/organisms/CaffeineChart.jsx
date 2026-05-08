import * as React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceDot,
} from "recharts";
import { Coffee } from 'lucide-react';
import GlassCard from "../atoms/GlassCard";
import { Badge } from "../../ui/shadcn/badge";

/**
 * CaffeineChart (alias semántico: SalesChart).
 * Recibe `hourly` [{hour, orders, revenue}] y proyecta una curva de cafeína
 * estimada (~mg) suponiendo 80mg promedio por orden de café especial.
 *
 * Notas A11y:
 *  - role="img" + aria-label resume la información para lectores de pantalla.
 *  - <table> oculta visualmente con datos crudos (visible para screen readers / impresión).
 */
const CAFFEINE_PER_ORDER = 80;

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-xl border border-theme-border bg-theme-card/95 backdrop-blur px-3 py-2 shadow-lg text-xs">
      <p className="font-semibold text-theme-text">{label}:00 hrs</p>
      <p className="text-theme-muted">{d.orders} pedidos</p>
      <p className="text-theme-brand font-medium">{d.caffeine} mg cafeína</p>
    </div>
  );
};

const CaffeineChart = ({ hourly = [], loading = false, peakHour }) => {
  const data = React.useMemo(
    () =>
      (hourly.length ? hourly : Array.from({ length: 24 }, (_, h) => ({ hour: h, orders: 0 }))).map(
        (h) => ({
          hour: h.hour,
          orders: h.orders || 0,
          caffeine: (h.orders || 0) * CAFFEINE_PER_ORDER,
        })
      ),
    [hourly]
  );

  const peak = React.useMemo(() => {
    if (peakHour?.hour !== undefined) return peakHour;
    return data.reduce((a, b) => (b.orders > (a?.orders || 0) ? b : a), null);
  }, [data, peakHour]);

  const totalCaffeine = React.useMemo(
    () => data.reduce((acc, d) => acc + d.caffeine, 0),
    [data]
  );

  return (
    <GlassCard tone="card" className="p-5 h-full flex flex-col">
      <header className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <span className="h-10 w-10 rounded-xl bg-theme-brand/10 text-theme-brand grid place-items-center" aria-hidden="true">
            <Coffee className="h-5 w-5" />
          </span>
          <div>
            <h3 className="font-semibold text-theme-text">Picos de consumo de cafeína</h3>
            <p className="text-xs text-theme-muted">
              Estimado en mg · ~{CAFFEINE_PER_ORDER} mg por pedido
            </p>
          </div>
        </div>
        <Badge variant="outline" className="whitespace-nowrap">
          Hoy · {(totalCaffeine / 1000).toFixed(1)} g
        </Badge>
      </header>

      <div
        role="img"
        aria-label={`Gráfica de cafeína por hora. Pico: ${peak?.hour ?? 0}:00 horas con ${peak?.orders ?? 0} pedidos.`}
        className="flex-1 min-h-[220px]"
      >
        {loading ? (
          <div className="h-full w-full rounded-xl bg-theme-elevated/40 animate-pulse" />
        ) : (
          <ResponsiveContainer width="100%" height="100%" minHeight={220}>
            <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
              <defs>
                <linearGradient id="caffeineGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-brand)" stopOpacity={0.55} />
                  <stop offset="100%" stopColor="var(--color-brand)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 6" vertical={false} />
              <XAxis
                dataKey="hour"
                tickFormatter={(h) => `${h}h`}
                stroke="var(--color-muted)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="var(--color-muted)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                width={36}
              />
              <Tooltip content={<Tip />} cursor={{ stroke: "var(--color-accent)", strokeWidth: 1, strokeDasharray: "4 4" }} />
              <Area
                type="monotone"
                dataKey="caffeine"
                stroke="var(--color-brand)"
                strokeWidth={2.5}
                fill="url(#caffeineGrad)"
                isAnimationActive
              />
              {peak && peak.orders > 0 && (
                <ReferenceDot
                  x={peak.hour}
                  y={(peak.orders || 0) * CAFFEINE_PER_ORDER}
                  r={5}
                  fill="var(--color-accent)"
                  stroke="var(--color-card)"
                  strokeWidth={2}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Tabla equivalente, accesible para lectores de pantalla */}
      <table className="sr-only">
        <caption>Cafeína consumida por hora</caption>
        <thead>
          <tr><th>Hora</th><th>Pedidos</th><th>Cafeína (mg)</th></tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.hour}><td>{d.hour}:00</td><td>{d.orders}</td><td>{d.caffeine}</td></tr>
          ))}
        </tbody>
      </table>
    </GlassCard>
  );
};

export default CaffeineChart;
export { CaffeineChart as SalesChart };
