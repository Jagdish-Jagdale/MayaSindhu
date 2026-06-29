/**
 * File: ArtisanBlooms.jsx
 * Description: Admin configuration manager page handling curated realms lists, banner uploads, workshops setup, and text disclaimers.
 * Work Done: Integrated baseline UI layouts, state boundaries, CSS theme styling, and routing pathways.
 */

import React, { useState, useEffect, useRef } from 'react';
import { useAdminUI } from '../../../context/AdminUIContext';
import { db } from '../../../firebase';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  doc, 
  serverTimestamp,
  deleteDoc,
  updateDoc,
  setDoc
} from 'firebase/firestore';
import { 
  Pencil, 
  Plus, 
  Trash2, 
  Loader2, 
  Camera,
  Layout,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Search,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { uploadToCloudinary, deleteMultipleFromCloudinary } from '../../../utils/cloudinary';
import DeleteConfirmationModal from '../../../components/admin/DeleteConfirmationModal';

export default function ArtisanBlooms() {
  const { isCollapsed } = useAdminUI();
  const [trends, setTrends] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [prodsLoading, setProdsLoading] = useState(true);

  // Search, Filter, and Pagination States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'with_products', 'no_products'
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 3;

  // Add / Edit Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [modalTrend, setModalTrend] = useState(null); // null means Add, otherwise editing trend object
  const [modalTitle, setModalTitle] = useState('');
  const [modalDescription, setModalDescription] = useState('');
  const [modalFile, setModalFile] = useState(null);
  const [modalPreviewUrl, setModalPreviewUrl] = useState('');
  const [modalProductIds, setModalProductIds] = useState([]);
  const [modalSearchQuery, setModalSearchQuery] = useState('');
  const [modalSearchActive, setModalSearchActive] = useState(false);
  const [isModalSaving, setIsModalSaving] = useState(false);
  const modalFileInputRef = useRef(null);
  const modalSearchRef = useRef(null);

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [trendToDelete, setTrendToDelete] = useState(null);

  // Reset page when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterType]);

  // Load Products
  useEffect(() => {
    const q = query(collection(db, 'products'), orderBy('name', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAllProducts(data);
      setProdsLoading(false);
    }, (error) => {
      setProdsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Click outside to close modal product dropdown
  useEffect(() => {
    const handleModalClickOutside = (e) => {
      if (modalSearchRef.current && !modalSearchRef.current.contains(e.target)) {
        setModalSearchActive(false);
      }
    };
    document.addEventListener('mousedown', handleModalClickOutside);
    return () => document.removeEventListener('mousedown', handleModalClickOutside);
  }, []);

  // Load Trends
  useEffect(() => {
    const q = query(collection(db, 'shopByTrend'), orderBy('order', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTrends(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Open modal for Adding
  const handleOpenAdd = () => {
    if (trends.length >= 8) {
      toast.error("Only 8 entries are valid for trend configurations");
      return;
    }
    setModalTrend(null);
    setModalTitle('');
    setModalDescription('');
    setModalFile(null);
    setModalPreviewUrl('');
    setModalProductIds([]);
    setModalSearchQuery('');
    setModalSearchActive(false);
    setIsFormModalOpen(true);
  };

  // Open modal for Editing
  const handleOpenEdit = (trend) => {
    setModalTrend(trend);
    setModalTitle(trend.title || '');
    setModalDescription(trend.description || '');
    setModalFile(null);
    setModalPreviewUrl(trend.imageUrl || '');
    setModalProductIds(trend.productIds || []);
    setModalSearchQuery('');
    setModalSearchActive(false);
    setIsFormModalOpen(true);
  };

  // Select file inside Modal
  const handleModalFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file");
      return;
    }
    setModalFile(file);
    setModalPreviewUrl(URL.createObjectURL(file));
  };

  // Submit modal form
  const handleModalSubmit = async (e) => {
    e.preventDefault();
    if (!modalPreviewUrl) {
      toast.error("Please select a spotlight image");
      return;
    }

    setIsModalSaving(true);
    try {
      let finalImageUrl = modalPreviewUrl;

      // If a new file was chosen, upload to Cloudinary
      if (modalFile) {
        finalImageUrl = await uploadToCloudinary(modalFile, 'ShopByTrend');
      }

      if (modalTrend) {
        // Edit Mode: update Firestore directly
        const docRef = doc(db, 'shopByTrend', modalTrend.id);
        
        // Delete old image if new image was uploaded (optional/best-effort)
        if (modalFile && modalTrend.imageUrl && modalTrend.imageUrl.includes('res.cloudinary.com')) {
          try {
            await deleteMultipleFromCloudinary([modalTrend.imageUrl]);
          } catch(err) {
          }
        }

        await updateDoc(docRef, {
          title: modalTitle,
          description: modalDescription,
          imageUrl: finalImageUrl,
          productIds: modalProductIds,
          updatedAt: serverTimestamp()
        });
        toast.success("Trend updated successfully");
      } else {
        // Add Mode: create new doc in Firestore
        const docRef = doc(collection(db, 'shopByTrend'));
        await setDoc(docRef, {
          title: modalTitle,
          description: modalDescription,
          imageUrl: finalImageUrl,
          productIds: modalProductIds,
          order: trends.length,
          createdAt: serverTimestamp()
        });
        toast.success("Trend added successfully");
      }
      setIsFormModalOpen(false);
    } catch (err) {
      toast.error("Failed to save trend configuration");
    } finally {
      setIsModalSaving(false);
    }
  };

  const removeTrend = (trend) => {
    setTrendToDelete(trend);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!trendToDelete) return;

    try {
      setIsDeleting(true);
      if (trendToDelete.imageUrl && trendToDelete.imageUrl.includes('res.cloudinary.com')) {
        await deleteMultipleFromCloudinary([trendToDelete.imageUrl]);
      }
      await deleteDoc(doc(db, 'shopByTrend', trendToDelete.id));
      toast.success("Trend card deleted");
      setIsDeleteModalOpen(false);
    } catch (err) {
      toast.error("Failed to delete trend card");
    } finally {
      setIsDeleting(false);
      setTrendToDelete(null);
    }
  };

  if (loading || prodsLoading) {
    return (
      <div className="h-[60vh] w-full flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#1BAFAF]" />
        <p className="text-[14px] font-medium text-gray-400">Loading trends...</p>
      </div>
    );
  }

  // Filtered and Paginated Trends
  const filteredTrends = trends.filter(trend => {
    const matchesSearch = 
      (trend.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (trend.description || '').toLowerCase().includes(searchTerm.toLowerCase());
      
    const hasProducts = trend.productIds && trend.productIds.length > 0;
    const matchesFilter = 
      filterType === 'all' ||
      (filterType === 'with_products' && hasProducts) ||
      (filterType === 'no_products' && !hasProducts);
      
    return matchesSearch && matchesFilter;
  });

  const paginatedTrends = filteredTrends.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
  const totalPages = Math.ceil(filteredTrends.length / rowsPerPage) || 1;

  return (
    <div className={`mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 transition-all duration-300 ${isCollapsed ? 'max-w-[1600px]' : 'max-w-[1280px]'}`} style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}>
      
      {/* Header Section */}
      <div className="space-y-4 py-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-[22px] font-semibold text-gray-900 tracking-tight">Shop by Trend</h1>
            <p className="text-[12px] text-gray-400 font-medium tracking-tight font-inter">Configure the artisan collections and trending spotlights for the horizontal homepage slider.</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleOpenAdd}
              disabled={trends.length >= 8}
              className="flex items-center gap-2 border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent text-gray-900 px-5 py-2.5 rounded-xl text-[13px] font-semibold transition-all active:scale-95 cursor-pointer"
            >
              <Plus size={16} strokeWidth={2.5} />
              Add Trend Card
            </button>
          </div>
        </div>
        <hr className="border-gray-100" />
      </div>

      {/* Action Bar (Search & Filter) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
        <div className="relative group w-full sm:max-w-[480px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-[#1BAFAF] transition-colors" />
          <input
            type="text"
            placeholder="Search trends by title or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50 border-none py-2 pl-10 pr-4 text-[13px] rounded-xl outline-none focus:bg-white transition-all font-medium"
          />
        </div>
        <div className="flex items-center gap-3 pr-2 w-full sm:w-auto">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full sm:w-44 bg-gray-50 border-none py-2 px-3 text-[13px] rounded-xl outline-none focus:bg-white transition-all font-semibold text-gray-600 cursor-pointer"
          >
            <option value="all">Show All</option>
            <option value="with_products">With Products</option>
            <option value="no_products">No Products</option>
          </select>
        </div>
      </div>

      {trends.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm">
          <div className="flex flex-col items-center justify-center py-24 text-center space-y-6">
            <div className="w-20 h-20 bg-[#eaf6f6] rounded-[2rem] flex items-center justify-center text-[#1BAFAF]">
              <Layout size={36} />
            </div>
            <div className="space-y-2">
              <h3 className="text-[20px] font-bold text-gray-900 uppercase tracking-widest">No Trends Configured</h3>
              <p className="text-[14px] text-gray-400 max-w-sm mx-auto font-medium">
                Create circular spotlight cards to showcase your trending artisanal collections on the homepage.
              </p>
            </div>
            <button 
              onClick={handleOpenAdd}
              className="px-8 py-3 bg-[#1BAFAF] text-white text-[13px] font-bold rounded-2xl hover:bg-[#17a0a0] transition-all shadow-xl shadow-[#1BAFAF]/20 active:scale-95 flex items-center gap-2"
            >
              <Plus size={18} strokeWidth={3} />
              Create First Trend
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white rounded-[22px] border border-gray-100 shadow-sm overflow-x-auto custom-scrollbar pb-8">
            {filteredTrends.length > 0 ? (
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-50 bg-white text-[#1BAFAF]">
                    <th className="px-6 py-4 text-left text-[14px] font-bold w-24 whitespace-nowrap">Sr No</th>
                    <th className="px-6 py-4 text-left text-[14px] font-bold w-28">Image</th>
                    <th className="px-6 py-4 text-left text-[14px] font-bold w-80">Details</th>
                    <th className="px-6 py-4 text-left text-[14px] font-bold">Trending Products</th>
                    <th className="px-6 py-4 text-center text-[14px] font-bold w-32">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50/50">
                  {paginatedTrends.map((trend, index) => (
                    <tr key={trend.id} className="hover:bg-gray-50 transition-all duration-200 animate-in fade-in duration-300">
                      {/* Sr No */}
                      <td className="px-6 py-4 whitespace-nowrap text-[14px] text-gray-400 font-medium w-24">
                        {((currentPage - 1) * rowsPerPage + index + 1).toString().padStart(2, '0')}
                      </td>
                      
                      {/* Image cell */}
                      <td className="px-6 py-4 whitespace-nowrap align-top">
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-gray-100 flex items-center justify-center bg-gray-50 shadow-inner">
                          <img src={trend.imageUrl} className="w-full h-full object-contain" alt="" />
                        </div>
                      </td>

                      {/* Details cell */}
                      <td className="px-6 py-4 align-top max-w-xs">
                        <div className="font-bold text-gray-900 text-[14px]">{trend.title}</div>
                        <div className="text-gray-500 text-[12px] font-medium mt-1 leading-relaxed line-clamp-3">
                          {trend.description}
                        </div>
                      </td>

                      {/* Trending Products cell */}
                      <td className="px-6 py-4 align-top">
                        <div className="grid grid-cols-4 gap-2 max-w-[400px]">
                          {(trend.productIds || []).map(prodId => {
                            const product = allProducts.find(p => p.id === prodId);
                            if (!product) return null;
                            return (
                              <div 
                                key={prodId} 
                                className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 rounded-lg p-1 text-[11px] font-semibold text-gray-800"
                                title={product.name}
                              >
                                <img 
                                  src={product.image || product.imageUrl || product.images?.[0] || ''} 
                                  className="w-5 h-5 rounded object-cover flex-shrink-0" 
                                  alt="" 
                                />
                                <span className="truncate">{product.name}</span>
                              </div>
                            );
                          })}
                        </div>
                        {(trend.productIds || []).length === 0 && (
                          <span className="text-[11px] text-gray-400 italic">No products selected yet.</span>
                        )}
                      </td>

                      {/* Actions cell */}
                      <td className="px-6 py-4 whitespace-nowrap text-center align-top">
                        <div className="flex items-center justify-center gap-2.5">
                          <button
                            onClick={() => handleOpenEdit(trend)}
                            className="w-8 h-8 flex items-center justify-center text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all active:scale-90 cursor-pointer"
                            title="Edit Details"
                          >
                            <Pencil size={15} />
                          </button>
                          <button 
                            onClick={() => removeTrend(trend)}
                            className="w-8 h-8 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-lg transition-all active:scale-95 cursor-pointer"
                            title="Remove Card"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-12 text-center text-gray-400 font-medium">
                No matching trend configurations found.
              </div>
            )}
          </div>

          {/* Pagination Footer */}
          <div className="flex items-center justify-between px-2 pt-1">
            <span className="text-[12px] font-bold text-gray-400 tracking-wide">
              {trends.length} / 8 Trend Cards Configured
            </span>
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-[#1BAFAF] hover:bg-[#1BAFAF]/5 transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400 cursor-pointer"
                >
                  <ChevronLeft size={16} strokeWidth={2.5} />
                </button>
                <span className="text-[12px] font-semibold text-gray-400">
                   Page {currentPage} of {totalPages}
                </span>
                <button 
                  onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-[#1BAFAF] hover:bg-[#1BAFAF]/5 transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400 cursor-pointer"
                >
                  <ChevronRight size={16} strokeWidth={2.5} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Trend Form Modal (Add / Edit) */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {modalTrend ? 'Edit Trend Card' : 'Add Trend Card'}
                </h2>
                <p className="text-[12px] text-gray-400 font-medium">
                  {modalTrend ? 'Update the details and products for this trend' : 'Create a new circular spotlight card for the home page'}
                </p>
              </div>
              <button 
                onClick={() => setIsFormModalOpen(false)} 
                className="p-2 hover:bg-gray-50 rounded-xl transition-colors text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form Scroll Area */}
            <form onSubmit={handleModalSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
              {/* Image Upload Area */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block ml-1">Spotlight Image</label>
                <div className="flex items-center gap-4 bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-4">
                  {modalPreviewUrl ? (
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-gray-200 flex items-center justify-center bg-white shadow-sm shrink-0">
                      <img src={modalPreviewUrl} className="w-full h-full object-contain" alt="" />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-300 shrink-0">
                      <Camera size={24} />
                    </div>
                  )}
                  <div className="flex-1 space-y-1">
                    <p className="text-[12px] font-bold text-gray-700">Select Image File</p>
                    <p className="text-[10px] text-gray-400 font-semibold">JPG, PNG, or WEBP formats</p>
                    <button
                      type="button"
                      onClick={() => modalFileInputRef.current?.click()}
                      className="text-[12px] font-bold text-[#1BAFAF] hover:text-[#17a0a0] transition-colors cursor-pointer"
                    >
                      {modalPreviewUrl ? 'Change Image' : 'Upload Image'}
                    </button>
                    <input 
                      type="file" 
                      ref={modalFileInputRef} 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleModalFileSelect} 
                    />
                  </div>
                </div>
              </div>

              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block ml-1">Trend Title</label>
                <input
                  type="text"
                  value={modalTitle}
                  onChange={(e) => setModalTitle(e.target.value)}
                  placeholder="e.g. Diwali Celebration"
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-[#1BAFAF] focus:bg-white p-3.5 rounded-2xl outline-none transition-all font-bold text-gray-800 text-[13px]"
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block ml-1">Narrative Description</label>
                <textarea
                  rows={3}
                  value={modalDescription}
                  onChange={(e) => setModalDescription(e.target.value)}
                  placeholder="Describe the aesthetic and style..."
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-[#1BAFAF] focus:bg-white p-3.5 rounded-2xl outline-none transition-all font-medium text-gray-600 text-[12px] resize-none leading-relaxed"
                  required
                />
              </div>

              {/* Trending Products Selection inside Modal */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block ml-1">Trending Products</label>
                
                {/* Selected badges in Modal */}
                <div className="flex flex-wrap gap-2 max-h-[100px] overflow-y-auto py-1">
                  {modalProductIds.map(prodId => {
                    const product = allProducts.find(p => p.id === prodId);
                    if (!product) return null;
                    return (
                      <div key={prodId} className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 rounded-lg pl-1.5 pr-2 py-1 text-[11px] font-semibold text-gray-800">
                        <img 
                          src={product.image || product.imageUrl || product.images?.[0] || ''} 
                          className="w-4 h-4 rounded object-cover" 
                          alt="" 
                        />
                        <span className="truncate max-w-[80px]">{product.name}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setModalProductIds(prev => prev.filter(id => id !== prodId));
                          }}
                          className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer flex items-center justify-center"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    );
                  })}
                  {modalProductIds.length === 0 && (
                    <span className="text-[11px] text-gray-400 italic ml-1">No products selected yet.</span>
                  )}
                </div>

                {/* Search and Add Dropdown */}
                <div 
                  ref={modalSearchRef}
                  className="relative"
                >
                  <div className="relative">
                    <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="text"
                      placeholder="Search products to add..."
                      value={modalSearchQuery}
                      onChange={(e) => {
                        setModalSearchQuery(e.target.value);
                        setModalSearchActive(true);
                      }}
                      onFocus={() => setModalSearchActive(true)}
                      className="w-full bg-gray-50 border-none pl-8 pr-8 py-2 text-[11px] font-bold text-gray-900 rounded-xl focus:ring-2 focus:ring-[#1BAFAF]/20 focus:bg-white transition-all outline-none font-inter"
                    />
                    {modalSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setModalSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>

                  {/* Dropdown Results */}
                  {modalSearchActive && (
                    (() => {
                      const queryStr = modalSearchQuery.trim().toLowerCase();
                      const eligibleProducts = allProducts.filter(p => 
                        !modalProductIds.includes(p.id) &&
                        (queryStr === '' || p.name.toLowerCase().includes(queryStr))
                      );

                      if (eligibleProducts.length === 0) return null;

                      return (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden py-1 max-h-[150px] overflow-y-auto custom-scrollbar">
                          {eligibleProducts.slice(0, 10).map(product => (
                            <button
                              key={product.id}
                              type="button"
                              onClick={() => {
                                setModalProductIds(prev => [...prev, product.id]);
                                setModalSearchQuery('');
                                setModalSearchActive(false);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 transition-all text-left group"
                            >
                              <div className="w-6 h-6 rounded bg-gray-50 overflow-hidden flex-shrink-0">
                                <img src={product.image || product.imageUrl || product.images?.[0] || ''} className="w-full h-full object-cover" alt="" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[11px] font-bold text-gray-900 truncate group-hover:text-[#1BAFAF] transition-colors">{product.name}</p>
                                <p className="text-[9px] text-gray-400 font-semibold">₹{(product.discountedPrice || product.price || 0).toLocaleString('en-IN')}</p>
                              </div>
                              <Plus size={12} className="text-gray-300 group-hover:text-[#1BAFAF]" />
                            </button>
                          ))}
                        </div>
                      );
                    })()
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="flex-1 px-4 py-3 rounded-2xl text-[13px] font-bold text-gray-400 hover:bg-gray-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isModalSaving}
                  className="flex-1 bg-[#1BAFAF] hover:bg-[#17a0a0] disabled:opacity-50 text-white px-4 py-3 rounded-2xl text-[13px] font-bold transition-all shadow-lg shadow-[#1BAFAF]/20 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isModalSaving ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : modalTrend ? (
                    'Update'
                  ) : (
                    'Add Trend'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        itemName={trendToDelete?.title || 'this trend card'}
        loading={isDeleting}
      />
    </div>
  );
}
