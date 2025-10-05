import React, { useEffect, useState } from 'react';
import { orderAPI } from '../services/api';

// Safe formatter for amounts: handles undefined/null/string inputs
const formatAmount = (value: any) => {
  const n = Number(value);
  if (!isFinite(n)) return '0';
  return n.toLocaleString();
};

// Normalize item shape coming from backend (different APIs may return different keys)
const normalizeItem = (item: any) => {
  const quantity = Number(item.quantity ?? item.qty ?? 0) || 0;
  const unitPrice = Number(item.price ?? item.unit_price ?? item.product?.price ?? 0) || 0;
  const subtotal = Number(item.subtotal ?? item.total ?? unitPrice * quantity) || unitPrice * quantity;
  // product serializer uses `title` and `main_image` (ProductListSerializer)
  const name = item.product_name ?? item.name ?? item.title ?? item.product?.title ?? item.product?.name ?? `Product #${item.product_id ?? item.id ?? ''}`;
  const image = item.product_image ?? item.image ?? item.product?.main_image ?? item.product?.image ?? (item.product?.images && item.product.images[0] && item.product.images[0].image) ?? '';
  return { quantity, unitPrice, subtotal, name, image };
};

interface OrderItem {
  product_id: number;
  product_name: string;
  product_image?: string;
  quantity: number;
  price: number;
  subtotal: number;
}

interface Address {
  full_name: string;
  phone_number: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

interface StatusHistory {
  status: string;
  notes: string;
  created_at: string;
  created_by?: string;
}

interface OrderDetails {
  order_id: string;
  status: string;
  payment_status: string;
  payment_method: string;
  subtotal: number;
  shipping_cost: number;
  tax_amount: number;
  total_amount: number;
  created_at: string;
  updated_at: string;
  estimated_delivery?: string;
  shipping_address: Address;
  items: OrderItem[];
  status_history: StatusHistory[];
  order_notes?: string;
}

interface OrderDetailsModalProps {
  orderId: string;
  show: boolean;
  onHide: () => void;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ orderId, show, onHide }) => {
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (show && orderId) {
      fetchOrderDetails();
    }
  }, [show, orderId]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    try {
      const response = await orderAPI.getOrder(orderId);
      setOrder(response.data);
    } catch (error) {
      console.error('Error fetching order details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    setCancelling(true);
    try {
      await orderAPI.cancelOrder(orderId);
      alert('Order cancelled successfully');
      fetchOrderDetails(); // Refresh order details
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to cancel order');
    } finally {
      setCancelling(false);
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

  if (!show) return null;

  return (
    <>
      <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog modal-xl modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Order Details</h5>
              <button type="button" className="btn-close" onClick={onHide}></button>
            </div>
            <div className="modal-body">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : order ? (
                <div>
                  {/* Order Header */}
                  <div className="row mb-4">
                    <div className="col-md-6">
                      <h6 className="text-muted mb-3">Order Information</h6>
                      <p className="mb-2">
                        <strong>Order ID:</strong> #{order.order_id.slice(0, 8)}
                      </p>
                      <p className="mb-2">
                        <strong>Status:</strong>{' '}
                        <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </p>
                      <p className="mb-2">
                        <strong>Payment Status:</strong>{' '}
                        <span className={`badge ${order.payment_status === 'paid' ? 'bg-success' : 'bg-warning text-dark'}`}>
                          {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                        </span>
                      </p>
                      <p className="mb-2">
                        <strong>Payment Method:</strong> {order.payment_method || 'COD'}
                      </p>
                      <p className="mb-2">
                        <strong>Order Date:</strong> {new Date(order.created_at).toLocaleString()}
                      </p>
                      {order.estimated_delivery && (
                        <p className="mb-2">
                          <strong>Expected Delivery:</strong> {new Date(order.estimated_delivery).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="col-md-6">
                      <h6 className="text-muted mb-3">Shipping Address</h6>
                      <p className="mb-1"><strong>{order.shipping_address.full_name}</strong></p>
                      <p className="mb-1">{order.shipping_address.phone_number}</p>
                      <p className="mb-1">{order.shipping_address.address_line1}</p>
                      {order.shipping_address.address_line2 && (
                        <p className="mb-1">{order.shipping_address.address_line2}</p>
                      )}
                      <p className="mb-1">
                        {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}
                      </p>
                      <p className="mb-1">{order.shipping_address.country}</p>
                    </div>
                  </div>

                  <hr />

                  {/* Order Items */}
                  <div className="mb-4">
                    <h6 className="text-muted mb-3">Order Items</h6>
                    <div className="table-responsive">
                      <table className="table table-bordered">
                        <thead className="table-light">
                          <tr>
                            <th>Product</th>
                            <th>Price</th>
                            <th>Quantity</th>
                            <th>Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {order.items.map((item, index) => {
                            const it = normalizeItem(item);
                            return (
                              <tr key={index}>
                                <td>
                                  <div className="d-flex align-items-center">
                                    {it.image ? (
                                      <img
                                        src={it.image}
                                        alt={it.name}
                                        style={{ width: '50px', height: '50px', objectFit: 'cover', marginRight: '10px' }}
                                      />
                                    ) : null}
                                    <span>{it.name}</span>
                                  </div>
                                </td>
                                <td>₹{formatAmount(it.unitPrice)}</td>
                                <td>{it.quantity}</td>
                                <td>₹{formatAmount(it.subtotal)}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <hr />

                  {/* Order Summary */}
                  <div className="row mb-4">
                    <div className="col-md-6 offset-md-6">
                      <h6 className="text-muted mb-3">Order Summary</h6>
                      <div className="d-flex justify-content-between mb-2">
                        <span>Subtotal:</span>
                        <strong>₹{formatAmount(order.subtotal)}</strong>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span>Shipping:</span>
                        <strong>₹{formatAmount(order.shipping_cost)}</strong>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span>Tax:</span>
                        <strong>₹{formatAmount(order.tax_amount)}</strong>
                      </div>
                      <hr />
                      <div className="d-flex justify-content-between">
                        <strong>Total:</strong>
                        <strong className="text-primary fs-5">₹{formatAmount(order.total_amount)}</strong>
                      </div>
                    </div>
                  </div>

                  {order.order_notes && (
                    <>
                      <hr />
                      <div className="mb-4">
                        <h6 className="text-muted mb-3">Order Notes</h6>
                        <p className="text-muted">{order.order_notes}</p>
                      </div>
                    </>
                  )}

                  <hr />

                  {/* Status History */}
                  <div className="mb-3">
                    <h6 className="text-muted mb-3">Status History</h6>
                    <div className="timeline">
                      {order.status_history.map((history, index) => (
                        <div key={index} className="mb-3 d-flex">
                          <div className="me-3">
                            <span className={`badge ${getStatusBadgeClass(history.status)}`}>
                              {history.status.charAt(0).toUpperCase() + history.status.slice(1)}
                            </span>
                          </div>
                          <div>
                            <p className="mb-1">{history.notes}</p>
                            <small className="text-muted">
                              {new Date(history.created_at).toLocaleString()}
                              {history.created_by && ` by ${history.created_by}`}
                            </small>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-5">
                  <p>Order not found</p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              {order && order.status === 'pending' && (
                <button
                  className="btn btn-danger"
                  onClick={handleCancelOrder}
                  disabled={cancelling}
                >
                  {cancelling ? 'Cancelling...' : 'Cancel Order'}
                </button>
              )}
              <button type="button" className="btn btn-secondary" onClick={onHide}>
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderDetailsModal;
