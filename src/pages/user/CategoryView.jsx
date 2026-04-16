import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronDown, SlidersHorizontal, X } from 'lucide-react';
import ProductCard from '../../components/user/ProductCard';
import useCategories from '../../hooks/useCategories';

import { PRODUCTS } from '../../data/products';


export default function CategoryView() {
  const { id } = useParams();
  const { categories, loading } = useCategories();
  const [currentCategory, setCurrentCategory] = useState(null);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  useEffect(() => {
    const findCategory = (list, targetId) => {
      for (const cat of list) {
        if (cat.id === targetId || cat.name === targetId) return cat;
        if (cat.children) {
          const found = findCategory(cat.children, targetId);
          if (found) return found;
        }
      }
      return null;
    };

    if (categories.length > 0) {
      setCurrentCategory(findCategory(categories, id));
    }
  }, [id, categories]);

  const filteredProducts = PRODUCTS.filter(p =>
    p.categoryId === id || (currentCategory && p.categoryId === currentCategory.name) || p.collection === id
  );

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFF9F0]">
      <div className="w-12 h-12 border-4 border-[#004D4D]/20 border-t-[#004D4D] rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-[1536px] mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-16">
          
          {/* Sidebar Filter - Desktop */}
          <aside className="hidden lg:block w-[280px] shrink-0">
            <div className="sticky top-40">
              <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-4">
                <h2 className="text-[12px] font-bold uppercase tracking-[0.3em] text-[#004D4D]/50">Filter By</h2>
                <button className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37] hover:underline">Reset</button>
              </div>

              <div className="space-y-6">
                <FilterSection title="Price Range">
                  <div className="space-y-2 mt-4">
                    {['Under 2000', '2000 - 5000', '5000 - 10000', 'Above 10000'].map((range) => (
                      <label key={range} className="flex items-center gap-3 cursor-pointer group">
                        <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#D4AF37] focus:ring-[#D4AF37]" />
                        <span className="text-sm text-[#004D4D]/60 group-hover:text-[#004D4D] transition-all">{range}</span>
                      </label>
                    ))}
                  </div>
                </FilterSection>

                <FilterSection title="Discount">
                  <div className="space-y-2 mt-4 text-sm text-[#004D4D]/60">
                    {['10% and Above', '20% and Above', '30% and Above'].map(item => (
                      <p key={item} className="hover:text-[#004D4D] cursor-pointer transition-all">{item}</p>
                    ))}
                  </div>
                </FilterSection>

                <FilterSection title="Fabric">
                  <div className="space-y-2 mt-4 text-sm text-[#004D4D]/60">
                    {['Pure Silk', 'Cotton', 'Linen'].map(item => (
                      <p key={item} className="hover:text-[#004D4D] cursor-pointer transition-all">{item}</p>
                    ))}
                  </div>
                </FilterSection>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
              <div>
                <nav className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-[#004D4D]/30 mb-6">
                  <Link to="/" className="hover:text-[#D4AF37] transition-colors">Home</Link>
                  <ChevronRight size={12} />
                  <Link to="/shop" className="hover:text-[#D4AF37] transition-colors">Shop</Link>
                  <ChevronRight size={12} />
                  <span className="text-[#D4AF37]">{currentCategory?.name || id}</span>
                </nav>
                <h1 className="text-4xl md:text-5xl font-fashion font-bold text-[#004D4D]">
                  {currentCategory?.name || id}
                </h1>
                <p className="text-[#004D4D]/40 mt-3 italic text-sm">{filteredProducts.length} Treasures Found</p>
              </div>

              <button 
                onClick={() => setIsMobileFiltersOpen(true)}
                className="lg:hidden flex items-center justify-center gap-3 px-8 py-3 border border-[#004D4D]/10 rounded-full text-[12px] font-bold uppercase tracking-widest text-[#004D4D] hover:bg-[#FFF9F0] transition-all"
              >
                <SlidersHorizontal size={18} /> Filters
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-12 gap-y-20">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <ProductCard key={product.id} {...product} />
                ))
              ) : (
                <div className="col-span-full py-32 text-center bg-[#FFF9F0]/30 rounded-[3rem] border border-[#D4AF37]/5">
                  <h3 className="text-2xl font-fashion font-bold text-[#004D4D]/20">No products found in this category yet.</h3>
                  <p className="text-[#004D4D]/30 mt-2">We are curating new treasures for you.</p>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      <AnimatePresence>
        {isMobileFiltersOpen && (
          <MobileFilters onClose={() => setIsMobileFiltersOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

function FilterSection({ title, children }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="border-b border-gray-50 pb-6">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left"
      >
        <span className="text-[13px] font-bold uppercase tracking-wider text-[#004D4D]">{title}</span>
        <ChevronDown size={16} className={`transition-transform duration-300 text-[#D4AF37] ${isOpen ? '' : '-rotate-90'}`} />
      </button>
      <motion.div
        initial={false}
        animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
        className="overflow-hidden"
      >
        {children}
      </motion.div>
    </div>
  );
}

function MobileFilters({ onClose }) {
  return (
    <>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-[#004D4D]/40 backdrop-blur-sm z-[2000]"
      />
      <motion.div 
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed top-0 right-0 bottom-0 w-[85%] max-w-[320px] bg-white z-[2100] p-8 overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-xl font-fashion font-bold text-[#004D4D]">Filters</h2>
          <button onClick={onClose} className="p-2 text-[#004D4D]"><X size={24} /></button>
        </div>
        
        <div className="space-y-10">
          <FilterSection title="Price Range">
            <div className="space-y-3 mt-4">
              {['Under 2000', '2000 - 5000', '5000 - 10000', 'Above 10000'].map((range) => (
                <label key={range} className="flex items-center gap-3">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300 transform scale-110" />
                  <span className="text-sm text-[#004D4D]/70">{range}</span>
                </label>
              ))}
            </div>
          </FilterSection>
        </div>

        <div className="mt-12 flex flex-col gap-4">
          <button className="bg-[#004D4D] text-white font-bold py-4 rounded-xl text-sm" onClick={onClose}>Apply Filters</button>
          <button className="text-xs font-bold uppercase tracking-widest text-[#004D4D]/40 py-2">Clear All</button>
        </div>
      </motion.div>
    </>
  );
}
