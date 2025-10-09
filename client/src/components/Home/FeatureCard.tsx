import { useState, useEffect } from 'react';
import { Store, Truck, ThumbsUp, BadgeDollarSign, Shield, MapPin, Users, Package, CheckCircle, Building2 } from 'lucide-react';
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
            <Store className={styles.icon} />
          </div>
          <div>
            <div className={styles.featureCount}>100+</div>
            <div className={styles.featureText}>Experience Stores Across<br/>India</div>
          </div>
        </div>

        {/* Feature 2 */}
        <div className={styles.featureItem}>
          <div className={styles.iconOrange}>
            <Truck className={styles.icon} />
          </div>
          <div>
            <div className={styles.featureCount}>350+</div>
            <div className={styles.featureText}>Delivery Centers<br/>Across India</div>
          </div>
        </div>

        {/* Feature 3 */}
        <div className={styles.featureItem}>
          <div className={styles.iconOrange}>
            <ThumbsUp className={styles.icon} />
          </div>
          <div>
            <div className={styles.featureCount}>10 Lakh +</div>
            <div className={styles.featureText}>Satisfied Customers</div>
          </div>
        </div>

        {/* Feature 4 */}
        <div className={styles.featureItem}>
          <div className={styles.iconOrange}>
            <BadgeDollarSign className={styles.icon} />
          </div>
          <div>
            <div className={styles.featureCount}>Lowest Price</div>
            <div className={styles.featureText}>Guarantee</div>
          </div>
        </div>

        {/* Feature 5 */}
        <div className={styles.featureItem}>
          <div className={styles.iconOrange}>
            <Shield className={styles.icon} />
          </div>
          <div>
            <div className={styles.featureCount}>36 Months*</div>
            <div className={styles.featureText}>Warranty</div>
          </div>
        </div>
      </div>

      {/* Bottom CTA Bar */}
      <div className={styles.ctaBar}>
        {/* Combined Timer and Offer Box */}
        <div className={styles.combinedBox}>
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
              <MapPin className={styles.iconMedium} />
            </div>
            <div>
              <div className={styles.offerText}>Visit Your Nearest Store & Get Extra UPTO</div>
              <div className={styles.discountText}>₹ 25,000 INSTANT DISCOUNT</div>
            </div>
          </div>
        </div>

        {/* Info Badges */}
        <div className={styles.infoBadges}>
          <div className={styles.badgeItem}>
            <div className={styles.iconOrange}>
              <Users className={styles.iconSmall} />
            </div>
            <div className={styles.badgeText}>
              <div>20 Lakh+</div>
              <div>Customers</div>
            </div>
          </div>

          <div className={styles.badgeItem}>
            <div className={styles.iconOrange}>
              <Package className={styles.iconSmall} />
            </div>
            <div className={styles.badgeText}>
              <div>Free</div>
              <div>Delivery</div>
            </div>
          </div>

          <div className={styles.badgeItem}>
            <div className={styles.iconOrange}>
              <CheckCircle className={styles.iconSmall} />
            </div>
            <div className={styles.badgeText}>
              <div>Best</div>
              <div>Warranty*</div>
            </div>
          </div>

          <div className={styles.badgeItem}>
            <div className={styles.iconOrange}>
              <Building2 className={styles.iconSmall} />
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