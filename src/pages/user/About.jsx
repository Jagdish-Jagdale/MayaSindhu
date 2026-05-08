import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function About() {
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
        
        <div className="relative text-center px-6">
          <motion.span 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[12px] uppercase tracking-[0.4em] font-bold mb-4 block text-brand-orange"
          >
            Our Heritage
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl md:text-5xl font-fashion font-bold text-white drop-shadow-lg"
          >
            The MayaSindhu Story
          </motion.h1>
        </div>
      </section>

      {/* Editorial Storytelling Section - Brought from Blog */}
      <section className="py-24 max-w-[1536px] mx-auto px-6 lg:px-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          
          {/* Left Column: Editorial Text */}
          <div className="order-2 lg:order-1 space-y-8 max-w-lg">
            <div className="space-y-4">
              <span className="text-[10px] md:text-[12px] font-bold uppercase tracking-[0.4em] text-gray-500 block">
                FEATURED STORY
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-fashion font-medium leading-[1.2] tracking-tight text-[#111111]">
                The Art of Handwoven Sarees: A Heritage Rediscovered
              </h2>
            </div>
            
            <p className="text-gray-600 text-sm md:text-base leading-relaxed font-light">
              Explore the intricate journey of traditional weaving techniques that are making a massive comeback in modern fashion wardrobes. From the loom to the modern muse, witness the evolution of heritage.
            </p>
          </div>

          {/* Right Column: Overlapping Images */}
          <div className="order-1 lg:order-2 relative aspect-[4/5] md:aspect-square flex items-center justify-center lg:justify-end pr-[15%] pt-[5%]">
            {/* Background Image (Larger) */}
            <div className="relative w-[80%] h-[80%] rounded-2xl overflow-hidden shadow-2xl z-0 border border-gray-100">
              <img 
                src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800" 
                alt="Heritage Saree" 
                className="w-full h-full object-cover" 
              />
            </div>
            
            {/* Foreground Image (Smaller, Offset) */}
            <motion.div 
              initial={{ x: -20, y: 20, opacity: 0 }}
              whileInView={{ x: 0, y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.3 }}
              className="absolute bottom-[-5%] left-[-5%] w-[50%] aspect-[4/5] rounded-xl overflow-hidden shadow-2xl z-10 border-[6px] border-white"
            >
              <img 
                src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800" 
                alt="Artisan Detail" 
                className="w-full h-full object-cover" 
              />
            </motion.div>

            {/* Decorative Background Element */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-orange/5 rounded-full blur-3xl -z-10" />
          </div>

        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-24 max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, x: -30 }}
            whileInView={{ opacity: 1, scale: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <img 
              src="https://images.unsplash.com/photo-1672302255324-28009cc288b2?q=80&w=687&auto=format&fit=crop" 
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
            <h2 className="text-4xl font-fashion font-bold text-[#111111] mb-8 leading-tight">Bridging the Gap Between Ancient Hands & Modern Muses</h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-6 font-light">
              MayaSindhu was born from an obsession with the soulful imperfections of the handmade. In a world of fast fashion and mass production, we stood for the slow, the deliberate, and the heritage-driven.
            </p>
            <p className="text-gray-600 text-lg leading-relaxed mb-6 font-light">
              Our name, a tribute to the mystical "Maya" and the ancient "Sindhu" river, represents the flow of creativity across generations. From the weaver's loom in Varanasi to the block printer's table in Jaipur, we curate pieces that are not just garments, but living canvases.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-[#FAF9F6] py-24">
        <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          {[
            { label: 'Artisans Empowered', value: '200+' },
            { label: 'Women-Led Clusters', value: '12' },
            { label: 'Heritage Crafts', value: '15+' },
            { label: 'Sustainable Years', value: '8' }
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <span className="text-4xl md:text-5xl font-fashion font-bold text-brand-orange block mb-2">{stat.value}</span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400">{stat.label}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-24 max-w-[1200px] mx-auto px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-fashion font-bold mb-8">Our Ethical Compass</h2>
          <p className="text-gray-600 text-lg leading-relaxed font-light">
            We ensure fair wages, safe working conditions, and the preservation of dying arts. Every purchase at MayaSindhu directly impacts a family of artisans, keeping the tradition of hand-embroidery, natural dyeing, and hand-weaving alive for another century.
          </p>
        </div>
      </section>
    </div>
  );
}
