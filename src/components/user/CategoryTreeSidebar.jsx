import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const FilterAccordion = ({ title, children, isOpen, onToggle }) => {
  return (
    <div className="border-b border-gray-200/60 py-5">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full text-[13px] font-sans font-bold tracking-[0.1em] uppercase text-brand-black hover:text-brand-orange transition-colors group whitespace-nowrap"
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

const TreeNode = ({ node, level = 0 }) => {
  const location = useLocation();
  const isActive = location.pathname === node.fullPath;
  
  const hasActiveChild = (n) => {
    if (n.fullPath === location.pathname) return true;
    if (n.children) {
      return n.children.some(hasActiveChild);
    }
    return false;
  };

  const isChildActive = node.children && node.children.some(hasActiveChild);
  const [isOpen, setIsOpen] = useState(isActive || isChildActive);

  useEffect(() => {
    if (isActive || isChildActive) {
      setIsOpen(true);
    }
  }, [location.pathname, isActive, isChildActive]);

  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="flex flex-col">
      <div 
        className={`flex items-center justify-between py-2 group cursor-pointer transition-colors ${
          level > 0 ? 'pl-4' : ''
        }`}
        onClick={() => hasChildren ? setIsOpen(!isOpen) : null}
      >
        {hasChildren ? (
          <span className={`text-[13px] font-sans font-bold capitalize tracking-[0.05em] transition-all ${
            isActive 
              ? 'text-brand-orange' 
              : isChildActive 
                ? 'text-brand-black' 
                : 'text-gray-500 hover:text-brand-orange'
          }`}>
            {node.name}
          </span>
        ) : (
          <Link 
            to={node.fullPath}
            className={`text-[13px] font-sans font-bold capitalize tracking-[0.05em] transition-all ${
              isActive ? 'text-brand-orange' : 'text-gray-500 hover:text-brand-orange'
            }`}
          >
            {node.name}
          </Link>
        )}
      </div>

      <AnimatePresence>
        {hasChildren && isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className={`relative ml-2 mt-1 border-l border-brand-orange/20`}>
              <div className="pl-4 space-y-1">
                {node.children.map((child) => (
                  <TreeNode key={child.id} node={child} level={level + 1} />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function CategoryTreeSidebar({ categories = [], className = "" }) {
  const [openSections, setOpenSections] = useState({
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
    <div className={`w-full bg-[#F9F9F9] px-6 py-6 min-h-fit ${className}`}>
      <h3 className="text-[14px] font-sans font-bold tracking-[0.1em] capitalize text-gray-400 mb-6 border-b border-gray-200/60 pb-4 whitespace-nowrap">
        Categories
      </h3>
      <div className="space-y-2">
        {categories.map((category) => (
          <TreeNode key={category.id} node={category} />
        ))}
      </div>

      <div className="mt-12 space-y-2 border-t border-gray-200/60 pt-4">
        <FilterAccordion 
          title="Availability" 
          isOpen={openSections.availability} 
          onToggle={() => toggleSection('availability')}
        >
          <div className="text-[10px] text-gray-400 font-medium tracking-widest uppercase">
            No filters available
          </div>
        </FilterAccordion>

        <FilterAccordion 
          title="Price" 
          isOpen={openSections.price} 
          onToggle={() => toggleSection('price')}
        >
          <div className="text-[10px] text-gray-400 font-medium tracking-widest uppercase">
            No filters available
          </div>
        </FilterAccordion>

        <FilterAccordion 
          title="Size" 
          isOpen={openSections.size} 
          onToggle={() => toggleSection('size')}
        >
          <div className="text-[10px] text-gray-400 font-medium tracking-widest uppercase">
            No filters available
          </div>
        </FilterAccordion>

        <FilterAccordion 
          title="More Filters" 
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
