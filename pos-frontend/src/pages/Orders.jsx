import React, { useState, useEffect } from "react";
import BottomNav from "../components/shared/BottomNav";
import OrderCard from "../components/orders/OrderCard";
import BackButton from "../components/shared/BackButton";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getOrders } from "../https/index";
import { enqueueSnackbar } from "notistack"

const Orders = () => {

  const [status, setStatus] = useState("all");

    useEffect(() => {
      document.title = "POS | Pedidos"
    }, [])

  const { data: resData, isError } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      return await getOrders();
    },
    placeholderData: keepPreviousData
  })

  if(isError) {
    enqueueSnackbar("¡Algo salió mal!", {variant: "error"})
  }

  const orders = resData?.data?.data || [];
  const filteredOrders = orders.filter((order) => {
    if (status === "all") return true;
    if (status === "progress" && order.orderStatus === "In Progress") return true;
    if (status === "ready" && order.orderStatus === "Ready") return true;
    if (status === "completed" && order.orderStatus === "Completed") return true;
    return false;
  });

  return (
    <section className="bg-[#1f1f1f] h-[calc(100vh-5rem)] overflow-hidden flex flex-col">
      <div className="flex flex-col md:flex-row items-center justify-between px-4 sm:px-10 lg:px-16 py-4 gap-4">
        <div className="flex items-center gap-4">
          <BackButton />
          <h1 className="text-[#f5f5f5] text-2xl font-bold tracking-wider">
            Pedidos
          </h1>
        </div>
        <div className="flex flex-wrap items-center justify-center md:justify-end gap-2 md:gap-3">
          <button onClick={() => setStatus("all")} className={`transition-all duration-200 px-5 py-2 rounded-full font-semibold text-sm md:text-base ${status === "all" ? "bg-[#f6b100] text-gray-900 shadow-md" : "text-[#ababab] hover:text-white hover:bg-[#2a2a2a]"}`}>
            Todos
          </button>
          <button onClick={() => setStatus("progress")} className={`transition-all duration-200 px-5 py-2 rounded-full font-semibold text-sm md:text-base ${status === "progress" ? "bg-[#f6b100] text-gray-900 shadow-md" : "text-[#ababab] hover:text-white hover:bg-[#2a2a2a]"}`}>
            En Progreso
          </button>
          <button onClick={() => setStatus("ready")} className={`transition-all duration-200 px-5 py-2 rounded-full font-semibold text-sm md:text-base ${status === "ready" ? "bg-[#f6b100] text-gray-900 shadow-md" : "text-[#ababab] hover:text-white hover:bg-[#2a2a2a]"}`}>
            Listo
          </button>
          <button onClick={() => setStatus("completed")} className={`transition-all duration-200 px-5 py-2 rounded-full font-semibold text-sm md:text-base ${status === "completed" ? "bg-[#f6b100] text-gray-900 shadow-md" : "text-[#ababab] hover:text-white hover:bg-[#2a2a2a]"}`}>
            Completado
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 px-4 sm:px-10 lg:px-16 py-4 overflow-y-auto scrollbar-hide pb-24 flex-1 items-start content-start">
        {
          filteredOrders.length > 0 ? (
            filteredOrders.map((order) => {
              return <OrderCard key={order._id} order={order} />
            })
          ) : <p className="col-span-full text-gray-500 text-center mt-10">No hay pedidos disponibles para este filtro</p>
        }
      </div>

      <BottomNav />
    </section>
  );
};

export default Orders;
