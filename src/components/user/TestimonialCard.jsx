import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

export default function TestimonialCard({ review, index }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, delay: index * 0.1 }}
      className={`flex-shrink-0 w-[300px] md:w-[380px] snap-start bg-white border border-gray-100 p-5 rounded-none shadow-[0_10px_30px_-15px_rgba(0,0,0,0.1)] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.15)] transition-all duration-500 flex flex-col md:flex-row gap-5 group relative ${isExpanded ? 'h-auto' : 'min-h-[310px] md:min-h-[170px] h-auto'}`}
    >
      {/* Decorative Border Accent */}
      <div className="absolute top-0 left-0 w-1 h-full bg-brand-orange scale-y-0 group-hover:scale-y-100 transition-transform duration-500 origin-top" />

      {/* Quote Background Watermark */}
      <div className="absolute bottom-4 right-4 text-brand-orange/[0.03] group-hover:text-brand-orange/[0.06] transition-colors pointer-events-none">
        <Quote className="w-20 h-20 md:w-24 md:h-24 rotate-12" />
      </div>

      {/* Image Section - Left side for Horizontal look */}
      <div className="flex-shrink-0">
        <div className="w-16 h-16 relative overflow-hidden bg-gray-50 border border-gray-100 group-hover:border-brand-orange/30 transition-colors">
          <img
            src={review.imageUrl || review.image}
            alt={review.name}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(review.name)}&background=FFF5F0&color=FF6B00&bold=true&font-size=0.4`;
            }}
            className="w-full h-full object-cover grayscale-[40%] group-hover:grayscale-0 transition-all duration-700"
          />
        </div>
      </div>

      {/* Content Section - Right side */}
      <div className="flex-1 flex flex-col">
        {/* Rating */}
        <div className="flex space-x-0.5 mb-3">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={12}
              className={i < review.rating ? 'fill-[#FFB800] text-[#FFB800]' : 'text-gray-100'}
            />
          ))}
        </div>

        <div className="flex-1">
          <p className={`text-gray-600 text-sm md:text-[14px] leading-relaxed font-sans font-medium ${isExpanded ? '' : 'line-clamp-4 md:line-clamp-none'}`}>
            "{review.text}"
          </p>

          {/* Show More/Less Button (Mobile Only, if text is long enough to clip) */}
          {review.text && review.text.length > 120 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="md:hidden text-brand-orange text-[9px] font-bold uppercase tracking-[0.2em] mt-3 hover:underline"
            >
              {isExpanded ? 'Collapse' : 'Read Full'}
            </button>
          )}
        </div>

        <div className="mt-3 pt-3 border-t border-gray-50">
          <h4 className="text-[#1A1A1A] font-sans font-bold text-xs md:text-[13px] uppercase tracking-wider mb-0.5">{review.name}</h4>
          <p className="text-[#B08968] text-[9px] uppercase font-bold tracking-[0.15em]">{review.location || review.category}</p>
        </div>
      </div>
    </motion.div>
  );
}
