import styles from './BulkOrder.module.css';

const BulkOrderBenefits = () => {
  // Benefits data
  const benefits = [
    {
      icon: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
          <path d="M12 1V23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6313 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6313 13.6815 18 14.5717 18 15.5C18 16.4283 17.6313 17.3185 16.9749 17.9749C16.3185 18.6313 15.4283 19 14.5 19H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      title: "Volume Discounts",
      description: "Special pricing with progressive discounts based on order quantity."
    },
    {
      icon: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
          <path d="M12 15C15.866 15 19 11.866 19 8C19 4.13401 15.866 1 12 1C8.13401 1 5 4.13401 5 8C5 11.866 8.13401 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8.21 13.89L7 23L12 20L17 23L15.79 13.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      title: "Quality Guarantee",
      description: "All bulk orders undergo enhanced quality assurance inspections."
    },
    {
      icon: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
          <path d="M16 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M8 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M3 10H21" stroke="currentColor" strokeWidth="2"/>
        </svg>
      ),
      title: "Flexible Scheduling",
      description: "Plan deliveries according to your project timeline and needs."
    },
    {
      icon: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
          <path d="M12 14C12.5523 14 13 13.5523 13 13C13 12.4477 12.5523 12 12 12C11.4477 12 11 12.4477 11 13C11 13.5523 11.4477 14 12 14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M19 14C19.5523 14 20 13.5523 20 13C20 12.4477 19.5523 12 19 12C18.4477 12 18 12.4477 18 13C18 13.5523 18.4477 14 19 14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M5 14C5.55228 14 6 13.5523 6 13C6 12.4477 5.55228 12 5 12C4.44772 12 4 12.4477 4 13C4 13.5523 4.44772 14 5 14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 7C12.5523 7 13 6.55228 13 6C13 5.44772 12.5523 5 12 5C11.4477 5 11 5.44772 11 6C11 6.55228 11.4477 7 12 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 21C12.5523 21 13 20.5523 13 20C13 19.4477 12.5523 19 12 19C11.4477 19 11 19.4477 11 20C11 20.5523 11.4477 21 12 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M7.40002 17.4C7.95231 17.4 8.40002 16.9523 8.40002 16.4C8.40002 15.8477 7.95231 15.4 7.40002 15.4C6.84774 15.4 6.40002 15.8477 6.40002 16.4C6.40002 16.9523 6.84774 17.4 7.40002 17.4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M16.6 10.6C17.1523 10.6 17.6 10.1523 17.6 9.60001C17.6 9.04773 17.1523 8.60001 16.6 8.60001C16.0477 8.60001 15.6 9.04773 15.6 9.60001C15.6 10.1523 16.0477 10.6 16.6 10.6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      title: "Custom Solutions",
      description: "Tailored furniture solutions to match your specific requirements."
    },
    {
      icon: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
          <path d="M12 17V17.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9.09 9.00001C9.3251 8.33167 9.78915 7.76811 10.4 7.40914C11.0108 7.05016 11.7289 6.91894 12.4272 7.03872C13.1255 7.15849 13.7588 7.52153 14.2151 8.06353C14.6713 8.60554 14.9211 9.29152 14.92 10C14.92 12 11.92 13 11.92 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      title: "Dedicated Support",
      description: "A dedicated account manager for your corporate furniture needs."
    },
    {
      icon: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
          <path d="M17 21V19C17 16.7909 15.2091 15 13 15H5C2.79086 15 1 16.7909 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M23 21V19C22.9986 17.1771 21.7079 15.5857 20 15.13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M16 3.13C17.7699 3.58317 19.0662 5.18343 19.0662 7.01717C19.0662 8.85091 17.7699 10.4512 16 10.9043" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      title: "Corporate Program",
      description: "Join our corporate program for additional perks and benefits."
    }
  ];

  return (
    <div className={styles.benefitsSection}>
      <h2 className={styles.sectionTitle}>Why Choose Our Bulk Order Service</h2>
      <p className={styles.sectionDescription}>
        Experience these exclusive advantages when you place bulk orders with Sixpine
      </p>
      
      <div className={styles.benefitsGrid}>
        {benefits.map((benefit, index) => (
          <div key={index} className={styles.benefitCard}>
            <div className={styles.benefitIcon}>{benefit.icon}</div>
            <h3 className={styles.benefitTitle}>{benefit.title}</h3>
            <p className={styles.benefitDescription}>{benefit.description}</p>
          </div>
        ))}
      </div>
      
      <div className={styles.testimonialsSection}>
        <h3 className={styles.testimonialsTitle}>What Our Corporate Clients Say</h3>
        
        <div className={styles.testimonialCards}>
          <div className={styles.testimonialCard}>
            <div className={styles.testimonialContent}>
              <p>"The bulk order process was seamless, and the dedicated support team was exceptional in handling our corporate office setup requirements."</p>
            </div>
            <div className={styles.testimonialAuthor}>
              <div className={styles.authorAvatar}>AB</div>
              <div className={styles.authorInfo}>
                <div className={styles.authorName}>Ankit Bhatia</div>
                <div className={styles.authorPosition}>Facilities Manager, TechCorp India</div>
              </div>
            </div>
          </div>
          
          <div className={styles.testimonialCard}>
            <div className={styles.testimonialContent}>
              <p>"We furnished our entire hotel chain with Sixpine furniture. The quality, delivery timeline, and installation service exceeded our expectations."</p>
            </div>
            <div className={styles.testimonialAuthor}>
              <div className={styles.authorAvatar}>PP</div>
              <div className={styles.authorInfo}>
                <div className={styles.authorName}>Priya Patel</div>
                <div className={styles.authorPosition}>Procurement Director, Luxe Hotels</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkOrderBenefits;