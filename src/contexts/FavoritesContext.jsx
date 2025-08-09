import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { saveFavorite, removeFavorite, getFavorites } from '../services/api';
import { useToast } from './ToastContext';

const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const { user, accessToken } = useAuth();
  const { showToast } = useToast();
  const [favoritePropertyIds, setFavoritePropertyIds] = useState([]);
  const [loading, setLoading] = useState(false);

    useEffect(() => {
      const fetchFavorites = async () => {
        // Only attempt to fetch favorites if a user is logged in AND their role is 'TENANT'
        if (user && accessToken && user.role === 'TENANT') {
          setLoading(true);
          try {
            const response = await getFavorites(accessToken);
            const ids = response.results?.map(fav => fav.property.id) || [];
            setFavoritePropertyIds(ids);
          } catch (error) {
            console.error('Failed to fetch user favorites:', error);
            showToast('Failed to load your favorites.', 'error');
          } finally {
            setLoading(false);
          }
        } else {
          // Clear favorites for any other role or if the user logs out
          setFavoritePropertyIds([]);
        }
      };
  
      fetchFavorites();
    }, [user, accessToken, showToast]);

  const handleToggleFavorite = async (propertyId) => {
    if (!user || !accessToken) {
      showToast('Login to save favorites.', 'error');
      return;
    }

    if (user.role !== 'TENANT') {
      showToast('Only tenants can save favorites.', 'error');
      return;
    }

    const isCurrentlySaved = favoritePropertyIds.includes(propertyId);

    try {
      if (isCurrentlySaved) {
        await removeFavorite(propertyId, accessToken);
        setFavoritePropertyIds(prevIds => prevIds.filter(id => id !== propertyId));
        showToast('Removed from favorites.', 'info');
      } else {
        await saveFavorite(propertyId, accessToken);
        setFavoritePropertyIds(prevIds => [...prevIds, propertyId]);
        showToast('Property saved to favorites!', 'success');
      }
    } catch (error) {
      console.error('Favorite toggle error:', error);
      showToast(error.message || 'Failed to update favorite.', 'error');
    }
  };

  const isPropertySaved = (propertyId) => {
    return favoritePropertyIds.includes(propertyId);
  };

  return (
    <FavoritesContext.Provider value={{ favoritePropertyIds, isPropertySaved, handleToggleFavorite, loading }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => useContext(FavoritesContext);