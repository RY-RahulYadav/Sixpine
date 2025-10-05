import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { addressAPI } from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

interface Address {
  id?: number;
  type: string;
  full_name: string;
  phone: string;
  street_address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { state, logout } = useApp();
  const [activeTab, setActiveTab] = useState('profile');
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [loading, setLoading] = useState(false);

  const [addressForm, setAddressForm] = useState<Address>({
    type: 'home',
    full_name: '',
    phone: '',
    street_address: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'India',
    is_default: false,
  });

  useEffect(() => {
    if (!state.isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (activeTab === 'addresses') {
      fetchAddresses();
    }
  }, [state.isAuthenticated, activeTab]);

  const fetchAddresses = async () => {
    try {
      const response = await addressAPI.getAddresses();
      setAddresses(response.data);
    } catch (error) {
      console.error('Fetch addresses error:', error);
    }
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingAddress) {
        await addressAPI.updateAddress(editingAddress.id!, addressForm);
      } else {
        await addressAPI.addAddress(addressForm);
      }
      
      await fetchAddresses();
      setShowAddressForm(false);
      setEditingAddress(null);
      resetAddressForm();
    } catch (error: any) {
      console.error('Address submit error:', error);
      alert(error.response?.data?.error || 'Failed to save address');
    } finally {
      setLoading(false);
    }
  };

  const editAddress = (address: Address) => {
    setAddressForm(address);
    setEditingAddress(address);
    setShowAddressForm(true);
  };

  const deleteAddress = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        await addressAPI.deleteAddress(id);
        await fetchAddresses();
      } catch (error) {
        console.error('Delete address error:', error);
      }
    }
  };

  const resetAddressForm = () => {
    setAddressForm({
      type: 'home',
      full_name: '',
      phone: '',
      street_address: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'India',
      is_default: false,
    });
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/');
    }
  };

  return (
    <>
      <Navbar />
      <div className="page-content">
        <div className="container my-5">
        <div className="row">
          <div className="col-md-3">
            <div className="card">
              <div className="card-body">
                <div className="text-center mb-3">
                  <h5>{state.user?.first_name} {state.user?.last_name}</h5>
                  <small className="text-muted">{state.user?.email}</small>
                </div>
                <nav className="nav flex-column">
                  <button
                    className={`nav-link text-start ${activeTab === 'profile' ? 'active' : ''}`}
                    onClick={() => setActiveTab('profile')}
                  >
                    <i className="bi bi-person me-2"></i>Profile
                  </button>
                  <button
                    className={`nav-link text-start ${activeTab === 'orders' ? 'active' : ''}`}
                    onClick={() => navigate('/orders')}
                  >
                    <i className="bi bi-box me-2"></i>Orders
                  </button>
                  <hr />
                  <button
                    className="nav-link text-start text-danger"
                    onClick={handleLogout}
                  >
                    <i className="bi bi-box-arrow-right me-2"></i>Logout
                  </button>
                </nav>
              </div>
            </div>
          </div>

          <div className="col-md-9">
            {activeTab === 'profile' && (
              <div className="card">
                <div className="card-header">
                  <h5 className="mb-0">Profile Information</h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">First Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={state.user?.first_name || ''}
                        readOnly
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Last Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={state.user?.last_name || ''}
                        readOnly
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Username</label>
                      <input
                        type="text"
                        className="form-control"
                        value={state.user?.username || ''}
                        readOnly
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        value={state.user?.email || ''}
                        readOnly
                      />
                    </div>
                  </div>
                  <small className="text-muted">
                    Contact support to update your profile information.
                  </small>
                </div>
              </div>
            )}

            {activeTab === 'addresses' && (
              <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Shipping Addresses</h5>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      resetAddressForm();
                      setShowAddressForm(true);
                      setEditingAddress(null);
                    }}
                  >
                    Add New Address
                  </button>
                </div>
                <div className="card-body">
                  {showAddressForm && (
                    <div className="mb-4 p-3 border rounded">
                      <h6>{editingAddress ? 'Edit Address' : 'Add New Address'}</h6>
                      <form onSubmit={handleAddressSubmit}>
                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label className="form-label">Full Name</label>
                            <input
                              type="text"
                              className="form-control"
                              value={addressForm.full_name}
                              onChange={(e) => setAddressForm({...addressForm, full_name: e.target.value})}
                              required
                            />
                          </div>
                          <div className="col-md-6 mb-3">
                            <label className="form-label">Phone</label>
                            <input
                              type="tel"
                              className="form-control"
                              value={addressForm.phone}
                              onChange={(e) => setAddressForm({...addressForm, phone: e.target.value})}
                              required
                            />
                          </div>
                          <div className="col-12 mb-3">
                            <label className="form-label">Street Address</label>
                            <textarea
                              className="form-control"
                              rows={2}
                              value={addressForm.street_address}
                              onChange={(e) => setAddressForm({...addressForm, street_address: e.target.value})}
                              required
                            />
                          </div>
                          <div className="col-md-4 mb-3">
                            <label className="form-label">City</label>
                            <input
                              type="text"
                              className="form-control"
                              value={addressForm.city}
                              onChange={(e) => setAddressForm({...addressForm, city: e.target.value})}
                              required
                            />
                          </div>
                          <div className="col-md-4 mb-3">
                            <label className="form-label">State</label>
                            <input
                              type="text"
                              className="form-control"
                              value={addressForm.state}
                              onChange={(e) => setAddressForm({...addressForm, state: e.target.value})}
                              required
                            />
                          </div>
                          <div className="col-md-4 mb-3">
                            <label className="form-label">Postal Code</label>
                            <input
                              type="text"
                              className="form-control"
                              value={addressForm.postal_code}
                              onChange={(e) => setAddressForm({...addressForm, postal_code: e.target.value})}
                              required
                            />
                          </div>
                          <div className="col-md-6 mb-3">
                            <label className="form-label">Address Type</label>
                            <select
                              className="form-select"
                              value={addressForm.type}
                              onChange={(e) => setAddressForm({...addressForm, type: e.target.value})}
                            >
                              <option value="home">Home</option>
                              <option value="work">Work</option>
                              <option value="other">Other</option>
                            </select>
                          </div>
                          <div className="col-md-6 mb-3 d-flex align-items-end">
                            <div className="form-check">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id="isDefault"
                                checked={addressForm.is_default}
                                onChange={(e) => setAddressForm({...addressForm, is_default: e.target.checked})}
                              />
                              <label className="form-check-label" htmlFor="isDefault">
                                Make this my default address
                              </label>
                            </div>
                          </div>
                        </div>
                        <div className="d-flex gap-2">
                          <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Saving...' : (editingAddress ? 'Update' : 'Add')} Address
                          </button>
                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => {
                              setShowAddressForm(false);
                              setEditingAddress(null);
                              resetAddressForm();
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {addresses.length === 0 ? (
                    <div className="text-center text-muted">
                      No addresses added yet.
                    </div>
                  ) : (
                    addresses.map((address) => (
                      <div key={address.id} className="border rounded p-3 mb-3">
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <strong>{address.full_name}</strong>
                            {address.is_default && <span className="badge bg-primary ms-2">Default</span>}
                            <span className="badge bg-secondary ms-2">{address.type}</span>
                            <br />
                            <small className="text-muted">
                              {address.street_address}<br />
                              {address.city}, {address.state} - {address.postal_code}<br />
                              Phone: {address.phone}
                            </small>
                          </div>
                          <div className="dropdown">
                            <button
                              className="btn btn-outline-secondary btn-sm dropdown-toggle"
                              type="button"
                              data-bs-toggle="dropdown"
                            >
                              Actions
                            </button>
                            <ul className="dropdown-menu">
                              <li>
                                <button
                                  className="dropdown-item"
                                  onClick={() => editAddress(address)}
                                >
                                  Edit
                                </button>
                              </li>
                              <li>
                                <button
                                  className="dropdown-item text-danger"
                                  onClick={() => deleteAddress(address.id!)}
                                >
                                  Delete
                                </button>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
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

export default ProfilePage;