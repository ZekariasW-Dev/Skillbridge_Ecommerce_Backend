import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Alert,
} from '@mui/material';
import { Add, TrendingUp, ShoppingCart, People, Inventory } from '@mui/icons-material';
import { productsAPI, ordersAPI } from '../services/api';
import ProductCard from '../components/products/ProductCard';
import ProductForm from '../components/products/ProductForm';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productFormOpen, setProductFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsResponse, ordersResponse] = await Promise.all([
        productsAPI.getAll({ pageSize: 100 }),
        ordersAPI.getAll(),
      ]);
      
      if (productsResponse.data.success) {
        setProducts(productsResponse.data.products || []);
      }
      
      if (ordersResponse.data.success) {
        setOrders(ordersResponse.data.object || []);
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async (productData) => {
    try {
      setFormLoading(true);
      const response = await productsAPI.create(productData);
      
      if (response.data.success) {
        toast.success('Product created successfully');
        const newProduct = response.data.object;
        setProducts(prev => [newProduct, ...prev]);
        setProductFormOpen(false);
        setEditingProduct(null);
        return newProduct; // Return the created product for image upload
      }
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error(error.response?.data?.message || 'Failed to create product');
      throw error;
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateProduct = async (productData) => {
    try {
      setFormLoading(true);
      const response = await productsAPI.update(editingProduct._id, productData);
      
      if (response.data.success) {
        toast.success('Product updated successfully');
        const updatedProduct = response.data.object;
        setProducts(prev => 
          prev.map(p => p._id === editingProduct._id ? updatedProduct : p)
        );
        setProductFormOpen(false);
        setEditingProduct(null);
        return updatedProduct; // Return the updated product for image upload
      }
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error(error.response?.data?.message || 'Failed to update product');
      throw error;
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteProduct = async () => {
    try {
      await productsAPI.delete(productToDelete);
      toast.success('Product deleted successfully');
      setProducts(prev => prev.filter(p => p._id !== productToDelete));
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error(error.response?.data?.message || 'Failed to delete product');
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductFormOpen(true);
  };

  const handleDeleteClick = (productId) => {
    setProductToDelete(productId);
    setDeleteDialogOpen(true);
  };

  const handleFormSubmit = async (productData) => {
    if (editingProduct) {
      return await handleUpdateProduct(productData);
    } else {
      return await handleCreateProduct(productData);
    }
  };

  const handleFormClose = () => {
    setProductFormOpen(false);
    setEditingProduct(null);
  };

  // Calculate statistics
  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const totalOrders = orders.length;
  const totalProducts = products.length;
  const lowStockProducts = products.filter(p => p.stock < 10).length;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  if (loading) {
    return <LoadingSpinner message="Loading admin dashboard..." />;
  }

  return (
    <Container maxWidth="lg">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1">
          Admin Dashboard
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setProductFormOpen(true)}
        >
          Add Product
        </Button>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Revenue
                  </Typography>
                  <Typography variant="h5">
                    {formatPrice(totalRevenue)}
                  </Typography>
                </Box>
                <TrendingUp color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Orders
                  </Typography>
                  <Typography variant="h5">
                    {totalOrders}
                  </Typography>
                </Box>
                <ShoppingCart color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Products
                  </Typography>
                  <Typography variant="h5">
                    {totalProducts}
                  </Typography>
                </Box>
                <Inventory color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Low Stock Items
                  </Typography>
                  <Typography variant="h5" color={lowStockProducts > 0 ? 'error' : 'inherit'}>
                    {lowStockProducts}
                  </Typography>
                </Box>
                <People color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Low Stock Alert */}
      {lowStockProducts > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          You have {lowStockProducts} product(s) with low stock (less than 10 items).
        </Alert>
      )}

      {/* Recent Orders */}
      <Box mb={4}>
        <Typography variant="h5" gutterBottom>
          Recent Orders
        </Typography>
        <Grid container spacing={2}>
          {orders.slice(0, 5).map((order) => (
            <Grid item xs={12} key={order._id}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="h6">
                        Order #{order._id?.slice(-8).toUpperCase()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Box textAlign="right">
                      <Typography variant="h6" color="primary">
                        {formatPrice(order.totalAmount)}
                      </Typography>
                      <Chip
                        label={order.status?.toUpperCase() || 'PENDING'}
                        size="small"
                        color={order.status === 'delivered' ? 'success' : 'primary'}
                      />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Products Management */}
      <Box>
        <Typography variant="h5" gutterBottom>
          Products Management
        </Typography>
        <Grid container spacing={3}>
          {products.map((product) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
              <ProductCard
                product={product}
                showActions={true}
                onEdit={handleEditProduct}
                onDelete={handleDeleteClick}
              />
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Product Form Dialog */}
      <ProductForm
        open={productFormOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        product={editingProduct}
        loading={formLoading}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this product? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteProduct} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add product"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => setProductFormOpen(true)}
      >
        <Add />
      </Fab>
    </Container>
  );
};

export default AdminDashboard;