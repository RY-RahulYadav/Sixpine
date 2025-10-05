import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import SubNav from '../components/SubNav';
import CategoryTabs from '../components/CategoryTabs';
import Footer from '../components/Footer';
import { productAPI } from '../services/api';
import { useApp } from '../context/AppContext';
import '../styles/productList.css';

interface Product {
  id: number;
  title: string;
  short_description: string;
  main_image: string;
  price: number;
  old_price: number;
  average_rating: number;
  review_count: number;
  slug: string;
  is_on_sale: boolean;
  discount_percentage: number;
}

const ProductListPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { addToCart } = useApp();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilters, setSelectedFilters] = useState({
    brands: [] as string[],
    priceRange: [135, 25000],
    storage: [] as string[],
    rating: null as number | null,
    deliveryDay: [] as string[],
  });

  const [sortBy, setSortBy] = useState('featured');

  useEffect(() => {
    fetchProducts();
  }, [searchParams, sortBy, selectedFilters]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params: any = {};
      
      // Add search query if present
      const searchQuery = searchParams.get('search');
      if (searchQuery) {
        params.q = searchQuery;
      }

      // Add category filter if present
      const categoryParam = searchParams.get('category');
      if (categoryParam) {
        params.category = categoryParam;
      }

      // Add other filters
      if (selectedFilters.brands.length > 0) {
        params.brand = selectedFilters.brands.join(',');
      }

      if (selectedFilters.priceRange[0] > 135) {
        params.min_price = selectedFilters.priceRange[0];
      }
      
      if (selectedFilters.priceRange[1] < 25000) {
        params.max_price = selectedFilters.priceRange[1];
      }

      if (selectedFilters.rating) {
        params.min_rating = selectedFilters.rating;
      }

      // Add sorting (updated to match new API)
      switch (sortBy) {
        case 'price_low':
          params.sort = 'price_low_to_high';
          break;
        case 'price_high':
          params.sort = 'price_high_to_low';
          break;
        case 'newest':
          params.sort = 'newest';
          break;
        case 'rating':
          params.sort = 'rating';
          break;
        case 'popularity':
          params.sort = 'popularity';
          break;
        case 'relevance':
        default:
          params.sort = 'relevance';
          break;
      }

      let response;
      
      // Use advanced search if we have query or filters
      if (searchQuery || categoryParam || selectedFilters.brands.length > 0 || 
          selectedFilters.priceRange[0] > 135 || selectedFilters.priceRange[1] < 25000 || 
          selectedFilters.rating) {
        response = await productAPI.advancedSearch(params);
      } else {
        // Use regular product list for browsing
        response = await productAPI.getProducts(params);
      }
      
      setProducts(response.data.results || response.data);
    } catch (error) {
      console.error('Fetch products error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (productId: number) => {
    try {
      await addToCart(productId, 1);
      alert('Product added to cart!');
    } catch (error: any) {
      alert(error.message || 'Failed to add to cart');
    }
  };

  const handleFilterChange = (filterType: string, value: any) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<i key={i} className="bi bi-star-fill text-warning"></i>);
    }
    
    if (hasHalfStar) {
      stars.push(<i key="half" className="bi bi-star-half text-warning"></i>);
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<i key={`empty-${i}`} className="bi bi-star text-warning"></i>);
    }
    
    return stars;
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="page-content">
          <div className="container my-5 text-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
        <div className="footer-wrapper">
          <Footer />
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="page-content">
        <div id="navbar-changed">
          <SubNav />
          <CategoryTabs />

          <div className="product-list-container">
            <div className="container-fluid">
              <div className="row">
                {/* Left Sidebar - Basic Filters */}
                <div className="col-lg-2 col-md-3 filters-sidebar">
                  <div className="card">
                    <div className="card-header">
                      <h6 className="mb-0">Filters</h6>
                    </div>
                    <div className="card-body">
                      <div className="mb-3">
                        <label className="form-label">Sort By</label>
                        <select
                          className="form-select"
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                        >
                          <option value="relevance">Relevance</option>
                          <option value="price_low">Price: Low to High</option>
                          <option value="price_high">Price: High to Low</option>
                          <option value="newest">Newest First</option>
                          <option value="rating">Customer Rating</option>
                          <option value="popularity">Most Popular</option>
                        </select>
                      </div>
                      
                      <div className="mb-3">
                        <label className="form-label">Price Range</label>
                        <div className="d-flex gap-2">
                          <input
                            type="number"
                            className="form-control form-control-sm"
                            placeholder="Min"
                            value={selectedFilters.priceRange[0]}
                            onChange={(e) => handleFilterChange('priceRange', [parseInt(e.target.value) || 0, selectedFilters.priceRange[1]])}
                          />
                          <input
                            type="number"
                            className="form-control form-control-sm"
                            placeholder="Max"
                            value={selectedFilters.priceRange[1]}
                            onChange={(e) => handleFilterChange('priceRange', [selectedFilters.priceRange[0], parseInt(e.target.value) || 25000])}
                          />
                        </div>
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Minimum Rating</label>
                        <select
                          className="form-select"
                          value={selectedFilters.rating || ''}
                          onChange={(e) => handleFilterChange('rating', e.target.value ? parseInt(e.target.value) : null)}
                        >
                          <option value="">Any Rating</option>
                          <option value="4">4★ & above</option>
                          <option value="3">3★ & above</option>
                          <option value="2">2★ & above</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side - Product Grid */}
                <div className="col-lg-10 col-md-9">
                  <div className="mb-3 d-flex justify-content-between align-items-center">
                    <h4 className="mb-0">Products ({products.length})</h4>
                  </div>

                  {products.length === 0 ? (
                    <div className="text-center">
                      <h5>No products found</h5>
                      <p className="text-muted">Try adjusting your search or filters</p>
                    </div>
                  ) : (
                    <div className="row g-3">
                      {products.map((product) => (
                        <div key={product.id} className="col-xl-3 col-lg-4 col-md-6 col-sm-6 mb-3">
                          <div className="card product-card h-100">
                            <div className="position-relative">
                              {product.discount_percentage > 0 && (
                                <span className="badge bg-danger position-absolute top-0 start-0 m-2">
                                  {product.discount_percentage}% OFF
                                </span>
                              )}
                              <img
                                src={product.main_image || '/placeholder-image.jpg'}
                                alt={product.title}
                                className="card-img-top"
                                style={{ height: '200px', objectFit: 'cover' }}
                              />
                            </div>
                            <div className="card-body d-flex flex-column">
                              <Link to={`/product/${product.slug}`} className="text-decoration-none">
                                <h6 className="product-title text-dark">{product.title}</h6>
                              </Link>
                              <p className="product-desc text-muted small mb-2">
                                {product.short_description}
                              </p>
                              
                              <div className="mb-2">
                                <div className="d-flex align-items-center gap-1">
                                  {renderStars(product.average_rating)}
                                  <small className="text-muted ms-1">({product.review_count})</small>
                                </div>
                              </div>

                              <div className="price-section mb-2">
                                <span className="fw-bold text-danger">₹{product.price.toLocaleString()}</span>
                                {product.old_price > product.price && (
                                  <small className="old-price ms-2">₹{product.old_price.toLocaleString()}</small>
                                )}
                              </div>

                              <button
                                className="btn btn-sm btn-primary mt-auto w-100"
                                onClick={() => handleAddToCart(product.id)}
                                disabled={loading}
                              >
                                <i className="bi bi-cart-plus me-1"></i>
                                Add to Cart
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="footer-wrapper">
        <Footer />
      </div>
    </>
  );
};

export default ProductListPage;
