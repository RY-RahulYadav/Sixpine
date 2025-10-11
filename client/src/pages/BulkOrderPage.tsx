import React from 'react';
import Navbar from '../components/Navbar';
import SubNav from '../components/SubNav';
import Footer from '../components/Footer';
import CategoryTabs from '../components/CategoryTabs';
import '../styles/Pages.css';
import '../components/BulkOrder/BulkOrder.module.css';

import BulkOrderForm from '../components/BulkOrder/BulkOrderForm';
import BulkOrderFAQ from '../components/BulkOrder/BulkOrderFAQ';
import BulkOrderSteps from '../components/BulkOrder/BulkOrderSteps';
import BulkOrderBenefits from '../components/BulkOrder/BulkOrderBenefits';

const BulkOrderPage: React.FC = () => {
  return (
    <>
      <Navbar />
      <div className="page-content">
        <SubNav />
        <CategoryTabs />
      </div>

      <div className="bulkorder_container">
        {/* Hero Section */}
        <div className="hero-section">
          <h1>Bulk Orders & Corporate Purchasing</h1>
          <p>Special pricing and dedicated support for bulk orders</p>
        </div>

        {/* Order Process Steps */}
        <BulkOrderSteps />

        {/* Bulk Order Form */}
        <BulkOrderForm />

        {/* Benefits Section */}
        <BulkOrderBenefits />

        {/* FAQs Section */}
        <BulkOrderFAQ />
      </div>
      
      <div className="footer-wrapper">
        <Footer />
      </div>
    </>
  );
};

export default BulkOrderPage;