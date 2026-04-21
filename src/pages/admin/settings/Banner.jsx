import React, { useState, useEffect, useRef } from 'react';
import { useAdminUI } from '../../../context/AdminUIContext';
import { db } from '../../../firebase';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  doc, 
  addDoc, 
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
  Pencil
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Banner() {
  const { isCollapsed } = useAdminUI();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [deletedBannerIds, setDeletedBannerIds] = useState([]);
  
  const fileInputRef = useRef(null);
  const [editingBannerId, setEditingBannerId] = useState(null);

  // Load Banners
  useEffect(() => {
    const q = query(collection(db, 'banners'), orderBy('order', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBanners(data);
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

    const reader = new FileReader();
    reader.onloadend = () => {
      if (editingBannerId) {
        setBanners(prev => prev.map(b => 
          b.id === editingBannerId 
            ? { ...b, imageUrl: reader.result, isModified: true } 
            : b
        ));
      } else {
        const newBanner = {
          id: 'temp-' + Date.now(),
          imageUrl: reader.result,
          order: banners.length + 1,
          isNew: true
        };
        setBanners(prev => [...prev, newBanner]);
      }
      setHasChanges(true);
      setEditingBannerId(null);
    };
    reader.readAsDataURL(file);
    e.target.value = null;
  };

  const removeBanner = (banner) => {
    setBanners(prev => prev.filter(b => b.id !== banner.id));
    if (!banner.isNew) {
      setDeletedBannerIds(prev => [...prev, banner.id]);
    }
    setHasChanges(true);
  };

  const updateBannerOrder = (id, orderValue) => {
    const val = parseInt(orderValue) || 0;
    setBanners(prev => prev.map(b => 
      b.id === id ? { ...b, order: val, isModified: true } : b
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

      // Handle Adds and Updates
      banners.forEach(banner => {
        if (banner.isNew) {
          const docRef = doc(collection(db, 'banners'));
          batch.set(docRef, {
            imageUrl: banner.imageUrl,
            order: banner.order || 0,
            createdAt: serverTimestamp()
          });
        } else if (banner.isModified) {
          const docRef = doc(db, 'banners', banner.id);
          batch.update(docRef, {
            imageUrl: banner.imageUrl,
            order: banner.order || 0,
            updatedAt: serverTimestamp()
          });
        }
      });

      await batch.commit();
      setDeletedBannerIds([]);
      setHasChanges(false);
      toast.success("Banners updated successfully");
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
        <p className="text-[14px] font-medium text-gray-400">Loading banner configurations...</p>
      </div>
    );
  }

  return (
    <div className={`mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 transition-all duration-300 ${isCollapsed ? 'max-w-[1600px]' : 'max-w-[1280px]'}`} style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}>
      
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />

      {/* Header Section */}
      <div className="space-y-4 py-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-[22px] font-semibold text-gray-900 tracking-tight">Banner Configuration</h1>
            <p className="text-[12px] text-gray-400 font-medium font-inter tracking-tight">Manage the cinematic hero slider on your homepage.</p>
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
              onClick={() => { setEditingBannerId(null); fileInputRef.current?.click(); }}
              className="flex items-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-900 px-5 py-2.5 rounded-xl text-[13px] font-semibold transition-all active:scale-95"
            >
              <Plus size={16} strokeWidth={2.5} />
              Add Banner
            </button>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banners.map((banner) => (
            <div key={banner.id} className="bg-white border border-gray-100 rounded-[32px] overflow-hidden shadow-sm hover:shadow-md transition-all group p-4 flex flex-col space-y-4 relative">
              
              {/* Image Preview */}
              <div className="relative w-full aspect-[21/9] rounded-2xl overflow-hidden bg-gray-100 group/img">
                <img src={banner.imageUrl} alt="Banner" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-all flex items-center justify-center gap-2">
                   <button 
                    onClick={() => { setEditingBannerId(banner.id); fileInputRef.current?.click(); }}
                    className="w-10 h-10 rounded-full bg-white text-gray-600 flex items-center justify-center hover:scale-110 transition-all"
                  >
                    <Camera size={18} />
                  </button>
                   <button 
                    onClick={() => removeBanner(banner)}
                    className="w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center hover:scale-110 transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                
                {(banner.isNew || banner.isModified) && (
                  <div className="absolute top-3 left-3 px-2 py-1 bg-[#1BAFAF] text-white text-[9px] font-bold rounded-lg uppercase tracking-wider">
                    {banner.isNew ? 'Unsaved' : 'Modified'}
                  </div>
                )}
              </div>

              {/* Order Selection */}
              <div className="flex items-center justify-between px-2">
                <div className="space-y-1 flex-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Serial Number (Order)</label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="number"
                      min="1"
                      value={banner.order || ''}
                      onChange={(e) => updateBannerOrder(banner.id, e.target.value)}
                      className="w-20 bg-gray-50 border-none px-4 py-2 text-[14px] font-bold rounded-xl focus:ring-1 focus:ring-[#1BAFAF] focus:bg-white transition-all outline-none"
                    />
                    <span className="text-[11px] text-gray-400 italic">Determines slide position</span>
                  </div>
                </div>
              </div>

            </div>
          ))}

          <button 
            onClick={() => { setEditingBannerId(null); fileInputRef.current?.click(); }}
            className="border-2 border-dashed border-gray-100 rounded-[32px] p-8 flex flex-col items-center justify-center gap-3 text-gray-300 hover:border-[#1BAFAF] hover:text-[#1BAFAF] transition-all group min-h-[220px]"
          >
            <div className="w-12 h-12 rounded-full bg-gray-100 group-hover:bg-[#eaf6f6] flex items-center justify-center transition-all">
              <Plus size={24} />
            </div>
            <span className="text-[13px] font-semibold">New Banner Slide</span>
          </button>
        </div>
      )}
    </div>
  );
}
