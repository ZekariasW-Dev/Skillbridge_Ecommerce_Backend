import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Chip,
  IconButton,
  Rating,
  Tooltip,
} from '@mui/material';
import { 
  ShoppingCart, 
  Favorite, 
  FavoriteBorder, 
  Edit,
  Delete,
  Visibility 
} from '@mui/icons-material';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useFavorites } from '../../context/FavoritesContext';
import { imageService } from '../../services/api';
import toast from 'react-hot-toast';

const ProductCard = ({ product, onEdit, onDelete, showActions = false }) => {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const navigate = useNavigate();

  const handleAddToCart = (e) => {
    e.stopPropagation(); // Prevent card click
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return;
    }
    addToCart(product);
  };

  const handleToggleFavorite = async (e) => {
    e.stopPropagation(); // Prevent card click events
    await toggleFavorite(product);
  };

  const handleCardClick = () => {
    navigate(`/products/${product._id}`);
  };

  const handleViewDetails = (e) => {
    e.stopPropagation();
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
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        }
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="220"
          image={imageService.getProductImage(product, 'medium', 400, 220)}
          alt={product.name}
          sx={{ objectFit: 'cover' }}
        />
        
        {/* Brand badge */}
        {product.brand && (
          <Chip
            label={product.brand}
            size="small"
            sx={{
              position: 'absolute',
              top: 8,
              left: 8,
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              fontWeight: 'bold'
            }}
          />
        )}
        
        {/* Favorite button */}
        <IconButton
          size="small"
          onClick={handleToggleFavorite}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            '&:hover': { backgroundColor: 'rgba(255, 255, 255, 1)' },
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
      
      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        <Typography 
          gutterBottom 
          variant="h6" 
          component="div" 
          sx={{ 
            fontWeight: 'bold',
            minHeight: 48,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {product.name}
        </Typography>
        
        {/* Rating */}
        {product.rating && (
          <Box display="flex" alignItems="center" mb={1}>
            <Rating 
              value={product.rating.average || 4.0} 
              precision={0.1} 
              size="small" 
              readOnly 
            />
            <Typography variant="body2" color="text.secondary" ml={1}>
              ({product.rating.count || 0})
            </Typography>
          </Box>
        )}
        
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ 
            mb: 2, 
            minHeight: 40,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {product.description}
        </Typography>
        
        {/* Price and Category */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="h6" color="primary" fontWeight="bold">
            {formatPrice(product.price)}
          </Typography>
          <Chip 
            label={product.category} 
            size="small" 
            color="secondary" 
            variant="outlined"
          />
        </Box>
        
        {/* Stock and SKU */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="body2" color="text.secondary">
            Stock: {product.stock || 0}
          </Typography>
          <Chip 
            label={product.stock > 0 ? 'In Stock' : 'Out of Stock'}
            size="small"
            color={product.stock > 0 ? 'success' : 'error'}
          />
        </Box>
        
        {/* Tags */}
        {product.tags && product.tags.length > 0 && (
          <Box mt={1}>
            {product.tags.slice(0, 3).map((tag, index) => (
              <Chip
                key={index}
                label={tag}
                size="small"
                variant="outlined"
                sx={{ mr: 0.5, mb: 0.5, fontSize: '0.7rem' }}
              />
            ))}
          </Box>
        )}
      </CardContent>
      
      <CardActions sx={{ p: 2, pt: 0 }}>
        {showActions ? (
          <Box display="flex" gap={1} width="100%">
            <Tooltip title="Edit Product">
              <IconButton 
                size="small" 
                color="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(product);
                }}
              >
                <Edit />
              </IconButton>
            </Tooltip>
            <Tooltip title="View Details">
              <IconButton 
                size="small" 
                color="info"
                onClick={handleViewDetails}
              >
                <Visibility />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete Product">
              <IconButton 
                size="small" 
                color="error"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(product._id);
                }}
              >
                <Delete />
              </IconButton>
            </Tooltip>
            <Box flexGrow={1} />
            <Typography variant="body2" color="text.secondary">
              SKU: {product.sku?.slice(-8) || 'N/A'}
            </Typography>
          </Box>
        ) : (
          <Button
            variant="contained"
            startIcon={<ShoppingCart />}
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            fullWidth
            sx={{
              py: 1,
              fontWeight: 'bold',
              '&:hover': {
                transform: 'scale(1.02)'
              }
            }}
          >
            {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
          </Button>
        )}
      </CardActions>
    </Card>
  );
};

export default ProductCard;