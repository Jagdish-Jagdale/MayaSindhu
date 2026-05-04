import React, { useState } from 'react';
import { ChevronDown, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';

const FilterAccordion = ({ title, children, isOpen, onToggle }) => {
  return (
    <div className="border-b border-gray-200/60 py-5">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full text-[13px] font-sans font-bold tracking-[0.05em] uppercase text-[#1A1A1A] hover:text-brand-orange transition-colors group"
      >
        <span>{title}</span>
        <ChevronDown 
          size={14} 
          className={`transition-transform duration-500 ease-in-out text-gray-400 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            className="overflow-hidden"
          >
            <div className="pt-6 pb-2 space-y-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function FilterSidebar({ className = "", subranges = [] }) {
  const location = useLocation();
  const [openSections, setOpenSections] = useState({
    subranges: true,
    availability: false,
    price: false,
    size: false,
    more: false
  });

  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className={`w-full bg-[#F9F9F9] p-8 md:p-10 min-h-fit ${className}`}>
      <div className="space-y-2">
        <FilterAccordion 
          title="EXPLORE SUBRANGES" 
          isOpen={openSections.subranges} 
          onToggle={() => toggleSection('subranges')}
        >
          <div className="space-y-4">
            {subranges.map((range) => {
              const isActive = location.pathname === range.fullPath;
              return (
                <Link 
                  key={range.id} 
                  to={range.fullPath}
                  className={`flex items-center justify-between group py-1 text-[11px] font-sans font-semibold uppercase tracking-[0.02em] transition-all ${
                    isActive ? 'text-brand-orange translate-x-2' : 'text-gray-500 hover:text-brand-orange hover:translate-x-1'
                  }`}
                >
                  <span>{range.name}</span>
                  <div className={`w-1 h-1 rounded-full bg-brand-orange transition-all ${isActive ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`} />
                </Link>
              );
            })}
          </div>
        </FilterAccordion>

        <FilterAccordion 
          title="AVAILABILITY" 
          isOpen={openSections.availability} 
          onToggle={() => toggleSection('availability')}
        >
          <div className="text-[10px] text-gray-400 font-medium tracking-widest uppercase">
            No filters available
          </div>
        </FilterAccordion>

        <FilterAccordion 
          title="PRICE" 
          isOpen={openSections.price} 
          onToggle={() => toggleSection('price')}
        >
          <div className="text-[10px] text-gray-400 font-medium tracking-widest uppercase">
            No filters available
          </div>
        </FilterAccordion>

        <FilterAccordion 
          title="SIZE" 
          isOpen={openSections.size} 
          onToggle={() => toggleSection('size')}
        >
          <div className="text-[10px] text-gray-400 font-medium tracking-widest uppercase">
            No filters available
          </div>
        </FilterAccordion>

        <FilterAccordion 
          title="MORE FILTERS" 
          isOpen={openSections.more} 
          onToggle={() => toggleSection('more')}
        >
          <div className="text-[10px] text-gray-400 font-medium tracking-widest uppercase">
            No filters available
          </div>
        </FilterAccordion>
      </div>
    </div>
  );
}
