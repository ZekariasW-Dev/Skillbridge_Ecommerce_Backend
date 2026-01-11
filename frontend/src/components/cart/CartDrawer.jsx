import React from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Button,
  Divider,
  Badge,
  Chip,
} from '@mui/material';
import { 
  Close, 
  ShoppingCart, 
  Add, 
  Remove, 
  Delete,
  ShoppingCartCheckout 
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { imageService } from '../../services/api';

const CartDrawer = ({ open, onClose }) => {
  const navigate = useNavigate();
  const { cartItems, updateQuantity, removeFromCart, getCartTotal, getCartItemsCount } = useCart();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const handleCheckout = () => {
    onClose();
    navigate('/cart');
  };

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity >= 1) {
      updateQuantity(productId, newQuantity);
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: { xs: '100%', sm: 400 },
          maxWidth: '100vw',
        },
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2,
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <ShoppingCart color="primary" />
            <Typography variant="h6">
              Shopping Cart
            </Typography>
            <Badge badgeContent={getCartItemsCount()} color="primary">
              <Box />
            </Badge>
          </Box>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>

        {/* Cart Items */}
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          {cartItems.length === 0 ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                p: 3,
                textAlign: 'center',
              }}
            >
              <ShoppingCart sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Your cart is empty
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Add some products to get started
              </Typography>
              <Button
                variant="contained"
                onClick={() => {
                  onClose();
                  navigate('/products');
                }}
              >
                Browse Products
              </Button>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {cartItems.map((item, index) => (
                <React.Fragment key={item._id}>
                  <ListItem sx={{ py: 2, px: 2 }}>
                    <ListItemAvatar>
                      <Avatar
                        src={imageService.getProductImage(item, 'thumbnail', 60, 60)}
                        variant="rounded"
                        sx={{ width: 60, height: 60 }}
                      />
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle2" noWrap>
                          {item.name}
                        </Typography>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="primary" fontWeight="medium">
                            {formatPrice(item.price)}
                          </Typography>
                          <Box display="flex" alignItems="center" gap={1} mt={1}>
                            <IconButton
                              size="small"
                              onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              <Remove fontSize="small" />
                            </IconButton>
                            <Chip 
                              label={item.quantity} 
                              size="small" 
                              variant="outlined"
                            />
                            <IconButton
                              size="small"
                              onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                            >
                              <Add fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => removeFromCart(item._id)}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                      }
                    />
                    <Box textAlign="right">
                      <Typography variant="subtitle2" fontWeight="bold">
                        {formatPrice(item.price * item.quantity)}
                      </Typography>
                    </Box>
                  </ListItem>
                  {index < cartItems.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </Box>

        {/* Footer */}
        {cartItems.length > 0 && (
          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Total:</Typography>
              <Typography variant="h6" color="primary" fontWeight="bold">
                {formatPrice(getCartTotal())}
              </Typography>
            </Box>
            <Button
              variant="contained"
              fullWidth
              size="large"
              startIcon={<ShoppingCartCheckout />}
              onClick={handleCheckout}
            >
              Checkout
            </Button>
            <Button
              variant="text"
              fullWidth
              size="small"
              onClick={() => {
                onClose();
                navigate('/products');
              }}
              sx={{ mt: 1 }}
            >
              Continue Shopping
            </Button>
          </Box>
        )}
      </Box>
    </Drawer>
  );
};

export default CartDrawer;