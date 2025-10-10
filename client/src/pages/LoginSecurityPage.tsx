import React from "react";
import Navbar from "../components/Navbar.jsx";  

import Loginsecurity from "../components/loginsecurity";
import Productdetails_Slider1 from "../components/Products_Details/productdetails_slider1.jsx";


import "../styles/Pages.css";
import {
  frequentlyViewedProducts,
} from "../data/productSliderData";
import Footer from "../components/Footer.js";
import SubNav from "../components/SubNav.js";
import CategoryTabs from "../components/CategoryTabs.js";

const LoginSecurityPage: React.FC = () => {

  return (
    <div>
      <Navbar />
      <div className="page-content">
        <SubNav/>
        <CategoryTabs />

       
      </div>
     
      
      <div className="loginsecurity_container">
      <Loginsecurity />

 <Productdetails_Slider1  title="Buy with it"
                products={frequentlyViewedProducts}/>
      </div>

  
      <Footer />

      
       
    </div>
  );
};

export default LoginSecurityPage;


