import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronDown, SlidersHorizontal, X, Loader2 } from 'lucide-react';
import ProductCard from '../../components/user/ProductCard';
import useCategories from '../../hooks/useCategories';
import { db } from '../../firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

export default function CategoryView() {
  const params = useParams();
  const pathSegments = params['*'] ? params['*'].split('/') : [];
  const { categories, loading: categoriesLoading } = useCategories();
  
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

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

    // We want products that match either the category name, category ID, or collection
    const targetNames = [
      currentCategory.name.toLowerCase(),
      currentCategory.id?.toLowerCase()
    ].filter(Boolean);

    // Also include children names for a recursive feel
    const getChildNames = (cat) => {
      let names = [];
      if (cat.children) {
        cat.children.forEach(child => {
          names.push(child.name.toLowerCase());
          names = [...names, ...getChildNames(child)];
        });
      }
      return names;
    };
    
    const allTargets = [...targetNames, ...getChildNames(currentCategory)];

    return products.filter(p => {
      const pCol = p.collection?.toLowerCase() || '';
      const pCat = p.categoryId?.toLowerCase() || '';
      const pName = p.name?.toLowerCase() || '';
      
      return allTargets.some(t => 
        pCol.includes(t) || pCat.includes(t) || pName.includes(t)
      );
    });
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
    <div className="bg-white min-h-screen pt-24 md:pt-32 pb-20">
      {/* Category Header & Breadcrumbs */}
      <section className="px-6 md:px-12 lg:px-24 mb-16">
        <nav className="flex items-center space-x-2 text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-8 overflow-x-auto no-scrollbar whitespace-nowrap pb-2">
          <Link to="/" className="hover:text-brand-orange transition-colors">Home</Link>
          <ChevronRight size={12} />
          <Link to="/shop" className="hover:text-brand-orange transition-colors">Shop</Link>
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={crumb.id}>
              <ChevronRight size={12} />
              <Link 
                to={crumb.fullPath} 
                className={`transition-colors ${idx === breadcrumbs.length - 1 ? 'text-brand-orange' : 'hover:text-brand-orange'}`}
              >
                {crumb.name}
              </Link>
            </React.Fragment>
          ))}
        </nav>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl"
        >
          <h1 className="text-4xl md:text-7xl font-fashion font-bold text-brand-black mb-6 leading-[1.1]">
            {currentCategory.name}
          </h1>
          <p className="text-gray-500 text-sm md:text-lg leading-relaxed max-w-2xl italic font-medium">
            {currentCategory.description || `Exploring the finest handcrafted heritage ${currentCategory.name.toLowerCase()} treasures, curated for your timeless elegance.`}
          </p>
        </motion.div>
      </section>

      {/* Explore Sub-ranges (Circular Nav) */}
      {currentCategory.children && currentCategory.children.length > 0 && (
        <section className="px-6 md:px-12 lg:px-24 mb-20">
          <div className="border-t border-gray-100 pt-12">
            <h3 className="text-[10px] font-black tracking-[0.3em] uppercase text-brand-black mb-10">Explore Subranges</h3>
            <div className="flex flex-nowrap gap-8 md:gap-12 overflow-x-auto no-scrollbar pb-6 snap-x">
              {currentCategory.children.map((child) => (
                <Link 
                  key={child.id} 
                  to={child.fullPath}
                  className="flex flex-col items-center flex-shrink-0 w-24 md:w-32 snap-start group"
                >
                  <div className="w-16 h-16 md:w-24 md:h-24 rounded-full overflow-hidden mb-4 border-2 border-transparent group-hover:border-brand-orange transition-all p-1 bg-gray-50 shadow-sm group-hover:shadow-lg">
                    {child.imageUrl ? (
                      <img src={child.imageUrl} alt={child.name} className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-brand-orange/5 text-brand-orange font-bold text-2xl rounded-full">
                        {child.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] md:text-[11px] font-bold text-center uppercase tracking-widest text-brand-black/60 group-hover:text-brand-orange transition-colors">
                    {child.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Product Grid Area */}
      <section className="px-6 md:px-12 lg:px-24">
        <div className="flex items-center justify-between mb-12 pb-6 border-b border-gray-100">
          <span className="text-[10px] font-black tracking-[0.2em] uppercase text-gray-400">
            {filteredProducts.length} Treasures Found
          </span>
          
          <button 
            onClick={() => setIsMobileFiltersOpen(true)}
            className="md:hidden flex items-center gap-2 text-[10px] font-black tracking-[0.2em] uppercase text-brand-black"
          >
            <SlidersHorizontal size={14} />
            Filters
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-16 md:gap-y-24">
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
  );
}
