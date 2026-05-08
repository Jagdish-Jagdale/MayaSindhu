import { useState, useEffect } from 'react';
import ProductCard from '../../components/user/ProductCard';
import { db } from '../../firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { Loader2, ArrowLeft, X } from 'lucide-react';

import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useGoBack } from '../../hooks/useGoBack';
import { motion } from 'framer-motion';
import useCategories from '../../hooks/useCategories';
import FilterSidebar from '../../components/user/FilterSidebar';

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const goBack = useGoBack();
  const filter = searchParams.get('category') || 'All';
  const searchQuery = searchParams.get('q') || '';
  const { categories: allCategories } = useCategories();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState({});
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const handleFilterChange = (filters) => {
    setActiveFilters(filters);
  };

  // Strict mapping of what terms belong to which main category
  const ALLOWED_MAPPING = {
    'apparels': ['saree', 'dress', 'apparel', 'readymade', 'kurta', 'suit'],
    'jewellery': ['fabric', 'clay', 'tribal', 'jewellery', 'jewel'],
    'festive': ['toran', 'rakhi', 'diya', 'banana leaf', 'festive', 'naivedya'],
    'others': ['keychain', 'diar', 'pouch', 'coaster', 'sleeve', 'other', 'bag', 'accessory']
  };

  const setFilter = (newFilter) => {
    if (newFilter === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', newFilter);
    }
    setSearchParams(searchParams);
  };

  const clearSearch = () => {
    searchParams.delete('q');
    setSearchParams(searchParams);
  };

  useEffect(() => {
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(data);
      setLoading(false);
    }, (error) => {
      console.error("Shop fetch error:", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredProducts = (() => {
    // 1. Initial Filtering Logic
    // If there is a search query, we want to be as inclusive as possible, so we start with all products.
    // If no search query, we apply the "approved" category mapping for the default shop view.
    let baseProducts = searchQuery ? products : products.filter(p => {
      const pCol = p.collection?.toLowerCase() || '';
      const pCat = p.categoryId?.toLowerCase() || '';
      const pName = p.name?.toLowerCase() || '';

      return Object.entries(ALLOWED_MAPPING).some(([parent, children]) => {
        return children.some(term =>
          pCol.includes(term) || pCat.includes(term) || pName.includes(term)
        );
      });
    });

    let result = baseProducts;

    // 2. Category Filter (Apply if selected and not overridden by a global search, or as a secondary filter)
    if (filter !== 'All') {
      const searchStr = filter.toLowerCase();
      let targetTerms = [searchStr];
      if (ALLOWED_MAPPING[searchStr]) {
        targetTerms = [...targetTerms, ...ALLOWED_MAPPING[searchStr]];
      }

      result = result.filter(p => {
        const pCol = p.collection?.toLowerCase() || '';
        const pCat = p.categoryId?.toLowerCase() || '';
        const pName = p.name?.toLowerCase() || '';

        return targetTerms.some(term =>
          pCol.includes(term) || pCat.includes(term) || pName.includes(term)
        );
      });
    }

    // 3. Search Query Filter (Powerful & Fuzzy)
    if (searchQuery) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(p => {
        const pCol = (p.collection || '').toLowerCase();
        const pCat = (p.categoryId || '').toLowerCase();
        const pName = (p.name || '').toLowerCase();
        const pDesc = (p.description || '').toLowerCase();
        // Also check tags if they exist (supports both array and string tags)
        const pTags = Array.isArray(p.tags) 
          ? p.tags.join(' ').toLowerCase() 
          : (typeof p.tags === 'string' ? p.tags.toLowerCase() : '');

        return pName.includes(q) || 
               pDesc.includes(q) || 
               pCol.includes(q) || 
               pCat.includes(q) || 
               pTags.includes(q);
      });
    }

    // 3. Filter by Active Filters (Sidebar selections)
    if (activeFilters.availability?.length > 0) {
      result = result.filter(p => {
        const pStatus = (p.availability || 'In Stock').toLowerCase();
        return activeFilters.availability.some(a => a.toLowerCase() === pStatus);
      });
    }

    if (activeFilters.priceRange) {
      const { min, max } = activeFilters.priceRange;
      result = result.filter(p => {
        const price = Number(p.price) || 0;
        return price >= min && price <= max;
      });
    }

    if (activeFilters.size?.length > 0) {
      result = result.filter(p => {
        const pSizes = p.sizes || [];
        return activeFilters.size.some(s => pSizes.includes(s));
      });
    }

    return result;
  })();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6]">
        <Loader2 className="w-12 h-12 animate-spin text-brand-orange" />
      </div>
    );
  }

  return (
    <div className="bg-[#FAF9F6] min-h-screen pt-4 pb-24 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <header className="mb-12 md:mb-16 text-center pt-8">
          <nav className="mb-6 flex justify-center items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
            <Link to="/" className="hover:text-brand-orange transition-colors">Home</Link>
            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
            <span className="text-brand-orange">Shop</span>
          </nav>
          
          <h1 className="text-4xl md:text-6xl font-fashion text-[#111111] capitalize tracking-tight leading-none mb-4">
            {searchQuery ? (
              <div className="flex flex-col items-center gap-4">
                <span className="text-gray-400 text-xs font-sans uppercase tracking-[0.3em]">Search results for</span>
                <div className="flex items-center gap-4 text-brand-orange">
                  "{searchQuery}"
                  <button 
                    onClick={clearSearch}
                    className="p-2 bg-gray-50 hover:bg-orange-50 rounded-full transition-colors border border-gray-100"
                    title="Clear search"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ) : (
              filter === 'All' ? 'The Complete Collection' : filter
            )}
          </h1>
          <p className="text-gray-400 text-[10px] md:text-xs font-bold uppercase tracking-[0.5em] mt-6">
            MayaSindhu / Curated Treasures
          </p>
        </header>

        <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
          {/* Mobile Filter Trigger */}
          <div className="md:hidden flex justify-between items-center mb-6 px-2">
            <button 
              onClick={() => setIsMobileFiltersOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-sm active:scale-95 transition-all"
            >
              <Loader2 className="w-3 h-3 text-brand-orange" /> {/* Using Loader2 as a placeholder icon or Sliders from lucide */}
              Refine Selection
            </button>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              {filteredProducts.length} Items
            </span>
          </div>

          {/* Filters - Sidebar (Desktop) */}
          <aside className="hidden md:block w-72 sticky top-28 self-start h-[calc(100vh-140px)] overflow-y-auto no-scrollbar overscroll-contain">
            <FilterSidebar
              categories={allCategories}
              onFilterChange={handleFilterChange}
              className="rounded-[2.5rem] shadow-sm border border-gray-50"
            />
          </aside>

          {/* Product Grid Area */}
          <div className="flex-1 space-y-12">
            {/* Dynamic Subcategories (if any) */}
            {(() => {
              const currentCat = allCategories.find(c => c.name.toLowerCase() === filter.toLowerCase());
              if (currentCat?.children && currentCat.children.length > 0) {
                const subCats = currentCat.children.filter(child => {
                  const parentName = currentCat.name.toLowerCase();
                  const childName = child.name.toLowerCase();
                  const allowedTerms = ALLOWED_MAPPING[parentName];

                  if (allowedTerms) {
                    return allowedTerms.some(term => childName.includes(term));
                  }
                  return true;
                });

                if (subCats.length === 0) return null;

                return (
                  <div className="mb-12 pb-8 border-b border-gray-50">
                    <div className="flex flex-nowrap gap-8 overflow-x-auto no-scrollbar pb-4 snap-x">
                      {subCats.map((child) => (
                        <motion.div
                          key={child.id}
                          whileHover={{ y: -5 }}
                          className="flex flex-col items-center flex-shrink-0 w-24 snap-center cursor-pointer group"
                          onClick={() => setFilter(child.name)}
                        >
                          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden bg-white border-2 border-transparent group-hover:border-brand-orange transition-all shadow-sm mb-3">
                            {child.imageUrl ? (
                              <img src={child.imageUrl} alt={child.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-[#FAF9F6] text-brand-orange/20 font-bold text-xl uppercase">
                                {child.name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <span className="text-[10px] font-bold text-center text-[#1A1A1A] uppercase tracking-widest group-hover:text-brand-orange transition-colors px-1 line-clamp-1">
                            {child.name}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                );
              }
              return null;
            })()}

            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-x-8 gap-y-16">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <ProductCard key={product.id} {...product} />
                ))
              ) : (
                <div className="col-span-full py-20 text-center">
                  <p className="text-gray-400 font-fashion text-xl">No treasures found in this category.</p>
                </div>
              )}
            </div>
          </div>

      {/* Mobile Filters Drawer */}
      <AnimatePresence>
        {isMobileFiltersOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileFiltersOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[1000]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-[85%] max-w-sm bg-white z-[1001] shadow-2xl overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                <h3 className="text-xs font-black uppercase tracking-[0.3em]">Filter & Sort</h3>
                <button
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 rounded-full transition-all"
                >
                  <X size={20} />
                </button>
              </div>
              <FilterSidebar
                categories={allCategories}
                onFilterChange={handleFilterChange}
                className="bg-transparent"
              />
              <div className="sticky bottom-0 p-4 bg-white border-t border-gray-100">
                <button 
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="w-full py-4 bg-[#1A1A1A] text-white text-[10px] font-bold uppercase tracking-[0.2em] rounded-xl"
                >
                  Show Results ({filteredProducts.length})
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
