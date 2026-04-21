import React, { useState, useEffect } from 'react';
import { db } from '../../../../firebase';
import { collection, query, orderBy, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { Heart, ShoppingBag, X, Loader2, Trash2 } from 'lucide-react';
import ProductCard from '../../../../components/user/ProductCard';
import { Link } from 'react-router-dom';

export default function WishlistTab({ user }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

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
      console.error("Wishlist listener error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const removeItem = async (docId) => {
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'wishlist', docId));
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-brand-orange" size={40} /></div>;

  return (
    <div className="bg-white p-10 md:p-14 rounded-[4rem] shadow-sm border border-gray-50">
      <div className="flex items-center gap-4 mb-12">
        <Heart className="text-brand-orange" size={28} />
        <h2 className="text-3xl font-fashion font-bold text-[#1A1A1A]">My Wishlist</h2>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 bg-[#FAF9F6] rounded-[3rem]">
          <Heart size={48} className="text-gray-200 mx-auto mb-6" />
          <p className="text-gray-500 font-medium mb-8">No treasures saved yet.</p>
          <Link to="/shop" className="btn btn-primary px-10">Start Shopping</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
          {items.map((item) => (
            <div key={item.docId} className="relative group">
              <button
                onClick={() => removeItem(item.docId)}
                className="absolute top-4 right-4 z-20 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 transition-all active:scale-90"
              >
                <X size={18} strokeWidth={2.5} />
              </button>
              <div className="flex flex-col h-full bg-[#FAF9F6]/50 p-4 rounded-[40px] border border-transparent hover:border-brand-orange/10 transition-all">
                <ProductCard {...item} />
                <button 
                  onClick={() => removeItem(item.docId)}
                  className="mt-6 text-[11px] font-black uppercase tracking-widest text-gray-400 hover:text-red-500 transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 size={14} /> Remove Item
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
