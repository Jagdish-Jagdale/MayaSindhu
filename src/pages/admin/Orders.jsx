import React, { useEffect } from 'react';
import { ShoppingBag, Search, Filter, Download } from 'lucide-react';

const Orders = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-[#390000] mb-2 tracking-tight">Acquisition Registry</h1>
          <p className="text-[11px] font-bold text-black/40 uppercase tracking-[0.2em]">Track and fulfill boutique orders worldwide</p>
        </div>
        <button className="bg-[#600000] text-[#fefccf] px-6 py-4 flex items-center gap-3 transition-all duration-500 hover:bg-[#390000] group">
          <Download size={18} />
          <span className="text-[11px] font-bold uppercase tracking-[0.2em]">Export Monthly Journal</span>
        </button>
      </div>

      <div className="bg-white border border-black/[0.03] shadow-[0_10px_40px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="p-6 border-b border-black/[0.03] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative group max-w-sm w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black/20 group-focus-within:text-[#600000] transition-colors" />
            <input 
              type="text" 
              placeholder="Search order ID, client name..."
              className="w-full bg-[#f5f5f7] border-none py-3 pl-12 pr-4 text-sm outline-none placeholder:text-black/20 focus:bg-white focus:ring-1 focus:ring-[#600000]/10 transition-all duration-300"
            />
          </div>
          <div className="flex gap-4">
            <button className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#600000]/60 hover:text-[#600000] transition-colors">
              <Filter size={16} />
              <span>Status Filter</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#fefccf]/20 border-b border-black/[0.03]">
                <th className="px-8 py-4 text-[10px] font-bold text-[#600000]/60 uppercase tracking-widest">Order ID</th>
                <th className="px-8 py-4 text-[10px] font-bold text-[#600000]/60 uppercase tracking-widest">Client</th>
                <th className="px-8 py-4 text-[10px] font-bold text-[#600000]/60 uppercase tracking-widest">Masterpieces</th>
                <th className="px-8 py-4 text-[10px] font-bold text-[#600000]/60 uppercase tracking-widest text-center">Value</th>
                <th className="px-8 py-4 text-[10px] font-bold text-[#600000]/60 uppercase tracking-widest text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.03]">
              {[
                { id: '#MS-9042', client: 'Rohini Gupta', items: 1, val: '\u20B91,24,500', status: 'In Transit' },
                { id: '#MS-9041', client: 'Anjali Sharma', items: 2, val: '\u20B984,200', status: 'Preparing' },
                { id: '#MS-9040', client: 'Priya Verma', items: 1, val: '\u20B92,10,000', status: 'Delivered' },
                { id: '#MS-9039', client: 'Meera Kapur', items: 3, val: '\u20B94,15,400', status: 'Awaiting' },
              ].map((order) => (
                <tr key={order.id} className="hover:bg-black/[0.01] transition-colors">
                  <td className="px-8 py-6">
                    <span className="text-[11px] font-bold text-[#600000] tracking-widest uppercase">{order.id}</span>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-[13px] font-bold text-[#390000]">{order.client}</p>
                    <p className="text-[11px] text-black/30 font-medium">Verified Boutique Client</p>
                  </td>
                  <td className="px-8 py-6 text-[11px] text-black/40 font-bold uppercase tracking-wider">{order.items} {order.items > 1 ? 'Units' : 'Unit'}</td>
                  <td className="px-8 py-6 text-center text-[12px] font-serif font-bold text-[#390000]">{order.val}</td>
                  <td className="px-8 py-6 text-right">
                    <span className={`text-[9px] font-bold uppercase tracking-widest px-3 py-1 ${
                      order.status === 'Delivered' ? 'bg-green-50 text-green-700' : 'bg-[#fefccf] text-[#600000]'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Orders;
