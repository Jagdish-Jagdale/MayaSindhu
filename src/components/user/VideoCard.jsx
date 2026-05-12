import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { db } from '../../firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function VideoCard({ videoUrl, title, category, thumbnail, productImage, productId }) {
  const [videoError, setVideoError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef(null);
  const [productData, setProductData] = useState(null);

  // Auto-generate thumbnail from video URL if missing (Cloudinary support)
  const displayThumbnail = (() => {
    if (thumbnail) return thumbnail;
    if (videoUrl?.includes('res.cloudinary.com')) {
      return videoUrl.replace(/\.[^.]+$/, '.jpg');
    }
    return 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop';
  })();

  // Fetch linked product data
  useEffect(() => {
    if (!productId) return;
    const fetchProd = async () => {
      try {
        const docRef = doc(db, 'products', productId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProductData(docSnap.data());
        }
      } catch (error) {
        console.error("Error fetching product for look:", error);
      }
    };
    fetchProd();
  }, [productId]);

  const handleMouseEnter = () => {
    if (videoError) return;
    setIsHovered(true);
    if (videoRef.current) {
      videoRef.current.play().catch(e => {
        console.error("Video play failed:", e);
        setVideoError(true);
      });
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
      className="relative flex-shrink-0 w-[200px] md:w-[280px] h-[320px] md:h-[480px] rounded-2xl md:rounded-3xl overflow-hidden group cursor-pointer shadow-lg bg-gray-100"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Background Image / Thumbnail */}
      <img
        src={displayThumbnail}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Hover Video */}
      <video
        ref={videoRef}
        src={videoUrl}
        muted
        loop
        playsInline
        onError={() => {
          console.error("❌ Video Source Error:", videoUrl);
          setVideoError(true);
        }}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out ${isHovered && !videoError ? 'opacity-100' : 'opacity-0'}`}
      />

      {/* Modern Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10" />

      {/* Centered Play Button (Pulse on Hover) */}
      {!isHovered && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-xl">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="ml-1 opacity-80">
              <path d="M7 6v12l10-6z" />
            </svg>
          </div>
        </div>
      )}

      {/* Bottom Content Area */}
      <div className="absolute bottom-2.5 md:bottom-3.5 left-2.5 md:left-3.5 right-2.5 md:right-3.5 flex flex-col gap-2.5">
        {/* Story Title */}
        {title && (
          <p className="text-white text-[11px] md:text-[14px] font-medium leading-tight max-w-[180px] drop-shadow-md px-1">
            {title}
          </p>
        )}

        {/* Dynamic Product Card Overlay (The "Shop" part) - Instant Display */}
        {productData && isHovered && (
          <div className="bg-white rounded-xl md:rounded-2xl p-2 md:p-2.5 flex items-center gap-3 shadow-2xl border border-white/20 backdrop-blur-sm transition-transform duration-500 group-hover:scale-[1.02] animate-in fade-in duration-100">
            {/* Product Image */}
            <div className="relative w-9 h-11 md:w-12 md:h-15 rounded-lg overflow-hidden flex-shrink-0 bg-gray-50">
              <img
                src={productData.images?.[0] || productImage}
                alt={productData.name}
                className="w-full h-full object-cover"
              />
              {productData.isNew && (
                <span className="absolute top-0 left-0 bg-brand-orange text-white text-[6px] font-bold px-1 py-0.5 rounded-br-md uppercase">New</span>
              )}
            </div>

            {/* Product Info */}
            <div className="flex-1 min-w-0">
              <h4 className="text-[10px] md:text-[12px] font-bold text-gray-800 truncate leading-tight mb-1">
                {productData.name}
              </h4>
              <div className="flex items-center gap-2">
                <span className="text-[10px] md:text-[13px] font-bold text-brand-orange">
                  ₹{productData.price}
                </span>
                {productData.originalPrice && (
                  <span className="text-[8px] md:text-[10px] text-gray-400 line-through">
                    ₹{productData.originalPrice}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Rim Light Effect */}
      <div className="absolute inset-0 border border-white/0 group-hover:border-white/20 rounded-2xl md:rounded-3xl transition-colors duration-500 pointer-events-none" />
    </motion.div>
  );
}
