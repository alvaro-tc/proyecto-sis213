import React from "react";
import { FaCheckDouble, FaLongArrowAltRight, FaCircle } from "react-icons/fa";
import { getAvatarName } from "../../utils/index";

// 1. QUITAMOS 'key' de aquí. React no te deja usarlo como prop.
const OrderList = ({ order }) => {
  
  // 2. Seguridad: Si por algún motivo 'order' es null, no rompemos la app
  if (!order) return null;

  return (
    <div className="flex items-center gap-5 mb-3">
      <button className="bg-[#f6b100] p-3 text-xl font-bold rounded-lg shrink-0">
        {/* 3. Usamos ?. por si acaso no hay nombre */}
        {getAvatarName(order?.customerDetails?.name || "U")}
      </button>

      <div className="flex items-center justify-between w-full">
        <div className="flex flex-col items-start gap-1 min-w-0">
          <h1 className="text-theme-text text-lg font-semibold tracking-wide truncate w-full">
            {order?.customerDetails?.name || "Cliente"}
          </h1>
          <p className="text-theme-muted text-sm">
            {order?.items?.length || 0} Artículos
          </p>
        </div>

        <h1 className="text-[#f6b100] font-semibold border border-[#f6b100] rounded-lg p-1 whitespace-nowrap mx-2">
          Mesa <FaLongArrowAltRight className="text-theme-muted ml-2 inline" />{" "}
          {/* 4. EL FIX CRÍTICO: Optional chaining para la mesa */}
          {order?.table?.tableNo || "S/N"}
        </h1>

        <div className="flex flex-col items-end gap-2 shrink-0">
          {order?.orderStatus === "Ready" ? (
            <p className="text-green-600 bg-[#2e4a40] px-2 py-1 rounded-lg text-xs font-bold">
              <FaCheckDouble className="inline mr-2" /> LISTO
            </p>
          ) : (
            <p className="text-yellow-600 bg-[#4a452e] px-2 py-1 rounded-lg text-xs font-bold">
              <FaCircle className="inline mr-1 text-[8px]" /> 
              {order?.orderStatus === "In Progress" ? "EN PROGRESO" : (order?.orderStatus || "PENDIENTE")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderList;