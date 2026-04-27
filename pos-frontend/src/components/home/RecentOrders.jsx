import React from "react";
import { FaSearch } from "react-icons/fa";
import OrderList from "./OrderList";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { getOrders } from "../../https/index";

const RecentOrders = () => {
  const { data: resData, isError, isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      return await getOrders();
    },
    placeholderData: keepPreviousData,
  });

  if (isError) {
    enqueueSnackbar("¡Algo salió mal!", { variant: "error" });
  }

  // 1. Extraemos el array real bajando los 3 niveles de data
  const orders = resData?.data?.data?.data || [];

  return (
    <div className="px-4 md:px-8 mt-6 flex-1 flex flex-col min-h-0 pb-4">
      <div className="bg-theme-surface w-full h-full rounded-lg flex flex-col min-h-0">
        <div className="flex justify-between items-center px-6 py-4">
          <h1 className="text-theme-text text-lg font-semibold tracking-wide">
            Pedidos Recientes
          </h1>
          <a href="/orders" className="text-[#025cca] text-sm font-semibold">
            Ver todos
          </a>
        </div>

        <div className="flex items-center gap-4 bg-theme-base rounded-[15px] px-6 py-4 mx-6">
          <FaSearch className="text-theme-text" />
          <input
            type="text"
            placeholder="Buscar pedidos recientes"
            className="bg-theme-base outline-none text-theme-text w-full"
          />
        </div>

        {/* 2. AQUÍ ESTÁ EL MOTOR: El contenedor que recorre las órdenes */}
        <div className="mt-4 px-6 overflow-y-auto flex-1 scrollbar-hide pb-4">
          {isLoading ? (
            <p className="text-theme-text text-center mt-10 italic">Cargando pedidos...</p>
          ) : orders.length > 0 ? (
            orders.map((order) => (
              <OrderList key={order._id} order={order} />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center mt-10">
               <p className="text-theme-muted">No hay pedidos disponibles hoy.</p>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
};

export default RecentOrders;