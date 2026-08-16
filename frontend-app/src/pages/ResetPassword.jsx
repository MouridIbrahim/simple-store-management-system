import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import API from '../services/api';
import { useToast } from '../context/ToastContext';
import { ArrowLeft, KeyRound } from 'lucide-react';

export default function ResetPassword() {
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      addToast('Invalid or missing reset token.', 'error');
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
    try {
      await API.post('/auth/reset-password', { token, password });
      addToast('Password reset successfully. Please sign in.', 'success');
      navigate('/login', { replace: true });
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to reset password.';
      addToast(message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div style={{
        maxWidth: '400px',
        width: '100%',
        margin: 'var(--spacing-xxl) auto',
        padding: '0 var(--spacing-lg)',
        textAlign: 'center'
      }}>
        <h1 style={{ marginBottom: 'var(--spacing-md)' }}>Invalid Reset Link</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--spacing-lg)', fontSize: '14px' }}>
          This password reset link is invalid or has expired. Please request a new one.
        </p>
        <Link to="/forgot-password" className="btn btn-primary">Request New Link</Link>
      </div>
    );
  }

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
        <div style={{ display: 'inline-flex', color: 'var(--accent)', marginBottom: 'var(--spacing-sm)' }}>
          <KeyRound size={32} />
        </div>
        <h1 style={{ marginBottom: 'var(--spacing-xs)' }}>Set New Password</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Enter your new password below.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--border)',
        padding: 'var(--spacing-xl)',
        borderRadius: 'var(--radius-sm)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div className="form-group">
          <label className="form-label" htmlFor="new-password">New Password</label>
          <input
            id="new-password"
            type="password"
            className="form-control"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>

        <div className="form-group" style={{ marginBottom: 'var(--spacing-lg)' }}>
          <label className="form-label" htmlFor="confirm-password">Confirm Password</label>
          <input
            id="confirm-password"
            type="password"
            className="form-control"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: '100%' }}
          disabled={submitting}
        >
          {submitting ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>

      <div style={{ textAlign: 'center', fontSize: '13px' }}>
        <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <ArrowLeft size={14} /> Back to Sign In
        </Link>
      </div>
    </div>
  );
}
