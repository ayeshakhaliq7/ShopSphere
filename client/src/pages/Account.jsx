import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userService, orderService } from '../services';
import { getErrorMessage } from '../services/api';
import { useToast } from '../context/ToastContext';
import { money, shortDate } from '../utils/format';
import StatusBadge from '../components/StatusBadge';
import StatePanel from '../components/StatePanel';
import { Spinner } from '../components/Skeleton';
import useDocumentTitle from '../hooks/useDocumentTitle';

const TABS = [['profile', 'Profile'], ['orders', 'Orders'], ['settings', 'Account settings']];

export default function Account() {
  useDocumentTitle('My account');
  const { user, setUser } = useAuth();
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') || 'profile';

  return (
    <div className="container account-layout">
      <nav className="account-nav" aria-label="Account sections">
        {TABS.map(([key, label]) => (
          <button key={key} className={tab === key ? 'active' : ''} onClick={() => setParams({ tab: key })}>{label}</button>
        ))}
      </nav>
      <div>
        {tab === 'profile' && <ProfileTab user={user} />}
        {tab === 'orders' && <OrdersTab />}
        {tab === 'settings' && <SettingsTab user={user} setUser={setUser} toast={toast} />}
      </div>
    </div>
  );
}

function ProfileTab({ user }) {
  return (
    <div className="panel">
      <h2 style={{ marginTop: 0, fontSize: 20 }}>Profile</h2>
      <div className="summary-row"><span>Name</span><strong>{user.name}</strong></div>
      <div className="summary-row"><span>Email</span><strong>{user.email}</strong></div>
      <div className="summary-row"><span>Member since</span><strong>{shortDate(user.createdAt)}</strong></div>
      <p className="muted" style={{ marginTop: 16 }}>To update your details, head to Account settings.</p>
    </div>
  );
}

function OrdersTab() {
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState(null);
  useEffect(() => { orderService.list().then((r) => setOrders(r.orders)).catch((e) => setError(getErrorMessage(e))); }, []);

  if (error) return <StatePanel tone="error" title="Couldn't load your orders" message={error} />;
  if (!orders) return <Spinner label="Loading orders" />;
  if (orders.length === 0) return <StatePanel icon="📦" title="No orders yet" message="Your order history will show up here once you place your first order." actionLabel="Start shopping" actionTo="/shop" />;

  return (
    <div>
      <h2 style={{ fontSize: 20 }}>Order history</h2>
      {orders.map((o) => (
        <div className="order-row" key={o._id}>
          <div>
            <strong>{o.orderNumber}</strong>
            <div className="small muted">{shortDate(o.createdAt)} · {o.products.length} item{o.products.length !== 1 ? 's' : ''}</div>
          </div>
          <span>{money(o.totalAmount)}</span>
          <StatusBadge status={o.status} />
          <Link className="btn btn-ghost btn-sm" to={`/orders/${o._id}`}>View details</Link>
        </div>
      ))}
    </div>
  );
}

function SettingsTab({ user, setUser, toast }) {
  const [form, setForm] = useState({ name: user.name, email: user.email, currentPassword: '', password: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    setError(null); setSaving(true);
    try {
      const body = { name: form.name, email: form.email };
      if (form.password) { body.password = form.password; body.currentPassword = form.currentPassword; }
      const r = await userService.update(user._id, body);
      setUser(r.user);
      setForm((f) => ({ ...f, currentPassword: '', password: '' }));
      toast.success('Account updated.');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="panel">
      <h2 style={{ marginTop: 0, fontSize: 20 }}>Account settings</h2>
      {error && <div className="form-alert" role="alert">{error}</div>}
      <form onSubmit={save} noValidate>
        <div className="field-row">
          <div className="field"><label htmlFor="name">Full name</label><input id="name" required value={form.name} onChange={set('name')} /></div>
          <div className="field"><label htmlFor="email">Email</label><input id="email" type="email" required value={form.email} onChange={set('email')} /></div>
        </div>
        <h4>Change password (optional)</h4>
        <div className="field-row">
          <div className="field"><label htmlFor="currentPassword">Current password</label><input id="currentPassword" type="password" value={form.currentPassword} onChange={set('currentPassword')} /></div>
          <div className="field"><label htmlFor="newPassword">New password</label><input id="newPassword" type="password" value={form.password} onChange={set('password')} /></div>
        </div>
        <button className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
      </form>
    </div>
  );
}
