import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  User,
  ShoppingBag,
  Menu,
  Heart,
  ChevronDown,
  ChevronRight,
  X,
  Plus,
  Minus
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import useCategories from '../../hooks/useCategories';
import navLogo from '../../assets/navbar logo.png';
import { db } from '../../firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';

export default function Navbar() {
  const { categories } = useCategories();
  const { user } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  // Define the preferred order for main categories
  const categoryOrder = [
    'CURATED SAREES',
    'DESIGNER DRESS MATERIALS',
    'FESTIVE SPECIAL COLLECTION',
    'HANDCRAFTED JEWELLERY',
    'ELEGANT ACCESSORIES',
    'BAGS',
    'TRENDY READYMADES'
  ];

  const sortedCategories = [...categories].sort((a, b) => {
    const indexA = categoryOrder.indexOf(a.name.toUpperCase().trim());
    const indexB = categoryOrder.indexOf(b.name.toUpperCase().trim());

    // If not in our list, put it at the end
    if (indexA === -1 && indexB === -1) return a.name.localeCompare(b.name);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;

    return indexA - indexB;
  });

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Listen for Dynamic Cart Count
  useEffect(() => {
    if (!user) {
      setCartCount(0);
      return;
    }
    const q = query(collection(db, 'users', user.uid, 'cart'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setCartCount(snapshot.size);
    });
    return () => unsubscribe();
  }, [user]);

  // Listen for Dynamic Wishlist Count
  useEffect(() => {
    if (!user) {
      setWishlistCount(0);
      return;
    }
    const q = query(collection(db, 'users', user.uid, 'wishlist'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setWishlistCount(snapshot.size);
    });
    return () => unsubscribe();
  }, [user]);

  const isActive = (path) => location.pathname === path;

  return (
    <header className={`sticky top-0 z-[1000] transition-all duration-300 ${isScrolled ? 'shadow-lg' : ''}`}>
      {/* Top Navbar: Brand & Search & Icons */}
      <div className="bg-brand-orange border-b border-white/10">
        <div className="max-w-[1536px] mx-auto px-6 py-2 flex items-center justify-between">
          
          {/* 1. Logo (Left) */}
          <div className="w-[200px] lg:w-[300px] flex-shrink-0">
            <Link to="/" className="flex items-center">
              <img src={navLogo} alt="MayaSindhu" className="h-14 md:h-20 w-auto object-contain" />
            </Link>
          </div>

          {/* 2. Search Bar (Centered) */}
          <div className="hidden md:flex flex-1 justify-center px-10">
            <div className="w-full max-w-2xl relative group">
              <input
                type="text"
                placeholder="Search for Handcrafted Sarees, Jewelry..."
                className="w-full bg-white/95 border border-transparent rounded-full py-3.5 pl-7 pr-14 focus:outline-none focus:bg-white focus:ring-4 focus:ring-white/20 transition-all text-sm placeholder-brand-black/30 text-brand-black shadow-lg"
              />
              <div className="absolute right-6 top-1/2 -translate-y-1/2 text-text-main/40 group-hover:text-white transition-colors cursor-pointer">
                <Search size={20} strokeWidth={2} />
              </div>
            </div>
          </div>

          {/* 3. Icon Group (Right) */}
          <div className="w-[200px] lg:w-[300px] flex items-center justify-end gap-2 sm:gap-4">
            <button
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              className="p-2 text-white md:hidden hover:opacity-80 transition-opacity"
            >
              <Search size={24} strokeWidth={1.5} />
            </button>
            <Link
              to={user ? "/profile" : "/login"}
              className="p-2 text-white hover:opacity-80 transition-opacity relative"
            >
              <User size={24} strokeWidth={1.5} />
            </Link>
            <Link to="/wishlist" className="p-2 text-white hover:opacity-80 transition-opacity relative hidden sm:block">
              <Heart size={24} strokeWidth={1.5} />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 bg-white text-brand-orange text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-lg">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <Link to="/cart" className="p-2 text-white hover:opacity-80 transition-opacity relative">
              <ShoppingBag size={24} strokeWidth={1.5} />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-white text-brand-orange text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-lg">
                  {cartCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 text-white md:hidden"
            >
              <Menu size={28} />
            </button>
          </div>
        </div>

        {/* Mobile Search Bar Expansion */}
        <AnimatePresence>
          {isMobileSearchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-gray-50 bg-gray-50/50 overflow-hidden"
            >
              <div className="px-6 py-5">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search for Sarees, Jewelry..."
                    autoFocus
                    className="w-full bg-white border border-brand-orange/20 rounded-full py-4 pl-6 pr-12 focus:outline-none focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/5 transition-all text-sm"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-orange">
                    <Search size={20} />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Category Navigation (Desktop) - Adjusted for secondary nav look */}
      <nav className="hidden md:block bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-[1536px] mx-auto px-6 py-1">
          <ul className="flex items-center justify-center gap-4 lg:gap-14">
            {sortedCategories.map((category, index) => (
              <NavItem 
                key={category.id} 
                category={category} 
                location={location} 
                side={index >= sortedCategories.length / 2 ? 'right' : 'left'}
              />
            ))}
          </ul>
        </div>
      </nav>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <MobileMenu
            categories={sortedCategories}
            onClose={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>
    </header>
  );
}

function NavItem({ category, location, side }) {
  const [isHovered, setIsHovered] = useState(false);
  const isActive = location.pathname.includes(`/category/${category.id}`);
  const hasSubCategories = category.children && category.children.length > 0;

  return (
    <li
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link
        to={category.fullPath}
        className={`flex items-center gap-1.5 text-[11px] font-bold tracking-[0.14em] py-4 transition-colors ${isActive || isHovered ? 'text-brand-orange' : 'text-brand-black opacity-80'
          }`}
      >
        {category.name}
        {hasSubCategories && (
          <ChevronDown 
            size={12} 
            className={`transition-transform duration-300 ${isHovered ? 'rotate-180' : ''}`} 
          />
        )}
      </Link>

      <AnimatePresence>
        {isHovered && hasSubCategories && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className={`absolute ${side === 'right' ? 'right-0' : 'left-0'} top-full pt-2 z-[1100]`}
          >
            <div className="bg-white shadow-2xl border border-gray-100 rounded-2xl min-w-[240px] py-3">
              <ul className="space-y-0.5">
                {category.children.map((child) => (
                  <RecursiveMenuItem key={child.id} item={child} side={side} />
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}

function RecursiveMenuItem({ item, side }) {
  const [isHovered, setIsHovered] = useState(false);
  const hasSubCategories = item.children && item.children.length > 0;

  return (
    <li
      className="relative px-3"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link
        to={item.fullPath}
        className={`flex items-center justify-between w-full px-4 py-2.5 rounded-xl text-[12px] font-medium transition-all ${
          isHovered ? 'bg-brand-orange/5 text-brand-orange' : 'text-brand-black/70 hover:bg-gray-50'
        }`}
      >
        <span>{item.name}</span>
        {hasSubCategories && (
          side === 'right' ? (
            <ChevronRight size={14} className="opacity-40 rotate-180" /> // Point left if opening left? No, let's just use standard arrow or a left arrow.
          ) : (
            <ChevronRight size={14} className="opacity-40" />
          )
        )}
      </Link>

      <AnimatePresence>
        {isHovered && hasSubCategories && (
          <motion.div
            initial={{ opacity: 0, x: side === 'right' ? 10 : -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: side === 'right' ? 10 : -10 }}
            transition={{ duration: 0.2 }}
            className={`absolute ${side === 'right' ? 'right-[100%]' : 'left-[100%]'} top-0 ${side === 'right' ? 'pr-1' : 'pl-1'} z-[1100]`}
          >
            <div className="bg-white shadow-2xl border border-gray-100 rounded-2xl min-w-[240px] py-3">
              <ul className="space-y-0.5">
                {item.children.map((child) => (
                  <RecursiveMenuItem key={child.id} item={child} side={side} />
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}

function MobileMenu({ categories, onClose }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleUserAction = () => {
    onClose();
    if (user) {
      navigate('/profile');
    } else {
      navigate('/login');
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-brand-black/20 backdrop-blur-sm z-[1100]"
      />
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: 0 }}
        exit={{ x: '-100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed top-0 left-0 bottom-0 w-[85%] max-w-[350px] bg-white z-[1200] flex flex-col shadow-2xl"
      >
        <div className="flex items-center justify-between p-6 bg-brand-orange border-b border-white/10 h-[88px]">
          <Link to="/" onClick={onClose} className="flex items-center">
            <img src={navLogo} alt="MayaSindhu" className="h-10 w-auto object-contain" />
          </Link>
          <button onClick={onClose} className="p-2 text-white hover:opacity-80 transition-opacity">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-2">

          <div className="pt-4">
            <p className="text-[10px] font-black tracking-[0.2em] text-brand-black/40 mb-4">Categories</p>
            {categories.map((cat) => (
              <MobileAccordion key={cat.id} item={cat} onClose={onClose} />
            ))}
          </div>

          <div className="pt-6 border-t border-gray-50 space-y-4">
          </div>
        </div>

        <div className="p-6 border-t bg-brand-orange-light">
          <button
            onClick={handleUserAction}
            className="w-full bg-brand-orange text-white font-bold py-4 rounded-xl shadow-lg shadow-brand-orange/20 hover:bg-brand-orange-dark transition-all active:scale-95"
          >
            {user ? 'View My Profile' : 'Login / Signup'}
          </button>
        </div>
      </motion.div>
    </>
  );
}

function MobileAccordion({ item, onClose, depth = 0 }) {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = item.children && item.children.length > 0;

  return (
    <div className="mb-2">
      <div className="flex items-center justify-between py-2">
        <Link
          to={item.fullPath}
          onClick={onClose}
          className={`text-sm font-bold tracking-widest ${depth === 0 ? 'text-brand-black' : 'text-brand-black/70'}`}
        >
          {item.name}
        </Link>
        {hasChildren && (
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 text-brand-orange"
          >
            {isOpen ? <Minus size={18} /> : <Plus size={18} />}
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="pl-4 border-l border-brand-orange/20 ml-2 overflow-hidden"
          >
            {item.children.map(child => (
              <MobileAccordion key={child.id} item={child} onClose={onClose} depth={depth + 1} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
