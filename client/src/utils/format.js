export const money = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n || 0);

export const shortDate = (d) =>
  new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

export const FREE_SHIPPING_THRESHOLD = 100;
export const FLAT_SHIPPING = 9.99;
export const shippingFor = (subtotal) => (subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING);

export const finalPrice = (p) => (p.discountPrice && p.discountPrice < p.price ? p.discountPrice : p.price);
export const discountPercent = (p) =>
  p.discountPrice && p.discountPrice < p.price ? Math.round((1 - p.discountPrice / p.price) * 100) : 0;
