import React from "react";
import Navbar from "../components/Navbar";

import Productdetails from "../components/Products_Details/productdetails";
import ProductInformation from "../components/Products_Details/productInformation";
import CustomerReview from "../components/Products_Details/customerReview";
import Productdetails_Slider1 from "../components/Products_Details/productdetails_slider1";

import "../styles/Pages.css";
import SubNav from "../components/SubNav";
import CategoryTabs from "../components/CategoryTabs";
import AdBanner from "../components/ProductDetail/AdBanner";

// Import product data
import {
  frequentlyViewedProducts,
  browsingHistoryProducts,
  similarProducts,
  recommendedProducts,
} from "../data/productSliderData";
import Footer from "../components/Footer";


const NewProductDetails: React.FC = () => {

  return (
    <div>
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
        </div>
             
    
      <div className="productdetails_container">
        <Productdetails />
        
        {/* First Row - Customers frequently viewed */}
        <Productdetails_Slider1 
          title="Buy with it"
          products={frequentlyViewedProducts}
        />
        
        {/* Second Row - Inspired by browsing history */}
        <Productdetails_Slider1 
          title="Inspired by your browsing history"
          products={browsingHistoryProducts}
        />
         
        <ProductInformation />
        
        {/* Third Row - Similar Products */}
        <Productdetails_Slider1 
          title="Customers frequently viewed | Popular products in the last 7 days"
          products={similarProducts}
        />
        
        <CustomerReview />
        
        {/* Fourth Row - Recommended for you */}
        <Productdetails_Slider1 
          title="Inspired by your browsing history"
          products={recommendedProducts}
        />
      </div>



<Footer />
    </div>
  );
};

export default NewProductDetails;


