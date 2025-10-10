import React from "react";
import Navbar from "../components/Navbar.jsx";  
import Footer from "../components/Footer";
import Account  from "../components/yourAccount";
import SubNav from "../components/SubNav.js";
import CategoryTabs from "../components/CategoryTabs.js";
import Productdetails_Slider1 from "../components/Products_Details/productdetails_slider1.jsx";

import {
  frequentlyViewedProducts,
} from "../data/productSliderData";



const AccountPage: React.FC = () => {

  return (
    <div>
      <Navbar />
<div className="page-content">
        <SubNav/>
        <CategoryTabs />
      

       
      </div>
          <div className="accountpage_container">
      <Account />
       <Productdetails_Slider1  title="Buy with it"
                products={frequentlyViewedProducts}/>

      <Productdetails_Slider1  title="Buy with it"
                products={frequentlyViewedProducts}/>
     
      </div>
      
      <Footer />

      
       
    </div>
  );
};

export default AccountPage;


