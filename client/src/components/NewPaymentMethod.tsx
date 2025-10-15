import { useState } from 'react';
import styles from './NewPaymentMethod.module.css';

const NewPaymentMethod = () => {
  const [selectedPayment, setSelectedPayment] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [selectedBank, setSelectedBank] = useState('');

  const handlePaymentChange = (value: string) => {
    setSelectedPayment(value);
  };

  return (
    <div className={styles.paymentContainer}>
      <div className={styles.paymentContent}>
        {/* Payment Method Title */}
        <h1 className={styles.mainTitle}>Payment method</h1>

        {/* Available Balance Section */}
        <div className={styles.balanceSection}>
          <h3 className={styles.sectionHeading}>Your available balance</h3>
          
          <div className={styles.paymentBox}>
            <div className={styles.paymentRow}>
              <input
                type="radio"
                id="amazon-pay-balance"
                name="payment"
                value="APB"
                checked={selectedPayment === 'APB'}
                onChange={(e) => handlePaymentChange(e.target.value)}
                className={styles.radioInput}
              />
              <label htmlFor="amazon-pay-balance" className={styles.fullWidthLabel}>
                <div className={styles.balanceInfo}>
                  <span className={styles.balanceText}>Amazon Pay Balance ₹0.00 Unavailable</span>
                </div>
                
                <div className={styles.insufficientAlert}>
                  <div className={styles.alertIcon}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <circle cx="7" cy="7" r="6.5" fill="#007185" stroke="#007185"/>
                      <text x="7" y="10" fontSize="10" fill="white" textAnchor="middle" fontWeight="bold">i</text>
                    </svg>
                  </div>
                  <span className={styles.alertText}>
                    Insufficient balance. <a href="#" className={styles.alertLink}>Add money &amp; get rewarded</a>
                  </span>
                </div>
              </label>
            </div>

            <div className={styles.promoRow}>
              <span className={styles.plusIcon}>+</span>
              <input
                type="text"
                placeholder="Enter Code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className={styles.promoInput}
                maxLength={25}
              />
              <button className={styles.applyBtn}>Apply</button>
            </div>
          </div>
        </div>

        {/* Another Payment Method Section */}
        <div className={styles.anotherMethodSection}>
          <h3 className={styles.sectionHeading}>Another payment method</h3>

          {/* Credit or Debit Card */}
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
                    <img src="https://m.media-amazon.com/images/G/31/payments-portal/r1/issuer-images/visa._CB590324569_.png" alt="Visa" className={styles.cardIcon} />
                    <img src="https://m.media-amazon.com/images/G/31/payments-portal/r1/issuer-images/mc._CB590324569_.png" alt="Mastercard" className={styles.cardIcon} />
                    <img src="https://m.media-amazon.com/images/G/31/payments-portal/r1/issuer-images/rupay._CB590324569_.png" alt="RuPay" className={styles.cardIcon} />
                    <img src="https://m.media-amazon.com/images/G/31/payments-portal/r1/issuer-images/maestro._CB590324569_.png" alt="Maestro" className={styles.cardIcon} />
                    <img src="https://m.media-amazon.com/images/G/31/payments-portal/r1/issuer-images/bob._CB590324569_.png" alt="BOB" className={styles.cardIcon} />
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Net Banking */}
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
                {selectedPayment === 'NB' && (
                  <div className={styles.bankDropdownContainer}>
                    <select
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                      className={styles.bankDropdown}
                    >
                      <option value="">Choose an Option</option>
                      <option value="ATP">Airtel Payments Bank</option>
                      <option value="AXIS">Axis Bank</option>
                      <option value="HDFC">HDFC Bank</option>
                      <option value="ICICI">ICICI Bank</option>
                      <option value="KOTAK">Kotak Bank</option>
                      <option value="SBI">State Bank of India</option>
                    </select>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Other UPI Apps */}
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

          {/* EMI Unavailable */}
          <div className={styles.paymentBox}>
            <div className={styles.paymentRow}>
              <input
                type="radio"
                id="emi"
                name="payment"
                value="EMI"
                disabled
                className={styles.radioInput}
              />
              <label htmlFor="emi" className={styles.disabledLabel}>
                <span className={styles.disabledText}>EMI Unavailable</span>
                <a href="#" className={styles.whyLink}>Why?</a>
              </label>
            </div>
          </div>

          {/* Cash on Delivery */}
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
