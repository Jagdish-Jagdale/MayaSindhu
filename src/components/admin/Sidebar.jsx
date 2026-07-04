/**
 * File: Sidebar.jsx
 * Description: Navigational menu drawer displayed in the administration panels containing link paths, roles displays, and session terminators.
 * Work Done: Added successful logout toast notification indicators upon signing out of the admin panel.
 */

import {
  LayoutDashboard,
  Users,
  Package,
  Grid2X2,
  ShoppingBag,
  Settings,
  LogOut,
  ChevronDown,
  Image,
  ScrollText,
  Gem,
  Flower2,
  Tv,
  Heart,
  MessageSquareQuote,
  BarChart3,
  FileText,
  RotateCcw,
  CircleDollarSign,
  Users2,
  ShoppingCart,
  Truck,
  MessageSquare
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { PiUserSwitchLight } from 'react-icons/pi';
import { useAuth } from '../../context/AuthContext';
import { auth } from '../../firebase';
import { signOut } from 'firebase/auth';
import { useState, useEffect } from 'react';
import LogoutConfirmationModal from './LogoutConfirmationModal';
import toast from 'react-hot-toast';

function getMenuItems(pathname) {
  const isOffline = pathname.startsWith('/admin-offline');
  const base = isOffline ? '/admin-offline' : '/admin';

  if (isOffline) {
    return [
      { title: 'Dashboard', icon: LayoutDashboard, path: `${base}/dashboard` },
      { title: 'Customers', icon: Users, path: `${base}/customers` },
      { title: 'Products', icon: Package, path: `${base}/products` },
      { title: 'Categories', icon: Grid2X2, path: `${base}/categories` },
      { title: 'Orders', icon: ShoppingBag, path: `${base}/orders` },
      { title: 'Return', icon: RotateCcw, path: `${base}/return` },
    ];
  }

  return [
    { title: 'Dashboard', icon: LayoutDashboard, path: `${base}/dashboard` },
    { title: 'Users', icon: Users, path: `${base}/users` },
    { title: 'Products', icon: Package, path: `${base}/products` },
    { title: 'Categories', icon: Grid2X2, path: `${base}/categories` },
    { title: 'Orders', icon: ShoppingBag, path: `${base}/orders` },
    { title: 'Reviews', icon: MessageSquare, path: `${base}/reviews` },
    { title: 'Return', icon: RotateCcw, path: `${base}/return` },
    { title: 'Reports', icon: BarChart3, path: `${base}/reports` },
    { title: 'Delivery Charges', icon: Truck, path: `${base}/delivery-charges` },
    {
      title: 'Settings',
      icon: Settings,
      path: `${base}/settings`,
      subItems: [
        { title: 'Banner', icon: Image, path: `${base}/settings/banner` },
        { title: 'Explore Category', icon: ScrollText, path: `${base}/settings/curated-realms` },
        { title: 'Customer Favorite', icon: Gem, path: `${base}/settings/featured-treasures` },
        { title: 'Shop by Trend', icon: Flower2, path: `${base}/settings/artisan-blooms` },
        { title: 'Shop the Look', icon: Tv, path: `${base}/settings/stories` },
        { title: 'Our Manifesto', icon: Heart, path: `${base}/settings/purpose` },
        { title: 'Testimonial', icon: MessageSquareQuote, path: `${base}/settings/testimonial` },
        { title: 'About Us', icon: Users, path: `${base}/settings/about-us` },
        { title: 'Artician Workshop', icon: Users2, path: `${base}/settings/workshops` },
        { title: 'Blogs', icon: FileText, path: `${base}/settings/blogs` },
        { title: 'Disclaimer', icon: FileText, path: `${base}/settings/disclaimer` },
      ]
    },
  ];
}

export default function Sidebar({ isCollapsed }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { adminRole } = useAuth();
  const [openMenus, setOpenMenus] = useState([]); // Closed by default
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isSwitchOpen, setIsSwitchOpen] = useState(false);

  const currentPanel = location.pathname.startsWith('/superadmin')
    ? 'Super Admin'
    : location.pathname.startsWith('/admin-offline')
      ? 'Offline Admin'
      : 'Online Admin';

  const panels = [
    { name: 'Super Admin', path: '/superadmin/dashboard', color: 'from-purple-500 to-indigo-600' },
    { name: 'Online Admin', path: '/admin/dashboard', color: 'from-[#1BAFAF] to-[#148F8F]' },
    { name: 'Offline Admin', path: '/admin-offline/dashboard', color: 'from-orange-500 to-red-600' },
  ];

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut(auth);
      toast.success("Logged out successfully.");
      navigate('/admin/login');
    } catch (err) {
      console.error("Logout failed:", err);
      toast.error("Failed to log out. Please try again.");
    } finally {
      setIsLoggingOut(false);
      setIsLogoutModalOpen(false);
    }
  };

  const isActive = (path) => location.pathname === path || (path !== '/admin/dashboard' && location.pathname.startsWith(path));

  const toggleMenu = (title) => {
    setOpenMenus(prev =>
      prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]
    );
  };

  // Auto-open menus that contain active sub-items
  useEffect(() => {
    const items = getMenuItems(location.pathname);
    items.forEach(item => {
      if (item.subItems && item.subItems.some(sub => isActive(sub.path))) {
        setOpenMenus(prev => prev.includes(item.title) ? prev : [...prev, item.title]);
      }
    });
  }, [location.pathname, location.pathname]); // Re-run on path change

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">

      {/* Brand header */}
      <div className={`px-4 py-8 border-b border-gray-100 min-h-[56px] flex flex-col items-center justify-center gap-1 transition-all duration-300 ${isCollapsed ? 'opacity-0 scale-50' : 'opacity-100 scale-100'}`}>
        {!isCollapsed && (
          <>
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400">
              {location.pathname.startsWith('/admin-offline') ? 'Offline Shop' : 'E-Commerce'}
            </span>
            <span className="text-[14px] font-black uppercase tracking-[0.2em] text-center bg-gradient-to-r from-red-500 via-orange-500 via-yellow-500 via-green-500 via-blue-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent animate-gradient-x">
              Admin Panel
            </span>
          </>
        )}
      </div>

      {/* Panel Switcher (Only for Super Admin) */}
      {adminRole === 'Super Admin' && (
        <div className="px-3 py-2 border-b border-gray-100 relative shrink-0">
          <button
            onClick={() => setIsSwitchOpen(!isSwitchOpen)}
            title={isCollapsed ? "Switch Admin Panel" : ""}
            className={`
              w-full flex items-center rounded-xl transition-all duration-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900 border border-gray-100 shadow-sm
              ${isCollapsed ? 'justify-center p-2.5' : 'gap-2.5 px-3 py-2.5 text-[12px] font-semibold'}
            `}
          >
            <PiUserSwitchLight size={isCollapsed ? 20 : 16} className="text-gray-500 shrink-0" />
            {!isCollapsed && (
              <>
                <span className="truncate flex-1 text-left">{currentPanel} Panel</span>
                <ChevronDown
                  size={14}
                  className={`text-gray-400 transition-transform duration-300 ${isSwitchOpen ? 'rotate-180' : ''}`}
                />
              </>
            )}
          </button>

          {isSwitchOpen && (
            <div
              className={`
                absolute z-50 mt-1 bg-white border border-gray-100 rounded-xl shadow-lg py-1.5 animate-in fade-in slide-in-from-top-2 duration-200
                ${isCollapsed ? 'left-full top-0 ml-2 w-48' : 'left-3 right-3'}
              `}
            >
              {panels.map((p) => {
                const active = currentPanel === p.name;
                return (
                  <button
                    key={p.name}
                    onClick={() => {
                      setIsSwitchOpen(false);
                      navigate(p.path);
                    }}
                    className={`
                      w-full text-left px-3 py-2 text-[12px] font-medium transition-colors flex items-center gap-2
                      ${active
                        ? 'bg-gray-50 text-[#1BAFAF] font-semibold'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }
                    `}
                  >
                    <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${p.color}`} />
                    <span>{p.name}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Nav links */}
      <nav className="flex-1 px-2 py-3 space-y-1 overflow-y-auto min-h-0 scrollbar-hide">
        {getMenuItems(location.pathname).map((item) => {
          const hasSubItems = item.subItems && item.subItems.length > 0;
          const isMenuOpen = openMenus.includes(item.title);
          const active = isActive(item.path) || (hasSubItems && item.subItems.some(sub => isActive(sub.path)));

          return (
            <div key={item.title} className="space-y-1">
              {hasSubItems ? (
                <button
                  onClick={() => !isCollapsed && toggleMenu(item.title)}
                  className={`
                    w-full flex items-center rounded-lg transition-all duration-300 group
                    ${isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5 text-[13px]'} 
                    ${active && !isMenuOpen
                      ? 'bg-[#eaf6f6] text-[#1BAFAF] font-semibold'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800 font-medium'
                    }
                  `}
                >
                  <item.icon
                    size={isCollapsed ? 20 : 16}
                    strokeWidth={active ? 2.5 : 1.8}
                    className={`transition-colors ${active ? 'text-[#1BAFAF]' : 'text-gray-400 group-hover:text-gray-600'}`}
                  />
                  {!isCollapsed && (
                    <>
                      <span className="truncate flex-1 text-left">{item.title}</span>
                      <ChevronDown
                        size={14}
                        className={`transition-transform duration-300 ${isMenuOpen ? 'rotate-180' : ''}`}
                      />
                    </>
                  )}
                </button>
              ) : (
                <Link
                  to={item.path}
                  title={isCollapsed ? item.title : ''}
                  className={`
                    flex items-center rounded-lg transition-all duration-300 group
                    ${isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5 text-[13px]'} 
                    ${active
                      ? 'bg-[#eaf6f6] text-[#1BAFAF] font-semibold'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800 font-medium'
                    }
                  `}
                >
                  <item.icon
                    size={isCollapsed ? 20 : 16}
                    strokeWidth={active ? 2.5 : 1.8}
                    className={`transition-colors ${active ? 'text-[#1BAFAF]' : 'text-gray-400 group-hover:text-gray-600'}`}
                  />
                  {!isCollapsed && (
                    <span className="truncate">{item.title}</span>
                  )}
                </Link>
              )}

              {/* Sub-items */}
              {hasSubItems && isMenuOpen && !isCollapsed && (
                <div className="ml-4 pl-4 border-l border-gray-100 space-y-1 animate-in slide-in-from-top-2 duration-300">
                  {item.subItems.map((sub) => {
                    const subActive = isActive(sub.path);
                    return (
                      <Link
                        key={sub.title}
                        to={sub.path}
                        className={`
                          flex items-center gap-3 px-3 py-2 rounded-lg text-[12px] transition-all duration-200
                          ${subActive
                            ? 'text-[#1BAFAF] font-bold bg-[#1BAFAF]/5'
                            : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50'
                          }
                        `}
                      >
                        <sub.icon size={14} strokeWidth={subActive ? 2.5 : 2} />
                        <span className="truncate">{sub.title}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Logout button */}
      <div className={`px-3 py-3 border-t border-gray-100 shrink-0 transition-all duration-300`}>
        <button
          onClick={() => setIsLogoutModalOpen(true)}
          title={isCollapsed ? "Log out" : ""}
          className={`
            flex items-center rounded-xl text-red-500 bg-red-50/60 hover:bg-red-500 hover:text-white transition-all duration-200 shadow-sm shadow-red-500/5 group
            ${isCollapsed ? 'justify-center w-full p-2.5' : 'gap-2.5 px-3 py-3 w-full text-[13px] font-bold'}
          `}
        >
          <LogOut size={isCollapsed ? 20 : 16} className="text-red-500 group-hover:text-white transition-colors shrink-0" />
          {!isCollapsed && (
            <span className="truncate animate-in fade-in slide-in-from-left-2 duration-300">
              Log out
            </span>
          )}
        </button>
      </div>

      <LogoutConfirmationModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
        loading={isLoggingOut}
      />
    </div>
  );
}
