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
      await addToCart(user, product);
      setIsAdded(true);
    } catch (error) {
      console.error("Cart Error:", error);
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
          price: product.price,
          image: product.image || (product.images && product.images[0]) || '',
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
      <div className="h-screen flex items-center justify-center bg-[#FDFBF7]">
        <Loader2 className="w-12 h-12 animate-spin text-brand-orange" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#FDFBF7] p-6 text-center">
        <h2 className="text-3xl font-fashion font-bold text-[#1A1A1A] mb-4">Treasure Not Found</h2>
        <button onClick={() => navigate('/shop')} className="btn btn-primary px-12">Return to Shop</button>
      </div>
    );
  }

  const images = product.images || [product.image];

  return (
    <div className="bg-[#FDFBF7] h-screen overflow-hidden font-sans">
      <div className="max-w-[1500px] mx-auto px-8 h-full flex flex-col py-6">
        
        {/* Navigation - Ultra Clean */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={goBack} className="flex items-center gap-2 text-[10px] font-bold text-gray-400 hover:text-black transition-all group uppercase tracking-[0.2em]">
            <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
            Back
          </button>
          <nav className="flex items-center space-x-2 text-[8px] tracking-[0.3em] uppercase font-bold text-gray-400">
            <Link to="/" className="hover:text-brand-orange transition-colors">Home</Link>
            <ChevronRight size={8} className="text-gray-300" />
            <span className="text-[#1A1A1A]">{product.name}</span>
          </nav>
        </div>

        {/* Unified One-Row Layout */}
        <div className="flex-1 min-h-0 flex gap-12 bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100/50 overflow-hidden">
          
          {/* Section 1: Thumbnails (Left) */}
          <div className="flex flex-col gap-4 w-20 flex-shrink-0 py-2">
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 pr-1">
              {images.map((img, idx) => (
                <button 
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`relative aspect-[3/4] rounded-2xl overflow-hidden border-2 transition-all ${
                    activeImage === idx ? 'border-brand-orange shadow-md scale-105' : 'border-gray-50 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Section 2: Main Image (Middle) */}
          <div className="relative w-[40%] flex-shrink-0 h-full rounded-[2.5rem] overflow-hidden bg-[#F9F8F6] border border-gray-100 group shadow-lg flex items-center justify-center p-6">
            <motion.img 
              key={activeImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              src={images[activeImage]} 
              alt={product.name} 
              className="w-full h-full object-contain" 
            />

            <button 
              onClick={handleWishlist}
              className={`absolute top-8 right-8 p-4 rounded-full shadow-2xl transition-all active:scale-90 ${
                isWishlisted ? 'bg-white text-red-500' : 'bg-white/80 backdrop-blur-sm text-gray-400 hover:text-red-500'
              }`}
            >
              <Heart size={20} fill={isWishlisted ? "currentColor" : "none"} />
            </button>
          </div>

          {/* Section 3: Details (Right) */}
          <div className="flex-1 flex flex-col h-full overflow-y-auto no-scrollbar pt-2">
            <div className="mb-8">
              <h1 className="text-3xl font-fashion font-bold text-[#1A1A1A] mb-2 leading-tight tracking-tight">
                {product.name}
              </h1>
              <p className="text-xs italic font-medium text-gray-500 mb-6 font-fashion">
                {product.subtitle || 'with Unstitched Blouse Piece'}
              </p>
              
              <div className="flex items-center gap-6 mb-8">
                <div className="flex items-center gap-1.5 bg-[#FDFBF7] px-3 py-1 rounded-full border border-orange-100">
                  <Star size={12} fill="#F97316" className="text-brand-orange" />
                  <span className="text-xs font-black text-[#1A1A1A]">{product.rating || 4.8}</span>
                </div>
                <div className="h-4 w-px bg-gray-200" />
                <span className="text-[9px] font-bold uppercase tracking-widest text-green-600">Premium Stock</span>
                <div className="h-4 w-px bg-gray-200" />
                <button className="text-[9px] font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors flex items-center gap-2">
                  <Share2 size={10} /> Share
                </button>
              </div>

              <div className="flex items-baseline gap-4 mb-8">
                <span className="text-4xl font-bold text-[#1A1A1A]">₹{product.price.toLocaleString('en-IN')}</span>
                <span className="text-base text-gray-400 line-through font-medium">₹{(product.price * 2).toLocaleString('en-IN')}</span>
                <span className="text-[9px] font-black text-red-500 uppercase tracking-[0.2em] ml-2">Flat 50% Off</span>
              </div>

              <p className="text-gray-500 text-sm leading-relaxed mb-8 font-medium">
                {product.description || "A masterpiece of artisanal craftsmanship, each thread tells a story of heritage and handcrafted excellence."}
              </p>

              {/* Specs Grid */}
              <div className="grid grid-cols-3 gap-4 py-6 border-y border-gray-100 mb-10">
                <div>
                  <p className="text-[8px] font-black uppercase text-gray-400 mb-1">Fabric</p>
                  <p className="text-xs font-bold text-[#1A1A1A]">{product.fabric || 'Pure Silk'}</p>
                </div>
                <div>
                  <p className="text-[8px] font-black uppercase text-gray-400 mb-1">Craft</p>
                  <p className="text-xs font-bold text-[#1A1A1A]">{product.craft || 'Woven'}</p>
                </div>
                <div>
                  <p className="text-[8px] font-black uppercase text-gray-400 mb-1">Occasion</p>
                  <p className="text-xs font-bold text-[#1A1A1A]">{product.occasion || 'Festive'}</p>
                </div>
              </div>
            </div>

            {/* Sticky Actions - Updated to Brand Orange */}
            <div className="mt-auto space-y-6">
              <div className="flex items-center justify-between bg-[#FDFBF7] p-4 rounded-2xl">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1A1A1A]">Quantity</span>
                <div className="flex items-center bg-white rounded-xl shadow-sm p-1 border border-gray-100">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-1.5 text-gray-400 hover:text-black"><Minus size={14} /></button>
                  <span className="w-10 text-center font-bold text-base">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="p-1.5 text-gray-400 hover:text-black"><Plus size={14} /></button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={handleAddToCart}
                  disabled={adding}
                  className="flex items-center justify-center gap-2 bg-white border-2 border-brand-orange text-brand-orange py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-brand-orange-light transition-all active:scale-95"
                >
                  {adding ? <Loader2 className="animate-spin" size={14} /> : <ShoppingBag size={16} />}
                  Add to Bag
                </button>
                <button className="py-4 bg-brand-orange text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-brand-orange-dark transition-all active:scale-95 shadow-lg shadow-brand-orange/10">
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Minimal Success Msg */}
        <AnimatePresence>
          {isAdded && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="fixed bottom-12 right-12 z-50 p-4 bg-white shadow-2xl rounded-3xl border border-gray-100 flex items-center gap-4"
            >
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                <CheckCircle2 size={20} />
              </div>
              <p className="text-[10px] font-bold text-[#1A1A1A] uppercase tracking-widest pr-4">Added to Bag</p>
              <button onClick={() => navigate('/cart')} className="px-4 py-2 bg-[#1A1A1A] text-white rounded-xl text-[8px] font-black uppercase">View</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
