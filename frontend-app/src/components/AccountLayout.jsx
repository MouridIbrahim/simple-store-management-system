import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, ShoppingBag, LogOut } from 'lucide-react';

export default function AccountLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="container" style={{ paddingTop: 'var(--spacing-xl)', paddingBottom: 'var(--spacing-xxl)' }}>
      {/* Page Title */}
      <div style={{ textAlign: 'left', marginBottom: 'var(--spacing-lg)' }}>
        <h1 style={{ fontSize: '2rem' }}>My Account</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Manage your profile data and track purchase history.</p>
      </div>

      <div className="dashboard-grid" style={{ minHeight: '400px' }}>
        {/* Account Sidebar */}
        <aside className="dashboard-sidebar" style={{ backgroundColor: 'transparent', borderRight: '1px solid var(--border)' }}>
          <NavLink
            to="/account"
            end
            className={({ active }) => active ? 'dashboard-nav-item active' : 'dashboard-nav-item'}
          >
            <User size={16} />
            <span>Profile Overview</span>
          </NavLink>
          
          <NavLink
            to="/account/orders"
            className={({ active }) => active ? 'dashboard-nav-item active' : 'dashboard-nav-item'}
          >
            <ShoppingBag size={16} />
            <span>Order History</span>
          </NavLink>

          <button
            onClick={handleLogout}
            className="dashboard-nav-item"
            style={{
              background: 'none',
              border: 'none',
              width: '100%',
              textAlign: 'left',
              cursor: 'pointer',
              marginTop: 'var(--spacing-lg)',
              color: 'var(--error)'
            }}
          >
            <LogOut size={16} />
            <span>Log Out</span>
          </button>
        </aside>

        {/* Account Content */}
        <main className="dashboard-content" style={{ padding: '0 var(--spacing-xl)' }} id="account-main-content">
          <Outlet />
        </main>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          #account-main-content {
            padding: var(--spacing-lg) 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
