import styles from "../styles/yourAccount.module.css";

// React Icons
import {
  FaBoxOpen,
  FaLock,
  FaUserShield,
  FaMapMarkerAlt,
  FaCreditCard,
  FaHeadset,
} from "react-icons/fa";

interface YourAccountProps {
  logoutButton?: React.ReactNode;
}

const YourAccount: React.FC<YourAccountProps> = ({ logoutButton }) => {
  return (
    <div className={styles.container}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 className={styles.heading} style={{ margin: 0 }}>Your Account</h2>
        {logoutButton}
      </div>

      {/* FIRST SECTION */}
      <div className={styles.grid}>
        <div className={styles.card}>
          <FaBoxOpen className={styles.icon} />
          <h3>Your Orders</h3>
          <p>Track, return, or buy things again</p>
        </div>

        <div className={styles.card}>
          <FaLock className={styles.icon} />
          <h3>Login & Security</h3>
          <p>Edit login, name, and mobile number</p>
        </div>

        <div className={styles.card}>
          <FaUserShield className={styles.icon} />
          <h3>Membership</h3>
          <p>View benefits and payment settings</p>
        </div>

        <div className={styles.card}>
          <FaMapMarkerAlt className={styles.icon} />
          <h3>Your Addresses</h3>
          <p>Edit addresses for orders and gifts</p>
        </div>

       

        <div className={styles.card}>
          <FaCreditCard className={styles.icon} />
          <h3>Payment Options</h3>
          <p>Edit or add payment option methods</p>
        </div>

        

        <div className={styles.card}>
          <FaHeadset className={styles.icon} />
          <h3>Contact Us</h3>
          <p>Contact our customer care via phone or chat</p>
        </div>
      </div>

      {/* LINE */}
      <hr className={styles.divider} />

      {/* SECOND SECTION */}
      <div className={styles.grid}>
        <div className={styles.card}>
          {/* <FaEnvelope className={styles.icon} /> */}
          <h3>Email alerts, messages and ads</h3>
          <p>
            Advertising preferences <br />
            Communication Preferences <br />
            Message Center
          </p>
        </div>

        <div className={styles.card}>
          {/* <FaShoppingCart className={styles.icon} /> */}
          <h3>Ordering and shopping preferences</h3>
          <p>
            <a href="#">Leave packaging feedback</a>
            <br />
            <a href="#">Shopping Lists</a>
            <br />
            <a href="#">Shopping Preferences</a>
            <br />
            <a href="#">Language Settings</a>
          </p>
        </div>

        <div className={styles.card}>
          {/* <FaTags className={styles.icon} /> */}
          <h3>More ways to pay</h3>
          <p>
            <a href="#">Coupons</a>
          </p>
        </div>

        <div className={styles.card}>
          {/* <FaSyncAlt className={styles.icon} /> */}
          <h3>Subscriptions</h3>
          <p>
            <a href="#">Email</a>
            <br />
            <a href="#">Memberships & Subscription</a>
          </p>
        </div>

        <div className={styles.card}>
          {/* <FaGift className={styles.icon} /> */}
          <h3>Shopping Programs</h3>
          <p>Subscribe & Save</p>
        </div>

        <div className={styles.card}>
          {/* <FaDatabase className={styles.icon} /> */}
          <h3>Manage your data</h3>
          <p>
            <a href="#">Request your data</a>
            <br />
            <a href="#">Close your account</a>
            <br />
            <a href="#">Privacy Notice</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default YourAccount;
