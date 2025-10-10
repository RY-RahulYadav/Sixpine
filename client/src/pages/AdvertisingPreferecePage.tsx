import React from "react";
import Navbar from "../components/Navbar.jsx";  

import Advertising_Preferece from "../components/advertising_prefereces";
import Productdetails_Slider1 from "../components/Products_Details/productdetails_slider1.jsx";

import {
  frequentlyViewedProducts,
} from "../data/productSliderData";

import "../styles/Pages.css"; 
import Footer from "../components/Footer.js";
import SubNav from "../components/SubNav.js";
import CategoryTabs from "../components/CategoryTabs.js";

const AdvertisingPreferecePage: React.FC = () => {

  return (
    <div>
      <Navbar />
  <div className="page-content">
        <SubNav/>
        <CategoryTabs />
      

       
      </div>
         <div className="advertisingpreferece_container">

      

      <Advertising_Preferece/>
 <Productdetails_Slider1  title="Buy with it"
                products={frequentlyViewedProducts}/>
      
   </div>
  
      <Footer />

      
       
    </div>
  );
};

export default AdvertisingPreferecePage;


