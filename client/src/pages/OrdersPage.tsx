import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { orderAPI } from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import OrderDetailsModal from '../components/OrderDetailsModal.tsx';

interface Order {
  order_id: string;
  status: string;
  payment_status: string;
  total_amount: number;
  items_count: number;
  created_at: string;
  estimated_delivery?: string;
}

const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useApp();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleViewDetails = (orderId: string) => {
    setSelectedOrderId(orderId);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedOrderId(null);
    // Refresh orders list in case order was cancelled
    fetchOrders();
  };

  useEffect(() => {
    if (!state.isAuthenticated) {
      navigate('/login');
      return;
    }

    // Check for success message from checkout
    if (location.state?.message) {
      setMessage(location.state.message);
      // Clear the message after 5 seconds
      setTimeout(() => setMessage(null), 5000);
    }

    fetchOrders();
  }, [state.isAuthenticated]);

  const fetchOrders = async () => {
    try {
      const response = await orderAPI.getOrders();
      setOrders(response.data.results || response.data);
    } catch (error) {
      console.error('Fetch orders error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-warning text-dark';
      case 'confirmed':
        return 'bg-info';
      case 'processing':
        return 'bg-primary';
      case 'shipped':
        return 'bg-success';
      case 'delivered':
        return 'bg-success';
      case 'cancelled':
        return 'bg-danger';
      case 'returned':
        return 'bg-secondary';
      default:
        return 'bg-light text-dark';
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container my-5 text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="page-content">
        <div className="container my-5">
        <h2 className="mb-4">My Orders</h2>

        {message && (
          <div className="alert alert-success alert-dismissible fade show" role="alert">
            {message}
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => setMessage(null)}
            ></button>
          </div>
        )}

        {orders.length === 0 ? (
          <div className="text-center">
            <h4>No Orders Found</h4>
            <p className="text-muted mb-4">You haven't placed any orders yet.</p>
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/products')}
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="row">
            {orders.map((order) => (
              <div key={order.order_id} className="col-12 mb-4">
                <div className="card">
                  <div className="card-body">
                    <div className="row align-items-center">
                      <div className="col-md-2">
                        <strong>Order #{order.order_id.slice(0, 8)}</strong>
                        <br />
                        <small className="text-muted">
                          {new Date(order.created_at).toLocaleDateString()}
                        </small>
                      </div>
                      <div className="col-md-2">
                        <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                      <div className="col-md-2">
                        <small className="text-muted">Items</small>
                        <br />
                        <strong>{order.items_count}</strong>
                      </div>
                      <div className="col-md-2">
                        <small className="text-muted">Total</small>
                        <br />
                        <strong>₹{order.total_amount.toLocaleString()}</strong>
                      </div>
                      <div className="col-md-2">
                        {order.estimated_delivery && (
                          <>
                            <small className="text-muted">Expected</small>
                            <br />
                            <small>{new Date(order.estimated_delivery).toLocaleDateString()}</small>
                          </>
                        )}
                      </div>
                      <div className="col-md-2">
                        <button
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => handleViewDetails(order.order_id)}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        </div>

        {/* Order Details Modal */}
        {selectedOrderId && (
          <OrderDetailsModal
            orderId={selectedOrderId}
            show={showModal}
            onHide={handleCloseModal}
          />
        )}
      </div>
      <div className="footer-wrapper">
        <Footer />
      </div>
    </>
  );
};

export default OrdersPage;