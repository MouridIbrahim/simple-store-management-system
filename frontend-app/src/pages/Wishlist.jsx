import React from 'react';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/ProductCard';
import { Link } from 'react-router-dom';
import { Heart, ArrowLeft } from 'lucide-react';

export default function Wishlist() {
  const { wishlist } = useWishlist();

  return (
    <div className="container" style={{ paddingTop: 'var(--spacing-xl)', paddingBottom: 'var(--spacing-xxl)' }}>
      {/* Title */}
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
          <h1 style={{ fontSize: '2rem' }}>My Wishlist</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Saved items for subsequent purchase planning.</p>
        </div>
        <Link to="/shop" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', textDecoration: 'underline' }}>
          <ArrowLeft size={14} /> Back to Catalog
        </Link>
      </div>

      {/* Grid listing */}
      {wishlist.length === 0 ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '50vh',
          gap: 'var(--spacing-md)'
        }}>
          <div style={{
            backgroundColor: 'var(--bg-secondary)',
            padding: '24px',
            borderRadius: 'var(--radius-round)',
            color: 'var(--text-muted)'
          }}>
            <Heart size={48} />
          </div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', fontWeight: 400 }}>Your wishlist is empty.</h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '340px', fontSize: '13px', textAlign: 'center' }}>
            Bookmarked items will show up here. Browse the shop and save your favorite garments!
          </p>
          <Link to="/shop" className="btn btn-primary" style={{ marginTop: 'var(--spacing-sm)' }}>
            Start Browsing
          </Link>
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', marginBottom: 'var(--spacing-md)', fontSize: '12px', color: 'var(--text-muted)' }}>
            Showing {wishlist.length} saved products
          </div>
          <div className="grid-4">
            {wishlist.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
