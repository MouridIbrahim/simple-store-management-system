import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Plus, Edit2, Trash2, Search, X } from 'lucide-react';

export default function ProductManagement() {
  const { addToast } = useToast();

  // Data state
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search keyword filter
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // if null, adding new product

  // Form Field State
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [stock, setStock] = useState('');
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await API.get('/products');
      setProducts(response.data);
    } catch (err) {
      console.error(err);
      setError('Could not retrieve product list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    setName('');
    setPrice('');
    setCategory('T-Shirts');
    setStock('');
    setImage('');
    setDescription('');
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setName(product.name);
    setPrice(product.price);
    setCategory(product.category);
    setStock(product.stock);
    setImage(product.image);
    setDescription(product.description);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleDelete = async (id, prodName) => {
    if (!window.confirm(`Are you sure you want to delete "${prodName}" from the catalogue?`)) {
      return;
    }
    try {
      await API.delete(`/products/${id}`);
      addToast(`"${prodName}" deleted successfully.`, 'success');
      fetchProducts();
    } catch (err) {
      console.error(err);
      addToast('Failed to delete product.', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !price || !category || !stock || !image || !description) {
      addToast('Please complete all form fields.', 'warning');
      return;
    }

    const payload = {
      name,
      price: Number(price),
      category,
      stock: Number(stock),
      image,
      description
    };

    setSubmitting(true);
    try {
      if (editingProduct) {
        // Edit API put request
        await API.put(`/products/${editingProduct._id}`, payload);
        addToast(`"${name}" updated successfully.`, 'success');
      } else {
        // Create API post request
        await API.post('/products', payload);
        addToast(`"${name}" created successfully.`, 'success');
      }
      closeModal();
      fetchProducts();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Failed to submit form details.';
      addToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter products by search term
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProducts.length / PAGE_SIZE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

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
          <h1 style={{ fontSize: '2rem' }}>Product Catalog</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Create, update, and manage your store inventory.</p>
        </div>

        <button onClick={openAddModal} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 20px' }}>
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Filters Search Bar */}
      <div style={{ display: 'flex', position: 'relative', maxWidth: '300px', width: '100%' }}>
        <input
          type="text"
          placeholder="Filter by name or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="form-control"
          style={{ paddingLeft: '36px', height: '38px', fontSize: '13px' }}
        />
        <Search size={16} style={{ position: 'absolute', left: '12px', top: '11px', color: 'var(--text-muted)' }} />
      </div>

      {/* Catalog Table */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--spacing-xxl) 0' }}>
          <div className="spinner"></div>
        </div>
      ) : error ? (
        <div className="toast toast-error" style={{ position: 'relative', top: 0, right: 0 }}>
          <span>{error}</span>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div style={{ padding: 'var(--spacing-xxl)', border: '1px dashed var(--border)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)' }}>No products found. Start by adding a new product!</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                <th style={{ padding: '12px var(--spacing-md)', fontWeight: 600 }}>Image</th>
                <th style={{ padding: '12px var(--spacing-md)', fontWeight: 600 }}>Name</th>
                <th style={{ padding: '12px var(--spacing-md)', fontWeight: 600 }}>Category</th>
                <th style={{ padding: '12px var(--spacing-md)', fontWeight: 600 }}>Price</th>
                <th style={{ padding: '12px var(--spacing-md)', fontWeight: 600 }}>Stock</th>
                <th style={{ padding: '12px var(--spacing-md)', fontWeight: 600, textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.map((p) => (
                <tr key={p._id} style={{ borderBottom: '1px solid var(--border)' }} className="table-row-hover">
                  <td style={{ padding: '12px var(--spacing-md)' }}>
                    <img src={p.image || 'https://via.placeholder.com/40x50'} alt={p.name} style={{ width: '40px', height: '50px', objectFit: 'cover', border: '1px solid var(--border)', backgroundColor: 'var(--bg-secondary)' }} />
                  </td>
                  <td style={{ padding: '12px var(--spacing-md)', fontWeight: 500, color: 'var(--text-primary)' }}>
                    {p.name}
                  </td>
                  <td style={{ padding: '12px var(--spacing-md)' }}>
                    {p.category}
                  </td>
                  <td style={{ padding: '12px var(--spacing-md)', fontWeight: 600 }}>
                    ${p.price.toFixed(2)}
                  </td>
                  <td style={{
                    padding: '12px var(--spacing-md)',
                    fontWeight: 600,
                    color: p.stock <= 0 ? 'var(--error)' : p.stock <= 5 ? 'var(--warning)' : 'inherit'
                  }}>
                    {p.stock} units
                  </td>
                  <td style={{ padding: '12px var(--spacing-md)', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button onClick={() => openEditModal(p)} className="icon-btn" title="Edit details">
                        <Edit2 size={15} />
                      </button>
                      <button onClick={() => handleDelete(p._id, p.name)} className="icon-btn" title="Delete product" style={{ color: 'var(--error)' }}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && !error && filteredProducts.length > PAGE_SIZE && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
          <span style={{ color: 'var(--text-muted)' }}>
            Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filteredProducts.length)} of {filteredProducts.length}
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="btn btn-secondary"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              style={{ padding: '6px 14px', fontSize: '11px' }}
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={page === currentPage ? 'btn btn-primary' : 'btn btn-secondary'}
                onClick={() => setCurrentPage(page)}
                style={{ padding: '6px 12px', fontSize: '11px', minWidth: '36px' }}
              >
                {page}
              </button>
            ))}
            <button
              className="btn btn-secondary"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              style={{ padding: '6px 14px', fontSize: '11px' }}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Add / Edit Form Modal Dialog */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '550px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>
                {editingProduct ? 'Modify Product' : 'Add New Product'}
              </h2>
              <button className="icon-btn" onClick={closeModal}><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="prod-name">Product Name *</label>
                <input
                  id="prod-name"
                  type="text"
                  className="form-control"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Essential Oversized Hoodie"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="prod-price">Price ($) *</label>
                  <input
                    id="prod-price"
                    type="number"
                    step="0.01"
                    min="0"
                    className="form-control"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="49.99"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="prod-stock">Stock Units *</label>
                  <input
                    id="prod-stock"
                    type="number"
                    min="0"
                    className="form-control"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    placeholder="100"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="prod-cat">Category *</label>
                  <select
                    id="prod-cat"
                    className="form-control"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="T-Shirts">T-Shirts</option>
                    <option value="Hoodies">Hoodies</option>
                    <option value="Pants">Pants</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="prod-img">Image URL *</label>
                  <input
                    id="prod-img"
                    type="url"
                    className="form-control"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 'var(--spacing-lg)' }}>
                <label className="form-label" htmlFor="prod-desc">Description *</label>
                <textarea
                  id="prod-desc"
                  className="form-control"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed specifications about sizing, materials, and construction details..."
                  style={{ resize: 'vertical' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: 'var(--spacing-md)', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={closeModal} style={{ padding: '8px 16px', fontSize: '11px' }}>
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '11px' }}>
                  {submitting ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <style>{`
        .table-row-hover:hover {
          background-color: var(--bg-secondary);
        }
      `}</style>
    </div>
  );
}
