import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import adminAPI from '../../../services/adminApi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { formatCurrency } from '../utils/adminUtils';

interface DashboardStats {
  total_users: number;
  total_orders: number;
  total_revenue: number | string;
  total_products: number;
  pending_orders: number;
  low_stock_products: number;
  recent_orders: any[];
  top_selling_products: any[];
  sales_by_day: any[];
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await adminAPI.getDashboardStats();
        setStats(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        setError('Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);
  
  if (loading) {
    return (
      <div className="admin-loader">
        <div className="spinner"></div>
        <p>Loading dashboard data...</p>
      </div>
    );
  }
  
  if (error || !stats) {
    return (
      <div className="admin-error">
        <span className="material-symbols-outlined">error</span>
        <p>{error || 'An unknown error occurred'}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }
  
  return (
    <div className="admin-dashboard">
      <h2 className="tw-text-xl sm:tw-text-2xl tw-font-bold tw-mb-4 sm:tw-mb-6">Dashboard</h2>
      
      {/* Stats Overview */}
      <div className="stats-cards tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 lg:tw-grid-cols-4 tw-gap-3 sm:tw-gap-4 tw-mb-4 sm:tw-mb-6">
        <div className="stat-card">
          <div className="stat-icon">
            <span className="material-symbols-outlined">payments</span>
          </div>
          <div className="stat-content">
            <h3>Total Revenue</h3>
            <p className="stat-value">${formatCurrency(stats.total_revenue)}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <span className="material-symbols-outlined">shopping_cart</span>
          </div>
          <div className="stat-content">
            <h3>Total Orders</h3>
            <p className="stat-value">{stats.total_orders}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <span className="material-symbols-outlined">inventory_2</span>
          </div>
          <div className="stat-content">
            <h3>Products</h3>
            <p className="stat-value">{stats.total_products}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <span className="material-symbols-outlined">people</span>
          </div>
          <div className="stat-content">
            <h3>Users</h3>
            <p className="stat-value">{stats.total_users}</p>
          </div>
        </div>
      </div>
      
      {/* Action Cards */}
      <div className="action-cards tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 tw-gap-3 sm:tw-gap-4 tw-mb-4 sm:tw-mb-6">
        <div className="action-card pending-orders">
          <div className="action-content">
            <h3>Pending Orders</h3>
            <p className="action-value">{stats.pending_orders}</p>
            <Link to="/admin/orders?status=pending" className="action-link">View Orders</Link>
          </div>
          <div className="action-icon">
            <span className="material-symbols-outlined">receipt_long</span>
          </div>
        </div>
        
        <div className="action-card low-stock">
          <div className="action-content">
            <h3>Low Stock Products</h3>
            <p className="action-value">{stats.low_stock_products}</p>
            <Link to="/admin/products?stock_status=low_stock" className="action-link">View Products</Link>
          </div>
          <div className="action-icon">
            <span className="material-symbols-outlined">inventory</span>
          </div>
        </div>
      </div>
      
      {/* Sales Chart */}
      <div className="admin-panel sales-chart tw-mb-4 sm:tw-mb-6">
        <h3 className="tw-text-lg sm:tw-text-xl">Sales Last 30 Days</h3>
        <div className="chart-container tw-w-full tw-h-64 sm:tw-h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={stats.sales_by_day}
              margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => {
                  const d = new Date(date);
                  return `${d.getMonth() + 1}/${d.getDate()}`;
                }}
                tick={{ fontSize: 12 }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                formatter={(value: number) => [`$${value.toFixed(2)}`, 'Revenue']}
                labelFormatter={(label) => {
                  const d = new Date(label);
                  return `${d.toLocaleDateString()}`;
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line type="monotone" dataKey="revenue" stroke="#8884d8" activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="orders" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Recent Orders & Top Products */}
      <div className="admin-panels-row tw-grid tw-grid-cols-1 lg:tw-grid-cols-2 tw-gap-4 sm:tw-gap-6">
        {/* Recent Orders */}
        <div className="admin-panel recent-orders tw-overflow-hidden">
          <h3 className="tw-text-lg sm:tw-text-xl">Recent Orders</h3>
          <div className="tw-overflow-x-auto">
            <table className="tw-w-full tw-min-w-[500px]">
              <thead>
                <tr>
                  <th className="tw-text-xs sm:tw-text-sm">Order ID</th>
                  <th className="tw-text-xs sm:tw-text-sm">Customer</th>
                  <th className="tw-text-xs sm:tw-text-sm">Total</th>
                  <th className="tw-text-xs sm:tw-text-sm">Status</th>
                  <th className="tw-text-xs sm:tw-text-sm">Action</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent_orders.map((order) => (
                  <tr key={order.id}>
                    <td className="tw-text-xs sm:tw-text-sm">{order.order_id.substring(0, 8)}...</td>
                    <td className="tw-text-xs sm:tw-text-sm">{order.customer_name}</td>
                    <td className="tw-text-xs sm:tw-text-sm">${formatCurrency(order.total_amount)}</td>
                    <td>
                      <span className={`status-badge ${order.status} tw-text-xs`}>
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <Link to={`/admin/orders/${order.id}`} className="view-btn tw-text-xs">View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="panel-footer">
            <Link to="/admin/orders" className="view-all-btn tw-text-sm">View All Orders</Link>
          </div>
        </div>
        
        {/* Top Products */}
        <div className="admin-panel top-products">
          <h3 className="tw-text-lg sm:tw-text-xl">Top Selling Products</h3>
          <div className="tw-w-full tw-h-56 sm:tw-h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats.top_selling_products}
                margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis 
                  type="category" 
                  dataKey="title" 
                  width={80}
                  tick={{ fontSize: 11 }}
                  tickFormatter={(title) => title.length > 12 ? title.substring(0, 12) + '...' : title} 
                />
                <Tooltip 
                  formatter={(value: number) => [value, 'Units Sold']}
                />
                <Bar dataKey="sold" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="panel-footer">
            <Link to="/admin/products" className="view-all-btn tw-text-sm">View All Products</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;