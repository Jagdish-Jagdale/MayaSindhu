import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

// Placeholder data for cart items
const initialCart = [
  {
    id: 1,
    name: "Artisanal Earring Collection",
    price: 8500,
    image: "/src/assets/p1.jpeg",
    qty: 1
  },
  {
    id: 3,
    name: "Lavender Daisy Cotton Saree",
    price: 12500,
    image: "/src/assets/p3.jpeg",
    qty: 1
  }
];

export default function Cart() {
  const [items, setItems] = useState(initialCart);

  const updateQty = (id, delta) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item
    ));
  };

  const removeItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  const subtotal = items.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const shipping = 500;
  const total = subtotal + shipping;

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
                  key={item.id}
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
                        <button onClick={() => updateQty(item.id, -1)} className="text-gray-400 hover:text-brand-orange">
                          <Minus size={16} />
                        </button>
                        <span className="font-bold text-sm">{item.qty}</span>
                        <button onClick={() => updateQty(item.id, 1)} className="text-gray-400 hover:text-brand-orange">
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-center md:items-end gap-10">
                    <p className="text-xl font-bold text-[#1A1A1A]">₹{(item.price * item.qty).toLocaleString()}</p>
                    <button
                      onClick={() => removeItem(item.id)}
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
