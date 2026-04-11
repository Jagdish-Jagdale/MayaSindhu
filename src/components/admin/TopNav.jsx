import { Search, Bell, Settings } from 'lucide-react';

export default function TopNav() {
  return (
    <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8">
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search orders, inventory..." 
            className="w-full bg-gray-100 border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-brand-gold outline-none"
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-6">
        <button className="relative p-2 text-gray-500 hover:text-brand-burgundy transition-colors">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
        </button>
        <button className="p-2 text-gray-500 hover:text-brand-burgundy transition-colors">
          <Settings size={20} />
        </button>
        <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-gray-200">
          <div className="text-right">
            <p className="text-sm font-bold text-brand-burgundy font-serif">Admin</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-sans">Store Manager</p>
          </div>
          <div className="w-10 h-10 bg-brand-gold/10 rounded-full flex items-center justify-center text-brand-gold font-bold">
            A
          </div>
        </div>
      </div>
    </header>
  );
}
