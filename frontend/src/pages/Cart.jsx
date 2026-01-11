import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
} from '@mui/material';
import { ShoppingCartOutlined } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ordersAPI } from '../services/api';
import CartItem from '../components/cart/CartItem';
import CartSummary from '../components/cart/CartSummary';
import toast from 'react-hot-toast';

const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        description: `Order for ${cartItems.length} item${cartItems.length > 1 ? 's' : ''}`,
        products: cartItems.map(item => ({
          productId: item._id,
          quantity: item.quantity,
        })),
      };

      const response = await ordersAPI.create(orderData);
      
      if (response.data.success) {
        clearCart();
        toast.success('Order placed successfully!');
        navigate('/orders');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <Container maxWidth="md">
        <Box textAlign="center" py={8}>
          <ShoppingCartOutlined sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            Your cart is empty
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={4}>
            Looks like you haven't added any items to your cart yet.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/products')}
          >
            Continue Shopping
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        Shopping Cart ({cartItems.length} item{cartItems.length !== 1 ? 's' : ''})
      </Typography>

      <Grid container spacing={4}>
        {/* Cart Items */}
        <Grid item xs={12} md={8}>
          <Box>
            {cartItems.map((item) => (
              <CartItem key={item._id} item={item} />
            ))}
          </Box>
          
          <Box mt={3}>
            <Button
              variant="outlined"
              onClick={() => navigate('/products')}
            >
              Continue Shopping
            </Button>
          </Box>
        </Grid>

        {/* Order Summary */}
        <Grid item xs={12} md={4}>
          <CartSummary
            cartItems={cartItems}
            subtotal={getCartTotal()}
            onCheckout={handleCheckout}
            loading={loading}
          />
        </Grid>
      </Grid>
    </Container>
  );
};

export default Cart;