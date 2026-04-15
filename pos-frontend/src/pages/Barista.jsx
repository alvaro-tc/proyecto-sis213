import React, { useEffect, useState } from "react";
import BaristaOrderCard from "../components/orders/BaristaOrderCard";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getOrders } from "../https/index";
import { enqueueSnackbar } from "notistack";
import { FaCoffee, FaFire, FaHistory, FaInbox } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { removeUser } from "../redux/slices/userSlice";
import { logout } from "../https";
import { useNavigate } from "react-router-dom";

const Barista = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("Entradas"); // "Entradas", "Preparando", "Historial"

    useEffect(() => {
      document.title = "KDS | Terminal de Preparación";
    }, []);

  const { data: resData, isError, refetch } = useQuery({
    queryKey: ["orders-barista"],
    queryFn: getOrders,
    placeholderData: keepPreviousData,
    refetchInterval: 10000 // Update automatically every 10 sec
  });

  const handleLogout = async () => {
      try {
          await logout();
          dispatch(removeUser());
          navigate('/auth');
      } catch (err) {
          enqueueSnackbar("Error al cerrar sesión", { variant: "error" });
      }
  };

  if (isError) {
    enqueueSnackbar("¡Error obteniendo comandas!", { variant: "error" });
  }

  const orders = resData?.data?.data || [];
  
  // Agrupar órdenes
  const incomingOrders = orders.filter(order => order.orderStatus === "In Progress");
  const preparingOrders = orders.filter(order => order.orderStatus === "Preparing");
  const historyOrders = orders.filter(order => order.orderStatus === "Ready" || order.orderStatus === "Completed");

  let displayedOrders = [];
  if (activeTab === "Entradas") displayedOrders = incomingOrders;
  if (activeTab === "Preparando") displayedOrders = preparingOrders;
  if (activeTab === "Historial") displayedOrders = historyOrders;

  return (
    <section className="bg-[#1f1f1f] h-screen overflow-hidden flex flex-col font-sans">
      {/* KDS Header */}
      <div className="flex flex-col md:flex-row items-center justify-between px-6 sm:px-10 py-5 border-b border-[#333] shadow-md bg-[#262626]">
        <div className="flex items-center gap-4 text-yellow-500">
           <div className="bg-[#1a1a1a] p-3 rounded-xl shadow-inner border border-[#333]">
              <FaCoffee size={24} className="text-[#f6b100]" />
           </div>
           <div>
             <h1 className="text-[#f5f5f5] text-2xl font-black tracking-wider uppercase leading-none">
               KDS Barista
             </h1>
             <p className="text-[#ababab] text-xs font-bold uppercase tracking-widest mt-1">Kitchen Display System</p>
           </div>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mt-4 md:mt-0 bg-[#1a1a1a] p-1.5 rounded-lg border border-[#333]">
           <button 
             onClick={() => setActiveTab("Entradas")}
             className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all font-bold text-sm ${activeTab === "Entradas" ? "bg-[#f6b100] text-gray-900 shadow-md" : "text-[#ababab] hover:text-white"}`}
           >
              <FaInbox /> Entradas ({incomingOrders.length})
           </button>
           <button 
             onClick={() => setActiveTab("Preparando")}
             className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all font-bold text-sm ${activeTab === "Preparando" ? "bg-orange-500 text-gray-900 shadow-md" : "text-[#ababab] hover:text-white"}`}
           >
              <FaFire /> Tu Barra ({preparingOrders.length})
           </button>
           <button 
             onClick={() => setActiveTab("Historial")}
             className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all font-bold text-sm ${activeTab === "Historial" ? "bg-white text-gray-900 shadow-md" : "text-[#ababab] hover:text-white"}`}
           >
              <FaHistory /> Histérial
           </button>
        </div>

        <div className="flex items-center gap-4 mt-4 md:mt-0">
           <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 px-6 rounded-lg transition-colors shadow-md">
              Salir
           </button>
        </div>
      </div>

      {/* Main KDS Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-6 sm:px-10 py-6 overflow-y-auto scrollbar-hide pb-24 flex-1 items-start content-start">
        {
          displayedOrders.length > 0 ? (
            displayedOrders.map((order) => {
              return <BaristaOrderCard key={order._id} order={order} refetch={refetch} />
            })
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center mt-32 opacity-40">
               {activeTab === "Entradas" && <FaInbox size={80} className="text-[#ababab] mb-6" />}
               {activeTab === "Preparando" && <FaFire size={80} className="text-[#ababab] mb-6" />}
               {activeTab === "Historial" && <FaHistory size={80} className="text-[#ababab] mb-6" />}
               
               <p className="text-2xl text-[#ababab] font-black uppercase tracking-widest">
                  {activeTab === "Entradas" ? "Sin Entradas Nuevas" : 
                   activeTab === "Preparando" ? "Cero Órdenes Activas" : 
                   "Sin Historial"}
               </p>
               <p className="text-[#ababab] mt-3 font-medium text-lg">
                  {activeTab === "Entradas" ? "Esperando la siguiente comanda..." : "Selecciona una entrada para comenzar."}
               </p>
            </div>
          )
        }
      </div>
    </section>
  );
};

export default Barista;
