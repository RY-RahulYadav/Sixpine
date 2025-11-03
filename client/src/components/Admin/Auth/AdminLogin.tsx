import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../../context/AppContext';
import API from '../../../services/api';

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
    <div className="admin-login-container">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <h2>Admin Login</h2>
          <p>Sign in to access the admin dashboard</p>
        </div>
        
        <form onSubmit={handleSubmit} className="admin-login-form">
          {error && (
            <div className="admin-error-message">
              <span className="material-symbols-outlined">error</span>
              {error}
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <div className="input-with-icon">
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                disabled={loading}
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-with-icon">
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={loading}
              />
            </div>
          </div>
          
          <button type="submit" className="admin-login-button" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-small"></span>
                Signing in...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined">login</span>
                Sign In
              </>
            )}
          </button>
        </form>
        
        <div className="admin-login-footer">
          <a href="/" className="back-to-store">
            <span className="material-symbols-outlined">arrow_back</span>
            Back to Store
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;