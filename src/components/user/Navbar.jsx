import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Search,
  User,
  ShoppingBag,
  Menu,
  Heart,
  ChevronDown,
  ChevronRight,
  X
} from 'lucide-react';
import useCategories from '../../hooks/useCategories';
import './Navbar.css';

export default function Navbar() {
  const { categories, loading } = useCategories();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Scroll handler for floating effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const isActive = (path) => location.pathname === path;

  return (
    <div className={`navbar-container ${isScrolled ? 'navbar-scrolled' : ''}`}>
      <header className="navbar-inner">
        {/* Left: Logo */}
        <div className="flex-shrink-0">
          <Link to="/" className="flex items-center">
            <h1 className="text-2xl font-fashion font-semibold tracking-tighter text-[#1A1A1A]">
              Maya<span className="text-[#FF6B00]">Sindhu</span>
            </h1>
          </Link>
        </div>

        {/* Center: Nav Links (Desktop) */}
        <nav className="nav-links hidden lg:flex">
          <Link
            to="/"
            className={`nav-link-item ${isActive('/') ? 'active' : ''}`}
          >
            Home
          </Link>

          {/* Shop Dropdown */}
          <div className="nav-link-item group">
            <Link to="/shop" className="flex items-center gap-1">
              Shop <ChevronDown size={14} />
            </Link>
            <div className="dropdown-container">
              <Link to="/shop" className="dropdown-item">All Products</Link>
              <Link to="/new-arrivals" className="dropdown-item">New Arrivals</Link>
              <Link to="/best-sellers" className="dropdown-item">Best Sellers</Link>
              <Link to="/shop?filter=limited" className="dropdown-item flex items-center">
                Limited Pieces <span className="limited-tag">Limited</span>
              </Link>
            </div>
          </div>

          {/* Dynamic Categories */}
          {!loading && categories.map(category => (
            <NavItem key={category.id} category={category} location={location} />
          ))}

          <Link
            to="/about"
            className={`nav-link-item ${isActive('/about') ? 'active' : ''}`}
          >
            About Us
          </Link>
          <Link
            to="/contact"
            className={`nav-link-item ${isActive('/contact') ? 'active' : ''}`}
          >
            Contact
          </Link>
        </nav>

        {/* Right: Icons */}
        <div className="icon-bar">
          <button className="icon-btn hidden md:flex">
            <Search size={20} strokeWidth={1.5} />
          </button>
          <Link to="/wishlist" className="icon-btn hidden sm:flex">
            <Heart size={20} strokeWidth={1.5} />
          </Link>
          <Link to="/cart" className="icon-btn relative">
            <ShoppingBag size={20} strokeWidth={1.5} />
            <span className="absolute top-1 right-1 bg-[#FF6B00] text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
              0
            </span>
          </Link>
          <button className="icon-btn">
            <User size={20} strokeWidth={1.5} />
          </button>

          {/* Mobile Menu Toggle */}
          <button
            className="icon-btn lg:hidden ml-2"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu size={24} />
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay & Sidebar */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        categories={categories}
        location={location}
      />
    </div>
  );
}

// Recursive Nav Item for Desktop
function NavItem({ category, location }) {
  const hasSubCategories = category.children && category.children.length > 0;
  const isActive = location.pathname.includes(`/category/${category.id}`);

  return (
    <div className="nav-link-item group">
      <Link
        to={`/category/${category.id}`}
        className={`flex items-center gap-1 ${isActive ? 'active' : ''}`}
      >
        {category.name} {hasSubCategories && <ChevronDown size={14} />}
      </Link>

      {hasSubCategories && (
        <div className="dropdown-container">
          {category.children.map(child => (
            <SubNavItem key={child.id} category={child} />
          ))}
        </div>
      )}
    </div>
  );
}

// Sub-dropdown Component (handles sub-levels)
function SubNavItem({ category }) {
  const hasSubCategories = category.children && category.children.length > 0;

  return (
    <div className={`has-children ${hasSubCategories ? '' : ''}`}>
      <Link to={`/category/${category.id}`} className="dropdown-item">
        {category.name} {hasSubCategories && <ChevronRight size={14} />}
      </Link>

      {hasSubCategories && (
        <div className="sub-dropdown">
          {category.children.map(child => (
            <SubNavItem key={child.id} category={child} />
          ))}
        </div>
      )}
    </div>
  );
}

// Mobile Menu Component
function MobileMenu({ isOpen, onClose, categories, location }) {
  return (
    <div className={`mobile-menu-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}>
      <div className="mobile-sidebar" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-fashion font-semibold">Menu</h2>
          <button onClick={onClose} className="p-2"><X size={24} /></button>
        </div>

        <nav className="flex flex-col overflow-y-auto no-scrollbar pb-10">
          <MobileLink to="/" label="Home" />

          <MobileAccordion label="Shop">
            <MobileLink to="/shop" label="All Products" />
            <MobileLink to="/new-arrivals" label="New Arrivals" />
            <MobileLink to="/best-sellers" label="Best Sellers" />
            <MobileLink to="/shop?filter=limited" label="Limited Pieces (Special)" isSpecial />
          </MobileAccordion>

          {categories.map(category => (
            <MobileCategory key={category.id} category={category} />
          ))}

          <MobileLink to="/about" label="About Us" />
          <MobileLink to="/contact" label="Contact" />
        </nav>
      </div>
    </div>
  );
}

function MobileLink({ to, label, isSpecial }) {
  return (
    <Link to={to} className="mobile-nav-link">
      {label} {isSpecial && <span className="limited-tag">Limited</span>}
    </Link>
  );
}

function MobileAccordion({ label, children }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mobile-nav-item">
      <button
        className="mobile-nav-link w-full text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        {label} <ChevronDown size={18} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <div className={`mobile-sub-menu ${isOpen ? 'open' : ''}`}>
        {children}
      </div>
    </div>
  );
}

function MobileCategory({ category }) {
  const hasChildren = category.children && category.children.length > 0;

  if (!hasChildren) {
    return <MobileLink to={`/category/${category.id}`} label={category.name} />;
  }

  return (
    <MobileAccordion label={category.name}>
      <MobileLink to={`/category/${category.id}`} label={`All ${category.name}`} />
      {category.children.map(child => (
        <MobileCategory key={child.id} category={child} />
      ))}
    </MobileAccordion>
  );
}
