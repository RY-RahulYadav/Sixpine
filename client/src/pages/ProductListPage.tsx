import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import SubNav from '../components/SubNav';
import CategoryTabs from '../components/CategoryTabs';
import Footer from '../components/Footer';
import { productAPI } from '../services/api';
import { useApp } from '../context/AppContext';
import '../styles/productList.css';
import '../styles/productListModern.css';

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
  category?: string;
  brand?: string;
}

const ProductListPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { addToCart } = useApp();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    brands: [] as string[],
    priceRange: [135, 25000],
    storage: [] as string[],
    rating: null as number | null,
    deliveryDay: [] as string[],
    categories: [] as string[],
  });

  const [sortBy, setSortBy] = useState('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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

       

          <div className="product-list-modern-container">
            <div className="container-fluid">
              {/* Top Bar with Filters Toggle and View Options */}
              <div className="top-action-bar">
                <div className="left-actions">
                  <button 
                    className="btn-filter-toggle"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <i className="bi bi-funnel"></i>
                    <span>Filters</span>
                  </button>
                  <span className="results-count">{products.length} Products</span>
                </div>
                
                <div className="right-actions">
                  <div className="view-toggle">
                    <button 
                      className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                      onClick={() => setViewMode('grid')}
                    >
                      <i className="bi bi-grid-3x3-gap"></i>
                    </button>
                    <button 
                      className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                      onClick={() => setViewMode('list')}
                    >
                      <i className="bi bi-list"></i>
                    </button>
                  </div>
                  
                  <select
                    className="sort-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="relevance">Sort: Relevance</option>
                    <option value="price_low">Price: Low to High</option>
                    <option value="price_high">Price: High to Low</option>
                    <option value="newest">Newest First</option>
                    <option value="rating">Customer Rating</option>
                    <option value="popularity">Most Popular</option>
                  </select>
                </div>
              </div>

              <div className="row">
                {/* Left Sidebar - Advanced Filters */}
                <div className={`col-lg-3 col-md-4 filters-sidebar-modern ${showFilters ? 'show' : ''}`}>
                  <div className="filters-wrapper">
                    <div className="filters-header">
                      <h5>
                        <i className="bi bi-sliders me-2"></i>
                        Advanced Filters
                      </h5>
                      <button 
                        className="btn-close-filters d-md-none"
                        onClick={() => setShowFilters(false)}
                      >
                        <i className="bi bi-x-lg"></i>
                      </button>
                    </div>

                    {/* Category Filter */}
                    <div className="filter-section">
                      <h6 className="filter-title">
                        <i className="bi bi-tag me-2"></i>
                        Category
                      </h6>
                      <div className="filter-options">
                        {['Living Room', 'Bedroom', 'Dining Room', 'Office', 'Outdoor'].map((cat) => (
                          <label key={cat} className="filter-checkbox">
                            <input
                              type="checkbox"
                              checked={selectedFilters.categories.includes(cat)}
                              onChange={(e) => {
                                const updated = e.target.checked
                                  ? [...selectedFilters.categories, cat]
                                  : selectedFilters.categories.filter(c => c !== cat);
                                handleFilterChange('categories', updated);
                              }}
                            />
                            <span>{cat}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Price Range Filter */}
                    <div className="filter-section">
                      <h6 className="filter-title">
                        <i className="bi bi-currency-rupee me-2"></i>
                        Price Range
                      </h6>
                      <div className="price-inputs">
                        <div className="price-input-group">
                          <label>Min</label>
                          <input
                            type="number"
                            className="price-input"
                            placeholder="₹135"
                            value={selectedFilters.priceRange[0]}
                            onChange={(e) => handleFilterChange('priceRange', [parseInt(e.target.value) || 0, selectedFilters.priceRange[1]])}
                          />
                        </div>
                        <span className="price-separator">to</span>
                        <div className="price-input-group">
                          <label>Max</label>
                          <input
                            type="number"
                            className="price-input"
                            placeholder="₹25,000"
                            value={selectedFilters.priceRange[1]}
                            onChange={(e) => handleFilterChange('priceRange', [selectedFilters.priceRange[0], parseInt(e.target.value) || 25000])}
                          />
                        </div>
                      </div>
                      <div className="price-range-slider">
                        <input
                          type="range"
                          min="135"
                          max="25000"
                          step="100"
                          value={selectedFilters.priceRange[1]}
                          onChange={(e) => handleFilterChange('priceRange', [selectedFilters.priceRange[0], parseInt(e.target.value)])}
                          className="range-slider"
                        />
                      </div>
                      <div className="price-presets">
                        <button onClick={() => handleFilterChange('priceRange', [135, 5000])}>Under ₹5,000</button>
                        <button onClick={() => handleFilterChange('priceRange', [5000, 15000])}>₹5,000 - ₹15,000</button>
                        <button onClick={() => handleFilterChange('priceRange', [15000, 25000])}>Above ₹15,000</button>
                      </div>
                    </div>

                    {/* Material Filter */}
                    <div className="filter-section">
                      <h6 className="filter-title">
                        <i className="bi bi-tree me-2"></i>
                        Material
                      </h6>
                      <div className="filter-options">
                        {['Sheesham Wood', 'Mango Wood', 'Teak Wood', 'Engineered Wood', 'Ash Wood'].map((material) => (
                          <label key={material} className="filter-checkbox">
                            <input
                              type="checkbox"
                              checked={selectedFilters.brands.includes(material)}
                              onChange={(e) => {
                                const updated = e.target.checked
                                  ? [...selectedFilters.brands, material]
                                  : selectedFilters.brands.filter(b => b !== material);
                                handleFilterChange('brands', updated);
                              }}
                            />
                            <span>{material}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Rating Filter */}
                    <div className="filter-section">
                      <h6 className="filter-title">
                        <i className="bi bi-star me-2"></i>
                        Customer Rating
                      </h6>
                      <div className="rating-options">
                        {[4, 3, 2].map((rating) => (
                          <label key={rating} className="rating-option">
                            <input
                              type="radio"
                              name="rating"
                              checked={selectedFilters.rating === rating}
                              onChange={() => handleFilterChange('rating', rating)}
                            />
                            <span className="rating-stars">
                              {[...Array(rating)].map((_, i) => (
                                <i key={i} className="bi bi-star-fill"></i>
                              ))}
                              <span className="ms-1">& above</span>
                            </span>
                          </label>
                        ))}
                        <label className="rating-option">
                          <input
                            type="radio"
                            name="rating"
                            checked={selectedFilters.rating === null}
                            onChange={() => handleFilterChange('rating', null)}
                          />
                          <span>All Ratings</span>
                        </label>
                      </div>
                    </div>

                    {/* Clear Filters */}
                    <div className="filter-actions">
                      <button 
                        className="btn-clear-filters"
                        onClick={() => setSelectedFilters({
                          brands: [],
                          priceRange: [135, 25000],
                          storage: [],
                          rating: null,
                          deliveryDay: [],
                          categories: [],
                        })}
                      >
                        <i className="bi bi-arrow-counterclockwise me-2"></i>
                        Clear All Filters
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Side - Product Grid */}
                <div className="col-lg-9 col-md-8">
                  {products.length === 0 ? (
                    <div className="no-products-found">
                      <div className="no-products-icon">
                        <i className="bi bi-inbox"></i>
                      </div>
                      <h4>No products found</h4>
                      <p>Try adjusting your search or filters to find what you're looking for</p>
                      <button 
                        className="btn-reset"
                        onClick={() => {
                          setSelectedFilters({
                            brands: [],
                            priceRange: [135, 25000],
                            storage: [],
                            rating: null,
                            deliveryDay: [],
                            categories: [],
                          });
                        }}
                      >
                        Reset Filters
                      </button>
                    </div>
                  ) : (
                    <div className={`products-grid ${viewMode === 'list' ? 'list-view' : ''}`}>
                      {products.map((product) => (
                        <div key={product.id} className="product-card-modern">
                          <div className="product-image-wrapper">
                            {product.discount_percentage > 0 && (
                              <span className="discount-badge">
                                {product.discount_percentage}% OFF
                              </span>
                            )}
                            <Link to={`/products-details`}>
                              <img
                                src={product.main_image || '/placeholder-image.jpg'}
                                alt={product.title}
                                className="product-image"
                              />
                            </Link>
                            <button 
                              className="btn-wishlist"
                              title="Add to Wishlist"
                            >
                              <i className="bi bi-heart"></i>
                            </button>
                          </div>
                          
                          <div className="product-info">
                            <Link to={`/products-details`} className="product-link">
                              <h3 className="product-name">{product.title}</h3>
                            </Link>
                            
                            <p className="product-description">
                              {product.short_description}
                            </p>
                            
                            <div className="product-rating">
                              <div className="stars">
                                {renderStars(product.average_rating)}
                              </div>
                              <span className="review-count">({product.review_count} reviews)</span>
                            </div>

                            <div className="product-pricing">
                              <div className="price-info">
                                <span className="current-price">₹{product.price.toLocaleString()}</span>
                                {product.old_price > product.price && (
                                  <>
                                    <span className="original-price">₹{product.old_price.toLocaleString()}</span>
                                    <span className="save-amount">Save ₹{(product.old_price - product.price).toLocaleString()}</span>
                                  </>
                                )}
                              </div>
                            </div>

                            <button
                              className="btn-add-to-cart"
                              onClick={() => handleAddToCart(product.id)}
                              disabled={loading}
                            >
                              <i className="bi bi-cart-plus me-2"></i>
                              Add to Cart
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Info Section - Similar to Home Page */}
          <div className="plp-info-section">
            <div className="container-fluid">
              <div className="row">
                <div className="col-md-3 col-6">
                  <div className="info-card">
                    <i className="bi bi-truck"></i>
                    <h6>Free Delivery</h6>
                    <p>On orders above ₹5,000</p>
                  </div>
                </div>
                <div className="col-md-3 col-6">
                  <div className="info-card">
                    <i className="bi bi-shield-check"></i>
                    <h6>Quality Assured</h6>
                    <p>Premium materials used</p>
                  </div>
                </div>
                <div className="col-md-3 col-6">
                  <div className="info-card">
                    <i className="bi bi-arrow-return-left"></i>
                    <h6>Easy Returns</h6>
                    <p>7-day return policy</p>
                  </div>
                </div>
                <div className="col-md-3 col-6">
                  <div className="info-card">
                    <i className="bi bi-headset"></i>
                    <h6>24/7 Support</h6>
                    <p>Customer care available</p>
                  </div>
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
