import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import ProductDetailPage from './pages/ProductDetailPage';
import ProductListPage from './pages/ProductListPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import ProfilePage from './pages/ProfilePage';
import AdminRouter from './components/Admin/AdminRouter';
import './App.css';
import './styles/admin.css';
import './styles/auth.css';
import NewProductDetails from './pages/newproductdetails';

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="app-wrapper">
          <Routes>
            {/* Public routes - accessible without login */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/products" element={<ProductListPage />} />
            <Route path="/product/:slug" element={<ProductDetailPage />} />
            <Route path="/products-details" element={<NewProductDetails />} />

            {/* Protected routes - require authentication */}
            <Route path="/cart" element={
              <ProtectedRoute>
                <CartPage />
              </ProtectedRoute>
            } />
            <Route path="/checkout" element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            } />
            <Route path="/orders" element={
              <ProtectedRoute>
                <OrdersPage />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
            
            {/* Admin routes */}
            <Route path="/admin/*" element={<AdminRouter />} />
          </Routes>
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;
