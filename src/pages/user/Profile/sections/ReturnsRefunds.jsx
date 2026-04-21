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

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-brand-orange" size={40} /></div>;

  return (
    <div className="bg-white p-10 md:p-14 rounded-[4rem] shadow-sm border border-gray-50">
      <div className="flex items-center gap-4 mb-12">
        <RotateCcw className="text-brand-orange" size={28} />
        <h2 className="text-3xl font-fashion font-bold text-[#1A1A1A]">Returns & Refunds</h2>
      </div>

      {returns.length === 0 ? (
        <div className="text-center py-20 bg-[#FAF9F6]/50 rounded-[3rem]">
          <RotateCcw size={48} className="text-gray-200 mx-auto mb-6" />
          <p className="text-gray-500 font-medium">No return records found.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {returns.map((item) => (
            <div key={item.id} className="p-8 md:p-10 border border-gray-50 rounded-[3rem] bg-[#FAF9F6]/30 flex flex-col md:flex-row items-center justify-between gap-8 transition-all hover:border-brand-orange/10">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-brand-orange shadow-sm">
                  <Package size={24} />
                </div>
                <div>
                  <h4 className="text-lg font-fashion font-bold text-[#1A1A1A]">{item.orderId}</h4>
                  <p className="text-xs text-gray-400 font-medium tracking-wide">{item.items?.length} Items • Return Requested</p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <div className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${
                  item.status === 'Refunded' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-500'
                }`}>
                  {item.status === 'Refunded' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                  {item.status}
                </div>
                <p className="text-sm font-bold text-[#1A1A1A]">₹{item.total?.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
