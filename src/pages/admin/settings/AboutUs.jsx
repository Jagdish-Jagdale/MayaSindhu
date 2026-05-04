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
  Users,
  Plus,
  Trash2,
  Layout,
  Image as ImageIcon
} from 'lucide-react';
import toast from 'react-hot-toast';
import { uploadToCloudinary } from '../../../utils/cloudinary';

export default function AboutUs() {
  const { isCollapsed } = useAdminUI();
  const [data, setData] = useState({
    bgImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=1600&q=80',
    title: 'Who We Are',
    subTitle: 'Our Journey',
    heading: 'Crafting Elegance with Heart',
    description: 'We believe that beauty is not just in the final product, but in the hands that create it. Our mission is to empower local artisans while bringing you the finest craftsmanship.',
    productImage: 'https://images.unsplash.com/photo-1590736704228-a4004944883f?w=1000&q=80',
    secondaryTitle: 'Impact & Heritage',
    secondarySubtitle: 'Built on Trust',
    stats: [
      { id: 1, count: '500+', text: 'Artisans Supported' },
      { id: 2, count: '50+', text: 'Years of Heritage' },
      { id: 3, count: '100k+', text: 'Happy Customers' },
      { id: 4, count: '25+', text: 'Design Awards' }
    ]
  });

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  const bgFileInputRef = useRef(null);
  const prodFileInputRef = useRef(null);
  const [pendingBgFile, setPendingBgFile] = useState(null);
  const [pendingProdFile, setPendingProdFile] = useState(null);

  // Load Data
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'aboutUs'), (docSnap) => {
      if (docSnap.exists()) {
        setData(prev => ({ ...prev, ...docSnap.data() }));
      }
      setLoading(false);
      setHasChanges(false);
    }, (error) => {
      console.error(error);
      setLoading(false);
      toast.error("Failed to load about us details");
    });
    return () => unsub();
  }, []);

  const handleFileSelect = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    if (type === 'bg') {
      setPendingBgFile(file);
      setData(prev => ({ ...prev, bgImage: previewUrl }));
    } else {
      setPendingProdFile(file);
      setData(prev => ({ ...prev, productImage: previewUrl }));
    }
    setHasChanges(true);
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

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      let finalBgUrl = data.bgImage;
      let finalProdUrl = data.productImage;

      if (pendingBgFile) {
        try {
          finalBgUrl = await uploadToCloudinary(pendingBgFile, 'AboutUs_BG');
        } catch (err) {
          toast.error('Failed to upload background image');
          setIsSaving(false);
          return;
        }
      }

      if (pendingProdFile) {
        try {
          finalProdUrl = await uploadToCloudinary(pendingProdFile, 'AboutUs_Prod');
        } catch (err) {
          toast.error('Failed to upload product image');
          setIsSaving(false);
          return;
        }
      }

      await setDoc(doc(db, 'settings', 'aboutUs'), {
        ...data,
        bgImage: finalBgUrl,
        productImage: finalProdUrl,
        updatedAt: serverTimestamp()
      });
      
      setPendingBgFile(null);
      setPendingProdFile(null);
      setHasChanges(false);
      toast.success("About Us section updated successfully");
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
        <p className="text-[14px] font-medium text-gray-400">Loading section details...</p>
      </div>
    );
  }

  return (
    <div className={`mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 transition-all duration-300 ${isCollapsed ? 'max-w-[1600px]' : 'max-w-[1280px]'}`} style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}>
      
      <input type="file" ref={bgFileInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileSelect(e, 'bg')} />
      <input type="file" ref={prodFileInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileSelect(e, 'prod')} />

      {/* Header Section */}
      <div className="space-y-4 py-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-[22px] font-semibold text-gray-900 tracking-tight text-left">About Us Section</h1>
            <p className="text-[12px] text-gray-400 font-medium tracking-tight text-left">Configure the brand story, impact metrics, and visual heritage elements.</p>
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
          </div>
        </div>
        <hr className="border-gray-100" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Images & Assets */}
        <div className="xl:col-span-5 space-y-8">
          {/* Background Image */}
          <div className="bg-white border border-gray-100 rounded-[3rem] p-6 shadow-sm group">
             <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 block ml-2 text-left">Section Background Image</label>
             <div className="relative aspect-video rounded-[2rem] overflow-hidden bg-gray-50 border-4 border-white shadow-xl shadow-gray-100/50">
               <img src={data.bgImage} className="w-full h-full object-cover" alt="" />
               <button 
                onClick={() => bgFileInputRef.current?.click()}
                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center text-white backdrop-blur-[2px]"
               >
                 <Camera size={32} className="mb-2" />
                 <span className="text-[11px] font-bold uppercase tracking-wider">Update Background</span>
               </button>
             </div>
          </div>

          {/* Product/Showcase Image */}
          <div className="bg-white border border-gray-100 rounded-[3rem] p-6 shadow-sm group">
             <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 block ml-2 text-left">Feature Image</label>
             <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-gray-50 border-4 border-white shadow-xl shadow-gray-100/50 max-w-[80%] mx-auto">
               <img src={data.productImage} className="w-full h-full object-cover" alt="" />
               <button 
                onClick={() => prodFileInputRef.current?.click()}
                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center text-white backdrop-blur-[2px]"
               >
                 <Camera size={32} className="mb-2" />
                 <span className="text-[11px] font-bold uppercase tracking-wider">Update Feature Image</span>
               </button>
             </div>
          </div>
        </div>

        {/* Right Column: Text Content & Stats */}
        <div className="xl:col-span-7 space-y-8">
          <div className="bg-white border border-gray-100 rounded-[3rem] p-10 shadow-sm space-y-8">
            
            {/* Top Titles */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 text-left block">Section Title</label>
                 <input 
                   type="text"
                   value={data.title}
                   onChange={(e) => updateField('title', e.target.value)}
                   className="w-full bg-gray-50 border-none px-6 py-4 text-[13px] font-bold text-[#B18968] rounded-2xl focus:ring-2 focus:ring-[#B18968]/20 focus:bg-white transition-all outline-none uppercase tracking-widest"
                 />
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 text-left block">Section Subtitle</label>
                 <input 
                   type="text"
                   value={data.subTitle}
                   onChange={(e) => updateField('subTitle', e.target.value)}
                   className="w-full bg-gray-50 border-none px-6 py-4 text-[13px] font-bold text-gray-900 rounded-2xl focus:ring-2 focus:ring-[#1BAFAF]/20 focus:bg-white transition-all outline-none"
                 />
              </div>
            </div>

            {/* Main Heading */}
            <div className="space-y-2">
               <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 text-left block">Main Heading</label>
               <textarea 
                 rows={2}
                 value={data.heading}
                 onChange={(e) => updateField('heading', e.target.value)}
                 className="w-full bg-gray-50 border-none px-6 py-4 text-[24px] font-bold text-gray-900 rounded-2xl focus:ring-2 focus:ring-[#1BAFAF]/20 focus:bg-white transition-all outline-none leading-tight"
               />
            </div>

            {/* Description */}
            <div className="space-y-2">
               <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 text-left block">Narrative Description</label>
               <textarea 
                 rows={5}
                 value={data.description}
                 onChange={(e) => updateField('description', e.target.value)}
                 className="w-full bg-gray-50 border-none px-6 py-4 text-[14px] font-medium text-gray-600 rounded-3xl focus:ring-2 focus:ring-[#1BAFAF]/20 focus:bg-white transition-all outline-none leading-relaxed"
               />
            </div>

            <hr className="border-gray-50" />

            {/* Footer Titles */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 text-left block">Secondary Title</label>
                 <input 
                   type="text"
                   value={data.secondaryTitle}
                   onChange={(e) => updateField('secondaryTitle', e.target.value)}
                   className="w-full bg-gray-50 border-none px-6 py-4 text-[13px] font-bold text-[#B18968] rounded-2xl focus:ring-2 focus:ring-[#B18968]/20 focus:bg-white transition-all outline-none uppercase tracking-widest"
                 />
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 text-left block">Secondary Subtitle</label>
                 <input 
                   type="text"
                   value={data.secondarySubtitle}
                   onChange={(e) => updateField('secondarySubtitle', e.target.value)}
                   className="w-full bg-gray-50 border-none px-6 py-4 text-[13px] font-bold text-gray-900 rounded-2xl focus:ring-2 focus:ring-[#1BAFAF]/20 focus:bg-white transition-all outline-none"
                 />
              </div>
            </div>

            {/* Stats Manager */}
            <div className="space-y-4">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 text-left block">Impact Statistics (4 Slots)</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.stats.map((stat) => (
                  <div key={stat.id} className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 space-y-3">
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1 block ml-1 text-left">Count</label>
                        <input 
                          value={stat.count}
                          onChange={(e) => updateStat(stat.id, 'count', e.target.value)}
                          className="w-full bg-white border border-gray-100 px-4 py-2 text-[13px] font-black text-[#1BAFAF] rounded-xl outline-none"
                        />
                      </div>
                      <div className="flex-[2]">
                        <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1 block ml-1 text-left">Text</label>
                        <input 
                          value={stat.text}
                          onChange={(e) => updateStat(stat.id, 'text', e.target.value)}
                          className="w-full bg-white border border-gray-100 px-4 py-2 text-[11px] font-bold text-gray-500 rounded-xl outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
