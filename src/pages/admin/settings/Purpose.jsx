import React, { useState, useEffect, useRef } from 'react';
import { useAdminUI } from '../../../context/AdminUIContext';
import { db } from '../../../firebase';
import { 
  doc, 
  onSnapshot, 
  setDoc,
  serverTimestamp
} from 'firebase/firestore';
import { 
  Save, 
  Loader2, 
  Camera,
  Heart,
  Plus,
  Trash2,
  Quote
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Purpose() {
  const { isCollapsed } = useAdminUI();
  const [data, setData] = useState({
    accent: 'Our Purpose',
    title: 'Empowering Every Stitch, Supporting Every Artisan.',
    description: 'MayaSindhu was born from a desire to bridge the gap between ancient craftsmanship and the modern muse. We work directly with over 200 women-led artisan clusters across the subcontinent, ensuring fair wages and preserving heritage techniques that have been passed down through generations.',
    image: 'https://images.unsplash.com/photo-1590736704228-a4004944883f?w=1000&q=80',
    buttonText: 'Our Full Manifesto',
    stats: [
      { id: 1, value: '200+', label: 'Artisans Empowered' },
      { id: 2, value: '15+', label: 'Heritage Crafts' }
    ]
  });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  const fileInputRef = useRef(null);

  // Load Data
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'ourPurpose', 'main'), (docSnap) => {
      if (docSnap.exists()) {
        setData(prev => ({ ...prev, ...docSnap.data() }));
      }
      setLoading(false);
      setHasChanges(false);
    }, (error) => {
      console.error(error);
      setLoading(false);
      toast.error("Failed to load purpose details");
    });
    return () => unsub();
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
      setData(prev => ({ ...prev, image: reader.result }));
      setHasChanges(true);
    };
    reader.readAsDataURL(file);
    e.target.value = null;
  };

  const updateField = (field, value) => {
    setData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const updateStat = (id, field, value) => {
    setData(prev => ({
      ...prev,
      stats: prev.stats.map(s => s.id === id ? { ...s, [field]: value } : s)
    }));
    setHasChanges(true);
  };

  const addStat = () => {
    if (data.stats.length >= 4) {
      toast.error("Maximum 4 stats allowed for the layout");
      return;
    }
    setData(prev => ({
      ...prev,
      stats: [...prev.stats, { id: Date.now(), value: '0', label: 'New Metric' }]
    }));
    setHasChanges(true);
  };

  const removeStat = (id) => {
    setData(prev => ({
      ...prev,
      stats: prev.stats.filter(s => s.id !== id)
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await setDoc(doc(db, 'ourPurpose', 'main'), {
        ...data,
        updatedAt: serverTimestamp()
      });
      setHasChanges(false);
      toast.success("Our Purpose updated successfully");
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
        <p className="text-[14px] font-medium text-gray-400">Loading narrative details...</p>
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
            <h1 className="text-[22px] font-semibold text-gray-900 tracking-tight">Our Purpose</h1>
            <p className="text-[12px] text-gray-400 font-medium font-inter tracking-tight">Refine the brand manifesto and impact stories that define your heritage.</p>
          </div>
          <div className="flex items-center gap-3">
            {hasChanges && (
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 bg-[#1BAFAF] hover:bg-[#17a0a0] text-white px-6 py-2.5 rounded-xl text-[13px] font-bold transition-all shadow-lg shadow-[#1BAFAF]/10 active:scale-95 disabled:opacity-50"
              >
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} strokeWidth={2.5} />}
                Publish Narrative
              </button>
            )}
          </div>
        </div>
        <hr className="border-gray-100" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Media & Stats */}
        <div className="xl:col-span-5 space-y-8">
          {/* Main Showcase Image */}
          <div className="bg-white border border-gray-100 rounded-[3rem] p-6 shadow-sm overflow-hidden group">
             <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 block ml-2">Spotlight Image</label>
             <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-gray-50 border-4 border-white shadow-xl shadow-gray-100/50 group-hover:scale-[1.01] transition-all duration-700">
               <img src={data.image} className="w-full h-full object-cover" alt="" />
               <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center text-white backdrop-blur-[2px]"
               >
                 <Camera size={32} className="mb-2" />
                 <span className="text-[11px] font-bold uppercase tracking-wider">Update Artistic View</span>
               </button>
             </div>
          </div>

          {/* Impact Stats Manager */}
          <div className="bg-white border border-gray-100 rounded-[3rem] p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Impact Statistics</label>
              <button 
                onClick={addStat}
                disabled={data.stats.length >= 4}
                className="text-[#1BAFAF] hover:text-[#17a0a0] flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider disabled:opacity-30"
              >
                <Plus size={14} strokeWidth={3} /> Add Stat
              </button>
            </div>
            
            <div className="space-y-4">
              {data.stats.map((stat) => (
                <div key={stat.id} className="flex items-center gap-4 bg-gray-50/50 p-4 rounded-2xl border border-transparent hover:border-[#1BAFAF]/10 transition-all">
                  <div className="flex-shrink-0 w-12 h-12 bg-white rounded-xl flex items-center justify-center text-[#1BAFAF] shadow-sm font-black text-xs">
                    #
                  </div>
                  <div className="flex-1 grid grid-cols-2 gap-3">
                    <input 
                      placeholder="200+"
                      value={stat.value}
                      onChange={(e) => updateStat(stat.id, 'value', e.target.value)}
                      className="bg-white border-gray-100 border px-4 py-2 text-[13px] font-black text-[#1BAFAF] rounded-xl outline-none focus:ring-2 focus:ring-[#1BAFAF]/10"
                    />
                    <input 
                      placeholder="Artisans"
                      value={stat.label}
                      onChange={(e) => updateStat(stat.id, 'label', e.target.value)}
                      className="bg-white border-gray-100 border px-4 py-2 text-[11px] font-bold text-gray-500 rounded-xl outline-none focus:ring-2 focus:ring-[#1BAFAF]/10"
                    />
                  </div>
                  <button onClick={() => removeStat(stat.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Narrative Content */}
        <div className="xl:col-span-7 space-y-8">
           <div className="bg-white border border-gray-100 rounded-[3rem] p-10 shadow-sm space-y-8">
             
             {/* Subheading/Accent */}
             <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Thematic Accent</label>
                <input 
                  type="text"
                  placeholder="Our Purpose"
                  value={data.accent}
                  onChange={(e) => updateField('accent', e.target.value)}
                  className="w-full bg-gray-50 border-none px-6 py-4 text-[13px] font-bold text-[#B18968] rounded-2xl focus:ring-2 focus:ring-[#B18968]/20 focus:bg-white transition-all outline-none tracking-[0.3em] uppercase"
                />
             </div>

             {/* Main Title */}
             <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Main Narrative Title</label>
                <textarea 
                  rows={2}
                  placeholder="Empowering Every Stitch..."
                  value={data.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  className="w-full bg-gray-50 border-none px-6 py-4 text-[24px] font-bold text-gray-900 rounded-2xl focus:ring-2 focus:ring-[#1BAFAF]/20 focus:bg-white transition-all outline-none leading-tight"
                />
             </div>

             {/* Content Body */}
             <div className="space-y-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Manifesto Description</label>
                  <Quote size={14} className="text-gray-200" />
                </div>
                <textarea 
                  rows={6}
                  placeholder="The story of MayaSindhu..."
                  value={data.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  className="w-full bg-gray-50 border-none px-6 py-4 text-[14px] font-medium text-gray-600 rounded-3xl focus:ring-2 focus:ring-[#1BAFAF]/20 focus:bg-white transition-all outline-none leading-relaxed"
                />
             </div>

             {/* CTA Button */}
             <div className="pt-4 border-t border-gray-50 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Button Text</label>
                  <input 
                    type="text"
                    placeholder="Our Full Manifesto"
                    value={data.buttonText}
                    onChange={(e) => updateField('buttonText', e.target.value)}
                    className="w-full bg-gray-50 border-none px-6 py-3 text-[13px] font-bold text-gray-900 rounded-2xl focus:ring-2 focus:ring-[#1BAFAF]/20 focus:bg-white transition-all outline-none"
                  />
                </div>
                <div className="flex items-end justify-end pb-1 pr-4">
                   <div className="flex items-center gap-2 text-[11px] font-black text-[#B18968] uppercase tracking-widest opacity-40">
                     <Heart size={14} /> Brand Identity
                   </div>
                </div>
             </div>

           </div>
        </div>
      </div>
    </div>
  );
}
