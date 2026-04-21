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

export default function Home() {
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

  // Load All Products and Featured Treasures
  useEffect(() => {
    let productsList = [];

    // 1. Listen to all products (to get live details for any featured item)
    const qProd = query(collection(db, 'products'));
    const unsubscribeProd = onSnapshot(qProd, (snapshot) => {
      productsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    });

    // 2. Listen to featured treasures configuration
    const qFt = query(collection(db, 'featuredTreasures'), orderBy('order', 'asc'));
    const unsubscribeFt = onSnapshot(qFt, (snapshot) => {
      const ftData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Hydrate with product details
      const hydrated = ftData.map(ft => {
        const product = productsList.find(p => p.id === ft.productId);
        return product ? { ...product, originalFeaturedId: ft.id } : null;
      }).filter(Boolean);

      setFeaturedTreasures(hydrated);
      setFtLoading(false);
    });

    return () => {
      unsubscribeProd();
      unsubscribeFt();
    };
  }, []);

  // Load Banners from Firestore
  useEffect(() => {
    const q = query(collection(db, 'banners'), orderBy('order', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBanners(data);
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
    <div className="bg-white min-h-screen">
      {/* Cinematic Banner Slider */}
      <section className="relative h-[35vh] sm:h-[45vh] md:h-[600px] w-full flex items-center overflow-hidden bg-white">
        {bannersLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-brand-gray/50 backdrop-blur-sm z-30">
            <Loader2 className="w-10 h-10 animate-spin text-brand-orange" />
          </div>
        ) : (
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={currentSlide}
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '-100%', opacity: 0 }}
              transition={{
                duration: 1.2,
                ease: [0.4, 0, 0.2, 1],
                opacity: { duration: 0.8 }
              }}
              className="absolute inset-0 w-full h-full"
            >
              {/* Background Image */}
              <div className="absolute inset-0 w-full h-full">
                <img
                  src={displaySlides[currentSlide]?.imageUrl}
                  alt={displaySlides[currentSlide]?.title || "Banner"}
                  className="w-full h-full object-cover object-center"
                />
                {/* Refined Gradient Overlay for better text legibility */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
              </div>

              {/* Content Overlay */}
              <div className="absolute inset-0 z-10 flex items-center px-8 lg:px-24">
                <div className="max-w-4xl">
                  {displaySlides[currentSlide]?.accent && (
                    <motion.span
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5, duration: 0.8 }}
                      className="inline-block text-white text-[12px] md:text-[14px] font-bold tracking-[0.5em] uppercase mb-6"
                    >
                      {displaySlides[currentSlide].accent}
                    </motion.span>
                  )}

                  {displaySlides[currentSlide]?.title && (
                    <motion.h2
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7, duration: 1 }}
                      className="text-4xl md:text-7xl lg:text-8xl font-fashion font-bold text-white mb-8 leading-[1.1] tracking-tight whitespace-pre-line"
                    >
                      {displaySlides[currentSlide].title}
                    </motion.h2>
                  )}

                  {displaySlides[currentSlide]?.description && (
                    <motion.p
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.9, duration: 1 }}
                      className="text-white/80 text-lg md:text-xl font-light mb-12 max-w-xl leading-relaxed"
                    >
                      {displaySlides[currentSlide].description}
                    </motion.p>
                  )}

                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        )}

        {/* Minimalist Floating Navigation Arrows */}
        {!bannersLoading && displaySlides.length > 1 && (
          <>
            <div className="absolute inset-y-0 left-6 flex items-center z-20">
              <button
                onClick={() => setCurrentSlide((prev) => (prev - 1 + displaySlides.length) % displaySlides.length)}
                className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/90 hover:text-brand-orange transition-all active:scale-95 group shadow-lg"
              >
                <ChevronLeft size={20} strokeWidth={2.5} className="group-hover:-translate-x-0.5 transition-transform" />
              </button>
            </div>
            <div className="absolute inset-y-0 right-6 flex items-center z-20">
              <button
                onClick={() => setCurrentSlide((prev) => (prev + 1) % displaySlides.length)}
                className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/90 hover:text-brand-orange transition-all active:scale-95 group shadow-lg"
              >
                <ChevronRight size={20} strokeWidth={2.5} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            {/* Line Progress Indicators (Bottom Center) */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3 z-20">
              {displaySlides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-[4px] rounded-full transition-all duration-700 shadow-sm ${currentSlide === idx ? 'w-24 bg-white' : 'w-12 bg-white/30 hover:bg-white/50'
                    }`}
                />
              ))}
            </div>
          </>
        )}
      </section>

      {/* Curated Realms Section */}
      <section className="py-20 max-w-[1440px] mx-auto px-8 lg:px-24 bg-white">
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-fashion font-bold text-text-main tracking-tight mb-2">Explore Category</h2>
          <div className="w-16 h-1 bg-brand-orange/60 rounded-full" />
        </div>

        {realmsLoading ? (
          <div className="flex items-center justify-center h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-brand-orange" />
          </div>
        ) : realms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-[1.4fr_0.8fr_0.8fr] gap-6 h-auto md:h-[650px]">
            {realms.map((realm) => (
              <motion.div
                key={realm.id}
                whileHover={{ y: -8 }}
                className={getSlotClasses(realm.slotId)}
              >
                <img
                  src={realm.imageUrl}
                  alt={realm.title}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 md:bottom-8 md:left-8 text-white">
                  <h3 className={`${realm.slotId === 1 || realm.slotId === 4 ? 'text-2xl' : 'text-lg'} font-fashion font-bold mb-1 tracking-tight`}>
                    {realm.title}
                  </h3>
                  {realm.subtitle && (
                    <p className="text-white/70 text-[10px] tracking-[0.2em] font-medium uppercase font-fashion">
                      {realm.subtitle}
                    </p>
                  )}
                </div>
                <Link to={`/category/${realm.categoryId}`} className="absolute inset-0 z-10" />
              </motion.div>
            ))}
          </div>
        ) : null}
      </section>



      {/* Featured Treasures Section */}
      {featuredTreasures.length > 0 && (
        <section className="py-16 md:py-24 max-w-[1536px] mx-auto px-6 lg:px-24">
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
        <section className="py-16 md:py-24 bg-bg-alt">
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
        <section className="py-16 md:py-24 bg-white overflow-hidden">
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
        <section className="py-16 md:py-24 bg-white overflow-hidden">
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
        <section className="py-16 md:py-24 bg-[#F9F7F5] overflow-hidden">
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
      <section className="py-16 md:py-24 bg-white px-6 lg:px-24">
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


