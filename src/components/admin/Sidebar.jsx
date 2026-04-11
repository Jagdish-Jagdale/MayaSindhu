import { LayoutDashboard, Package, ShoppingCart, Users, ArrowLeft } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function Sidebar() {
  const location = useLocation();
  
  const menuItems = [
    { name: 'Overview', icon: LayoutDashboard, path: '/admin' },
    { name: 'Inventory', icon: Package, path: '/admin/products' },
    { name: 'Orders', icon: ShoppingCart, path: '/admin/orders' },
    { name: 'Customers', icon: Users, path: '/admin/customers' },
  ];

  return (
    <aside className="w-64 bg-brand-burgundy-dark text-brand-cream border-r border-brand-cream/10">
      <div className="p-8">
        <h2 className="text-xl font-serif font-bold tracking-widest text-brand-gold">MAYASINDHUU</h2>
        <p className="text-[10px] tracking-widest text-brand-cream/40 uppercase mt-2">Admin Panel</p>
      </div>

      <nav className="mt-10 px-4 space-y-2 text-sm font-sans tracking-wide">
        {menuItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`flex items-center space-x-4 px-4 py-3 rounded-lg transition-colors ${
              location.pathname === item.path ? 'bg-brand-gold text-brand-burgundy-dark font-bold' : 'hover:bg-brand-burgundy'
            }`}
          >
            <item.icon size={20} />
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>

      <div className="absolute bottom-10 px-8">
        <Link to="/" className="flex items-center space-x-2 text-brand-gold hover:text-brand-cream transition-colors text-xs uppercase tracking-widest">
          <ArrowLeft size={16} />
          <span>Back to Store</span>
        </Link>
      </div>
    </aside>
  );
}
