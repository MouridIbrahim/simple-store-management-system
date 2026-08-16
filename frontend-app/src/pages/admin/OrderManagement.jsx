import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Eye, X, RefreshCw } from 'lucide-react';

export default function OrderManagement() {
  const { addToast } = useToast();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Selected Order for detail overlay
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await API.get('/orders');
      setOrders(response.data);
    } catch (err) {
      console.error(err);
      setError('Could not retrieve orders listing. Ensure your account is flagged as administrator.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await API.put(`/orders/${orderId}/status`, { status: newStatus });
      addToast(`Order tracking status updated to "${newStatus}".`, 'success');
      // Reload orders list
      await fetchOrders();
      // If we are currently inspecting details, update it as well
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.error(err);
      addToast(err.response?.data?.message || 'Failed to update order status.', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  // Status badge styling
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)', textAlign: 'left' }}>
      {/* Title Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid var(--border)',
        paddingBottom: 'var(--spacing-md)',
        flexWrap: 'wrap',
        gap: 'var(--spacing-sm)'
      }}>
        <div>
          <h1 style={{ fontSize: '2rem' }}>Order Board</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Fulfill client orders and update shipment tracking coordinates.</p>
        </div>

        <button onClick={fetchOrders} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '38px', padding: '0 16px' }} disabled={loading}>
          <RefreshCw size={14} className={loading ? 'spin-anim' : ''} /> Refresh list
        </button>
      </div>

      {/* Orders Table */}
      {loading && orders.length === 0 ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--spacing-xxl) 0' }}>
          <div className="spinner"></div>
        </div>
      ) : error ? (
        <div className="toast toast-error" style={{ position: 'relative', top: 0, right: 0 }}>
          <span>{error}</span>
        </div>
      ) : orders.length === 0 ? (
        <div style={{ padding: 'var(--spacing-xxl)', border: '1px dashed var(--border)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)' }}>No customer orders have been placed in the system yet.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                <th style={{ padding: '12px var(--spacing-md)', fontWeight: 600 }}>Order ID</th>
                <th style={{ padding: '12px var(--spacing-md)', fontWeight: 600 }}>Customer</th>
                <th style={{ padding: '12px var(--spacing-md)', fontWeight: 600 }}>Total</th>
                <th style={{ padding: '12px var(--spacing-md)', fontWeight: 600 }}>Tracking State</th>
                <th style={{ padding: '12px var(--spacing-md)', fontWeight: 600 }}>Update Status</th>
                <th style={{ padding: '12px var(--spacing-md)', fontWeight: 600, textAlign: 'center' }}>Invoice</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                // Settle customer credentials
                const buyerName = order.user?.name || 'Customer';
                const buyerEmail = order.user?.email || '';

                return (
                  <tr key={order._id} style={{ borderBottom: '1px solid var(--border)' }} className="table-row-hover">
                    <td style={{ padding: '16px var(--spacing-md)', fontFamily: 'monospace', color: 'var(--text-primary)' }}>
                      {order._id}
                    </td>
                    <td style={{ padding: '16px var(--spacing-md)' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{buyerName}</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{buyerEmail}</span>
                      </div>
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
                    <td style={{ padding: '16px var(--spacing-md)' }}>
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        disabled={updatingId === order._id || order.status === 'cancelled'}
                        className="form-control"
                        style={{ width: '130px', padding: '4px 8px', fontSize: '12px', height: '30px' }}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled" disabled>Cancelled</option>
                      </select>
                    </td>
                    <td style={{ padding: '16px var(--spacing-md)', textAlign: 'center' }}>
                      <button onClick={() => setSelectedOrder(order)} className="icon-btn" title="View details invoice">
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Invoice Details overlay Modal */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '16px' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Order Details Invoice</h2>
                <span style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--text-muted)' }}>ID: {selectedOrder._id}</span>
              </div>
              <button className="icon-btn" onClick={() => setSelectedOrder(null)}><X size={20} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '13px', textAlign: 'left' }}>
              {/* Customer details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }} className="grid-responsive-modal">
                <div>
                  <h4 style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>Customer Credentials</h4>
                  <p>{selectedOrder.user?.name || 'Customer'}</p>
                  <p style={{ color: 'var(--text-muted)' }}>{selectedOrder.user?.email || ''}</p>
                </div>
                <div>
                  <h4 style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>Shipping Address</h4>
                  <p style={{ lineHeight: 1.4 }}>{selectedOrder.shippingAddress}</p>
                </div>
              </div>

              {/* Status details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '12px 0' }} className="grid-responsive-modal">
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Payment Method:</span>{' '}
                  <strong>{selectedOrder.paymentMethod}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Payment Status:</span>{' '}
                  <strong style={{ textTransform: 'uppercase', color: selectedOrder.paymentStatus === 'paid' ? 'var(--success)' : 'var(--warning)' }}>
                    {selectedOrder.paymentStatus}
                  </strong>
                </div>
              </div>

              {/* Items listing breakdown */}
              <div>
                <h4 style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>Line Items Summary</h4>
                <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
                  {(selectedOrder.items || []).map((item) => (
                    <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', borderBottom: '1px solid var(--border)' }}>
                      <div>
                        <strong>{item.product?.name || 'Garment'}</strong>{' '}
                        <span style={{ color: 'var(--text-muted)' }}>(x{item.quantity})</span>
                      </div>
                      <span>${((item.price || 0) * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', backgroundColor: 'var(--bg-secondary)', fontWeight: 700, color: 'var(--text-primary)' }}>
                    <span>Invoice Total Amount:</span>
                    <span>${selectedOrder.totalAmount?.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Action triggers inside modal */}
              {selectedOrder.status !== 'cancelled' && (
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                  <button
                    onClick={() => handleStatusChange(selectedOrder._id, 'cancelled')}
                    className="btn btn-secondary"
                    style={{ color: 'var(--error)', borderColor: 'var(--error)', padding: '6px 12px', fontSize: '11px' }}
                  >
                    Cancel Order
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedOrder._id, 'delivered')}
                    disabled={selectedOrder.status === 'delivered'}
                    className="btn btn-primary"
                    style={{ padding: '6px 12px', fontSize: '11px' }}
                  >
                    Fulfill (Delivered)
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .table-row-hover:hover {
          background-color: var(--bg-secondary);
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .spin-anim {
          animation: spin 1s linear infinite;
        }
        @media (max-width: 768px) {
          .grid-responsive-modal {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }
        }
      `}</style>
    </div>
  );
}
