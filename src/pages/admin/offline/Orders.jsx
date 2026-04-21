import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  ShoppingBag, 
  Loader2,
  Calendar,
  Filter,
  Download,
  User,
  Clock,
  ArrowUpRight,
  MoreVertical
} from 'lucide-react';
import { db } from '../../../firebase';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy 
} from 'firebase/firestore';

export default function OfflineOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Note: We use 'offline_orders' for the offline store
    const q = query(collection(db, 'offline_orders'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#1BAFAF]" />
        <p className="text-[14px] font-medium text-gray-400">Loading order records...</p>
      </div>
    );
  }

  const filteredOrders = orders.filter(o => 
    (o.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-semibold text-gray-900 tracking-tight">Shop Orders</h1>
          <p className="text-[12px] text-gray-400 font-medium tracking-tight">Manage manual sales and walk-in customer records</p>
        </div>
        <button className="flex items-center gap-2 bg-[#1BAFAF] hover:bg-[#17a0a0] text-white px-5 py-2.5 rounded-xl text-[13px] font-bold transition-all shadow-sm shadow-[#1BAFAF]/10 active:scale-95">
          <Plus size={18} />
          New Shop Order
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
         <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-[#1BAFAF] transition-colors" />
            <input 
               type="text" 
               placeholder="Search by ID or customer..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full bg-gray-50 border-none py-2.5 pl-11 pr-4 text-[13px] rounded-xl outline-none focus:bg-white transition-all font-medium"
            />
         </div>
         <div className="flex items-center gap-2">
            <button className="p-2.5 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all"><Calendar size={18} /></button>
            <button className="p-2.5 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all"><Filter size={18} /></button>
            <div className="h-6 w-[1px] bg-gray-100 mx-1" />
            <button className="flex items-center gap-2 px-4 py-2 text-[12px] font-bold text-gray-500 hover:text-[#1BAFAF] transition-all">
               <Download size={16} />
               Export
            </button>
         </div>
      </div>

      {/* Orders Grid/Table */}
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/30">
                     <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Record ID</th>
                     <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Customer</th>
                     <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Date</th>
                     <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Amount</th>
                     <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Method</th>
                     <th className="px-8 py-5 text-right px-10"></th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-50">
                  {filteredOrders.length > 0 ? filteredOrders.map(order => (
                    <tr key={order.id} className="hover:bg-gray-50/50 transition-all group">
                       <td className="px-8 py-5">
                          <span className="text-[12px] font-black text-gray-300 group-hover:text-gray-500 transition-colors uppercase">#{order.id.slice(-6)}</span>
                       </td>
                       <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                             <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 border border-white scroll-shadow">
                                <User size={16} />
                             </div>
                             <span className="text-[14px] font-bold text-gray-900">{order.customerName || 'Walk-in'}</span>
                          </div>
                       </td>
                       <td className="px-8 py-5">
                          <div className="flex items-center gap-2 text-gray-400">
                             <Clock size={12} />
                             <span className="text-[12px] font-medium">
                                {order.createdAt?.toDate().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                             </span>
                          </div>
                       </td>
                       <td className="px-8 py-5 text-[14px] font-black text-gray-900">{order.total}</td>
                       <td className="px-8 py-5 text-[11px] font-black text-[#1BAFAF] uppercase tracking-widest">{order.paymentMethod || 'Cash'}</td>
                       <td className="px-8 py-5 text-right pr-10">
                          <button className="p-2 text-gray-300 hover:text-gray-900 transition-all active:scale-90">
                             <MoreVertical size={16} />
                          </button>
                       </td>
                    </tr>
                  )) : (
                    <tr>
                       <td colSpan="6" className="py-20 text-center">
                          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-200">
                             <ShoppingBag size={32} />
                          </div>
                          <p className="text-[14px] font-bold text-gray-400 uppercase tracking-widest">No Shop Orders found</p>
                       </td>
                    </tr>
                  )}
               </tbody>
            </table>
         </div>
      </div>
      
      {/* Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
         <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
               <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mb-1">Weekly Store Volume</p>
               <h3 className="text-2xl font-black text-gray-900 tracking-tightest">₹54,200</h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center animate-pulse">
               <ArrowUpRight size={20} />
            </div>
         </div>
         <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
               <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mb-1">New Shop Records</p>
               <h3 className="text-2xl font-black text-gray-900 tracking-tightest">24 Orders</h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#1BAFAF]/10 text-[#1BAFAF] flex items-center justify-center">
               <Plus size={20} />
            </div>
         </div>
      </div>

    </div>
  );
}
