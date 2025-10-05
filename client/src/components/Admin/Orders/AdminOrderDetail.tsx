import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import adminAPI from '../../../services/adminApi';
import { showToast } from '../utils/adminUtils';

interface OrderItem {
  id: number;
  product: {
    id: number;
    name?: string;
    title?: string; // Added title field to match backend
    slug?: string;
    image_url?: string;
    main_image_url?: string; // Added to support product main image
  };
  product_id?: number;
  quantity: number;
  unit_price?: number | string;
  price?: number | string; // Added price field to match backend - can be string
  total_price: number | string;
}

interface Order {
  id: number;
  order_number: string;
  order_id?: string; // UUID format as used in the backend
  user: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
  };
  items: OrderItem[]; // Changed from order_items to items to match server response
  order_items: OrderItem[]; // Keep for backward compatibility
  status: string;
  payment_status: string;
  payment_method: string;
  
  // Financial fields - can be either string or number from backend
  subtotal: number | string;
  total: number | string;
  total_amount?: number | string; // Backend field name
  shipping_cost: number | string;
  tax: number | string;
  tax_amount?: number | string; // Backend field name
  discount: number | string;
  
  // Addresses
  shipping_address: {
    address_line1: string;
    address_line2: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    phone: string;
  };
  billing_address: {
    address_line1: string;
    address_line2: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    phone: string;
  };
  


  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface OrderNote {
  id: number;
  content: string;
  created_at: string;
  created_by: {
    id: number;
    username: string;
  };
}

const AdminOrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  

  
  // Add styles for link buttons
  React.useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .link-button {
        background: none;
        border: none;
        padding: 0;
        color: #0066cc;
        text-decoration: underline;
        cursor: pointer;
        font-size: 14px;
      }
      .link-button:hover {
        color: #004080;
      }
      .product-cell {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .product-thumbnail {
        width: 50px;
        height: 50px;
        object-fit: cover;
        border-radius: 4px;
      }
      .product-name {
        font-weight: 500;
        margin-bottom: 4px;
      }
      .order-summary {
        margin-top: 20px;
        border-top: 1px solid #e9ecef;
        padding-top: 16px;
      }
      .order-summary-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
        padding: 4px 0;
      }
      .order-summary-row.total {
        border-top: 1px solid #e9ecef;
        margin-top: 8px;
        padding-top: 12px;
        font-weight: bold;
        font-size: 1.1em;
      }
      .order-summary-row.discount {
        color: #28a745;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  const [order, setOrder] = useState<Order | null>(null);
  const [orderNotes, setOrderNotes] = useState<OrderNote[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [newNote, setNewNote] = useState<string>('');
  const [statusUpdating, setStatusUpdating] = useState<boolean>(false);
  const [showNotesForm, setShowNotesForm] = useState<boolean>(false);
  
  const orderStatuses = [
    'pending',
    'confirmed',
    'processing',
    'shipped',
    'delivered',
    'cancelled'
  ];
  
  const paymentStatuses = [
    'pending',
    'paid',
    'failed',
    'refunded',
    'partially_refunded'
  ];
  
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const response = await adminAPI.getOrder(parseInt(id!));
        
        // Normalize status values to ensure consistent comparison
        const normalizedOrder = {
          ...response.data,
          status: response.data.status?.toLowerCase().trim(),
          payment_status: response.data.payment_status?.toLowerCase().trim()
        };
        
        setOrder(normalizedOrder);
        
        // Fetch order notes
        const notesResponse = await adminAPI.getOrderNotes(parseInt(id!));
        setOrderNotes(notesResponse.data);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchOrderDetails();
    }
  }, [id]);
  
  const handleOrderStatusChange = async (status: string) => {
    if (!order || !id) return;
    
    try {
      setStatusUpdating(true);
      
      const response = await adminAPI.updateOrderStatus(
        parseInt(id), 
        status,
        `Order status changed to ${status}`
      );
      
      // Preserve current state and only update the order status
      const updatedOrder = {
        ...order,
        ...response.data,
        status: status.toLowerCase().trim(),
        payment_status: order.payment_status // Preserve existing payment status
      };
      
      setOrder(updatedOrder);
      
      // Refresh notes
      const notesResponse = await adminAPI.getOrderNotes(parseInt(id));
      setOrderNotes(notesResponse.data);
      
      showToast(`Order status updated to ${status}`, 'success');
    } catch (err) {
      console.error('Error updating order status:', err);
      showToast('Failed to update order status', 'error');
    } finally {
      setStatusUpdating(false);
    }
  };
  
  const handlePaymentStatusChange = async (paymentStatus: string) => {
    if (!order || !id) return;
    
    try {
      setStatusUpdating(true);
      
      const response = await adminAPI.updatePaymentStatus(
        parseInt(id), 
        paymentStatus,
        `Payment status changed to ${paymentStatus}`
      );
      
      // Preserve current state and only update the payment status
      const updatedOrder = {
        ...order,
        ...response.data,
        status: order.status, // Preserve existing order status
        payment_status: paymentStatus.toLowerCase().trim()
      };
      
      setOrder(updatedOrder);
      
      // Refresh notes
      const notesResponse = await adminAPI.getOrderNotes(parseInt(id));
      setOrderNotes(notesResponse.data);
      
      showToast(`Payment status updated to ${paymentStatus}`, 'success');
    } catch (err) {
      console.error('Error updating payment status:', err);
      showToast('Failed to update payment status', 'error');
    } finally {
      setStatusUpdating(false);
    }
  };
  

  
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newNote.trim() || !id) return;
    
    try {
      // This assumes there's an API endpoint to add notes
      const response = await adminAPI.addOrderNote(parseInt(id), newNote);
      
      // Add the new note to the list
      setOrderNotes([...orderNotes, response.data]);
      
      // Clear the form
      setNewNote('');
      setShowNotesForm(false);
    } catch (err) {
      console.error('Error adding note:', err);
      showToast('Failed to add note', 'error');
    }
  };
  
  if (loading) {
    return (
      <div className="admin-loader">
        <div className="spinner"></div>
        <p>Loading order details...</p>
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
          onClick={() => navigate('/admin/orders')}
        >
          Back to Orders
        </button>
      </div>
    );
  }
  
  if (!order) {
    return (
      <div className="admin-error-container">
        <div className="admin-error-message">
          <span className="material-symbols-outlined">error</span>
          Order not found
        </div>
        <button 
          className="admin-btn"
          onClick={() => navigate('/admin/orders')}
        >
          Back to Orders
        </button>
      </div>
    );
  }
  
  // Format currency - handle both string and number inputs
  const formatCurrency = (amount: number | string) => {
    // Handle potential null/undefined values and convert strings to numbers
    let safeAmount = 0;
    
    if (typeof amount === 'string') {
      safeAmount = parseFloat(amount) || 0;
    } else if (typeof amount === 'number') {
      safeAmount = amount;
    }
    
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD' 
    }).format(safeAmount);
  };
  
  // Get status badge class
  const getStatusBadgeClass = (status: string) => {
    switch (status && status?.toLowerCase()) {
      case 'pending': return 'pending';
      case 'confirmed': return 'confirmed';
      case 'processing': return 'processing';
      case 'shipped': return 'shipped';
      case 'delivered': return 'delivered';
      case 'cancelled': return 'cancelled';
      case 'paid': return 'delivered';
      case 'failed': return 'cancelled';
      case 'refunded': return 'cancelled';
      case 'partially_refunded': return 'warning';
      default: return '';
    }
  };
  
  return (
    <div className="admin-order-detail">
      <div className="admin-header-actions">
        <div className="admin-header-with-back">
          <button 
            className="admin-back-button" 
            onClick={() => navigate('/admin/orders')}
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h2>Order #{order?.order_number || order?.order_id || 'Unknown'}</h2>
        </div>
        <div className="order-header-status">
          <div className="status-badges">
            <span className={`status-badge ${getStatusBadgeClass(order?.status || '')}`}>
              {order?.status || 'Unknown'}
            </span>
            <span className={`status-badge ${getStatusBadgeClass(order?.payment_status || '')}`}>
              {order?.payment_status || 'Unknown'}
            </span>
          </div>
        </div>
      </div>
      

      <div className="admin-content-grid">
        <div className="admin-content-main">
          <div className="admin-card">
            <h3>Order Items</h3>
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Unit Price</th>
                    <th>Quantity</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items?.length > 0 ? (
                    order.items.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <div className="product-cell">
                            {(item.product?.image_url || item.product?.main_image_url) && (
                              <img 
                                src={item.product.image_url || item.product.main_image_url} 
                                alt={item.product?.title || item.product?.name || 'Product'} 
                                className="product-thumbnail" 
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            )}
                            <div>
                              <div className="product-name">{item.product?.title || item.product?.name || 'Unknown Product'}</div>
                              {(item.product?.id || item.product_id) && (
                                <div className="product-link">
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigate(`/admin/products/${item.product?.id || item.product_id}`);
                                    }}
                                    className="link-button"
                                  >
                                    View Product
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>{formatCurrency(item.price || item.unit_price || 0)}</td>
                        <td>{item.quantity || 0}</td>
                        <td>{formatCurrency(item.total_price || 0)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', padding: '20px' }}>
                        No order items found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="order-summary">
              <div className="order-summary-row">
                <span>Subtotal</span>
                <span>{formatCurrency(order?.subtotal || 0)}</span>
              </div>
              {(Number(order.shipping_cost) || 0) > 0 && (
                <div className="order-summary-row">
                  <span>Shipping</span>
                  <span>{formatCurrency(order?.shipping_cost || 0)}</span>
                </div>
              )}
              {/* Always show tax row with 5% rate */}
              <div className="order-summary-row">
                <span>Tax (5%)</span>
                <span>{formatCurrency(order?.tax_amount || order.tax || 0)}</span>
              </div>
              {(Number(order.discount) || 0) > 0 && (
                <div className="order-summary-row discount">
                  <span>Discount</span>
                  <span>-{formatCurrency(order?.discount || 0)}</span>
                </div>
              )}
              <div className="order-summary-row total">
                <span>Total</span>
                <span>{formatCurrency(order?.total_amount || order.total || 0)}</span>
              </div>
              {/* Debug information */}
              <div className="debug-info" style={{fontSize: '12px', color: '#999', marginTop: '10px'}}>
                <div>Subtotal: {formatCurrency(order.subtotal || 0)}</div>
                <div>+ Tax (5%): {formatCurrency(order.tax_amount || order.tax || 0)}</div>
                <div>+ Shipping: {formatCurrency(order.shipping_cost || 0)}</div>
                {(Number(order.discount) || 0) > 0 && <div>- Discount: {formatCurrency(order.discount || 0)}</div>}
                <div>= Total: {formatCurrency(order.total_amount || order.total || 0)}</div>
              </div>
            </div>
          </div>
          
        
          <div className="admin-card">
            <h3>Payment Information</h3>
            <div className="payment-info">
              <div className="info-group">
                <p>
                  <strong>Payment Method:</strong> {order?.payment_method || 'N/A'}
                </p>
                <p>
                  <strong>Payment Status:</strong> 
                  <span className={`status-badge ${getStatusBadgeClass(order?.payment_status || '')}`}>
                    {order?.payment_status || 'Unknown'}
                  </span>
                </p>
              </div>
              
              <div className="update-status">
                <h4>Update Payment Status</h4>
                <div className="status-buttons">
                  {paymentStatuses.map((status) => {
                    const isCurrentStatus = order?.payment_status?.toLowerCase().trim() === status.toLowerCase().trim();
                    return (
                    <button
                      key={status}
                      className={`status-button ${isCurrentStatus ? 'current' : ''}`}
                      onClick={() => handlePaymentStatusChange(status)}
                      disabled={statusUpdating || isCurrentStatus}
                    >
                      <span className="status-dot"></span>
                      {status.replace('_', ' ')}
                    </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
          
          <div className="admin-card">
            <h3>Order Status Management</h3>
            <div className="update-status">
              <h4>Update Order Status</h4>
              <div className="status-buttons">
                {orderStatuses.map((status) => {
                  const isCurrentStatus = order?.status?.toLowerCase().trim() === status.toLowerCase().trim();
                  return (
                  <button
                    key={status}
                    className={`status-button ${isCurrentStatus ? 'current' : ''}`}
                    onClick={() => handleOrderStatusChange(status)}
                    disabled={statusUpdating || isCurrentStatus}
                  >
                    <span className="status-dot"></span>
                    {status}
                  </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        
        <div className="admin-content-sidebar">
          <div className="admin-card">
            <h3>Order Details</h3>
            <div className="order-details-list">
              <div className="detail-item">
                <label>Order Date:</label>
                <span>{order?.created_at ? new Date(order.created_at).toLocaleString() : 'N/A'}</span>
              </div>
              <div className="detail-item">
                <label>Last Updated:</label>
                <span>{order?.updated_at ? new Date(order.updated_at).toLocaleString() : 'N/A'}</span>
              </div>
              <div className="detail-item">
                <label>Status:</label>
                <span className={`status-badge ${getStatusBadgeClass(order?.status || '')}`}>
                  {order?.status || 'Unknown'}
                </span>
              </div>
              <div className="detail-item">
                <label>Payment Status:</label>
                <span className={`status-badge ${getStatusBadgeClass(order?.payment_status || '')}`}>
                  {order?.payment_status || 'Unknown'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="admin-card">
            <div className="notes-header">
              <h3>Order Notes</h3>
              {!showNotesForm && (
                <button 
                  className="admin-btn secondary"
                  onClick={() => setShowNotesForm(true)}
                >
                  <span className="material-symbols-outlined">add</span>
                  Add Note
                </button>
              )}
            </div>
            
            {showNotesForm && (
              <form className="notes-form" onSubmit={handleAddNote}>
                <div className="form-group">
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add a note about this order"
                    rows={3}
                    required
                  ></textarea>
                </div>
                <div className="form-actions">
                  <button 
                    type="button" 
                    className="admin-btn secondary"
                    onClick={() => setShowNotesForm(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="admin-btn primary">
                    <span className="material-symbols-outlined">save</span>
                    Save Note
                  </button>
                </div>
              </form>
            )}
            
            <div className="notes-list">
              {orderNotes.length > 0 ? (
                orderNotes.map((note) => (
                  <div className="note-item" key={note.id}>
                    <div className="note-content">{note.content}</div>
                    <div className="note-meta">
                      <span className="note-by">{note.created_by.username}</span>
                      <span className="note-date">
                        {new Date(note.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="empty-notes">No notes for this order</p>
              )}
            </div>
          </div>
          
          <div className="admin-card">
            <h3>Actions</h3>
            <div className="quick-actions">
              <button 
                className="admin-btn info block"
                onClick={(e) => {
                  e.preventDefault();
                  window.print();
                }}
              >
                <span className="material-symbols-outlined">print</span>
                Print Order
              </button>
              <button 
                className="admin-btn secondary block"
                onClick={() => {
                  // Implementation of invoice generation
                  try {
                    // In a real implementation, this would call an API endpoint
                    // For now, we'll show a more informative message
                    showToast(`Generating invoice for order #${order?.order_number || 'Unknown'}`, 'info');
                    
                    // You would typically call something like:
                    // adminAPI.generateInvoice(order.id).then(response => {
                    //   // Open the PDF in a new tab or download it
                    //   window.open(response.data.invoiceUrl, '_blank');
                    // });
                  } catch (err) {
                    console.error('Error generating invoice:', err);
                    showToast('Failed to generate invoice. Please try again.', 'error');
                  }
                }}
              >
                <span className="material-symbols-outlined">receipt</span>
                Generate Invoice
              </button>
              {order?.status !== 'cancelled' && (
                <button 
                  className="admin-btn danger block"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to cancel this order?')) {
                      handleOrderStatusChange('cancelled');
                    }
                  }}
                >
                  <span className="material-symbols-outlined">cancel</span>
                  Cancel Order
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetail;