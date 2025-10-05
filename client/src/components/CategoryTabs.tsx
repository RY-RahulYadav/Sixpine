import React from 'react';
import { Link } from 'react-router-dom';

const CategoryTabs: React.FC = () => {
  return (
    <div className="tab-categories mb-0">
      <ul className="nav nav-tabs d-none d-md-flex">
        {/* Desktop Tabs */}
        <li className="nav-item dropdown">
          <a className="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown">Home</a>
          <ul className="dropdown-menu">
            <li><Link className="dropdown-item" to="/subcategory/1">Sub Category 1</Link></li>
            <li><Link className="dropdown-item" to="/subcategory/2">Sub Category 2</Link></li>
          </ul>
        </li>
        <li className="nav-item"><Link className="nav-link" to="/category/kitchen-home">Kitchen Home</Link></li>
        <li className="nav-item"><Link className="nav-link" to="/category/large-furniture">Large Furniture</Link></li>
        <li className="nav-item"><Link className="nav-link" to="/category/kitchen">Kitchen</Link></li>
        <li className="nav-item"><Link className="nav-link" to="/category/furniture">Furniture</Link></li>
        <li className="nav-item"><Link className="nav-link" to="/category/home-decoration">Home Decoration</Link></li>
      </ul>

      {/* Mobile/Tablet Scrollable Tabs */}
      <div className="scroll-tabs d-flex d-md-none">
        <Link to="/">Home</Link>
        <Link to="/category/kitchen-home">Kitchen Home</Link>
        <Link to="/category/large-furniture">Large Furniture</Link>
        <Link to="/category/kitchen">Kitchen</Link>
        <Link to="/category/furniture">Furniture</Link>
        <Link to="/category/home-decoration">Home Decoration</Link>
      </div>
    </div>
  );
};

export default CategoryTabs;
