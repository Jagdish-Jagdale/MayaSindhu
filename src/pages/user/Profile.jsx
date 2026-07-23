/**
 * File: Profile.jsx
 * Description: Client-facing customer page rendering home banners, blog lists, product details, and profile user sections.
 * Work Done: Integrated baseline UI layouts, state boundaries, CSS theme styling, and routing pathways.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package, User, Heart, LogOut, ChevronRight,
  MapPin, Bell, RotateCcw, HelpCircle, Menu, ShoppingBag, X
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase';
import { doc, onSnapshot } from 'firebase/firestore';

// Import sections
import ProfileInfo from './Profile/sections/ProfileInfo';
import OrderHistory from './Profile/sections/OrderHistory';
import AddressBook from './Profile/sections/AddressBook';
import WishlistTab from './Profile/sections/WishlistTab';
import NotificationSettings from './Profile/sections/NotificationSettings';
import ReturnsRefunds from './Profile/sections/ReturnsRefunds';

import SupportTab from './Profile/sections/SupportTab';
import CartTab from './Profile/sections/CartTab';

const TABS = [
  { id: 'profile', label: 'My Profile', icon: <User size={18} />, component: ProfileInfo },
  { id: 'orders', label: 'My Orders', icon: <Package size={18} />, component: OrderHistory },
  { id: 'addresses', label: 'Address Book', icon: <MapPin size={18} />, component: AddressBook },
  { id: 'wishlist', label: 'Wishlist', icon: <Heart size={18} />, component: WishlistTab },

  { id: 'notifications', label: 'Notifications', icon: <Bell size={18} />, component: NotificationSettings },
  { id: 'returns', label: 'Returns & Refunds', icon: <RotateCcw size={18} />, component: ReturnsRefunds },
  { id: 'cart', label: 'Shopping Bag', icon: <ShoppingBag size={18} />, component: CartTab },
  { id: 'support', label: 'Help & Support', icon: <HelpCircle size={18} />, component: SupportTab },
];

export default function Profile() {
  const { user, logout, setLoginModalOpen } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTabFromUrl = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(
    initialTabFromUrl && TABS.some(t => t.id === initialTabFromUrl) ? initialTabFromUrl : 'profile'
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl && TABS.some(t => t.id === tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!user) {
      setLoginModalOpen(true);
      navigate('/');
      return;
    }

    // Real-time listener for profile data
    const unsubscribe = onSnapshot(
      doc(db, 'users', user.uid),
      (docSnap) => {
        if (docSnap.exists()) {
          setProfileData(docSnap.data());
        }
        setIsProfileLoading(false);
      },
      (error) => {
        setIsProfileLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, navigate]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  if (!user) return null;

  const getDisplayName = () => {
    if (isProfileLoading) return null; // Don't show name like 'dhanu' until loaded
    if (profileData?.fullName) return profileData.fullName;
    if (user.displayName) return user.displayName;
    if (user.email) return user.email.split('@')[0];
    return 'User';
  };
  const displayName = getDisplayName();

  const confirmLogout = async () => {
    try {
      await logout();
      setShowLogoutConfirm(false);
      navigate('/');
    } catch (error) {
    }
  };

  const ActiveComponent = TABS.find(t => t.id === activeTab)?.component || ProfileInfo;

  return (
    <div className="bg-white min-h-screen font-sans">
      {/* Mobile Navigation Header */}
      <div className="lg:hidden p-4 bg-white border-b border-gray-100 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-brand-orange text-white flex items-center justify-center font-bold text-xs">
            {user.photoURL ? <img src={user.photoURL} alt="" className="w-full h-full rounded-full object-cover" /> : (displayName ? displayName.charAt(0).toUpperCase() : 'U')}
          </div>
          <h3 className="font-bold text-sm text-[#1A1A1A]">{TABS.find(t => t.id === activeTab)?.label}</h3>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-brand-orange"><Menu size={24} /></button>
      </div>

      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-80px)]">
        {/* Sidebar Column */}
        <aside className={`
          lg:w-[320px] bg-white lg:border-r border-gray-100 z-40 transition-all duration-300
          ${isSidebarOpen ? 'fixed inset-0 overflow-y-auto' : 'hidden lg:block lg:sticky lg:top-20 lg:h-[calc(100vh-80px)]'}
        `}>
          <div className="flex flex-col h-full overscroll-contain">
            {/* Sidebar Profile Header */}
            <div className="flex flex-col items-center py-6 px-6 text-center relative">
              {/* Mobile Close Button */}
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-black lg:hidden cursor-pointer"
                aria-label="Close sidebar"
              >
                <X size={24} />
              </button>
              <div className="relative mb-3">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-brand-orange/5 p-1">
                  <div className="w-full h-full rounded-full bg-brand-orange border-4 border-white shadow-xl flex items-center justify-center text-white text-3xl sm:text-4xl font-bold overflow-hidden">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      displayName ? displayName.charAt(0).toUpperCase() : (
                        <div className="flex gap-1 items-center justify-center">
                          <span className="w-2 h-2 rounded-full bg-white animate-bounce [animation-delay:-0.32s]"></span>
                          <span className="w-2 h-2 rounded-full bg-white animate-bounce [animation-delay:-0.16s]"></span>
                          <span className="w-2 h-2 rounded-full bg-white animate-bounce"></span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-[#1A1A1A] leading-tight truncate w-full max-w-full overflow-hidden text-ellipsis px-2 min-h-[28px] flex items-center justify-center" title={displayName || ''}>
                {displayName ? (
                  displayName
                ) : (
                  <span className="inline-flex items-center gap-2 text-brand-orange text-xs font-bold uppercase tracking-widest">

                    <span className="inline-flex gap-1 items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-orange animate-bounce [animation-delay:-0.32s]"></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-orange animate-bounce [animation-delay:-0.16s]"></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-orange animate-bounce"></span>
                    </span>
                  </span>
                )}
              </h3>
              <hr className="w-full border-t border-gray-100 mt-3 mb-0" />
            </div>

            {/* Navigation List */}
            <nav className="flex-grow px-4 pb-8 overflow-y-auto no-scrollbar">
              <div className="space-y-1">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setSearchParams({ tab: tab.id }, { replace: true });
                      setIsSidebarOpen(false);
                    }}
                    className={`
                      w-full flex items-center gap-4 px-6 py-4 rounded-xl transition-all font-bold text-[13px] cursor-pointer group
                      ${activeTab === tab.id
                        ? 'bg-brand-orange text-white shadow-lg shadow-brand-orange/20'
                        : 'text-gray-700 hover:text-brand-orange hover:bg-orange-50/80'}
                    `}
                  >
                    <span className={activeTab === tab.id ? 'text-white' : 'text-gray-600 group-hover:text-brand-orange transition-colors'}>
                      {tab.icon}
                    </span>
                    <span className="uppercase tracking-widest">{tab.label}</span>
                    {activeTab === tab.id && <ChevronRight size={14} className="ml-auto" />}
                  </button>
                ))}
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  className="w-full flex items-center gap-4 px-6 py-4 rounded-xl transition-all font-bold text-[13px] bg-red-50 text-red-500 hover:bg-red-700 hover:text-white mt-4 border-t border-gray-100 pt-6 cursor-pointer"
                >
                  <LogOut size={18} />
                  <span className="uppercase tracking-widest">Sign Out</span>
                </button>
              </div>

            </nav>
          </div>
        </aside>

        {/* Main Content Column */}
        <main className="flex-grow bg-[#FBFBFB] p-6 md:p-12 lg:p-16 min-h-full flex flex-col justify-center items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="max-w-6xl mx-auto w-full flex-grow flex flex-col justify-center"
            >
              <ActiveComponent user={user} />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogoutConfirm(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[3000]"
            />
            <div className="fixed inset-0 flex items-center justify-center z-[3001] p-4 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-gray-100 pointer-events-auto text-center"
              >
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100 shadow-sm">
                  <LogOut size={28} />
                </div>
                <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">Confirm Logout</h3>
                <p className="text-gray-500 text-xs mb-6 leading-relaxed font-medium">
                  Are you sure you want to log out of your account?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowLogoutConfirm(false)}
                    className="flex-1 py-3.5 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors uppercase tracking-wider"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmLogout}
                    className="flex-1 py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all uppercase tracking-wider shadow-lg shadow-red-600/20 active:scale-[0.98]"
                  >
                    Logout
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
