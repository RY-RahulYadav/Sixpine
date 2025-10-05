import API from './api';

// Admin API calls
export const adminAPI = {
  // Dashboard
  getDashboardStats: () => API.get('/admin/dashboard/stats/'),
  
  // Users
  getUsers: (params?: any) => API.get('/admin/users/', { params }),
  getUser: (id: number) => API.get(`/admin/users/${id}/`),
  getUserDetails: (id: number) => API.get(`/admin/users/${id}/details/`),
  createUser: (userData: any) => API.post('/admin/users/', userData),
  updateUser: (id: number, userData: any) => API.put(`/admin/users/${id}/`, userData),
  deleteUser: (id: number) => API.delete(`/admin/users/${id}/`),
  toggleUserActive: (id: number) => API.post(`/admin/users/${id}/toggle_active/`),
  toggleUserStaff: (id: number) => API.post(`/admin/users/${id}/toggle_staff/`),
  resetUserPassword: (id: number) => 
    API.post(`/admin/users/${id}/reset_password/`),
  
  // Products
  getProducts: (params?: any) => API.get('/admin/products/', { params }),
  getProduct: (id: number) => API.get(`/admin/products/${id}/`),
  createProduct: (productData: any) => API.post('/admin/products/', productData),
  updateProduct: (id: number, productData: any) => API.put(`/admin/products/${id}/`, productData),
  deleteProduct: (id: number) => API.delete(`/admin/products/${id}/`),
  toggleProductActive: (id: number) => API.post(`/admin/products/${id}/toggle_active/`),
  toggleProductFeatured: (id: number) => API.post(`/admin/products/${id}/toggle_featured/`),
  updateProductStock: (id: number, quantity: number) => 
    API.post(`/admin/products/${id}/update_stock/`, { quantity }),
  
  // Orders
  getOrders: (params?: any) => API.get('/admin/orders/', { params }),
  getOrder: (id: number) => API.get(`/admin/orders/${id}/`),
  updateOrderStatus: (id: number, status: string, notes?: string) => 
    API.post(`/admin/orders/${id}/update_status/`, { status, notes }),
  updatePaymentStatus: (id: number, payment_status: string, notes?: string) => 
    API.post(`/admin/orders/${id}/update_payment_status/`, { payment_status, notes }),
  updateOrderTracking: (id: number, tracking_number: string, estimated_delivery?: string, notes?: string) => 
    API.post(`/admin/orders/${id}/update_tracking/`, { tracking_number, estimated_delivery, notes }),
  getOrderNotes: (id: number) => API.get(`/admin/orders/${id}/notes/`),
  addOrderNote: (id: number, note: string) => API.post(`/admin/orders/${id}/add_note/`, { note }),
  
  // Categories
  getCategories: (params?: any) => API.get('/admin/categories/', { params }),
  getCategoriesHierarchical: () => API.get('/admin/categories/hierarchical/'),
  getCategory: (id: number) => API.get(`/admin/categories/${id}/`),
  createCategory: (categoryData: any) => API.post('/admin/categories/', categoryData),
  updateCategory: (id: number, categoryData: any) => API.put(`/admin/categories/${id}/`, categoryData),
  deleteCategory: (id: number) => API.delete(`/admin/categories/${id}/`),
  
  // Admin logs
  getLogs: (params?: any) => API.get('/admin/logs/', { params }),
  
  // Settings
  getSettings: () => API.get('/admin/settings/'),
  updateSettings: (settingsData: any) => API.put('/admin/settings/', settingsData),
};

export default adminAPI;