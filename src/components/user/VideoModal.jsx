import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCartUI } from '../../context/CartUIContext';
import { addToCart } from '../../utils/cartUtils';
import { db } from '../../firebase';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { X, ChevronLeft, ChevronRight, ShoppingBag, Volume2, VolumeX, Share2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { getFriendlyErrorMessage } from '../../utils/firebaseErrors';
import useEscapeKey from '../../hooks/useEscapeKey';

export default function VideoModal({ isOpen, onClose, look, onNext, onPrev }) {
  const { user, setLoginModalOpen } = useAuth();
  const { setCartOpen } = useCartUI();
  const navigate = useNavigate();
  const [productsData, setProductsData] = useState([]);
  const [loadingProduct, setLoadingProduct] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [addedToCartMap, setAddedToCartMap] = useState({});
  const [alreadyInBagMap, setAlreadyInBagMap] = useState({});

  useEscapeKey(onClose, isOpen);

  // Reset states when look changes
  useEffect(() => {
    setAddedToCartMap({});
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

  // Fetch linked products data whenever the 'look' changes
  useEffect(() => {
    const ids = look?.productIds || (look?.productId ? [look.productId] : []);
    if (ids.length === 0 || !isOpen) {
      setProductsData([]);
      return;
    }
    const fetchProds = async () => {
      setLoadingProduct(true);
      try {
        const promises = ids.map(async (pid) => {
          const docRef = doc(db, 'products', pid);
          const docSnap = await getDoc(docRef);
          return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
        });
        const results = await Promise.all(promises);
        setProductsData(results.filter(Boolean));
      } catch (error) {
      } finally {
        setLoadingProduct(false);
      }
    };
    fetchProds();
  }, [look?.productIds, look?.productId, isOpen]);

  // Listen for cart status of all fetched products
  useEffect(() => {
    if (!user || productsData.length === 0) {
      setAlreadyInBagMap({});
      return;
    }

    const unsubscribes = productsData.map(prod => {
      const cartItemRef = doc(db, 'users', user.uid, 'cart', prod.id.toString());
      return onSnapshot(cartItemRef, (docSnap) => {
        setAlreadyInBagMap(prev => ({
          ...prev,
          [prod.id]: docSnap.exists()
        }));
      });
    });

    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, [user, productsData]);

  const isComboDisabled = productsData.some(product => {
    const isUnique = product.isUniquePiece === true || product.productType === 'Unique';
    const stockVal = typeof product.stock === 'number' ? product.stock : (isUnique ? 1 : 15);
    return stockVal === 0;
  });

  const allProductsInBag = productsData.length > 0 && productsData.every(p => alreadyInBagMap[p.id] || addedToCartMap[p.id]);

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

            {/* Mute/Unmute Overlay Toggle */}
            <button
              onClick={() => setIsMuted(prev => !prev)}
              className="absolute bottom-4 right-4 z-20 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all border border-white/10 shadow-lg cursor-pointer"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
          </div>

          {/* Right Side: Product Narrative Section (White Theme) */}
          <div className="w-full md:w-[50%] h-[60%] md:h-full bg-white flex flex-col p-5 md:p-6 overflow-hidden relative">
            <AnimatePresence mode="wait">
              {loadingProduct ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                  <Loader2 className="w-10 h-10 animate-spin text-brand-orange/40" />
                  <p className="text-gray-400 text-[11px] font-bold uppercase tracking-widest">Loading Products</p>
                </div>
              ) : productsData.length > 0 ? (
                <div className="flex flex-col h-full justify-between overflow-hidden">
                  <div className="flex-1 overflow-y-auto pr-1 no-scrollbar space-y-6">
                    <h3 className="text-[#1A1A1A] text-[15px] font-black uppercase tracking-wider mb-4 text-left">Products in this look</h3>
                    <div className="divide-y divide-gray-100">
                      {productsData.map(product => {
                        const isUnique = product.isUniquePiece === true || product.productType === 'Unique';
                        const stockVal = typeof product.stock === 'number' ? product.stock : (isUnique ? 1 : 15);
                        const isOutOfStock = stockVal === 0;
                        const inBag = alreadyInBagMap[product.id] || addedToCartMap[product.id];

                        return (
                          <div key={product.id} className="flex gap-4 py-4 first:pt-0 items-center justify-between">
                            <div className="flex gap-3 items-center flex-1 min-w-0">
                              <img src={product.images?.[0]} alt="" className="w-12 h-16 rounded-md object-cover border border-gray-150 flex-shrink-0" />
                              <div className="text-left min-w-0">
                                <h4 className="text-[12px] font-bold text-gray-900 truncate leading-tight mb-1">{product.name}</h4>
                                <div className="flex items-center gap-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                                  <span className="text-[12px] font-black text-brand-orange">
                                    ₹{Number(product.discountedPrice || product.price || product.actualPrice || 0).toLocaleString('en-IN')}
                                  </span>
                                  {product.actualPrice && Number(product.actualPrice) > Number(product.discountedPrice || product.price || 0) && (
                                    <span className="text-[10px] text-gray-400 line-through">
                                      ₹{Number(product.actualPrice).toLocaleString('en-IN')}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex-shrink-0">
                              {inBag ? (
                                <button
                                  className="bg-[#f5aa00] hover:bg-[#d69500] text-white font-bold px-3 py-2 rounded-lg transition-all active:scale-[0.98] text-[10px] uppercase tracking-wider cursor-pointer"
                                  onClick={() => {
                                    onClose();
                                    setCartOpen(true);
                                  }}
                                >
                                  Go to bag
                                </button>
                              ) : (
                                <button
                                  disabled={isOutOfStock}
                                  className={`font-bold px-3 py-2 rounded-lg transition-all text-[10px] uppercase tracking-wider cursor-pointer ${isOutOfStock
                                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                      : 'bg-brand-orange hover:bg-brand-orange-dark text-white active:scale-[0.98]'
                                    }`}
                                  onClick={async () => {
                                    if (!user) {
                                      setLoginModalOpen(true);
                                      return;
                                    }
                                    try {
                                      await addToCart(user, product);
                                      setAddedToCartMap(prev => ({ ...prev, [product.id]: true }));
                                      toast.success(`${product.name} Added`);
                                    } catch (error) {
                                      console.error("Cart error:", error);
                                      toast.error(getFriendlyErrorMessage(error) || 'Failed to add to bag');
                                    }
                                  }}
                                >
                                  {isOutOfStock ? "Sold Out" : "Add to cart"}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Combo Section */}
                  <div className="pt-4 mt-4 border-t border-gray-100 bg-gray-50/50 p-4 rounded-xl text-center shrink-0">
                    {allProductsInBag ? (
                      <button
                        className="w-full bg-[#f5aa00] hover:bg-[#d69500] text-white font-bold py-3 rounded-lg transition-all active:scale-[0.98] text-[12px] uppercase tracking-widest cursor-pointer"
                        onClick={() => {
                          onClose();
                          setCartOpen(true);
                        }}
                      >
                        View in Cart
                      </button>
                    ) : (
                      <button
                        disabled={isComboDisabled}
                        className={`w-full font-bold py-3 rounded-lg transition-all text-[12px] uppercase tracking-widest ${isComboDisabled
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50'
                            : 'bg-[#f5aa00] hover:bg-[#d69500] text-white active:scale-[0.98] cursor-pointer'
                          }`}
                        onClick={async () => {
                          if (!user) {
                            setLoginModalOpen(true);
                            return;
                          }
                          try {
                            for (const p of productsData) {
                              const isUnique = p.isUniquePiece === true || p.productType === 'Unique';
                              const stockVal = typeof p.stock === 'number' ? p.stock : (isUnique ? 1 : 15);
                              if (stockVal > 0 && !alreadyInBagMap[p.id] && !addedToCartMap[p.id]) {
                                await addToCart(user, p);
                                setAddedToCartMap(prev => ({ ...prev, [p.id]: true }));
                              }
                            }
                            toast.success('Combo Added to Bag!');
                          } catch (error) {
                            toast.error('Failed to add combo items');
                          }
                        }}
                      >
                        {isComboDisabled ? 'Combo Unavailable' : 'Add Combo to Cart'}
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                  <p className="text-gray-400 text-[11px] font-bold uppercase tracking-widest">No Products Linked</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
