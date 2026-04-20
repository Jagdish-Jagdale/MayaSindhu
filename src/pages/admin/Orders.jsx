import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  ArrowUpRight, 
  Clock,
  CheckCircle2,
  Truck,
  PackageCheck,
  Calendar,
  Layers,
  SearchX
} from 'lucide-react';
import { db } from '../../firebase';
import { collection, onSnapshot, query, orderBy, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';

const STATUS_CONFIG = {
  'Pending': { color: 'text-amber-500 bg-amber-50', icon: Clock },
  'Confirmed': { color: 'text-blue-500 bg-blue-50', icon: PackageCheck },
  'Shipped': { color: 'text-indigo-500 bg-indigo-50', icon: Truck },
  'Delivered': { color: 'text-[#1BAFAF] bg-[#eaf6f6]', icon: CheckCircle2 },
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setOrders(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredOrders = orders.filter(order => 
    order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate();
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}>
      
      {/* Header */}
      <div className="space-y-2 py-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-bold text-gray-900 tracking-tight">Orders</h1>
            <p className="text-[12px] text-gray-400 font-medium">Manage and monitor all customer orders in real-time</p>
          </div>
        </div>
        <hr className="border-gray-100" />
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
        <div className="relative group w-full sm:max-w-[480px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-[#1BAFAF] transition-colors" />
          <input
            type="text"
            placeholder="Search by Order ID or Customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50 border-none py-2.5 pl-10 pr-4 text-[13px] rounded-xl outline-none focus:bg-white transition-all font-medium"
          />
        </div>
        <div className="flex items-center gap-3 pr-2">
           <button className="flex items-center gap-2 px-3 py-1.5 text-[12px] font-bold text-gray-400 hover:text-gray-900 transition-colors">
              <Filter size={14} strokeWidth={2.5} />
              Filters
           </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-50 bg-white">
                <th className="px-6 py-5 text-left text-[14px] font-bold text-[#1BAFAF]">Sr No</th>
                <th className="px-6 py-5 text-left text-[14px] font-bold text-[#1BAFAF]">Order ID</th>
                <th className="px-6 py-5 text-left text-[14px] font-bold text-[#1BAFAF]">Customer Name</th>
                <th className="px-6 py-5 text-left text-[14px] font-bold text-[#1BAFAF]">Product Name</th>
                <th className="px-6 py-5 text-left text-[14px] font-bold text-[#1BAFAF]">Quantity</th>
                <th className="px-6 py-5 text-left text-[14px] font-bold text-[#1BAFAF]">Total</th>
                <th className="px-6 py-5 text-left text-[14px] font-bold text-[#1BAFAF]">Date</th>
                <th className="px-6 py-5 text-left text-[14px] font-bold text-[#1BAFAF]">Status</th>
                <th className="px-6 py-5 text-right text-[14px] font-bold text-[#1BAFAF]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50/50">
              <AnimatePresence mode="popLayout">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order, index) => {
                    const config = STATUS_CONFIG[order.status] || STATUS_CONFIG['Pending'];
                    return (
                      <motion.tr 
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        key={order.id} 
                        className="hover:bg-gray-50/80 group transition-colors"
                      >
                        <td className="px-6 py-5">
                          <span className="text-[13px] font-bold text-gray-300">{(index + 1).toString().padStart(2, '0')}</span>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <span className="text-[13px] font-bold text-gray-900 group-hover:text-[#1BAFAF] transition-colors">{order.orderId}</span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#1BAFAF]/10 text-[#1BAFAF] flex items-center justify-center text-[10px] font-black shrink-0">
                              {order.customerName?.split(' ').map(n=>n[0]).join('')}
                            </div>
                            <span className="text-[13px] font-semibold text-gray-800">{order.customerName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className="text-[13px] text-gray-600 font-medium line-clamp-1">{order.productName || 'Multiple Items'}</span>
                        </td>
                        <td className="px-6 py-5">
                          <span className="text-[13px] text-gray-800 font-bold">{order.quantity || 1}</span>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <span className="text-[13px] font-bold text-gray-900">{order.total}</span>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                           <span className="text-[13px] text-gray-500 font-medium">{formatDate(order.createdAt)}</span>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl flex items-center justify-center gap-1.5 w-fit shadow-sm border ${config.color} border-current/10`}>
                            <config.icon size={12} strokeWidth={2.5} />
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right">
                           <button className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-[#1BAFAF] hover:bg-[#1BAFAF]/10 rounded-xl transition-all active:scale-95">
                              <ArrowUpRight size={18} />
                           </button>
                        </td>
                      </motion.tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="9" className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <SearchX size={40} className="text-gray-200" />
                        <p className="text-[14px] font-semibold text-gray-400">No orders found matching your search</p>
                      </div>
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
      
      {loading && (
        <div className="flex items-center justify-center py-10">
          <div className="w-8 h-8 border-4 border-[#1BAFAF]/20 border-t-[#1BAFAF] rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
