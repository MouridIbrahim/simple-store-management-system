import React from 'react';
import { Link } from 'react-router-dom';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('Uncaught error:', error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          padding: 'var(--spacing-xl)',
          textAlign: 'center',
          gap: 'var(--spacing-md)'
        }}>
          <h1 style={{ fontSize: '1.75rem' }}>Something went wrong</h1>
          <p style={{ color: 'var(--text-muted)', maxWidth: '420px', fontSize: '14px' }}>
            An unexpected error occurred. You can try again or return to the homepage.
          </p>
          <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-sm)' }}>
            <button onClick={this.handleRetry} className="btn btn-primary">
              Try Again
            </button>
            <Link to="/" className="btn btn-secondary">
              Go Home
            </Link>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
