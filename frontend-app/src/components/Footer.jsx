import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--border)',
      backgroundColor: 'var(--bg-secondary)',
      padding: 'var(--spacing-xxl) 0 var(--spacing-xl)',
      marginTop: 'auto',
      fontSize: '13px',
      color: 'var(--text-secondary)'
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr 1fr',
          gap: 'var(--spacing-xl)',
          textAlign: 'left',
          marginBottom: 'var(--spacing-xl)'
        }} className="grid-responsive-footer">
          {/* Brand */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
            <span style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '20px',
              fontWeight: 600,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em'
            }}>ESSENTIALS</span>
            <p style={{ maxWidth: '300px' }}>Premium clothing and lifestyle essentials designed for modern living. Editorial, minimal, and built to last.</p>
          </div>

          {/* Catalog */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
            <h4 style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-primary)' }}>Catalog</h4>
            <Link to="/shop?category=T-Shirts" style={{ color: 'inherit' }}>T-Shirts</Link>
            <Link to="/shop?category=Hoodies" style={{ color: 'inherit' }}>Hoodies</Link>
            <Link to="/shop?category=Pants" style={{ color: 'inherit' }}>Pants</Link>
            <Link to="/shop" style={{ color: 'inherit' }}>Shop All</Link>
          </div>

          {/* Account */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
            <h4 style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-primary)' }}>Support</h4>
            <Link to="/account" style={{ color: 'inherit' }}>Account Overview</Link>
            <Link to="/cart" style={{ color: 'inherit' }}>Shopping Cart</Link>
            <Link to="/wishlist" style={{ color: 'inherit' }}>My Wishlist</Link>
          </div>

          {/* Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
            <h4 style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-primary)' }}>Company</h4>
            <span style={{ cursor: 'pointer' }}>About Us</span>
            <span style={{ cursor: 'pointer' }}>Sustainability</span>
            <span style={{ cursor: 'pointer' }}>Privacy Policy</span>
          </div>
        </div>

        <hr style={{ border: 0, borderTop: '1px solid var(--border)', margin: 'var(--spacing-lg) 0' }} />

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'var(--spacing-sm)',
          fontSize: '11px',
          color: 'var(--text-muted)'
        }}>
          <span>© {new Date().getFullYear()} ESSENTIALS Ltd. All rights reserved.</span>
          <span>Designed with absolute simplicity.</span>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .grid-responsive-footer {
            grid-template-columns: 1fr !important;
            gap: var(--spacing-lg) !important;
          }
        }
      `}</style>
    </footer>
  );
}
