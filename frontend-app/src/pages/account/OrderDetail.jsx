import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, Trash2, Calendar, CreditCard, MapPin, Truck } from 'lucide-react';

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchOrderDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await API.get(`/orders/${id}`);
      setOrder(response.data);
    } catch (err) {
      console.error('Error fetching order details:', err);
      setError(err.response?.data?.message || 'Could not fetch order.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetail();
  }, [id]);

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order? This action will restore product stock levels.')) {
      return;
    }

    setCancelling(true);
    try {
      await API.post(`/orders/${id}/cancel`);
      addToast('Order cancelled successfully.', 'success');
      // Refresh details
      await fetchOrderDetail();
    } catch (err) {
      console.error('Error cancelling order:', err);
      addToast(err.response?.data?.message || 'Failed to cancel order.', 'error');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--spacing-xxl) 0' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div style={{ textAlign: 'left' }}>
        <h2>Order Detail Error</h2>
        <p style={{ color: 'var(--text-muted)', margin: 'var(--spacing-md) 0' }}>{error || 'Unable to retrieve order details.'}</p>
        <Link to="/account/orders" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <ArrowLeft size={16} /> Back to History
        </Link>
      </div>
    );
  }

  const { status, totalAmount, shippingAddress, paymentMethod, paymentStatus, items = [], createdAt } = order;

  // Timeline state checkers
  const steps = ['pending', 'processing', 'shipped', 'delivered'];
  const currentStepIndex = steps.indexOf(status);

  return (
    <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)' }}>
      {/* Back button */}
      <div>
        <Link to="/account/orders" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', textDecoration: 'underline' }}>
          <ArrowLeft size={14} /> Back to Orders History
        </Link>
      </div>

      {/* Detail Header Title */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        borderBottom: '1px solid var(--border)',
        paddingBottom: 'var(--spacing-md)',
        flexWrap: 'wrap',
        gap: 'var(--spacing-sm)'
      }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
            <span>Order ID:</span>
            <span style={{ fontFamily: 'monospace', fontSize: '14px', color: 'var(--accent)' }}>{order._id}</span>
          </h2>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
            <Calendar size={14} /> Placed on {new Date(createdAt).toLocaleString()}
          </span>
        </div>

        {/* Cancel Trigger button */}
        {(status === 'pending' || status === 'processing') && (
          <button
            onClick={handleCancelOrder}
            disabled={cancelling}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--error)', borderColor: 'var(--error)', padding: '8px 16px', fontSize: '11px' }}
          >
            <Trash2 size={14} /> {cancelling ? 'Cancelling...' : 'Cancel Order'}
          </button>
        )}
      </div>

      {/* Progress Timeline or Cancellation Warning */}
      <div style={{ border: '1px solid var(--border)', padding: 'var(--spacing-xl)', borderRadius: 'var(--radius-sm)' }}>
        <h3 style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--spacing-lg)' }}>Track Shipment</h3>
        
        {status === 'cancelled' ? (
          <div style={{
            backgroundColor: 'var(--error-bg)',
            color: 'var(--error)',
            padding: 'var(--spacing-md)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '13px',
            borderLeft: '4px solid var(--error)'
          }}>
            <strong>Order Cancelled:</strong> This transaction has been cancelled. If any payment was captured, refunds are automatically processed. Item stock levels have been restored.
          </div>
        ) : (
          <div className="timeline timeline-responsive-row" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>
            {steps.map((step, idx) => {
              const isActive = idx <= currentStepIndex;
              const isCurrent = idx === currentStepIndex;

              return (
                <div key={step} style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  flex: '1 1 0',
                  opacity: isActive ? 1 : 0.4,
                  textAlign: 'center'
                }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: 'var(--radius-round)',
                    backgroundColor: isActive ? 'var(--text-primary)' : 'var(--border)',
                    color: isActive ? 'var(--surface)' : 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '12px',
                    marginBottom: '8px',
                    boxShadow: isCurrent ? '0 0 0 4px var(--border)' : 'none'
                  }}>
                    {idx + 1}
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-primary)' }}>{step}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Split details layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 'var(--spacing-xl)' }} className="order-details-split">
        {/* Left Column - Product Items */}
        <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
          <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '12px var(--spacing-md)', borderBottom: '1px solid var(--border)', fontWeight: 600, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Ordered Items ({items.length})
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {items.map((item) => {
              const prod = item.product || {};
              return (
                <div key={prod._id} style={{ display: 'flex', gap: 'var(--spacing-md)', padding: 'var(--spacing-md)', borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
                  <img src={prod.image || 'https://via.placeholder.com/60x85'} alt={prod.name} style={{ width: '60px', height: '80px', objectFit: 'cover', backgroundColor: 'var(--bg-secondary)' }} />
                  <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', gap: '4px' }}>
                    <Link to={`/product/${prod._id}`} style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: '14px', textDecoration: 'underline' }}>
                      {prod.name || 'Unknown item'}
                    </Link>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{prod.category}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      ${item.price?.toFixed(2)} x {item.quantity}
                    </span>
                  </div>
                  <span style={{ marginLeft: 'auto', fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>
                    ${((item.price || 0) * item.quantity).toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column - Address details & payment summary card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
          {/* Card: Shipping & Payments */}
          <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: 'var(--spacing-lg)' }}>
            <h3 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border)', paddingBottom: '8px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MapPin size={16} /> Delivery Information
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {shippingAddress}
            </p>
          </div>

          <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: 'var(--spacing-lg)' }}>
            <h3 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border)', paddingBottom: '8px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CreditCard size={16} /> Payment Summary
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Method:</span>
                <span style={{ fontWeight: 500 }}>{paymentMethod}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Payment status:</span>
                <span style={{
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  color: paymentStatus === 'paid' ? 'var(--success)' : paymentStatus === 'refunded' ? 'var(--error)' : 'var(--warning)'
                }}>{paymentStatus}</span>
              </div>
              <hr style={{ border: 0, borderTop: '1px solid var(--border)', margin: '4px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
                <span>Total Amount:</span>
                <span>${totalAmount?.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .timeline-responsive-row {
            flex-direction: column !important;
            align-items: flex-start !important;
          }
          .timeline-responsive-row > div {
            flex-direction: row !important;
            align-items: center !important;
            gap: var(--spacing-sm);
            text-align: left !important;
            opacity: 1 !important;
          }
          .order-details-split {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
