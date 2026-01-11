import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Typography,
  Button,
  Box,
  Chip,
  Rating,
  Divider,
  IconButton,
  Card,
  CardContent,
  Skeleton,
  Alert,
  Breadcrumbs,
  Link,
  Tab,
  Tabs,
  Paper,
} from '@mui/material';
import {
  ShoppingCart,
  Favorite,
  FavoriteBorder,
  Share,
  ArrowBack,
  LocalShipping,
  Security,
  Assignment,
} from '@mui/icons-material';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';
import { productsAPI, imageService } from '../services/api';
import toast from 'react-hot-toast';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getById(id);
      setProduct(response.data.object);
    } catch (error) {
      console.error('Error fetching product:', error);
      setError('Failed to load product details');
      toast.error('Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return;
    }
    
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    
    toast.success(`Added ${quantity} ${product.name}${quantity > 1 ? 's' : ''} to cart`);
  };

  const handleToggleFavorite = async () => {
    await toggleFavorite(product);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('Product link copied to clipboard!');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Skeleton variant="rectangular" height={400} />
          </Grid>
          <Grid item xs={12} md={6}>
            <Skeleton variant="text" height={60} />
            <Skeleton variant="text" height={40} />
            <Skeleton variant="text" height={80} />
            <Skeleton variant="rectangular" height={60} />
          </Grid>
        </Grid>
      </Container>
    );
  }

  if (error || !product) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'Product not found'}
        </Alert>
        <Button 
          startIcon={<ArrowBack />} 
          onClick={() => navigate('/products')}
        >
          Back to Products
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link 
          color="inherit" 
          href="/" 
          onClick={(e) => { e.preventDefault(); navigate('/'); }}
          sx={{ cursor: 'pointer' }}
        >
          Home
        </Link>
        <Link 
          color="inherit" 
          href="/products" 
          onClick={(e) => { e.preventDefault(); navigate('/products'); }}
          sx={{ cursor: 'pointer' }}
        >
          Products
        </Link>
        <Typography color="text.primary">{product.name}</Typography>
      </Breadcrumbs>

      <Grid container spacing={4}>
        {/* Product Image */}
        <Grid item xs={12} md={6}>
          <Card>
            <Box
              component="img"
              src={imageService.getProductImage(product, 'large', 600, 600)}
              alt={product.name}
              sx={{
                width: '100%',
                height: 'auto',
                maxHeight: 600,
                objectFit: 'cover',
              }}
            />
          </Card>
        </Grid>

        {/* Product Info */}
        <Grid item xs={12} md={6}>
          <Box>
            {/* Header Actions */}
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
              <Button
                startIcon={<ArrowBack />}
                onClick={() => navigate(-1)}
                variant="outlined"
                size="small"
              >
                Back
              </Button>
              <Box>
                <IconButton onClick={handleToggleFavorite} color="error">
                  {isFavorite(product._id) ? <Favorite /> : <FavoriteBorder />}
                </IconButton>
                <IconButton onClick={handleShare}>
                  <Share />
                </IconButton>
              </Box>
            </Box>

            {/* Product Title */}
            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
              {product.name}
            </Typography>

            {/* Brand */}
            {product.brand && (
              <Typography variant="h6" color="text.secondary" gutterBottom>
                by {product.brand}
              </Typography>
            )}

            {/* Rating */}
            <Box display="flex" alignItems="center" mb={2}>
              <Rating 
                value={product.rating?.average || 4.0} 
                precision={0.1} 
                readOnly 
              />
              <Typography variant="body2" color="text.secondary" ml={1}>
                ({product.rating?.count || 0} reviews)
              </Typography>
            </Box>

            {/* Price */}
            <Typography variant="h3" color="primary" fontWeight="bold" gutterBottom>
              {formatPrice(product.price)}
            </Typography>

            {/* Category and Stock */}
            <Box display="flex" gap={1} mb={3}>
              <Chip label={product.category} color="secondary" />
              <Chip 
                label={product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                color={product.stock > 0 ? 'success' : 'error'}
              />
            </Box>

            {/* Description */}
            <Typography variant="body1" paragraph>
              {product.description}
            </Typography>

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <Box mb={3}>
                <Typography variant="subtitle2" gutterBottom>
                  Tags:
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={0.5}>
                  {product.tags.map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Box>
            )}

            <Divider sx={{ my: 3 }} />

            {/* Quantity Selector */}
            <Box display="flex" alignItems="center" gap={2} mb={3}>
              <Typography variant="subtitle1">Quantity:</Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  -
                </Button>
                <Typography variant="h6" sx={{ minWidth: 40, textAlign: 'center' }}>
                  {quantity}
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock}
                >
                  +
                </Button>
              </Box>
            </Box>

            {/* Add to Cart Button */}
            <Button
              variant="contained"
              size="large"
              startIcon={<ShoppingCart />}
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              fullWidth
              sx={{ py: 1.5, fontSize: '1.1rem', fontWeight: 'bold' }}
            >
              {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
            </Button>

            {/* Product Features */}
            <Box mt={3}>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Box textAlign="center">
                    <LocalShipping color="primary" />
                    <Typography variant="caption" display="block">
                      Free Shipping
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box textAlign="center">
                    <Security color="primary" />
                    <Typography variant="caption" display="block">
                      Secure Payment
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box textAlign="center">
                    <Assignment color="primary" />
                    <Typography variant="caption" display="block">
                      Easy Returns
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* Product Details Tabs */}
      <Box mt={6}>
        <Paper>
          <Tabs value={selectedTab} onChange={handleTabChange}>
            <Tab label="Details" />
            <Tab label="Specifications" />
            <Tab label="Reviews" />
          </Tabs>
          
          <Box p={3}>
            {selectedTab === 0 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Product Details
                </Typography>
                <Typography variant="body1" paragraph>
                  {product.description}
                </Typography>
                {product.sku && (
                  <Typography variant="body2" color="text.secondary">
                    SKU: {product.sku}
                  </Typography>
                )}
              </Box>
            )}
            
            {selectedTab === 1 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Specifications
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      <strong>Brand:</strong> {product.brand || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      <strong>Category:</strong> {product.category}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      <strong>Stock:</strong> {product.stock}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      <strong>SKU:</strong> {product.sku || 'N/A'}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            )}
            
            {selectedTab === 2 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Customer Reviews
                </Typography>
                <Box display="flex" alignItems="center" mb={2}>
                  <Rating value={product.rating?.average || 4.0} readOnly />
                  <Typography variant="body2" ml={1}>
                    {product.rating?.average || 4.0} out of 5 ({product.rating?.count || 0} reviews)
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Reviews feature coming soon...
                </Typography>
              </Box>
            )}
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default ProductDetails;