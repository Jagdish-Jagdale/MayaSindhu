import { motion } from 'framer-motion';
import { useState, useRef } from 'react';

export default function VideoCard({ videoUrl, title, category, thumbnail }) {
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef(null);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (videoRef.current) {
      videoRef.current.play().catch(e => console.error("Video play failed:", e));
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <motion.div
      className="relative flex-shrink-0 w-[320px] md:w-[400px] h-[500px] rounded-[3rem] overflow-hidden group cursor-pointer shadow-xl"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      whileHover={{ y: -10 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Thumbnail / Static State */}
      <img
        src={thumbnail}
        alt={title}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${isHovered ? 'opacity-0' : 'opacity-100'}`}
      />

      {/* Video Content */}
      <video
        ref={videoRef}
        src={videoUrl}
        muted
        loop
        playsInline
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      {/* Content Overlay */}
      <div className="absolute inset-0 p-8 flex flex-col justify-end">
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[#FF6B00] text-[10px] font-bold uppercase tracking-[0.3em] mb-2"
        >
          {category}
        </motion.span>
        
        <h3 className="text-white text-2xl font-fashion font-bold leading-tight mb-4 group-hover:text-[#FF6B00] transition-colors duration-300">
          {title}
        </h3>

        {/* Play Icon / Button */}
        <div className="flex items-center space-x-3 mt-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-500 opacity-0 group-hover:opacity-100">
          <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white" className="ml-1">
              <path d="M5 3l14 9-14 9V3z" />
            </svg>
          </div>
          <span className="text-white text-[11px] font-bold uppercase tracking-widest">Watch Story</span>
        </div>
      </div>

      {/* Glass Border Glow */}
      <div className="absolute inset-0 border border-white/10 rounded-[3rem] pointer-events-none group-hover:border-[#FF6B00]/30 transition-colors duration-500" />
    </motion.div>
  );
}
