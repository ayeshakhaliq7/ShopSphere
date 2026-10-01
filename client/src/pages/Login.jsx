import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../services/api';
import useDocumentTitle from '../hooks/useDocumentTitle';

export default function Login() {
  useDocumentTitle('Login');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const from = location.state?.from || '/';

  const submit = async (e) => {
    e.preventDefault();
    setError(null); setLoading(true);
    try {
      const user = await login(form);
      navigate(user.role === 'admin' && from === '/' ? '/admin' : from, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, 'Incorrect email or password.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-page">
      <div className="auth-card">
        <h1 style={{ fontSize: 26 }}>Welcome back</h1>
        <p className="muted" style={{ marginBottom: 24 }}>Sign in to track orders, save wishlists and check out faster.</p>
        {error && <div className="form-alert" role="alert">{error}</div>}
        <form onSubmit={submit} noValidate>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" autoComplete="email" required value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" autoComplete="current-password" required value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} />
          </div>
          <button className="btn btn-primary btn-block btn-lg" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</button>
        </form>
        <p className="small muted" style={{ marginTop: 18 }}>
          Demo admin: <strong>admin@shopsphere.com</strong> / Admin@123<br />
          Demo user: <strong>jane@example.com</strong> / User@1234
        </p>
        <p style={{ marginTop: 18 }}>New here? <Link to="/register" style={{ color: 'var(--pine)', fontWeight: 700 }}>Create an account</Link></p>
      </div>
    </div>
  );
}
