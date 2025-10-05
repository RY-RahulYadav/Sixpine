import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import SubNav from '../components/SubNav';
import CategoryTabs from '../components/CategoryTabs';
import HeroSection from '../components/HeroSection';
import KeepShopping from '../components/KeepShopping';
import HomeDeals from '../components/HomeDeals';
import ProductCarousel from '../components/ProductCarousel';
import Banner from '../components/Banner';
import Footer from '../components/Footer';
import { productAPI } from '../services/api';

const LandingPage: React.FC = () => {
  const [homeData, setHomeData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      const response = await productAPI.getHomeData();
      setHomeData(response.data);
    } catch (error) {
      console.error('Fetch home data error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Transform product data to match ProductCarousel interface
  const transformProduct = (product: any) => ({
    id: product.id,
    slug: product.slug,
    image: product.main_image || 'https://via.placeholder.com/300x300?text=No+Image',
    title: product.title,
    description: product.short_description || product.description?.substring(0, 100) || '',
    rating: product.average_rating || 0,
    reviews: product.review_count || 0,
    price: parseFloat(product.price),
    oldPrice: product.old_price ? parseFloat(product.old_price) : parseFloat(product.price)
  });

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="page-content">
          <div className="container my-5 text-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
        <div className="footer-wrapper">
          <Footer />
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="page-content">
        <SubNav />
        <CategoryTabs />
        <HeroSection />
        <KeepShopping />
      <HomeDeals />
      {homeData?.featured_products && (
        <ProductCarousel 
          title="Featured Products" 
          products={homeData.featured_products.map(transformProduct)} 
          carouselClass="owl-carousel_1" 
        />
      )}
      <Banner />
      {homeData?.new_arrivals && (
        <ProductCarousel 
          title="New Arrivals" 
          products={homeData.new_arrivals.map(transformProduct)} 
          carouselClass="owl-carousel_2" 
        />
      )}
      </div>
      <div className="footer-wrapper">
        <Footer />
      </div>
    </>
  );
};

export default LandingPage;
