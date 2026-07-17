/**
 * File: Home.jsx
 * Description: Client-facing customer page rendering home banners, blog lists, product details, and profile user sections.
 * Work Done: Integrated baseline UI layouts, state boundaries, CSS theme styling, and routing pathways.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../../components/user/ProductCard';
import VideoCard from '../../components/user/VideoCard';
import VideoModal from '../../components/user/VideoModal';
import TestimonialCard from '../../components/user/TestimonialCard';
import { ChevronLeft, ChevronRight, ArrowLeft, ArrowRight, Plus, Loader2, Calendar, CheckCircle2 } from 'lucide-react';
import WorkshopModal from '../../components/user/WorkshopModal';
import TrendProductsModal from '../../components/user/TrendProductsModal';

import { db } from '../../firebase';
import { collection, onSnapshot, query, orderBy, doc } from 'firebase/firestore';
import useCategories from '../../hooks/useCategories';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import mstitle from '../../assets/mstitle.png';

const SplashScreen = () => (
  <motion.div
    initial={{ opacity: 1 }}
    exit={{ y: '-100%', opacity: 0, scale: 1.05 }}
    transition={{ duration: 0.8, ease: [0.75, 0, 0.25, 1] }}
    className="fixed inset-0 z-[9999] bg-[#F9F7F5] flex flex-col items-center justify-center overflow-hidden"
  >
    {/* Decorative background circle */}
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 0.3 }}
      transition={{ duration: 1.5, ease: "easeOut" }}
      className="absolute w-[40vw] h-[40vw] max-w-[400px] max-h-[400px] bg-brand-orange rounded-full blur-[100px] -z-10"
    />

    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1, ease: "easeOut" }}
      className="flex flex-col items-center"
    >
      {/* Brand Title Image with Clipped Glass Shine */}
      <div className="relative mb-8 inline-block">
        <img src={mstitle} alt="MayaSindhu" className="h-16 md:h-24 lg:h-32 w-auto object-contain filter drop-shadow-xl" />

        {/* Glass-like Shine clipped EXACTLY to the logo's pixels */}
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            WebkitMaskImage: `url(${mstitle})`,
            WebkitMaskSize: 'contain',
            WebkitMaskRepeat: 'no-repeat',
            WebkitMaskPosition: 'center',
            maskImage: `url(${mstitle})`,
            maskSize: 'contain',
            maskRepeat: 'no-repeat',
            maskPosition: 'center'
          }}
        >
          <motion.div
            className="absolute top-0 bottom-0 w-[60px] bg-gradient-to-r from-transparent via-white to-transparent skew-x-[-25deg] opacity-90"
            initial={{ left: '-50%' }}
            animate={{ left: '150%' }}
            transition={{ duration: 1.8, delay: 0.4, ease: "easeInOut" }}
            style={{ filter: 'blur(1px)' }}
          />
        </div>
      </div>

      <motion.p
        initial={{ opacity: 0, letterSpacing: '0px' }}
        animate={{ opacity: 1, letterSpacing: '8px' }}
        transition={{ delay: 0.6, duration: 1.2, ease: "easeOut" }}
        className="text-[11px] md:text-[13px] font-medium uppercase text-text-muted text-center"
      >
        Handcrafted Lifestyle Brand
      </motion.p>
    </motion.div>

    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1, duration: 0.8 }}
      className="absolute bottom-16 left-1/2 -translate-x-1/2 flex items-center justify-center space-x-2"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-brand-orange animate-bounce" style={{ animationDelay: '0ms' }} />
      <span className="w-1.5 h-1.5 rounded-full bg-brand-orange animate-bounce" style={{ animationDelay: '150ms' }} />
      <span className="w-1.5 h-1.5 rounded-full bg-brand-orange animate-bounce" style={{ animationDelay: '300ms' }} />
    </motion.div>
  </motion.div>
);

export default function Home() {
  const { user, setLoginModalOpen } = useAuth();
  const [showSplash, setShowSplash] = useState(() => {
    // Only show if the user hasn't seen it in this session
    return !sessionStorage.getItem('mayasindhu_splash_seen');
  });
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [realms, setRealms] = useState([]);
  const [realmsLoading, setRealmsLoading] = useState(true);

  const [featuredTreasures, setFeaturedTreasures] = useState([]);
  const [ftLoading, setFtLoading] = useState(true);

  const [banners, setBanners] = useState([]);
  const [bannersLoading, setBannersLoading] = useState(true);

  const [trends, setTrends] = useState([]);
  const [trendsLoading, setTrendsLoading] = useState(true);

  const [looks, setLooks] = useState([]);
  const [looksLoading, setLooksLoading] = useState(true);

  const [purpose, setPurpose] = useState(null);
  const [purposeLoading, setPurposeLoading] = useState(true);

  const [testimonials, setTestimonials] = useState([]);
  const [testimonialsLoading, setTestimonialsLoading] = useState(true);
  const [workshopModalOpen, setWorkshopModalOpen] = useState(false);
  const [selectedWorkshop, setSelectedWorkshop] = useState(null);
  const [workshopModalInitialTab, setWorkshopModalInitialTab] = useState('details');
  const [selectedTrend, setSelectedTrend] = useState(null);
  const [isTrendModalOpen, setIsTrendModalOpen] = useState(false);

  const { categories: allCategories } = useCategories();
  const featuredRef = useRef(null);

  const artisanRef = useRef(null);
  const videoRef = useRef(null);
  const testimonialRef = useRef(null);
  const [products, setProducts] = useState([]);

  // Splash Screen Timer
  useEffect(() => {
    if (!showSplash) return;

    const timer = setTimeout(() => {
      setShowSplash(false);
      sessionStorage.setItem('mayasindhu_splash_seen', 'true');
    }, 2800);
    return () => clearTimeout(timer);
  }, [showSplash]);

  // Load All Products and Featured Treasures
  // 1. Listen to all products
  useEffect(() => {
    const qProd = query(collection(db, 'products'));
    const unsubscribeProd = onSnapshot(qProd, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(data);
    });
    return () => unsubscribeProd();
  }, []);

  // 2. Listen to featured treasures metadata and hydrate
  useEffect(() => {
    const qFt = query(collection(db, 'featuredTreasures'), orderBy('order', 'asc'));
    const unsubscribeFt = onSnapshot(qFt, (snapshot) => {
      const ftData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Hydrate with latest product details whenever products OR metadata changes
      const hydrated = ftData.map(ft => {
        const product = products.find(p => p.id === ft.productId);
        if (!product) return null;

        return {
          ...product,
          price: product.discountedPrice || product.price || 0,
          originalFeaturedId: ft.id
        };
      }).filter(Boolean);

      setFeaturedTreasures(hydrated);
      setFtLoading(false);
    });

    return () => unsubscribeFt();
  }, [products]); // Re-run hydration whenever products state updates

  // Load Banners from Firestore with Image Preloading
  useEffect(() => {
    const q = query(collection(db, 'banners'), orderBy('order', 'asc'));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter(b => b.isActive !== false);
      setBanners(data);

      // Preload critical banner images
      if (data.length > 0) {
        const preloadImage = (url) => {
          return new Promise((resolve) => {
            const img = new Image();
            img.src = url;
            img.onload = resolve;
            img.onerror = resolve; // resolve anyway to avoid hanging
          });
        };

        // Preload first 2 banners specifically while splash is visible
        await Promise.all([
          preloadImage(data[0].imageUrl),
          data[1] ? preloadImage(data[1].imageUrl) : Promise.resolve()
        ]);
      }

      setBannersLoading(false);
    }, (error) => {
      setBannersLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Load Curated Realms from Firestore
  useEffect(() => {
    const q = query(collection(db, 'curatedRealms'), orderBy('slotId', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRealms(data);
      setRealmsLoading(false);
    }, (error) => {
      setRealmsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Load Trends from Firestore
  useEffect(() => {
    const q = query(collection(db, 'shopByTrend'), orderBy('order', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTrends(data);
      setTrendsLoading(false);
    }, (error) => {
      setTrendsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Load Looks from Firestore
  useEffect(() => {
    const q = query(collection(db, 'shopTheLook'), orderBy('order', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLooks(data);
      setLooksLoading(false);
    }, (error) => {
      setLooksLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Load Purpose from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'ourPurpose', 'main'), (docSnap) => {
      if (docSnap.exists()) {
        setPurpose(docSnap.data());
      }
      setPurposeLoading(false);
    }, (error) => {
      setPurposeLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Load Testimonials from Firestore
  useEffect(() => {
    const q = query(collection(db, 'testimonials'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      data = data
        .filter(t => t.status === 'Active')
        .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
      setTestimonials(data);
      setTestimonialsLoading(false);
    }, (error) => {
      setTestimonialsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const [workshops, setWorkshops] = useState([]);
  const [workshopsLoading, setWorkshopsLoading] = useState(true);

  // Load Workshops from Firestore
  useEffect(() => {
    const q = query(collection(db, 'workshops'), orderBy('date', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setWorkshops(data);
      setWorkshopsLoading(false);
    }, (error) => {
      setWorkshopsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const formatWorkshopDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }).toUpperCase();
  };

  const scroll = (ref, direction) => {
    if (ref.current) {
      const { scrollLeft, clientWidth } = ref.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      ref.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  const displaySlides = banners;

  const resolveVideoUrl = (url) => {
    if (!url) return '';
    if (url.includes('Cotton Saree haul') || url.includes('shortsfeed')) {
      return '/looks_v1.mp4';
    }
    if (url.startsWith('assets/')) {
      return `/${url}`;
    }
    return url;
  };

  const openVideo = (video) => {
    setSelectedVideo({ ...video, url: resolveVideoUrl(video.url) });
    setIsVideoModalOpen(true);
  };

  useEffect(() => {
    if (displaySlides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % displaySlides.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [displaySlides.length]);

  return (
    <div className="bg-white min-h-screen relative">
      <AnimatePresence>
        {showSplash && <SplashScreen />}
      </AnimatePresence>

      {/* Cinematic Banner Slider */}
      <section className="relative w-full overflow-hidden bg-white">
        {bannersLoading ? (
          <div className="aspect-[5/2] w-full flex items-center justify-center bg-brand-gray/50 animate-pulse">
            <Loader2 className="w-8 h-8 animate-spin text-brand-orange" />
          </div>
        ) : (
          <div className="relative w-full overflow-hidden">
            {/* Full Width Hero Image (No Cropping) */}
            <img
              src={displaySlides[currentSlide]?.imageUrl}
              alt={displaySlides[currentSlide]?.title || "Banner"}
              className="w-full h-auto block"
            />

            {/* Hero Overlay (Cinematic Gradient) */}
            <div className="absolute inset-0 flex items-center px-[5%] md:px-[8%] pointer-events-none">
              <div className="max-w-2xl md:max-w-4xl">
                {displaySlides[currentSlide]?.accent && (
                  <span className="inline-block text-white text-[10px] md:text-[14px] font-bold tracking-[0.4em] uppercase mb-2 md:mb-4">
                    {displaySlides[currentSlide].accent}
                  </span>
                )}
                {displaySlides[currentSlide]?.title && (
                  <h1
                    className="text-white font-sans font-medium leading-[1.1] md:leading-tight"
                    style={{ fontSize: 'clamp(18px, 4.5vw, 56px)' }}
                  >
                    {displaySlides[currentSlide].title}
                  </h1>
                )}
              </div>
            </div>

            {/* Nav Arrows Scaling */}
            {!bannersLoading && displaySlides.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentSlide((prev) => (prev - 1 + displaySlides.length) % displaySlides.length)}
                  className="absolute left-2 md:left-6 transition-all top-1/2 -translate-y-1/2 w-8 h-8 md:w-12 md:h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-brand-orange hover:border-brand-orange z-20 group"
                >
                  <ChevronLeft className="w-4 h-4 md:w-6 md:h-6 group-hover:-translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => setCurrentSlide((prev) => (prev + 1) % displaySlides.length)}
                  className="absolute right-2 md:right-6 transition-all top-1/2 -translate-y-1/2 w-8 h-8 md:w-12 md:h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-brand-orange hover:border-brand-orange z-20 group"
                >
                  <ChevronRight className="w-4 h-4 md:w-6 md:h-6 group-hover:translate-x-1 transition-transform" />
                </button>

                {/* Indicators Scaling */}
                <div className="absolute bottom-[8%] left-1/2 -translate-x-1/2 flex gap-2 z-20">
                  {displaySlides.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentSlide(i)}
                      className={`h-1 rounded-full transition-all duration-500 ${currentSlide === i ? 'w-8 md:w-16 bg-brand-orange' : 'w-4 md:w-8 bg-white/40'}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </section>


      {/* 3. Explore Category (Responsive Grid) */}
      <section className="py-12 md:py-16 max-w-[1536px] mx-auto px-4 md:px-8 lg:px-[60px] bg-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 md:mb-24 text-center"
        >
          <span className="text-[10px] md:text-[11px] uppercase font-bold tracking-[0.5em] text-brand-orange mb-4 block">Curated Realms</span>
          <h2 className="font-sans text-brand-black tracking-normal mb-8 leading-tight" style={{ fontSize: 'clamp(32px, 5vw, 64px)' }}>Explore Category</h2>
          <div className="w-16 md:w-32 h-[1px] bg-brand-orange/30 mx-auto" />
        </motion.div>

        {(() => {
          if (realmsLoading) {
            return (
              <div className="flex justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-brand-orange" />
              </div>
            );
          }

          // Helper to find category by ID in the hierarchy
          const findCategoryById = (cats, targetId) => {
            for (const cat of cats) {
              if (cat.id === targetId) return cat;
              if (cat.children) {
                const found = findCategoryById(cat.children, targetId);
                if (found) return found;
              }
            }
            return null;
          };

          const listToDisplay = realms.map(realm => {
            const category = findCategoryById(allCategories, realm.categoryId);
            return {
              title: realm.title || (category ? category.name : ''),
              subtitle: realm.subtitle || '',
              path: category ? category.fullPath : '/',
              imageUrl: realm.imageUrl
            };
          });

          if (listToDisplay.length === 0) return null;

          return (
            <div className="max-w-5xl mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 auto-rows-[180px] md:auto-rows-[250px]">
                {listToDisplay.map((item, index) => {
                  // Dynamic bento box sizing pattern
                  const pos = index % 4;
                  let spanClass = "col-span-1 md:col-span-2 md:row-span-1"; // default wide
                  if (pos === 0) spanClass = "col-span-1 md:col-span-2 md:row-span-2"; // Large tall
                  else if (pos === 1) spanClass = "col-span-1 md:col-span-2 md:row-span-1"; // Wide
                  else if (pos === 2) spanClass = "col-span-1 md:col-span-1 md:row-span-1"; // Square
                  else if (pos === 3) spanClass = "col-span-1 md:col-span-1 md:row-span-1"; // Square

                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      className={`relative group overflow-hidden rounded-3xl block shadow-sm hover:shadow-2xl transition-all duration-500 ${spanClass}`}
                    >
                      {/* Background Image */}
                      <div className="absolute inset-0 bg-gray-100">
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out"
                        />
                      </div>

                      {/* Gradient Overlay for Text Readability */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500"></div>

                      {/* Text Content */}
                      {(item.title || item.subtitle) && (
                        <div className="absolute inset-x-0 bottom-0 p-3 md:p-8 lg:p-10 z-20">
                          <div className="transform md:translate-y-4 md:group-hover:translate-y-0 transition-transform duration-500">
                            {item.subtitle && (
                              <p className="text-brand-orange text-[10px] md:text-[11px] uppercase font-bold tracking-[0.3em] mb-3 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-75">
                                {item.subtitle}
                              </p>
                            )}
                            {item.title && (
                              <h4 className="text-white text-sm md:text-2xl lg:text-4xl font-medium font-sans leading-tight">
                                {item.title}
                              </h4>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Interactive Link */}
                      <Link
                        to={item.path}
                        className="absolute inset-0 z-10"
                        aria-label={`Shop ${item.title}`}
                      />
                    </motion.div>
                  );
                })}
              </div>
            </div>
          );
        })()}
      </section>


      {/* Featured Treasures Section */}
      {featuredTreasures.length > 0 && (
        <section className="py-12 md:py-16 max-w-[1536px] mx-auto px-6 lg:px-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 md:mb-24 text-center"
          >
            <div className="mb-8">
              <span className="text-[10px] md:text-[11px] uppercase font-bold tracking-[0.5em] text-brand-orange mb-4 block">The Selection</span>
              <h2 className="text-4xl md:text-6xl font-sans font-medium text-text-main tracking-tight mb-8">Customer Favourites</h2>
              <div className="w-16 md:w-32 h-[1px] bg-brand-orange/30 mx-auto" />
            </div>
          </motion.div>

          <div className="relative group px-4">
            {/* Left Arrow */}
            {featuredTreasures.length > 4 && (
              <button
                onClick={() => scroll(featuredRef, 'left')}
                className="absolute left-0 top-[38%] -translate-y-1/2 -translate-x-8 md:-translate-x-14 z-10 p-3.5 rounded-full bg-white shadow-lg border border-gray-150 hover:bg-brand-orange hover:text-white text-gray-700 hover:scale-110 hover:shadow-xl transition-all opacity-0 group-hover:opacity-100 hidden md:block active:scale-95"
                aria-label="Scroll left"
              >
                <ArrowLeft size={18} strokeWidth={2} />
              </button>
            )}

            {/* Right Arrow */}
            {featuredTreasures.length > 4 && (
              <button
                onClick={() => scroll(featuredRef, 'right')}
                className="absolute right-0 top-[38%] -translate-y-1/2 translate-x-8 md:translate-x-14 z-10 p-3.5 rounded-full bg-white shadow-lg border border-gray-150 hover:bg-brand-orange hover:text-white text-gray-700 hover:scale-110 hover:shadow-xl transition-all opacity-0 group-hover:opacity-100 hidden md:block active:scale-95"
                aria-label="Scroll right"
              >
                <ArrowRight size={18} strokeWidth={2} />
              </button>
            )}

            <div
              ref={featuredRef}
              className="flex space-x-8 overflow-x-auto pb-12 no-scrollbar scroll-smooth snap-x"
            >
              {featuredTreasures.map(product => (
                <div key={product.id} className="flex-shrink-0 w-[200px] md:w-[280px] snap-start">
                  <ProductCard {...product} />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center pt-1">
            <Link to="/collections" className="inline-flex group items-center gap-4 text-[11px] font-bold uppercase tracking-[0.2em] border-b border-gray-200 pb-2 hover:text-brand-orange hover:border-brand-orange transition-all">
              View All Collection
              <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </section>
      )}

      {/* Artisan's Bloom Section */}
      {trends.length > 0 && (
        <section className="py-6 md:py-8 bg-bg-alt">
          <div className="max-w-[1536px] mx-auto px-6 lg:px-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-16 md:mb-24 text-center"
            >
              <span className="text-[10px] md:text-[11px] uppercase font-bold tracking-[0.5em] text-brand-orange mb-4 block">Curated Styles</span>
              <h2 className="text-4xl md:text-6xl font-sans font-medium text-text-main tracking-tight mb-8">Shop By Trend</h2>
              <div className="w-16 md:w-32 h-[1px] bg-brand-orange/30 mx-auto" />
            </motion.div>

            <div
              ref={artisanRef}
              className="flex space-x-8 overflow-x-auto pb-12 no-scrollbar scroll-smooth snap-x"
            >
              {trends.map((trend) => (
                <div key={trend.id} className="flex-shrink-0 w-[280px] md:w-[380px] bg-white rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center md:space-x-6 space-y-6 md:space-y-0 shadow-sm transition-all group hover:shadow-xl duration-500">
                  <div className="w-24 h-24 md:w-40 md:h-40 rounded-2xl md:rounded-3xl overflow-hidden flex-shrink-0 bg-white border-4 border-white shadow-md flex items-center justify-center p-2">
                    <img src={trend.imageUrl} alt={trend.title} className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110" />
                  </div>
                  <div className="text-center md:text-left flex-1">
                    <h3 className="text-lg md:text-xl font-sans font-bold text-text-main mb-2 md:mb-3">
                      {trend.title}
                    </h3>
                    <p className="text-text-muted text-[12px] md:text-sm leading-relaxed mb-4 md:mb-6 line-clamp-2 md:line-clamp-none">
                      {trend.description}
                    </p>
                    <button 
                      onClick={() => {
                        setSelectedTrend(trend);
                        setIsTrendModalOpen(true);
                      }}
                      className="text-[11px] md:text-[12px] font-bold text-text-main border-b-2 border-text-main/20 pb-0.5 hover:text-brand-orange hover:border-brand-orange transition-all duration-300 inline-flex items-center gap-1 group/link cursor-pointer"
                    >
                      Discover More
                      <ChevronRight size={14} className="group-hover/link:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              ))}
              {/* Spacer for horizontal scroll padding */}
              <div className="flex-shrink-0 w-6 md:hidden" />
            </div>
          </div>
        </section>
      )}

      {/* Stories in Motion Section - Video Section */}
      {looks.length > 0 && (
        <section className="py-12 md:py-16 bg-white overflow-hidden">
          <div className="max-w-[1536px] mx-auto px-6 lg:px-24">
            <div className="text-center mb-8 md:mb-12">
              <span className="text-[10px] md:text-[11px] uppercase font-bold tracking-[0.5em] text-brand-orange mb-4 block">Stories in Motion</span>
              <h2 className="text-3xl md:text-[56px] font-sans text-text-main tracking-normal leading-tight">Shop The Look</h2>
              <div className="mx-auto w-16 md:w-24 h-[1px] bg-brand-orange opacity-40 mt-6" />
            </div>

            <div className="relative group px-4">
              {/* Left Arrow */}
              {looks.length > 4 && (
                <button
                  onClick={() => scroll(videoRef, 'left')}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-8 md:-translate-x-14 z-10 p-3 rounded-full bg-white shadow-lg border border-gray-150 hover:bg-gray-50 text-gray-700 transition-all opacity-0 group-hover:opacity-100 hidden md:block active:scale-95"
                  aria-label="Scroll left"
                >
                  <ChevronLeft size={20} />
                </button>
              )}

              {/* Right Arrow */}
              {looks.length > 4 && (
                <button
                  onClick={() => scroll(videoRef, 'right')}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-8 md:translate-x-14 z-10 p-3 rounded-full bg-white shadow-lg border border-gray-150 hover:bg-gray-50 text-gray-700 transition-all opacity-0 group-hover:opacity-100 hidden md:block active:scale-95"
                  aria-label="Scroll right"
                >
                  <ChevronRight size={20} />
                </button>
              )}

              <div
                ref={videoRef}
                className={`flex flex-nowrap gap-6 pb-12 overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth ${
                  looks.length > 4 
                    ? 'justify-start md:overflow-x-auto' 
                    : 'justify-start md:justify-center md:overflow-visible'
                }`}
              >
                {looks.map((video) => (
                  <div key={video.id} className="snap-center flex-shrink-0 cursor-pointer" onClick={() => openVideo(video)}>
                    <VideoCard
                      videoUrl={resolveVideoUrl(video.url)}
                      title={video.title}
                      category={video.category}
                      thumbnail={video.thumbnail}
                      productImage={video.productImage}
                      productId={video.productId}
                      productIds={video.productIds}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Video Modal Interface */}
      <VideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        look={selectedVideo}
        onNext={() => {
          const currentIndex = looks.findIndex(l => l.id === selectedVideo?.id);
          const nextIndex = (currentIndex + 1) % looks.length;
          const nextLook = looks[nextIndex];
          setSelectedVideo({ ...nextLook, url: resolveVideoUrl(nextLook.url) });
        }}
        onPrev={() => {
          const currentIndex = looks.findIndex(l => l.id === selectedVideo?.id);
          const prevIndex = (currentIndex - 1 + looks.length) % looks.length;
          const prevLook = looks[prevIndex];
          setSelectedVideo({ ...prevLook, url: resolveVideoUrl(prevLook.url) });
        }}
      />

      {/* Our Purpose / Impact Section */}
      {purpose && (
        <section className="py-12 md:py-16 bg-white overflow-hidden">
          <div className="max-w-[1536px] mx-auto px-6 lg:px-24">
            <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-32">
              {/* Left Column: Artistic Image Framing */}
              <div className="relative w-full lg:w-[40%] flex justify-center">
                {/* Decorative Background Shapes - Scaled down */}
                <div className="absolute -top-8 -left-8 w-32 h-32 bg-[#D0E9E8] rounded-full opacity-40 mix-blend-multiply" />
                <div className="absolute -bottom-12 -right-4 w-48 h-48 bg-[#FCECD8] rounded-full opacity-50 mix-blend-multiply" />

                {/* Main Image in Custom Shape - More compact */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  className="relative z-10 w-full max-w-[320px] md:max-w-[400px] aspect-[4/5] overflow-hidden rounded-[3rem] md:rounded-[4rem] border-4 border-white shadow-xl"
                >
                  <img
                    src={purpose.image}
                    alt="Artisan at work"
                    className="w-full h-full object-cover grayscale-[20%] hover:grayscale-0 transition-all duration-1000"
                  />
                </motion.div>
              </div>

              {/* Right Column: Narrative Content */}
              <div className="w-full lg:w-[60%] lg:pl-12">
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.2 }}
                >
                  <span className="text-accent text-[10px] md:text-[11px] font-bold uppercase tracking-[0.3em] mb-4 block">
                    {purpose.accent}
                  </span>

                  <h2 className="text-2xl md:text-4xl lg:text-5xl font-sans font-medium text-text-main leading-tight mb-6 tracking-tight">
                    {purpose.title}
                  </h2>

                  <p className="text-text-muted text-sm md:text-base leading-relaxed mb-8 max-w-xl">
                    {purpose.description}
                  </p>

                  {/* Growth Stats Grid - More compact */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-8 py-6 border-y border-gray-100">
                    {purpose.stats && purpose.stats.map((stat, idx) => (
                      <div key={idx}>
                        <span className="text-3xl md:text-4xl font-sans font-bold text-accent block mb-1">{stat.value}</span>
                        <span className="text-[9px] uppercase font-bold tracking-[0.1em] text-text-muted/60">{stat.label}</span>
                      </div>
                    ))}
                  </div>

                  <Link to="/manifesto" className="group inline-flex items-center space-x-3 text-[13px] font-bold text-text-main transition-colors">
                    <span className="border-b-2 border-text-main pb-1 group-hover:border-brand-orange group-hover:text-brand-orange transition-all">
                      {purpose.buttonText || "Our Full Manifesto"}
                    </span>
                    <svg
                      width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                      className="translate-y-0.5 group-hover:translate-x-1 transition-transform"
                    >
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </Link>
                </motion.div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Review Section */}
      {testimonials.length > 0 && (
        <section className="py-10 md:py-16 bg-[#F9F7F5] overflow-hidden">
          <div className="max-w-[1536px] mx-auto px-6 lg:px-24 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-20"
            >
              <h2 className="text-3xl md:text-6xl font-sans font-medium text-text-main tracking-tight">Speaking from their hearts</h2>
              <div className="mx-auto w-16 md:w-24 h-1 bg-brand-orange mt-4 md:mt-6 rounded-none opacity-30" />
            </motion.div>

            <div className="relative group/testimonials px-4 md:px-14 lg:px-16">
              <div className="relative overflow-hidden">
                <div
                  ref={testimonialRef}
                  className="flex gap-8 overflow-x-auto snap-x snap-mandatory scroll-smooth hide-scrollbar px-4"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {testimonialsLoading ? (
                    <div className="flex items-center justify-center w-full py-20">
                      <Loader2 className="w-8 h-8 animate-spin text-brand-orange" />
                    </div>
                  ) : testimonials.map((review, index) => (
                    <TestimonialCard key={review.id} review={review} index={index} />
                  ))}
                </div>
              </div>

              {/* Navigation Arrows */}
              <button
                onClick={() => scroll(testimonialRef, 'left')}
                className="absolute left-2 lg:left-4 top-1/2 -translate-y-1/2 p-3 bg-white border border-gray-100 rounded-none shadow-lg opacity-60 hover:opacity-100 hover:bg-brand-orange hover:text-white transition-all z-10 hidden md:block"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={() => scroll(testimonialRef, 'right')}
                className="absolute right-2 lg:right-4 top-1/2 -translate-y-1/2 p-3 bg-white border border-gray-100 rounded-none shadow-lg opacity-60 hover:opacity-100 hover:bg-brand-orange hover:text-white transition-all z-10 hidden md:block"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Workshop Section */}
      <section className="py-10 md:py-20 lg:py-32 bg-white px-4 md:px-6 lg:px-24">
        <div className="max-w-[1536px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16 md:mb-24"
          >
            <h2 className="text-3xl md:text-6xl font-sans font-medium text-text-main tracking-tight">Artisanal Workshops</h2>
            <div className="mx-auto w-16 md:w-24 h-1 bg-brand-orange mt-4 md:mt-6 rounded-none opacity-30" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {workshops.map((ws, idx) => (
              <motion.div
                key={ws.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.8 }}
                className="group cursor-pointer"
                onClick={() => {
                  setSelectedWorkshop(ws);
                  setWorkshopModalInitialTab('details');
                  setWorkshopModalOpen(true);
                }}
              >
                <div className="relative aspect-video md:aspect-square rounded-2xl overflow-hidden mb-4 md:mb-6 shadow-md md:shadow-lg bg-[#FAF9F6] flex items-center justify-center">
                  {ws.image ? (
                    <img src={ws.image} alt={ws.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <Calendar size={48} className="text-gray-200" />
                    </div>
                  )}
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-brand-orange">{formatWorkshopDate(ws.date)}</p>
                  </div>
                </div>
                <h3 className="text-lg md:text-xl font-sans font-medium text-text-main mb-2 md:mb-3 group-hover:text-brand-orange transition-colors line-clamp-2">{ws.name}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-4 md:mb-6 line-clamp-2">{ws.summary}</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!user) {
                      toast.error("Please login or sign up first to book a workshop slot.");
                      setLoginModalOpen(true);
                      return;
                    }
                    setSelectedWorkshop(ws);
                    setWorkshopModalInitialTab('form');
                    setWorkshopModalOpen(true);
                  }}
                  className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-text-main hover:gap-4 transition-all cursor-pointer"
                >
                  Book Slot <ChevronRight size={14} />
                </button>
              </motion.div>
            ))}
          </div>
          {workshops.length === 0 && !workshopsLoading && (
            <div className="text-center py-20">
              <p className="text-gray-400 text-sm">No workshops available at the moment. Stay tuned!</p>
            </div>
          )}
        </div>
      </section>



      {/* Workshop Modal */}
      <WorkshopModal
        isOpen={workshopModalOpen}
        onClose={() => setWorkshopModalOpen(false)}
        workshop={selectedWorkshop}
        initialTab={workshopModalInitialTab}
      />

      {/* Trend Products Modal */}
      <TrendProductsModal
        isOpen={isTrendModalOpen}
        onClose={() => setIsTrendModalOpen(false)}
        trend={selectedTrend}
        products={products}
      />
    </div>
  );
}
