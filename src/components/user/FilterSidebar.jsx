import React, { useState, useEffect } from 'react';
import { ChevronDown, ArrowRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';

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
          className={`flex items-center flex-1 text-[11px] font-sans font-semibold uppercase tracking-[0.02em] transition-all ${
            isActive ? 'text-brand-orange translate-x-2' : 'text-gray-500 hover:text-brand-orange hover:translate-x-1'
          }`}
        >
          <span>{category.name}</span>
          <div className={`ml-2 w-1 h-1 rounded-full bg-brand-orange transition-all ${isActive ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`} />
        </Link>
        {hasChildren && (
          <button
            onClick={handleToggle}
            className={`p-1 hover:text-brand-orange transition-colors ${isActive ? 'text-brand-orange' : 'text-gray-400'}`}
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
        className="flex items-center justify-between w-full text-[13px] font-sans font-bold tracking-[0.05em] uppercase text-[#1A1A1A] hover:text-brand-orange transition-colors group"
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

export default function FilterSidebar({ className = "", categories = [], onFilterChange, ...props }) {
  const location = useLocation();
  
  // State for expanded sections
  const [openSections, setOpenSections] = useState({
    categories: true,
    availability: true,
    price: true,
    size: true,
    more: true
  });

  // State for selected filters
  const [selectedFilters, setSelectedFilters] = useState({
    availability: [],
    price: [],
    size: [],
    more: []
  });

  const filterData = {
    availability: ['In Stock', 'Out of Stock', 'Pre-order', 'Coming Soon'],
    price: ['₹0 – ₹500', '₹500 – ₹1000', '₹1000 – ₹2000', '₹2000+'],
    size: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    more: ['Brand', 'Color', 'Rating (4★ & above)', 'Discount', 'New Arrivals']
  };

  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleCheckboxChange = (section, option) => {
    setSelectedFilters(prev => {
      const currentSection = prev[section];
      const newSection = currentSection.includes(option)
        ? currentSection.filter(item => item !== option)
        : [...currentSection, option];
      
      const newFilters = { ...prev, [section]: newSection };
      console.log('Selected Filters:', newFilters);
      
      if (onFilterChange) {
        onFilterChange(newFilters);
      }
      return newFilters;
    });
  };

  const clearAllFilters = () => {
    const cleared = {
      availability: [],
      price: [],
      size: [],
      more: []
    };
    setSelectedFilters(cleared);
    if (onFilterChange) {
      onFilterChange(cleared);
    }
  };

  const isAnyFilterSelected = Object.values(selectedFilters).some(arr => arr.length > 0);

  return (
    <div className={`w-full bg-[#F9F9F9] p-4 md:p-6 min-h-fit border-end ${className}`}>
      <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <h6 className="mb-0 fw-bold text-uppercase tracking-wider">Filters</h6>
        {isAnyFilterSelected && (
          <button 
            onClick={clearAllFilters}
            className="btn btn-link btn-sm text-danger p-0 text-decoration-none fw-semibold"
            style={{ fontSize: '11px' }}
          >
            Clear All
          </button>
        )}
      </div>

      <div className="accordion accordion-flush" id="filterAccordion">
        {/* Categories Section - Keeping the original Tree structure if provided */}
        {categories.length > 0 && (
          <FilterAccordion
            title="EXPLORE SUBRANGES"
            isOpen={openSections.categories}
            onToggle={() => toggleSection('categories')}
          >
            <div className="space-y-1">
              {categories.map((category) => (
                <CategoryNode key={category.id} category={category} currentPath={location.pathname} />
              ))}
            </div>
          </FilterAccordion>
        )}

        {/* Dynamic Filter Sections */}
        {Object.entries(filterData).map(([sectionKey, options]) => (
          <FilterAccordion
            key={sectionKey}
            title={sectionKey.replace(/([A-Z])/g, ' $1').toUpperCase()}
            isOpen={openSections[sectionKey]}
            onToggle={() => toggleSection(sectionKey)}
          >
            <div className="d-flex flex-column gap-2 ms-1">
              {options.map((option) => (
                <div key={option} className="form-check d-flex align-items-center mb-1">
                  <input
                    className="form-check-input mt-0 cursor-pointer border-secondary-subtle"
                    type="checkbox"
                    style={{ width: '16px', height: '16px', borderRadius: '4px' }}
                    id={`${sectionKey}-${option}`}
                    checked={selectedFilters[sectionKey]?.includes(option)}
                    onChange={() => handleCheckboxChange(sectionKey, option)}
                  />
                  <label 
                    className="form-check-label ms-2 text-secondary cursor-pointer" 
                    htmlFor={`${sectionKey}-${option}`}
                    style={{ fontSize: '13px', lineHeight: '1.2' }}
                  >
                    {option}
                  </label>
                </div>
              ))}
            </div>
          </FilterAccordion>
        ))}
      </div>

      {/* Selected Filters Display (Optional, as requested "Display selected filters in console or UI") */}
      {isAnyFilterSelected && (
        <div className="mt-4 pt-4 border-top">
          <div className="text-[10px] text-gray-400 font-bold tracking-widest uppercase mb-3">Active Filters</div>
          <div className="d-flex flex-wrap gap-2">
            {Object.entries(selectedFilters).map(([section, filters]) => 
              filters.map(filter => (
                <span 
                  key={`${section}-${filter}`}
                  className="badge bg-light text-dark border d-flex align-items-center gap-1 fw-normal px-2 py-1.5"
                  style={{ fontSize: '11px', borderRadius: '20px' }}
                >
                  {filter}
                  <X 
                    size={12} 
                    className="cursor-pointer text-muted hover-text-dark" 
                    onClick={() => handleCheckboxChange(section, filter)}
                  />
                </span>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

