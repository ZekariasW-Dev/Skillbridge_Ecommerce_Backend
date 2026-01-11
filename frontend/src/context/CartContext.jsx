import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const { user, isAuthenticated } = useAuth();

  // Get user-specific cart key
  const getCartKey = () => {
    return user ? `cart_${user.userId}` : 'cart_guest';
  };

  // Load cart from localStorage on mount or when user changes
  useEffect(() => {
    const loadCart = () => {
      const cartKey = getCartKey();
      const savedCart = localStorage.getItem(cartKey);
      
      if (savedCart && savedCart !== '[]') {
        try {
          const parsedCart = JSON.parse(savedCart);
          if (parsedCart.length > 0) {
            setCartItems(parsedCart);
          } else {
            setCartItems([]);
          }
        } catch (error) {
          console.error('Error parsing cart from localStorage:', error);
          setCartItems([]);
        }
      } else {
        setCartItems([]);
      }
      setIsInitialized(true);
    };

    loadCart();
  }, [user]); // Reload cart when user changes

  // Save cart to localStorage whenever it changes (but not on initial load)
  useEffect(() => {
    if (isInitialized) {
      const cartKey = getCartKey();
      localStorage.setItem(cartKey, JSON.stringify(cartItems));
    }
  }, [cartItems, isInitialized, user]);

  // Clear cart when user logs out
  useEffect(() => {
    if (!isAuthenticated && isInitialized) {
      setCartItems([]);
    }
  }, [isAuthenticated, isInitialized]);

  const addToCart = (product, quantity = 1) => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return;
    }

    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item._id === product._id);
      
      if (existingItem) {
        const updatedItems = prevItems.map(item =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
        toast.success(`Updated ${product.name} quantity in cart`);
        return updatedItems;
      } else {
        toast.success(`Added ${product.name} to cart`);
        return [...prevItems, { ...product, quantity }];
      }
    });
  };

  const removeFromCart = (productId) => {
    setCartItems(prevItems => {
      const item = prevItems.find(item => item._id === productId);
      if (item) {
        toast.success(`Removed ${item.name} from cart`);
      }
      return prevItems.filter(item => item._id !== productId);
    });
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems(prevItems =>
      prevItems.map(item =>
        item._id === productId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    toast.success('Cart cleared');
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemsCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemsCount,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};