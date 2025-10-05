import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, state } = useApp();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

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
      <div className="auth-page">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-6 col-lg-5">
              <div className="auth-card">
                <div className="auth-card-header">
                  <h2>Welcome Back!</h2>
                  <p>Login to your Sixpine account</p>
                </div>
                
                <div className="auth-card-body">
                  {state.error && (
                    <div className="auth-alert auth-alert-error" role="alert">
                      <i className="bi bi-exclamation-circle me-2"></i>
                      {state.error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit}>
                    <div className="auth-form-group">
                      <label htmlFor="username" className="auth-form-label">
                        <i className="bi bi-person me-2"></i>Username or Email
                      </label>
                      <input
                        type="text"
                        className="auth-form-control"
                        id="username"
                        name="username"
                        placeholder="Enter your username or email"
                        value={formData.username}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="auth-form-group">
                      <label htmlFor="password" className="auth-form-label">
                        <i className="bi bi-lock me-2"></i>Password
                      </label>
                      <input
                        type="password"
                        className="auth-form-control"
                        id="password"
                        name="password"
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="auth-submit-btn"
                      disabled={state.loading}
                    >
                      {state.loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Logging in...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-box-arrow-in-right me-2"></i>
                          Login
                        </>
                      )}
                    </button>
                  </form>

                  <div className="auth-footer-text">
                    Don't have an account? <Link to="/register">Register here</Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="footer-wrapper">
        <Footer />
      </div>
    </>
  );
};

export default LoginPage;