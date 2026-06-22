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
  Layers,
  Sparkles,
  BarChart3,
  Image as ImageIcon,
  Type,
  Layout,
  Plus,
  Trash2,
  Link as LinkIcon,
  X,
  ChevronDown
} from 'lucide-react';
import toast from 'react-hot-toast';
import { uploadToCloudinary } from '../../../utils/cloudinary';
import DeleteConfirmationModal from '../../../components/admin/DeleteConfirmationModal';

export default function AboutUs() {
  const { isCollapsed } = useAdminUI();
  const [data, setData] = useState({
    aboutUs: {
      heading: '',
      subheading: ''
    },
    featuredStory: {
      title: '',
      description: '',
      image1: '',
      image2: '',
      highlight: {
        title: '',
        description: '',
        image: ''
      }
    },
    statsSection: {
      title: '',
      description: '',
      stats: [
        { id: 1, label: '', value: '' },
        { id: 2, label: '', value: '' },
        { id: 3, label: '', value: '' },
        { id: 4, label: '', value: '' }
      ]
    }
  });

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [targetToDelete, setTargetToDelete] = useState(null);

  const img1Ref = useRef(null);
  const img2Ref = useRef(null);
  const imgHighlightRef = useRef(null);

  const [pendingFiles, setPendingFiles] = useState({
    image1: null,
    image2: null,
    highlightImage: null
  });

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'aboutus', 'content'), (docSnap) => {
      if (docSnap.exists()) {
        setData(prev => ({ ...prev, ...docSnap.data() }));
      }
      setLoading(false);
      setHasChanges(false);
    }, (error) => {
      setLoading(false);
      toast.error("Failed to load details");
    });
    return () => unsub();
  }, []);

  const handleFileSelect = (e, target) => {
    const file = e.target.files[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setPendingFiles(prev => ({ ...prev, [target]: file }));

    if (target === 'image1') {
      setData(prev => ({ ...prev, featuredStory: { ...prev.featuredStory, image1: previewUrl } }));
    } else if (target === 'image2') {
      setData(prev => ({ ...prev, featuredStory: { ...prev.featuredStory, image2: previewUrl } }));
    } else if (target === 'highlightImage') {
      setData(prev => ({ ...prev, featuredStory: { ...prev.featuredStory, highlight: { ...prev.featuredStory.highlight, image: previewUrl } } }));
    }

    setHasChanges(true);
    e.target.value = null;
  };

  const updateImageByLink = (target, url) => {
    if (target === 'image1') {
      setData(prev => ({ ...prev, featuredStory: { ...prev.featuredStory, image1: url } }));
      setPendingFiles(prev => ({ ...prev, image1: null }));
    } else if (target === 'image2') {
      setData(prev => ({ ...prev, featuredStory: { ...prev.featuredStory, image2: url } }));
      setPendingFiles(prev => ({ ...prev, image2: null }));
    } else if (target === 'highlightImage') {
      setData(prev => ({ ...prev, featuredStory: { ...prev.featuredStory, highlight: { ...prev.featuredStory.highlight, image: url } } }));
      setPendingFiles(prev => ({ ...prev, highlightImage: null }));
    }
    setHasChanges(true);
  };

  const removeImage = (target) => {
    setTargetToDelete(target);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (!targetToDelete) return;
    const target = targetToDelete;

    if (target === 'image1') {
      setData(prev => ({ ...prev, featuredStory: { ...prev.featuredStory, image1: '' } }));
      setPendingFiles(prev => ({ ...prev, image1: null }));
    } else if (target === 'image2') {
      setData(prev => ({ ...prev, featuredStory: { ...prev.featuredStory, image2: '' } }));
      setPendingFiles(prev => ({ ...prev, image2: null }));
    } else if (target === 'highlightImage') {
      setData(prev => ({ ...prev, featuredStory: { ...prev.featuredStory, highlight: { ...prev.featuredStory.highlight, image: '' } } }));
      setPendingFiles(prev => ({ ...prev, highlightImage: null }));
    }
    setHasChanges(true);
    setIsDeleteModalOpen(false);
    setTargetToDelete(null);
    toast.success("Image removed locally. Save to confirm.");
  };

  const updateAboutUs = (field, value) => {
    setData(prev => ({ ...prev, aboutUs: { ...prev.aboutUs, [field]: value } }));
    setHasChanges(true);
  };

  const updateFeaturedStory = (field, value, isHighlight = false) => {
    if (isHighlight) {
      setData(prev => ({ ...prev, featuredStory: { ...prev.featuredStory, highlight: { ...prev.featuredStory.highlight, [field]: value } } }));
    } else {
      setData(prev => ({ ...prev, featuredStory: { ...prev.featuredStory, [field]: value } }));
    }
    setHasChanges(true);
  };

  const updateStatsSection = (field, value) => {
    setData(prev => ({ ...prev, statsSection: { ...prev.statsSection, [field]: value } }));
    setHasChanges(true);
  };

  const updateStatItem = (id, field, value) => {
    setData(prev => ({
      ...prev,
      statsSection: { ...prev.statsSection, stats: prev.statsSection.stats.map(s => s.id === id ? { ...s, [field]: value } : s) }
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      let updatedData = { ...data };

      if (pendingFiles.image1) updatedData.featuredStory.image1 = await uploadToCloudinary(pendingFiles.image1, 'AboutUs/Featured');
      if (pendingFiles.image2) updatedData.featuredStory.image2 = await uploadToCloudinary(pendingFiles.image2, 'AboutUs/Featured');
      if (pendingFiles.highlightImage) updatedData.featuredStory.highlight.image = await uploadToCloudinary(pendingFiles.highlightImage, 'AboutUs/Highlight');

      await setDoc(doc(db, 'aboutus', 'content'), { ...updatedData, updatedAt: serverTimestamp() });
      setPendingFiles({ image1: null, image2: null, highlightImage: null });
      setHasChanges(false);
      toast.success("All changes saved successfully");
    } catch (err) {
      toast.error("Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  const ImageUploader = ({ label, value, onUpload, onLinkChange, onDelete, inputRef }) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</span>
      </div>
      <div className="relative aspect-[3/4] rounded-3xl overflow-hidden bg-gray-50 border border-gray-100 shadow-sm group">
        {value ? (
          <>
            <img src={value} className="w-full h-full object-cover" alt="" />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-3 backdrop-blur-sm">
              <div className="flex gap-2">
                <button
                  onClick={() => inputRef.current?.click()}
                  className="p-3 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all active:scale-95"
                >
                  <Camera size={18} />
                </button>
                <button
                  onClick={onDelete}
                  className="p-3 bg-red-500/20 hover:bg-red-500/40 rounded-xl text-red-200 transition-all active:scale-95"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <button
            onClick={() => inputRef.current?.click()}
            className="w-full h-full flex flex-col items-center justify-center text-gray-200 hover:text-[#1BAFAF] hover:bg-gray-100/50 transition-all gap-2"
          >
            <ImageIcon size={32} strokeWidth={1.5} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Select Image</span>
          </button>
        )}
      </div>
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#1BAFAF] transition-colors">
          <LinkIcon size={12} />
        </div>
        <input
          type="text"
          placeholder="External link..."
          value={value && value.startsWith('blob:') ? '' : value}
          onChange={(e) => onLinkChange(e.target.value)}
          className="w-full bg-gray-50 border-none px-10 py-2.5 text-[12px] font-medium text-gray-500 rounded-xl focus:bg-white transition-all outline-none"
        />
        {value && (
          <button
            onClick={onDelete}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-red-500 transition-colors"
          >
            <X size={12} />
          </button>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="h-[60vh] w-full flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#1BAFAF]" />
        <p className="text-[14px] font-medium text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className={`mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 transition-all duration-300 ${isCollapsed ? 'max-w-[1600px]' : 'max-w-[1280px]'}`} style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}>

      <input type="file" ref={img1Ref} className="hidden" accept="image/*" onChange={(e) => handleFileSelect(e, 'image1')} />
      <input type="file" ref={img2Ref} className="hidden" accept="image/*" onChange={(e) => handleFileSelect(e, 'image2')} />
      <input type="file" ref={imgHighlightRef} className="hidden" accept="image/*" onChange={(e) => handleFileSelect(e, 'highlightImage')} />

      {/* Header Section - EXACT match to Product Management */}
      <div className="space-y-2 py-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-semibold text-gray-900 tracking-tight">
              About Us Settings
            </h1>
            <p className="text-[12px] text-gray-400 font-medium tracking-normal">Manage images via upload or external links, narratives, and statistics</p>
          </div>
          <button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:grayscale ${!hasChanges ? 'bg-gray-100 text-gray-400' : 'bg-[#1BAFAF] hover:bg-[#17a0a0] text-white shadow-[#1BAFAF]/10'
              }`}
          >
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} strokeWidth={2.5} />}
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
        <hr className="border-gray-100" />
      </div>

      <div className="space-y-8 pb-20">
        {/* Core Section - No header label, clean cards */}
        <section className="bg-white border border-gray-100 rounded-[1.5rem] p-8 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <div className="px-1"><span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Main Heading</span></div>
            <input type="text" value={data.aboutUs.heading} onChange={(e) => updateAboutUs('heading', e.target.value)} className="w-full bg-gray-50 border-none px-6 py-4 text-[15px] font-bold text-gray-800 rounded-2xl focus:ring-2 focus:ring-[#1BAFAF]/10 transition-all outline-none" />
          </div>
          <div className="space-y-3">
            <div className="px-1"><span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Subheading</span></div>
            <input type="text" value={data.aboutUs.subheading} onChange={(e) => updateAboutUs('subheading', e.target.value)} className="w-full bg-gray-50 border-none px-6 py-4 text-[15px] font-medium text-gray-500 rounded-2xl focus:ring-2 focus:ring-[#1BAFAF]/10 transition-all outline-none" />
          </div>
        </section>

        {/* Featured Story - Standardized Icons and Spacing */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500"><Layout size={16} /></div>
            <h2 className="text-[12px] font-bold text-gray-400 uppercase tracking-[0.2em]">Featured Story</h2>
          </div>
          <div className="bg-white border border-gray-100 rounded-[1.5rem] p-8 shadow-sm space-y-10">
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
              <div className="xl:col-span-5 space-y-8">
                <div className="space-y-3">
                  <div className="px-1"><span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Story Title</span></div>
                  <input type="text" value={data.featuredStory.title} onChange={(e) => updateFeaturedStory('title', e.target.value)} className="w-full bg-gray-50 border-none px-6 py-4 text-[18px] font-bold text-gray-800 rounded-2xl focus:ring-2 focus:ring-orange-200/20 transition-all outline-none" />
                </div>
                <div className="space-y-3">
                  <div className="px-1"><span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Story Description</span></div>
                  <textarea rows={8} value={data.featuredStory.description} onChange={(e) => updateFeaturedStory('description', e.target.value)} className="w-full bg-gray-50 border-none px-6 py-4 text-[14px] font-medium text-gray-600 rounded-2xl focus:ring-2 focus:ring-orange-200/20 transition-all outline-none leading-relaxed resize-none" />
                </div>
              </div>
              <div className="xl:col-span-7 grid grid-cols-2 gap-8">
                <ImageUploader label="Primary Image" value={data.featuredStory.image1} inputRef={img1Ref} onLinkChange={(url) => updateImageByLink('image1', url)} onDelete={() => removeImage('image1')} />
                <ImageUploader label="Secondary Image" value={data.featuredStory.image2} inputRef={img2Ref} onLinkChange={(url) => updateImageByLink('image2', url)} onDelete={() => removeImage('image2')} />
              </div>
            </div>

            <div className="bg-gray-50/50 rounded-[2rem] p-8 space-y-8 border border-gray-100">
              <div className="flex items-center gap-2 text-gray-400 px-1">
                <Layers size={14} className="text-orange-300" />
                <span className="text-[10px] font-black uppercase tracking-widest">Story Highlight Section</span>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                <div className="lg:col-span-4">
                  <ImageUploader label="Highlight Cover" value={data.featuredStory.highlight.image} inputRef={imgHighlightRef} onLinkChange={(url) => updateImageByLink('highlightImage', url)} onDelete={() => removeImage('highlightImage')} />
                </div>
                <div className="lg:col-span-8 space-y-8">
                  <div className="space-y-3">
                    <div className="px-1"><span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Highlight Heading</span></div>
                    <input type="text" value={data.featuredStory.highlight.title} onChange={(e) => updateFeaturedStory('title', e.target.value, true)} className="w-full bg-white border-none px-6 py-4 text-[15px] font-bold text-gray-800 rounded-2xl focus:ring-2 focus:ring-orange-200/20 transition-all outline-none" />
                  </div>
                  <div className="space-y-3">
                    <div className="px-1"><span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Highlight Narrative</span></div>
                    <textarea rows={4} value={data.featuredStory.highlight.description} onChange={(e) => updateFeaturedStory('description', e.target.value, true)} className="w-full bg-white border-none px-6 py-4 text-[14px] font-medium text-gray-600 rounded-2xl focus:ring-2 focus:ring-orange-200/20 transition-all outline-none leading-relaxed resize-none" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Impact Stats */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500"><BarChart3 size={16} /></div>
            <h2 className="text-[12px] font-bold text-gray-400 uppercase tracking-[0.2em]">Impact Statistics</h2>
          </div>
          <div className="bg-white border border-gray-100 rounded-[1.5rem] p-8 shadow-sm space-y-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {data.statsSection.stats.map((stat) => (
                <div key={stat.id} className="bg-gray-50 p-6 rounded-[1.5rem] space-y-4 border border-transparent hover:border-purple-100 transition-all group">
                  <div className="space-y-2">
                    <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest block ml-1">Stat Count</span>
                    <input value={stat.value} onChange={(e) => updateStatItem(stat.id, 'value', e.target.value)} placeholder="e.g. 500+" className="w-full bg-white border-none px-4 py-3 text-[16px] font-black text-[#1BAFAF] rounded-xl outline-none focus:ring-2 focus:ring-purple-200/30" />
                  </div>
                  <div className="space-y-2">
                    <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest block ml-1">Stat Label</span>
                    <input value={stat.label} onChange={(e) => updateStatItem(stat.id, 'label', e.target.value)} placeholder="e.g. Artisans" className="w-full bg-white border-none px-4 py-3 text-[13px] font-bold text-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-purple-200/30" />
                  </div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-4">
              <div className="space-y-3">
                <div className="px-1"><span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Narrative Title</span></div>
                <input type="text" value={data.statsSection.title} onChange={(e) => updateStatsSection('title', e.target.value)} className="w-full bg-gray-50 border-none px-6 py-4 text-[15px] font-bold text-gray-800 rounded-2xl focus:ring-2 focus:ring-purple-200/20 transition-all outline-none" />
              </div>
              <div className="space-y-3">
                <div className="px-1"><span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Narrative Description</span></div>
                <textarea rows={3} value={data.statsSection.description} onChange={(e) => updateStatsSection('description', e.target.value)} className="w-full bg-gray-50 border-none px-6 py-4 text-[14px] font-medium text-gray-600 rounded-2xl focus:ring-2 focus:ring-purple-200/20 transition-all outline-none leading-relaxed resize-none" />
              </div>
            </div>
          </div>
        </section>
      </div>

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        itemName="this image"
      />
    </div>
  );
}
