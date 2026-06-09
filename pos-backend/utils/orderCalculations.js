const TAX_RATE = 0.13;

function calculateOrderTotals(items) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * TAX_RATE;
  const totalWithTax = subtotal + tax;
  return { subtotal, tax, totalWithTax };
}

module.exports = { calculateOrderTotals, TAX_RATE };
