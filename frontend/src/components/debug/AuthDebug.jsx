import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useFavorites } from '../../context/FavoritesContext';

const AuthDebug = () => {
  const { isAuthenticated, user } = useAuth();
  const { favorites, loading } = useFavorites();

  const token = localStorage.getItem('token');

  return (
    <div style={{ 
      position: 'fixed', 
      top: 10, 
      right: 10, 
      background: 'rgba(0,0,0,0.8)', 
      color: 'white', 
      padding: '10px', 
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px'
    }}>
      <h4>Debug Info</h4>
      <p><strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
      <p><strong>User:</strong> {user?.email || 'None'}</p>
      <p><strong>Token:</strong> {token ? `${token.substring(0, 20)}...` : 'None'}</p>
      <p><strong>Favorites Loading:</strong> {loading ? 'Yes' : 'No'}</p>
      <p><strong>Favorites Count:</strong> {favorites.length}</p>
      <button 
        onClick={() => {
          console.log('🔍 Debug Info:');
          console.log('- isAuthenticated:', isAuthenticated);
          console.log('- user:', user);
          console.log('- token:', token);
          console.log('- favorites:', favorites);
          console.log('- loading:', loading);
        }}
        style={{ marginTop: '5px', padding: '2px 5px' }}
      >
        Log to Console
      </button>
    </div>
  );
};

export default AuthDebug;