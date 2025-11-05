import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../../context/AppContext';
import API from '../../../services/api';
import '../../../styles/auth.css';

const AdminLogin: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { dispatch } = useApp();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('Attempting admin login with username:', username);
      
      // Use admin-specific login endpoint
      const response = await API.post('/admin/auth/login/', { username, password });
      
      console.log('Admin login response:', response.data);
      
      // Store authentication data
      const { token, user } = response.data;
      
      // Verify user has admin privileges
      if (!user.is_staff) {
        setError('Access denied. Admin privileges required.');
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        return;
      }
      
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Update app context
      dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } });
      
      // Navigate to admin dashboard
      navigate('/admin', { replace: true });
      
    } catch (err: any) {
      console.error('Admin login error:', err);
      console.error('Error response:', err.response);
      
      const errorMessage = err.response?.data?.error || 'Login failed. Please verify your credentials.';
      setError(errorMessage);
      
      // Clear any partial auth data
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="sixpine-auth-page">
      <div className="sixpine-auth-container">
        <div className="sixpine-auth-card">
          {/* Header with brand name */}
          <div className="sixpine-brand">
            <h1>Admin Portal</h1>
          </div>
          
          {/* Error message */}
          {error && (
            <div className="sixpine-error-message">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="sixpine-form">
            <div className="sixpine-form-group">
              <label>Email or Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="abc@gmail.com"
                disabled={loading}
                autoComplete="username"
                required
              />
            </div>

            <div className="sixpine-form-group">
              <label>Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                disabled={loading}
                autoComplete="current-password"
                required
              />
            </div>

            <button
              type="submit"
              className="sixpine-submit-btn"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          {/* Footer links */}
          <div className="sixpine-footer-links">
            <a href="/">Back to Store</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;