import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Correo inválido"),
  password: z.string().min(1, "La contraseña es obligatoria"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Nombre demasiado corto"),
  email: z.string().email("Correo inválido"),
  phone: z
    .string()
    .regex(/^\d{7,15}$/, "Teléfono inválido (solo dígitos, 7-15)"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
  role: z.enum(["customer"]).default("customer"),
});

export const flattenZodErrors = (error) => {
  const out = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (key && !out[key]) out[key] = issue.message;
  }
  return out;
};
