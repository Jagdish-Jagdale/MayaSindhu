import { Search, Bell, PanelLeft } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const PAGE_TITLES = {
  '/admin/dashboard': { title: 'Dashboard', sub: 'Welcome back — here\'s what\'s happening today.' },
  '/admin/users': { title: 'Users', sub: 'Manage your registered clients and accounts.' },
  '/admin/products': { title: 'Product Inventory', sub: 'Manage the curated archive of handcrafted textiles.' },
  '/admin/categories': { title: 'Categories', sub: 'Organise your product catalogue by technique & fabric.' },
  '/admin/orders': { title: 'Orders', sub: 'Track and manage all customer acquisitions.' },
  '/admin/inventory-logs': { title: 'Inventory Logs', sub: 'Full audit trail of stock movements and adjustments.' },
  '/admin/settings': { title: 'Settings', sub: 'Configure your MayaSindhu digital experience.' },
};

import mstitle from '../../assets/mstitle.png';

export default function TopNav({ sidebarOpen, onToggleSidebar }) {
  const location = useLocation();
  const page = PAGE_TITLES[location.pathname] || { title: 'Admin', sub: '' };

  return (
    <header
      className="flex items-center gap-4 px-6 shrink-0"
      style={{
        height: '60px',
        borderBottom: '1px solid #f0f0f0',
        background: 'rgba(251, 251, 251, 0.8)', // Semi-transparent based on user's color
        backdropFilter: 'blur(8px)',
      }}
    >
      {/* Sidebar toggle (only shown when sidebar is collapsed) */}
      {!sidebarOpen && (
        <button
          onClick={onToggleSidebar}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-black/5 hover:text-gray-800 transition-colors shrink-0"
          title="Expand Sidebar"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <line x1="9" y1="3" x2="9" y2="21" />
          </svg>
        </button>
      )}

      {/* MayaSindhu brand logo */}
      <div className="shrink-0 flex items-center">
        <img
          src={mstitle}
          alt="MayaSindhu"
          className="h-8 w-auto object-contain"
          style={{ maxHeight: '32px' }}
        />
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Glassy Search */}
      <div className="relative w-full max-w-xs shrink-0 drop-shadow-sm">
        <input
          type="text"
          placeholder="Search Masterpieces..."
          className="w-full bg-white/40 border border-white/60 rounded-full text-[12px] text-gray-700 placeholder:text-gray-400 outline-none transition-all focus:bg-white/60 backdrop-blur-md"
          style={{ padding: '7px 12px 7px 35px' }}
        />
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-700 pointer-events-none z-10" />
      </div>

      {/* Glassy Bell */}
      <button className="relative w-8 h-8 flex items-center justify-center rounded-full bg-white/40 border border-white/60 hover:bg-white/60 text-gray-600 transition-colors shrink-0 backdrop-blur-md shadow-sm mr-2">
        <Bell size={16} />
        <span className="absolute top-1 right-1 w-2 h-2 bg-yellow-400 rounded-full border-2 border-white/80" />
      </button>
    </header>
  );
}
