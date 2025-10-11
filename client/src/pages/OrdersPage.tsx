import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { orderAPI } from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import OrderDetailsModal from '../components/OrderDetailsModal.tsx';
import Productdetails_Slider1 from '../components/Products_Details/productdetails_slider1';
import { recommendedProducts } from '../data/productSliderData';
import '../styles/orders.css';
import SubNav from '../components/SubNav.tsx';
import CategoryTabs from '../components/CategoryTabs.tsx';

interface OrderItem {
  id: number;
  product: {
    id: number;
    title: string;
    main_image: string;
    price: number;
  };
  quantity: number;
  price: number;
}

interface Order {
  order_id: string;
  status: string;
  payment_status: string;
  total_amount: number;
  items_count: number;
  created_at: string;
  estimated_delivery?: string;
  shipping_address?: any;
  items?: OrderItem[];
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
  const [activeTab, setActiveTab] = useState<'orders' | 'buyAgain' | 'notShipped' | 'cancelled'>('orders');
  const [timeFilter, setTimeFilter] = useState('past 3 months');
  const [searchQuery, setSearchQuery] = useState('');

  // Demo data for when no orders exist
  const demoOrders: Order[] = [
    {
      order_id: 'ORD-2024-001',
      status: 'delivered',
      payment_status: 'paid',
      total_amount: 12999,
      items_count: 1,
      created_at: '2024-01-15T10:30:00Z',
      estimated_delivery: '2024-01-20T10:30:00Z',
      shipping_address: {
        street_address: '123 Main Street, Apartment 4B',
        city: 'Mumbai',
        state: 'Maharashtra',
        postal_code: '400001'
      },
      items: [
        {
          id: 1,
          product: {
            id: 1,
            title: 'Comfortable Wooden bed perfect for your bedroom setup with modern design.',
            main_image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400',
            price: 12999
          },
          quantity: 1,
          price: 12999
        }
      ]
    },
    {
      order_id: 'ORD-2024-002',
      status: 'processing',
      payment_status: 'paid',
      total_amount: 8499,
      items_count: 1,
      created_at: '2024-02-10T14:20:00Z',
      estimated_delivery: '2024-02-18T14:20:00Z',
      shipping_address: {
        street_address: '456 Park Avenue',
        city: 'Delhi',
        state: 'Delhi',
        postal_code: '110001'
      },
      items: [
        {
          id: 2,
          product: {
            id: 2,
            title: 'Modern Ergonomic Office Chair with Lumbar Support and Adjustable Height',
            main_image: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=400',
            price: 8499
          },
          quantity: 1,
          price: 8499
        }
      ]
    },
    {
      order_id: 'ORD-2024-003',
      status: 'cancelled',
      payment_status: 'refunded',
      total_amount: 15999,
      items_count: 1,
      created_at: '2024-03-05T09:15:00Z',
      shipping_address: {
        street_address: '789 Beach Road',
        city: 'Bangalore',
        state: 'Karnataka',
        postal_code: '560001'
      },
      items: [
        {
          id: 3,
          product: {
            id: 3,
            title: 'Premium Leather Sofa Set 3+2 Seater for Living Room - Brown Color',
            main_image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400',
            price: 15999
          },
          quantity: 1,
          price: 15999
        }
      ]
    },
    {
      order_id: 'ORD-2024-004',
      status: 'pending',
      payment_status: 'pending',
      total_amount: 3299,
      items_count: 2,
      created_at: '2024-03-20T11:45:00Z',
      estimated_delivery: '2024-03-28T11:45:00Z',
      shipping_address: {
        street_address: '321 Garden Street',
        city: 'Pune',
        state: 'Maharashtra',
        postal_code: '411001'
      },
      items: [
        {
          id: 4,
          product: {
            id: 4,
            title: 'Designer Table Lamp with Wooden Base - Warm White Light',
            main_image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400',
            price: 1799
          },
          quantity: 1,
          price: 1799
        },
        {
          id: 5,
          product: {
            id: 5,
            title: 'Decorative Wall Mirror with Golden Frame - 24x36 inches',
            main_image: 'https://images.unsplash.com/photo-1618220179428-22790b461013?w=400',
            price: 1500
          },
          quantity: 1,
          price: 1500
        }
      ]
    },
    {
      order_id: 'ORD-2024-005',
      status: 'delivered',
      payment_status: 'paid',
      total_amount: 5499,
      items_count: 1,
      created_at: '2024-02-20T16:30:00Z',
      estimated_delivery: '2024-02-25T16:30:00Z',
      shipping_address: {
        street_address: '555 Lake View',
        city: 'Hyderabad',
        state: 'Telangana',
        postal_code: '500001'
      },
      items: [
        {
          id: 6,
          product: {
            id: 6,
            title: 'Smart LED TV 43 inch Full HD with Netflix and Prime Video',
            main_image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400',
            price: 5499
          },
          quantity: 1,
          price: 5499
        }
      ]
    },
    {
      order_id: 'ORD-2024-006',
      status: 'delivered',
      payment_status: 'paid',
      total_amount: 2199,
      items_count: 1,
      created_at: '2024-01-28T09:00:00Z',
      estimated_delivery: '2024-02-02T09:00:00Z',
      shipping_address: {
        street_address: '888 Park Lane',
        city: 'Chennai',
        state: 'Tamil Nadu',
        postal_code: '600001'
      },
      items: [
        {
          id: 7,
          product: {
            id: 7,
            title: 'Wireless Bluetooth Headphones with Noise Cancellation - Black',
            main_image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
            price: 2199
          },
          quantity: 1,
          price: 2199
        }
      ]
    }
  ];

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

    // Check URL params for tab selection
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam === 'buyAgain' || tabParam === 'notShipped' || tabParam === 'cancelled' || tabParam === 'orders') {
      setActiveTab(tabParam as 'orders' | 'buyAgain' | 'notShipped' | 'cancelled');
    }

    fetchOrders();
  }, [state.isAuthenticated, location.search]);

  const fetchOrders = async () => {
    try {
      const response = await orderAPI.getOrders();
      const fetchedOrders = response.data.results || response.data;
      
      // If no orders or empty, use demo data
      if (!fetchedOrders || fetchedOrders.length === 0) {
        setOrders(demoOrders);
      } else {
        // Check if there are any delivered orders for Buy Again tab
        const deliveredOrders = fetchedOrders.filter((o: Order) => o.status === 'delivered');
        
        // If no delivered orders, add demo delivered orders for Buy Again tab
        if (deliveredOrders.length === 0) {
          const demoDeliveredOrders = demoOrders.filter(o => o.status === 'delivered');
          setOrders([...fetchedOrders, ...demoDeliveredOrders]);
        } else {
          setOrders(fetchedOrders);
        }
      }
    } catch (error) {
      console.error('Fetch orders error:', error);
      // Use demo data on error
      setOrders(demoOrders);
    } finally {
      setLoading(false);
    }
  };

  // Filter orders based on active tab
  const getFilteredOrders = () => {
    switch (activeTab) {
      case 'buyAgain':
        // Show delivered orders for buy again
        return orders.filter(order => order.status === 'delivered');
      case 'notShipped':
        // Show orders that are pending, confirmed, or processing
        return orders.filter(order => 
          ['pending', 'confirmed', 'processing'].includes(order.status)
        );
      case 'cancelled':
        // Show cancelled orders
        return orders.filter(order => order.status === 'cancelled');
      case 'orders':
      default:
        // Show all orders
        return orders;
    }
  };

  const filteredOrders = getFilteredOrders();

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
        <SubNav />
        <CategoryTabs />

        </div>
      <div className="page-content orders-page">
        <div className="container-fluid px-4 py-4" >
          {/* Breadcrumb */}
          <div className="breadcrumb-custom mb-3">
            <a href="/profile" className="breadcrumb-link">Your Account</a>
            <span className="breadcrumb-separator"> › </span>
            <span className="breadcrumb-current">Your Orders</span>
          </div>

          {/* Page Header */}
          <div className="orders-header mb-4">
            <h1 className="orders-title">Your Orders</h1>
            <div className="orders-search-container">
              <div className="search-box-orders">
                <input
                  type="text"
                  className="form-control search-input-orders"
                  placeholder="Search all orders"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button className="btn btn-dark search-btn-orders">Search Orders</button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="orders-tabs mb-4">
            <button
              className={`tab-button ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              Orders
            </button>
            <button
              className={`tab-button ${activeTab === 'buyAgain' ? 'active' : ''}`}
              onClick={() => setActiveTab('buyAgain')}
            >
              Buy Again
            </button>
            <button
              className={`tab-button ${activeTab === 'notShipped' ? 'active' : ''}`}
              onClick={() => setActiveTab('notShipped')}
            >
              Not Yet Shipped
            </button>
            <button
              className={`tab-button ${activeTab === 'cancelled' ? 'active' : ''}`}
              onClick={() => setActiveTab('cancelled')}
            >
              Cancelled Order
            </button>
          </div>

          {/* Time Filter */}
          <div className="time-filter mb-4">
            <span className="filter-label">
              <strong>{filteredOrders.length} orders</strong> placed in
            </span>
            <select
              className="form-select filter-select"
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
            >
              <option value="past 3 months">past 3 months</option>
              <option value="past 6 months">past 6 months</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
            </select>
          </div>

         
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

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-5">
              <h4>No Orders Found</h4>
              <p className="text-muted mb-4">
                {activeTab === 'buyAgain' && 'You have no delivered orders to buy again.'}
                {activeTab === 'notShipped' && 'You have no unshipped orders.'}
                {activeTab === 'cancelled' && 'You have no cancelled orders.'}
                {activeTab === 'orders' && "You haven't placed any orders yet."}
              </p>
              {activeTab === 'orders' && (
                <button className="btn btn-primary" onClick={() => navigate('/products')}>
                  Start Shopping
                </button>
              )}
            </div>
          ) : (
            <div className="orders-list">
              {filteredOrders.map((order) => (
                <div key={order.order_id} className="order-card mb-4">
                  {/* Order Header */}
                  <div className="order-header">
                    <div className="order-header-row">
                      <div className="order-info-group">
                        <div className="info-item">
                          <span className="info-label">ORDER PLACED</span>
                          <span className="info-value">
                            {new Date(order.created_at).toLocaleDateString('en-US', {
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">TOTAL</span>
                          <span className="info-value">₹{order.total_amount.toLocaleString()}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">SHIP TO</span>
                          <span className="info-value">
                            {order.shipping_address ? (
                              <>
                                {order.shipping_address.city}, {order.shipping_address.state}
                              </>
                            ) : (
                              'Mumbai, Maharashtra'
                            )}
                          </span>
                        </div>
                      </div>
                      <div className="order-id-group">
                        <span className="order-id-label">ORDER # {order.order_id}</span>
                        <div className="order-actions-header">
                          <button
                            className="btn-link-custom"
                            onClick={() => handleViewDetails(order.order_id)}
                          >
                            View order details
                          </button>
                          <span className="separator">|</span>
                          <button className="btn-link-custom">Invoice</button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Body */}
                  <div className="order-body">
                    {order.items && order.items.length > 0 ? (
                      order.items.map((item) => (
                        <div key={item.id} className="order-item">
                          <div className="item-image-container">
                            <img
                              src={item.product.main_image || 'https://via.placeholder.com/150'}
                              alt={item.product.title}
                              className="item-image"
                            />
                          </div>
                          <div className="item-details">
                            <h3 className="item-title">{item.product.title}</h3>
                            <div className="item-rating">
                              <div className="stars">
                                <span className="star filled">★</span>
                                <span className="star filled">★</span>
                                <span className="star filled">★</span>
                                <span className="star half">★</span>
                                <span className="star empty">★</span>
                              </div>
                              <span className="review-count">(120 reviews)</span>
                            </div>
                            <div className="item-pricing">
                              <span className="item-price">₹{item.product.price.toLocaleString()}</span>
                              <span className="item-strike">₹19,999</span>
                            </div>
                            
                            {/* Show Buy Now and Add to Cart only in Buy Again tab */}
                            {activeTab === 'buyAgain' && (
                              <div className="item-actions mt-3">
                                <button className="btn btn-warning btn-buy-now">Buy Now</button>
                                <button className="btn btn-outline-secondary btn-add-cart">
                                  <i className="bi bi-cart"></i> Add to Cart
                                </button>
                              </div>
                            )}

                            {/* Show status-specific information for other tabs */}
                            {activeTab === 'notShipped' && (
                              <div className="item-status mt-3">
                                <p className="status-text">
                                  <i className="bi bi-clock-history me-2"></i>
                                  <strong>Status:</strong> {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                </p>
                                {order.estimated_delivery && (
                                  <p className="delivery-text">
                                    <i className="bi bi-truck me-2"></i>
                                    <strong>Expected Delivery:</strong> {new Date(order.estimated_delivery).toLocaleDateString('en-US', {
                                      month: 'long',
                                      day: 'numeric',
                                      year: 'numeric'
                                    })}
                                  </p>
                                )}
                                <button className="btn btn-outline-primary btn-sm mt-2">
                                  Track Package
                                </button>
                              </div>
                            )}

                            {activeTab === 'cancelled' && (
                              <div className="item-status mt-3">
                                <p className="cancelled-text">
                                  <i className="bi bi-x-circle me-2 text-danger"></i>
                                  <strong>Order Cancelled</strong>
                                </p>
                                <p className="text-muted small">
                                  Refund will be processed within 5-7 business days
                                </p>
                                <button className="btn btn-warning btn-buy-now mt-2">Buy Again</button>
                              </div>
                            )}

                            {activeTab === 'orders' && (
                              <div className="item-status mt-3">
                                <div className="status-badge-container">
                                  <div className="status-icon-wrapper">
                                    {order.status === 'delivered' && <i className="bi bi-check-circle-fill status-icon-delivered"></i>}
                                    {order.status === 'cancelled' && <i className="bi bi-x-circle-fill status-icon-cancelled"></i>}
                                    {order.status === 'shipped' && <i className="bi bi-truck status-icon-shipped"></i>}
                                    {['pending', 'confirmed', 'processing'].includes(order.status) && (
                                      <i className="bi bi-clock status-icon-pending"></i>
                                    )}
                                  </div>
                                  <p className="status-text-inline mb-0">
                                    <strong>Status:</strong>
                                    <span className={`status-label ms-2 ${
                                      order.status === 'delivered' ? 'text-success' :
                                      order.status === 'cancelled' ? 'text-danger' :
                                      order.status === 'shipped' ? 'text-info' :
                                      'text-warning'
                                    }`}>
                                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                    </span>
                                  </p>
                                </div>
                                {order.status === 'delivered' && (
                                  <button className="btn btn-warning btn-buy-now mt-2">Buy Again</button>
                                )}
                                {['pending', 'confirmed', 'processing'].includes(order.status) && (
                                  <button className="btn btn-outline-primary btn-sm mt-2">
                                    Track Package
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="order-item">
                        <div className="item-image-container">
                          <img
                            src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400"
                            alt="Product"
                            className="item-image"
                          />
                        </div>
                        <div className="item-details">
                          <h3 className="item-title">
                            Comfortable Wooden bed perfect for your bedroom setup with modern design.
                          </h3>
                          <div className="item-rating">
                            <div className="stars">
                              <span className="star filled">★</span>
                              <span className="star filled">★</span>
                              <span className="star filled">★</span>
                              <span className="star half">★</span>
                              <span className="star empty">★</span>
                            </div>
                            <span className="review-count">(120 reviews)</span>
                          </div>
                          <div className="item-pricing">
                            <span className="item-price">₹{order.total_amount.toLocaleString()}</span>
                            <span className="item-strike">₹19,999</span>
                          </div>
                          
                          {/* Show Buy Now and Add to Cart only in Buy Again tab */}
                          {activeTab === 'buyAgain' && (
                            <div className="item-actions mt-3">
                              <button className="btn btn-warning btn-buy-now">Buy Now</button>
                              <button className="btn btn-outline-secondary btn-add-cart">
                                <i className="bi bi-cart"></i> Add to Cart
                              </button>
                            </div>
                          )}

                          {/* Show status-specific information for other tabs */}
                          {activeTab === 'notShipped' && (
                            <div className="item-status mt-3">
                              <p className="status-text">
                                <i className="bi bi-clock-history me-2"></i>
                                <strong>Status:</strong> {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </p>
                              {order.estimated_delivery && (
                                <p className="delivery-text">
                                  <i className="bi bi-truck me-2"></i>
                                  <strong>Expected Delivery:</strong> {new Date(order.estimated_delivery).toLocaleDateString('en-US', {
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric'
                                  })}
                                </p>
                              )}
                              <button className="btn btn-outline-primary btn-sm mt-2">
                                Track Package
                              </button>
                            </div>
                          )}

                          {activeTab === 'cancelled' && (
                            <div className="item-status mt-3">
                              <p className="cancelled-text">
                                <i className="bi bi-x-circle me-2 text-danger"></i>
                                <strong>Order Cancelled</strong>
                              </p>
                              <p className="text-muted small">
                                Refund will be processed within 5-7 business days
                              </p>
                              <button className="btn btn-warning btn-buy-now mt-2">Buy Again</button>
                            </div>
                          )}

                          {activeTab === 'orders' && (
                            
                             <div className="item-status mt-3">
                              <p className="status-text">
                                <i className="bi bi-clock-history me-2"></i>
                                <strong>Status:</strong> {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </p>
                              {order.estimated_delivery && (
                                <p className="delivery-text">
                                  <i className="bi bi-truck me-2"></i>
                                  <strong>Expected Delivery:</strong> {new Date(order.estimated_delivery).toLocaleDateString('en-US', {
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric'
                                  })}
                                </p>
                              )}
                              <button className="btn btn-outline-primary btn-sm mt-2">
                                Track Package
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                 
                </div>
              ))}
            </div>
          )}

          {/* Recommended Products Section */}
          {filteredOrders.length > 0 && (
            <div className="mt-5">
              <Productdetails_Slider1 
                title="Inspired by your browsing history"
                products={recommendedProducts}
              />
            </div>
          )}
        </div>

        {/* Order Details Modal */}
        {selectedOrderId && (
          <OrderDetailsModal orderId={selectedOrderId} show={showModal} onHide={handleCloseModal} />
        )}
      </div>
      <div className="footer-wrapper">
        <Footer />
      </div>
    </>
  );
};

export default OrdersPage;