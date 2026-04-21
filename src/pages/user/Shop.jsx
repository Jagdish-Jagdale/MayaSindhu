import { useState, useEffect } from 'react';
import ProductCard from '../../components/user/ProductCard';
import { db } from '../../firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';

export default function Shop() {
  const [filter, setFilter] = useState('All');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const filteredProducts = filter === 'All' 
    ? products 
    : products.filter(p => p.collection?.toLowerCase().includes(filter.toLowerCase()));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6]">
        <Loader2 className="w-12 h-12 animate-spin text-brand-orange" />
      </div>
    );
  }

  return (
    <div className="bg-[#FAF9F6] min-h-screen pt-32 pb-24 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-16 text-center">
          <h1 className="text-5xl font-fashion text-[#1A1A1A] mb-4">The Collection</h1>
          <p className="text-gray-400 font-sans tracking-[0.4em] uppercase text-[10px] font-bold">Carefully curated handmade textiles</p>
        </header>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters - Sidebar */}
          <aside className="w-full md:w-64 space-y-10">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-50">
              <h3 className="text-[10px] font-black tracking-[0.2em] uppercase text-gray-400 mb-8 border-b border-gray-50 pb-4">Collections</h3>
              <ul className="space-y-4 text-sm font-bold">
                {['All', 'Heritage Silk', 'Fine Cotton', 'Jewellery', 'Bags'].map((cat) => (
                  <li key={cat}>
                    <button 
                      onClick={() => setFilter(cat)} 
                      className={`w-full text-left py-2 transition-all flex items-center justify-between group ${
                        filter === cat ? 'text-brand-orange translate-x-2' : 'text-gray-400 hover:text-[#1A1A1A]'
                      }`}
                    >
                      {cat === 'All' ? 'All Pieces' : cat}
                      <span className={`w-1.5 h-1.5 rounded-full bg-brand-orange transition-all ${filter === cat ? 'scale-100' : 'scale-0'}`} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-x-8 gap-y-16">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
