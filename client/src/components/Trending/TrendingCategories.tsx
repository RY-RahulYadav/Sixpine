import styles from './Trending.module.css';

const TrendingCategories = () => {
  // Mock data for trending categories
  const categories = [
    {
      id: 1,
      name: "Living Room",
      image: "/images/Home/livingroom.jpg",
      itemCount: 240,
      trending: "+15% this week"
    },
    {
      id: 2,
      name: "Bedroom",
      image: "/images/Home/furnishing.jpg",
      itemCount: 186,
      trending: "+12% this week"
    },
    {
      id: 3,
      name: "Home Office",
      image: "/images/Home/studytable.jpg",
      itemCount: 154,
      trending: "+28% this week"
    },
    {
      id: 4,
      name: "Kitchen & Dining",
      image: "/images/Home/furnishing.jpg",
      itemCount: 205,
      trending: "+8% this week"
    },
    {
      id: 5,
      name: "Home Decor",
      image: "/images/Home/livingroom.jpg",
      itemCount: 310,
      trending: "+20% this week"
    },
    {
      id: 6,
      name: "Outdoor Furniture",
      image: "/images/Home/studytable.jpg",
      itemCount: 128,
      trending: "+5% this week"
    }
  ];

  return (
    <div className={styles.trendingCategoriesSection}>
      <h2 className={styles.sectionTitle}>
        Popular <span className={styles.highlightTitle}>Treding Categories</span>
      </h2>
      <p className={styles.sectionSubtitle}>Explore trending categories shoppers are loving</p>

      <div className={styles.categoriesGrid}>
        {categories.map(category => (
          <div key={category.id} className={styles.categoryCard}>
            <div className={styles.categoryImageContainer}>
              <img src={category.image} alt={category.name} className={styles.categoryImage} />
              <div className={styles.categoryOverlay}>
                <span className={styles.categoryName}>{category.name}</span>
                <div className={styles.categoryMeta}>
                  <span className={styles.itemCount}>{category.itemCount} items</span>
                  <span className={styles.trendingIndicator}>{category.trending}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrendingCategories;