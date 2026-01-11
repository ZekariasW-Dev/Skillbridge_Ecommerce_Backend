import React from 'react';
import {
  Box,
  Paper,
  Typography,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Slider,
  Chip,
  Divider,
  Button,
} from '@mui/material';
import { Clear } from '@mui/icons-material';

const categories = [
  { value: 'electronics', label: 'Electronics' },
  { value: 'clothing', label: 'Clothing' },
  { value: 'books', label: 'Books' },
  { value: 'home', label: 'Home & Garden' },
  { value: 'sports', label: 'Sports' },
  { value: 'beauty', label: 'Beauty' },
  { value: 'toys', label: 'Toys' },
  { value: 'food', label: 'Food' },
];

const ProductFilters = ({
  selectedCategories = [],
  priceRange = [0, 1000],
  onCategoryChange,
  onPriceChange,
  onClearFilters,
  minPrice = 0,
  maxPrice = 1000,
}) => {
  const handleCategoryChange = (category) => {
    const updatedCategories = selectedCategories.includes(category)
      ? selectedCategories.filter(c => c !== category)
      : [...selectedCategories, category];
    onCategoryChange(updatedCategories);
  };

  const formatPrice = (value) => {
    return `$${value}`;
  };

  const hasActiveFilters = selectedCategories.length > 0 || 
    priceRange[0] !== minPrice || priceRange[1] !== maxPrice;

  return (
    <Paper sx={{ p: 3, height: 'fit-content', position: 'sticky', top: 100 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Filters</Typography>
        {hasActiveFilters && (
          <Button
            size="small"
            startIcon={<Clear />}
            onClick={onClearFilters}
            color="primary"
          >
            Clear All
          </Button>
        )}
      </Box>

      {/* Active Filters */}
      {hasActiveFilters && (
        <Box mb={3}>
          <Typography variant="subtitle2" gutterBottom>
            Active Filters:
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={1}>
            {selectedCategories.map((category) => (
              <Chip
                key={category}
                label={categories.find(c => c.value === category)?.label || category}
                onDelete={() => handleCategoryChange(category)}
                size="small"
                color="primary"
                variant="outlined"
              />
            ))}
            {(priceRange[0] !== minPrice || priceRange[1] !== maxPrice) && (
              <Chip
                label={`$${priceRange[0]} - $${priceRange[1]}`}
                onDelete={() => onPriceChange([minPrice, maxPrice])}
                size="small"
                color="primary"
                variant="outlined"
              />
            )}
          </Box>
        </Box>
      )}

      {/* Categories */}
      <FormControl component="fieldset" sx={{ mb: 3 }}>
        <FormLabel component="legend">Categories</FormLabel>
        <FormGroup>
          {categories.map((category) => (
            <FormControlLabel
              key={category.value}
              control={
                <Checkbox
                  checked={selectedCategories.includes(category.value)}
                  onChange={() => handleCategoryChange(category.value)}
                  size="small"
                />
              }
              label={category.label}
            />
          ))}
        </FormGroup>
      </FormControl>

      <Divider sx={{ my: 2 }} />

      {/* Price Range */}
      <FormControl component="fieldset" sx={{ width: '100%' }}>
        <FormLabel component="legend" sx={{ mb: 2 }}>
          Price Range
        </FormLabel>
        <Box sx={{ px: 1 }}>
          <Slider
            value={priceRange}
            onChange={(event, newValue) => onPriceChange(newValue)}
            valueLabelDisplay="auto"
            valueLabelFormat={formatPrice}
            min={minPrice}
            max={maxPrice}
            step={10}
            marks={[
              { value: minPrice, label: formatPrice(minPrice) },
              { value: maxPrice, label: formatPrice(maxPrice) },
            ]}
          />
          <Box display="flex" justifyContent="space-between" mt={1}>
            <Typography variant="body2" color="text.secondary">
              {formatPrice(priceRange[0])}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {formatPrice(priceRange[1])}
            </Typography>
          </Box>
        </Box>
      </FormControl>
    </Paper>
  );
};

export default ProductFilters;