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
  Heart
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { auth } from '../../firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { useState, useEffect } from 'react';

const menuItems = [
  { title: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
  { title: 'Users', icon: Users, path: '/admin/users' },
  { title: 'Products', icon: Package, path: '/admin/products' },
  { title: 'Categories', icon: Grid2X2, path: '/admin/categories' },
  { title: 'Orders', icon: ShoppingBag, path: '/admin/orders' },
  {
    title: 'Settings',
    icon: Settings,
    path: '/admin/settings',
    subItems: [
      { title: 'Banner', icon: Image, path: '/admin/settings/banner' },
      { title: 'Curated Realms', icon: ScrollText, path: '/admin/settings/curated-realms' },
      { title: 'Featured Treasures', icon: Gem, path: '/admin/settings/featured-treasures' },
      { title: 'Artisan Blooms', icon: Flower2, path: '/admin/settings/artisan-blooms' },
      { title: 'Stories', icon: Tv, path: '/admin/settings/stories' },
      { title: 'Purpose', icon: Heart, path: '/admin/settings/purpose' },
    ]
  },
];

export default function Sidebar({ isCollapsed }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState('');
  const [openMenus, setOpenMenus] = useState([]); // Closed by default

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) setUserEmail(u.email || '');
    });
    return () => unsub();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/admin/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const isActive = (path) => location.pathname === path || (path !== '/admin/dashboard' && location.pathname.startsWith(path));

  const toggleMenu = (title) => {
    setOpenMenus(prev =>
      prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]
    );
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">

      {/* Brand header */}
      <div className={`px-4 py-8 border-b border-gray-100 min-h-[56px] flex flex-col items-center justify-center gap-1 transition-all duration-300 ${isCollapsed ? 'opacity-0 scale-50' : 'opacity-100 scale-100'}`}>
        {!isCollapsed && (
          <>
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400">
              E-Commerce
            </span>
            <span className="text-[14px] font-black uppercase tracking-[0.2em] text-center bg-gradient-to-r from-red-500 via-orange-500 via-yellow-500 via-green-500 via-blue-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent animate-gradient-x">
              Admin Panel
            </span>
          </>
        )}
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-2 py-3 space-y-1 overflow-y-auto min-h-0 scrollbar-hide">
        {menuItems.map((item) => {
          const hasSubItems = item.subItems && item.subItems.length > 0;
          const isMenuOpen = openMenus.includes(item.title);
          const active = isActive(item.path);

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
          onClick={handleLogout}
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
    </div>
  );
}
