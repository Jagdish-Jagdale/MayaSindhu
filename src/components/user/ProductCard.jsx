import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Heart, Star, CheckCircle2 } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase';
import { doc, getDoc, setDoc, updateDoc, deleteDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { addToCart } from '../../utils/cartUtils';
import { getProductPath } from '../../utils/productUtils';
import toast from 'react-hot-toast';

export default function ProductCard({ id, productId, slug, name, price, discountedPrice, image, imageUrl, images, rating, showWishlist = true, stock, isUniquePiece, productType, reviewCount }) {
  const displayPrice = discountedPrice || price || 0;
  const displayImage = image || imageUrl || (images && images.length > 0 ? images[0] : '');
  const [isAdded, setIsAdded] = useState(false);
  const { user } = useAuth();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isInCart, setIsInCart] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isUnique = isUniquePiece === true || productType === 'Unique';
  const stockVal = typeof stock === 'number' ? stock : (isUnique ? 1 : 15);

  // Listen for wishlist and cart status
  useEffect(() => {
    if (!user) {
      setIsWishlisted(false);
      setIsInCart(false);
      return;
    }

    const docId = id?.toString();
    if (!docId) return;

    const wishItemRef = doc(db, 'users', user.uid, 'wishlist', docId);
    const unsubWishlist = onSnapshot(wishItemRef, (doc) => {
      setIsWishlisted(doc.exists());
    });

    const cartItemRef = doc(db, 'users', user.uid, 'cart', docId);
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

    const docId = id?.toString();
    if (!docId) {
      console.error("Cart: Operation failed - Product ID is missing.");
      return;
    }

    try {
      await addToCart(user, { id, productId: productId || '', slug, name, price: displayPrice, image, images });
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

    const docId = id?.toString();
    if (!docId) {
      console.error("Wishlist: Operation failed - Product ID is missing.");
      return;
    }

    try {
      console.log(`Wishlist: Toggling Product [${docId}] for User [${user.uid}]`);
      const wishItemRef = doc(db, 'users', user.uid, 'wishlist', docId);

      if (isWishlisted) {
        await deleteDoc(wishItemRef);
        console.log("Wishlist: Item removed.");
      } else {
        await setDoc(wishItemRef, {
          id: docId,
          productId: productId || '',
          slug: slug || docId,
          name: name || 'Handcrafted Treasure',
          price: displayPrice,
          image: image || imageUrl || (images && images[0]) || '',
          rating: rating || 4.8,
          addedAt: serverTimestamp()
        });
        console.log("Wishlist: Item added.");
      }
    } catch (error) {
      console.error("Wishlist Error:", error);
    }
  };

  const handleNotifyMe = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.error("Please login to request restock notification");
      navigate('/login', { state: { from: location } });
      return;
    }
    toast.success("Notification request registered! We'll alert you via email when back in stock.");
  };


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-[#F9F8F6] rounded-2xl shadow-sm hover:shadow-xl transition-shadow duration-500 flex items-center justify-center p-2">
        <Link to={getProductPath(productId || id, name, slug)} className="w-full h-full">
          <img
            src={displayImage}
            alt={name}
            className="w-full h-full object-contain transition-transform duration-[2000ms] ease-out group-hover:scale-105"
          />
        </Link>

        {stockVal === 0 && (
          <>
            <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] flex items-center justify-center pointer-events-none z-10">
              <span className="text-[#DC2626] font-black text-sm md:text-base tracking-widest uppercase text-center px-4">
                {isUnique ? "SOLD OUT" : "OUT OF STOCK"}
              </span>
            </div>
            <div className="absolute bottom-4 md:bottom-6 left-0 right-0 md:translate-y-10 md:opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700 ease-out z-20 px-2 md:px-3">
              <button
                onClick={handleNotifyMe}
                className="w-full flex items-center justify-center backdrop-blur-md border text-white py-2.5 md:py-3 rounded-2xl shadow-2xl active:scale-95 transition-all duration-500 bg-black/30 hover:bg-white hover:text-brand-black border-white/30 cursor-pointer"
              >
                <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.15em] whitespace-nowrap">
                  Notify Me
                </span>
              </button>
            </div>
          </>
        )}

        {showWishlist && (
          <button
            onClick={handleWishlist}
            className={`absolute top-3 right-3 md:top-5 md:right-5 p-2.5 rounded-full transition-all duration-300 z-20 shadow-md active:scale-90 group/wishlist ${isWishlisted
              ? 'bg-white text-red-500'
              : 'bg-white/90 backdrop-blur-sm text-[#1A1A1A] hover:bg-white hover:shadow-lg'
              }`}
          >
            <Heart size={16} strokeWidth={2.5} fill={isWishlisted ? "currentColor" : "none"} className="transition-transform group-hover/wishlist:scale-110" />
          </button>
        )}

        {/* Actions - Buy Now & Add to Cart */}
        {stockVal > 0 && (
          <div className="absolute bottom-4 md:bottom-6 left-0 right-0 md:translate-y-10 md:opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700 ease-out z-10 px-2 md:px-3">
          <div className="flex flex-row gap-1 md:gap-1.5">
            <button
              disabled={stockVal === 0 && !isInCart}
              onClick={isInCart ? (e) => { e.preventDefault(); e.stopPropagation(); navigate('/cart'); } : handleAddToCart}
              className={`flex-1 flex items-center justify-center space-x-1 md:space-x-2 backdrop-blur-md border text-white py-2.5 md:py-3 rounded-2xl shadow-2xl active:scale-95 transition-all duration-500 ${
                isInCart 
                ? 'bg-brand-orange hover:bg-brand-orange-dark border-brand-orange/30' 
                : (stockVal === 0 
                   ? 'bg-gray-400/50 hover:bg-gray-400/50 border-gray-400/20 cursor-not-allowed opacity-50' 
                   : 'bg-black/30 hover:bg-white hover:text-brand-black border-white/30')
              }`}
            >
              <ShoppingBag size={12} className="md:w-3.5 md:h-3.5" strokeWidth={2} />
              <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-[0.1em] whitespace-nowrap">
                {stockVal === 0 && !isInCart ? "Sold Out" : (isInCart ? "In Bag" : "Add")}
              </span>
            </button>
            <button
              disabled={stockVal === 0}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!user) {
                  navigate('/login', { state: { from: location } });
                  return;
                }
                navigate('/checkout', { 
                  state: { 
                    buyNowItem: {
                      id: id,
                      slug: slug || id,
                      name: name,
                      price: displayPrice,
                      image: displayImage,
                      qty: 1,
                      isDirectBuy: true,
                      isUniquePiece: isUniquePiece,
                      productType: productType
                    } 
                  } 
                });
              }}
              className={`flex-1 flex items-center justify-center space-x-1 md:space-x-2 py-2.5 md:py-3 rounded-2xl shadow-2xl active:scale-95 transition-all duration-500 ${
                stockVal === 0 
                ? 'bg-gray-400/50 text-white/80 cursor-not-allowed opacity-50 border border-gray-400/20' 
                : 'bg-brand-orange hover:bg-brand-orange-dark text-white border border-brand-orange/30'
              }`}
            >
              <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-[0.1em] whitespace-nowrap">
                {stockVal === 0 ? "Sold Out" : "Buy Now"}
              </span>
            </button>
          </div>
        </div>
        )}

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
                className="text-text-main font-sans font-bold text-lg mb-1"
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
        <Link to={getProductPath(productId || id, name, slug)}>
          <h3 className="text-sm md:text-[15px] tracking-wide font-sans text-text-main hover:text-brand-orange transition-colors line-clamp-1 mb-1.5">{name}</h3>
        </Link>
        <div className="flex items-center justify-between">
          <p className="text-brand-orange font-bold text-lg md:text-xl">
            ₹{displayPrice.toLocaleString('en-IN')}
          </p>
          {reviewCount > 0 && (
            <div className="flex items-center space-x-1 text-text-main">
              <Star size={12} fill="currentColor" className="text-brand-orange md:w-3.5 md:h-3.5" />
              <span className="text-[10px] md:text-[12px] font-bold">{rating}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}



