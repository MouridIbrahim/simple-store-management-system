import React from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import { CheckCircle2, ShoppingBag, Eye, Truck } from 'lucide-react';

export default function OrderSuccess() {
  const location = useLocation();
  const order = location.state?.order;

  // Fallback if accessed directly without completing checkout
  if (!order) {
    return <Navigate to="/" replace />;
  }

  const { _id, totalAmount, shippingAddress, paymentMethod, paymentStatus, createdAt, items = [] } = order;

  const orderDate = new Date(createdAt);
  const deliveryStart = new Date(orderDate);
  deliveryStart.setDate(deliveryStart.getDate() + 3);
  const deliveryEnd = new Date(orderDate);
  deliveryEnd.setDate(deliveryEnd.getDate() + 7);

  const formatDate = (d) => d.toLocaleDateString(undefined, { weekday: 'short', month: 'long', day: 'numeric' });

  return (
    <div className="container" style={{
      maxWidth: '650px',
      margin: 'var(--spacing-xxl) auto',
      padding: '0 var(--spacing-lg)',
      textAlign: 'center'
    }}>
      {/* Icon Check */}
      <div style={{ display: 'inline-flex', color: 'var(--success)', marginBottom: 'var(--spacing-md)' }}>
        <CheckCircle2 size={64} strokeWidth={1.5} />
      </div>

      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', fontWeight: 400, marginBottom: 'var(--spacing-xs)' }}>
        Order Confirmed
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: 'var(--spacing-sm)' }}>
        Thank you for shopping with us. We have received your order details.
      </p>

      {/* Estimated Delivery */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        backgroundColor: 'var(--success-bg)',
        color: 'var(--success)',
        padding: '8px 16px',
        borderRadius: 'var(--radius-sm)',
        fontSize: '13px',
        fontWeight: 500,
        marginBottom: 'var(--spacing-xl)'
      }}>
        <Truck size={16} />
        Estimated delivery: {formatDate(deliveryStart)} – {formatDate(deliveryEnd)}
      </div>

      {/* Invoice Card */}
      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-sm)',
        padding: 'var(--spacing-xl)',
        textAlign: 'left',
        marginBottom: 'var(--spacing-xl)',
        fontSize: '13px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 'var(--spacing-sm)', marginBottom: 'var(--spacing-md)' }}>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Order ID:</span>
          <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--accent)' }}>{_id}</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Placed On:</span>
            <span style={{ fontWeight: 500 }}>{new Date(createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Payment Method:</span>
            <span style={{ fontWeight: 500 }}>{paymentMethod}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Payment Status:</span>
            <span style={{ fontWeight: 500, textTransform: 'capitalize', color: 'var(--success)' }}>{paymentStatus || 'paid'}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ color: 'var(--text-secondary)', minWidth: '120px' }}>Shipping To:</span>
            <span style={{ fontWeight: 500, textAlign: 'right', maxWidth: '300px' }}>{shippingAddress}</span>
          </div>

          <hr style={{ border: 0, borderTop: '1px solid var(--border)', margin: 'var(--spacing-sm) 0' }} />

          {/* Item Summary Table */}
          {items.length > 0 && (
            <div style={{ marginBottom: 'var(--spacing-sm)' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '8px' }}>Order Items</span>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                    <th style={{ padding: '6px 0', fontWeight: 600 }}>Product</th>
                    <th style={{ padding: '6px 0', fontWeight: 600, textAlign: 'center' }}>Qty</th>
                    <th style={{ padding: '6px 0', fontWeight: 600, textAlign: 'right' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '8px 0' }}>{item.product?.name || 'Product'}</td>
                      <td style={{ padding: '8px 0', textAlign: 'center' }}>{item.quantity}</td>
                      <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: 500 }}>
                        ${((item.price || item.product?.price || 0) * item.quantity).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <hr style={{ border: 0, borderTop: '1px solid var(--border)', margin: 'var(--spacing-sm) 0' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
            <span>Amount Paid:</span>
            <span>${totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: 'var(--spacing-md)', justifyContent: 'center' }}>
        <Link to={`/account/orders/${_id}`} className="btn btn-primary" style={{ display: 'flex', gap: '8px', padding: '12px 20px' }}>
          <Eye size={16} /> Track Order
        </Link>
        <Link to="/" className="btn btn-secondary" style={{ display: 'flex', gap: '8px', padding: '12px 20px' }}>
          <ShoppingBag size={16} /> Continue Shopping
        </Link>
      </div>
    </div>
  );
}
