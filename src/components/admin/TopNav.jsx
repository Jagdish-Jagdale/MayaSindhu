import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Bell, 
  Package, 
  Shapes, 
  User as UserIcon, 
  Diamond, 
  X, 
  ShoppingBag, 
  UserPlus, 
  Clock 
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../../firebase';
import { collection, onSnapshot, query, orderBy, limit, doc, deleteDoc } from 'firebase/firestore';
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

const PLACEHOLDERS = ["Products", "Categories", "Users"];

export default function TopNav({ sidebarOpen, onToggleSidebar, isMobile }) {
  const location = useLocation();
  const navigate = useNavigate();
  const page = PAGE_TITLES[location.pathname] || { title: 'Admin' };
  
  const [searchValue, setSearchValue] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  // Data State
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const searchRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDERS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Real-time Data Listeners
  useEffect(() => {
    const unsubProducts = onSnapshot(collection(db, 'products'), (snap) => {
      setProducts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const unsubCats = onSnapshot(collection(db, 'categories'), (snap) => {
      setCategories(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
      setUsers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    
    // Notifications Listener (Limit 5 recent)
    const qNotif = query(
      collection(db, 'notifications'), 
      orderBy('createdAt', 'desc'), 
      limit(5)
    );
    const unsubNotif = onSnapshot(qNotif, (snap) => {
      setNotifications(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => { 
      unsubProducts(); unsubCats(); unsubUsers(); unsubNotif(); 
    };
  }, []);

  // Filter Logic for Search
  const filteredResults = (() => {
    if (!searchValue.trim()) return [];
    const term = searchValue.toLowerCase();
    
    const matchedProducts = products
      .filter(p => p.name.toLowerCase().includes(term))
      .slice(0, 5)
      .map(p => ({
        id: p.id,
        name: p.name,
        type: 'product',
        subtext: `in ${categories.find(c => c.id === p.categoryId)?.name || 'General'}`,
        image: p.images?.[0] || null,
        path: '/admin/products'
      }));

    const matchedCats = categories
      .filter(c => c.name.toLowerCase().includes(term))
      .slice(0, 3)
      .map(c => ({
        id: c.id,
        name: c.name,
        type: 'category',
        subtext: 'Collection',
        path: '/admin/categories'
      }));

    const matchedUsers = users
      .filter(u => u.name?.toLowerCase().includes(term) || u.email?.toLowerCase().includes(term))
      .slice(0, 3)
      .map(u => ({
        id: u.id,
        name: u.name || u.email,
        type: 'user',
        subtext: u.role || 'Client',
        path: '/admin/users'
      }));

    return [...matchedProducts, ...matchedCats, ...matchedUsers];
  })();

  // Click Outside Behavior
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleResultClick = (result) => {
    setSearchValue("");
    setShowSearchDropdown(false);
    navigate(result.path);
  };

  const deleteNotification = async (id, e) => {
    e.stopPropagation();
    try {
      await deleteDoc(doc(db, 'notifications', id));
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return 'Just now';
    const date = timestamp.toDate();
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <header
      className="flex items-center gap-3 px-4 sm:px-6 shrink-0 relative"
      style={{
        height: '64px',
        borderBottom: '1px solid #f0f0f0',
        background: 'rgba(251, 251, 251, 0.8)',
        backdropFilter: 'blur(8px)',
        zIndex: 50
      }}
    >
      {/* ─── UNIFIED HEADER CONTENT ─── */}
      <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
        {isMobile && (
          <div className="z-20">
            <button
              onClick={onToggleSidebar}
              className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-500 hover:bg-black/5 hover:text-gray-800 transition-colors shrink-0"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <line x1="9" y1="3" x2="9" y2="21" />
              </svg>
            </button>
          </div>
        )}

        <div className="shrink-0 flex items-center h-full">
          <img src={mstitle} alt="MayaSindhu" className="h-6 sm:h-7 lg:h-9 w-auto object-contain" />
        </div>

        <div className="w-[1px] h-5 sm:h-6 bg-gray-200 mx-0.5 sm:mx-1 shrink-0" />

        <h1 className="text-[13px] sm:text-[15px] font-bold text-gray-800 tracking-tight truncate">
          {page.title}
        </h1>

        {!isMobile && <div className="flex-1" />}

        {/* Global Search Bar */}
        {!isMobile && (
          <div className="relative w-full max-w-[320px] shrink-0" ref={searchRef}>
            <div className="relative w-full h-[38px] flex items-center group">
              <input
                type="text"
                value={searchValue}
                onChange={(e) => {
                  setSearchValue(e.target.value);
                  setShowSearchDropdown(true);
                }}
                onFocus={() => {
                  setIsFocused(true);
                  if (searchValue) setShowSearchDropdown(true);
                }}
                onBlur={() => setIsFocused(false)}
                className={`w-full h-full bg-white/50 border ${showSearchDropdown && searchValue ? 'border-[#1BAFAF] ring-4 ring-[#1BAFAF]/5' : 'border-white/60'} rounded-2xl text-[13px] text-gray-700 outline-none transition-all focus:bg-white backdrop-blur-md px-10 shadow-sm`}
              />
              <Search size={15} className={`absolute left-3.5 transition-colors ${isFocused || searchValue ? 'text-[#1BAFAF]' : 'text-gray-400'}`} />
              
              {/* Dynamic Placeholder */}
              <AnimatePresence>
                {!searchValue && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="absolute left-10 pointer-events-none flex items-center gap-1"
                  >
                    <span className="text-[13px] text-gray-400 font-medium">Search</span>
                    {!isFocused && (
                      <div className="h-[20px] overflow-hidden relative">
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={placeholderIndex}
                            initial={{ y: 15, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -15, opacity: 0 }}
                            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                            className="text-[13px] text-gray-400 font-medium whitespace-nowrap"
                          >
                            {PLACEHOLDERS[placeholderIndex]}
                          </motion.div>
                        </AnimatePresence>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Search Results Dropdown */}
              <AnimatePresence>
                {showSearchDropdown && searchValue.trim() && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.98 }}
                    className="absolute top-[calc(100%+8px)] left-0 w-full bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden z-[100] py-2"
                  >
                    {filteredResults.length > 0 ? (
                      <div className="max-h-[400px] overflow-y-auto custom-scrollbar border-b border-gray-50">
                        {filteredResults.map((result) => (
                          <button
                            key={`${result.type}-${result.id}`}
                            onClick={() => handleResultClick(result)}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors group text-left"
                          >
                            <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                              {result.type === 'product' && result.image ? (
                                <img src={result.image} alt="" className="w-full h-full object-cover" />
                              ) : result.type === 'product' ? (
                                <Diamond size={18} className="text-[#1BAFAF]" />
                              ) : result.type === 'category' ? (
                                <Shapes size={18} className="text-[#1BAFAF]" />
                              ) : (
                                <UserIcon size={18} className="text-[#1BAFAF]" />
                              )}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="text-[14px] font-bold text-gray-800 truncate group-hover:text-[#1BAFAF] transition-colors">{result.name}</span>
                              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-tight">{result.subtext}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="px-6 py-8 text-center">
                        <p className="text-[13px] font-bold text-gray-400">No results found for "{searchValue}"</p>
                      </div>
                    )}
                    <div className="px-4 py-2 bg-gray-50/20 text-[10px] text-gray-400 font-bold uppercase tracking-widest text-center flex items-center justify-center gap-2">
                       <div className="w-1 h-1 bg-gray-300 rounded-full" />
                       Quick Global Search
                       <div className="w-1 h-1 bg-gray-300 rounded-full" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>

      {/* Right Actions (Notification Bell) */}
      <div className="flex items-center gap-2 ml-auto z-20">
        {isMobile && (
          <button className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-lg">
            <Search size={18} />
          </button>
        )}
        
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            className={`relative w-10 h-10 flex items-center justify-center rounded-full border transition-all shrink-0 backdrop-blur-md shadow-sm ${showNotifDropdown ? 'bg-white border-[#1BAFAF] text-[#1BAFAF] shadow-lg scale-95' : 'bg-white/40 border-white/60 text-gray-600 hover:bg-white/60'}`}
          >
            <Bell size={18} strokeWidth={showNotifDropdown ? 2.5 : 2} />
            {notifications.length > 0 && (
              <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse shadow-sm" />
            )}
          </button>

          {/* Notifications Dropdown - Aligned Right */}
          <AnimatePresence>
            {showNotifDropdown && (
              <motion.div
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 15, scale: 0.95 }}
                className="absolute top-[calc(100%+12px)] right-0 w-[300px] sm:w-[340px] bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-gray-100 overflow-hidden z-[100]"
              >
                <div className="bg-gray-50/50 px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                  <span className="text-[15px] font-semibold text-gray-900">Notifications</span>
                  {notifications.length > 0 && (
                    <div className="flex items-center gap-1.5 bg-[#1BAFAF]/10 px-2.5 py-1 rounded-full">
                       <span className="text-[10px] text-[#1BAFAF] font-bold uppercase tracking-widest">{notifications.length} New</span>
                    </div>
                  )}
                </div>

                <div className="max-h-[380px] overflow-y-auto custom-scrollbar">
                  {notifications.length > 0 ? (
                    notifications.map((notif) => (
                      <div 
                        key={notif.id}
                        className="group relative flex items-start gap-4 px-5 py-5 hover:bg-gray-50/80 transition-all border-b border-gray-50 last:border-0"
                      >
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border border-transparent transition-all group-hover:scale-105 ${notif.type === 'order' ? 'bg-amber-50 text-amber-500 group-hover:border-amber-100' : 'bg-blue-50 text-blue-500 group-hover:border-blue-100'}`}>
                          {notif.type === 'order' ? <ShoppingBag size={18} /> : <UserPlus size={18} />}
                        </div>
                        <div className="flex flex-col min-w-0 pr-8">
                          <p className="text-[13px] font-medium text-gray-700 leading-snug group-hover:text-[#1BAFAF] transition-colors">{notif.message}</p>
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <Clock size={10} className="text-gray-400" />
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{formatTime(notif.createdAt)}</span>
                          </div>
                        </div>
                        <button 
                          onClick={(e) => deleteNotification(notif.id, e)}
                          className="absolute right-3 top-4 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="px-6 py-20 text-center">
                      <div className="w-16 h-16 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-gray-200 border border-gray-50">
                        <Bell size={28} />
                      </div>
                      <p className="text-[15px] font-semibold text-gray-800">All caught up!</p>
                      <p className="text-[12px] text-gray-400 mt-1.5 font-medium">No new activity to show</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #f0f0f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #e0e0e0; }
      `}</style>
    </header>
  );
}
