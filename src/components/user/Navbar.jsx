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
  X,
  Plus,
  Minus
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import useCategories from '../../hooks/useCategories';
import navLogo from '../../assets/navbar logo.png';

export default function Navbar() {
  const { categories } = useCategories();
  const { user } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
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

  const isActive = (path) => location.pathname === path;

  return (
    <header className={`sticky top-0 z-[1000] transition-all duration-300 ${isScrolled ? 'shadow-lg' : ''}`}>
      {/* Top Navbar: Brand & Search & Icons */}
      <div className="bg-[#F7931E] border-b border-white/10">
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
              <div className="absolute right-6 top-1/2 -translate-y-1/2 text-brand-black/40 group-hover:text-brand-orange transition-colors cursor-pointer">
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
              <span className="absolute top-1 right-1 bg-white text-[#F7931E] text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-lg">0</span>
            </Link>
            <Link to="/cart" className="p-2 text-white hover:opacity-80 transition-opacity relative">
              <ShoppingBag size={24} strokeWidth={1.5} />
              <span className="absolute top-1 right-1 bg-white text-[#F7931E] text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-lg">0</span>
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
            {sortedCategories.map((category) => (
              <NavItem key={category.id} category={category} location={location} />
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

function NavItem({ category, location }) {
  const [isHovered, setIsHovered] = useState(false);
  const isActive = location.pathname.includes(`/category/${category.id}`);
  const hasSubCategories = category.children && category.children.length > 0;

  return (
    <li
      className="relative static group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link
        to={`/category/${category.id}`}
        className={`flex items-center gap-1.5 text-[11px] font-bold tracking-[0.14em] py-4 transition-colors ${isActive || isHovered ? 'text-brand-orange' : 'text-brand-black opacity-80'
          }`}
      >
        {category.name}
        {hasSubCategories && <ChevronDown size={12} className={`transition-transform duration-300 ${isHovered ? 'rotate-180' : ''}`} />}
      </Link>

      {/* Mega Menu Dropdown */}
      <AnimatePresence>
        {isHovered && hasSubCategories && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute left-1/2 -translate-x-1/2 top-full bg-white shadow-2xl border border-gray-100 z-50 pointer-events-auto overflow-hidden rounded-3xl w-max max-w-[90vw]"
          >
            <div className="px-10 py-10">
              <div className="flex gap-16 min-w-[300px]">
                {/* 1. Render groups that HAVE children (e.g., Sarees) */}
                {category.children.filter(sub => sub.children && sub.children.length > 0).map((subGroup) => (
                  <div key={subGroup.id} className="space-y-5">
                    <h4 className="text-[10px] font-black tracking-[0.2em] text-brand-black border-b border-gray-100 pb-3 h-10 flex items-end">
                      {subGroup.name}
                    </h4>
                    <ul className="space-y-2.5">
                      {subGroup.children.map((item) => (
                        <li key={item.id}>
                          <Link
                            to={`/category/${item.id}`}
                            className="text-[11px] text-brand-black/60 hover:text-brand-orange transition-colors block leading-tight"
                          >
                            {item.name}
                          </Link>
                        </li>
                      ))}
                      <li>
                        <Link
                          to={`/category/${subGroup.id}`}
                          className="text-[9px] font-bold tracking-widest text-brand-orange hover:underline pt-3 block"
                        >
                          View All
                        </Link>
                      </li>
                    </ul>
                  </div>
                ))}

                {/* 2. Render groups that DO NOT have children (flat list) */}
                {category.children.filter(sub => !sub.children || sub.children.length === 0).length > 0 && (
                  <div className="space-y-5">
                    <h4 className="text-[10px] font-black tracking-[0.2em] text-brand-black border-b border-gray-100 pb-3 h-10 flex items-end">
                      Shop {category.name}
                    </h4>
                    <ul className="space-y-2.5">
                      {category.children.filter(sub => !sub.children || sub.children.length === 0).map((item) => (
                        <li key={item.id}>
                          <Link
                            to={`/category/${item.id}`}
                            className="text-[11px] text-brand-black/60 hover:text-brand-orange transition-colors block leading-tight"
                          >
                            {item.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Subtle Bottom Banner */}
              <div className="mt-12 pt-8 border-t border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="w-12 h-[1px] bg-brand-orange/30"></span>
                  <p className="text-[10px] tracking-[0.3em] text-brand-black/40 font-bold">MayaSindhu Handcrafted Heritage</p>
                </div>
                <Link to="/shop" className="text-[10px] font-bold tracking-widest text-brand-black hover:text-brand-orange transition-all flex items-center gap-2 group">
                  Explore Full {category.name} Collection <Plus size={12} className="group-hover:rotate-90 transition-transform" />
                </Link>
              </div>
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
        <div className="flex items-center justify-between p-6 bg-[#F7931E] border-b border-white/10 h-[88px]">
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
          to={`/category/${item.id}`}
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
