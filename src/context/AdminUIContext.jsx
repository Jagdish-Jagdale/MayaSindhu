import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const AdminUIContext = createContext();

export const AdminUIProvider = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 1024);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = useCallback(() => setSidebarOpen(prev => !prev), []);
  const closeSidebar = useCallback(() => {
    if (window.innerWidth <= 1024) {
      setSidebarOpen(false);
    }
  }, []);

  const value = useMemo(() => ({
    sidebarOpen,
    isMobile,
    isCollapsed: !sidebarOpen && !isMobile,
    toggleSidebar,
    closeSidebar,
  }), [sidebarOpen, isMobile, toggleSidebar, closeSidebar]);

  return (
    <AdminUIContext.Provider value={value}>
      {children}
    </AdminUIContext.Provider>
  );
};

export const useAdminUI = () => {
  const context = useContext(AdminUIContext);
  if (!context) {
    throw new Error('useAdminUI must be used within an AdminUIProvider');
  }
  return context;
};
