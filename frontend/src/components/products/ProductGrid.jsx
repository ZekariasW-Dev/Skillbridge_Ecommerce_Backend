import React from 'react';
import {
  Grid,
  Box,
  Typography,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import { ViewModule, ViewList } from '@mui/icons-material';
import ProductCard from './ProductCard';
import ProductListItem from './ProductListItem';

const sortOptions = [
  { value: '', label: 'Default' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'name_asc', label: 'Name: A to Z' },
  { value: 'name_desc', label: 'Name: Z to A' },
  { value: 'newest', label: 'Newest First' },
];

const ProductGrid = ({
  products = [],
  loading = false,
  viewMode = 'grid',
  sortBy = '',
  onViewModeChange,
  onSortChange,
  showActions = false,
  onEdit,
  onDelete,
}) => {
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <Typography>Loading products...</Typography>
      </Box>
    );
  }

  if (products.length === 0) {
    return (
      <Box textAlign="center" py={8}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No products found
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Try adjusting your search criteria or browse all products.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Toolbar */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
        flexWrap="wrap"
        gap={2}
      >
        <Typography variant="body2" color="text.secondary">
          Showing {products.length} products
        </Typography>

        <Box display="flex" alignItems="center" gap={2}>
          {/* Sort */}
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={sortBy}
              label="Sort By"
              onChange={(e) => onSortChange(e.target.value)}
            >
              {sortOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* View Mode Toggle */}
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(event, newViewMode) => {
              if (newViewMode !== null) {
                onViewModeChange(newViewMode);
              }
            }}
            size="small"
          >
            <ToggleButton value="grid" aria-label="grid view">
              <ViewModule />
            </ToggleButton>
            <ToggleButton value="list" aria-label="list view">
              <ViewList />
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      {/* Products */}
      {viewMode === 'grid' ? (
        <Grid container spacing={3}>
          {products.map((product) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
              <ProductCard
                product={product}
                showActions={showActions}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box display="flex" flexDirection="column" gap={2}>
          {products.map((product) => (
            <ProductListItem
              key={product._id}
              product={product}
              showActions={showActions}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default ProductGrid;