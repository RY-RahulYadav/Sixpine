import { useRef } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import styles from "./furnitureOfferSections.module.css";

interface Section {
  id: number;
  title: string;
  link: string;
  products: string[];
}

const sections: Section[] = [
  {
    id: 1,
    title: "Up to 60% Off | Furniture crafted for every corner",
    link: "See all offers",
    products: [
      "/images/Home/sofa.jpg",
      "/images/Home/bed.jpg",
      "/images/Home/bedroom.jpg",
      "/images/Home/chair.jpg",
      "/images/Home/sofa.jpg",
      "/images/Home/sofa2.jpg",
      "/images/Home/sofa3.jpg",
    ],
  },
  {
    id: 2,
    title: "Sofa for living room",
    link: "See more",
    products: [
      "/images/Home/sofa1.jpg",
      "/images/Home/sofa2.jpg",
      "/images/Home/sofa3.jpg",
      "/images/Home/sofa4.jpg",
      "/images/Home/bed.jpg",
      "/images/Home/chair.jpg",
       "/images/Home/sofa1.jpg",
      "/images/Home/sofa2.jpg",
      "/images/Home/sofa3.jpg",
      "/images/Home/sofa4.jpg",
    ],
  },
  {
    id: 3,
    title: "Related to items you've viewed",
    link: "See more",
    products: [
       "/images/Home/sofa1.jpg",
      "/images/Home/sofa2.jpg",
      "/images/Home/sofa3.jpg",
      "/images/Home/sofa4.jpg",
      "/images/Home/bed.jpg",
      "/images/Home/chair.jpg",
       "/images/Home/sofa1.jpg",
      "/images/Home/sofa2.jpg",
      "/images/Home/sofa3.jpg",
      "/images/Home/sofa4.jpg",
    ],
  },
];

const FurnitureOfferSections = () => {
  const sliderRefs = useRef<(HTMLDivElement | null)[]>([]);

  const scroll = (index: number, direction: 'left' | 'right') => {
    const slider = sliderRefs.current[index];
    if (slider) {
      const scrollAmount = 250; // scroll by 1 card width
      slider.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className={styles.offercontainer}>
      {sections.map((section, index) => (
        <div key={section.id} className={styles.section}>



          <div className={styles.sectionBox}>
            
          {/* Header */}
          <div className={styles.sectionHeader}>
            <h2>{section.title}</h2>
            <a href="/">{section.link}</a>
          </div>

          {/* Slider Wrapper */}
          <div className={styles.sliderWrapper}>
            {/* Left Button */}
            <button
              className={`${styles.navBtn} ${styles.leftBtn}`}
              onClick={() => scroll(index, "left")}
            >
              <FaChevronLeft />
            </button>

            {/* Scrollable Product List */}
            <div
              className={styles.slider}
              ref={(el) => { sliderRefs.current[index] = el; }}
            >
              {section.products.map((img, i) => (
                <div key={i} className={styles.card}>
                  <img src={img} alt={`Product ${i + 1}`} />
                </div>
              ))}
            </div>

            {/* Right Button */}
            <button
              className={`${styles.navBtn} ${styles.rightBtn}`}
              onClick={() => scroll(index, "right")}
            >
              <FaChevronRight />
            </button>
          </div>



          </div>   {/* End of sectionBox  */}
        </div>



      ))}
    </div>
  );
};

export default FurnitureOfferSections;
