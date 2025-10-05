import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { addressAPI, orderAPI } from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

interface Address {
  id: number;
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

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useApp();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<number | null>(null);
  const [orderNotes, setOrderNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!state.isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (!state.cart || state.cart.items.length === 0) {
      navigate('/cart');
      return;
    }

    fetchAddresses();
  }, [state.isAuthenticated]);

  const fetchAddresses = async () => {
    try {
      const response = await addressAPI.getAddresses();
      setAddresses(response.data);
      // Select default address if available
      const defaultAddress = response.data.find((addr: Address) => addr.is_default);
      if (defaultAddress) {
        setSelectedAddress(defaultAddress.id);
      }
    } catch (error) {
      console.error('Fetch addresses error:', error);
    }
  };

  const placeOrder = async () => {
    if (!selectedAddress) {
      alert('Please select a shipping address');
      return;
    }

    setLoading(true);
    try {
      await orderAPI.checkoutFromCart({
        shipping_address_id: selectedAddress,
        order_notes: orderNotes
      });
      
      navigate('/orders', { 
        state: { message: 'Order placed successfully!' } 
      });
    } catch (error: any) {
      console.error('Place order error:', error);
      alert(error.response?.data?.error || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="page-content">
        <div className="container my-5">
        <h2 className="mb-4">Checkout</h2>

        <div className="row">
          <div className="col-md-8">
            {/* Shipping Address */}
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="mb-0">Shipping Address</h5>
              </div>
              <div className="card-body">
                {addresses.length === 0 ? (
                  <div className="text-center">
                    <p>No addresses found. Please add an address.</p>
                    <button className="btn btn-primary" onClick={() => navigate('/profile')}>
                      Add Address
                    </button>
                  </div>
                ) : (
                  addresses.map((address) => (
                    <div key={address.id} className="form-check mb-3">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="address"
                        id={`address-${address.id}`}
                        checked={selectedAddress === address.id}
                        onChange={() => setSelectedAddress(address.id)}
                      />
                      <label className="form-check-label" htmlFor={`address-${address.id}`}>
                        <div className="ms-2">
                          <strong>{address.full_name}</strong> - {address.type}
                          <br />
                          <small className="text-muted">
                            {address.street_address}, {address.city}, {address.state} - {address.postal_code}
                            <br />
                            Phone: {address.phone}
                          </small>
                        </div>
                      </label>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Order Notes */}
            <div className="card mb-4">
              <div className="card-header">
                <h6 className="mb-0">Order Notes (Optional)</h6>
              </div>
              <div className="card-body">
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="Any special instructions for your order..."
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="col-md-4">
            {/* Order Summary */}
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Order Summary</h5>
              </div>
              <div className="card-body">
                {state.cart?.items.map((item) => (
                  <div key={item.id} className="d-flex justify-content-between align-items-center mb-2">
                    <div>
                      <small>{item.product.title}</small>
                      <br />
                      <small className="text-muted">Qty: {item.quantity}</small>
                    </div>
                    <small>₹{item.total_price.toLocaleString()}</small>
                  </div>
                ))}
                <hr />
                <div className="d-flex justify-content-between mb-2">
                  <span>Subtotal</span>
                  <span>₹{state.cart?.total_price.toLocaleString()}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Shipping</span>
                  <span className="text-success">Free</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Tax (5%)</span>
                  <span>₹{(state.cart ? state.cart.total_price * 0.05 : 0).toLocaleString()}</span>
                </div>
                <hr />
                <div className="d-flex justify-content-between mb-3">
                  <strong>Total</strong>
                  <strong>₹{(state.cart ? state.cart.total_price * 1.05 : 0).toLocaleString()}</strong>
                </div>

                <button
                  className="btn btn-primary w-100"
                  onClick={placeOrder}
                  disabled={loading || !selectedAddress}
                >
                  {loading ? 'Placing Order...' : 'Place Order'}
                </button>
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

export default CheckoutPage;