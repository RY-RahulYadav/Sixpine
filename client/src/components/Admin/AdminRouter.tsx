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
import AdminColors from './Colors/AdminColors';
import AdminMaterials from './Materials/AdminMaterials';
import AdminCoupons from './Coupons/AdminCoupons';
import AdminFilterOptions from './FilterOptions/AdminFilterOptions';
import AdminPaymentCharges from './PaymentCharges/AdminPaymentCharges';
import AdminSettings from './Settings/AdminSettings';
import BrandAnalytics from './Analytics/BrandAnalytics';
import AdminContactQueries from './ContactQueries/AdminContactQueries';
import AdminBulkOrders from './BulkOrders/AdminBulkOrders';
import AdminLogs from './Logs/AdminLogs';

const AdminRouter = () => {
  const { state } = useApp();
  const location = useLocation();
  
  // Check if user is authenticated and is admin
  const isAdmin = state.isAuthenticated && state.user?.is_staff === true;
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
        <Route path="analytics" element={<BrandAnalytics />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="categories/:id" element={<AdminCategoryDetail />} />
        <Route path="colors" element={<AdminColors />} />
        <Route path="materials" element={<AdminMaterials />} />
        <Route path="coupons" element={<AdminCoupons />} />
        <Route path="filter-options" element={<AdminFilterOptions />} />
        <Route path="payment-charges" element={<AdminPaymentCharges />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="contact-queries" element={<AdminContactQueries />} />
        <Route path="bulk-orders" element={<AdminBulkOrders />} />
        <Route path="logs" element={<AdminLogs />} />
      </Route>
    </Routes>
  );
};

export default AdminRouter;