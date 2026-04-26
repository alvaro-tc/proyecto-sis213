import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCategories, deleteCategory } from "../../https";
import { enqueueSnackbar } from "notistack";
import { FaEdit, FaTrash } from "react-icons/fa";

const CategoryList = ({ onEdit, onAdd }) => {
  const queryClient = useQueryClient();
  const { data: res, isLoading } = useQuery({ queryKey: ["categories"], queryFn: getCategories });
  const categories = res?.data?.data || [];

  const delMutation = useMutation({
    mutationFn: (id) => deleteCategory(id),
    onSuccess: (res) => {
      enqueueSnackbar("Categoría eliminada", { variant: "success" });
      queryClient.invalidateQueries(["categories"]);
    },
    onError: (error) => enqueueSnackbar("Error al eliminar", { variant: "error" })
  });

  const handleDelete = (id) => {
    if(window.confirm("¿Estás seguro de eliminar esta categoría?")) delMutation.mutate(id);
  };

  if (isLoading) return <div className="text-theme-text p-6 justify-center flex">Cargando categorías...</div>;

  return (
    <div className="container mx-auto py-2 px-6 md:px-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-theme-text text-xl font-semibold">Listado de Categorías</h2>
        <button onClick={onAdd} className="bg-theme-surface hover:bg-theme-card px-4 py-2 rounded-lg text-theme-text font-semibold text-sm flex items-center gap-2">
          Añadir Categoría +
        </button>
      </div>
      <div className="bg-theme-surface rounded-lg overflow-hidden">
        <table className="w-full text-left text-theme-muted">
          <thead className="bg-theme-base text-theme-text">
            <tr>
              <th className="p-4">Ícono</th>
              <th className="p-4">Nombre</th>
              <th className="p-4">Color Base</th>
              <th className="p-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c._id} className="border-b border-theme-border hover:bg-theme-card">
                <td className="p-4 text-2xl">{c.icon}</td>
                <td className="p-4 font-semibold text-theme-text">{c.name}</td>
                <td className="p-4">
                    <span className="w-6 h-6 inline-block rounded-full border border-theme-border align-middle" style={{backgroundColor: c.bgColor}}></span> {c.bgColor}
                </td>
                <td className="p-4 text-center">
                  <button onClick={() => onEdit(c)} className="text-blue-400 hover:text-blue-300 mr-4"><FaEdit size={18} /></button>
                  <button onClick={() => handleDelete(c._id)} className="text-red-400 hover:text-red-300"><FaTrash size={18} /></button>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr><td colSpan="4" className="p-4 text-center">No hay categorías registradas</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CategoryList;
