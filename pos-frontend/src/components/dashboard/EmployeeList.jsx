import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUsers, deleteUser } from "../../https";
import { enqueueSnackbar } from "notistack";
import { FaTrash } from "react-icons/fa";
import { ConfirmDialog } from "../ui";

const EmployeeList = ({ onAdd }) => {
  const queryClient = useQueryClient();
  const [target, setTarget] = useState(null);
  const [roleFilter, setRoleFilter] = useState("all");
  const { data: res, isLoading } = useQuery({ queryKey: ["users"], queryFn: getUsers });
  const allUsers = res?.data?.data || [];

  const filteredUsers = roleFilter === "all"
    ? allUsers
    : allUsers.filter(u => u.role?.toLowerCase() === roleFilter.toLowerCase());

  const delMutation = useMutation({
    mutationFn: (id) => deleteUser(id),
    onSuccess: () => {
      enqueueSnackbar("Usuario eliminado", { variant: "success" });
      queryClient.invalidateQueries(["users"]);
      setTarget(null);
    },
    onError: () => enqueueSnackbar("Error al eliminar", { variant: "error" })
  });

  if (isLoading) return <div className="text-theme-text p-6 justify-center flex">Cargando usuarios...</div>;

  return (
    <div className="container mx-auto py-2 px-6 md:px-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-theme-text text-xl font-semibold">Lista de usuarios registrados</h2>
        <button onClick={onAdd} className="bg-theme-surface hover:bg-theme-card px-4 py-2 rounded-lg text-theme-text font-semibold text-sm flex items-center gap-2">
          Añadir Usuario +
        </button>
      </div>

      <div className="mb-4 flex gap-2">
        <label className="text-theme-text text-sm font-medium">Filtrar por rol:</label>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2 rounded-lg bg-theme-surface border border-theme-border text-theme-text text-sm focus:outline-none focus:ring-2 focus:ring-theme-accent"
        >
          <option value="all">Todos</option>
          <option value="admin">Admin</option>
          <option value="waiter">Meseros</option>
          <option value="barista">Baristas</option>
          <option value="customer">Clientes</option>
        </select>
      </div>

      <div className="bg-theme-surface rounded-lg overflow-hidden">
        <table className="w-full text-left text-theme-muted">
          <thead className="bg-theme-base text-theme-text">
            <tr>
              <th className="py-3 px-4">Nombre</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Teléfono</th>
              <th className="py-3 px-4">Rol</th>
              <th className="py-3 px-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user._id} className="border-b border-theme-border hover:bg-theme-card">
                <td className="py-3 px-4 text-theme-text font-medium">{user.name}</td>
                <td className="py-3 px-4">{user.email}</td>
                <td className="py-3 px-4">{user.phone}</td>
                <td className="py-3 px-4 capitalize">
                   <span className={`px-2 py-1 rounded-lg text-xs font-bold ${user.role === 'admin' ? 'bg-red-500/20 text-red-500' : user.role === 'barista' ? 'bg-orange-500/20 text-orange-400' : user.role === 'customer' ? 'bg-green-500/20 text-green-400' : user.role === 'waiter' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>
                     {user.role}
                   </span>
                </td>
                <td className="py-3 px-4 flex justify-center gap-3">
                  <button onClick={() => setTarget(user)} className="text-red-500 hover:text-red-400" title="Eliminar">
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        isOpen={!!target}
        onClose={() => setTarget(null)}
        onConfirm={() => target && delMutation.mutate(target._id)}
        isLoading={delMutation.isPending}
        title={`¿Eliminar a ${target?.name || "este usuario"}?`}
        description="Se eliminará la cuenta del usuario de forma permanente."
        confirmLabel="Eliminar usuario"
        variant="danger"
      />
    </div>
  );
};

export default EmployeeList;
