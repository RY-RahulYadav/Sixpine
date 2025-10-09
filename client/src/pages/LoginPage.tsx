import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import '../styles/auth.css';
import Navbar from '../components/Navbar';
import SubNav from '../components/SubNav';
import Footer from '../components/Footer';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, state } = useApp();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(formData);
      navigate('/');
    } catch (error) {
      // Error is handled in context
    }
  };

  return (
    <>
    <Navbar />
     <div className="page-content">
        <SubNav />
        </div>
    <div className="sixpine-auth-page">
      <div className="sixpine-auth-container">
        <div className="sixpine-auth-card">
          {/* Header with brand name */}
          <div className="sixpine-brand">
            <h1>Sixpine</h1>
          </div>
          
          {/* Toggle buttons */}
          <div className="sixpine-toggle-buttons">
            <button className="sixpine-toggle-btn active">Sign in</button>
            <Link to="/register" className="sixpine-toggle-btn">Create account</Link>
          </div>

          {/* Error message */}
          {state.error && (
            <div className="sixpine-error-message">
              {state.error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="sixpine-form">
            <div className="sixpine-form-group">
              <label>Email or Mobile</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="abc@gmail.com"
                required
              />
            </div>

            <div className="sixpine-form-group">
              <div className="sixpine-password-header">
                <label>Password</label>
                <Link to="/forgot-password" className="sixpine-forgot-link">Forget Password?</Link>
              </div>
              <div className="sixpine-password-input">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••"
                  required
                />
                <button
                  type="button"
                  className="sixpine-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div className="sixpine-checkbox-group">
              <label className="sixpine-checkbox-label">
                <input
                  type="checkbox"
                  checked={keepSignedIn}
                  onChange={(e) => setKeepSignedIn(e.target.checked)}
                />
                <span className="sixpine-checkbox-custom"></span>
                Keep me signed in
              </label>
            </div>

            <button
              type="submit"
              className="sixpine-submit-btn"
              disabled={state.loading}
            >
              {state.loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          {/* Footer links */}
          <div className="sixpine-footer-links">
            <Link to="/privacy">Privacy</Link>
            <span>•</span>
            <Link to="/terms">Terms</Link>
            <span>•</span>
            <Link to="/help">Help</Link>
          </div>
        </div>
      </div>
    </div>
    <Footer/>
    </>
  );
};

export default LoginPage;