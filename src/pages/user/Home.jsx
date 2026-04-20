import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../../components/user/ProductCard';
import VideoCard from '../../components/user/VideoCard';
import VideoModal from '../../components/user/VideoModal';
import { ChevronLeft, ChevronRight, Plus, Loader2 } from 'lucide-react';

import h1 from '../../assets/h1.png';
import h2 from '../../assets/h2.png';
import h3 from '../../assets/h3.png';
import p1 from '../../assets/p1.jpeg';
import p3 from '../../assets/p3.jpeg';
import p4 from '../../assets/p4.jpeg';
import p5 from '../../assets/p5.jpeg';

import { PRODUCTS } from '../../data/products';

const videos = [
  {
    id: 1,
    title: "Off White Pure Silk Cotton Fabric",
    category: "Heritage Weave",
    url: "https://assets.mixkit.co/videos/preview/mixkit-weaving-on-a-loom-15740-preview.mp4",
    thumbnail: p3,
    productImage: p3
  },
  {
    id: 2,
    title: "Hand-painted Madhubani Heritage",
    category: "Artisan Jewelry",
    url: "https://assets.mixkit.co/videos/preview/mixkit-close-up-of-hands-making-jewelry-41225-preview.mp4",
    thumbnail: p1,
    productImage: p1
  },
  {
    id: 3,
    title: "Traditional Draped Silhouette",
    category: "Saree Stories",
    url: "https://assets.mixkit.co/videos/preview/mixkit-woman-wearing-a-traditional-indian-dress-41131-preview.mp4",
    thumbnail: p5,
    productImage: p5
  },
  {
    id: 4,
    title: "Earthy tones of Natural Dyes",
    category: "Natural Dyes",
    url: "https://assets.mixkit.co/videos/preview/mixkit-colors-in-a-pot-of-dye-39943-preview.mp4",
    thumbnail: p4,
    productImage: p4
  }
];

const slides = [
  {
    id: 1,
    image: h1,
    accent: "HERITAGE EDIT",
    title: "A Woven Chronicle \nof the Northeast",
    description: "Discover the intricate artistry of hand-loomed textiles, crafted with stories of the land.",
    buttonText: "Shop Now"
  },
  {
    id: 2,
    image: h2,
    accent: "ARTISANAL BLOOM",
    title: "Silken Verses \nof Tradition",
    description: "Drape yourself in the elegance of hand-woven heritage, where every thread is a legacy.",
    buttonText: "Discover More"
  },
  {
    id: 3,
    image: h3,
    accent: "CRAFTED ROOTS",
    title: "Timeless Moitfs \nfor the Modern Muse",
    description: "Intricately hand-embroidered ensembles that bridge the gap between ancient art and contemporary style.",
    buttonText: "Explore Now"
  }
];

const reviews = [
  {
    id: 1,
    name: "Ananya Sharma",
    location: "Mumbai, India",
    text: "The craftsmanship is unparalleled. I felt like I was wearing a piece of history. The Banarasi silk has a weight and sheen that only true hand-weaving can achieve.",
    image: "https://images.unsplash.com/photo-1594744803329-a584af1cae21?w=400&q=80",
    rating: 5
  },
  {
    id: 2,
    name: "Priya Kapoor",
    location: "London, UK",
    text: "MayaSindhu doesn't just sell sarees; they sell stories. My bridal ensemble was a masterpiece that drew compliments from everyone. Truly soulful artistry.",
    image: "https://images.unsplash.com/photo-1610030469668-9de19bd49031?w=400&q=80",
    rating: 5
  },
  {
    id: 3,
    name: "Meera Reddy",
    location: "Hyderabad, India",
    text: "Supporting local artisans while looking elegant is a beautiful combination. The attention to detail in the embroidery is something you simply can't find in mass-produced fashion.",
    image: "https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?w=400&q=80",
    rating: 5
  }
];

import { db } from '../../firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [realms, setRealms] = useState([]);
  const [realmsLoading, setRealmsLoading] = useState(true);
  
  const [featuredTreasures, setFeaturedTreasures] = useState([]);
  const [ftLoading, setFtLoading] = useState(true);
  
  const featuredRef = useRef(null);
  const artisanRef = useRef(null);
  const videoRef = useRef(null);

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

  // Load Curated Realms from Firestore
  useEffect(() => {
    const q = query(collection(db, 'curatedRealms'), orderBy('slotId', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRealms(data);
      setRealmsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const scroll = (ref, direction) => {
    if (ref.current) {
      const { scrollLeft, clientWidth } = ref.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      ref.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  const openVideo = (video) => {
    setSelectedVideo(video);
    setIsVideoModalOpen(true);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

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
      <section className="relative h-[35vh] sm:h-[40vh] md:h-[600px] w-full flex items-center overflow-hidden bg-white">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={currentSlide}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
            className="absolute inset-0 w-full h-full"
          >
            {/* Background Image */}
            <div className="absolute inset-0 w-full h-full">
              <img
                src={slides[currentSlide].image}
                alt={`Slide ${currentSlide + 1}`}
                className="w-full h-full object-contain md:object-cover object-center md:object-top"
              />
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Minimalist Floating Navigation Arrows */}
        <div className="absolute inset-y-0 left-2 md:left-6 flex items-center z-20">
          <button
            onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
            className="w-8 h-8 md:w-12 md:h-12 bg-white/10 backdrop-blur-md rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/90 hover:text-brand-orange transition-all active:scale-95 group shadow-lg"
          >
            <ChevronLeft size={16} md:size={20} strokeWidth={2.5} className="group-hover:-translate-x-0.5 transition-transform" />
          </button>
        </div>
        <div className="absolute inset-y-0 right-2 md:right-6 flex items-center z-20">
          <button
            onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
            className="w-8 h-8 md:w-12 md:h-12 bg-white/10 backdrop-blur-md rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/90 hover:text-brand-orange transition-all active:scale-95 group shadow-lg"
          >
            <ChevronRight size={16} md:size={20} strokeWidth={2.5} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Line Progress Indicators (Bottom Center) */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-[2px] md:h-[4px] rounded-full transition-all duration-500 shadow-sm ${currentSlide === idx ? 'focus:w-10 md:w-24 bg-white' : 'w-4 md:w-12 bg-white/40 hover:bg-white/60'
                }`}
            />
          ))}
        </div>
      </section>

      {/* Curated Realms Section */}
      <section className="py-20 max-w-[1440px] mx-auto px-8 lg:px-24 bg-white">
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-fashion font-bold text-[#1A1A1A] tracking-tight mb-2">Explore Category</h2>
          <div className="w-16 h-1 bg-[#FF6B00]/60 rounded-full" />
        </div>

        {realmsLoading ? (
          <div className="flex items-center justify-center h-[400px]">
             <Loader2 className="w-8 h-8 animate-spin text-brand-orange" />
          </div>
        ) : (
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
        )}
      </section>



      {/* Featured Treasures Section */}
      <section className="py-16 md:py-24 max-w-[1536px] mx-auto px-6 lg:px-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-16 space-y-4 md:space-y-0 text-center md:text-left">
          <div>
            <span className="text-[10px] md:text-[12px] uppercase font-bold tracking-[0.4em] text-brand-orange mb-3 md:mb-4 block">The Selection</span>
            <h2 className="text-3xl md:text-6xl font-fashion font-bold text-[#1A1A1A] tracking-tight leading-tight">Customer Favourites</h2>
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

        {ftLoading ? (
          <div className="flex items-center justify-center h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-brand-orange" />
          </div>
        ) : (
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
        )}
      </section>


      {/* Artisan's Bloom Section */}
      <section className="py-16 md:py-24 bg-[#F0F7FF]">
        <div className="max-w-[1536px] mx-auto px-6 lg:px-24">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-12 md:mb-16 space-y-6 md:space-y-0 text-center md:text-left">
            <h2 className="text-3xl md:text-5xl font-fashion font-bold text-[#1A1A1A] tracking-tight">Shop By Trend</h2>
            <div className="flex space-x-4">
              <button
                onClick={() => scroll(artisanRef, 'left')}
                className="p-3 border border-gray-200 rounded-full bg-white hover:bg-[#1A1A1A] hover:text-white transition-all shadow-sm active:scale-90"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => scroll(artisanRef, 'right')}
                className="p-3 border border-gray-200 rounded-full bg-white hover:bg-[#1A1A1A] hover:text-white transition-all shadow-sm active:scale-90"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div
            ref={artisanRef}
            className="flex space-x-8 overflow-x-auto pb-12 no-scrollbar scroll-smooth snap-x"
          >
            {/* Card 1 */}
            <div className="flex-shrink-0 w-[280px] md:w-[450px] bg-white rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 flex flex-col md:flex-row items-center md:space-x-8 space-y-6 md:space-y-0 shadow-sm transition-all">
              <div className="w-24 h-24 md:w-40 md:h-40 rounded-full overflow-hidden flex-shrink-0 bg-gray-50">
                <img src={PRODUCTS.find(p => p.id === 1).image} alt="Artisanal Earrings" className="w-full h-full object-cover" />
              </div>
              <div className="text-center md:text-left">
                <span className="text-[9px] md:text-[10px] uppercase font-bold tracking-[0.2em] text-[#B08968] mb-2 md:mb-3 block">Boutique Selection</span>
                <h3 className="text-lg md:text-xl font-fashion font-bold text-[#1A1A1A] mb-2 md:mb-3">Artisanal Earring Set</h3>
                <p className="text-gray-500 text-[12px] md:text-sm leading-relaxed mb-4 md:mb-6 line-clamp-2 md:line-clamp-none">Hand-cast by master silversmiths, featuring intricate heritage motifs.</p>
                <Link to="/shop" className="text-[11px] md:text-[12px] font-bold text-[#004D40] border-b-2 border-[#004D40]/20 pb-0.5 hover:text-[#00695C] transition-colors">
                  Discover More
                </Link>
              </div>
            </div>

            {/* Card 2 */}
            <div className="flex-shrink-0 w-[280px] md:w-[450px] bg-white rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 flex flex-col md:flex-row items-center md:space-x-8 space-y-6 md:space-y-0 shadow-sm transition-all">
              <div className="w-24 h-24 md:w-40 md:h-40 rounded-full overflow-hidden flex-shrink-0 bg-gray-50">
                <img src={PRODUCTS.find(p => p.id === 2).image} alt="Madhubani Set" className="w-full h-full object-cover" />
              </div>
              <div className="text-center md:text-left">
                <span className="text-[9px] md:text-[10px] uppercase font-bold tracking-[0.2em] text-[#B08968] mb-2 md:mb-3 block">Hand-painted</span>
                <h3 className="text-lg md:text-xl font-fashion font-bold text-[#1A1A1A] mb-2 md:mb-3">Madhubani Gift Set</h3>
                <p className="text-gray-500 text-[12px] md:text-sm leading-relaxed mb-4 md:mb-6 line-clamp-2 md:line-clamp-none">Authentic hand-painted Madhubani art on sustainable materials.</p>
                <Link to="/shop" className="text-[11px] md:text-[12px] font-bold text-[#004D40] border-b-2 border-[#004D40]/20 pb-0.5 hover:text-[#00695C] transition-colors">
                  Discover More
                </Link>
              </div>
            </div>

            {/* Card 3 */}
            <div className="flex-shrink-0 w-[280px] md:w-[450px] bg-white rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 flex flex-col md:flex-row items-center md:space-x-8 space-y-6 md:space-y-0 shadow-sm transition-all">
              <div className="w-24 h-24 md:w-40 md:h-40 rounded-full overflow-hidden flex-shrink-0 bg-gray-50">
                <img src={PRODUCTS.find(p => p.id === 9).image} alt="Linen Saree" className="w-full h-full object-cover" />
              </div>
              <div className="text-center md:text-left">
                <span className="text-[9px] md:text-[10px] uppercase font-bold tracking-[0.2em] text-[#B08968] mb-2 md:mb-3 block">Fine Textiles</span>
                <h3 className="text-lg md:text-xl font-fashion font-bold text-[#1A1A1A] mb-2 md:mb-3">Pastel Linen Saree</h3>
                <p className="text-gray-500 text-[12px] md:text-sm leading-relaxed mb-4 md:mb-6 line-clamp-2 md:line-clamp-none">Breathable artisan linen with minimalist heritage detailing.</p>
                <Link to="/shop" className="text-[11px] md:text-[12px] font-bold text-[#004D40] border-b-2 border-[#004D40]/20 pb-0.5 hover:text-[#00695C] transition-colors">
                  Discover More
                </Link>
              </div>
            </div>
            {/* Spacer for horizontal scroll padding */}
            <div className="flex-shrink-0 w-6 md:hidden" />
          </div>
        </div>
      </section>

      {/* Stories in Motion Section - Video Section */}
      <section className="py-16 md:py-24 bg-white overflow-hidden">
        <div className="max-w-[1536px] mx-auto px-6 lg:px-24">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-5xl font-fashion font-bold text-[#1A1A1A] tracking-tight">Shop The Look</h2>
            <div className="mx-auto w-16 h-1 bg-brand-orange mt-4 rounded-full opacity-30" />
          </div>

          <div
            ref={videoRef}
            className="flex flex-nowrap justify-start md:justify-center gap-6 pb-12 overflow-x-auto md:overflow-visible no-scrollbar snap-x snap-mandatory"
          >
            {videos.map((video) => (
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

      {/* Video Modal Interface */}
      <VideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        videoUrl={selectedVideo?.url}
        title={selectedVideo?.title}
      />

      {/* Our Purpose / Impact Section */}
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
                  src="https://images.unsplash.com/photo-1590736704228-a4004944883f?w=1000&q=80"
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
                <span className="text-[#B08968] text-[12px] font-bold uppercase tracking-[0.4em] mb-6 block">Our Purpose</span>

                <h2 className="text-3xl md:text-6xl font-fashion font-bold text-[#1A1A1A] leading-[1.1] mb-8 md:mb-10 tracking-tight">
                  Empowering Every Stitch, Supporting Every Artisan.
                </h2>

                <p className="text-gray-600 text-lg md:text-xl leading-relaxed mb-12 max-w-xl">
                  MayaSindhu was born from a desire to bridge the gap between ancient craftsmanship and the modern muse. We work directly with over 200 women-led artisan clusters across the subcontinent, ensuring fair wages and preserving heritage techniques that have been passed down through generations.
                </p>

                {/* Growth Stats Grid */}
                <div className="grid grid-cols-2 gap-12 mb-12 py-8 border-y border-gray-100">
                  <div>
                    <span className="text-4xl md:text-5xl font-fashion font-bold text-[#00695C] block mb-2">200+</span>
                    <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gray-400">Artisans Empowered</span>
                  </div>
                  <div>
                    <span className="text-4xl md:text-5xl font-fashion font-bold text-[#00695C] block mb-2">15+</span>
                    <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gray-400">Heritage Crafts</span>
                  </div>
                </div>

                <Link to="/about" className="group inline-flex items-center space-x-3 text-[14px] font-bold text-[#1A1A1A] transition-colors">
                  <span className="border-b-2 border-[#1A1A1A] pb-1 group-hover:border-brand-orange group-hover:text-brand-orange transition-all">
                    Our Full Manifesto
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

      {/* Review Section */}
      <section className="py-16 md:py-24 bg-[#F9F7F5] overflow-hidden">
        <div className="max-w-[1536px] mx-auto px-6 lg:px-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-20"
          >
            <h2 className="text-3xl md:text-6xl font-fashion font-bold text-[#1A1A1A] tracking-tight">Speaking from their hearts</h2>
            <div className="mx-auto w-16 md:w-24 h-1 bg-brand-orange mt-4 md:mt-6 rounded-full opacity-30" />
          </motion.div>

          <div className="flex md:grid overflow-x-auto md:overflow-visible md:grid-cols-3 gap-8 md:gap-12 pb-12 md:pb-0 no-scrollbar snap-x snap-mandatory relative">
            {/* Background Decorative Element */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-64 bg-[#E8F0EF] rounded-full blur-[100px] opacity-40 -z-10" />

            {reviews.map((review, index) => {
              const [isExpanded, setIsExpanded] = useState(false);

              return (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  className={`flex-shrink-0 w-[280px] md:w-auto snap-center bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col items-center group relative ${isExpanded ? 'h-auto' : 'h-full'}`}
                >
                  {/* Quote Icon */}
                  <div className="absolute top-6 right-8 md:right-10 text-brand-orange/5 group-hover:text-brand-orange/10 transition-colors">
                    <svg width="40" height="40" md:width="60" md:height="60" viewBox="0 0 24 24" fill="currentColor"><path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H15.017C14.4647 8 14.017 8.44772 14.017 9V14C14.017 14.5523 13.5693 15 13.017 15H11.017C10.4647 15 10.017 14.5523 10.017 14V9C10.017 7.34315 11.3601 6 13.017 6H19.017C20.6739 6 22.017 7.34315 22.017 9V15C22.017 18.3137 19.3307 21 16.017 21H14.017ZM3.017 21L3.017 18C3.017 16.8954 3.91241 16 5.017 16H8.017C8.56928 16 9.017 15.5523 9.017 15V9C9.017 8.44772 8.56928 8 8.017 8H4.017C3.46472 8 3.017 8.44772 3.017 9V14C3.017 14.5523 2.56928 15 2.017 15H0.017C-0.535004 15 -0.98274 14.5523 -0.98274 14V9C-0.98274 7.34315 0.360407 6 2.017 6H8.017C9.67386 6 11.017 7.34315 11.017 9V15C11.017 18.3137 8.33071 21 5.017 21H3.017Z" /></svg>
                  </div>

                  <div className="w-20 h-20 md:w-24 md:h-24 mb-6 md:mb-8 relative">
                    {/* Artistic Border/Blob Effect */}
                    <div className="absolute inset-0 bg-brand-orange/10 rounded-[35%_65%_70%_30%] scale-110 group-hover:rotate-45 transition-transform duration-700" />
                    <img
                      src={review.image}
                      alt={review.name}
                      className="w-full h-full object-cover relative z-10 rounded-[45%_55%_40%_60%] border-4 border-white shadow-md grayscale-[30%] group-hover:grayscale-0 transition-all duration-500"
                    />
                  </div>

                  {/* Star Rating Rendering */}
                  <div className="flex space-x-1 mb-4 md:mb-6">
                    {[...Array(review.rating)].map((_, i) => (
                      <svg key={i} width="14" height="14" md:width="16" md:height="16" viewBox="0 0 24 24" fill="#FFB800">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                    ))}
                  </div>

                  <div className="relative z-10 w-full text-center">
                    <p className={`text-gray-600 text-sm md:text-[16px] leading-relaxed italic mb-2 ${isExpanded ? '' : 'line-clamp-3 md:line-clamp-none'}`}>
                      "{review.text}"
                    </p>

                    {/* Show More/Less Button (Mobile Only) */}
                    <button
                      onClick={() => setIsExpanded(!isExpanded)}
                      className="md:hidden text-brand-orange text-[11px] font-bold uppercase tracking-widest mt-2 hover:underline"
                    >
                      {isExpanded ? 'Show Less' : 'Show More'}
                    </button>
                  </div>

                  <div className="mt-6 md:mt-auto">
                    <h4 className="text-[#1A1A1A] font-fashion font-bold text-base md:text-lg mb-0.5 md:mb-1 uppercase tracking-tight">{review.name}</h4>
                    <p className="text-[#B08968] text-[9px] md:text-[10px] uppercase font-bold tracking-[0.2em]">{review.location}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

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


