import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Navigate, Link } from 'react-router-dom';
import { useGoBack } from '../../hooks/useGoBack';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, 
  ChevronRight, 
  Star, 
  Heart, 
  CheckCircle2, 
  Loader2, 
  ArrowLeft, 
  ArrowRight,
  Share2,
  Minus,
  Plus
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase';
import { doc, getDoc, setDoc, updateDoc, deleteDoc, serverTimestamp, onSnapshot, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { addToCart } from '../../utils/cartUtils';
import ProductCard from '../../components/user/ProductCard';
import toast from 'react-hot-toast';

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const goBack = useGoBack();
  const location = useLocation();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [alreadyInBag, setAlreadyInBag] = useState(false);
  const [adding, setAdding] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(true);
  
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

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

  useEffect(() => {
    if (!user || !product) {
      setAlreadyInBag(false);
      return;
    }
    const cartItemRef = doc(db, 'users', user.uid, 'cart', product.id.toString());
    const unsubscribe = onSnapshot(cartItemRef, (docSnap) => {
      setAlreadyInBag(docSnap.exists());
    });
    return () => unsubscribe();
  }, [user, product]);

  // Fetch Related Products
  useEffect(() => {
    if (!product) return;

    const fetchRelated = async () => {
      setRelatedLoading(true);
      try {
        const qCat = query(
          collection(db, 'products'),
          where('categoryId', '==', product.categoryId || '')
        );
        const snapCat = await getDocs(qCat);
        let related = snapCat.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(p => p.id !== product.id);

        setRelatedProducts(related.slice(0, 4));
      } catch (error) {
        console.error("Error fetching related products:", error);
      } finally {
        setRelatedLoading(false);
      }
    };

    fetchRelated();
  }, [product]);

  const handleAddToCart = async () => {
    if (!user || !product) {
      navigate('/login', { state: { from: location } });
      return;
    }

    setAdding(true);
    try {
      await addToCart(user, product, quantity);
      setIsAdded(true);
      // Auto-hide success message after 3 seconds
      setTimeout(() => setIsAdded(false), 3000);
    } catch (error) {
      console.error("Cart Error:", error);
    } finally {
      setAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (!user || !product) {
      navigate('/login', { state: { from: location } });
      return;
    }

    setAdding(true);
    try {
      // Pass the specific item to checkout without necessarily adding it to the permanent cart collection
      navigate('/checkout', { 
        state: { 
          buyNowItem: {
            id: product.id,
            name: product.name,
            price: product.discountedPrice || product.price || 0,
            image: product.image || (product.images && product.images[0]) || '',
            qty: quantity,
            isDirectBuy: true
          } 
        } 
      });
    } catch (error) {
      console.error("Buy Now Error:", error);
    } finally {
      setAdding(false);
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
          name: product.name,
          price: product.discountedPrice || product.price || 0,
          image: product.image || (product.images && product.images[0]) || '',
          rating: product.rating || 4.8,
          addedAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: product.name,
      text: `Check out this exquisite artisanal piece: ${product.name}`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error("Error sharing:", err);
          toast.error("Failed to share product.");
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Product link copied to clipboard!");
      } catch (err) {
        toast.error("Failed to copy link.");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
        <Loader2 className="w-12 h-12 animate-spin text-brand-orange" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFBF7] p-6 text-center">
        <h2 className="text-3xl font-sans font-bold text-[#1A1A1A] mb-4">Treasure Not Found</h2>
        <button onClick={() => navigate('/shop')} className="btn btn-primary px-12">Return to Shop</button>
      </div>
    );
  }

  const images = product.images || [product.image];

  return (
    <div className="bg-[#FDFBF7] min-h-screen font-sans scroll-smooth relative">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        
        {/* Navigation - Responsive */}
        <div className="flex items-center justify-end mb-4 lg:mb-6 px-2">
          <nav className="flex items-center space-x-2 text-[8px] tracking-[0.3em] uppercase font-bold text-gray-400 overflow-hidden whitespace-nowrap">
            <Link to="/" className="hover:text-brand-orange transition-colors">Home</Link>
            <ChevronRight size={8} className="text-gray-300 flex-shrink-0" />
            <span className="text-[#1A1A1A] truncate max-w-[150px] sm:max-w-none">{product.name}</span>
          </nav>
        </div>

        {/* Responsive Layout Section */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 bg-white p-4 sm:p-6 lg:p-8 rounded-3xl shadow-sm border border-gray-100/50 mb-8 lg:mb-12">
          
          {/* Section 1: Gallery */}
          <div className="flex flex-col-reverse lg:flex-row gap-4 lg:gap-6 lg:w-[48%] flex-shrink-0">
            <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto custom-scrollbar lg:w-24 lg:max-h-[500px] flex-shrink-0 py-1 scroll-smooth">
              {images.map((img, idx) => (
                <button 
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`relative w-20 lg:w-full aspect-[2/3] overflow-hidden transition-all duration-300 flex-shrink-0 ${
                    activeImage === idx 
                    ? 'ring-2 ring-brand-orange ring-offset-2 opacity-100 shadow-md' 
                    : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            <div className="relative flex-1 aspect-square rounded-2xl lg:rounded-3xl overflow-hidden bg-[#F9F8F6] border border-gray-100 group shadow-md flex items-center justify-center p-3 sm:p-4">
              <div className="w-full h-full relative">
                 <motion.img 
                    key={activeImage}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    src={images[activeImage]} 
                    alt={product.name} 
                    className="w-full h-full object-contain" 
                 />
              </div>
              
              <button 
                onClick={handleWishlist}
                className={`absolute top-4 right-4 p-2.5 rounded-full shadow-xl transition-all active:scale-90 ${
                  isWishlisted ? 'bg-white text-red-500' : 'bg-white/80 backdrop-blur-sm text-gray-400 hover:text-red-500'
                }`}
              >
                <Heart size={18} fill={isWishlisted ? "currentColor" : "none"} />
              </button>
            </div>
          </div>

          {/* Section 2: Details */}
          <div className="flex-1 flex flex-col pt-1 min-w-0">
            <div className="mb-4 sm:mb-6">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-sans font-bold text-[#1A1A1A] mb-1.5 leading-tight tracking-tight">
                {product.name}
              </h1>
              <p className="text-[10px] sm:text-xs italic font-medium text-gray-500 mb-4 font-sans">
                {product.subtitle || 'Exquisite Artisanal Piece'}
              </p>
              
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="flex items-center gap-1 bg-[#FDFBF7] px-2.5 py-0.5 rounded-full border border-orange-100">
                  <Star size={10} fill="#F97316" className="text-brand-orange" />
                  <span className="text-[10px] font-black text-[#1A1A1A]">{product.rating || 4.8}</span>
                </div>
                <div className="h-3 w-px bg-gray-200" />
                <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-widest text-green-600">Premium Stock</span>
                <div className="h-3 w-px bg-gray-200 hidden sm:block" />
                {product.productType === 'Unique' && (
                  <>
                    <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-widest text-[#1BAFAF] bg-[#1BAFAF]/10 px-2 py-0.5 rounded-full">Unique Piece</span>
                    <div className="h-3 w-px bg-gray-200 hidden sm:block" />
                  </>
                )}
                <button 
                  onClick={handleShare}
                  className="text-[8px] sm:text-[9px] font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors flex items-center gap-1.5"
                >
                  <Share2 size={10} /> Share
                </button>
              </div>

              <div className="flex items-baseline gap-3 mb-4 sm:mb-6">
                <span className="text-2xl sm:text-3xl font-bold text-[#1A1A1A]">₹{(product.discountedPrice || product.price || 0).toLocaleString('en-IN')}</span>
                {Number(product.actualPrice || 0) > Number(product.discountedPrice || product.price || 0) && (
                  <>
                    <span className="text-xs sm:text-sm text-gray-400 line-through font-medium">₹{Number(product.actualPrice || 0).toLocaleString('en-IN')}</span>
                    <span className="text-[8px] sm:text-[9px] font-black text-red-500 uppercase tracking-[0.2em] ml-2">
                      {Math.round(((product.actualPrice - (product.discountedPrice || product.price)) / product.actualPrice) * 100)}% Off
                    </span>
                  </>
                )}
              </div>

              <p className="text-gray-500 text-xs sm:text-sm leading-relaxed mb-4 sm:mb-6 font-medium">
                {product.description || "A masterpiece of artisanal craftsmanship, each thread tells a story of heritage and handcrafted excellence."}
              </p>

              {/* Specs Grid */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4 py-4 border-y border-gray-100 mb-6 lg:mb-8">
                <div>
                  <p className="text-[7px] sm:text-[8px] font-black uppercase text-gray-400 mb-0.5">Fabric</p>
                  <p className="text-[10px] sm:text-xs font-bold text-[#1A1A1A] truncate">{product.fabric || 'Pure Silk'}</p>
                </div>
                <div>
                  <p className="text-[7px] sm:text-[8px] font-black uppercase text-gray-400 mb-0.5">Craft</p>
                  <p className="text-[10px] sm:text-xs font-bold text-[#1A1A1A] truncate">{product.craft || 'Woven'}</p>
                </div>
                <div>
                  <p className="text-[7px] sm:text-[8px] font-black uppercase text-gray-400 mb-0.5">Occasion</p>
                  <p className="text-[10px] sm:text-xs font-bold text-[#1A1A1A] truncate">{product.occasion || 'Festive'}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-4 sm:space-y-6 mt-auto">
              <div className="flex items-center justify-between bg-[#FDFBF7] p-3 sm:p-4 rounded-2xl border border-orange-50">
                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-[#1A1A1A]">Quantity</span>
                <div className="flex items-center bg-white rounded-xl shadow-sm p-1 border border-gray-100">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-1.5 text-gray-400 hover:text-black transition-colors"><Minus size={14} /></button>
                  <span className="w-8 sm:w-12 text-center font-bold text-sm sm:text-base">{quantity}</span>
                  <button 
                    onClick={() => product.productType !== 'Unique' && setQuantity(quantity + 1)} 
                    disabled={product.productType === 'Unique'}
                    className={`p-1.5 transition-colors ${product.productType === 'Unique' ? 'text-gray-200 cursor-not-allowed' : 'text-gray-400 hover:text-black'}`}
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <button
                  onClick={alreadyInBag ? () => navigate('/cart') : handleAddToCart}
                  disabled={adding}
                  className={`flex items-center justify-center gap-2 py-3.5 sm:py-4 rounded-2xl font-black text-[9px] sm:text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 ${
                    alreadyInBag 
                    ? 'bg-[#1A1A1A] text-white hover:bg-black shadow-lg shadow-black/10' 
                    : 'bg-white border-2 border-brand-orange text-brand-orange hover:bg-brand-orange-light'
                  }`}
                >
                  {adding ? <Loader2 className="animate-spin" size={14} /> : alreadyInBag ? <CheckCircle2 size={16} /> : <ShoppingBag size={16} />}
                  {alreadyInBag ? 'Go to Bag' : 'Add to Bag'}
                </button>
                <button 
                  onClick={handleBuyNow}
                  disabled={adding}
                  className="py-3.5 sm:py-4 bg-brand-orange text-white rounded-2xl font-black text-[9px] sm:text-[10px] uppercase tracking-[0.2em] hover:bg-brand-orange-dark transition-all active:scale-95 shadow-md shadow-brand-orange/10 flex items-center justify-center gap-2"
                >
                  {adding ? <Loader2 className="animate-spin" size={14} /> : 'Buy Now'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Section: Related Products */}
        {!relatedLoading && relatedProducts.length > 0 && (
          <div className="mt-8 sm:mt-12 lg:mt-16">
            <div className="flex items-center justify-between mb-6 sm:mb-10 px-2">
              <div>
                <h2 className="text-xl sm:text-2xl font-sans font-bold text-[#1A1A1A] mb-2 uppercase tracking-tighter">You May Also Love</h2>
                <div className="w-16 h-1 bg-brand-orange rounded-full" />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {relatedProducts.map((p) => (
                <motion.div 
                  key={p.id}
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <ProductCard {...p} />
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Success Pop Message - Mobile Optimized */}
        <AnimatePresence>
          {isAdded && (
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="fixed bottom-10 left-10 z-50 px-4 py-2 bg-white text-brand-orange shadow-xl rounded-xl flex items-center gap-2 border border-brand-orange"
            >
              <CheckCircle2 size={16} className="text-brand-orange flex-shrink-0" />
              <p className="text-[9px] font-black uppercase tracking-[0.15em]">Added to Bag</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
