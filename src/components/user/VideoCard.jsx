import { motion } from 'framer-motion';
import { useState, useRef } from 'react';

export default function VideoCard({ videoUrl, title, category, thumbnail, productImage }) {
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
      className="relative flex-shrink-0 w-[180px] md:w-[260px] h-[300px] md:h-[450px] rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden group cursor-pointer shadow-lg"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Background Image / Thumbnail */}
      <img
        src={thumbnail}
        alt={title}
        className={`absolute inset-0 w-full h-full object-cover ${isHovered ? 'opacity-0' : 'opacity-100'}`}
      />

      {/* Hover Video */}
      <video
        ref={videoRef}
        src={videoUrl}
        muted
        loop
        playsInline
        className={`absolute inset-0 w-full h-full object-cover ${isHovered ? 'opacity-100' : 'opacity-0'}`}
      />

      {/* Modern Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

      {/* Centered Play Button */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          animate={{ scale: isHovered ? 1.1 : 1, opacity: isHovered ? 1 : 0.8 }}
          className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-white/30 backdrop-blur-md border border-white/40 flex items-center justify-center text-white shadow-xl"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="ml-1">
            <path d="M7 6v12l10-6z" />
          </svg>
        </motion.div>
      </div>

      {/* Bottom Left Content Overlay */}
      <div className="absolute bottom-6 left-6 right-6 flex flex-col gap-4">
        {/* Look Description */}
        <p className="text-white text-[11px] md:text-[14px] font-medium leading-tight max-w-[160px] drop-shadow-md">
          {title}
        </p>

        {/* Product Thumbnail Teaser */}
        <div className="w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-xl border-2 border-white/50 overflow-hidden shadow-lg transition-transform duration-500 group-hover:scale-105">
          <img 
            src={productImage} 
            alt="Look product" 
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Soft Rim Light Effect (Hover) */}
      <div className="absolute inset-0 border border-white/0 group-hover:border-white/20 rounded-[2rem] md:rounded-[3rem] transition-colors duration-500 pointer-events-none" />
    </motion.div>
  );
}
