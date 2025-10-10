import React from "react";
import Navbar from "../components/Navbar.jsx";  

import Supply from "../components/Supply.js";

import "../styles/Pages.css"; 
import Footer from "../components/Footer";



const SupplyPage: React.FC = () => {

  return (
    <div>
      <Navbar />

      <div className="supply_container">

      <Supply/>
     
      </div>

  
      <Footer />

      
       
    </div>
  );
};

export default SupplyPage;


