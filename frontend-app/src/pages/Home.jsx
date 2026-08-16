import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import ProductCard from '../components/ProductCard';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        const response = await API.get('/products');
        // The API returns products sorted by newest first already. Take top 4.
        setNewArrivals(response.data.slice(0, 4));
      } catch (err) {
        console.error('Error fetching new arrivals:', err);
        setError('Could not fetch new arrivals catalog.');
      } finally {
        setLoading(false);
      }
    };
    fetchNewArrivals();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xxl)' }}>
      {/* 1. Editorial Hero Section */}
      <section style={{
        backgroundColor: '#f0f0f0',
        backgroundImage: 'linear-gradient(rgba(0,0,0,0.15), rgba(0,0,0,0.15)), url("https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop")',
        backgroundSize: 'cover',
        backgroundPosition: 'center 30%',
        minHeight: '520px',
        display: 'flex',
        alignItems: 'center',
        color: '#ffffff',
        position: 'relative'
      }}>
        <div className="container" style={{ textAlign: 'left', zIndex: 10 }}>
          <div style={{ maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            <h1 style={{
              fontSize: '3.5rem',
              color: '#ffffff',
              lineHeight: 1.1,
              fontFamily: 'var(--font-serif)'
            }}>Designed for Everyday.</h1>
            <p style={{ fontSize: '16px', fontWeight: 300, opacity: 0.9 }}>
              Premium essentials made for modern living. Built on principles of simplicity, comfort, and sustainable construction.
            </p>
            <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-sm)' }}>
              <Link to="/shop" className="btn btn-primary" style={{ backgroundColor: '#ffffff', color: '#000000' }}>
                Shop Collection
              </Link>
              <Link to="/shop" className="btn btn-secondary" style={{ borderColor: '#ffffff', color: '#ffffff' }}>
                Explore All
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Featured Category Cards (Asymmetric Grid) */}
      <section className="container">
        <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-xl)' }}>
          <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent)', fontWeight: 600 }}>Categories</span>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 400, marginTop: '4px' }}>Essential Wardrobe Collections</h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr',
          gap: 'var(--spacing-lg)',
          minHeight: '340px'
        }} className="asymmetric-grid">
          {/* Card 1 */}
          <Link to="/shop?category=Hoodies" className="category-card" style={{
            backgroundImage: 'linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url("https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=600&auto=format&fit=crop")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            alignItems: 'flex-end',
            padding: 'var(--spacing-lg)',
            color: '#ffffff',
            borderRadius: 'var(--radius-sm)'
          }}>
            <div>
              <h3 style={{ color: '#ffffff', fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 400 }}>Hoodies</h3>
              <p style={{ fontSize: '12px', opacity: 0.9 }}>Heavyweight organic cotton loopback fleece.</p>
            </div>
          </Link>

          {/* Card 2 */}
          <Link to="/shop?category=T-Shirts" className="category-card" style={{
            backgroundImage: 'linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url("https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600&auto=format&fit=crop")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            alignItems: 'flex-end',
            padding: 'var(--spacing-lg)',
            color: '#ffffff',
            borderRadius: 'var(--radius-sm)'
          }}>
            <div>
              <h3 style={{ color: '#ffffff', fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 400 }}>T-Shirts</h3>
              <p style={{ fontSize: '12px', opacity: 0.9 }}>Perfect fit tees.</p>
            </div>
          </Link>

          {/* Card 3 */}
          <Link to="/shop?category=Pants" className="category-card" style={{
            backgroundImage: 'linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url("https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=600&auto=format&fit=crop")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            alignItems: 'flex-end',
            padding: 'var(--spacing-lg)',
            color: '#ffffff',
            borderRadius: 'var(--radius-sm)'
          }}>
            <div>
              <h3 style={{ color: '#ffffff', fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 400 }}>Pants</h3>
              <p style={{ fontSize: '12px', opacity: 0.9 }}>Tailored standard pants.</p>
            </div>
          </Link>
        </div>
      </section>

      {/* 3. New Arrivals (Products Showcase) */}
      <section className="container" style={{ marginBottom: 'var(--spacing-xxl)' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginBottom: 'var(--spacing-xl)',
          textAlign: 'left'
        }}>
          <div>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent)', fontWeight: 600 }}>New Arrivals</span>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 400, marginTop: '4px' }}>Fresh Pieces for the Season</h2>
          </div>
          <Link to="/shop" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', textDecoration: 'underline' }}>
            Shop All <ArrowRight size={14} />
          </Link>
        </div>

        {/* Dynamic Catalog Section */}
        {loading ? (
          <div className="grid-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div className="skeleton" style={{ width: '100%', height: '300px' }}></div>
                <div className="skeleton" style={{ width: '60%', height: '16px' }}></div>
                <div className="skeleton" style={{ width: '40%', height: '16px' }}></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="toast toast-error" style={{ margin: '0 auto', display: 'flex' }}>
            <span>{error}</span>
          </div>
        ) : newArrivals.length === 0 ? (
          <div style={{ border: '1px dashed var(--border)', padding: 'var(--spacing-xxl)', textAlign: 'center' }}>
            <p>No products found in database yet. Head to Admin to add products!</p>
            <Link to="/admin/products" className="btn btn-primary" style={{ marginTop: 'var(--spacing-md)' }}>
              Add Products
            </Link>
          </div>
        ) : (
          <div className="grid-4">
            {newArrivals.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Styled layouts overrides for mobile grids */}
      <style>{`
        @media (max-width: 768px) {
          .asymmetric-grid {
            grid-template-columns: 1fr !important;
            min-height: auto !important;
            gap: var(--spacing-md) !important;
          }
          .category-card {
            min-height: 180px !important;
          }
        }
      `}</style>
    </div>
  );
}
