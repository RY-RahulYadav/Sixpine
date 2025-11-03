import { useState, useEffect } from 'react';
import styles from './NewPaymentMethod.module.css';

interface NewPaymentMethodProps {
  onPaymentMethodChange?: (method: string) => void;
  razorpayEnabled?: boolean;
  codEnabled?: boolean;
}

const NewPaymentMethod: React.FC<NewPaymentMethodProps> = ({ 
  onPaymentMethodChange,
  razorpayEnabled = true,
  codEnabled = true
}) => {
  const [selectedPayment, setSelectedPayment] = useState<string>('');
  const [, setPromoCode] = useState('');
  const [selectedBank, setSelectedBank] = useState('');
  
  // Set default payment method based on availability
  useEffect(() => {
    if (!selectedPayment) {
      let defaultMethod = '';
      if (razorpayEnabled) {
        defaultMethod = 'CC'; // Default to Credit Card if Razorpay is enabled
      } else if (codEnabled) {
        defaultMethod = 'COD'; // Fallback to COD if Razorpay is disabled
      }
      if (defaultMethod) {
        setSelectedPayment(defaultMethod);
        if (onPaymentMethodChange) {
          onPaymentMethodChange(defaultMethod);
        }
      }
    }
  }, [razorpayEnabled, codEnabled, selectedPayment, onPaymentMethodChange]);

  const handlePaymentChange = (value: string) => {
    setSelectedPayment(value);
    if (onPaymentMethodChange) {
      onPaymentMethodChange(value);
    }
  };

  useEffect(() => {
    // Set default payment method on mount
    if (onPaymentMethodChange && selectedPayment) {
      onPaymentMethodChange(selectedPayment);
    }
  }, [selectedPayment, onPaymentMethodChange]);

  return (
    <div className={styles.paymentContainer}>
      <div className={styles.paymentContent}>
        {/* Payment Method Title */}
        <h1 className={styles.mainTitle}>Payment method</h1>

        {/* Available Balance Section */}
        

        {/* Another Payment Method Section */}
        <div className={styles.anotherMethodSection}>

          {/* Credit or Debit Card - Only show if Razorpay is enabled */}
          {razorpayEnabled && (
            <div className={styles.paymentBox}>
              <div className={styles.paymentRow}>
                <input
                  type="radio"
                  id="credit-card"
                  name="payment"
                  value="CC"
                  checked={selectedPayment === 'CC'}
                  onChange={(e) => handlePaymentChange(e.target.value)}
                  className={styles.radioInput}
                />
                <label htmlFor="credit-card" className={styles.cardLabel}>
                  <div className={styles.cardContent}>
                    <span className={styles.paymentMethodTitle}>Credit or debit card</span>
                    <div className={styles.cardLogosContainer}>
                      <span className={styles.cardIconText}>Visa</span>
                      <span className={styles.cardIconText}>Mastercard</span>
                      <span className={styles.cardIconText}>RuPay</span>
                      <span className={styles.cardIconText}>Maestro</span>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Net Banking - Only show if Razorpay is enabled */}
          {razorpayEnabled && (
            <div className={styles.paymentBox}>
              <div className={styles.paymentRow}>
                <input
                  type="radio"
                  id="net-banking"
                  name="payment"
                  value="NB"
                  checked={selectedPayment === 'NB'}
                  onChange={(e) => handlePaymentChange(e.target.value)}
                  className={styles.radioInput}
                />
                <label htmlFor="net-banking" className={styles.fullWidthLabel}>
                  <span className={styles.paymentMethodTitle}>Net Banking</span>
                
                </label>
              </div>
            </div>
          )}

          {/* Other UPI Apps - Only show if Razorpay is enabled */}
          {razorpayEnabled && (
            <div className={styles.paymentBox}>
              <div className={styles.paymentRow}>
                <input
                  type="radio"
                  id="upi"
                  name="payment"
                  value="UPI"
                  checked={selectedPayment === 'UPI'}
                  onChange={(e) => handlePaymentChange(e.target.value)}
                  className={styles.radioInput}
                />
                <label htmlFor="upi" className={styles.fullWidthLabel}>
                  <span className={styles.paymentMethodTitle}>Other UPI Apps</span>
                </label>
              </div>
            </div>
          )}

          

          {/* Cash on Delivery - Only show if COD is enabled */}
          {codEnabled && (
            <div className={styles.paymentBox}>
              <div className={styles.paymentRow}>
                <input
                  type="radio"
                  id="cod"
                  name="payment"
                  value="COD"
                  checked={selectedPayment === 'COD'}
                  onChange={(e) => handlePaymentChange(e.target.value)}
                  className={styles.radioInput}
                />
                <label htmlFor="cod" className={styles.fullWidthLabel}>
                  <div>
                    <span className={styles.paymentMethodTitle}>Cash on Delivery/Pay on Delivery</span>
                    <div className={styles.codSubtext}>
                      Cash, UPI and Cards accepted. <a href="#" className={styles.knowMoreLink}>Know more.</a>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Show message if no payment methods are available */}
          {!razorpayEnabled && !codEnabled && (
            <div className={styles.paymentBox}>
              <div className={styles.paymentRow}>
                <p style={{ color: '#ef4444', padding: '16px' }}>
                  No payment methods are currently available. Please contact support.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Continue Button */}
        <div className={styles.continueButtonContainer}>
          <button 
            className={styles.orangeOutlineButton}
            disabled={!selectedPayment}
          >
            Use this payment method
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewPaymentMethod;
