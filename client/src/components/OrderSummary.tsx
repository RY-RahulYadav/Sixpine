import styles from './OrderSummary.module.css';

const OrderSummary = () => {
  return (
    <div className={styles.orderSummaryContainer}>
      <button className={styles.paymentButton}>Use this payment method</button>
      <hr className={styles.separator} />
      <div className={styles.summaryDetails}>
        <div className={styles.summaryLine}>
          <span>Items:</span>
          <span>--</span>
        </div>
        <div className={styles.summaryLine}>
          <span>Delivery:</span>
          <span>--</span>
        </div>
        <div className={`${styles.summaryLine} ${styles.orderTotal}`}>
          <span>Order Total:</span>
          <span>--</span>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
