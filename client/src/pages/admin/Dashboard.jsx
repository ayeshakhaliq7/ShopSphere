import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services';
import { getErrorMessage } from '../../services/api';
import { money, shortDate } from '../../utils/format';
import StatusBadge from '../../components/StatusBadge';
import StatePanel from '../../components/StatePanel';
import { Spinner } from '../../components/Skeleton';
import useDocumentTitle from '../../hooks/useDocumentTitle';

export default function Dashboard() {
  useDocumentTitle('Admin overview');
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => { adminService.stats().then(setStats).catch((e) => setError(getErrorMessage(e))); }, []);

  if (error) return <StatePanel tone="error" title="Couldn't load dashboard" message={error} />;
  if (!stats) return <Spinner label="Loading dashboard" />;

  const maxRevenue = Math.max(...stats.monthly.map((m) => m.revenue), 1);

  return (
    <div>
      <div className="admin-head"><h1 style={{ fontSize: 24, margin: 0 }}>Overview</h1></div>

      <div className="stat-grid">
        <div className="stat-card"><span>Total sales</span><strong>{money(stats.totalSales)}</strong></div>
        <div className="stat-card"><span>Total orders</span><strong>{stats.totalOrders}</strong></div>
        <div className="stat-card"><span>Total products</span><strong>{stats.totalProducts}</strong></div>
        <div className="stat-card"><span>Total users</span><strong>{stats.totalUsers}</strong></div>
      </div>

      <div className="chart-grid">
        <div className="panel">
          <div className="panel-head"><h3 style={{ margin: 0, fontSize: 16 }}>Revenue by month</h3></div>
          <div className="bar-chart">
            {stats.monthly.map((m) => (
              <div className="bar-col" key={m.label}>
                <div className="bar" style={{ height: `${Math.max((m.revenue / maxRevenue) * 100, 3)}%` }} title={money(m.revenue)} />
                <span>{m.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="panel">
          <div className="panel-head"><h3 style={{ margin: 0, fontSize: 16 }}>Orders by month</h3></div>
          <div className="donut-legend">
            {stats.monthly.map((m) => (
              <div key={m.label}>
                <span className="legend-dot" style={{ background: 'var(--pine)' }} />
                <span style={{ flex: 1 }}>{m.label}</span>
                <strong>{m.orders}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <h3 style={{ margin: 0, fontSize: 16 }}>Recent orders</h3>
          <Link className="btn btn-ghost btn-sm" to="/admin/orders">View all</Link>
        </div>
        <table className="data-table">
          <thead><tr><th>Customer</th><th>Order ID</th><th>Date</th><th>Amount</th><th>Status</th></tr></thead>
          <tbody>
            {stats.recentOrders.map((o) => (
              <tr key={o._id}>
                <td>{o.user?.name}</td>
                <td>{o.orderNumber}</td>
                <td>{shortDate(o.createdAt)}</td>
                <td>{money(o.totalAmount)}</td>
                <td><StatusBadge status={o.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="data-cards">
          {stats.recentOrders.map((o) => (
            <div className="data-card" key={o._id}>
              <div className="data-card-row"><span>Customer</span><span>{o.user?.name}</span></div>
              <div className="data-card-row"><span>Order</span><span>{o.orderNumber}</span></div>
              <div className="data-card-row"><span>Date</span><span>{shortDate(o.createdAt)}</span></div>
              <div className="data-card-row"><span>Amount</span><span>{money(o.totalAmount)}</span></div>
              <div className="data-card-row"><span>Status</span><StatusBadge status={o.status} /></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
