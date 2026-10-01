import { useEffect, useState } from 'react';
import { orderService } from '../../services';
import { getErrorMessage } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { money, shortDate } from '../../utils/format';
import StatusBadge from '../../components/StatusBadge';
import StatePanel from '../../components/StatePanel';
import { Spinner } from '../../components/Skeleton';
import Modal from '../../components/Modal';
import useDocumentTitle from '../../hooks/useDocumentTitle';

const STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

export default function AdminOrders() {
  useDocumentTitle('Admin — Orders');
  const toast = useToast();
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('');
  const [active, setActive] = useState(null);

  const load = () => orderService.list({ scope: 'all', status: filter || undefined }).then((r) => setOrders(r.orders)).catch((e) => setError(getErrorMessage(e)));
  useEffect(() => { load(); }, [filter]);

  const updateStatus = async (order, status) => {
    try {
      await orderService.updateStatus(order._id, status);
      toast.success(`Order ${order.orderNumber} marked ${status}.`);
      setActive(null);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div>
      <div className="admin-head">
        <h1 style={{ fontSize: 24, margin: 0 }}>Orders</h1>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {error && <StatePanel tone="error" title="Couldn't load orders" message={error} />}
      {!error && !orders && <Spinner label="Loading orders" />}
      {orders && orders.length === 0 && <StatePanel title="No orders found" message="Try a different status filter." />}
      {orders && orders.length > 0 && (
        <div className="panel">
          <table className="data-table">
            <thead><tr><th>Order ID</th><th>Customer</th><th>Date</th><th>Amount</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o._id}>
                  <td>{o.orderNumber}</td>
                  <td>{o.user?.name}<div className="small muted">{o.user?.email}</div></td>
                  <td>{shortDate(o.createdAt)}</td>
                  <td>{money(o.totalAmount)}</td>
                  <td><StatusBadge status={o.status} /></td>
                  <td><button className="btn btn-ghost btn-sm" onClick={() => setActive(o)}>Manage</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="data-cards">
            {orders.map((o) => (
              <div className="data-card" key={o._id}>
                <div className="data-card-row"><span>Order</span><span>{o.orderNumber}</span></div>
                <div className="data-card-row"><span>Customer</span><span>{o.user?.name}</span></div>
                <div className="data-card-row"><span>Amount</span><span>{money(o.totalAmount)}</span></div>
                <div className="data-card-row"><span>Status</span><StatusBadge status={o.status} /></div>
                <button className="btn btn-ghost btn-sm" style={{ marginTop: 10 }} onClick={() => setActive(o)}>Manage</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {active && (
        <Modal title={`Order ${active.orderNumber}`} onClose={() => setActive(null)}>
          <div className="modal-body">
            <div className="summary-row"><span>Customer</span><strong>{active.user?.name}</strong></div>
            <div className="summary-row"><span>Email</span><span>{active.user?.email}</span></div>
            <div className="summary-row"><span>Total</span><strong>{money(active.totalAmount)}</strong></div>
            <div className="summary-row"><span>Current status</span><StatusBadge status={active.status} /></div>
            <h4>Update status</h4>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {STATUSES.map((s) => (
                <button key={s} className={`btn btn-sm ${s === active.status ? 'btn-primary' : 'btn-ghost'}`} disabled={active.status === 'Cancelled'} onClick={() => updateStatus(active, s)}>{s}</button>
              ))}
            </div>
            {active.status === 'Cancelled' && <p className="small muted" style={{ marginTop: 10 }}>Cancelled orders cannot be changed.</p>}
          </div>
        </Modal>
      )}
    </div>
  );
}
