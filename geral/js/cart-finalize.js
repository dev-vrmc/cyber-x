function parsePriceToCents(priceString) {
  if (!priceString) return 0;
  const s = String(priceString).trim();
  const cleaned = s.replace(/[^0-9.,-]/g, '');
  const hasDot = cleaned.indexOf('.') !== -1;
  const hasComma = cleaned.indexOf(',') !== -1;
  let num = 0;
  if (hasDot && hasComma) num = Number(cleaned.replace(/\./g, '').replace(',', '.'));
  else if (hasComma) num = Number(cleaned.replace(',', '.'));
  else num = Number(cleaned);
  if (Number.isNaN(num)) return 0;
  return Math.round(num * 100);
}

function finalizeOrder() {
  const sess = window.AuthDemo.getSession();
  if (!sess) {
    localToast && localToast('Faça login antes de finalizar o pedido', 'error');
    return null;
  }

  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  if (!cart.length) {
    localToast && localToast('Carrinho vazio', 'error');
    return null;
  }

  const totalCents = cart.reduce((sum, i) => sum + (parsePriceToCents(i.price || '0') * (i.qty || 1)), 0);

  const order = {
    id: 'ord_' + Date.now(),
    createdAt: new Date().toISOString(),
    items: cart,
    totalCents,
    customer: { username: sess.username, role: sess.role },
    status: 'pending'
  };

  const orders = JSON.parse(localStorage.getItem('orders') || '[]');
  orders.unshift(order);
  localStorage.setItem('orders', JSON.stringify(orders));

  // limpa carrinho
  localStorage.removeItem('cart');
  window.dispatchEvent(new Event('orders:updated'));
  window.dispatchEvent(new Event('cart:updated'));

  localToast && localToast('Pedido finalizado', 'success');
  return order;
}

// expõe
window.CartFinalize = { finalizeOrder };
