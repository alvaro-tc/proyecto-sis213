import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getDishes, deleteDish } from "../../https";
import { enqueueSnackbar } from "notistack";
import { FaEdit, FaTrash } from "react-icons/fa";
import { MdInventory } from "react-icons/md";

const DishList = ({ onEdit, onAdd }) => {
  const queryClient = useQueryClient();
  const { data: res, isLoading } = useQuery({ queryKey: ["dishes"], queryFn: getDishes });
  const dishes = res?.data?.data || [];

  const delMutation = useMutation({
    mutationFn: (id) => deleteDish(id),
    onSuccess: () => {
      enqueueSnackbar("Producto eliminado", { variant: "success" });
      queryClient.invalidateQueries(["dishes"]);
    },
    onError: () => enqueueSnackbar("Error al eliminar", { variant: "error" }),
  });

  const handleDelete = (id) => {
    if (window.confirm("¿Estás seguro de eliminar este producto?")) delMutation.mutate(id);
  };

  if (isLoading) return <div className="text-theme-text p-6 justify-center flex">Cargando productos...</div>;

  return (
    <div className="container mx-auto py-2 px-6 md:px-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-theme-text text-xl font-semibold">Listado de Productos</h2>
        <button
          onClick={onAdd}
          className="bg-theme-surface hover:bg-theme-card px-4 py-2 rounded-lg text-theme-text font-semibold text-sm flex items-center gap-2"
        >
          Añadir Producto +
        </button>
      </div>
      <div className="bg-theme-surface rounded-lg overflow-hidden">
        <table className="w-full text-left text-theme-muted">
          <thead className="bg-theme-base text-theme-text">
            <tr>
              <th className="p-4">Nombre</th>
              <th className="p-4">Categoría</th>
              <th className="p-4">Tipo</th>
              <th className="p-4">Precio (Bs)</th>
              <th className="p-4">
                <span className="flex items-center gap-1">
                  <MdInventory size={14} /> Insumos
                </span>
              </th>
              <th className="p-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {dishes.map((d) => (
              <tr key={d._id} className="border-b border-theme-border hover:bg-theme-card">
                <td className="p-4 font-semibold text-theme-text">{d.name}</td>
                <td className="p-4">
                  {d.category ? (
                    <span>{d.category.icon} {d.category.name}</span>
                  ) : (
                    <span className="text-red-400">Sin Categoría</span>
                  )}
                </td>
                <td className="p-4">{d.type}</td>
                <td className="p-4 font-bold text-yellow-400">Bs {d.price.toFixed(2)}</td>
                <td className="p-4">
                  {d.insumosRequeridos?.length > 0 ? (
                    <div className="flex flex-col gap-0.5">
                      {d.insumosRequeridos.map((ir, i) => (
                        <span key={i} className="text-xs text-green-400">
                          {ir.insumo?.nombre || "?"} × {ir.cantidad} {ir.insumo?.unidad || ""}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-[#555]">Sin insumos</span>
                  )}
                </td>
                <td className="p-4 text-center">
                  <button onClick={() => onEdit(d)} className="text-blue-400 hover:text-blue-300 mr-4">
                    <FaEdit size={18} />
                  </button>
                  <button onClick={() => handleDelete(d._id)} className="text-red-400 hover:text-red-300">
                    <FaTrash size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {dishes.length === 0 && (
              <tr>
                <td colSpan="6" className="p-4 text-center">No hay productos registrados</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DishList;
