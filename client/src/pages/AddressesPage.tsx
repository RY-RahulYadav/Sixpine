import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import styles from '../styles/AddressesPage.module.css';
import Productdetails_Slider1 from "../components/Products_Details/productdetails_slider1";
import { recommendedProducts } from "../data/productSliderData";

const AddressesPage: React.FC = () => {
  return (
    <>
      <Navbar />
      <div className={styles.container}>
        {/* Breadcrumb */}
        <div className={styles.breadcrumb}>
          Your Account &gt; Your Addresses
        </div>

        {/* Page Title */}
        <h1 className={styles.pageTitle}>Your Addresses</h1>

        {/* Address Cards */}
        <div className={styles.addressGrid}>
          {/* Add New Address Card */}
          <div className={styles.addressCardAdd}>
            <div className={styles.addIcon}>+</div>
            <div className={styles.addText}>Add address</div>
          </div>

          {/* Default Address Card */}
          <div className={styles.addressCard}>
            <div className={styles.defaultLabel}>Default</div>
            <div className={styles.addressContent}>
              <p className={styles.addressLine}>_______________</p>
              <p className={styles.addressLine}>_______________</p>
              <p className={styles.addressLine}>_______________</p>
            </div>
            <div className={styles.addressActions}>
              <a href="#" className={styles.actionLink}>Add Delivery Instructions</a>
              <div className={styles.actionLinks}>
                <a href="#" className={styles.actionLink}>Edit</a> | <a href="#" className={styles.actionLink}>Remove</a>
              </div>
            </div>
          </div>

          {/* Another Address Card */}
          <div className={styles.addressCard}>
            <div className={styles.addressContent}>
              <p className={styles.addressLine}>_______________</p>
              <p className={styles.addressLine}>_______________</p>
              <p className={styles.addressLine}>_______________</p>
            </div>
            <div className={styles.addressActions}>
              <a href="#" className={styles.actionLink}>Add Delivery Instructions</a>
              <div className={styles.actionLinks}>
                <a href="#" className={styles.actionLink}>Edit</a> | <a href="#" className={styles.actionLink}>Remove</a> | <a href="#" className={styles.actionLink}>Set as default</a>
              </div>
            </div>
          </div>
        </div>
        
        {/* Pagination */}
     

        {/* Product Carousel 1 */}
        <div className={styles.carouselSection}>
          <Productdetails_Slider1 
            title="Customers Frequently viewed | Popular products in the last 7 days"
            products={recommendedProducts}
          />
        
        </div>
        
        {/* Page Counter */}
       
        {/* Products Carousel 2 */}
        <div className={styles.carouselSection}>
      <section className="mc-products-section">
          <Productdetails_Slider1 
            title="Customers Frequently viewed | Popular products in the last 7 days"
            products={recommendedProducts}
          />
        </section>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AddressesPage;