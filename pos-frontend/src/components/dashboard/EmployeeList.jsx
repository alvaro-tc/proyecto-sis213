import React from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUsers, deleteUser } from "../../https";
import { enqueueSnackbar } from "notistack";
import { FaTrash } from "react-icons/fa";

const EmployeeList = ({ onAdd }) => {
  const queryClient = useQueryClient();
  const { data: res, isLoading } = useQuery({ queryKey: ["users"], queryFn: getUsers });
  const users = res?.data?.data || [];

  const delMutation = useMutation({
    mutationFn: (id) => deleteUser(id),
    onSuccess: () => {
      enqueueSnackbar("Empleado eliminado", { variant: "success" });
      queryClient.invalidateQueries(["users"]);
    },
    onError: () => enqueueSnackbar("Error al eliminar", { variant: "error" })
  });

  const handleDelete = (id) => {
    if(window.confirm("¿Estás seguro de eliminar este empleado?")) delMutation.mutate(id);
  };

  if (isLoading) return <div className="text-white p-6 justify-center flex">Cargando empleados...</div>;

  return (
    <div className="container mx-auto py-2 px-6 md:px-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-[#f5f5f5] text-xl font-semibold">Listado de Empleados</h2>
        <button onClick={onAdd} className="bg-[#1a1a1a] hover:bg-[#262626] px-4 py-2 rounded-lg text-[#f5f5f5] font-semibold text-sm flex items-center gap-2">
          Añadir Empleado +
        </button>
      </div>
      <div className="bg-[#1a1a1a] rounded-lg overflow-hidden">
        <table className="w-full text-left text-[#ababab]">
          <thead className="bg-[#1f1f1f] text-[#f5f5f5]">
            <tr>
              <th className="py-3 px-4">Nombre</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Teléfono</th>
              <th className="py-3 px-4">Rol</th>
              <th className="py-3 px-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} className="border-b border-[#333] hover:bg-[#262626]">
                <td className="py-3 px-4 text-white font-medium">{user.name}</td>
                <td className="py-3 px-4">{user.email}</td>
                <td className="py-3 px-4">{user.phone}</td>
                <td className="py-3 px-4 capitalize">
                   <span className={`px-2 py-1 rounded-lg text-xs font-bold ${user.role === 'admin' ? 'bg-red-500/20 text-red-500' : user.role === 'barista' ? 'bg-orange-500/20 text-orange-400' : 'bg-blue-500/20 text-blue-400'}`}>
                     {user.role}
                   </span>
                </td>
                <td className="py-3 px-4 flex justify-center gap-3">
                  <button onClick={() => handleDelete(user._id)} className="text-red-500 hover:text-red-400" title="Eliminar">
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeeList;
