import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';

export default function VideoModal({ isOpen, onClose, videoUrl, title }) {
  console.log("🎬 VideoModal URL:", videoUrl);
  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[900] flex items-center justify-center p-4 md:p-12 pointer-events-auto"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
          onClick={onClose}
        />

        {/* Modal Content container shifted down */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 60 }}
          exit={{ scale: 0.9, opacity: 0, y: 40 }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="relative w-full max-w-4xl aspect-video rounded-[2rem] overflow-visible shadow-[0_0_80px_rgba(0,0,0,0.3)] border border-white/10 bg-black"
        >
          {/* Close Button positioned above the video card */}
          <div className="absolute -top-12 right-0 flex items-center gap-3">

            <button
              onClick={onClose}
              className="w-10 h-10 bg-black/50 hover:bg-red-500 text-white rounded-full flex items-center justify-center transition-all border border-white/10 shadow-lg"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="w-full h-full rounded-[2rem] overflow-hidden">
            <video
              src={videoUrl}
              controls
              autoPlay
              className="w-full h-full object-contain"
            />
          </div>

          {/* Subtle Overlay Info */}
          <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none rounded-b-[2rem]">
            <h3 className="text-white text-xl md:text-2xl font-fashion font-bold tracking-tight">{title}</h3>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
