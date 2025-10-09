import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import SubNav from '../components/SubNav';
import CategoryTabs from '../components/CategoryTabs';
import Footer from '../components/Footer';
import ProductImageGallery from '../components/ProductDetail/ProductImageGallery';
import ProductInfo from '../components/ProductDetail/ProductInfo';
import ProductPurchaseCard from '../components/ProductDetail/ProductPurchaseCard';
import ProductCarousel from '../components/ProductCarousel';
import ProductInformation from '../components/ProductDetail/ProductInformation';
import CustomerReviews from '../components/ProductDetail/CustomerReviews';
import Breadcrumb from '../components/ProductDetail/Breadcrumb';
import AdBanner from '../components/ProductDetail/AdBanner';
import Modals from '../components/ProductDetail/Modals';
import { productAPI } from '../services/api';
import { useApp } from '../context/AppContext';
import '../styles/products.css'
// import BannerCards from '../components/Home/bannerCards';
import SuggestedBox from '../components/ProductDetail/suggestedBox';

interface Product {
  id: number;
  title: string;
  description: string;
  short_description: string;
  category: any;
  brand: any;
  price: number;
  old_price?: number;
  discount_percentage: number;
  stock_quantity: number;
  availability: string;
  sku: string;
  weight?: number;
  dimensions?: string;
  slug: string;
  images: any[];
  attributes: any[];
  variants: any[];
  reviews: any[];
  average_rating: number;
  review_count: number;
  discount_amount: number;
  is_on_sale: boolean;
  related_products: any[];
  created_at: string;
  updated_at: string;
}

const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart } = useApp();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedVariant, setSelectedVariant] = useState<any>(null);

  useEffect(() => {
    if (slug) {
      fetchProductDetail();
    }
  }, [slug]);

  const fetchProductDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await productAPI.getProductDetail(slug!);
      setProduct(response.data);
      
      // Set initial selected image
      if (response.data.images && response.data.images.length > 0) {
        const mainImage = response.data.images.find((img: any) => img.is_main) || response.data.images[0];
        setSelectedImage(mainImage.image);
      }
    } catch (error: any) {
      console.error('Error fetching product:', error);
      setError('Product not found');
      if (error.response?.status === 404) {
        navigate('/products');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (product) {
      try {
        await addToCart(product.id, 1);
        alert('Item added to cart!');
      } catch (error) {
        console.error('Error adding to cart:', error);
        alert('Failed to add item to cart');
      }
    }
  };

  const handleBuyNow = async () => {
    if (product) {
      try {
        await addToCart(product.id, 1);
        navigate('/cart');
      } catch (error) {
        console.error('Error adding to cart:', error);
        alert('Failed to add item to cart');
      }
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="page-content">
          <div className="container my-5 text-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading product details...</p>
          </div>
        </div>
        <div className="footer-wrapper">
          <Footer />
        </div>
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <Navbar />
        <div className="page-content">
          <div className="container my-5 text-center">
            <h2>Product Not Found</h2>
            <p className="text-muted">{error || 'The requested product could not be found.'}</p>
            <button 
              className="btn btn-primary" 
              onClick={() => navigate('/products')}
            >
              Browse Products
            </button>
          </div>
        </div>
        <div className="footer-wrapper">
          <Footer />
        </div>
      </>
    );
  }

  const productImages = product.images?.map((img: any) => img.image) || [];
  
  // Transform related products to match ProductCarousel interface
  const transformRelatedProduct = (prod: any) => ({
    id: prod.id,
    slug: prod.slug,
    image: prod.main_image || 'https://via.placeholder.com/300x300?text=No+Image',
    title: prod.title,
    description: prod.short_description || prod.description?.substring(0, 100) || '',
    rating: prod.average_rating || 0,
    reviews: prod.review_count || 0,
    price: parseFloat(prod.price),
    oldPrice: prod.old_price ? parseFloat(prod.old_price) : parseFloat(prod.price)
  });
  
  return (
    <>
      <Navbar />
      <div className="page-content">
        <div id="navbar-changed">
          <SubNav />
          <CategoryTabs />
          <div className="row mb-3">
              <div className="d-flex justify-content-center">
                <AdBanner />
              </div>
            </div>
        </div>
       
        <div className="productdetails_container">
          

          <div className="custom_padding_section">
            <Breadcrumb />
          </div>

          <div className="product-details-page custom_padding_section">
            <div className="row">
              <div className="col-md-5">
                <ProductImageGallery 
                  images={productImages}
                  selectedImage={selectedImage}
                  onImageSelect={setSelectedImage}
                />
              </div>

              <div className="col-md-4 mid_info_products">
                <ProductInfo 
                  product={product}
                  selectedVariant={selectedVariant}
                  onVariantSelect={setSelectedVariant}
                />
              </div>

              <div className="col-md-3 p-lg-0">
                <ProductPurchaseCard 
                  product={product}
                  selectedVariant={selectedVariant}
                  onAddToCart={handleAddToCart}
                  onBuyNow={handleBuyNow}
                />
              </div>
            </div>
          </div>

          {product.related_products && product.related_products.length > 0 && (
            <ProductCarousel 
              title="Related Products"
              products={product.related_products.map(transformRelatedProduct)}
              carouselId="carousel2"
            />
          )}

          {product.related_products && product.related_products.length > 0 && (
            <ProductCarousel 
              title="Customers who viewed this item also viewed"
              products={product.related_products.map(transformRelatedProduct)}
              carouselId="carousel3"
            />
          )}

          <ProductInformation relatedProducts={product.related_products?.map(transformRelatedProduct) || []} />
          <CustomerReviews />

          <SuggestedBox />
          <div className="p-5"></div>
        </div>
      </div>
      <div className="footer-wrapper">
        <Footer />
      </div>

      <Modals />
    </>
  );
};

export default ProductDetailPage;
