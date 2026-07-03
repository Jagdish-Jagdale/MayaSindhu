/**
 * File: UserViewModal.jsx
 * Description: Admin portal navigation layouts, forms confirmation dialogs, and product setup overlays.
 * Work Done: Integrated baseline UI layouts, state boundaries, CSS theme styling, and routing pathways.
 */

import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  ShoppingBag, 
  CheckCircle2, 
  XCircle, 
  CreditCard,
  PackageCheck,
  Truck,
  Clock,
  MapPin,
  Key
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../../firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

const STATUS_CONFIG = {
  'Pending': { color: 'text-amber-500 bg-amber-50', icon: Clock },
  'Confirmed': { color: 'text-blue-500 bg-blue-50', icon: PackageCheck },
  'Shipped': { color: 'text-indigo-500 bg-indigo-50', icon: Truck },
  'Delivered': { color: 'text-[#1BAFAF] bg-[#eaf6f6]', icon: CheckCircle2 },
  'Cancelled': { color: 'text-red-500 bg-red-50', icon: XCircle },
};

const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const UserViewModal = ({ isOpen, onClose, user }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserOrders = async () => {
      if (!user?.id && !user?.email) {
        setOrders([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const ordersRef = collection(db, 'orders');
        const promises = [];
        
        if (user.id) {
          promises.push(getDocs(query(ordersRef, where('customerUid', '==', user.id))));
        }
        if (user.email) {
          promises.push(getDocs(query(ordersRef, where('email', '==', user.email))));
        }
        
        const snapshots = await Promise.all(promises);
        const ordersMap = new Map();
        
        snapshots.forEach(snapshot => {
          snapshot.docs.forEach(docSnap => {
            ordersMap.set(docSnap.id, { id: docSnap.id, ...docSnap.data() });
          });
        });
        
        const userOrders = Array.from(ordersMap.values());
        
        // Sort orders by date descending in memory since we can't easily compound query without an index
        userOrders.sort((a, b) => {
          const timeA = a.createdAt?.seconds || 0;
          const timeB = b.createdAt?.seconds || 0;
          return timeB - timeA;
        });

        setOrders(userOrders);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchUserOrders();
    }
  }, [isOpen, user]);

  if (!user) return null;

  const totalOrders = orders.length;
  const deliveredOrders = orders.filter(o => o.status === 'Delivered').length;
  const cancelledOrders = orders.filter(o => ['Cancelled', 'Returned', 'Return Requested'].includes(o.status)).length;
  const totalSpent = orders.filter(o => !['Cancelled', 'Returned'].includes(o.status)).reduce((acc, curr) => {
    const total = typeof curr.total === 'number' ? curr.total : Number((curr.total || '').toString().replace(/[^0-9.-]+/g,""));
    return acc + (isNaN(total) ? 0 : total);
  }, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) { const closeFn = onClose; closeFn(); } }}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-3xl bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            onClick={e => e.stopPropagation()}
            style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}
          >
            {/* Header */}
            <div className="px-8 py-6 flex items-center justify-between bg-white border-b border-gray-50 shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#1BAFAF]/10 text-[#1BAFAF] flex items-center justify-center">
                  <User size={24} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <h2 className="text-xl font-bold text-gray-900 leading-none">Customer Profile</h2>
                  <div className="flex items-center gap-2 text-[12px] font-medium text-gray-400 pl-1">
                    <Calendar size={13} className="text-gray-300" />
                    Registered: {formatDate(user.createdAt)}
                  </div>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 rounded-xl bg-gray-50 text-gray-400 hover:text-gray-900 transition-colors flex items-center justify-center"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
              
              {/* Profile Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-[#1BAFAF] uppercase tracking-widest">Personal Info</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-gray-600">
                      <User size={16} className="text-gray-300" />
                      <span className="text-sm font-semibold text-gray-900">{user.fullName || 'No Name'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600">
                      <Mail size={16} className="text-gray-300" />
                      <span className="text-sm font-medium">{user.email || 'No email provided'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600">
                      <Phone size={16} className="text-gray-300" />
                      <span className="text-sm font-medium">{user.phone || 'No phone provided'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600">
                      <Key size={16} className="text-gray-300" />
                      <span className="text-sm font-medium">{user.password || 'No password found'}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-[#1BAFAF] uppercase tracking-widest">Account Status</h3>
                  <div className="flex items-start gap-3">
                    <span className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg ${
                        (user.status || 'Active') === 'Active' ? 'text-[#1BAFAF] bg-[#eaf6f6]' : 'text-red-500 bg-red-50'
                      }`}>
                        {user.status || 'Active'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-3.5 shadow-sm border border-gray-100 hover:shadow-md transition-all group">
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mb-2 transition-transform group-hover:scale-110">
                    <ShoppingBag size={14} strokeWidth={2.5} />
                  </div>
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Total Orders</p>
                  <p className="text-lg font-black text-gray-900">{loading ? '...' : totalOrders}</p>
                </div>
                <div className="bg-white rounded-xl p-3.5 shadow-sm border border-gray-100 hover:shadow-md transition-all group">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mb-2 transition-transform group-hover:scale-110">
                    <CheckCircle2 size={14} strokeWidth={2.5} />
                  </div>
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Delivered</p>
                  <p className="text-lg font-black text-gray-900">{loading ? '...' : deliveredOrders}</p>
                </div>
                <div className="bg-white rounded-xl p-3.5 shadow-sm border border-gray-100 hover:shadow-md transition-all group">
                  <div className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-2 transition-transform group-hover:scale-110">
                    <XCircle size={14} strokeWidth={2.5} />
                  </div>
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Cancelled/Returned</p>
                  <p className="text-lg font-black text-gray-900">{loading ? '...' : cancelledOrders}</p>
                </div>
                <div className="bg-white rounded-xl p-3.5 shadow-sm border border-gray-100 hover:shadow-md transition-all group">
                  <div className="w-8 h-8 rounded-full bg-[#1BAFAF]/10 text-[#1BAFAF] flex items-center justify-center mb-2 transition-transform group-hover:scale-110">
                    <CreditCard size={14} strokeWidth={2.5} />
                  </div>
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Total Spent</p>
                  <p className="text-lg font-black text-gray-900">{loading ? '...' : `₹${totalSpent}`}</p>
                </div>
              </div>

              {/* Order History */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-[12px] font-black text-gray-400 uppercase tracking-widest">Order History</h3>
                  <div className="h-px flex-1 bg-gray-100 ml-4"></div>
                </div>

                <div className="bg-white rounded-[20px] border border-gray-100 overflow-hidden shadow-sm">
                  {loading ? (
                    <div className="p-8 text-center text-gray-400 text-sm font-medium">Loading orders...</div>
                  ) : orders.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 text-sm font-medium">No orders found for this customer.</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-gray-50/50 border-b border-gray-50">
                            <th className="px-5 py-3 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest w-16">Sr No</th>
                            <th className="px-5 py-3 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">Order ID</th>
                            <th className="px-5 py-3 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">Date</th>
                            <th className="px-5 py-3 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">Items</th>
                            <th className="px-5 py-3 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                            <th className="px-5 py-3 text-right text-[11px] font-bold text-gray-400 uppercase tracking-widest">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {orders.map((order, idx) => {
                            const config = STATUS_CONFIG[order.status] || STATUS_CONFIG['Pending'];
                            const Icon = config.icon;
                            return (
                              <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-5 py-4">
                                  <span className="text-[12px] font-bold text-gray-400">
                                    {(idx + 1).toString().padStart(2, '0')}
                                  </span>
                                </td>
                                <td className="px-5 py-4">
                                  <span className="text-[13px] font-bold text-[#1BAFAF]">
                                    {order.orderId?.replace('#', '') || 'N/A'}
                                  </span>
                                </td>
                                <td className="px-5 py-4">
                                  <span className="text-[13px] font-medium text-gray-500">
                                    {formatDate(order.createdAt)}
                                  </span>
                                </td>
                                <td className="px-5 py-4">
                                  <span className="text-[13px] font-medium text-gray-900">
                                    {order.items ? order.items.reduce((sum, i) => sum + (i.qty || i.quantity || 1), 0) : (order.quantity || 1)} Item(s)
                                  </span>
                                </td>
                                <td className="px-5 py-4">
                                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border ${config.color} border-current/10 font-bold text-[10px] uppercase tracking-wider`}>
                                    <Icon size={12} strokeWidth={2.5} />
                                    {order.status}
                                  </div>
                                </td>
                                <td className="px-5 py-4 text-right">
                                  <span className="text-[13px] font-black text-gray-900">₹{order.total}</span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default UserViewModal;
