import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  Box,
  Button,
  Paper,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import { 
  Favorite, 
  FavoriteBorder, 
  ShoppingCart, 
  Delete,
  Refresh 
} from '@mui/icons-material';
import { useFavorites } from '../context/FavoritesContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/products/ProductCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Favorites = () => {
  const { favorites, loading, loadFavorites, removeFromFavorites } = useFavorites();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [removing, setRemoving] = useState(new Set());

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadFavorites();
  }, [isAuthenticated, navigate, loadFavorites]);

  const handleRemoveFromFavorites = async (productId) => {
    setRemoving(prev => new Set(prev).add(productId));
    try {
      await removeFromFavorites(productId);
    } finally {
      setRemoving(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    toast.success(`${product.name} added to cart`);
  };

  const handleAddAllToCart = () => {
    let addedCount = 0;
    favorites.forEach(product => {
      if (product.stock > 0) {
        addToCart(product);
        addedCount++;
      }
    });
    
    if (addedCount > 0) {
      toast.success(`Added ${addedCount} items to cart`);
    } else {
      toast.error('No items available to add to cart');
    }
  };

  const handleClearAllFavorites = async () => {
    if (window.confirm('Are you sure you want to remove all favorites?')) {
      const promises = favorites.map(product => removeFromFavorites(product._id));
      await Promise.all(promises);
      toast.success('All favorites cleared');
    }
  };

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  if (loading) {
    return <LoadingSpinner message="Loading your favorites..." />;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            My Favorites
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {favorites.length === 0 
              ? 'You haven\'t added any favorites yet' 
              : `${favorites.length} favorite ${favorites.length === 1 ? 'product' : 'products'}`
            }
          </Typography>
        </Box>
        
        {favorites.length > 0 && (
          <Box display="flex" gap={2}>
            <Tooltip title="Refresh favorites">
              <IconButton onClick={loadFavorites} color="primary">
                <Refresh />
              </IconButton>
            </Tooltip>
            <Button
              variant="outlined"
              startIcon={<ShoppingCart />}
              onClick={handleAddAllToCart}
              disabled={favorites.every(p => p.stock <= 0)}
            >
              Add All to Cart
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<Delete />}
              onClick={handleClearAllFavorites}
            >
              Clear All
            </Button>
          </Box>
        )}
      </Box>

      {/* Empty State */}
      {favorites.length === 0 ? (
        <Paper sx={{ p: 8, textAlign: 'center' }}>
          <FavoriteBorder sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" gutterBottom color="text.secondary">
            No Favorites Yet
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={4}>
            Start browsing products and click the heart icon to add them to your favorites.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/products')}
          >
            Browse Products
          </Button>
        </Paper>
      ) : (
        <>
          {/* Summary Stats */}
          <Paper sx={{ p: 3, mb: 4 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={3}>
                <Box textAlign="center">
                  <Typography variant="h4" color="primary" fontWeight="bold">
                    {favorites.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Favorites
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Box textAlign="center">
                  <Typography variant="h4" color="success.main" fontWeight="bold">
                    {favorites.filter(p => p.stock > 0).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    In Stock
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Box textAlign="center">
                  <Typography variant="h4" color="error.main" fontWeight="bold">
                    {favorites.filter(p => p.stock <= 0).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Out of Stock
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Box textAlign="center">
                  <Typography variant="h4" color="secondary.main" fontWeight="bold">
                    ${favorites.reduce((sum, p) => sum + p.price, 0).toFixed(2)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Value
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Category Filter */}
          <Box mb={3}>
            <Typography variant="h6" gutterBottom>
              Categories in Favorites:
            </Typography>
            <Box display="flex" gap={1} flexWrap="wrap">
              {[...new Set(favorites.map(p => p.category))].map(category => (
                <Chip
                  key={category}
                  label={`${category} (${favorites.filter(p => p.category === category).length})`}
                  variant="outlined"
                  size="small"
                />
              ))}
            </Box>
          </Box>

          {/* Products Grid */}
          <Grid container spacing={3}>
            {favorites.map((product) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
                <Box position="relative">
                  <ProductCard 
                    product={product}
                    showActions={false}
                  />
                  
                  {/* Remove from favorites overlay */}
                  <Box
                    position="absolute"
                    top={8}
                    right={48}
                    zIndex={2}
                  >
                    <Tooltip title="Remove from favorites">
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveFromFavorites(product._id)}
                        disabled={removing.has(product._id)}
                        sx={{
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          '&:hover': { backgroundColor: 'rgba(255, 255, 255, 1)' },
                          color: 'error.main'
                        }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>

                  {/* Stock status overlay */}
                  {product.stock <= 0 && (
                    <Box
                      position="absolute"
                      top={0}
                      left={0}
                      right={0}
                      bottom={0}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      sx={{
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        borderRadius: 3,
                        zIndex: 1
                      }}
                    >
                      <Chip
                        label="Out of Stock"
                        color="error"
                        size="large"
                        sx={{ fontWeight: 'bold' }}
                      />
                    </Box>
                  )}
                </Box>
              </Grid>
            ))}
          </Grid>

          {/* Quick Actions */}
          <Box mt={4} textAlign="center">
            <Button
              variant="outlined"
              onClick={() => navigate('/products')}
              sx={{ mr: 2 }}
            >
              Continue Shopping
            </Button>
            <Button
              variant="contained"
              onClick={() => navigate('/cart')}
              startIcon={<ShoppingCart />}
            >
              View Cart
            </Button>
          </Box>
        </>
      )}
    </Container>
  );
};

export default Favorites;