import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const RegisterPage: React.FC = () => {
  const [step, setStep] = useState<'register' | 'verify'>('register');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    password_confirm: ''
  });
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(0);

  // Timer effect for resend OTP
  React.useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (formData.password !== formData.password_confirm) {
      setError("Passwords don't match");
      setLoading(false);
      return;
    }

    try {
      const response = await authAPI.requestOTP(formData);
      setSuccess(response.data.message);
      setStep('verify');
      setResendTimer(60); // 60 seconds cooldown for resend
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.username?.[0] ||
                          error.response?.data?.email?.[0] ||
                          error.response?.data?.password?.[0] ||
                          'Failed to send OTP. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      setLoading(false);
      return;
    }

    try {
      const response = await authAPI.verifyOTP({
        email: formData.email,
        otp: otp
      });
      
      // Store token and user data
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Show success message
      setSuccess('Registration successful! Redirecting...');
      
      // Wait a moment for user to see success message, then force refresh home page
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Invalid OTP. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;
    
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await authAPI.resendOTP({ email: formData.email });
      setSuccess(response.data.message);
      setResendTimer(60);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to resend OTP';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToRegister = () => {
    setStep('register');
    setOtp('');
    setError(null);
    setSuccess(null);
  };

  return (
    <>
      <Navbar />
      <div className="auth-page">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-8 col-lg-6">
              <div className="auth-card">
                <div className="auth-card-header">
                  <h2>{step === 'register' ? 'Create Your Account' : 'Verify Your Email'}</h2>
                  <p>{step === 'register' ? 'Join Sixpine today and start shopping!' : 'Enter the code we sent to your email'}</p>
                </div>
                
                <div className="auth-card-body">
                  {error && (
                    <div className="auth-alert auth-alert-error" role="alert">
                      <i className="bi bi-exclamation-circle me-2"></i>
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="auth-alert auth-alert-success" role="alert">
                      <i className="bi bi-check-circle me-2"></i>
                      {success}
                    </div>
                  )}

                  {step === 'register' ? (
                    <form onSubmit={handleRequestOTP}>
                      <div className="row auth-row">
                        <div className="col-md-6 auth-col">
                          <div className="auth-form-group">
                            <label htmlFor="first_name" className="auth-form-label">
                              <i className="bi bi-person me-2"></i>First Name
                            </label>
                            <input
                              type="text"
                              className="auth-form-control"
                              id="first_name"
                              name="first_name"
                              placeholder="John"
                              value={formData.first_name}
                              onChange={handleChange}
                              required
                            />
                          </div>
                        </div>

                        <div className="col-md-6 auth-col">
                          <div className="auth-form-group">
                            <label htmlFor="last_name" className="auth-form-label">
                              <i className="bi bi-person me-2"></i>Last Name
                            </label>
                            <input
                              type="text"
                              className="auth-form-control"
                              id="last_name"
                              name="last_name"
                              placeholder="Doe"
                              value={formData.last_name}
                              onChange={handleChange}
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <div className="auth-form-group">
                        <label htmlFor="username" className="auth-form-label">
                          <i className="bi bi-at me-2"></i>Username
                        </label>
                        <input
                          type="text"
                          className="auth-form-control"
                          id="username"
                          name="username"
                          placeholder="johndoe"
                          value={formData.username}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className="auth-form-group">
                        <label htmlFor="email" className="auth-form-label">
                          <i className="bi bi-envelope me-2"></i>Email Address
                        </label>
                        <input
                          type="email"
                          className="auth-form-control"
                          id="email"
                          name="email"
                          placeholder="john@example.com"
                          value={formData.email}
                          onChange={handleChange}
                          required
                        />
                        <div className="auth-form-text">
                          <i className="bi bi-info-circle me-1"></i>
                          We'll send a verification code to this email
                        </div>
                      </div>

                      <div className="auth-form-group">
                        <label htmlFor="password" className="auth-form-label">
                          <i className="bi bi-shield-lock me-2"></i>Password
                        </label>
                        <input
                          type="password"
                          className="auth-form-control"
                          id="password"
                          name="password"
                          placeholder="••••••••"
                          value={formData.password}
                          onChange={handleChange}
                          minLength={8}
                          required
                        />
                        <div className="auth-form-text">
                          <i className="bi bi-info-circle me-1"></i>
                          Must be at least 8 characters long
                        </div>
                      </div>

                      <div className="auth-form-group">
                        <label htmlFor="password_confirm" className="auth-form-label">
                          <i className="bi bi-shield-check me-2"></i>Confirm Password
                        </label>
                        <input
                          type="password"
                          className="auth-form-control"
                          id="password_confirm"
                          name="password_confirm"
                          placeholder="••••••••"
                          value={formData.password_confirm}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        className="auth-submit-btn"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Sending OTP...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-arrow-right-circle me-2"></i>
                            Continue
                          </>
                        )}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifyOTP}>
                      <div className="text-center mb-4">
                        <div className="otp-icon">
                          <i className="bi bi-envelope-check"></i>
                        </div>
                        <p style={{ color: '#666', fontSize: '15px' }}>
                          We've sent a 6-digit verification code to<br />
                          <strong style={{ color: '#333', fontSize: '16px' }}>{formData.email}</strong>
                        </p>
                      </div>

                      <div className="auth-form-group">
                        <label htmlFor="otp" className="auth-form-label text-center w-100">
                          Enter Verification Code
                        </label>
                        <input
                          type="text"
                          className="auth-form-control otp-input"
                          id="otp"
                          name="otp"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          maxLength={6}
                          placeholder="000000"
                          required
                        />
                        <div className="auth-form-text text-center otp-timer">
                          <i className="bi bi-clock me-1"></i>
                          Code expires in 10 minutes
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="auth-submit-btn"
                        disabled={loading || otp.length !== 6}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Verifying...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-check-circle me-2"></i>
                            Verify & Create Account
                          </>
                        )}
                      </button>

                      <div className="text-center my-3">
                        {resendTimer > 0 ? (
                          <p className="otp-timer mb-0">
                            <i className="bi bi-hourglass-split me-1"></i>
                            Resend code in <strong>{resendTimer}s</strong>
                          </p>
                        ) : (
                          <button
                            type="button"
                            className="resend-btn"
                            onClick={handleResendOTP}
                            disabled={loading}
                          >
                            <i className="bi bi-arrow-clockwise me-2"></i>
                            Resend Code
                          </button>
                        )}
                      </div>

                      <button
                        type="button"
                        className="back-btn"
                        onClick={handleBackToRegister}
                        disabled={loading}
                      >
                        <i className="bi bi-arrow-left me-2"></i>
                        Change Email
                      </button>
                    </form>
                  )}

                  <div className="auth-footer-text">
                    Already have an account? <Link to="/login">Login here</Link>
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

export default RegisterPage;