import { NavLink, Outlet, Link } from 'react-router-dom';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';

const links = [
  ['/admin', 'Overview', true],
  ['/admin/products', 'Products'],
  ['/admin/orders', 'Orders'],
  ['/admin/users', 'Users'],
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  return (
    <div className="admin-shell">
      <aside className="admin-side">
        <Link to="/" aria-label="Back to store"><Logo /></Link>
        <nav aria-label="Admin">
          {links.map(([to, label, end]) => <NavLink key={to} to={to} end={end}>{label}</NavLink>)}
        </nav>
        <div className="admin-user">
          <span className="small">{user.name}</span>
          <Link to="/">View store</Link>
          <button className="linklike" onClick={logout}>Sign out</button>
        </div>
      </aside>
      <div className="admin-main"><Outlet /></div>
    </div>
  );
}
