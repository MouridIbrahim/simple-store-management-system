import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { Plus, Minus, Trash2, ArrowLeft, ShoppingBag } from 'lucide-react';

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, clearCart, cartSubtotal, loading } = useCart();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleQuantityChange = async (productId, currentQty, delta) => {
    const newQty = currentQty + delta;
    const result = await updateQuantity(productId, newQty);
    if (!result.success) {
      addToast(result.error || 'Failed to update quantity.', 'error');
    }
  };

  const handleRemove = async (productId, name) => {
    const result = await removeFromCart(productId);
    if (result.success) {
      addToast(`${name} removed from cart.`, 'info');
    } else {
      addToast('Failed to remove item.', 'error');
    }
  };

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your shopping cart?')) {
      const result = await clearCart();
      if (result.success) {
        addToast('Cart cleared.', 'info');
      }
    }
  };

  // Tax and Shipping estimations
  const shippingCharge = cartSubtotal >= 75 || cartSubtotal === 0 ? 0 : 9.99;
  const estimatedTax = cartSubtotal * 0.08;
  const orderTotal = cartSubtotal + shippingCharge + estimatedTax;

  if (loading && !cart) {
    return (
      <div className="container" style={{ padding: 'var(--spacing-xxl) 0', textAlign: 'center' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  const items = cart?.items || [];

  if (items.length === 0) {
    return (
      <div className="container" style={{
        padding: 'var(--spacing-xxl) 0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: 'var(--spacing-md)'
      }}>
        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          padding: '24px',
          borderRadius: 'var(--radius-round)',
          color: 'var(--text-muted)'
        }}>
          <ShoppingBag size={48} />
        </div>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', fontWeight: 400 }}>Your cart is empty.</h2>
        <p style={{ color: 'var(--text-muted)', maxWidth: '340px', fontSize: '13px' }}>
          Discover our essentials collections and add premium pieces designed for everyday wear.
        </p>
        <Link to="/shop" className="btn btn-primary" style={{ marginTop: 'var(--spacing-sm)' }}>
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: 'var(--spacing-xl)', paddingBottom: 'var(--spacing-xxl)' }}>
      <h1 style={{ fontSize: '2rem', textAlign: 'left', marginBottom: 'var(--spacing-xl)' }}>Shopping Cart</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--spacing-xl)', alignItems: 'flex-start' }} className="cart-grid">
        {/* Left Column - Items List Table */}
        <div>
          <div className="cart-table-header">
            <span>Product Details</span>
            <span style={{ textAlign: 'center' }}>Price</span>
            <span style={{ textAlign: 'center' }}>Quantity</span>
            <span style={{ textAlign: 'right' }}>Total</span>
          </div>

          <div>
            {items.map((item) => {
              const prod = item.product || {};
              const itemTotal = (prod.price || 0) * item.quantity;
              
              return (
                <div key={item.product?._id || item._id} className="cart-row">
                  {/* Info details */}
                  <div className="cart-item-details">
                    <img
                      src={prod.image || 'https://via.placeholder.com/80x100?text=No+Image'}
                      alt={prod.name}
                      className="cart-item-img"
                    />
                    <div className="cart-item-meta">
                      <Link to={`/product/${prod._id}`} className="cart-item-name">
                        {prod.name || 'Unknown Product'}
                      </Link>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{prod.category}</span>
                      
                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemove(prod._id, prod.name)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          color: 'var(--error)',
                          marginTop: '8px',
                          fontSize: '11px'
                        }}
                        className="btn-link"
                      >
                        <Trash2 size={12} /> Remove
                      </button>
                    </div>
                  </div>

                  {/* Price */}
                  <div style={{ textAlign: 'center', fontWeight: 500, color: 'var(--text-primary)' }}>
                    ${prod.price?.toFixed(2)}
                  </div>

                  {/* Quantity controls */}
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <div className="quantity-control">
                      <button onClick={() => handleQuantityChange(prod._id, item.quantity, -1)}>
                        <Minus size={12} />
                      </button>
                      <span>{item.quantity}</span>
                      <button onClick={() => handleQuantityChange(prod._id, item.quantity, 1)} disabled={item.quantity >= prod.stock}>
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Total */}
                  <div style={{ textAlign: 'right', fontWeight: 600, color: 'var(--text-primary)' }}>
                    ${itemTotal.toFixed(2)}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Cart actions */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--spacing-lg)' }}>
            <Link to="/shop" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', textDecoration: 'underline' }}>
              <ArrowLeft size={14} /> Continue Shopping
            </Link>
            
            <button onClick={handleClearCart} className="btn-link" style={{ color: 'var(--text-muted)', fontSize: '13px', textDecoration: 'underline' }}>
              Clear Shopping Cart
            </button>
          </div>
        </div>

        {/* Right Column - Order summary card */}
        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
          padding: 'var(--spacing-xl)',
          textAlign: 'left'
        }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: 'var(--spacing-md)', fontFamily: 'var(--font-sans)', fontWeight: 600 }}>Order Summary</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)', fontSize: '14px', borderBottom: '1px solid var(--border)', paddingBottom: 'var(--spacing-md)' }}>
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

            {shippingCharge > 0 && (
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '-4px' }}>
                Add ${(75 - cartSubtotal).toFixed(2)} more for free shipping!
              </span>
            )}
            
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
            padding: 'var(--spacing-md) 0'
          }}>
            <span>Order Total</span>
            <span>${orderTotal.toFixed(2)}</span>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: 'var(--spacing-sm)', padding: '14px' }}
          >
            Proceed to Checkout
          </button>

          <p style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', marginTop: 'var(--spacing-md)' }}>
            Secure payment processing. Returns accepted within 14 days.
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .cart-grid {
            grid-template-columns: 1fr !important;
            gap: var(--spacing-xl) !important;
          }
        }
      `}</style>
    </div>
  );
}
