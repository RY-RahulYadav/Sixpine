import { useApp } from '../context/AppContext';
import styles from './OrderSummary.module.css';

interface OrderSummaryProps {
  onPaymentClick?: () => void;
  paymentDisabled?: boolean;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ onPaymentClick, paymentDisabled }) => {
  const { state } = useApp();

  // Calculate totals
  const subtotal = state.cart?.total_price || 0;
  const totalItems = state.cart?.total_items || 0;
  const shippingCost = subtotal >= 500 ? 0 : 50;
  const tax = subtotal * 0.05;
  const total = subtotal + shippingCost + tax;

  const handlePaymentClick = () => {
    if (paymentDisabled) return;
    if (onPaymentClick) {
      onPaymentClick();
    }
  };

  return (
    <div className={styles.orderSummaryContainer}>
      <button 
        className={`${styles.paymentButton} ${paymentDisabled ? styles.disabled : ''}`}
        onClick={handlePaymentClick}
        disabled={paymentDisabled}
      >
        Use this payment method
      </button>
      <hr className={styles.separator} />
      <div className={styles.summaryDetails}>
        <div className={styles.summaryLine}>
          <span>Items ({totalItems}):</span>
          <span>₹{subtotal.toFixed(2)}</span>
        </div>
        <div className={styles.summaryLine}>
          <span>Delivery:</span>
          <span>{shippingCost === 0 ? 'Free' : `₹${shippingCost.toFixed(2)}`}</span>
        </div>
        <div className={styles.summaryLine}>
          <span>Tax (5%):</span>
          <span>₹{tax.toFixed(2)}</span>
        </div>
        <div className={`${styles.summaryLine} ${styles.orderTotal}`}>
          <span>Order Total:</span>
          <span>₹{total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
