import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { login } from "../../https/index";
import { enqueueSnackbar } from "notistack";
import { useDispatch } from "react-redux";
import { setUser } from "../../redux/slices/userSlice";
import { useNavigate } from "react-router-dom";
import { Button, Input } from "../ui";
import { loginSchema, flattenZodErrors } from "../../schemas/auth";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: undefined });
    }
  };

  const loginMutation = useMutation({
    mutationFn: (reqData) => login(reqData),
    onSuccess: (res) => {
      const { _id, name, email, phone, role } = res.data.data;
      dispatch(setUser({ _id, name, email, phone, role }));
      const target = role?.toLowerCase() === "customer" ? "/cliente" : "/home";
      navigate(target);
    },
    onError: (error) => {
      const message =
        error?.response?.data?.message ||
        "No se pudo iniciar sesión. Verifique su conexión.";
      enqueueSnackbar(message, { variant: "error" });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = loginSchema.safeParse(formData);
    if (!result.success) {
      setErrors(flattenZodErrors(result.error));
      return;
    }
    setErrors({});
    loginMutation.mutate(result.data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Input
        label="Correo de Empleado"
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="empleado@cafeteria5.com"
        error={errors.email}
        autoComplete="email"
      />
      <Input
        label="Contraseña"
        type="password"
        name="password"
        value={formData.password}
        onChange={handleChange}
        placeholder="••••••••"
        error={errors.password}
        autoComplete="current-password"
      />
      <Button
        type="submit"
        fullWidth
        size="lg"
        disabled={loginMutation.isPending}
        className="mt-2"
      >
        {loginMutation.isPending ? "Iniciando sesión…" : "Iniciar sesión"}
      </Button>
    </form>
  );
};

export default Login;
