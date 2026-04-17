import React from 'react';
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  ArrowUpRight, 
  ChevronDown,
  Calendar,
  Package,
  Clock,
  CheckCircle2,
  Truck
} from 'lucide-react';

const ORDERS = [
  { id: '#ORD-9042', customer: 'Rohini Gupta', date: '16/04/2026', total: '₹1,24,500', status: 'Delivered', items: 3 },
  { id: '#ORD-9041', customer: 'Anjali Sharma', date: '15/04/2026', total: '₹84,200', status: 'Processing', items: 1 },
  { id: '#ORD-9040', customer: 'Priya Verma', date: '14/04/2026', total: '₹42,000', status: 'In Transit', items: 2 },
  { id: '#ORD-9039', customer: 'Sita Ram', date: '12/04/2026', total: '₹1,25,000', status: 'Delivered', items: 5 },
];

const STATUS_CONFIG = {
  'Delivered': { color: 'text-[#1BAFAF] bg-[#eaf6f6]', icon: CheckCircle2 },
  'Processing': { color: 'text-amber-500 bg-amber-50', icon: Clock },
  'In Transit': { color: 'text-blue-500 bg-blue-50', icon: Truck },
};

export default function Orders() {
  return (
    <div className="max-w-[1280px] mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}>
      
      {/* Header */}
      <div className="space-y-2 py-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-semibold text-gray-900 tracking-tight">Orders</h1>
            <p className="text-[12px] text-gray-400 font-medium font-inter">Monitor and manage all customer acquisitions</p>
          </div>
        </div>
        <hr className="border-gray-100" />
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
        <div className="relative group w-full sm:max-w-[480px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-[#1BAFAF] transition-colors" />
          <input
            type="text"
            placeholder="Search by Order ID or Customer..."
            className="w-full bg-gray-50 border-none py-2 pl-10 pr-4 text-[13px] rounded-xl outline-none focus:bg-white transition-all font-medium"
          />
        </div>
        <div className="flex items-center gap-3 pr-2">
           <button className="flex items-center gap-2 px-3 py-1.5 text-[12px] font-semibold text-gray-500 hover:text-gray-900 transition-colors">
              <Filter size={14} strokeWidth={2.5} />
              Filters
           </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-[20px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-50 bg-white">
                <th className="px-6 py-4 text-left text-[14px] font-bold text-[#1BAFAF]">Order ID</th>
                <th className="px-6 py-4 text-left text-[14px] font-bold text-[#1BAFAF]">Customer</th>
                <th className="px-6 py-4 text-left text-[14px] font-bold text-[#1BAFAF]">Date</th>
                <th className="px-6 py-4 text-left text-[14px] font-bold text-[#1BAFAF]">Items</th>
                <th className="px-6 py-4 text-left text-[14px] font-bold text-[#1BAFAF]">Total</th>
                <th className="px-6 py-4 text-left text-[14px] font-bold text-[#1BAFAF]">Status</th>
                <th className="px-6 py-4 text-right text-[14px] font-bold text-[#1BAFAF]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50/50">
              {ORDERS.map((order) => {
                const config = STATUS_CONFIG[order.status] || STATUS_CONFIG['Processing'];
                return (
                  <tr key={order.id} className="hover:bg-gray-50 group transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-[14px] font-bold text-gray-900">{order.id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#1BAFAF]/10 text-[#1BAFAF] flex items-center justify-center text-[10px] font-black shrink-0">
                          {order.customer.split(' ').map(n=>n[0]).join('')}
                        </div>
                        <span className="text-[14px] font-semibold text-gray-800">{order.customer}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                       <span className="text-[14px] text-gray-500 font-medium">{order.date}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[14px] text-gray-800 font-medium">{order.items} Pieces</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[14px] font-bold text-gray-900">{order.total}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg flex items-center gap-1.5 w-fit ${config.color}`}>
                        <config.icon size={12} />
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-[#1BAFAF] hover:bg-[#eaf6f6] rounded-lg transition-all active:scale-95">
                          <ArrowUpRight size={16} />
                       </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
