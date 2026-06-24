import React, { createContext, useState, useContext, useEffect } from 'react';
import { wishlistAPI } from '../services/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const WishlistContext = createContext();
export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [wishlist, setWishlist] = useState([]); // array of product objects

  useEffect(() => {
    if (isAuthenticated) fetchWishlist();
    else setWishlist([]);
  }, [isAuthenticated]);

  const fetchWishlist = async () => {
    try {
      const res = await wishlistAPI.get();
      setWishlist(res.data.data || []);
    } catch {}
  };

  const toggleWishlist = async (product) => {
    try {
      const res = await wishlistAPI.toggle(product._id);
      if (res.data.added) {
        setWishlist(prev => [...prev, product]);
        toast.success('Added to wishlist');
      } else {
        setWishlist(prev => prev.filter(p => p._id !== product._id));
        toast.success('Removed from wishlist');
      }
    } catch {
      toast.error('Failed to update wishlist');
    }
  };

  const isWishlisted = (productId) => wishlist.some(p => p._id === productId);

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isWishlisted, fetchWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};
