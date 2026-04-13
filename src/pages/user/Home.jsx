import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../../components/user/ProductCard';
import VideoCard from '../../components/user/VideoCard';
import VideoModal from '../../components/user/VideoModal';

const videos = [
  {
    id: 1,
    title: "The Rhythm of the Loom",
    category: "Heritage Weave",
    url: "https://assets.mixkit.co/videos/preview/mixkit-weaving-on-a-loom-15740-preview.mp4",
    thumbnail: "https://images.unsplash.com/photo-1590736704228-a4004944883f?w=800&q=80"
  },
  {
    id: 2,
    title: "Echoes of Silver",
    category: "Artisan Jewelry",
    url: "https://assets.mixkit.co/videos/preview/mixkit-close-up-of-hands-making-jewelry-41225-preview.mp4",
    thumbnail: "https://images.unsplash.com/photo-1627250493016-af34a8e8b6b0?w=800&q=80"
  },
  {
    id: 3,
    title: "Draped in Tradition",
    category: "Saree Stories",
    url: "https://assets.mixkit.co/videos/preview/mixkit-woman-wearing-a-traditional-indian-dress-41131-preview.mp4",
    thumbnail: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80"
  },
  {
    id: 4,
    title: "Colors of the Earth",
    category: "Natural Dyes",
    url: "https://assets.mixkit.co/videos/preview/mixkit-colors-in-a-pot-of-dye-39943-preview.mp4",
    thumbnail: "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=800&q=80"
  }
];

const slides = [
  // ... (existing slides)
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

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

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

      {/* Stories in Motion Section - Video Section */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-[1536px] mx-auto px-6 lg:px-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 space-y-4 md:space-y-0">
            <div className="max-w-2xl">
              <span className="text-[12px] uppercase font-bold tracking-[0.4em] text-[#B08968] mb-4 block">The Living Gallery</span>
              <h2 className="text-5xl md:text-6xl font-fashion font-bold text-[#1A1A1A] tracking-tight">Stories in Motion</h2>
              <p className="text-gray-500 mt-6 text-lg leading-relaxed">Experience the soulful craftsmanship behind each piece through our cinematic artisan chronicles.</p>
            </div>
            
            <Link to="/shop" className="text-[14px] font-bold text-[#1A1A1A] border-b-2 border-brand-orange pb-1 hover:text-brand-orange transition-colors">
              Explore All Stories
            </Link>
          </div>

          <div className="flex space-x-8 overflow-x-auto pb-12 no-scrollbar snap-x snap-mandatory">
            {videos.map((video) => (
              <div key={video.id} className="snap-center" onClick={() => openVideo(video)}>
                <VideoCard
                  videoUrl={video.url}
                  title={video.title}
                  category={video.category}
                  thumbnail={video.thumbnail}
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
      <section className="py-24 bg-white overflow-hidden">
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
                
                <h2 className="text-5xl md:text-6xl font-fashion font-bold text-[#1A1A1A] leading-[1.1] mb-10 tracking-tight">
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
                    <path d="m9 18 6-6-6-6"/>
                  </svg>
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Soulful Echoes / Review Section */}
      <section className="py-24 bg-[#F9F7F5] overflow-hidden">
        <div className="max-w-[1536px] mx-auto px-6 lg:px-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-20"
          >
            <span className="text-[#B08968] text-[12px] font-bold uppercase tracking-[0.4em] mb-4 block">Patron Stories</span>
            <h2 className="text-5xl md:text-6xl font-fashion font-bold text-[#1A1A1A] tracking-tight">Soulful Echoes</h2>
            <div className="mx-auto w-24 h-1 bg-brand-orange mt-6 rounded-full opacity-30" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Background Decorative Element */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-64 bg-[#E8F0EF] rounded-full blur-[100px] opacity-40 -z-10" />

            {reviews.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className="bg-white p-10 rounded-[3rem] shadow-sm hover:shadow-xl transition-shadow duration-500 flex flex-col items-center group relative h-full"
              >
                {/* Quote Icon */}
                <div className="absolute top-6 right-10 text-brand-orange/5 group-hover:text-brand-orange/10 transition-colors">
                   <svg width="60" height="60" viewBox="0 0 24 24" fill="currentColor"><path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H15.017C14.4647 8 14.017 8.44772 14.017 9V14C14.017 14.5523 13.5693 15 13.017 15H11.017C10.4647 15 10.017 14.5523 10.017 14V9C10.017 7.34315 11.3601 6 13.017 6H19.017C20.6739 6 22.017 7.34315 22.017 9V15C22.017 18.3137 19.3307 21 16.017 21H14.017ZM3.017 21L3.017 18C3.017 16.8954 3.91241 16 5.017 16H8.017C8.56928 16 9.017 15.5523 9.017 15V9C9.017 8.44772 8.56928 8 8.017 8H4.017C3.46472 8 3.017 8.44772 3.017 9V14C3.017 14.5523 2.56928 15 2.017 15H0.017C-0.535004 15 -0.98274 14.5523 -0.98274 14V9C-0.98274 7.34315 0.360407 6 2.017 6H8.017C9.67386 6 11.017 7.34315 11.017 9V15C11.017 18.3137 8.33071 21 5.017 21H3.017Z"/></svg>
                </div>

                <div className="w-24 h-24 mb-8 relative">
                   {/* Artistic Border/Blob Effect */}
                  <div className="absolute inset-0 bg-brand-orange/10 rounded-[35%_65%_70%_30%] scale-110 group-hover:rotate-45 transition-transform duration-700" />
                  <img 
                    src={review.image} 
                    alt={review.name} 
                    className="w-full h-full object-cover relative z-10 rounded-[45%_55%_40%_60%] border-4 border-white shadow-md grayscale-[30%] group-hover:grayscale-0 transition-all duration-500" 
                  />
                </div>

                {/* Star Rating Rendering */}
                <div className="flex space-x-1 mb-6">
                  {[...Array(review.rating)].map((_, i) => (
                    <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="#FFB800">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                  ))}
                </div>

                <p className="text-gray-600 text-[16px] leading-relaxed italic mb-8 relative z-10">
                  "{review.text}"
                </p>

                <div className="mt-auto">
                  <h4 className="text-[#1A1A1A] font-fashion font-bold text-lg mb-1">{review.name}</h4>
                  <p className="text-[#B08968] text-[10px] uppercase font-bold tracking-[0.2em]">{review.location}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stay Connected / Newsletter Section */}
      <section className="py-24 bg-white px-6 lg:px-24">
        <div className="max-w-[1440px] mx-auto relative overflow-hidden bg-brand-orange rounded-[3rem] md:rounded-[4rem] px-8 md:px-16 py-16 md:py-24 text-center">
          
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
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-fashion font-bold text-white mb-6 leading-tight">
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


