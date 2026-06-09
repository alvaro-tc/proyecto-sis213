const {
  registerSchema,
  loginSchema,
  orderSchema,
  insumoSchema,
} = require('../../schemas');

describe('registerSchema', () => {
  const valid = {
    name: 'María Cajera',
    email: 'maria@cafe.bo',
    phone: '70011111',
    password: 'secret123',
    role: 'cashier',
  };

  test('acepta datos válidos', () => {
    const r = registerSchema.safeParse({ ...valid, role: 'waiter' });
    expect(r.success).toBe(true);
  });

  test('rechaza email inválido', () => {
    const r = registerSchema.safeParse({ ...valid, email: 'no-es-email', role: 'admin' });
    expect(r.success).toBe(false);
  });

  test('rechaza password menor a 6 caracteres', () => {
    const r = registerSchema.safeParse({ ...valid, password: '123', role: 'barista' });
    expect(r.success).toBe(false);
  });

  test('rechaza rol desconocido', () => {
    const r = registerSchema.safeParse({ ...valid, role: 'superadmin' });
    expect(r.success).toBe(false);
  });

  test('acepta todos los roles válidos', () => {
    for (const role of ['waiter', 'barista', 'admin', 'customer']) {
      const r = registerSchema.safeParse({ ...valid, role });
      expect(r.success).toBe(true);
    }
  });
});

describe('loginSchema', () => {
  test('acepta email y password válidos', () => {
    const r = loginSchema.safeParse({ email: 'user@cafe.bo', password: 'abc' });
    expect(r.success).toBe(true);
  });

  test('rechaza email inválido', () => {
    const r = loginSchema.safeParse({ email: 'invalid', password: 'abc' });
    expect(r.success).toBe(false);
  });

  test('rechaza password vacío', () => {
    const r = loginSchema.safeParse({ email: 'user@cafe.bo', password: '' });
    expect(r.success).toBe(false);
  });

  test('rechaza objeto sin campos', () => {
    const r = loginSchema.safeParse({});
    expect(r.success).toBe(false);
  });
});

describe('orderSchema', () => {
  const validOrder = {
    customerDetails: { name: 'Carlos', phone: '70099999', guests: 2 },
    bills: { total: 55, tax: 7.15, totalWithTax: 62.15 },
    items: [{ dishId: '507f1f77bcf86cd799439011', quantity: 2, price: 20 }],
    paymentMethod: 'Efectivo',
  };

  test('acepta una orden válida', () => {
    const r = orderSchema.safeParse(validOrder);
    expect(r.success).toBe(true);
  });

  test('rechaza orden sin campo bills', () => {
    const { bills, ...withoutBills } = validOrder;
    const r = orderSchema.safeParse(withoutBills);
    expect(r.success).toBe(false);
  });

  test('rechaza bills con tax negativo', () => {
    const r = orderSchema.safeParse({
      ...validOrder,
      bills: { total: 55, tax: -1, totalWithTax: 54 },
    });
    expect(r.success).toBe(false);
  });

  test('acepta customerDetails con campos vacíos (tienen defaults)', () => {
    const r = orderSchema.safeParse({
      customerDetails: {},
      bills: { total: 20, tax: 2.6, totalWithTax: 22.6 },
    });
    expect(r.success).toBe(true);
    expect(r.data.customerDetails.name).toBe('');
    expect(r.data.customerDetails.guests).toBe(1);
  });
});

describe('insumoSchema', () => {
  const valid = {
    nombre: 'Café molido',
    unidad: 'gramos',
    stock: 500,
    stockMinimo: 100,
    stockMaximo: 2000,
    costoUnitario: 0.05,
  };

  test('acepta insumo válido', () => {
    expect(insumoSchema.safeParse(valid).success).toBe(true);
  });

  test('rechaza stock negativo', () => {
    expect(insumoSchema.safeParse({ ...valid, stock: -1 }).success).toBe(false);
  });

  test('rechaza nombre vacío', () => {
    expect(insumoSchema.safeParse({ ...valid, nombre: '' }).success).toBe(false);
  });
});
