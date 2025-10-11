import styles from './Trending.module.css';

const TrendingProducts = () => {
  // Mock data for trending products
  const trendingProducts = [
    {
      id: 1,
      name: "Ergonomic Office Chair",
      price: "₹6,499",
      rating: 4.8,
      reviewCount: 1243,
      image: "/images/Home/studytable.jpg",
      tag: "Most Viewed",
      discount: "15% OFF"
    },
    {
      id: 2,
      name: "Minimal Bedside Table",
      price: "₹2,299",
      rating: 4.7,
      reviewCount: 856,
      image: "/images/Home/furnishing.jpg",
      tag: "Bestseller",
      discount: "20% OFF"
    },
    {
      id: 3,
      name: "Nordic Sofa Set",
      price: "₹32,999",
      rating: 4.9,
      reviewCount: 421,
      image: "/images/Home/livingroom.jpg",
      tag: "Hot Item",
      discount: "10% OFF"
    },
    {
      id: 4,
      name: "Luxury Memory Foam Mattress",
      price: "₹15,999",
      rating: 4.8,
      reviewCount: 753,
      image: "/images/Home/furnishing.jpg",
      tag: "Fast Selling",
      discount: "25% OFF"
    }
  ];

  return (
    <div className={styles.trendingProductsSection}>
      <h2 className={styles.sectionTitle}>
        <span className={styles.highlightTitle}>Trending</span> Right Now
      </h2>
      <p className={styles.sectionSubtitle}>Discover what customers are loving this week</p>

      <div className={styles.productsGrid}>
        {trendingProducts.map(product => (
          <div key={product.id} className={styles.productCard}>
            <div className={styles.productImageContainer}>
              <img src={product.image} alt={product.name} className={styles.productImage} />
              <span className={styles.trendingTag}>{product.tag}</span>
              <div className={styles.discountBadge}>{product.discount}</div>
            </div>
            <div className={styles.productInfo}>
              <h3 className={styles.productName}>{product.name}</h3>
              <div className={styles.productMeta}>
                <span className={styles.productPrice}>{product.price}</span>
                <div className={styles.productRating}>
                  <span className={styles.ratingValue}>{product.rating}</span>
                  <span className={styles.ratingIcon}>★</span>
                  <span className={styles.reviewCount}>({product.reviewCount})</span>
                </div>
              </div>
              <button className={styles.addToCartBtn}>Add to Cart</button>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.viewAllContainer}>
        <button className={styles.viewAllButton}>View All Trending Products</button>
      </div>
    </div>
  );
};

export default TrendingProducts;