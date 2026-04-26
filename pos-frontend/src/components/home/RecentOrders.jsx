import React from "react";
import { FaSearch } from "react-icons/fa";
import OrderList from "./OrderList";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { getOrders } from "../../https/index";

const RecentOrders = () => {
  const { data: resData, isError } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      return await getOrders();
    },
    placeholderData: keepPreviousData,
  });

  if (isError) {
    enqueueSnackbar("¡Algo salió mal!", { variant: "error" });
  }

  return (
    <div className="px-4 md:px-8 mt-6 flex-1 flex flex-col min-h-0 pb-4">
      <div className="bg-theme-surface w-full h-full rounded-lg flex flex-col min-h-0">
        <div className="flex justify-between items-center px-6 py-4">
          <h1 className="text-theme-text text-lg font-semibold tracking-wide">
            Pedidos Recientes
          </h1>
          <a href="" className="text-[#025cca] text-sm font-semibold">
            Ver todos
          </a>
        </div>

        <div className="flex items-center gap-4 bg-theme-base rounded-[15px] px-6 py-4 mx-6">
          <FaSearch className="text-theme-text" />
          <input
            type="text"
            placeholder="Buscar pedidos recientes"
            className="bg-theme-base outline-none text-theme-text"
          />
        </div>

        {/* Order list */}
        <div className="mt-4 px-6 overflow-y-auto flex-1 scrollbar-hide pb-4">
          {resData?.data.data.length > 0 ? (
            resData.data.data.map((order) => {
              return <OrderList key={order._id} order={order} />;
            })
          ) : (
            <p className="col-span-3 text-gray-500">No hay pedidos disponibles</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecentOrders;
