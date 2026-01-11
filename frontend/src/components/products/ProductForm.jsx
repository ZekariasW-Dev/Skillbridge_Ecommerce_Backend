import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  MenuItem,
  Grid,
  Typography,
  Card,
  CardMedia,
  IconButton,
  Tabs,
  Tab,
  Alert,
  LinearProgress,
} from '@mui/material';
import {
  CloudUpload,
  Delete,
  Image as ImageIcon,
  Link as LinkIcon,
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { productsAPI } from '../../services/api';
import toast from 'react-hot-toast';

const categories = [
  'electronics',
  'clothing',
  'books',
  'home',
  'sports',
  'beauty',
  'toys',
  'food',
];

const ProductForm = ({ open, onClose, onSubmit, product = null, loading = false }) => {
  const [imageTab, setImageTab] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (product) {
      reset(product);
      // Set image preview if product has images
      if (product.images?.primary) {
        setImagePreview(product.images.primary);
        setImageUrl(product.images.primary);
      }
    } else {
      reset({
        name: '',
        description: '',
        price: '',
        category: '',
        stock: '',
        brand: '',
        tags: '',
      });
      setImagePreview('');
      setImageUrl('');
      setSelectedFile(null);
    }
  }, [product, reset]);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      
      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlChange = (event) => {
    const url = event.target.value;
    setImageUrl(url);
    
    // Update preview if it's a valid URL
    if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
      setImagePreview(url);
    } else if (!url) {
      setImagePreview('');
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setImageUrl('');
    setImagePreview('');
  };

  const uploadImage = async (productId) => {
    if (!selectedFile) return null;
    
    try {
      setIsUploading(true);
      setUploadProgress(0);
      
      const response = await productsAPI.uploadImage(productId, selectedFile);
      
      setUploadProgress(100);
      toast.success('Image uploaded successfully');
      
      return response.data;
    } catch (error) {
      console.error('Image upload error:', error);
      toast.error('Failed to upload image');
      throw error;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFormSubmit = async (data) => {
    try {
      // Convert price and stock to numbers
      const formattedData = {
        ...data,
        price: parseFloat(data.price),
        stock: parseInt(data.stock),
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()) : [],
      };

      // Add image URL if provided
      if (imageUrl && imageTab === 1) {
        formattedData.images = {
          primary: imageUrl,
          thumbnails: {
            small: imageUrl,
            medium: imageUrl,
            large: imageUrl,
          }
        };
      }

      // Submit the product data first
      const result = await onSubmit(formattedData);
      
      // If we have a file to upload and the product was created/updated successfully
      if (selectedFile && imageTab === 0 && result && result._id) {
        await uploadImage(result._id);
      }
      
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error('Failed to save product');
    }
  };

  const handleTabChange = (event, newValue) => {
    setImageTab(newValue);
    // Clear the other input when switching tabs
    if (newValue === 0) {
      setImageUrl('');
    } else {
      setSelectedFile(null);
    }
    setImagePreview('');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {product ? 'Edit Product' : 'Add New Product'}
      </DialogTitle>
      
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent>
          <Grid container spacing={3}>
            {/* Basic Product Information */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Product Name"
                {...register('name', { required: 'Product name is required' })}
                error={!!errors.name}
                helperText={errors.name?.message}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                {...register('description', { required: 'Description is required' })}
                error={!!errors.description}
                helperText={errors.description?.message}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Price"
                type="number"
                step="0.01"
                {...register('price', { 
                  required: 'Price is required',
                  min: { value: 0.01, message: 'Price must be greater than 0' }
                })}
                error={!!errors.price}
                helperText={errors.price?.message}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Stock"
                type="number"
                {...register('stock', { 
                  required: 'Stock is required',
                  min: { value: 0, message: 'Stock cannot be negative' }
                })}
                error={!!errors.stock}
                helperText={errors.stock?.message}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Category"
                {...register('category', { required: 'Category is required' })}
                error={!!errors.category}
                helperText={errors.category?.message}
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Brand"
                {...register('brand')}
                helperText="Optional brand name"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tags"
                {...register('tags')}
                helperText="Comma-separated tags (e.g., organic, premium, handmade)"
              />
            </Grid>

            {/* Image Upload Section */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Product Image
              </Typography>
              
              <Box sx={{ borderWidth: 1, borderStyle: 'solid', borderColor: 'divider', borderRadius: 1, p: 2 }}>
                <Tabs value={imageTab} onChange={handleTabChange} sx={{ mb: 2 }}>
                  <Tab icon={<CloudUpload />} label="Upload File" />
                  <Tab icon={<LinkIcon />} label="Image URL" />
                </Tabs>

                {/* File Upload Tab */}
                {imageTab === 0 && (
                  <Box>
                    <input
                      accept="image/*"
                      style={{ display: 'none' }}
                      id="image-upload"
                      type="file"
                      onChange={handleFileSelect}
                    />
                    <label htmlFor="image-upload">
                      <Button
                        variant="outlined"
                        component="span"
                        startIcon={<CloudUpload />}
                        fullWidth
                        sx={{ mb: 2 }}
                      >
                        Choose Image File
                      </Button>
                    </label>
                    
                    {selectedFile && (
                      <Alert severity="info" sx={{ mb: 2 }}>
                        Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                      </Alert>
                    )}
                  </Box>
                )}

                {/* URL Input Tab */}
                {imageTab === 1 && (
                  <TextField
                    fullWidth
                    label="Image URL"
                    value={imageUrl}
                    onChange={handleUrlChange}
                    placeholder="https://example.com/image.jpg"
                    helperText="Enter a direct link to an image"
                    sx={{ mb: 2 }}
                  />
                )}

                {/* Image Preview */}
                {imagePreview && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Preview:
                    </Typography>
                    <Card sx={{ maxWidth: 300, position: 'relative' }}>
                      <CardMedia
                        component="img"
                        height="200"
                        image={imagePreview}
                        alt="Product preview"
                        sx={{ objectFit: 'cover' }}
                      />
                      <IconButton
                        onClick={handleRemoveImage}
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          backgroundColor: 'rgba(255, 255, 255, 0.8)',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          },
                        }}
                        size="small"
                      >
                        <Delete />
                      </IconButton>
                    </Card>
                  </Box>
                )}

                {/* Upload Progress */}
                {isUploading && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" gutterBottom>
                      Uploading image...
                    </Typography>
                    <LinearProgress variant="determinate" value={uploadProgress} />
                  </Box>
                )}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={onClose} disabled={loading || isUploading}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={loading || isUploading}
          >
            {loading || isUploading ? 'Saving...' : (product ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ProductForm;