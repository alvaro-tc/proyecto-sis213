import React, { useState, useEffect } from "react";
import BottomNav from "../components/shared/BottomNav";
import OrderCard from "../components/orders/OrderCard";
import BackButton from "../components/shared/BackButton";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getOrders } from "../https/index";
import { LoadingState, EmptyState } from "../components/ui";
import { MdOutlineReorder } from "react-icons/md";

const STATUS_FILTERS = [
  { id: "all", label: "Todos" },
  { id: "progress", label: "En Progreso" },
  { id: "ready", label: "Listo" },
  { id: "completed", label: "Completado" },
  { id: "cancelled", label: "Cancelado" },
];

const Orders = () => {
  const [status, setStatus] = useState("all");

  useEffect(() => {
    document.title = "POS | Pedidos";
  }, []);

  const { data: resData, isError, isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: getOrders,
    placeholderData: keepPreviousData,
  });

  const orders = resData?.data?.data || [];
  const filteredOrders = orders.filter((order) => {
    if (status === "all") return true;
    if (status === "progress" && order.orderStatus === "In Progress") return true;
    if (status === "ready" && order.orderStatus === "Ready") return true;
    if (status === "completed" && order.orderStatus === "Completed") return true;
    if (status === "cancelled" && order.orderStatus === "Cancelled") return true;
    return false;
  });

  return (
    <section className="bg-theme-base h-[calc(100vh-5rem)] overflow-hidden flex flex-col">
      <div className="flex flex-col md:flex-row items-center justify-between px-4 sm:px-10 lg:px-16 py-4 gap-4">
        <div className="flex items-center gap-4">
          <BackButton />
          <h1 className="text-theme-text text-2xl font-bold tracking-wider">
            Pedidos
          </h1>
        </div>
        <div className="flex flex-wrap items-center justify-center md:justify-end gap-2 md:gap-3">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s.id}
              onClick={() => setStatus(s.id)}
              className={`transition-all duration-200 px-5 py-2 rounded-full font-semibold text-sm md:text-base ${
                status === s.id
                  ? "bg-theme-brand text-theme-brand-fg shadow-md"
                  : "text-theme-muted hover:text-theme-text hover:bg-theme-elevated"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 px-4 sm:px-10 lg:px-16 py-4 overflow-y-auto scrollbar-hide pb-24 flex-1 items-start content-start">
        {isLoading ? (
          <div className="col-span-full">
            <LoadingState label="Cargando pedidos…" />
          </div>
        ) : isError ? (
          <div className="col-span-full">
            <EmptyState
              icon={MdOutlineReorder}
              title="No se pudieron cargar los pedidos"
              description="Revisa tu conexión y reintenta recargando la página."
            />
          </div>
        ) : filteredOrders.length > 0 ? (
          filteredOrders.map((order) => <OrderCard key={order._id} order={order} />)
        ) : (
          <div className="col-span-full">
            <EmptyState
              icon={MdOutlineReorder}
              title="Sin pedidos en este filtro"
              description="Cambia de filtro o crea un nuevo pedido."
            />
          </div>
        )}
      </div>

      <BottomNav />
    </section>
  );
};

export default Orders;
