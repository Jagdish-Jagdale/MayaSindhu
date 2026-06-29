import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Loader2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebase';
import { collection, query, onSnapshot, doc, updateDoc, deleteDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useCartUI } from '../../context/CartUIContext';

export default function Cart() {
  const { user } = useAuth();
  const { isCartOpen, setCartOpen } = useCartUI();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [prevUser, setPrevUser] = useState(user);
  if (user !== prevUser) {
    setPrevUser(user);
    if (!user) {
      setItems([]);
      setLoading(false);
    } else {
      setLoading(true);
    }
  }

  useEffect(() => {
    if (!user) {
      return;
    }

    const q = query(collection(db, 'users', user.uid, 'cart'));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const cartItems = snapshot.docs.map(doc => ({
        docId: doc.id,
        ...doc.data()
      })).sort((a, b) => {
        const timeA = a.addedAt?.seconds || a.addedAt?.getTime?.() || 0;
        const timeB = b.addedAt?.seconds || b.addedAt?.getTime?.() || 0;
        return timeB - timeA;
      });

      const resolvedItems = await Promise.all(cartItems.map(async (item) => {
        if (!item.price || item.price === 0) {
          try {
            const prodRef = doc(db, 'products', item.id);
            const prodSnap = await getDoc(prodRef);
            if (prodSnap.exists()) {
              const prodData = prodSnap.data();
              return {
                ...item,
                price: prodData.discountedPrice || prodData.price || 0
              };
            }
          } catch (err) {
          }
        }
        return item;
      }));

      setItems(resolvedItems);
      setLoading(false);
    }, (error) => {
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const updateQty = async (docId, delta, currentQty) => {
    try {
      const newQty = currentQty + delta;
      if (newQty < 1) return;

      if (delta > 0) {
        const item = items.find(i => i.docId === docId);
        if (item) {
          const productId = item.id;
          const variantId = item.variantId;
          
          let stockVal = 15;
          let isUnique = item.productType === 'Unique';
          
          if (variantId) {
            const varSnap = await getDoc(doc(db, 'products', productId, 'variants', variantId));
            if (varSnap.exists()) {
              const varData = varSnap.data();
              stockVal = Number(varData.stock) || 0;
              isUnique = varData.productType === 'Unique';
            }
          } else {
            const productRef = doc(db, 'products', productId);
            const productSnap = await getDoc(productRef);
            if (productSnap.exists()) {
              const productData = productSnap.data();
              isUnique = productData.isUniquePiece === true || productData.productType === 'Unique';
              stockVal = typeof productData.stock === 'number' ? productData.stock : (isUnique ? 1 : 15);
            }
          }

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
      toast.error("Failed to update quantity");
    }
  };

  const removeItem = async (docId) => {
    try {
      const itemRef = doc(db, 'users', user.uid, 'cart', docId);
      await deleteDoc(itemRef);
    } catch (error) {
    }
  };

  const handleCheckout = () => {
    setCartOpen(false);
    navigate('/checkout');
  };

  const handleReturnToShop = () => {
    setCartOpen(false);
    navigate('/collections');
  };

  const subtotal = items.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const shippingFee = 500;
  const isFreeShipping = subtotal > 25000;
  const shipping = isFreeShipping ? 0 : shippingFee;
  const total = subtotal + shipping;

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCartOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[2000]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-[2001] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center gap-3">
                <ShoppingBag className="text-brand-orange" size={24} />
                <h2 className="text-xl font-bold text-[#1A1A1A]">My Bag ({items.length})</h2>
              </div>
              <button 
                onClick={() => setCartOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Cart Items Area */}
            <div className="flex-1 overflow-y-auto bg-gray-50/50 p-4 space-y-4">
              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="w-8 h-8 animate-spin text-brand-orange" />
                </div>
              ) : items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                    <ShoppingBag size={32} className="text-gray-300" />
                  </div>
                  <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">Your bag is empty</h3>
                  <p className="text-gray-500 text-sm mb-8 px-4">Looks like you haven't added any handcrafted treasures to your bag yet.</p>
                  <button onClick={handleReturnToShop} className="btn btn-primary px-8 py-3 text-sm">
                    Return to Shop
                  </button>
                </div>
              ) : (
                <AnimatePresence>
                  {items.map((item) => (
                    <motion.div
                      key={item.docId}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4 relative group"
                    >
                      <button
                        onClick={() => removeItem(item.docId)}
                        className="absolute -top-2 -right-2 w-7 h-7 bg-white border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 shadow-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-10"
                      >
                        <X size={14} />
                      </button>

                      <div className="w-20 h-24 flex-shrink-0 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 p-1">
                        <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                      </div>

                      <div className="flex-1 flex flex-col justify-between py-1">
                        <div>
                          <h3 className="text-sm font-bold text-[#1A1A1A] leading-tight line-clamp-2 pr-4">{item.name}</h3>
                          {item.productType === 'Unique' && (
                            <span className="inline-block mt-1 text-[9px] font-black text-[#1BAFAF] uppercase tracking-widest bg-[#1BAFAF]/10 px-2 py-0.5 rounded-full">
                              Unique Piece
                            </span>
                          )}
                        </div>

                        <div className="flex items-end justify-between mt-3">
                          <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200">
                            <button onClick={() => updateQty(item.docId, -1, item.qty)} className="p-1.5 text-gray-500 hover:text-brand-orange transition-colors">
                              <Minus size={14} />
                            </button>
                            <span className="font-bold text-xs w-6 text-center">{item.qty}</span>
                            <button 
                              onClick={() => item.productType !== 'Unique' && updateQty(item.docId, 1, item.qty)} 
                              disabled={item.productType === 'Unique'}
                              className={`p-1.5 transition-colors ${item.productType === 'Unique' ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-brand-orange'}`}
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-brand-orange font-bold text-base">₹{(item.price * item.qty).toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Footer Summary Area */}
            {items.length > 0 && (
              <div className="bg-white border-t border-gray-100 p-6 flex-shrink-0 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)] z-10">
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 font-medium">Subtotal</span>
                    <span className="font-bold text-[#1A1A1A]">₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 font-medium">Shipping</span>
                    <span className={`font-bold ${isFreeShipping ? 'text-green-600' : 'text-[#1A1A1A]'}`}>
                      {isFreeShipping ? 'Free' : `₹${shippingFee.toLocaleString()}`}
                    </span>
                  </div>
                  <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                    <span className="text-base font-bold text-[#1A1A1A]">Total</span>
                    <span className="text-xl font-bold text-brand-orange">₹{total.toLocaleString()}</span>
                  </div>
                </div>

                <button 
                  onClick={handleCheckout}
                  className="w-full bg-brand-orange hover:bg-brand-orange-dark text-white py-4 rounded-xl flex items-center justify-center gap-2 font-bold text-sm tracking-widest transition-all active:scale-[0.98] shadow-lg shadow-brand-orange/20"
                >
                  Proceed to Checkout <ArrowRight size={18} />
                </button>

                {!isFreeShipping && (
                  <p className="text-center text-[10px] text-gray-400 font-bold tracking-tight mt-4">
                    Add ₹{(25000 - subtotal).toLocaleString()} more to unlock free shipping
                  </p>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
