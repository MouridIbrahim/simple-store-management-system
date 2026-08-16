import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import { User, Heart, ShoppingBag, Settings, Eye } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const { wishlist } = useWishlist();
  const { cartItemsCount } = useCart();
  const [recentOrders, setRecentOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    const fetchRecentOrders = async () => {
      try {
        const response = await API.get('/orders');
        setRecentOrders(response.data.slice(0, 3));
      } catch (err) {
        console.error('Error fetching recent orders:', err);
      } finally {
        setOrdersLoading(false);
      }
    };
    if (user) fetchRecentOrders();
  }, [user]);

  if (!user) return null;

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'delivered':
        return { backgroundColor: 'var(--success-bg)', color: 'var(--success)' };
      case 'cancelled':
        return { backgroundColor: 'var(--error-bg)', color: 'var(--error)' };
      case 'pending':
        return { backgroundColor: 'var(--warning-bg)', color: 'var(--warning)' };
      default:
        return { backgroundColor: '#f3f4f6', color: '#374151' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)', textAlign: 'left' }}>
      {/* Welcome Card */}
      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        padding: 'var(--spacing-xl)',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--border)'
      }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 500, marginBottom: '4px' }}>Welcome back, {user.name}</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
          From your profile dashboard, you can view your shopping cart, check your bookmarked wishlist items, and track your orders.
        </p>
      </div>

      {/* Stats Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--spacing-md)' }} className="dashboard-stats-grid">
        {/* Cart Card */}
        <div style={{ border: '1px solid var(--border)', padding: 'var(--spacing-lg)', borderRadius: 'var(--radius-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Shopping Cart</span>
            <ShoppingBag size={18} />
          </div>
          <span style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>{cartItemsCount} Items</span>
          <div style={{ marginTop: '8px' }}>
            <Link to="/cart" style={{ fontSize: '12px', color: 'var(--accent)', textDecoration: 'underline' }}>View Cart</Link>
          </div>
        </div>

        {/* Wishlist Card */}
        <div style={{ border: '1px solid var(--border)', padding: 'var(--spacing-lg)', borderRadius: 'var(--radius-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Wishlisted Items</span>
            <Heart size={18} />
          </div>
          <span style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>{wishlist.length} Items</span>
          <div style={{ marginTop: '8px' }}>
            <Link to="/wishlist" style={{ fontSize: '12px', color: 'var(--accent)', textDecoration: 'underline' }}>View Wishlist</Link>
          </div>
        </div>

        {/* Orders Card */}
        <div style={{ border: '1px solid var(--border)', padding: 'var(--spacing-lg)', borderRadius: 'var(--radius-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Orders placed</span>
            <Settings size={18} />
          </div>
          <span style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>Track status</span>
          <div style={{ marginTop: '8px' }}>
            <Link to="/account/orders" style={{ fontSize: '12px', color: 'var(--accent)', textDecoration: 'underline' }}>View Order History</Link>
          </div>
        </div>
      </div>

      {/* Recent Orders Snippet */}
      <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: 'var(--spacing-xl)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
          <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShoppingBag size={18} /> Recent Orders
          </h3>
          <Link to="/account/orders" style={{ fontSize: '12px', color: 'var(--accent)', textDecoration: 'underline' }}>View All</Link>
        </div>

        {ordersLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--spacing-lg) 0' }}>
            <div className="spinner"></div>
          </div>
        ) : recentOrders.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No orders yet. Start shopping to see your order history here.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
            {recentOrders.map((order) => (
              <div key={order._id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '13px',
                flexWrap: 'wrap',
                gap: '8px'
              }}>
                <div>
                  <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--accent)' }}>
                    #{order._id.slice(-8).toUpperCase()}
                  </span>
                  <span style={{ color: 'var(--text-muted)', marginLeft: '8px' }}>
                    {new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                  <span style={{ fontWeight: 600 }}>${order.totalAmount?.toFixed(2)}</span>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '11px',
                    fontWeight: 600,
                    textTransform: 'capitalize',
                    ...getStatusBadgeStyle(order.status)
                  }}>
                    {order.status}
                  </span>
                  <Link to={`/account/orders/${order._id}`} style={{ color: 'var(--accent)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Eye size={14} /> Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Account Info Details */}
      <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: 'var(--spacing-xl)' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: 'var(--spacing-md)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <User size={18} /> Account Details
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Name</span>
            <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{user.name}</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Email Address</span>
            <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{user.email}</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', paddingBottom: '8px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Account Role</span>
            <span style={{ fontWeight: 500, color: 'var(--text-primary)', textTransform: 'capitalize' }}>{user.role}</span>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .dashboard-stats-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
