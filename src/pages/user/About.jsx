import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../../firebase';
import { collection, onSnapshot, query, orderBy, doc } from 'firebase/firestore';
import { 
  Loader2, 
  MapPin, 
  Sparkles, 
  ShoppingBag, 
  Quote, 
  ShieldCheck, 
  History, 
  Award,
  Users,
  Layers,
  ChevronRight
} from 'lucide-react';

// Animation Variants
const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
};

export default function About() {
  const [artisans, setArtisans] = useState([]);
  const [aboutData, setAboutData] = useState(null);
  const [purposeData, setPurposeData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Fetch About Us Hero Data
    const aboutUnsub = onSnapshot(doc(db, 'aboutus', 'content'), (docSnap) => {
      if (docSnap.exists()) {
        setAboutData(docSnap.data());
      }
    });

    // 2. Fetch Our Purpose / Manifesto Settings Data
    const purposeUnsub = onSnapshot(doc(db, 'ourPurpose', 'main'), (docSnap) => {
      if (docSnap.exists()) {
        setPurposeData(docSnap.data());
      }
    });

    // 3. Fetch Artisans
    const q = query(collection(db, 'artisans'), orderBy('createdAt', 'desc'));
    const artisanUnsub = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setArtisans(snapshot.docs.map(doc => ({ 
          id: doc.id, 
          experience: "20+ Years",
          experienceLabel: "Experience",
          crafted: "500+",
          craftedLabel: "Masterpieces",
          teamSize: "10-15",
          teamSizeLabel: "Team",
          generations: "3rd Gen",
          generationsLabel: "Heritage",
          since: "1995",
          speciality: "Traditional Craftsmanship",
          story: "A legacy of preserving the soul of Indian heritage through meticulous handiwork.",
          ...doc.data() 
        })));
      } else {
        // Luxury Mock Data
        setArtisans([
          {
            id: 1,
            name: "Rameshwar Prasad",
            photo: "https://images.unsplash.com/photo-1617113930975-f9c7322db856?w=800&q=80",
            address: "Varanasi, Uttar Pradesh",
            product: "Heritage Banarasi Silk",
            experience: "42 Years",
            experienceLabel: "Experience",
            crafted: "1500+ Sarees",
            craftedLabel: "Masterpieces",
            teamSize: "24 Master Weavers",
            teamSizeLabel: "Team",
            generations: "5th Generation",
            generationsLabel: "Heritage",
            since: "1978",
            speciality: "Mastering the 'Kadhwa' technique.",
            story: "Rameshwar leads a cluster of 24 weavers, ensuring that the rhythm of the wooden loom never fades from the narrow alleys of Varanasi."
          },
          {
            id: 2,
            name: "Sita Devi",
            photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&q=80",
            address: "Madhubani, Bihar",
            product: "Folk Art Accessories",
            experience: "28 Years",
            experienceLabel: "Experience",
            crafted: "2000+ Artworks",
            craftedLabel: "Masterpieces",
            teamSize: "40 Rural Artisans",
            teamSizeLabel: "Team",
            generations: "3rd Generation",
            generationsLabel: "Heritage",
            since: "1994",
            speciality: "Sacred 'Tantrik' motifs.",
            story: "Sita Devi has trained over 200 women in her village, transforming a domestic ritual into a sustainable livelihood."
          }
        ]);
      }
      setLoading(false);
    });

    return () => {
      aboutUnsub();
      purposeUnsub();
      artisanUnsub();
    };
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center gap-6 bg-[#FAF9F6]">
        <div className="relative">
          <Loader2 className="w-12 h-12 animate-spin text-[#C5A059]" strokeWidth={1} />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-[#C5A059] rounded-full animate-pulse" />
          </div>
        </div>
        <p className="text-[10px] font-bold text-[#C5A059] uppercase tracking-[0.6em] animate-pulse">Curating Heritage</p>
      </div>
    );
  }

  const heroSubheading = purposeData?.accent || aboutData?.aboutUs?.subheading || 'Established Heritage';
  const heroHeading = purposeData?.title || aboutData?.aboutUs?.heading || 'The Soul of Craft';
  const spotlightImage = purposeData?.image || 'https://images.unsplash.com/photo-1590736704228-a4004944883f?w=1200&q=80';
  const manifestoDescription = purposeData?.description || 'At MayaSindhu, every thread is a testament to resilience. We believe that true luxury lies in the story of the artisan—the rhythm of the loom and the legacy passed through generations.';

  return (
    <div className="bg-[#FAF9F6] min-h-screen pb-32 overflow-hidden selection:bg-[#C5A059]/30">
      
      {/* Editorial Hero Section - Reduced Height */}
      <section className="relative h-[55vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <motion.img 
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            src={spotlightImage} 
            alt="Artisan Background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-[#FAF9F6]" />
        </div>
        
        <div className="relative text-center px-6 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-4 mb-8"
          >
            <div className="h-[1px] w-12 bg-[#C5A059]" />
            <span className="text-[11px] md:text-[13px] uppercase tracking-[0.6em] font-black text-[#C5A059]">
              {heroSubheading}
            </span>
            <div className="h-[1px] w-12 bg-[#C5A059]" />
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl md:text-7xl font-sans font-light text-white leading-[1.1] mb-12 tracking-tight"
          >
            Preserving <span className="italic text-[#C5A059]">Ancient</span> Hands
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col items-center gap-6"
          >
            <div className="w-[1px] h-16 bg-gradient-to-b from-[#C5A059] to-transparent" />
          </motion.div>
        </div>
      </section>

      {/* Narrative Section - Balanced Spacing */}
      <section className="py-24 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        <div className="lg:col-span-5 space-y-6">
          <motion.span 
            variants={fadeInUp} initial="initial" whileInView="animate"
            className="text-[10px] font-black text-[#C5A059] uppercase tracking-[0.4em]"
          >
            {heroSubheading}
          </motion.span>
          <motion.h2 
            variants={fadeInUp} initial="initial" whileInView="animate"
            className="text-3xl md:text-5xl font-sans font-medium text-[#1A1A1A] leading-tight"
          >
            Beyond the <span className="italic">Fabric</span>, Into the Heart.
          </motion.h2>
          <motion.p 
            variants={fadeInUp} initial="initial" whileInView="animate"
            className="text-gray-500 text-base md:text-lg leading-relaxed font-light"
          >
            {manifestoDescription}
          </motion.p>
        </div>
        <div className="lg:col-span-7 relative">
          <div className="aspect-[21/9] rounded-2xl overflow-hidden shadow-xl relative group">
            <img 
              src={spotlightImage} 
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              alt=""
            />
            <div className="absolute inset-0 bg-black/20" />
          </div>
        </div>
      </section>

      {/* The Artisan Journal - Reduced Image Grid */}
      <section className="px-6 space-y-40 py-16">
        
        {/* Dynamic section header */}
        <div className="max-w-7xl mx-auto text-center mb-24 space-y-3">
          <span className="text-[10px] font-black text-[#C5A059] uppercase tracking-[0.4em]">
            {purposeData?.helpingHandSubheader || "Journal"}
          </span>
          <h2 className="text-3xl md:text-5xl font-sans font-medium text-[#1A1A1A] tracking-tight">
            {purposeData?.helpingHandHeader || "The Artisan Journal"}
          </h2>
          <div className="w-16 h-0.5 bg-[#C5A059] mx-auto mt-4" />
        </div>

        {/* Intro "Our Purpose" brand story card */}
        {(purposeData?.helpingHandTitle || purposeData?.helpingHandAboutHeading || purposeData?.helpingHandAboutDescription) && (
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center bg-white border border-gray-100 rounded-[3.5rem] p-8 md:p-14 mb-32 shadow-sm relative overflow-hidden group">
            {/* Background design elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#C5A059]/5 rounded-full blur-[80px]" />
            
            {/* Left side text content */}
            <div className="lg:col-span-7 space-y-6 relative z-10 text-left">
              {purposeData?.helpingHandTitle && (
                <span className="text-[10px] font-black text-[#C5A059] uppercase tracking-[0.4em] block">
                  {purposeData.helpingHandTitle}
                </span>
              )}
              {purposeData?.helpingHandAboutHeading && (
                <h3 className="text-2xl md:text-4xl font-sans font-medium text-[#1A1A1A] leading-tight">
                  {purposeData.helpingHandAboutHeading}
                </h3>
              )}
              {purposeData?.helpingHandAboutDescription && (
                <p className="text-gray-500 text-sm md:text-base leading-relaxed font-light whitespace-pre-line">
                  {purposeData.helpingHandAboutDescription}
                </p>
              )}
            </div>
            
            {/* Right side image */}
            <div className="lg:col-span-5 relative z-10">
              <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-xl border border-white/50 relative">
                <img 
                  src={purposeData?.helpingHandImage || "https://images.unsplash.com/photo-1590736704228-a4004944883f?w=800&q=80"} 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  alt="Our Purpose section cover"
                />
                <div className="absolute inset-0 bg-black/5" />
              </div>
            </div>
          </div>
        )}

        {/* Artisans List */}
        {artisans.map((artisan, index) => (
          <div 
            key={artisan.id}
            className={`max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center ${
              index % 2 !== 0 ? 'lg:flex-row-reverse' : ''
            }`}
          >
            {/* Visual Column - Reduced to 5 cols */}
            <div className={`lg:col-span-5 relative group ${index % 2 !== 0 ? 'lg:order-2' : ''}`}>
              <motion.div 
                initial={{ opacity: 0, x: index % 2 === 0 ? -40 : 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1 }}
                className="relative"
              >
                {/* Main Image with refined Aspect Ratio */}
                <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl border border-white/50 relative">
                  <img 
                    src={artisan.photo} 
                    alt={artisan.name} 
                    className="w-full h-full object-cover transition-transform duration-[2s] ease-out group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-60" />
                  
                  {/* Verified Badge */}
                  <div className="absolute top-6 left-6 flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
                    <ShieldCheck size={12} className="text-[#C5A059]" />
                    <span className="text-[9px] font-bold text-white uppercase tracking-widest">Verified</span>
                  </div>

                  {/* Since Label */}
                  <div className="absolute bottom-6 right-6 text-right">
                    <div className="flex items-center justify-end gap-2 text-white/60 mb-1">
                      <History size={10} />
                      <span className="text-[8px] font-bold uppercase tracking-widest">Since</span>
                    </div>
                    <p className="text-xl font-sans text-white italic">{artisan.since || "1990"}</p>
                  </div>
                </div>

              </motion.div>
            </div>

            {/* Content Column - Increased to 7 cols */}
            <div className={`lg:col-span-7 space-y-8 ${index % 2 !== 0 ? 'lg:order-1' : ''}`}>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <MapPin size={12} className="text-[#C5A059]" />
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em]">{artisan.address}</span>
                </div>
                <h3 className="text-3xl md:text-5xl font-sans text-[#1A1A1A] tracking-tight">
                  {artisan.name}
                </h3>
                <div className="flex items-center gap-4">
                  <div className="px-3 py-1 bg-[#C5A059]/10 text-[#C5A059] text-[9px] font-black uppercase tracking-widest rounded-full border border-[#C5A059]/20">
                    {artisan.product}
                  </div>
                </div>
              </div>

              {/* Speciality Highlight */}
              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                className="relative pl-10"
              >
                <Sparkles size={18} className="absolute top-1 left-0 text-[#C5A059]" />
                <div className="space-y-1">
                   <p className="text-[10px] font-black text-[#C5A059] uppercase tracking-[0.2em]">Primary Speciality</p>
                   <p className="text-gray-900 text-[15px] font-bold font-sans">
                     {artisan.speciality}
                   </p>
                </div>
              </motion.div>

              {/* Story Narrative */}
              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                className="relative pl-10"
              >
                <Quote size={30} className="absolute top-0 left-0 text-[#C5A059]/10" />
                <div className="space-y-2">
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">The Artisan Story</p>
                   <p className="text-gray-600 text-base md:text-[16px] leading-relaxed italic font-light font-sans">
                     "{artisan.story || artisan.speciality}"
                   </p>
                </div>
              </motion.div>

              {/* Luxury Statistics Grid */}
              <div className="grid grid-cols-2 gap-6 py-6 border-y border-gray-100">
                {artisan.experience && (
                  <div className="space-y-1">
                    <p className="text-[18px] font-sans font-bold text-[#1A1A1A]">{artisan.experience}</p>
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">
                      {artisan.experienceLabel || "Experience"}
                    </p>
                  </div>
                )}
                {artisan.crafted && (
                  <div className="space-y-1">
                    <p className="text-[18px] font-sans font-bold text-[#1A1A1A]">{artisan.crafted}</p>
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">
                      {artisan.craftedLabel || "Masterpieces"}
                    </p>
                  </div>
                )}
                {artisan.teamSize && (
                  <div className="space-y-1">
                    <p className="text-[18px] font-sans font-bold text-[#1A1A1A]">{artisan.teamSize}</p>
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">
                      {artisan.teamSizeLabel || "Team"}
                    </p>
                  </div>
                )}
                {artisan.generations && (
                  <div className="space-y-1">
                    <p className="text-[18px] font-sans font-bold text-[#1A1A1A]">{artisan.generations}</p>
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">
                      {artisan.generationsLabel || "Heritage"}
                    </p>
                  </div>
                )}
              </div>

            </div>
          </div>
        ))}
      </section>

      {/* Global Impact Summary */}
      <section className="mt-40 px-6">
        <div className="max-w-4xl mx-auto bg-white rounded-[2.5rem] p-10 md:p-20 shadow-2xl border border-gray-100 relative overflow-hidden group text-center space-y-10">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#C5A059]/5 rounded-full blur-[80px]" />
          
          <div className="relative z-10 space-y-4">
            <span className="text-[10px] font-black text-[#C5A059] uppercase tracking-[0.6em]">
              {purposeData?.bottomTitle || "Commitment"}
            </span>
            <h2 className="text-3xl md:text-5xl font-sans font-light text-[#1A1A1A]">
              {purposeData?.bottomHeading || "Empowering Heritage"}
            </h2>
            <p className="text-gray-500 text-base md:text-lg font-light leading-relaxed max-w-2xl mx-auto italic font-sans">
              {purposeData?.bottomSubheading || '"We believe that a garment without a soul is just a cloth."'}
            </p>
          </div>

          <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-8 pt-6">
            {(purposeData?.bottomStats || [
              { id: 1, value: "200+", label: "Artisans" },
              { id: 2, value: "15", label: "Clusters" },
              { id: 3, value: "18", label: "Crafts" },
              { id: 4, value: "1200+", label: "Impact" }
            ]).map((item, idx) => {
              const icons = [
                <Users size={16} />,
                <MapPin size={16} />,
                <Award size={16} />,
                <Sparkles size={16} />
              ];
              return (
                <div key={idx} className="space-y-2">
                  <div className="w-10 h-10 bg-[#FAF9F6] rounded-xl flex items-center justify-center text-[#C5A059] mx-auto">
                    {icons[idx] || <Sparkles size={16} />}
                  </div>
                  <p className="text-2xl font-sans font-bold text-[#1A1A1A]">{item.value || item.val}</p>
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{item.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <div className="fixed inset-0 pointer-events-none opacity-[0.02] mix-blend-multiply -z-0 bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />
    </div>
  );
}
