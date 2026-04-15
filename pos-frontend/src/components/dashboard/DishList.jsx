import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getDishes, deleteDish } from "../../https";
import { enqueueSnackbar } from "notistack";
import { FaEdit, FaTrash } from "react-icons/fa";

const DishList = ({ onEdit, onAdd }) => {
  const queryClient = useQueryClient();
  const { data: res, isLoading } = useQuery({ queryKey: ["dishes"], queryFn: getDishes });
  const dishes = res?.data?.data || [];

  const delMutation = useMutation({
    mutationFn: (id) => deleteDish(id),
    onSuccess: (res) => {
      enqueueSnackbar("Plato eliminado", { variant: "success" });
      queryClient.invalidateQueries(["dishes"]);
    },
    onError: (error) => enqueueSnackbar("Error al eliminar", { variant: "error" })
  });

  const handleDelete = (id) => {
    if(window.confirm("¿Estás seguro de eliminar este plato?")) delMutation.mutate(id);
  };

  if (isLoading) return <div className="text-white p-6 justify-center flex">Cargando platos...</div>;

  return (
    <div className="container mx-auto py-2 px-6 md:px-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-[#f5f5f5] text-xl font-semibold">Listado de Platos</h2>
        <button onClick={onAdd} className="bg-[#1a1a1a] hover:bg-[#262626] px-4 py-2 rounded-lg text-[#f5f5f5] font-semibold text-sm flex items-center gap-2">
          Añadir Plato +
        </button>
      </div>
      <div className="bg-[#1a1a1a] rounded-lg overflow-hidden">
        <table className="w-full text-left text-[#ababab]">
          <thead className="bg-[#1f1f1f] text-[#f5f5f5]">
            <tr>
              <th className="p-4">Nombre</th>
              <th className="p-4">Categoría</th>
              <th className="p-4">Tipo</th>
              <th className="p-4">Precio (Bs)</th>
              <th className="p-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {dishes.map((d) => (
              <tr key={d._id} className="border-b border-[#262626] hover:bg-[#262626]">
                <td className="p-4 font-semibold text-white">{d.name}</td>
                <td className="p-4">
                  {d.category ? <span>{d.category.icon} {d.category.name}</span> : <span className="text-red-400">Sin Categoría</span>}
                </td>
                <td className="p-4">{d.type}</td>
                <td className="p-4 font-bold text-yellow-400">Bs {d.price.toFixed(2)}</td>
                <td className="p-4 text-center">
                  <button onClick={() => onEdit(d)} className="text-blue-400 hover:text-blue-300 mr-4"><FaEdit size={18} /></button>
                  <button onClick={() => handleDelete(d._id)} className="text-red-400 hover:text-red-300"><FaTrash size={18} /></button>
                </td>
              </tr>
            ))}
            {dishes.length === 0 && (
               <tr><td colSpan="5" className="p-4 text-center">No hay platos registrados</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DishList;
