import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/admin/Sidebar';
import TopNav from '../components/admin/TopNav';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    /* Outer gray background — fills viewport */
    <div
      className="h-screen w-full flex items-center justify-center overflow-hidden"
      style={{ background: '#e8e8ec', padding: '16px', fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif" }}
    >
      {/* Inner wrapper — fills the padded area, flex row */}
      <div className="flex gap-4 w-full h-full">

        {/* ─── FLOATING SIDEBAR CARD ─── */}
        {sidebarOpen && (
          <div
            className="flex flex-col h-full overflow-hidden shrink-0"
            style={{
              width: '260px',
              background: '#ffffff',
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
            }}
          >
            {/* macOS window chrome — 3 dots + toggle */}
            <div className="flex items-center justify-between px-4 pt-5 pb-2 shrink-0">
              <div className="flex items-center gap-1.5 ml-1">
                <span className="w-3 h-3 rounded-full bg-[#FF5F57]" />
                <span className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                <span className="w-3 h-3 rounded-full bg-[#28C840]" />
              </div>
              {/* Sidebar toggle icon matching the screenshot */}
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1 rounded hover:bg-gray-100 text-gray-400 transition-colors"
                title="Collapse Sidebar"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <line x1="9" y1="3" x2="9" y2="21"/>
                </svg>
              </button>
            </div>

            {/* Sidebar content */}
            <Sidebar />
          </div>
        )}

        {/* ─── FLOATING MAIN CONTENT CARD ─── */}
        <div
          className="flex flex-col flex-1 min-w-0 h-full overflow-hidden"
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
          }}
        >
          {/* TopNav — owns the MayaSindhu logo + search + icons + sidebar toggle when collapsed */}
          <TopNav sidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

          {/* Page content */}
          <main
            className="flex-1 overflow-y-auto"
            style={{ padding: '28px 32px' }}
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
