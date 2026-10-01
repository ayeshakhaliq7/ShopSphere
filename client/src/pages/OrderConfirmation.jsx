import { Link, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { orderService } from '../services';
import { getErrorMessage } from '../services/api';
import { money, shortDate } from '../utils/format';
import { Spinner } from '../components/Skeleton';
import StatePanel from '../components/StatePanel';
import { CheckIcon } from '../components/Icons';
import useDocumentTitle from '../hooks/useDocumentTitle';

export default function OrderConfirmation() {
  useDocumentTitle('Order confirmed');
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => { orderService.get(id).then((r) => setOrder(r.order)).catch((e) => setError(getErrorMessage(e))); }, [id]);

  if (error) return <StatePanel tone="error" title="Couldn't load this order" message={error} actionLabel="Back to home" actionTo="/" />;
  if (!order) return <Spinner label="Loading order" />;

  return (
    <div className="container" style={{ maxWidth: 720, padding: '56px 24px 80px' }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--pine-tint)', color: 'var(--pine-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <CheckIcon width={30} height={30} />
        </div>
        <h1 style={{ fontSize: 28 }}>Order confirmed</h1>
        <p className="muted">Thanks for shopping with ShopSphere — a confirmation has been &ldquo;sent&rdquo; to {order.shippingAddress.email}.</p>
      </div>

      <div className="panel">
        <div className="summary-row"><span>Order number</span><strong>{order.orderNumber}</strong></div>
        <div className="summary-row"><span>Order date</span><span>{shortDate(order.createdAt)}</span></div>
        <div className="summary-row"><span>Estimated delivery</span><span>{shortDate(order.estimatedDelivery)}</span></div>
        <div className="summary-row"><span>Payment method</span><span>{order.paymentMethod === 'demo-card' ? 'Demo card' : 'Cash on delivery'}</span></div>
      </div>

      <div className="panel">
        <h3 style={{ marginTop: 0, fontSize: 16 }}>Delivering to</h3>
        <p style={{ margin: 0 }}>{order.shippingAddress.fullName}<br />{order.shippingAddress.address}, {order.shippingAddress.city} {order.shippingAddress.postalCode}<br />{order.shippingAddress.phone}</p>
      </div>

      <div className="panel">
        <h3 style={{ marginTop: 0, fontSize: 16 }}>Order summary</h3>
        {order.products.map((p) => (
          <div className="cart-line" key={p.product} style={{ gridTemplateColumns: '60px 1fr auto' }}>
            <img src={p.image} alt={p.name} style={{ width: 60, height: 60 }} />
            <span>{p.name} × {p.quantity}</span>
            <strong>{money(p.price * p.quantity)}</strong>
          </div>
        ))}
        <div className="summary-row" style={{ marginTop: 10 }}><span>Subtotal</span><span>{money(order.itemsPrice)}</span></div>
        <div className="summary-row"><span>Shipping</span><span>{order.shippingPrice === 0 ? 'Free' : money(order.shippingPrice)}</span></div>
        <div className="summary-row total"><span>Total</span><span>{money(order.totalAmount)}</span></div>
      </div>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 12 }}>
        <Link className="btn btn-ghost" to="/shop">Continue shopping</Link>
        <Link className="btn btn-primary" to={`/orders/${order._id}`}>View order details</Link>
      </div>
    </div>
  );
}
