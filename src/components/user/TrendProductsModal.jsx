/**
 * File: TrendProductsModal.jsx
 * Description: Client-facing e-commerce UI components for filtering catalogs, carousel sliders, footer contents, and shopping card modals.
 * Work Done: Integrated baseline UI layouts, state boundaries, CSS theme styling, and routing pathways.
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import ProductCard from './ProductCard';
import useEscapeKey from '../../hooks/useEscapeKey';

export default function TrendProductsModal({ isOpen, onClose, trend, products }) {
  useEscapeKey(onClose, isOpen);

  if (!isOpen || !trend) return null;

  // Hydrate trend products
  const trendProducts = products.filter(p => trend.productIds?.includes(p.id));

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) { const closeFn = onClose; closeFn(); } }}>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="relative bg-white w-full max-w-5xl rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
          >
            {/* Header / Intro section */}
            <div className="p-6 md:p-8 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white relative">
              <button 
                onClick={onClose} 
                className="absolute top-6 right-6 w-9 h-9 flex items-center justify-center bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-gray-700 rounded-lg transition-all duration-300 z-10 active:scale-95"
              >
                <X size={16} />
              </button>

              <div className="max-w-2xl space-y-2">
                <span className="inline-flex items-center gap-1.5 text-brand-orange text-[9px] font-bold uppercase tracking-[0.2em] bg-brand-orange/10 px-2.5 py-1 rounded">
                  <Sparkles size={10} />
                  Trending Spotlight
                </span>
                <h3 className="text-xl md:text-2xl font-bold font-sans text-gray-900 leading-tight">
                  {trend.title}
                </h3>
                {trend.description && (
                  <p className="text-gray-500 text-xs md:text-sm font-medium leading-relaxed max-w-xl">
                    {trend.description}
                  </p>
                )}
              </div>
            </div>

            {/* Products Grid / Scroll Area */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar bg-white">
              {trendProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                  <div className="w-16 h-16 bg-gray-50 text-gray-300 rounded-xl flex items-center justify-center">
                    <Sparkles size={28} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-[14px] font-bold text-gray-900 uppercase tracking-wider">No Products Found</h4>
                    <p className="text-xs text-gray-400 max-w-xs font-medium leading-relaxed">
                      We are currently curating the masterworks for this trend. Please check back soon!
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-6 md:gap-y-12">
                  {trendProducts.map((product) => (
                    <ProductCard key={product.id} {...product} />
                  ))}
                </div>
              )}
            </div>
            {/* Grid end */}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
