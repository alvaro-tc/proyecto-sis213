import React from "react";
import { FaCheckDouble, FaLongArrowAltRight } from "react-icons/fa";
import { FaCircle } from "react-icons/fa";
import { formatDateAndTime, getAvatarName } from "../../utils/index";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateOrderStatus } from "../../https";
import { enqueueSnackbar } from "notistack";

const OrderCard = ({ key, order }) => {
  const queryClient = useQueryClient();

  const statusMutation = useMutation({
    mutationFn: (reqData) => updateOrderStatus(reqData),
    onSuccess: () => {
      enqueueSnackbar("Pedido entregado a mesa", { variant: "success" });
      queryClient.invalidateQueries(["orders"]);
    },
    onError: () => {
      enqueueSnackbar("Error al actualizar la orden", { variant: "error" });
    }
  });

  const handleDeliver = () => {
    statusMutation.mutate({ orderId: order._id, orderStatus: "Completed" });
  };
  console.log(order);
  return (
    <div key={key} className="w-full h-fit bg-[#262626] p-5 rounded-2xl shadow-sm border border-[#333] flex flex-col gap-4">
      {/* Encabezado: Info de Cliente y Estado */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#f6b100] text-gray-900 font-bold text-lg shrink-0">
            {getAvatarName(order.customerDetails.name)}
          </div>
          <div className="flex flex-col items-start min-w-0">
            <h1 className="text-white text-base md:text-lg font-bold truncate w-full">
              {order.customerDetails.name}
            </h1>
            <p className="text-[#ababab] text-xs font-medium">#{Math.floor(new Date(order.orderDate).getTime()).toString().slice(-6)} / Para servir</p>
          </div>
        </div>
        <div className="shrink-0 mt-1">
          {order.orderStatus === "Ready" ? (
             <p className="text-green-500 bg-[#143627] px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center"><FaCheckDouble className="mr-1" /> LISTO</p>
          ) : order.orderStatus === "Completed" ? (
             <p className="text-blue-500 bg-[#142636] px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center"><FaCheckDouble className="mr-1" /> ENTREGADO</p>
          ) : (
             <p className="text-yellow-500 bg-[#3d3215] px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center"><FaCircle className="mr-1 text-[8px]" /> EN PREP.</p>
          )}
        </div>
      </div>

      {/* Recuadro de Info y Tiempos */}
      <div className="bg-[#1f1f1f] rounded-xl p-3 flex flex-col gap-2 mt-1">
        <div className="flex justify-between items-center">
          <p className="text-[#ababab] text-xs flex items-center"><FaLongArrowAltRight className="text-yellow-500 mr-2" /> Mesa</p>
          <p className="font-bold text-white text-sm">{order.table.tableNo}</p>
        </div>
        <hr className="border-[#2a2a2a]" />
        <div className="flex justify-between items-center">
          <p className="text-[#ababab] text-xs">Total Artículos</p>
          <p className="font-bold text-white text-sm">{order.items.length}</p>
        </div>
        <hr className="border-[#2a2a2a]" />
        <div className="flex justify-between items-center">
          <p className="text-[#ababab] text-xs">Apertura</p>
          <p className="font-bold text-white text-xs">{formatDateAndTime(order.orderDate)}</p>
        </div>
      </div>

      {/* Footer Total */}
      <div className="flex items-end justify-between pt-1">
        <h1 className="text-[#ababab] text-sm font-semibold">Total abonar:</h1>
        <p className="text-[#f6b100] text-2xl font-black">Bs {order.bills.totalWithTax.toFixed(2)}</p>
      </div>

      {order.orderStatus === "Ready" && (
        <button 
           onClick={handleDeliver} 
           disabled={statusMutation.isLoading}
           className="w-full mt-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg transition-colors text-sm shadow-md"
        >
          {statusMutation.isLoading ? "Procesando..." : "Llevar a Mesa"}
        </button>
      )}
    </div>
  );
};

export default OrderCard;
