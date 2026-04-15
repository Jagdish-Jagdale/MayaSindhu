import { 
  LayoutDashboard, 
  Users, 
  Package, 
  Grid2X2, 
  ShoppingBag, 
  ShoppingCart, 
  History, 
  Settings,
  LogOut,
  ChevronRight,
  User
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { auth } from '../../firebase';
import { signOut } from 'firebase/auth';

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const menuItems = [
    { title: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
    { title: 'Users', icon: Users, path: '/admin/users' },
    { title: 'Products', icon: Package, path: '/admin/products' },
    { title: 'Categories', icon: Grid2X2, path: '/admin/categories' },
    { title: 'Orders', icon: ShoppingBag, path: '/admin/orders' },
    { title: 'Cart', icon: ShoppingCart, path: '/admin/cart', optional: true },
    { title: 'Inventory Logs', icon: History, path: '/admin/inventory-logs' },
    { title: 'Settings', icon: Settings, path: '/admin/settings' },
  ];

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <aside className="w-72 flex flex-col h-full bg-white shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-black/5 overflow-hidden transition-all duration-500">
      <div className="p-8 border-b border-black/[0.03]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#600000] flex items-center justify-center text-white font-serif text-xl font-bold">
            M
          </div>
          <div>
            <h2 className="text-[12px] font-bold tracking-[0.2em] text-[#600000] uppercase">Atelier Admin</h2>
            <p className="text-[9px] text-black/40 font-bold uppercase tracking-widest mt-0.5 whitespace-nowrap">MayaSindhu Boutique</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-8 space-y-1 overflow-y-auto no-scrollbar">
        {menuItems.map((item) => (
          <Link
            key={item.title}
            to={item.path}
            className={`flex items-center justify-between group px-4 py-3.5 transition-all duration-500 ${
              location.pathname === item.path 
                ? 'bg-[#fefccf] text-[#600000]' 
                : 'text-black/50 hover:text-[#600000] hover:bg-black/[0.02]'
            }`}
          >
            <div className="flex items-center gap-4">
              <item.icon size={18} strokeWidth={location.pathname === item.path ? 2.5 : 2} />
              <span className={`text-[13px] font-bold tracking-wide ${location.pathname === item.path ? 'opacity-100' : 'opacity-80'}`}>
                {item.title}
              </span>
            </div>
            {location.pathname === item.path && (
              <ChevronRight size={14} className="text-[#D4AF37]" />
            )}
          </Link>
        ))}
      </nav>

      <div className="p-6 border-t border-black/[0.03]">
        <div className="bg-[#f5f5f7] p-4 flex items-center justify-between group mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#600000]/10 flex items-center justify-center text-[#600000]">
              <User size={16} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-[#390000] tracking-wide">Administrator</p>
              <p className="text-[9px] text-black/40 font-bold uppercase tracking-tighter">Master Curator</p>
            </div>
          </div>
        </div>

        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-black/40 hover:text-[#600000] transition-colors text-[11px] font-bold uppercase tracking-[0.2em]"
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </aside>
  );
}

