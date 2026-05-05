import { useState, useEffect } from 'react';
import ProductCard from '../../components/user/ProductCard';
import { db } from '../../firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { Loader2, ArrowLeft } from 'lucide-react';

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
  const { categories: allCategories } = useCategories();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState({});

  // Strict mapping of what terms belong to which main category
  const ALLOWED_MAPPING = {
    'apparels': ['saree', 'dress', 'apparel', 'readymade', 'kurta', 'suit'],
    'jewellery': ['fabric', 'clay', 'tribal', 'jewellery', 'jewel'],
    'festive': ['toran', 'rakhi', 'diya', 'banana leaf', 'festive', 'naivedya'],
    'others': ['keychain', 'diar', 'pouch', 'coaster', 'sleeve', 'other', 'bag', 'accessory']
  };

  const handleFilterChange = (filters) => {
    setActiveFilters(filters);
    console.log('Shop Page Filters:', filters);
  };

  const setFilter = (newFilter) => {
    if (newFilter === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', newFilter);
    }
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
    // 1. Get ALL products that belong to our 4 approved categories
    let result = products.filter(p => {
      const pCol = p.collection?.toLowerCase() || '';
      const pCat = p.categoryId?.toLowerCase() || '';
      const pName = p.name?.toLowerCase() || '';

      return Object.entries(ALLOWED_MAPPING).some(([parent, children]) => {
        return children.some(term =>
          pCol.includes(term) || pCat.includes(term) || pName.includes(term)
        );
      });
    });

    // 2. Filter by main category if selected
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

    // 3. Filter by Active Filters (Sidebar selections)
    if (activeFilters.availability?.length > 0) {
      result = result.filter(p => activeFilters.availability.includes(p.availability));
    }
    if (activeFilters.price?.length > 0) {
      // Logic for price filtering would go here based on product.price
    }
    if (activeFilters.size?.length > 0) {
      result = result.filter(p => p.sizes?.some(s => activeFilters.size.includes(s)));
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
    <div className="bg-[#FAF9F6] min-h-screen pt-12 pb-24 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button onClick={goBack} className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-black transition-all group mb-4 w-fit">
          <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
          Back
        </button>
        <header className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-fashion text-[#1A1A1A] mb-4 capitalize">
            {filter === 'All' ? 'The Collection' : filter}
          </h1>
          <p className="text-gray-400 font-sans tracking-[0.4em] uppercase text-[10px] font-bold">
            {filter === 'All' ? 'Carefully curated handmade textiles' : `Discover our finest ${filter}`}
          </p>
        </header>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters - Sidebar */}
          <aside className="w-full md:w-80">
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
        </div>
      </div>
    </div>
  );
}
