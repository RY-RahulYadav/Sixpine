import styles from "./heroSection2.module.css"; // Import styles as a module

const HomePage = () => {
  return (
    <div className={styles.homepage}> {/* Use styles.homepage */}

      {/* Section 1 */}
      <div className={styles.card}> {/* Use styles.card */}
        <h3>Pick up where you left off</h3>
        <div className={styles.grid}> {/* Use styles.grid */}
          <div className={styles.item}> {/* Use styles.item */}
            <img src="/images/Home/sofa1.jpg" alt="Sofa" />
            <p>Sixpine Premium </p>
          </div>
          <div className={styles.item}>
            <img src="/images/Home/sofa2.jpg" alt="Sofa" />
            <p>LEGACY OF COMFORT...</p>
          </div>
          <div className={styles.item}>
            <img src="/images/Home/sofa3.jpg" alt="Sofa" />
            <p>LEGACY OF COMFORT...</p>
          </div>
          <div className={styles.item}>
            <img src="/images/Home/sofa4.jpg" alt="Sofa" />
            <p>LEGACY OF COMFORT...</p>
          </div>
        </div>
        <a href="#">See more</a>
      </div>

      {/* Section 2 */}
      <div className={`${styles.card} ${styles.special}`}>
        <h3>New home arrivals under $50</h3>
        <div className={styles.grid}>
          <div className={styles.item}>
            <img src="/images/Home/Cookware1.jpg" alt="Cookware" />
            <p>Kitchen & Dining</p>
          </div>
          <div className={styles.item}>
            <img src="/images/Home/Cans.jpg" alt="Cans" />
            <p>Home Improvement</p>
          </div>
          <div className={styles.item}>
            <img src="/images/Home/Decor.jpg" alt="Decor" />
            <p>Décor</p>
          </div>
          <div className={styles.item}>
            <img src="/images/Home/Pillow.jpg" alt="Pillow" />
            <p>Bedding & Bath</p>
          </div>
        </div>
        <a href="#">Shop the latest from Home</a>
      </div>

      {/* Section 3 */}
      <div className={styles.card}>
        <h3>Up to 60% off | Furniture & mattresses</h3>
        <div className={styles.grid}>
          <div className={styles.item}>
            <img src="/images/Home/sofa4.jpg" alt="Mattress" />
            <p>Mattresses & more</p>
          </div>
          <div className={styles.item}>
            <img src="/images/Home/sofa3.jpg" alt="Chair" />
            <p>Office chairs & more</p>
          </div>
          <div className={styles.item}>
            <img src="/images/Home/sofa2.jpg" alt="Sofa" />
            <p>Sofas & more</p>
          </div>
          <div className={styles.item}>
            <img src="/images/Home/sofa1.jpg" alt="Bean bag" />
            <p>Bean bags & more</p>
          </div>
        </div>
        <a href="#">Explore all</a>
      </div>

      {/* Section 4 */}
    <div className={`${styles.card} ${styles.special}`}>
        <h3>More items to consider</h3>
        <div className={styles.grid}>
          <div className={styles.item}>
            <img src="/images/Home/1.webp" alt="Clip1" />
            <p>MosQuick® Stainless st...</p>
          </div>
          <div className={styles.item}>
            <img src="/images/Home/2.webp" alt="Clip2" />
            <p>FDSHIP Stainless Stee...</p>
          </div>
          <div className={styles.item}>
            <img src="/images/Home/3.webp" alt="Clip3" />
            <p>WEWEL® Premium Stai...</p>
          </div>
          <div className={styles.item}>
            <img src="/images/Home/4.webp" alt="Clip4" />
            <p>Marita Heavy Duty Clot...</p>
          </div>
        </div>
        <a href="#">See more</a>
      </div>
    </div>
  );
};

export default HomePage;