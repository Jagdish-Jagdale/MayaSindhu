/**
 * File: WishlistTab.jsx
 * Description: Client-facing customer page rendering home banners, blog lists, product details, and profile user sections.
 * Work Done: Integrated baseline UI layouts, state boundaries, CSS theme styling, and routing pathways.
 */

import React, { useState, useEffect } from 'react';
import { db } from '../../../../firebase';
import { collection, query, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getProductPath } from '../../../../utils/productUtils';
import toast from 'react-hot-toast';

export default function WishlistTab({ user }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'users', user.uid, 'wishlist'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setItems(snapshot.docs.map(doc => ({ docId: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  const removeItem = async (docId) => {
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'wishlist', docId));
      toast.success('Item removed');
    } catch (error) {
      toast.error('Error removing item');
    }
  };

  if (loading) return null;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#1A1A1A]">My Wishlist</h2>
        <span className="bg-brand-orange/10 text-brand-orange px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
          {items.length} Items
        </span>
      </div>

      {items.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-gray-100 text-center shadow-sm">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart size={32} className="text-gray-200" />
          </div>
          <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-8">Your wishlist is currently empty</p>
          <Link to="/" className="bg-[#1A1A1A] text-white px-10 py-4 rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-black transition-all shadow-lg">Start Shopping</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item) => (
            <div key={item.docId} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md transition-all duration-500">
              <div className="relative aspect-square overflow-hidden bg-gray-50">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <button
                  onClick={() => removeItem(item.docId)}
                  className="absolute top-4 right-4 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 transition-all shadow-sm"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="p-4">
                <h3 className="font-bold text-[#1A1A1A] text-sm mb-1 truncate">{item.name}</h3>
                <p className="text-brand-orange font-bold text-xs mb-4">₹{item.price.toLocaleString('en-IN')}</p>

                <Link
                  to={getProductPath(item.productId || item.id, item.name, item.slug)}
                  className="w-full bg-[#1A1A1A] text-white py-3 rounded-lg flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-all group"
                >
                  View Details <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
