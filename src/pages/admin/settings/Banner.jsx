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
  const [editingBannerId, setEditingBannerId] = useState(null);
  
  const fileInputRef = useRef(null);

  // Load Banners
  useEffect(() => {
    const q = query(collection(db, 'banners'), orderBy('createdAt', 'desc'));
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
        // Edit existing banner
        setBanners(prev => prev.map(b => 
          b.id === editingBannerId 
            ? { ...b, imageUrl: reader.result, name: file.name, isModified: true } 
            : b
        ));
        setEditingBannerId(null);
      } else {
        // Add new banner
        const newBanner = {
          id: 'temp-' + Date.now(),
          imageUrl: reader.result,
          name: file.name,
          isNew: true
        };
        setBanners(prev => [newBanner, ...prev]);
      }
      setHasChanges(true);
    };
    reader.readAsDataURL(file);
    e.target.value = null; // Reset input
  };

  const triggerEdit = (id) => {
    setEditingBannerId(id);
    fileInputRef.current?.click();
  };

  const triggerAdd = () => {
    setEditingBannerId(null);
    fileInputRef.current?.click();
  };

  const removeBanner = async (banner) => {
    if (banner.isNew || banner.isModified) {
      if (banner.isNew) {
        setBanners(prev => prev.filter(b => b.id !== banner.id));
      } else {
        // Just reset the modified flag locally if we want to cancel the edit?
        // Actually the user wants to remove it. Let's delete from DB if it exists.
        try {
          await deleteDoc(doc(db, 'banners', banner.id));
          toast.success("Banner removed");
        } catch (err) {
          toast.error("Failed to remove banner");
        }
      }
      const remainingNew = banners.filter(b => b.id !== banner.id && (b.isNew || b.isModified));
      if (remainingNew.length === 0) setHasChanges(false);
    } else {
      try {
        await deleteDoc(doc(db, 'banners', banner.id));
        toast.success("Banner removed");
      } catch (err) {
        toast.error("Failed to remove banner");
      }
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      const newBanners = banners.filter(b => b.isNew);
      const modifiedBanners = banners.filter(b => b.isModified);
      
      const batch = writeBatch(db);

      // Add new banners
      newBanners.forEach(banner => {
        const docRef = doc(collection(db, 'banners'));
        batch.set(docRef, {
          imageUrl: banner.imageUrl,
          name: banner.name,
          createdAt: serverTimestamp()
        });
      });

      // Update modified banners
      modifiedBanners.forEach(banner => {
        const docRef = doc(db, 'banners', banner.id);
        batch.update(docRef, {
          imageUrl: banner.imageUrl,
          name: banner.name,
          updatedAt: serverTimestamp()
        });
      });

      await batch.commit();
      
      setHasChanges(false);
      toast.success("Banner configurations updated");
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
      
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={handleFileSelect}
      />

      {/* Header Section */}
      <div className="space-y-2 py-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-semibold text-gray-900 tracking-tight">Banner Configuration</h1>
            <p className="text-[12px] text-gray-400 font-medium font-inter tracking-tight">Manage the cinematic hero slider and promotional banners on your homepage.</p>
          </div>
          <div className="flex items-center gap-3">
            {hasChanges ? (
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 bg-[#1BAFAF] hover:bg-[#17a0a0] text-white px-5 py-2 rounded-xl text-[13px] font-semibold transition-all shadow-sm shadow-[#1BAFAF]/10 active:scale-95 disabled:opacity-50"
              >
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} strokeWidth={2.5} />}
                Save
              </button>
            ) : (
              <button 
                onClick={triggerAdd}
                className="flex items-center gap-2 bg-[#1BAFAF] hover:bg-[#17a0a0] text-white px-5 py-2 rounded-xl text-[13px] font-semibold transition-all shadow-sm shadow-[#1BAFAF]/10 active:scale-95"
              >
                <Plus size={16} strokeWidth={2.5} />
                Add Banner
              </button>
            )}
          </div>
        </div>
        <hr className="border-gray-100" />
      </div>

      {/* Main Content Area */}
      {banners.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-[24px] p-8 shadow-sm">
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="w-16 h-16 bg-[#eaf6f6] rounded-2xl flex items-center justify-center text-[#1BAFAF]">
              <Layout size={32} />
            </div>
            <div>
              <h3 className="text-[18px] font-bold text-gray-900">Configure Banner Configuration</h3>
              <p className="text-[14px] text-gray-400 max-w-sm mx-auto">
                This module allows you to edit the content and layout of the Banner section on your homepage.
              </p>
            </div>
            <button 
              onClick={triggerAdd}
              className="px-6 py-2.5 bg-gray-50 text-gray-900 text-[13px] font-bold rounded-xl hover:bg-gray-100 transition-all"
            >
              Start Editing
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banners.map((banner) => (
            <div key={banner.id} className="bg-white border border-gray-100 rounded-[24px] overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col items-center p-4">
              <div className="relative w-full aspect-[21/9] rounded-2xl overflow-hidden bg-gray-100 mb-4">
                <img src={banner.imageUrl} alt="Banner" className="w-full h-full object-cover" />
                <div className="absolute top-3 right-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                  <button 
                    onClick={() => triggerEdit(banner.id)}
                    className="w-8 h-8 rounded-full bg-white text-gray-600 shadow-lg flex items-center justify-center hover:bg-gray-50 hover:scale-110 transition-all"
                  >
                    <Pencil size={14} />
                  </button>
                  <button 
                    onClick={() => removeBanner(banner)}
                    className="w-8 h-8 rounded-full bg-red-500 text-white shadow-lg flex items-center justify-center hover:bg-red-600 hover:scale-110 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                {(banner.isNew || banner.isModified) && (
                  <div className="absolute top-3 left-3 px-2 py-1 bg-[#1BAFAF] text-white text-[10px] font-bold rounded-lg uppercase tracking-wider">
                    {banner.isNew ? 'Unsaved' : 'Modified'}
                  </div>
                )}
              </div>
              <div className="w-full space-y-1 text-center">
                <p className="text-[12px] text-gray-400 font-medium truncate italic">{banner.name || 'Banner Image'}</p>
              </div>
            </div>
          ))}
          <button 
            onClick={triggerAdd}
            className="border-2 border-dashed border-gray-100 rounded-[24px] p-8 flex flex-col items-center justify-center gap-3 text-gray-300 hover:border-[#1BAFAF] hover:text-[#1BAFAF] transition-all group min-h-[180px]"
          >
            <div className="w-12 h-12 rounded-full bg-gray-50 group-hover:bg-[#eaf6f6] flex items-center justify-center transition-all">
              <Plus size={24} />
            </div>
            <span className="text-[13px] font-semibold">New Banner</span>
          </button>
        </div>
      )}

    </div>
  );
}
