
import styles from "./FurnitureInfoSection.module.css";

const FurnitureInfoSection = () => {
  return (
    <div className={styles.infoContainer}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <h1 className={styles.mainHeading}>
          Buy Furniture Online at Sixpine – India's One-Stop Furniture & Home Décor Destination
        </h1>
        <p className={styles.introPara}>
          A home is where comfort lives, and furniture brings that comfort to life. Whether you're setting up a new space or giving your interiors a refreshing makeover, Sixpine offers everything you need under one roof. From elegant wooden furniture to modern décor, our collection is designed to complement every style of living.
        </p>
        <p className={styles.introPara}>
          At Sixpine, we provide a vast assortment of ready-made and customizable furniture online in India. Since 2024, we've been serving customers with high-quality pieces like sofas, dining tables, wardrobes, beds, and much more—crafted from premium materials. Alongside furniture, our exclusive home décor range features wall art, planters, photo frames, tableware, glassware, and kitchen organizers. Whether you prefer minimalistic, classic, or bold designs, Sixpine makes it easy to find furniture that blends seamlessly with your lifestyle.
        </p>
      </section>

      {/* Materials Section */}
      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>Discover Furniture Materials at Sixpine</h2>
        <p className={styles.sectionIntro}>
          Every home is unique, and so are the materials that bring furniture to life. Sixpine offers furniture crafted in a variety of premium woods and materials, each with its own charm:
        </p>
        <div className={styles.gridContainer}>
          <div className={styles.card}>
            <h3>Sheesham Wood</h3>
            <p>Rich-toned, dense, and durable, perfect for bedrooms and living rooms.</p>
          </div>
          <div className={styles.card}>
            <h3>Mango Wood</h3>
            <p>Strong yet light in color, with striking natural grain patterns.</p>
          </div>
          <div className={styles.card}>
            <h3>Teak Wood</h3>
            <p>Highly durable and moisture-resistant, ideal for both indoor and outdoor spaces.</p>
          </div>
          <div className={styles.card}>
            <h3>Engineered Wood</h3>
            <p>Affordable, sleek, and versatile for budget-friendly home makeovers.</p>
          </div>
          <div className={styles.card}>
            <h3>Ash Wood</h3>
            <p>Light-colored with a smooth finish, blending natural warmth with modern design.</p>
          </div>
        </div>
      </section>

      {/* Shop by Room */}
      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>Shop by Room – Furniture for Every Corner of Your Home</h2>
        <p className={styles.sectionIntro}>
          At Sixpine, we curate furniture that doesn't just serve functionality but also transforms your space into a reflection of your style.
        </p>
        <div className={styles.roomGrid}>
          <div className={styles.roomCard}>
            <h3>Living Room</h3>
            <p>Sofas, recliners, center tables, lounge chairs, rocking chairs, TV units, and sofa-cum-beds.</p>
          </div>
          <div className={styles.roomCard}>
            <h3>Bedroom</h3>
            <p>Beds with storage, wardrobes, dressing tables, bunk beds, mattresses, and cushions.</p>
          </div>
          <div className={styles.roomCard}>
            <h3>Dining Room</h3>
            <p>Dining tables, chairs, crockery units, folding dining sets, and sideboards.</p>
          </div>
          <div className={styles.roomCard}>
            <h3>Study Room</h3>
            <p>Compact study tables, ergonomic chairs, foldable desks, and bookshelves.</p>
          </div>
          <div className={styles.roomCard}>
            <h3>Kids' Room</h3>
            <p>Playful and vibrant beds, wardrobes, and study tables.</p>
          </div>
          <div className={styles.roomCard}>
            <h3>Office Furniture</h3>
            <p>Ergonomic office chairs, workstations, executive tables, and office sofas.</p>
          </div>
          <div className={styles.roomCard}>
            <h3>Outdoor Spaces</h3>
            <p>Swing chairs, garden tables, planters, and pet houses.</p>
          </div>
          <div className={styles.roomCard}>
            <h3>Entryway & Foyer</h3>
            <p>Shoe racks, benches, and console tables to make the best first impression.</p>
          </div>
          <div className={styles.roomCard}>
            <h3>Restaurant Furniture</h3>
            <p>Hotel chairs, bar stools, trolleys, and tables for commercial needs.</p>
          </div>
        </div>
      </section>

      {/* Explore More */}
      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>Explore More at Sixpine – Beyond Furniture</h2>
        <p className={styles.sectionIntro}>
          Our vision is to make every home complete, which is why Sixpine also offers:
        </p>
        <ul className={styles.featureList}>
          <li><strong>Home Décor</strong> – Wall mirrors, lamps, photo frames, carpets, and indoor plants to elevate your interiors.</li>
          <li><strong>Home Furnishings</strong> – Cushions, curtains, and premium fabrics for a cozy vibe.</li>
          <li><strong>Lamps & Lights</strong> – Chandeliers, table lamps, pendant lights, and designer indoor lighting.</li>
          <li><strong>Outdoor Furniture</strong> – Durable and stylish options for balconies, patios, and gardens.</li>
          <li><strong>Mattresses</strong> – High-quality latex, orthopedic, and foldable mattresses for restful sleep.</li>
          <li><strong>Modular Kitchen</strong> – Functional, space-saving modular designs for modern Indian homes.</li>
        </ul>
      </section>

      {/* Upholstery Options */}
      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>Upholstery Options at Sixpine</h2>
        <p className={styles.sectionIntro}>
          Choosing the right fabric adds character and comfort to your furniture. At Sixpine, you'll find:
        </p>
        <div className={styles.upholsteryGrid}>
          <div className={styles.upholsteryCard}>
            <h3>Cotton</h3>
            <p>Durable, eco-friendly, and easy to maintain.</p>
          </div>
          <div className={styles.upholsteryCard}>
            <h3>Velvet</h3>
            <p>Luxurious, plush, and perfect for elegant living rooms.</p>
          </div>
          <div className={styles.upholsteryCard}>
            <h3>Leatherette</h3>
            <p>Stylish, practical, and affordable alternative to leather.</p>
          </div>
        </div>
      </section>

      {/* Buying Tips */}
      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>Things to Consider Before Buying Furniture Online</h2>
        <p className={styles.sectionIntro}>
          Buying furniture online can be seamless if you keep a few things in mind:
        </p>
        <ul className={styles.tipsList}>
          <li><strong>Material</strong> – Understand durability and finish.</li>
          <li><strong>Design</strong> – Pick what matches your décor style.</li>
          <li><strong>Color</strong> – Ensure it complements your interiors.</li>
          <li><strong>Size</strong> – Measure your space and check dimensions for easy fit.</li>
          <li><strong>Price</strong> – Balance between affordability and quality.</li>
          <li><strong>Reviews</strong> – Learn from customer experiences.</li>
          <li><strong>Warranty</strong> – Check coverage details.</li>
          <li><strong>Payment Security</strong> – Shop from a trusted platform like Sixpine.</li>
        </ul>
      </section>

      {/* Care Tips */}
      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>Furniture Care Tips</h2>
        <ul className={styles.careTips}>
          <li>Dust regularly with a soft cloth or vacuum brush.</li>
          <li>Clean monthly using mild water-vinegar spray and wipe dry.</li>
          <li>Use felt pads under furniture legs to prevent scratches.</li>
          <li>Call for professional inspection for long-term maintenance.</li>
        </ul>
      </section>

      {/* Why Choose Sixpine */}
      <section className={styles.whySection}>
        <h2 className={styles.sectionHeading}>Why Choose Sixpine Furniture?</h2>
        <div className={styles.whyGrid}>
          <div className={styles.whyCard}>
            <h3>Durability & Functionality</h3>
            <p>Built for years of use.</p>
          </div>
          <div className={styles.whyCard}>
            <h3>Comfort & Style</h3>
            <p>Designed to match every lifestyle.</p>
          </div>
          <div className={styles.whyCard}>
            <h3>Low Maintenance</h3>
            <p>Easy to care for, saving long-term costs.</p>
          </div>
          <div className={styles.whyCard}>
            <h3>Cost-Effective Investment</h3>
            <p>Premium designs at fair prices.</p>
          </div>
        </div>
      </section>

      {/* Experience Stores */}
      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>Sixpine Experience Stores – PAN India Presence</h2>
        <p className={styles.sectionIntro}>
          Sixpine has over 100+ experience stores across India, with many more opening soon. Visit us in person to explore the diversity of our collections, or shop online for convenience. Wherever you are, Sixpine is always nearby when you search for the best furniture shop near me.
        </p>
      </section>

      {/* Closing CTA */}
      <section className={styles.ctaSection}>
        <h2 className={styles.sectionHeading}>Shop Affordable, Premium Furniture at Sixpine</h2>
        <p className={styles.ctaPara}>
          Buying furniture is no longer a compromise between price and quality. At Sixpine, we believe in offering both—premium designs at affordable prices. From living room to bedroom, from office to outdoors, every product is thoughtfully designed to bring joy and comfort to your home.
        </p>
        <p className={styles.ctaHighlight}>
          ✨ Discover Sixpine today – where quality meets affordability, and every home finds its perfect fit.
        </p>
      </section>
    </div>
  );
};

export default FurnitureInfoSection;
