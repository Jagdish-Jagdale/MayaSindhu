import { motion } from 'framer-motion';
import { ShoppingBag, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ProductCard({ id, name, price, image, collection }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-brand-cream-dark">
        <Link to={`/product/${id}`}>
          <img 
            src={image} 
            alt={name} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        </Link>
        
        {/* Quick Actions */}
        <div className="absolute top-4 right-4 flex flex-col space-y-3 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
          <button className="p-2 bg-brand-cream text-brand-burgundy rounded-full shadow-lg hover:bg-brand-gold hover:text-white transition-colors">
            <Heart size={18} />
          </button>
          <button className="p-2 bg-brand-cream text-brand-burgundy rounded-full shadow-lg hover:bg-brand-gold hover:text-white transition-colors">
            <ShoppingBag size={18} />
          </button>
        </div>

        {/* Quick View Tag */}
        <div className="absolute bottom-0 left-0 right-0 bg-brand-burgundy/80 text-brand-cream text-[10px] tracking-widest uppercase py-3 text-center translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          Quick View
        </div>
      </div>

      <div className="mt-6 text-center">
        <p className="text-[10px] tracking-[0.25em] uppercase text-brand-gold mb-2 font-medium">{collection}</p>
        <Link to={`/product/${id}`}>
          <h3 className="text-lg font-serif text-brand-burgundy-dark hover:text-brand-gold transition-colors">{name}</h3>
        </Link>
        <p className="mt-2 text-brand-burgundy/60 font-sans tracking-wide">
          ₹{typeof price === 'number' ? price.toLocaleString('en-IN') : price}
        </p>
      </div>
    </motion.div>
  );
}
