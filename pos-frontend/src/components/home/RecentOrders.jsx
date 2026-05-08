import React, { useMemo, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import OrderList from "./OrderList";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { getOrders } from "../../https/index";
import { LoadingState, EmptyState } from "../ui";
import { MdOutlineReorder } from "react-icons/md";

const RecentOrders = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const { data: resData, isLoading, isError } = useQuery({
    queryKey: ["orders"],
    queryFn: getOrders,
    placeholderData: keepPreviousData,
    onError: () => enqueueSnackbar("No se pudieron cargar los pedidos.", { variant: "error" }),
  });

  const orders = resData?.data?.data || [];
  const filtered = useMemo(() => {
    if (!search.trim()) return orders;
    const q = search.toLowerCase();
    return orders.filter((o) => o.customerDetails?.name?.toLowerCase().includes(q));
  }, [orders, search]);

  return (
    <div className="px-4 md:px-8 mt-6 flex-1 flex flex-col min-h-0 pb-4">
      <div className="bg-theme-surface w-full h-full rounded-lg flex flex-col min-h-0">
        <div className="flex justify-between items-center px-6 py-4">
          <h1 className="text-theme-text text-lg font-semibold tracking-wide">
            Pedidos Recientes
          </h1>
          <button
            onClick={() => navigate("/orders")}
            className="text-[#025cca] text-sm font-semibold hover:underline"
          >
            Ver todos
          </button>
        </div>

        <div className="flex items-center gap-4 bg-theme-base rounded-[15px] px-6 py-3 mx-6 border border-theme-border">
          <FaSearch className="text-theme-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por cliente"
            className="bg-transparent outline-none text-theme-text placeholder:text-theme-muted flex-1"
          />
        </div>

        <div className="mt-4 px-6 overflow-y-auto flex-1 scrollbar-hide pb-4">
          {isLoading ? (
            <LoadingState label="Cargando pedidos…" />
          ) : isError ? (
            <EmptyState
              icon={MdOutlineReorder}
              title="Error de conexión"
              description="No se pudieron cargar los pedidos. Reintente recargando."
            />
          ) : filtered.length > 0 ? (
            filtered.map((order) => <OrderList key={order._id} order={order} />)
          ) : (
            <EmptyState
              icon={MdOutlineReorder}
              title={search ? "Sin resultados" : "Sin pedidos"}
              description={
                search
                  ? "Ningún pedido coincide con tu búsqueda."
                  : "Cuando llegue un pedido, aparecerá aquí."
              }
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default RecentOrders;
