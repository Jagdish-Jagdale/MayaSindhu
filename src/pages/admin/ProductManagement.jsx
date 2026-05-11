import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  ChevronDown, 
  Filter, 
  X, 
  Pencil, 
  Trash2, 
  ArrowUpRight,
  Loader2,
  Package,
  AlertCircle,
  Image,
  Star,
  Share2,
  Minus,
  Calendar,
  CreditCard,
  ShoppingBag,
  Layers,
  Info,
  History
} from 'lucide-react';
import { useAdminUI } from '../../context/AdminUIContext';
import { formatDate } from '../../utils/dateHelper';
import { db } from '../../firebase';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  doc, 
  deleteDoc,
  setDoc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import useCategories from '../../hooks/useCategories';
import ProductFormModal from '../../components/admin/ProductFormModal';
import DeleteConfirmationModal from '../../components/admin/DeleteConfirmationModal';
import toast from 'react-hot-toast';
import { deleteMultipleFromCloudinary } from '../../utils/cloudinary';

export default function ProductManagement() {
  const { isCollapsed } = useAdminUI();
  const { categories: hierarchy } = useCategories();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [rowsOpen, setRowsOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: 'updatedAt', dir: 'desc' });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  // States for Delete Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const filterRef = useRef(null);
  const rowsRef = useRef(null);

  const [featuredProductIds, setFeaturedProductIds] = useState(new Set());
  const [featuredDocMap, setFeaturedDocMap] = useState({}); // productId -> featuredDocId

  // Real-time listener for products
  useEffect(() => {
    const q = query(collection(db, 'products'), orderBy('updatedAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const productsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProducts(productsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Real-time listener for featured treasures
  useEffect(() => {
    const q = query(collection(db, 'featuredTreasures'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ids = new Set();
      const map = {};
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        ids.add(data.productId);
        map[data.productId] = doc.id;
      });
      setFeaturedProductIds(ids);
      setFeaturedDocMap(map);
    });
    return () => unsubscribe();
  }, []);

  // Migration: Ensure all products have slugs for clean URLs
  useEffect(() => {
    if (loading || products.length === 0) return;

    const productsWithoutSlugs = products.filter(p => !p.slug && p.name);
    if (productsWithoutSlugs.length > 0) {
      const migrate = async () => {
        for (const p of productsWithoutSlugs) {
          const slug = p.name
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
          
          try {
            await updateDoc(doc(db, 'products', p.id), { slug });
          } catch (err) {
            console.error(`Slug migration failed for ${p.id}:`, err);
          }
        }
      };
      migrate();
    }
  }, [products, loading]);

  const toggleFeatured = async (product) => {
    const isFeatured = featuredProductIds.has(product.id);
    try {
      if (isFeatured) {
        const docId = featuredDocMap[product.id];
        if (docId) {
          await deleteDoc(doc(db, 'featuredTreasures', docId));
          toast.success(`Removed "${product.name}" from favorites`);
        }
      } else {
        if (featuredProductIds.size >= 8) {
          toast.error("Limit reached: You can only feature up to 8 products");
          return;
        }
        const newRef = doc(collection(db, 'featuredTreasures'));
        await setDoc(newRef, {
          productId: product.id,
          order: featuredProductIds.size,
          updatedAt: serverTimestamp()
        });
        toast.success(`Added "${product.name}" to favorites`);
      }
    } catch (error) {
      console.error("Error toggling featured:", error);
      toast.error("Action failed");
    }
  };

  // Flatten categories for ID -> Name mapping
  const categoryMap = (() => {
    const map = {};
    const flatten = (items) => {
      items.forEach(item => {
        map[item.id] = item.name;
        if (item.children) flatten(item.children);
      });
    };
    flatten(hierarchy);
    return map;
  })();

  const handleSort = (key) => {
    setSortConfig(prev =>
      prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }
    );
  };

  const rowOptions = [5, 10, 20, 50];

  const SortIcon = ({ colKey }) => {
    const isActive = sortConfig.key === colKey;
    const isDesc = isActive && sortConfig.dir === 'desc';
    return (
      <ChevronDown
        size={13}
        strokeWidth={3}
        className={`transition-all duration-200 ${isActive ? 'text-[#1BAFAF]' : 'text-gray-300'} ${isDesc ? 'rotate-180' : 'rotate-0'}`}
      />
    );
  };

  const handleDelete = (product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    try {
      setIsDeleting(true);
      // Delete images from Cloudinary
      if (productToDelete.images && productToDelete.images.length > 0) {
        await deleteMultipleFromCloudinary(productToDelete.images);
      }
      await deleteDoc(doc(db, 'products', productToDelete.id));
      toast.success(`"${productToDelete.name}" deleted successfully`);
      setIsDeleteModalOpen(false);
      setProductToDelete(null);
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    } finally {
      setIsDeleting(false);
    }
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const openViewModal = (product) => {
    setSelectedProduct(product);
    setIsViewModalOpen(true);
  };

  const filteredProducts = (() => {
    let list = products.filter(p => {
      const categoryName = categoryMap[p.categoryId] || '';
      const matchesSearch =
        (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        categoryName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = activeFilter === 'All' || categoryName === activeFilter;
      return matchesSearch && matchesFilter;
    });

    if (sortConfig.key) {
      list = [...list].sort((a, b) => {
        let aVal = a[sortConfig.key] ?? '';
        let bVal = b[sortConfig.key] ?? '';
        
        if (sortConfig.key === 'updatedAt' || sortConfig.key === 'createdAt') {
          aVal = aVal?.toDate ? aVal.toDate() : new Date(aVal);
          bVal = bVal?.toDate ? bVal.toDate() : new Date(bVal);
        }

        if (aVal < bVal) return sortConfig.dir === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.dir === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return list;
  })();

  useEffect(() => {
    const handler = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) setFilterOpen(false);
      if (rowsRef.current && !rowsRef.current.contains(e.target)) setRowsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (loading && products.length === 0) {
    return (
      <div className="h-[60vh] w-full flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#1BAFAF]" />
        <p className="text-[14px] font-medium text-gray-400">Loading your collection...</p>
      </div>
    );
  }

  return (
    <div className={`mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 transition-all duration-300 ${isCollapsed ? 'max-w-[1600px]' : 'max-w-[1280px]'}`} style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}>

      {/* Header Section */}
      <div className="space-y-2 py-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-semibold text-gray-900 tracking-tight">
              Product Management
            </h1>
            <p className="text-[12px] text-gray-400 font-medium">Manage your collection of handmade sarees and textiles</p>
          </div>
          <button 
            onClick={openAddModal}
            className="flex items-center gap-2 bg-[#1BAFAF] hover:bg-[#17a0a0] text-white px-4 py-2 rounded-xl text-[13px] font-semibold transition-all shadow-sm shadow-[#1BAFAF]/10 active:scale-95"
          >
            <Plus size={16} strokeWidth={2.5} />
            Add Product
          </button>
        </div>
        <hr className="border-gray-100" />
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
        <div className="relative group w-full sm:max-w-[480px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-[#1BAFAF] transition-colors" />
          <input
            type="text"
            placeholder="Search by name or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50 border-none py-2 pl-10 pr-4 text-[13px] rounded-xl outline-none focus:bg-white transition-all font-medium"
          />
        </div>
        <div className="flex items-center gap-3 pr-2">
          {/* Rows Selection */}
          <div className="relative" ref={rowsRef}>
            <button
              onClick={() => setRowsOpen(prev => !prev)}
              className="flex items-center gap-2 px-3 py-1.5 text-[12px] font-semibold text-gray-500 hover:text-gray-900 transition-colors border-r border-gray-100"
            >
              Rows: <span className="text-[#1BAFAF]">{rowsPerPage}</span>
              <ChevronDown size={12} className={`transition-transform duration-200 ${rowsOpen ? 'rotate-180' : ''}`} />
            </button>
            {rowsOpen && (
              <div className="absolute right-0 top-full mt-2 w-24 bg-white border border-gray-100 rounded-xl shadow-lg z-50 py-1 overflow-hidden">
                {rowOptions.map(opt => (
                  <button
                    key={opt}
                    onClick={() => { setRowsPerPage(opt); setRowsOpen(false); }}
                    className={`w-full text-left px-3 py-2 text-[13px] transition-colors ${
                      rowsPerPage === opt ? 'text-[#1BAFAF] font-semibold bg-[#1BAFAF]/5' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {opt} rows
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setFilterOpen(prev => !prev)}
              className={`flex items-center gap-2 px-3 py-1.5 text-[12px] font-semibold transition-colors rounded-lg ${
                activeFilter !== 'All' ? 'text-[#1BAFAF] bg-[#1BAFAF]/10' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Filter size={14} strokeWidth={2.5} />
              {activeFilter !== 'All' ? `Cat: ${activeFilter}` : 'Filters'}
              {activeFilter !== 'All' && (
                <span onClick={(e) => { e.stopPropagation(); setActiveFilter('All'); }} className="ml-1 hover:text-red-400">
                  <X size={12} strokeWidth={2.5} />
                </span>
              )}
            </button>
            {filterOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg z-50 py-1 overflow-hidden max-h-[300px] overflow-y-auto custom-scrollbar">
                <p className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Filter by Category</p>
                <button
                  onClick={() => { setActiveFilter('All'); setFilterOpen(false); }}
                  className={`w-full text-left px-3 py-2 text-[13px] transition-colors ${
                    activeFilter === 'All' ? 'text-[#1BAFAF] font-semibold bg-[#1BAFAF]/5' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  All Categories
                </button>
                {Object.values(categoryMap).map(name => (
                  <button
                    key={name}
                    onClick={() => { setActiveFilter(name); setFilterOpen(false); }}
                    className={`w-full text-left px-3 py-2 text-[13px] transition-colors ${
                      activeFilter === name ? 'text-[#1BAFAF] font-semibold bg-[#1BAFAF]/5' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table + Footer */}
      <div className="space-y-3">
        <div className="bg-white rounded-[20px] border border-gray-100 shadow-sm overflow-x-auto custom-scrollbar min-h-[400px]">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-50 bg-white">
                <th className="px-6 py-4 text-left text-[14px] font-bold text-[#1BAFAF]">Sr No</th>
                <th className="px-6 py-4 text-left text-[14px] font-bold text-[#1BAFAF]">Product ID</th>
                <th className="px-6 py-4 text-left text-[14px] font-bold text-[#1BAFAF]">
                  <button onClick={() => handleSort('name')} className="flex items-center gap-1 hover:opacity-75 transition-opacity">
                    Product <SortIcon colKey="name" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-[14px] font-bold text-[#1BAFAF]">
                  <button onClick={() => handleSort('categoryId')} className="flex items-center gap-1 hover:opacity-75 transition-opacity">
                    Category <SortIcon colKey="categoryId" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-[14px] font-bold text-[#1BAFAF]">
                  <button onClick={() => handleSort('price')} className="flex items-center gap-1 hover:opacity-75 transition-opacity">
                    Price <SortIcon colKey="price" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-[14px] font-bold text-[#1BAFAF]">
                  <button onClick={() => handleSort('stock')} className="flex items-center gap-1 hover:opacity-75 transition-opacity">
                    Stock <SortIcon colKey="stock" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-[14px] font-bold text-[#1BAFAF]">Status</th>
                <th className="px-6 py-4 text-left text-[14px] font-bold text-[#1BAFAF]">Featured</th>
                <th className="px-6 py-4 text-left text-[14px] font-bold text-[#1BAFAF]">
                  <button onClick={() => handleSort('updatedAt')} className="flex items-center gap-1 hover:opacity-75 transition-opacity">
                    Modified <SortIcon colKey="updatedAt" />
                  </button>
                </th>
                <th className="px-6 py-4 text-right text-[14px] font-bold text-[#1BAFAF]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50/50">
              {filteredProducts.length > 0 ? (
                filteredProducts.slice(0, rowsPerPage).map((product, idx) => (
                  <tr 
                    key={product.id} 
                    onClick={() => openViewModal(product)}
                    className="hover:bg-gray-50 group transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-[14px] text-gray-400 font-medium">{(idx + 1).toString().padStart(2, '0')}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-[13px] text-gray-600 font-bold font-mono">
                      {product.productId || '---'}
                    </td>
                    <td className="px-6 py-4 max-w-[240px]">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0 flex items-center justify-center">
                          {product.images && product.images.length > 0 ? (
                            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <Image size={20} className="text-gray-200" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <span className="text-[14px] font-bold text-gray-900 truncate block" title={product.name}>{product.name}</span>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{product.productType}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-[150px]">
                      <span className="block text-[14px] text-gray-500 font-medium truncate" title={categoryMap[product.categoryId] || 'Uncategorized'}>
                        {categoryMap[product.categoryId] || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-[14px] font-bold text-[#1BAFAF]">
                        ₹{Number(product.discountedPrice || product.price || 0).toLocaleString()}
                      </div>
                      {Number(product.actualPrice || 0) > Number(product.discountedPrice || 0) && (
                        <div className="text-[11px] text-gray-400 line-through">
                          ₹{Number(product.actualPrice || 0).toLocaleString()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className={`text-[14px] font-medium ${
                          product.productType === 'Unique' 
                            ? 'text-gray-500' 
                            : (Number(product.stock) < 5 ? 'text-red-500 font-bold' : 'text-gray-500')
                        }`}>
                          {product.stock}
                        </span>
                        {product.productType !== 'Unique' && Number(product.stock) < 5 && (
                          <AlertCircle size={12} className="text-red-500" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg ${
                        product.isAvailable ? 'text-[#1BAFAF] bg-[#eaf6f6]' : 'text-gray-400 bg-gray-100'
                      }`}>
                        {product.isAvailable ? 'Available' : 'Hidden'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button 
                        onClick={(e) => { e.stopPropagation(); toggleFeatured(product); }}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all active:scale-90 ${
                          featuredProductIds.has(product.id) 
                            ? 'text-brand-orange bg-brand-orange/10 shadow-sm' 
                            : 'text-gray-200 hover:text-brand-orange hover:bg-gray-50'
                        }`}
                        title={featuredProductIds.has(product.id) ? "Remove from favorites" : "Add to favorites"}
                      >
                        <Star size={16} fill={featuredProductIds.has(product.id) ? "currentColor" : "none"} strokeWidth={2.5} />
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-[13px] font-medium text-gray-500">
                        {product.updatedAt ? formatDate(product.updatedAt) : '---'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={(e) => { e.stopPropagation(); openEditModal(product); }}
                          className="w-8 h-8 flex items-center justify-center text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all active:scale-90" 
                          title="Edit"
                        >
                          <Pencil size={14} strokeWidth={2.5} />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDelete(product); }}
                          className="w-8 h-8 flex items-center justify-center text-red-600 hover:bg-red-50 rounded-lg transition-all active:scale-90" 
                          title="Delete"
                        >
                          <Trash2 size={14} strokeWidth={2.5} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-200">
                        <Package size={32} />
                      </div>
                      <div className="space-y-1">
                        <p className="text-gray-500 font-bold">No products found</p>
                        <p className="text-gray-400 text-[12px]">Try adjusting your search or add a new creation</p>
                      </div>
                      {(searchTerm || activeFilter !== 'All') && (
                        <button onClick={() => { setSearchTerm(''); setActiveFilter('All'); }} className="text-[#1BAFAF] text-[13px] font-bold hover:underline mt-2">
                          Clear all filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Page Footer */}
        <div className="flex items-center justify-between px-2 pt-3">
          <span className="text-[11px] font-bold text-gray-300 uppercase tracking-widest">
            Showing {Math.min(filteredProducts.length, 1)}-{Math.min(rowsPerPage, filteredProducts.length)} of {filteredProducts.length} Items
          </span>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-300 transition-all cursor-not-allowed">
              <ArrowUpRight size={14} className="rotate-[225deg]" />
            </div>
            <button className="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-gray-900 hover:shadow-sm hover:text-[#1BAFAF] transition-all group">
              <ArrowUpRight size={14} className="rotate-45 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Product Form Modal */}
      <ProductFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={editingProduct}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        itemName={productToDelete?.name}
        loading={isDeleting}
      />

      {/* Product View Modal */}
      <ProductViewModal 
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        product={selectedProduct}
        categoryMap={categoryMap}
        hierarchy={hierarchy}
      />
    </div>
  );
}

// Product View Modal Component
function ProductViewModal({ isOpen, onClose, product, categoryMap, hierarchy }) {
  if (!product) return null;

  const [activeImg, setActiveImg] = useState(product.images?.[0] || '');

  useEffect(() => {
    if (product?.images?.length > 0) {
      setActiveImg(product.images[0]);
    }
  }, [product]);

  const getCategoryPath = (targetId, currentHierarchy) => {
    if (!currentHierarchy) return null;
    for (const cat of currentHierarchy) {
      if (cat.id === targetId) return [cat.name];
      if (cat.children) {
        const path = getCategoryPath(targetId, cat.children);
        if (path) return [cat.name, ...path];
      }
    }
    return null;
  };

  const fullPath = getCategoryPath(product.categoryId, hierarchy) || [];
  const displayPath = fullPath.length > 4 
    ? [...fullPath.slice(0, 3), '...'].join(' > ')
    : fullPath.join(' > ');

  const actualPrice = Number(product.actualPrice || 0);
  const discountedPrice = Number(product.discountedPrice || 0);

  const discountPercent = actualPrice > 0
    ? Math.round(((actualPrice - discountedPrice) / actualPrice) * 100) 
    : 0;

  const stockStatus = product.stock < 5 ? {
    label: `Low Stock (${product.stock} Units)`,
    class: 'text-red-500 bg-red-50 border-red-100'
  } : {
    label: `In Stock (${product.stock} Units)`,
    class: 'text-emerald-500 bg-emerald-50 border-emerald-100'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            className="relative w-full max-w-5xl bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[95vh]"
            onClick={e => e.stopPropagation()}
          >
            {/* Fixed Header */}
            <div className="px-10 py-6 flex items-center justify-between bg-white border-b border-gray-50 shrink-0 relative">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-[#1BAFAF]/10 text-[#1BAFAF] flex items-center justify-center shadow-inner">
                  <Package size={28} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold text-gray-900 leading-none">Product Details</h2>
                    <span className="text-gray-200 font-light text-xl">|</span>
                    <span className="px-3 py-1 bg-gray-50 text-[#1BAFAF] text-[10px] font-bold rounded-full border border-gray-100 uppercase tracking-widest">
                      {product.productId || 'NO-ID'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] font-medium text-gray-300 uppercase tracking-wider">
                    <Layers size={13} className="text-[#1BAFAF]/40" />
                    {displayPath || 'Uncategorized'}
                  </div>
                </div>
              </div>
              <button onClick={onClose} className="w-10 h-10 rounded-full bg-gray-50 text-gray-400 hover:text-gray-900 transition-colors flex items-center justify-center border border-gray-100 active:scale-90">
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-10 md:p-14 custom-scrollbar bg-white">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-14">
                
                {/* Left Side: Image Gallery */}
                <div className="lg:col-span-6 flex gap-6 h-[400px]">
                  {/* Square Thumbnails with Scroll */}
                  <div className="flex flex-col gap-3 shrink-0 py-1 overflow-y-auto overflow-x-hidden custom-scrollbar-thin w-24 h-full pr-2">
                    {product.images?.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveImg(img)}
                        className={`w-20 h-20 shrink-0 rounded-xl overflow-hidden border-2 transition-all active:scale-90 shadow-sm bg-white ${
                          activeImg === img ? 'border-brand-orange ring-2 ring-brand-orange/20' : 'border-gray-100 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={img} alt="" className="w-full h-full object-contain p-1" />
                      </button>
                    ))}
                  </div>

                  {/* Main Large Image (Aligned Height) */}
                  <div className="flex-1 relative rounded-[32px] bg-gray-50 overflow-hidden border border-gray-100 group shadow-inner h-full flex items-center justify-center">
                    <img 
                      src={activeImg} 
                      alt={product.name} 
                      className="max-w-full max-h-full object-contain transition-transform duration-700 group-hover:scale-105 p-4" 
                    />
                  </div>
                </div>

                {/* Right Side: Details */}
                <div className="lg:col-span-6 space-y-10 py-2">
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <h1 className="text-4xl font-black text-gray-900 tracking-tight leading-tight">{product.name}</h1>
                      <p className="text-lg font-semibold text-gray-400 italic">{product.tagline || 'Exquisite Artisanal Piece'}</p>
                    </div>

                    <div className="flex items-center">
                      <div className={`px-3 py-1 rounded-lg border text-[11px] font-black uppercase tracking-widest ${stockStatus.class}`}>
                        {stockStatus.label}
                      </div>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-4">
                      <span className="text-4xl font-black text-gray-900">₹{discountedPrice.toLocaleString()}</span>
                      {actualPrice > 0 && actualPrice !== discountedPrice && (
                        <span className="text-xl font-bold text-gray-300 line-through">₹{actualPrice.toLocaleString()}</span>
                      )}
                      {discountPercent > 0 && (
                        <span className="px-3 py-1 bg-red-50 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-lg border border-red-100">
                          FLAT {discountPercent}% OFF
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Attributes */}
                  <div className="grid grid-cols-3 gap-6 py-8 border-y border-gray-50">
                    <div className="space-y-1">
                      <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">Fabric</span>
                      <p className="text-[13px] font-bold text-gray-800">Pure Silk</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">Craft</span>
                      <p className="text-[13px] font-bold text-gray-800">Hand Woven</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">Occasion</span>
                      <p className="text-[13px] font-bold text-gray-800">Festive Wear</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mt-14 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Product Description</h3>
                  <div className="h-px flex-1 bg-gray-100 ml-6" />
                </div>
                <div className="p-8 rounded-[32px] bg-gray-50/50 border border-gray-100 min-h-[160px]">
                  <p className="text-[15px] font-medium text-gray-600 leading-relaxed italic whitespace-pre-wrap">
                    {product.description || 'No description provided for this creation.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Fixed Footer */}
            <div className="px-10 py-6 bg-gray-50 border-t border-gray-100 flex items-center justify-end shrink-0">
                <button onClick={onClose} className="px-12 py-3.5 bg-[#1BAFAF] hover:bg-[#17a0a0] text-white text-[13px] font-black uppercase tracking-widest rounded-xl transition-all active:scale-95 shadow-xl shadow-[#1BAFAF]/20">
                  Done
                </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}