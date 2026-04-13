import { Search, User, ShoppingBag, Menu, Heart } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();

  return (
    <header className="bg-white sticky top-0 z-50 border-b border-gray-100 py-4 h-20 flex items-center">
      <div className="max-w-[1536px] mx-auto px-6 lg:px-12 w-full flex items-center justify-between">
        
        {/* Left: Logo */}
        <div className="flex-shrink-0">
          <Link to="/" className="flex items-center">
            <h1 className="text-2xl font-fashion font-semibold tracking-tighter text-[#1A1A1A]">
              Maya<span className="text-[#FF6B00]">Sindhu</span>
            </h1>
          </Link>
        </div>

        {/* Center: Nav Links */}
        <nav className="hidden lg:flex items-center space-x-10">
          <Link to="/curation" className="text-[14px] font-medium text-gray-600 hover:text-[#FF6B00] transition-colors relative group">
            Curation
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#FF6B00] transition-all duration-300 group-hover:w-full"></span>
          </Link>
          <Link to="/shop" className="text-[14px] font-medium text-gray-600 hover:text-[#FF6B00] transition-colors relative group">
            Collections
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#FF6B00] transition-all duration-300 group-hover:w-full"></span>
          </Link>
          <Link to="/artisans" className="text-[14px] font-medium text-gray-600 hover:text-[#FF6B00] transition-colors relative group">
            Artisans
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#FF6B00] transition-all duration-300 group-hover:w-full"></span>
          </Link>
          <Link to="/journal" className="text-[14px] font-medium text-gray-600 hover:text-[#FF6B00] transition-colors relative group">
            Journal
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#FF6B00] transition-all duration-300 group-hover:w-full"></span>
          </Link>
        </nav>

        {/* Right: Search & Icons */}
        <div className="flex items-center space-x-6">
          {/* Search Bar */}
          <div className="hidden md:flex items-center bg-gray-50 border border-gray-100 rounded-full px-4 py-2 w-64 group focus-within:border-[#FF6B00]/30 transition-all">
            <input 
              type="text" 
              placeholder="Search curated art..." 
              className="bg-transparent border-none outline-none text-xs w-full text-gray-600 placeholder:text-gray-400"
            />
            <Search size={16} className="text-gray-400 group-focus-within:text-[#FF6B00] transition-colors" />
          </div>

          <div className="flex items-center space-x-5">
            <button className="text-gray-700 hover:text-[#FF6B00] transition-colors">
              <Heart size={20} strokeWidth={1.5} />
            </button>
            <Link to="/cart" className="text-gray-700 hover:text-[#FF6B00] transition-colors relative">
              <ShoppingBag size={20} strokeWidth={1.5} />
              <span className="absolute -top-1.5 -right-1.5 bg-[#FF6B00] text-white text-[8px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                0
              </span>
            </Link>
            <button className="text-gray-700 hover:text-[#FF6B00] transition-colors">
              <User size={20} strokeWidth={1.5} />
            </button>
            {/* Mobile Menu Icon */}
            <button className="lg:hidden text-gray-900 border border-gray-100 p-2 rounded-lg">
              <Menu size={20} />
            </button>
          </div>
        </div>

      </div>
    </header>
  );
}

