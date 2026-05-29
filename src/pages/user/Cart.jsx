import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Loader2, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useGoBack } from '../../hooks/useGoBack';
import { db } from '../../firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

export default function Cart() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const goBack = useGoBack();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'users', user.uid, 'cart')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const cartItems = snapshot.docs.map(doc => ({
        docId: doc.id,
        ...doc.data()
      })).sort((a, b) => {
        const timeA = a.addedAt?.seconds || a.addedAt?.getTime?.() || 0;
        const timeB = b.addedAt?.seconds || b.addedAt?.getTime?.() || 0;
        return timeB - timeA;
      });
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
      const newQty = currentQty + delta;
      if (newQty < 1) return;

      if (delta > 0) {
        const productRef = doc(db, 'products', docId);
        const productSnap = await getDoc(productRef);
        if (productSnap.exists()) {
          const productData = productSnap.data();
          const isUnique = productData.isUniquePiece === true || productData.productType === 'Unique';
          const stockVal = typeof productData.stock === 'number' ? productData.stock : (isUnique ? 1 : 15);

          if (isUnique) {
            toast.error("Unique pieces are limited to 1 item.");
            return;
          }
          if (newQty > stockVal) {
            toast.error(`Only ${stockVal} items available in stock.`);
            return;
          }
        }
      }

      const itemRef = doc(db, 'users', user.uid, 'cart', docId);
      await updateDoc(itemRef, {
        qty: newQty,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error updating qty:", error);
      toast.error("Failed to update quantity");
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
  const shippingFee = 500;
  const isFreeShipping = subtotal > 25000;
  const shipping = isFreeShipping ? 0 : shippingFee;
  const total = subtotal + shipping;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
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
        <h2 className="text-3xl font-sans font-bold text-[#1A1A1A] mb-4">Your bag is empty</h2>
        <p className="text-gray-500 mb-10 max-w-md">Looks like you haven't added any handcrafted treasures to your bag yet.</p>
        <Link to="/collections" className="btn btn-primary px-12">Return to Shop</Link>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pt-6 md:pt-8 pb-12 md:pb-16">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6">
        <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-[#1A1A1A] mb-6 md:mb-8">Shopping Bag</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
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
                  className="bg-white p-4 md:p-6 lg:p-8 rounded-md flex flex-row gap-4 md:gap-8 items-center shadow-sm hover:shadow-md transition-all border border-gray-50"
                >
                  <div className="w-20 h-24 md:w-32 md:h-40 flex-shrink-0 bg-white rounded-md overflow-hidden p-1 md:p-2 border border-gray-50">
                    <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                  </div>

                  <div className="flex-grow text-left">
                    <h3 className="text-sm md:text-xl font-fashion font-bold text-[#1A1A1A] mb-1 uppercase tracking-tight line-clamp-2">{item.name}</h3>
                    {item.productType === 'Unique' && (
                      <p className="text-[9px] md:text-[10px] font-black text-[#1BAFAF] uppercase tracking-widest mb-1 md:mb-2">Unique Piece</p>
                    )}
                    <p className="text-brand-orange font-bold text-sm md:text-lg mb-3 md:mb-6">
                      ₹{item.price.toLocaleString()}
                      {item.qty > 1 && (
                        <span className="text-gray-400 font-medium text-xs ml-2 md:hidden">
                          (Total: ₹{(item.price * item.qty).toLocaleString()})
                        </span>
                      )}
                      {item.qty === 1 && (
                        <span className="text-gray-400 font-medium text-xs ml-2 md:hidden">
                          (Total: ₹{item.price.toLocaleString()})
                        </span>
                      )}
                    </p>

                    <div className="flex flex-wrap items-center justify-start gap-3">
                      <div className="flex items-center bg-gray-50 rounded-full px-3 md:px-4 py-1.5 md:py-2 gap-4 md:gap-6 border border-gray-100">
                        <button onClick={() => updateQty(item.docId, -1, item.qty)} className="text-gray-400 hover:text-brand-orange transition-colors">
                          <Minus size={14} className="md:w-4 md:h-4" />
                        </button>
                        <span className="font-bold text-xs md:text-sm min-w-[16px] md:min-w-[20px] text-center">{item.qty}</span>
                        <button 
                          onClick={() => item.productType !== 'Unique' && updateQty(item.docId, 1, item.qty)} 
                          disabled={item.productType === 'Unique'}
                          className={`transition-colors ${item.productType === 'Unique' ? 'text-gray-200 cursor-not-allowed' : 'text-gray-400 hover:text-brand-orange'}`}
                        >
                          <Plus size={14} className="md:w-4 md:h-4" />
                        </button>
                      </div>

                      {/* Mobile Remove Button */}
                      <button
                        onClick={() => removeItem(item.docId)}
                        className="flex md:hidden items-center justify-center p-2 bg-red-50 text-red-500 rounded-xl border border-red-100 active:scale-95 transition-all cursor-pointer"
                        title="Remove item"
                      >
                        <Trash2 size={16} />
                      </button>

                      {/* Mobile Buy this now Button */}
                      <button
                        onClick={() => navigate('/checkout', { 
                          state: { 
                            buyNowItem: {
                              ...item,
                              isDirectBuy: true
                            } 
                          } 
                        })}
                        className="flex md:hidden items-center justify-center bg-brand-orange hover:bg-brand-orange-dark text-white px-4 py-2.5 rounded-xl transition-all font-bold text-[10px] uppercase tracking-wider active:scale-95 border border-brand-orange/20 cursor-pointer"
                      >
                        Buy Now
                      </button>
                    </div>
                  </div>

                  <div className="hidden md:flex flex-col items-end gap-4 md:gap-6">
                    <p className="text-xl md:text-2xl font-bold text-[#1A1A1A]">₹{(item.price * item.qty).toLocaleString()}</p>
                    <div className="flex flex-col gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => navigate('/checkout', { 
                          state: { 
                            buyNowItem: {
                              ...item,
                              isDirectBuy: true
                            } 
                          } 
                        })}
                        className="bg-brand-orange hover:bg-brand-orange-dark text-white px-6 py-2.5 rounded-xl transition-all font-bold text-[11px] shadow-lg shadow-brand-orange/10 active:scale-95 border border-brand-orange/20"
                      >
                        Buy this now
                      </button>
                      <button
                        onClick={() => removeItem(item.docId)}
                        className="group flex items-center justify-center gap-2 bg-red-50 hover:bg-red-500 text-red-500 hover:text-white px-6 py-2 rounded-xl transition-all font-bold text-[11px] border border-red-100"
                      >
                        <Trash2 size={14} />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 md:p-10 rounded-md sticky top-32 shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-8 tracking-tighter">Summary</h2>

              <div className="space-y-4 mb-10 pb-10 border-b border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-400">Subtotal</span>
                  <span className="font-bold text-[#1A1A1A]">₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-400">Shipping</span>
                  <span className={`font-bold ${isFreeShipping ? 'text-green-600' : 'text-[#1A1A1A]'}`}>
                    {isFreeShipping ? 'Free' : `₹${shippingFee.toLocaleString()}`}
                  </span>
                </div>
                {isFreeShipping && (
                  <div className="bg-green-50 p-3 rounded-xl border border-green-100">
                    <p className="text-[10px] font-bold text-green-600 tracking-widest text-center">Heritage Shipping unlocked!</p>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center text-2xl font-bold mb-10">
                <span className="tracking-tighter">Total</span>
                <span className="text-brand-orange">₹{total.toLocaleString()}</span>
              </div>

              <button 
                onClick={() => navigate('/checkout')}
                className="w-full bg-brand-orange hover:bg-brand-orange-dark text-white py-5 rounded-2xl flex items-center justify-center gap-3 font-bold text-sm tracking-widest transition-all active:scale-95 shadow-xl shadow-brand-orange/20 border border-brand-orange/20"
              >
                Proceed to Checkout <ArrowRight size={18} />
              </button>

              <div className="mt-8 pt-8 text-center">
                <p className="text-[10px] text-gray-400 font-bold tracking-tight leading-relaxed">
                  {isFreeShipping 
                    ? "Your order qualifies for free delivery" 
                    : `Add ₹${(25000 - subtotal).toLocaleString()} more to unlock free shipping`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
