import React from "react";

import CommunicationPreferences from "../components/communication-preferences.jsx";
import Productdetails_Slider1 from "../components/Products_Details/productdetails_slider1.jsx";



import "../styles/Pages.css";
import Footer from "../components/Footer.js";
import {
  frequentlyViewedProducts,
} from "../data/productSliderData";
import SubNav from "../components/SubNav.js";
import CategoryTabs from "../components/CategoryTabs.js";
import Navbar from "../components/Navbar.js";
const CommunicationPreferencesPage: React.FC = () => {

  return (
    <div>
      <Navbar />
     <div className="page-content">
        <SubNav/>
        <CategoryTabs />
      

       
      </div>
     
      <div className="communicationpreferences_container">
      <CommunicationPreferences />
      
      <Productdetails_Slider1  title="Buy with it"
                products={frequentlyViewedProducts}/>

      <Productdetails_Slider1  title="Buy with it"
                products={frequentlyViewedProducts}/>
      </div>

      <Footer />

      
       
    </div>
  );
};

export default CommunicationPreferencesPage;

