import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronDown, SlidersHorizontal, X } from 'lucide-react';
import ProductCard from '../../components/user/ProductCard';
import useCategories from '../../hooks/useCategories';

import { PRODUCTS } from '../../data/products';


export default function CategoryView() {
  const params = useParams();
  const pathSegments = params['*'] ? params['*'].split('/') : [];
  const { categories, loading } = useCategories();
  const [currentCategory, setCurrentCategory] = useState(null);
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  useEffect(() => {
    if (categories.length > 0) {
      let current = categories;
      let targetCat = null;
      let path = [];

      for (const segment of pathSegments) {
        const match = current.find(c => (c.slug || c.name.toLowerCase().replace(/\s+/g, '-')) === segment);
        if (match) {
          path.push(match);
          targetCat = match;
          current = match.children || [];
        } else {
          break;
        }
      }

      setCurrentCategory(targetCat);
      setBreadcrumbs(path);
    }
  }, [params['*'], categories]);

  // Aggregate products from the current category and all its children
  const getAllChildCategoryIds = (cat) => {
    let ids = [cat.name, cat.id, cat.slug]; // Handle various mapping styles
    if (cat.children) {
      cat.children.forEach(child => {
        ids = [...ids, ...getAllChildCategoryIds(child)];
      });
    }
    return ids;
  };

  const relevantCategoryIdentifiers = currentCategory ? getAllChildCategoryIds(currentCategory) : [];

  const filteredProducts = PRODUCTS.filter(p =>
    relevantCategoryIdentifiers.includes(p.categoryId) || 
    relevantCategoryIdentifiers.includes(p.collection) ||
    (currentCategory && p.collection?.toLowerCase() === currentCategory.name.toLowerCase())
  );

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-bg-alt">
      <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="bg-white min-h-screen">
      {/* Category Hero / Banner */}
      <div className="bg-bg-alt border-b border-gray-100">
        <div className="max-w-[1536px] mx-auto px-6 py-16 md:py-24">
          <div className="max-w-3xl">
            <nav className="flex items-center gap-3 text-[10px] uppercase font-bold tracking-[0.2em] text-text-muted mb-8">
              <Link to="/" className="hover:text-accent transition-colors">Home</Link>
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={crumb.id}>
                  <ChevronRight size={10} className="text-gray-300" />
                  <Link 
                    to={crumb.fullPath}
                    className={`transition-colors ${idx === breadcrumbs.length - 1 ? 'text-accent' : 'hover:text-accent'}`}
                  >
                    {crumb.name}
                  </Link>
                </React.Fragment>
              ))}
            </nav>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-7xl font-fashion font-bold text-text-main leading-tight mb-6"
            >
              {currentCategory?.name || "Our Collection"}
            </motion.h1>
            <p className="text-text-muted text-lg leading-relaxed max-w-2xl font-medium italic">
              Exploring the finest handcrafted heritage {currentCategory?.name.toLowerCase()} treasures, curated for your timeless elegance.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-[1536px] mx-auto px-6 py-20">
        {/* 1. Subcategories Grid (If children exist) */}
        {currentCategory?.children && currentCategory.children.length > 0 && (
          <div className="mb-24 animate-in fade-in slide-in-from-bottom-5 duration-700">
            <div className="flex items-center gap-4 mb-10">
              <h2 className="text-[14px] font-black uppercase tracking-[0.4em] text-text-main">Explore Subranges</h2>
              <div className="h-[1px] flex-1 bg-gray-100"></div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {currentCategory.children.map((child) => (
                <Link 
                  key={child.id} 
                  to={child.fullPath}
                  className="group block text-center"
                >
                  <div className="aspect-square bg-bg-alt rounded-3xl mb-4 flex items-center justify-center p-8 transition-all group-hover:bg-brand-orange/5 group-hover:scale-95 group-active:scale-90 border border-transparent group-hover:border-brand-orange/10 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <span className="text-[12px] font-black text-text-muted group-hover:text-brand-orange transition-colors tracking-widest uppercase">
                      {child.name.split(' ')[0]}
                    </span>
                  </div>
                  <h4 className="text-[11px] font-bold tracking-widest text-text-main group-hover:text-brand-orange transition-colors truncate px-2 capitalize">
                    {child.name}
                  </h4>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-16">
          {/* Sidebar Filter - Desktop */}
          <aside className="hidden lg:block w-[280px] shrink-0">
            <div className="sticky top-40">
              <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-4">
                <h2 className="text-[12px] font-bold uppercase tracking-[0.3em] text-text-main/50">Filter By</h2>
                <button className="text-[10px] font-bold uppercase tracking-widest text-accent hover:underline">Reset</button>
              </div>

              <div className="space-y-6">
                <FilterSection title="Price Range">
                  <div className="space-y-2 mt-4">
                    {['Under 2000', '2000 - 5000', '5000 - 10000', 'Above 10000'].map((range) => (
                      <label key={range} className="flex items-center gap-3 cursor-pointer group">
                        <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-accent focus:ring-accent" />
                        <span className="text-sm text-text-muted group-hover:text-text-main transition-all">{range}</span>
                      </label>
                    ))}
                  </div>
                </FilterSection>

                <FilterSection title="Discount">
                  <div className="space-y-2 mt-4 text-sm text-text-muted">
                    {['10% and Above', '20% and Above', '30% and Above'].map(item => (
                      <p key={item} className="hover:text-text-main cursor-pointer transition-all">{item}</p>
                    ))}
                  </div>
                </FilterSection>

                <FilterSection title="Fabric">
                  <div className="space-y-2 mt-4 text-sm text-text-muted">
                    {['Pure Silk', 'Cotton', 'Linen'].map(item => (
                      <p key={item} className="hover:text-text-main cursor-pointer transition-all">{item}</p>
                    ))}
                  </div>
                </FilterSection>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6 pb-8 border-b border-gray-50">
              <div>
                <h2 className="text-2xl font-fashion font-bold text-text-main mb-1">Treasures Catalog</h2>
                <p className="text-text-muted text-xs font-bold uppercase tracking-[0.2em]">{filteredProducts.length} Pieces Available</p>
              </div>

              <button 
                onClick={() => setIsMobileFiltersOpen(true)}
                className="lg:hidden flex items-center justify-center gap-3 px-8 py-3 bg-bg-alt border border-brand-orange/10 rounded-full text-[12px] font-bold uppercase tracking-widest text-text-main hover:bg-bg-alt transition-all"
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
                <div className="col-span-full py-32 text-center bg-bg-alt/30 rounded-[3rem] border border-accent/5">
                  <h3 className="text-2xl font-fashion font-bold text-text-main/20">No products found in this category yet.</h3>
                  <p className="text-text-muted mt-2">We are curating new treasures for you.</p>
                </div>
              )}
            </div>

            {/* Pagination Placeholder */}
            {filteredProducts.length > 0 && (
              <div className="mt-24 pt-12 border-t border-gray-50 flex items-center justify-center gap-4">
                <button className="w-12 h-12 rounded-full border border-gray-100 flex items-center justify-center text-gray-300 pointer-events-none transition-all hover:border-brand-orange hover:text-brand-orange">
                  <ChevronRight size={20} className="rotate-180" />
                </button>
                {[1, 2, 3].map(p => (
                  <button key={p} className={`w-12 h-12 rounded-full flex items-center justify-center text-[13px] font-bold transition-all ${p === 1 ? 'bg-brand-orange text-white shadow-lg shadow-brand-orange/20' : 'text-text-muted hover:bg-gray-50'}`}>
                    {p}
                  </button>
                ))}
                <button className="w-12 h-12 rounded-full border border-gray-100 flex items-center justify-center text-text-main transition-all hover:border-brand-orange hover:text-brand-orange">
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
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
        <span className="text-[13px] font-bold uppercase tracking-wider text-text-main">{title}</span>
        <ChevronDown size={16} className={`transition-transform duration-300 text-accent ${isOpen ? '' : '-rotate-90'}`} />
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
        className="fixed inset-0 bg-text-main/40 backdrop-blur-sm z-[2000]"
      />
      <motion.div 
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed top-0 right-0 bottom-0 w-[85%] max-w-[320px] bg-white z-[2100] p-8 overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-xl font-fashion font-bold text-text-main">Filters</h2>
          <button onClick={onClose} className="p-2 text-text-main"><X size={24} /></button>
        </div>
        
        <div className="space-y-10">
          <FilterSection title="Price Range">
            <div className="space-y-3 mt-4">
              {['Under 2000', '2000 - 5000', '5000 - 10000', 'Above 10000'].map((range) => (
                <label key={range} className="flex items-center gap-3">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300 transform scale-110" />
                  <span className="text-sm text-text-muted">{range}</span>
                </label>
              ))}
            </div>
          </FilterSection>
        </div>

        <div className="mt-12 flex flex-col gap-4">
          <button className="bg-brand-orange text-white font-bold py-4 rounded-xl text-sm" onClick={onClose}>Apply Filters</button>
          <button className="text-xs font-bold uppercase tracking-widest text-text-muted/40 py-2">Clear All</button>
        </div>
      </motion.div>
    </>
  );
}
