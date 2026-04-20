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
  ChevronDown
} from 'lucide-react';
import toast from 'react-hot-toast';
import useCategories from '../../../hooks/useCategories';

const SLOT_TYPES = [
  { id: 1, label: 'Large Vertical (Slot 1)', gridClass: 'md:col-span-1 md:row-span-2 h-[400px] md:h-full' },
  { id: 2, label: 'Small Square (Slot 2)', gridClass: 'md:col-span-1 md:row-span-1 h-[190px] md:h-full' },
  { id: 3, label: 'Small Square (Slot 3)', gridClass: 'md:col-span-1 md:row-span-1 h-[190px] md:h-full' },
  { id: 4, label: 'Wide Landscape (Slot 4)', gridClass: 'md:col-span-2 md:row-span-1 h-[190px] md:h-full' },
];

export default function CuratedRealms() {
  const { isCollapsed } = useAdminUI();
  const { categories: heirarchy, loading: catsLoading } = useCategories();
  const [realms, setRealms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [editingSlotId, setEditingSlotId] = useState(null);
  
  const fileInputRef = useRef(null);

  // Get Main Categories (Root Level)
  const mainCategories = heirarchy.filter(cat => !cat.parentId);

  // Load Curated Realms
  useEffect(() => {
    const q = query(collection(db, 'curatedRealms'), orderBy('slotId', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Initialize 4 slots if empty or partial
      const initialRealms = SLOT_TYPES.map(slot => {
        const existing = data.find(r => r.slotId === slot.id);
        return existing || { slotId: slot.id, categoryId: '', title: '', subtitle: '', imageUrl: '', isEmpty: true };
      });
      
      setRealms(initialRealms);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [heirarchy]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file || !editingSlotId) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setRealms(prev => prev.map(r => 
        r.slotId === editingSlotId 
          ? { ...r, imageUrl: reader.result, isModified: true, isEmpty: false } 
          : r
      ));
      setHasChanges(true);
      setEditingSlotId(null);
    };
    reader.readAsDataURL(file);
    e.target.value = null;
  };

  const updateRealmField = (slotId, field, value) => {
    setRealms(prev => prev.map(r => {
      if (r.slotId === slotId) {
        const updated = { ...r, [field]: value, isModified: true };
        
        // If selecting a category and title is empty, use category name
        if (field === 'categoryId' && value) {
          const cat = mainCategories.find(c => c.id === value);
          if (cat && (!r.title || r.title === '')) {
            updated.title = cat.name;
          }
        }
        
        return updated;
      }
      return r;
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const batch = writeBatch(db);
      
      const modifiedRealms = realms.filter(r => r.isModified && r.categoryId && r.imageUrl);
      
      if (modifiedRealms.length === 0 && hasChanges) {
        toast.error("Please fill in both category and image for modified slots");
        setIsSaving(false);
        return;
      }

      modifiedRealms.forEach(realm => {
        const docId = `slot_${realm.slotId}`;
        const docRef = doc(db, 'curatedRealms', docId);
        const { isModified, isEmpty, ...saveData } = realm;
        batch.set(docRef, {
          ...saveData,
          updatedAt: serverTimestamp()
        });
      });

      await batch.commit();
      setHasChanges(false);
      toast.success("Curated Realms updated successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save configurations");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || catsLoading) {
    return (
      <div className="h-[60vh] w-full flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#1BAFAF]" />
        <p className="text-[14px] font-medium text-gray-400">Loading realm configurations...</p>
      </div>
    );
  }

  return (
    <div className={`mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 transition-all duration-300 ${isCollapsed ? 'max-w-[1600px]' : 'max-w-[1280px]'}`} style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}>
      
      {/* Hidden File Input */}
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />

      {/* Header Section */}
      <div className="space-y-2 py-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-semibold text-gray-900 tracking-tight">Explore Category</h1>
            <p className="text-[12px] text-gray-400 font-medium font-inter tracking-tight">Manage the category-based visual storytelling sections on your homepage.</p>
          </div>
          <div className="flex items-center gap-3">
            {hasChanges && (
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 bg-[#1BAFAF] hover:bg-[#17a0a0] text-white px-5 py-2 rounded-xl text-[13px] font-semibold transition-all shadow-sm shadow-[#1BAFAF]/10 active:scale-95 disabled:opacity-50"
              >
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} strokeWidth={2.5} />}
                Save Changes
              </button>
            )}
          </div>
        </div>
        <hr className="border-gray-100" />
      </div>

      {/* Admin Grid View - Matching Homepage Layout */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-[14px] font-bold text-gray-900 uppercase tracking-widest flex items-center gap-2">
            <Layout size={16} className="text-[#1BAFAF]" />
            Homepage Grid Configuration
          </h2>
          <span className="text-[11px] text-gray-400 font-medium">4 Required Slots</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1.4fr_0.8fr_0.8fr] gap-6 h-auto md:h-[650px]">
          {realms.map((realm) => {
            const slotConfig = SLOT_TYPES.find(s => s.id === realm.slotId);
            return (
              <div 
                key={realm.slotId} 
                className={`${slotConfig.gridClass} bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-md transition-all group relative flex flex-col`}
              >
                {realm.imageUrl ? (
                  <div className="absolute inset-0 w-full h-full">
                    <img src={realm.imageUrl} alt={realm.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  </div>
                ) : (
                  <div className="absolute inset-0 bg-gray-50 flex flex-col items-center justify-center p-8 text-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-gray-300">
                      <ImageIcon size={24} />
                    </div>
                    <p className="text-[11px] text-gray-400 font-medium italic">Empty {slotConfig.label}</p>
                  </div>
                )}

                {/* Overlays & Controls */}
                <div className="absolute inset-x-0 bottom-0 p-6 space-y-4">
                  {/* Category Picker */}
                  <div className="relative group/select">
                    <select 
                      value={realm.categoryId}
                      onChange={(e) => updateRealmField(realm.slotId, 'categoryId', e.target.value)}
                      className="w-full bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-xl px-4 py-2.5 text-[12px] font-bold appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1BAFAF]/50 transition-all"
                    >
                      <option value="" className="text-gray-900">Select Main Category</option>
                      {mainCategories.map(cat => (
                        <option key={cat.id} value={cat.id} className="text-gray-900">{cat.name}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 pointer-events-none" />
                  </div>

                  {/* Editable Text Fields */}
                  <div className="space-y-1">
                    <input 
                      type="text"
                      placeholder="Display Title"
                      value={realm.title}
                      onChange={(e) => updateRealmField(realm.slotId, 'title', e.target.value)}
                      className="w-full bg-transparent text-white text-[18px] md:text-[22px] font-bold placeholder:text-white/30 focus:outline-none border-b border-white/0 focus:border-white/30 truncate pb-1"
                    />
                    <input 
                      type="text"
                      placeholder="Poetic Subtitle (Optional)"
                      value={realm.subtitle}
                      onChange={(e) => updateRealmField(realm.slotId, 'subtitle', e.target.value)}
                      className="w-full bg-transparent text-white/70 text-[10px] uppercase tracking-[0.2em] font-medium placeholder:text-white/20 focus:outline-none border-b border-white/0 focus:border-white/20 truncate"
                    />
                  </div>
                </div>

                {/* Edit Controls (Top Right) */}
                <div className="absolute top-4 right-4 flex items-center gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                  <button 
                    onClick={() => { setEditingSlotId(realm.slotId); fileInputRef.current?.click(); }}
                    className="w-8 h-8 rounded-full bg-white text-gray-600 shadow-xl flex items-center justify-center hover:bg-[#1BAFAF] hover:text-white transition-all scale-90 hover:scale-110"
                    title="Change Image"
                  >
                    <Camera size={14} />
                  </button>
                  {realm.isModified && (
                    <div className="px-2 py-1 bg-brand-orange text-white text-[9px] font-bold rounded-lg uppercase tracking-wider shadow-lg">
                      Modified
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
