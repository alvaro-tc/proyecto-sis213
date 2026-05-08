const { z } = require("zod");

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "ID inválido");

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.union([
    z.string().regex(/^\d{7,15}$/),
    z.number().int().positive(),
  ]),
  password: z.string().min(6),
  role: z.enum(["waiter", "barista", "admin"]),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const tableSchema = z.object({
  tableNo: z.union([z.string().min(1), z.number()]),
  seats: z.number().int().positive().optional(),
  bgColor: z.string().optional(),
});

const tableUpdateSchema = z.object({
  status: z.enum(["Available", "Booked"]).optional(),
  orderId: z.union([objectId, z.null()]).optional(),
  seats: z.number().int().positive().optional(),
  tableNo: z.union([z.string().min(1), z.number()]).optional(),
  bgColor: z.string().optional(),
});

const categorySchema = z.object({
  name: z.string().min(1),
  bgColor: z.string().optional(),
  icon: z.string().optional(),
});

const dishSchema = z.object({
  name: z.string().min(1),
  price: z.number().nonnegative(),
  category: objectId,
  type: z.string().optional(),
  insumosRequeridos: z
    .array(
      z.object({
        insumo: objectId,
        cantidad: z.number().positive(),
      })
    )
    .optional(),
});

const orderSchema = z.object({
  customerDetails: z.object({
    name: z.string().min(1),
    phone: z.string().min(1),
    guests: z.number().int().nonnegative(),
  }),
  orderStatus: z
    .enum(["In Progress", "Preparing", "Ready", "Completed", "Cancelled"])
    .optional(),
  bills: z.object({
    total: z.number().nonnegative(),
    tax: z.number().nonnegative(),
    totalWithTax: z.number().nonnegative(),
  }),
  items: z.array(z.any()).default([]),
  table: objectId.optional(),
  paymentMethod: z.string().optional(),
  paymentData: z.any().optional(),
});

const orderUpdateSchema = z.object({
  orderStatus: z.enum(["In Progress", "Preparing", "Ready", "Completed", "Cancelled"]),
});

const insumoSchema = z.object({
  nombre: z.string().min(1),
  unidad: z.string().min(1),
  stock: z.number().nonnegative(),
  stockMinimo: z.number().positive(),
  stockMaximo: z.number().positive(),
  costoUnitario: z.number().nonnegative(),
  categoria: z.string().optional(),
  proveedor: z.string().optional(),
});

const consumoSchema = z.object({
  cantidad: z.number().positive(),
  descripcion: z.string().optional(),
});

const reponerSchema = z.object({
  cantidad: z.number().positive(),
});

module.exports = {
  registerSchema,
  loginSchema,
  tableSchema,
  tableUpdateSchema,
  categorySchema,
  dishSchema,
  orderSchema,
  orderUpdateSchema,
  insumoSchema,
  consumoSchema,
  reponerSchema,
};
