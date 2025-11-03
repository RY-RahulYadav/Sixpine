import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHeart, FaShoppingCart } from 'react-icons/fa';
import { productAPI } from '../../services/api';
import styles from './RecentlyBrowsed.module.css';

interface BrowsingHistoryItem {
  id: number;
  product: {
    id: number;
    title: string;
    slug: string;
    short_description?: string;
    main_image: string;
    price: string;
    old_price?: string;
    average_rating: number;
    review_count: number;
    variant_count?: number;
    available_colors?: string[];
    category: {
      name: string;
      slug: string;
    };
  };
  last_viewed: string;
  view_count: number;
}

const BrowsingHistory = () => {
  const [historyItems, setHistoryItems] = useState<BrowsingHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBrowsingHistory();
  }, []);

  const fetchBrowsingHistory = async () => {
    try {
      setLoading(true);
      const response = await productAPI.getBrowsingHistory(20);
      setHistoryItems(response.data.results || []);
    } catch (error) {
      console.error('Error fetching browsing history:', error);
      setHistoryItems([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        return diffMinutes <= 1 ? 'Just now' : `${diffMinutes} minutes ago`;
      }
      return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const formatPrice = (price: string) => {
    return `₹${parseFloat(price).toLocaleString('en-IN')}`;
  };

  const handleClearHistory = async () => {
    if (window.confirm('Are you sure you want to clear all browsing history?')) {
      try {
        await productAPI.clearBrowsingHistory();
        setHistoryItems([]);
      } catch (error) {
        console.error('Error clearing browsing history:', error);
      }
    }
  };

  const handleRemoveItem = async (productId: number) => {
    try {
      await productAPI.clearBrowsingHistory(productId);
      setHistoryItems(historyItems.filter(item => item.product.id !== productId));
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const handleProductClick = (slug: string) => {
    navigate(`/products-details/${slug}`);
  };

  if (loading) {
    return (
      <div className={styles.browsingHistorySection}>
        <div className={styles.loading}>Loading browsing history...</div>
      </div>
    );
  }

  if (historyItems.length === 0) {
    return (
      <div className={styles.browsingHistorySection}>
        <div className={styles.emptyState}>
          <h3>No Browsing History</h3>
          <p>Start browsing products to see your recently viewed items here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.browsingHistorySection}>
      <div className={styles.sectionHeader}>
        <div className={styles.titleContainer}>
          <h2 className={styles.sectionTitle}>Recently Viewed</h2>
          <span className={styles.itemCount}>{historyItems.length} items</span>
        </div>
        
        <div className={styles.controls}>
          <button 
            className={styles.clearButton}
            onClick={handleClearHistory}
          >
            Clear History
          </button>
        </div>
      </div>

      <div className={styles.historyItems}>
        {historyItems.map(item => {
          const variantCount = item.product.variant_count || 0;
          const colorCount = item.product.available_colors?.length || 0;
          const colorText = variantCount > 1 ? `+${variantCount - 1} color` : colorCount > 1 ? `+${colorCount - 1} color` : '';
          const rating = item.product.average_rating || 0;
          
          return (
            <div 
              key={item.id} 
              className={styles.craftedProductCard}
              onClick={() => handleProductClick(item.product.slug)}
              style={{ cursor: 'pointer' }}
            >
              <img 
                src={item.product.main_image || '/images/placeholder.jpg'} 
                alt={item.product.title} 
                className={styles.productImg1}
              />
              <h4 className={styles.productTitle}>
                {item.product.title}
              </h4>
              <p className={styles.productDesc}>
                {item.product.short_description || item.product.category.name}
              </p>
              
              <div className={styles.productRating}>
                {'★'.repeat(Math.floor(rating))}
                {'☆'.repeat(5 - Math.floor(rating))}
                <span> ({item.product.review_count} reviews)</span>
                {colorText && (
                  <div className={styles.colorSwatches}>
                    <span className={styles.moreCount}>{colorText}</span>
                  </div>
                )}
              </div>
              
              <div className={styles.productPrices}>
                {item.product.old_price && (
                  <span className={styles.oldPrice}>{formatPrice(item.product.old_price)}</span>
                )}
                <span className={styles.newPrice}>{formatPrice(item.product.price)}</span>
              </div>

              <div 
                className={styles.actionRow}
                onClick={(e) => e.stopPropagation()}
              >
                <button 
                  className={styles.buyBtn}
                  onClick={() => handleProductClick(item.product.slug)}
                >
                  Buy Now
                </button>
                <div className={styles.productIcons}>
                  <FaHeart 
                    onClick={(e) => {
                      e.stopPropagation();
                      // TODO: Add to wishlist
                    }}
                    style={{ cursor: 'pointer' }} 
                  />
                  <FaShoppingCart 
                    onClick={(e) => {
                      e.stopPropagation();
                      // TODO: Add to cart
                    }}
                    style={{ cursor: 'pointer' }} 
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BrowsingHistory;