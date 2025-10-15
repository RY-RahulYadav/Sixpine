import React from "react";
import OrderConfirmation from '../components/OrderConfirmation';
import ReviewItems from '../components/ReviewItems';
import DeliveryAddress from '../components/DeliveryAddress';
import Navbar from "../components/Navbar";  
import OrderSummary from "../components/OrderSummary";




import "../styles/Pages.css"
import "../styles/CheckoutPage.css"
import Footer from "../components/Footer";
import CategoryTabs from "../components/CategoryTabs";
import SubNav from "../components/SubNav";
import NewPaymentMethod from "../components/NewPaymentMethod";
const CheckoutPage: React.FC = () => {

  return (
    <div>
      <Navbar />
       <div className="page-content">
        <SubNav />
        <CategoryTabs />
      </div>

      <div className="checkout-page">
        <div className="checkout-main">
          <div className="checkout-left">
            <DeliveryAddress />
            <NewPaymentMethod />
            <ReviewItems />
            <OrderConfirmation />
          </div>
          <div className="checkout-right">
            <OrderSummary />
          </div>
        </div>
      </div>

      <Footer/>

      
       
    </div>
  );
};

export default CheckoutPage;


