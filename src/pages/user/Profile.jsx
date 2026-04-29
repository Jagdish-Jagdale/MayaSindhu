import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, User, Heart, Settings, LogOut, ChevronRight, 
  MapPin, CreditCard, Bell, RotateCcw, HelpCircle, Menu, X, ShoppingBag, ArrowLeft 
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

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
  { id: 'profile', label: 'My Profile', icon: <User size={20} />, component: ProfileInfo },
  { id: 'orders', label: 'My Orders', icon: <Package size={20} />, component: OrderHistory },
  { id: 'addresses', label: 'Address Book', icon: <MapPin size={20} />, component: AddressBook },
  { id: 'wishlist', label: 'Wishlist', icon: <Heart size={20} />, component: WishlistTab },
  { id: 'payments', label: 'Saved Payments', icon: <CreditCard size={20} />, component: PaymentMethods },
  { id: 'notifications', label: 'Notifications', icon: <Bell size={20} />, component: NotificationSettings },
  { id: 'returns', label: 'Returns & Refunds', icon: <RotateCcw size={20} />, component: ReturnsRefunds },
  { id: 'cart', label: 'Shopping Bag', icon: <ShoppingBag size={20} />, component: CartTab },
  { id: 'support', label: 'Help & Support', icon: <HelpCircle size={20} />, component: SupportTab },
];

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  if (!user) return null;

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const ActiveComponent = TABS.find(t => t.id === activeTab)?.component || ProfileInfo;

  return (
    <div className="bg-[#FAF9F6] min-h-screen pt-16 pb-20 font-sans focus-within:scroll-smooth relative overflow-hidden">
      {/* Premium Background Accents */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-orange/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand-orange/3 rounded-full blur-[100px] -z-10 pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 relative">
        <Link to="/" className="flex items-center gap-2 text-[10px] font-bold text-gray-400 hover:text-black transition-all group mb-4 w-fit uppercase tracking-[0.2em]">
          <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
          Back to Store
        </Link>
        
        {/* Mobile Sidebar Toggle */}
        <div className="lg:hidden mb-8 flex items-center justify-between bg-white p-6 rounded-3xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-brand-orange text-white rounded-2xl flex items-center justify-center font-fashion font-bold text-xl uppercase">
              {user.displayName?.charAt(0) || user.email?.charAt(0)}
            </div>
            <div>
              <h3 className="font-fashion font-bold text-[#1A1A1A] leading-none mb-1">
                {TABS.find(t => t.id === activeTab)?.label}
              </h3>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Menu</p>
            </div>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-3 bg-gray-50 text-text-main rounded-2xl active:scale-90 transition-all"
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 relative">
          
          {/* Dashboard Sidebar */}
          <aside className={`
            lg:w-64 flex-shrink-0 z-40 transition-all duration-500
            ${isSidebarOpen ? 'fixed inset-0 bg-white p-12 overflow-y-auto' : 'hidden lg:block'}
          `}>
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/50 flex flex-col items-center text-center mb-6 border border-white/50 backdrop-blur-sm">
              <div className="w-20 h-20 bg-brand-orange rounded-[1.8rem] flex items-center justify-center text-white font-fashion font-bold text-2xl mb-4 shadow-2xl shadow-brand-orange/30 overflow-hidden border-4 border-white">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  user.displayName?.charAt(0) || user.email?.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <h2 className="text-xl font-fashion font-bold text-[#1A1A1A] leading-tight mb-1.5 uppercase tracking-tight">{user.displayName || 'Guest User'}</h2>
                <div className="inline-block px-3 py-1 bg-gray-50 rounded-full">
                  <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">{user.email}</p>
                </div>
              </div>
            </div>

            <nav className="bg-white/80 backdrop-blur-md rounded-[3rem] overflow-hidden p-3 shadow-xl shadow-gray-200/50 border border-white">
              <div className="space-y-1.5">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setIsSidebarOpen(false);
                    }}
                    className={`
                      w-full flex items-center justify-between p-5 rounded-2xl transition-all group
                      ${activeTab === tab.id 
                        ? 'bg-brand-orange text-white shadow-lg shadow-brand-orange/20' 
                        : 'text-gray-400 hover:bg-gray-50 hover:text-[#1A1A1A]'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`${activeTab === tab.id ? 'text-white' : 'text-gray-400 group-hover:text-brand-orange'} transition-colors`}>
                        {tab.icon}
                      </span>
                      <span className="text-[13px] font-bold tracking-wide">{tab.label}</span>
                    </div>
                    <ChevronRight size={16} className={`${activeTab === tab.id ? 'opacity-100' : 'opacity-0'} transition-opacity`} />
                  </button>
                ))}
                
                <div className="mt-2 pt-2 border-t border-gray-50">
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center justify-between p-4 rounded-xl text-red-500 hover:bg-red-50 transition-all font-black uppercase tracking-widest text-[10px] group"
                  >
                    <div className="flex items-center gap-3">
                      <LogOut size={16} className="group-hover:translate-x-1 transition-transform" />
                      <span>Sign Out</span>
                    </div>
                  </button>
                </div>
              </div>
            </nav>
          </aside>

          {/* Main Display Area */}
          <main className="flex-grow min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <ActiveComponent user={user} />
              </motion.div>
            </AnimatePresence>
          </main>

        </div>
      </div>
    </div>
  );
}
