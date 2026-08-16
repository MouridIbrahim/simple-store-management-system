import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Helper to fetch cart from the backend
  const fetchCart = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const response = await API.get('/cart');
      setCart(response.data);
    } catch (err) {
      console.error('Error fetching cart:', err);
      setError(err.response?.data?.message || 'Could not fetch cart.');
    } finally {
      setLoading(false);
    }
  };

  // Sync cart when user authentication status changes
  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setCart(null);
    }
  }, [user]);

  // Add item to cart
  const addToCart = async (productId, quantity = 1) => {
    if (!user) return { success: false, error: 'Please log in to add items to cart.' };
    setLoading(true);
    try {
      const response = await API.post('/cart', { productId, quantity });
      // The response.data contains { message, cart }
      // The returned cart items might not have the fully populated product object.
      // So it's best to fetch the full cart again to ensure layout renders correctly with details.
      await fetchCart();
      return { success: true, message: response.data.message };
    } catch (err) {
      console.error('Error adding to cart:', err);
      const msg = err.response?.data?.message || 'Failed to add item to cart.';
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  // Update quantity of an item in cart
  const updateQuantity = async (productId, quantity) => {
    if (!user) return { success: false };
    if (quantity <= 0) {
      return removeFromCart(productId);
    }
    setLoading(true);
    try {
      await API.put(`/cart/${productId}`, { quantity });
      await fetchCart();
      return { success: true };
    } catch (err) {
      console.error('Error updating cart quantity:', err);
      const msg = err.response?.data?.message || 'Failed to update quantity.';
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  // Remove item from cart
  const removeFromCart = async (productId) => {
    if (!user) return { success: false };
    setLoading(true);
    try {
      await API.delete(`/cart/${productId}`);
      await fetchCart();
      return { success: true };
    } catch (err) {
      console.error('Error removing from cart:', err);
      const msg = err.response?.data?.message || 'Failed to remove item.';
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    if (!user) return { success: false };
    setLoading(true);
    try {
      await API.delete('/cart');
      setCart({ items: [] });
      return { success: true };
    } catch (err) {
      console.error('Error clearing cart:', err);
      const msg = err.response?.data?.message || 'Failed to clear cart.';
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  // Get total items in cart count
  const cartItemsCount = cart?.items?.reduce((total, item) => total + item.quantity, 0) || 0;

  // Get cart subtotal price
  const cartSubtotal = cart?.items?.reduce((total, item) => {
    const price = item.product?.price || 0;
    return total + price * item.quantity;
  }, 0) || 0;

  const value = {
    cart,
    loading,
    error,
    cartItemsCount,
    cartSubtotal,
    fetchCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
