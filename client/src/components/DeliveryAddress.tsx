import styles from './DeliveryAddress.module.css';

const DeliveryAddress = () => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.title}>Delivering to MIRZA SHAFAT BEG</span>
        <a href="#" className={styles.link}>Change</a>
      </div>
      <p className={styles.address}>Green City, SAHARANPUR, UTTAR PRADESH, 247001, India</p>
      <a href="#" className={styles.link}>Add delivery instructions</a>
    </div>
  );
};

export default DeliveryAddress;
