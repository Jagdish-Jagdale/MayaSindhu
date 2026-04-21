import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingBag, X, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductCard from '../../components/user/ProductCard';
import { db } from '../../firebase';
import { collection, query, orderBy, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function Wishlist() {
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
      collection(db, 'users', user.uid, 'wishlist'),
      orderBy('addedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const wishlistItems = snapshot.docs.map(doc => ({
        docId: doc.id,
        ...doc.data()
      }));
      setItems(wishlistItems);
      setLoading(false);
    }, (error) => {
      console.error("Wishlist real-time error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const removeItem = async (docId) => {
    try {
      const itemRef = doc(db, 'users', user.uid, 'wishlist', docId);
      await deleteDoc(itemRef);
    } catch (error) {
      console.error("Error removing from wishlist:", error);
    }
  };

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
        <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-8">
          <Heart size={40} className="text-red-200" fill="currentColor" />
        </div>
        <h2 className="text-3xl font-fashion font-bold text-[#1A1A1A] mb-4">Your wishlist is empty</h2>
        <p className="text-gray-500 mb-10 max-w-md">Save your favorite handcrafted pieces for later.</p>
        <Link to="/shop" className="btn btn-primary px-12">Browse Collection</Link>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen py-16 md:py-24">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="mb-16">
          <h1 className="text-4xl md:text-5xl font-fashion font-bold text-[#1A1A1A] mb-4">My Wishlist</h1>
          <p className="text-gray-500">{items.length} treasures saved</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-16">
          <AnimatePresence>
            {items.map((item) => (
              <motion.div
                key={item.docId}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative group"
              >
                <button
                  onClick={() => removeItem(item.docId)}
                  className="absolute top-4 right-4 z-20 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 transition-all active:scale-90 group/remove"
                  title="Remove from wishlist"
                >
                  <X size={20} strokeWidth={2.5} className="group-hover/remove:rotate-90 transition-transform duration-300" />
                </button>
                <div className="flex flex-col h-full">
                  <ProductCard {...item} />
                  <button 
                    onClick={() => removeItem(item.docId)}
                    className="mt-4 text-[11px] font-bold uppercase tracking-widest text-gray-400 hover:text-red-500 transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash2 size={14} /> Remove Treasure
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
