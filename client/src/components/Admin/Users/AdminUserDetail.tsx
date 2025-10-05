import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import adminAPI from '../../../services/adminApi';

interface UserDetails {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  is_staff: boolean;
  date_joined: string;
  last_login: string | null;
  phone_number?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipcode?: string;
    country?: string;
  };
  order_count?: number;
  total_spent?: number;
}

const AdminUserDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    is_active: false,
    is_staff: false,
    street: '',
    city: '',
    state: '',
    zipcode: '',
    country: '',
  });
  
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const response = await adminAPI.getUserDetails(parseInt(id));
        setUser(response.data);
        
        // Initialize form with user data
        setFormData({
          username: response.data.username || '',
          email: response.data.email || '',
          first_name: response.data.first_name || '',
          last_name: response.data.last_name || '',
          phone_number: response.data.phone_number || '',
          is_active: response.data.is_active,
          is_staff: response.data.is_staff,
          street: response.data.address?.street || '',
          city: response.data.address?.city || '',
          state: response.data.address?.state || '',
          zipcode: response.data.address?.zipcode || '',
          country: response.data.address?.country || '',
        });
        
        setError(null);
      } catch (err) {
        console.error('Error fetching user details:', err);
        setError('Failed to load user details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserDetails();
  }, [id]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };
  
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id) return;
    
    try {
      setSaving(true);
      
      // Prepare the data structure the API expects
      const updatedUserData = {
        username: formData.username,
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone_number: formData.phone_number,
        is_active: formData.is_active,
        is_staff: formData.is_staff,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipcode: formData.zipcode,
          country: formData.country,
        },
      };
      
      await adminAPI.updateUser(parseInt(id), updatedUserData);
      
      alert('User updated successfully');
      // Update the local state
      setUser({
        ...user!,
        ...updatedUserData,
      });
    } catch (err) {
      console.error('Error updating user:', err);
      setError('Failed to update user');
    } finally {
      setSaving(false);
    }
  };
  
  const handleResetPassword = async () => {
    if (!id || !window.confirm('Are you sure you want to reset the password for this user?')) {
      return;
    }
    
    try {
      await adminAPI.resetUserPassword(parseInt(id));
      alert('Password reset link has been sent to the user\'s email');
    } catch (err) {
      console.error('Error resetting password:', err);
      alert('Failed to initiate password reset');
    }
  };
  
  if (loading) {
    return (
      <div className="admin-loader">
        <div className="spinner"></div>
        <p>Loading user details...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="admin-error-container">
        <div className="admin-error-message">
          <span className="material-symbols-outlined">error</span>
          {error}
        </div>
        <button 
          className="admin-btn"
          onClick={() => navigate('/admin/users')}
        >
          Back to Users
        </button>
      </div>
    );
  }
  
  return (
    <div className="admin-user-detail">
      <div className="admin-header-actions">
        <div className="admin-header-with-back">
          <button 
            className="admin-back-button" 
            onClick={() => navigate('/admin/users')}
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h2>User Details</h2>
        </div>
        <div>
          <button 
            className="admin-btn secondary"
            onClick={handleResetPassword}
          >
            <span className="material-symbols-outlined">password</span>
            Reset Password
          </button>
          <button 
            className="admin-btn danger"
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this user?')) {
                adminAPI.deleteUser(parseInt(id!))
                  .then(() => {
                    alert('User deleted successfully');
                    navigate('/admin/users');
                  })
                  .catch(err => {
                    console.error('Error deleting user:', err);
                    alert('Failed to delete user');
                  });
              }
            }}
          >
            <span className="material-symbols-outlined">delete</span>
            Delete User
          </button>
        </div>
      </div>
      
      {user && (
        <div className="admin-content-grid">
          <div className="admin-content-main">
            <div className="admin-card">
              <h3>User Information</h3>
              <form onSubmit={handleSave} className="admin-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="first_name">First Name</label>
                    <input
                      type="text"
                      id="first_name"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="last_name">Last Name</label>
                    <input
                      type="text"
                      id="last_name"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="phone_number">Phone Number</label>
                    <input
                      type="text"
                      id="phone_number"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                
                <div className="form-row checkbox-row">
                  <div className="form-group checkbox">
                    <input
                      type="checkbox"
                      id="is_active"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleChange}
                    />
                    <label htmlFor="is_active">Active Account</label>
                  </div>
                  <div className="form-group checkbox">
                    <input
                      type="checkbox"
                      id="is_staff"
                      name="is_staff"
                      checked={formData.is_staff}
                      onChange={handleChange}
                    />
                    <label htmlFor="is_staff">Admin Access</label>
                  </div>
                </div>
                
                <h4>Address Information</h4>
                
                <div className="form-group">
                  <label htmlFor="street">Street Address</label>
                  <input
                    type="text"
                    id="street"
                    name="street"
                    value={formData.street}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="city">City</label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="state">State/Province</label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="zipcode">Zip/Postal Code</label>
                    <input
                      type="text"
                      id="zipcode"
                      name="zipcode"
                      value={formData.zipcode}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="country">Country</label>
                    <input
                      type="text"
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                
                <div className="form-actions">
                  <button 
                    type="submit"
                    className="admin-btn primary"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <span className="spinner-small"></span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined">save</span>
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
          
          <div className="admin-content-sidebar">
            <div className="admin-card">
              <h3>Account Details</h3>
              <div className="account-stats">
                <div className="stat-item">
                  <label>Member Since:</label>
                  <span>{new Date(user.date_joined).toLocaleDateString()}</span>
                </div>
                <div className="stat-item">
                  <label>Last Login:</label>
                  <span>{user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}</span>
                </div>
                <div className="stat-item">
                  <label>Orders:</label>
                  <span>{user.order_count || 0}</span>
                </div>
                <div className="stat-item">
                  <label>Total Spent:</label>
                  <span>${user.total_spent?.toFixed(2) || '0.00'}</span>
                </div>
              </div>
            </div>
            
            <div className="admin-card">
              <h3>Recent Activity</h3>
              <div className="activity-list">
                {/* This would be populated from the API */}
                <p className="empty-list">No recent activity</p>
              </div>
            </div>
            
            <div className="admin-card">
              <h3>Quick Actions</h3>
              <div className="quick-actions">
                <button className="admin-btn secondary block">
                  <span className="material-symbols-outlined">shopping_cart</span>
                  View User Orders
                </button>
                <button className="admin-btn secondary block">
                  <span className="material-symbols-outlined">shopping_basket</span>
                  View Cart
                </button>
                <button className="admin-btn secondary block">
                  <span className="material-symbols-outlined">email</span>
                  Send Email
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserDetail;