import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { addToCart } from '../../utils/cartUtils';
import { db } from '../../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { X, ChevronLeft, ChevronRight, ShoppingBag, Volume2, VolumeX, Share2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function VideoModal({ isOpen, onClose, look, onNext, onPrev }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [productData, setProductData] = useState(null);
  const [loadingProduct, setLoadingProduct] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [activeImgIdx, setActiveImgIdx] = useState(0);

  // Reset states when look changes
  useEffect(() => {
    setAddedToCart(false);
    setActiveImgIdx(0);
  }, [look?.id]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Fetch linked product data whenever the 'look' changes
  useEffect(() => {
    if (!look?.productId || !isOpen) {
      setProductData(null);
      return;
    }
    const fetchProd = async () => {
      setLoadingProduct(true);
      try {
        const docRef = doc(db, 'products', look.productId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProductData({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (error) {
        console.error("Error fetching product for look:", error);
      } finally {
        setLoadingProduct(false);
      }
    };
    fetchProd();
  }, [look?.productId, isOpen]);

  if (!isOpen || !look) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-auto overflow-hidden">
        {/* Cinematic Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/95 backdrop-blur-xl"
          onClick={onClose}
        />

        {/* Global Navigation Controls */}
        <div className="absolute top-6 right-6 flex items-center gap-6 z-[10001]">

          <button
            onClick={onClose}
            className="w-12 h-12 bg-white/10 hover:bg-red-500 text-white rounded-full flex items-center justify-center transition-all border border-white/10 shadow-lg group"
          >
            <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>

        {/* Navigation Arrows (Desktop) */}
        <button
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          className="absolute left-8 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/5 hover:bg-brand-orange text-white rounded-full flex items-center justify-center transition-all border border-white/5 z-[10001] hidden md:flex"
        >
          <ChevronLeft size={32} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          className="absolute right-8 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/5 hover:bg-brand-orange text-white rounded-full flex items-center justify-center transition-all border border-white/5 z-[10001] hidden md:flex"
        >
          <ChevronRight size={32} />
        </button>

        {/* Main Shoppable Story Container */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 40 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="relative w-full max-w-[850px] h-[90vh] md:h-[620px] flex flex-col md:flex-row pointer-events-auto m-4 bg-white rounded-xl overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Left Side: Video Section */}
          <div className="relative w-full md:w-[50%] h-[40%] md:h-full bg-black flex-shrink-0 group">
            <video
              src={look.url}
              autoPlay
              loop
              playsInline
              muted={isMuted}
              className="w-full h-full object-cover"
            />

            {/* Video Overlays */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/20 pointer-events-none" />
          </div>

          {/* Right Side: Product Narrative Section (White Theme) */}
          <div className="w-full md:w-[50%] h-[60%] md:h-full bg-white flex flex-col p-5 md:p-6 overflow-y-auto no-scrollbar relative">
            <AnimatePresence mode="wait">
              {productData ? (
                <motion.div
                  key={productData.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col h-full"
                >
                  {/* Product Image - Single View with Arrows */}
                  <div className="relative mb-4">
                    <div className="w-[55%] mx-auto aspect-[3/4] rounded-md overflow-hidden border border-gray-100 shadow-sm">
                      <img src={productData.images?.[activeImgIdx]} alt="" className="w-full h-full object-cover" />
                    </div>

                    {/* Left Arrow */}
                    {productData.images?.length > 1 && activeImgIdx > 0 && (
                      <button
                        onClick={() => setActiveImgIdx(prev => prev - 1)}
                        className="absolute left-1 top-1/2 -translate-y-1/2 w-7 h-7 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-600 transition-all shadow-sm"
                      >
                        <ChevronLeft size={16} />
                      </button>
                    )}

                    {/* Right Arrow */}
                    {productData.images?.length > 1 && activeImgIdx < productData.images.length - 1 && (
                      <button
                        onClick={() => setActiveImgIdx(prev => prev + 1)}
                        className="absolute right-1 top-1/2 -translate-y-1/2 w-7 h-7 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-600 transition-all shadow-sm"
                      >
                        <ChevronRight size={16} />
                      </button>
                    )}

                    {/* Indicator Dots */}
                    <div className="flex justify-center gap-1.5 mt-3">
                      {productData.images?.map((_, i) => (
                        <div key={i} className={`h-1 rounded-full transition-all ${i === activeImgIdx ? 'bg-gray-800 w-4' : 'bg-gray-200 w-2'}`} />
                      ))}
                    </div>
                  </div>

                  {/* Product Metadata */}
                  <div className="space-y-3 mb-auto">
                    <h2 className="text-[#1A1A1A] text-[15px] md:text-[16px] font-bold leading-snug">{productData.name}</h2>
                    <div className="flex items-center gap-3">
                      <span className="text-black text-2xl font-bold">
                        ₹{Number(productData.discountedPrice || productData.price || productData.actualPrice || 0).toLocaleString('en-IN')}
                      </span>
                      {productData.actualPrice && Number(productData.actualPrice) > Number(productData.discountedPrice || productData.price || 0) && (
                        <span className="text-gray-400 text-lg line-through font-medium">
                          ₹{Number(productData.actualPrice).toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                    <hr className="border-gray-100" />
                    <div>
                      <h5 className="text-[#1A1A1A] text-[14px] font-bold mb-1">Description</h5>
                      <p className="text-gray-600 text-[13px] leading-relaxed">
                        {productData.description || "A masterfully crafted piece from our artisanal collection."}
                      </p>
                    </div>
                  </div>

                  {/* Add to Cart Actions */}
                  <div className="my-6 flex gap-3 items-center">
                    {addedToCart ? (
                      <button
                        className="flex-1 bg-brand-orange hover:bg-brand-orange-dark text-white font-bold py-4 rounded-md transition-all active:scale-[0.98] text-[14px]"
                        onClick={() => navigate('/cart')}
                      >
                        Go to cart
                      </button>
                    ) : (
                      <button
                        className="flex-1 bg-brand-orange hover:bg-brand-orange-dark text-white font-bold py-4 rounded-md transition-all active:scale-[0.98] text-[14px]"
                        onClick={async () => {
                          if (!user) {
                            navigate('/login');
                            return;
                          }
                          try {
                            await addToCart(user, productData);
                            setAddedToCart(true);
                            toast.success('Added to Bag');
                          } catch (error) {
                            toast.error('Failed to add to bag');
                          }
                        }}
                      >
                        Add to cart
                      </button>
                    )}

                    <div className="relative">
                      <button className="w-12 h-11 bg-white border border-gray-200 rounded-md flex items-center justify-center text-gray-800 transition-all">
                        <ShoppingBag size={20} />
                      </button>
                      {addedToCart && (
                        <span className="absolute -top-2 -right-2 w-5 h-5 bg-[#1A1A1A] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg border-2 border-white animate-in zoom-in duration-300">
                          1
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                  <Loader2 className="w-10 h-10 animate-spin text-brand-orange/40" />
                  <p className="text-gray-400 text-[11px] font-bold uppercase tracking-widest">Discovering Narrative</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
