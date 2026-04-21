import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../../components/user/ProductCard';
import VideoCard from '../../components/user/VideoCard';
import VideoModal from '../../components/user/VideoModal';
import TestimonialCard from '../../components/user/TestimonialCard';
import { ChevronLeft, ChevronRight, Plus, Loader2 } from 'lucide-react';

import { db } from '../../firebase';
import { collection, onSnapshot, query, orderBy, doc } from 'firebase/firestore';
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

  const featuredRef = useRef(null);
  const artisanRef = useRef(null);
  const videoRef = useRef(null);
  const testimonialRef = useRef(null);

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
  useEffect(() => {
    let productsList = [];

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
        return product ? { ...product, originalFeaturedId: ft.id } : null;
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
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
      console.error("Banners fetch error:", error);
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
      console.error("Realms fetch error:", error);
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
      console.error("Trends fetch error:", error);
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
      console.error("Looks fetch error:", error);
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
      console.error("Purpose fetch error:", error);
      setPurposeLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Load Testimonials from Firestore
  useEffect(() => {
    const q = query(collection(db, 'testimonials'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTestimonials(data);
      setTestimonialsLoading(false);
    }, (error) => {
      console.error("Testimonials fetch error:", error);
      setTestimonialsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Auto-slide Testimonials
  useEffect(() => {
    if (testimonialsLoading || testimonials.length === 0) return;

    const interval = setInterval(() => {
      if (testimonialRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = testimonialRef.current;
        // If we are at the end, scroll back to start, otherwise scroll right
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          testimonialRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          scroll(testimonialRef, 'right');
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [testimonials, testimonialsLoading]);

  const scroll = (ref, direction) => {
    if (ref.current) {
      const { scrollLeft, clientWidth } = ref.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      ref.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  const displaySlides = banners;

  const openVideo = (video) => {
    setSelectedVideo(video);
    setIsVideoModalOpen(true);
  };

  useEffect(() => {
    if (displaySlides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % displaySlides.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [displaySlides.length]);

  const getSlotClasses = (slotId) => {
    switch (slotId) {
      case 1: return "md:col-span-1 md:row-span-2 relative group overflow-hidden rounded-[2rem] md:rounded-[2.5rem] shadow-md hover:shadow-xl transition-all duration-500 h-[320px] md:h-full";
      case 2: return "md:col-span-1 md:row-span-1 relative group overflow-hidden rounded-[2.5rem] shadow-lg h-[220px] md:h-full";
      case 3: return "md:col-span-1 md:row-span-1 relative group overflow-hidden rounded-[2.5rem] shadow-lg h-[220px] md:h-full";
      case 4: return "md:col-span-2 md:row-span-1 relative group overflow-hidden rounded-[2.5rem] shadow-lg h-[220px] md:h-full";
      default: return "";
    }
  };

  return (
    <div className="bg-white min-h-screen relative">
      <AnimatePresence>
        {showSplash && <SplashScreen />}
      </AnimatePresence>

      {/* Cinematic Banner Slider */}
      <section className="relative h-[35vh] sm:h-[45vh] md:h-[600px] w-full flex items-center overflow-hidden bg-white">
        {bannersLoading ? (
          <div className="aspect-[5/2] w-full flex items-center justify-center bg-brand-gray/50 animate-pulse">
            <Loader2 className="w-8 h-8 animate-spin text-brand-orange" />
          </div>
        ) : (
          <div className="relative aspect-[5/2] w-full overflow-hidden">
            <div className="absolute inset-0 w-full h-full">
              {/* Full Width Hero Image */}
              <img
                src={displaySlides[currentSlide]?.imageUrl}
                alt={displaySlides[currentSlide]?.title || "Banner"}
                className="w-full h-full object-cover object-center"
              />

              {/* Hero Overlay (Static) */}
              <div className="absolute inset-0 bg-brand-black/10 flex items-center px-[5%] md:px-[8%] pointer-events-none">
                <div className="max-w-2xl md:max-w-4xl">
                  {displaySlides[currentSlide]?.accent && (
                    <span className="inline-block text-white text-[10px] md:text-[14px] font-bold tracking-[0.4em] uppercase mb-2 md:mb-4">
                      {displaySlides[currentSlide].accent}
                    </span>
                  )}
                  {displaySlides[currentSlide]?.title && (
                    <h1
                      className="text-white font-fashion font-bold leading-[1.1] md:leading-tight"
                      style={{ fontSize: 'clamp(18px, 4.5vw, 56px)' }}
                    >
                      {displaySlides[currentSlide].title}
                    </h1>
                  )}
                </div>
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
      <section className="py-10 md:py-16 max-w-[1536px] mx-auto px-4 md:px-8 lg:px-[60px] bg-white">
        <div className="mb-10 md:mb-14">
          <h2 className="font-fashion font-bold text-brand-black tracking-tight mb-2" style={{ fontSize: 'clamp(22px, 3vw, 42px)' }}>Explore Category</h2>
          <div className="w-16 md:w-24 h-1 bg-brand-orange opacity-40 rounded-full" />
        </div>

        {realmsLoading ? (
          <div className="flex items-center justify-center h-[300px]">
            <Loader2 className="w-8 h-8 animate-spin text-brand-orange" />
          </div>
        ) : realms.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
            {realms.map((realm) => (
              <motion.div
                key={realm.id}
                whileHover={{ y: -6 }}
                className="relative group aspect-square w-full max-w-[220px] mx-auto overflow-hidden rounded-2xl md:rounded-3xl shadow-sm hover:shadow-xl transition-all duration-500"
              >
                <img
                  src={realm.imageUrl}
                  alt={realm.title}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white text-center">
                  <h3 className="text-sm md:text-lg font-fashion font-bold mb-0.5 tracking-tight line-clamp-1">
                    {realm.title}
                  </h3>
                  <Link to={`/category/${realm.categoryId}`} className="absolute inset-0 z-10" />
                </div>
              </motion.div>
            ))}
          </div>
        ) : null}
      </section>

      {/* Featured Treasures Section */}
      {featuredTreasures.length > 0 && (
        <section className="pt-10 md:pt-16 pb-6 md:pb-8 max-w-[1536px] mx-auto px-6 lg:px-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-16 space-y-4 md:space-y-0 text-center md:text-left">
            <div>
              <span className="text-[10px] md:text-[12px] uppercase font-bold tracking-[0.4em] text-brand-orange mb-3 md:mb-4 block">The Selection</span>
              <h2 className="text-3xl md:text-6xl font-fashion font-bold text-text-main tracking-tight leading-tight">Customer Favourites</h2>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => scroll(featuredRef, 'left')}
                className="p-3 border border-gray-200 rounded-full bg-white hover:bg-brand-orange hover:text-white transition-all shadow-sm active:scale-90"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={() => scroll(featuredRef, 'right')}
                className="p-3 border border-gray-200 rounded-full bg-white hover:bg-brand-orange hover:text-white transition-all shadow-sm active:scale-90"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          </div>

          <div
            ref={featuredRef}
            className="flex space-x-8 overflow-x-auto pb-12 no-scrollbar scroll-smooth snap-x"
          >
            {featuredTreasures.map(product => (
              <div key={product.id} className="flex-shrink-0 w-[220px] md:w-[350px] snap-start">
                <ProductCard {...product} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Artisan's Bloom Section */}
      {trends.length > 0 && (
        <section className="py-6 md:py-8 bg-bg-alt">
          <div className="max-w-[1536px] mx-auto px-6 lg:px-24">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-12 md:mb-16 space-y-6 md:space-y-0 text-center md:text-left">
              <h2 className="text-3xl md:text-5xl font-fashion font-bold text-text-main tracking-tight">Shop By Trend</h2>
              <div className="flex space-x-4">
                <button
                  onClick={() => scroll(artisanRef, 'left')}
                  className="p-3 border border-gray-200 rounded-full bg-white hover:bg-text-main hover:text-white transition-all shadow-sm active:scale-90"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={() => scroll(artisanRef, 'right')}
                  className="p-3 border border-gray-200 rounded-full bg-white hover:bg-text-main hover:text-white transition-all shadow-sm active:scale-90"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            <div
              ref={artisanRef}
              className="flex space-x-8 overflow-x-auto pb-12 no-scrollbar scroll-smooth snap-x"
            >
              {trends.map((trend) => (
                <div key={trend.id} className="flex-shrink-0 w-[280px] md:w-[450px] bg-white rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 flex flex-col md:flex-row items-center md:space-x-8 space-y-6 md:space-y-0 shadow-sm transition-all group hover:shadow-xl duration-500">
                  <div className="w-24 h-24 md:w-40 md:h-40 rounded-full overflow-hidden flex-shrink-0 bg-gray-50 border-4 border-white shadow-md">
                    <img src={trend.imageUrl} alt={trend.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  </div>
                  <div className="text-center md:text-left flex-1">
                    <span className="text-[9px] md:text-[10px] uppercase font-bold tracking-[0.2em] text-accent mb-2 md:mb-3 block">
                      {trend.accent}
                    </span>
                    <h3 className="text-lg md:text-xl font-fashion font-bold text-text-main mb-2 md:mb-3">
                      {trend.title}
                    </h3>
                    <p className="text-text-muted text-[12px] md:text-sm leading-relaxed mb-4 md:mb-6 line-clamp-2 md:line-clamp-none">
                      {trend.description}
                    </p>
                    <Link to="/shop" className="text-[11px] md:text-[12px] font-bold text-text-main border-b-2 border-text-main/20 pb-0.5 hover:text-brand-orange hover:border-brand-orange transition-all duration-300 inline-flex items-center gap-1 group/link">
                      Discover More
                      <ChevronRight size={14} className="group-hover/link:translate-x-0.5 transition-transform" />
                    </Link>
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
        <section className="pt-6 md:pt-8 pb-10 md:pb-16 bg-white overflow-hidden">
          <div className="max-w-[1536px] mx-auto px-6 lg:px-24">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-3xl md:text-5xl font-fashion font-bold text-text-main tracking-tight">Shop The Look</h2>
              <div className="mx-auto w-16 h-1 bg-brand-orange mt-4 rounded-full opacity-30" />
            </div>

            <div
              ref={videoRef}
              className="flex flex-nowrap justify-start md:justify-center gap-6 pb-12 overflow-x-auto md:overflow-visible no-scrollbar snap-x snap-mandatory"
            >
              {looks.map((video) => (
                <div key={video.id} className="snap-center" onClick={() => openVideo(video)}>
                  <VideoCard
                    videoUrl={video.url}
                    title={video.title}
                    category={video.category}
                    thumbnail={video.thumbnail}
                    productImage={video.productImage}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Video Modal Interface */}
      <VideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        videoUrl={selectedVideo?.url}
        title={selectedVideo?.title}
      />

      {/* Our Purpose / Impact Section */}
      {purpose && (
        <section className="py-10 md:py-16 bg-white overflow-hidden">
          <div className="max-w-[1536px] mx-auto px-6 lg:px-24">
            <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-32">
              {/* Left Column: Artistic Image Framing */}
              <div className="relative w-full lg:w-1/2">
                {/* Decorative Background Shapes */}
                <div className="absolute -top-12 -left-12 w-48 h-48 bg-[#D0E9E8] rounded-full opacity-60 mix-blend-multiply" />
                <div className="absolute -bottom-16 -right-8 w-64 h-64 bg-[#FCECD8] rounded-full opacity-70 mix-blend-multiply" />

                {/* Main Image in Custom Shape */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  className="relative z-10 aspect-square md:aspect-[4/5] overflow-hidden rounded-[40%] md:rounded-[45%_55%_45%_55%] border-8 border-white shadow-2xl"
                >
                  <img
                    src={purpose.image}
                    alt="Artisan at work"
                    className="w-full h-full object-cover grayscale-[20%] hover:grayscale-0 transition-all duration-1000"
                  />
                </motion.div>
              </div>

              {/* Right Column: Narrative Content */}
              <div className="w-full lg:w-1/2">
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.2 }}
                >
                  <span className="text-accent text-[12px] font-bold uppercase tracking-[0.4em] mb-6 block">
                    {purpose.accent}
                  </span>

                  <h2 className="text-3xl md:text-6xl font-fashion font-bold text-text-main leading-[1.1] mb-8 md:mb-10 tracking-tight">
                    {purpose.title}
                  </h2>

                  <p className="text-text-muted text-lg md:text-xl leading-relaxed mb-12 max-w-xl">
                    {purpose.description}
                  </p>

                  {/* Growth Stats Grid */}
                  <div className="grid grid-cols-2 gap-12 mb-12 py-8 border-y border-gray-100">
                    {purpose.stats && purpose.stats.map((stat, idx) => (
                      <div key={idx}>
                        <span className="text-4xl md:text-5xl font-fashion font-bold text-accent block mb-2">{stat.value}</span>
                        <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-text-muted/40">{stat.label}</span>
                      </div>
                    ))}
                  </div>

                  <Link to="/about" className="group inline-flex items-center space-x-3 text-[14px] font-bold text-text-main transition-colors">
                    <span className="border-b-2 border-text-main pb-1 group-hover:border-brand-orange group-hover:text-brand-orange transition-all">
                      {purpose.buttonText || "Our Full Manifesto"}
                    </span>
                    <svg
                      width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
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
              <h2 className="text-3xl md:text-6xl font-fashion font-bold text-text-main tracking-tight">Speaking from their hearts</h2>
              <div className="mx-auto w-16 md:w-24 h-1 bg-brand-orange mt-4 md:mt-6 rounded-none opacity-30" />
            </motion.div>

            <div className="relative group/testimonials">
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
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 p-3 bg-white border border-gray-100 rounded-none shadow-lg hover:bg-brand-orange hover:text-white transition-all opacity-0 group-hover/testimonials:opacity-100 z-10 hidden md:block"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={() => scroll(testimonialRef, 'right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 p-3 bg-white border border-gray-100 rounded-none shadow-lg hover:bg-brand-orange hover:text-white transition-all opacity-0 group-hover/testimonials:opacity-100 z-10 hidden md:block"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Stay Connected / Newsletter Section */}
      <section className="py-10 md:py-16 bg-white px-6 lg:px-24">
        <div className="max-w-[1440px] mx-auto relative overflow-hidden bg-brand-orange rounded-[2rem] md:rounded-[4rem] px-6 md:px-16 py-12 md:py-24 text-center">

          {/* Decorative Background Circles (Matching Theme) */}
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-brand-orange-dark rounded-full opacity-40 blur-3xl" />
          <div className="absolute top-1/2 -right-32 w-80 h-80 bg-brand-orange-light/20 rounded-full opacity-30 blur-[100px] -translate-y-1/2" />
          <div className="absolute -bottom-16 left-1/4 w-48 h-48 bg-brand-orange-dark/30 rounded-full opacity-20 blur-2xl" />

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="relative z-10 max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-fashion font-bold text-white mb-6 leading-tight text-center">
              Stay Connected with <br className="hidden md:block" /> Handmade Fashion
            </h2>

            <p className="text-white/90 text-lg md:text-xl font-light mb-12 max-w-2xl mx-auto leading-relaxed">
              Join our inner circle for exclusive early access to limited artisanal drops and stories from our workshop.
            </p>

            {/* Newsletter Form */}
            <form className="flex flex-col md:flex-row items-center justify-center gap-4 max-w-xl mx-auto">
              <div className="relative w-full">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="w-full bg-white/10 border border-white/20 text-white placeholder:text-white/40 px-8 py-4 rounded-full focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all backdrop-blur-sm"
                />
              </div>
              <button
                type="submit"
                className="w-full md:w-auto bg-white text-brand-orange hover:bg-brand-orange-light px-10 py-4 rounded-full font-bold uppercase text-[12px] tracking-widest transition-all shadow-xl shadow-black/10 active:scale-95"
              >
                Subscribe
              </button>
            </form>
          </motion.div>
        </div>
      </section>
    </div>
  );
}


