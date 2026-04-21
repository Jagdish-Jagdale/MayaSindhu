import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, ChevronRight, Star, Heart, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { PRODUCTS } from '../../data/products';
import { db } from '../../firebase';
import { doc, getDoc, setDoc, updateDoc, deleteDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [isAdded, setIsAdded] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Listen for wishlist status
  useEffect(() => {
    if (!user || !product) {
      setIsWishlisted(false);
      return;
    }

    const wishItemRef = doc(db, 'users', user.uid, 'wishlist', product.id.toString());
    const unsubscribe = onSnapshot(wishItemRef, (docSnap) => {
      setIsWishlisted(docSnap.exists());
    });

    return () => unsubscribe();
  }, [user, product]);

  // 1. Try to find by slug
  let product = PRODUCTS.find(p => p.slug === slug);

  // 2. If not found, try to find by ID (in case of legacy links)
  if (!product && !isNaN(slug)) {
    const legacyProduct = PRODUCTS.find(p => p.id === parseInt(slug));
    if (legacyProduct) {
      // If found by ID, redirect to the slug-based URL immediately
      return <Navigate to={`/product/${legacyProduct.slug}`} replace />;
    }
  }

  // 3. Fallback to first product or 404 if absolutely nothing matches
  if (!product) product = PRODUCTS[0];

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login', { state: { from: location } });
      return;
    }

    try {
      const cartItemRef = doc(db, 'users', user.uid, 'cart', product.id.toString());
      const cartItemSnap = await getDoc(cartItemRef);

      if (cartItemSnap.exists()) {
        await updateDoc(cartItemRef, {
          qty: cartItemSnap.data().qty + 1,
          updatedAt: serverTimestamp()
        });
      } else {
        await setDoc(cartItemRef, {
          id: product.id,
          slug: product.slug,
          name: product.name,
          price: product.price,
          image: product.image,
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

  const handleWishlist = async () => {
    if (!user) {
      navigate('/login', { state: { from: location } });
      return;
    }

    try {
      const wishItemRef = doc(db, 'users', user.uid, 'wishlist', product.id.toString());
      
      if (isWishlisted) {
        await deleteDoc(wishItemRef);
      } else {
        await setDoc(wishItemRef, {
          id: product.id,
          slug: product.slug,
          name: product.name,
          price: product.price,
          image: product.image,
          rating: product.rating || 4.8,
          addedAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
    }
  };


  return (
    <div className="bg-brand-cream min-h-screen pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-[10px] tracking-widest uppercase text-brand-burgundy/40 mb-12">
          <a href="/" className="hover:text-brand-gold">Home</a>
          <ChevronRight size={10} />
          <a href="/shop" className="hover:text-brand-gold">Collections</a>
          <ChevronRight size={10} />
          <span className="text-brand-burgundy-dark">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4 relative"
          >
            <div className="aspect-[3/4] overflow-hidden bg-brand-cream-dark rounded-[3rem] shadow-2xl">
              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            </div>

            {/* Success Animation Overlay */}
            <AnimatePresence>
              {isAdded && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-white/95 backdrop-blur-sm z-30 flex flex-col items-center justify-center text-center p-6 rounded-[3rem]"
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
                    className="text-[#1A1A1A] font-fashion font-bold text-2xl mb-1"
                  >
                    Added to Cart!
                  </motion.h4>
                  <motion.p
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-gray-500 text-sm font-medium"
                  >
                    {product.name} successfully added.
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col justify-center"
          >
            <p className="text-xs font-bold tracking-[0.3em] uppercase text-brand-gold mb-4">{product.collection}</p>
            <h1 className="text-4xl md:text-5xl font-fashion text-brand-burgundy-dark mb-6 leading-tight">{product.name}</h1>

            <div className="flex items-center space-x-4 mb-8">
              <span className="text-2xl text-brand-burgundy tracking-wide">₹{product.price.toLocaleString()}</span>
              <div className="flex text-brand-gold">
                {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
              </div>
              <span className="text-xs text-brand-burgundy/40 uppercase tracking-widest">(12 Reviews)</span>
            </div>

            <p className="text-brand-burgundy/70 leading-relaxed font-sans mb-10 text-lg">
              {product.description}
            </p>

            <ul className="space-y-3 mb-12">
              {product.details.map((detail, i) => (
                <li key={i} className="flex items-center text-sm text-brand-burgundy-dark/80 font-sans">
                  <div className="w-1.5 h-1.5 bg-brand-gold rounded-full mr-3" />
                  {detail}
                </li>
              ))}
            </ul>

            <div className="flex flex-col md:flex-row gap-4">
              <button 
                onClick={handleAddToCart}
                className="btn btn-primary bg-brand-orange text-white flex-1 md:flex-none px-12 py-4 flex items-center justify-center space-x-4 hover:bg-brand-orange-dark transition-all shadow-xl active:scale-95"
              >
                <ShoppingBag size={20} />
                <span className="tracking-widest uppercase font-bold text-sm">Add to Bag</span>
              </button>

              <button 
                onClick={handleWishlist}
                className={`p-4 border-2 rounded-full transition-all active:scale-90 ${
                  isWishlisted 
                    ? 'bg-red-50 border-red-200 text-red-500' 
                    : 'border-brand-black/10 text-brand-black hover:bg-brand-black hover:text-white'
                }`}
              >
                <Heart size={24} fill={isWishlisted ? "currentColor" : "none"} />
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
