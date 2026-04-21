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
      where('customerUid', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const orderData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
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

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-brand-orange" size={40} /></div>;

  return (
    <div className="space-y-8">
      <div className="bg-white p-10 md:p-14 rounded-[4rem] shadow-sm border border-gray-50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-4">
            <Package className="text-brand-orange" size={28} />
            <h2 className="text-3xl font-fashion font-bold text-[#1A1A1A]">My Orders</h2>
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
            <input 
              type="text" 
              placeholder="Search Orders..." 
              className="pl-12 pr-6 py-3 bg-[#FAF9F6] rounded-2xl border border-transparent focus:border-brand-orange/20 outline-none text-sm font-medium w-full md:w-64 transition-all"
            />
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="text-gray-200" size={32} />
            </div>
            <p className="text-gray-500 font-medium">You haven't placed any orders yet.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {orders.map((order) => (
              <div key={order.id} className="border border-gray-50 rounded-[3rem] overflow-hidden group hover:border-brand-orange/10 transition-colors bg-[#FAF9F6]/30">
                <div className="p-8 md:p-10">
                  <div className="flex flex-col md:flex-row justify-between gap-6 mb-10">
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Order ID</p>
                      <h4 className="text-xl font-fashion font-bold text-[#1A1A1A]">{order.orderId}</h4>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {order.status === 'Pending' && (
                        <button 
                          onClick={() => handleCancelOrder(order.id)}
                          className="px-6 py-2.5 rounded-xl border border-red-100 text-red-500 text-xs font-bold uppercase tracking-wider hover:bg-red-50 transition-colors"
                        >
                          Cancel Order
                        </button>
                      )}
                      {order.status === 'Delivered' && (
                        <button 
                          onClick={() => handleRequestReturn(order.id)}
                          className="px-6 py-2.5 rounded-xl border border-brand-orange/20 text-brand-orange text-xs font-bold uppercase tracking-wider hover:bg-brand-orange/5 transition-colors"
                        >
                          Return Items
                        </button>
                      )}
                      <div className={`px-6 py-2.5 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.1em] border ${
                        order.status === 'Delivered' ? 'bg-green-50 text-green-600 border-green-100' : 
                        order.status === 'Cancelled' ? 'bg-red-50 text-red-400 border-red-100' :
                        'bg-brand-orange/5 text-brand-orange border-brand-orange/10'
                      }`}>
                        {STATUS_ICONS[order.status] || <Package size={16} />}
                        {order.status}
                      </div>
                    </div>
                  </div>

                  {/* Order Progress (if not cancelled/returned) */}
                  {!['Cancelled', 'Returned'].includes(order.status) && (
                    <div className="relative mb-12 px-4">
                      <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2 -z-10 rounded-full" />
                      <div 
                        className="absolute top-1/2 left-0 h-1 bg-brand-orange -translate-y-1/2 -z-10 rounded-full transition-all duration-1000" 
                        style={{ width: `${(STATUS_STEPS.indexOf(order.status) / (STATUS_STEPS.length - 1)) * 100}%` }}
                      />
                      <div className="flex justify-between">
                        {STATUS_STEPS.map((step, idx) => {
                          const isActive = STATUS_STEPS.indexOf(order.status) >= idx;
                          return (
                            <div key={step} className="flex flex-col items-center gap-3 bg-[#FAF9F6] lg:bg-transparent">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                                isActive ? 'bg-brand-orange text-white shadow-lg shadow-brand-orange/20' : 'bg-white border border-gray-100 text-gray-300'
                              }`}>
                                {STATUS_ICONS[step]}
                              </div>
                              <span className={`text-[9px] uppercase font-bold tracking-widest ${isActive ? 'text-brand-orange' : 'text-gray-300'}`}>
                                {step}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                      <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Items Ordered</p>
                      <div className="space-y-3">
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-gray-50">
                            <div className="w-12 h-12 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0">
                               <Package className="w-full h-full p-3 text-gray-200" />
                            </div>
                            <div className="flex-grow">
                              <h5 className="text-sm font-bold text-[#1A1A1A] line-clamp-1">{item.name}</h5>
                              <p className="text-xs text-gray-400">Qty: {item.qty} × ₹{item.price.toLocaleString()}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-50 flex flex-col justify-between">
                      <div className="space-y-3">
                         <div className="flex justify-between text-xs">
                           <span className="text-gray-400 font-medium">Subtotal</span>
                           <span className="font-bold">₹{order.subtotal?.toLocaleString()}</span>
                         </div>
                         <div className="flex justify-between text-xs">
                           <span className="text-gray-400 font-medium">Shipping</span>
                           <span className="text-green-600 font-bold">{order.shipping === 0 ? 'FREE' : `₹${order.shipping}`}</span>
                         </div>
                      </div>
                      <div className="pt-6 border-t border-gray-50 mt-6 flex justify-between items-center">
                        <span className="font-fashion font-bold text-gray-800">Total Paid</span>
                        <span className="text-2xl font-bold text-[#1A1A1A]">₹{order.total?.toLocaleString()}</span>
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
