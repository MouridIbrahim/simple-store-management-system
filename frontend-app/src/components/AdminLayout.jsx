import React from 'react';
import { NavLink, Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Package, ShoppingBag, Users, ArrowLeft, LogOut, ShieldAlert } from 'lucide-react';

export default function AdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Mini Admin Header */}
      <header style={{
        backgroundColor: 'var(--brand-dark)',
        color: 'var(--surface)',
        padding: '12px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid var(--border)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldAlert size={20} />
          <span style={{ fontWeight: 600, letterSpacing: '0.05em', fontSize: '14px' }}>ADMIN CONSOLE</span>
        </div>
        <Link to="/" style={{ color: 'inherit', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <ArrowLeft size={14} /> Storefront
        </Link>
      </header>

      {/* Admin Panel Body Grid */}
      <div className="dashboard-grid">
        {/* Sidebar Nav */}
        <aside className="dashboard-sidebar">
          <NavLink to="/admin" end className={({ active }) => active ? 'dashboard-nav-item active' : 'dashboard-nav-item'}>
            <LayoutDashboard size={18} />
            <span>Metrics</span>
          </NavLink>
          <NavLink to="/admin/products" className={({ active }) => active ? 'dashboard-nav-item active' : 'dashboard-nav-item'}>
            <Package size={18} />
            <span>Products</span>
          </NavLink>
          <NavLink to="/admin/orders" className={({ active }) => active ? 'dashboard-nav-item active' : 'dashboard-nav-item'}>
            <ShoppingBag size={18} />
            <span>Orders</span>
          </NavLink>
          <NavLink to="/admin/customers" className={({ active }) => active ? 'dashboard-nav-item active' : 'dashboard-nav-item'}>
            <Users size={18} />
            <span>Customers</span>
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
              marginTop: 'auto',
              color: 'var(--error)'
            }}
          >
            <LogOut size={18} />
            <span>Log Out</span>
          </button>
        </aside>

        {/* Content Outlet */}
        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
