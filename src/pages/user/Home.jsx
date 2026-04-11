import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../../components/user/ProductCard';

const slides = [
  {
    id: 1,
    type: 'image',
    url: '/hero-slide-1.png',
    tag: 'Bridal Collection',
    title: 'SHAADI\nREADY',
    subtitle: 'Exquisite hand-woven masterpieces for your most memorable moments.',
    cta: 'Discover More'
  },
  {
    id: 2,
    type: 'video',
    url: 'https://player.vimeo.com/external/494957597.sd.mp4?s=163c46a6f6874c93549646459388147dca085350&profile_id=165&oauth2_token_id=57447761', // High-end textile video
    tag: 'The Digital Atelier',
    title: 'HERITAGE\nSILK',
    subtitle: 'Timeless Banarasi weaves meeting modern silhouettes.',
    cta: 'Shop Silk'
  },
  {
    id: 3,
    type: 'image',
    url: '/hero-slide-2.png',
    tag: 'New Arrivals',
    title: 'MODERN\nETHNIC',
    subtitle: 'Curated designs for the contemporary woman who values tradition.',
    cta: 'Explore All'
  }
];

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-[#fcfcfc] min-h-screen">
      {/* Full-Screen Hero Slider */}
      <section className="relative h-screen w-full overflow-hidden bg-black">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full"
          >
            {slides[currentSlide].type === 'image' ? (
              <img 
                src={slides[currentSlide].url} 
                alt={slides[currentSlide].title}
                className="w-full h-full object-cover"
              />
            ) : (
              <video 
                autoPlay 
                muted 
                loop 
                playsInline
                className="w-full h-full object-cover opacity-80"
              >
                <source src={slides[currentSlide].url} type="video/mp4" />
              </video>
            )}
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />

            {/* Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="max-w-4xl"
              >
                <span className="text-white/80 text-[10px] uppercase tracking-[0.4em] font-fashion mb-6 block">
                  {slides[currentSlide].tag}
                </span>
                <h1 className="text-6xl md:text-9xl text-white font-fashion leading-[0.85] tracking-tight mb-8 whitespace-pre-line">
                  {slides[currentSlide].title}
                </h1>
                <p className="text-white/70 text-sm md:text-lg max-w-lg mx-auto font-fashion tracking-wider mb-12 italic">
                  {slides[currentSlide].subtitle}
                </p>
                <Link 
                  to="/shop" 
                  className="inline-block border border-white/30 text-white px-12 py-4 rounded-none hover:bg-white hover:text-black transition-all duration-500 uppercase text-[10px] tracking-[0.3em] font-medium backdrop-blur-sm"
                >
                  {slides[currentSlide].cta}
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Slider Controls */}
        <div className="absolute bottom-12 right-12 flex space-x-3 z-20">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                currentSlide === idx ? 'bg-white w-8' : 'bg-white/30'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Rest of the page... */}
      <section className="py-24 max-w-[1440px] mx-auto px-6">
        <div className="flex justify-between items-end mb-16 border-b border-gray-100 pb-8">
            <div>
                <h2 className="text-4xl font-fashion tracking-wider uppercase text-gray-900">Curated Selections</h2>
                <p className="text-gray-500 font-serif italic mt-2">Discover the essence of Indian craftsmanship.</p>
            </div>
            <Link to="/shop" className="text-[10px] uppercase font-bold tracking-[0.3em] text-gray-400 hover:text-gray-900 transition-colors">
                View All
            </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
          <ProductCard
            id={1}
            name="Banarasi Heritage Silk"
            price={45999}
            image="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
            collection="Heritage Silk"
          />
          <ProductCard
            id={2}
            name="Emerald Kanjeevaram"
            price={52500}
            image="https://images.unsplash.com/photo-1610030469668-23f6e103986a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
            collection="Silk Special"
          />
          <ProductCard
            id={3}
            name="Hand-Block Print Chiffon"
            price={12800}
            image="https://images.unsplash.com/photo-1544441893-675973e31d35?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
            collection="Lightweight"
          />
          <ProductCard
            id={4}
            name="Royal Zardosi Bridal"
            price={89000}
            image="https://images.unsplash.com/photo-1595914620380-0a2da1c0eb94?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
            collection="Bridal Wear"
          />
        </div>
      </section>

      {/* Artisan Spotlight */}
      <section className="bg-gray-50 py-24 mt-24">
        <div className="max-w-[1440px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-[10px] uppercase font-bold tracking-[0.4em] text-gray-400 mb-6 block">Legacy of Craft</span>
            <h2 className="text-5xl font-fashion leading-tight text-gray-900 mb-8 uppercase tracking-widest">
              From the Weaver's <br /> Soul to Yours
            </h2>
            <p className="text-gray-600 font-serif leading-relaxed mb-10 text-lg italic pr-12">
              Every MayaSindhu saree is a testament to generations of skill. Our artisans spend weeks meticulously weaving each thread, ensuring that you wear not just a garment, but a piece of history.
            </p>
            <Link to="/about" className="text-[10px] uppercase font-bold tracking-[0.3em] border-b-2 border-gray-900 pb-2 hover:text-gray-500 transition-colors">
              Our Artisan Story
            </Link>
          </motion.div>
          
          <div className="grid grid-cols-2 gap-4">
             <div className="aspect-[3/4] overflow-hidden rounded-2xl">
                <img src="https://images.unsplash.com/photo-1610116303244-62391054274c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" alt="Weaving Detail" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" />
             </div>
             <div className="aspect-[3/4] overflow-hidden rounded-2xl mt-12">
                <img src="https://images.unsplash.com/photo-1544441893-675973e31d35?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" alt="Fabric Detail" className="w-full h-full object-cover" />
             </div>
          </div>
        </div>
      </section>
    </div>
  );
}
