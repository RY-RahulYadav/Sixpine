import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import adminAPI from '../../../services/adminApi';

interface ProductVariant {
  id?: number;
  sku: string;
  name: string;
  price: string;
  old_price: string;
  stock_quantity: number;
  attributes: Record<string, string>;
  is_active: boolean;
}

interface Product {
  id: number;
  title: string;
  slug: string;
  description: string;
  price: number;
  old_price: number | null;
  stock_quantity: number;
  is_active: boolean;
  is_featured: boolean;
  is_new_arrival: boolean;
  category: {
    id: number;
    name: string;
  };
  brand?: {
    id: number;
    name: string;
  };
  images: {
    id: number;
    image_url: string;
    url: string;
    is_primary: boolean;
    is_main: boolean;
  }[];
  variants: ProductVariant[];
  created_at: string;
  updated_at: string;
  sku: string;
  weight: number;
  dimensions: string;
  avg_rating: number;
  average_rating: number;
  review_count: number;
  short_description?: string;
  meta_title?: string;
  meta_description?: string;
  discount_percentage?: number;
}

interface Category {
  id: number;
  name: string;
}

const AdminProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === 'new' || !id;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    short_description: '',
    price: '',
    old_price: '',
    stock_quantity: '',
    is_active: true,
    is_featured: false,
    is_new_arrival: false,
    category_id: '',
    brand_id: '',
    sku: '',
    weight: '',
    dimensions: '',
    discount_percentage: '0',
  });
  
  // Variants
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [showVariants, setShowVariants] = useState(false);
  
  // Fetch product details and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch categories
        const categoriesResponse = await adminAPI.getCategories();
        if (categoriesResponse.data.results) {
          setCategories(categoriesResponse.data.results);
        }
        
        // Fetch product if editing
        if (!isNew) {
          const response = await adminAPI.getProduct(parseInt(id!));
          const productData = response.data;
          setProduct(productData);
          
          // Populate form
          setFormData({
            title: productData.title || '',
            slug: productData.slug || '',
            description: productData.description || '',
            short_description: productData.short_description || '',
            price: productData.price?.toString() || '',
            old_price: productData.old_price?.toString() || '',
            stock_quantity: productData.stock_quantity?.toString() || '0',
            is_active: productData.is_active ?? true,
            is_featured: productData.is_featured ?? false,
            is_new_arrival: productData.is_new_arrival ?? false,
            category_id: productData.category?.id?.toString() || '',
            brand_id: productData.brand?.id?.toString() || '',
            sku: productData.sku || '',
            weight: productData.weight?.toString() || '',
            dimensions: productData.dimensions || '',
            discount_percentage: productData.discount_percentage?.toString() || '0',
          });
          
          // Set variants if available
          if (productData.variants && productData.variants.length > 0) {
            setVariants(productData.variants);
            setShowVariants(true);
          }
        }
        
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(err.response?.data?.detail || 'Failed to load product details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, isNew]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      
      // Auto-generate slug from title
      if (name === 'title' && isNew) {
        const slug = value.toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');
        setFormData(prev => ({ ...prev, slug }));
      }
    }
  };
  
  const handleUpdateStock = () => {
    const newStock = prompt('Enter new stock quantity:', formData.stock_quantity);
    if (newStock !== null) {
      const quantity = parseInt(newStock);
      if (!isNaN(quantity) && quantity >= 0) {
        setFormData(prev => ({ ...prev, stock_quantity: quantity.toString() }));
        if (!isNew && product) {
          adminAPI.updateProductStock(product.id, quantity)
            .then(() => {
              showSuccess('Stock updated successfully');
            })
            .catch(err => {
              console.error('Error updating stock:', err);
              setError('Failed to update stock');
            });
        }
      }
    }
  };
  
  const handleAddVariant = () => {
    setVariants(prev => [...prev, {
      sku: '',
      name: '',
      price: '',
      old_price: '',
      stock_quantity: 0,
      attributes: {},
      is_active: true
    }]);
  };
  
  const handleRemoveVariant = (index: number) => {
    setVariants(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleVariantChange = (index: number, field: string, value: any) => {
    setVariants(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };
  
  const showSuccess = (message: string) => {
    setSuccess(message);
    setTimeout(() => setSuccess(null), 3000);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.category_id) {
      setError('Title and Category are required');
      return;
    }
    
    try {
      setSaving(true);
      setError(null);
      
      const payload: any = {
        title: formData.title,
        slug: formData.slug,
        description: formData.description,
        short_description: formData.short_description,
        price: parseFloat(formData.price) || 0,
        old_price: formData.old_price ? parseFloat(formData.old_price) : null,
        stock_quantity: parseInt(formData.stock_quantity) || 0,
        is_active: formData.is_active,
        is_featured: formData.is_featured,
        is_new_arrival: formData.is_new_arrival,
        category: parseInt(formData.category_id), // Use 'category' instead of 'category_id'
        brand: formData.brand_id ? parseInt(formData.brand_id) : null, // Use 'brand' instead of 'brand_id'
        sku: formData.sku || `SKU-${Date.now()}`,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        dimensions: formData.dimensions,
        discount_percentage: parseInt(formData.discount_percentage) || 0,
      };
      
      // Add variants if any
      if (showVariants && variants.length > 0) {
        payload.variants = variants.map(v => ({
          ...v,
          price: v.price ? parseFloat(v.price.toString()) : null,
          old_price: v.old_price ? parseFloat(v.old_price.toString()) : null,
        }));
      }
      
      console.log('Payload being sent:', payload); // Debug log
      console.log('Available categories:', categories); // Debug log
      
      let response;
      if (isNew) {
        response = await adminAPI.createProduct(payload);
        showSuccess('Product created successfully!');
        navigate(`/admin/products/${response.data.id}`);
      } else {
        response = await adminAPI.updateProduct(parseInt(id!), payload);
        setProduct(response.data);
        showSuccess('Product updated successfully!');
      }
      
    } catch (err: any) {
      console.error('Error saving product:', err);
      console.error('Full error response:', err.response); // Debug log
      
      let errorMessage = 'Failed to save product';
      if (err.response?.data) {
        if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (err.response.data.detail) {
          errorMessage = err.response.data.detail;
        } else if (err.response.data.error) {
          errorMessage = err.response.data.error;
        } else if (err.response.data.category_id) {
          errorMessage = `Category: ${err.response.data.category_id[0]}`;
        } else {
          errorMessage = JSON.stringify(err.response.data);
        }
      }
      
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };
  
  const handleToggleActive = async () => {
    if (isNew || !product) {
      setFormData(prev => ({ ...prev, is_active: !prev.is_active }));
      return;
    }
    
    try {
      await adminAPI.toggleProductActive(product.id);
      setFormData(prev => ({ ...prev, is_active: !prev.is_active }));
      showSuccess(`Product ${formData.is_active ? 'hidden' : 'shown'}`);
    } catch (err) {
      setError('Failed to toggle product status');
    }
  };
  
  const handleToggleFeatured = async () => {
    if (isNew || !product) {
      setFormData(prev => ({ ...prev, is_featured: !prev.is_featured }));
      return;
    }
    
    try {
      await adminAPI.toggleProductFeatured(product.id);
      setFormData(prev => ({ ...prev, is_featured: !prev.is_featured }));
      showSuccess(`Product ${formData.is_featured ? 'removed from' : 'added to'} featured`);
    } catch (err) {
      setError('Failed to toggle featured status');
    }
  };
  
  const handleDelete = async () => {
    if (!product || !window.confirm('Are you sure you want to delete this product?')) {
      return;
    }
    
    try {
      await adminAPI.deleteProduct(product.id);
      showSuccess('Product deleted successfully');
      navigate('/admin/products');
    } catch (err) {
      setError('Failed to delete product');
    }
  };
  
  if (loading) {
    return (
      <div className="admin-loader">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }
  
  const stockQuantity = parseInt(formData.stock_quantity) || 0;
  const isOutOfStock = stockQuantity === 0;
  const isLowStock = stockQuantity > 0 && stockQuantity < 10;
  
  return (
    <div className="admin-product-detail">
      <div className="admin-header-actions">
        <div className="admin-header-with-back">
          <button className="admin-back-button" onClick={() => navigate('/admin/products')}>
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h2>{isNew ? 'Add New Product' : 'Edit Product'}</h2>
        </div>
        {!isNew && product && (
          <div className="header-actions">
            <button className="admin-btn secondary" onClick={() => window.open(`/product/${product.slug}`, '_blank')}>
              <span className="material-symbols-outlined">visibility</span>
              View Product
            </button>
            <button className="admin-btn danger" onClick={handleDelete}>
              <span className="material-symbols-outlined">delete</span>
              Delete Product
            </button>
          </div>
        )}
      </div>
      
      {error && (
        <div className="admin-error-message">
          <span className="material-symbols-outlined">error</span>
          {error}
        </div>
      )}
      
      {success && (
        <div className="admin-success-message">
          <span className="material-symbols-outlined">check_circle</span>
          {success}
        </div>
      )}
      
      <div className="admin-content-grid">
        <div className="admin-content-main">
          <div className="admin-card">
            <form onSubmit={handleSubmit} className="admin-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="title">Product Name*</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="slug">Slug*</label>
                  <input
                    type="text"
                    id="slug"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    required
                  />
                  <small className="form-helper">Used in URLs. Should contain only letters, numbers, and hyphens.</small>
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="description">Description*</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={6}
                  required
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="price">Price*</label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="old_price">Discount Price</label>
                  <input
                    type="number"
                    id="old_price"
                    name="old_price"
                    value={formData.old_price}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                  />
                  <small className="form-helper">Leave empty if no discount applies</small>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="stock_quantity">Stock Quantity*</label>
                  <input
                    type="number"
                    id="stock_quantity"
                    name="stock_quantity"
                    value={formData.stock_quantity}
                    onChange={handleChange}
                    min="0"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="category_id">Category*</label>
                  <select
                    id="category_id"
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="sku">SKU</label>
                  <input
                    type="text"
                    id="sku"
                    name="sku"
                    value={formData.sku}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="weight">Weight (kg)</label>
                  <input
                    type="number"
                    id="weight"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>
              
              <div className="form-row checkbox-row">
                <div className="form-group checkbox">
                  <input
                    type="checkbox"
                    id="is_active"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                  />
                  <label htmlFor="is_active">Active</label>
                </div>
                <div className="form-group checkbox">
                  <input
                    type="checkbox"
                    id="is_featured"
                    name="is_featured"
                    checked={formData.is_featured}
                    onChange={handleChange}
                  />
                  <label htmlFor="is_featured">Featured</label>
                </div>
                <div className="form-group checkbox">
                  <input
                    type="checkbox"
                    id="is_new_arrival"
                    name="is_new_arrival"
                    checked={formData.is_new_arrival}
                    onChange={handleChange}
                  />
                  <label htmlFor="is_new_arrival">New Arrival</label>
                </div>
              </div>
              
              {/* Variants Section */}
              <div className="form-section">
                <div className="form-section-header">
                  <h3>Product Variants (Optional)</h3>
                  <button
                    type="button"
                    className="admin-btn secondary"
                    onClick={() => {
                      if (!showVariants) {
                        // When showing variants for the first time, add one variant
                        setShowVariants(true);
                        if (variants.length === 0) {
                          handleAddVariant();
                        }
                      } else {
                        // When hiding variants, keep the variants data but hide the UI
                        setShowVariants(false);
                      }
                    }}
                  >
                    {showVariants ? 'Hide Variants' : 'Add Variants'}
                  </button>
                </div>
                
                {showVariants && (
                  <div className="variants-container">
                    {variants.map((variant, index) => (
                      <div key={index} className="variant-item">
                        <div className="variant-header">
                          <h4>Variant {index + 1}</h4>
                          <button
                            type="button"
                            className="remove-variant-btn"
                            onClick={() => handleRemoveVariant(index)}
                          >
                            <span className="material-symbols-outlined">close</span>
                          </button>
                        </div>
                        <div className="form-row">
                          <div className="form-group">
                            <label>Variant Name</label>
                            <input
                              type="text"
                              value={variant.name}
                              onChange={(e) => handleVariantChange(index, 'name', e.target.value)}
                              placeholder="e.g., Blue - Medium"
                            />
                          </div>
                          <div className="form-group">
                            <label>SKU</label>
                            <input
                              type="text"
                              value={variant.sku}
                              onChange={(e) => handleVariantChange(index, 'sku', e.target.value)}
                              placeholder="Variant SKU"
                            />
                          </div>
                        </div>
                        <div className="form-row">
                          <div className="form-group">
                            <label>Price</label>
                            <input
                              type="number"
                              value={variant.price}
                              onChange={(e) => handleVariantChange(index, 'price', e.target.value)}
                              step="0.01"
                              min="0"
                            />
                          </div>
                          <div className="form-group">
                            <label>Stock</label>
                            <input
                              type="number"
                              value={variant.stock_quantity}
                              onChange={(e) => handleVariantChange(index, 'stock_quantity', parseInt(e.target.value) || 0)}
                              min="0"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="admin-btn secondary"
                      onClick={handleAddVariant}
                    >
                      <span className="material-symbols-outlined">add</span>
                      Add Variant
                    </button>
                  </div>
                )}
              </div>
              
              <div className="form-actions">
                <button type="button" className="admin-btn secondary" onClick={() => navigate('/admin/products')}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn primary" disabled={saving}>
                  {saving ? (
                    <>
                      <span className="spinner-small"></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined">save</span>
                      {isNew ? 'Create Product' : 'Save Changes'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
        
        {!isNew && product && (
          <div className="admin-content-sidebar">
            <div className="admin-card">
              <h3>Product Details</h3>
              <div className="product-info-list">
                <div className="info-item">
                  <label>Created:</label>
                  <span>{new Date(product.created_at).toLocaleDateString()}</span>
                </div>
                <div className="info-item">
                  <label>Last Updated:</label>
                  <span>{new Date(product.updated_at).toLocaleDateString()}</span>
                </div>
                <div className="info-item">
                  <label>Rating:</label>
                  <span>
                    {product.avg_rating || product.average_rating ? (
                      `${(product.avg_rating || product.average_rating).toFixed(1)} / 5 (${product.review_count} reviews)`
                    ) : (
                      'No ratings yet'
                    )}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="admin-card">
              <h3>Inventory Status</h3>
              <div className="inventory-status">
                <div className={`stock-badge ${isOutOfStock ? 'out-of-stock' : isLowStock ? 'low-stock' : 'in-stock'}`}>
                  <span className="material-symbols-outlined">inventory</span>
                  <span>{isOutOfStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'In Stock'}</span>
                </div>
                <button type="button" className="admin-btn secondary block" onClick={handleUpdateStock}>
                  <span className="material-symbols-outlined">edit</span>
                  Update Stock
                </button>
              </div>
            </div>
            
            <div className="admin-card">
              <h3>Quick Actions</h3>
              <div className="quick-actions">
                <button
                  type="button"
                  className={`admin-btn ${formData.is_active ? 'warning' : 'success'} block`}
                  onClick={handleToggleActive}
                >
                  <span className="material-symbols-outlined">
                    {formData.is_active ? 'visibility_off' : 'visibility'}
                  </span>
                  {formData.is_active ? 'Hide Product' : 'Show Product'}
                </button>
                <button
                  type="button"
                  className={`admin-btn ${formData.is_featured ? 'secondary' : 'info'} block`}
                  onClick={handleToggleFeatured}
                >
                  <span className="material-symbols-outlined">
                    {formData.is_featured ? 'star' : 'star_outline'}
                  </span>
                  {formData.is_featured ? 'Unmark as Featured' : 'Mark as Featured'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProductDetail;
