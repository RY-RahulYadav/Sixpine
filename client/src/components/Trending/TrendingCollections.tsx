import styles from './Trending.module.css';

const TrendingCollections = () => {
  return (
    <div className={styles.trendingCollectionsSection}>
    

      {/* Trending Analytics Banner */}
      <div className={styles.trendingAnalytics}>
        <h3 className={styles.analyticsTitle}>What's Hot This Week</h3>
        
        <div className={styles.analyticGrid}>
          <div className={styles.analyticItem}>
            <span className={styles.analyticName}>Ergonomic Chairs</span>
            <div className={styles.analyticBar}>
              <div className={styles.analyticFill} style={{ width: '92%' }}></div>
            </div>
            <span className={styles.analyticValue}>92%</span>
          </div>
          
          <div className={styles.analyticItem}>
            <span className={styles.analyticName}>Modular Sofas</span>
            <div className={styles.analyticBar}>
              <div className={styles.analyticFill} style={{ width: '86%' }}></div>
            </div>
            <span className={styles.analyticValue}>86%</span>
          </div>
          
          <div className={styles.analyticItem}>
            <span className={styles.analyticName}>Minimalist Lamps</span>
            <div className={styles.analyticBar}>
              <div className={styles.analyticFill} style={{ width: '78%' }}></div>
            </div>
            <span className={styles.analyticValue}>78%</span>
          </div>
          
          <div className={styles.analyticItem}>
            <span className={styles.analyticName}>Smart Storage</span>
            <div className={styles.analyticBar}>
              <div className={styles.analyticFill} style={{ width: '74%' }}></div>
            </div>
            <span className={styles.analyticValue}>74%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrendingCollections;