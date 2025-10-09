import { Ruler, Paintbrush, Package, Book, Feather, Check } from "lucide-react";
import styles from "./productInformation.module.css";


const ProductInformation = () => {
  return (
    <div className={styles.infocontainer}>
      <h2 className={styles.heading}>Product information</h2>

      <div className={styles.grid}>
        {/* Brand & Measurement */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <strong>Brand:</strong> UrbanStyle
          </div>
          <div className={styles.cardHeader}>
            <Ruler size={16} /> <strong>Measurement</strong>
          </div>
          <p>Dimensions: 78" x 60" x 18" (L x W x H)</p>
          <p>Suitable for Queen size mattress</p>
        </div>

        {/* Style */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <Paintbrush size={16} /> <strong>Style</strong>
          </div>
          <p>
            Contemporary design with smooth edges and minimalist finish, perfect
            for modern bedrooms.
          </p>
        </div>

        {/* Item Details */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <Package size={16} /> <strong>Item Details</strong>
          </div>
          <ul>
            <li>Solid Sheesham Wood Frame</li>
            <li>Matte Walnut Finish</li>
            <li>Weight Capacity: 200 Kg</li>
            <li>1 Year Warranty on Manufacturing Defects</li>
          </ul>
        </div>

        {/* Features */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <Check size={16} /> <strong>Features</strong>
          </div>
          <ul>
            <li>Premium Wooden Finish</li>
            <li>Scratch Resistant Surface</li>
            <li>Easy Assembly in 20 minutes</li>
            <li>Strong Wooden Slats for Mattress Support</li>
          </ul>
        </div>

        {/* User Guide */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <Book size={16} /> <strong>User Guide</strong>
          </div>
          <p>
            Easy to assemble with included toolkit. Recommended to clean with a
            dry cloth and avoid direct sunlight to maintain polish.
          </p>
        </div>

        {/* Material & Care */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <Feather size={16} /> <strong>Material & Care</strong>
          </div>
          <p>Made from high-quality Sheesham wood.</p>
          <p>
            Care: Wipe with a dry soft cloth. Avoid water and harsh chemicals.
          </p>
        </div>
      </div>

      {/* Product Description */}
      <div className={styles.description}>
        <h3>Product Description</h3>
        <p>
          Experience premium sound quality with our{" "}
          <strong>Wireless Bluetooth Headphones</strong>, designed for music
          lovers and professionals alike. Equipped with{" "}
          <strong>40mm dynamic drivers</strong>, these headphones deliver deep
          bass and crystal-clear treble for an immersive audio experience.
        </p>
        <p>
          Featuring <strong>Bluetooth 5.3</strong> for seamless connectivity up
          to 10 meters, these headphones provide stable performance with low
          latency, making them perfect for gaming, calls, and streaming. The{" "}
          <strong>noise-cancelling microphone</strong> ensures clear
          communication even in noisy environments.
        </p>
        <p>
          The lightweight design and <strong>soft cushioned earcups</strong>{" "}
          allow you to enjoy music comfortably for hours. With a powerful{" "}
          <strong>30-hour battery backup</strong> and quick charge support (10
          mins charge = 3 hrs playtime), you'll never miss a beat.
        </p>
        <ul>
          <li>Driver Size: 40mm Dynamic</li>
          <li>Connectivity: Bluetooth 5.3 + AUX support</li>
          <li>Battery Life: Up to 30 Hours</li>
          <li>Charging Port: Type-C Fast Charging</li>
          <li>
            Extra Features: Noise Cancellation, Foldable Design, Built-in Mic
          </li>
        </ul>
        <p>
          <strong>What is in box:</strong> Sofa, Legs, Screws
        </p>
      </div>
    </div>
  );
};

export default ProductInformation;
