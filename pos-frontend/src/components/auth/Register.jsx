import React, { useState } from "react";
import { register } from "../../https";
import { useMutation } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { Button, Input } from "../ui";
import { registerSchema, flattenZodErrors } from "../../schemas/auth";

const ROLES = [
  { value: "waiter", label: "Mesero" },
  { value: "barista", label: "Barista" },
  { value: "admin", label: "Admin" },
];

const Register = ({ setIsRegister }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "",
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: undefined });
    }
  };

  const registerMutation = useMutation({
    mutationFn: (reqData) => register(reqData),
    onSuccess: (res) => {
      enqueueSnackbar(res.data.message, { variant: "success" });
      setFormData({ name: "", email: "", phone: "", password: "", role: "" });
      setTimeout(() => setIsRegister(false), 1500);
    },
    onError: (error) => {
      const message =
        error?.response?.data?.message || "No se pudo registrar el usuario.";
      enqueueSnackbar(message, { variant: "error" });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = registerSchema.safeParse(formData);
    if (!result.success) {
      setErrors(flattenZodErrors(result.error));
      return;
    }
    setErrors({});
    registerMutation.mutate(result.data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Input
        label="Nombre del Empleado"
        type="text"
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Nombre completo"
        error={errors.name}
      />
      <Input
        label="Correo del Empleado"
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="empleado@cafeteria5.com"
        error={errors.email}
      />
      <Input
        label="Teléfono"
        type="tel"
        name="phone"
        value={formData.phone}
        onChange={handleChange}
        placeholder="71234567"
        error={errors.phone}
      />
      <Input
        label="Contraseña"
        type="password"
        name="password"
        value={formData.password}
        onChange={handleChange}
        placeholder="Mínimo 6 caracteres"
        error={errors.password}
      />
      <div>
        <label className="block text-theme-muted mb-2 text-sm font-medium">
          Elija su rol
        </label>
        <div className="flex gap-3">
          {ROLES.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() =>
                setFormData({ ...formData, role: value }) ||
                setErrors({ ...errors, role: undefined })
              }
              className={`flex-1 px-4 py-3 rounded-lg border text-sm font-medium transition-colors ${
                formData.role === value
                  ? "bg-theme-brand text-theme-brand-fg border-theme-brand shadow-sm"
                  : "bg-theme-base text-theme-muted border-theme-border hover:bg-theme-elevated hover:text-theme-text"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {errors.role && (
          <p className="text-red-500 text-xs mt-1">{errors.role}</p>
        )}
      </div>
      <Button
        type="submit"
        fullWidth
        size="lg"
        disabled={registerMutation.isPending}
        className="mt-2"
      >
        {registerMutation.isPending ? "Registrando…" : "Registrarse"}
      </Button>
    </form>
  );
};

export default Register;
