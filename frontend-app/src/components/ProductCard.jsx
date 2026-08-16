import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import { Heart, ShoppingCart, Star } from 'lucide-react';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToast } = useToast();
  
  const [adding, setAdding] = useState(false);

  const { _id, name, price, image, category, stock } = product;
  const isWishlisted = isInWishlist(_id);

  // Derived mock rating and discount based on product _id hash length/chars
  const mockRating = ((_id.charCodeAt(_id.length - 1) % 5) * 0.2 + 4.2).toFixed(1);
  const mockReviewCount = (_id.charCodeAt(_id.length - 2) * 2) % 40 + 12;
  const isSale = _id.charCodeAt(_id.length - 3) % 4 === 0;
  const oldPrice = isSale ? (price * 1.25).toFixed(2) : null;
  const discountPct = isSale ? 20 : null;

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (stock <= 0) {
      addToast('Sorry, this product is out of stock.', 'warning');
      return;
    }

    setAdding(true);
    const result = await addToCart(_id, 1);
    setAdding(false);

    if (result.success) {
      addToast(`${name} added to cart.`, 'success');
    } else {
      addToast(result.error, 'error');
    }
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
    addToast(
      isWishlisted ? 'Removed from wishlist.' : 'Added to wishlist.',
      'info'
    );
  };

  return (
    <div className="product-card">
      {/* Product Image Container */}
      <div className="product-image-container">
        <Link to={`/product/${_id}`}>
          <img src={image || 'https://via.placeholder.com/300x375?text=No+Image'} alt={name} loading="lazy" />
        </Link>

        {/* Wishlist toggle button */}
        <button
          className="icon-btn wishlist-toggle-btn"
          onClick={handleWishlistToggle}
          title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart size={16} fill={isWishlisted ? 'var(--error)' : 'none'} color={isWishlisted ? 'var(--error)' : 'var(--text-primary)'} />
        </button>

        {/* Badges */}
        {stock <= 0 ? (
          <span className="product-badge" style={{ backgroundColor: 'var(--text-muted)' }}>OUT OF STOCK</span>
        ) : stock <= 5 ? (
          <span className="product-badge" style={{ backgroundColor: 'var(--warning)', color: '#ffffff' }}>LOW STOCK</span>
        ) : isSale ? (
          <span className="product-badge" style={{ backgroundColor: 'var(--error)', color: '#ffffff' }}>SALE -{discountPct}%</span>
        ) : null}
      </div>

      {/* Product Info details */}
      <div className="product-info">
        <span className="product-category">{category}</span>
        
        <Link to={`/product/${_id}`} className="product-title" title={name}>
          {name}
        </Link>

        {/* Stars */}
        <div className="product-rating">
          <div style={{ display: 'flex', color: '#ffb700' }}>
            <Star size={13} fill="#ffb700" />
          </div>
          <span>{mockRating}</span>
          <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>({mockReviewCount})</span>
        </div>

        {/* Pricing & Add to Cart button */}
        <div className="product-price-row">
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <span className="product-price">${price.toFixed(2)}</span>
            {oldPrice && <span className="product-old-price">${oldPrice}</span>}
          </div>
        </div>

        <button
          onClick={handleQuickAdd}
          disabled={adding || stock <= 0}
          className="btn btn-primary quick-add-btn"
          style={{ padding: '8px 12px', fontSize: '11px' }}
        >
          {adding ? 'Adding...' : 'Quick Add'}
        </button>
      </div>
    </div>
  );
}
