import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Login() {
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      addToast('Please enter both email and password.', 'warning');
      return;
    }
    
    setSubmitting(true);
    const result = await login(email, password);
    setSubmitting(false);

    if (result.success) {
      addToast('Welcome back!', 'success');
      navigate(from, { replace: true });
    } else {
      addToast(result.error, 'error');
    }
  };

  return (
    <div style={{
      maxWidth: '400px',
      width: '100%',
      margin: 'var(--spacing-xxl) auto',
      padding: '0 var(--spacing-lg)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--spacing-lg)'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ marginBottom: 'var(--spacing-xs)' }}>Sign In</h1>
        <p style={{ color: 'var(--text-muted)' }}>Enter your details to access your account.</p>
      </div>

      <form onSubmit={handleSubmit} style={{
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--border)',
        padding: 'var(--spacing-xl)',
        borderRadius: 'var(--radius-sm)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div className="form-group">
          <label className="form-label" htmlFor="email">Email Address</label>
          <input
            id="email"
            type="email"
            className="form-control"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group" style={{ marginBottom: 'var(--spacing-sm)' }}>
          <label className="form-label" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            className="form-control"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div style={{ textAlign: 'right', marginBottom: 'var(--spacing-lg)' }}>
          <Link to="/forgot-password" style={{ fontSize: '12px', color: 'var(--accent)', textDecoration: 'underline' }}>
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: '100%' }}
          disabled={submitting}
        >
          {submitting ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <div style={{ textAlignment: 'center', fontSize: '13px', color: 'var(--text-secondary)' }}>
        Don't have an account?{' '}
        <Link to="/register" style={{ color: 'var(--accent)', fontWeight: 500, textDecoration: 'underline' }}>
          Sign up
        </Link>
      </div>
    </div>
  );
}
