import React from 'react';
import { Link } from 'react-router-dom';

const SubNav: React.FC = () => {
  return (
    <div className="sub-nav">
      <div className="container-fluid d-flex justify-content-center">
        <ul className="sub-nav-list">
          <li className="nav-item"><Link className="nav-link" to="/">All</Link></li>
          <li className="nav-item"><Link className="nav-link" to="/new-arrivals">New Arrivals</Link></li>
          <li className="nav-item dropdown mega-dropdown">
            <a className="nav-link d-flex align-items-center" href="#" id="megaDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
              Categories 
              <i className="bi bi-chevron-down ms-1"></i>
            </a>

            {/* Mega Menu */}
            <div className="dropdown-menu mega-menu shadow p-4" aria-labelledby="megaDropdown">
              <div className="row">
                <div className="col-md-3">
                  <h6>Electronics</h6>
                  <Link to="/category/mobiles">Mobiles</Link>
                  <Link to="/category/laptops">Laptops</Link>
                  <Link to="/category/cameras">Cameras</Link>
                </div>
                <div className="col-md-3">
                  <h6>Fashion</h6>
                  <Link to="/category/men">Men</Link>
                  <Link to="/category/women">Women</Link>
                  <Link to="/category/kids">Kids</Link>
                </div>
                <div className="col-md-3">
                  <h6>Home</h6>
                  <Link to="/category/furniture">Furniture</Link>
                  <Link to="/category/kitchen">Kitchen</Link>
                  <Link to="/category/decor">Decor</Link>
                </div>
                <div className="col-md-3">
                  <h6>Beauty</h6>
                  <Link to="/category/makeup">Makeup</Link>
                  <Link to="/category/skincare">Skincare</Link>
                  <Link to="/category/haircare">Haircare</Link>
                </div>
              </div>
            </div>
          </li>
          <li className="nav-item"><Link className="nav-link" to="/keep-shopping">Keep Shopping</Link></li>
          <li className="nav-item"><Link className="nav-link" to="/deals">Today's Deals</Link></li>
          <li className="nav-item"><Link className="nav-link" to="/ebook">E-Book</Link></li>
          <li className="nav-item"><Link className="nav-link" to="/buy-again">Buy Again</Link></li>
        </ul>
      </div>
    </div>
  );
};

export default SubNav;
