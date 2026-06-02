import React, { useEffect, useState } from "react";
import BaristaOrderCard from "../components/orders/BaristaOrderCard";
import BottomNav from "../components/shared/BottomNav";
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
    const [selectedTable, setSelectedTable] = useState("all");

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

  // Extraer mesas únicas de todas las órdenes
  const uniqueTables = [...new Set(orders
    .filter(order => order.table?.tableNo)
    .map(order => order.table.tableNo)
  )].sort((a, b) => a - b);

  let displayedOrders = [];
  if (activeTab === "Entradas") displayedOrders = incomingOrders;
  if (activeTab === "Preparando") displayedOrders = preparingOrders;
  if (activeTab === "Historial") displayedOrders = historyOrders;

  // Aplicar filtro de mesa
  if (selectedTable !== "all") {
    displayedOrders = displayedOrders.filter(order => order.table?.tableNo === parseInt(selectedTable));
  }

  return (
    <section className="bg-theme-base h-screen overflow-hidden flex flex-col font-sans">
      {/* KDS Header */}
      <div className="flex flex-col md:flex-row items-center justify-between px-4 sm:px-6 lg:px-10 py-4 sm:py-5 border-b border-theme-border shadow-md bg-theme-card gap-4 sm:gap-6">
        <div className="flex items-center gap-3 sm:gap-4 text-yellow-500 flex-shrink-0">
           <div className="bg-theme-surface p-2 sm:p-3 rounded-xl shadow-inner border border-theme-border">
              <FaCoffee size={20} className="sm:w-6 sm:h-6 text-theme-accent" />
           </div>
           <div>
             <h1 className="text-theme-text text-lg sm:text-2xl font-black tracking-wider uppercase leading-none">
               KDS Barista
             </h1>
             <p className="text-theme-muted text-[10px] sm:text-xs font-bold uppercase tracking-widest mt-1">Kitchen Display System</p>
           </div>
        </div>

        {/* Navigation Tabs & Filter */}
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 bg-theme-surface p-1 sm:p-1.5 rounded-lg border border-theme-border flex-wrap justify-center sm:justify-start">
           <button
             onClick={() => setActiveTab("Entradas")}
             className={`flex items-center gap-1 px-2 sm:px-4 py-1.5 sm:py-2 rounded-md transition-all font-bold text-xs sm:text-sm whitespace-nowrap ${activeTab === "Entradas" ? "bg-theme-accent text-gray-900 shadow-md" : "text-theme-muted hover:text-theme-text"}`}
           >
              <FaInbox className="hidden sm:inline" /> Entradas ({incomingOrders.length})
           </button>
           <button
             onClick={() => setActiveTab("Preparando")}
             className={`flex items-center gap-1 px-2 sm:px-4 py-1.5 sm:py-2 rounded-md transition-all font-bold text-xs sm:text-sm whitespace-nowrap ${activeTab === "Preparando" ? "bg-orange-500 text-gray-900 shadow-md" : "text-theme-muted hover:text-theme-text"}`}
           >
              <FaFire className="hidden sm:inline" /> Barra ({preparingOrders.length})
           </button>
           <button
             onClick={() => setActiveTab("Historial")}
             className={`flex items-center gap-1 px-2 sm:px-4 py-1.5 sm:py-2 rounded-md transition-all font-bold text-xs sm:text-sm whitespace-nowrap ${activeTab === "Historial" ? "bg-white text-gray-900 shadow-md" : "text-theme-muted hover:text-theme-text"}`}
           >
              <FaHistory className="hidden sm:inline" /> Historial
           </button>

           {/* Table Filter */}
           <div className="hidden md:block pl-2 md:pl-4 border-l border-theme-border">
             <select
               value={selectedTable}
               onChange={(e) => setSelectedTable(e.target.value)}
               className="px-2 sm:px-3 py-1.5 sm:py-2 rounded-md bg-theme-elevated border border-theme-border text-theme-text font-bold text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-theme-accent"
             >
               <option value="all">Todas las Mesas</option>
               {uniqueTables.map(tableNo => (
                 <option key={tableNo} value={tableNo}>
                   Mesa {tableNo}
                 </option>
               ))}
             </select>
           </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
           {/* Table Filter Mobile */}
           <div className="md:hidden">
             <select
               value={selectedTable}
               onChange={(e) => setSelectedTable(e.target.value)}
               className="px-2 py-1.5 rounded-md bg-theme-elevated border border-theme-border text-theme-text font-bold text-xs focus:outline-none focus:ring-2 focus:ring-theme-accent"
             >
               <option value="all">Todas</option>
               {uniqueTables.map(tableNo => (
                 <option key={tableNo} value={tableNo}>
                   M{tableNo}
                 </option>
               ))}
             </select>
           </div>

           <button
             onClick={toggleTheme}
             title={isDark ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
             className="p-2 sm:p-2.5 rounded-lg bg-theme-surface border border-theme-border hover:bg-theme-elevated transition-colors"
           >
             {isDark ? <HiSun className="text-theme-accent text-lg sm:text-xl" /> : <HiMoon className="text-theme-muted text-lg sm:text-xl" />}
           </button>
           <button onClick={handleLogout} className="bg-theme-brand hover:opacity-90 text-theme-brand-fg font-bold py-2 sm:py-2.5 px-3 sm:px-6 rounded-lg transition-colors shadow-md text-xs sm:text-base whitespace-nowrap">
              Salir
           </button>
        </div>
      </div>

      {/* Main KDS Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-6 sm:px-10 py-6 overflow-y-auto scrollbar-hide pb-24 flex-1 h-full items-start content-start auto-rows-max">
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

      <BottomNav />
    </section>
  );
};

export default Barista;
