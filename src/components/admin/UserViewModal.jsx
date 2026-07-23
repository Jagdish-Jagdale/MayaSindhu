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
  'Processing': { color: 'text-amber-500 bg-amber-50', icon: Clock },
  'Shipped': { color: 'text-indigo-500 bg-indigo-50', icon: Truck },
  'Out of Delivery': { color: 'text-purple-500 bg-purple-50', icon: Truck },
  'Delivered': { color: 'text-[#1BAFAF] bg-[#eaf6f6]', icon: CheckCircle2 },
  'Completed': { color: 'text-[#1BAFAF] bg-[#eaf6f6]', icon: CheckCircle2 },
  'Placed': { color: 'text-[#1BAFAF] bg-[#eaf6f6]', icon: CheckCircle2 },
  'Cancelled': { color: 'text-red-500 bg-red-50', icon: XCircle },
};

const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A';
  let date;
  if (timestamp.toDate) {
    date = timestamp.toDate();
  } else if (typeof timestamp === 'string' || typeof timestamp === 'number') {
    date = new Date(timestamp);
  } else {
    date = new Date(timestamp);
  }
  if (isNaN(date.getTime())) return 'N/A';
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const UserViewModal = ({ isOpen, onClose, user }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSalesOrder, setSelectedSalesOrder] = useState(null);
  const [isSalesOrderModalOpen, setIsSalesOrderModalOpen] = useState(false);

  useEffect(() => {
    const fetchUserOrders = async () => {
      if (!user?.id && !user?.email && !user?.phone) {
        setOrders([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const ordersRef = collection(db, 'orders');
        const storeOrdersRef = collection(db, 'storeOrders');
        const promises = [];
        
        if (user.id) {
          promises.push(getDocs(query(ordersRef, where('customerUid', '==', user.id))));
          promises.push(getDocs(query(storeOrdersRef, where('customerId', '==', user.id))));
        }
        if (user.email) {
          promises.push(getDocs(query(ordersRef, where('email', '==', user.email))));
          promises.push(getDocs(query(storeOrdersRef, where('customerEmail', '==', user.email))));
          promises.push(getDocs(query(storeOrdersRef, where('email', '==', user.email))));
        }
        if (user.phone) {
          promises.push(getDocs(query(ordersRef, where('phone', '==', user.phone))));
          promises.push(getDocs(query(storeOrdersRef, where('customerPhone', '==', user.phone))));
          promises.push(getDocs(query(storeOrdersRef, where('phone', '==', user.phone))));
        }
        
        const snapshots = await Promise.all(promises);
        const ordersMap = new Map();
        
        snapshots.forEach(snapshot => {
          snapshot.docs.forEach(docSnap => {
            const data = docSnap.data();
            
            let totalVal = data.total ?? data.pricing?.grandTotal ?? data.grandTotal ?? data.subtotal ?? 0;
            if (typeof totalVal !== 'number') {
              totalVal = Number((totalVal || '').toString().replace(/[^0-9.-]+/g, "")) || 0;
            }

            const rawStatus = data.status || data.orderStatus || 'Delivered';
            let status = rawStatus;
            if (rawStatus === 'Placed' || rawStatus === 'Completed') {
              status = 'Delivered';
            }

            const orderIdDisplay = data.orderId || data.orderNumber || data.invoiceNo || docSnap.id;
            const createdDate = data.createdAt || data.date;

            ordersMap.set(docSnap.id, { 
              id: docSnap.id, 
              ...data,
              orderId: orderIdDisplay,
              total: totalVal,
              status: status,
              createdAt: createdDate
            });
          });
        });
        
        const userOrders = Array.from(ordersMap.values());
        
        userOrders.sort((a, b) => {
          const getTime = (val) => {
            if (!val) return 0;
            if (val.seconds) return val.seconds;
            if (val.toDate) return val.toDate().getTime() / 1000;
            const d = new Date(val);
            return isNaN(d.getTime()) ? 0 : d.getTime() / 1000;
          };
          return getTime(b.createdAt) - getTime(a.createdAt);
        });

        setOrders(userOrders);
      } catch (error) {
        console.error("Error fetching user orders:", error);
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
                    {user.password && (
                      <div className="flex items-center gap-3 text-gray-600">
                        <Key size={16} className="text-gray-300" />
                        <span className="text-sm font-medium">{user.password}</span>
                      </div>
                    )}
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
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedSalesOrder(order);
                                      setIsSalesOrderModalOpen(true);
                                    }}
                                    className="text-[13px] font-bold text-[#1BAFAF] hover:underline transition-all cursor-pointer text-left"
                                  >
                                    {order.orderId?.replace('#', '') || 'N/A'}
                                  </button>
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

      {/* Sales Order Details Modal */}
      {isSalesOrderModalOpen && selectedSalesOrder && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={(e) => { if (e.target === e.currentTarget) setIsSalesOrderModalOpen(false); }}>
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsSalesOrderModalOpen(false)}
          />
          <div className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl overflow-hidden max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white flex-shrink-0">
              <div>
                <h2 className="text-[20px] font-bold text-gray-900 tracking-tight">Sales Order Details</h2>
                <p className="text-[12px] text-gray-400 font-medium">Record Information</p>
              </div>
              <button 
                onClick={() => setIsSalesOrderModalOpen(false)}
                className="w-10 h-10 flex items-center justify-center rounded-2xl text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar text-[14px]">
              {/* Summary Info */}
              <div className="grid grid-cols-2 gap-6 bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                <div className="space-y-1">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">ORDER ID</p>
                  <p className="font-bold text-gray-900 uppercase">{selectedSalesOrder.orderId?.replace('#', '') || '---'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">DATE</p>
                  <p className="font-bold text-gray-700">{formatDate(selectedSalesOrder.createdAt)}</p>
                </div>
                <div className="space-y-1 col-span-2">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">CUSTOMER NAME</p>
                  <p className="font-bold text-gray-700">{selectedSalesOrder.customerName || user?.fullName || '---'}</p>
                </div>
              </div>

              {/* Items Table */}
              <div className="space-y-3">
                <h3 className="text-[12px] font-bold text-gray-400 uppercase tracking-wider">ITEMS BREAKDOWN</h3>
                <div className="border border-gray-100 rounded-2xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-50 text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                        <th className="px-4 py-3">ITEM DETAILS</th>
                        <th className="px-4 py-3 text-center w-20">QTY</th>
                        <th className="px-4 py-3 text-right w-24">RATE</th>
                        <th className="px-4 py-3 text-right w-24">AMOUNT</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {selectedSalesOrder.items && selectedSalesOrder.items.length > 0 ? (
                        selectedSalesOrder.items.map((item, index) => {
                          const qty = item.quantity || item.qty || 1;
                          const rate = Number(item.price || item.rate || 0);
                          const amount = Number(item.subtotal || item.amount || (rate * qty));
                          return (
                            <tr key={index} className="text-gray-700 font-medium">
                              <td className="px-4 py-3">{item.productName || item.name || '---'}</td>
                              <td className="px-4 py-3 text-center font-bold text-gray-900">{qty}</td>
                              <td className="px-4 py-3 text-right">₹{rate.toFixed(2)}</td>
                              <td className="px-4 py-3 text-right font-bold text-gray-900">₹{amount.toFixed(2)}</td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan="4" className="px-4 py-8 text-center text-gray-400">No items found</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals Section */}
              <div className="border-t border-gray-100 pt-6 space-y-3 max-w-sm ml-auto">
                <div className="flex justify-between text-gray-500 font-medium">
                  <span>Sub Total</span>
                  <span className="text-gray-900">
                    ₹{Number(selectedSalesOrder.pricing?.subtotal || selectedSalesOrder.subTotal || selectedSalesOrder.total || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-500 font-medium">
                  <span>Tax (GST)</span>
                  <span className="text-gray-900">
                    {selectedSalesOrder.pricing?.tax ?? selectedSalesOrder.tax ?? 0}%
                  </span>
                </div>
                <div className="flex justify-between items-center text-base font-black border-t border-dashed border-gray-200 pt-3">
                  <span className="text-gray-900">Total ( ₹ )</span>
                  <span className="text-[#1BAFAF]">
                    ₹{Number(selectedSalesOrder.pricing?.grandTotal || selectedSalesOrder.total || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-5 border-t border-gray-100 flex justify-end bg-gray-50 flex-shrink-0">
              <button 
                onClick={() => setIsSalesOrderModalOpen(false)}
                className="px-8 py-2.5 bg-[#1BAFAF] text-white rounded-xl text-[13px] font-bold hover:bg-[#158e8e] transition-all"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default UserViewModal;
