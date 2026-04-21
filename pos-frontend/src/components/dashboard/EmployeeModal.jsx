import React, { useState } from "react";
import { motion } from "framer-motion";
import { IoMdClose } from "react-icons/io";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { register } from "../../https";
import { enqueueSnackbar } from "notistack";

const EmployeeModal = ({ setIsEmployeeModalOpen }) => {
  const queryClient = useQueryClient();
  const [employeeData, setEmployeeData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "waiter"
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEmployeeData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    employeeMutation.mutate(employeeData);
  };

  const employeeMutation = useMutation({
    mutationFn: (reqData) => register(reqData),
    onSuccess: (res) => {
      setIsEmployeeModalOpen(false);
      enqueueSnackbar("Empleado añadido exitosamente", { variant: "success" });
      queryClient.invalidateQueries(["users"]);
    },
    onError: (error) => {
      const data = error.response?.data || {};
      enqueueSnackbar(data.message || "Error al añadir empleado", { variant: "error" });
    }
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="bg-theme-card p-6 rounded-lg shadow-lg w-96 relative flex flex-col max-h-[90vh]"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-theme-text text-xl font-semibold">Añadir Empleado</h2>
          <button onClick={() => setIsEmployeeModalOpen(false)} className="text-theme-text hover:text-red-500">
            <IoMdClose size={24} />
          </button>
        </div>

        <div className="overflow-y-auto pr-2 custom-scrollbar">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-theme-muted mb-2 text-sm font-medium">Nombre</label>
              <input
                type="text"
                name="name"
                value={employeeData.name}
                onChange={handleInputChange}
                className="w-full bg-theme-base text-theme-text rounded-lg p-3 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-theme-muted mb-2 text-sm font-medium">Email</label>
              <input
                type="email"
                name="email"
                value={employeeData.email}
                onChange={handleInputChange}
                className="w-full bg-theme-base text-theme-text rounded-lg p-3 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-theme-muted mb-2 text-sm font-medium">Teléfono</label>
              <input
                type="text"
                name="phone"
                value={employeeData.phone}
                onChange={handleInputChange}
                className="w-full bg-theme-base text-theme-text rounded-lg p-3 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-theme-muted mb-2 text-sm font-medium">Contraseña Inicial</label>
              <input
                type="text"
                name="password"
                value={employeeData.password}
                onChange={handleInputChange}
                className="w-full bg-theme-base text-theme-text rounded-lg p-3 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-theme-muted mb-2 text-sm font-medium">Rol</label>
              <select
                name="role"
                value={employeeData.role}
                onChange={handleInputChange}
                className="w-full bg-theme-base text-theme-text rounded-lg p-3 focus:outline-none"
              >
                <option value="admin">Administrador / Cajero</option>
                <option value="waiter">Mesero</option>
                <option value="barista">Barista / Cocina</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full mt-6 py-3 text-lg rounded-lg bg-yellow-400 text-gray-900 font-bold hover:bg-yellow-500"
            >
              Crear Empleado
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default EmployeeModal;
