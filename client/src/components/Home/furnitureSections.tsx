import { useState, useRef } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import styles from "./furnitureSections.module.css";

interface Product {
  id: number;
  title: string;
  subtitle: string;
  price: string;
  oldPrice: string;
  discount: string;
  rating: number;
  reviews: number;
  image: string;
}

const data = {
  discover: [
    {
      id: 1,
      title: "Samvaad 3 Seater Sofa with Cane Accents",
      subtitle: "(Cotton, Jade Ivory)",
      price: "₹49,989",
      oldPrice: "₹79,999",
      discount: "38% off",
      rating: 4,
      reviews: 14,
      image: "/images/Home/bed.jpg",
    },
    {
      id: 2,
      title: "Ayaan Sheesham Wood 3 Seater Sofa Cum Bed",
      subtitle: "with Cane Weaving & Premium Finish",
      price: "₹63,989",
      oldPrice: "₹90,845",
      discount: "29% off",
      rating: 5,
      reviews: 136,
      image: "/images/Home/bedroom.jpg",
    },
    {
      id: 3,
      title: "Grace Premium Solid Wood Shoe Cabinet",
      subtitle: "With Cane Detailing (Mango Finish)",
      price: "₹28,989",
      oldPrice: "₹46,935",
      discount: "37% off",
      rating: 4,
      reviews: 14,
      image: "/images/Home/sofa.jpg",
    },
    {
      id: 4,
      title: "Grace Premium Solid Wood Shoe Cabinet",
      subtitle: "With Cane Detailing (Mango Finish)",
      price: "₹28,989",
      oldPrice: "₹46,935",
      discount: "37% off",
      rating: 3,
      reviews: 14,
      image: "/images/Home/sofa.jpg",
    },
    {
      id: 5,
      title: "Samvaad 3 Seater Sofa with Cane Accents",
      subtitle: "(Cotton, Jade Ivory)",
      price: "₹49,989",
      oldPrice: "₹79,999",
      discount: "38% off",
      rating: 4,
      reviews: 14,
      image: "/images/Home/bed.jpg",
    },
    {
      id: 6,
      title: "Ayaan Sheesham Wood 3 Seater Sofa Cum Bed",
      subtitle: "with Cane Weaving & Premium Finish",
      price: "₹63,989",
      oldPrice: "₹90,845",
      discount: "29% off",
      rating: 5,
      reviews: 136,
      image: "/images/Home/bedroom.jpg",
    },
    {
      id: 7,
      title: "Grace Premium Solid Wood Shoe Cabinet",
      subtitle: "With Cane Detailing (Mango Finish)",
      price: "₹28,989",
      oldPrice: "₹46,935",
      discount: "37% off",
      rating: 4,
      reviews: 14,
      image: "/images/Home/sofa.jpg",
    },
    {
      id: 8,
      title: "Grace Premium Solid Wood Shoe Cabinet",
      subtitle: "With Cane Detailing (Mango Finish)",
      price: "₹28,989",
      oldPrice: "₹46,935",
      discount: "37% off",
      rating: 3,
      reviews: 14,
      image: "/images/Home/sofa.jpg",
    },
  ],

  topRated: [
    {
      id: 9,
      title: "Lotus Premium Sheesham Wood King Size Bed",
      subtitle: "with Drawer Storage (Honey Finish)",
      price: "₹55,989",
      oldPrice: "₹82,000",
      discount: "31% off",
      rating: 5,
      reviews: 72,
      image: "/images/Home/bed.jpg",
    },
    {
      id: 10,
      title: "Valence 6 Seater Sheesham Wood Dining Set",
      subtitle: "(Teak Finish)",
      price: "₹85,989",
      oldPrice: "₹1,42,342",
      discount: "40% off",
      rating: 4,
      reviews: 47,
      image: "/images/Home/bed.jpg",
    },
    {
      id: 11,
      title: "Another Premium Sofa",
      subtitle: "Modern Style",
      price: "₹38,989",
      oldPrice: "₹60,000",
      discount: "36% off",
      rating: 3,
      reviews: 51,
      image: "/images/Home/bed.jpg",
    },
    {
      id: 12,
      title: "Samvaad 3 Seater Sofa with Cane Accents",
      subtitle: "(Cotton, Jade Ivory)",
      price: "₹49,989",
      oldPrice: "₹79,999",
      discount: "38% off",
      rating: 4,
      reviews: 14,
      image: "/images/Home/bed.jpg",
    },
    {
      id: 13,
      title: "Ayaan Sheesham Wood 3 Seater Sofa Cum Bed",
      subtitle: "with Cane Weaving & Premium Finish",
      price: "₹63,989",
      oldPrice: "₹90,845",
      discount: "29% off",
      rating: 5,
      reviews: 136,
      image: "/images/Home/bedroom.jpg",
    },
    {
      id: 14,
      title: "Grace Premium Solid Wood Shoe Cabinet",
      subtitle: "With Cane Detailing (Mango Finish)",
      price: "₹28,989",
      oldPrice: "₹46,935",
      discount: "37% off",
      rating: 4,
      reviews: 14,
      image: "/images/Home/sofa.jpg",
    },
    {
      id: 15,
      title: "Grace Premium Solid Wood Shoe Cabinet",
      subtitle: "With Cane Detailing (Mango Finish)",
      price: "₹28,989",
      oldPrice: "₹46,935",
      discount: "37% off",
      rating: 3,
      reviews: 14,
      image: "/images/Home/sofa.jpg",
    },
  ],
};

// ⭐ Function to render stars dynamically
const renderStars = (rating: number) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <span
        key={i}
        className={i <= rating ? styles.starFilled : styles.starEmpty}
      >
        ★
      </span>
    );
  }
  return stars;
};

const Section = ({ title, subtitle, products, extraClass }: { 
  title: string; 
  subtitle: string; 
  products: Product[]; 
  extraClass?: string 
}) => {
  const [viewAll, setViewAll] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const scrollAmount = () => {
    if (listRef.current) {
      const card = listRef.current.querySelector(`.${styles.productCard}`) as HTMLElement;
      if (card) {
        // Calculate card width + gap
        const cardWidth = card.offsetWidth;
        const gap = parseInt(window.getComputedStyle(listRef.current).getPropertyValue('gap'));
        return cardWidth + gap;
      }
    }
    return 300; // Fallback scroll amount
  };

  const scrollLeft = () => {
    if (listRef.current) {
      listRef.current.scrollBy({ left: -scrollAmount(), behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (listRef.current) {
      listRef.current.scrollBy({ left: scrollAmount(), behavior: "smooth" });
    }
  };

  return (
    <div className={`${styles.section} ${extraClass || ""}`}>
      <div className={styles.sectionHeader}>
        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
        <button
          className={styles.viewBtn}
          onClick={() => setViewAll(!viewAll)}
          aria-label={viewAll ? "Show Less" : "View All"}
        >
          <span className={styles.viewBtnText}>{viewAll ? "Show Less" : "View All"}</span>
          <span className={styles.viewBtnIcon}>
            <FaChevronRight />
          </span>
        </button>
      </div>

      <div className={styles.productWrapper}>
        {!viewAll && (
          <button className={styles.navBtn} onClick={scrollLeft}>
            <FaChevronLeft />
          </button>
        )}

        <div
          ref={listRef}
          className={`${styles.productList} ${
            viewAll ? styles.grid : styles.scroll
          }`}
        >
          {products.map((p) => (
            <div key={p.id} className={styles.productCard}>
              <img src={p.image} alt={p.title} />
              <h3>{p.title}</h3>
              <p className={styles.subtitle}>{p.subtitle}</p>
              <div className={styles.rating}>
                {renderStars(p.rating)} <span>({p.reviews})</span>
              </div>

              <div className={styles.priceBlock}>
                <span className={styles.discount}>{p.discount}</span>
                <span className={styles.current}>{p.price}</span>

                <span className={styles.old}>{p.oldPrice}</span>
              </div>
            </div>
          ))}
        </div>

        {!viewAll && (
          <button className={styles.navBtn} onClick={scrollRight}>
            <FaChevronRight />
          </button>
        )}
      </div>
    </div>
  );
};

const FurnitureSections = () => {
  return (
    <div className={styles.furnitureContainer}>
      <Section
        title="Discover what’s new"
        subtitle="Designed to refresh your everyday life"
        products={data.discover}
        extraClass={styles.discoverSection}
      />
      <div style={{ marginTop: "60px" }}>
      <Section
        title="Top-Rated by Indian Homes"
        subtitle="Crafted to complement Indian lifestyles"
          products={data.discover}
        extraClass={styles.discoverSection}
      /></div>
    </div>
  );
};

export default FurnitureSections;