import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { useToast } from '../context/ToastContext';
import { ArrowLeft, Mail } from 'lucide-react';

export default function ForgotPassword() {
  const { addToast } = useToast();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [resetUrl, setResetUrl] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      addToast('Please enter your email address.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const response = await API.post('/auth/forgot-password', { email });
      setSubmitted(true);
      if (response.data.resetUrl) {
        setResetUrl(response.data.resetUrl);
      }
      addToast(response.data.message || 'If an account exists, a reset link has been sent.', 'success');
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to send reset link.';
      addToast(message, 'error');
    } finally {
      setSubmitting(false);
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
        <h1 style={{ marginBottom: 'var(--spacing-xs)' }}>Reset Password</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Enter your email and we&apos;ll send you a link to reset your password.
        </p>
      </div>

      {submitted ? (
        <div style={{
          backgroundColor: 'var(--success-bg)',
          border: '1px solid var(--success)',
          borderRadius: 'var(--radius-sm)',
          padding: 'var(--spacing-xl)',
          textAlign: 'center'
        }}>
          <Mail size={32} color="var(--success)" style={{ marginBottom: 'var(--spacing-md)' }} />
          <h3 style={{ fontSize: '1rem', marginBottom: 'var(--spacing-xs)', color: 'var(--success)' }}>Check your inbox</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            If an account exists for <strong>{email}</strong>, a reset link has been sent.
          </p>
          {resetUrl && (
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: 'var(--spacing-md)' }}>
              Dev mode —{' '}
              <Link to={resetUrl.replace(window.location.origin, '')} style={{ color: 'var(--accent)', wordBreak: 'break-all' }}>
                click here to reset
              </Link>
            </p>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
          padding: 'var(--spacing-xl)',
          borderRadius: 'var(--radius-sm)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div className="form-group" style={{ marginBottom: 'var(--spacing-lg)' }}>
            <label className="form-label" htmlFor="reset-email">Email Address</label>
            <input
              id="reset-email"
              type="email"
              className="form-control"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%' }}
            disabled={submitting}
          >
            {submitting ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
      )}

      <div style={{ textAlign: 'center', fontSize: '13px' }}>
        <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <ArrowLeft size={14} /> Back to Sign In
        </Link>
      </div>
    </div>
  );
}
