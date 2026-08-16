import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import ProductCard from '../components/ProductCard';
import { Star, Heart, Plus, Minus, ShoppingBag, ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToast } = useToast();

  // API State
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Interaction State
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('Black');
  const [activeAccordion, setActiveAccordion] = useState('desc');
  const [submitting, setSubmitting] = useState(false);

  // Reviews state (client-side mock)
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ name: '', rating: 5, comment: '' });
  const [showReviewForm, setShowReviewForm] = useState(false);

  // Sizes & Colors list (mocks)
  const sizes = ['XS', 'S', 'M', 'L', 'XL'];
  const colors = ['Black', 'Off-White', 'Heather Gray', 'Navy Blue'];

  // Fetch product detail and related products
  useEffect(() => {
    const fetchProductData = async () => {
      setLoading(true);
      setError(null);
      try {
        const detailRes = await API.get(`/products/${id}`);
        setProduct(detailRes.data);

        // Fetch related products (same category, exclude current)
        const listRes = await API.get('/products');
        const related = listRes.data
          .filter((item) => item.category === detailRes.data.category && item._id !== id)
          .slice(0, 4);
        setRelatedProducts(related);

        // Seed mock reviews based on product id
        const seed = detailRes.data._id.charCodeAt(0);
        const mockReviews = [
          { id: 1, name: 'Alex M.', rating: 5, comment: 'Excellent quality and fit. Exactly as described.', date: '2025-11-12' },
          { id: 2, name: 'Jordan K.', rating: 4, comment: 'Great product, shipping was fast. Would buy again.', date: '2025-10-28' },
          { id: 3, name: 'Sam R.', rating: seed % 2 === 0 ? 5 : 4, comment: 'Love the material and craftsmanship. Highly recommend.', date: '2025-10-05' },
        ];
        setReviews(mockReviews);
      } catch (err) {
        console.error('Error loading product detail:', err);
        setError(err.response?.data?.message || 'Product not found.');
      } finally {
        setLoading(false);
      }
    };
    
    // Reset inputs
    setQuantity(1);
    fetchProductData();
  }, [id]);

  if (loading) {
    return (
      <div className="container" style={{ padding: 'var(--spacing-xxl) 0', textAlign: 'center' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container" style={{ padding: 'var(--spacing-xxl) 0', textAlign: 'center' }}>
        <h2>Product Details Error</h2>
        <p style={{ color: 'var(--text-muted)', margin: 'var(--spacing-md) 0' }}>{error || 'Unable to locate product info.'}</p>
        <Link to="/shop" className="btn btn-primary">
          <ArrowLeft size={16} style={{ marginRight: '8px' }} /> Return to Catalogue
        </Link>
      </div>
    );
  }

  const { _id, name, price, description, image, category, stock } = product;
  const isWishlisted = isInWishlist(_id);

  // Derived mock metadata based on ID
  const mockRating = ((_id.charCodeAt(_id.length - 1) % 5) * 0.2 + 4.2).toFixed(1);
  const mockReviewCount = (_id.charCodeAt(_id.length - 2) * 2) % 40 + 12;
  const isSale = _id.charCodeAt(_id.length - 3) % 4 === 0;
  const oldPrice = isSale ? (price * 1.25).toFixed(2) : null;

  const handleAddToCart = async () => {
    if (stock <= 0) {
      addToast('Sorry, this product is out of stock.', 'warning');
      return;
    }
    setSubmitting(true);
    const result = await addToCart(_id, quantity);
    setSubmitting(false);

    if (result.success) {
      addToast(`${name} (${quantity}) added to cart.`, 'success');
    } else {
      addToast(result.error, 'error');
    }
  };

  const handleBuyNow = async () => {
    if (stock <= 0) {
      addToast('Sorry, this product is out of stock.', 'warning');
      return;
    }
    const result = await addToCart(_id, quantity);
    if (result.success) {
      navigate('/cart');
    } else {
      addToast(result.error, 'error');
    }
  };

  const toggleAccordion = (section) => {
    setActiveAccordion(activeAccordion === section ? null : section);
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!reviewForm.name.trim() || !reviewForm.comment.trim()) {
      addToast('Please fill in your name and review.', 'warning');
      return;
    }
    const newReview = {
      id: Date.now(),
      name: reviewForm.name.trim(),
      rating: reviewForm.rating,
      comment: reviewForm.comment.trim(),
      date: new Date().toISOString().split('T')[0],
    };
    setReviews((prev) => [newReview, ...prev]);
    setReviewForm({ name: '', rating: 5, comment: '' });
    setShowReviewForm(false);
    addToast('Thank you! Your review has been submitted.', 'success');
  };

  const ratingDistribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    pct: reviews.length ? (reviews.filter((r) => r.rating === star).length / reviews.length) * 100 : 0,
  }));

  return (
    <div className="container" style={{ paddingTop: 'var(--spacing-xl)', paddingBottom: 'var(--spacing-xxl)' }}>
      {/* Breadcrumbs / Back navigation */}
      <div style={{ display: 'flex', gap: '8px', fontSize: '12px', color: 'var(--text-muted)', marginBottom: 'var(--spacing-lg)', textAlign: 'left' }}>
        <Link to="/">Home</Link>
        <span>/</span>
        <Link to="/shop">Shop</Link>
        <span>/</span>
        <Link to={`/shop?category=${encodeURIComponent(category)}`}>{category}</Link>
        <span>/</span>
        <span style={{ color: 'var(--text-primary)' }}>{name}</span>
      </div>

      {/* Main details Split grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 'var(--spacing-xxl)', textAlign: 'left' }} className="product-details-grid">
        {/* Left Column - Product gallery */}
        <div>
          <div style={{ border: '1px solid var(--border)', backgroundColor: 'var(--bg-secondary)', width: '100%', position: 'relative' }}>
            <img src={image || 'https://via.placeholder.com/600x750?text=No+Image'} alt={name} style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover' }} />
            
            {/* Wishlist floating toggle */}
            <button
              onClick={() => { toggleWishlist(product); addToast(isWishlisted ? 'Removed from wishlist.' : 'Added to wishlist.', 'info'); }}
              className="icon-btn"
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                backgroundColor: 'var(--surface)',
                boxShadow: 'var(--shadow-md)',
                padding: '12px'
              }}
            >
              <Heart size={20} fill={isWishlisted ? 'var(--error)' : 'none'} color={isWishlisted ? 'var(--error)' : 'var(--text-primary)'} />
            </button>
          </div>

          {/* Sizing thumbnails layout */}
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)', marginTop: 'var(--spacing-sm)' }}>
            {[1, 2, 3].map((num) => (
              <div key={num} style={{ border: '1px solid var(--border)', width: '80px', height: '100px', cursor: 'pointer', overflow: 'hidden', opacity: num === 1 ? 1 : 0.6 }}>
                <img src={image || 'https://via.placeholder.com/80x100'} alt={`thumbnail-${num}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))}
          </div>
        </div>

        {/* Right Column - Product descriptions and controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
          {/* Metadata */}
          <div>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>{category}</span>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', fontWeight: 400, marginTop: '4px', marginBottom: '8px' }}>{name}</h1>

            {/* Stars */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
              <div style={{ display: 'flex', color: '#ffb700' }}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={14} fill={s <= Math.floor(mockRating) ? "#ffb700" : "none"} color="#ffb700" />
                ))}
              </div>
              <span>{mockRating}</span>
              <span style={{ color: 'var(--text-muted)' }}>| {mockReviewCount} Verified Customer Reviews</span>
            </div>
          </div>

          {/* Pricing */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: 'var(--spacing-sm) 0' }}>
            <span style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>${price.toFixed(2)}</span>
            {oldPrice && (
              <>
                <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: '18px' }}>${oldPrice}</span>
                <span style={{ color: 'var(--error)', fontSize: '13px', fontWeight: 600 }}>Save 20%</span>
              </>
            )}
          </div>

          {/* Stock state */}
          <div>
            <span style={{ fontSize: '12px', fontWeight: 600, color: stock <= 0 ? 'var(--error)' : stock <= 5 ? 'var(--warning)' : 'var(--success)' }}>
              {stock <= 0 ? 'Sold Out' : stock <= 5 ? `Only ${stock} items remaining!` : 'In stock, ready to dispatch'}
            </span>
          </div>

          {/* Colors Selection (Mock) */}
          <div>
            <span className="form-label">Color: <span style={{ textTransform: 'none', color: 'var(--text-primary)', fontWeight: 500 }}>{selectedColor}</span></span>
            <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
              {colors.map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedColor(c)}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: 'var(--radius-round)',
                    backgroundColor: c === 'Black' ? '#111' : c === 'Off-White' ? '#fafafa' : c === 'Heather Gray' ? '#d4d4d8' : '#1e3a8a',
                    border: selectedColor === c ? '2px solid var(--accent)' : '1px solid var(--border)',
                    outlineOffset: '2px',
                    cursor: 'pointer'
                  }}
                  title={c}
                />
              ))}
            </div>
          </div>

          {/* Sizes Selection (Mock) */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-xs)' }}>
              <span className="form-label" style={{ margin: 0 }}>Size</span>
              <span style={{ fontSize: '11px', textDecoration: 'underline', cursor: 'pointer', color: 'var(--text-muted)' }}>Size Guide</span>
            </div>
            <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
              {sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSize(s)}
                  style={{
                    minWidth: '40px',
                    height: '40px',
                    border: '1px solid var(--border)',
                    backgroundColor: selectedSize === s ? 'var(--brand-dark)' : 'var(--surface)',
                    color: selectedSize === s ? 'var(--surface)' : 'var(--text-primary)',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'var(--transition)'
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Add to Cart Actions */}
          <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-sm)' }}>
            {/* Quantity */}
            <div className="quantity-control">
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))} disabled={stock <= 0}>
                <Minus size={14} />
              </button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity(q => Math.min(stock, q + 1))} disabled={stock <= 0}>
                <Plus size={14} />
              </button>
            </div>

            {/* Triggers */}
            <button
              onClick={handleAddToCart}
              disabled={submitting || stock <= 0}
              className="btn btn-primary"
              style={{ flexGrow: 1, display: 'flex', gap: '8px', height: '42px', padding: 0 }}
            >
              <ShoppingBag size={16} />
              {submitting ? 'Adding...' : 'Add to Cart'}
            </button>
          </div>

          <button
            onClick={handleBuyNow}
            disabled={stock <= 0}
            className="btn btn-secondary"
            style={{ width: '100%', height: '42px', padding: 0 }}
          >
            Buy It Now
          </button>

          {/* Description Accordions */}
          <div className="accordion">
            {/* 1. Description */}
            <div className="accordion-item">
              <div className="accordion-header" onClick={() => toggleAccordion('desc')}>
                <span>Product Description</span>
                {activeAccordion === 'desc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
              {activeAccordion === 'desc' && (
                <div className="accordion-content">
                  {description}
                </div>
              )}
            </div>

            {/* 2. Size & Fit */}
            <div className="accordion-item">
              <div className="accordion-header" onClick={() => toggleAccordion('sizefit')}>
                <span>Size & Fit</span>
                {activeAccordion === 'sizefit' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
              {activeAccordion === 'sizefit' && (
                <div className="accordion-content">
                  Model is 6&apos;1&quot; / 185 cm and wears size M. Relaxed fit through the chest and shoulders with a slightly dropped shoulder seam. For a tighter fit, size down. Refer to our size guide for detailed measurements across all sizes.
                </div>
              )}
            </div>

            {/* 3. Fabric & Care */}
            <div className="accordion-item">
              <div className="accordion-header" onClick={() => toggleAccordion('materials')}>
                <span>Materials & Care</span>
                {activeAccordion === 'materials' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
              {activeAccordion === 'materials' && (
                <div className="accordion-content">
                  Designed for heavy-wearing durability. Built using 100% GOTS-certified Organic Cotton loopback fleece. Hand-wash or delicate cycle cold machine-wash. Air-dry flat to maintain sizing structure.
                </div>
              )}
            </div>

            {/* 4. Delivery & Returns */}
            <div className="accordion-item">
              <div className="accordion-header" onClick={() => toggleAccordion('shipping')}>
                <span>Delivery & Return Guidelines</span>
                {activeAccordion === 'shipping' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
              {activeAccordion === 'shipping' && (
                <div className="accordion-content">
                  Standard delivery (3–5 working days) is free on all orders over $75. Priority express delivery (1–2 days) is available at checkout. We support a 14-day hassle-free return window on all unworn items with tags attached.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <section style={{ marginTop: 'var(--spacing-xxl)', borderTop: '1px solid var(--border)', paddingTop: 'var(--spacing-xxl)', textAlign: 'left' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xl)', flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', fontWeight: 400 }}>Customer Reviews</h2>
          <button className="btn btn-secondary" onClick={() => setShowReviewForm(!showReviewForm)} style={{ fontSize: '11px', padding: '8px 16px' }}>
            {showReviewForm ? 'Cancel' : 'Write a Review'}
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 'var(--spacing-xl)', marginBottom: 'var(--spacing-xl)' }} className="reviews-summary-grid">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
              {reviews.length
                ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
                : mockRating}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', color: '#ffb700', margin: '4px 0' }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={14} fill={s <= Math.floor(parseFloat(reviews.length ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : mockRating)) ? '#ffb700' : 'none'} color="#ffb700" />
              ))}
            </div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{reviews.length} review{reviews.length !== 1 ? 's' : ''}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {ratingDistribution.map(({ star, count, pct }) => (
              <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                <span style={{ minWidth: '32px' }}>{star} ★</span>
                <div style={{ flex: 1, height: '6px', backgroundColor: 'var(--border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, backgroundColor: '#ffb700' }} />
                </div>
                <span style={{ minWidth: '24px', color: 'var(--text-muted)' }}>{count}</span>
              </div>
            ))}
          </div>
        </div>

        {showReviewForm && (
          <form onSubmit={handleReviewSubmit} style={{
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            padding: 'var(--spacing-lg)',
            marginBottom: 'var(--spacing-xl)',
            backgroundColor: 'var(--bg-secondary)'
          }}>
            <h3 style={{ fontSize: '14px', marginBottom: 'var(--spacing-md)' }}>Write a Review</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="review-name">Your Name</label>
                <input id="review-name" type="text" className="form-control" value={reviewForm.name} onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="review-rating">Rating</label>
                <select id="review-rating" className="form-control" value={reviewForm.rating} onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}>
                  {[5, 4, 3, 2, 1].map((r) => (
                    <option key={r} value={r}>{r} Star{r !== 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: 'var(--spacing-md)' }}>
              <label className="form-label" htmlFor="review-comment">Your Review</label>
              <textarea id="review-comment" className="form-control" rows={3} value={reviewForm.comment} onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })} required />
            </div>
            <button type="submit" className="btn btn-primary" style={{ fontSize: '11px', padding: '8px 16px' }}>Submit Review</button>
          </form>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
          {reviews.map((review) => (
            <div key={review.id} style={{ borderBottom: '1px solid var(--border)', paddingBottom: 'var(--spacing-md)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontWeight: 600, fontSize: '14px' }}>{review.name}</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{review.date}</span>
              </div>
              <div style={{ display: 'flex', color: '#ffb700', marginBottom: '6px' }}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={12} fill={s <= review.rating ? '#ffb700' : 'none'} color="#ffb700" />
                ))}
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{review.comment}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Related Products Showcase */}
      {relatedProducts.length > 0 && (
        <section style={{ marginTop: 'var(--spacing-xxl)', borderTop: '1px solid var(--border)', paddingTop: 'var(--spacing-xxl)' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', fontWeight: 400, textAlign: 'left', marginBottom: 'var(--spacing-xl)' }}>You May Also Like</h2>
          <div className="grid-4">
            {relatedProducts.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Styling overrides */}
      <style>{`
        @media (max-width: 768px) {
          .product-details-grid {
            grid-template-columns: 1fr !important;
            gap: var(--spacing-xl) !important;
          }
          .reviews-summary-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
