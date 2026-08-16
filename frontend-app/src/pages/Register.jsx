import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Register() {
  const { register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      addToast('Please fill in all fields.', 'warning');
      return;
    }

    if (password.length < 6) {
      addToast('Password must be at least 6 characters long.', 'warning');
      return;
    }

    if (password !== confirmPassword) {
      addToast('Passwords do not match.', 'error');
      return;
    }

    setSubmitting(true);
    const result = await register(name, email, password);
    setSubmitting(false);

    if (result.success) {
      addToast('Registration successful! Please log in.', 'success');
      navigate('/login');
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
        <h1 style={{ marginBottom: 'var(--spacing-xs)' }}>Create Account</h1>
        <p style={{ color: 'var(--text-muted)' }}>Sign up to start tracking orders and wishlists.</p>
      </div>

      <form onSubmit={handleSubmit} style={{
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--border)',
        padding: 'var(--spacing-xl)',
        borderRadius: 'var(--radius-sm)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div className="form-group">
          <label className="form-label" htmlFor="name">Full Name</label>
          <input
            id="name"
            type="text"
            className="form-control"
            placeholder="Jane Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

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

        <div className="form-group">
          <label className="form-label" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            className="form-control"
            placeholder="Min 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="form-group" style={{ marginBottom: 'var(--spacing-lg)' }}>
          <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            type="password"
            className="form-control"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: '100%' }}
          disabled={submitting}
        >
          {submitting ? 'Registering...' : 'Register'}
        </button>
      </form>

      <div style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-secondary)' }}>
        Already have an account?{' '}
        <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 500, textDecoration: 'underline' }}>
          Sign in
        </Link>
      </div>
    </div>
  );
}
