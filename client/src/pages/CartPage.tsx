import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { cartAPI, orderAPI, addressAPI } from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

interface CartItem {
  id: number;
  product: {
    id: number;
    title: string;
    price: number;
    main_image: string;
    slug: string;
  };
  quantity: number;
  total_price: number;
}

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { state, fetchCart } = useApp();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!state.isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchCart();
  }, [state.isAuthenticated]);

  const handleCheckout = async () => {
    if (!state.cart || state.cart.items.length === 0) {
      alert('Your cart is empty!');
      return;
    }

    setLoading(true);
    try {
      // First, check if user has any addresses
      let addressId: number;
      try {
        const addressResponse = await addressAPI.getAddresses();
        if (addressResponse.data && addressResponse.data.length > 0) {
          // Use the first address or default address
          const defaultAddress = addressResponse.data.find((addr: any) => addr.is_default);
          addressId = defaultAddress ? defaultAddress.id : addressResponse.data[0].id;
        } else {
          // Create a dummy address
          const dummyAddress = {
            type: 'home',
            full_name: state.user?.first_name && state.user?.last_name 
              ? `${state.user.first_name} ${state.user.last_name}` 
              : state.user?.username || 'Demo User',
            phone: '+91 9876543210',
            street_address: '123 Demo Street, Demo Colony',
            city: 'Mumbai',
            state: 'Maharashtra',
            postal_code: '400001',
            country: 'India',
            is_default: true
          };
          const createAddressResponse = await addressAPI.addAddress(dummyAddress);
          addressId = createAddressResponse.data.id;
        }
      } catch (addressError) {
        console.error('Address error:', addressError);
        // Create a dummy address if there's an error
        const dummyAddress = {
          type: 'home',
          full_name: state.user?.first_name && state.user?.last_name 
            ? `${state.user.first_name} ${state.user.last_name}` 
            : state.user?.username || 'Demo User',
          phone: '+91 9876543210',
          street_address: '123 Demo Street, Demo Colony',
          city: 'Mumbai',
          state: 'Maharashtra',
          postal_code: '400001',
          country: 'India',
          is_default: true
        };
        const createAddressResponse = await addressAPI.addAddress(dummyAddress);
        addressId = createAddressResponse.data.id;
      }

      // Create order from cart
      const checkoutData = {
        shipping_address_id: addressId,
        order_notes: 'Demo order created from cart'
      };

      const response = await orderAPI.checkoutFromCart(checkoutData);
      
      // Show success message
      alert(`Order created successfully! Order ID: ${response.data.order.order_id}`);
      
      // Refresh cart (should be empty now)
      await fetchCart();
      
      // Navigate to orders page
      navigate('/orders');
    } catch (error: any) {
      console.error('Checkout error:', error);
      const errorMessage = error.response?.data?.error || 'Failed to create order. Please try again.';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: number, quantity: number) => {
    if (quantity < 1) return;
    
    setLoading(true);
    try {
      await cartAPI.updateCartItem(itemId, { quantity });
      await fetchCart();
    } catch (error) {
      console.error('Update quantity error:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (itemId: number) => {
    setLoading(true);
    try {
      await cartAPI.removeFromCart(itemId);
      await fetchCart();
    } catch (error) {
      console.error('Remove item error:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      setLoading(true);
      try {
        await cartAPI.clearCart();
        await fetchCart();
      } catch (error) {
        console.error('Clear cart error:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  if (!state.cart || state.cart.items.length === 0) {
    return (
      <>
        <Navbar />
        <div className="page-content">
          <div className="container my-5">
            <div className="text-center">
              <h2>Your Cart is Empty</h2>
              <p className="text-muted mb-4">Add some products to your cart to get started!</p>
              <Link to="/products" className="btn btn-primary">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
        <div className="footer-wrapper">
          <Footer />
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="page-content">
        <div className="container my-5">
        <div className="row">
          <div className="col-md-8">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2>Shopping Cart ({state.cart.items_count} items)</h2>
              <button
                className="btn btn-outline-danger btn-sm"
                onClick={clearCart}
                disabled={loading}
              >
                Clear Cart
              </button>
            </div>

            {state.cart.items.map((item: CartItem) => (
              <div key={item.id} className="card mb-3">
                <div className="card-body">
                  <div className="row align-items-center">
                    <div className="col-md-2">
                      <img
                        src={item.product.main_image || '/placeholder-image.jpg'}
                        alt={item.product.title}
                        className="img-fluid rounded"
                        style={{ maxHeight: '80px' }}
                      />
                    </div>
                    <div className="col-md-4">
                      <h6 className="mb-1">{item.product.title}</h6>
                      <small className="text-muted">₹{item.product.price.toLocaleString()}</small>
                    </div>
                    <div className="col-md-3">
                      <div className="quantity-box">
                        <button
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={loading || item.quantity <= 1}
                        >
                          -
                        </button>
                        <input
                          type="number"
                          className="form-control form-control-sm text-center mx-2"
                          style={{ width: '60px' }}
                          value={item.quantity}
                          onChange={(e) => {
                            const qty = parseInt(e.target.value);
                            if (qty > 0) updateQuantity(item.id, qty);
                          }}
                          min="1"
                        />
                        <button
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={loading}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="col-md-2">
                      <strong>₹{item.total_price.toLocaleString()}</strong>
                    </div>
                    <div className="col-md-1">
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => removeItem(item.id)}
                        disabled={loading}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="col-md-4">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Order Summary</h5>
              </div>
              <div className="card-body">
                <div className="d-flex justify-content-between mb-2">
                  <span>Subtotal ({state.cart.total_items} items)</span>
                  <span>₹{state.cart.total_price.toLocaleString()}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Shipping</span>
                  <span className="text-success">Free</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Tax (5%)</span>
                  <span>₹{(state.cart.total_price * 0.05).toLocaleString()}</span>
                </div>
                <hr />
                <div className="d-flex justify-content-between mb-3">
                  <strong>Total</strong>
                  <strong>₹{(state.cart.total_price * 1.05).toLocaleString()}</strong>
                </div>
                <button
                  onClick={handleCheckout}
                  className="btn btn-primary w-100"
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Checkout'}
                </button>
              </div>
            </div>

            <div className="mt-3">
              <Link to="/products" className="btn btn-outline-secondary w-100">
                Continue Shopping
              </Link>
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

export default CartPage;