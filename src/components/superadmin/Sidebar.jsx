import {
  LayoutDashboard,
  Users,
  ShieldAlert,
  LogOut,
  ChevronDown,
  BarChart3
} from 'lucide-react';
import { PiUserSwitchLight } from 'react-icons/pi';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { auth } from '../../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useState, useEffect } from 'react';
import LogoutConfirmationModal from '../admin/LogoutConfirmationModal';
import { useAuth } from '../../context/AuthContext';

const menuItems = [
  { title: 'Dashboard', icon: LayoutDashboard, path: '/superadmin/dashboard' },
  { title: 'Super Admin', icon: ShieldAlert, path: '/superadmin/superadmins' },
  { title: 'Admins', icon: ShieldAlert, path: '/superadmin/admins' },
  { title: 'Users', icon: Users, path: '/superadmin/users' },
  { title: 'Reports', icon: BarChart3, path: '/superadmin/reports' },
  { title: 'Active Sessions', icon: ShieldAlert, path: '/superadmin/sessions' },
];

export default function Sidebar({ isCollapsed }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState('');
  const [openMenus, setOpenMenus] = useState([]);
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

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) setUserEmail(u.email || '');
    });
    return () => unsub();
  }, []);

  const { logout } = useAuth();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate('/admin/login'); // Defaulting to admin login for now
    } catch (err) {
    } finally {
      setIsLoggingOut(false);
      setIsLogoutModalOpen(false);
    }
  };

  const isActive = (path) => location.pathname === path || (path !== '/superadmin/dashboard' && location.pathname.startsWith(path));

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

            <span className="text-[14px] font-black uppercase tracking-[0.15em] text-center bg-gradient-to-r from-red-500 via-orange-500 via-yellow-500 via-green-500 via-blue-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent animate-gradient-x">
              Super Admin
            </span>
          </>
        )}
      </div>

      {/* Panel Switcher */}
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

      {/* Nav links */}
      <nav className="flex-1 px-2 py-3 space-y-1 overflow-y-auto min-h-0 scrollbar-hide">
        {menuItems.map((item) => {
          const active = isActive(item.path);

          return (
            <div key={item.title} className="space-y-1">
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
