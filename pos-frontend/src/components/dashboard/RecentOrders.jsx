import React from "react";
import { orders } from "../../constants";
import { GrUpdate } from "react-icons/gr";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { getOrders, updateOrderStatus } from "../../https/index";
import { formatDateAndTime } from "../../utils";

const RecentOrders = () => {
  const queryClient = useQueryClient();
  const handleStatusChange = ({orderId, orderStatus}) => {
    console.log(orderId)
    orderStatusUpdateMutation.mutate({orderId, orderStatus});
  };

  const orderStatusUpdateMutation = useMutation({
    mutationFn: ({orderId, orderStatus}) => updateOrderStatus({orderId, orderStatus}),
    onSuccess: (data) => {
      enqueueSnackbar("¡Estado del pedido actualizado con éxito!", { variant: "success" });
      queryClient.invalidateQueries(["orders"]); // Refresh order list
    },
    onError: () => {
      enqueueSnackbar("¡Error al actualizar el estado del pedido!", { variant: "error" });
    }
  })

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

  console.log(resData?.data?.data);
  const ordersList = resData?.data?.data?.data || [];

  return (
    <div className="container mx-auto bg-theme-card p-4 rounded-lg">
      <h2 className="text-theme-text text-xl font-semibold mb-4">
        Pedidos Recientes
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-theme-text">
          <thead className="bg-theme-elevated text-theme-muted">
            <tr>
              <th className="p-3">ID del Pedido</th>
              <th className="p-3">Cliente</th>
              <th className="p-3">Estado</th>
              <th className="p-3">Fecha y Hora</th>
              <th className="p-3">Artículos</th>
              <th className="p-3">Mesa N°</th>
              <th className="p-3">Total</th>
              <th className="p-3 text-center">Método de Pago</th>
            </tr>
          </thead>
          <tbody>
  {ordersList.length > 0 ? (
    ordersList.map((order, index) => (
      <tr key={order._id || index} className="border-b border-theme-border hover:bg-theme-elevated">
        <td className="p-4">#{order._id?.slice(-6) || "N/A"}</td>
        <td className="p-4">{order?.customerDetails?.name || "Cliente"}</td>
        <td className="p-4">
          <select
            className={`bg-theme-surface text-theme-text border border-theme-border p-2 rounded-lg focus:outline-none ${
              order.orderStatus === "Ready" ? "text-green-500" : "text-yellow-500"
            }`}
            value={order.orderStatus}
            onChange={(e) => handleStatusChange({orderId: order._id, orderStatus: e.target.value})}
          >
            <option value="In Progress">En Progreso</option>
            <option value="Ready">Listo</option>
            <option value="Completed">Completado</option>
          </select>
        </td>
        <td className="p-4">{formatDateAndTime(order.orderDate)}</td>
        <td className="p-4">{order?.items?.length || 0} Artículos</td>
        
        {/* PROTECCIÓN PARA LA MESA AQUÍ */}
        <td className="p-4">Mesa - {order?.table?.tableNo || "S/N"}</td>
        
        <td className="p-4">Bs {order?.bills?.totalWithTax || 0}</td>
        <td className="p-4">{order?.paymentMethod || "Efectivo"}</td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan="8" className="p-10 text-center text-theme-muted">
        No hay pedidos recientes.
      </td>
    </tr>
  )}
</tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentOrders;
