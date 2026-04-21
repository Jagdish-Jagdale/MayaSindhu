import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { db } from '../../firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';

export default function Cart() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }

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
      console.error("Cart real-time error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const updateQty = async (docId, delta, currentQty) => {
    try {
      const newQty = Math.max(1, currentQty + delta);
      const itemRef = doc(db, 'users', user.uid, 'cart', docId);
      await updateDoc(itemRef, {
        qty: newQty,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error updating qty:", error);
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

  const subtotal = items.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const shipping = 500;
  const total = subtotal + shipping;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6]">
        <Loader2 className="w-12 h-12 animate-spin text-brand-orange" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-8">
          <ShoppingBag size={40} className="text-gray-300" />
        </div>
        <h2 className="text-3xl font-fashion font-bold text-[#1A1A1A] mb-4">Your bag is empty</h2>
        <p className="text-gray-500 mb-10 max-w-md">Looks like you haven't added any handcrafted treasures to your bag yet.</p>
        <Link to="/shop" className="btn btn-primary px-12">Return to Shop</Link>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF9F6] min-h-screen py-16 md:py-24">
      <div className="max-w-[1400px] mx-auto px-6">
        <h1 className="text-4xl md:text-5xl font-fashion font-bold text-[#1A1A1A] mb-12">Shopping Bag</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-6">
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={item.docId}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white p-6 md:p-8 rounded-[2.5rem] flex flex-col md:flex-row gap-8 items-center"
                >
                  <div className="w-32 h-40 flex-shrink-0 bg-gray-50 rounded-2xl overflow-hidden">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>

                  <div className="flex-grow text-center md:text-left">
                    <h3 className="text-xl font-fashion font-bold text-[#1A1A1A] mb-2">{item.name}</h3>
                    <p className="text-[#B08968] font-bold text-lg mb-6">₹{item.price.toLocaleString()}</p>

                    <div className="flex items-center justify-center md:justify-start gap-4">
                      <div className="flex items-center bg-[#FAF9F6] rounded-full px-4 py-2 gap-6">
                        <button onClick={() => updateQty(item.docId, -1, item.qty)} className="text-gray-400 hover:text-brand-orange">
                          <Minus size={16} />
                        </button>
                        <span className="font-bold text-sm">{item.qty}</span>
                        <button onClick={() => updateQty(item.docId, 1, item.qty)} className="text-gray-400 hover:text-brand-orange">
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-center md:items-end gap-10">
                    <p className="text-xl font-bold text-[#1A1A1A]">₹{(item.price * item.qty).toLocaleString()}</p>
                    <button
                      onClick={() => removeItem(item.docId)}
                      className="text-gray-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={20} strokeWidth={1.5} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white p-10 rounded-[3rem] sticky top-32 shadow-sm border border-gray-100">
              <h2 className="text-2xl font-fashion font-bold text-[#1A1A1A] mb-8">Summary</h2>

              <div className="space-y-4 mb-10 pb-10 border-b border-gray-100">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Shipping</span>
                  <span>₹{shipping.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Tax (Included)</span>
                  <span>₹0</span>
                </div>
              </div>

              <div className="flex justify-between text-2xl font-fashion font-bold mb-10">
                <span>Total</span>
                <span className="text-brand-orange">₹{total.toLocaleString()}</span>
              </div>

              <Link to="/checkout" className="btn btn-primary w-full py-5 flex items-center justify-center gap-3">
                Checkout <ArrowRight size={18} />
              </Link>

              <div className="mt-8 pt-8 text-center text-[10px] text-gray-400 uppercase tracking-widest leading-relaxed">
                Free heritage shipping on <br /> orders above ₹25,000
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
