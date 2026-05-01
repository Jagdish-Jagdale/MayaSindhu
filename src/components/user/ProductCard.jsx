import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Heart, Star, CheckCircle2 } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase';
import { doc, getDoc, setDoc, updateDoc, deleteDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { addToCart } from '../../utils/cartUtils';

export default function ProductCard({ id, slug, name, price, image, images, rating = 4.8 }) {
  const displayImage = image || (images && images.length > 0 ? images[0] : '');
  const [isAdded, setIsAdded] = useState(false);
  const { user } = useAuth();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isInCart, setIsInCart] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Listen for wishlist and cart status
  useEffect(() => {
    if (!user) {
      setIsWishlisted(false);
      setIsInCart(false);
      return;
    }

    const productId = id?.toString();
    if (!productId) return;

    const wishItemRef = doc(db, 'users', user.uid, 'wishlist', productId);
    const unsubWishlist = onSnapshot(wishItemRef, (doc) => {
      setIsWishlisted(doc.exists());
    });

    const cartItemRef = doc(db, 'users', user.uid, 'cart', productId);
    const unsubCart = onSnapshot(cartItemRef, (doc) => {
      setIsInCart(doc.exists());
    });

    return () => {
      unsubWishlist();
      unsubCart();
    };
  }, [user, id]);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      console.log("Cart: Redirecting guest to login...");
      navigate('/login', { state: { from: location } });
      return;
    }

    const productId = id?.toString();
    if (!productId) {
      console.error("Cart: Operation failed - Product ID is missing.");
      return;
    }

    try {
      await addToCart(user, { id, slug, name, price, image, images });
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2000);
    } catch (error) {
      console.error("Cart Error:", error);
      alert(`Database Vault Error: ${error.code || error.message}. Please check your Firebase permissions.`);
    }
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      console.log("Wishlist: Redirecting guest to login...");
      navigate('/login', { state: { from: location } });
      return;
    }

    const productId = id?.toString();
    if (!productId) {
      console.error("Wishlist: Operation failed - Product ID is missing.");
      return;
    }

    try {
      console.log(`Wishlist: Toggling Product [${productId}] for User [${user.uid}]`);
      const wishItemRef = doc(db, 'users', user.uid, 'wishlist', productId);

      if (isWishlisted) {
        await deleteDoc(wishItemRef);
        console.log("Wishlist: Item removed.");
      } else {
        await setDoc(wishItemRef, {
          id: productId,
          slug: slug || productId,
          name: name || 'Handcrafted Treasure',
          price: price || 0,
          image: image || '',
          rating: rating || 4.8,
          addedAt: serverTimestamp()
        });
        console.log("Wishlist: Item added.");
      }
    } catch (error) {
      console.error("Wishlist Error:", error);
    }
  };


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative"
    >
      <div className="relative aspect-[1/1.1] overflow-hidden bg-brand-gray rounded-2xl shadow-sm hover:shadow-xl transition-shadow duration-500">
        <Link to={`/product/${slug || id}`}>
          <img
            src={displayImage}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-[2000ms] ease-out group-hover:scale-110"
          />
        </Link>

        {/* Wishlist Icon */}
        <button
          onClick={handleWishlist}
          className={`absolute top-4 right-4 md:top-6 md:right-6 p-2.5 rounded-full transition-all duration-500 z-20 shadow-sm hover:scale-110 ${isWishlisted
            ? 'bg-white text-red-500 shadow-md'
            : 'bg-white/70 backdrop-blur-md text-brand-black hover:bg-white'
            }`}
        >
          <Heart size={18} strokeWidth={2} fill={isWishlisted ? "currentColor" : "none"} />
        </button>

        {/* Add to Cart - Frosted Glass Pill (Always visible on mobile, hover on desktop) */}
        <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 md:translate-y-10 md:opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700 ease-out z-10 w-full px-6">
          <button
            onClick={isInCart ? (e) => { e.preventDefault(); e.stopPropagation(); navigate('/cart'); } : handleAddToCart}
            className={`w-full flex items-center justify-center space-x-2 backdrop-blur-md border border-white/30 text-white py-3.5 rounded-full shadow-2xl active:scale-95 transition-all duration-500 ${
              isInCart ? 'bg-brand-orange hover:bg-brand-orange-dark' : 'bg-black/30 hover:bg-white hover:text-brand-black'
            }`}
          >
            <ShoppingBag size={16} strokeWidth={2} />
            <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em] whitespace-nowrap">
              {isInCart ? "Go to Cart" : "Add to Cart"}
            </span>
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

      <div className="mt-5 px-1">
        <Link to={`/product/${slug || id}`}>
          <h3 className="text-sm md:text-[15px] tracking-wide font-fashion text-text-main hover:text-brand-orange transition-colors line-clamp-1 mb-1.5">{name}</h3>
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



