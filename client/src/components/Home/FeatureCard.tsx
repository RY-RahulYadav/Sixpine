import { useState, useEffect } from 'react';
import styles from './FeatureCard.module.css';

const FeaturesAndCTA = () => {
  const calculateTimeLeft = () => {
    // Set your target end date here
    const endDate = new Date('2025-10-01T23:59:59');
    const difference = +endDate - +new Date();
    let timeLeft = {
      days: "00",
      hours: "00",
      minutes: "00",
      seconds: "00",
    };

    if (difference > 0) {
      timeLeft = {
        days: String(Math.floor(difference / (1000 * 60 * 60 * 24))).padStart(2, "0"),
        hours: String(Math.floor((difference / (1000 * 60 * 60)) % 24)).padStart(2, "0"),
        minutes: String(Math.floor((difference / 1000 / 60) % 60)).padStart(2, "0"),
        seconds: String(Math.floor((difference / 1000) % 60)).padStart(2, "0"),
      };
    }

    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className={styles.FeatureCardcontainer}>
      {/* Top Features Bar */}
      <div className={styles.featuresBar}>
        {/* Feature 1 */}
        <div className={styles.featureItem}>
          <div className={styles.iconOrange}>
            <svg className={styles.icon} fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/>
              <path d="M7 10h2v7H7zm4-3h2v10h-2zm4 6h2v4h-2z"/>
            </svg>
          </div>
          <div>
            <div className={styles.featureCount}>100+</div>
            <div className={styles.featureText}>Experience Stores Across<br/>India</div>
          </div>
        </div>

        {/* Feature 2 */}
        <div className={styles.featureItem}>
          <div className={styles.iconOrange}>
            <svg className={styles.icon} fill="currentColor" viewBox="0 0 24 24">
              <path d="M18 18.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5-1.5.67-1.5 1.5.67 1.5 1.5 1.5zm1.5-9H17V12h4.46L19.5 9.5zM6 18.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5-1.5.67-1.5 1.5.67 1.5 1.5 1.5zM20 8l3 4v5h-2c0 1.66-1.34 3-3 3s-3-1.34-3-3H9c0 1.66-1.34 3-3 3s-3-1.34-3-3H1V6c0-1.1.9-2 2-2h14v4h3zM3 6v9h.76c.55-.61 1.35-1 2.24-1 .89 0 1.69.39 2.24 1H15V6H3z"/>
            </svg>
          </div>
          <div>
            <div className={styles.featureCount}>350+</div>
            <div className={styles.featureText}>Delivery Centers<br/>Across India</div>
          </div>
        </div>

        {/* Feature 3 */}
        <div className={styles.featureItem}>
          <div className={styles.iconOrange}>
            <svg className={styles.icon} fill="currentColor" viewBox="0 0 24 24">
              <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"/>
            </svg>
          </div>
          <div>
            <div className={styles.featureCount}>10 Lakh +</div>
            <div className={styles.featureText}>Satisfied Customers</div>
          </div>
        </div>

        {/* Feature 4 */}
        <div className={styles.featureItem}>
          <div className={styles.iconOrange}>
            <svg className={styles.icon} fill="currentColor" viewBox="0 0 24 24">
              <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
            </svg>
          </div>
          <div>
            <div className={styles.featureCount}>Lowest Price</div>
            <div className={styles.featureText}>Guarantee</div>
          </div>
        </div>

        {/* Feature 5 */}
        <div className={styles.featureItem}>
          <div className={styles.iconOrange}>
            <svg className={styles.icon} fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.5 14.5l-5.5-5.5V6h1.5v4.69l4.81 4.81-1.31 1z"/>
            </svg>
          </div>
          <div>
            <div className={styles.featureCount}>36 Months*</div>
            <div className={styles.featureText}>Warranty</div>
          </div>
        </div>
      </div>

      {/* Bottom CTA Bar */}
      <div className={styles.ctaBar}>
        {/* Timer */}
        <div className={styles.timerBox}>
          
          <div className={styles.timerNumbers}>
            <div className={styles.saleLabel}>SALE</div>
            <span>{timeLeft.days}</span>
            <span className={styles.colon}>:</span>
            <span>{timeLeft.hours}</span>
            <span className={styles.colon}>:</span>
            <span>{timeLeft.minutes}</span>
            <span className={styles.colon}>:</span>
            <span>{timeLeft.seconds}</span>
          </div>
          <div className={styles.timerLabels}>
            <div className={styles.endsIn}>Ends In</div>
            <span>Days</span>
            <span>Hrs</span>
            <span>Mins</span>
            <span>Secs</span>
          </div>
          
        </div>

        {/* Store Offer */}
        <div className={styles.offerBox}>
          <div className={styles.iconOrange}>
            <svg className={styles.iconMedium} fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          </div>
          <div>
            <div className={styles.offerText}>Visit Your Nearest Store & Get Extra UPTO</div>
            <div className={styles.discountText}>₹ 25,000 INSTANT DISCOUNT</div>
          </div>
        </div>

        {/* Info Badges */}
        <div className={styles.infoBadges}>
          <div className={styles.badgeItem}>
            <div className={styles.iconOrange}>
              <svg className={styles.iconSmall} fill="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="3.2"/>
                <path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/>
              </svg>
            </div>
            <div className={styles.badgeText}>
              <div>20 Lakh+</div>
              <div>Customers</div>
            </div>
          </div>

          <div className={styles.badgeItem}>
            <div className={styles.iconOrange}>
              <svg className={styles.iconSmall} fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z"/>
              </svg>
            </div>
            <div className={styles.badgeText}>
              <div>Free</div>
              <div>Delivery</div>
            </div>
          </div>

          <div className={styles.badgeItem}>
            <div className={styles.iconOrange}>
              <svg className={styles.iconSmall} fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <div className={styles.badgeText}>
              <div>Best</div>
              <div>Warranty*</div>
            </div>
          </div>

          <div className={styles.badgeItem}>
            <div className={styles.iconOrange}>
              <svg className={styles.iconSmall} fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/>
              </svg>
            </div>
            <div className={styles.badgeText}>
              <div>15 Lakh sq. ft.</div>
              <div>Mfg. Unit</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturesAndCTA;