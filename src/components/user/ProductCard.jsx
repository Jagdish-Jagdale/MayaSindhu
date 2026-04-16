import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Heart, Star, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';

export default function ProductCard({ id, slug, name, price, image, rating = 4.8 }) {
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative"
    >
      <div className="relative aspect-[1/1.1] overflow-hidden bg-[#F5F5F7] rounded-[3rem]">
        <Link to={`/product/${slug}`}>
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
          />
        </Link>

        {/* Wishlist Icon */}
        <button className="absolute top-6 right-6 p-2.5 bg-white text-gray-900 rounded-full shadow-md hover:bg-[#FF6B00] hover:text-white transition-all duration-300 z-20">
          <Heart size={18} strokeWidth={2} />
        </button>

        {/* Add to Cart - Orange Pill (Hover only) */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 z-10 w-full px-8">
          <button
            onClick={handleAddToCart}
            className="w-full flex items-center justify-center space-x-3 bg-[#FF6B00] text-white py-4 rounded-full shadow-xl hover:bg-[#E66000] active:scale-95 transition-all duration-300"
          >
            <ShoppingBag size={20} strokeWidth={2.5} />
            <span className="text-[12px] font-bold uppercase tracking-widest whitespace-nowrap">Add to Cart</span>
          </button>
        </div>

        {/* Success Animation Overlay */}
        <AnimatePresence>
          {isAdded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white/95 backdrop-blur-sm z-30 flex flex-col items-center justify-center text-center p-6"
            >
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <CheckCircle2 size={60} className="text-[#FF6B00] mb-4" />
              </motion.div>
              <motion.h4
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-[#1A1A1A] font-fashion font-bold text-lg mb-1"
              >
                Added to Cart!
              </motion.h4>
              <motion.p
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-gray-500 text-xs font-medium"
              >
                {name} successfully added.
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-6 px-2">
        <Link to={`/product/${slug}`}>
          <h3 className="text-base font-fashion font-semibold text-[#1A1A1A] hover:text-[#FF6B00] transition-colors line-clamp-1 mb-2">{name}</h3>
        </Link>
        <div className="flex items-center justify-between">
          <p className="text-[#FF6B00] font-bold text-xl">
            ₹{typeof price === 'number' ? price.toLocaleString('en-IN') : price}
          </p>
          <div className="flex items-center space-x-1 text-[#1A1A1A]">
            <Star size={14} fill="currentColor" className="text-[#FF6B00]" />
            <span className="text-[12px] font-bold">{rating}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}



