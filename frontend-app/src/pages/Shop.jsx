import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import API from '../services/api';
import ProductCard from '../components/ProductCard';
import { SlidersHorizontal, RotateCcw } from 'lucide-react';

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // API Catalog State
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters State
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [maxPrice, setMaxPrice] = useState(150);
  const [sortBy, setSortBy] = useState('newest');
  const [stockFilter, setStockFilter] = useState('all'); // all | in-stock | out-of-stock
  
  // Mobile Filters Modal overlay toggler
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Load products on mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await API.get('/products');
        setProducts(response.data);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load catalog products.');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Update filter query state if search parameter updates
  useEffect(() => {
    const searchVal = searchParams.get('search') || '';
    setSearchQuery(searchVal);
    
    const catVal = searchParams.get('category') || 'All';
    setSelectedCategory(catVal);
  }, [searchParams]);

  // Extract unique categories for filter listing
  const categories = ['All', ...new Set(products.map((p) => p.category))];

  // Apply filters and sorting client-side
  const filteredProducts = products
    .filter((product) => {
      // 1. Text Search matching
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      // 2. Category matching
      const matchesCategory =
        selectedCategory === 'All' || product.category === selectedCategory;

      // 3. Price matching
      const matchesPrice = product.price <= maxPrice;

      // 4. Stock availability
      const matchesStock =
        stockFilter === 'all' ||
        (stockFilter === 'in-stock' && product.stock > 0) ||
        (stockFilter === 'out-of-stock' && product.stock <= 0);

      return matchesSearch && matchesCategory && matchesPrice && matchesStock;
    })
    .sort((a, b) => {
      // 4. Sorting logic
      if (sortBy === 'price-asc') {
        return a.price - b.price;
      }
      if (sortBy === 'price-desc') {
        return b.price - a.price;
      }
      // 'newest' (default) - sorted by database createdAt descending
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setMaxPrice(150);
    setSortBy('newest');
    setStockFilter('all');
    setSearchParams({});
  };

  const renderFiltersContent = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)', textAlign: 'left' }}>
      {/* Search Input */}
      <div className="form-group">
        <label className="form-label" style={{ fontSize: '10px' }}>Search Catalogue</label>
        <input
          type="text"
          placeholder="Filter by keyword..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="form-control"
          style={{ padding: '8px 12px', fontSize: '13px' }}
        />
      </div>

      {/* Category Selection */}
      <div>
        <label className="form-label" style={{ fontSize: '10px' }}>Category</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {categories.map((cat) => (
            <label key={cat} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', color: selectedCategory === cat ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
              <input
                type="radio"
                name="category"
                checked={selectedCategory === cat}
                onChange={() => {
                  setSelectedCategory(cat);
                  // Update search query params
                  if (cat === 'All') {
                    searchParams.delete('category');
                  } else {
                    searchParams.set('category', cat);
                  }
                  setSearchParams(searchParams);
                }}
                style={{ accentColor: 'var(--brand-dark)' }}
              />
              <span style={{ fontWeight: selectedCategory === cat ? 500 : 400 }}>{cat}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Slider */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xs)' }}>
          <label className="form-label" style={{ fontSize: '10px', margin: 0 }}>Max Price</label>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>${maxPrice}</span>
        </div>
        <input
          type="range"
          min="0"
          max="250"
          step="5"
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          style={{ width: '100%', accentColor: 'var(--brand-dark)' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)' }}>
          <span>$0</span>
          <span>$250</span>
        </div>
      </div>

      {/* Stock Availability */}
      <div>
        <label className="form-label" style={{ fontSize: '10px' }}>Stock Availability</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {[
            { value: 'all', label: 'All Products' },
            { value: 'in-stock', label: 'In Stock Only' },
            { value: 'out-of-stock', label: 'Out of Stock' },
          ].map(({ value, label }) => (
            <label key={value} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', color: stockFilter === value ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
              <input
                type="radio"
                name="stock"
                checked={stockFilter === value}
                onChange={() => setStockFilter(value)}
                style={{ accentColor: 'var(--brand-dark)' }}
              />
              <span style={{ fontWeight: stockFilter === value ? 500 : 400 }}>{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Reset Trigger */}
      <button onClick={handleResetFilters} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '100%', padding: '10px', fontSize: '11px' }}>
        <RotateCcw size={14} /> Clear Filters
      </button>
    </div>
  );

  return (
    <div className="container" style={{ paddingTop: 'var(--spacing-xl)', paddingBottom: 'var(--spacing-xxl)' }}>
      {/* Title Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid var(--border)',
        paddingBottom: 'var(--spacing-md)',
        marginBottom: 'var(--spacing-xl)',
        textAlign: 'left'
      }}>
        <div>
          <h1 style={{ fontSize: '2rem' }}>Shop All</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Explore essentials engineered for daily utility.</p>
        </div>

        {/* Sort selector & filter toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
          {/* Sorting */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }} className="nav-links">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="form-control"
              style={{ width: '150px', padding: '6px 12px', fontSize: '13px', height: '36px' }}
            >
              <option value="newest">Newest first</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>

          {/* Filter button Mobile toggle */}
          <button
            className="btn btn-secondary"
            onClick={() => setMobileFiltersOpen(true)}
            style={{ display: 'none', alignItems: 'center', gap: '6px', height: '36px', padding: '0 16px' }}
            id="mobile-filters-trigger"
          >
            <SlidersHorizontal size={14} /> Filters
          </button>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: 'var(--spacing-xl)' }} className="shop-grid">
        {/* Desktop Sidebar Filters */}
        <aside className="shop-sidebar-desktop">
          {renderFiltersContent()}
        </aside>

        {/* Products Grid list */}
        <section>
          {loading ? (
            <div className="grid-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div className="skeleton" style={{ width: '100%', height: '280px' }}></div>
                  <div className="skeleton" style={{ width: '60%', height: '16px' }}></div>
                  <div className="skeleton" style={{ width: '40%', height: '16px' }}></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="toast toast-error" style={{ position: 'relative', margin: '0 auto', top: 0, right: 0 }}>
              <span>{error}</span>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 'var(--spacing-xxl) 0',
              border: '1px dashed var(--border)',
              borderRadius: 'var(--radius-sm)'
            }}>
              <h3 style={{ marginBottom: 'var(--spacing-xs)' }}>No Products Match</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--spacing-md)', fontSize: '13px' }}>Try relaxing your search terms or clearing price filters.</p>
              <button className="btn btn-primary" onClick={handleResetFilters}>Reset All Filters</button>
            </div>
          ) : (
            <div>
              <div style={{ marginBottom: 'var(--spacing-md)', fontSize: '12px', color: 'var(--text-muted)', textAlign: 'left' }}>
                Showing {filteredProducts.length} of {products.length} products
              </div>
              <div className="grid-3">
                {filteredProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Mobile Drawer Slide-up Panel */}
      {mobileFiltersOpen && (
        <div className="modal-overlay" onClick={() => setMobileFiltersOpen(false)}>
          <div
            className="modal-content"
            style={{
              maxHeight: '80vh',
              overflowY: 'auto',
              borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              maxWidth: '100%'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
              <h3 style={{ fontSize: '16px' }}>Filter Catalog</h3>
              <button className="btn-link" onClick={() => setMobileFiltersOpen(false)}>Apply</button>
            </div>
            {renderFiltersContent()}
          </div>
        </div>
      )}

      {/* Responsive layout media rules */}
      <style>{`
        @media (max-width: 768px) {
          .shop-grid {
            grid-template-columns: 1fr !important;
          }
          .shop-sidebar-desktop {
            display: none !important;
          }
          #mobile-filters-trigger {
            display: inline-flex !important;
          }
        }
      `}</style>
    </div>
  );
}
