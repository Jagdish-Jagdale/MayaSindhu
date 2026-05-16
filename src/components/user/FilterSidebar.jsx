import React, { useState, useEffect } from 'react';
import { ChevronDown, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import useCategories from '../../hooks/useCategories';

const CategoryNode = ({ category, currentPath }) => {
  const hasChildren = category.children && category.children.length > 0;
  const isActive = currentPath === category.fullPath;
  const isPartiallyActive = currentPath.startsWith(category.fullPath) && !isActive;

  const [isOpen, setIsOpen] = useState(isActive || isPartiallyActive);

  useEffect(() => {
    if (isActive || isPartiallyActive) {
      setIsOpen(true);
    }
  }, [isActive, isPartiallyActive]);

  const handleToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between group py-1.5 transition-all">
        <Link
          to={category.fullPath}
          className={`flex items-center flex-1 text-[11px] font-sans font-semibold uppercase tracking-[0.02em] transition-all focus:outline-none ${isActive ? 'text-brand-orange translate-x-2' : 'text-gray-500 hover:text-brand-orange hover:translate-x-1'
            }`}
        >
          <span>{category.name}</span>
          <div className={`ml-2 w-1 h-1 rounded-full bg-brand-orange transition-all ${isActive ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`} />
        </Link>
        {hasChildren && (
          <button
            onClick={handleToggle}
            className={`p-1 hover:text-brand-orange transition-colors focus:outline-none ${isActive ? 'text-brand-orange' : 'text-gray-400'}`}
          >
            <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>

      <AnimatePresence>
        {hasChildren && isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="pl-3 mt-1 ml-1 space-y-1 border-l border-gray-200/60">
              {category.children.map(child => (
                <CategoryNode key={child.id} category={child} currentPath={currentPath} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FilterAccordion = ({ title, children, isOpen, onToggle }) => {
  return (
    <div className="border-b border-gray-200/60 py-5">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full text-[13px] font-sans font-bold tracking-[0.05em] uppercase text-[#1A1A1A] hover:text-brand-orange transition-colors group focus:outline-none focus:ring-0"
      >
        <span className="whitespace-nowrap truncate">{title}</span>
        <ChevronDown
          size={14}
          className={`flex-shrink-0 ml-2 transition-transform duration-500 ease-in-out text-gray-400 ${isOpen ? 'rotate-180' : ''}`}
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

export default function FilterSidebar({ className = "", categories = [], onFilterChange }) {
  const location = useLocation();
  const { categories: allCategories } = useCategories();
  
  const displayCategories = categories.length > 0 ? categories : allCategories;

  const [openSections, setOpenSections] = useState({
    categories: true,
    availability: false,
    price: false,
    size: false
  });

  const [selectedFilters, setSelectedFilters] = useState({
    availability: [],
    size: []
  });

  const [priceRange, setPriceRange] = useState({ min: 0, max: 20000 });

  const filterData = {
    availability: ['In Stock', 'Out of Stock', 'Pre-order'],
    size: []
  };

  const toggleSection = (section) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleCheckboxChange = (section, option) => {
    setSelectedFilters(prev => {
      const currentSection = prev[section];
      const newSection = currentSection.includes(option)
        ? currentSection.filter(item => item !== option)
        : [...currentSection, option];

      const newFilters = { ...prev, [section]: newSection };
      if (onFilterChange) onFilterChange({ ...newFilters, priceRange });
      return newFilters;
    });
  };

  const handlePriceChange = (type, value) => {
    const val = parseInt(value) || 0;
    const newRange = { ...priceRange, [type]: val };
    setPriceRange(newRange);
    if (onFilterChange) onFilterChange({ ...selectedFilters, priceRange: newRange });
  };

  return (
    <div className={`w-full bg-[#F9F9F9] p-4 md:p-6 min-h-fit ${className}`}>
      <div className="space-y-2">
        <FilterAccordion
          title="EXPLORE SUBRANGES"
          isOpen={openSections.categories}
          onToggle={() => toggleSection('categories')}
        >
          <div className="space-y-1">
            {displayCategories.map((category) => (
              <CategoryNode key={category.id} category={category} currentPath={location.pathname} />
            ))}
          </div>
        </FilterAccordion>

        {/* Price Range Filter */}
        <FilterAccordion
          title="PRICE"
          isOpen={openSections.price}
          onToggle={() => toggleSection('price')}
        >
          <div className="space-y-8 pt-6 px-1">
            <div className="relative h-1 w-full bg-gray-200 rounded-full group">
              {/* Highlight bar between handles */}
              <div 
                className="absolute h-full bg-brand-orange rounded-full" 
                style={{ 
                  left: `${(priceRange.min / 20000) * 100}%`, 
                  right: `${100 - (priceRange.max / 20000) * 100}%` 
                }}
              ></div>
              
              {/* Dual Range Inputs */}
              <style>{`
                .range-slider::-webkit-slider-thumb {
                  appearance: none;
                  width: 20px;
                  height: 20px;
                  background: #F99C00;
                  border: 3px solid white;
                  border-radius: 50%;
                  cursor: pointer;
                  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
                  pointer-events: auto;
                  margin-top: -1px;
                }
                .range-slider::-moz-range-thumb {
                  width: 20px;
                  height: 20px;
                  background: #F99C00;
                  border: 3px solid white;
                  border-radius: 50%;
                  cursor: pointer;
                  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
                  pointer-events: auto;
                }
              `}</style>
              <input
                type="range"
                min="0"
                max="20000"
                value={priceRange.min}
                onChange={(e) => {
                  const val = Math.min(Number(e.target.value), priceRange.max - 500);
                  handlePriceChange('min', val);
                }}
                className="range-slider absolute top-1/2 -translate-y-1/2 w-full appearance-none bg-transparent pointer-events-none z-30"
              />
              <input
                type="range"
                min="0"
                max="20000"
                value={priceRange.max}
                onChange={(e) => {
                  const val = Math.max(Number(e.target.value), priceRange.min + 500);
                  handlePriceChange('max', val);
                }}
                className="range-slider absolute top-1/2 -translate-y-1/2 w-full appearance-none bg-transparent pointer-events-none z-40"
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-[3] relative group">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[12px] text-gray-400 font-sans">₹</span>
                <input
                  type="number"
                  placeholder="0"
                  value={priceRange.min}
                  onChange={(e) => handlePriceChange('min', e.target.value)}
                  className="w-full bg-white border border-gray-200 py-3 pl-8 pr-2 text-[15px] font-medium text-[#1A1A1A] focus:outline-none focus:border-brand-orange transition-all rounded-lg shadow-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
              <span className="flex-1 text-center text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">To</span>
              <div className="flex-[3] relative group">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[12px] text-gray-400 font-sans">₹</span>
                <input
                  type="number"
                  placeholder="20000"
                  value={priceRange.max}
                  onChange={(e) => handlePriceChange('max', e.target.value)}
                  className="w-full bg-white border border-gray-200 py-3 pl-8 pr-2 text-[15px] font-medium text-[#1A1A1A] focus:outline-none focus:border-brand-orange transition-all rounded-lg shadow-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            </div>
          </div>
        </FilterAccordion>

        {Object.entries(filterData).map(([sectionKey, options]) => (
          <FilterAccordion
            key={sectionKey}
            title={sectionKey.toUpperCase()}
            isOpen={openSections[sectionKey]}
            onToggle={() => toggleSection(sectionKey)}
          >
            <div className="flex flex-col gap-3">
              {options.map((option) => (
                <label key={option} className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input
                      type="checkbox"
                      className="peer appearance-none w-4 h-4 border border-gray-300 rounded-sm checked:bg-brand-orange checked:border-brand-orange transition-all"
                      checked={selectedFilters[sectionKey]?.includes(option)}
                      onChange={() => handleCheckboxChange(sectionKey, option)}
                    />
                    <div className="absolute opacity-0 peer-checked:opacity-100 text-white pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest group-hover:text-brand-orange transition-colors">
                    {option}
                  </span>
                </label>
              ))}
            </div>
          </FilterAccordion>
        ))}
      </div>
    </div>
  );
}
