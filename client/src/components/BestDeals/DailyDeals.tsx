import { useState } from 'react';
import styles from './BestDeals.module.css';

const DailyDeals = () => {
  const [visibleCount, setVisibleCount] = useState(4);

  // Mock data for daily deals
  const dailyDeals = [
    {
      id: 1,
      name: "Modern Coffee Table",
      image: "/images/Home/livingroom.jpg",
      originalPrice: "₹7,999",
      salePrice: "₹3,999",
      discount: "50%",
      rating: 4.6,
      reviewCount: 384,
      soldCount: 245
    },
    {
      id: 2,
      name: "Ergonomic Office Chair",
      image: "/images/Home/studytable.jpg",
      originalPrice: "₹12,999",
      salePrice: "₹6,499",
      discount: "50%",
      rating: 4.8,
      reviewCount: 529,
      soldCount: 317
    },
    {
      id: 3,
      name: "Wooden Bookshelf",
      image: "/images/Home/furnishing.jpg",
      originalPrice: "₹9,999",
      salePrice: "₹5,999",
      discount: "40%",
      rating: 4.7,
      reviewCount: 236,
      soldCount: 183
    },
    {
      id: 4,
      name: "Modern Floor Lamp",
      image: "/images/Home/studytable.jpg",
      originalPrice: "₹4,999",
      salePrice: "₹2,499",
      discount: "50%",
      rating: 4.5,
      reviewCount: 153,
      soldCount: 97
    },
    {
      id: 5,
      name: "Luxury Sofa Set",
      image: "/images/Home/livingroom.jpg",
      originalPrice: "₹24,999",
      salePrice: "₹14,999",
      discount: "40%",
      rating: 4.9,
      reviewCount: 642,
      soldCount: 423
    },
    {
      id: 6,
      name: "Dining Table Set",
      image: "/images/Home/studytable.jpg",
      originalPrice: "₹18,999",
      salePrice: "₹10,999",
      discount: "42%",
      rating: 4.7,
      reviewCount: 318,
      soldCount: 256
    },
    {
      id: 7,
      name: "Wall Mirror",
      image: "/images/Home/furnishing.jpg",
      originalPrice: "₹3,999",
      salePrice: "₹1,999",
      discount: "50%",
      rating: 4.4,
      reviewCount: 189,
      soldCount: 134
    },
    {
      id: 8,
      name: "Bed with Storage",
      image: "/images/Home/livingroom.jpg",
      originalPrice: "₹29,999",
      salePrice: "₹17,999",
      discount: "40%",
      rating: 4.8,
      reviewCount: 457,
      soldCount: 298
    }
  ];

  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(prev + 4, dailyDeals.length));
  };

  const visibleDeals = dailyDeals.slice(0, visibleCount);
  const hasMore = visibleCount < dailyDeals.length;

  return (
    <div className={styles.dailyDealsSection}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.highlightText}>Deals</span> of the Day
        </h2>
      </div>

      <div className={styles.dealsGrid}>
        {visibleDeals.map(deal => (
          <div key={deal.id} className={styles.dealCard}>
            <div className={styles.dealImageContainer}>
              <img src={deal.image} alt={deal.name} className={styles.dealImage} />
              <span className={styles.discountTag}>-{deal.discount}</span>
              <div className={styles.dealOverlay}>
                <button className={styles.quickViewBtn}>Quick View</button>
              </div>
            </div>
            
            <div className={styles.dealInfo}>
              <h3 className={styles.dealName}>{deal.name}</h3>
              
              <div className={styles.dealPricing}>
                <span className={styles.salePrice}>{deal.salePrice}</span>
                <span className={styles.originalPrice}>{deal.originalPrice}</span>
              </div>
              
              <div className={styles.dealRating}>
                <div className={styles.stars}>
                  <span className={styles.ratingValue}>{deal.rating}</span>
                  <span className={styles.star}>★</span>
                </div>
                <span className={styles.reviewCount}>({deal.reviewCount})</span>
              </div>

              <div className={styles.dealProgress}>
                <div className={styles.progressLabel}>
                  <span>Already Sold: {deal.soldCount}</span>
                  <span>Available: {500 - deal.soldCount}</span>
                </div>
                <div className={styles.progressBar}>
                  <div 
                    className={styles.progressFill} 
                    style={{ width: `${(deal.soldCount / 500) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div className={styles.dealActions}>
                <button className={styles.addToCartBtn}>Add to Cart</button>
                <button className={styles.wishlistBtn}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {hasMore && (
        <div className={styles.loadMoreContainer}>
          <button className={styles.loadMoreBtn} onClick={handleLoadMore}>
            Load More
          </button>
        </div>
      )}
    </div>
  );
};

export default DailyDeals;