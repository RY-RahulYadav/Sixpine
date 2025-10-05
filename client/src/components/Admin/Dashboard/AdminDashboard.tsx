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
      <h2>Dashboard</h2>
      
      {/* Stats Overview */}
      <div className="stats-cards">
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
      <div className="action-cards">
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
      <div className="admin-panel sales-chart">
        <h3>Sales Last 30 Days</h3>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={stats.sales_by_day}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => {
                  const d = new Date(date);
                  return `${d.getMonth() + 1}/${d.getDate()}`;
                }} 
              />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => [`$${value.toFixed(2)}`, 'Revenue']}
                labelFormatter={(label) => {
                  const d = new Date(label);
                  return `${d.toLocaleDateString()}`;
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#8884d8" activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="orders" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Recent Orders & Top Products */}
      <div className="admin-panels-row">
        {/* Recent Orders */}
        <div className="admin-panel recent-orders">
          <h3>Recent Orders</h3>
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {stats.recent_orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.order_id.substring(0, 8)}...</td>
                  <td>{order.customer_name}</td>
                  <td>${formatCurrency(order.total_amount)}</td>
                  <td>
                    <span className={`status-badge ${order.status}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>
                    <Link to={`/admin/orders/${order.id}`} className="view-btn">View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="panel-footer">
            <Link to="/admin/orders" className="view-all-btn">View All Orders</Link>
          </div>
        </div>
        
        {/* Top Products */}
        <div className="admin-panel top-products">
          <h3>Top Selling Products</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={stats.top_selling_products}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis 
                type="category" 
                dataKey="title" 
                width={100}
                tickFormatter={(title) => title.length > 15 ? title.substring(0, 15) + '...' : title} 
              />
              <Tooltip 
                formatter={(value: number) => [value, 'Units Sold']}
              />
              <Bar dataKey="sold" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
          <div className="panel-footer">
            <Link to="/admin/products" className="view-all-btn">View All Products</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;