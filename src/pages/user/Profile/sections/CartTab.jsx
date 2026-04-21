import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Trash2, ArrowRight, Loader2, Plus, Minus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../../../firebase';
import { collection, query, orderBy, onSnapshot, doc, deleteDoc, updateDoc } from 'firebase/firestore';

export default function CartTab({ user }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'users', user.uid, 'cart'),
      orderBy('addedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const cartItems = snapshot.docs.map(doc => ({
        docId: doc.id,
        ...doc.data()
      }));
      setItems(cartItems);
      setLoading(false);
    }, (error) => {
      console.error("CartTab fetch error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const updateQty = async (docId, newQty) => {
    if (newQty < 1) return;
    try {
      const itemRef = doc(db, 'users', user.uid, 'cart', docId);
      await updateDoc(itemRef, { qty: newQty });
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  const removeItem = async (docId) => {
    try {
      const itemRef = doc(db, 'users', user.uid, 'cart', docId);
      await deleteDoc(itemRef);
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-orange" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-white p-12 rounded-[3.5rem] shadow-sm text-center border border-gray-50">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingBag size={32} className="text-gray-200" />
        </div>
        <h3 className="text-2xl font-fashion font-bold text-[#1A1A1A] mb-2">Your Bag is Empty</h3>
        <p className="text-gray-400 mb-8 max-w-xs mx-auto">Treasures are waiting to be discovered in our collections.</p>
        <button 
          onClick={() => navigate('/shop')}
          className="btn btn-primary px-10 py-4 bg-[#1A1A1A] text-white rounded-2xl hover:bg-black transition-all"
        >
          Explore Shop
        </button>
      </div>
    );
  }

  const total = items.reduce((sum, item) => sum + (item.price * item.qty), 0);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-fashion font-bold text-[#1A1A1A]">My Shopping Bag</h2>
        <span className="bg-brand-orange/10 text-brand-orange px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
          {items.length} Items
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <AnimatePresence>
          {items.map((item) => (
            <motion.div
              key={item.docId}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-50 flex items-center gap-6 group hover:shadow-md transition-all duration-500"
            >
              <div className="w-24 h-32 rounded-3xl overflow-hidden flex-shrink-0 bg-gray-50">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>

              <div className="flex-grow min-w-0">
                <h4 className="font-fashion font-bold text-lg text-[#1A1A1A] mb-1 truncate">{item.name}</h4>
                <p className="text-brand-orange font-bold text-sm mb-4">₹{item.price.toLocaleString('en-IN')}</p>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center bg-gray-50 rounded-xl p-1 px-2 border border-gray-100">
                    <button onClick={() => updateQty(item.docId, item.qty - 1)} className="p-1 hover:text-brand-orange transition-colors">
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center text-xs font-bold">{item.qty}</span>
                    <button onClick={() => updateQty(item.docId, item.qty + 1)} className="p-1 hover:text-brand-orange transition-colors">
                      <Plus size={14} />
                    </button>
                  </div>

                  <button 
                    onClick={() => removeItem(item.docId)}
                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    title="Remove item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="text-right hidden sm:block">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Subtotal</p>
                <p className="text-[#1A1A1A] font-bold">₹{(item.price * item.qty).toLocaleString('en-IN')}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="bg-[#1A1A1A] p-10 rounded-[3.5rem] text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-black/10">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-2">Grand Total</p>
          <h3 className="text-4xl font-fashion font-bold">₹{total.toLocaleString('en-IN')}</h3>
        </div>
        
        <button 
          onClick={() => navigate('/checkout')}
          className="w-full md:w-auto bg-brand-orange text-white px-12 py-5 rounded-2xl flex items-center justify-center gap-4 hover:bg-white hover:text-brand-orange transition-all font-bold active:scale-95 group"
        >
          <span className="uppercase tracking-[0.2em] text-xs">Checkout Now</span>
          <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
        </button>
      </div>
    </div>
  );
}
