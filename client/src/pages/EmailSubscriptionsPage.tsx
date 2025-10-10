import React from "react";
import Navbar from "../components/Navbar.jsx";  

import EmailSubscriptions from "../components/EmailSubscriptions.jsx";
import Productdetails_Slider1 from "../components/Products_Details/productdetails_slider1.jsx";


import "../styles/Pages.css";
import Footer from "../components/Footer.js";
import {
  frequentlyViewedProducts,
} from "../data/productSliderData";
import SubNav from "../components/SubNav.js";
import CategoryTabs from "../components/CategoryTabs.js";
const EmailSubscriptionsPage: React.FC = () => {

  return (
    <div>
      <Navbar />
     <div className="page-content">
        <SubNav/>
        <CategoryTabs />
      

       
      </div>
      <div className="emailsubscriptions_container">
      <EmailSubscriptions />
      <Productdetails_Slider1  title="Buy with it"
                products={frequentlyViewedProducts}/>
      </div>

  
      <Footer />

      
       
    </div>
  );
};

export default EmailSubscriptionsPage;


