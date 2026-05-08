import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import {
  MdTableBar,
  MdEventSeat,
  MdLockOpen,
  MdNotificationsActive,
  MdRestaurantMenu,
  MdAccessTime,
  MdCancel,
  MdCheckCircle,
  MdGroups,
} from "react-icons/md";
import { FaCoffee } from "react-icons/fa";

import { getOrders, getTables, updateOrderStatus, updateTable } from "../../https";
import TableCard from "../tables/TableCard";
import { ConfirmDialog, EmptyState, LoadingState } from "../ui";
import { formatDateAndTime, getAvatarName } from "../../utils";

const StatPill = ({ icon: Icon, label, value, tone = "default" }) => {
  const tones = {
    default: "text-theme-text",
    accent: "text-theme-accent",
    brand: "text-theme-brand",
    success: "text-green-500",
    warn: "text-yellow-500",
  };
  return (
    <div className="flex items-center gap-3 bg-theme-card border border-theme-border rounded-2xl px-4 py-3 shadow-sm">
      <div className={`shrink-0 w-9 h-9 rounded-xl bg-theme-base grid place-items-center ${tones[tone]}`}>
        <Icon className="text-lg" />
      </div>
      <div className="flex flex-col leading-tight min-w-0">
        <span className="text-[10px] uppercase tracking-wider font-semibold text-theme-muted">
          {label}
        </span>
        <span className={`font-bold text-lg ${tones[tone]}`}>{value}</span>
      </div>
    </div>
  );
};

const WaiterOverview = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { name } = useSelector((s) => s.user);
  const [confirmCancel, setConfirmCancel] = useState(null);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return "Buenos días";
    if (h < 19) return "Buenas tardes";
    return "Buenas noches";
  }, []);

  const { data: tablesRes, isLoading: tablesLoading } = useQuery({
    queryKey: ["tables"],
    queryFn: getTables,
    placeholderData: keepPreviousData,
  });

  const { data: ordersRes, isLoading: ordersLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: getOrders,
    placeholderData: keepPreviousData,
    refetchInterval: 8000,
  });

  const tables = tablesRes?.data?.data || [];
  const orders = ordersRes?.data?.data || [];

  const stats = useMemo(() => {
    const total = tables.length;
    const booked = tables.filter((t) => t.status === "Booked").length;
    const ready = orders.filter((o) => o.orderStatus === "Ready").length;
    const inProgress = orders.filter(
      (o) => o.orderStatus === "In Progress" || o.orderStatus === "Preparing"
    ).length;
    const guests = tables.reduce(
      (sum, t) => sum + (t.currentOrder?.customerDetails?.guests || 0),
      0
    );
    return { total, booked, available: total - booked, ready, inProgress, guests };
  }, [tables, orders]);

  const readyOrders = useMemo(
    () => orders.filter((o) => o.orderStatus === "Ready"),
    [orders]
  );
  const activeOrders = useMemo(
    () =>
      orders
        .filter((o) => o.orderStatus === "In Progress" || o.orderStatus === "Preparing")
        .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate)),
    [orders]
  );

  const deliverMutation = useMutation({
    mutationFn: (orderId) => updateOrderStatus({ orderId, orderStatus: "Completed" }),
    onSuccess: () => {
      enqueueSnackbar("Pedido entregado y mesa liberada", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["tables"] });
    },
    onError: () =>
      enqueueSnackbar("No se pudo entregar el pedido", { variant: "error" }),
  });

  const cancelMutation = useMutation({
    mutationFn: (orderId) => updateOrderStatus({ orderId, orderStatus: "Cancelled" }),
    onSuccess: () => {
      enqueueSnackbar("Pedido cancelado", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["tables"] });
      setConfirmCancel(null);
    },
    onError: () =>
      enqueueSnackbar("No se pudo cancelar el pedido", { variant: "error" }),
  });

  const role = "waiter";

  return (
    <div className="px-4 sm:px-6 md:px-8 py-4 md:py-6 flex flex-col gap-6">
      {/* Greeting + stats */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-theme-muted font-semibold">
              Panel de mesero
            </p>
            <h1 className="text-2xl md:text-3xl font-bold text-theme-text mt-1">
              {greeting}, {name || "Mesero"} 👋
            </h1>
            <p className="text-theme-muted text-sm mt-1">
              Brinda el mejor servicio. Aquí están las mesas y pedidos en vivo.
            </p>
          </div>
          <button
            onClick={() => navigate("/tables")}
            className="inline-flex items-center gap-2 bg-theme-brand text-theme-brand-fg px-4 py-2.5 rounded-xl font-semibold text-sm shadow-sm hover:opacity-90"
          >
            <MdRestaurantMenu className="text-lg" /> Tomar nuevo pedido
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <StatPill icon={MdLockOpen} label="Mesas libres" value={stats.available} tone="success" />
          <StatPill icon={MdEventSeat} label="Mesas en uso" value={stats.booked} tone="brand" />
          <StatPill icon={MdGroups} label="Personas" value={stats.guests} tone="accent" />
          <StatPill icon={FaCoffee} label="En preparación" value={stats.inProgress} tone="warn" />
          <StatPill
            icon={MdNotificationsActive}
            label="Listos por llevar"
            value={stats.ready}
            tone={stats.ready > 0 ? "success" : "default"}
          />
        </div>
      </div>

      {/* Ready orders alert */}
      {readyOrders.length > 0 && (
        <section
          aria-label="Pedidos listos para llevar"
          className="bg-gradient-to-r from-green-500/10 via-theme-card to-theme-card border border-green-500/40 rounded-2xl p-4 sm:p-5 shadow-sm"
        >
          <header className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <span className="relative grid place-items-center w-10 h-10 rounded-xl bg-green-500/15 text-green-500">
                <MdNotificationsActive className="text-xl" />
                <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 animate-ping" />
                <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500" />
              </span>
              <div>
                <h2 className="text-theme-text font-bold text-base sm:text-lg">
                  Pedidos listos para llevar
                </h2>
                <p className="text-theme-muted text-xs">
                  {readyOrders.length} pedido{readyOrders.length !== 1 && "s"} esperando entrega
                </p>
              </div>
            </div>
          </header>

          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {readyOrders.map((order) => (
              <li
                key={order._id}
                className="bg-theme-card border border-theme-border rounded-xl p-3 flex flex-col gap-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-green-500 text-gray-900 grid place-items-center font-black text-sm shrink-0">
                      {getAvatarName(order.customerDetails?.name) || "?"}
                    </div>
                    <div className="min-w-0">
                      <p className="text-theme-text font-bold text-sm truncate">
                        {order.customerDetails?.name || "Cliente"}
                      </p>
                      <p className="text-theme-muted text-[11px] flex items-center gap-1">
                        <MdTableBar className="text-theme-accent" /> Mesa {order.table?.tableNo ?? "?"} · {order.items?.length || 0} ítems
                      </p>
                    </div>
                  </div>
                  <span className="text-green-500 bg-green-500/15 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    Listo
                  </span>
                </div>
                <button
                  onClick={() => deliverMutation.mutate(order._id)}
                  disabled={deliverMutation.isPending}
                  className="w-full bg-green-500 hover:bg-green-400 text-gray-900 font-bold py-2 rounded-lg text-sm flex items-center justify-center gap-1 transition-colors disabled:opacity-60"
                >
                  <MdCheckCircle /> Llevar y completar
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Active orders */}
      <section aria-label="Pedidos en preparación">
        <header className="flex items-center justify-between gap-2 mb-3">
          <h2 className="text-theme-text font-bold text-base sm:text-lg flex items-center gap-2">
            <MdAccessTime className="text-theme-accent" /> Pedidos en cocina
          </h2>
          <button
            onClick={() => navigate("/orders")}
            className="text-theme-brand text-xs font-semibold hover:underline"
          >
            Ver todos
          </button>
        </header>

        {ordersLoading ? (
          <LoadingState label="Cargando pedidos…" />
        ) : activeOrders.length === 0 ? (
          <EmptyState
            icon={MdAccessTime}
            title="Sin pedidos activos"
            description="Cuando tomes un pedido aparecerá aquí mientras se prepara."
          />
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {activeOrders.map((order) => {
              const isPreparing = order.orderStatus === "Preparing";
              return (
                <li
                  key={order._id}
                  className="bg-theme-card border border-theme-border rounded-xl p-3 flex flex-col gap-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-theme-accent text-gray-900 grid place-items-center font-black text-sm shrink-0">
                        {getAvatarName(order.customerDetails?.name) || "?"}
                      </div>
                      <div className="min-w-0">
                        <p className="text-theme-text font-bold text-sm truncate">
                          {order.customerDetails?.name || "Cliente"}
                        </p>
                        <p className="text-theme-muted text-[11px]">
                          Mesa {order.table?.tableNo ?? "?"} · {formatDateAndTime(order.orderDate)}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${
                        isPreparing
                          ? "bg-orange-500/15 text-orange-500"
                          : "bg-yellow-500/15 text-yellow-500"
                      }`}
                    >
                      {isPreparing ? "Preparando" : "En cola"}
                    </span>
                  </div>

                  <div className="text-xs text-theme-muted flex items-center justify-between">
                    <span>{order.items?.length || 0} ítems</span>
                    <span className="text-theme-text font-bold">
                      Bs {Number(order.bills?.totalWithTax || 0).toFixed(2)}
                    </span>
                  </div>

                  {!isPreparing ? (
                    <button
                      onClick={() => setConfirmCancel(order)}
                      disabled={cancelMutation.isPending}
                      className="w-full bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 font-semibold py-2 rounded-lg text-xs flex items-center justify-center gap-1 transition-colors disabled:opacity-60"
                    >
                      <MdCancel /> Cancelar pedido
                    </button>
                  ) : (
                    <p className="text-center text-[11px] text-theme-muted italic">
                      Ya se está preparando — no se puede cancelar
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Tables grid */}
      <section aria-label="Estado de mesas">
        <header className="flex items-center justify-between gap-2 mb-3">
          <h2 className="text-theme-text font-bold text-base sm:text-lg flex items-center gap-2">
            <MdTableBar className="text-theme-accent" /> Estado de mesas
          </h2>
          <button
            onClick={() => navigate("/tables")}
            className="text-theme-brand text-xs font-semibold hover:underline"
          >
            Ver todas
          </button>
        </header>

        {tablesLoading ? (
          <LoadingState label="Cargando mesas…" />
        ) : tables.length === 0 ? (
          <EmptyState
            icon={MdTableBar}
            title="Sin mesas configuradas"
            description="Pide al administrador que agregue mesas."
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {tables.map((table) => (
              <TableCard key={table._id} table={table} role={role} />
            ))}
          </div>
        )}
      </section>

      <ConfirmDialog
        isOpen={!!confirmCancel}
        onClose={() => setConfirmCancel(null)}
        onConfirm={() => confirmCancel && cancelMutation.mutate(confirmCancel._id)}
        isLoading={cancelMutation.isPending}
        title="¿Cancelar este pedido?"
        description={`El pedido de ${
          confirmCancel?.customerDetails?.name || "este cliente"
        } se marcará como cancelado y la mesa quedará libre. Esta acción no se puede deshacer.`}
        confirmLabel="Sí, cancelar pedido"
        cancelLabel="Mantener pedido"
        variant="danger"
      />
    </div>
  );
};

export default WaiterOverview;
