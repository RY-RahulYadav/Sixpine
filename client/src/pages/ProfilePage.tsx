import React from 'react';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProfileSection from '../components/ProfileSection';
import SubNav from '../components/SubNav';
import CategoryTabs from '../components/CategoryTabs';
import Productdetails_Slider1 from "../components/Products_Details/productdetails_slider1";
import {
  frequentlyViewedProducts,
  recommendedProducts,
} from "../data/productSliderData";


const ProfilePage: React.FC = () => {

  return (
    <>
      <Navbar />
       <div className="page-content">
        <SubNav />
        <CategoryTabs />
      </div>
      <ProfileSection />
         <div className="productdetails_container">
        
        {/* First Row - Customers frequently viewed */}
        <Productdetails_Slider1 
          title="Buy with it"
          products={frequentlyViewedProducts}
        />
   
         
      
        
        {/* Fourth Row - Recommended for you */}
        <Productdetails_Slider1 
          title="Inspired by your browsing history"
          products={recommendedProducts}
        />
      </div>
      <div className="footer-wrapper">
        <Footer />
      </div>
    </>
  );
};

export default ProfilePage;