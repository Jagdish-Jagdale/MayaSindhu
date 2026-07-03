/**
 * File: Wishlist.jsx
 * Description: Client-facing wishlist container displaying saved products and item removal controllers.
 * Work Done: Cleaned up unused navigate and goBack hooks and their corresponding import statements.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingBag, X, Trash2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductCard from '../../components/user/ProductCard';
import { db } from '../../firebase';
import { collection, query, orderBy, onSnapshot, doc, deleteDoc, getDoc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function Wishlist() {
  const { user, setLoginModalOpen, loading: authLoading } = useAuth();
  const [items, setItems] = useState([]);
  const [fullProducts, setFullProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setItems([]);
      setFullProducts([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const q = query(
      collection(db, 'users', user.uid, 'wishlist'),
      orderBy('addedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const wishlistItems = snapshot.docs.map(doc => ({
        docId: doc.id,
        ...doc.data()
      }));
      setItems(wishlistItems);

      // Fetch full product details for each item to ensure images are correct
      try {
        const productPromises = wishlistItems.map(async (item) => {
          const pDoc = await getDoc(doc(db, 'products', item.id));
          if (pDoc.exists()) {
            return { docId: item.docId, ...pDoc.data(), id: pDoc.id };
          }
          return item; // Fallback to saved snapshot if full product not found
        });
        const resolvedProducts = await Promise.all(productPromises);
        setFullProducts(resolvedProducts);
      } catch (error) {
        setFullProducts(wishlistItems);
      }

      setLoading(false);
    }, (error) => {
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const removeItem = async (docId) => {
    try {
      const itemRef = doc(db, 'users', user.uid, 'wishlist', docId);
      await deleteDoc(itemRef);
    } catch (error) {
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-12 h-12 animate-spin text-brand-orange" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-8">
          <Heart size={40} className="text-red-200" fill="currentColor" />
        </div>
        <h2 className="text-3xl font-sans font-bold text-[#1A1A1A] mb-4">Please log in to view your wishlist</h2>
        <p className="text-gray-500 mb-10 max-w-md">Save your favorite handcrafted pieces for later.</p>
        <button onClick={() => setLoginModalOpen(true)} className="btn btn-primary px-12">Login</button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-8">
          <Heart size={40} className="text-red-200" fill="currentColor" />
        </div>
        <h2 className="text-3xl font-sans font-bold text-[#1A1A1A] mb-4">Your wishlist is empty</h2>
        <p className="text-gray-500 mb-10 max-w-md">Save your favorite handcrafted pieces for later.</p>
        <Link to="/collections" className="btn btn-primary px-12">Browse Collection</Link>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pt-16 pb-24">
      <div className="max-w-[1200px] mx-auto px-6">
        <h1 className="text-4xl md:text-5xl font-sans font-bold text-[#1A1A1A] mb-12">Your Wishlist</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-16">
          <AnimatePresence>
            {fullProducts.map((item) => (
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
                  className="absolute top-3 right-3 md:top-5 md:right-5 z-20 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center text-red-500 transition-all active:scale-90 group/remove"
                  title="Remove from wishlist"
                >
                  <Heart size={18} strokeWidth={2.5} fill="currentColor" className="transition-transform group-hover/remove:scale-110" />
                </button>
                <div className="flex flex-col h-full">
                  <ProductCard {...item} showWishlist={false} />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
