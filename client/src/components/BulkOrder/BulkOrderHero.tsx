import React from 'react';
import { Link } from 'react-router-dom';
import styles from './BulkOrderHero.module.css';

const BulkOrderHero: React.FC = () => {
  return (
    <section className={styles.heroSection}>
      <div className={styles.heroOverlay}></div>
      <div className={styles.container}>
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <div className={styles.brandBadge}>
              <span>Sixpine</span>
            </div>
            <h5 className={styles.eyebrow}>BULK PURCHASING PROGRAM</h5>
            <h1 className={styles.headline}>
              Furnish Your Business with <span className={styles.highlight}>Premium Quality</span>
            </h1>
            <p className={styles.subheadline}>
              Special pricing, dedicated support, and customized solutions for corporate, hospitality, 
              and large-scale residential projects. Transform your space with Sixpine's bulk furniture solutions.
            </p>
            <div className={styles.heroStats}>
              <div className={styles.statItem}>
                <h3>50%</h3>
                <p>Average Savings</p>
              </div>
              <div className={styles.statItem}>
                <h3>500+</h3>
                <p>Projects Completed</p>
              </div>
              <div className={styles.statItem}>
                <h3>24/7</h3>
                <p>Support Available</p>
              </div>
            </div>
            <div className={styles.ctaButtons}>
              <a href="#quote-form" className={styles.btnPrimary}>Get a Quote</a>
              <Link to="/contact" className={styles.btnSecondary}>Contact Sales Team</Link>
            </div>
          </div>
          <div className={styles.heroImage}>
            <img 
              src="https://file.aiquickdraw.com/imgcompressed/img/compressed_6a37c6cb1e2f2462556bc01b836b7fc8.webp" 
              alt="Bulk Furniture Orders" 
              className={styles.mainImage}
            />
            <div className={styles.floatingCard}>
              <div className={styles.cardIcon}>✓</div>
              <div className={styles.cardContent}>
                <h4>Premium Quality</h4>
                <p>Guaranteed</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BulkOrderHero;
