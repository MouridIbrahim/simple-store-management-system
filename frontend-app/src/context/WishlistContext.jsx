import React, { createContext, useContext, useState, useEffect } from 'react';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState([]);

  // Load wishlist from localStorage on mount
  useEffect(() => {
    const savedWishlist = localStorage.getItem('wishlist');
    if (savedWishlist) {
      try {
        setWishlist(JSON.parse(savedWishlist));
      } catch (err) {
        console.error('Error parsing wishlist data:', err);
      }
    }
  }, []);

  // Save wishlist to localStorage whenever it changes
  const saveWishlist = (newList) => {
    setWishlist(newList);
    localStorage.setItem('wishlist', JSON.stringify(newList));
  };

  // Toggle product in wishlist
  const toggleWishlist = (product) => {
    const exists = wishlist.some((item) => item._id === product._id);
    if (exists) {
      const filtered = wishlist.filter((item) => item._id !== product._id);
      saveWishlist(filtered);
    } else {
      const updated = [...wishlist, product];
      saveWishlist(updated);
    }
  };

  // Check if a product is wishlisted
  const isInWishlist = (productId) => {
    return wishlist.some((item) => item._id === productId);
  };

  // Remove a product from wishlist
  const removeFromWishlist = (productId) => {
    const filtered = wishlist.filter((item) => item._id !== productId);
    saveWishlist(filtered);
  };

  const value = {
    wishlist,
    toggleWishlist,
    isInWishlist,
    removeFromWishlist,
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
