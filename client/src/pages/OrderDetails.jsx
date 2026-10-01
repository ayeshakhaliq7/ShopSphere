import { Link, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { orderService } from '../services';
import { getErrorMessage } from '../services/api';
import { useToast } from '../context/ToastContext';
import { money, shortDate } from '../utils/format';
import { Spinner } from '../components/Skeleton';
import StatePanel from '../components/StatePanel';
import StatusBadge from '../components/StatusBadge';
import useDocumentTitle from '../hooks/useDocumentTitle';

const STEPS = ['Pending', 'Processing', 'Shipped', 'Delivered'];

export default function OrderDetails() {
  useDocumentTitle('Order details');
  const { id } = useParams();
  const toast = useToast();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const load = () => orderService.get(id).then((r) => setOrder(r.order)).catch((e) => setError(getErrorMessage(e)));
  useEffect(() => { load(); }, [id]);

  if (error) return <StatePanel tone="error" title="Order not found" message={error} actionLabel="Back to my orders" actionTo="/account?tab=orders" />;
  if (!order) return <Spinner label="Loading order" />;

  const cancel = async () => {
    if (!window.confirm('Cancel this order? This cannot be undone.')) return;
    setCancelling(true);
    try {
      await orderService.cancel(order._id);
      toast.success('Order cancelled.');
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setCancelling(false);
    }
  };

  const stepIndex = STEPS.indexOf(order.status);

  return (
    <div className="container" style={{ maxWidth: 760, padding: '40px 24px 80px' }}>
      <Link to="/account?tab=orders" className="small muted">&larr; Back to my orders</Link>
      <div className="admin-head" style={{ marginTop: 10 }}>
        <div>
          <h1 style={{ fontSize: 24, marginBottom: 4 }}>Order {order.orderNumber}</h1>
          <p className="small muted" style={{ margin: 0 }}>Placed {shortDate(order.createdAt)}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {order.status !== 'Cancelled' && (
        <div className="panel" style={{ display: 'flex', justifyContent: 'space-between' }}>
          {STEPS.map((s, i) => (
            <div key={s} style={{ textAlign: 'center', flex: 1, opacity: i <= stepIndex ? 1 : 0.4 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: i <= stepIndex ? 'var(--pine)' : 'var(--line)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px', fontSize: 13, fontWeight: 700 }}>{i + 1}</div>
              <span className="small">{s}</span>
            </div>
          ))}
        </div>
      )}

      <div className="panel">
        <h3 style={{ marginTop: 0, fontSize: 16 }}>Items</h3>
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

      <div className="panel">
        <h3 style={{ marginTop: 0, fontSize: 16 }}>Shipping details</h3>
        <p style={{ margin: 0 }}>{order.shippingAddress.fullName}<br />{order.shippingAddress.address}, {order.shippingAddress.city} {order.shippingAddress.postalCode}<br />{order.shippingAddress.phone} · {order.shippingAddress.email}</p>
      </div>

      {order.status === 'Pending' && (
        <button className="btn btn-danger" onClick={cancel} disabled={cancelling}>{cancelling ? 'Cancelling…' : 'Cancel order'}</button>
      )}
    </div>
  );
}
