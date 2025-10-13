import React from 'react';
import styles from './BulkOrderCategories.module.css';

const BulkOrderCategories: React.FC = () => {
  const categories = [
    {
      title: 'Corporate Offices',
      description: 'Complete office furniture solutions for modern workspaces',
      image: 'https://file.aiquickdraw.com/imgcompressed/img/compressed_215a8341218b7c5192cd014e00644358.webp',
      items: ['Desks & Workstations', 'Conference Tables', 'Office Chairs', 'Storage Solutions']
    },
    {
      title: 'Hospitality',
      description: 'Elegant furniture for hotels, restaurants, and resorts',
      image: 'https://file.aiquickdraw.com/imgcompressed/img/compressed_6a37c6cb1e2f2462556bc01b836b7fc8.webp',
      items: ['Guest Room Furniture', 'Lobby Seating', 'Dining Sets', 'Outdoor Furniture']
    },
    {
      title: 'Educational Institutions',
      description: 'Durable and functional furniture for schools and universities',
      image: 'https://file.aiquickdraw.com/imgcompressed/img/compressed_215a8341218b7c5192cd014e00644358.webp',
      items: ['Classroom Furniture', 'Library Shelving', 'Auditorium Seating', 'Lab Tables']
    },
    {
      title: 'Healthcare Facilities',
      description: 'Specialized furniture for hospitals and clinics',
      image: 'https://file.aiquickdraw.com/imgcompressed/img/compressed_6a37c6cb1e2f2462556bc01b836b7fc8.webp',
      items: ['Waiting Area Seating', 'Medical Cabinets', 'Patient Room Furniture', 'Staff Lounges']
    },
    {
      title: 'Retail Spaces',
      description: 'Custom displays and fixtures for retail environments',
      image: 'https://file.aiquickdraw.com/imgcompressed/img/compressed_215a8341218b7c5192cd014e00644358.webp',
      items: ['Display Units', 'Checkout Counters', 'Storage Racks', 'Seating Areas']
    },
    {
      title: 'Residential Projects',
      description: 'Bulk orders for apartments, condos, and housing complexes',
      image: 'https://file.aiquickdraw.com/imgcompressed/img/compressed_6a37c6cb1e2f2462556bc01b836b7fc8.webp',
      items: ['Living Room Sets', 'Bedroom Furniture', 'Dining Sets', 'Kitchen Cabinets']
    }
  ];

  return (
    <section className={styles.categoriesSection}>
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Industries We Serve</h2>
          <p className={styles.sectionSubtitle}>
            Tailored furniture solutions for every business sector
          </p>
        </div>

        <div className={styles.categoriesGrid}>
          {categories.map((category, index) => (
            <div key={index} className={styles.categoryCard}>
              <div className={styles.cardImage}>
                <img src={category.image} alt={category.title} />
                <div className={styles.cardOverlay}></div>
              </div>
              <div className={styles.cardContent}>
                <h3 className={styles.cardTitle}>{category.title}</h3>
                <p className={styles.cardDescription}>{category.description}</p>
                <ul className={styles.itemsList}>
                  {category.items.map((item, idx) => (
                    <li key={idx}>
                      <span className={styles.checkIcon}>✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <a href="#quote-form" className={styles.cardButton}>
                  Request Quote
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BulkOrderCategories;
