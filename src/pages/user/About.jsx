import React from 'react';
import { motion } from 'framer-motion';

export default function About() {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1590736704228-a4004944883f?q=80&w=2000" 
            alt="Artisan Background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
        </div>
        
        <div className="relative text-center text-white px-6">
          <motion.span 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[12px] uppercase tracking-[0.4em] font-bold mb-4 block"
          >
            Our Heritage
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-7xl font-fashion font-bold"
          >
            The MayaSindhu Story
          </motion.h1>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-24 max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-fashion font-bold text-[#1A1A1A] mb-8">Bridging the Gap Between Ancient Hands & Modern Muses</h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              MayaSindhu was born from an obsession with the soulful imperfections of the handmade. In a world of fast fashion and mass production, we stood for the slow, the deliberate, and the heritage-driven.
            </p>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              Our name, a tribute to the mystical "Maya" and the ancient "Sindhu" river, represents the flow of creativity across generations. From the weaver's loom in Varanasi to the block printer's table in Jaipur, we curate pieces that are not just garments, but living canvases.
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <img 
              src="https://images.unsplash.com/photo-1610030469668-9de19bd49031?q=80&w=1000" 
              alt="Handcrafted fabric" 
              className="rounded-[3rem] shadow-2xl"
            />
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-brand-orange/10 rounded-full blur-3xl -z-10" />
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
          <p className="text-gray-600 text-lg leading-relaxed">
            We ensure fair wages, safe working conditions, and the preservation of dying arts. Every purchase at MayaSindhu directly impacts a family of artisans, keeping the tradition of hand-embroidery, natural dyeing, and hand-weaving alive for another century.
          </p>
        </div>
      </section>
    </div>
  );
}
