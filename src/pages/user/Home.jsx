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
    <div className="bg-white min-h-screen">
      {/* Hero Section - Inspired by Reference Image */}
      <section className="relative h-[90vh] w-full flex items-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 w-full h-full">
          <img
            src="/hero-orange.png"
            alt="MayaSindhu Hero"
            className="w-full h-full object-cover object-center"
          />
          {/* Subtle gradient overlay for readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/40 to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="relative max-w-[1536px] mx-auto px-6 lg:px-12 w-full z-10">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="max-w-2xl"
          >
            <motion.span 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-[#B08968] text-[11px] font-bold uppercase tracking-[0.4em] mb-6 block"
            >
              Handcrafted Excellence
            </motion.span>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="text-6xl md:text-8xl font-fashion font-bold text-[#1A1A1A] leading-[1.1] mb-8"
            >
              Celebrate <br />
              <span className="text-[#FF6B00] italic">Handmade</span> <br />
              Elegance
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.8 }}
              className="text-gray-600 text-[16px] md:text-[18px] leading-relaxed max-w-lg mb-12"
            >
              Discover a soulful collection of artisanal fashion, where every thread tells a story of heritage and empowered craftsmanship.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.8 }}
              className="flex flex-wrap gap-4"
            >
              <Link to="/shop" className="btn btn-primary">
                Shop Now
              </Link>
              <Link to="/shop" className="btn btn-outline">
                Explore Collections
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
      {/* Curated Realms Section */}
      <section className="py-20 max-w-[1440px] mx-auto px-8 lg:px-24 bg-white">
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-fashion font-bold text-[#1A1A1A] tracking-tight mb-2">Curated Realms</h2>
          <div className="w-16 h-1 bg-[#FF6B00]/60 rounded-full" />
        </div>

        {/* Custom grid with 1.5fr for the left and 1fr for each of the right columns */}
        <div className="grid grid-cols-1 md:grid-cols-[1.4fr_0.8fr_0.8fr] gap-6 h-auto md:h-[650px]">
          {/* Sarees - Large Vertical (Takes up more width) */}
          <motion.div 
            whileHover={{ y: -8 }}
            className="md:col-span-1 md:row-span-2 relative group overflow-hidden rounded-[2.5rem] shadow-lg"
          >
            <img 
              src="/cat-sarees.png" 
              alt="Sarees" 
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <div className="absolute bottom-8 left-8 text-white">
              <h3 className="text-2xl font-fashion font-bold mb-1 tracking-tight">Sarees</h3>
              <p className="text-white/70 text-[10px] tracking-[0.2em] font-medium uppercase font-fashion">The Art of Draping Heritage</p>
            </div>
            <Link to="/shop" className="absolute inset-0 z-10" />
          </motion.div>

          {/* Jewellery - Smaller width */}
          <motion.div 
            whileHover={{ y: -8 }}
            className="md:col-span-1 md:row-span-1 relative group overflow-hidden rounded-[2.5rem] shadow-lg h-[280px] md:h-full"
          >
            <img 
              src="/cat-jewellery.png" 
              alt="Jewellery" 
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent " />
            <div className="absolute bottom-6 left-6 text-white">
              <h3 className="text-lg font-fashion font-bold tracking-tight">Jewellery</h3>
            </div>
            <Link to="/shop" className="absolute inset-0 z-10" />
          </motion.div>

          {/* Dresses - Smaller width */}
          <motion.div 
            whileHover={{ y: -8 }}
            className="md:col-span-1 md:row-span-1 relative group overflow-hidden rounded-[2.5rem] shadow-lg h-[280px] md:h-full"
          >
            <img 
              src="/cat-dresses.png" 
              alt="Dresses" 
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 text-white">
              <h3 className="text-lg font-fashion font-bold tracking-tight">Dresses</h3>
            </div>
            <Link to="/shop" className="absolute inset-0 z-10" />
          </motion.div>

          {/* Handmade Crafts - Bottom Right (Smaller width) */}
          <motion.div 
            whileHover={{ y: -8 }}
            className="md:col-span-2 md:row-span-1 relative group overflow-hidden rounded-[2.5rem] shadow-lg h-[280px] md:h-full"
          >
            <img 
              src="/cat-crafts.png" 
              alt="Handmade Crafts" 
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <div className="absolute bottom-8 left-8 text-white">
              <h3 className="text-2xl font-fashion font-bold tracking-tight">Handmade Crafts</h3>
            </div>
            <Link to="/shop" className="absolute inset-0 z-10" />
          </motion.div>
        </div>
      </section>



      {/* Featured Treasures Section */}
      <section className="py-24 max-w-[1536px] mx-auto px-6 lg:px-24">
        <div className="text-center mb-16">
          <span className="text-[12px] uppercase font-bold tracking-[0.4em] text-[#B08968] mb-4 block">The Selection</span>
          <h2 className="text-5xl md:text-6xl font-fashion font-bold text-[#1A1A1A] tracking-tight">Featured Treasures</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-20">
          <ProductCard
            id={1}
            name="Indigo Blossom Stole"
            price={10500}
            image="https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=800&q=80"
            rating={4.9}
          />
          <ProductCard
            id={2}
            name="Petal Jhumka Earrings"
            price={7500}
            image="https://images.unsplash.com/photo-1635767798638-3e25273a8236?w=800&q=80"
            rating={4.8}
          />
          <ProductCard
            id={3}
            name="Chikankari Morning Kurta"
            price={12800}
            image="https://images.unsplash.com/photo-1610030469668-23f6e103986a?w=800&q=80"
            rating={5.0}
          />
          <ProductCard
            id={4}
            name="Madhubani Art Tote"
            price={17500}
            image="https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&q=80"
            rating={4.7}
          />
        </div>
      </section>


      {/* Artisan's Bloom Section */}
      <section className="py-24 bg-[#F0F7FF]">
        <div className="max-w-[1536px] mx-auto px-6 lg:px-24">
          <div className="flex justify-between items-center mb-16">
            <h2 className="text-4xl md:text-5xl font-fashion font-bold text-[#004D40] tracking-tight">The Artisan's Bloom</h2>
            <div className="flex space-x-4">
              <button className="p-3 border border-gray-200 rounded-full bg-white hover:bg-gray-50 transition-colors shadow-sm">
                <span className="sr-only">Previous</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              </button>
              <button className="p-3 border border-gray-200 rounded-full bg-white hover:bg-gray-50 transition-colors shadow-sm">
                <span className="sr-only">Next</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
              </button>
            </div>
          </div>

          <div className="flex space-x-8 overflow-x-auto pb-12 no-scrollbar scroll-smooth">
            {/* Card 1 */}
            <div className="flex-shrink-0 w-[450px] bg-white rounded-[3rem] p-10 flex items-center space-x-8 shadow-sm">
              <div className="w-40 h-40 rounded-full overflow-hidden flex-shrink-0 bg-gray-50">
                <img src="https://images.unsplash.com/photo-1611085583191-a392d5d290fa?w=400&q=80" alt="Choker" className="w-full h-full object-cover" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#B08968] mb-3 block">Oxidized Silver</span>
                <h3 className="text-xl font-fashion font-bold text-[#1A1A1A] mb-3">Temple Floral Choker</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-6">Hand-cast by master silversmiths in Jaipur, featuring intricate motifs.</p>
                <Link to="/shop" className="text-[12px] font-bold text-[#004D40] border-b-2 border-[#004D40]/20 pb-0.5 hover:text-[#00695C] transition-colors">
                  Discover More
                </Link>
              </div>
            </div>

            {/* Card 2 */}
            <div className="flex-shrink-0 w-[450px] bg-white rounded-[3rem] p-10 flex items-center space-x-8 shadow-sm">
              <div className="w-40 h-40 rounded-full overflow-hidden flex-shrink-0 bg-gray-50">
                <img src="https://images.unsplash.com/photo-1635767798638-3e25273a8236?w=400&q=80" alt="Bangles" className="w-full h-full object-cover" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#B08968] mb-3 block">Gold Filigree</span>
                <h3 className="text-xl font-fashion font-bold text-[#1A1A1A] mb-3">Sun-Kissed Bangles</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-6">Intricate 22k gold plated wire-work inspired by royal designs.</p>
                <Link to="/shop" className="text-[12px] font-bold text-[#004D40] border-b-2 border-[#004D40]/20 pb-0.5 hover:text-[#00695C] transition-colors">
                  Discover More
                </Link>
              </div>
            </div>

            {/* Card 3 */}
            <div className="flex-shrink-0 w-[450px] bg-white rounded-[3rem] p-10 flex items-center space-x-8 shadow-sm">
              <div className="w-40 h-40 rounded-full overflow-hidden flex-shrink-0 bg-gray-50">
                <img src="https://images.unsplash.com/photo-1535633302708-18b0c04a131d?w=400&q=80" alt="Earrings" className="w-full h-full object-cover" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#B08968] mb-3 block">Modern Ethnic</span>
                <h3 className="text-xl font-fashion font-bold text-[#1A1A1A] mb-3">Luna Pearl Drops</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-6">Sustainably sourced freshwater pearls with minimalist detailing.</p>
                <Link to="/shop" className="text-[12px] font-bold text-[#004D40] border-b-2 border-[#004D40]/20 pb-0.5 hover:text-[#00695C] transition-colors">
                  Discover More
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}


