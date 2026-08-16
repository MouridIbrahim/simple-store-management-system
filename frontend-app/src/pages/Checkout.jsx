import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import API from '../services/api';
import { Lock, ArrowLeft } from 'lucide-react';

export default function Checkout() {
  const { cart, cartSubtotal, fetchCart } = useCart();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Contact Info State
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Shipping Address State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [apartment, setApartment] = useState('');
  const [city, setCity] = useState('');
  const [stateProv, setStateProv] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('United States');

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState('Card');
  const [submitting, setSubmitting] = useState(false);

  // Totals calculations
  const shippingCharge = cartSubtotal >= 75 || cartSubtotal === 0 ? 0 : 9.99;
  const estimatedTax = cartSubtotal * 0.08;
  const orderTotal = cartSubtotal + shippingCharge + estimatedTax;

  const items = cart?.items || [];

  if (items.length === 0) {
    return (
      <div className="container" style={{ padding: 'var(--spacing-xxl) 0', textAlign: 'center' }}>
        <h2>No items in checkout.</h2>
        <p style={{ color: 'var(--text-muted)', margin: 'var(--spacing-md) 0' }}>Add products to your cart before checking out.</p>
        <Link to="/shop" className="btn btn-primary">Start Shopping</Link>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!firstName || !lastName || !streetAddress || !city || !stateProv || !postalCode || !email) {
      addToast('Please complete all required fields.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      // Concatenate fields into shippingAddress string expected by the backend schema
      const formattedAddress = `${firstName} ${lastName}, ${streetAddress}${apartment ? ` Apt ${apartment}` : ''}, ${city}, ${stateProv} ${postalCode}, ${country}`;
      
      const response = await API.post('/orders', {
        shippingAddress: formattedAddress,
        paymentMethod: paymentMethod
      });

      addToast('Order placed successfully!', 'success');
      
      // Sync global cart context state (since backend cleared the cart)
      await fetchCart();

      // Navigate to order-success, passing the order record in routing state
      navigate('/order-success', {
        state: { order: response.data.order }
      });
    } catch (err) {
      console.error('Error placing order:', err);
      const errMsg = err.response?.data?.message || 'Failed to place order. Please review stock availability.';
      addToast(errMsg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: 'var(--spacing-xl)', paddingBottom: 'var(--spacing-xxl)' }}>
      {/* Back to Cart link */}
      <div style={{ textAlign: 'left', marginBottom: 'var(--spacing-md)' }}>
        <Link to="/cart" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', textDecoration: 'underline' }}>
          <ArrowLeft size={14} /> Return to Cart
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 'var(--spacing-xxl)', alignItems: 'flex-start' }} className="checkout-grid">
        {/* Left Column - Shipping & Payment Forms */}
        <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
          {/* Section 1: Customer Contact Info */}
          <div style={{ marginBottom: 'var(--spacing-xl)' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: 'var(--spacing-md)', fontFamily: 'var(--font-sans)', fontWeight: 500 }}>1. Contact Information</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }} className="grid-2-col">
              <div className="form-group">
                <label className="form-label" htmlFor="chk-email">Email Address *</label>
                <input
                  id="chk-email"
                  type="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="chk-phone">Phone Number</label>
                <input
                  id="chk-phone"
                  type="tel"
                  className="form-control"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Shipping Address Details */}
          <div style={{ marginBottom: 'var(--spacing-xl)' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: 'var(--spacing-md)', fontFamily: 'var(--font-sans)', fontWeight: 500 }}>2. Shipping Address</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-sm)' }} className="grid-2-col">
              <div className="form-group">
                <label className="form-label" htmlFor="chk-fn">First Name *</label>
                <input
                  id="chk-fn"
                  type="text"
                  className="form-control"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Jane"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="chk-ln">Last Name *</label>
                <input
                  id="chk-ln"
                  type="text"
                  className="form-control"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="chk-address">Street Address *</label>
              <input
                id="chk-address"
                type="text"
                className="form-control"
                value={streetAddress}
                onChange={(e) => setStreetAddress(e.target.value)}
                placeholder="123 Main St"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="chk-apt">Apartment, Suite, Unit (optional)</label>
              <input
                id="chk-apt"
                type="text"
                className="form-control"
                value={apartment}
                onChange={(e) => setApartment(e.target.value)}
                placeholder="Apt 4B"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-sm)' }} className="grid-3-col">
              <div className="form-group">
                <label className="form-label" htmlFor="chk-city">City *</label>
                <input
                  id="chk-city"
                  type="text"
                  className="form-control"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="New York"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="chk-state">State *</label>
                <input
                  id="chk-state"
                  type="text"
                  className="form-control"
                  value={stateProv}
                  onChange={(e) => setStateProv(e.target.value)}
                  placeholder="NY"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="chk-zip">Zip Code *</label>
                <input
                  id="chk-zip"
                  type="text"
                  className="form-control"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="10001"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="chk-country">Country *</label>
              <select
                id="chk-country"
                className="form-control"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              >
                <option value="United States">United States</option>
                <option value="Canada">Canada</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="France">France</option>
                <option value="Germany">Germany</option>
              </select>
            </div>
          </div>

          {/* Section 3: Payment Method selection */}
          <div style={{ marginBottom: 'var(--spacing-xl)' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: 'var(--spacing-md)', fontFamily: 'var(--font-sans)', fontWeight: 500 }}>3. Payment Method</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Card option */}
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: 'var(--spacing-md)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: paymentMethod === 'Card' ? 'var(--bg-secondary)' : 'var(--surface)',
                cursor: 'pointer'
              }}>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'Card'}
                  onChange={() => setPaymentMethod('Card')}
                  style={{ accentColor: 'var(--brand-dark)' }}
                />
                <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Credit / Debit Card</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Pay securely via your VISA, Mastercard, or AMEX.</span>
                </div>
              </label>

              {/* Cash option */}
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: 'var(--spacing-md)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: paymentMethod === 'Cash' ? 'var(--bg-secondary)' : 'var(--surface)',
                cursor: 'pointer'
              }}>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'Cash'}
                  onChange={() => setPaymentMethod('Cash')}
                  style={{ accentColor: 'var(--brand-dark)' }}
                />
                <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Cash on Delivery</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Pay with cash when items are delivered to your doorstep.</span>
                </div>
              </label>
            </div>
          </div>
        </form>

        {/* Right Column - Sticky Cart summary list */}
        <div style={{
          position: 'sticky',
          top: '100px',
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
          padding: 'var(--spacing-xl)',
          textAlign: 'left'
        }} className="sticky-summary">
          <h2 style={{ fontSize: '1.25rem', marginBottom: 'var(--spacing-md)', fontFamily: 'var(--font-sans)', fontWeight: 600 }}>Checkout Summary</h2>
          
          {/* List items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)', maxHeight: '200px', overflowY: 'auto', borderBottom: '1px solid var(--border)', paddingBottom: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)' }}>
            {items.map((item) => {
              const prod = item.product || {};
              return (
                <div key={prod._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <img src={prod.image || 'https://via.placeholder.com/40x50'} alt={prod.name} style={{ width: '40px', height: '50px', objectFit: 'cover' }} />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{prod.name}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Qty: {item.quantity}</span>
                    </div>
                  </div>
                  <span style={{ fontWeight: 600 }}>${(prod.price * item.quantity).toFixed(2)}</span>
                </div>
              );
            })}
          </div>

          {/* Pricing calculations */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)', fontSize: '14px', borderBottom: '1px solid var(--border)', paddingBottom: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Subtotal</span>
              <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>${cartSubtotal.toFixed(2)}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Shipping</span>
              <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                {shippingCharge === 0 ? 'FREE' : `$${shippingCharge.toFixed(2)}`}
              </span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Estimated Tax (8%)</span>
              <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>${estimatedTax.toFixed(2)}</span>
            </div>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '16px',
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: 'var(--spacing-lg)'
          }}>
            <span>Order Total</span>
            <span>${orderTotal.toFixed(2)}</span>
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="btn btn-primary"
            style={{ width: '100%', display: 'flex', gap: '8px', padding: '14px' }}
          >
            <Lock size={16} />
            {submitting ? 'Placing Order...' : `Pay & Place Order ($${orderTotal.toFixed(2)})`}
          </button>
        </div>
      </div>

      {/* Media queries overrides */}
      <style>{`
        @media (max-width: 768px) {
          .checkout-grid {
            grid-template-columns: 1fr !important;
          }
          .grid-2-col, .grid-3-col {
            grid-template-columns: 1fr !important;
            gap: 0 !important;
          }
          .sticky-summary {
            position: relative !important;
            top: 0 !important;
            margin-top: var(--spacing-xl);
          }
        }
      `}</style>
    </div>
  );
}
