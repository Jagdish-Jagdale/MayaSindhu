import { Search, Bell } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import mstitle from '../../assets/mstitle.png';

const PAGE_TITLES = {
  '/admin/dashboard': { title: 'Dashboard' },
  '/admin/users': { title: 'Users' },
  '/admin/products': { title: 'Products' },
  '/admin/categories': { title: 'Categories' },
  '/admin/orders': { title: 'Orders' },
  '/admin/inventory-logs': { title: 'Logs' },
  '/admin/settings': { title: 'Settings' },
};

export default function TopNav({ sidebarOpen, onToggleSidebar, isMobile }) {
  const location = useLocation();
  const page = PAGE_TITLES[location.pathname] || { title: 'Admin' };

  return (
    <header
      className="flex items-center gap-3 px-4 sm:px-6 shrink-0 relative"
      style={{
        height: '64px',
        borderBottom: '1px solid #f0f0f0',
        background: 'rgba(251, 251, 251, 0.8)',
        backdropFilter: 'blur(8px)',
      }}
    >
      {/* ─── UNIFIED HEADER CONTENT (Toggle - Logo - Divider - Title) ─── */}
      <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
        {isMobile && (
          <div className="z-20">
            <button
              onClick={onToggleSidebar}
              className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-500 hover:bg-black/5 hover:text-gray-800 transition-colors shrink-0"
              title="Toggle Sidebar"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <line x1="9" y1="3" x2="9" y2="21" />
              </svg>
            </button>
          </div>
        )}

        {/* Brand Logo */}
        <div className="shrink-0 flex items-center h-full">
          <img
            src={mstitle}
            alt="MayaSindhu"
            className="h-6 sm:h-7 lg:h-9 w-auto object-contain transition-all duration-300"
          />
        </div>

        {/* Vertical Divider */}
        <div className="w-[1px] h-5 sm:h-6 bg-gray-200 mx-0.5 sm:mx-1 shrink-0" />

        {/* Page Name */}
        <h1 className="text-[13px] sm:text-[15px] font-bold text-gray-800 tracking-tight truncate">
          {page.title}
        </h1>

        {/* Spacer for Desktop Search */}
        {!isMobile && <div className="flex-1" />}

        {/* Desktop Search Bar */}
        {!isMobile && (
          <div className="relative w-full max-w-[280px] shrink-0 drop-shadow-sm">
            <input
              type="text"
              placeholder="Search Masterpieces..."
              className="w-full bg-white/40 border border-white/60 rounded-full text-[12px] text-gray-700 placeholder:text-gray-400 outline-none transition-all focus:bg-white/60 backdrop-blur-md"
              style={{ padding: '7px 12px 7px 35px' }}
            />
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-700 pointer-events-none z-10" />
          </div>
        )}
      </div>

      {/* ─── COMMON RIGHT ACTIONS (Notification / Mobile Search) ─── */}
      <div className="flex items-center gap-2 ml-auto z-20">
        {isMobile && (
          <button className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-lg">
            <Search size={18} />
          </button>
        )}
        <button className="relative w-8 h-8 flex items-center justify-center rounded-full bg-white/40 border border-white/60 hover:bg-white/60 text-gray-600 transition-colors shrink-0 backdrop-blur-md shadow-sm">
          <Bell size={16} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-yellow-400 rounded-full border-2 border-white/80" />
        </button>
      </div>

      <style>{`
        @media (max-width: 480px) {
          .xs\\:hidden { display: none; }
          .xs\\:block { display: block; }
        }
      `}</style>
    </header>
  );
}
