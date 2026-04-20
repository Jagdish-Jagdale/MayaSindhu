import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Search,
  ChevronDown,
  ChevronRight,
  Filter,
  X,
  Grid2X2,
  Pencil,
  Trash2,
  ArrowUpRight,
  Package,
  Shapes,
  Diamond,
  Layers,
  Loader2,
  ExternalLink,
  ChevronLeft
} from 'lucide-react';
import { useAdminUI } from '../../context/AdminUIContext';
import { db } from '../../firebase';
import { collection, onSnapshot, query, orderBy, doc, deleteDoc, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import useCategories from '../../hooks/useCategories';
import toast from 'react-hot-toast';

export default function Categories() {
  const { isCollapsed } = useAdminUI();
  const { categories: fullHierarchy, loading: catsLoading } = useCategories();

  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [rowsOpen, setRowsOpen] = useState(false);

  // Navigation State
  const [currentPath, setCurrentPath] = useState([]); // Array of category IDs

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryDraft, setCategoryDraft] = useState({ name: '' });
  const [isSaving, setIsSaving] = useState(false);

  const rowsRef = useRef(null);

  // Real-time products for counting
  useEffect(() => {
    const q = collection(db, 'products');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const p = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(p);
      setProductsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Handle outside click for rows dropdown
  useEffect(() => {
    const clickOut = (e) => {
      if (rowsRef.current && !rowsRef.current.contains(e.target)) setRowsOpen(false);
    };
    document.addEventListener('mousedown', clickOut);
    return () => document.removeEventListener('mousedown', clickOut);
  }, []);

  // Derive breadcrumbs and visible items from IDs to ensure real-time reactivity
  const breadcrumbs = (() => {
    let current = fullHierarchy;
    let path = [];
    for (const id of currentPath) {
      const match = current.find(c => c.id === id);
      if (match) {
        path.push(match);
        current = match.children || [];
      }
    }
    return path;
  })();

  const visibleCategories = (() => {
    let list = fullHierarchy;
    for (const id of currentPath) {
      const match = list.find(c => c.id === id);
      if (match && match.children) {
        list = match.children;
      } else {
        list = [];
        break;
      }
    }

    if (searchTerm && list.length > 0) {
      return list.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    return list;
  })();

  // Navigation Logic
  const handleDrillDown = (category) => {
    setCurrentPath(prev => [...prev, category.id]);
    setSearchTerm('');
  };

  const handleBreadcrumb = (index) => {
    if (index === -1) {
      setCurrentPath([]);
    } else {
      setCurrentPath(prev => prev.slice(0, index + 1));
    }
    setSearchTerm('');
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setCategoryDraft({ name: category.name });
    setIsModalOpen(true);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!categoryDraft.name.trim()) return;

    setIsSaving(true);
    try {
      if (editingCategory) {
        // Update existing
        await updateDoc(doc(db, 'categories', editingCategory.id), {
          name: categoryDraft.name,
          updatedAt: serverTimestamp()
        });
        toast.success("Category updated successfully");
      } else {
        // Add new
        const parentId = currentPath.length > 0 ? currentPath[currentPath.length - 1] : null;
        const newCategory = {
          name: categoryDraft.name,
          parentId: parentId,
          level: currentPath.length,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        await addDoc(collection(db, 'categories'), newCategory);
        toast.success(`"${categoryDraft.name}" added successfully`);
      }
      setIsModalOpen(false);
      setCategoryDraft({ name: '' });
    } catch (err) {
      console.error("Error saving category:", err);
      toast.error("Failed to save category");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (category) => {
    const confirmMessage = category.children?.length > 0
      ? `Delete "${category.name}" and all its ${category.children.length} sub-layers? This action cannot be undone.`
      : `Are you sure you want to delete "${category.name}"?`;

    if (window.confirm(confirmMessage)) {
      try {
        setLoading(true);

        // Helper to collect all child IDs recursively
        const getAllChildIds = (cat) => {
          let ids = [cat.id];
          if (cat.children && cat.children.length > 0) {
            cat.children.forEach(child => {
              ids = [...ids, ...getAllChildIds(child)];
            });
          }
          return ids;
        };

        const idsToDelete = getAllChildIds(category);

        // Delete all collections in this branch
        await Promise.all(idsToDelete.map(id => deleteDoc(doc(db, 'categories', id))));

        toast.success(`Removed "${category.name}" and its branch from heritage`);
      } catch (err) {
        console.error("Error deleting category branch:", err);
        toast.error("Failed to prune category branch");
      } finally {
        setLoading(false);
      }
    }
  };

  if (catsLoading || productsLoading) {
    return (
      <div className="h-[60vh] w-full flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#1BAFAF]" />
        <p className="text-[14px] font-medium text-gray-400">Opening heritage mapping...</p>
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
              Hierarchy Explorer
            </h1>
            <p className="text-[12px] text-gray-400 font-medium">Manage your multi-level heritage collections and masterpieces</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setEditingCategory(null); setCategoryDraft({ name: '' }); setIsModalOpen(true); }}
              className="flex items-center gap-2 bg-[#1BAFAF] hover:bg-[#17a0a0] text-white px-4 py-2 rounded-xl text-[13px] font-semibold transition-all shadow-sm shadow-[#1BAFAF]/10 active:scale-95"
            >
              <Plus size={16} strokeWidth={2.5} />
              {currentPath.length > 0 ? 'New Sub Category' : 'New Category'}
            </button>
          </div>
        </div>
        <hr className="border-gray-100" />
      </div>

      {/* Breadcrumb / Navigation Bar */}
      <div className="flex items-center gap-2 px-1 py-1">
        <button
          onClick={() => handleBreadcrumb(-1)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-bold transition-all ${currentPath.length === 0 ? 'bg-[#eaf6f6] text-[#1BAFAF]' : 'text-gray-400 hover:text-gray-700'
            }`}
        >
          <Shapes size={14} strokeWidth={2.5} />
          Main
        </button>
        {breadcrumbs.map((crumb, idx) => (
          <React.Fragment key={crumb.id}>
            <ChevronRight size={14} className="text-gray-200" />
            <button
              onClick={() => handleBreadcrumb(idx)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-bold transition-all ${idx === currentPath.length - 1 ? 'bg-[#eaf6f6] text-[#1BAFAF]' : 'text-gray-400 hover:text-gray-700'
                }`}
            >
              {crumb.name}
            </button>
          </React.Fragment>
        ))}
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
        <div className="relative group w-full sm:max-w-[480px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-[#1BAFAF] transition-colors" />
          <input
            type="text"
            placeholder={`Search ${visibleCategories.length > 0 ? 'collections' : 'masterpieces'} in ${currentPath.length > 0 ? breadcrumbs[breadcrumbs.length - 1]?.name : 'Main'}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50 border-none py-2 pl-10 pr-4 text-[13px] rounded-xl outline-none focus:bg-white transition-all font-medium"
          />
        </div>
        <div className="flex items-center gap-3 pr-2">
          <div className="relative" ref={rowsRef}>
            <button
              onClick={() => setRowsOpen(prev => !prev)}
              className="flex items-center gap-2 px-3 py-1.5 text-[12px] font-semibold text-gray-500 hover:text-gray-900 transition-colors"
            >
              Rows: <span className="text-[#1BAFAF]">{rowsPerPage}</span>
              <ChevronDown size={12} className={`transition-transform duration-200 ${rowsOpen ? 'rotate-180' : ''}`} />
            </button>
            {rowsOpen && (
              <div className="absolute right-0 top-full mt-2 w-24 bg-white border border-gray-100 rounded-xl shadow-lg z-50 py-1 overflow-hidden">
                {[5, 10, 20, 50].map(opt => (
                  <button
                    key={opt}
                    onClick={() => { setRowsPerPage(opt); setRowsOpen(false); }}
                    className={`w-full text-left px-3 py-2 text-[13px] transition-colors ${rowsPerPage === opt ? 'text-[#1BAFAF] font-semibold bg-[#1BAFAF]/5' : 'text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    {opt} rows
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="space-y-3">
        <div className="bg-white rounded-[22px] border border-gray-100 shadow-sm overflow-hidden min-h-[400px] overflow-x-auto custom-scrollbar">
          {visibleCategories.length > 0 ? (
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-50 bg-white">
                  <th className="px-6 py-4 text-left text-[14px] font-bold text-[#1BAFAF] w-20">Sr No</th>
                  <th className="px-6 py-4 text-left text-[14px] font-bold text-[#1BAFAF]">Category</th>
                  <th className="px-6 py-4 text-left text-[14px] font-bold text-[#1BAFAF]">Layer</th>
                  <th className="px-6 py-4 text-left text-[14px] font-bold text-[#1BAFAF]">Items</th>
                  <th className="px-6 py-4 text-left text-[14px] font-bold text-[#1BAFAF]">Sub-layers</th>
                  <th className="px-6 py-4 text-right text-[14px] font-bold text-[#1BAFAF]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50/50">
                {visibleCategories.slice(0, rowsPerPage).map((cat, idx) => {
                  const itemsCount = products.filter(p => p.categoryId === cat.id).length;
                  const hasChildren = cat.children && cat.children.length > 0;

                  return (
                    <tr
                      key={cat.id}
                      className="hover:bg-gray-50 group transition-all duration-200 cursor-pointer"
                      onClick={() => handleDrillDown(cat)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-[14px] text-gray-400 font-medium">
                        {(idx + 1).toString().padStart(2, '0')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-[12px] flex items-center justify-center transition-all ${hasChildren ? 'bg-[#eaf6f6] text-[#1BAFAF] group-hover:scale-110' : 'bg-gray-50 text-gray-400 border border-gray-100'
                            }`}>
                            {hasChildren ? <Shapes size={18} strokeWidth={2.5} /> : <Diamond size={16} strokeWidth={2.5} />}
                          </div>
                          <div>
                            <span className="text-[14px] font-bold text-gray-900 group-hover:text-[#1BAFAF] transition-colors">{cat.name}</span>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{hasChildren ? 'Discover Layers' : 'View Masterpieces'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg ${currentPath.length === 0 ? 'text-[#1BAFAF] bg-[#eaf6f6]' : 'text-gray-400 bg-gray-100'
                          }`}>
                          {currentPath.length === 0 ? 'Main' : `L${currentPath.length} Layer`}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Diamond size={12} className="text-gray-300" />
                          <span className="text-[14px] font-bold text-gray-700">{itemsCount} Pieces</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-gray-400 font-bold text-[13px]">
                          <Layers size={14} className="text-gray-200" />
                          {cat.children?.length || 0} Layers
                          <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(cat)}
                            className="w-8 h-8 flex items-center justify-center text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all active:scale-90"
                          >
                            <Pencil size={14} strokeWidth={2.5} />
                          </button>
                          <button
                            onClick={() => handleDelete(cat)}
                            className="w-8 h-8 flex items-center justify-center text-red-600 hover:bg-red-50 rounded-lg transition-all active:scale-90"
                          >
                            <Trash2 size={14} strokeWidth={2.5} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            currentPath.length > 0 ? (
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-50 bg-white">
                    <th className="px-6 py-4 text-left text-[14px] font-bold text-[#1BAFAF] w-20">Sr No</th>
                    <th className="px-6 py-4 text-left text-[14px] font-bold text-[#1BAFAF]">Masterpiece</th>
                    <th className="px-6 py-4 text-left text-[14px] font-bold text-[#1BAFAF]">Price</th>
                    <th className="px-6 py-4 text-left text-[14px] font-bold text-[#1BAFAF]">Stock</th>
                    <th className="px-6 py-4 text-left text-[14px] font-bold text-[#1BAFAF]">Status</th>
                    <th className="px-6 py-4 text-right text-[14px] font-bold text-[#1BAFAF]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50/50">
                  {(() => {
                    const activeCatId = currentPath[currentPath.length - 1].id;
                    const catProducts = products.filter(p =>
                      p.categoryId === activeCatId &&
                      (searchTerm ? p.name.toLowerCase().includes(searchTerm.toLowerCase()) : true)
                    );

                    if (catProducts.length === 0) {
                      return (
                        <tr>
                          <td colSpan="6" className="px-6 py-20 text-center">
                            <div className="flex flex-col items-center gap-3">
                              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-200 border border-gray-100">
                                <Diamond size={32} />
                              </div>
                              <p className="text-gray-500 font-bold text-[14px]">No pieces found in this collection</p>
                            </div>
                          </td>
                        </tr>
                      );
                    }

                    return catProducts.slice(0, rowsPerPage).map((p, idx) => (
                      <tr key={p.id} className="hover:bg-gray-50 group transition-all duration-200">
                        <td className="px-6 py-4 whitespace-nowrap text-[14px] text-gray-400 font-medium">
                          {(idx + 1).toString().padStart(2, '0')}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 shrink-0 flex items-center justify-center">
                              {p.images?.[0] ? (
                                <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <Diamond size={18} className="text-gray-200" />
                              )}
                            </div>
                            <div>
                              <span className="text-[14px] font-bold text-gray-900 line-clamp-1">{p.name}</span>
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{p.productType}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-[14px] text-[#1BAFAF] font-bold">
                          ₹{Number(p.price).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-[14px] text-gray-500 font-medium tabular-nums font-semibold">
                          {p.stock} Units
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg ${p.isAvailable ? 'text-[#1BAFAF] bg-[#eaf6f6]' : 'text-gray-400 bg-gray-100'
                            }`}>
                            {p.isAvailable ? 'Available' : 'Hidden'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-[#1BAFAF] hover:bg-gray-50 rounded-lg transition-all active:scale-95">
                              <ArrowUpRight size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            ) : (
              <div className="px-6 py-20 text-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-200">
                    <Grid2X2 size={32} />
                  </div>
                  <p className="text-gray-500 font-bold">No collections found in Heritage</p>
                </div>
              </div>
            )
          )}
        </div>

        {/* Table Footer */}
        <div className="flex items-center justify-between px-2 pt-3">
          <span className="text-[11px] font-bold text-gray-300 uppercase tracking-widest">
            {visibleCategories.length > 0
              ? `Showing ${Math.min(visibleCategories.length, 1)}-${Math.min(rowsPerPage, visibleCategories.length)} of ${visibleCategories.length} Layers`
              : "End of hierarchy reached • Viewing Masterpieces"
            }
          </span>
          <div className="flex items-center gap-2 text-[12px] font-bold text-gray-400">
            {visibleCategories.length > 0 ? 'Click rows to explore deeper' : 'Direct masterpiece overview'}
          </div>
        </div>
      </div>
      {/* Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {editingCategory
                      ? 'Refine Category'
                      : (currentPath.length > 0 ? 'New Sub Category' : 'New Main Category')
                    }
                  </h2>
                  <p className="text-[12px] text-gray-400 font-medium">
                    {editingCategory
                      ? `Refining ${currentPath.length > 0 ? 'sub-layer' : 'main layer'} in heritage`
                      : `Adding a new layer under ${currentPath.length > 0 ? breadcrumbs.map(p => p.name).join(' > ') : 'Main'}`
                    }
                  </p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-50 rounded-xl transition-colors">
                  <X size={20} className="text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleSaveCategory} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[12px] font-bold text-gray-500 uppercase tracking-widest ml-1">Category Name</label>
                  <input
                    autoFocus
                    type="text"
                    value={categoryDraft.name}
                    onChange={(e) => setCategoryDraft({ name: e.target.value })}
                    placeholder="e.g. Handmade Silk Sarees"
                    className="w-full bg-gray-50 border-2 border-transparent focus:border-[#1BAFAF] focus:bg-white p-4 rounded-2xl outline-none transition-all font-bold text-gray-800"
                    required
                  />
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-3.5 rounded-2xl text-[14px] font-bold text-gray-400 hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 bg-[#1BAFAF] hover:bg-[#17a0a0] disabled:opacity-50 text-white px-4 py-3.5 rounded-2xl text-[14px] font-bold transition-all shadow-lg shadow-[#1BAFAF]/20 active:scale-95 flex items-center justify-center gap-2"
                  >
                    {isSaving ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : editingCategory ? (
                      currentPath.length > 0 ? 'Update Sub Category' : 'Update Category'
                    ) : (
                      currentPath.length > 0 ? 'Add Sub Category' : 'Add Category'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
