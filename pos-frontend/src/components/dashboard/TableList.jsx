import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTables, deleteTable } from "../../https";
import { enqueueSnackbar } from "notistack";
import { FaEdit, FaTrash } from "react-icons/fa";

const TableList = ({ onEdit, onAdd }) => {
  const queryClient = useQueryClient();
  const { data: res, isLoading } = useQuery({ queryKey: ["tables"], queryFn: getTables });
  const tables = res?.data?.data || [];

  const delMutation = useMutation({
    mutationFn: (id) => deleteTable(id),
    onSuccess: (res) => {
      enqueueSnackbar("Mesa eliminada", { variant: "success" });
      queryClient.invalidateQueries(["tables"]);
    },
    onError: (error) => enqueueSnackbar("Error al eliminar", { variant: "error" })
  });

  const handleDelete = (id) => {
    if(window.confirm("¿Estás seguro de eliminar esta mesa?")) delMutation.mutate(id);
  };

  if (isLoading) return <div className="text-theme-text p-6 justify-center flex">Cargando mesas...</div>;

  return (
    <div className="container mx-auto py-2 px-6 md:px-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-theme-text text-xl font-semibold">Listado de Mesas</h2>
        <button onClick={onAdd} className="bg-theme-surface hover:bg-theme-card px-4 py-2 rounded-lg text-theme-text font-semibold text-sm flex items-center gap-2">
          Añadir Mesa +
        </button>
      </div>
      <div className="bg-theme-surface rounded-lg overflow-hidden">
        <table className="w-full text-left text-theme-muted">
          <thead className="bg-theme-base text-theme-text">
            <tr>
              <th className="p-4">Nro Mesa</th>
              <th className="p-4">Asientos</th>
              <th className="p-4">Estado Actual</th>
              <th className="p-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {tables.map((t) => (
              <tr key={t._id} className="border-b border-theme-border hover:bg-theme-card">
                <td className="p-4 font-semibold text-theme-text">Mesa {t.tableNo}</td>
                <td className="p-4">{t.seats}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs ${t.status === 'Available' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                    {t.status === 'Available' ? 'Disponible' : 'Ocupada'}
                  </span>
                </td>
                <td className="p-4 text-center">
                  <button onClick={() => onEdit(t)} className="text-blue-400 hover:text-blue-300 mr-4"><FaEdit size={18} /></button>
                  <button onClick={() => handleDelete(t._id)} className="text-red-400 hover:text-red-300"><FaTrash size={18} /></button>
                </td>
              </tr>
            ))}
            {tables.length === 0 && (
              <tr><td colSpan="4" className="p-4 text-center">No hay mesas registradas</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TableList;
