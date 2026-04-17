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
      className="flex items-center px-4 sm:px-6 shrink-0 relative"
      style={{
        height: '64px',
        borderBottom: '1px solid #f0f0f0',
        background: 'rgba(251, 251, 251, 0.8)',
        backdropFilter: 'blur(8px)',
      }}
    >
      {/* ─── MOBILE LAYOUT (Toggle Left, Logo Center, Icons Right) ─── */}
      {isMobile && (
        <>
          <div className="z-20">
            <button
              onClick={onToggleSidebar}
              className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-500 hover:bg-black/5 hover:text-gray-800 transition-colors shrink-0"
              title="Toggle Sidebar"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="pointer-events-auto">
              <img
                src={mstitle}
                alt="MayaSindhu"
                className="h-8 w-auto object-contain"
              />
            </div>
          </div>
        </>
      )}

      {/* ─── DESKTOP LAYOUT (Logo | | Title | Spacer | Search | Icons) ─── */}
      {!isMobile && (
        <div className="flex items-center gap-4 flex-1">
          {/* Brand Logo */}
          <div className="shrink-0 flex items-center">
            <img
              src={mstitle}
              alt="MayaSindhu"
              className="h-7 w-auto object-contain"
            />
          </div>

          {/* Vertical Divider */}
          <div className="w-[1px] h-6 bg-gray-200 mx-1" />

          {/* Page Name */}
          <h1 className="text-[15px] font-bold text-gray-800 tracking-tight">
            {page.title}
          </h1>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Search Bar */}
          <div className="relative w-full max-w-[280px] shrink-0 drop-shadow-sm">
            <input
              type="text"
              placeholder="Search Masterpieces..."
              className="w-full bg-white/40 border border-white/60 rounded-full text-[12px] text-gray-700 placeholder:text-gray-400 outline-none transition-all focus:bg-white/60 backdrop-blur-md"
              style={{ padding: '7px 12px 7px 35px' }}
            />
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-700 pointer-events-none z-10" />
          </div>
        </div>
      )}

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
