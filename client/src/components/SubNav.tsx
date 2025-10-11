import React from 'react';
import { Link } from 'react-router-dom';

const SubNav: React.FC = () => {
  // Top-level sub navigation items (matching screenshot)
  const items = [
    { to: '/', label: 'Home', isActive: true },
    { to: '/trendings', label: 'Trendings', isActive: false },
    { to: '/buy-again', label: 'Buy Again', isActive: false },
    { to: '/keep-shopping', label: 'Continue Shopping', isActive: false },
    { to: '/deals', label: 'Best Deals', isActive: false },
    { to: '/recently-browsed', label: 'Recently Browsed', isActive: false },
    { to: '/buy-in-bulk', label: 'Buy in Bulk', isActive: false },
    { to: '/track-order', label: 'Track Order', isActive: false },
    { to: '/contact', label: 'Contact Us', isActive: false },
    { to: '/help', label: 'Help', isActive: false },
  ];

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, item: typeof items[0]) => {
    if (!item.isActive) {
      e.preventDefault();
      alert('🚧 Under Development\n\nThis feature is coming soon!');
    }
  };

  return (
    <div className="sub-nav">
      <div className="container-fluid d-flex justify-content-center">
        <ul className="sub-nav-list d-flex align-items-center m-0 p-0">
          {items.map(item => (
            <li className="nav-item" key={item.label} style={{ listStyle: 'none', margin: '0 .5rem' }}>
              {item.isActive ? (
                <Link className="nav-link" to={item.to}>{item.label}</Link>
              ) : (
                <a 
                  className="nav-link" 
                  href="#" 
                  onClick={(e) => handleClick(e, item)}
                  style={{ cursor: 'pointer' }}
                >
                  {item.label}
                </a>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SubNav;
