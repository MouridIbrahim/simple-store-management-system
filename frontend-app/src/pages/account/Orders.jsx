import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import { Eye, ShoppingBag } from 'lucide-react';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await API.get('/orders');
        // API returns own orders sorted by newest first
        setOrders(response.data);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load order history.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Simple status badge color helper
  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'delivered':
        return { backgroundColor: 'var(--success-bg)', color: 'var(--success)' };
      case 'cancelled':
        return { backgroundColor: 'var(--error-bg)', color: 'var(--error)' };
      case 'pending':
        return { backgroundColor: 'var(--warning-bg)', color: 'var(--warning)' };
      default:
        return { backgroundColor: '#f3f4f6', color: '#374151' }; // processing, shipped
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--spacing-xl) 0' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="toast toast-error" style={{ position: 'relative', top: 0, right: 0 }}>
        <span>{error}</span>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--spacing-xl) 0',
        gap: 'var(--spacing-sm)'
      }}>
        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          padding: '16px',
          borderRadius: 'var(--radius-round)',
          color: 'var(--text-muted)'
        }}>
          <ShoppingBag size={32} />
        </div>
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 400 }}>No orders placed yet.</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', maxWidth: '300px' }}>
          When you make purchases, your tracking updates and invoices will appear here.
        </p>
        <Link to="/shop" className="btn btn-primary" style={{ marginTop: '8px', padding: '8px 16px', fontSize: '11px' }}>
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'left' }}>
      <h2 style={{ fontSize: '1.25rem', marginBottom: 'var(--spacing-md)' }}>Order History</h2>

      {/* Orders Table Container */}
      <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
              <th style={{ padding: '12px var(--spacing-md)', fontWeight: 600 }}>Order ID</th>
              <th style={{ padding: '12px var(--spacing-md)', fontWeight: 600 }}>Date</th>
              <th style={{ padding: '12px var(--spacing-md)', fontWeight: 600 }}>Items</th>
              <th style={{ padding: '12px var(--spacing-md)', fontWeight: 600 }}>Total</th>
              <th style={{ padding: '12px var(--spacing-md)', fontWeight: 600 }}>Status</th>
              <th style={{ padding: '12px var(--spacing-md)', fontWeight: 600, textAlign: 'center' }}>Details</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const itemsList = order.items || [];
              const itemsString = itemsList.map(item => `${item.product?.name || 'Item'} (x${item.quantity})`).join(', ');

              return (
                <tr key={order._id} style={{ borderBottom: '1px solid var(--border)', transition: 'var(--transition)' }} className="table-row-hover">
                  <td style={{ padding: '16px var(--spacing-md)', fontFamily: 'monospace', color: 'var(--text-primary)' }}>
                    {order._id}
                  </td>
                  <td style={{ padding: '16px var(--spacing-md)' }}>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '16px var(--spacing-md)', color: 'var(--text-muted)', maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={itemsString}>
                    {itemsString}
                  </td>
                  <td style={{ padding: '16px var(--spacing-md)', fontWeight: 600, color: 'var(--text-primary)' }}>
                    ${order.totalAmount?.toFixed(2)}
                  </td>
                  <td style={{ padding: '16px var(--spacing-md)' }}>
                    <span style={{
                      padding: '4px 8px',
                      fontSize: '10px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      borderRadius: 'var(--radius-sm)',
                      letterSpacing: '0.02em',
                      ...getStatusBadgeStyle(order.status)
                    }}>
                      {order.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px var(--spacing-md)', textAlign: 'center' }}>
                    <Link to={`/account/orders/${order._id}`} className="icon-btn" title="View details">
                      <Eye size={16} />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      <style>{`
        .table-row-hover:hover {
          background-color: var(--bg-secondary);
        }
      `}</style>
    </div>
  );
}
