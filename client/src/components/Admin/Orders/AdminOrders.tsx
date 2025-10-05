import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import adminAPI from '../../../services/adminApi';
import { formatCurrency } from '../utils/adminUtils';

interface Order {
  id: number;
  order_id: string;
  customer_name: string;
  status: string;
  payment_status: string;
  total_amount: number;
  items_count: number;
  created_at: string;
}

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterPayment, setFilterPayment] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const params = {
          page: currentPage,
          search: searchTerm,
          status: filterStatus,
          payment_status: filterPayment,
          date_from: dateFrom,
          date_to: dateTo,
        };
        
        const response = await adminAPI.getOrders(params);
        setOrders(response.data.results);
        setTotalPages(Math.ceil(response.data.count / response.data.results.length));
        setError(null);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, [currentPage, searchTerm, filterStatus, filterPayment, dateFrom, dateTo]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on search
  };
  
  if (loading && orders.length === 0) {
    return (
      <div className="admin-loader">
        <div className="spinner"></div>
        <p>Loading orders...</p>
      </div>
    );
  }
  
  return (
    <div className="admin-orders">
      <div className="admin-header-actions">
        <h2>Orders</h2>
      </div>
      
      {/* Filters */}
      <div className="admin-filters">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input">
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit">
              <span className="material-symbols-outlined">search</span>
            </button>
          </div>
        </form>
        
        <div className="filter-selects">
          <div className="filter-group">
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
              <option value="returned">Returned</option>
            </select>
          </div>
          
          <div className="filter-group">
            <select
              value={filterPayment}
              onChange={(e) => {
                setFilterPayment(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">All Payments</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
          
          <div className="date-filters">
            <div className="filter-group">
              <input
                type="date"
                placeholder="From"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <div className="filter-group">
              <input
                type="date"
                placeholder="To"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="admin-error-message">
          <span className="material-symbols-outlined">error</span>
          {error}
        </div>
      )}
      
      {/* Orders table */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Status</th>
              <th>Payment</th>
              <th>Items</th>
              <th>Total</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{order.order_id.substring(0, 8)}...</td>
                <td>{new Date(order.created_at).toLocaleDateString()}</td>
                <td>{order.customer_name}</td>
                <td>
                  <span className={`status-badge ${order.status}`}>
                    {order.status}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${order.payment_status}`}>
                    {order.payment_status}
                  </span>
                </td>
                <td>{order.items_count}</td>
                <td>${formatCurrency(order.total_amount)}</td>
                <td className="actions">
                  <Link to={`/admin/orders/${order.id}`} className="view-btn">
                    <span className="material-symbols-outlined">visibility</span>
                  </Link>
                </td>
              </tr>
            ))}
            
            {orders.length === 0 && !loading && (
              <tr>
                <td colSpan={8} className="empty-table">
                  <div>
                    <span className="material-symbols-outlined">receipt_long</span>
                    <p>No orders found</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="admin-pagination">
          <button 
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          
          <span className="page-info">
            Page {currentPage} of {totalPages}
          </span>
          
          <button 
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;