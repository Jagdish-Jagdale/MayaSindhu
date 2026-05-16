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
        // Since Shop page is removed, we can redirect to a specific category or home
        // For now, let's just clear the suggestions and stay on page
        // or we could potentially navigate to a search result if we had a dedicated page
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

  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const timeoutRef = useRef(null);

  const handleGlobalMouseEnter = (id) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveCategoryId(id);
  };

  const handleGlobalMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveCategoryId(null);
    }, 400);
  };

  const isActive = (path) => location.pathname === path;
  const displayName = profileData?.fullName || user?.displayName || 'Guest User';

  return (
    <header className={`sticky top-0 z-[1000] transition-all duration-300 ${
      isScrolled ? 'shadow-md' : ''
    } bg-white border-b border-gray-200`}>
      {/* Top Navbar: Brand & Search & Icons */}
      <div className="border-b border-gray-200">
        <div className="max-w-[1536px] mx-auto px-6 h-[95px] flex items-center justify-between gap-8">

          {/* 1. Logo (Left) */}
          <div className="flex items-center h-full">
            <Link to="/" className="flex items-center relative group">
              <img src={navLogo} alt="MayaSindhu" className="h-12 md:h-[75px] w-auto object-contain opacity-0" />
              <div
                className="absolute inset-0 bg-[#F99C00] transition-opacity duration-300 group-hover:opacity-80"
                style={{
                  WebkitMaskImage: `url(${navLogo})`,
                  WebkitMaskSize: 'contain',
                  WebkitMaskRepeat: 'no-repeat',
                  WebkitMaskPosition: 'center',
                  maskImage: `url(${navLogo})`,
                  maskSize: 'contain',
                  maskRepeat: 'no-repeat',
                  maskPosition: 'center',
                }}
              />
            </Link>
          </div>

          {/* 2. Right Actions: Search + Icons */}
          <div className="flex items-center gap-4 lg:gap-6">
            {/* Search Bar (Now on the right) */}
            <div className="hidden md:flex relative group" ref={suggestionRef}>
              <div className="relative w-[300px] lg:w-[400px]">
                <input
                  type="text"
                  placeholder="Search curated art..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearch}
                  onFocus={() => searchQuery.length >= 1 && setSuggestions(suggestions)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-full py-2 pl-6 pr-12 focus:outline-none focus:bg-white focus:ring-4 focus:ring-brand-orange/10 transition-all text-sm placeholder-brand-black/40 text-brand-black shadow-sm"
                />
                <div 
                  onClick={handleSearch}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-black/50 group-hover:text-brand-orange transition-colors cursor-pointer"
                >
                  <Search size={16} strokeWidth={2} />
                </div>
              </div>

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
                          className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors group/item"
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
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-1 sm:gap-3">
              <button
                onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
                className="p-2 text-brand-black md:hidden hover:text-brand-orange transition-colors"
              >
                <Search size={22} strokeWidth={2} />
              </button>

              <Link to="/wishlist" className="p-2 text-brand-black hover:text-brand-orange transition-colors relative hidden sm:flex">
                <Heart size={22} strokeWidth={2} />
                {wishlistCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 bg-brand-orange text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-md">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              <Link to="/cart" className="p-2 text-brand-black hover:text-brand-orange transition-colors relative flex">
                <ShoppingBag size={22} strokeWidth={2} />
                {cartCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 bg-brand-orange text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-md">
                    {cartCount}
                  </span>
                )}
              </Link>

              <div 
                className="relative group hidden sm:block"
                onMouseEnter={() => setIsUserDropdownOpen(true)}
                onMouseLeave={() => setIsUserDropdownOpen(false)}
              >
                <Link
                  to={user ? "/profile" : "/login"}
                  className="p-2 text-brand-black hover:text-brand-orange transition-colors relative flex"
                >
                  <User size={22} strokeWidth={2} />
                </Link>

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
                        <div className="w-16 h-16 rounded-full bg-brand-orange flex items-center justify-center text-white font-bold text-2xl shadow-lg border-2 border-white mb-4">
                          {user.photoURL ? <img src={user.photoURL} alt="" className="w-full h-full object-cover rounded-full" /> : displayName.charAt(0)}
                        </div>
                        <h2 className="text-base font-bold text-[#1A1A1A] leading-tight mb-1 uppercase tracking-tight truncate w-full">{displayName}</h2>
                        <p className="text-gray-400 text-[9px] font-bold uppercase tracking-widest truncate w-full mb-6">{user.email}</p>
                        
                        <Link 
                          to="/profile"
                          onClick={() => setIsUserDropdownOpen(false)}
                          className="w-full py-3 bg-brand-black text-white rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] text-center hover:bg-brand-orange transition-all active:scale-95"
                        >
                          Manage Account
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 text-brand-black md:hidden hover:text-brand-orange transition-colors"
              >
                <Menu size={26} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Category Navigation (Desktop) - Centered */}
      <nav className={`hidden md:block transition-all duration-500 bg-white`}>
        <div className="max-w-[1536px] mx-auto px-6">
          <ul className="flex items-center justify-center gap-8 lg:gap-12 overflow-x-auto no-scrollbar py-0 w-full">
            {sortedCategories.map((category) => (

              <NavItem
                key={category.id}
                category={category}
                location={location}
                activeId={activeCategoryId}
                onEnter={() => handleGlobalMouseEnter(category.id)}
                onLeave={handleGlobalMouseLeave}
              />
            ))}
          </ul>
        </div>
      </nav>

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

function NavItem({ category, location, activeId, onEnter, onLeave }) {
  const liRef = useRef(null);
  const [rect, setRect] = useState(null);
  const [preferredDirection, setPreferredDirection] = useState('right');
  const isHovered = activeId === category.id;

  useEffect(() => {
    if (isHovered && liRef.current) {
      const currentRect = liRef.current.getBoundingClientRect();
      setRect(currentRect);
      const screenCenter = window.innerWidth / 2;
      setPreferredDirection(currentRect.left < screenCenter ? 'right' : 'left');
    }
  }, [isHovered]);

  const isActive = location.pathname.startsWith(category.fullPath) || location.pathname === category.fullPath;
  const hasSubCategories = category.children && category.children.length > 0;

  return (
    <li
      ref={liRef}
      className="relative flex-shrink-0"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
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
              top: rect.bottom + 4,
              left: preferredDirection === 'right' ? Math.max(16, rect.left) : 'auto',
              right: preferredDirection === 'left' ? Math.max(16, window.innerWidth - rect.right) : 'auto',
              maxWidth: 'calc(100vw - 32px)',
              zIndex: 1100
            }}
          >
            <div className="bg-white shadow-2xl border border-gray-100 rounded-2xl min-w-[220px] py-4 max-h-[350px] overflow-y-auto overscroll-contain custom-scrollbar">
              <RecursiveMenuList items={category.children} location={location} direction={preferredDirection} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}

function RecursiveMenuList({ items, location, direction }) {
  const [activeId, setActiveId] = useState(null);
  const timeoutRef = useRef(null);

  const handleItemEnter = (id) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveId(id);
  };

  const handleListLeave = () => {
    timeoutRef.current = setTimeout(() => setActiveId(null), 300);
  };

  return (
    <ul className="space-y-0.5" onMouseLeave={handleListLeave}>
      {items.map((child) => (
        <RecursiveMenuItem 
          key={child.id} 
          item={child} 
          location={location} 
          parentDirection={direction} 
          isHovered={activeId === child.id}
          onHoverEnter={() => handleItemEnter(child.id)}
        />
      ))}
    </ul>
  );
}

function RecursiveMenuItem({ item, location, parentDirection, isHovered, onHoverEnter }) {
  const liRef = useRef(null);
  const [rect, setRect] = useState(null);
  const [direction, setDirection] = useState(parentDirection);

  const handleMouseEnter = () => {
    if (liRef.current) {
      const currentRect = liRef.current.getBoundingClientRect();
      setRect(currentRect);
      
      if (parentDirection === 'right' && currentRect.right + 280 > window.innerWidth) {
        setDirection('left');
      } else if (parentDirection === 'left' && currentRect.left - 280 < 0) {
        setDirection('right');
      } else {
        setDirection(parentDirection);
      }
    }
    onHoverEnter();
  };

  const isActive = location.pathname.startsWith(item.fullPath) || location.pathname === item.fullPath;
  const hasSubCategories = item.children && item.children.length > 0;

  return (
    <li
      ref={liRef}
      className="relative px-3"
      onMouseEnter={handleMouseEnter}
    >
      <Link
        to={item.fullPath}
        className={`flex items-center justify-between w-full px-6 py-3 rounded-lg text-[15px] font-medium tracking-normal font-sans whitespace-nowrap gap-8 transition-all ${isHovered || isActive ? 'bg-brand-orange/5 text-brand-orange' : 'text-gray-600 hover:bg-gray-50 hover:text-brand-black'
          }`}
      >
        <div className="flex items-center gap-1.5">
          <span>{item.name}</span>
        </div>
        {hasSubCategories && (
          <ChevronRight size={14} className={`opacity-40 transition-transform ${direction === 'left' ? 'rotate-180' : ''}`} />
        )}
      </Link>

      <AnimatePresence>
        {isHovered && hasSubCategories && rect && (
          <motion.div
            initial={{ opacity: 0, x: direction === 'right' ? 10 : -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction === 'right' ? 10 : -10 }}
            transition={{ duration: 0.2 }}
            onMouseEnter={handleMouseEnter}
            style={{
              position: 'fixed',
              top: rect.top - 12,
              left: direction === 'right' ? rect.right - 2 : 'auto',
              right: direction === 'left' ? (window.innerWidth - rect.left) - 2 : 'auto',
              zIndex: 1250,
              paddingLeft: direction === 'right' ? '6px' : '0',
              paddingRight: direction === 'left' ? '6px' : '0'
            }}
          >
            <div className="bg-white shadow-2xl border border-gray-100 rounded-2xl min-w-[220px] py-4 max-h-[350px] overflow-y-auto overscroll-contain custom-scrollbar">
              <RecursiveMenuList items={item.children} location={location} direction={direction} />
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
