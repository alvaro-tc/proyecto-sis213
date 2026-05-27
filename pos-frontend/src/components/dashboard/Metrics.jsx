import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMetrics } from "../../https";
import LiveOrders from "../dashboard-bento/organisms/LiveOrders";
import {
  FaArrowTrendUp,
  FaArrowTrendDown,
  FaMoneyBillTrendUp,
  FaReceipt,
  FaChair,
  FaUsers,
  FaUtensils,
  FaClock,
  FaCircleCheck,
  FaCircleXmark,
  FaCreditCard,
  FaInfo,
} from "react-icons/fa6";

const fmtBs = (n) =>
  `Bs ${Number(n || 0).toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtInt = (n) => Number(n || 0).toLocaleString("es-BO");

const KpiCard = ({ icon: Icon, title, value, sub, accent, trend, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="text-left bg-theme-card border border-theme-border hover:border-theme-accent/60 transition rounded-xl p-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-theme-accent/40"
  >
    <div className="flex items-center justify-between">
      <div
        className="h-9 w-9 rounded-lg flex items-center justify-center text-white"
        style={{ backgroundColor: accent }}
      >
        <Icon className="w-4 h-4" />
      </div>
      {trend !== undefined && trend !== null && (
        <span
          className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
            trend >= 0
              ? "bg-emerald-500/10 text-emerald-500"
              : "bg-rose-500/10 text-rose-500"
          }`}
        >
          {trend >= 0 ? <FaArrowTrendUp /> : <FaArrowTrendDown />}
          {Math.abs(trend).toFixed(1)}%
        </span>
      )}
    </div>
    <p className="mt-3 text-xs uppercase tracking-wide text-theme-muted font-medium">
      {title}
    </p>
    <p className="mt-1 text-2xl font-bold text-theme-text">{value}</p>
    {sub && <p className="text-xs text-theme-muted mt-1">{sub}</p>}
  </button>
);


const HourlyBars = ({ hourly, accent = "var(--color-brand)" }) => {
  const max = Math.max(...hourly.map((h) => h.orders), 1);
  return (
    <div className="grid grid-cols-24 gap-[2px] items-end h-32" style={{ gridTemplateColumns: "repeat(24, minmax(0, 1fr))" }}>
      {hourly.map((h) => (
        <div key={h.hour} className="flex flex-col items-center justify-end h-full" title={`${h.hour}:00 — ${h.orders} pedidos`}>
          <div
            className="w-full rounded-t"
            style={{
              height: `${(h.orders / max) * 100}%`,
              backgroundColor: h.orders > 0 ? accent : "var(--color-elevated)",
              minHeight: 2,
            }}
          />
          {h.hour % 3 === 0 && (
            <span className="text-[9px] text-theme-muted mt-1">{h.hour}h</span>
          )}
        </div>
      ))}
    </div>
  );
};

const ProgressRow = ({ label, value, total, color }) => {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-theme-text">{label}</span>
        <span className="text-theme-muted">
          {fmtInt(value)} <span className="opacity-60">({pct.toFixed(1)}%)</span>
        </span>
      </div>
      <div className="h-2 bg-theme-elevated rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
};

const DetailModal = ({ detail, onClose }) => {
  if (!detail) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-theme-card border border-theme-border rounded-xl shadow-2xl max-w-lg w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-theme-text">{detail.title}</h3>
            <p className="text-xs text-theme-muted">{detail.subtitle}</p>
          </div>
          <button
            onClick={onClose}
            className="text-theme-muted hover:text-theme-text text-xl leading-none"
          >
            ×
          </button>
        </div>
        <div className="space-y-3">
          {detail.rows.map((r, i) => (
            <div
              key={i}
              className="flex justify-between items-center bg-theme-surface rounded-lg px-3 py-2 text-sm"
            >
              <span className="text-theme-muted">{r.label}</span>
              <span className="text-theme-text font-medium">{r.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Metrics = () => {
  const { data: res, isLoading, isError } = useQuery({
    queryKey: ["metrics"],
    queryFn: getMetrics,
    refetchInterval: 30000,
  });
  const m = res?.data?.data || {};
  const [detail, setDetail] = useState(null);

  const todayTrend = useMemo(() => {
    const series = m.dailySeries || [];
    if (series.length < 2) return null;
    const today = series[series.length - 1].revenue;
    const yest = series[series.length - 2].revenue;
    if (yest === 0) return today > 0 ? 100 : 0;
    return ((today - yest) / yest) * 100;
  }, [m.dailySeries]);

  if (isLoading)
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse text-theme-muted">Cargando métricas...</div>
      </div>
    );

  if (isError)
    return (
      <div className="container mx-auto p-6">
        <p className="text-rose-500">No se pudieron cargar las métricas.</p>
      </div>
    );

  const ACC = {
    revenue: "var(--color-brand)",
    orders: "var(--color-accent)",
    ticket: "#0ea5e9",
    occupancy: "#a855f7",
    customers: "#10b981",
    cancelled: "#f43f5e",
  };

  return (
    <div className="container mx-auto py-4 px-4 md:px-6 space-y-6">
      <div className="flex flex-wrap justify-between items-end gap-4">
        <div>
          <h2 className="font-semibold text-theme-text text-2xl">Rendimiento de la cafetería</h2>
          <p className="text-sm text-theme-muted">
            Indicadores clave para tomar decisiones — ventas, productos, mesas y operación.
          </p>
        </div>
        <div className="text-xs text-theme-muted">
          Actualizado en vivo · cada 30s
        </div>
      </div>

      {/* KPIs principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={FaMoneyBillTrendUp}
          title="Ingresos hoy"
          value={fmtBs(m.todayRevenue)}
          sub={`${fmtInt(m.todayOrders)} pedidos · ticket ${fmtBs(m.avgTicketToday)}`}
          accent={ACC.revenue}
          trend={todayTrend}
          onClick={() =>
            setDetail({
              title: "Ingresos",
              subtitle: "Detalle por ventana de tiempo",
              rows: [
                { label: "Hoy", value: fmtBs(m.todayRevenue) },
                { label: "Últimos 7 días", value: fmtBs(m.weekRevenue) },
                { label: "Últimos 30 días", value: fmtBs(m.monthRevenue) },
                { label: "Histórico total", value: fmtBs(m.totalRevenue) },
                { label: "Ticket promedio (histórico)", value: fmtBs(m.avgTicket) },
              ],
            })
          }
        />
        <KpiCard
          icon={FaReceipt}
          title="Pedidos hoy"
          value={fmtInt(m.todayOrders)}
          sub={`Total histórico: ${fmtInt(m.totalOrders)}`}
          accent={ACC.orders}
          onClick={() =>
            setDetail({
              title: "Pedidos",
              subtitle: "Distribución por estado",
              rows: [
                { label: "En preparación", value: fmtInt(m.ordersByStatus?.["In Progress"]) },
                { label: "Listos", value: fmtInt(m.ordersByStatus?.Ready) },
                { label: "Completados", value: `${fmtInt(m.ordersByStatus?.Completed)} (${m.completedRate}%)` },
                { label: "Cancelados", value: `${fmtInt(m.ordersByStatus?.Cancelled)} (${m.cancelledRate}%)` },
              ],
            })
          }
        />
        <KpiCard
          icon={FaChair}
          title="Ocupación de mesas"
          value={`${m.occupancyRate || 0}%`}
          sub={`${fmtInt(m.bookedTables)} de ${fmtInt(m.totalTables)} ocupadas`}
          accent={ACC.occupancy}
          onClick={() =>
            setDetail({
              title: "Mesas",
              subtitle: "Estado actual del salón",
              rows: [
                { label: "Mesas totales", value: fmtInt(m.totalTables) },
                { label: "Ocupadas", value: fmtInt(m.bookedTables) },
                { label: "Libres", value: fmtInt((m.totalTables || 0) - (m.bookedTables || 0)) },
                { label: "Tasa de ocupación", value: `${m.occupancyRate}%` },
              ],
            })
          }
        />
        <KpiCard
          icon={FaClock}
          title="Hora pico"
          value={`${m.peakHour?.hour ?? 0}:00`}
          sub={`${fmtInt(m.peakHour?.orders)} pedidos en ese rango`}
          accent={ACC.ticket}
          onClick={() =>
            setDetail({
              title: "Hora pico",
              subtitle: "Basado en pedidos de hoy (o última semana si no hay datos)",
              rows: (m.hourly || [])
                .filter((h) => h.orders > 0)
                .sort((a, b) => b.orders - a.orders)
                .slice(0, 8)
                .map((h) => ({
                  label: `${String(h.hour).padStart(2, "0")}:00 — ${String(h.hour + 1).padStart(2, "0")}:00`,
                  value: `${fmtInt(h.orders)} pedidos · ${fmtBs(h.revenue)}`,
                })),
            })
          }
        />
      </div>

      {/* Sección 2: Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 flex flex-col min-h-[360px] lg:min-h-full">
          <LiveOrders limit={6} />
        </div>

        <div className="bg-theme-card border border-theme-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <FaCircleCheck className="text-emerald-500" />
            <h3 className="font-semibold text-theme-text">Estado de pedidos</h3>
          </div>
          <div className="space-y-3">
            <ProgressRow
              label="Completados"
              value={m.ordersByStatus?.Completed || 0}
              total={m.totalOrders || 0}
              color="#10b981"
            />
            <ProgressRow
              label="En preparación"
              value={m.ordersByStatus?.["In Progress"] || 0}
              total={m.totalOrders || 0}
              color={ACC.orders}
            />
            <ProgressRow
              label="Listos"
              value={m.ordersByStatus?.Ready || 0}
              total={m.totalOrders || 0}
              color="#0ea5e9"
            />
            <ProgressRow
              label="Cancelados"
              value={m.ordersByStatus?.Cancelled || 0}
              total={m.totalOrders || 0}
              color={ACC.cancelled}
            />
          </div>
        </div>
      </div>

      {/* Sección 3: Hora pico + Top dishes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-theme-card border border-theme-border rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="font-semibold text-theme-text">Distribución horaria</h3>
              <p className="text-xs text-theme-muted">
                Pedidos por hora · pico a las {m.peakHour?.hour ?? 0}:00
              </p>
            </div>
          </div>
          <HourlyBars hourly={m.hourly || []} accent={ACC.revenue} />
        </div>

        <div className="bg-theme-card border border-theme-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <FaUtensils style={{ color: ACC.orders }} />
            <h3 className="font-semibold text-theme-text">Top 5 productos</h3>
          </div>
          {m.topDishes?.length > 0 ? (
            <ul className="space-y-2">
              {m.topDishes.map((d, i) => (
                <li
                  key={i}
                  className="flex justify-between items-center bg-theme-surface rounded-lg px-3 py-2"
                >
                  <span className="flex items-center gap-2 text-sm text-theme-text truncate">
                    <span
                      className="h-6 w-6 rounded-md flex items-center justify-center text-xs font-bold text-white"
                      style={{ backgroundColor: ACC.revenue }}
                    >
                      {i + 1}
                    </span>
                    <span className="truncate">{d.name}</span>
                  </span>
                  <span className="text-xs text-theme-muted whitespace-nowrap ml-2">
                    {fmtInt(d.quantity)}× · {fmtBs(d.revenue)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-theme-muted">Aún no hay productos vendidos.</p>
          )}
        </div>
      </div>

      {/* Sección 4: secundarios */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <KpiCard
          icon={FaMoneyBillTrendUp}
          title="Ticket promedio"
          value={fmtBs(m.avgTicket)}
          accent={ACC.ticket}
        />
        <KpiCard
          icon={FaReceipt}
          title="Ingresos 30d"
          value={fmtBs(m.monthRevenue)}
          sub={`${fmtInt(m.monthOrders)} pedidos`}
          accent={ACC.revenue}
        />
        <KpiCard
          icon={FaUsers}
          title="Clientes registrados"
          value={fmtInt(m.totalCustomers)}
          accent={ACC.customers}
        />
        <KpiCard
          icon={FaUsers}
          title="Empleados"
          value={fmtInt(m.totalEmployees)}
          accent="#6366f1"
        />
        <KpiCard
          icon={FaUtensils}
          title="Platos · Categorías"
          value={`${fmtInt(m.totalDishes)} / ${fmtInt(m.totalCategories)}`}
          accent={ACC.orders}
        />
        <KpiCard
          icon={FaCircleXmark}
          title="Tasa de cancelación"
          value={`${m.cancelledRate || 0}%`}
          accent={ACC.cancelled}
        />
      </div>

      {/* Sección 5: métodos de pago */}
      <div className="bg-theme-card border border-theme-border rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <FaCreditCard style={{ color: ACC.ticket }} />
          <h3 className="font-semibold text-theme-text">Métodos de pago</h3>
        </div>
        {m.paymentMethods?.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {m.paymentMethods.map((p, i) => {
              const pct = m.totalRevenue > 0 ? (p.revenue / m.totalRevenue) * 100 : 0;
              return (
                <div key={i} className="bg-theme-surface rounded-lg p-3 border border-theme-border">
                  <p className="text-xs text-theme-muted uppercase tracking-wide">{p.method}</p>
                  <p className="text-lg font-semibold text-theme-text mt-1">{fmtBs(p.revenue)}</p>
                  <p className="text-xs text-theme-muted">
                    {fmtInt(p.count)} pedidos · {pct.toFixed(1)}%
                  </p>
                  <div className="h-1.5 bg-theme-elevated rounded-full mt-2 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, backgroundColor: ACC.ticket }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-theme-muted flex items-center gap-2">
            <FaInfo /> Aún no hay pagos registrados.
          </p>
        )}
      </div>

      <DetailModal detail={detail} onClose={() => setDetail(null)} />
    </div>
  );
};

export default Metrics;
