import { useState } from "react";
import styles from "./furnitureCategories.module.css";

const categories = [
  { id: 1, title: "Sofas", category: "Living", img: "/images/Home/sofa1.jpg" },
  { id: 2, title: "Beds", category: "Bedroom", img: "/images/Home/bedroom.jpg" },
  { id: 3, title: "Dining", category: "Dining", img: "/images/Home/dining.jpg" },
  { id: 4, title: "Tv units", category: "Living", img: "/images/Home/tv.jpg" },
  { id: 5, title: "Coffee tables", category: "Living", img: "/images/Home/coffee.jpg" },
  { id: 6, title: "Cabinets", category: "Living", img: "/images/Home/cabinet.jpg" },
  { id: 7, title: "Mattresses", category: "Mattress", img: "/images/Home/mattress.jpg" },
  { id: 8, title: "Wardrobes", category: "Bedroom", img: "/images/Home/wardrobe.jpg" },
  { id: 9, title: "Sofa cum bed", category: "Bedroom", img: "/images/Home/sofacumbed.jpg" },
  { id: 10, title: "Bookshelves", category: "Decor", img: "/images/Home/bookshelf.jpg" },
  { id: 11, title: "All study tables", category: "Study", img: "/images/Home/studytable.jpg" },
  { id: 12, title: "Home furnishing", category: "Decor", img: "/images/Home/furnishing.jpg" }
];

const sliderItems = [
  { id: 1, title: "Living Room", img: "/images/Home/livingroom.jpg" },
  { id: 2, title: "Bedroom", img: "/images/Home/bedroom.jpg" },
  { id: 3, title: "Dining Room", img: "/images/Home/diningroom.jpg" },
  { id: 4, title: "Study", img: "/images/Home/studytable.jpg" },
  { id: 5, title: "Outdoor", img: "/images/Home/outdoor.jpg" },
  { id: 6, title: "Living Room", img: "/images/Home/livingroom.jpg" },
  { id: 7, title: "Bedroom", img: "/images/Home/bedroom.jpg" },
  { id: 8, title: "Dining Room", img: "/images/Home/diningroom.jpg" }
];

export default function FurnitureCategories() {
  const [filter, setFilter] = useState("All");
  const [startIndex, setStartIndex] = useState(0);
  const [showMore, setShowMore] = useState(false);

  const shortText =
    "Buy Furniture Online from our extensive collection of wooden furniture units to give your home an elegant touch at affordable prices.";
  const fullText =
    "Buy Furniture Online from our extensive collection of wooden furniture units to give your home an elegant touch at affordable prices. We offer a wide range of Lorem ipsum dolor sit amet consectetur adipisicing elit. Ducimus deleniti dolor a aspernatur esse necessitatibus nihil blanditiis repellat ipsa ut praesentium qui, neque quidem soluta earum impedit eveniet corrupti fugit.";


  const filteredCategories =
    filter === "All"
      ? categories
      : categories.filter((item) => item.category === filter);

  const visibleCount = 5; // show 5 cards like screenshot

  const nextSlide = () => {
    if (startIndex + visibleCount < sliderItems.length) {
      setStartIndex(startIndex + 1);
    }
  };

  const prevSlide = () => {
    if (startIndex > 0) {
      setStartIndex(startIndex - 1);
    }
  };

  return (
    <>
    <section className="category-section">
    <div className={styles.container}>
      {/* Section 1 - Categories */}
      <h2 className={styles.title}>Shop By Categories</h2>
      <div className={styles.filterButtons}>
        {["All", "Living", "Bedroom", "Dining", "Mattress", "Decor", "Study"].map(
          (btn) => (
            <button
              key={btn}
              className={filter === btn ? styles.active : ""}
              onClick={() => setFilter(btn)}
            >
              {btn}
            </button>
          )
        )}
      </div>

     

      <div className={styles.gridContainer}>
        {filteredCategories.map((item) => (
          <div key={item.id} className={styles.card}>
            <img src={item.img} alt={item.title} />
            <p>{item.title}</p>
          </div>
        ))}
      </div>

      {/* Section 2 - Slider */}
      
    </div>
    </section>
    <div className={styles.sliderSection}>
        <h2 className={styles.title2}>India's Finest Online Furniture Brand</h2>
         <p className={styles.subtitle2}>
        {showMore ? fullText : shortText}{" "}
        <span
          className={styles.moreLink}
          onClick={() => setShowMore(!showMore)}
        >
          {showMore ? " Show less" : "...more"}
        </span>
      </p>
      

        <div className={styles.sliderWrapper}>
          <button
            className={`${styles.navBtn} ${styles.left}`}
            onClick={prevSlide}
            disabled={startIndex === 0}
          >
            &#8249;
          </button>

          <div className={styles.sliderTrack}>
            {sliderItems
              .slice(startIndex, startIndex + visibleCount)
              .map((item) => (
                <div key={item.id} className={styles.sliderCard}>
                  <img src={item.img} alt={item.title} />
                  <p>{item.title}</p>
                </div>
              ))}
          </div>

          <button
            className={`${styles.navBtn} ${styles.right}`}
            onClick={nextSlide}
            disabled={startIndex + visibleCount >= sliderItems.length}
          >
            &#8250;
          </button>
        </div>
      </div>
  </>);
}
