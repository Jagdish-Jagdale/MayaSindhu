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
  Image as ImageIcon
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Stories() {
  const { isCollapsed } = useAdminUI();
  const [looks, setLooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [deletedIds, setDeletedIds] = useState([]);
  
  const [editingLookId, setEditingLookId] = useState(null);
  const [editingType, setEditingType] = useState(null); // 'thumbnail' or 'productImage'
  
  const fileInputRef = useRef(null);

  // Load Looks
  useEffect(() => {
    const q = query(collection(db, 'shopTheLook'), orderBy('order', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
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
      if (editingLookId) {
        setLooks(prev => prev.map(l => 
          l.id === editingLookId 
            ? { ...l, [editingType]: reader.result, isModified: true } 
            : l
        ));
      } else {
        const newLook = {
          id: 'temp-' + Date.now(),
          title: '',
          category: '',
          url: '',
          thumbnail: reader.result,
          productImage: reader.result,
          order: looks.length,
          isNew: true
        };
        setLooks(prev => [...prev, newLook]);
      }
      setHasChanges(true);
      setEditingLookId(null);
    };
    reader.readAsDataURL(file);
    e.target.value = null;
  };

  const triggerEditImage = (id, type) => {
    setEditingLookId(id);
    setEditingType(type);
    fileInputRef.current?.click();
  };

  const triggerAdd = () => {
    setEditingLookId(null);
    setEditingType('thumbnail');
    fileInputRef.current?.click();
  };

  const updateField = (id, field, value) => {
    setLooks(prev => prev.map(l => 
      l.id === id ? { ...l, [field]: value, isModified: true } : l
    ));
    setHasChanges(true);
  };

  const removeLook = (look) => {
    setLooks(prev => prev.filter(l => l.id !== look.id));
    if (!look.isNew) {
      setDeletedIds(prev => [...prev, look.id]);
    }
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const batch = writeBatch(db);

      // Handle Deletions
      deletedIds.forEach(id => {
        batch.delete(doc(db, 'shopTheLook', id));
      });

      // Handle Adds and Updates
      looks.forEach((look, index) => {
        if (look.isNew) {
          const docRef = doc(collection(db, 'shopTheLook'));
          batch.set(docRef, {
            title: look.title || '',
            category: look.category || '',
            url: look.url || '',
            thumbnail: look.thumbnail || '',
            productImage: look.productImage || '',
            order: index,
            createdAt: serverTimestamp()
          });
        } else if (look.isModified) {
          const docRef = doc(db, 'shopTheLook', look.id);
          batch.update(docRef, {
            title: look.title || '',
            category: look.category || '',
            url: look.url || '',
            thumbnail: look.thumbnail || '',
            productImage: look.productImage || '',
            order: index,
            updatedAt: serverTimestamp()
          });
        }
      });

      await batch.commit();
      setDeletedIds([]);
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
      
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />

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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-12">
          {looks.map((look) => (
            <div key={look.id} className="bg-white border border-gray-100 rounded-[3rem] p-8 flex flex-col sm:flex-row gap-8 shadow-sm hover:shadow-xl transition-all group relative">
              
              {/* Media Preview Stack */}
              <div className="flex-shrink-0 space-y-4 flex flex-col items-center">
                <div className="relative w-40 h-56 rounded-[2rem] overflow-hidden bg-gray-100 border-4 border-white shadow-md group/thumb">
                   <img src={look.thumbnail} className="w-full h-full object-cover" alt="" />
                   <button 
                    onClick={() => triggerEditImage(look.id, 'thumbnail')}
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 flex flex-col items-center justify-center text-white transition-all backdrop-blur-[2px]"
                   >
                     <Camera size={24} className="mb-1" />
                     <span className="text-[9px] font-bold uppercase">Poster</span>
                   </button>
                </div>
                <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-50 border-2 border-white shadow-sm group/prod">
                   <img src={look.productImage} className="w-full h-full object-cover" alt="" />
                   <button 
                    onClick={() => triggerEditImage(look.id, 'productImage')}
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover/prod:opacity-100 flex items-center justify-center text-white transition-all"
                   >
                     <ImageIcon size={14} />
                   </button>
                </div>
              </div>

              {/* Form Fields */}
              <div className="flex-1 space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-1.5 block ml-1">Narrative Title</label>
                  <input 
                    type="text"
                    placeholder="Hand-painted Madhubani Heritage"
                    value={look.title || ''}
                    onChange={(e) => updateField(look.id, 'title', e.target.value)}
                    className="w-full bg-gray-50 border-none px-5 py-2.5 text-[13px] font-bold text-gray-900 rounded-2xl focus:ring-2 focus:ring-[#1BAFAF]/20 focus:bg-white transition-all outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-1.5 block ml-1">Artisan Category</label>
                  <input 
                    type="text"
                    placeholder="Artisan Jewelry"
                    value={look.category || ''}
                    onChange={(e) => updateField(look.id, 'category', e.target.value)}
                    className="w-full bg-gray-50 border-none px-5 py-2.5 text-[11px] font-bold text-gray-500 rounded-2xl focus:ring-2 focus:ring-[#1BAFAF]/20 focus:bg-white transition-all outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-1.5 block ml-1">Video URL (Mixkit/YouTube/Direct)</label>
                  <div className="relative">
                    <Video size={12} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                    <input 
                      type="text"
                      placeholder="https://assets.mixkit.co/..."
                      value={look.url || ''}
                      onChange={(e) => updateField(look.id, 'url', e.target.value)}
                      className="w-full bg-gray-50 border-none pl-9 pr-5 py-2.5 text-[11px] font-medium text-gray-600 rounded-2xl focus:ring-2 focus:ring-[#1BAFAF]/20 focus:bg-white transition-all outline-none"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button 
                    onClick={() => removeLook(look)}
                    className="w-full py-3 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all active:scale-95 text-[12px] font-bold gap-2"
                  >
                    <Trash2 size={16} />
                    Remove Story
                  </button>
                </div>
              </div>

              {/* Status Badge */}
              {(look.isNew || look.isModified) && (
                <div className="absolute top-6 right-8">
                  <span className="px-3 py-1 bg-[#1BAFAF]/10 text-[#1BAFAF] text-[9px] font-black uppercase tracking-widest rounded-full">
                    {look.isNew ? 'New Story' : 'Draft'}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
