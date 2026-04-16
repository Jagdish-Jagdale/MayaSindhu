import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Filter, ChevronRight, SlidersHorizontal } from 'lucide-react';
import ProductCard from '../../components/user/ProductCard';
import useCategories from '../../hooks/useCategories';

import { PRODUCTS } from '../../data/products';


export default function CategoryView() {
  const { id } = useParams();
  const { categories, loading } = useCategories();
  const [currentCategory, setCurrentCategory] = useState(null);

  useEffect(() => {
    // Find category in hierarchical tree (simplification for now)
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
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-brand-orange/20 border-t-brand-orange rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="bg-white min-h-screen">
      {/* Category Header */}
      <section className="bg-[#FAF9F6] py-20">
        <div className="max-w-[1400px] mx-auto px-6">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-8">
            <Link to="/" className="hover:text-brand-orange transition-colors">Home</Link>
            <ChevronRight size={12} />
            <Link to="/shop" className="hover:text-brand-orange transition-colors">Shop</Link>
            <ChevronRight size={12} />
            <span className="text-brand-orange">{currentCategory?.name || id}</span>
          </nav>

          <h1 className="text-5xl md:text-6xl font-fashion font-bold text-[#1A1A1A] mb-6">
            {currentCategory?.name || id}
          </h1>
          <p className="text-gray-500 max-w-2xl text-lg leading-relaxed">
            Curated pieces from our {currentCategory?.name || id} collection, handcrafted with heritage techniques and soulful artistry.
          </p>
        </div>
      </section>

      {/* Product Grid & Filters */}
      <section className="py-20 max-w-[1400px] mx-auto px-6">
        <div className="flex justify-between items-center mb-12 border-b border-gray-100 pb-8">
          <p className="text-gray-500 italic">{filteredProducts.length} Treasures Found</p>
          <button className="flex items-center gap-2 font-bold text-[12px] uppercase tracking-widest hover:text-brand-orange transition-colors">
            <SlidersHorizontal size={18} /> Filters
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-20">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))
          ) : (
            <div className="col-span-full py-20 text-center">
              <h3 className="text-2xl font-fashion font-bold text-gray-300">No products found in this category yet.</h3>
              <p className="text-gray-400 mt-2">We are curating new treasures for you.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
