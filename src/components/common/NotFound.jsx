import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import bgImage from '../../assets/lotus-404-bg.png';

const NotFound = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Page Not Found | MayaSindhu';
  }, []);

  return (
    <div 
      className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-white"
      style={{ fontFamily: "'Raleway', sans-serif" }}
    >
      {/* Botanical Background Layer - Sharp focus */}
      <div className="absolute inset-0 z-0">
        <img 
          src={bgImage} 
          alt="Botanical Background" 
          className="w-full h-full object-cover"
        />
        {/* Transparent overlay for text contrast without blurring */}
        <div className="absolute inset-0 bg-white/10" />
      </div>

      <div className="relative z-10 text-center px-6 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        >
          {/* Main Heading - Raleway */}
          <h1 className="text-4xl md:text-[60px] font-normal text-[#1A2A47] mb-8 leading-[1.1] tracking-tight">
            Oops something <br className="hidden md:block" /> went wrong
          </h1>

          {/* Subtext - Raleway */}
          <p className="text-[#8E9AAF] text-sm md:text-base mb-14 leading-relaxed max-w-md mx-auto font-medium">
            The page you are looking for does not exist <br className="hidden md:block" /> or is under maintenance
          </p>

          {/* Burgundy Pill Button - Raleway */}
          <button
            onClick={() => navigate('/')}
            className="px-14 py-4 bg-[#8E1B39] text-white rounded-full font-bold text-[12px] uppercase tracking-[0.2em] transition-all duration-500 hover:bg-[#6D152B] hover:shadow-2xl hover:scale-105 active:scale-95 shadow-lg shadow-[#8E1B39]/20"
          >
            Go Back
          </button>
        </motion.div>

        {/* Floating Petals Decoration */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              opacity: 0, 
              x: Math.random() * 400 - 200, 
              y: -100,
              rotate: 0 
            }}
            animate={{ 
              opacity: [0, 0.4, 0],
              y: [null, 900],
              x: [null, Math.random() * 200 - 100],
              rotate: [0, 360]
            }}
            transition={{
              duration: 12 + Math.random() * 8,
              repeat: Infinity,
              delay: i * 1.5,
              ease: "linear"
            }}
            className="absolute pointer-events-none"
            style={{
              width: '12px',
              height: '22px',
              background: 'linear-gradient(to bottom, #FFE5E5, #FFBDBD)',
              borderRadius: '50% 0 50% 0',
              filter: 'blur(0.5px)', // Reduced blur for sharpness
              top: '-10%',
              left: `${Math.random() * 100}%`
            }}
          />
        ))}
      </div>

      {/* Boutique Floating Icon */}
      <div className="absolute bottom-10 left-10 z-20">
        <div className="w-11 h-11 bg-[#8E1B39] rounded-[14px] flex items-center justify-center shadow-lg">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
