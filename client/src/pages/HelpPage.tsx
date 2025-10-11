import React from 'react';
import Navbar from '../components/Navbar';
import SubNav from '../components/SubNav';
import CategoryTabs from '../components/CategoryTabs';
import Footer from '../components/Footer';
import BackToTop from '../components/BackToTop';
import HelpHeader from '../components/Help/HelpHeader';
import HelpCategories from '../components/Help/HelpCategories';
import FrequentQuestions from '../components/Help/FrequentQuestions';
import ContactOptions from '../components/Help/ContactOptions';
import SupportResources from '../components/Help/SupportResources';

const HelpPage: React.FC = () => {
  return (
    <div>
      <Navbar />
      <SubNav />
      <CategoryTabs />
      
      <HelpHeader />
      <HelpCategories />
      <FrequentQuestions />
      <ContactOptions />
      <SupportResources />
      
      <Footer />
      <BackToTop />
    </div>
  );
};

export default HelpPage;