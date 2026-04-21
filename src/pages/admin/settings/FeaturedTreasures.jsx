import React, { useState, useEffect, useRef } from 'react';
import { useAdminUI } from '../../../context/AdminUIContext';
import { db } from '../../../firebase';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  doc, 
  setDoc, 
  serverTimestamp,
  writeBatch,
  getDocs
} from 'firebase/firestore';
import { 
  Save, 
  Search, 
  Plus, 
  Trash2, 
  Loader2, 
  Star, 
  Package,
  X,
  ChevronDown,
  LayoutGrid,
  ArrowUpRight
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function FeaturedTreasures() {
  const { isCollapsed } = useAdminUI();
  const [featuredItems, setFeaturedItems] = useState([]);
  const FEATURED_LIMIT = 8;
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const searchRef = useRef(null);

  // Load All Products for Search
  useEffect(() => {
    const q = query(collection(db, 'products'), orderBy('name', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAllProducts(data);
    });
    return () => unsubscribe();
  }, []);

  // Load Current Featured Treasures
  useEffect(() => {
    const q = query(collection(db, 'featuredTreasures'), orderBy('order', 'asc'));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // If we have all products loaded, hydrate the featured items
      if (allProducts.length > 0) {
        const hydrated = items.map(item => {
          const product = allProducts.find(p => p.id === item.productId);
          return product ? { ...product, featuredId: item.id, order: item.order } : null;
        }).filter(Boolean);
        setFeaturedItems(hydrated);
        setLoading(false);
        setHasChanges(false);
      }
    });
    return () => unsubscribe();
  }, [allProducts]);

  // Handle Search
  useEffect(() => {
    if (searchTerm.trim() === '') {
      const eligible = allProducts.filter(p => !featuredItems.some(fi => fi.id === p.id));
      setSearchResults(eligible);
      return;
    }
    
    setIsSearching(true);
    const results = allProducts.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !featuredItems.some(fi => fi.id === p.id)
    );
    
    setSearchResults(results);
  }, [searchTerm, allProducts, featuredItems]);

  // Close search on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsSearching(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addProductToFeatured = (product) => {
    if (featuredItems.length >= FEATURED_LIMIT) {
      toast.error(`You can only feature up to ${FEATURED_LIMIT} masterpieces`);
      setIsSearching(false);
      return;
    }

    setFeaturedItems(prev => [
      ...prev, 
      { ...product, isNew: true, order: prev.length }
    ]);
    setHasChanges(true);
    setSearchTerm('');
    setIsSearching(false);
    toast.success(`${product.name} added to favorites`);
  };

  const removeProduct = (id) => {
    setFeaturedItems(prev => prev.filter(p => p.id !== id));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const batch = writeBatch(db);
      
      // Clear existing
      const existingDocs = await getDocs(collection(db, 'featuredTreasures'));
      existingDocs.forEach(d => batch.delete(d.ref));
      
      // Add Current State
      featuredItems.forEach((item, index) => {
        const newRef = doc(collection(db, 'featuredTreasures'));
        batch.set(newRef, {
          productId: item.id,
          order: index,
          updatedAt: serverTimestamp()
        });
      });

      await batch.commit();
      setHasChanges(false);
      toast.success("Featured Treasures updated successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save masterpieces");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] w-full flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-brand-orange" />
        <p className="text-[14px] font-medium text-gray-400">Loading treasures...</p>
      </div>
    );
  }

  return (
    <div className={`mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 transition-all duration-300 ${isCollapsed ? 'max-w-[1600px]' : 'max-w-[1280px]'}`} style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}>
      
      {/* Header Section */}
      <div className="space-y-4 py-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-[22px] font-semibold text-gray-900 tracking-tight">Customer Favorite</h1>
            <p className="text-[12px] text-gray-400 font-medium font-inter tracking-tight">Select up to 8 featured masterpieces to showcase on the landing page.</p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Search Dropdown */}
            <div className="relative min-w-[300px]" ref={searchRef}>
              <div className="relative group">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-orange transition-colors" />
                <input 
                  type="text"
                  placeholder="Search products to feature..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setIsSearching(true)}
                  className="w-full bg-white border border-gray-100 rounded-2xl pl-11 pr-11 py-2.5 text-[13px] font-medium focus:outline-none focus:ring-2 focus:ring-brand-orange/10 focus:border-brand-orange/30 transition-all shadow-sm"
                />
                <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none transition-transform duration-300 group-focus-within:rotate-180" />
              </div>

              {/* Search Results Dropdown */}
              {isSearching && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 overflow-hidden py-2 animate-in fade-in zoom-in-95 duration-200 max-h-[350px] overflow-y-auto custom-scrollbar">
                  {searchResults.map(product => (
                    <button
                      key={product.id}
                      onClick={() => addProductToFeatured(product)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-all text-left group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gray-50 overflow-hidden flex-shrink-0">
                        <img src={product.image} className="w-full h-full object-cover" alt="" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-gray-900 truncate group-hover:text-brand-orange transition-colors">{product.name}</p>
                        <p className="text-[11px] text-gray-400 font-medium">₹{product.price.toLocaleString('en-IN')}</p>
                      </div>
                      <Plus size={16} className="text-gray-300 group-hover:text-brand-orange" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {hasChanges && (
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 bg-[#1BAFAF] hover:bg-[#17a0a0] text-white px-6 py-2.5 rounded-xl text-[13px] font-bold transition-all shadow-lg shadow-[#1BAFAF]/10 active:scale-95 disabled:opacity-50"
              >
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} strokeWidth={2.5} />}
                Save Changes
              </button>
            )}
          </div>
        </div>
        <hr className="border-gray-100" />
      </div>

      {/* Selected Products Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-[14px] font-bold text-gray-900 uppercase tracking-widest flex items-center gap-2 text-brand-orange">
            <LayoutGrid size={16} />
            Selected Masterpieces
          </h2>
          <span className="text-[11px] text-gray-400 font-medium">{featuredItems.length} / {FEATURED_LIMIT} Products Featured</span>
        </div>

        {featuredItems.length === 0 ? (
          <div className="h-[400px] bg-white border border-dashed border-gray-100 rounded-[3rem] flex flex-col items-center justify-center gap-6 p-12 text-center">
            <div className="w-20 h-20 rounded-[2rem] bg-gray-50 flex items-center justify-center text-gray-200">
              <Package size={40} />
            </div>
            <div className="space-y-2">
              <p className="text-[16px] font-bold text-gray-900">No masterpieces selected</p>
              <p className="text-[12px] text-gray-400 max-w-[300px]">Use the search bar above to select products from your inventory to showcase on the home page.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredItems.map((product) => (
              <div key={product.id} className="group relative animate-in fade-in zoom-in duration-500">
                <div className="relative aspect-[1/1.1] overflow-hidden bg-white border border-gray-100 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all duration-500">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                  
                  {/* Remove Button Overlay */}
                  <div className="absolute top-4 right-4 flex items-center gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 z-20">
                    {product.isNew && (
                      <span className="bg-brand-orange text-white text-[9px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider shadow-lg">New</span>
                    )}
                    <button 
                      onClick={() => removeProduct(product.id)}
                      className="w-9 h-9 rounded-full bg-white text-gray-400 hover:text-red-500 shadow-xl flex items-center justify-center transition-all scale-90 hover:scale-110"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none" />
                </div>

                <div className="mt-5 px-3">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-[14px] font-fashion font-bold text-gray-900 line-clamp-1 flex-1">{product.name}</h3>
                    <div className="flex items-center gap-1 text-gray-900 ml-2">
                      <Star size={10} fill="#FF6B00" className="text-brand-orange" />
                      <span className="text-[11px] font-bold">{product.rating || '4.8'}</span>
                    </div>
                  </div>
                  <p className="text-brand-orange font-bold text-[16px]">₹{product.price.toLocaleString('en-IN')}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
