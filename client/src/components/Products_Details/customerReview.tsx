import styles from "./customerReview.module.css";

const CustomerReview = () => {
  return (
    <div className={styles.Reviewcontainer}>
      

      <div className={styles.reviewSection}>
        {/* Left Side - Review Summary */}
        <div className={styles.left}>
          <h4>Customer Reviews</h4>

          <div className={styles.bars}>
            <div className={styles.bar}>
              <span>5 ★</span>
              <div className={styles.progress}>
                <div className={`${styles.fill} ${styles.fill5}`}></div>
              </div>
              <span>70%</span>
            </div>
            <div className={styles.bar}>
              <span>4 ★</span>
              <div className={styles.progress}>
                <div className={`${styles.fill} ${styles.fill4}`}></div>
              </div>
              <span>50%</span>
            </div>
            <div className={styles.bar}>
              <span>3 ★</span>
              <div className={styles.progress}>
                <div className={`${styles.fill} ${styles.fill3}`}></div>
              </div>
              <span>30%</span>
            </div>
            <div className={styles.bar}>
              <span>2 ★</span>
              <div className={styles.progress}>
                <div className={`${styles.fill} ${styles.fill2}`}></div>
              </div>
              <span>15%</span>
            </div>
            <div className={styles.bar}>
              <span>1 ★</span>
              <div className={styles.progress}>
                <div className={`${styles.fill} ${styles.fill1}`}></div>
              </div>
              <span>5%</span>
            </div>
          </div>

          {/* Add Review Form */}
          <div className={styles.addReview}>
            <h4>Add Your Review</h4>
            <div className={styles.ratingStars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <span key={star}>☆</span>
              ))}
            </div>
            <input type="text" placeholder="Your Name" />
            <textarea placeholder="Write your review here..."></textarea>
            <button>Submit Review</button>
          </div>
        </div>

        {/* Right Side - Customer Reviews */}
        <div className={styles.right}>
          <h4> <span className={styles.star}>★</span>
              <strong>Customer Reviews</strong></h4>

          <div className={styles.reviewCard}>
            <p>
              <strong>Rahul, 28 </strong>
              <span className={styles.star}>★★★★★</span>
            </p>
            <p>
              "Product quality is excellent, delivery was very fast and
              packaging was secure. The wooden finish looks premium and fits
              perfectly in my living room. Would definitely recommend this to
              friends and family."
            </p>
          </div>

          <div className={styles.reviewCard}>
            <p>
              <strong>Neha, 25 </strong>
              <span className={styles.star}>★★★★★</span>
            </p>
            <p>
              "Very happy with the purchase, product matches the description
              perfectly. The cushions are soft and comfortable, and the color is
              exactly as shown in the images. Delivery staff were also very
              polite."
            </p>
          </div>

          <div className={styles.reviewCard}>
            <p>
              <strong>Amit, 32 </strong>
              <span className={styles.star}>★★★★★</span>
            </p>
            <p>
              "Absolutely satisfied! Excellent quality and fast delivery. The
              assembly was simple and the final setup looks great. I'm impressed
              with the durability of the material and overall design. Definitely
              worth the price."
            </p>
          </div>

          <div className={styles.reviewCard}>
            <p>
              <strong>Priya, 29 </strong>
              <span className={styles.star}>★★★★☆</span>
            </p>
            <p>
              "Good product, decent quality and timely delivery. The chair is
              very comfortable and stable, perfect for home office use. The
              material feels sturdy and easy to clean, and I like the
              minimalistic design that matches my home décor."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerReview;
