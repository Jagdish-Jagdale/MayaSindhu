import { useState } from 'react';
import ProductCard from '../../components/user/ProductCard';

const PRODUCTS = [
  {
    id: 1,
    name: "Red Banarasi Silk Saree",
    price: 45000,
    image: "/assets/products/banarasi.png",
    collection: "Heritage Silk"
  },
  {
    id: 2,
    name: "Royal Blue Kanjeevaram",
    price: 52000,
    image: "/assets/products/kanjeevaram.png",
    collection: "Silk Route"
  },
  {
    id: 3,
    name: "Golden Handloom Tussar",
    price: 32000,
    image: "/assets/silk.png",
    collection: "Artisan Series"
  },
  {
    id: 4,
    name: "Pastel Jamdani Cotton",
    price: 18000,
    image: "/assets/cotton.png",
    collection: "Summer Breezes"
  }
];

export default function Shop() {
  const [filter, setFilter] = useState('All');

  return (
    <div className="bg-brand-cream min-h-screen pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-16 text-center">
          <h1 className="text-5xl font-serif text-brand-burgundy-dark mb-4">The Collection</h1>
          <p className="text-brand-burgundy/60 font-sans tracking-widest uppercase text-xs">Carefully curated handmade textiles</p>
        </header>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters - Sidebar */}
          <aside className="w-full md:w-64 space-y-10">
            <div>
              <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-brand-burgundy-dark mb-6">Collections</h3>
              <ul className="space-y-4 text-sm text-brand-burgundy/70 font-sans">
                <li><button onClick={() => setFilter('All')} className={`hover:text-brand-gold transition-colors ${filter === 'All' ? 'text-brand-gold font-bold' : ''}`}>All Pieces</button></li>
                <li><button onClick={() => setFilter('Silk')} className="hover:text-brand-gold transition-colors">Pure Silk</button></li>
                <li><button onClick={() => setFilter('Cotton')} className="hover:text-brand-gold transition-colors">Fine Cotton</button></li>
                <li><button onClick={() => setFilter('Bridal')} className="hover:text-brand-gold transition-colors">Bridal Heritage</button></li>
              </ul>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-x-8 gap-y-16">
            {PRODUCTS.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
