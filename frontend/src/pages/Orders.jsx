import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Button,
  Menu,
  MenuItem,
} from '@mui/material';
import { ShoppingBag, LocalShipping, CheckCircle, Schedule, MoreVert } from '@mui/icons-material';
import { ordersAPI, imageService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { isAdmin } = useAuth();

  const statusOptions = [
    { value: 'pending', label: 'Pending', color: 'warning' },
    { value: 'processing', label: 'Processing', color: 'info' },
    { value: 'shipped', label: 'Shipped', color: 'primary' },
    { value: 'delivered', label: 'Delivered', color: 'success' },
    { value: 'cancelled', label: 'Cancelled', color: 'error' },
  ];

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await ordersAPI.getAll();
      if (response.data.success) {
        setOrders(response.data.object || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'warning';
      case 'processing':
        return 'info';
      case 'shipped':
        return 'primary';
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleStatusMenuOpen = (event, order) => {
    setAnchorEl(event.currentTarget);
    setSelectedOrder(order);
  };

  const handleStatusMenuClose = () => {
    setAnchorEl(null);
    setSelectedOrder(null);
  };

  const handleStatusUpdate = async (newStatus) => {
    if (!selectedOrder) return;
    
    try {
      await ordersAPI.updateStatus(selectedOrder.order_id, newStatus);
      toast.success(`Order status updated to ${newStatus}`);
      
      // Update the order in the local state
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.order_id === selectedOrder.order_id
            ? { ...order, status: newStatus }
            : order
        )
      );
    } catch (error) {
      toast.error('Failed to update order status');
      console.error('Error updating order status:', error);
    } finally {
      handleStatusMenuClose();
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return <Schedule />;
      case 'processing':
        return <Schedule />;
      case 'shipped':
        return <LocalShipping />;
      case 'delivered':
        return <CheckCircle />;
      default:
        return <ShoppingBag />;
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading your orders..." />;
  }

  if (orders.length === 0) {
    return (
      <Container maxWidth="md">
        <Box textAlign="center" py={8}>
          <ShoppingBag sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            No orders yet
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={4}>
            When you place your first order, it will appear here.
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        My Orders
      </Typography>

      <Grid container spacing={3}>
        {orders.map((order) => (
          <Grid item xs={12} key={order._id}>
            <Card>
              <CardContent>
                {/* Order Header */}
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Order #{order.order_id?.slice(-8).toUpperCase()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Placed on {formatDate(order.created_at)}
                    </Typography>
                    {order.description && (
                      <Typography variant="body2" color="text.secondary" mt={1}>
                        {order.description}
                      </Typography>
                    )}
                  </Box>
                  <Box textAlign="right">
                    <Box display="flex" alignItems="center" gap={1}>
                      <Chip
                        icon={getStatusIcon(order.status)}
                        label={order.status?.toUpperCase() || 'PENDING'}
                        color={getStatusColor(order.status)}
                        variant="outlined"
                      />
                      {isAdmin && (
                        <Button
                          size="small"
                          onClick={(e) => handleStatusMenuOpen(e, order)}
                          sx={{ minWidth: 'auto', p: 0.5 }}
                        >
                          <MoreVert />
                        </Button>
                      )}
                    </Box>
                    <Typography variant="h6" color="primary" mt={1}>
                      {formatPrice(order.total_price)}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Order Items */}
                <Typography variant="subtitle1" gutterBottom>
                  Items ({order.products?.length || 0})
                </Typography>
                
                <List dense>
                  {order.products?.map((item, index) => (
                    <ListItem key={index} sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar
                          src={imageService.getProductImage({ _id: item.productId }, 'medium', 60, 60)}
                          variant="rounded"
                          sx={{ width: 60, height: 60 }}
                        />
                      </ListItemAvatar>
                      <ListItemText
                        primary={item.name || `Product ${item.productId?.slice(-6)}`}
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Quantity: {item.quantity}
                            </Typography>
                            <Typography variant="body2" color="primary" fontWeight="medium">
                              {formatPrice(item.price)} each
                            </Typography>
                          </Box>
                        }
                      />
                      <Typography variant="body1" fontWeight="medium">
                        {formatPrice(item.itemTotal)}
                      </Typography>
                    </ListItem>
                  ))}
                </List>

                {/* Shipping Address */}
                {order.shippingAddress && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle1" gutterBottom>
                      Shipping Address
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {order.shippingAddress.street}<br />
                      {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}<br />
                      {order.shippingAddress.country}
                    </Typography>
                  </>
                )}

                {/* Order Summary */}
                <Divider sx={{ my: 2 }} />
                <Box display="flex" justifyContent="flex-end">
                  <Box minWidth={200}>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">Subtotal:</Typography>
                      <Typography variant="body2">
                        {formatPrice(order.total_price)}
                      </Typography>
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="subtitle1" fontWeight="bold">Total:</Typography>
                      <Typography variant="subtitle1" fontWeight="bold" color="primary">
                        {formatPrice(order.total_price)}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Status Update Menu (Admin Only) */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleStatusMenuClose}
      >
        {statusOptions.map((status) => (
          <MenuItem
            key={status.value}
            onClick={() => handleStatusUpdate(status.value)}
            disabled={selectedOrder?.status === status.value}
          >
            {status.label}
          </MenuItem>
        ))}
      </Menu>
    </Container>
  );
};

export default Orders;