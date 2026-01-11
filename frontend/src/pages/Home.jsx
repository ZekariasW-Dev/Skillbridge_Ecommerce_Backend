import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  Paper,
} from '@mui/material';
import { ShoppingCart, TrendingUp, Star, LocalShipping } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { productsAPI, imageService } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Home = () => {
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const response = await productsAPI.getAll({ pageSize: 6 });
      if (response.data.success) {
        setFeaturedProducts(response.data.products || []);
      }
    } catch (error) {
      console.error('Error fetching featured products:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { name: 'Electronics', icon: '📱', color: '#1976d2' },
    { name: 'Clothing', icon: '👕', color: '#9c27b0' },
    { name: 'Books', icon: '📚', color: '#2e7d32' },
    { name: 'Home', icon: '🏠', color: '#ed6c02' },
    { name: 'Sports', icon: '⚽', color: '#d32f2f' },
    { name: 'Beauty', icon: '💄', color: '#7b1fa2' },
  ];

  const features = [
    {
      icon: <LocalShipping sx={{ fontSize: 40, color: '#1976d2' }} />,
      title: 'Free Shipping',
      description: 'Free shipping on orders over $50',
    },
    {
      icon: <Star sx={{ fontSize: 40, color: '#ff9800' }} />,
      title: 'Quality Products',
      description: 'Carefully curated high-quality items',
    },
    {
      icon: <TrendingUp sx={{ fontSize: 40, color: '#4caf50' }} />,
      title: 'Best Prices',
      description: 'Competitive prices guaranteed',
    },
  ];

  if (loading) {
    return <LoadingSpinner message="Loading featured products..." />;
  }

  return (
    <Container maxWidth="lg">
      {/* Hero Section */}
      <Paper
        sx={{
          position: 'relative',
          backgroundColor: 'grey.800',
          color: '#fff',
          mb: 4,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundImage: `url(${imageService.getHeroImage(0)})`,
          minHeight: 400,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            right: 0,
            left: 0,
            backgroundColor: 'rgba(0,0,0,.5)',
          }}
        />
        <Container maxWidth="md">
          <Box position="relative" py={6}>
            <Typography component="h1" variant="h2" color="inherit" gutterBottom>
              Welcome to SkillBridge Store
            </Typography>
            <Typography variant="h5" color="inherit" paragraph>
              Discover amazing products at unbeatable prices. Shop the latest trends
              and find everything you need in one place.
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<ShoppingCart />}
              onClick={() => navigate('/products')}
              sx={{ mt: 2 }}
            >
              Shop Now
            </Button>
          </Box>
        </Container>
      </Paper>

      {/* Features Section */}
      <Box mb={6}>
        <Typography variant="h4" component="h2" gutterBottom textAlign="center" mb={4}>
          Why Choose Us
        </Typography>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card sx={{ textAlign: 'center', p: 3, height: '100%' }}>
                <CardContent>
                  {feature.icon}
                  <Typography variant="h6" component="h3" gutterBottom mt={2}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Categories Section */}
      <Box mb={6}>
        <Typography variant="h4" component="h2" gutterBottom textAlign="center" mb={4}>
          Shop by Category
        </Typography>
        <Grid container spacing={2}>
          {categories.map((category, index) => (
            <Grid item xs={6} sm={4} md={2} key={index}>
              <Card
                sx={{
                  textAlign: 'center',
                  p: 2,
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'scale(1.05)',
                  },
                }}
                onClick={() => navigate(`/products?category=${category.name.toLowerCase()}`)}
              >
                <CardContent>
                  <Typography variant="h3" component="div" mb={1}>
                    {category.icon}
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {category.name}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Featured Products Section */}
      <Box mb={6}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography variant="h4" component="h2">
            Featured Products
          </Typography>
          <Button
            variant="outlined"
            onClick={() => navigate('/products')}
          >
            View All Products
          </Button>
        </Box>
        
        <Grid container spacing={3}>
          {featuredProducts.slice(0, 6).map((product) => (
            <Grid item xs={12} sm={6} md={4} key={product._id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                  },
                }}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={imageService.getProductImage(product._id, 400, 200)}
                  alt={product.name}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h6" component="div">
                    {product.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    {product.description?.substring(0, 100)}...
                  </Typography>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" color="primary" fontWeight="bold">
                      ${product.price}
                    </Typography>
                    <Chip label={product.category} size="small" />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default Home;