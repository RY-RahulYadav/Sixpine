import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

// Admin Components
import AdminDashboard from './Dashboard/AdminDashboard';
import AdminLogin from './Auth/AdminLogin';
import AdminLayout from './Layout/AdminLayout';
import AdminProducts from './Products/AdminProducts';
import AdminProductDetail from './Products/AdminProductDetail';
import AdminOrders from './Orders/AdminOrders';
import AdminOrderDetail from './Orders/AdminOrderDetail';
import AdminUsers from './Users/AdminUsers';
import AdminUserDetail from './Users/AdminUserDetail';
import AdminCategories from './Categories/AdminCategories';
import AdminCategoryDetail from './Categories/AdminCategoryDetail';
import AdminSettings from './Settings/AdminSettings';

const AdminRouter = () => {
  const { state } = useApp();
  const location = useLocation();
  
  // Check if user is authenticated and is admin
  const isAdmin = state.isAuthenticated && state.user?.is_staff;
  const isInitializing = state.loading;
  
  // Wait for initial authentication check to complete
  if (isInitializing) {
    return (
      <div className="admin-loader">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }
  
  // If not admin and trying to access admin routes, redirect to admin login
  if (!isAdmin && location.pathname !== '/admin/login') {
    return <Navigate to="/admin/login" replace />;
  }
  
  // If admin and trying to access login, redirect to dashboard
  if (isAdmin && location.pathname === '/admin/login') {
    return <Navigate to="/admin" replace />;
  }

  return (
    <Routes>
      <Route path="login" element={<AdminLogin />} />
      <Route element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="products/:id" element={<AdminProductDetail />} />
        <Route path="products/new" element={<AdminProductDetail />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="orders/:id" element={<AdminOrderDetail />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="users/:id" element={<AdminUserDetail />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="categories/:id" element={<AdminCategoryDetail />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>
    </Routes>
  );
};

export default AdminRouter;