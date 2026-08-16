import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { DollarSign, ShoppingBag, Users, Layers, AlertCircle } from 'lucide-react';

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [productsCount, setProductsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch all orders system-wide (requires admin role)
        const ordersRes = await API.get('/orders');
        setOrders(ordersRes.data);

        // Fetch products count
        const productsRes = await API.get('/products');
        setProductsCount(productsRes.data.length);
      } catch (err) {
        console.error('Error fetching admin metrics:', err);
        setError('Failed to load system dashboard analytics. Make sure your account has admin privileges.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // Compute stats from orders list
  const activeOrders = orders.filter((o) => o.status !== 'cancelled');
  const totalRevenue = activeOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  
  const pendingOrders = orders.filter((o) => o.status === 'pending').length;
  const processingOrders = orders.filter((o) => o.status === 'processing').length;
  const shippedOrders = orders.filter((o) => o.status === 'shipped').length;
  const deliveredOrders = orders.filter((o) => o.status === 'delivered').length;
  const cancelledOrders = orders.filter((o) => o.status === 'cancelled').length;

  // Extract unique customers
  const uniqueUsers = new Set(orders.map((o) => o.user?._id || o.user)).size;

  // Extract category sales statistics
  const categorySales = {};
  orders.forEach((o) => {
    if (o.status === 'cancelled') return;
    (o.items || []).forEach((item) => {
      const cat = item.product?.category || 'Uncategorized';
      const amt = (item.price || 0) * item.quantity;
      categorySales[cat] = (categorySales[cat] || 0) + amt;
    });
  });

  // Sales over time (group by month)
  const salesByMonth = {};
  activeOrders.forEach((o) => {
    const monthKey = new Date(o.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short' });
    salesByMonth[monthKey] = (salesByMonth[monthKey] || 0) + (o.totalAmount || 0);
  });
  const salesTimeline = Object.entries(salesByMonth)
    .sort((a, b) => new Date(a[0]) - new Date(b[0]))
    .slice(-6);
  const maxMonthlySales = Math.max(...salesTimeline.map(([, amt]) => amt), 1);

  // Top-selling products from order items
  const productSales = {};
  activeOrders.forEach((o) => {
    (o.items || []).forEach((item) => {
      const prodId = item.product?._id || item.product;
      const prodName = item.product?.name || 'Unknown Product';
      if (!productSales[prodId]) {
        productSales[prodId] = { name: prodName, units: 0, revenue: 0 };
      }
      productSales[prodId].units += item.quantity;
      productSales[prodId].revenue += (item.price || item.product?.price || 0) * item.quantity;
    });
  });
  const topProducts = Object.values(productSales)
    .sort((a, b) => b.units - a.units)
    .slice(0, 5);
  const maxProductUnits = Math.max(...topProducts.map((p) => p.units), 1);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--spacing-xxl) 0' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="toast toast-error" style={{ position: 'relative', top: 0, right: 0, margin: '0 auto' }}>
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)', textAlign: 'left' }}>
      <div>
        <h1 style={{ fontSize: '2rem' }}>Console Overview</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>System metrics computed from real-time customer transactions.</p>
      </div>

      {/* Grid Cards 4-Col */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--spacing-md)' }} className="grid-responsive-cards">
        {/* Card 1: Revenue */}
        <div style={{ border: '1px solid var(--border)', padding: 'var(--spacing-lg)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--surface)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Revenue</span>
            <DollarSign size={18} />
          </div>
          <span style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>
            ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Excludes cancelled orders
          </div>
        </div>

        {/* Card 2: Orders */}
        <div style={{ border: '1px solid var(--border)', padding: 'var(--spacing-lg)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--surface)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Transactions</span>
            <ShoppingBag size={18} />
          </div>
          <span style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>{orders.length} Orders</span>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
            {pendingOrders} pending verification
          </div>
        </div>

        {/* Card 3: Customers */}
        <div style={{ border: '1px solid var(--border)', padding: 'var(--spacing-lg)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--surface)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Unique Buyers</span>
            <Users size={18} />
          </div>
          <span style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>{uniqueUsers} Users</span>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Registered accounts
          </div>
        </div>

        {/* Card 4: Products */}
        <div style={{ border: '1px solid var(--border)', padding: 'var(--spacing-lg)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--surface)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Catalog Size</span>
            <Layers size={18} />
          </div>
          <span style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>{productsCount} Items</span>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Product listings count
          </div>
        </div>
      </div>

      {/* Breakdown Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-xl)' }} className="grid-responsive-breakdowns">
        {/* Status Tracker List */}
        <div style={{ border: '1px solid var(--border)', padding: 'var(--spacing-xl)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--surface)' }}>
          <h3 style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--spacing-md)', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
            Orders Status Breakdown
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { name: 'Pending Verification', val: pendingOrders, color: 'var(--warning)', pct: orders.length ? (pendingOrders / orders.length) * 100 : 0 },
              { name: 'Processing Packing', val: processingOrders, color: 'var(--accent)', pct: orders.length ? (processingOrders / orders.length) * 100 : 0 },
              { name: 'Shipped Transit', val: shippedOrders, color: '#3b82f6', pct: orders.length ? (shippedOrders / orders.length) * 100 : 0 },
              { name: 'Delivered Paid', val: deliveredOrders, color: 'var(--success)', pct: orders.length ? (deliveredOrders / orders.length) * 100 : 0 },
              { name: 'Cancelled Void', val: cancelledOrders, color: 'var(--error)', pct: orders.length ? (cancelledOrders / orders.length) * 100 : 0 }
            ].map((item) => (
              <div key={item.name} style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 500 }}>
                  <span>{item.name}</span>
                  <span>{item.val} ({Math.round(item.pct)}%)</span>
                </div>
                <div style={{ height: '6px', width: '100%', backgroundColor: 'var(--border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${item.pct}%`, backgroundColor: item.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Sales Table */}
        <div style={{ border: '1px solid var(--border)', padding: 'var(--spacing-xl)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--surface)' }}>
          <h3 style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--spacing-md)', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
            Sales Revenue by Category
          </h3>
          
          {Object.keys(categorySales).length === 0 ? (
            <div style={{ padding: 'var(--spacing-md) 0', color: 'var(--text-muted)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={16} /> No sales revenue has been computed yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {Object.entries(categorySales)
                .sort((a, b) => b[1] - a[1])
                .map(([cat, amount]) => {
                  const maxAmt = Math.max(...Object.values(categorySales));
                  const pct = maxAmt ? (amount / maxAmt) * 100 : 0;
                  return (
                    <div key={cat} style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 500 }}>
                        <span style={{ color: 'var(--text-primary)' }}>{cat}</span>
                        <span>${amount.toFixed(2)}</span>
                      </div>
                      <div style={{ height: '6px', width: '100%', backgroundColor: 'var(--border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, backgroundColor: 'var(--text-primary)' }} />
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>

      {/* Sales Over Time & Top Products */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-xl)' }} className="grid-responsive-breakdowns">
        {/* Sales Over Time */}
        <div style={{ border: '1px solid var(--border)', padding: 'var(--spacing-xl)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--surface)' }}>
          <h3 style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--spacing-md)', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
            Sales Over Time
          </h3>

          {salesTimeline.length === 0 ? (
            <div style={{ padding: 'var(--spacing-md) 0', color: 'var(--text-muted)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={16} /> No sales data available yet.
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', height: '160px', paddingTop: 'var(--spacing-md)' }}>
              {salesTimeline.map(([month, amount]) => (
                <div key={month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-primary)' }}>${amount.toFixed(0)}</span>
                  <div style={{
                    width: '100%',
                    height: `${(amount / maxMonthlySales) * 120}px`,
                    minHeight: '4px',
                    backgroundColor: 'var(--accent)',
                    borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
                    transition: 'var(--transition)'
                  }} />
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', textAlign: 'center' }}>{month}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top-Selling Products */}
        <div style={{ border: '1px solid var(--border)', padding: 'var(--spacing-xl)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--surface)' }}>
          <h3 style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--spacing-md)', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
            Top-Selling Products
          </h3>

          {topProducts.length === 0 ? (
            <div style={{ padding: 'var(--spacing-md) 0', color: 'var(--text-muted)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={16} /> No product sales recorded yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {topProducts.map((prod, idx) => (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 500 }}>
                    <span style={{ color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>
                      {prod.name}
                    </span>
                    <span>{prod.units} sold · ${prod.revenue.toFixed(2)}</span>
                  </div>
                  <div style={{ height: '6px', width: '100%', backgroundColor: 'var(--border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(prod.units / maxProductUnits) * 100}%`, backgroundColor: 'var(--accent)' }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .grid-responsive-cards {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 768px) {
          .grid-responsive-cards {
            grid-template-columns: 1fr !important;
          }
          .grid-responsive-breakdowns {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
