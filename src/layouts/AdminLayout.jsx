import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/admin/Sidebar';
import TopNav from '../components/admin/TopNav';
import { X } from 'lucide-react';
import { AdminUIProvider, useAdminUI } from '../context/AdminUIContext';

function AdminLayoutContent() {
  const { sidebarOpen, isMobile, toggleSidebar, closeSidebar, isCollapsed } = useAdminUI();
  const location = useLocation();

  // Close sidebar on route change (mobile only)
  useEffect(() => {
    closeSidebar();
  }, [location.pathname, closeSidebar]);

  return (
    <div
      className="h-screen w-full flex items-center justify-center overflow-hidden transition-all duration-300"
      style={{ 
        background: '#e8e8ec', 
        padding: isMobile ? '0' : '16px', 
        fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif" 
      }}
    >
      <div className="flex gap-4 w-full h-full relative">

        {/* ─── BACKDROP (Mobile Only) ─── */}
        {isMobile && sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[998] animate-in fade-in duration-300"
            onClick={toggleSidebar}
          />
        )}

        {/* ─── FLOATING SIDEBAR ─── */}
        <div
          className={`
            flex flex-col h-full overflow-hidden shrink-0 transition-all duration-300 ease-in-out
            ${isMobile ? 'fixed inset-y-0 left-0 z-[999] shadow-2xl' : 'relative'}
            ${isMobile ? (sidebarOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'}
          `}
          style={{
            width: isMobile ? '280px' : (sidebarOpen ? '260px' : '80px'),
            background: '#ffffff',
            borderRadius: isMobile ? '0 20px 20px 0' : '16px',
            boxShadow: isMobile ? '' : (sidebarOpen ? '0 8px 32px rgba(0,0,0,0.10)' : '0 4px 12px rgba(0,0,0,0.05)'),
          }}
        >
          {/* macOS window chrome — Header of Sidebar */}
          <div className={`flex items-center pt-5 pb-2 shrink-0 transition-all duration-300 ${isCollapsed ? 'justify-center px-0' : 'justify-between px-4'}`}>
            <div className={`flex items-center gap-1.5 ml-1 transition-all duration-300 ${isCollapsed ? 'hidden' : 'opacity-100 scale-100'}`}>
              <span className="w-3 h-3 rounded-full bg-[#FF5F57]" />
              <span className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
              <span className="w-3 h-3 rounded-full bg-[#28C840]" />
            </div>
            
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
              title={sidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
            >
              {isMobile ? (
                <X size={20} />
              ) : (
                <svg 
                  className={`transition-transform duration-300 ${!sidebarOpen ? 'rotate-180' : ''}`}
                  width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <line x1="9" y1="3" x2="9" y2="21" />
                </svg>
              )}
            </button>
          </div>

          <Sidebar isCollapsed={isCollapsed} />
        </div>

        {/* ─── MAIN CONTENT ─── */}
        <div
          className="flex flex-col flex-1 min-w-0 h-full overflow-hidden transition-all duration-300"
          style={{
            background: '#ffffff',
            borderRadius: isMobile ? '0' : '20px',
            boxShadow: isMobile ? 'none' : '0 8px 32px rgba(0,0,0,0.10)',
          }}
        >
          <TopNav sidebarOpen={sidebarOpen} onToggleSidebar={toggleSidebar} isMobile={isMobile} />

          <main
            className="flex-1 overflow-y-auto"
            style={{ padding: isMobile ? '20px' : '28px 32px' }}
          >
            <Outlet />
          </main>
        </div>

      </div>

      <style>{`
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #d1d1d6; border-radius: 99px; }
      `}</style>
    </div>
  );
}

export default function AdminLayout() {
  return (
    <AdminUIProvider>
      <AdminLayoutContent />
    </AdminUIProvider>
  );
}
