import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import adminAPI from '../../../services/adminApi';
import { formatCurrency, showToast } from '../utils/adminUtils';
import './admin-products.css';

interface Product {
  id: number;
  title: string;
  slug: string;
  price: number;
  old_price: number | null;
  stock_quantity: number;
  sku: string;
  category_name: string;
  brand_name: string;
  is_active: boolean;
  is_featured: boolean;
  is_new_arrival: boolean;
  main_image_url: string | null;
}

// Add styles for the new badge
const newBadgeStyle = document.createElement('style');
newBadgeStyle.innerHTML = `
  .new-badge {
    background-color: #ff5722;
    color: white;
    font-size: 11px;
    padding: 2px 6px;
    border-radius: 10px;
    margin-left: 6px;
    display: inline-block;
    vertical-align: middle;
  }
`;
document.head.appendChild(newBadgeStyle);

// Styles are loaded from admin-products.css

const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterStock, setFilterStock] = useState<string>('');
  const [filterActive, setFilterActive] = useState<string>('');
  
  // Fetch categories for filter dropdown
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await adminAPI.getCategories();
        if (response.data && Array.isArray(response.data.results)) {
          setCategories(response.data.results);
        } else if (response.data && Array.isArray(response.data)) {
          setCategories(response.data);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    
    fetchCategories();
  }, []);
  
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const params = {
          page: currentPage,
          search: searchTerm,
          category: filterCategory,
          stock_status: filterStock,
          is_active: filterActive,
          limit: 10 // Set a smaller limit to test pagination
        };
        
        console.log('Fetching products with params:', params);
        const response = await adminAPI.getProducts(params);
        
        console.log('API Response:', response.data); // Debug log
        
        console.log('Raw API Response:', response.data); // Debug log
        
        // Ensure we have the products data - Handle different response formats
        if (response.data) {
          let products = [];
          let totalCount = 0;
          
          if (Array.isArray(response.data.results)) {
            // Standard paginated response
            products = response.data.results;
            totalCount = response.data.count || products.length;
          } else if (Array.isArray(response.data)) {
            // Direct array response
            products = response.data;
            totalCount = products.length;
          }
          
          // Set products regardless of format
          setProducts(products);
          
          // Calculate total pages
          const pageSize = params.limit || 50;
          const calculatedPages = Math.max(Math.ceil(totalCount / pageSize), 1);
          console.log('Pagination Debug:', { totalCount, pageSize, calculatedPages });
          setTotalPages(calculatedPages);
          setError(null);
        } else {
          // If no data in the response
          console.error('No data in API response:', response);
          setProducts([]);
          setTotalPages(1);
          setError('No data received from server');
        }
      } catch (err: any) {
        console.error('Error fetching products:', err);
        if (err.response) {
          console.error('Error response:', err.response.data);
          setError(err.response.data.detail || 'Failed to load products');
        } else {
          setError('Failed to load products');
        }
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [currentPage, searchTerm, filterCategory, filterStock, filterActive]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on search
  };
  
  const handleToggleActive = async (id: number, isActive: boolean) => {
    try {
      await adminAPI.toggleProductActive(id);
      
      // Update the product in the local state
      setProducts(products.map(product => 
        product.id === id ? { ...product, is_active: !isActive } : product
      ));
    } catch (err) {
      console.error('Error toggling product status:', err);
      showToast('Failed to update product status', 'error');
    }
  };
  
  const handleDeleteProduct = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await adminAPI.deleteProduct(id);
        // Remove the product from the local state
        setProducts(products.filter(product => product.id !== id));
      } catch (err) {
        console.error('Error deleting product:', err);
        showToast('Failed to delete product', 'error');
      }
    }
  };
  
  if (loading && products.length === 0) {
    return (
      <div className="admin-loader">
        <div className="spinner"></div>
        <p>Loading products...</p>
      </div>
    );
  }
  
  return (
    <div className="admin-products">
      <div className="admin-header-actions">
        <h2>Products</h2>
        <Link to="/admin/products/new" className="admin-btn primary">
          <span className="material-symbols-outlined">add</span>
          Add New Product
        </Link>
      </div>
      
      {/* Filters */}
      <div className="admin-filters">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input">
            <input
              type="text"
              placeholder="Search products..."
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
              value={filterCategory}
              onChange={(e) => {
                setFilterCategory(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <select
              value={filterStock}
              onChange={(e) => {
                setFilterStock(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">All Stock</option>
              <option value="in_stock">In Stock</option>
              <option value="out_of_stock">Out of Stock</option>
              <option value="low_stock">Low Stock</option>
            </select>
          </div>
          
          <div className="filter-group">
            <select
              value={filterActive}
              onChange={(e) => {
                setFilterActive(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
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
      
      {/* Products table */}
      <div className="admin-table-container">
        <table className="admin-table responsive-table">
          <thead>
            <tr>
              <th></th>
              <th>Product</th>
              <th>SKU</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Category</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="responsive-row">
                <td className="product-image" data-label="Image">
                  {product.main_image_url ? (
                    <img src={product.main_image_url} alt={product.title} className="admin-thumb" />
                  ) : (
                    <div className="no-image">
                      <span className="material-symbols-outlined">image_not_supported</span>
                    </div>
                  )}
                </td>
                <td className="product-title" data-label="Product">
                  <Link to={`/admin/products/${product.id}`}>{product.title}</Link>
                </td>
                <td data-label="SKU">{product.sku}</td>
                <td data-label="Price">
                  ${formatCurrency(product.price)}
                  {product.old_price && (
                    <span className="old-price">${formatCurrency(product.old_price)}</span>
                  )}
                </td>
                <td className={`stock-qty ${product.stock_quantity === 0 ? 'out-of-stock' : product.stock_quantity < 10 ? 'low-stock' : ''}`} data-label="Stock">
                  {product.stock_quantity}
                </td>
                <td data-label="Category">{product.category_name}</td>
                <td data-label="Status">
                  <button 
                    className={`status-toggle ${product.is_active ? 'active' : 'inactive'}`}
                    onClick={() => handleToggleActive(product.id, product.is_active)}
                  >
                    {product.is_active ? 'Active' : 'Inactive'}
                  </button>
                </td>
                
                <td className="actions" data-label="Actions">
                  <Link to={`/admin/products/${product.id}`} className="edit-btn">
                    <span className="material-symbols-outlined">edit</span>
                  </Link>
                  <button 
                    className="delete-btn"
                    onClick={() => handleDeleteProduct(product.id)}
                  >
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                </td>
              </tr>
            ))}
            
            {products.length === 0 && !loading && (
              <tr>
                <td colSpan={9} className="empty-table">
                  <div>
                    <span className="material-symbols-outlined">inventory_2</span>
                    <p>No products found</p>
                    <Link to="/admin/products/new" className="admin-btn secondary">
                      Add New Product
                    </Link>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination - Always visible */}
      <div className="admin-pagination">
        <button 
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          <span className="material-symbols-outlined">chevron_left</span>
        </button>
        
        <span className="page-info">
          Page {currentPage} of {totalPages || 1}
        </span>
        
        <button 
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages || 1))}
          disabled={currentPage === totalPages || totalPages === 0}
        >
          <span className="material-symbols-outlined">chevron_right</span>
        </button>
      </div>
    </div>
  );
};

export default AdminProducts;