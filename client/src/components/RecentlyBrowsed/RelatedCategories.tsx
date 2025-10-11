import styles from './RecentlyBrowsed.module.css';

const RelatedCategories = () => {
  // Mock data for related categories
  const categories = [
    {
      id: 1,
      name: "Office Furniture",
      productCount: 245,
      image: "/images/Home/studytable.jpg"
    },
    {
      id: 2,
      name: "Living Room",
      productCount: 328,
      image: "/images/Home/livingroom.jpg"
    },
    {
      id: 3,
      name: "Bedroom",
      productCount: 183,
      image: "/images/Home/furnishing.jpg"
    },
    {
      id: 4,
      name: "Lighting",
      productCount: 96,
      image: "/images/Home/studytable.jpg"
    }
  ];

  return (
    <div className={styles.relatedCategoriesSection}>
      <h2 className={styles.sectionTitle}>Categories You've Browsed</h2>
      
      <div className={styles.categoriesGrid}>
        {categories.map(category => (
          <div key={category.id} className={styles.categoryCard}>
            <div className={styles.categoryImageContainer}>
              <img src={category.image} alt={category.name} className={styles.categoryImage} />
              <div className={styles.categoryOverlay}>
                <h3 className={styles.categoryName}>{category.name}</h3>
                <div className={styles.productCount}>{category.productCount} products</div>
                <button className={styles.exploreBtn}>Explore</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RelatedCategories;