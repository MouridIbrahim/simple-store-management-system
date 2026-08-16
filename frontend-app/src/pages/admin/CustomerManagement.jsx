import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { Users, ShoppingBag, DollarSign } from 'lucide-react';

export default function CustomerManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await API.get('/orders');
        setOrders(response.data);
      } catch (err) {
        console.error('Error fetching orders for customer list:', err);
        setError('Failed to load customer data.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Aggregate unique customers from orders
  const customerMap = {};
  orders.forEach((order) => {
    const user = order.user;
    if (!user) return;

    const userId = user._id || user;
    if (!customerMap[userId]) {
      customerMap[userId] = {
        _id: userId,
        name: user.name || 'Unknown',
        email: user.email || '—',
        role: user.role || 'user',
        orderCount: 0,
        totalSpent: 0,
        lastOrderDate: null,
      };
    }

    if (order.status !== 'cancelled') {
      customerMap[userId].orderCount += 1;
      customerMap[userId].totalSpent += order.totalAmount || 0;
    }

    const orderDate = new Date(order.createdAt);
    if (!customerMap[userId].lastOrderDate || orderDate > customerMap[userId].lastOrderDate) {
      customerMap[userId].lastOrderDate = orderDate;
    }
  });

  const customers = Object.values(customerMap).sort((a, b) => b.totalSpent - a.totalSpent);

  const filteredCustomers = customers.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--spacing-xxl) 0' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="toast toast-error" style={{ position: 'relative', top: 0, right: 0 }}>
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)', textAlign: 'left' }}>
      <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: 'var(--spacing-md)' }}>
        <h1 style={{ fontSize: '2rem' }}>Customer Directory</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
          Aggregated from order history — {customers.length} unique customer{customers.length !== 1 ? 's' : ''} found.
        </p>
      </div>

      <div style={{ display: 'flex', position: 'relative', maxWidth: '300px', width: '100%' }}>
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="form-control"
          style={{ paddingLeft: '36px', height: '38px', fontSize: '13px' }}
        />
        <Users size={16} style={{ position: 'absolute', left: '12px', top: '11px', color: 'var(--text-muted)' }} />
      </div>

      {filteredCustomers.length === 0 ? (
        <div style={{ padding: 'var(--spacing-xxl)', border: '1px dashed var(--border)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)' }}>No customers found matching your search.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                <th style={{ padding: '12px var(--spacing-md)', fontWeight: 600 }}>Customer</th>
                <th style={{ padding: '12px var(--spacing-md)', fontWeight: 600 }}>Email</th>
                <th style={{ padding: '12px var(--spacing-md)', fontWeight: 600 }}>Role</th>
                <th style={{ padding: '12px var(--spacing-md)', fontWeight: 600 }}>Orders</th>
                <th style={{ padding: '12px var(--spacing-md)', fontWeight: 600 }}>Total Spent</th>
                <th style={{ padding: '12px var(--spacing-md)', fontWeight: 600 }}>Last Order</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((c) => (
                <tr key={c._id} style={{ borderBottom: '1px solid var(--border)' }} className="table-row-hover">
                  <td style={{ padding: '12px var(--spacing-md)', fontWeight: 500, color: 'var(--text-primary)' }}>
                    {c.name}
                  </td>
                  <td style={{ padding: '12px var(--spacing-md)' }}>{c.email}</td>
                  <td style={{ padding: '12px var(--spacing-md)', textTransform: 'capitalize' }}>{c.role}</td>
                  <td style={{ padding: '12px var(--spacing-md)' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <ShoppingBag size={13} /> {c.orderCount}
                    </span>
                  </td>
                  <td style={{ padding: '12px var(--spacing-md)', fontWeight: 600 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <DollarSign size={13} /> {c.totalSpent.toFixed(2)}
                    </span>
                  </td>
                  <td style={{ padding: '12px var(--spacing-md)', color: 'var(--text-muted)' }}>
                    {c.lastOrderDate
                      ? c.lastOrderDate.toLocaleDateString(undefined, { dateStyle: 'medium' })
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
