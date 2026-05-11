import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { db } from '../../firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';

export default function About() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'aboutus', 'content'), (docSnap) => {
      if (docSnap.exists()) {
        setData(docSnap.data());
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center gap-4 bg-white">
        <Loader2 className="w-10 h-10 animate-spin text-brand-orange" />
        <p className="text-[14px] font-medium text-gray-400 font-fashion uppercase tracking-widest">MayaSindhu</p>
      </div>
    );
  }

  // Fallback data if DB is empty
  const content = data || {
    aboutUs: {
      heading: 'About Our Heritage',
      subheading: 'Our Heritage'
    },
    featuredStory: {
      title: 'The Art of Handwoven Sarees',
      description: 'Explore the intricate journey of traditional weaving techniques that are making a massive comeback in modern fashion wardrobes.',
      image1: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=1600&q=80',
      image2: 'https://images.unsplash.com/photo-1590736704228-a4004944883f?w=1000&q=80',
      highlight: {
        title: 'Bridging the Gap Between Ancient Hands & Modern Muses',
        description: 'MayaSindhu was born from an obsession with the soulful imperfections of the handmade. In a world of fast fashion and mass production, we stood for the slow, the deliberate, and the heritage-driven.\n\nOur name, a tribute to the mystical "Maya" and the ancient "Sindhu" river, represents the flow of creativity across generations. From the weaver\'s loom in Varanasi to the block printer\'s table in Jaipur, we curate pieces that are not just garments, but living canvases.',
        image: 'https://images.unsplash.com/photo-1672302255324-28009cc288b2?q=80&w=687&auto=format&fit=crop'
      }
    },
    statsSection: {
      title: 'Our Ethical Compass',
      description: 'We ensure fair wages, safe working conditions, and the preservation of dying arts. Every purchase at MayaSindhu directly impacts a family of artisans, keeping the tradition of hand-embroidery, natural dyeing, and hand-weaving alive for another century.',
      stats: [
        { id: 1, label: 'ARTISANS EMPOWERED', value: '200+' },
        { id: 2, label: 'WOMEN-LED CLUSTERS', value: '12' },
        { id: 3, label: 'HERITAGE CRAFTS', value: '15+' },
        { id: 4, label: 'SUSTAINABLE YEARS', value: '8' }
      ]
    }
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[45vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://plus.unsplash.com/premium_photo-1663931104646-e866646f598d?q=80&w=1170&auto=format&fit=crop" 
            alt="Artisan Heritage Background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
        </div>
        
        <div className="relative text-center px-6 max-w-4xl">
          <motion.span 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[12px] md:text-[14px] uppercase tracking-[0.6em] font-bold mb-4 block text-brand-orange"
          >
            {content.aboutUs.subheading}
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-5xl font-fashion font-bold text-white drop-shadow-2xl leading-tight"
          >
            {content.aboutUs.heading}
          </motion.h1>
        </div>
      </section>

      {/* Featured Story Section */}
      <section className="py-24 max-w-[1536px] mx-auto px-6 lg:px-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          
          <div className="order-2 lg:order-1 space-y-8 max-w-lg">
            <div className="space-y-6">
              <span className="text-[10px] md:text-[12px] font-bold uppercase tracking-[0.4em] text-gray-400 block">
                FEATURED STORY
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-fashion font-medium leading-[1.2] tracking-tight text-[#111111]">
                {content.featuredStory.title}
              </h2>
            </div>
            
            <p className="text-gray-600 text-base md:text-lg leading-relaxed font-light">
              {content.featuredStory.description}
            </p>
          </div>

          <div className="order-1 lg:order-2 relative aspect-[4/5] md:aspect-square flex items-center justify-center lg:justify-end pr-[15%] pt-[5%]">
            <div className="relative w-[85%] h-[85%] rounded-[2rem] overflow-hidden shadow-2xl z-0 border border-gray-100">
              <img 
                src={content.featuredStory.image1} 
                className="w-full h-full object-cover" 
                alt="" 
              />
            </div>
            
            <motion.div 
              initial={{ x: -20, y: 20, opacity: 0 }}
              whileInView={{ x: 0, y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.3 }}
              className="absolute bottom-[-8%] left-[-8%] w-[55%] aspect-[4/5] rounded-[1.5rem] overflow-hidden shadow-2xl z-10 border-[8px] border-white"
            >
              <img 
                src={content.featuredStory.image2} 
                className="w-full h-full object-cover" 
                alt="" 
              />
            </motion.div>

            <div className="absolute -top-10 -right-10 w-48 h-48 bg-brand-orange/5 rounded-full blur-3xl -z-10" />
          </div>

        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-24 max-w-[1200px] mx-auto px-6 bg-white">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, x: -30 }}
            whileInView={{ opacity: 1, scale: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <img 
              src={content.featuredStory.highlight.image} 
              alt="Artisanal Heritage" 
              className="rounded-[3rem] shadow-2xl w-full max-h-[400px] object-cover"
            />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-brand-orange/10 rounded-full blur-3xl -z-10" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-fashion font-bold text-[#111111] mb-8 leading-tight">
              {content.featuredStory.highlight.title}
            </h2>
            <div className="space-y-6">
              {content.featuredStory.highlight.description.split('\n').map((para, idx) => para.trim() && (
                <p key={idx} className="text-gray-600 text-lg leading-relaxed font-light">
                  {para}
                </p>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-[#FAF9F6]">
        <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          {content.statsSection.stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <span className="text-5xl md:text-6xl font-fashion font-bold text-brand-orange block mb-3">
                {stat.value}
              </span>
              <span className="text-[11px] md:text-[12px] uppercase font-bold tracking-[0.2em] text-gray-400">
                {stat.label}
              </span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Dynamic Display Under Stats Section (Ethical Compass) */}
      <section className="py-32 bg-white text-center">
        <div className="max-w-[1200px] mx-auto px-6">
           <motion.h2 
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             className="text-4xl font-fashion font-bold text-[#111111] mb-10"
           >
             {content.statsSection.title}
           </motion.h2>
           <motion.p 
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ delay: 0.1 }}
             className="text-gray-500 max-w-4xl mx-auto text-lg font-light leading-relaxed px-4 md:px-0"
           >
             {content.statsSection.description}
           </motion.p>
        </div>
      </section>
    </div>
  );
}
