import React, { useState } from "react";
import { register, login } from "../../https";
import { useMutation } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setUser } from "../../redux/slices/userSlice";
import { Button, Input } from "../ui";
import { registerSchema, flattenZodErrors } from "../../schemas/auth";

// El registro público sólo permite crear cuentas de cliente.
// Los empleados (mesero, barista, admin) son creados desde el panel admin.
const Register = ({ setIsRegister }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
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
    onSuccess: async (res, variables) => {
      enqueueSnackbar("¡Cuenta creada! Iniciando sesión…", {
        variant: "success",
      });
      try {
        const loginRes = await login({
          email: variables.email,
          password: variables.password,
        });
        const { _id, name, email, phone, role } = loginRes.data.data;
        dispatch(setUser({ _id, name, email, phone, role }));
        navigate("/cliente");
      } catch (e) {
        // Si el auto-login falla, vuelve al formulario de login.
        setTimeout(() => setIsRegister(false), 800);
      }
    },
    onError: (error) => {
      const message =
        error?.response?.data?.message || "No se pudo registrar el usuario.";
      enqueueSnackbar(message, { variant: "error" });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = registerSchema.safeParse({ ...formData, role: "customer" });
    if (!result.success) {
      setErrors(flattenZodErrors(result.error));
      return;
    }
    setErrors({});
    registerMutation.mutate(result.data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="rounded-lg border border-theme-border bg-theme-base/60 px-3 py-2 text-xs text-theme-muted">
        El registro público es exclusivo para clientes. Los empleados son dados de alta por administración.
      </div>
      <Input
        label="Nombre completo"
        type="text"
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="¿Cómo te llamas?"
        error={errors.name}
      />
      <Input
        label="Correo"
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="tucorreo@ejemplo.com"
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
      <Button
        type="submit"
        fullWidth
        size="lg"
        disabled={registerMutation.isPending}
        className="mt-2"
      >
        {registerMutation.isPending ? "Creando cuenta…" : "Crear cuenta de cliente"}
      </Button>
    </form>
  );
};

export default Register;
