import styles from "../styles/global_selling.module.css";

import { FaBullhorn, FaCheck, FaCog } from "react-icons/fa";

function AdvertisingPreferences() {
  return (
    <div className={styles.main}>
      <section className={styles.globalSection}>
        <div className={styles.container}>
          <div className={styles.row}>
            <div className={styles.col}>
              
              <h2 className={styles.heading}>
                <FaCog style={{ marginRight: '10px', verticalAlign: 'middle' }} />
                Advertising Preferences
              </h2>

              <p className={styles.text}>
                We use your browsing and shopping activity to show you more relevant ads.
              </p>
              <p className={styles.text}>
                <b>Turn ON button:</b> Get personalized offers, product recommendations, and promotions.
              </p>
              <p className={styles.text}>
                <b>Turn OFF button:</b> You'll still see ads, but they may be less relevant.
              </p>

              <h3 className={styles.subheading}>
                <FaBullhorn style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                Advertising Preferences
              </h3>

              <p className={styles.text}>
                We respect your privacy and want to give you full control over how we use your information for advertising.
              </p>

              <h3 className={styles.subheading}>1. Personalized Ads</h3>
              <p className={styles.text}>
                <b>Personalized ads</b> are tailored to your interests based on your browsing and shopping activity...
              </p>

              <h3 className={styles.subheading}>2. Non-Personalized Ads</h3>
              <p className={styles.text}>
                If you opt out of personalized ads, you will still see advertisements...
              </p>

              <h3 className={styles.subheading}>3. How We Use Your Data</h3>
              <ul className={styles.list}>
                <li><FaCheck style={{ marginRight: '8px', color: '#4CAF50' }} /> <b>Browsing history</b> on our website/app</li>
                <li><FaCheck style={{ marginRight: '8px', color: '#4CAF50' }} /> <b>Demographic information</b> (age group, location, device type)</li>
                <li><FaCheck style={{ marginRight: '8px', color: '#4CAF50' }} /> <b>Interactions</b> with promotions and campaigns</li>
                <li><FaCheck style={{ marginRight: '8px', color: '#4CAF50' }} /> <b>Manage cookie preferences</b> to control data collection for ads</li>
              </ul>

              <h3 className={styles.subheading}>4. Your Choices</h3>
              <ul className={styles.list}>
                <li><FaCheck style={{ marginRight: '8px', color: '#4CAF50' }} /> <b>Opt in or out</b> of personalized advertising...</li>
                <li><FaCheck style={{ marginRight: '8px', color: '#4CAF50' }} /> <b>Request deletion</b> of your advertising data...</li>
              </ul>

              <h3 className={styles.subheading}>5. Third-Party Advertising Partners</h3>
              <p className={styles.text}>
                We may work with trusted partners (e.g., Google, Meta, ad networks)...
              </p>

              <h3 className={styles.subheading}>6. Why You Still See Ads After Opt Out</h3>
              <p className={styles.text}>
                Even if you turn off personalized ads, you may still see...
              </p>

            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AdvertisingPreferences;
