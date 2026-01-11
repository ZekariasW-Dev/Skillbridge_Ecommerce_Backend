import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { favoritesAPI } from '../services/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const FavoritesContext = createContext();

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  const loadFavorites = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      const response = await favoritesAPI.getAll();
      
      if (response.data.success) {
        setFavorites(response.data.object || []);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
      // Don't show error toast for loading favorites
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Load favorites when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadFavorites();
    } else {
      setFavorites([]);
    }
  }, [isAuthenticated, loadFavorites]);

  const addToFavorites = async (productId) => {
    if (!isAuthenticated) {
      toast.error('Please login to add favorites');
      return false;
    }

    try {
      const response = await favoritesAPI.add(productId);
      if (response.data.success) {
        await loadFavorites(); // Reload to get updated list
        toast.success('Added to favorites');
        return true;
      }
    } catch (error) {
      console.error('Error adding to favorites:', error);
      if (error.response?.status === 400) {
        toast.error('Product already in favorites');
      } else {
        toast.error('Failed to add to favorites');
      }
    }
    return false;
  };

  const removeFromFavorites = async (productId) => {
    if (!isAuthenticated) return false;

    try {
      const response = await favoritesAPI.remove(productId);
      if (response.data.success) {
        setFavorites(prev => prev.filter(fav => fav._id !== productId));
        toast.success('Removed from favorites');
        return true;
      }
    } catch (error) {
      console.error('Error removing from favorites:', error);
      toast.error('Failed to remove from favorites');
    }
    return false;
  };

  const isFavorite = (productId) => {
    return favorites.some(fav => fav._id === productId);
  };

  const toggleFavorite = async (product) => {
    if (!isAuthenticated) {
      toast.error('Please login to manage favorites');
      return false;
    }

    const productId = product._id;
    if (isFavorite(productId)) {
      return await removeFromFavorites(productId);
    } else {
      return await addToFavorites(productId);
    }
  };

  const value = {
    favorites,
    loading,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    toggleFavorite,
    loadFavorites
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};