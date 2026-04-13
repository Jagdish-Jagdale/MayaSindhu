import { motion, AnimatePresence } from 'framer-motion';

export default function VideoModal({ isOpen, onClose, videoUrl, title }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 pointer-events-auto"
      >
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/95 backdrop-blur-xl" 
          onClick={onClose}
        />

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 z-[110] text-white/50 hover:text-white transition-colors p-2"
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {/* Modal Content */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-6xl aspect-video rounded-[2rem] overflow-hidden shadow-2xl shadow-black/50 border border-white/10"
        >
          <video
            src={videoUrl}
            controls
            autoPlay
            className="w-full h-full object-cover"
          />
          
          {/* Overlay Info */}
          <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 to-transparent">
            <h3 className="text-white text-3xl font-fashion font-bold">{title}</h3>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
