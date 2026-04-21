import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Heart, Star, CheckCircle2 } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase';
import { doc, getDoc, setDoc, updateDoc, deleteDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';

export default function ProductCard({ id, slug, name, price, image, rating = 4.8 }) {
  const [isAdded, setIsAdded] = useState(false);
  const { user } = useAuth();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Listen for wishlist status
  useEffect(() => {
    if (!user) {
      setIsWishlisted(false);
      return;
    }

    const wishItemRef = doc(db, 'users', user.uid, 'wishlist', id.toString());
    const unsubscribe = onSnapshot(wishItemRef, (doc) => {
      setIsWishlisted(doc.exists());
    });

    return () => unsubscribe();
  }, [user, id]);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      navigate('/login', { state: { from: location } });
      return;
    }

    try {
      const cartItemRef = doc(db, 'users', user.uid, 'cart', id.toString());
      const cartItemSnap = await getDoc(cartItemRef);

      if (cartItemSnap.exists()) {
        await updateDoc(cartItemRef, {
          qty: cartItemSnap.data().qty + 1,
          updatedAt: serverTimestamp()
        });
      } else {
        await setDoc(cartItemRef, {
          id, slug, name, price, image,
          qty: 1,
          addedAt: serverTimestamp()
        });
      }

      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2000);
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate('/login', { state: { from: location } });
      return;
    }

    try {
      const wishItemRef = doc(db, 'users', user.uid, 'wishlist', id.toString());
      
      if (isWishlisted) {
        await deleteDoc(wishItemRef);
      } else {
        await setDoc(wishItemRef, {
          id, slug, name, price, image,
          rating,
          addedAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
    }
  };


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative"
    >
      <div className="relative aspect-[1/1.1] overflow-hidden bg-brand-gray rounded-[3rem]">
        <Link to={`/product/${slug}`}>
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
          />
        </Link>

        {/* Wishlist Icon */}
        <button 
          onClick={handleWishlist}
          className={`absolute top-6 right-6 p-2.5 rounded-full shadow-md transition-all duration-300 z-20 ${
            isWishlisted 
              ? 'bg-red-50 text-red-500' 
              : 'bg-white text-text-main hover:bg-brand-orange hover:text-white'
          }`}
        >
          <Heart size={18} strokeWidth={2} fill={isWishlisted ? "currentColor" : "none"} />
        </button>

        {/* Add to Cart - Orange Pill (Always visible on mobile, hover on desktop) */}
        <div className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 md:translate-y-12 md:opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 z-10 w-full px-4 md:px-8">
          <button
            onClick={handleAddToCart}
            className="w-full flex items-center justify-center space-x-2 md:space-x-3 bg-brand-orange text-white py-3 md:py-4 rounded-full shadow-xl hover:bg-brand-orange-dark active:scale-95 transition-all duration-300"
          >
            <ShoppingBag size={18} className="md:w-5 md:h-5" strokeWidth={2.5} />
            <span className="text-[9px] md:text-[12px] font-bold uppercase tracking-widest whitespace-nowrap">Add to Cart</span>
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
                <CheckCircle2 size={60} className="text-brand-orange mb-4" />
              </motion.div>
              <motion.h4
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-text-main font-fashion font-bold text-lg mb-1"
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
          <h3 className="text-sm md:text-base font-fashion font-semibold text-text-main hover:text-brand-orange transition-colors line-clamp-1 mb-1 md:mb-2">{name}</h3>
        </Link>
        <div className="flex items-center justify-between">
          <p className="text-brand-orange font-bold text-lg md:text-xl">
            ₹{typeof price === 'number' ? price.toLocaleString('en-IN') : price}
          </p>
          <div className="flex items-center space-x-1 text-text-main">
            <Star size={12} fill="currentColor" className="text-brand-orange md:w-3.5 md:h-3.5" />
            <span className="text-[10px] md:text-[12px] font-bold">{rating}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}



