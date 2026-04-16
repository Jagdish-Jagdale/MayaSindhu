import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, ChevronRight, Star } from 'lucide-react';

const PRODUCTS = [
  {
    id: 1,
    name: "Red Banarasi Silk Saree",
    price: 45000,
    image: "/assets/products/banarasi.png",
    collection: "Heritage Silk",
    description: "An exquisite Banarasi Silk saree, hand-woven in the sacred city of Varanasi. Featuring intricate gold zari work and a rich crimson hue, this piece represents the pinnacle of Indian textile heritage.",
    details: ["Pure Katan Silk", "Hand-woven (12-15 days)", "6.5 Meters with blouse piece", "Dry clean only"]
  },
  {
    id: 2,
    name: "Royal Blue Kanjeevaram",
    price: 52000,
    image: "/assets/products/kanjeevaram.png",
    collection: "Silk Route",
    description: "A majestic Kanjeevaram masterpiece from the looms of Tamil Nadu. This royal blue saree is characterized by its heavy, contrast orange border and ornate temple jewelry motifs.",
    details: ["Mulberry Silk", "Hand-woven (18 days)", "6.5 Meters with blouse piece", "Dry clean only"]
  }
];

export default function ProductDetail() {
  const { id } = useParams();
  const product = PRODUCTS.find(p => p.id === parseInt(id)) || PRODUCTS[0];

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
            <h1 className="text-4xl md:text-5xl font-serif text-brand-burgundy-dark mb-6 leading-tight">{product.name}</h1>

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

            <button className="btn btn-primary bg-brand-burgundy text-brand-cream w-full md:w-auto px-16 py-4 flex items-center justify-center space-x-4 hover:bg-brand-burgundy-dark transition-all shadow-xl">
              <ShoppingBag size={20} />
              <span className="tracking-widest uppercase font-bold text-sm">Add to Bag</span>
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
