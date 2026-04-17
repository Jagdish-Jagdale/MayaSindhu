import {
  LayoutDashboard,
  Users,
  Package,
  Grid2X2,
  ShoppingBag,
  History,
  Settings,
  LogOut,
  User,
  ChevronDown
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
  { title: 'Inventory Logs', icon: History, path: '/admin/inventory-logs' },
  { title: 'Settings', icon: Settings, path: '/admin/settings' },
];

export default function Sidebar({ isCollapsed }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState('');

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

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">

      {/* Brand header */}
      <div className={`px-4 py-6 border-b border-gray-100 min-h-[56px] flex items-center justify-center transition-all duration-300 ${isCollapsed ? 'opacity-0 scale-50' : 'opacity-100 scale-100'}`}>
        {!isCollapsed && (
          <span className="text-[13px] font-black uppercase tracking-[0.2em] text-center bg-gradient-to-r from-red-500 via-orange-500 via-yellow-500 via-green-500 via-blue-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent animate-gradient-x">
            Admin Panel
          </span>
        )}
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-2 py-3 space-y-2 overflow-y-auto min-h-0 scrollbar-hide">
        {menuItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.title}
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
                <span className="truncate animate-in fade-in slide-in-from-left-2 duration-300">
                  {item.title}
                </span>
              )}
            </Link>
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
