import { useState } from "react";
import styles from "./productdetails.module.css";
import {
  FaStar,
  FaStarHalfAlt,
  FaRegStar,
  FaTrash,
  FaCheckCircle,
} from "react-icons/fa";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { BsTagFill } from "react-icons/bs";

const ProductDetails = () => {
  const images = [
    "https://m.media-amazon.com/images/I/61zwcSVl3YL._SX679_.jpg",
    "https://m.media-amazon.com/images/I/614YRo2ONvL._SX679_.jpg",
   "https://m.media-amazon.com/images/I/81B1YNHqwCL._SL1500_.jpg",
    "https://m.media-amazon.com/images/I/717-CNGEtTL._SX679_.jpg",
    "https://m.media-amazon.com/images/I/71HBQDGu1EL._SX679_.jpg"
  ];

  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [mainImage, setMainImage] = useState(images[0]);

  // Modal open/close with scroll control
  const openImageModal = () => {
    setIsImageModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeImageModal = () => {
    setIsImageModalOpen(false);
    document.body.style.overflow = 'auto';
  };

  const handleImageClick = (img: string) => {
    setMainImage(img);
  };

  // State for options
  const [selectedColor, setSelectedColor] = useState("Red");
  const [selectedSize, setSelectedSize] = useState("M");
  const [selectedPattern, setSelectedPattern] = useState("Classic");

  // Cart Summary
  const [cartQty, setCartQty] = useState(1);
  const cartPrice = 29999;

  // Modal for info icons
  interface ModalContent {
    title: string;
    text: string;
    buttons: string[];
  }
  
  const [modalContent, setModalContent] = useState<ModalContent | null>(null);

  const handleOpenModal = (type: string) => {
    if (type === "delivery") {
      setModalContent({
        title: "Free Delivery",
        text: "Get free doorstep delivery on all orders above ₹20,000.",
        buttons: ["Got it", "Shop More"],
      });
    } else if (type === "replacement") {
      setModalContent({
        title: "7 Days Replacement",
        text: "You can replace this product within 7 days of delivery if it has defects.",
        buttons: ["Understood", "See Policy"],
      });
    } else if (type === "secure") {
      setModalContent({
        title: "Secure Transaction",
        text: "Your payment is protected by end-to-end encryption and secure gateways.",
        buttons: ["Okay", "Know More"],
      });
    }
  };

  const handleCloseModal = () => {
    setModalContent(null);
  };

  return (
    <div className={styles.productPage}>
      {/* Image Modal - Fullscreen */}
      {isImageModalOpen && (
        <div 
          className={styles.imageModalOverlay}
          onClick={closeImageModal}
        >
          <div 
            className={styles.imageModal}
            onClick={(e) => e.stopPropagation()}
          >
            <button className={styles.closeBtn} onClick={closeImageModal}>
              ✖
            </button>
            
            <div className={styles.modalLayout}>
              {/* Large Image on Left */}
              <div className={styles.modalImageContainer}>
                <img src={mainImage} alt="Zoomed" className={styles.zoomedImage} />
              </div>

              {/* Thumbnails on Right */}
              <div className={styles.modalThumbnailsContainer}>
                {images.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`Thumb ${index}`}
                    className={`${styles.modalThumbnail} ${
                      mainImage === img ? styles.modalThumbnailActive : ""
                    }`}
                    onClick={() => handleImageClick(img)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <a href="#">All</a> / <a href="#">New Arrivals</a> /{" "}
        <a href="#">Category</a> / Product Name
      </div>

      <div className={styles.mainLayout}>
        {/* Image Section */}
        <div className={styles.imageSection}>
          <div className={styles.imageWrapper}>
            <img
              src={mainImage}
              alt="Product"
              className={styles.mainImage}
              onClick={openImageModal}
            />
          </div>

          {/* Thumbnails below the main image */}
          <div className={styles.thumbnails}>
            {images.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`Thumbnail ${index + 1}`}
                className={`${styles.thumbnail} ${
                  mainImage === img ? styles.activeThumb : ""
                }`}
                onClick={() => setMainImage(img)}
              />
            ))}
          </div>
        </div>

        {/* PART 2 - MIDDLE DETAILS */}
        <div className={styles.details}>
          <h2 className={styles.title}>PRODUCT TITLE GOES HERE</h2>
         <p className={styles.brand}>
  <span className={styles.brandLabel}>Brand:</span> <span className={styles.brandName}>Staples</span>
</p>


          {/* Ratings */}
          <div className={styles.ratings}>
            <FaStar /> <FaStar /> <FaStar /> <FaStarHalfAlt /> <FaRegStar />
            <span>(132 Ratings)</span>
          </div>

          {/* Price */}
        <div className={styles.priceBox}>
  {/* EMI Price */}
  <p className={styles.emiPrice}>
    ₹9,500 <span>/month (3 months)</span>
  </p>

  {/* EMI Info */}
  <p className={styles.total}>
    with <b>No Cost EMI</b> on your ICICI Credit Card{" "}
    <button className={styles.link}>
      All EMI Plans <span className={styles.icon}>▼</span>
    </button>
  </p>

  {/* Discount & Final Price */}
  <div className={styles.priceRow}>
    <span className={styles.discountBadge}>-41%</span>
    <span className={styles.finalPrice}>₹28,499</span>
  </div>

  {/* MRP */}
  <p className={styles.mrp}>
    M.R.P.: <span className={styles.strike}>₹48,599</span>
  </p>
</div>


          <h4 className={styles.offersTitle}>Available Offers</h4>
          <ul className={styles.offers}>
            <li>
              <BsTagFill className={styles.greenIcon} />
              10% off on using XYZ card
            </li>
            <li>
              <BsTagFill className={styles.greenIcon} />
              Shipping on orders above ₹20,000
            </li>
            <li>
              <FaCheckCircle className={styles.greenIcon} /> Free Delivery{" "}
              <AiOutlineInfoCircle
                className={styles.infoIcon}
                onClick={() => handleOpenModal("delivery")}
              />
            </li>
            <li>
              <FaCheckCircle className={styles.greenIcon} /> 7 Days Replacement{" "}
              <AiOutlineInfoCircle
                className={styles.infoIcon}
                onClick={() => handleOpenModal("replacement")}
              />
            </li>
            <li>
              <FaCheckCircle className={styles.greenIcon} /> Secure Transaction{" "}
              <AiOutlineInfoCircle
                className={styles.infoIcon}
                onClick={() => handleOpenModal("secure")}
              />
            </li>
          </ul>

          {/* Options */}
          <div className={styles.options}>
            <div>
              <strong>Color: </strong>
              {["Red", "Blue", "Black"].map((color) => (
                <button
                  key={color}
                  className={selectedColor === color ? styles.active : ""}
                  onClick={() => setSelectedColor(color)}
                >
                  {color}
                </button>
              ))}
            </div>
            <div>
              <strong>Size: </strong>
              {["S", "M", "L"].map((size) => (
                <button
                  key={size}
                  className={selectedSize === size ? styles.active : ""}
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
            <div>
              <strong>Pattern: </strong>
              {["Exact", "Classic"].map((pat) => (
                <button
                  key={pat}
                  className={selectedPattern === pat ? styles.active : ""}
                  onClick={() => setSelectedPattern(pat)}
                >
                  {pat}
                </button>
              ))}
            </div>
          </div>

          {/* Info Modal */}
          {modalContent && (
            <div className={styles.modalOverlay}>
              <div className={styles.modal}>
                <button className={styles.closeBtn} onClick={handleCloseModal}>
                  ✖
                </button>
                <h2>{modalContent.title}</h2>
                <p>{modalContent.text}</p>
                <div className={styles.modalButtons}>
                  {modalContent.buttons.map((btn, idx) => (
                    <button key={idx} onClick={handleCloseModal}>
                      {btn}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className={styles.productDetailsContent}>
            <h3>Key Details</h3>
            <div className={styles.keyDetailsGrid}>
              <div className={styles.detailCard}>
                <strong>Brand:</strong> Atomberg
              </div>
              <div className={styles.detailCard}>
                <strong>Depth:</strong> 12 inch
              </div>
              <div className={styles.detailCard}>
                <strong>Style:</strong> Modern
              </div>
              <div className={styles.detailCard}>
                <strong>Frame:</strong> Metal
              </div>
              <div className={styles.detailCard}>
                <strong>Assembly:</strong> Required
              </div>
              <div className={styles.detailCard}>
                <strong>Seating:</strong> 1 Person
              </div>
              <div className={styles.detailCard}>
                <strong>Shape:</strong> Round
              </div>
            </div>

            <h3>About This Item</h3>
            <ul className={styles.aboutItemList}>
              <li>High performance and energy efficient.</li>
              <li>Elegant design suitable for modern interiors.</li>
              <li>Durable metal frame ensures long-lasting use.</li>
              <li>Easy to assemble and maintain.</li>
              <li>Lightweight and portable.</li>
              <li>1-year warranty included.</li>
            </ul>

            <button
              className={styles.seeMoreBtn}
              onClick={() => {
                const el = document.getElementById("product-info");
                if (el) {
                  el.scrollIntoView({ behavior: "smooth", block: "start" });
                }
              }}
            >
              See More
            </button>
          </div>
        </div>

        {/* PART 3 - RIGHT SIDEBAR */}
        <div className={styles.sidebar}>
          {/* CART SUMMARY */}
          <div className={styles.cartSummary}>
            <h3>CART SUMMARY</h3>
            <p>
              {cartQty} x Product Title - ₹{cartPrice.toLocaleString()}
            </p>
            <p>
              <strong>Total: ₹{(cartPrice * cartQty).toLocaleString()}</strong>
            </p>

            <div className={styles.cartControls}>
              <button
                onClick={() => cartQty > 1 && setCartQty(cartQty - 1)}
                className={styles.qtyBtn}
              >
                <FaTrash />
              </button>
              <span className={styles.qty}>{cartQty}</span>
              <button
                onClick={() => setCartQty(cartQty + 1)}
                className={styles.qtyBtn}
              >
                +
              </button>
            </div>

            <button className={styles.addCart}>Add to Cart</button>
            <button className={styles.buyNow}>Buy Now</button>
          </div>

          {/* SPECIAL OFFER */}
          <div className={styles.specialOffer}>
            <img
              src="https://ochaka.vercel.app/images/products/fashion/product-1.jpg"
              alt="Offer"
            />
            <p>
              <strong>Special Offer: 20% Off</strong>
            </p>
            <button className={styles.buyNow}>Check Now</button>
          </div>
        </div>

       
      </div>
    </div>
  );
};

export default ProductDetails;