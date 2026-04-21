import React, { useEffect, useState } from "react";
import BaristaOrderCard from "../components/orders/BaristaOrderCard";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getOrders } from "../https/index";
import { enqueueSnackbar } from "notistack";
import { FaCoffee, FaFire, FaHistory, FaInbox } from "react-icons/fa";
import { HiSun, HiMoon } from "react-icons/hi";
import { useDispatch } from "react-redux";
import { removeUser } from "../redux/slices/userSlice";
import { logout } from "../https";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

const Barista = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isDark, toggleTheme } = useTheme();
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
    <section className="bg-theme-base h-screen overflow-hidden flex flex-col font-sans">
      {/* KDS Header */}
      <div className="flex flex-col md:flex-row items-center justify-between px-6 sm:px-10 py-5 border-b border-theme-border shadow-md bg-theme-card">
        <div className="flex items-center gap-4 text-yellow-500">
           <div className="bg-theme-surface p-3 rounded-xl shadow-inner border border-theme-border">
              <FaCoffee size={24} className="text-[#f6b100]" />
           </div>
           <div>
             <h1 className="text-theme-text text-2xl font-black tracking-wider uppercase leading-none">
               KDS Barista
             </h1>
             <p className="text-theme-muted text-xs font-bold uppercase tracking-widest mt-1">Kitchen Display System</p>
           </div>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mt-4 md:mt-0 bg-theme-surface p-1.5 rounded-lg border border-theme-border">
           <button 
             onClick={() => setActiveTab("Entradas")}
             className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all font-bold text-sm ${activeTab === "Entradas" ? "bg-[#f6b100] text-gray-900 shadow-md" : "text-theme-muted hover:text-theme-text"}`}
           >
              <FaInbox /> Entradas ({incomingOrders.length})
           </button>
           <button 
             onClick={() => setActiveTab("Preparando")}
             className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all font-bold text-sm ${activeTab === "Preparando" ? "bg-orange-500 text-gray-900 shadow-md" : "text-theme-muted hover:text-theme-text"}`}
           >
              <FaFire /> Tu Barra ({preparingOrders.length})
           </button>
           <button 
             onClick={() => setActiveTab("Historial")}
             className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all font-bold text-sm ${activeTab === "Historial" ? "bg-white text-gray-900 shadow-md" : "text-theme-muted hover:text-theme-text"}`}
           >
              <FaHistory /> Histérial
           </button>
        </div>

        <div className="flex items-center gap-4 mt-4 md:mt-0">
           <button
             onClick={toggleTheme}
             title={isDark ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
             className="p-2.5 rounded-lg bg-theme-surface border border-theme-border hover:bg-theme-elevated transition-colors"
           >
             {isDark ? <HiSun className="text-[#f6b100] text-xl" /> : <HiMoon className="text-theme-muted text-xl" />}
           </button>
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
               {activeTab === "Entradas" && <FaInbox size={80} className="text-theme-muted mb-6" />}
               {activeTab === "Preparando" && <FaFire size={80} className="text-theme-muted mb-6" />}
               {activeTab === "Historial" && <FaHistory size={80} className="text-theme-muted mb-6" />}
               
               <p className="text-2xl text-theme-muted font-black uppercase tracking-widest">
                  {activeTab === "Entradas" ? "Sin Entradas Nuevas" : 
                   activeTab === "Preparando" ? "Cero Órdenes Activas" : 
                   "Sin Historial"}
               </p>
               <p className="text-theme-muted mt-3 font-medium text-lg">
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
