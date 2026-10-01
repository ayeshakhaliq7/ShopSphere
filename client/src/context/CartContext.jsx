import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { finalPrice, shippingFor } from '../utils/format';

const CartContext = createContext(null);
const CART_KEY = 'shopsphere_cart';

const load = () => {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch { return []; }
};

export function CartProvider({ children }) {
  const [items, setItems] = useState(load);

  useEffect(() => localStorage.setItem(CART_KEY, JSON.stringify(items)), [items]);

  const value = useMemo(() => {
    const subtotal = Math.round(items.reduce((s, i) => s + i.price * i.quantity, 0) * 100) / 100;
    const shipping = shippingFor(subtotal);
    return {
      items,
      count: items.reduce((s, i) => s + i.quantity, 0),
      subtotal,
      shipping,
      total: Math.round((subtotal + shipping) * 100) / 100,
      add: (product, quantity = 1) =>
        setItems((prev) => {
          const found = prev.find((i) => i.id === product._id);
          const nextQty = Math.min((found?.quantity || 0) + quantity, product.stock);
          const line = { id: product._id, name: product.name, image: product.images[0], price: finalPrice(product), stock: product.stock, quantity: nextQty };
          return found ? prev.map((i) => (i.id === line.id ? line : i)) : [...prev, line];
        }),
      setQuantity: (id, quantity) =>
        setItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity: Math.max(1, Math.min(quantity, i.stock)) } : i))),
      remove: (id) => setItems((prev) => prev.filter((i) => i.id !== id)),
      clear: () => setItems([]),
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
