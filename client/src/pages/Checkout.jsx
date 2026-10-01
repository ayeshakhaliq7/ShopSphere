import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services';
import { getErrorMessage } from '../services/api';
import { money } from '../utils/format';
import useDocumentTitle from '../hooks/useDocumentTitle';

export default function Checkout() {
  useDocumentTitle('Checkout');
  const cart = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [address, setAddress] = useState({
    fullName: user?.name || '', email: user?.email || '', phone: '', address: '', city: '', postalCode: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('demo-card');
  const [card, setCard] = useState({ number: '', expiry: '', cvc: '' });
  const [error, setError] = useState(null);
  const [placing, setPlacing] = useState(false);

  if (cart.items.length === 0) return <Navigate to="/cart" replace />;

  const set = (key) => (e) => setAddress((a) => ({ ...a, [key]: e.target.value }));

  const placeOrder = async (e) => {
    e.preventDefault();
    setError(null); setPlacing(true);
    try {
      const { order } = await orderService.create({
        items: cart.items.map((i) => ({ product: i.id, quantity: i.quantity })),
        shippingAddress: address,
        paymentMethod,
      });
      cart.clear();
      navigate(`/order-confirmation/${order._id}`);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not place your order.'));
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="container cart-layout">
      <div>
        <h1 style={{ fontSize: 26, marginBottom: 20 }}>Checkout</h1>
        {error && <div className="form-alert" role="alert">{error}</div>}
        <form onSubmit={placeOrder} noValidate id="checkout-form">
          <div className="panel">
            <h3 style={{ marginTop: 0, fontSize: 17 }}>Shipping information</h3>
            <div className="field-row">
              <div className="field"><label htmlFor="fullName">Full name</label><input id="fullName" required value={address.fullName} onChange={set('fullName')} /></div>
              <div className="field"><label htmlFor="email">Email</label><input id="email" type="email" required value={address.email} onChange={set('email')} /></div>
            </div>
            <div className="field-row">
              <div className="field"><label htmlFor="phone">Phone</label><input id="phone" required placeholder="+1 555 010 2030" value={address.phone} onChange={set('phone')} /></div>
              <div className="field"><label htmlFor="postalCode">Postal code</label><input id="postalCode" required value={address.postalCode} onChange={set('postalCode')} /></div>
            </div>
            <div className="field"><label htmlFor="address">Address</label><input id="address" required value={address.address} onChange={set('address')} /></div>
            <div className="field"><label htmlFor="city">City</label><input id="city" required value={address.city} onChange={set('city')} /></div>
          </div>

          <div className="panel">
            <h3 style={{ marginTop: 0, fontSize: 17 }}>Payment method</h3>
            <div className="filter-group">
              <label><input type="radio" name="pay" checked={paymentMethod === 'demo-card'} onChange={() => setPaymentMethod('demo-card')} /> Demo credit / debit card</label>
              <label><input type="radio" name="pay" checked={paymentMethod === 'cash-on-delivery'} onChange={() => setPaymentMethod('cash-on-delivery')} /> Cash on delivery</label>
            </div>
            {paymentMethod === 'demo-card' && (
              <div style={{ marginTop: 14 }}>
                <p className="small muted" style={{ marginBottom: 12 }}>This is a demo payment form. No real card details are collected or sent anywhere.</p>
                <div className="field"><label htmlFor="cardNumber">Card number</label><input id="cardNumber" placeholder="4242 4242 4242 4242" required value={card.number} onChange={(e) => setCard((c) => ({ ...c, number: e.target.value }))} /></div>
                <div className="field-row">
                  <div className="field"><label htmlFor="expiry">Expiry</label><input id="expiry" placeholder="MM/YY" required value={card.expiry} onChange={(e) => setCard((c) => ({ ...c, expiry: e.target.value }))} /></div>
                  <div className="field"><label htmlFor="cvc">CVC</label><input id="cvc" placeholder="123" required value={card.cvc} onChange={(e) => setCard((c) => ({ ...c, cvc: e.target.value }))} /></div>
                </div>
              </div>
            )}
          </div>
        </form>
      </div>

      <aside className="summary-card">
        <h2 style={{ fontSize: 18, marginBottom: 16 }}>Order summary</h2>
        {cart.items.map((i) => (
          <div className="summary-row" key={i.id}><span>{i.name} × {i.quantity}</span><span>{money(i.price * i.quantity)}</span></div>
        ))}
        <div className="summary-row"><span>Subtotal</span><span>{money(cart.subtotal)}</span></div>
        <div className="summary-row"><span>Shipping</span><span>{cart.shipping === 0 ? 'Free' : money(cart.shipping)}</span></div>
        <div className="summary-row total"><span>Total</span><span>{money(cart.total)}</span></div>
        <button className="btn btn-primary btn-block btn-lg" style={{ marginTop: 16 }} form="checkout-form" disabled={placing}>
          {placing ? 'Placing order…' : `Place order — ${money(cart.total)}`}
        </button>
      </aside>
    </div>
  );
}
