import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../../context/AppContext';
import '../../../styles/admin-theme.css';

const AdminLayout: React.FC = () => {
  const { state, logout } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true); // Start open on desktop
  
  // Handle responsive sidebar behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true); // Always open on desktop
      } else {
        setSidebarOpen(false); // Closed on mobile/tablet
      }
    };
    
    handleResize(); // Set initial state
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, [location.pathname]);
  
  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };
  
  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(`${path}`);
  };
  
  const menuItems = [
    { path: '/admin', icon: 'dashboard', label: 'Dashboard', exact: true, section: 'main' },
    { path: '/admin/products', icon: 'inventory_2', label: 'Products', section: 'main' },
    { path: '/admin/orders', icon: 'shopping_bag', label: 'Orders', section: 'main' },
    { path: '/admin/users', icon: 'people', label: 'Customers', section: 'main' },
    { path: '/admin/analytics', icon: 'analytics', label: 'Brand Analytics', section: 'analytics' },
    { path: '/admin/contact-queries', icon: 'contact_support', label: 'Contact Queries', section: 'management' },
    { path: '/admin/bulk-orders', icon: 'local_shipping', label: 'Bulk Orders', section: 'management' },
    { path: '/admin/logs', icon: 'list_alt', label: 'Activity Logs', section: 'management' },
    { path: '/admin/filter-options', icon: 'tune', label: 'Filter Options', section: 'settings' },
    { path: '/admin/payment-charges', icon: 'payments', label: 'Payment & Charges', section: 'settings' },
    { path: '/admin/settings', icon: 'settings', label: 'Settings', section: 'settings' },
  ];
  
  const groupedMenuItems = {
    main: menuItems.filter(item => item.section === 'main'),
    analytics: menuItems.filter(item => item.section === 'analytics'),
    management: menuItems.filter(item => item.section === 'management'),
    settings: menuItems.filter(item => item.section === 'settings'),
  };
  
  return (
    <div style={{ minHeight: '100vh', background: 'var(--admin-bg)' }}>
      {/* Modern Header */}
      <header className="admin-modern-header">
        <div className="admin-header-left">
          {/* <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="admin-header-btn"
            aria-label="Toggle sidebar"
            style={{ marginRight: '8px' }}
          >
            <span className="material-symbols-outlined">
              {sidebarOpen ? 'menu_open' : 'menu'}
            </span>
          </button> */}
          <Link to="/admin" className="admin-header-logo">
            <div className="admin-logo-icon">SP</div>
            <div className="admin-logo-text">
              <h1>Sixpine Admin</h1>
              <p>E-Commerce Dashboard</p>
            </div>
          </Link>
        </div>
        
        <div className="admin-header-right">
          {/* Search - Hidden on mobile */}
          {/* <div className="admin-header-search" style={{ display: window.innerWidth < 768 ? 'none' : 'flex' }}>
            <span className="material-symbols-outlined">search</span>
            <input 
              type="text" 
              placeholder="Search anything..." 
            />
          </div> */}
          
          {/* Notifications */}
          {/* <div className="admin-header-actions">
            <button className="admin-header-btn" title="Notifications">
              <span className="material-symbols-outlined">notifications</span>
              <span className="badge">3</span>
            </button>
          </div> */}
          
          {/* User Menu */}
          <div className="admin-header-user">
            <div className="admin-user-avatar">
              {(state.user?.first_name || state.user?.username || 'A').charAt(0).toUpperCase()}
            </div>
            <div className="admin-user-info">
              <div className="admin-user-name">
                {state.user?.first_name || state.user?.username || 'Admin'}
              </div>
              <div className="admin-user-role">Administrator</div>
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            className="admin-header-btn"
            title="Logout"
            aria-label="Logout"
          >
            <span className="material-symbols-outlined">logout</span>
          </button>
        </div>
      </header>
      
      <div style={{ display: 'flex', height: `calc(100vh - var(--admin-header-height))` }}>
        {/* Modern Sidebar */}
        <aside className={`admin-modern-sidebar ${sidebarOpen ? 'open' : ''}`}>
          <nav className="admin-sidebar-menu">
            {/* Main Section */}
            <div className="admin-menu-section">
              <div className="admin-menu-title">Main Menu</div>
              {groupedMenuItems.main.map((item) => {
                const active = item.exact ? location.pathname === item.path : isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`admin-menu-item ${active ? 'active' : ''}`}
                  >
                    <span className="material-symbols-outlined">{item.icon}</span>
                    <span className="admin-menu-text">{item.label}</span>
                  </Link>
                );
              })}
            </div>
            
            {/* Analytics Section */}
            <div className="admin-menu-section">
              <div className="admin-menu-title">Analytics</div>
              {groupedMenuItems.analytics.map((item) => {
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`admin-menu-item ${active ? 'active' : ''}`}
                  >
                    <span className="material-symbols-outlined">{item.icon}</span>
                    <span className="admin-menu-text">{item.label}</span>
                  </Link>
                );
              })}
            </div>
            
            {/* Management Section */}
            <div className="admin-menu-section">
              <div className="admin-menu-title">Management</div>
              {groupedMenuItems.management.map((item) => {
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`admin-menu-item ${active ? 'active' : ''}`}
                  >
                    <span className="material-symbols-outlined">{item.icon}</span>
                    <span className="admin-menu-text">{item.label}</span>
                  </Link>
                );
              })}
            </div>
            
            {/* Settings Section */}
            <div className="admin-menu-section">
              <div className="admin-menu-title">Settings</div>
              {groupedMenuItems.settings.map((item) => {
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`admin-menu-item ${active ? 'active' : ''}`}
                  >
                    <span className="material-symbols-outlined">{item.icon}</span>
                    <span className="admin-menu-text">{item.label}</span>
                  </Link>
                );
              })}
            </div>
            
            {/* Store Link */}
            <div className="admin-menu-section" style={{ borderTop: '1px solid var(--admin-border)', paddingTop: 'var(--spacing-md)', marginTop: 'var(--spacing-md)' }}>
              <Link
                to="/"
                target="_blank"
                className="admin-menu-item"
                style={{ background: 'linear-gradient(135deg, rgba(255, 111, 0, 0.08) 0%, rgba(53, 122, 189, 0.08) 100%)' }}
              >
                <span className="material-symbols-outlined">storefront</span>
                <span className="admin-menu-text">Visit Store</span>
                <span className="material-symbols-outlined" style={{ fontSize: '16px', marginLeft: 'auto' }}>open_in_new</span>
              </Link>
            </div>
          </nav>
          
          {/* Sidebar Footer */}
          <div className="admin-sidebar-footer">
            <div className="admin-sidebar-card">
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--spacing-sm)' }}>
                <span className="material-symbols-outlined" style={{ color: 'var(--admin-primary)', fontSize: '24px' }}>help</span>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--admin-dark)', marginBottom: '4px' }}>
                    Need Help?
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--admin-text-light)', marginBottom: '8px' }}>
                    Check our documentation
                  </div>
                  <a 
                    href="#" 
                    style={{ fontSize: '12px', color: 'var(--admin-primary)', fontWeight: '600', textDecoration: 'none' }}
                  >
                    Learn More →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </aside>
        
        {/* Overlay for mobile */}
        {sidebarOpen && window.innerWidth < 768 && (
          <div 
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              zIndex: 'var(--z-dropdown)',
              top: 'var(--admin-header-height)'
            }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* Main Content */}
        <main 
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: 'var(--admin-content-padding)',
            background: 'var(--admin-bg)',
            transition: 'var(--transition)'
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
