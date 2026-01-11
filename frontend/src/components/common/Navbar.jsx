import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Box,
  Avatar,
  Container,
} from '@mui/material';
import {
  ShoppingCart,
  AccountCircle,
  Store,
  Home,
  Dashboard,
  Favorite,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useFavorites } from '../../context/FavoritesContext';
import { imageService } from '../../services/api';
import CartDrawer from '../cart/CartDrawer';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const { getCartItemsCount } = useCart();
  const { favorites } = useFavorites();
  const [anchorEl, setAnchorEl] = useState(null);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <AppBar position="sticky" sx={{ mb: 2 }}>
      <Container maxWidth="lg">
        <Toolbar>
          <Store sx={{ mr: 2 }} />
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, cursor: 'pointer' }}
            onClick={() => navigate('/')}
          >
            SkillBridge Store
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              color="inherit"
              startIcon={<Home />}
              onClick={() => navigate('/')}
              sx={{ 
                backgroundColor: isActive('/') ? 'rgba(255,255,255,0.1)' : 'transparent',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
              }}
            >
              Home
            </Button>

            <Button
              color="inherit"
              startIcon={<Store />}
              onClick={() => navigate('/products')}
              sx={{ 
                backgroundColor: isActive('/products') ? 'rgba(255,255,255,0.1)' : 'transparent',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
              }}
            >
              Products
            </Button>

            {/* Cart - Always visible */}
            <IconButton
              color="inherit"
              onClick={() => isAuthenticated ? setCartDrawerOpen(true) : navigate('/login')}
              sx={{ 
                backgroundColor: isActive('/cart') ? 'rgba(255,255,255,0.1)' : 'transparent',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
              }}
              title={isAuthenticated ? 'View Cart' : 'Login to view cart'}
            >
              <Badge badgeContent={isAuthenticated ? getCartItemsCount() : 0} color="error">
                <ShoppingCart />
              </Badge>
            </IconButton>

            {/* Favorites - Only visible when authenticated */}
            {isAuthenticated && (
              <IconButton
                color="inherit"
                onClick={() => navigate('/favorites')}
                sx={{ 
                  backgroundColor: isActive('/favorites') ? 'rgba(255,255,255,0.1)' : 'transparent',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
                }}
                title="My Favorites"
              >
                <Badge badgeContent={favorites.length} color="error">
                  <Favorite />
                </Badge>
              </IconButton>
            )}

            {isAuthenticated ? (
              <>
                {isAdmin && (
                  <Button
                    color="inherit"
                    startIcon={<Dashboard />}
                    onClick={() => navigate('/admin')}
                    sx={{ 
                      backgroundColor: isActive('/admin') ? 'rgba(255,255,255,0.1)' : 'transparent',
                      '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
                    }}
                  >
                    Admin
                  </Button>
                )}

                <IconButton
                  size="large"
                  aria-label="account of current user"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                  onClick={handleMenu}
                  color="inherit"
                  sx={{ '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } }}
                >
                  <Avatar 
                    src={imageService.getUserAvatar(user?._id)} 
                    sx={{ width: 32, height: 32 }}
                  />
                </IconButton>
                <Menu
                  id="menu-appbar"
                  anchorEl={anchorEl}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                >
                  <MenuItem onClick={() => { navigate('/favorites'); handleClose(); }}>
                    My Favorites
                  </MenuItem>
                  <MenuItem onClick={() => { navigate('/orders'); handleClose(); }}>
                    My Orders
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </Menu>
              </>
            ) : (
              <>
                <Button 
                  color="inherit" 
                  onClick={() => navigate('/login')}
                  variant="outlined"
                  sx={{ 
                    backgroundColor: isActive('/login') ? 'rgba(255,255,255,0.1)' : 'transparent',
                    borderColor: 'rgba(255,255,255,0.5)',
                    '&:hover': { 
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      borderColor: 'white'
                    }
                  }}
                >
                  Login
                </Button>
                <Button 
                  color="inherit" 
                  onClick={() => navigate('/register')}
                  variant="contained"
                  sx={{ 
                    backgroundColor: isActive('/register') ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.15)',
                    color: isActive('/register') ? 'primary.main' : 'white',
                    '&:hover': { 
                      backgroundColor: 'rgba(255,255,255,0.25)'
                    }
                  }}
                >
                  Register
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
      
      {/* Cart Drawer */}
      <CartDrawer 
        open={cartDrawerOpen} 
        onClose={() => setCartDrawerOpen(false)} 
      />
    </AppBar>
  );
};

export default Navbar;