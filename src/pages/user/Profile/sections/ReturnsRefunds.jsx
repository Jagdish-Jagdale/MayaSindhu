import React, { useState, useEffect } from 'react';
import { RotateCcw, Package, Clock, CheckCircle2, Search, Loader2 } from 'lucide-react';
import { db } from '../../../../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

export default function ReturnsRefunds({ user }) {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    // We filter orders that have a 'Return Requested' status or similar
    const q = query(
      collection(db, 'orders'),
      where('customerUid', '==', user.uid),
      where('status', 'in', ['Return Requested', 'Returned', 'Refunded'])
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReturns(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-[#f5aa00]" size={40} /></div>;

  return (
    <div className="bg-white p-6 md:p-10 rounded-[3rem] shadow-xl shadow-gray-200/20 border border-[#f0dda0]/20">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-[#f5aa00] to-[#e07a00] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-[#f5aa00]/20">
          <RotateCcw size={24} strokeWidth={1.5} />
        </div>
        <div>
          <h2 className="text-2xl font-fashion font-bold text-[#1A1A1A] tracking-tight">Returns & Refunds</h2>
          <p className="text-[10px] text-[#f5aa00] font-bold uppercase tracking-[0.2em] mt-0.5">Track Requests</p>
        </div>
      </div>

      {returns.length === 0 ? (
        <div className="text-center py-16 bg-[#fffbf2]/20 rounded-[2.5rem] border border-dashed border-[#f0dda0]/30">
          <RotateCcw size={40} className="text-[#f5aa00]/20 mx-auto mb-4" />
          <p className="text-gray-400 font-bold text-[11px] uppercase tracking-widest">No return records found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {returns.map((item) => (
            <div key={item.id} className="p-5 md:p-6 border border-[#f0dda0]/10 rounded-[2rem] bg-[#fffbf2]/10 flex flex-col md:flex-row items-center justify-between gap-6 transition-all hover:border-[#f5aa00]/20 group">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-[#f5aa00] shadow-sm border border-[#f0dda0]/10 group-hover:scale-105 transition-transform">
                  <Package size={22} />
                </div>
                <div>
                  <h4 className="text-[15px] font-fashion font-bold text-[#1A1A1A] uppercase tracking-tight">{item.orderId}</h4>
                  <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">{item.items?.length} Items • Return Requested</p>
                </div>
              </div>

              <div className="flex flex-col md:items-end gap-2">
                <div className={`px-4 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 shadow-sm border ${
                  item.status === 'Refunded' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-[#fffbf2] text-[#f5aa00] border-[#f5aa00]/20'
                }`}>
                  {item.status === 'Refunded' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                  {item.status}
                </div>
                <p className="text-lg font-fashion font-bold text-[#1A1A1A] leading-none">₹{item.total?.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
