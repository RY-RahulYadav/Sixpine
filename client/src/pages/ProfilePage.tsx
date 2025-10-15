import React, { useEffect, useState } from 'react';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProfileSection from '../components/ProfileSection';



const ProfilePage: React.FC = () => {

  return (
    <>
      <Navbar />
      <ProfileSection />
      <div className="footer-wrapper">
        <Footer />
      </div>
    </>
  );
};

export default ProfilePage;