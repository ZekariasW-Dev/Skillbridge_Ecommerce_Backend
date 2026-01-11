import React from 'react';
import {
  Paper,
  Typography,
  Box,
  Divider,
  Button,
  Chip,
  Alert,
} from '@mui/material';
import { ShoppingCartCheckout, LocalShipping, Security } from '@mui/icons-material';

const CartSummary = ({ 
  cartItems = [], 
  subtotal = 0, 
  onCheckout, 
  loading = false 
}) => {
  const shipping = subtotal > 50 ? 0 : 9.99;
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <Paper sx={{ p: 3, position: 'sticky', top: 100, height: 'fit-content' }}>
      <Typography variant="h6" gutterBottom>
        Order Summary
      </Typography>
      
      {/* Items Count */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="body2" color="text.secondary">
          Items in cart
        </Typography>
        <Chip 
          label={`${itemCount} item${itemCount !== 1 ? 's' : ''}`} 
          size="small" 
          color="primary" 
        />
      </Box>
      
      {/* Price Breakdown */}
      <Box display="flex" justifyContent="space-between" mb={1}>
        <Typography>Subtotal</Typography>
        <Typography>{formatPrice(subtotal)}</Typography>
      </Box>
      
      <Box display="flex" justifyContent="space-between" mb={1}>
        <Typography>Shipping</Typography>
        <Typography>
          {shipping === 0 ? (
            <Chip label="FREE" size="small" color="success" />
          ) : (
            formatPrice(shipping)
          )}
        </Typography>
      </Box>
      
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Typography>Tax (8%)</Typography>
        <Typography>{formatPrice(tax)}</Typography>
      </Box>
      
      <Divider sx={{ my: 2 }} />
      
      <Box display="flex" justifyContent="space-between" mb={3}>
        <Typography variant="h6" fontWeight="bold">Total</Typography>
        <Typography variant="h6" color="primary" fontWeight="bold">
          {formatPrice(total)}
        </Typography>
      </Box>

      {/* Free Shipping Alert */}
      {shipping > 0 && subtotal > 0 && (
        <Alert 
          severity="info" 
          sx={{ mb: 2 }}
          icon={<LocalShipping />}
        >
          Add {formatPrice(50 - subtotal)} more to get FREE shipping!
        </Alert>
      )}

      {/* Checkout Button */}
      <Button
        variant="contained"
        fullWidth
        size="large"
        startIcon={<ShoppingCartCheckout />}
        onClick={onCheckout}
        disabled={loading || cartItems.length === 0}
        sx={{ mb: 2 }}
      >
        {loading ? 'Processing...' : 'Proceed to Checkout'}
      </Button>
      
      {/* Security Badge */}
      <Box display="flex" alignItems="center" justifyContent="center" gap={1} mt={2}>
        <Security fontSize="small" color="success" />
        <Typography variant="body2" color="text.secondary" textAlign="center">
          Secure checkout powered by SkillBridge
        </Typography>
      </Box>

      {/* Payment Methods */}
      <Box mt={2} textAlign="center">
        <Typography variant="body2" color="text.secondary" gutterBottom>
          We accept
        </Typography>
        <Box display="flex" justifyContent="center" gap={1} flexWrap="wrap">
          <Chip label="Visa" size="small" variant="outlined" />
          <Chip label="Mastercard" size="small" variant="outlined" />
          <Chip label="PayPal" size="small" variant="outlined" />
          <Chip label="Apple Pay" size="small" variant="outlined" />
        </Box>
      </Box>
    </Paper>
  );
};

export default CartSummary;