import React, { useState, useEffect, useRef } from 'react';
import { useAdminUI } from '../../../context/AdminUIContext';
import { db } from '../../../firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  doc, 
  serverTimestamp,
  writeBatch,
  deleteDoc
} from 'firebase/firestore';
import { 
  Save, 
  Plus, 
  Trash2, 
  Loader2, 
  Camera,
  Layout,
  Video,
  Image as  ImageIcon,
  Search,
  Repeat
} from 'lucide-react';
import toast from 'react-hot-toast';
import { uploadToCloudinary, deleteMultipleFromCloudinary, deleteFromCloudinary } from '../../../utils/cloudinary';
import DeleteConfirmationModal from '../../../components/admin/DeleteConfirmationModal';

export default function Stories() {
  const { isCollapsed } = useAdminUI();
  const [looks, setLooks] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [flippedLooks, setFlippedLooks] = useState(new Set());

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [lookToDelete, setLookToDelete] = useState(null);

  const toggleFlip = (id) => {
    setFlippedLooks(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const [deletedIds, setDeletedIds] = useState([]);
  const [deletedImageUrls, setDeletedImageUrls] = useState([]);
  
  const [editingLookId, setEditingLookId] = useState(null);
  const [editingType, setEditingType] = useState(null); // 'thumbnail', 'productImage', or 'video'
  const [productSearch, setProductSearch] = useState('');
  const [activeProductSearchId, setActiveProductSearchId] = useState(null);
  
  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const [pendingFiles, setPendingFiles] = useState({});  // lookId_type -> File

  // Load Looks and Products
  useEffect(() => {
    const qStories = query(collection(db, 'shopTheLook'), orderBy('order', 'asc'));
    const unsubscribeStories = onSnapshot(qStories, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setLooks(data);
      setLoading(false);
      setHasChanges(false);
      setDeletedIds([]);
    }, (error) => {
      console.error(error);
      setLoading(false);
      toast.error("Failed to load stories");
    });

    const qProducts = query(collection(db, 'products'), orderBy('name', 'asc'));
    const unsubscribeProducts = onSnapshot(qProducts, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAllProducts(data);
    });

    return () => {
      unsubscribeStories();
      unsubscribeProducts();
    };
  }, []);

  // Handle click outside search dropdown
  useEffect(() => {
    if (!activeProductSearchId) return;

    const handleOutsideClick = (e) => {
      const activeInput = document.querySelector(`[data-search-input="${activeProductSearchId}"]`);
      const dropdowns = document.querySelectorAll('.search-dropdown');
      
      let clickedInside = false;
      if (activeInput && activeInput.contains(e.target)) {
        clickedInside = true;
      }
      dropdowns.forEach(dropdown => {
        if (dropdown.contains(e.target)) {
          clickedInside = true;
        }
      });

      if (!clickedInside) {
        setActiveProductSearchId(null);
        setProductSearch('');
      }
    };

    const timeoutId = setTimeout(() => {
      document.addEventListener('click', handleOutsideClick);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [activeProductSearchId]);

  const handleFileSelect = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate type
    if (type === 'video') {
      if (!file.type.startsWith('video/')) {
        toast.error("Please select a video file");
        return;
      }
    } else {
      if (!file.type.startsWith('image/')) {
        toast.error("Please select an image file");
        return;
      }
    }

    const previewUrl = URL.createObjectURL(file);
    const targetType = type || editingType;
    
    if (editingLookId) {
      const fileKey = `${editingLookId}_${targetType}`;
      setPendingFiles(prev => ({ ...prev, [fileKey]: file }));
      setLooks(prev => prev.map(l => 
        l.id === editingLookId 
          ? { ...l, [targetType]: previewUrl, isModified: true } 
          : l
      ));
    } else {
      const tempId = 'temp-' + Date.now();
      setPendingFiles(prev => ({ 
        ...prev, 
        [`${tempId}_${targetType}`]: file
      }));
      const newLook = {
        id: tempId,
        title: '',
        category: '',
        url: targetType === 'video' ? previewUrl : '',
        thumbnail: targetType === 'thumbnail' ? previewUrl : '',
        productImage: targetType === 'productImage' ? previewUrl : '',
        order: looks.length,
        isNew: true
      };
      setLooks(prev => [...prev, newLook]);
    }
    setHasChanges(true);
    setEditingLookId(null);
    setEditingType(null);
    e.target.value = null;
  };

  const triggerEditMedia = (id, type) => {
    setEditingLookId(id);
    setEditingType(type);
    if (type === 'video') {
      videoInputRef.current?.click();
    } else {
      fileInputRef.current?.click();
    }
  };

  const triggerAdd = () => {
    setEditingLookId(null);
    setEditingType('video');
    videoInputRef.current?.click();
  };

  const updateField = (id, field, value) => {
    setLooks(prev => prev.map(l => 
      l.id === id ? { ...l, [field]: value, isModified: true } : l
    ));
    setHasChanges(true);
  };

  const removeLook = (look) => {
    setLookToDelete(look);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!lookToDelete) return;
    
    // If it's a new (unsaved) look, just remove from local state
    if (lookToDelete.isNew) {
      setLooks(prev => prev.filter(l => l.id !== lookToDelete.id));
      setIsDeleteModalOpen(false);
      setLookToDelete(null);
      setHasChanges(true);
      return;
    }

    try {
      setIsDeleting(true);
      
      // Track Cloudinary URLs for cleanup
      const urls = [lookToDelete.thumbnail, lookToDelete.productImage, lookToDelete.url].filter(u => u && u.includes('res.cloudinary.com'));
      if (urls.length > 0) {
        await deleteMultipleFromCloudinary(urls);
      }
      
      await deleteDoc(doc(db, 'shopTheLook', lookToDelete.id));
      setLooks(prev => prev.filter(l => l.id !== lookToDelete.id));
      toast.success("Story deleted");
      setIsDeleteModalOpen(false);
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete story");
    } finally {
      setIsDeleting(false);
      setLookToDelete(null);
      setHasChanges(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const batch = writeBatch(db);

      // Handle Deletions
      deletedIds.forEach(id => {
        batch.delete(doc(db, 'shopTheLook', id));
      });

      // Upload pending files to Cloudinary
      const uploadedUrls = {};
      for (const [key, file] of Object.entries(pendingFiles)) {
        try {
          const url = await uploadToCloudinary(file, 'Stories');
          uploadedUrls[key] = url;
        } catch (err) {
          toast.error(`Failed to upload ${file.type.startsWith('video/') ? 'video' : 'image'}`);
          setIsSaving(false);
          return;
        }
      }

      // Handle Adds and Updates
      looks.forEach((look, index) => {
        const thumbUrl = uploadedUrls[`${look.id}_thumbnail`] || look.thumbnail;
        const prodImgUrl = uploadedUrls[`${look.id}_productImage`] || look.productImage;
        const videoUrl = uploadedUrls[`${look.id}_video`] || look.url;

        const data = {
          title: look.title || '',
          category: look.category || '',
          url: videoUrl || '',
          thumbnail: thumbUrl || '',
          productImage: prodImgUrl || '',
          productId: look.productId || '',
          order: index,
        };

        if (look.isNew) {
          const docRef = doc(collection(db, 'shopTheLook'));
          batch.set(docRef, {
            ...data,
            createdAt: serverTimestamp()
          });
        } else if (look.isModified) {
          const docRef = doc(db, 'shopTheLook', look.id);
          batch.update(docRef, {
            ...data,
            updatedAt: serverTimestamp()
          });
        }
      });

      await batch.commit();

      // Delete from Cloudinary (best-effort)
      if (deletedImageUrls.length > 0) {
        deleteMultipleFromCloudinary(deletedImageUrls);
      }

      setDeletedIds([]);
      setDeletedImageUrls([]);
      setPendingFiles({});
      setHasChanges(false);
      toast.success("Stories configuration saved");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] w-full flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#1BAFAF]" />
        <p className="text-[14px] font-medium text-gray-400">Loading stories...</p>
      </div>
    );
  }

  return (
    <div className={`mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 transition-all duration-300 ${isCollapsed ? 'max-w-[1600px]' : 'max-w-[1280px]'}`} style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}>
      
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileSelect(e)} />
      <input type="file" ref={videoInputRef} className="hidden" accept="video/*" onChange={(e) => handleFileSelect(e, 'video')} />

      {/* Header Section */}
      <div className="space-y-4 py-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-[22px] font-semibold text-gray-900 tracking-tight">Shop the Look</h1>
            <p className="text-[12px] text-gray-400 font-medium font-inter tracking-tight">Manage your cinematic video chronicles and product narratives for the homepage.</p>
          </div>
          <div className="flex items-center gap-3">
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
            <button 
              onClick={triggerAdd}
              className="flex items-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-900 px-5 py-2.5 rounded-xl text-[13px] font-semibold transition-all active:scale-95"
            >
              <Plus size={16} strokeWidth={2.5} />
              Add New Story
            </button>
          </div>
        </div>
        <hr className="border-gray-100" />
      </div>

      {looks.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm">
          <div className="flex flex-col items-center justify-center py-24 text-center space-y-6">
            <div className="w-20 h-20 bg-[#eaf6f6] rounded-[2rem] flex items-center justify-center text-[#1BAFAF]">
              <Video size={36} />
            </div>
            <div className="space-y-2">
              <h3 className="text-[20px] font-bold text-gray-900 uppercase tracking-widest">No Stories Found</h3>
              <p className="text-[14px] text-gray-400 max-w-sm mx-auto font-medium">Add video chronicles to showcase the movement and texture of your artisanal collections.</p>
            </div>
            <button 
              onClick={triggerAdd}
              className="px-8 py-3 bg-[#1BAFAF] text-white text-[13px] font-bold rounded-2xl hover:bg-[#17a0a0] transition-all shadow-xl shadow-[#1BAFAF]/20 active:scale-95 flex items-center gap-2"
            >
              <Plus size={18} strokeWidth={3} />
              Create First Story
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-12 gap-y-20 pb-12">
          {looks.map((look) => (
            <div key={look.id} className="group relative w-full flex flex-col items-center" style={{ perspective: '1200px' }}>
              
              <motion.div 
                className="relative w-60 h-80"
                style={{ transformStyle: 'preserve-3d' }}
                animate={{ rotateY: flippedLooks.has(look.id) ? 180 : 0 }}
                transition={{ type: "tween", duration: 0.8, ease: "easeInOut" }}
              >
                {/* Front Side: Video Preview */}
                <div 
                  className="absolute inset-0 rounded-[1.5rem] overflow-hidden bg-gray-100 shadow-xl border-4 border-white"
                  style={{ 
                    backfaceVisibility: 'hidden', 
                    WebkitBackfaceVisibility: 'hidden',
                    zIndex: flippedLooks.has(look.id) ? 0 : 1 
                  }}
                  onMouseEnter={(e) => {
                    const video = e.currentTarget.querySelector('video');
                    if (video) {
                      video.play().catch(err => console.log("Video play failed:", err));
                    }
                  }}
                  onMouseLeave={(e) => {
                    const video = e.currentTarget.querySelector('video');
                    if (video) {
                      video.pause();
                      video.currentTime = 0;
                    }
                  }}
                >
                  {look.url ? (
                    <video 
                      src={look.url} 
                      className="w-full h-full object-cover" 
                      muted 
                      loop 
                      playsInline
                      preload="auto"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 text-gray-300">
                      <Video size={32} />
                      <p className="text-[10px] font-bold mt-2 uppercase tracking-widest">No Video</p>
                    </div>
                  )}

                  {/* Top Actions (Trash & Flip) */}
                  <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-20 opacity-0 group-hover:opacity-100 transition-all">
                    <button 
                      onClick={() => removeLook(look)}
                      className="p-2.5 bg-black/30 hover:bg-red-500 text-white rounded-full backdrop-blur-md transition-all"
                      title="Remove Story"
                    >
                      <Trash2 size={16} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleFlip(look.id); }}
                      className="p-2.5 bg-black/30 hover:bg-[#1BAFAF] text-white rounded-full backdrop-blur-md transition-all"
                      title="Show Poster"
                    >
                      <Repeat size={18} />
                    </button>
                  </div>

                  {/* Status Badge (Top Right Inside) */}
                  {(look.isNew || look.isModified) && (
                    <div className="absolute top-4 right-4 z-10 group-hover:opacity-0 transition-opacity">
                      <span className="px-2.5 py-1 bg-black/40 backdrop-blur-md text-white text-[8px] font-black uppercase tracking-widest rounded-full border border-white/20">
                        {look.isNew ? 'New' : 'Draft'}
                      </span>
                    </div>
                  )}

                  {/* Media Edit Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-all backdrop-blur-[2px] gap-2 z-10">
                     <button 
                      onClick={() => triggerEditMedia(look.id, 'thumbnail')}
                      className="flex items-center gap-2 bg-white/20 hover:bg-white/40 px-3 py-1 rounded-full text-[10px] font-bold transition-all"
                     >
                       <Camera size={14} /> POSTER
                     </button>
                     <button 
                      onClick={() => triggerEditMedia(look.id, 'video')}
                      className="flex items-center gap-2 bg-[#1BAFAF] hover:bg-[#17a0a0] px-3 py-1 rounded-full text-[10px] font-bold transition-all"
                     >
                       <Video size={14} /> VIDEO
                     </button>
                  </div>

                  {/* Integrated Product Overlay (If Linked) */}
                  {look.productId && allProducts.find(prod => prod.id === look.productId) ? (
                    <div className="absolute bottom-2 left-2 right-2 bg-white/95 backdrop-blur-md rounded-2xl p-2.5 flex items-center gap-3 shadow-lg z-20 group/prod transition-all hover:bg-white border border-gray-100">
                      {(() => {
                        const p = allProducts.find(prod => prod.id === look.productId);
                        return (
                          <>
                            <img src={p.images?.[0]} alt="" className="w-10 h-12 rounded-lg object-cover flex-shrink-0" />
                            <div className="flex-1 min-w-0 text-left">
                              <p className="text-[10px] font-bold text-gray-900 truncate uppercase tracking-tight">{p.name}</p>
                              <p className="text-[11px] text-[#1BAFAF] font-black">₹{Number(p.discountedPrice || p.price || p.actualPrice || 0).toLocaleString('en-IN')}</p>
                            </div>
                            
                            <div className="flex flex-col gap-1">
                              <button 
                                onClick={() => setActiveProductSearchId(look.id)}
                                className="p-1 text-gray-400 hover:text-[#1BAFAF] transition-colors"
                                title="Change Product"
                              >
                                <Search size={12} />
                              </button>
                              <button 
                                onClick={() => updateField(look.id, 'productId', '')}
                                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                title="Unlink Product"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  ) : (
                    /* Integrated Search Bar (If NOT linked) */
                    <div className="absolute bottom-2 left-2 right-2 z-20">
                      <div className="relative">
                        <Search size={10} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60" />
                        <input 
                          type="text"
                          placeholder="Link Product..."
                          value={activeProductSearchId === look.id ? productSearch : ''}
                          data-search-input={look.id}
                          onFocus={() => {
                            setActiveProductSearchId(look.id);
                            setProductSearch('');
                          }}
                          onChange={(e) => setProductSearch(e.target.value)}
                          className="w-full bg-black/30 backdrop-blur-md border border-white/20 pl-8 pr-3 py-2 text-[10px] font-bold text-white placeholder:text-white/60 rounded-xl focus:ring-2 focus:ring-white/20 focus:bg-black/50 transition-all outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Back Side: Poster Preview */}
                <div 
                  className="absolute inset-0 rounded-[1.5rem] overflow-hidden bg-gray-100 shadow-xl border-4 border-white group/poster"
                  style={{ 
                    backfaceVisibility: 'hidden', 
                    WebkitBackfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                    zIndex: flippedLooks.has(look.id) ? 1 : 0
                  }}
                >
                  {look.thumbnail ? (
                    <img src={look.thumbnail} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 text-gray-400 p-6 text-center">
                      <ImageIcon size={32} className="mb-2 opacity-20" />
                      <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed">No saved poster<br/>found</p>
                    </div>
                  )}

                  {/* Poster Actions Overlay (Center) */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/poster:opacity-100 flex flex-col items-center justify-center text-white transition-all backdrop-blur-[2px] gap-2 z-10">
                     <button 
                      onClick={() => triggerEditMedia(look.id, 'thumbnail')}
                      className="flex items-center gap-2 bg-white/20 hover:bg-white/40 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all"
                     >
                       <Camera size={14} /> EDIT POSTER
                     </button>
                     <button 
                      onClick={() => updateField(look.id, 'thumbnail', '')}
                      className="flex items-center gap-2 bg-red-500/80 hover:bg-red-500 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all"
                     >
                       <Trash2 size={14} /> REMOVE
                     </button>
                  </div>

                  {/* Top Actions (Back Side) */}
                  <div className="absolute top-4 right-4 z-20">
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleFlip(look.id); }}
                      className="p-2.5 bg-black/30 hover:bg-[#1BAFAF] text-white rounded-full backdrop-blur-md transition-all"
                      title="Show Video"
                    >
                      <Repeat size={18} />
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* Search Results Dropdown (Shared) */}
              {activeProductSearchId === look.id && (
                <div className="search-dropdown absolute z-[50] top-full mt-3 bg-white border border-gray-100 rounded-2xl shadow-2xl w-64 py-2 animate-in fade-in zoom-in-95">
                  <div className="max-h-64 overflow-y-auto no-scrollbar">
                    {allProducts
                      .filter(p => !productSearch || p.name.toLowerCase().includes(productSearch.toLowerCase()))
                      .map(p => (
                        <button
                          key={p.id}
                          onClick={() => {
                            updateField(look.id, 'productId', p.id);
                            setActiveProductSearchId(null);
                            setProductSearch('');
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left ${look.productId === p.id ? 'bg-[#1BAFAF]/5' : ''}`}
                        >
                          <img src={p.images?.[0]} alt="" className="w-9 h-9 rounded-lg object-cover bg-gray-100" />
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-bold text-gray-900 truncate">{p.name}</p>
                            <p className="text-[9px] text-[#1BAFAF] font-bold">₹{Number(p.discountedPrice || p.price || p.actualPrice || 0).toLocaleString('en-IN')}</p>
                          </div>
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        itemName={lookToDelete?.title || 'this story'}
        loading={isDeleting}
      />
    </div>
  );
}
