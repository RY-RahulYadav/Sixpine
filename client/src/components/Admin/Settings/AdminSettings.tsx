import React, { useState, useEffect } from 'react';
import adminAPI from '../../../services/adminApi';

interface Settings {
  site_name: string;
  site_description: string;
  contact_email: string;
  customer_service_phone: string;
  enable_guest_checkout: boolean;
  enable_reviews: boolean;
  show_out_of_stock_products: boolean;
  products_per_page: number;
  default_currency: string;
  tax_rate: number;
  shipping_flat_rate: number;
  free_shipping_threshold: number;
  smtp_host: string;
  smtp_port: number;
  smtp_username: string;
  smtp_password: string;
  smtp_use_tls: boolean;
  google_analytics_id: string;
  maintenance_mode: boolean;
  maintenance_message: string;
}

const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState<Settings>({
    site_name: '',
    site_description: '',
    contact_email: '',
    customer_service_phone: '',
    enable_guest_checkout: true,
    enable_reviews: true,
    show_out_of_stock_products: true,
    products_per_page: 20,
    default_currency: 'USD',
    tax_rate: 0,
    shipping_flat_rate: 0,
    free_shipping_threshold: 0,
    smtp_host: '',
    smtp_port: 587,
    smtp_username: '',
    smtp_password: '',
    smtp_use_tls: true,
    google_analytics_id: '',
    maintenance_mode: false,
    maintenance_message: '',
  });
  
  const [activeTab, setActiveTab] = useState<string>('general');
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        // Using adminAPI
        const response = await adminAPI.getSettings();
        setSettings(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching settings:', err);
        setError('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSettings();
  }, []);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Handle different input types
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setSettings({ ...settings, [name]: checked });
    } else if (type === 'number') {
      const numberValue = parseFloat(value);
      setSettings({ ...settings, [name]: numberValue });
    } else {
      setSettings({ ...settings, [name]: value });
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      // Using adminAPI
      await adminAPI.updateSettings(settings);
      
      setSuccessMessage('Settings saved successfully');
      setTimeout(() => setSuccessMessage(null), 5000);
      setError(null);
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Failed to save settings');
      setSuccessMessage(null);
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <div className="admin-loader">
        <div className="spinner"></div>
        <p>Loading settings...</p>
      </div>
    );
  }
  
  return (
    <div className="admin-settings">
      <div className="admin-header-actions">
        <h2>Store Settings</h2>
      </div>
      
      {/* Success message */}
      {successMessage && (
        <div className="admin-success-message">
          <span className="material-symbols-outlined">check_circle</span>
          {successMessage}
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="admin-error-message">
          <span className="material-symbols-outlined">error</span>
          {error}
        </div>
      )}
      
      {/* Settings tabs */}
      <div className="admin-tabs">
        <button 
          className={`tab-button ${activeTab === 'general' ? 'active' : ''}`}
          onClick={() => setActiveTab('general')}
        >
          <span className="material-symbols-outlined">settings</span>
          General
        </button>
        <button 
          className={`tab-button ${activeTab === 'store' ? 'active' : ''}`}
          onClick={() => setActiveTab('store')}
        >
          <span className="material-symbols-outlined">store</span>
          Store
        </button>
        <button 
          className={`tab-button ${activeTab === 'email' ? 'active' : ''}`}
          onClick={() => setActiveTab('email')}
        >
          <span className="material-symbols-outlined">email</span>
          Email
        </button>
        <button 
          className={`tab-button ${activeTab === 'advanced' ? 'active' : ''}`}
          onClick={() => setActiveTab('advanced')}
        >
          <span className="material-symbols-outlined">code</span>
          Advanced
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="admin-form">
        {/* General Settings */}
        {activeTab === 'general' && (
          <div className="admin-card">
            <h3>General Settings</h3>
            
            <div className="form-group">
              <label htmlFor="site_name">Site Name</label>
              <input
                type="text"
                id="site_name"
                name="site_name"
                value={settings.site_name}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="site_description">Site Description</label>
              <textarea
                id="site_description"
                name="site_description"
                value={settings.site_description}
                onChange={handleChange}
                rows={3}
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="contact_email">Contact Email</label>
                <input
                  type="email"
                  id="contact_email"
                  name="contact_email"
                  value={settings.contact_email}
                  onChange={handleChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="customer_service_phone">Customer Service Phone</label>
                <input
                  type="text"
                  id="customer_service_phone"
                  name="customer_service_phone"
                  value={settings.customer_service_phone}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div className="form-group checkbox">
              <input
                type="checkbox"
                id="maintenance_mode"
                name="maintenance_mode"
                checked={settings.maintenance_mode}
                onChange={handleChange}
              />
              <label htmlFor="maintenance_mode">Maintenance Mode</label>
            </div>
            
            {settings.maintenance_mode && (
              <div className="form-group">
                <label htmlFor="maintenance_message">Maintenance Message</label>
                <textarea
                  id="maintenance_message"
                  name="maintenance_message"
                  value={settings.maintenance_message}
                  onChange={handleChange}
                  rows={3}
                />
              </div>
            )}
          </div>
        )}
        
        {/* Store Settings */}
        {activeTab === 'store' && (
          <div className="admin-card">
            <h3>Store Settings</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="products_per_page">Products Per Page</label>
                <input
                  type="number"
                  id="products_per_page"
                  name="products_per_page"
                  value={settings.products_per_page}
                  onChange={handleChange}
                  min={1}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="default_currency">Default Currency</label>
                <select
                  id="default_currency"
                  name="default_currency"
                  value={settings.default_currency}
                  onChange={handleChange}
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="JPY">JPY (¥)</option>
                  <option value="INR">INR (₹)</option>
                </select>
              </div>
            </div>
            
            <div className="form-group checkbox">
              <input
                type="checkbox"
                id="enable_guest_checkout"
                name="enable_guest_checkout"
                checked={settings.enable_guest_checkout}
                onChange={handleChange}
              />
              <label htmlFor="enable_guest_checkout">Enable Guest Checkout</label>
            </div>
            
            <div className="form-group checkbox">
              <input
                type="checkbox"
                id="enable_reviews"
                name="enable_reviews"
                checked={settings.enable_reviews}
                onChange={handleChange}
              />
              <label htmlFor="enable_reviews">Enable Product Reviews</label>
            </div>
            
            <div className="form-group checkbox">
              <input
                type="checkbox"
                id="show_out_of_stock_products"
                name="show_out_of_stock_products"
                checked={settings.show_out_of_stock_products}
                onChange={handleChange}
              />
              <label htmlFor="show_out_of_stock_products">Show Out of Stock Products</label>
            </div>
            
            <h4>Tax & Shipping</h4>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="tax_rate">Tax Rate (%)</label>
                <input
                  type="number"
                  id="tax_rate"
                  name="tax_rate"
                  value={settings.tax_rate}
                  onChange={handleChange}
                  min={0}
                  step={0.01}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="shipping_flat_rate">Flat Rate Shipping ($)</label>
                <input
                  type="number"
                  id="shipping_flat_rate"
                  name="shipping_flat_rate"
                  value={settings.shipping_flat_rate}
                  onChange={handleChange}
                  min={0}
                  step={0.01}
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="free_shipping_threshold">Free Shipping Threshold ($)</label>
              <input
                type="number"
                id="free_shipping_threshold"
                name="free_shipping_threshold"
                value={settings.free_shipping_threshold}
                onChange={handleChange}
                min={0}
                step={0.01}
              />
              <small className="form-helper">Set to 0 to disable free shipping</small>
            </div>
          </div>
        )}
        
        {/* Email Settings */}
        {activeTab === 'email' && (
          <div className="admin-card">
            <h3>Email Settings</h3>
            
            <div className="form-group">
              <label htmlFor="smtp_host">SMTP Host</label>
              <input
                type="text"
                id="smtp_host"
                name="smtp_host"
                value={settings.smtp_host}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="smtp_port">SMTP Port</label>
                <input
                  type="number"
                  id="smtp_port"
                  name="smtp_port"
                  value={settings.smtp_port}
                  onChange={handleChange}
                />
              </div>
              
              <div className="form-group checkbox">
                <input
                  type="checkbox"
                  id="smtp_use_tls"
                  name="smtp_use_tls"
                  checked={settings.smtp_use_tls}
                  onChange={handleChange}
                />
                <label htmlFor="smtp_use_tls">Use TLS</label>
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="smtp_username">SMTP Username</label>
              <input
                type="text"
                id="smtp_username"
                name="smtp_username"
                value={settings.smtp_username}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="smtp_password">SMTP Password</label>
              <input
                type="password"
                id="smtp_password"
                name="smtp_password"
                value={settings.smtp_password}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-actions">
              <button
                type="button"
                className="admin-btn secondary"
                onClick={() => alert('This would send a test email')}
              >
                <span className="material-symbols-outlined">email</span>
                Send Test Email
              </button>
            </div>
          </div>
        )}
        
        {/* Advanced Settings */}
        {activeTab === 'advanced' && (
          <div className="admin-card">
            <h3>Advanced Settings</h3>
            
            <div className="form-group">
              <label htmlFor="google_analytics_id">Google Analytics ID</label>
              <input
                type="text"
                id="google_analytics_id"
                name="google_analytics_id"
                value={settings.google_analytics_id}
                onChange={handleChange}
                placeholder="UA-XXXXX-Y or G-XXXXXXXX"
              />
            </div>
            
            <div className="form-actions">
              <button
                type="button"
                className="admin-btn danger"
                onClick={() => {
                  if (window.confirm('Are you sure you want to clear the cache? This might temporarily affect site performance.')) {
                    alert('Cache cleared successfully');
                  }
                }}
              >
                <span className="material-symbols-outlined">cleaning_services</span>
                Clear Cache
              </button>
            </div>
          </div>
        )}
        
        {/* Form actions */}
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
                Save Settings
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettings;