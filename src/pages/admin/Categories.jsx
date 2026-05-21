import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  ChevronLeft,
  MoreVertical,
  AlertCircle,
  AlertTriangle,
  ChevronUp
} from 'lucide-react';
import { useAdminUI } from '../../context/AdminUIContext';
import { db } from '../../firebase';
import { collection, onSnapshot, query, orderBy, doc, deleteDoc, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useLocation } from 'react-router-dom';
import { AiFillThunderbolt } from 'react-icons/ai';
import useCategories from '../../hooks/useCategories';
import ProductFormModal from '../../components/admin/ProductFormModal';
import DeleteConfirmationModal from '../../components/admin/DeleteConfirmationModal';
import toast from 'react-hot-toast';
import CustomSelect from '../../components/common/CustomSelect';

export default function Categories() {
  const { isCollapsed } = useAdminUI();
  const { pathname } = useLocation();
  const isOnlinePanel = pathname.startsWith('/admin') && !pathname.startsWith('/admin-offline');
  const { categories: fullHierarchy, loading: catsLoading } = useCategories();
  const [stockAlertThreshold, setStockAlertThreshold] = useState(() => {
    const saved = localStorage.getItem('stockAlertThreshold');
    const parsed = saved !== null ? parseInt(saved, 10) : 5;
    return isNaN(parsed) ? 5 : parsed;
  });

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'settings', 'inventory'), (docSnap) => {
      if (docSnap.exists()) {
        const val = docSnap.data().stockAlertThreshold;
        const parsed = parseInt(val, 10);
        if (!isNaN(parsed)) {
          setStockAlertThreshold(parsed);
          localStorage.setItem('stockAlertThreshold', parsed);
        }
      }
    }, (error) => {
      console.error("Error listening to settings:", error);
    });
    return () => unsubscribe();
  }, []);

  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [direction, setDirection] = useState(0);
  const [rowsOpen, setRowsOpen] = useState(false);
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const SortIndicator = ({ field }) => {
    if (sortField !== field) {
      return (
        <ChevronDown size={12} className="text-gray-300 ml-1 inline-block" strokeWidth={2.5} />
      );
    }
    return sortOrder === 'asc' ? (
      <ChevronUp size={12} className="text-[#1BAFAF] ml-1 inline-block" strokeWidth={3} />
    ) : (
      <ChevronDown size={12} className="text-[#1BAFAF] ml-1 inline-block" strokeWidth={3} />
    );
  };

  // Navigation State
  const [currentPath, setCurrentPath] = useState([]); // Array of category IDs

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, rowsPerPage, currentPath]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryDraft, setCategoryDraft] = useState({ name: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  // States for Delete Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState("");
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

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
      list = list.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    if (sortField) {
      list = [...list].sort((a, b) => {
        let valA, valB;
        if (sortField === 'name') {
          valA = a.name || '';
          valB = b.name || '';
          return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        } else if (sortField === 'layer') {
          valA = currentPath.length === 0 ? 0 : currentPath.length;
          valB = currentPath.length === 0 ? 0 : currentPath.length;
        } else if (sortField === 'products') {
          valA = products.filter(p => p.categoryId === a.id).length;
          valB = products.filter(p => p.categoryId === b.id).length;
        } else if (sortField === 'sublayers') {
          valA = a.children?.length || 0;
          valB = b.children?.length || 0;

        } else if (sortField === 'isTrendy') {
          valA = a.isTrendy ? 1 : 0;
          valB = b.isTrendy ? 1 : 0;
        }

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return list;
  })();

  // Navigation Logic
  const handleDrillDown = (category) => {
    setDirection(1);
    setCurrentPath(prev => [...prev, category.id]);
    setSearchTerm('');
  };

  const handleBreadcrumb = (index) => {
    setDirection(-1);
    if (index === -1) {
      setCurrentPath([]);
    } else {
      setCurrentPath(prev => prev.slice(0, index + 1));
    }
    setSearchTerm('');
  };

  const rowVariants = {
    initial: ({ direction }) => ({ opacity: 0, x: direction * 30 }),
    animate: ({ index }) => ({ 
      opacity: 1, 
      x: 0,
      transition: { 
        delay: index * 0.03,
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1]
      }
    }),
    exit: ({ direction }) => ({ 
      opacity: 0, 
      x: direction * -30,
      transition: { duration: 0.2 }
    })
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setCategoryDraft({ name: category.name });
    setIsModalOpen(true);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    const cleanName = categoryDraft.name.trim();
    if (!cleanName) return;

    setIsSaving(true);
    try {
      // Check for duplicates (case-insensitive)
      const checkDuplicate = (items, name, excludeId) => {
        for (const cat of items) {
          if (cat.name.toLowerCase() === name.toLowerCase() && cat.id !== excludeId) return true;
          if (cat.children && checkDuplicate(cat.children, name, excludeId)) return true;
        }
        return false;
      };

      if (checkDuplicate(fullHierarchy, cleanName, editingCategory?.id)) {
        toast.error(`"${cleanName}" already exists in heritage mapping`);
        setIsSaving(false);
        return;
      }

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
          isTrendy: false,

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

  const handleDelete = (category) => {
    const message = category.children?.length > 0 
      ? `This will delete "${category.name}" and all its ${category.children.length} sub-layers. Information relating to these categories will be removed.`
      : null;
    
    setCategoryToDelete(category);
    setDeleteMessage(message);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;
    try {
      setIsDeleting(true);
      
      const getAllChildIds = (cat) => {
        let ids = [cat.id];
        if (cat.children && cat.children.length > 0) {
          cat.children.forEach(child => {
            ids = [...ids, ...getAllChildIds(child)];
          });
        }
        return ids;
      };

      const idsToDelete = getAllChildIds(categoryToDelete);
      await Promise.all(idsToDelete.map(id => deleteDoc(doc(db, 'categories', id))));
      
      toast.success(`Removed "${categoryToDelete.name}" and its branch from heritage`);
      setIsDeleteModalOpen(false);
      setCategoryToDelete(null);
    } catch (err) {
      console.error("Error deleting category branch:", err);
      toast.error("Failed to prune category branch");
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleTrendy = async (e, category) => {
    e.stopPropagation();
    try {
      await updateDoc(doc(db, 'categories', category.id), {
        isTrendy: !category.isTrendy,
        updatedAt: serverTimestamp()
      });
      toast.success(`${category.name} ${!category.isTrendy ? 'marked as trendy' : 'removed from trendy'}`);
    } catch (err) {
      console.error("Error toggling trendy status:", err);
      toast.error("Failed to update trendy status");
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-[22px] font-semibold text-gray-900 tracking-tight">
              Manage Categories
            </h1>
            <p className="text-[12px] text-gray-400 font-medium tracking-tight">Manage your multi-level heritage collections and products</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
               TOTAL RECORDS: {(() => {
                 return visibleCategories.length > 0 
                   ? visibleCategories.length 
                   : (products.filter(p => p.categoryId === currentPath[currentPath.length - 1]).length);
               })()}
            </span>
            <span className="text-gray-200 text-sm">|</span>
            <div className="flex items-center gap-3">
              {currentPath.length > 0 && (
                <button
                  onClick={() => setIsProductModalOpen(true)}
                  className="flex items-center gap-2 bg-white border border-[#1BAFAF] text-[#1BAFAF] hover:bg-[#1BAFAF]/5 px-4 py-2.5 rounded-xl text-[13px] font-bold transition-all active:scale-95 group"
                >
                  <Package size={18} className="group-hover:rotate-90 transition-transform duration-300" strokeWidth={2.5} />
                  Add Product
                </button>
              )}
              <button
                onClick={() => { setEditingCategory(null); setCategoryDraft({ name: '' }); setIsModalOpen(true); }}
                className="flex items-center gap-2 bg-[#1BAFAF] hover:bg-[#17a0a0] text-white px-5 py-2.5 rounded-xl text-[13px] font-bold transition-all shadow-sm shadow-[#1BAFAF]/10 active:scale-95 group"
              >
                <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" strokeWidth={2.5} />
                {currentPath.length > 0 ? 'Add Sub Category' : 'Add Category'}
              </button>
            </div>
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
            placeholder={`Search ${visibleCategories.length > 0 ? 'collections' : 'products'} in ${currentPath.length > 0 ? breadcrumbs[breadcrumbs.length - 1]?.name : 'Main'}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50 border-none py-2 pl-10 pr-4 text-[13px] rounded-xl outline-none focus:bg-white transition-all font-medium"
          />
        </div>
        <div className="flex items-center gap-3 pr-2">
          <div className="flex items-center px-3 border-r border-gray-100">
            <CustomSelect
              value={rowsPerPage}
              onChange={(val) => setRowsPerPage(Number(val))}
              options={[
                { value: 5, label: '5 rows' },
                { value: 10, label: '10 rows' },
                { value: 20, label: '20 rows' },
                { value: 50, label: '50 rows' }
              ]}
              className="w-28"
              minimal={true}
              valuePrefix="Rows:"
            />
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="space-y-3">
        <div className="bg-white rounded-[22px] border border-gray-100 shadow-sm overflow-hidden overflow-x-auto custom-scrollbar">
          {visibleCategories.length > 0 ? (
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-50 bg-white text-[#1BAFAF]">
                  <th className="px-6 py-4 text-left text-[14px] font-bold w-20 whitespace-nowrap">Sr No</th>
                  <th className="px-6 py-4 text-left text-[14px] font-bold cursor-pointer select-none" onClick={() => handleSort('name')}>
                    <div className="flex items-center gap-1">
                      Category
                      <SortIndicator field="name" />
                    </div>
                  </th>

                  {isOnlinePanel && (
                    <th className="px-6 py-4 text-left text-[14px] font-bold cursor-pointer select-none" onClick={() => handleSort('isTrendy')}>
                      <div className="flex items-center gap-1">
                        Trendy
                        <SortIndicator field="isTrendy" />
                      </div>
                    </th>
                  )}
                  <th className="px-6 py-4 text-left text-[14px] font-bold cursor-pointer select-none" onClick={() => handleSort('layer')}>
                    <div className="flex items-center gap-1">
                      Layer
                      <SortIndicator field="layer" />
                    </div>
                  </th>
                  {visibleCategories.some(cat => !cat.children || cat.children.length === 0) && (
                    <th className="px-6 py-4 text-left text-[14px] font-bold cursor-pointer select-none" onClick={() => handleSort('products')}>
                      <div className="flex items-center gap-1">
                        Products
                        <SortIndicator field="products" />
                      </div>
                    </th>
                  )}
                  <th className="px-6 py-4 text-left text-[14px] font-bold cursor-pointer select-none" onClick={() => handleSort('sublayers')}>
                    <div className="flex items-center gap-1">
                      Sub-layers
                      <SortIndicator field="sublayers" />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-right text-[14px] font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50/50">
                <AnimatePresence custom={direction}>
                {visibleCategories.length > 0 ? (
                  visibleCategories.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage).map((cat, index) => {
                    const itemsCount = products.filter(p => p.categoryId === cat.id).length;
                    const hasChildren = cat.children && cat.children.length > 0;

                    return (
                      <motion.tr
                        key={cat.id}
                        custom={{ direction, index }}
                        variants={rowVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="hover:bg-gray-50 group transition-all duration-200 cursor-pointer"
                        onClick={() => {
                          setDirection(1);
                          handleDrillDown(cat);
                        }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-[14px] text-gray-400 font-medium">
                          {((currentPage - 1) * rowsPerPage + index + 1).toString().padStart(2, '0')}
                        </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-[12px] flex items-center justify-center transition-all ${hasChildren ? 'bg-[#eaf6f6] text-[#1BAFAF] group-hover:scale-110' : 'bg-gray-50 text-gray-400 border border-gray-100'
                            }`}>
                            {hasChildren ? <Shapes size={18} strokeWidth={2.5} /> : <Diamond size={16} strokeWidth={2.5} />}
                          </div>
                          <div>
                            <span className="text-[14px] font-bold text-gray-900 group-hover:text-[#1BAFAF] transition-colors">{cat.name}</span>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{hasChildren ? 'Discover Layers' : 'View Products'}</p>
                          </div>
                        </div>
                      </td>

                      {isOnlinePanel && (
                        <td className="px-6 py-4 whitespace-nowrap" onClick={e => e.stopPropagation()}>
                          {currentPath.length === 0 ? (
                            <button 
                              onClick={(e) => toggleTrendy(e, cat)}
                              className={`transition-all duration-300 hover:scale-125 ${cat.isTrendy ? 'text-orange-500' : 'text-gray-300 hover:text-orange-500'}`}
                              title={cat.isTrendy ? "Remove from Trendy" : "Mark as Trendy"}
                            >
                              <AiFillThunderbolt size={20} className={cat.isTrendy ? 'text-orange-500' : 'text-gray-300 group-hover:text-orange-400'} />
                            </button>
                          ) : (
                            <span className="text-gray-200">---</span>
                          )}
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg ${currentPath.length === 0 ? 'text-[#1BAFAF] bg-[#eaf6f6]' : 'text-gray-400 bg-gray-100'
                          }`}>
                          {currentPath.length === 0 ? 'Main' : `L${currentPath.length} Layer`}
                        </span>
                      </td>
                      {visibleCategories.some(c => !c.children || c.children.length === 0) && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          {!hasChildren ? (
                            <div className="flex items-center gap-2">
                              <Diamond size={12} className="text-gray-300" />
                              <span className="text-[14px] font-bold text-gray-700">{itemsCount} products</span>
                            </div>
                          ) : (
                            <span className="text-gray-300">---</span>
                          )}
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap text-gray-400 font-bold text-[13px]">
                        <div className="flex items-center gap-2">
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
                      </motion.tr>
                    );
                  })
                ) : null}
                </AnimatePresence>
              </tbody>
            </table>
          ) : (
            currentPath.length > 0 ? (
          <div className="p-6">
            {(() => {
              const activeCatId = currentPath[currentPath.length - 1];
              const catProducts = products.filter(p =>
                p.categoryId === activeCatId &&
                (searchTerm ? p.name.toLowerCase().includes(searchTerm.toLowerCase()) : true)
              );

              if (catProducts.length === 0) {
                return (
                  <div className="py-20 text-center bg-gray-50/50 rounded-[32px] border-2 border-dashed border-gray-100">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-gray-200 shadow-sm">
                        <Diamond size={32} />
                      </div>
                      <div className="space-y-1">
                        <p className="text-gray-500 font-bold text-[15px]">No products found in this collection</p>
                        <p className="text-gray-400 text-[12px] font-medium">Add a new product to see it appear here</p>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {catProducts.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage).map((p) => (
                    <div key={p.id} className="group bg-white rounded-[28px] border border-gray-100 overflow-hidden hover:shadow-2xl hover:shadow-[#1BAFAF]/5 hover:-translate-y-1 transition-all duration-300 flex flex-col">
                      {/* Image Container */}
                      <div className="relative aspect-square overflow-hidden bg-gray-50">
                        {(() => {
                          const displayImage = p.image || p.imageUrl || (p.images && p.images.length > 0 ? p.images[0] : null);
                          return displayImage ? (
                            <img src={displayImage} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-200">
                              <Diamond size={48} strokeWidth={1} />
                            </div>
                          );
                        })()}
                        
                        {/* Status Badge */}
                        <div className="absolute top-4 left-4 z-10">
                           <span className={`text-[9px] font-bold uppercase tracking-[0.1em] px-2.5 py-1.5 rounded-lg backdrop-blur-md shadow-sm flex items-center gap-1.5 ${
                             p.isAvailable 
                               ? (Number(p.stock) <= 0 
                                   ? 'bg-rose-600 text-white' 
                                   : Number(p.stock) < Number(stockAlertThreshold) 
                                     ? 'bg-amber-500 text-white' 
                                     : 'bg-emerald-500/90 text-white')
                               : 'bg-gray-900/60 text-white'
                           }`}>
                             <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                               p.isAvailable 
                                 ? 'bg-white'
                                 : 'bg-gray-300'
                             }`} />
                             {p.isAvailable 
                               ? (Number(p.stock) <= 0 
                                   ? ((p.productType || '').toLowerCase() === 'unique' ? 'Sold Out' : 'Out Of Stock') 
                                   : Number(p.stock) < Number(stockAlertThreshold) 
                                     ? 'Low Stock' 
                                     : 'Active') 
                               : 'Archived'}
                           </span>
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="p-5 flex-1 flex flex-col gap-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest truncate max-w-[120px]" title={p.productId || '---'}>
                            UID: {p.productId || '---'}
                          </span>
                          <div className="flex flex-col items-end">
                            <span className="text-[16px] font-bold text-[#1BAFAF]">
                              ₹{Number(p.discountedPrice || p.price || 0).toLocaleString()}
                            </span>
                            {(p.actualPrice || p.costPrice) && (
                              <span className="text-[11px] text-gray-400 line-through">
                                ₹{Number(p.actualPrice || p.costPrice || 0).toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <h3 className="text-[17px] font-bold text-gray-900 leading-tight line-clamp-2 group-hover:text-[#1BAFAF] transition-colors">
                            {p.name}
                          </h3>
                          <p className="text-[12px] font-medium text-gray-400 line-clamp-1 italic">
                            {p.productType} • {p.description || 'Heritage Collection'}
                          </p>
                        </div>

                        <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-50">
                          <div className="flex flex-col">
                            <span className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">Inventory</span>
                            <span className={`text-[13px] font-bold flex items-center gap-1.5 ${
                              Number(p.stock) <= 0 
                                ? 'text-rose-600' 
                                : Number(p.stock) < Number(stockAlertThreshold) 
                                  ? 'text-amber-600' 
                                  : 'text-gray-700'
                            }`}>
                              {Number(p.stock) <= 0 ? (
                                (p.productType || '').toLowerCase() === 'unique' ? 'Sold Out' : 'Out Of Stock'
                              ) : Number(p.stock) < Number(stockAlertThreshold) ? (
                                <div className="flex items-center gap-1">
                                  <span>{p.stock} Units</span>
                                  <AlertTriangle size={13} className="text-amber-500 fill-amber-400 animate-subtle-bounce" />
                                </div>
                              ) : (
                                `${p.stock} Units`
                              )}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all active:scale-90" title="Edit Product">
                              <Pencil size={16} strokeWidth={2.5} />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all active:scale-90">
                              <MoreVertical size={16} strokeWidth={2.5} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
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

        {/* Pagination Footer */}
        <div className="flex items-center justify-end px-2 pt-1">
           <div className="flex items-center gap-2">
              <button 
                onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-[#1BAFAF] hover:bg-[#1BAFAF]/5 transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400"
              >
                <ChevronLeft size={16} strokeWidth={2.5} />
              </button>
              <span className="text-[12px] font-semibold text-gray-400">
                 Page {currentPage} of {(() => {
                   const totalItems = visibleCategories.length > 0 ? visibleCategories.length : (products.filter(p => p.categoryId === currentPath[currentPath.length - 1]).length);
                   return Math.ceil(totalItems / rowsPerPage) || 1;
                 })()}
              </span>
              <button 
                onClick={() => {
                   const totalItems = visibleCategories.length > 0 ? visibleCategories.length : (products.filter(p => p.categoryId === currentPath[currentPath.length - 1]).length);
                   if(currentPage < Math.ceil(totalItems / rowsPerPage)) setCurrentPage(currentPage + 1);
                }}
                disabled={(() => {
                   const totalItems = visibleCategories.length > 0 ? visibleCategories.length : (products.filter(p => p.categoryId === currentPath[currentPath.length - 1]).length);
                   return currentPage >= Math.ceil(totalItems / rowsPerPage);
                })()}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-[#1BAFAF] hover:bg-[#1BAFAF]/5 transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400"
              >
                <ChevronRight size={16} strokeWidth={2.5} />
              </button>
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
                      ? (currentPath.length > 0 ? 'Edit Sub Category' : 'Edit Category')
                      : (currentPath.length > 0 ? 'Add Sub Category' : 'Add Category')
                    }
                  </h2>
                  <p className="text-[12px] text-gray-400 font-medium">
                    {editingCategory
                      ? `Editing ${currentPath.length > 0 ? 'sub-layer' : 'main layer'} in heritage`
                      : `Adding a new layer under ${currentPath.length > 0 ? breadcrumbs.map(p => p.name).join(' > ') : 'Main'}`
                    }
                  </p>
                  {editingCategory && currentPath.length > 0 && (
                    <p className="text-[11px] text-[#1BAFAF] font-bold mt-1 bg-[#1BAFAF]/5 px-2.5 py-1 rounded-lg border border-[#1BAFAF]/10 w-fit">
                      Path: {breadcrumbs.map(p => p.name).join(' > ')}
                    </p>
                  )}
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
                      'Update'
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
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        itemName={categoryToDelete?.name}
        message={deleteMessage}
        loading={isDeleting}
      />
      <ProductFormModal 
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        initialCategoryId={currentPath.length > 0 ? currentPath[currentPath.length - 1] : null}
      />
    </div>
  );
}
