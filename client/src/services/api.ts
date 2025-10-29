import axios from 'axios';

// Base URL is read from Vite environment variable VITE_API_BASE_URL.
// If not provided, fall back to the local development API.
const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:8000/api';

// Create axios instance with base configuration
const API = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token to requests
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: (credentials: { username: string; password: string }) =>
    API.post('/auth/login/', credentials),
  
  register: (userData: {
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    password: string;
    password_confirm: string;
  }) => API.post('/auth/register/', userData),
  
  requestOTP: (userData: {
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    password: string;
    password_confirm: string;
    mobile?: string;
    otp_method?: 'email' | 'whatsapp';
  }) => API.post('/auth/register/request-otp/', userData),
  
  verifyOTP: (data: { email: string; otp: string }) =>
    API.post('/auth/register/verify-otp/', data),
  
  resendOTP: (data: { email: string; otp_method?: 'email' | 'whatsapp' }) =>
    API.post('/auth/register/resend-otp/', data),
  
  logout: () => API.post('/auth/logout/'),
  
  getProfile: () => API.get('/auth/profile/'),
  
  updateProfile: (data: any) => API.put('/auth/profile/update/', data),
  
  changePassword: (data: {
    old_password: string;
    new_password: string;
    new_password_confirm: string;
  }) => API.post('/auth/change-password/', data),
  
  // Password reset functionality
  requestPasswordReset: (data: { email: string }) =>
    API.post('/auth/password-reset/request/', data),
  
  confirmPasswordReset: (data: {
    token: string;
    new_password: string;
    new_password_confirm: string;
  }) => API.post('/auth/password-reset/confirm/', data),
};

// Product API calls
export const productAPI = {
  getCategories: () => API.get('/categories/'),
  
  getSubcategories: (categorySlug?: string) => 
    categorySlug ? API.get(`/categories/${categorySlug}/subcategories/`) : API.get('/subcategories/'),
  
  getColors: () => API.get('/colors/'),
  
  getMaterials: () => API.get('/materials/'),
  
  getProducts: (params?: any) => API.get('/products/', { params }),
  
  getProduct: (slug: string) => API.get(`/products/${slug}/`),
  
  getProductDetail: (slug: string) => API.get(`/products/${slug}/`),
  
  getFeaturedProducts: () => API.get('/products/featured/'),
  
  getNewArrivals: () => API.get('/products/new-arrivals/'),
  
  searchProducts: (query: string, params?: any) => 
    API.get(`/products/search/?q=${encodeURIComponent(query)}`, { params }),
  
  advancedSearch: (params?: any) => API.get('/products/advanced-search/', { params }),
  
  getSearchSuggestions: (query: string) => 
    API.get(`/search/suggestions/?q=${encodeURIComponent(query)}`),
  
  getHomeData: () => API.get('/home-data/'),
  
  getProductReviews: (slug: string) => API.get(`/products/${slug}/reviews/`),
  
  addReview: (slug: string, reviewData: any) =>
    API.post(`/products/${slug}/reviews/`, reviewData),
  
  getProductRecommendations: (slug: string) => 
    API.get(`/products/${slug}/recommendations/`),
  
  getFilterOptions: (params?: any) => API.get('/filter-options/', { params }),
};

// Cart API calls
export const cartAPI = {
  getCart: () => API.get('/cart/'),
  
  addToCart: (data: { product_id: number; quantity: number; variant_id?: number }) =>
    API.post('/cart/add/', data),
  
  updateCartItem: (itemId: number, data: { quantity: number }) =>
    API.put(`/cart/items/${itemId}/`, data),
  
  removeFromCart: (itemId: number) =>
    API.delete(`/cart/items/${itemId}/remove/`),
  
  clearCart: () => API.delete('/cart/clear/'),
};

// Offers API calls
export const offersAPI = {
  getActiveOffers: () => API.get('/offers/'),
  
  createOffer: (data: any) =>
    API.post('/offers/create/', data),
};

// Wishlist API calls
export const wishlistAPI = {
  getWishlist: () => API.get('/wishlist/'),
  
  addToWishlist: (productId: number) =>
    API.post('/wishlist/', { product_id: productId }),
  
  removeFromWishlist: (itemId: number) =>
    API.delete(`/wishlist/${itemId}/`),
};

// Address API calls
export const addressAPI = {
  getAddresses: () => API.get('/addresses/'),
  
  addAddress: (data: any) => API.post('/addresses/', data),
  
  updateAddress: (id: number, data: any) => API.put(`/addresses/${id}/`, data),
  
  deleteAddress: (id: number) => API.delete(`/addresses/${id}/`),
};

// Order API calls
export const orderAPI = {
  getOrders: () => API.get('/orders/'),
  
  getOrder: (orderId: string) => API.get(`/orders/${orderId}/`),
  
  createOrder: (data: any) => API.post('/orders/create/', data),
  
  checkoutFromCart: (data: { shipping_address_id: number; order_notes?: string }) =>
    API.post('/orders/checkout/', data),
  
  cancelOrder: (orderId: string) => API.post(`/orders/${orderId}/cancel/`),
  
  createRazorpayOrder: (data: { amount: number; shipping_address_id: number }) =>
    API.post('/orders/razorpay/create-order/', data),
  
  verifyRazorpayPayment: (data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    shipping_address_id: number;
    payment_method?: string;
  }) => API.post('/orders/razorpay/verify-payment/', data),
  
  checkoutWithCOD: (data: { shipping_address_id: number; order_notes?: string }) =>
    API.post('/orders/checkout/cod/', data),
  
  completePayment: (data: {
    order_id: string;
    razorpay_order_id?: string;
    razorpay_payment_id?: string;
    razorpay_signature?: string;
    payment_method?: string;
  }) => API.post('/orders/complete-payment/', data),
};

export default API;