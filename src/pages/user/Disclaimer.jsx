import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { db } from '../../firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function Disclaimer() {
  const [globalDisclaimer, setGlobalDisclaimer] = useState("The actual product color may vary slightly from the images shown due to photography lighting, camera settings, and differences in screen/display settings");

  useEffect(() => {
    const fetchDisclaimer = async () => {
      try {
        const docRef = doc(db, 'settings', 'general');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().productDisclaimer) {
          setGlobalDisclaimer(docSnap.data().productDisclaimer);
        }
      } catch (err) {
        console.error("Error fetching disclaimer", err);
      }
    };
    fetchDisclaimer();
  }, []);

  return (
    <div className="bg-white min-h-screen font-sans text-[#1A1A1A]">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden bg-white border-b border-gray-100">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1454165833767-027ffea9e778?auto=format&fit=crop&q=80&w=2000" 
            className="w-full h-full object-cover opacity-10"
            alt="Disclaimer Background"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/50 via-transparent to-white"></div>
        </div>
        <div className="relative z-10 text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center mb-6"
          >
            <div className="w-16 h-16 bg-white shadow-xl rounded-full flex items-center justify-center border border-gray-100">
              <AlertCircle className="text-brand-orange" size={32} />
            </div>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-sans font-bold text-[#1A1A1A] mb-4 tracking-tight"
          >
            Product <span className="text-brand-orange">Disclaimer</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 text-[10px] md:text-xs uppercase tracking-[0.4em] font-black"
          >
            Important Information for Our Visitors
          </motion.p>
        </div>
      </section>

      {/* Content Section */}
      <section className="max-w-4xl mx-auto px-6 py-24">
        <div className="bg-white p-8 md:p-20 rounded-3xl shadow-[0_4px_40px_rgba(0,0,0,0.03)] border border-gray-100 text-center">
          <p className="text-gray-600 leading-relaxed text-xl font-medium italic">
            "{globalDisclaimer}"
          </p>
        </div>
      </section>
    </div>
  );
}
