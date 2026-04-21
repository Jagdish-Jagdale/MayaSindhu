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
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ArtisanBlooms() {
  const { isCollapsed } = useAdminUI();
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [deletedIds, setDeletedIds] = useState([]);
  
  const fileInputRef = useRef(null);
  const [editingTrendId, setEditingTrendId] = useState(null);

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
      setHasChanges(false);
      setDeletedIds([]);
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
      if (editingTrendId) {
        setTrends(prev => prev.map(t => 
          t.id === editingTrendId 
            ? { ...t, imageUrl: reader.result, isModified: true } 
            : t
        ));
      } else {
        const newTrend = {
          id: 'temp-' + Date.now(),
          imageUrl: reader.result,
          accent: '',
          title: '',
          description: '',
          link: '/shop',
          order: trends.length,
          isNew: true
        };
        setTrends(prev => [...prev, newTrend]);
      }
      setHasChanges(true);
      setEditingTrendId(null);
    };
    reader.readAsDataURL(file);
    e.target.value = null;
  };

  const triggerEditImage = (id) => {
    setEditingTrendId(id);
    fileInputRef.current?.click();
  };

  const triggerAdd = () => {
    setEditingTrendId(null);
    fileInputRef.current?.click();
  };

  const updateField = (id, field, value) => {
    setTrends(prev => prev.map(t => 
      t.id === id ? { ...t, [field]: value, isModified: true } : t
    ));
    setHasChanges(true);
  };

  const removeTrend = (trend) => {
    setTrends(prev => prev.filter(t => t.id !== trend.id));
    if (!trend.isNew) {
      setDeletedIds(prev => [...prev, trend.id]);
    }
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const batch = writeBatch(db);

      // Handle Deletions
      deletedIds.forEach(id => {
        batch.delete(doc(db, 'shopByTrend', id));
      });

      // Handle Adds and Updates
      trends.forEach((trend, index) => {
        if (trend.isNew) {
          const docRef = doc(collection(db, 'shopByTrend'));
          batch.set(docRef, {
            imageUrl: trend.imageUrl,
            accent: trend.accent || '',
            title: trend.title || '',
            description: trend.description || '',
            order: index,
            createdAt: serverTimestamp()
          });
        } else if (trend.isModified) {
          const docRef = doc(db, 'shopByTrend', trend.id);
          batch.update(docRef, {
            imageUrl: trend.imageUrl,
            accent: trend.accent || '',
            title: trend.title || '',
            description: trend.description || '',
            order: index,
            updatedAt: serverTimestamp()
          });
        }
      });

      await batch.commit();
      setDeletedIds([]);
      setHasChanges(false);
      toast.success("Trend configurations saved");
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
        <p className="text-[14px] font-medium text-gray-400">Loading trends...</p>
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
            <h1 className="text-[22px] font-semibold text-gray-900 tracking-tight">Shop by Trend</h1>
            <p className="text-[12px] text-gray-400 font-medium tracking-tight">Configure the artisan collections and trending spotlights for the horizontal homepage slider.</p>
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
              Add Trend Card
            </button>
          </div>
        </div>
        <hr className="border-gray-100" />
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
              onClick={triggerAdd}
              className="px-8 py-3 bg-[#1BAFAF] text-white text-[13px] font-bold rounded-2xl hover:bg-[#17a0a0] transition-all shadow-xl shadow-[#1BAFAF]/20 active:scale-95 flex items-center gap-2"
            >
              <Plus size={18} strokeWidth={3} />
              Create First Trend
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-12">
          {trends.map((trend) => (
            <div key={trend.id} className="bg-white border border-gray-100 rounded-[3rem] p-8 flex flex-col sm:flex-row gap-8 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
              {/* Image Cluster */}
              <div className="relative flex-shrink-0 flex items-center justify-center">
                <div className="relative w-40 h-40 md:w-48 md:h-48 group/img">
                  <div className="absolute inset-0 bg-gray-50 rounded-full overflow-hidden border-4 border-white shadow-inner">
                    <img src={trend.imageUrl} className="w-full h-full object-cover" alt="" />
                  </div>
                  <button 
                    onClick={() => triggerEditImage(trend.id)}
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 rounded-full flex flex-col items-center justify-center text-white transition-all duration-300 backdrop-blur-[2px]"
                  >
                    <Camera size={24} className="mb-1" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Change</span>
                  </button>
                </div>
              </div>

              {/* Form Fields */}
              <div className="flex-1 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-full">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-1.5 block ml-1">Accent Text (e.g. Fine Textiles)</label>
                    <input 
                      type="text"
                      placeholder="BOUTIQUE SELECTION"
                      value={trend.accent || ''}
                      onChange={(e) => updateField(trend.id, 'accent', e.target.value)}
                      className="w-full bg-gray-50 border-none px-5 py-2.5 text-[12px] font-bold rounded-2xl focus:ring-2 focus:ring-[#1BAFAF]/20 focus:bg-white transition-all outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-1.5 block ml-1">Trend Title</label>
                  <input 
                    type="text" 
                    placeholder="Artisanal Earring Set"
                    value={trend.title || ''}
                    onChange={(e) => updateField(trend.id, 'title', e.target.value)}
                    className="w-full bg-gray-50 border-none px-5 py-2.5 text-[14px] font-bold text-gray-900 rounded-2xl focus:ring-2 focus:ring-[#1BAFAF]/20 focus:bg-white transition-all outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-1.5 block ml-1">Narrative Description</label>
                  <textarea 
                    rows={2}
                    placeholder="Describe the aesthetic..."
                    value={trend.description || ''}
                    onChange={(e) => updateField(trend.id, 'description', e.target.value)}
                    className="w-full bg-gray-50 border-none px-5 py-3 text-[12px] font-medium text-gray-500 rounded-2xl focus:ring-2 focus:ring-[#1BAFAF]/20 focus:bg-white transition-all outline-none resize-none leading-relaxed"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => removeTrend(trend)}
                    className="w-full h-11 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all active:scale-95 font-bold text-[13px] gap-2"
                  >
                    <Trash2 size={16} />
                    Remove Card
                  </button>
                </div>
              </div>

              {/* Status Badge */}
              {(trend.isNew || trend.isModified) && (
                <div className="absolute top-6 right-6">
                  <span className="px-3 py-1 bg-[#1BAFAF]/10 text-[#1BAFAF] text-[9px] font-black uppercase tracking-widest rounded-full">
                    {trend.isNew ? 'New' : 'Unsaved Changes'}
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
