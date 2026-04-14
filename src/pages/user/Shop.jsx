import { useState } from 'react';
import ProductCard from '../../components/user/ProductCard';

// Local Assets Import
import p1 from '../../assets/p1.jpeg';
import p2 from '../../assets/p2.jpeg';
import p3 from '../../assets/p3.jpeg';
import p4 from '../../assets/p4.jpeg';
import p5 from '../../assets/p5.jpeg';
import p6 from '../../assets/p6.jpeg';
import p7 from '../../assets/p7.png';
import p8 from '../../assets/p8.png';
import p9 from '../../assets/p9.png';

const PRODUCTS = [
  {
    id: 1,
    name: "Artisanal Earring Collection",
    price: 8500,
    image: p1,
    collection: "Jewellery"
  },
  {
    id: 2,
    name: "Madhubani Heritage Gift Set",
    price: 4200,
    image: p2,
    collection: "Jewellery"
  },
  {
    id: 3,
    name: "Lavender Daisy Cotton Saree",
    price: 12500,
    image: p3,
    collection: "Heritage Silk"
  },
  {
    id: 4,
    name: "Indigo Block Print Saree",
    price: 9800,
    image: p4,
    collection: "Fine Cotton"
  },
  {
    id: 5,
    name: "Ivory Flamingo Saree",
    price: 18500,
    image: p5,
    collection: "Fine Cotton"
  },
  {
    id: 6,
    name: "Deep Blue Batik Silk Saree",
    price: 11200,
    image: p6,
    collection: "Heritage Silk"
  },
  {
    id: 7,
    name: "Multicolored Floral Saree",
    price: 15400,
    image: p7,
    collection: "Summer Breezes"
  },
  {
    id: 8,
    name: "Vibrant Elephant Print Saree",
    price: 10500,
    image: p8,
    collection: "Artisan Series"
  },
  {
    id: 9,
    name: "Pastel Pink Linen Saree",
    price: 8900,
    image: p9,
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
