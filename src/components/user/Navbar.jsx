import React, { useState, useEffect, useRef } from 'react';
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
  Minus,
  Star
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import useCategories from '../../hooks/useCategories';
import navLogo from '../../assets/navbar logo.png';
import { db } from '../../firebase';
import { collection, onSnapshot, query, doc, getDocs, limit, where, orderBy } from 'firebase/firestore';

export default function Navbar() {
  const { categories } = useCategories();
  const { user } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [profileData, setProfileData] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      if (searchQuery.trim()) {
        navigate(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
        setIsMobileSearchOpen(false);
        setSuggestions([]);
      }
    }
  };

  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const suggestionRef = useRef(null);

  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 1) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      setIsSearching(true);
      try {
        const q = query(
          collection(db, 'products'),
          limit(20)
        );
        const snapshot = await getDocs(q);
        const allProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const filtered = allProducts.filter(p => 
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.collection?.toLowerCase().includes(searchQuery.toLowerCase())
        ).slice(0, 6);
        setSuggestions(filtered);
      } catch (err) {
        console.error("Suggestion Error:", err);
      } finally {
        setIsSearching(false);
      }
    };

    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (suggestionRef.current && !suggestionRef.current.contains(e.target)) {
        setSuggestions([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Live Search - Debounced
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        // Only trigger live search if we are already on the shop page or if it's a significant enough query
        // This avoids jarring navigation if the user is on Home and just starts typing
        if (location.pathname === '/shop' || searchQuery.length > 2) {
          navigate(`/shop?q=${encodeURIComponent(searchQuery.trim())}`, { replace: true });
        }
      } else if (location.pathname === '/shop' && !searchQuery && location.search.includes('q=')) {
        // Clear search if query is empty on shop page
        const params = new URLSearchParams(location.search);
        params.delete('q');
        navigate(`/shop${params.toString() ? '?' + params.toString() : ''}`, { replace: true });
      }
    }, 400); // 400ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery, navigate, location.pathname]);

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
    const q = new URLSearchParams(location.search).get('q') || '';
    setSearchQuery(q);
  }, [location.search]);

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

  // Real-time listener for profile data (to sync name/photo in Navbar)
  useEffect(() => {
    if (!user) {
      setProfileData(null);
      return;
    }
    const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
      if (docSnap.exists()) {
        setProfileData(docSnap.data());
      }
    });
    return () => unsubscribe();
  }, [user]);

  const isActive = (path) => location.pathname === path;
  const displayName = profileData?.fullName || user?.displayName || 'Guest User';

  return (
    <header className={`sticky top-0 z-[1000] transition-all duration-300 ${isScrolled ? 'shadow-lg' : ''}`}>
      {/* Top Navbar: Brand & Search & Icons */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-[1536px] mx-auto px-6 py-1 md:py-2 flex items-center justify-between">

          {/* 1. Logo (Left) */}
          <div className="flex-1 md:w-[200px] lg:w-[300px] flex justify-start items-center">
            <Link to="/" className="flex items-center relative inline-block group">
              {/* Invisible image to maintain intrinsic dimensions */}
              <img src={navLogo} alt="MayaSindhu" className="h-8 md:h-12 lg:h-16 w-auto object-contain opacity-0" />
              {/* Mask overlay for solid brand color */}
              <div
                className="absolute inset-0 bg-[#F99C00] transition-opacity duration-300 group-hover:opacity-80"
                style={{
                  WebkitMaskImage: `url(${navLogo})`,
                  WebkitMaskSize: 'contain',
                  WebkitMaskRepeat: 'no-repeat',
                  WebkitMaskPosition: 'left center',
                  maskImage: `url(${navLogo})`,
                  maskSize: 'contain',
                  maskRepeat: 'no-repeat',
                  maskPosition: 'left center',
                }}
              />
            </Link>
          </div>

          {/* 2 & 3. Search Bar and Icons (Right Aligned) */}
          <div className="flex-[2] flex justify-end items-center gap-2 lg:gap-6">

            {/* Search Bar (Hidden on Mobile) */}
            <div className="hidden md:block w-64 lg:w-80 relative group" ref={suggestionRef}>
              <input
                type="text"
                placeholder="Search curated art..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
                onFocus={() => searchQuery.length >= 1 && setSuggestions(suggestions)}
                className="w-full bg-gray-50 border border-gray-200 rounded-full py-2.5 pl-6 pr-12 focus:outline-none focus:bg-white focus:ring-4 focus:ring-brand-orange/10 transition-all text-sm placeholder-brand-black/40 text-brand-black shadow-sm"
              />
              <div 
                onClick={handleSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-black/50 group-hover:text-brand-orange transition-colors cursor-pointer"
              >
                <Search size={18} strokeWidth={2} />
              </div>

              {/* Suggestions Dropdown */}
              <AnimatePresence>
                {suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[1100]"
                  >
                    <div className="p-2">
                      {suggestions.map((p) => (
                        <Link
                          key={p.id}
                          to={`/product/${p.slug || p.id}`}
                          onClick={() => setSuggestions([])}
                          className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors group/item"
                        >
                          <div className="w-12 h-12 rounded-lg bg-gray-50 overflow-hidden flex-shrink-0 border border-gray-100 p-1">
                            <img src={p.image || (p.images && p.images[0])} alt="" className="w-full h-full object-contain" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-[#1A1A1A] truncate group-hover/item:text-brand-orange transition-colors">{p.name}</h4>
                            <p className="text-[10px] text-gray-400 font-medium">₹{p.price?.toLocaleString()}</p>
                          </div>
                          <ChevronRight size={14} className="text-gray-300 group-hover/item:text-brand-orange group-hover/item:translate-x-1 transition-all" />
                        </Link>
                      ))}
                      <button 
                        onClick={() => handleSearch({ type: 'click' })}
                        className="w-full py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-brand-orange border-t border-gray-50 mt-1 transition-colors"
                      >
                        View All Results
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Search Toggle */}
            <button
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              className="p-2 text-brand-black md:hidden hover:text-brand-orange transition-colors flex items-center justify-center min-w-[40px]"
            >
              <Search size={22} strokeWidth={2} />
            </button>

            {/* Icons Group */}
            <div className="flex items-center gap-1 sm:gap-2">
              <Link to="/wishlist" className="p-2 text-brand-black hover:text-brand-orange transition-colors relative hidden sm:flex items-center justify-center min-w-[40px]">
                <Heart size={22} strokeWidth={2} />
                {wishlistCount > 0 && (
                  <span className="absolute top-1 right-1 bg-brand-orange text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-md">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              <Link to="/cart" className="p-2 text-brand-black hover:text-brand-orange transition-colors relative flex items-center justify-center min-w-[40px]">
                <ShoppingBag size={22} strokeWidth={2} />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 bg-brand-orange text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-md">
                    {cartCount}
                  </span>
                )}
              </Link>

              <div 
                className="relative group"
                onMouseEnter={() => setIsUserDropdownOpen(true)}
                onMouseLeave={() => setIsUserDropdownOpen(false)}
              >
                <Link
                  to={user ? "/profile" : "/login"}
                  className="p-2 text-brand-black hover:text-brand-orange transition-colors relative flex items-center justify-center min-w-[40px]"
                >
                  <User size={22} strokeWidth={2} />
                </Link>

                {/* Premium User Dropdown */}
                <AnimatePresence>
                  {isUserDropdownOpen && user && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="absolute right-0 top-full pt-2 z-[1100] w-72"
                    >
                      <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-2xl shadow-black/5 flex flex-col items-center text-center relative overflow-hidden group/card">
                        {/* Avatar Section */}
                        <div className="relative mb-4 p-1 rounded-full border-2 border-brand-orange/10">
                          <div className="w-16 h-16 rounded-full bg-brand-orange flex items-center justify-center text-white font-bold text-2xl shadow-lg border-2 border-white overflow-hidden">
                            {user.photoURL ? (
                              <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                              displayName.charAt(0)
                            )}
                          </div>
                        </div>

                        <div className="relative z-10 w-full mb-6">
                          <h2 className="text-base font-bold text-[#1A1A1A] leading-tight mb-1 uppercase tracking-tight truncate">{displayName}</h2>
                          <p className="text-gray-400 text-[9px] font-bold uppercase tracking-widest truncate">{user.email}</p>
                        </div>

                        {/* Stats Row */}
                        <div className="grid grid-cols-3 gap-2 w-full mb-6 pt-6 border-t border-gray-50">
                          <div className="bg-gray-50/50 p-2.5 rounded-xl border border-gray-100">
                            <p className="text-xs font-bold text-[#1A1A1A]">12</p>
                            <p className="text-[7px] text-brand-orange uppercase font-bold tracking-widest mt-0.5">Orders</p>
                          </div>
                          <div className="bg-gray-50/50 p-2.5 rounded-xl border border-gray-100">
                            <p className="text-xs font-bold text-[#1A1A1A]">48</p>
                            <p className="text-[7px] text-brand-orange uppercase font-bold tracking-widest mt-0.5">Saved</p>
                          </div>
                          <div className="bg-gray-50/50 p-2.5 rounded-xl border border-gray-100">
                            <p className="text-xs font-bold text-[#1A1A1A]">5</p>
                            <p className="text-[7px] text-brand-orange uppercase font-bold tracking-widest mt-0.5">Reviews</p>
                          </div>
                        </div>

                        <Link 
                          to="/profile"
                          onClick={() => setIsUserDropdownOpen(false)}
                          className="w-full py-4 bg-brand-orange text-white rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg shadow-brand-orange/20 hover:bg-brand-orange-dark transition-all active:scale-95"
                        >
                          Manage Account
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 text-brand-black md:hidden hover:text-brand-orange transition-colors flex items-center justify-center min-w-[40px]"
            >
              <Menu size={26} />
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
              className="md:hidden border-t border-gray-100 bg-gray-50/50 overflow-hidden"
            >
              <div className="px-6 py-5">
                <div className="relative" ref={suggestionRef}>
                  <input
                    type="text"
                    placeholder="Search for Sarees, Jewelry..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleSearch}
                    autoFocus
                    className="w-full bg-white border border-gray-200 rounded-full py-4 pl-6 pr-12 focus:outline-none focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/5 transition-all text-sm"
                  />
                  <div 
                    onClick={handleSearch}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-orange"
                  >
                    <Search size={20} />
                  </div>

                  {/* Mobile Suggestions */}
                  <AnimatePresence>
                    {suggestions.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="mt-4 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
                      >
                        <div className="p-2">
                          {suggestions.map((p) => (
                            <Link
                              key={p.id}
                              to={`/product/${p.slug || p.id}`}
                              onClick={() => {
                                setSuggestions([]);
                                setIsMobileSearchOpen(false);
                              }}
                              className="flex items-center gap-3 p-4 hover:bg-gray-50 rounded-xl transition-colors border-b last:border-0 border-gray-50"
                            >
                              <div className="w-12 h-12 rounded-lg bg-gray-50 overflow-hidden flex-shrink-0 border border-gray-100 p-1">
                                <img src={p.image || (p.images && p.images[0])} alt="" className="w-full h-full object-contain" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-bold text-[#1A1A1A] truncate">{p.name}</h4>
                                <p className="text-xs text-brand-orange font-bold">₹{p.price?.toLocaleString()}</p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Category Navigation (Desktop) - Adjusted for secondary nav look */}
      <nav className={`hidden md:block transition-all duration-500 ${isScrolled ? 'bg-white/80 backdrop-blur-xl border-b border-gray-100' : 'bg-gray-50 border-b border-gray-200'}`}>
        <div className="max-w-[1536px] mx-auto px-6 py-0">
          <ul className="flex items-center justify-start gap-10 lg:gap-14 overflow-x-auto no-scrollbar py-1 w-full">
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
  const liRef = useRef(null);
  const [rect, setRect] = useState(null);
  const [calculatedSide, setCalculatedSide] = useState(side);

  useEffect(() => {
    setIsHovered(false);
  }, [location.pathname]);

  const handleMouseEnter = () => {
    if (liRef.current) {
      const currentRect = liRef.current.getBoundingClientRect();
      setRect(currentRect);
      // If the item is in the right 40% of the screen, open the menu to the left
      setCalculatedSide(currentRect.right > window.innerWidth * 0.6 ? 'right' : 'left');
    }
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const isActive = location.pathname.startsWith(category.fullPath) || location.pathname === category.fullPath;
  const hasSubCategories = category.children && category.children.length > 0;

  return (
    <li
      ref={liRef}
      className="relative flex-shrink-0"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link
        to={category.fullPath}
        className={`flex items-center gap-2 text-[14px] font-medium tracking-wide font-sans py-2 whitespace-nowrap transition-all duration-300 ${isActive || isHovered ? 'text-brand-orange scale-105' : 'text-gray-700 hover:text-brand-black'
          }`}
      >
        <span className="capitalize">{category.name.toLowerCase()}</span>
        {hasSubCategories && (
          <ChevronDown
            size={14}
            className={`transition-transform duration-500 ${isHovered ? 'rotate-180 text-brand-orange' : 'text-gray-400'}`}
          />
        )}
      </Link>

      <AnimatePresence>
        {isHovered && hasSubCategories && rect && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed',
              top: rect.bottom,
              left: calculatedSide === 'left' ? Math.max(16, rect.left) : 'auto',
              right: calculatedSide === 'right' ? Math.max(16, window.innerWidth - rect.right) : 'auto',
              maxWidth: 'calc(100vw - 32px)'
            }}
            className={`pt-2 z-[1100]`}
          >
            <div className="bg-white shadow-2xl border border-gray-100 rounded-2xl min-w-max py-2">
              <ul className="space-y-0.5">
                {category.children.map((child) => (
                  <RecursiveMenuItem key={child.id} item={child} side={calculatedSide} location={location} />
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}

function RecursiveMenuItem({ item, side, location }) {
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    setIsHovered(false);
  }, [location.pathname]);
  const isActive = location.pathname.startsWith(item.fullPath) || location.pathname === item.fullPath;
  const hasSubCategories = item.children && item.children.length > 0;

  return (
    <li
      className="relative px-3"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link
        to={item.fullPath}
        className={`flex items-center justify-between w-full px-5 py-3 rounded-xl text-[15px] font-normal tracking-normal font-sans whitespace-nowrap gap-4 transition-all ${isHovered || isActive ? 'bg-brand-orange/5 text-brand-orange' : 'text-gray-600 hover:bg-gray-50 hover:text-brand-black'
          }`}
      >
        <div className="flex items-center gap-1.5">
          <span>{item.name}</span>
        </div>
        {hasSubCategories && (
          side === 'right' ? (
            <ChevronRight size={14} className="opacity-40 rotate-180" />
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
            <div className="bg-white shadow-2xl border border-gray-100 rounded-2xl min-w-max py-2">
              <ul className="space-y-0.5">
                {item.children.map((child) => (
                  <RecursiveMenuItem key={child.id} item={child} side={side} location={location} />
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
          className={`text-sm font-bold tracking-widest flex items-center gap-1.5 ${depth === 0 ? 'text-brand-black' : 'text-brand-black/70'}`}
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
