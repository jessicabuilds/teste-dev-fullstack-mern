import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadCart();
    } else {
      const localCart = localStorage.getItem('cart');
      if (localCart) {
        setCart(JSON.parse(localCart));
      }
    }
  }, [user]);

  const loadCart = async () => {
    try {
      setLoading(true);
      const response = await api.get('/cart');
      setCart(response.data);
    } catch (error) {
      console.error('Erro ao carregar carrinho:', error);
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (productId, quantity = 1) => {
    try {
      if (user) {
        const response = await api.post('/cart/items', { productId, quantity });
        setCart(response.data);
        return { success: true };
      } else {
        const localCart = cart || { items: [], total: 0 };
        const existingItem = localCart.items.find(item => item.product._id === productId);
        
        if (existingItem) {
          existingItem.quantity += quantity;
        } else {
          const productResponse = await api.get(`/products/${productId}`);
          localCart.items.push({
            product: productResponse.data,
            quantity,
          });
        }
        localCart.total = localCart.items.reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0
        );
        
        setCart(localCart);
        localStorage.setItem('cart', JSON.stringify(localCart));
        return { success: true };
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao adicionar item',
      };
    }
  };

  const updateItem = async (productId, quantity) => {
    try {
      if (user) {
        const response = await api.put(`/cart/items/${productId}`, { quantity });
        setCart(response.data);
        return { success: true };
      } else {
        const localCart = { ...cart };
        const item = localCart.items.find(item => item.product._id === productId);
        
        if (item) {
          item.quantity = quantity;
          localCart.total = localCart.items.reduce(
            (sum, item) => sum + item.product.price * item.quantity,
            0
          );
          
          setCart(localCart);
          localStorage.setItem('cart', JSON.stringify(localCart));
        }
        return { success: true };
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao atualizar item',
      };
    }
  };

  const removeItem = async (productId) => {
    try {
      if (user) {
        const response = await api.delete(`/cart/items/${productId}`);
        setCart(response.data);
        return { success: true };
      } else {
        const localCart = { ...cart };
        localCart.items = localCart.items.filter(item => item.product._id !== productId);
        localCart.total = localCart.items.reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0
        );
        
        setCart(localCart);
        localStorage.setItem('cart', JSON.stringify(localCart));
        return { success: true };
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao remover item',
      };
    }
  };

  const clearCart = () => {
    setCart(null);
    localStorage.removeItem('cart');
  };

  const getItemCount = () => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((sum, item) => sum + item.quantity, 0);
  };

  const value = {
    cart,
    loading,
    addItem,
    updateItem,
    removeItem,
    clearCart,
    getItemCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
