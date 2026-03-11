import axios from 'axios';

const raw = process.env.REACT_APP_API_URL || '';
const baseURL = (typeof raw === 'string' && raw.startsWith('http'))
  ? raw.replace(/\/$/, '')
  : 'http://localhost:5000/api';

const API = axios.create({
  baseURL,
  timeout: 15000,
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('cartify_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Handle token expiry globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('cartify_token');
      localStorage.removeItem('cartify_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const register = (data) => API.post('/auth/register', data);
export const login = (data) => API.post('/auth/login', data);
export const googleAuth = (data) => API.post('/auth/google', data);
export const getMe = () => API.get('/auth/me');
export const updateProfile = (data) => API.put('/auth/profile', data);
export const changePassword = (data) => API.put('/auth/change-password', data);

// Products
export const getProducts = (params) => API.get('/products', { params });
export const getProduct = (id) => API.get(`/products/${id}`);
export const getCategories = () => API.get('/products/categories');
export const seedProducts = () => API.post('/products/seed');
export const addReview = (id, data) => API.post(`/products/${id}/review`, data);
export const createProduct = (data) => API.post('/products', data);
export const updateProduct = (id, data) => API.put(`/products/${id}`, data);
export const deleteProduct = (id) => API.delete(`/products/${id}`);

// Cart
export const getCart = () => API.get('/cart');
export const addToCart = (productId, quantity) => API.post('/cart/add', { productId, quantity });
export const updateCartItem = (productId, quantity) => API.put('/cart/update', { productId, quantity });
export const removeFromCart = (productId) => API.delete(`/cart/remove/${productId}`);
export const clearCart = () => API.delete('/cart/clear');

// Orders
export const createOrder = (data) => API.post('/orders', data);
export const getMyOrders = () => API.get('/orders/my-orders');
export const getOrder = (id) => API.get(`/orders/${id}`);
export const getAllOrders = () => API.get('/orders');
export const updateOrderStatus = (id, status) => API.put(`/orders/${id}/status`, { orderStatus: status });

// Payment
export const createPaymentIntent = (amount) => API.post('/payment/create-intent', { amount });
export const confirmPayment = (orderId, data) => API.post(`/payment/confirm/${orderId}`, data);

// Wishlist
export const toggleWishlist = (productId) => API.post(`/users/wishlist/${productId}`);
export const getWishlist = () => API.get('/users/wishlist');

// Users (admin)
export const getAllUsers = () => API.get('/users');

export default API;
