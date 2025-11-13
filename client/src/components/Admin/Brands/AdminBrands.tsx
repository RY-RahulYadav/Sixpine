import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import adminAPI from '../../../services/adminApi';
import { showToast, formatCurrency } from '../utils/adminUtils';
import '../../../styles/admin-theme.css';

interface Brand {
  id: number;
  user: number;
  user_email: string;
  user_name: string;
  business_name: string;
  business_email: string;
  business_phone: string;
  brand_name: string;
  status: 'pending' | 'active' | 'suspended' | 'inactive';
  status_display: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  total_products: number;
  total_orders: number;
  total_revenue: string;
}

const AdminBrands: React.FC = () => {
  const navigate = useNavigate();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [showProductsModal, setShowProductsModal] = useState<boolean>(false);
  const [showOrdersModal, setShowOrdersModal] = useState<boolean>(false);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingDetails, setLoadingDetails] = useState<boolean>(false);

  useEffect(() => {
    fetchBrands();
  }, [currentPage, searchTerm, statusFilter]);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
      };
      
      if (searchTerm) {
        params.search = searchTerm;
      }
      if (statusFilter) {
        params.status = statusFilter;
      }
      
      const response = await adminAPI.getBrands(params);
      setBrands(response.data.results || response.data);
      if (response.data.count !== undefined) {
        setTotalPages(Math.ceil(response.data.count / (response.data.results?.length || 10)));
      } else {
        setTotalPages(1);
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching brands:', err);
      setError('Failed to load brands');
      showToast('Failed to load brands', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleSuspend = async (id: number) => {
    if (!window.confirm('Are you sure you want to suspend this brand? This will prevent them from accessing the seller panel.')) {
      return;
    }

    try {
      await adminAPI.suspendBrand(id);
      showToast('Brand suspended successfully', 'success');
      fetchBrands();
    } catch (err: any) {
      console.error('Error suspending brand:', err);
      const errorMessage = err.response?.data?.error || err.response?.data?.detail || 'Failed to suspend brand';
      showToast(errorMessage, 'error');
    }
  };

  const handleActivate = async (id: number) => {
    try {
      await adminAPI.activateBrand(id);
      showToast('Brand activated successfully', 'success');
      fetchBrands();
    } catch (err: any) {
      console.error('Error activating brand:', err);
      const errorMessage = err.response?.data?.error || err.response?.data?.detail || 'Failed to activate brand';
      showToast(errorMessage, 'error');
    }
  };

  const handleViewProducts = async (brand: Brand) => {
    setSelectedBrand(brand);
    setShowProductsModal(true);
    setLoadingDetails(true);
    
    try {
      const response = await adminAPI.getBrandProducts(brand.id);
      setProducts(response.data);
    } catch (err) {
      console.error('Error fetching products:', err);
      showToast('Failed to load products', 'error');
      setProducts([]);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleViewOrders = async (brand: Brand) => {
    setSelectedBrand(brand);
    setShowOrdersModal(true);
    setLoadingDetails(true);
    
    try {
      const response = await adminAPI.getBrandOrders(brand.id);
      setOrders(response.data);
    } catch (err) {
      console.error('Error fetching orders:', err);
      showToast('Failed to load orders', 'error');
      setOrders([]);
    } finally {
      setLoadingDetails(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'suspended':
        return 'error';
      case 'pending':
        return 'warning';
      case 'inactive':
        return 'inactive';
      default:
        return 'inactive';
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-header-container">
        <h1>Brand Management</h1>
        <p className="admin-subtitle">Manage all brands and vendors on the platform</p>
      </div>

      {error && (
        <div className="admin-alert error">
          {error}
        </div>
      )}

      {/* Search and Filters */}
      <div className="admin-modern-card mb-4">
        <form onSubmit={handleSearch} className="admin-search-form">
          <div className="admin-search-group">
            <span className="material-symbols-outlined">search</span>
            <input
              type="text"
              placeholder="Search by brand name, business name, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="admin-input"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="admin-input"
            style={{ width: '200px' }}
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="pending">Pending</option>
            <option value="inactive">Inactive</option>
          </select>
          <button type="submit" className="admin-btn primary">
            Search
          </button>
        </form>
      </div>

      {/* Brands Table */}
      <div className="admin-modern-card">
        {loading ? (
          <div className="admin-loading-state">
            <div className="admin-loader"></div>
            <p>Loading brands...</p>
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Brand Name</th>
                  <th>Business Name</th>
                  <th>Email</th>
                  <th>Products</th>
                  <th>Orders</th>
                  <th>Revenue</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {brands.map((brand) => (
                  <tr key={brand.id}>
                    <td>
                      <strong>{brand.brand_name || 'N/A'}</strong>
                      {brand.is_verified && (
                        <span className="material-symbols-outlined" style={{ marginLeft: '8px', color: '#10b981', fontSize: '18px' }}>
                          verified
                        </span>
                      )}
                    </td>
                    <td>{brand.business_name || 'N/A'}</td>
                    <td>{brand.business_email || brand.user_email}</td>
                    <td>
                      <button
                        className="admin-modern-btn secondary"
                        onClick={() => handleViewProducts(brand)}
                        title="View products"
                        style={{ minWidth: 'auto', padding: '4px 12px' }}
                      >
                        {brand.total_products}
                      </button>
                    </td>
                    <td>
                      <button
                        className="admin-modern-btn secondary"
                        onClick={() => handleViewOrders(brand)}
                        title="View orders"
                        style={{ minWidth: 'auto', padding: '4px 12px' }}
                      >
                        {brand.total_orders}
                      </button>
                    </td>
                    <td>
                      <strong>{formatCurrency(parseFloat(brand.total_revenue || '0'))}</strong>
                    </td>
                    <td>
                      <span className={`admin-status-badge ${getStatusBadgeClass(brand.status)}`}>
                        {brand.status_display || brand.status}
                      </span>
                    </td>
                    <td>
                      <div className="admin-action-buttons">
                        {brand.status === 'active' ? (
                          <button
                            className="admin-modern-btn warning icon-only"
                            onClick={() => handleSuspend(brand.id)}
                            title="Suspend brand"
                          >
                            <span className="material-symbols-outlined">block</span>
                          </button>
                        ) : (
                          <button
                            className="admin-modern-btn success icon-only"
                            onClick={() => handleActivate(brand.id)}
                            title="Activate brand"
                          >
                            <span className="material-symbols-outlined">check_circle</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                
                {brands.length === 0 && !loading && (
                  <tr>
                    <td colSpan={8} className="admin-empty-state empty-state-cell">
                      <div>
                        <span className="material-symbols-outlined">store</span>
                        <h3>No brands found</h3>
                        <p>Brands will appear here once vendors register</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="admin-pagination">
          <button
            className="admin-btn secondary"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span>Page {currentPage} of {totalPages}</span>
          <button
            className="admin-btn secondary"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}

      {/* Products Modal */}
      {showProductsModal && selectedBrand && (
        <div className="admin-modal-overlay" onClick={() => setShowProductsModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>Products - {selectedBrand.brand_name}</h2>
              <button
                className="admin-modal-close"
                onClick={() => setShowProductsModal(false)}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="admin-modal-body">
              {loadingDetails ? (
                <div className="admin-loading-state">
                  <div className="admin-loader"></div>
                  <p>Loading products...</p>
                </div>
              ) : (
                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>SKU</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product) => (
                        <tr key={product.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              {product.main_image && (
                                <img src={product.main_image} alt={product.title} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                              )}
                              <span>{product.title}</span>
                            </div>
                          </td>
                          <td>{product.sku || 'N/A'}</td>
                          <td>{formatCurrency(product.price || 0)}</td>
                          <td>{product.total_stock || 0}</td>
                          <td>
                            <span className={`admin-status-badge ${product.is_active ? 'success' : 'inactive'}`}>
                              {product.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {products.length === 0 && (
                        <tr>
                          <td colSpan={5} className="admin-empty-state empty-state-cell">
                            <div>
                              <span className="material-symbols-outlined">inventory_2</span>
                              <p>No products found</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Orders Modal */}
      {showOrdersModal && selectedBrand && (
        <div className="admin-modal-overlay" onClick={() => setShowOrdersModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>Orders - {selectedBrand.brand_name}</h2>
              <button
                className="admin-modal-close"
                onClick={() => setShowOrdersModal(false)}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="admin-modal-body">
              {loadingDetails ? (
                <div className="admin-loading-state">
                  <div className="admin-loader"></div>
                  <p>Loading orders...</p>
                </div>
              ) : (
                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Total</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order.id}>
                          <td>#{order.order_number || order.id}</td>
                          <td>{order.user?.email || order.user_email || 'N/A'}</td>
                          <td>{new Date(order.created_at).toLocaleDateString()}</td>
                          <td>
                            <span className={`admin-status-badge ${
                              order.status === 'completed' ? 'success' :
                              order.status === 'cancelled' ? 'error' :
                              'warning'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td>{formatCurrency(order.total_amount || 0)}</td>
                          <td>
                            <button
                              className="admin-modern-btn secondary icon-only"
                              onClick={() => {
                                setShowOrdersModal(false);
                                navigate(`/admin/orders/${order.id}`);
                              }}
                              title="View order"
                            >
                              <span className="material-symbols-outlined">visibility</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                      {orders.length === 0 && (
                        <tr>
                          <td colSpan={6} className="admin-empty-state empty-state-cell">
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
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBrands;

