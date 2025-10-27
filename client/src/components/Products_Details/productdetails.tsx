import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { offersAPI } from "../../services/api";
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

interface ProductDetailsProps {
  product: any;
}

const ProductDetails = ({ product }: ProductDetailsProps) => {
  const navigate = useNavigate();
  const { addToCart, state } = useApp();
  const [activeOffer, setActiveOffer] = useState<any>(null);

  // Get images from product data or use fallback
  const images = product?.images?.length > 0 
    ? product.images.map((img: any) => img.image)
    : product?.main_image 
    ? [product.main_image]
    : [
    "https://m.media-amazon.com/images/I/61zwcSVl3YL._SX679_.jpg",
    "https://m.media-amazon.com/images/I/614YRo2ONvL._SX679_.jpg",
   "https://m.media-amazon.com/images/I/81B1YNHqwCL._SL1500_.jpg",
    "https://m.media-amazon.com/images/I/717-CNGEtTL._SX679_.jpg",
    "https://m.media-amazon.com/images/I/71HBQDGu1EL._SX679_.jpg"
  ];

  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [mainImage, setMainImage] = useState(images[0]);

  // Fetch all active offers
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const response = await offersAPI.getActiveOffers();
        if (response.data && response.data.results && response.data.results.length > 0) {
          setActiveOffer(response.data.results[0]); // Get the first active offer
        }
      } catch (error) {
        console.error('Error fetching offers:', error);
      }
    };

    fetchOffers();
  }, []);

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
  const [selectedColor, setSelectedColor] = useState(
    product?.available_colors?.[0]?.color__name || product?.available_colors?.[0]?.name || "Red"
  );
  const [selectedSize, setSelectedSize] = useState(
    product?.available_sizes?.[0] || "M"
  );
  const [selectedPattern, setSelectedPattern] = useState(
    product?.available_patterns?.[0] || "Classic"
  );

  // Cart Summary
  const [cartQty, setCartQty] = useState(1);
  const cartPrice = product?.price || 29999;

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

  const handleAddToCart = async () => {
    if (!state.isAuthenticated) {
      navigate('/login');
      return;
    }

    if (product?.id) {
      try {
        await addToCart(product.id, cartQty);
        // Sidebar will open automatically via context
      } catch (error: any) {
        console.error('Error adding to cart:', error);
        alert(error.message || 'Failed to add to cart');
      }
    }
  };

  const handleBuyNow = async () => {
    if (!state.isAuthenticated) {
      navigate('/login');
      return;
    }

    if (product?.id) {
      try {
        await addToCart(product.id, cartQty);
        navigate('/cart');
      } catch (error: any) {
        console.error('Error adding to cart:', error);
        alert(error.message || 'Failed to add to cart');
      }
    }
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
                {images.map((img: string, index: number) => (
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
        <a href="#">{product?.category?.name || "Category"}</a> / {product?.title || "Product Name"}
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
            {images.map((img: string, index: number) => (
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
          <h2 className={styles.title}>{product?.title || "PRODUCT TITLE GOES HERE"}</h2>
         <p className={styles.brand}>
  <span className={styles.brandLabel}>Brand:</span> <span className={styles.brandName}>{product?.brand || "Sixpine"}</span>
</p>


          {/* Ratings */}
          <div className={styles.ratings}>
            {[1, 2, 3, 4, 5].map((star) => (
              <span key={star}>
                {star <= Math.floor(product?.average_rating || 0) ? (
                  <FaStar />
                ) : star === Math.ceil(product?.average_rating || 0) && (product?.average_rating || 0) % 1 !== 0 ? (
                  <FaStarHalfAlt />
                ) : (
                  <FaRegStar />
                )}
              </span>
            ))}
            <span>({product?.review_count || 0} Ratings)</span>
          </div>

          {/* Price */}
        <div className={styles.priceBox}>
  {/* EMI Price */}
  <p className={styles.emiPrice}>
    ₹{Math.round((product?.price || 0) / 3).toLocaleString()} <span>/month (3 months)</span>
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
    {product?.is_on_sale && product?.discount_percentage > 0 && (
      <span className={styles.discountBadge}>-{product.discount_percentage}%</span>
    )}
    <span className={styles.finalPrice}>₹{(product?.price || 0).toLocaleString()}</span>
  </div>

  {/* MRP */}
  {product?.old_price && product.old_price > product.price && (
  <p className={styles.mrp}>
      M.R.P.: <span className={styles.strike}>₹{product.old_price.toLocaleString()}</span>
  </p>
  )}
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
            {product?.available_colors && product.available_colors.length > 0 && (
            <div>
              <strong>Color: </strong>
                {product.available_colors.map((color: any, index: number) => {
                  const colorName = color.color__name || color.name;
                  return (
                <button
                      key={`color-${index}-${colorName}`}
                      className={selectedColor === colorName ? styles.active : ""}
                      onClick={() => setSelectedColor(colorName)}
                    >
                      {colorName}
                </button>
                  );
                })}
            </div>
            )}
            {product?.available_sizes && product.available_sizes.length > 0 && (
            <div>
              <strong>Size: </strong>
                {product.available_sizes.map((size: string, index: number) => (
                <button
                    key={`size-${index}-${size}`}
                  className={selectedSize === size ? styles.active : ""}
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
            )}
            {product?.available_patterns && product.available_patterns.length > 0 && (
            <div>
              <strong>Pattern: </strong>
                {product.available_patterns.map((pattern: string, index: number) => (
                <button
                    key={`pattern-${index}-${pattern}`}
                    className={selectedPattern === pattern ? styles.active : ""}
                    onClick={() => setSelectedPattern(pattern)}
                  >
                    {pattern}
                </button>
              ))}
            </div>
            )}
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
                <strong>Brand:</strong> {product?.brand || "Sixpine"}
              </div>
              {product?.specifications?.map((spec: any, index: number) => (
                <div key={index} className={styles.detailCard}>
                  <strong>{spec.name}:</strong> {spec.value}
              </div>
              ))}
            </div>

            <h3>About This Item</h3>
            <ul className={styles.aboutItemList}>
              {product?.features?.map((feature: any, index: number) => (
                <li key={index}>{feature.feature}</li>
              ))}
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

            <button className={styles.addCart} onClick={handleAddToCart}>Add to Cart</button>
            <button className={styles.buyNow} onClick={handleBuyNow}>Buy Now</button>
          </div>

          {/* SPECIAL OFFER */}
          {activeOffer ? (
            <div className={styles.specialOffer}>
              <img
                src={activeOffer.product?.main_image || "https://ochaka.vercel.app/images/products/fashion/product-1.jpg"}
                alt="Special Offer"
              />
              <p>
                <strong>{activeOffer.title}</strong>
              </p>
              <button 
                className={styles.buyNow} 
                onClick={() => navigate(`/products-details/${activeOffer.product?.slug}`)}
              >
                Check Now
              </button>
            </div>
          ) : (
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
          )}
        </div>

       
      </div>
    </div>
  );
};

export default ProductDetails;