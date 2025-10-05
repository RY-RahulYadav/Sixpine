import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../../context/AppContext';
import '../../../styles/admin.css';

const AdminLayout: React.FC = () => {
  const { state, logout } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
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
    { path: '/admin', icon: 'dashboard', label: 'Dashboard', exact: true },
    { path: '/admin/products', icon: 'inventory_2', label: 'Products' },
    { path: '/admin/orders', icon: 'shopping_bag', label: 'Orders' },
    { path: '/admin/users', icon: 'people', label: 'Customers' },
    // { path: '/admin/categories', icon: 'category', label: 'Categories' },
    // { path: '/admin/analytics', icon: 'analytics', label: 'Analytics' },
    // { path: '/admin/settings', icon: 'settings', label: 'Settings' },
  ];
  
  return (
    <div className="tw-min-h-screen tw-bg-gray-50">
      {/* Modern Header */}
      <header className="tw-sticky tw-top-0 tw-z-50 tw-bg-white tw-border-b tw-border-gray-200 tw-shadow-sm">
        <div className="tw-flex tw-items-center tw-justify-between tw-px-6 tw-h-16">
          {/* Left Section */}
          <div className="tw-flex tw-items-center tw-gap-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="tw-p-2 tw-rounded-lg tw-text-gray-600 hover:tw-bg-gray-100 tw-transition-colors lg:tw-hidden"
            >
              <span className="material-symbols-outlined">
                {sidebarOpen ? 'menu_open' : 'menu'}
              </span>
            </button>
            <div className="tw-flex tw-items-center tw-gap-3">
              <div className="tw-w-10 tw-h-10 tw-bg-gradient-to-br tw-from-blue-600 tw-to-purple-600 tw-rounded-lg tw-flex tw-items-center tw-justify-center">
                <span className="tw-text-white tw-font-bold tw-text-lg">SP</span>
              </div>
              <div>
                <h1 className="tw-text-xl tw-font-bold tw-text-gray-900">Sixpine Admin</h1>
                <p className="tw-text-xs tw-text-gray-500">Dashboard</p>
              </div>
            </div>
          </div>
          
          {/* Right Section */}
          <div className="tw-flex tw-items-center tw-gap-3">
            {/* Search */}
            <div className="tw-hidden md:tw-flex tw-items-center tw-gap-2 tw-bg-gray-100 tw-px-4 tw-py-2 tw-rounded-lg">
              <span className="material-symbols-outlined tw-text-gray-400 tw-text-xl">search</span>
              <input 
                type="text" 
                placeholder="Search..." 
                className="tw-bg-transparent tw-border-none tw-outline-none tw-text-sm tw-w-48"
              />
            </div>
            
            
            
            {/* User Menu */}
            <div className="tw-flex tw-items-center tw-gap-3 tw-ml-3 tw-pl-3 tw-border-l tw-border-gray-200">
              <div className="tw-hidden md:tw-block tw-text-right">
                <p className="tw-text-sm tw-font-semibold tw-text-gray-900">
                  {state.user?.first_name || state.user?.username || 'Admin'}
                </p>
                <p className="tw-text-xs tw-text-gray-500">Administrator</p>
              </div>
              <div className="tw-w-10 tw-h-10 tw-bg-gradient-to-br tw-from-purple-500 tw-to-pink-500 tw-rounded-full tw-flex tw-items-center tw-justify-center">
                <span className="tw-text-white tw-font-semibold">
                  {(state.user?.first_name || state.user?.username || 'A').charAt(0).toUpperCase()}
                </span>
              </div>
              <button 
                onClick={handleLogout}
                className="tw-p-2 tw-rounded-lg tw-text-gray-600 hover:tw-bg-red-50 hover:tw-text-red-600 tw-transition-colors"
                title="Logout"
              >
                <span className="material-symbols-outlined">logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <div className="tw-flex">
        {/* Modern Sidebar */}
        <aside className={`tw-fixed tw-inset-y-0 tw-left-0 tw-z-40 tw-w-64 tw-bg-white tw-border-r tw-border-gray-200 tw-transition-transform tw-duration-300 tw-mt-16 ${sidebarOpen ? 'tw-translate-x-0' : 'tw--translate-x-full'} lg:tw-translate-x-0`}>
          <nav className="tw-h-full tw-overflow-y-auto tw-py-4">
            <ul className="tw-space-y-1 tw-px-3">
              {menuItems.map((item) => {
                const active = item.exact ? location.pathname === item.path : isActive(item.path);
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`tw-flex tw-items-center tw-gap-3 tw-px-4 tw-py-3 tw-rounded-lg tw-text-sm tw-font-medium tw-transition-all tw-duration-200 ${
                        active
                          ? 'tw-bg-gradient-to-r tw-from-blue-600 tw-to-purple-600 tw-text-white tw-shadow-md'
                          : 'tw-text-gray-700 hover:tw-bg-gray-100'
                      }`}
                    >
                      <span className={`material-symbols-outlined tw-text-xl ${active ? 'tw-font-bold' : ''}`}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                      {active && (
                        <span className="tw-ml-auto tw-w-2 tw-h-2 tw-bg-white tw-rounded-full tw-animate-pulse"></span>
                      )}
                    </Link>
                  </li>
                );
              })}
              
              {/* Divider */}
              <li className="tw-my-4">
                <div className="tw-h-px tw-bg-gray-200"></div>
              </li>
              
              {/* Store Link */}
              <li>
                <Link
                  to="/"
                  target="_blank"
                  className="tw-flex tw-items-center tw-gap-3 tw-px-4 tw-py-3 tw-rounded-lg tw-text-sm tw-font-medium tw-text-gray-700 hover:tw-bg-gray-100 tw-transition-all"
                >
                  <span className="material-symbols-outlined tw-text-xl">storefront</span>
                  <span>Visit Store</span>
                  <span className="material-symbols-outlined tw-ml-auto tw-text-gray-400 tw-text-sm">open_in_new</span>
                </Link>
              </li>
            </ul>
            
            {/* Sidebar Footer */}
            <div className="tw-mt-auto tw-p-4 tw-mx-3 tw-mt-8 tw-bg-gradient-to-br tw-from-blue-50 tw-to-purple-50 tw-rounded-lg tw-border tw-border-blue-100">
              <div className="tw-flex tw-items-start tw-gap-3">
                <span className="material-symbols-outlined tw-text-blue-600">lightbulb</span>
                <div>
                  <p className="tw-text-sm tw-font-semibold tw-text-gray-900">Need Help?</p>
                  <p className="tw-text-xs tw-text-gray-600 tw-mt-1">Check our documentation</p>
                  <button className="tw-mt-2 tw-text-xs tw-font-medium tw-text-blue-600 hover:tw-underline">
                    Learn More →
                  </button>
                </div>
              </div>
            </div>
          </nav>
        </aside>
        
        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="tw-fixed tw-inset-0 tw-bg-black tw-bg-opacity-50 tw-z-30 lg:tw-hidden tw-mt-16"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}
        
        {/* Main Content */}
        <main className="tw-flex-1 tw-min-h-screen lg:tw-ml-64 tw-mt-16">
          <div className="tw-px-6 tw-py-4">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
