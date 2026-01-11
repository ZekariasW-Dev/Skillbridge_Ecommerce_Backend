import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Box,
  TextField,
  MenuItem,
  InputAdornment,
  Pagination,
  Chip,
  Paper,
} from '@mui/material';
import { Search, FilterList } from '@mui/icons-material';
import { useSearchParams } from 'react-router-dom';
import { productsAPI } from '../services/api';
import ProductCard from '../components/products/ProductCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const categories = [
  { value: '', label: 'All Categories' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'clothing', label: 'Clothing' },
  { value: 'books', label: 'Books' },
  { value: 'home', label: 'Home' },
  { value: 'sports', label: 'Sports' },
  { value: 'beauty', label: 'Beauty' },
  { value: 'toys', label: 'Toys' },
  { value: 'food', label: 'Food' },
];

const sortOptions = [
  { value: '', label: 'Default' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'name_asc', label: 'Name: A to Z' },
  { value: 'name_desc', label: 'Name: Z to A' },
];

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || '');
  const [page, setPage] = useState(parseInt(searchParams.get('page')) || 1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchProducts();
  }, [searchTerm, selectedCategory, sortBy, page]);

  useEffect(() => {
    // Update URL params
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (selectedCategory) params.set('category', selectedCategory);
    if (sortBy) params.set('sort', sortBy);
    if (page > 1) params.set('page', page.toString());
    
    setSearchParams(params);
  }, [searchTerm, selectedCategory, sortBy, page, setSearchParams]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        pageSize: 12,
        ...(searchTerm && { search: searchTerm }),
        ...(selectedCategory && { category: selectedCategory }),
        ...(sortBy && { sort: sortBy }),
      };

      const response = await productsAPI.getAll(params);
      const data = response.data;
      
      if (data.success) {
        setProducts(data.products || []);
        setTotalPages(data.totalPages || 1);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const fetchProductsWithParams = async (params) => {
    try {
      setLoading(true);
      const response = await productsAPI.getAll(params);
      const data = response.data;
      
      if (data.success) {
        setProducts(data.products || []);
        setTotalPages(data.totalPages || 1);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(1); // Reset to first page when searching
  };

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
    setPage(1);
  };

  const handleSortChange = (event) => {
    const newSortValue = event.target.value;
    setSortBy(newSortValue);
    setPage(1);
    
    // Force immediate refetch with new sort
    const params = {
      page: 1,
      pageSize: 12,
      ...(searchTerm && { search: searchTerm }),
      ...(selectedCategory && { category: selectedCategory }),
      ...(newSortValue && { sort: newSortValue }),
    };
    
    fetchProductsWithParams(params);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSortBy('');
    setPage(1);
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        Products
      </Typography>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search products..."
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              select
              label="Category"
              value={selectedCategory}
              onChange={handleCategoryChange}
            >
              {categories.map((category) => (
                <MenuItem key={category.value} value={category.value}>
                  {category.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              select
              label="Sort By"
              value={sortBy}
              onChange={handleSortChange}
            >
              {sortOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          
          <Grid item xs={12} md={2}>
            <Box display="flex" gap={1} flexWrap="wrap">
              {(searchTerm || selectedCategory || sortBy) && (
                <Chip
                  label="Clear Filters"
                  onClick={clearFilters}
                  onDelete={clearFilters}
                  color="primary"
                  variant="outlined"
                />
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Active Filters */}
      {(searchTerm || selectedCategory) && (
        <Box mb={3}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Active filters:
          </Typography>
          <Box display="flex" gap={1} flexWrap="wrap">
            {searchTerm && (
              <Chip
                label={`Search: "${searchTerm}"`}
                onDelete={() => setSearchTerm('')}
                size="small"
              />
            )}
            {selectedCategory && (
              <Chip
                label={`Category: ${categories.find(c => c.value === selectedCategory)?.label}`}
                onDelete={() => setSelectedCategory('')}
                size="small"
              />
            )}
          </Box>
        </Box>
      )}

      {/* Products Grid */}
      {loading ? (
        <LoadingSpinner message="Loading products..." />
      ) : products.length === 0 ? (
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No products found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search criteria or browse all products.
          </Typography>
        </Box>
      ) : (
        <>
          <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" color="text.secondary">
              Showing {((page - 1) * 12) + 1}-{Math.min(page * 12, products.length + ((page - 1) * 12))} of {products.length} products on this page
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Page {page} of {totalPages}
            </Typography>
          </Box>
          
          <Grid container spacing={3}>
            {products.map((product) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
                <ProductCard product={product} />
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box mt={4}>
              <Box display="flex" justifyContent="center" mb={2}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                  showFirstButton
                  showLastButton
                />
              </Box>
              <Box textAlign="center">
                <Typography variant="body2" color="text.secondary">
                  Page {page} of {totalPages} • Jump to page:
                </Typography>
                <Box mt={1} display="flex" justifyContent="center" gap={1}>
                  {[1, Math.ceil(totalPages / 2), totalPages].filter((p, i, arr) => 
                    p <= totalPages && arr.indexOf(p) === i && p !== page
                  ).map(pageNum => (
                    <Chip
                      key={pageNum}
                      label={pageNum}
                      onClick={() => handlePageChange(null, pageNum)}
                      variant="outlined"
                      size="small"
                      clickable
                    />
                  ))}
                </Box>
              </Box>
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default Products;