import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { ShoppingBag, Heart, User, Search, Menu, X, ShieldAlert } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cartItemsCount } = useCart();
  const { wishlist } = useWishlist();
  const navigate = useNavigate();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="header-wrapper">
      <div className="container">
        <nav className="navbar">
          {/* Logo */}
          <Link to="/" className="nav-logo">
            ESSENTIALS
          </Link>

          {/* Desktop Nav Links */}
          <ul className="nav-links">
            <li>
              <NavLink to="/" className={({ active }) => active ? 'nav-link active' : 'nav-link'}>
                Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/shop" className={({ active }) => active ? 'nav-link active' : 'nav-link'}>
                Shop
              </NavLink>
            </li>
            <li>
              <NavLink to="/wishlist" className={({ active }) => active ? 'nav-link active' : 'nav-link'}>
                Wishlist
              </NavLink>
            </li>
          </ul>

          {/* Actions (Search, Account, Cart) */}
          <div className="nav-actions">
            {/* Search form desktop */}
            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', position: 'relative' }} className="nav-links">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-control"
                style={{ padding: '6px 32px 6px 12px', fontSize: '13px', width: '160px', height: '34px' }}
              />
              <button type="submit" className="icon-btn" style={{ position: 'absolute', right: '4px', padding: '4px' }}>
                <Search size={16} />
              </button>
            </form>

            {/* Wishlist Link Desktop */}
            <Link to="/wishlist" className="icon-btn badge-wrapper nav-links">
              <Heart size={20} />
              {wishlist.length > 0 && <span className="nav-badge">{wishlist.length}</span>}
            </Link>

            {/* Admin Badge Shortcut */}
            {user?.role === 'admin' && (
              <Link to="/admin" className="icon-btn" title="Admin Dashboard" style={{ color: 'var(--accent)' }}>
                <ShieldAlert size={20} />
              </Link>
            )}

            {/* Account Link */}
            <Link to={user ? "/account" : "/login"} className="icon-btn">
              <User size={20} />
            </Link>

            {/* Cart Link */}
            <Link to="/cart" className="icon-btn badge-wrapper">
              <ShoppingBag size={20} />
              {cartItemsCount > 0 && <span className="nav-badge">{cartItemsCount}</span>}
            </Link>

            {/* Mobile Menu Trigger */}
            <button className="icon-btn" style={{ display: 'none' }} onClick={() => setMobileMenuOpen(true)} id="mobile-menu-btn">
              <Menu size={20} />
            </button>
          </div>
        </nav>
      </div>

      {/* CSS overrides for mobile display elements */}
      <style>{`
        @media (max-width: 768px) {
          #mobile-menu-btn { display: inline-flex !important; }
        }
      `}</style>

      {/* Mobile Drawer Slide-out */}
      {mobileMenuOpen && (
        <div className="modal-overlay" style={{ justifyContent: 'flex-start', padding: 0 }} onClick={() => setMobileMenuOpen(false)}>
          <div
            className="modal-content"
            style={{
              width: '280px',
              height: '100%',
              borderRadius: 0,
              margin: 0,
              padding: 'var(--spacing-xl)',
              display: 'flex',
              flexDirection: 'column',
              animation: 'slideInLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="icon-btn" style={{ alignSelf: 'flex-end', marginBottom: 'var(--spacing-lg)' }} onClick={() => setMobileMenuOpen(false)}>
              <X size={24} />
            </button>

            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)', fontSize: '18px', fontWeight: 500 }}>
              <li>
                <Link to="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>
              </li>
              <li>
                <Link to="/shop" onClick={() => setMobileMenuOpen(false)}>Shop</Link>
              </li>
              <li>
                <Link to="/wishlist" onClick={() => setMobileMenuOpen(false)}>Wishlist</Link>
              </li>
              <hr style={{ border: 0, borderTop: '1px solid var(--border)', margin: 'var(--spacing-sm) 0' }} />
              {user ? (
                <>
                  {user.role === 'admin' && (
                    <li>
                      <Link to="/admin" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--accent)' }}>Admin Dashboard</Link>
                    </li>
                  )}
                  <li>
                    <Link to="/account" onClick={() => setMobileMenuOpen(false)}>My Account</Link>
                  </li>
                  <li>
                    <button className="btn-link" onClick={() => { logout(); setMobileMenuOpen(false); }} style={{ fontSize: '18px', fontWeight: 500 }}>
                      Log Out
                    </button>
                  </li>
                </>
              ) : (
                <li>
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
                </li>
              )}
            </ul>
          </div>
          <style>{`
            @keyframes slideInLeft {
              from { transform: translateX(-100%); }
              to { transform: translateX(0); }
            }
          `}</style>
        </div>
      )}

      {/* Sticky Bottom Tab Bar (Mobile Only) */}
      <div className="mobile-nav-bar">
        <div className="mobile-nav-tabs">
          <NavLink to="/" className={({ active }) => active ? 'mobile-nav-tab active' : 'mobile-nav-tab'}>
            <User size={20} style={{ opacity: 0 }} /> {/* dummy just for spacing, or standard buttons below */}
          </NavLink>
        </div>
        {/* Actual navigation button grids */}
        <div className="mobile-nav-tabs" style={{ position: 'absolute', inset: 0 }}>
          <NavLink to="/" className={({ active }) => active ? 'mobile-nav-tab active' : 'mobile-nav-tab'}>
            <User size={0} /> {/* We render icon + text */}
            <span style={{ fontSize: '12px' }}>Home</span>
          </NavLink>
          <NavLink to="/shop" className={({ active }) => active ? 'mobile-nav-tab active' : 'mobile-nav-tab'}>
            <span style={{ fontSize: '12px' }}>Shop</span>
          </NavLink>
          <NavLink to="/wishlist" className={({ active }) => active ? 'mobile-nav-tab active' : 'mobile-nav-tab'}>
            <span style={{ fontSize: '12px' }}>Wishlist</span>
          </NavLink>
          <NavLink to="/cart" className={({ active }) => active ? 'mobile-nav-tab active' : 'mobile-nav-tab'}>
            <span style={{ fontSize: '12px' }}>Cart ({cartItemsCount})</span>
          </NavLink>
          <NavLink to={user ? "/account" : "/login"} className={({ active }) => active ? 'mobile-nav-tab active' : 'mobile-nav-tab'}>
            <span style={{ fontSize: '12px' }}>Account</span>
          </NavLink>
        </div>
      </div>
    </header>
  );
}
