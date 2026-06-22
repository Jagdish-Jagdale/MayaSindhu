import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Navigate, Link } from 'react-router-dom';
import { useGoBack } from '../../hooks/useGoBack';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  ChevronRight,
  ChevronDown,
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
import { useCartUI } from '../../context/CartUIContext';
import { db } from '../../firebase';
import { doc, getDoc, setDoc, updateDoc, deleteDoc, serverTimestamp, onSnapshot, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { addToCart } from '../../utils/cartUtils';
import ProductCard from '../../components/user/ProductCard';
import useCategories from '../../hooks/useCategories';
import toast from 'react-hot-toast';

const BOUTIQUE_WHATSAPP_NUMBER = "9172020494";

// Helper to find the top-level ancestor category ID
const findRootCategoryId = (catId, categoriesList) => {
  const traverse = (items, targetId, rootId) => {
    for (const item of items) {
      if (item.id === targetId) {
        return rootId;
      }
      if (item.children && item.children.length > 0) {
        const found = traverse(item.children, targetId, rootId || item.id);
        if (found) return found;
      }
    }
    return null;
  };

  for (const item of categoriesList) {
    if (item.id === catId) return item.id;
    if (item.children && item.children.length > 0) {
      const found = traverse(item.children, catId, item.id);
      if (found) return found;
    }
  }
  return null;
};

// Helper to find category object by ID
const findCategoryById = (catId, categoriesList) => {
  for (const item of categoriesList) {
    if (item.id === catId) return item;
    if (item.children && item.children.length > 0) {
      const found = findCategoryById(catId, item.children);
      if (found) return found;
    }
  }
  return null;
};

// Helper to find category object by slug
const findCategoryBySlug = (slugVal, categoriesList) => {
  if (!slugVal || !categoriesList) return null;
  for (const item of categoriesList) {
    if (item.slug?.toLowerCase() === slugVal.toLowerCase() || item.id?.toLowerCase() === slugVal.toLowerCase()) {
      return item;
    }
    if (item.children && item.children.length > 0) {
      const found = findCategoryBySlug(slugVal, item.children);
      if (found) return found;
    }
  }
  return null;
};

// Helper to get all descendant category IDs under a given category ID
const getAllDescendantIds = (catId, categoriesList) => {
  const findCategory = (items, targetId) => {
    for (const item of items) {
      if (item.id === targetId) return item;
      if (item.children && item.children.length > 0) {
        const found = findCategory(item.children, targetId);
        if (found) return found;
      }
    }
    return null;
  };

  const rootCat = findCategory(categoriesList, catId);
  if (!rootCat) return [catId];

  const collect = (item) => {
    let ids = [item.id];
    if (item.children && item.children.length > 0) {
      item.children.forEach(child => {
        ids = [...ids, ...collect(child)];
      });
    }
    return ids;
  };

  return collect(rootCat);
};

// Shimmering Skeleton for Product Details Page
const ProductDetailSkeleton = () => {
  return (
    <div className="bg-[#FDFBF7] min-h-screen font-sans scroll-smooth relative">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">

        {/* Breadcrumb Skeleton */}
        <div className="flex items-center justify-end mb-4 lg:mb-6 px-2">
          <div className="h-3 w-48 bg-gray-200/60 animate-pulse rounded" />
        </div>

        {/* Product Info Section Skeleton */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 bg-white p-4 sm:p-6 lg:p-8 rounded-3xl shadow-sm border border-gray-100/50 mb-8 lg:mb-12">

          {/* Gallery Column Skeleton */}
          <div className="flex flex-col-reverse lg:flex-row gap-4 lg:gap-6 lg:w-[48%] flex-shrink-0">
            {/* Thumbnails */}
            <div className="flex lg:flex-col gap-3 overflow-hidden lg:w-24 flex-shrink-0">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-20 lg:w-full aspect-[2/3] bg-gray-100/80 animate-pulse rounded-xl" />
              ))}
            </div>
            {/* Main Image */}
            <div className="relative flex-1 aspect-square rounded-2xl lg:rounded-3xl bg-gray-100/80 animate-pulse" />
          </div>

          {/* Details Column Skeleton */}
          <div className="flex-1 flex flex-col pt-1 min-w-0 space-y-6">
            <div className="space-y-3">
              {/* Product Title */}
              <div className="h-8 w-3/4 bg-gray-200/80 animate-pulse rounded-lg" />
              {/* Subtitle */}
              <div className="h-4 w-1/2 bg-gray-100/80 animate-pulse rounded-md" />
            </div>

            {/* Ratings & Status Badges */}
            <div className="flex items-center gap-3">
              <div className="h-5 w-16 bg-gray-200/70 animate-pulse rounded-full" />
              <div className="h-5 w-20 bg-gray-200/70 animate-pulse rounded-full" />
              <div className="h-5 w-14 bg-gray-200/70 animate-pulse rounded-full" />
            </div>

            {/* Pricing */}
            <div className="flex items-baseline gap-3">
              <div className="h-9 w-32 bg-gray-200/80 animate-pulse rounded-lg" />
              <div className="h-5 w-20 bg-gray-100/80 animate-pulse rounded-md" />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <div className="h-4 w-full bg-gray-100/80 animate-pulse rounded-md" />
              <div className="h-4 w-5/6 bg-gray-100/80 animate-pulse rounded-md" />
              <div className="h-4 w-4/5 bg-gray-100/80 animate-pulse rounded-md" />
            </div>



            {/* Actions */}
            <div className="space-y-4 pt-4">
              {/* Quantity Selector Skeleton */}
              <div className="flex items-center justify-between bg-gray-50 p-3 rounded-2xl border border-gray-100/50">
                <div className="h-4 w-16 bg-gray-200/60 animate-pulse rounded-md" />
                <div className="h-8 w-24 bg-gray-200/60 animate-pulse rounded-xl" />
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="h-14 bg-gray-200/70 animate-pulse rounded-2xl" />
                <div className="h-14 bg-gray-200/70 animate-pulse rounded-2xl" />
              </div>
              <div className="h-14 bg-gray-200/70 animate-pulse rounded-2xl" />
            </div>

          </div>
        </div>

        {/* Customer Reviews Section Skeleton */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100/50 shadow-sm space-y-6">
          <div className="space-y-2">
            <div className="h-6 w-48 bg-gray-200/80 animate-pulse rounded" />
            <div className="w-16 h-1 bg-brand-orange/40 rounded-full animate-pulse" />
          </div>

          <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
            <div className="lg:w-1/3 space-y-4">
              <div className="h-12 w-28 bg-gray-200/80 animate-pulse rounded-lg" />
              <div className="h-5 w-36 bg-gray-200/80 animate-pulse rounded-md" />
              <div className="h-4 w-24 bg-gray-100/80 animate-pulse rounded-md" />
            </div>

            <div className="flex-1 space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="p-5 bg-white border border-gray-50 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100/80 animate-pulse rounded-full" />
                      <div className="space-y-1.5">
                        <div className="h-3 w-24 bg-gray-200/80 animate-pulse rounded" />
                        <div className="h-2 w-16 bg-gray-100/80 animate-pulse rounded" />
                      </div>
                    </div>
                    <div className="h-3 w-16 bg-gray-100/80 animate-pulse rounded" />
                  </div>
                  <div className="h-4 w-full bg-gray-100/80 animate-pulse rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Similar Products Section Skeleton */}
        <div className="mt-8 sm:mt-12 lg:mt-16 space-y-6">
          <div className="flex items-center justify-between px-2">
            <div className="space-y-2">
              <div className="h-6 w-48 bg-gray-200/80 animate-pulse rounded" />
              <div className="w-16 h-1 bg-brand-orange/40 rounded-full animate-pulse" />
            </div>
            <div className="h-4 w-32 bg-gray-200/60 animate-pulse rounded" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="space-y-4">
                {/* Product Card Image Skeleton */}
                <div className="aspect-[3/4] bg-gray-100/80 animate-pulse rounded-2xl" />
                {/* Product Card Info Skeleton */}
                <div className="px-1 space-y-2">
                  <div className="h-4 w-3/4 bg-gray-200/60 animate-pulse rounded" />
                  <div className="flex justify-between items-center">
                    <div className="h-5 w-20 bg-gray-200/80 animate-pulse rounded" />
                    <div className="h-4 w-8 bg-gray-100/80 animate-pulse rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default function ProductDetail() {
  const { id, slug } = useParams();
  const navigate = useNavigate();
  const goBack = useGoBack();
  const location = useLocation();
  const { user, setLoginModalOpen } = useAuth();
  const { setCartOpen } = useCartUI();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [variants, setVariants] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [alreadyInBag, setAlreadyInBag] = useState(false);
  const [adding, setAdding] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(true);
  const { categories } = useCategories();
  const categoryObj = product?.categoryId && categories ? findCategoryById(product.categoryId, categories) : null;
  const rootCatId = product?.categoryId && categories ? findRootCategoryId(product.categoryId, categories) : null;
  const rootCategoryObj = rootCatId ? findCategoryById(rootCatId, categories) : null;
  const categoryLink = rootCategoryObj?.fullPath || categoryObj?.fullPath || '/collections';

  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  const isUnique = selectedVariant 
    ? (selectedVariant.productType === 'Unique') 
    : (product ? (product.isUniquePiece === true || product.productType === 'Unique') : false);
  const stockVal = selectedVariant 
    ? (typeof selectedVariant.stock === 'number' ? selectedVariant.stock : 0)
    : (product ? (typeof product.stock === 'number' ? product.stock : (isUnique ? 1 : 15)) : 15);

  // Fetch Product by ID or Slug (Real-time Firestore listener for stock updates)
  useEffect(() => {
    if (!id) return;
    setLoading(true);

    let unsubDoc = null;
    let unsubProductQuery = null;
    let unsubSlugQuery = null;

    const docRef = doc(db, 'products', id);
    unsubDoc = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setProduct({ id: docSnap.id, ...docSnap.data() });
        setLoading(false);
      } else {
        // Document ID not found, try looking up by generated productId
        if (!unsubProductQuery) {
          const qProduct = query(collection(db, 'products'), where('productId', '==', id));
          unsubProductQuery = onSnapshot(qProduct, (querySnapshot) => {
            if (!querySnapshot.empty) {
              const snap = querySnapshot.docs[0];
              setProduct({ id: snap.id, ...snap.data() });
              setLoading(false);
            } else {
              // Not found by generated productId either, try legacy slug
              if (!unsubSlugQuery) {
                const qSlug = query(collection(db, 'products'), where('slug', '==', id));
                unsubSlugQuery = onSnapshot(qSlug, (slugSnapshot) => {
                  if (!slugSnapshot.empty) {
                    const snap = slugSnapshot.docs[0];
                    setProduct({ id: snap.id, ...snap.data() });
                  } else {
                    setProduct(null);
                  }
                  setLoading(false);
                }, (err) => {
                  setLoading(false);
                });
              }
            }
          }, (err) => {
            setLoading(false);
          });
        }
      }
    }, (error) => {
      setLoading(false);
    });

    return () => {
      if (unsubDoc) unsubDoc();
      if (unsubProductQuery) unsubProductQuery();
      if (unsubSlugQuery) unsubSlugQuery();
    };
  }, [id]);

  // Redirect to category view or collections if product is not found
  useEffect(() => {
    if (!loading && !product && categories && categories.length > 0) {
      const targetSlug = slug || id;
      const foundCategory = findCategoryBySlug(targetSlug, categories);
      if (foundCategory) {
        navigate(foundCategory.fullPath, { replace: true });
      } else {
        navigate('/collections', { replace: true });
      }
    }
  }, [loading, product, slug, id, categories, navigate]);

  useEffect(() => {
    if (!product) return;
    const fetchVariants = async () => {
      try {
        const snap = await getDocs(collection(db, 'products', product.id, 'variants'));
        const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setVariants(list);
        if (list.length > 0) {
          setSelectedVariant(list[0]);
        }
      } catch (err) {
      }
    };
    fetchVariants();
  }, [product]);

  useEffect(() => {
    setActiveImage(0);
  }, [selectedVariant]);

  // Lock quantity to 1 for unique items
  useEffect(() => {
    if (isUnique) {
      setQuantity(1);
    }
  }, [isUnique]);

  // Prevent quantity from exceeding available stock
  useEffect(() => {
    if (product && quantity > stockVal && stockVal > 0) {
      setQuantity(stockVal);
    }
  }, [stockVal, product]);

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

  // Fetch Related Products (Only products in the same main category)
  useEffect(() => {
    if (!product || !categories || categories.length === 0) return;

    const fetchRelated = async () => {
      setRelatedLoading(true);
      try {
        let related = [];

        if (product.categoryId) {
          const rootCatId = findRootCategoryId(product.categoryId, categories);
          if (rootCatId) {
            const mainCatIds = getAllDescendantIds(rootCatId, categories);
            if (mainCatIds.length > 0) {
              // Split into chunks of 30 for safe firestore queries
              const chunks = [];
              for (let i = 0; i < mainCatIds.length; i += 30) {
                chunks.push(mainCatIds.slice(i, i + 30));
              }

              let fetchedDocs = [];
              for (const chunk of chunks) {
                const qSiblings = query(
                  collection(db, 'products'),
                  where('categoryId', 'in', chunk),
                  limit(9)
                );
                const snapSiblings = await getDocs(qSiblings);
                fetchedDocs = [...fetchedDocs, ...snapSiblings.docs];
              }

              related = fetchedDocs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(p => p.id !== product.id);
            }
          }
        }

        setRelatedProducts(related.slice(0, 8));
      } catch (error) {
      } finally {
        setRelatedLoading(false);
      }
    };

    fetchRelated();
  }, [product, categories]);

  // Fetch reviews for the current product
  useEffect(() => {
    if (!product) return;

    setReviewsLoading(true);
    const q = query(
      collection(db, 'reviews'),
      where('productId', '==', product.id.toString())
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reviewData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).filter(r => r.visible !== false);

      // Sort reviews client-side by createdAt descending to avoid requiring composite indexes
      reviewData.sort((a, b) => {
        const timeA = a.createdAt?.seconds
          ? a.createdAt.seconds * 1000
          : (a.createdAt?.toDate ? a.createdAt.toDate().getTime() : new Date(a.createdAt || 0).getTime());
        const timeB = b.createdAt?.seconds
          ? b.createdAt.seconds * 1000
          : (b.createdAt?.toDate ? b.createdAt.toDate().getTime() : new Date(b.createdAt || 0).getTime());
        return timeB - timeA;
      });

      setReviews(reviewData);
      setReviewsLoading(false);
    }, (error) => {
      setReviewsLoading(false);
    });

    return () => unsubscribe();
  }, [product]);

  const handleAddToCart = async () => {
    if (!user || !product) {
      setLoginModalOpen(true);
      return;
    }

    setAdding(true);
    try {
      await addToCart(user, product, quantity, selectedVariant);
      setIsAdded(true);
      // Auto-hide success message after 3 seconds
      setTimeout(() => setIsAdded(false), 3000);
    } catch (error) {
      toast.error(error.message || "Failed to add to cart");
    } finally {
      setAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (!user || !product) {
      setLoginModalOpen(true);
      return;
    }

    setAdding(true);
    try {
      const checkoutItem = {
        id: product.id,
        productId: product.productId || '',
        slug: product.slug || product.id,
        name: selectedVariant
          ? `${product.name} (${selectedVariant.color}${selectedVariant.design ? ` - ${selectedVariant.design}` : ''})`
          : product.name,
        price: selectedVariant
          ? (selectedVariant.price || selectedVariant.actualPrice || 0)
          : (product.discountedPrice || product.price || 0),
        image: selectedVariant?.images?.[0] || (product.images && product.images[0]) || '',
        qty: quantity,
        isDirectBuy: true,
        variantId: selectedVariant?.id || '',
        sku: selectedVariant?.sku || product.sku || '',
        productType: selectedVariant 
          ? (selectedVariant.productType || 'Standard')
          : (isUnique ? 'Unique' : (product.productType || 'Standard')),
        actualPrice: selectedVariant 
          ? (selectedVariant.actualPrice || selectedVariant.price || 0)
          : (product.actualPrice || product.price || 0)
      };

      navigate('/checkout', {
        state: {
          buyNowItem: checkoutItem
        }
      });
    } catch (error) {
    } finally {
      setAdding(false);
    }
  };

  const handleWishlist = async () => {
    if (!user || !product) {
      setLoginModalOpen(true);
      return;
    }

    try {
      const wishItemRef = doc(db, 'users', user.uid, 'wishlist', product.id.toString());
      if (isWishlisted) {
        await deleteDoc(wishItemRef);
      } else {
        await setDoc(wishItemRef, {
          id: product.id,
          productId: product.productId || '',
          slug: product.slug || product.id,
          name: product.name,
          price: product.discountedPrice || product.price || 0,
          image: product.image || (product.images && product.images[0]) || '',
          rating: product.rating || 4.8,
          addedAt: serverTimestamp()
        });
      }
    } catch (error) {
    }
  };

  const handleNotifyMe = (e) => {
    e?.preventDefault();
    if (!user) {
      toast.error("Please login to request restock notification");
      setLoginModalOpen(true);
      return;
    }
    toast.success("Notification request registered! We'll alert you via email when back in stock.");
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
    return <ProductDetailSkeleton />;
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
        <Loader2 className="w-10 h-10 animate-spin text-brand-orange" />
      </div>
    );
  }

  const images = variants.length > 0
    ? (selectedVariant?.images && selectedVariant.images.length > 0 
        ? selectedVariant.images 
        : (product.images && product.images.length > 0 ? product.images : [product.image]))
    : (product.images || [product.image]);

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
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 bg-white p-4 sm:p-6 lg:p-8 rounded-none shadow-sm border border-gray-100/50 mb-8 lg:mb-12">

          {/* Section 1: Gallery */}
          <div className="flex flex-col-reverse lg:flex-row gap-4 lg:gap-6 lg:w-[48%] flex-shrink-0">
            <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto custom-scrollbar lg:w-24 lg:max-h-[500px] flex-shrink-0 py-1 scroll-smooth">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`relative w-20 lg:w-full aspect-[2/3] overflow-hidden transition-all duration-300 flex-shrink-0 rounded-xl border-2 ${activeImage === idx
                    ? 'border-brand-orange opacity-100 shadow-md'
                    : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover rounded-lg" />
                </button>
              ))}
            </div>

            <div className="relative flex-1 aspect-square rounded-2xl lg:rounded-3xl overflow-hidden bg-[#F9F8F6] border border-gray-100 group shadow-md flex items-center justify-center p-3 sm:p-4">
              <div className="w-full h-full relative">
                <motion.img
                  key={images[activeImage] || activeImage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  src={images[activeImage]}
                  alt={product.name}
                  className="w-full h-full object-contain"
                />
              </div>

              {stockVal === 0 && (
                <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px] flex items-center justify-center pointer-events-none z-10">
                  <span className="text-[#DC2626] font-black text-xl sm:text-2xl tracking-widest uppercase text-center px-4">
                    {isUnique ? "SOLD OUT" : "OUT OF STOCK"}
                  </span>
                </div>
              )}

              <button
                onClick={handleWishlist}
                className={`absolute top-4 right-4 p-2.5 rounded-full shadow-xl transition-all active:scale-90 ${isWishlisted ? 'bg-white text-red-500' : 'bg-white/80 backdrop-blur-sm text-gray-400 hover:text-red-500'
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
              <p className="text-[10px] sm:text-xs italic font-medium text-gray-500 mb-2 font-sans">
                {product.subtitle || 'Exquisite Artisanal Piece'}
              </p>

              <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                {reviews.length > 0 && (
                  <>
                    <div className="flex items-center gap-1 bg-[#FDFBF7] px-2.5 py-0.5 rounded-full border border-orange-100">
                      <Star size={10} fill="#F97316" className="text-brand-orange" />
                      <span className="text-[10px] font-black text-[#1A1A1A]">
                        {(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)}
                      </span>
                    </div>
                    <div className="h-3 w-px bg-gray-200" />
                  </>
                )}
                {(() => {
                  if (stockVal > 0) {
                    return (
                      <>
                        <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-widest text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Available</span>
                        <div className="h-3 w-px bg-gray-200 hidden sm:block" />
                      </>
                    );
                  } else {
                    return (
                      <>
                        <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-widest text-red-600 bg-red-50 px-2 py-0.5 rounded-full">Sold Out</span>
                        <div className="h-3 w-px bg-gray-200 hidden sm:block" />
                      </>
                    );
                  }
                })()}
                <button
                  onClick={handleShare}
                  className="text-[8px] sm:text-[9px] font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors flex items-center gap-1.5"
                >
                  <Share2 size={10} /> Share
                </button>
              </div>

              <div className="flex items-baseline gap-3 mb-4 sm:mb-6">
                <span className="text-2xl sm:text-3xl font-bold text-[#1A1A1A]">
                  ₹{Number(selectedVariant ? (selectedVariant.price || selectedVariant.actualPrice) : (product.discountedPrice || product.price || 0)).toLocaleString('en-IN')}
                </span>
                {Number(selectedVariant ? selectedVariant.actualPrice : product.actualPrice || 0) > Number(selectedVariant ? (selectedVariant.price || selectedVariant.actualPrice) : (product.discountedPrice || product.price || 0)) && (
                  <>
                    <span className="text-xs sm:text-sm text-gray-400 line-through font-medium">
                      ₹{Number(selectedVariant ? selectedVariant.actualPrice : product.actualPrice || 0).toLocaleString('en-IN')}
                    </span>
                    <span className="text-[8px] sm:text-[9px] font-black text-red-500 uppercase tracking-[0.2em] ml-2">
                      {Math.round(((Number(selectedVariant ? selectedVariant.actualPrice : product.actualPrice) - Number(selectedVariant ? (selectedVariant.price || selectedVariant.actualPrice) : (product.discountedPrice || product.price))) / Number(selectedVariant ? selectedVariant.actualPrice : product.actualPrice)) * 100)}% Off
                    </span>
                  </>
                )}
              </div>

              {/* Flipkart-Style Variant Selector */}
              {variants.length > 0 && (
                <div className="mb-6 pb-4 border-b border-gray-100 space-y-4">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-2">
                      Selected: <span className="text-gray-900 font-bold normal-case ml-1">
                        {(() => {
                          if (!selectedVariant) return 'Default';
                          const colorText = selectedVariant.color && selectedVariant.color !== 'Default' ? selectedVariant.color : '';
                          const designText = selectedVariant.design && selectedVariant.design !== 'Default' ? selectedVariant.design : '';
                          if (colorText && designText) return `${colorText} - ${designText}`;
                          return colorText || designText || 'Default';
                        })()}
                      </span>
                    </span>
                    {(() => {
                      const uniqueColors = Array.from(new Set(variants.map(v => v.color)));
                      return (
                        <div className={`flex gap-2.5 py-1 ${uniqueColors.length > 5 ? 'overflow-x-auto pb-2 custom-scrollbar' : 'flex-wrap'}`}>
                          {uniqueColors.map(color => {
                            const variantWithColor = variants.find(v => (v.color || '') === (color || ''));
                            const isSelected = (selectedVariant?.color || '') === (color || '');
                            const thumbnail = variantWithColor?.images?.[0] || product.image || (product.images && product.images[0]);
                            
                            return (
                              <button
                                key={color || 'default'}
                                onClick={() => {
                                  const match = variants.find(v => (v.color || '') === (color || ''));
                                  if (match) setSelectedVariant(match);
                                }}
                                className={`flex items-center p-0.5 rounded-lg border transition-all flex-shrink-0 ${
                                  isSelected
                                    ? 'border-[#1BAFAF] bg-[#1BAFAF]/5 ring-2 ring-[#1BAFAF]'
                                    : 'border-gray-200 bg-white hover:border-gray-400'
                                }`}
                              >
                                {thumbnail && (
                                  <img src={thumbnail} alt="" className="w-16 h-22 object-cover rounded-md" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Design selector if multiple designs exist for the selected color */}
                  {variants.filter(v => v.color === selectedVariant?.color).length > 1 && (
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-2">
                        Style / Structure: <span className="text-gray-900 font-bold normal-case ml-1">{selectedVariant?.design || 'Standard'}</span>
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {variants
                          .filter(v => v.color === selectedVariant?.color)
                          .map(v => {
                            const isSelected = selectedVariant?.id === v.id;
                            return (
                              <button
                                key={v.id}
                                onClick={() => setSelectedVariant(v)}
                                className={`px-4 py-2 rounded-xl border text-xs font-semibold transition-all ${
                                  isSelected
                                    ? 'border-[#1BAFAF] bg-[#1BAFAF]/5 ring-1 ring-[#1BAFAF] text-[#1BAFAF]'
                                    : 'border-gray-250 bg-white hover:border-gray-450 text-gray-700'
                                }`}
                              >
                                {v.design || 'Standard'}
                              </button>
                            );
                          })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <p className="text-gray-500 text-xs sm:text-sm leading-relaxed mb-4 sm:mb-6 font-medium">
                {product.description || "A masterpiece of artisanal craftsmanship, each thread tells a story of heritage and handcrafted excellence."}
              </p>

              {product.care && (
                <div className="mb-6 lg:mb-8 py-4 border-t border-gray-100">
                  <p className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-gray-400 mb-1.5">Care Instructions</p>
                  <p className="text-[#1A1A1A] text-xs sm:text-sm font-bold leading-relaxed">
                    {product.care}
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-4 sm:space-y-6 mt-auto">
              <div className="flex items-center justify-between bg-[#FDFBF7] p-3 sm:p-4 rounded-2xl border border-orange-50">
                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-[#1A1A1A]">Quantity</span>
                <div className="flex items-center bg-white rounded-xl shadow-sm p-1 border border-gray-100">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={isUnique || stockVal === 0}
                    className={`p-1.5 transition-colors ${(isUnique || stockVal === 0) ? 'text-gray-200 cursor-not-allowed' : 'text-gray-400 hover:text-black'}`}
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-8 sm:w-12 text-center font-bold text-sm sm:text-base">{stockVal === 0 ? 0 : quantity}</span>
                  <button
                    onClick={() => {
                      if (isUnique) return;
                      if (quantity < stockVal) {
                        setQuantity(quantity + 1);
                      } else {
                        toast.error(`Only ${stockVal} items available in stock.`);
                      }
                    }}
                    disabled={isUnique || quantity >= stockVal || stockVal === 0}
                    className={`p-1.5 transition-colors ${(isUnique || quantity >= stockVal || stockVal === 0) ? 'text-gray-200 cursor-not-allowed' : 'text-gray-400 hover:text-black'}`}
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {stockVal === 0 ? (
                <div className="space-y-3">
                  <button
                    onClick={handleNotifyMe}
                    className="w-full py-3.5 sm:py-4 rounded-2xl font-sans font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#1E293B] flex items-center justify-center cursor-pointer shadow-sm hover:shadow"
                  >
                    Notify Me
                  </button>
                  <a
                    href={`https://wa.me/${BOUTIQUE_WHATSAPP_NUMBER}?text=Hello,%20I'm%20interested%20in%20inquiring%20about%20the%20out-of-stock%20product%20"${encodeURIComponent(product.name)}".%20Please%20let%20me%20know%20when%20it's%20back%20in%20stock.%20Link:%20${encodeURIComponent(window.location.href)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 sm:py-4 rounded-2xl font-sans font-black text-[9px] sm:text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 shadow-md flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white shadow-emerald-500/10 cursor-pointer"
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" className="flex-shrink-0">
                      <path d="M12.012 2c-5.506 0-9.97 4.463-9.97 9.97 0 1.76.459 3.477 1.332 4.995L2 22l5.176-1.357c1.477.807 3.137 1.233 4.832 1.233 5.506 0 9.97-4.463 9.97-9.97 0-2.657-1.034-5.155-2.91-7.033A9.907 9.907 0 0012.012 2zm5.79 14.195c-.24.675-1.18 1.312-1.63 1.4-1.035.2-2.385.2-3.87-.417-2.18-.9-4.08-3.08-4.78-4.017-.15-.2-.84-1.117-.84-2.133 0-1.017.53-.19.72-.39.19-.2.39-.49.49-.69.1-.2.05-.39-.025-.54-.075-.15-.675-1.625-.925-2.225-.24-.58-.49-.5-.675-.51-.175-.01-.375-.01-.58-.01-.2 0-.53.075-.81.38-.28.3-.1.1.1 1.07.1 1.07 1.04 2.1 1.5 2.76 1.46 2.05 3.19 3.525 5.52 4.39 1.13.42 2.02.48 2.72.38.78-.12 2.385-.975 2.725-1.925.34-.95.34-1.76.24-1.925-.1-.175-.38-.275-.8-.475z" />
                    </svg>
                    Inquire on WhatsApp
                  </a>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <button
                      onClick={alreadyInBag ? () => setCartOpen(true) : handleAddToCart}
                      disabled={adding}
                      className={`flex items-center justify-center gap-2 py-3.5 sm:py-4 rounded-2xl font-sans font-black text-[9px] sm:text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 ${alreadyInBag
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
                      className="py-3.5 sm:py-4 rounded-2xl font-sans font-black text-[9px] sm:text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 shadow-md flex items-center justify-center gap-2 bg-brand-orange text-white hover:bg-brand-orange-dark shadow-brand-orange/10"
                    >
                      {adding ? <Loader2 className="animate-spin" size={14} /> : 'Buy Now'}
                    </button>
                  </div>
                  <a
                    href={`https://wa.me/${BOUTIQUE_WHATSAPP_NUMBER}?text=Hello,%20I'm%20interested%20in%20purchasing%20the%20product%20"${encodeURIComponent(product.name)}".%20Please%20provide%20more%20details.%20Link:%20${encodeURIComponent(window.location.href)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 sm:py-4 rounded-2xl font-sans font-black text-[9px] sm:text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 shadow-md flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white shadow-emerald-500/10 cursor-pointer"
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" className="flex-shrink-0">
                      <path d="M12.012 2c-5.506 0-9.97 4.463-9.97 9.97 0 1.76.459 3.477 1.332 4.995L2 22l5.176-1.357c1.477.807 3.137 1.233 4.832 1.233 5.506 0 9.97-4.463 9.97-9.97 0-2.657-1.034-5.155-2.91-7.033A9.907 9.907 0 0012.012 2zm5.79 14.195c-.24.675-1.18 1.312-1.63 1.4-1.035.2-2.385.2-3.87-.417-2.18-.9-4.08-3.08-4.78-4.017-.15-.2-.84-1.117-.84-2.133 0-1.017.53-.19.72-.39.19-.2.39-.49.49-.69.1-.2.05-.39-.025-.54-.075-.15-.675-1.625-.925-2.225-.24-.58-.49-.5-.675-.51-.175-.01-.375-.01-.58-.01-.2 0-.53.075-.81.38-.28.3-.1.1.1 1.07.1 1.07 1.04 2.1 1.5 2.76 1.46 2.05 3.19 3.525 5.52 4.39 1.13.42 2.02.48 2.72.38.78-.12 2.385-.975 2.725-1.925.34-.95.34-1.76.24-1.925-.1-.175-.38-.275-.8-.475z" />
                    </svg>
                    Order on WhatsApp
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section: Frequently Asked Questions */}
        {product.faqs && product.faqs.length > 0 && (
          <div className="mt-8 sm:mt-12 lg:mt-16 bg-white p-6 sm:p-8 rounded-3xl border border-gray-100/50 shadow-sm animate-in fade-in duration-300">
            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl font-sans font-bold text-[#1A1A1A] mb-2 uppercase tracking-tighter">Frequently Asked Questions</h2>
              <div className="w-16 h-1 bg-brand-orange rounded-full" />
            </div>

            <div className="w-full divide-y divide-gray-100">
              {product.faqs.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div key={idx} className="py-4 first:pt-0 last:pb-0">
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? -1 : idx)}
                      className="w-full flex items-center justify-between text-left py-2 group cursor-pointer"
                    >
                      <span className="text-sm sm:text-base font-bold text-[#1A1A1A] group-hover:text-brand-orange transition-colors duration-200 pr-4">
                        {faq.question}
                      </span>
                      <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="text-gray-400 group-hover:text-[#1A1A1A] flex-shrink-0"
                      >
                        <ChevronDown size={20} />
                      </motion.div>
                    </button>
                    
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <p className="text-xs sm:text-sm text-gray-500 leading-relaxed font-medium pt-2 pb-2 pl-1">
                            {faq.answer}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Section: Customer Reviews */}
        <div className="mt-8 sm:mt-12 lg:mt-16 bg-white p-6 sm:p-8 rounded-3xl border border-gray-100/50 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl sm:text-2xl font-sans font-bold text-[#1A1A1A] mb-2 uppercase tracking-tighter">Customer Reviews</h2>
            <div className="w-16 h-1 bg-brand-orange rounded-full" />
          </div>

          {reviewsLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-brand-orange" size={32} />
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-16 bg-[#FAF9F6]/50 rounded-2xl border border-dashed border-gray-200">
              <Star className="text-gray-200 mx-auto mb-4" size={36} />
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">No reviews yet</p>
              <p className="text-[11px] text-gray-400 font-medium mt-1">Be the first to share your experience after purchasing this product.</p>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">

              {/* Reviews Summary Column */}
              <div className="lg:w-1/3 space-y-4">
                <div className="space-y-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl sm:text-5xl font-black text-gray-900">
                      {(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)}
                    </span>
                    <span className="text-xs font-bold text-gray-400">out of 5</span>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Stars */}
                    {(() => {
                      const avgRating = Math.round(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length);
                      return [1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={18}
                          fill={star <= avgRating ? "#F59E0B" : "none"}
                          className={star <= avgRating ? "text-amber-500" : "text-gray-200"}
                        />
                      ));
                    })()}
                  </div>

                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                    Based on {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                  </p>
                </div>
              </div>

              {/* Reviews List Column */}
              <div className="flex-1 space-y-6">
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {reviews.map((review) => {
                    const initials = (review.userName || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                    const dateStr = review.createdAt?.toDate
                      ? review.createdAt.toDate().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                      : (review.createdAt ? new Date(review.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Just now');

                    return (
                      <div key={review.id} className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm space-y-3 hover:border-brand-orange/10 transition-colors">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-brand-orange/10 text-brand-orange rounded-full flex items-center justify-center font-bold text-xs">
                              {initials}
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-[#1A1A1A]">{review.userName}</h4>
                              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">{dateStr}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                size={12}
                                fill={star <= review.rating ? "#F59E0B" : "none"}
                                className={star <= review.rating ? "text-amber-500" : "text-gray-200"}
                              />
                            ))}
                          </div>
                        </div>

                        <p className="text-xs text-gray-500 leading-relaxed font-medium">
                          {review.comment}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Section: Related Products */}
        {!relatedLoading && relatedProducts.length > 0 && (
          <div className="mt-8 sm:mt-12 lg:mt-16">
            <div className="flex items-center justify-between mb-6 sm:mb-10 px-2">
              <div>
                <h2 className="text-xl sm:text-2xl font-sans font-bold text-[#1A1A1A] mb-2 uppercase tracking-tighter">Similar Products</h2>
                <div className="w-16 h-1 bg-brand-orange rounded-full" />
              </div>
              <Link
                to={categoryLink}
                className="text-[9px] sm:text-[10px] font-sans font-black uppercase tracking-[0.2em] text-[#1A1A1A] hover:text-brand-orange transition-colors flex items-center gap-1 group border-b border-black hover:border-brand-orange pb-0.5"
              >
                Show All Products <ChevronRight size={10} className="transform group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            <div className="flex overflow-x-auto gap-4 sm:gap-6 lg:gap-8 pb-4 no-scrollbar scroll-smooth">
              {relatedProducts.map((p) => (
                <motion.div
                  key={p.id}
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="w-[calc((100%-16px)/2)] sm:w-[calc((100%-48px)/3)] lg:w-[calc((100%-96px)/4)] flex-shrink-0"
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
