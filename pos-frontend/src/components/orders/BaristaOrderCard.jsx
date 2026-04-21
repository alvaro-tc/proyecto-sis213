import React, { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { updateOrderStatus } from "../../https";
import { enqueueSnackbar } from "notistack";
import { FaCheck, FaPlay, FaRegSquare, FaCheckSquare, FaClock } from "react-icons/fa";

const BaristaOrderCard = ({ order, refetch }) => {
  // Local storage for checked items to persist across tab switches
  const storageKey = `kds_order_${order._id}`;
  const [checkedItems, setCheckedItems] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : [];
  });

  const [elapsedMinutes, setElapsedMinutes] = useState(0);

  // Timer logic
  useEffect(() => {
    const calculateTime = () => {
      const start = new Date(order.createdAt).getTime();
      const now = Date.now();
      const diffMins = Math.floor((now - start) / 60000);
      setElapsedMinutes(diffMins);
    };
    
    calculateTime();
    
    if (order.orderStatus === "In Progress" || order.orderStatus === "Preparing") {
      const interval = setInterval(calculateTime, 60000); // update every minute
      return () => clearInterval(interval);
    }
  }, [order.createdAt, order.orderStatus]);

  const toggleItem = (index) => {
    if (order.orderStatus !== "Preparing") return; // Only allow checking if preparing

    const newChecked = checkedItems.includes(index)
      ? checkedItems.filter(i => i !== index)
      : [...checkedItems, index];
    
    setCheckedItems(newChecked);
    localStorage.setItem(storageKey, JSON.stringify(newChecked));
  };

  const statusMutation = useMutation({
    mutationFn: (reqData) => updateOrderStatus(reqData),
    onSuccess: (res, variables) => {
      const newStatus = variables.orderStatus;
      if (newStatus === "Ready") {
        enqueueSnackbar("La orden está lista para entregar", { variant: "success" });
        localStorage.removeItem(storageKey); // Clean up
      } else if (newStatus === "Preparing") {
        enqueueSnackbar("Empezaste a preparar esta orden", { variant: "info" });
      }
      refetch();
    },
    onError: (error) => {
      enqueueSnackbar("Error al actualizar la orden", { variant: "error" });
    }
  });

  const handleStartPreparing = () => {
    statusMutation.mutate({ orderId: order._id, orderStatus: "Preparing" });
  };

  const handleMarkAsReady = () => {
    statusMutation.mutate({ orderId: order._id, orderStatus: "Ready" });
  };

  const isPreparing = order.orderStatus === "Preparing";
  const isHistory = order.orderStatus === "Ready" || order.orderStatus === "Completed";
  const allChecked = checkedItems.length === order.items.length;

  // Visual timers logic
  let headerColor = "bg-theme-base"; // default dark
  let timeTextColor = "text-theme-muted";
  let pulseEffect = false;

  if (!isHistory) {
    if (elapsedMinutes >= 15) {
      headerColor = "bg-[#3a1a1a]"; // critical red tint
      timeTextColor = "text-red-500 font-bold";
      pulseEffect = true;
    } else if (elapsedMinutes >= 10) {
      headerColor = "bg-[#332b12]"; // warning yellow tint
      timeTextColor = "text-yellow-500 font-bold";
    } else if (elapsedMinutes < 5) {
      timeTextColor = "text-green-500 font-bold"; // fresh
    }
  }

  return (
    <div className={`w-full bg-theme-card rounded-2xl overflow-hidden shadow-lg border-2 flex flex-col h-full transform transition-all ${pulseEffect ? "border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]" : "border-theme-border"}`}>
      
      {/* Dynamic Header */}
      <div className={`${headerColor} p-4 flex justify-between items-center border-b border-theme-border transition-colors`}>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-theme-text font-black text-2xl">Mesa {order.table?.tableNo || "?"}</h1>
            {isHistory && <span className="bg-[#142636] text-blue-400 text-[10px] px-2 py-0.5 rounded-full font-bold">HISTORIAL</span>}
          </div>
          <p className="text-theme-muted text-sm truncate max-w-[120px]" title={order.customerDetails?.name}>
             {order.customerDetails?.name || "Sin nombre"}
          </p>
        </div>
        
        <div className="text-right flex flex-col items-end">
          <div className={`flex items-center gap-1.5 ${timeTextColor} bg-black/40 px-3 py-1.5 rounded-lg`}>
             <FaClock size={12} />
             <p className="text-sm">
                {isHistory ? "Cerrada" : `${elapsedMinutes} min`}
             </p>
          </div>
        </div>
      </div>

      {/* Interactive Item List */}
      <div className="p-4 flex-1 overflow-y-auto min-h-[150px]">
        <h2 className="text-theme-muted text-[11px] font-bold mb-3 border-b border-theme-border pb-2 uppercase tracking-widest text-left">
          Cantidades
        </h2>
        <ul className="space-y-4">
          {order.items.map((item, index) => {
            const isChecked = checkedItems.includes(index);
            return (
              <li 
                key={index} 
                onClick={() => toggleItem(index)}
                className={`flex justify-between items-start transition-all cursor-${isPreparing ? 'pointer' : 'default'}`}
              >
                 <div className="flex gap-4 items-center w-full">
                   {/* Interactivity box */}
                   {isPreparing && (
                     <div className="text-2xl text-yellow-500 mr-1 opacity-80 hover:opacity-100 transition-opacity">
                        {isChecked ? <FaCheckSquare className="text-green-500" /> : <FaRegSquare />}
                     </div>
                   )}
                   
                   <span className={`font-black rounded px-3 py-1 text-lg shadow-inner ${isChecked ? 'bg-green-900/30 text-green-500' : 'bg-theme-elevated text-theme-text'}`}>
                     {item.quantity}x
                   </span>
                   
                   <div className="flex flex-col justify-center flex-1">
                      <span className={`text-lg font-medium leading-tight transition-colors ${isChecked ? 'text-[#888] line-through' : 'text-theme-text'}`}>
                         {item.name}
                      </span>
                   </div>
                 </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Contextual Action Area */}
      {!isHistory && (
        <div className="p-4 bg-theme-base border-t border-theme-border">
          {!isPreparing ? (
            <button 
               onClick={handleStartPreparing}
               disabled={statusMutation.isLoading}
               className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md text-lg uppercase tracking-wide"
            >
              <FaPlay size={18} />
              {statusMutation.isLoading ? "Procesando..." : "Empezar"}
            </button>
          ) : (
            <button 
               onClick={handleMarkAsReady}
               disabled={statusMutation.isLoading}
               className={`w-full font-black py-4 rounded-xl flex items-center justify-center gap-2 transition-all text-xl shadow-lg
                          ${allChecked 
                            ? "bg-green-500 hover:bg-green-400 text-gray-900 shadow-[0_0_20px_rgba(34,197,94,0.4)] scale-[1.02]" 
                            : "bg-green-900/50 text-green-500/50 hover:bg-green-800/60"}`}
            >
              <FaCheck size={24} />
              {statusMutation.isLoading ? "Procesando..." : "MARCAR LISTO"}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default BaristaOrderCard;
