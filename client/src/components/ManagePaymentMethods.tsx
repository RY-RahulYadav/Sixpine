import styles from './ManagePaymentMethods.module.css';

const ManagePaymentMethods = () => {
  return (
    <div className={styles.container}>
      <div className={styles.breadcrumbs}>Your Account &rsaquo; Manage Payment Methods</div>
      <h1 className={styles.heading}>Your Payment Options</h1>
      <div className={styles.description}>
        An overview of your payment methods, settings and subscriptions with Sixpine.
      </div>

      <div className={styles.infoBox}>
        <span className={styles.infoIcon}>i</span>
        <span>
          <b>Default Purchase Preference</b><br />
          To improve your Sixpine purchasing experiences,{' '}
          <a href="#" className={styles.blueLink}>set a preferred payment method</a>.
        </span>
      </div>

      <div className={styles.preferenceCard}>
        <div className={styles.preferenceHeader}>
          <span className={styles.preferenceTitle}>Your default purchase preference</span>
          <a href="#" className={styles.updateLink}>Update preference</a>
        </div>
            
              <div className={styles.colLabel}>Address</div>
              <div className={styles.nicknameInline}>
                {/* spaced letters as in the screenshot */}
                <span>Delhi India</span>
              </div>
          
          <div className={styles.preferenceRow}>
            <div className={styles.colNickname}>
              <div className={styles.colLabel}>Nickname</div>
              <div className={styles.nicknameInline}>
                {/* spaced letters as in the screenshot */}
                <span>M</span>
                <span className={styles.dot}>.</span>
                <span>S</span>
                <span className={styles.dot}>.</span>
                <span>B</span>
                <span className={styles.name}>SAHU</span>
                <span className={styles.name}>JPUR</span>
              </div>
            </div>

            <div className={styles.colPayment}>
              <div className={styles.paymentLabel}>PAYMENT METHOD</div>
              <div className={styles.paymentWarning}>
                <span className={styles.redDot} /> Payment method required.
              </div>
              <a href="#" className={styles.setPrefLink}>Set a preference</a>
            </div>

            <div className={styles.colNote}>
              <div className={styles.preferenceNote}>
                Use this page to set your preferred payment method, shipping address, and shipping method.
              </div>
            </div>
          </div>
      </div>

      <div className={styles.savedCardsSection}>
        <div className={styles.savedCardsTitle}>Your saved credit and debit cards</div>
        <div className={styles.cardRow}>
          <img src="https://eu-images.contentstack.com/v3/assets/blt7dacf616844cf077/bltd43954aca6ba0c9b/67993a147787f41e28cea213/icici-bank.jpg?width=1280&auto=webp&quality=80&disable=upscale" alt="ICICI" className={styles.cardIcon} />
          <div className={styles.cardDetails}>
            <div className={styles.cardName}>ICICI Bank Credit Card ending in 8004</div>
            <div className={styles.cardNickname}>Nickname<br />ICICI</div>
          </div>
          <div className={styles.cardActions}>
            <button className={styles.removeBtn}>Remove</button>
            <button className={styles.editBtn}>Edit</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagePaymentMethods;
