import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
};

export const productsAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (productData) => api.post('/products', productData),
  update: (id, productData) => api.put(`/products/${id}`, productData),
  delete: (id) => api.delete(`/products/${id}`),
  uploadImage: (id, imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    return api.post(`/images/products/${id}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export const ordersAPI = {
  getAll: () => api.get('/orders'),
  getById: (id) => api.get(`/orders/${id}`),
  create: (orderData) => api.post('/orders', orderData),
  updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
};

export const favoritesAPI = {
  getAll: () => api.get('/favorites'),
  add: (productId) => api.post(`/favorites/${productId}`),
  remove: (productId) => api.delete(`/favorites/${productId}`),
};

export const healthAPI = {
  check: () => api.get('/health'),
};

// Image service for global images
export const imageService = {
  // Get product image - handles both Cloudinary and fallback
  getProductImage: (product, size = 'medium', width = 400, height = 300) => {
    // If product has new image structure with primary image
    if (product?.images?.primary) {
      return product.images.primary;
    }
    
    // If product has thumbnails
    if (product?.images?.thumbnails) {
      return product.images.thumbnails[size] || product.images.thumbnails.medium || product.images.thumbnails.large;
    }
    
    // If product has Cloudinary images
    if (product?.images?.imageUrls) {
      return product.images.imageUrls[size] || product.images.imageUrls.medium || product.images.imageUrls.large;
    }
    
    // If product has local images (fallback)
    if (product?.images?.processedImages) {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
      const imageData = product.images.processedImages[size] || product.images.processedImages.medium || product.images.processedImages.large;
      return imageData ? `${baseUrl}${imageData.path}` : null;
    }
    
    // Smart fallback based on Ethiopian product names and categories
    return imageService.getEthiopianProductImage(product, width, height);
  },

  // Get Ethiopian-themed product images based on product name and category
  getEthiopianProductImage: (product, width = 400, height = 300) => {
    const productName = product?.name?.toLowerCase() || '';
    const category = product?.category?.toLowerCase() || '';
    
    // Ethiopian Coffee Products - Professional Amazon-style images
    if (productName.includes('coffee') || productName.includes('yirgacheffe') || productName.includes('sidamo') || productName.includes('harar')) {
      const coffeeImages = [
        'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600&h=600&fit=crop&auto=format&q=80', // Coffee plantation
        'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600&h=600&fit=crop&auto=format&q=80', // Premium coffee beans
        'https://images.unsplash.com/photo-1610889556528-9a770e32642f?w=600&h=600&fit=crop&auto=format&q=80', // Coffee bag packaging
        'https://images.unsplash.com/photo-1587734195503-904fca47e0d9?w=600&h=600&fit=crop&auto=format&q=80', // Coffee beans close-up
        'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=600&h=600&fit=crop&auto=format&q=80', // Coffee roasting
      ];
      const seed = product?._id ? parseInt(product._id.slice(-2), 16) : Math.floor(Math.random() * 1000);
      return coffeeImages[seed % coffeeImages.length];
    }

    // Ethiopian Spices - Professional spice photography
    if (productName.includes('berbere') || productName.includes('spice') || productName.includes('mitmita') || productName.includes('cardamom')) {
      const spiceImages = [
        'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&h=600&fit=crop&auto=format&q=80', // Colorful spices
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=600&fit=crop&auto=format&q=80', // Spice market
        'https://images.unsplash.com/photo-1599909533730-f4b6b2b3b8b1?w=600&h=600&fit=crop&auto=format&q=80', // Premium spices
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=600&fit=crop&auto=format&q=80', // Spice bowls
        'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600&h=600&fit=crop&auto=format&q=80', // Ground spices
      ];
      const seed = product?._id ? parseInt(product._id.slice(-2), 16) : Math.floor(Math.random() * 1000);
      return spiceImages[seed % spiceImages.length];
    }

    // Traditional Ethiopian Clothing - High-quality fashion photography
    if (productName.includes('habesha') || productName.includes('kemis') || productName.includes('netela') || productName.includes('traditional')) {
      const clothingImages = [
        'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&h=600&fit=crop&auto=format&q=80', // Traditional dress
        'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&h=600&fit=crop&auto=format&q=80', // Textiles
        'https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&h=600&fit=crop&auto=format&q=80', // Fabric detail
        'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&h=600&fit=crop&auto=format&q=80', // Fashion
        'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=600&fit=crop&auto=format&q=80', // Clothing store
      ];
      const seed = product?._id ? parseInt(product._id.slice(-2), 16) : Math.floor(Math.random() * 1000);
      return clothingImages[seed % clothingImages.length];
    }

    // Ethiopian Books and Education - Clean book photography
    if (category === 'books' || productName.includes('book') || productName.includes('amharic') || productName.includes('oromo')) {
      const bookImages = [
        'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&h=600&fit=crop&auto=format&q=80', // Books stack
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=600&fit=crop&auto=format&q=80', // Open book
        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&h=600&fit=crop&auto=format&q=80', // Library
        'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=600&h=600&fit=crop&auto=format&q=80', // Reading
        'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600&h=600&fit=crop&auto=format&q=80', // Education
      ];
      const seed = product?._id ? parseInt(product._id.slice(-2), 16) : Math.floor(Math.random() * 1000);
      return bookImages[seed % bookImages.length];
    }

    // Ethiopian Home and Crafts - Professional product photography
    if (productName.includes('basket') || productName.includes('ceremony') || productName.includes('jebena') || productName.includes('incense')) {
      const homeImages = [
        'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=600&fit=crop&auto=format&q=80', // Handcrafts
        'https://images.unsplash.com/photo-1493663284031-b7e3aaa4cab7?w=600&h=600&fit=crop&auto=format&q=80', // Pottery
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=600&fit=crop&auto=format&q=80', // Handmade items
        'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=600&h=600&fit=crop&auto=format&q=80', // Traditional crafts
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=600&fit=crop&auto=format&q=80', // Home decor
      ];
      const seed = product?._id ? parseInt(product._id.slice(-2), 16) : Math.floor(Math.random() * 1000);
      return homeImages[seed % homeImages.length];
    }

    // Electronics - Amazon-style tech product photography
    if (category === 'electronics' || productName.includes('phone') || productName.includes('radio') || productName.includes('solar')) {
      const electronicsImages = [
        'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&h=600&fit=crop&auto=format&q=80', // Electronics
        'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=600&fit=crop&auto=format&q=80', // Technology
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&h=600&fit=crop&auto=format&q=80', // Gadgets
        'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=600&h=600&fit=crop&auto=format&q=80', // Devices
        'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=600&fit=crop&auto=format&q=80', // Modern tech
      ];
      const seed = product?._id ? parseInt(product._id.slice(-2), 16) : Math.floor(Math.random() * 1000);
      return electronicsImages[seed % electronicsImages.length];
    }

    // Sports - Professional sports equipment photography
    if (category === 'sports' || productName.includes('running') || productName.includes('athletic') || productName.includes('jersey')) {
      const sportsImages = [
        'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=600&h=600&fit=crop&auto=format&q=80', // Running shoes
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=600&fit=crop&auto=format&q=80', // Sports equipment
        'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=600&h=600&fit=crop&auto=format&q=80', // Fitness gear
        'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600&h=600&fit=crop&auto=format&q=80', // Athletic wear
        'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&h=600&fit=crop&auto=format&q=80', // Sports accessories
      ];
      const seed = product?._id ? parseInt(product._id.slice(-2), 16) : Math.floor(Math.random() * 1000);
      return sportsImages[seed % sportsImages.length];
    }

    // Beauty - Professional cosmetics photography
    if (category === 'beauty' || productName.includes('shea') || productName.includes('honey') || productName.includes('oil')) {
      const beautyImages = [
        'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&h=600&fit=crop&auto=format&q=80', // Beauty products
        'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600&h=600&fit=crop&auto=format&q=80', // Natural beauty
        'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&h=600&fit=crop&auto=format&q=80', // Skincare
        'https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=600&h=600&fit=crop&auto=format&q=80', // Cosmetics
        'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&h=600&fit=crop&auto=format&q=80', // Beauty essentials
      ];
      const seed = product?._id ? parseInt(product._id.slice(-2), 16) : Math.floor(Math.random() * 1000);
      return beautyImages[seed % beautyImages.length];
    }

    // Toys - Professional toy photography
    if (category === 'toys' || productName.includes('toy') || productName.includes('doll') || productName.includes('game')) {
      const toyImages = [
        'https://images.unsplash.com/photo-1558877385-1c4c7e9e3e9e?w=600&h=600&fit=crop&auto=format&q=80', // Colorful toys
        'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=600&h=600&fit=crop&auto=format&q=80', // Children toys
        'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&h=600&fit=crop&auto=format&q=80', // Educational toys
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop&auto=format&q=80', // Toy collection
        'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=600&h=600&fit=crop&auto=format&q=80', // Traditional toys
      ];
      const seed = product?._id ? parseInt(product._id.slice(-2), 16) : Math.floor(Math.random() * 1000);
      return toyImages[seed % toyImages.length];
    }

    // Food - Professional food photography
    if (category === 'food' || productName.includes('honey') || productName.includes('teff') || productName.includes('lentil')) {
      const foodImages = [
        'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&h=600&fit=crop&auto=format&q=80', // Gourmet food
        'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600&h=600&fit=crop&auto=format&q=80', // Healthy ingredients
        'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&h=600&fit=crop&auto=format&q=80', // Fresh ingredients
        'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&h=600&fit=crop&auto=format&q=80', // Grains and seeds
        'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&h=600&fit=crop&auto=format&q=80', // Honey jar
      ];
      const seed = product?._id ? parseInt(product._id.slice(-2), 16) : Math.floor(Math.random() * 1000);
      return foodImages[seed % foodImages.length];
    }

    // Fallback to category-based images
    return imageService.getCategoryImage(category, width, height);
  },
  
  // Get product image by ID (for backward compatibility)
  getProductImageById: (productId, width = 400, height = 300) => {
    const seed = productId ? productId.slice(-3) : Math.floor(Math.random() * 1000);
    return `https://picsum.photos/seed/${seed}/${width}/${height}`;
  },
  
  // Get category image
  getCategoryImage: (category, width = 300, height = 200) => {
    const categoryImages = {
      electronics: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&h=600&fit=crop&auto=format&q=80', // Premium electronics
      clothing: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&h=600&fit=crop&auto=format&q=80', // Fashion clothing
      books: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&h=600&fit=crop&auto=format&q=80', // Book collection
      home: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=600&fit=crop&auto=format&q=80', // Home decor
      sports: 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=600&h=600&fit=crop&auto=format&q=80', // Sports equipment
      beauty: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&h=600&fit=crop&auto=format&q=80', // Beauty products
      toys: 'https://images.unsplash.com/photo-1558877385-1c4c7e9e3e9e?w=600&h=600&fit=crop&auto=format&q=80', // Colorful toys
      food: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&h=600&fit=crop&auto=format&q=80', // Gourmet food
    };
    
    return categoryImages[category?.toLowerCase()] || 
           `https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=${width}&h=${height}&fit=crop&auto=format&q=80`;
  },
  
  // Get hero/banner images
  getHeroImage: (index = 1) => {
    const heroImages = [
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=600&fit=crop',
      'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1200&h=600&fit=crop',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&h=600&fit=crop',
    ];
    return heroImages[index % heroImages.length];
  },
  
  // Get user avatar
  getUserAvatar: (userId) => {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`;
  },
  
  // Get placeholder image
  getPlaceholder: (width = 400, height = 300, text = 'Product') => {
    return `https://via.placeholder.com/${width}x${height}/cccccc/666666?text=${encodeURIComponent(text)}`;
  }
};

export default api;