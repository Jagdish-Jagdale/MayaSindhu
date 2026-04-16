import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingBag, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductCard from '../../components/user/ProductCard';

// Placeholder data for wishlist
const initialWishlist = [
  {
    id: 1,
    name: "Artisanal Earring Collection",
    price: 8500,
    image: "/src/assets/p1.jpeg",
    rating: 4.9
  },
  {
    id: 4,
    name: "Indigo Block Print Saree",
    price: 9800,
    image: "/src/assets/p4.jpeg",
    rating: 5.0
  }
];

export default function Wishlist() {
  const [items, setItems] = useState(initialWishlist);


  const removeItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

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
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative group"
              >
                <button
                  onClick={() => removeItem(item.id)}
                  className="absolute top-4 right-4 z-20 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors shadow-sm"
                >
                  <X size={16} />
                </button>
                <ProductCard {...item} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
