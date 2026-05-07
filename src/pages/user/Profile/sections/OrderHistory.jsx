import React, { useState, useEffect } from 'react';
import { db } from '../../../../firebase';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Package, Clock, Truck, CheckCircle2, ChevronRight, XCircle, RotateCcw, Loader2, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_STEPS = ['Pending', 'Confirmed', 'Shipped', 'Delivered'];

const STATUS_ICONS = {
  'Pending': <Clock size={16} />,
  'Confirmed': <Package size={16} />,
  'Shipped': <Truck size={16} />,
  'Delivered': <CheckCircle2 size={16} />,
  'Cancelled': <XCircle size={16} />,
  'Returned': <RotateCcw size={16} />,
};

export default function OrderHistory({ user }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'orders'),
      where('customerUid', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const orderData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
        return dateB - dateA;
      });
      setOrders(orderData);
      setLoading(false);
    }, (error) => {
      console.error("Orders listener error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: 'Cancelled',
        updatedAt: serverTimestamp()
      });
      toast.success('Order cancelled successfully');
    } catch (error) {
      toast.error('Failed to cancel order');
    }
  };

  const handleRequestReturn = async (orderId) => {
    if (!window.confirm('Request a return for this order?')) return;
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: 'Return Requested',
        updatedAt: serverTimestamp()
      });
      toast.success('Return request submitted');
    } catch (error) {
      toast.error('Failed to submit return request');
    }
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-[#f5aa00]" size={40} /></div>;

  return (
    <div className="space-y-8">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h2 className="text-xl font-bold text-[#1A1A1A]">My Orders</h2>
            <p className="text-xs text-gray-400 font-medium mt-1">Review and track your recent purchases.</p>
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
            <input 
              type="text" 
              placeholder="Search Orders..." 
              className="pl-11 pr-6 py-2.5 bg-gray-50/50 rounded-xl border border-gray-100 focus:border-brand-orange outline-none text-[13px] font-bold w-full md:w-60 transition-all placeholder:text-gray-300"
            />
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-20 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <Package className="text-gray-200" size={28} />
            </div>
            <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">No orders found</p>
          </div>
        ) : (
          <div className="space-y-8">
            {orders.map((order) => (
              <div key={order.id} className="border border-gray-100 rounded-xl overflow-hidden hover:border-brand-orange/20 transition-all bg-white shadow-sm">
                <div className="p-6 md:p-8">
                  <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
                    <div className="space-y-0.5">
                      <p className="text-[10px] uppercase font-bold tracking-widest text-[#f5aa00]">Order ID</p>
                      <h4 className="text-lg font-fashion font-bold text-[#1A1A1A]">{order.orderId}</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {order.status === 'Pending' && (
                        <button 
                          onClick={() => handleCancelOrder(order.id)}
                          className="px-5 py-2 rounded-xl border border-red-100 text-red-500 text-[10px] font-bold uppercase tracking-widest hover:bg-red-50 transition-all"
                        >
                          Cancel
                        </button>
                      )}
                      {order.status === 'Delivered' && (
                        <button 
                          onClick={() => handleRequestReturn(order.id)}
                          className="px-5 py-2 rounded-xl border border-[#f5aa00]/20 text-[#f5aa00] text-[10px] font-bold uppercase tracking-widest hover:bg-[#fffbf2] transition-all"
                        >
                          Return
                        </button>
                      )}
                      <div className={`px-5 py-2 rounded-xl flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.1em] border shadow-sm ${
                        order.status === 'Delivered' ? 'bg-green-50 text-green-600 border-green-100' : 
                        order.status === 'Cancelled' ? 'bg-red-50 text-red-400 border-red-100' :
                        'bg-white text-[#f5aa00] border-[#f5aa00]/20'
                      }`}>
                        {STATUS_ICONS[order.status] || <Package size={14} />}
                        {order.status}
                      </div>
                    </div>
                  </div>

                  {/* Order Progress */}
                  {!['Cancelled', 'Returned'].includes(order.status) && (
                    <div className="relative mb-8 px-2">
                      <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -translate-y-1/2 -z-10 rounded-full" />
                      <div 
                        className="absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-[#f5aa00] to-[#e07a00] -translate-y-1/2 -z-10 rounded-full transition-all duration-1000" 
                        style={{ width: `${(STATUS_STEPS.indexOf(order.status) / (STATUS_STEPS.length - 1)) * 100}%` }}
                      />
                      <div className="flex justify-between">
                        {STATUS_STEPS.map((step, idx) => {
                          const isActive = STATUS_STEPS.indexOf(order.status) >= idx;
                          return (
                            <div key={step} className="flex flex-col items-center gap-2">
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                                isActive ? 'bg-[#f5aa00] text-white shadow-lg shadow-[#f5aa00]/20' : 'bg-white border border-gray-100 text-gray-300'
                              }`}>
                                {React.cloneElement(STATUS_ICONS[step], { size: 14 })}
                              </div>
                              <span className={`text-[8px] uppercase font-bold tracking-widest ${isActive ? 'text-[#f5aa00]' : 'text-gray-300'}`}>
                                {step}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-[1fr_240px] gap-6">
                    <div className="space-y-3">
                      <p className="text-[10px] uppercase font-bold tracking-widest text-[#f5aa00] px-1">Items Ordered</p>
                      <div className="grid grid-cols-1 gap-2">
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-gray-50 shadow-sm">
                            <div className="w-10 h-10 bg-[#fffbf2] rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center">
                               <Package className="text-[#f5aa00]/30" size={20} />
                            </div>
                            <div className="flex-grow">
                              <h5 className="text-[13px] font-bold text-[#1A1A1A] line-clamp-1 leading-tight">{item.name}</h5>
                              <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wide">Qty: {item.qty} × ₹{item.price.toLocaleString()}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-gray-50/50 p-6 rounded-xl border border-gray-100 flex flex-col justify-between shadow-sm">
                      <div className="space-y-2">
                         <div className="flex justify-between text-[11px] font-bold uppercase tracking-wide">
                           <span className="text-gray-400">Subtotal</span>
                           <span className="text-[#1A1A1A]">₹{order.subtotal?.toLocaleString()}</span>
                         </div>
                         <div className="flex justify-between text-[11px] font-bold uppercase tracking-wide">
                           <span className="text-gray-400">Shipping</span>
                           <span className="text-green-600 font-black">{order.shipping === 0 ? 'FREE' : `₹${order.shipping}`}</span>
                         </div>
                      </div>
                      <div className="pt-4 border-t border-gray-100 mt-4 flex justify-between items-end">
                        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest leading-none">Total Paid</span>
                        <span className="text-xl font-bold text-[#1A1A1A] leading-none">₹{order.total?.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
