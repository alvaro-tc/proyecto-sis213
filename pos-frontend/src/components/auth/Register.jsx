import React, { useState } from "react";
import { register } from "../../https";
import { useMutation } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";

const Register = ({setIsRegister}) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleSelection = (selectedRole) => {
    setFormData({ ...formData, role: selectedRole });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    registerMutation.mutate(formData);
  };

  const registerMutation = useMutation({
    mutationFn: (reqData) => register(reqData),
    onSuccess: (res) => {
      const { data } = res;
      enqueueSnackbar(data.message, { variant: "success" });
      setFormData({
        name: "",
        email: "",
        phone: "",
        password: "",
        role: "",
      });
      
      setTimeout(() => {
        setIsRegister(false);
      }, 1500);
    },
    onError: (error) => {
      const { response } = error;
      const message = response.data.message;
      enqueueSnackbar(message, { variant: "error" });
    },
  });

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          <label className="block text-theme-muted mb-2 text-sm font-medium">
            Nombre del Empleado
          </label>
          <div className="flex item-center rounded-lg p-5 px-4 bg-theme-base">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ingrese el nombre del empleado"
              className="bg-transparent flex-1 text-theme-text focus:outline-none"
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-theme-muted mb-2 mt-3 text-sm font-medium">
            Correo del Empleado
          </label>
          <div className="flex item-center rounded-lg p-5 px-4 bg-theme-base">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Ingrese el correo del empleado"
              className="bg-transparent flex-1 text-theme-text focus:outline-none"
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-theme-muted mb-2 mt-3 text-sm font-medium">
            Teléfono del Empleado
          </label>
          <div className="flex item-center rounded-lg p-5 px-4 bg-theme-base">
            <input
              type="number"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Ingrese el teléfono del empleado"
              className="bg-transparent flex-1 text-theme-text focus:outline-none"
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-theme-muted mb-2 mt-3 text-sm font-medium">
            Contraseña
          </label>
          <div className="flex item-center rounded-lg p-5 px-4 bg-theme-base">
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Ingrese la contraseña"
              className="bg-transparent flex-1 text-theme-text focus:outline-none"
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-theme-muted mb-2 mt-3 text-sm font-medium">
            Elija su rol
          </label>

          <div className="flex item-center gap-3 mt-4">
            {["Waiter", "Cashier", "Admin"].map((role) => {
              return (
                <button
                  key={role}
                  type="button"
                  onClick={() => handleRoleSelection(role)}
                  className={`bg-theme-base px-4 py-3 w-full rounded-lg text-theme-muted ${
                    formData.role === role ? "bg-indigo-700" : ""
                  }`}
                >
                  {role === "Waiter" ? "Mesero" : role === "Cashier" ? "Cajero" : "Admin"}
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="submit"
          className="w-full rounded-lg mt-6 py-3 text-lg bg-yellow-400 text-gray-900 font-bold"
        >
          Registrarse
        </button>
      </form>
    </div>
  );
};

export default Register;
