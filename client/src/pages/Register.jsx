import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../services/api';
import useDocumentTitle from '../hooks/useDocumentTitle';

export default function Register() {
  useDocumentTitle('Register');
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (form.name.trim().length < 2) errs.name = 'Enter your full name.';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Enter a valid email address.';
    if (form.password.length < 8 || !/[A-Za-z]/.test(form.password) || !/\d/.test(form.password)) {
      errs.password = 'At least 8 characters, with a letter and a number.';
    }
    if (form.confirmPassword !== form.password) errs.confirmPassword = 'Passwords do not match.';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!validate()) return;
    setLoading(true);
    try {
      await register({ name: form.name, email: form.email, password: form.password });
      navigate('/');
    } catch (err) {
      setError(getErrorMessage(err, 'Could not create your account.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-page">
      <div className="auth-card">
        <h1 style={{ fontSize: 26 }}>Create your account</h1>
        <p className="muted" style={{ marginBottom: 24 }}>Join ShopSphere to save favourites and check out in seconds.</p>
        {error && <div className="form-alert" role="alert">{error}</div>}
        <form onSubmit={submit} noValidate>
          <div className={`field ${fieldErrors.name ? 'error' : ''}`}>
            <label htmlFor="name">Full name</label>
            <input id="name" required value={form.name} onChange={set('name')} />
            {fieldErrors.name && <span className="field-error">{fieldErrors.name}</span>}
          </div>
          <div className={`field ${fieldErrors.email ? 'error' : ''}`}>
            <label htmlFor="email">Email</label>
            <input id="email" type="email" autoComplete="email" required value={form.email} onChange={set('email')} />
            {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
          </div>
          <div className={`field ${fieldErrors.password ? 'error' : ''}`}>
            <label htmlFor="password">Password</label>
            <input id="password" type="password" autoComplete="new-password" required value={form.password} onChange={set('password')} />
            {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}
          </div>
          <div className={`field ${fieldErrors.confirmPassword ? 'error' : ''}`}>
            <label htmlFor="confirmPassword">Confirm password</label>
            <input id="confirmPassword" type="password" autoComplete="new-password" required value={form.confirmPassword} onChange={set('confirmPassword')} />
            {fieldErrors.confirmPassword && <span className="field-error">{fieldErrors.confirmPassword}</span>}
          </div>
          <button className="btn btn-primary btn-block btn-lg" disabled={loading}>{loading ? 'Creating account…' : 'Create account'}</button>
        </form>
        <p style={{ marginTop: 18 }}>Already have an account? <Link to="/login" style={{ color: 'var(--pine)', fontWeight: 700 }}>Sign in</Link></p>
      </div>
    </div>
  );
}
