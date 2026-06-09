import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, X, Loader2 } from 'lucide-react';
import ProductCard from '../../components/user/ProductCard';
import FilterSidebar from '../../components/user/FilterSidebar';
import Footer from '../../components/user/Footer';

import useCategories from '../../hooks/useCategories';
import { useGoBack } from '../../hooks/useGoBack';
import { db } from '../../firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

export default function CategoryView() {
  const location = useLocation();
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
      if (location.pathname === '/collections') {
        setCurrentCategory({
          id: 'all',
          name: 'All Collections',
          fullPath: '/collections',
          description: 'Explore our entire collection of handcrafted heritage treasures.'
        });
        setBreadcrumbs([]);
        return;
      }
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
    let result = products;

    if (!currentCategory) return [];

    if (currentCategory.id !== 'all') {
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

      result = products.filter(p => {
        const pCatId = p.categoryId || '';
        const pCol = p.collection?.toLowerCase() || '';
        const matchesCategory = targetCategoryIds.includes(pCatId);
        const matchesCollection = currentCategory.name && pCol.includes(currentCategory.name.toLowerCase());
        return matchesCategory || matchesCollection;
      });
    }

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
        const price = Number(p.discountedPrice || p.price || p.actualPrice || 0);
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
        <h2 className="text-2xl font-sans mb-4">Category not found</h2>
        <Link to="/collections" className="text-brand-orange font-bold uppercase tracking-widest text-sm underline">
          Browse All Collections
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#F5F5F5] font-sans min-h-screen">

      {/* ── Padding wrapper: holds the filter and product grid side by side ── */}
      <div className="px-3 sm:px-5 lg:px-7 py-6 sm:py-8 max-w-screen-2xl mx-auto w-full">

        {/* ── Two-column row: aligns filters and products side by side ── */}
        <div className="flex flex-col md:flex-row gap-4 lg:gap-6 items-start">

          {/* ══ LEFT COLUMN: Sticky Filters ══
              - Stays fixed at top-[160px] from screen top on scroll
              - Stable, fits viewport, no nested scrollbar needed
          */}
          <motion.aside
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35 }}
            className="hidden md:block w-56 lg:w-60 flex-shrink-0 sticky top-[160px] z-10"
          >
            <div className="bg-white rounded-xl border border-gray-200/60 shadow-sm p-4 lg:p-5">
              <FilterSidebar
                className="bg-transparent p-0"
                categories={breadcrumbs.length > 0 ? [breadcrumbs[0]] : []}
                onFilterChange={handleFilterChange}
                currentCategory={currentCategory}
              />
            </div>
          </motion.aside>

          {/* ══ RIGHT COLUMN: Products Grid ══
              - Page scrolls to view products and eventually global footer
          */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
            className="flex-1 min-w-0"
          >
            <div className="bg-white rounded-xl border border-gray-200/60 shadow-sm overflow-hidden">

              {/* ── Pinned header: breadcrumb + title (left) | count (right) ── */}
              <div className="flex-shrink-0 flex items-start justify-between px-5 sm:px-6 py-4 border-b border-gray-100 bg-white gap-4">

                {/* Left: Category Name */}
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-xl lg:text-2xl font-sans font-semibold text-[#111111] capitalize tracking-tight leading-tight">
                    {currentCategory.name}
                  </h1>
                </div>

                {/* Right: Product count + mobile filter button */}
                <div className="flex items-center gap-3 flex-shrink-0 self-end pb-0.5">
                  <p className="text-[10px] font-sans font-black uppercase tracking-[0.2em] text-gray-400 whitespace-nowrap">
                    {filteredProducts.length} {filteredProducts.length === 1 ? 'Product' : 'Products'}
                  </p>
                  <button
                    onClick={() => setIsMobileFiltersOpen(true)}
                    className="md:hidden flex items-center gap-1.5 text-[10px] font-sans font-black tracking-[0.2em] uppercase border border-gray-200 px-3 py-1.5 rounded-lg hover:border-brand-orange hover:text-brand-orange transition-all"
                  >
                    <SlidersHorizontal size={12} />
                    Filters
                  </button>
                </div>
              </div>

              {/* ── Product Grid ── */}
              <div className="px-4 sm:px-5 lg:px-7 py-5 sm:py-6">
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-3 gap-y-8 md:gap-x-5 md:gap-y-10">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                      <ProductCard key={product.id} {...product} />
                    ))
                  ) : (
                    <div className="col-span-full py-20 text-center bg-gray-50 rounded-xl">
                      <p className="text-gray-400 font-sans text-lg mb-3">No treasures found in this range yet.</p>
                      <Link to="/collections" className="text-brand-orange font-bold uppercase tracking-widest text-[10px]">
                        Explore All Collections
                      </Link>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </motion.div>

        </div>
      </div>

      {/* ── Mobile Filters Drawer ── */}
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
              className="fixed inset-y-0 left-0 w-[85%] max-w-sm bg-white z-[1001] shadow-2xl overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                <h3 className="text-xs font-sans font-black uppercase tracking-[0.3em] text-brand-black">Refine Selection</h3>
                <button
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="w-9 h-9 flex items-center justify-center bg-gray-50 hover:bg-brand-orange hover:text-white rounded-full transition-all duration-300"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="p-5">
                <FilterSidebar
                  className="bg-transparent"
                  categories={breadcrumbs.length > 0 ? [breadcrumbs[0]] : []}
                  onFilterChange={handleFilterChange}
                  currentCategory={currentCategory}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
