import styles from './RecentlyBrowsed.module.css';

const BrowsingHistory = () => {
  // Mock browsing history data
  const historyItems = [
    {
      id: 1,
      name: "Ergonomic Office Chair",
      category: "Office Furniture",
      price: "₹6,499",
      image: "/images/Home/studytable.jpg",
      viewedAt: "Today, 10:30 AM",
      rating: 4.8
    },
    {
      id: 2,
      name: "Modern Coffee Table",
      category: "Living Room",
      price: "₹3,999",
      image: "/images/Home/livingroom.jpg",
      viewedAt: "Today, 9:15 AM",
      rating: 4.6
    },
    {
      id: 3,
      name: "Queen Size Bed Frame",
      category: "Bedroom",
      price: "₹12,999",
      image: "/images/Home/furnishing.jpg",
      viewedAt: "Yesterday, 8:45 PM",
      rating: 4.9
    },
    {
      id: 4,
      name: "Minimalist Desk Lamp",
      category: "Lighting",
      price: "₹1,299",
      image: "/images/Home/studytable.jpg",
      viewedAt: "Yesterday, 6:30 PM",
      rating: 4.5
    },
    {
      id: 5,
      name: "3-Seater Fabric Sofa",
      category: "Living Room",
      price: "₹24,999",
      image: "/images/Home/livingroom.jpg",
      viewedAt: "2 days ago",
      rating: 4.7
    },
    {
      id: 6,
      name: "Wooden Dining Table",
      category: "Dining",
      price: "₹15,999",
      image: "/images/Home/furnishing.jpg",
      viewedAt: "3 days ago",
      rating: 4.8
    }
  ];

  return (
    <div className={styles.browsingHistorySection}>
      <div className={styles.sectionHeader}>
        <div className={styles.titleContainer}>
          <h2 className={styles.sectionTitle}>Recently Viewed</h2>
          <span className={styles.itemCount}>{historyItems.length} items</span>
        </div>
        
        <div className={styles.controls}>
          <div className={styles.viewControls}>
             
            
          
          </div>
          
          <button className={styles.clearButton}>
            Clear History
          </button>
        </div>
      </div>

      <div className={styles.historyItems}>
        {historyItems.map(item => (
          <div key={item.id} className={styles.historyItem}>
            <div className={styles.itemImageContainer}>
              <img src={item.image} alt={item.name} className={styles.itemImage} />
              <span className={styles.viewedTime}>{item.viewedAt}</span>
            </div>
            <div className={styles.itemDetails}>
              <div className={styles.itemCategory}>{item.category}</div>
              <h3 className={styles.itemName}>{item.name}</h3>
              <div className={styles.itemRating}>
                <span className={styles.ratingValue}>{item.rating}</span>
                <span className={styles.ratingIcon}>★</span>
              </div>
              <div className={styles.itemPrice}>{item.price}</div>
              <div className={styles.itemActions}>
                <button className={styles.addToCartBtn}>Add to Cart</button>
                <button className={styles.saveBtn}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M19 21L12 16L5 21V5C5 4.46957 5.21071 3.96086 5.58579 3.58579C5.96086 3.21071 6.46957 3 7 3H17C17.5304 3 18.0391 3.21071 18.4142 3.58579C18.7893 3.96086 19 4.46957 19 5V21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BrowsingHistory;