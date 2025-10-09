import React from 'react';
import { Link } from 'react-router-dom';

const SubNav: React.FC = () => {
  // Top-level sub navigation items (matching screenshot)
  const items = [
    { to: '/', label: 'Home' },
    { to: '/trendings', label: 'Trendings' },
    { to: '/buy-again', label: 'Buy Again' },
    { to: '/keep-shopping', label: 'Continue Shopping' },
    { to: '/deals', label: 'Best Deals' },
    { to: '/recently-browsed', label: 'Recently Browsed' },
    { to: '/buy-in-bulk', label: 'Buy in Bulk' },
    { to: '/track-order', label: 'Track Order' },
    { to: '/contact', label: 'Contact Us' },
    { to: '/help', label: 'Help' },
  ];

  return (
    <div className="sub-nav">
      <div className="container-fluid d-flex justify-content-center">
        <ul className="sub-nav-list d-flex align-items-center m-0 p-0">
          {items.map(item => (
            <li className="nav-item" key={item.label} style={{ listStyle: 'none', margin: '0 .5rem' }}>
              <Link className="nav-link" to={item.to}>{item.label}</Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SubNav;
