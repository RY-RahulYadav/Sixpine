import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <>
      <div className="back-to-top" id="backToTop" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        ↑ Back to Top
      </div>

      <footer className="footer bg-dark text-light pt-5">
        <div className="container">
          <div className="row">
            {/* Left: Logo + About + Socials */}
            <div className="col-md-3 mb-4">
              <h5 className="fw-bold">Sixpine</h5>
              <p className="small">We provide the best products at unbeatable prices. Shop your favorite brands online.</p>
              
              {/* Social Media */}
              <div className="social-icons mt-3">
                <a href="#"><i className="bi bi-facebook"></i></a>
                <a href="#"><i className="bi bi-instagram"></i></a>
                <a href="#"><i className="bi bi-twitter"></i></a>
              </div>
            </div>

            {/* Column 1 */}
            <div className="col-md-2 mb-4">
              <h6 className="footer-title">Quick Links</h6>
              <ul className="footer-links">
                <li><Link to="/">Home</Link></li>
                <li><Link to="/shop">Shop</Link></li>
                <li><Link to="/deals">Deals</Link></li>
                <li><Link to="/contact">Contact</Link></li>
              </ul>
            </div>

            {/* Column 2 */}
            <div className="col-md-2 mb-4">
              <h6 className="footer-title">Customer Service</h6>
              <ul className="footer-links">
                <li><Link to="/faq">FAQ</Link></li>
                <li><Link to="/shipping">Shipping</Link></li>
                <li><Link to="/returns">Returns</Link></li>
                <li><Link to="/support">Support</Link></li>
              </ul>
            </div>

            {/* Column 3 */}
            <div className="col-md-2 mb-4">
              <h6 className="footer-title">Policies</h6>
              <ul className="footer-links">
                <li><Link to="/privacy">Privacy Policy</Link></li>
                <li><Link to="/terms">Terms of Use</Link></li>
                <li><Link to="/disclaimer">Disclaimer</Link></li>
              </ul>
            </div>

            {/* Column 4 */}
            <div className="col-md-3 mb-4">
              <h6 className="footer-title">Contact</h6>
              <p className="small mb-1">Email: support@yourdomain.com</p>
              <p className="small mb-1">Phone: +91 12345 67890</p>
              <p className="small">Address: 123, Main Street, City, India</p>
            </div>
          </div>

          <hr className="bg-light" />

          {/* Bottom Text */}
          <div className="text-center pb-3 small">
            &copy; 2025 Sixpine. All Rights Reserved.
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
