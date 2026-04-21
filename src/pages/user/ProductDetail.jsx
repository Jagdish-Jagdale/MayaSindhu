import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, ChevronRight, Star, Heart, CheckCircle2, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase';
import { doc, getDoc, setDoc, updateDoc, deleteDoc, serverTimestamp, onSnapshot, collection, query, where, getDocs } from 'firebase/firestore';

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdded, setIsAdded] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Fetch Product by Slug
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, 'products'), where('slug', '==', slug));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          setProduct({ id: doc.id, ...doc.data() });
        } else {
          // Attempt to fetch by ID (fallback for old system)
          const docRef = doc(db, 'products', slug);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setProduct({ id: docSnap.id, ...docSnap.data() });
          }
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

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

  const handleAddToCart = async () => {
    if (!user || !product) {
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
          slug: product.slug || product.id,
          name: product.name || 'Handcrafted Treasure',
          price: product.price || 0,
          image: product.image || '',
          qty: 1,
          addedAt: serverTimestamp()
        });
      }

      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2000);
    } catch (error) {
      console.error("Cart Error:", error);
      alert(`Database Vault Error: ${error.code || error.message}. Please check your Firebase permissions.`);
    }
  };

  const handleWishlist = async () => {
    if (!user || !product) {
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
          slug: product.slug || product.id,
          name: product.name || 'Handcrafted Treasure',
          price: product.price || 0,
          image: product.image || '',
          rating: product.rating || 4.8,
          addedAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6]">
        <Loader2 className="w-12 h-12 animate-spin text-brand-orange" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF9F6] p-6 text-center">
        <h2 className="text-3xl font-fashion font-bold text-[#1A1A1A] mb-4">Treasure Not Found</h2>
        <p className="text-gray-500 mb-8">The artisanal piece you are looking for may have been moved or archived.</p>
        <button onClick={() => navigate('/shop')} className="btn btn-primary px-12">Return to Shop</button>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF9F6] min-h-screen pt-32 pb-24 font-sans">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-[10px] tracking-[0.4em] uppercase font-bold text-gray-400 mb-12">
          <a href="/" className="hover:text-brand-orange transition-colors">Home</a>
          <ChevronRight size={10} />
          <a href="/shop" className="hover:text-brand-orange transition-colors">The Collection</a>
          <ChevronRight size={10} />
          <span className="text-[#1A1A1A]">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
          {/* Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4 relative"
          >
            <div className="aspect-[4/5] overflow-hidden bg-brand-gray rounded-[4rem] shadow-2xl relative group">
              <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/5 pointer-events-none" />
            </div>

            {/* Success Animation Overlay */}
            <AnimatePresence>
              {isAdded && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-white/95 backdrop-blur-sm z-30 flex flex-col items-center justify-center text-center p-6 rounded-[4rem]"
                >
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <CheckCircle2 size={72} className="text-brand-orange mb-6" />
                  </motion.div>
                  <motion.h4
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-[#1A1A1A] font-fashion font-bold text-3xl mb-2"
                  >
                    In Your Bag!
                  </motion.h4>
                  <motion.p
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-gray-500 font-medium"
                  >
                    {product.name} added successfully.
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
            <span className="text-[12px] font-bold tracking-[0.4em] uppercase text-brand-orange mb-6 block">
              {product.collection || 'Heritage Series'}
            </span>
            <h1 className="text-4xl md:text-6xl font-fashion font-bold text-[#1A1A1A] mb-8 leading-[1.1] tracking-tight">
              {product.name}
            </h1>

            <div className="flex items-center space-x-6 mb-10 pb-10 border-b border-gray-100">
              <span className="text-3xl font-bold text-[#1A1A1A]">₹{product.price.toLocaleString('en-IN')}</span>
              <div className="h-6 w-px bg-gray-200" />
              <div className="flex items-center gap-2">
                <div className="flex text-brand-orange">
                  {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#1A1A1A]">4.9 (12 reviews)</span>
              </div>
            </div>

            <p className="text-gray-500 text-lg leading-relaxed mb-12">
              {product.description || "A masterpiece of artisanal craftsmanship, hand-finished with meticulous attention to detail."}
            </p>

            {product.details && (
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-16">
                {product.details.map((detail, i) => (
                  <li key={i} className="flex items-center text-xs font-bold text-gray-400 tracking-wide">
                    <div className="w-1.5 h-1.5 bg-brand-orange rounded-full mr-3 opacity-60" />
                    {detail}
                  </li>
                ))}
              </ul>
            )}

            <div className="flex flex-col sm:flex-row gap-6">
              <button 
                onClick={handleAddToCart}
                className="flex-grow bg-brand-orange text-white px-12 py-5 rounded-3xl flex items-center justify-center space-x-4 hover:shadow-2xl hover:shadow-brand-orange/20 transition-all active:scale-95 group shadow-xl shadow-brand-orange/10"
              >
                <ShoppingBag size={20} strokeWidth={2.5} className="group-hover:-translate-y-0.5 transition-transform" />
                <span className="tracking-[0.2em] font-black uppercase text-xs">Add to Bag</span>
              </button>

              <button 
                onClick={handleWishlist}
                className={`p-5 rounded-3xl border-2 transition-all active:scale-90 flex items-center justify-center ${
                  isWishlisted 
                    ? 'bg-red-50 border-red-100 text-red-500' 
                    : 'border-gray-100 text-gray-400 hover:border-gray-200 hover:text-[#1A1A1A]'
                }`}
              >
                <Heart size={24} strokeWidth={2} fill={isWishlisted ? "currentColor" : "none"} />
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
