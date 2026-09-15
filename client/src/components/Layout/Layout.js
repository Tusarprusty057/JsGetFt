import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileMenu from './MobileMenu';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Don't show sidebar on certain pages
  const hideSidebar = ['/login', '/register'].includes(location.pathname);

  if (hideSidebar) {
    return <>{children}</>;
  }

  return (
    <div className="bg-background min-h-screen">
      {/* Mobile menu */}
      <MobileMenu open={sidebarOpen} setOpen={setSidebarOpen} />
      
      {/* Desktop Layout */}
      <div className="hidden lg:flex min-h-screen">
        {/* Sidebar */}
        <div className="w-80 flex-shrink-0">
          <Sidebar open={true} setOpen={setSidebarOpen} />
        </div>
        
        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <Header onMenuClick={() => setSidebarOpen(true)} />
          
          {/* Page content */}
          <motion.main 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
              {children}
            </div>
          </motion.main>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden">
        {/* Sidebar for mobile */}
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        
        {/* Main content */}
        <div className="w-full">
          {/* Header */}
          <Header onMenuClick={() => setSidebarOpen(true)} />
          
          {/* Page content */}
          <motion.main 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            <div className="w-full px-4 sm:px-6 py-6">
              {children}
            </div>
          </motion.main>
        </div>
      </div>
    </div>
  );
};

export default Layout;
