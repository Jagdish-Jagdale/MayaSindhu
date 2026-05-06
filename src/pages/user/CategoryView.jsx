import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronDown, SlidersHorizontal, X, Loader2, ArrowLeft } from 'lucide-react';
import ProductCard from '../../components/user/ProductCard';
import FilterSidebar from '../../components/user/FilterSidebar';
import useCategories from '../../hooks/useCategories';
import { useGoBack } from '../../hooks/useGoBack';
import { db } from '../../firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

export default function CategoryView() {
  const params = useParams();
  const goBack = useGoBack();
  const pathSegments = params['*'] ? params['*'].split('/') : [];
  const { categories, loading: categoriesLoading } = useCategories();

  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});

  const handleFilterChange = (filters) => {
    setActiveFilters(filters);
  };

  // 1. Fetch ALL products from Firestore
  useEffect(() => {
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(data);
      setProductsLoading(false);
    }, (error) => {
      console.error("CategoryView fetch error:", error);
      setProductsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. Resolve the current category and breadcrumbs from the URL
  useEffect(() => {
    if (categories.length > 0) {
      let current = categories;
      let targetCat = null;
      let path = [];

      for (const segment of pathSegments) {
        const found = current.find(cat => cat.slug === segment);
        if (found) {
          targetCat = found;
          path.push(found);
          current = found.children || [];
        } else {
          break;
        }
      }

      setCurrentCategory(targetCat);
      setBreadcrumbs(path);
    }
  }, [categories, params['*']]);

  // 3. Filter products based on the resolved category
  const filteredProducts = (() => {
    if (!currentCategory) return [];

    // Get all valid category IDs (including the current and all children recursively)
    const getAllCategoryIds = (cat) => {
      let ids = [cat.id];
      if (cat.children && cat.children.length > 0) {
        cat.children.forEach(child => {
          ids = [...ids, ...getAllCategoryIds(child)];
        });
      }
      return ids;
    };

    const targetCategoryIds = getAllCategoryIds(currentCategory);

    let result = products.filter(p => {
      const pCatId = p.categoryId || '';
      const pCol = p.collection?.toLowerCase() || '';

      // Match by category ID
      const matchesCategory = targetCategoryIds.includes(pCatId);

      // Fallback: match by collection name
      const matchesCollection = currentCategory.name && pCol.includes(currentCategory.name.toLowerCase());

      return matchesCategory || matchesCollection;
    });

    // Apply Active Filters
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

  if (categoriesLoading || productsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-10 h-10 animate-spin text-brand-orange" />
      </div>
    );
  }

  if (!currentCategory) {
    return (
      <div className="min-h-screen pt-40 pb-20 text-center">
        <h2 className="text-2xl font-fashion mb-4">Category not found</h2>
        <Link to="/shop" className="text-brand-orange font-bold uppercase tracking-widest text-sm underline">
          Return to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen font-sans">
      <div className="flex flex-col md:flex-row">
        {/* Sidebar - Desktop */}
        <aside className="hidden md:block w-80 lg:w-96 flex-shrink-0 bg-[#F9F9F9] border-r border-gray-100 min-h-screen">
          <div className="sticky top-24 p-8 lg:p-10">
            <button onClick={goBack} className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-brand-orange transition-all group mb-10 w-fit">
              <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
              Back
            </button>
            <FilterSidebar
              className="bg-transparent p-0"
              categories={breadcrumbs.length > 0 ? [breadcrumbs[0]] : []}
              onFilterChange={handleFilterChange}
            />
          </div>
        </aside>

        <div className="flex-1 py-12 px-6 md:px-12 lg:px-20">
          {/* Category Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <h1 className="text-2xl md:text-3xl font-fashion font-bold text-brand-black leading-tight tracking-wide">
              {currentCategory.name}
            </h1>
          </motion.div>

          {/* Product Grid Area */}
          <section className="mb-24">
            <div className="flex items-center justify-end mb-8 pb-4 border-b border-gray-100">
              <button
                onClick={() => setIsMobileFiltersOpen(true)}
                className="md:hidden flex items-center gap-2 text-[10px] font-black tracking-[0.2em] uppercase text-brand-black"
              >
                <SlidersHorizontal size={14} />
                Filters
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-16 md:gap-y-24">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <ProductCard key={product.id} {...product} />
                ))
              ) : (
                <div className="col-span-full py-20 text-center bg-gray-50 rounded-[3rem]">
                  <p className="text-gray-400 font-fashion text-xl mb-4">No treasures found in this range yet.</p>
                  <Link to="/shop" className="text-brand-orange font-bold uppercase tracking-widest text-[10px]">Explore All Collections</Link>
                </div>
              )}
            </div>
          </section>
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
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-[1000]"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 left-0 w-[85%] max-w-sm bg-[#F9F9F9] z-[1001] shadow-2xl overflow-y-auto"
            >
              <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-brand-black">Refine Selection</h3>
                <button
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="w-10 h-10 flex items-center justify-center bg-gray-50 hover:bg-brand-orange hover:text-white rounded-full transition-all duration-300"
                >
                  <X size={18} />
                </button>
              </div>
              <FilterSidebar
                className="bg-transparent"
                categories={breadcrumbs.length > 0 ? [breadcrumbs[0]] : []}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
