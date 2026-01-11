import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  Chip,
  IconButton,
  Rating,
} from '@mui/material';
import { ShoppingCart, Edit, Delete, Favorite, FavoriteBorder } from '@mui/icons-material';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useFavorites } from '../../context/FavoritesContext';
import { imageService } from '../../services/api';
import toast from 'react-hot-toast';

const ProductListItem = ({ product, showActions = false, onEdit, onDelete }) => {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const navigate = useNavigate();

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return;
    }
    addToCart(product);
  };

  const handleToggleFavorite = async (e) => {
    e.stopPropagation();
    await toggleFavorite(product);
  };

  const handleCardClick = () => {
    navigate(`/products/${product._id}`);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <Card 
      onClick={handleCardClick}
      sx={{ 
        display: 'flex', 
        p: 2, 
        height: 200,
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 3,
        }
      }}
    >
      <CardMedia
        component="img"
        sx={{ width: 160, height: '100%', objectFit: 'cover', borderRadius: 1 }}
        image={imageService.getProductImage(product._id, 160, 160)}
        alt={product.name}
      />
      
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
          <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
            {product.name}
          </Typography>
          <IconButton 
            size="small" 
            onClick={handleToggleFavorite}
            sx={{ 
              color: isFavorite(product._id) ? 'error.main' : 'text.secondary' 
            }}
          >
            {isFavorite(product._id) ? (
              <Favorite fontSize="small" />
            ) : (
              <FavoriteBorder fontSize="small" />
            )}
          </IconButton>
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flex: 1 }}>
          {product.description?.length > 150 
            ? `${product.description.substring(0, 150)}...` 
            : product.description}
        </Typography>
        
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <Rating value={4.5} precision={0.5} size="small" readOnly />
          <Typography variant="body2" color="text.secondary">
            (4.5) • 24 reviews
          </Typography>
        </Box>
        
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={2}>
            <Typography variant="h6" color="primary" fontWeight="bold">
              {formatPrice(product.price)}
            </Typography>
            <Chip 
              label={product.category} 
              size="small" 
              color="secondary" 
              variant="outlined"
            />
            <Chip 
              label={product.stock > 0 ? 'In Stock' : 'Out of Stock'}
              size="small"
              color={product.stock > 0 ? 'success' : 'error'}
            />
          </Box>
          
          <Box display="flex" gap={1}>
            {showActions ? (
              <>
                <Button 
                  size="small" 
                  variant="outlined" 
                  startIcon={<Edit />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(product);
                  }}
                >
                  Edit
                </Button>
                <Button 
                  size="small" 
                  variant="outlined" 
                  color="error"
                  startIcon={<Delete />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(product._id);
                  }}
                >
                  Delete
                </Button>
              </>
            ) : (
              <Button
                variant="contained"
                startIcon={<ShoppingCart />}
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
              >
                {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
              </Button>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProductListItem;