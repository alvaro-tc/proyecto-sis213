const { calculateOrderTotals, TAX_RATE } = require('../../utils/orderCalculations');

describe('calculateOrderTotals', () => {
  test('calcula subtotal, impuesto (13%) y totalWithTax correctamente', () => {
    const items = [
      { price: 20, quantity: 2 },
      { price: 15, quantity: 1 },
    ];
    const result = calculateOrderTotals(items);
    expect(result.subtotal).toBe(55);
    expect(result.tax).toBeCloseTo(7.15, 2);
    expect(result.totalWithTax).toBeCloseTo(62.15, 2);
  });

  test('retorna ceros para carrito vacío', () => {
    const result = calculateOrderTotals([]);
    expect(result.subtotal).toBe(0);
    expect(result.tax).toBe(0);
    expect(result.totalWithTax).toBe(0);
  });

  test('calcula correctamente con un solo ítem', () => {
    const result = calculateOrderTotals([{ price: 100, quantity: 3 }]);
    expect(result.subtotal).toBe(300);
    expect(result.tax).toBeCloseTo(39, 2);
    expect(result.totalWithTax).toBeCloseTo(339, 2);
  });

  test('TAX_RATE es 0.13', () => {
    expect(TAX_RATE).toBe(0.13);
  });
});
