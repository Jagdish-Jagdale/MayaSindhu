/**
 * File: Profile.jsx
 * Description: Client-facing customer page rendering home banners, blog lists, product details, and profile user sections.
 * Work Done: Integrated baseline UI layouts, state boundaries, CSS theme styling, and routing pathways.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package, User, Heart, LogOut, ChevronRight,
  MapPin, CreditCard, Bell, RotateCcw, HelpCircle, Menu, ShoppingBag, X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
import PaymentMethods from './Profile/sections/PaymentMethods';
import SupportTab from './Profile/sections/SupportTab';
import CartTab from './Profile/sections/CartTab';

const TABS = [
  { id: 'profile', label: 'My Profile', icon: <User size={18} />, component: ProfileInfo },
  { id: 'orders', label: 'My Orders', icon: <Package size={18} />, component: OrderHistory },
  { id: 'addresses', label: 'Address Book', icon: <MapPin size={18} />, component: AddressBook },
  { id: 'wishlist', label: 'Wishlist', icon: <Heart size={18} />, component: WishlistTab },
  { id: 'payments', label: 'Saved Payments', icon: <CreditCard size={18} />, component: PaymentMethods },
  { id: 'notifications', label: 'Notifications', icon: <Bell size={18} />, component: NotificationSettings },
  { id: 'returns', label: 'Returns & Refunds', icon: <RotateCcw size={18} />, component: ReturnsRefunds },
  { id: 'cart', label: 'Shopping Bag', icon: <ShoppingBag size={18} />, component: CartTab },
  { id: 'support', label: 'Help & Support', icon: <HelpCircle size={18} />, component: SupportTab },
];

export default function Profile() {
  const { user, logout, setLoginModalOpen } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    if (!user) {
      setLoginModalOpen(true);
      navigate('/');
      return;
    }

    // Real-time listener for profile data (to sync name/photo across sidebar and content)
    const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
      if (docSnap.exists()) {
        setProfileData(docSnap.data());
      }
    });

    return () => unsubscribe();
  }, [user, navigate]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  if (!user) return null;

  const displayName = profileData?.fullName || user.displayName || 'Guest User';

  const handleLogout = async () => {
    try {
      await logout();
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
            {user.photoURL ? <img src={user.photoURL} alt="" className="w-full h-full rounded-full object-cover" /> : displayName.charAt(0)}
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
            <div className="flex flex-col items-center py-12 px-6 text-center relative">
              {/* Mobile Close Button */}
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-black lg:hidden cursor-pointer"
                aria-label="Close sidebar"
              >
                <X size={24} />
              </button>
              <div className="relative mb-6">
                <div className="w-28 h-28 rounded-full bg-brand-orange/5 p-1">
                  <div className="w-full h-full rounded-full bg-brand-orange border-4 border-white shadow-xl flex items-center justify-center text-white text-4xl font-bold overflow-hidden">
                    {user.photoURL ? <img src={user.photoURL} alt="" className="w-full h-full rounded-full object-cover" /> : displayName.charAt(0)}
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-bold text-[#1A1A1A] mb-1 leading-tight">{displayName}</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Premium Member</p>
            </div>

            {/* Navigation List */}
            <nav className="flex-grow px-4 pb-8 overflow-y-auto no-scrollbar">
              <div className="space-y-1">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setIsSidebarOpen(false);
                    }}
                    className={`
                      w-full flex items-center gap-4 px-6 py-4 rounded-xl transition-all font-bold text-[13px]
                      ${activeTab === tab.id
                        ? 'bg-brand-orange text-white shadow-lg shadow-brand-orange/20'
                        : 'text-gray-400 hover:text-[#1A1A1A] hover:bg-gray-50'}
                    `}
                  >
                    <span className={activeTab === tab.id ? 'text-white' : 'text-gray-400'}>
                      {tab.icon}
                    </span>
                    <span className="uppercase tracking-widest">{tab.label}</span>
                    {activeTab === tab.id && <ChevronRight size={14} className="ml-auto" />}
                  </button>
                ))}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-4 px-6 py-4 rounded-xl transition-all font-bold text-[13px] text-red-500 hover:bg-red-50 mt-4 border-t border-gray-100 pt-6"
                >
                  <LogOut size={18} />
                  <span className="uppercase tracking-widest">Sign Out</span>
                </button>
              </div>

            </nav>
          </div>
        </aside>

        {/* Main Content Column */}
        <main className="flex-grow bg-[#FBFBFB] p-6 md:p-12 lg:p-16 min-h-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="max-w-6xl mx-auto"
            >
              <ActiveComponent user={user} />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
