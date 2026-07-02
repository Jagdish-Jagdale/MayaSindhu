import React, { useState, useEffect, useRef } from 'react';
import { useAdminUI } from '../../../context/AdminUIContext';
import { db } from '../../../firebase';
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  deleteDoc,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import {
  Save,
  Plus,
  Image as ImageIcon,
  Trash2,
  Loader2,
  Layout,
  Camera,
  X,
  Pencil,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { uploadToCloudinary, deleteMultipleFromCloudinary, deleteFromCloudinary } from '../../../utils/cloudinary';
import DeleteConfirmationModal from '../../../components/admin/DeleteConfirmationModal';
import CustomSelect from '../../../components/common/CustomSelect';

export default function Banner() {
  const { isCollapsed } = useAdminUI();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [deletedBannerIds, setDeletedBannerIds] = useState([]);
  const [deletedImageUrls, setDeletedImageUrls] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const fileInputRef = useRef(null);
  const [editingBannerId, setEditingBannerId] = useState(null);
  const [pendingFiles, setPendingFiles] = useState({});  // bannerId -> File

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState(null);

  // Image preview state
  const [selectedBannerImage, setSelectedBannerImage] = useState(null);

  // Load Banners
  useEffect(() => {
    const q = query(collection(db, 'banners'), orderBy('order', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Check for order inconsistencies (duplicates or gaps)
      const orders = data.map(b => b.order);
      const isConsistent = data.length === 0 || (
        new Set(orders).size === data.length &&
        orders[0] === 1 &&
        orders[orders.length - 1] === data.length
      );

      if (!isConsistent) {
        const normalized = data.sort((a, b) => (a.order || 0) - (b.order || 0)).map((b, idx) => {
          const newOrder = idx + 1;
          return { ...b, order: newOrder, isModified: b.order !== newOrder };
        });
        setBanners(normalized);
        if (normalized.some(b => b.isModified)) setHasChanges(true);
      } else {
        setBanners(data);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    if (editingBannerId) {
      setPendingFiles(prev => ({ ...prev, [editingBannerId]: file }));
      setBanners(prev => prev.map(b =>
        b.id === editingBannerId
          ? { ...b, imageUrl: previewUrl, isModified: true }
          : b
      ));
    } else {
      const tempId = 'temp-' + Date.now();
      setPendingFiles(prev => ({ ...prev, [tempId]: file }));
      const newBanner = {
        id: tempId,
        imageUrl: previewUrl,
        order: banners.length + 1,
        isActive: true,
        isNew: true
      };
      setBanners(prev => [...prev, newBanner]);
    }
    setHasChanges(true);
    setEditingBannerId(null);
    e.target.value = null;
  };

  const removeBanner = (banner) => {
    setBannerToDelete(banner);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!bannerToDelete) return;

    // If it's a new (unsaved) banner, just remove from local state
    if (bannerToDelete.isNew) {
      setBanners(prev => prev.filter(b => b.id !== bannerToDelete.id));
      setIsDeleteModalOpen(false);
      setBannerToDelete(null);
      setHasChanges(true);
      return;
    }

    try {
      setIsDeleting(true);
      if (bannerToDelete.imageUrl?.includes('cloudinary')) {
        await deleteFromCloudinary(bannerToDelete.imageUrl);
      }
      await deleteDoc(doc(db, 'banners', bannerToDelete.id));

      setBanners(prev => {
        const remaining = prev.filter(b => b.id !== bannerToDelete.id);
        // Re-normalize orders to maintain 1, 2, 3... sequence
        return remaining.sort((a, b) => a.order - b.order).map((b, idx) => {
          const newOrder = idx + 1;
          if (b.order !== newOrder) {
            return { ...b, order: newOrder, isModified: b.isNew ? false : true };
          }
          return b;
        });
      });

      toast.success("Banner deleted and orders re-aligned");
      setIsDeleteModalOpen(false);
      setHasChanges(true); // Need to save if other orders were re-aligned
    } catch (err) {
      toast.error("Failed to delete banner");
    } finally {
      setIsDeleting(false);
      setBannerToDelete(null);
    }
  };

  const updateBannerOrder = (id, newOrder) => {
    const newVal = parseInt(newOrder);
    setBanners(prev => {
      const bannerToUpdate = prev.find(b => b.id === id);
      if (!bannerToUpdate) return prev;
      const oldVal = bannerToUpdate.order;

      return prev.map(b => {
        if (b.id === id) {
          return { ...b, order: newVal, isModified: true };
        }
        // Swap: If another banner has the newVal, give it the oldVal
        if (b.order === newVal) {
          return { ...b, order: oldVal, isModified: true };
        }
        return b;
      });
    });
    setHasChanges(true);
  };

  const updateBannerStatus = (id, isActive) => {
    setBanners(prev => prev.map(b =>
      b.id === id ? { ...b, isActive, isModified: true } : b
    ));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const batch = writeBatch(db);

      // Handle Deletions
      deletedBannerIds.forEach(id => {
        batch.delete(doc(db, 'banners', id));
      });

      // Upload pending images to Cloudinary
      const uploadedUrls = {};
      for (const [id, file] of Object.entries(pendingFiles)) {
        try {
          const url = await uploadToCloudinary(file, 'Banners');
          uploadedUrls[id] = url;
        } catch (err) {
          toast.error('Failed to upload banner image');
          setIsSaving(false);
          return;
        }
      }

      // Handle Adds and Updates
      banners.forEach(banner => {
        const finalImageUrl = uploadedUrls[banner.id] || banner.imageUrl;
        if (banner.isNew) {
          const docRef = doc(collection(db, 'banners'));
          batch.set(docRef, {
            imageUrl: finalImageUrl,
            order: banner.order || 0,
            isActive: banner.isActive !== undefined ? banner.isActive : true,
            createdAt: serverTimestamp()
          });
        } else if (banner.isModified) {
          const docRef = doc(db, 'banners', banner.id);
          batch.update(docRef, {
            imageUrl: finalImageUrl,
            order: banner.order || 0,
            isActive: banner.isActive !== undefined ? banner.isActive : true,
            updatedAt: serverTimestamp()
          });
        }
      });

      await batch.commit();

      // Delete images from Cloudinary (best-effort)
      if (deletedImageUrls.length > 0) {
        deleteMultipleFromCloudinary(deletedImageUrls);
      }

      setDeletedBannerIds([]);
      setDeletedImageUrls([]);
      setPendingFiles({});
      setHasChanges(false);
      toast.success("Banners updated successfully");
    } catch (err) {
      toast.error("Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] w-full flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#1BAFAF]" />
        <p className="text-[14px] font-medium text-gray-400">Loading banner configurations...</p>
      </div>
    );
  }

  return (
    <div className={`mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 transition-all duration-300 ${isCollapsed ? 'max-w-[1600px]' : 'max-w-[1280px]'}`} style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}>

      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />

      {/* Header Section */}
      <div className="space-y-2 py-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-[22px] font-semibold text-gray-900 tracking-tight">Banner Configuration</h1>
            <p className="text-[12px] text-gray-400 font-medium font-inter tracking-tight">Manage the cinematic hero slider on your homepage.</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
              TOTAL RECORDS: {banners.length}
            </span>
            <span className="text-gray-200 text-sm">|</span>
            <div className="flex items-center gap-3">
              {hasChanges && (
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 bg-[#1BAFAF] hover:bg-[#17a0a0] text-white px-5 py-2.5 rounded-xl text-[13px] font-bold transition-all shadow-sm shadow-[#1BAFAF]/10 active:scale-95 disabled:opacity-50"
                >
                  {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} strokeWidth={2.5} />}
                  Save Changes
                </button>
              )}
              <button
                onClick={() => { setEditingBannerId(null); fileInputRef.current?.click(); }}
                className="flex items-center gap-2 bg-[#1BAFAF] hover:bg-[#17a0a0] text-white px-5 py-2.5 rounded-xl text-[13px] font-bold transition-all shadow-sm shadow-[#1BAFAF]/10 active:scale-95 group"
              >
                <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" strokeWidth={2.5} />
                Add Banner
              </button>
            </div>
          </div>
        </div>
        <hr className="border-gray-100" />
      </div>

      {banners.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-[24px] p-8 shadow-sm">
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="w-16 h-16 bg-[#eaf6f6] rounded-2xl flex items-center justify-center text-[#1BAFAF]">
              <Layout size={32} />
            </div>
            <div>
              <h3 className="text-[18px] font-bold text-gray-900">No Banners Configured</h3>
              <p className="text-[14px] text-gray-400 max-w-sm mx-auto">
                Add images to display in the cinematic slider on your homepage header.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm">
          <div>
            <div>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-6 py-2 text-[13px] font-bold text-[#1BAFAF] uppercase tracking-wider w-20 whitespace-nowrap">Sr No</th>
                    <th className="px-4 py-2 text-[13px] font-bold text-[#1BAFAF] uppercase tracking-wider w-48">Banner Image</th>
                    <th className="px-4 py-2 text-[13px] font-bold text-[#1BAFAF] uppercase tracking-wider w-32 whitespace-nowrap text-center">Banner Position</th>
                    <th className="px-4 py-2 text-[13px] font-bold text-[#1BAFAF] uppercase tracking-wider w-28 whitespace-nowrap">Status</th>
                    <th className="px-6 py-2 text-[13px] font-bold text-[#1BAFAF] uppercase tracking-wider text-right w-24 whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50/50">
                  {banners.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage).map((banner, idx) => (
                    <tr key={banner.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-2 text-[14px] font-medium text-gray-400">
                        {(idx + 1).toString().padStart(2, '0')}
                      </td>
                      <td className="px-4 py-2">
                        <div
                          onClick={() => setSelectedBannerImage(banner.imageUrl)}
                          className="relative w-32 aspect-[21/9] rounded-xl overflow-hidden bg-gray-100 border border-gray-100 cursor-pointer hover:scale-105 transition-transform duration-300 shadow-sm hover:shadow"
                        >
                          <img src={banner.imageUrl} alt="Banner" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                            <ImageIcon size={16} className="text-white opacity-60" />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2 text-center">
                        <div className="flex justify-center">
                          <CustomSelect
                            value={banner.order}
                            onChange={(val) => updateBannerOrder(banner.id, val)}
                            options={banners.map((_, i) => ({ value: i + 1, label: (i + 1).toString() }))}
                            className="w-16"
                            minimal={true}
                            align="center"
                          />
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <CustomSelect
                          value={banner.isActive !== false}
                          onChange={(val) => updateBannerStatus(banner.id, val)}
                          options={[
                            { value: true, label: 'ACTIVE' },
                            { value: false, label: 'DEACTIVE' }
                          ]}
                          className="w-28"
                          minimal={true}
                          align="left"
                        />
                      </td>
                      <td className="px-6 py-2 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => { setEditingBannerId(banner.id); fileInputRef.current?.click(); }}
                            className="w-8 h-8 flex items-center justify-center text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-all active:scale-95"
                            title="Change Image"
                          >
                            <Pencil size={14} strokeWidth={2.5} />
                          </button>
                          <button
                            onClick={() => removeBanner(banner)}
                            className="w-8 h-8 flex items-center justify-center text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-all active:scale-95"
                            title="Delete Banner"
                          >
                            <Trash2 size={14} strokeWidth={2.5} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Pagination Footer */}
      <div className="flex items-center justify-end px-2 pt-1">
        <div className="flex items-center gap-2">
          <button
            onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-[#1BAFAF] hover:bg-[#1BAFAF]/5 transition-all disabled:opacity-30"
          >
            <ChevronLeft size={16} strokeWidth={2.5} />
          </button>
          <span className="text-[12px] font-semibold text-gray-400">
            Page {currentPage} of {Math.ceil(banners.length / rowsPerPage) || 1}
          </span>
          <button
            onClick={() => currentPage < Math.ceil(banners.length / rowsPerPage) && setCurrentPage(currentPage + 1)}
            disabled={currentPage >= Math.ceil(banners.length / rowsPerPage)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-[#1BAFAF] hover:bg-[#1BAFAF]/5 transition-all disabled:opacity-30"
          >
            <ChevronRight size={16} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        itemName="this banner slide"
        loading={isDeleting}
      />

      {/* Full Image Preview Modal */}
      {selectedBannerImage && (
        <div
          className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300" onClick={(e) => { if (e.target === e.currentTarget) { const closeFn = () => setSelectedBannerImage(null); closeFn(); } }}
          onClick={() => setSelectedBannerImage(null)}
        >
          <div
            className="relative max-w-7xl w-full max-h-[90vh] bg-white p-2 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedBannerImage(null)}
              className="absolute -top-3 -right-3 w-8 h-8 bg-white hover:bg-gray-100 text-gray-800 hover:text-gray-900 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-90 z-[310] border border-gray-100"
            >
              <X size={16} strokeWidth={2.5} />
            </button>
            <img
              src={selectedBannerImage}
              alt="Banner Full Size"
              className="w-full max-h-[85vh] object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
