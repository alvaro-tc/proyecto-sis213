import { describe, it, expect } from "vitest";
import { loginSchema, registerSchema, flattenZodErrors } from "./auth";

describe("loginSchema", () => {
  it("acepta email y password válidos", () => {
    const r = loginSchema.safeParse({ email: "a@b.com", password: "x" });
    expect(r.success).toBe(true);
  });

  it("rechaza email inválido", () => {
    const r = loginSchema.safeParse({ email: "no-email", password: "x" });
    expect(r.success).toBe(false);
    expect(flattenZodErrors(r.error).email).toBeDefined();
  });

  it("rechaza password vacía", () => {
    const r = loginSchema.safeParse({ email: "a@b.com", password: "" });
    expect(r.success).toBe(false);
    expect(flattenZodErrors(r.error).password).toBeDefined();
  });
});

describe("registerSchema", () => {
  const valid = {
    name: "Juan Pérez",
    email: "juan@cafe.com",
    phone: "71234567",
    password: "secreto123",
    role: "waiter",
  };

  it("acepta payload completo", () => {
    expect(registerSchema.safeParse(valid).success).toBe(true);
  });

  it("rechaza rol inválido", () => {
    const r = registerSchema.safeParse({ ...valid, role: "Cashier" });
    expect(r.success).toBe(false);
    expect(flattenZodErrors(r.error).role).toBeDefined();
  });

  it("rechaza teléfono con caracteres no numéricos", () => {
    const r = registerSchema.safeParse({ ...valid, phone: "123-abc" });
    expect(r.success).toBe(false);
    expect(flattenZodErrors(r.error).phone).toBeDefined();
  });

  it("rechaza password de menos de 6 caracteres", () => {
    const r = registerSchema.safeParse({ ...valid, password: "abc" });
    expect(r.success).toBe(false);
    expect(flattenZodErrors(r.error).password).toBeDefined();
  });
});
