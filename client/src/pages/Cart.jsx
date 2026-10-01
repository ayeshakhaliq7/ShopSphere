import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { money } from '../utils/format';
import StatePanel from '../components/StatePanel';
import { MinusIcon, PlusIcon, TrashIcon } from '../components/Icons';
import useDocumentTitle from '../hooks/useDocumentTitle';

export default function Cart() {
  useDocumentTitle('Your Cart');
  const cart = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (cart.items.length === 0) {
    return (
      <StatePanel
        icon="🛒"
        title="Your cart is empty"
        message="Looks like you haven't added anything yet. Explore the shop to find something you'll love."
        actionLabel="Continue shopping"
        actionTo="/shop"
      />
    );
  }

  const goToCheckout = () => navigate(user ? '/checkout' : '/login', { state: user ? undefined : { from: '/checkout' } });

  return (
    <div className="container cart-layout">
      <div>
        <h1 style={{ fontSize: 26, marginBottom: 6 }}>Your cart</h1>
        <p className="muted">{cart.count} item{cart.count !== 1 ? 's' : ''}</p>
        <div>
          {cart.items.map((item) => (
            <div className="cart-line" key={item.id}>
              <img src={item.image} alt={item.name} />
              <div>
                <Link to={`/product/${item.id}`} style={{ fontWeight: 700 }}>{item.name}</Link>
                <div className="cart-line-actions">
                  <div className="qty-control">
                    <button type="button" aria-label="Decrease quantity" onClick={() => cart.setQuantity(item.id, item.quantity - 1)}><MinusIcon width={14} height={14} /></button>
                    <span>{item.quantity}</span>
                    <button type="button" aria-label="Increase quantity" disabled={item.quantity >= item.stock} onClick={() => cart.setQuantity(item.id, item.quantity + 1)}><PlusIcon width={14} height={14} /></button>
                  </div>
                  <button type="button" className="linklike" style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--danger)' }} onClick={() => cart.remove(item.id)}>
                    <TrashIcon width={16} height={16} /> Remove
                  </button>
                </div>
              </div>
              <strong>{money(item.price * item.quantity)}</strong>
            </div>
          ))}
        </div>
        <Link to="/shop" className="btn btn-ghost" style={{ marginTop: 20 }}>&larr; Continue shopping</Link>
      </div>

      <aside className="summary-card">
        <h2 style={{ fontSize: 18, marginBottom: 16 }}>Order summary</h2>
        <div className="summary-row"><span>Subtotal</span><span>{money(cart.subtotal)}</span></div>
        <div className="summary-row"><span>Shipping</span><span>{cart.shipping === 0 ? 'Free' : money(cart.shipping)}</span></div>
        {cart.shipping > 0 && <p className="small muted">Add {money(100 - cart.subtotal)} more for free shipping.</p>}
        <div className="summary-row total"><span>Total</span><span>{money(cart.total)}</span></div>
        <button className="btn btn-primary btn-block btn-lg" style={{ marginTop: 16 }} onClick={goToCheckout}>Proceed to Checkout</button>
      </aside>
    </div>
  );
}
