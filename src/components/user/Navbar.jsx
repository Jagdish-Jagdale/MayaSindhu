import { Search, User, ShoppingBag, Menu } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../../assets/MayaSindhulogo.png';

export default function Navbar() {
  const location = useLocation();

  return (
    <header className="bg-white sticky top-0 z-50 border-b border-gray-100 py-4">
      <div className="max-w-[1536px] mx-auto px-6 lg:px-12 relative flex items-center justify-between">
        
        {/* Left Links - Single Row */}
        <div className="hidden lg:flex items-center space-x-8">
          <Link to="/" className="text-[11px] font-fashion tracking-[0.2em] font-medium text-gray-900 uppercase hover:text-gray-500 transition-colors">Home</Link>
          <Link to="/shop" className="text-[11px] font-fashion tracking-[0.2em] font-medium text-gray-900 uppercase hover:text-gray-500 transition-colors">Shaadi Ready</Link>
          <Link to="/shop" className="text-[11px] font-fashion tracking-[0.2em] font-medium text-gray-900 uppercase hover:text-gray-500 transition-colors">Shop Full Collection</Link>
          <Link to="/shop" className="text-[11px] font-fashion tracking-[0.2em] font-medium text-gray-900 uppercase hover:text-gray-500 transition-colors">Store Credit and Exchange</Link>
        </div>

        {/* Center Logo */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <Link to="/" className="flex items-center">
            <h1 className="text-2xl font-fashion tracking-[0.3em] font-medium text-gray-900 uppercase">
              MayaSindhu
            </h1>
            {/* If user strictly wants the IMAGE logo, we can use it here too: */}
            {/* <img src={logo} alt="MayaSindhu" className="h-10 w-auto object-contain" /> */}
          </Link>
        </div>

        {/* Right Icons */}
        <div className="flex items-center space-x-6 lg:space-x-8">
          <button className="text-gray-900 hover:text-gray-500 transition-colors">
            <User size={18} strokeWidth={1.5} />
          </button>
          <button className="text-gray-900 hover:text-gray-500 transition-colors">
            <Search size={18} strokeWidth={1.5} />
          </button>
          <Link to="/cart" className="text-gray-900 hover:text-gray-500 transition-colors relative">
            <ShoppingBag size={18} strokeWidth={1.5} />
            <span className="absolute -top-1 -right-1 bg-gray-900 text-white text-[8px] w-3.5 h-3.5 flex items-center justify-center rounded-full">
              0
            </span>
          </Link>
          
          {/* Mobile Menu Icon */}
          <button className="lg:hidden text-gray-900">
            <Menu size={22} />
          </button>
        </div>

      </div>
    </header>
  );
}
