import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, ChevronRight, Star } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

import { Navigate } from 'react-router-dom';
import { PRODUCTS } from '../../data/products';

export default function ProductDetail() {
  const { slug } = useParams();

  // 1. Try to find by slug
  let product = PRODUCTS.find(p => p.slug === slug);

  // 2. If not found, try to find by ID (in case of legacy links)
  if (!product && !isNaN(slug)) {
    const legacyProduct = PRODUCTS.find(p => p.id === parseInt(slug));
    if (legacyProduct) {
      // If found by ID, redirect to the slug-based URL immediately
      return <Navigate to={`/product/${legacyProduct.slug}`} replace />;
    }
  }

  // 3. Fallback to first product or 404 if absolutely nothing matches
  // Using PRODUCTS[0] as final fallback to avoid crash, but redirection is preferred
  if (!product) product = PRODUCTS[0];


  return (
    <div className="bg-brand-cream min-h-screen pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-[10px] tracking-widest uppercase text-brand-burgundy/40 mb-12">
          <a href="/" className="hover:text-brand-gold">Home</a>
          <ChevronRight size={10} />
          <a href="/shop" className="hover:text-brand-gold">Collections</a>
          <ChevronRight size={10} />
          <span className="text-brand-burgundy-dark">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="aspect-[3/4] overflow-hidden bg-brand-cream-dark">
              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            </div>
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col justify-center"
          >
            <p className="text-xs font-bold tracking-[0.3em] uppercase text-brand-gold mb-4">{product.collection}</p>
            <h1 className="text-4xl md:text-5xl font-fashion text-brand-burgundy-dark mb-6 leading-tight">{product.name}</h1>

            <div className="flex items-center space-x-4 mb-8">
              <span className="text-2xl text-brand-burgundy tracking-wide">₹{product.price.toLocaleString()}</span>
              <div className="flex text-brand-gold">
                {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
              </div>
              <span className="text-xs text-brand-burgundy/40 uppercase tracking-widest">(12 Reviews)</span>
            </div>

            <p className="text-brand-burgundy/70 leading-relaxed font-sans mb-10 text-lg">
              {product.description}
            </p>

            <ul className="space-y-3 mb-12">
              {product.details.map((detail, i) => (
                <li key={i} className="flex items-center text-sm text-brand-burgundy-dark/80 font-sans">
                  <div className="w-1.5 h-1.5 bg-brand-gold rounded-full mr-3" />
                  {detail}
                </li>
              ))}
            </ul>

            <button 
              onClick={handleAddToCart}
              className="btn btn-primary bg-brand-burgundy text-brand-cream w-full md:w-auto px-16 py-4 flex items-center justify-center space-x-4 hover:bg-brand-burgundy-dark transition-all shadow-xl"
            >
              <ShoppingBag size={20} />
              <span className="tracking-widest uppercase font-bold text-sm">Add to Bag</span>
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
