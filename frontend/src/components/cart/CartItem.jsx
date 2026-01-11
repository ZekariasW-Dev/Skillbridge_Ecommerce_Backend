import React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  IconButton,
  Box,
  TextField,
  Button,
} from '@mui/material';
import { Add, Remove, Delete } from '@mui/icons-material';
import { useCart } from '../../context/CartContext';
import { imageService } from '../../services/api';

const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1) {
      updateQuantity(item._id, newQuantity);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <Card sx={{ display: 'flex', mb: 2, p: 1 }}>
      <CardMedia
        component="img"
        sx={{ width: 120, height: 120, objectFit: 'cover' }}
        image={imageService.getProductImage(item, 'thumbnail', 120, 120)}
        alt={item.name}
      />
      
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" component="div" gutterBottom>
          {item.name}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {item.description?.length > 100 
            ? `${item.description.substring(0, 100)}...` 
            : item.description}
        </Typography>
        
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" color="primary" fontWeight="bold">
            {formatPrice(item.price)}
          </Typography>
          
          <Box display="flex" alignItems="center" gap={1}>
            <IconButton
              size="small"
              onClick={() => handleQuantityChange(item.quantity - 1)}
              disabled={item.quantity <= 1}
            >
              <Remove />
            </IconButton>
            
            <TextField
              size="small"
              type="number"
              value={item.quantity}
              onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
              inputProps={{ min: 1, style: { textAlign: 'center', width: '60px' } }}
            />
            
            <IconButton
              size="small"
              onClick={() => handleQuantityChange(item.quantity + 1)}
            >
              <Add />
            </IconButton>
          </Box>
          
          <Typography variant="h6" fontWeight="bold">
            {formatPrice(item.price * item.quantity)}
          </Typography>
          
          <IconButton
            color="error"
            onClick={() => removeFromCart(item._id)}
          >
            <Delete />
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CartItem;