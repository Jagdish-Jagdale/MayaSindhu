import React, { useState, useEffect, useRef } from 'react';
import { useAdminUI } from '../../../context/AdminUIContext';
import { db } from '../../../firebase';
import { 
  doc, 
  onSnapshot, 
  setDoc,
  deleteDoc,
  collection,
  query,
  orderBy,
  getDocs,
  serverTimestamp
} from 'firebase/firestore';
import { 
  Save, 
  Loader2, 
  Camera,
  Heart,
  Plus,
  Trash2,
  Quote,
  Image as ImageIcon,
  Link as LinkIcon,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import toast from 'react-hot-toast';
import { uploadToCloudinary } from '../../../utils/cloudinary';
import DeleteConfirmationModal from '../../../components/admin/DeleteConfirmationModal';

export default function Purpose() {
  const { isCollapsed } = useAdminUI();
  const [data, setData] = useState({
    accent: 'Our Manifesto',
    title: 'Empowering Every Stitch, Supporting Every Artisan.',
    description: 'MayaSindhu was born from a desire to bridge the gap between ancient craftsmanship and the modern muse. We work directly with over 200 women-led artisan clusters across the subcontinent, ensuring fair wages and preserving heritage techniques that have been passed down through generations.',
    image: 'https://images.unsplash.com/photo-1590736704228-a4004944883f?w=1000&q=80',
    buttonText: 'Our Full Manifesto',
    stats: [
      { id: 1, value: '200+', label: 'Artisans Empowered' },
      { id: 2, value: '15+', label: 'Heritage Crafts' }
    ],
    helpingHandHeader: 'The Artisan Journal',
    helpingHandSubheader: 'Empowering Heritage',
    helpingHandButtonText: 'Read Story',
    helpingHandTitle: '',
    helpingHandAboutHeading: '',
    helpingHandAboutDescription: '',
    helpingHandImage: '',
    bottomTitle: 'Commitment',
    bottomHeading: 'Empowering Heritage',
    bottomSubheading: '"We believe that a garment without a soul is just a cloth."',
    bottomStats: [
      { id: 1, value: '200+', label: 'Artisans' },
      { id: 2, value: '15', label: 'Clusters' },
      { id: 3, value: '18', label: 'Crafts' },
      { id: 4, value: '1200+', label: 'Impact' }
    ]
  });

  const [artisans, setArtisans] = useState([]);
  const [deletedArtisanIds, setDeletedArtisanIds] = useState([]);
  const [pendingArtisanFiles, setPendingArtisanFiles] = useState({});
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [expandedCards, setExpandedCards] = useState({});
  
  const fileInputRef = useRef(null);
  const [pendingFile, setPendingFile] = useState(null);

  const helpingHandFileRef = useRef(null);
  const [pendingHelpingHandFile, setPendingHelpingHandFile] = useState(null);

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [statToDeleteId, setStatToDeleteId] = useState(null);
  const [statToDeleteLabel, setStatToDeleteLabel] = useState("");
  const [artisanToDelete, setArtisanToDelete] = useState(null);

  const loadArtisans = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, 'artisans'), orderBy('createdAt', 'desc')));
      const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setArtisans(list);
    } catch (error) {
      console.error("Artisans fetch error:", error);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // Load Data
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'ourPurpose', 'main'), (docSnap) => {
      if (docSnap.exists()) {
        setData(prev => ({ ...prev, ...docSnap.data() }));
      }
    }, (error) => {
      console.error(error);
      toast.error("Failed to load manifesto details");
    });

    loadArtisans(true);

    return () => unsub();
  }, []);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setPendingFile(file);
    setData(prev => ({ ...prev, image: previewUrl }));
    setHasChanges(true);
    e.target.value = null;
  };

  const handleHelpingHandFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setPendingHelpingHandFile(file);
    setData(prev => ({ ...prev, helpingHandImage: previewUrl }));
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

  const removeStat = (stat) => {
    setStatToDeleteId(stat.id);
    setStatToDeleteLabel(stat.label);
    setIsDeleteModalOpen(true);
  };

  const toggleCardExpansion = (id) => {
    setExpandedCards(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleAddArtisan = () => {
    const tempId = 'temp_' + Date.now();
    const newArtisan = {
      id: tempId,
      name: '',
      photo: '',
      address: '',
      product: '',
      speciality: '',
      story: '',
      experience: '',
      experienceLabel: 'Experience',
      crafted: '',
      craftedLabel: 'Masterpieces',
      teamSize: '',
      teamSizeLabel: 'Team',
      generations: '',
      generationsLabel: 'Heritage',
      since: new Date().getFullYear().toString(),
      createdAt: new Date().toISOString()
    };
    setArtisans(prev => [newArtisan, ...prev]);
    setExpandedCards(prev => ({ ...prev, [tempId]: true }));
    setHasChanges(true);
  };

  const handleRemoveArtisan = (artisan) => {
    setArtisanToDelete(artisan);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (statToDeleteId) {
      setData(prev => ({
        ...prev,
        stats: prev.stats.filter(s => s.id !== statToDeleteId)
      }));
      setHasChanges(true);
      setIsDeleteModalOpen(false);
      setStatToDeleteId(null);
      setStatToDeleteLabel("");
    } else if (artisanToDelete) {
      setDeletedArtisanIds(prev => [...prev, artisanToDelete.id]);
      setArtisans(prev => prev.filter(a => a.id !== artisanToDelete.id));
      setHasChanges(true);
      setIsDeleteModalOpen(false);
      setArtisanToDelete(null);
      toast.success("Helping Hand removed locally. Save to confirm.");
    }
  };

  const updateArtisanField = (id, field, value) => {
    setArtisans(prev => prev.map(a => a.id === id ? { ...a, [field]: value } : a));
    setHasChanges(true);
  };

  const handleArtisanFileSelect = (e, id) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setPendingArtisanFiles(prev => ({ ...prev, [id]: file }));
    updateArtisanField(id, 'photo', previewUrl);
  };

  const triggerArtisanFileSelect = (id) => {
    document.getElementById(`file-${id}`)?.click();
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      let finalImageUrl = data.image;
      if (pendingFile) {
        try {
          finalImageUrl = await uploadToCloudinary(pendingFile, 'Purpose');
        } catch (err) {
          toast.error('Failed to upload main image');
          setIsSaving(false);
          return;
        }
      }

      let finalHelpingHandImageUrl = data.helpingHandImage;
      if (pendingHelpingHandFile) {
        try {
          finalHelpingHandImageUrl = await uploadToCloudinary(pendingHelpingHandFile, 'Purpose');
        } catch (err) {
          toast.error('Failed to upload section image');
          setIsSaving(false);
          return;
        }
      }

      // Save main doc
      await setDoc(doc(db, 'ourPurpose', 'main'), {
        ...data,
        image: finalImageUrl,
        helpingHandImage: finalHelpingHandImageUrl,
        updatedAt: serverTimestamp()
      });

      // Save artisans
      for (const artisan of artisans) {
        let finalPhotoUrl = artisan.photo;
        if (artisan.photo && artisan.photo.startsWith('blob:')) {
          const fileToUpload = pendingArtisanFiles[artisan.id];
          if (fileToUpload) {
            try {
              finalPhotoUrl = await uploadToCloudinary(fileToUpload, 'Artisans');
            } catch (err) {
              toast.error(`Failed to upload photo for ${artisan.name || 'Artisan'}`);
              continue;
            }
          }
        }

        const isNew = artisan.id.startsWith('temp_');
        const docId = isNew ? doc(collection(db, 'temp')).id : artisan.id;
        const artisanRef = doc(db, 'artisans', docId);

        const toSave = {
          ...artisan,
          photo: finalPhotoUrl,
          updatedAt: serverTimestamp()
        };

        if (isNew) {
          delete toSave.id;
          toSave.createdAt = serverTimestamp();
        }

        await setDoc(artisanRef, toSave, { merge: true });
      }

      // Delete removed artisans
      for (const deletedId of deletedArtisanIds) {
        if (!deletedId.startsWith('temp_')) {
          await deleteDoc(doc(db, 'artisans', deletedId));
        }
      }

      // Reload artisans to get the correct document IDs from Firestore
      await loadArtisans(false);

      setPendingFile(null);
      setPendingHelpingHandFile(null);
      setPendingArtisanFiles({});
      setDeletedArtisanIds([]);
      setHasChanges(false);
      toast.success("Our Manifesto updated successfully");
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
            <h1 className="text-[22px] font-semibold text-gray-900 tracking-tight">Our Manifesto</h1>
            <p className="text-[12px] text-gray-400 font-medium font-inter tracking-tight">Refine the brand manifesto and impact stories that define your heritage.</p>
          </div>
          <div className="flex items-center gap-3">
            {(hasChanges || deletedArtisanIds.length > 0) && (
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

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Column: Spotlight Image */}
        <div className="xl:col-span-5 flex flex-col h-full">
          <div className="bg-white border border-gray-100 rounded-[3rem] p-6 shadow-sm overflow-hidden group flex flex-col flex-1 h-full justify-between">
             <div className="flex-1 flex flex-col">
               <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 block ml-2">Spotlight Image</label>
               <div className="relative flex-1 rounded-[2.5rem] overflow-hidden bg-gray-50 border-4 border-white shadow-xl shadow-gray-100/50 group-hover:scale-[1.01] transition-all duration-700 min-h-[400px]">
                 <img src={data.image} className="absolute inset-0 w-full h-full object-cover" alt="" />
                 <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center text-white backdrop-blur-[2px]"
                 >
                   <Camera size={32} className="mb-2" />
                   <span className="text-[11px] font-bold uppercase tracking-wider">Update Artistic View</span>
                 </button>
               </div>
             </div>

             {/* Image Link Input */}
             <div className="space-y-1 mt-4">
               <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider ml-1">Or Image Link</label>
               <input 
                 type="text"
                 placeholder="https://..."
                 value={data.image && data.image.startsWith('blob:') ? '' : data.image}
                 onChange={(e) => updateField('image', e.target.value)}
                 className="w-full bg-gray-50 border border-gray-100 px-4 py-2 text-[12px] font-medium text-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-[#1BAFAF]/10 focus:bg-white transition-all"
               />
             </div>
          </div>
        </div>

        {/* Right Column: Narrative Content */}
        <div className="xl:col-span-7 flex flex-col h-full">
           <div className="bg-white border border-gray-100 rounded-[3rem] p-10 shadow-sm space-y-8 flex flex-col flex-1 h-full justify-between">
             
             {/* Subheading/Accent */}
             <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Thematic Accent</label>
                <input 
                  type="text"
                  placeholder="Our Manifesto"
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

      {/* Impact Stats Manager - Placed horizontally below */}
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {data.stats.map((stat) => (
            <div key={stat.id} className="flex items-center gap-4 bg-gray-50/50 p-4 rounded-2xl border border-transparent hover:border-[#1BAFAF]/10 transition-all relative">
              <div className="flex-1 flex flex-col gap-2 min-w-0">
                <input 
                  placeholder="200+"
                  value={stat.value}
                  onChange={(e) => updateStat(stat.id, 'value', e.target.value)}
                  className="w-full bg-white border-gray-100 border px-3 py-1.5 text-[13px] font-black text-[#1BAFAF] rounded-xl outline-none focus:ring-2 focus:ring-[#1BAFAF]/10"
                />
                <input 
                  placeholder="Artisans"
                  value={stat.label}
                  onChange={(e) => updateStat(stat.id, 'label', e.target.value)}
                  className="w-full bg-white border-gray-100 border px-3 py-1.5 text-[11px] font-bold text-gray-500 rounded-xl outline-none focus:ring-2 focus:ring-[#1BAFAF]/10"
                />
              </div>
              <button 
                onClick={() => removeStat(stat)} 
                className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0"
                title="Remove Stat"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Our Purpose Card (replacing Helping Hands Card) */}
      <div className="bg-white border border-gray-100 rounded-[3rem] p-8 shadow-sm space-y-8">
        
        {/* Card Header (Top Text changed to Our Purpose, and button removed from here) */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-6">
          <label className="text-[12px] font-black text-gray-400 uppercase tracking-widest ml-2">Our Purpose</label>
        </div>

        {/* Section Inputs Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Section Header</label>
            <input 
              type="text"
              placeholder="e.g. The Artisan Journal"
              value={data.helpingHandHeader || ''}
              onChange={(e) => updateField('helpingHandHeader', e.target.value)}
              className="w-full bg-gray-50 border-none px-5 py-3 text-[13px] font-bold text-gray-800 rounded-2xl focus:ring-2 focus:ring-[#1BAFAF]/10 focus:bg-white transition-all outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Section Subheader</label>
            <input 
              type="text"
              placeholder="e.g. Empowering Heritage"
              value={data.helpingHandSubheader || ''}
              onChange={(e) => updateField('helpingHandSubheader', e.target.value)}
              className="w-full bg-gray-50 border-none px-5 py-3 text-[13px] font-bold text-gray-800 rounded-2xl focus:ring-2 focus:ring-[#1BAFAF]/10 focus:bg-white transition-all outline-none"
            />
          </div>
        </div>

        {/* Left column text inputs, Right column image uploader */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start border-t border-gray-100 pt-6">
          
          {/* Left Side: Title, About Heading, About Description */}
          <div className="lg:col-span-8 space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Title</label>
              <input 
                type="text"
                placeholder="e.g. Heritage Artisans"
                value={data.helpingHandTitle || ''}
                onChange={(e) => updateField('helpingHandTitle', e.target.value)}
                className="w-full bg-gray-50 border-none px-5 py-3 text-[13px] font-bold text-gray-800 rounded-2xl focus:ring-2 focus:ring-[#1BAFAF]/10 focus:bg-white transition-all outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">About Heading</label>
              <input 
                type="text"
                placeholder="e.g. Preserving Heritage Crafts"
                value={data.helpingHandAboutHeading || ''}
                onChange={(e) => updateField('helpingHandAboutHeading', e.target.value)}
                className="w-full bg-gray-50 border-none px-5 py-3 text-[13px] font-bold text-gray-800 rounded-2xl focus:ring-2 focus:ring-[#1BAFAF]/10 focus:bg-white transition-all outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">About Description</label>
              <textarea 
                rows={4}
                placeholder="Describe the purpose, background, or impact details..."
                value={data.helpingHandAboutDescription || ''}
                onChange={(e) => updateField('helpingHandAboutDescription', e.target.value)}
                className="w-full bg-gray-50 border-none px-5 py-3 text-[13px] font-medium text-gray-600 rounded-2xl focus:ring-2 focus:ring-[#1BAFAF]/10 focus:bg-white transition-all outline-none leading-relaxed resize-none"
              />
            </div>
          </div>

          {/* Right Side: Image Upload & Image Link */}
          <div className="lg:col-span-4 space-y-4">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Section Image</label>
            
            {/* Image upload container */}
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 shadow-sm group/section-img">
              {data.helpingHandImage ? (
                <>
                  <img src={data.helpingHandImage} className="w-full h-full object-cover" alt="" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-3 backdrop-blur-sm">
                    <button
                      onClick={() => helpingHandFileRef.current?.click()}
                      className="p-3 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all active:scale-95"
                    >
                      <Camera size={18} />
                    </button>
                  </div>
                </>
              ) : (
                <button
                  onClick={() => helpingHandFileRef.current?.click()}
                  className="w-full h-full flex flex-col items-center justify-center text-gray-300 hover:text-[#1BAFAF] hover:bg-gray-100/50 transition-all gap-2"
                >
                  <ImageIcon size={32} strokeWidth={1.5} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Select Image</span>
                </button>
              )}
              <input 
                type="file" 
                ref={helpingHandFileRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleHelpingHandFileSelect} 
              />
            </div>

            {/* Image Link Input */}
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider ml-1">Or Image Link</label>
              <input 
                type="text"
                placeholder="https://..."
                value={data.helpingHandImage && data.helpingHandImage.startsWith('blob:') ? '' : data.helpingHandImage}
                onChange={(e) => updateField('helpingHandImage', e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 px-4 py-2 text-[12px] font-medium text-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-[#1BAFAF]/10 focus:bg-white transition-all"
              />
            </div>
          </div>
        </div>

        {/* Helping Hand List Section - placed below */}
        <div className="border-t border-gray-100 pt-8 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-[14px] font-bold text-gray-800 tracking-tight">Helping Hands List</h3>
            <button 
              onClick={handleAddArtisan}
              className="flex items-center gap-2 bg-[#1BAFAF] hover:bg-[#17a0a0] text-white px-4 py-2 rounded-xl text-[12px] font-bold transition-all shadow-md shadow-[#1BAFAF]/10 active:scale-95"
            >
              <Plus size={14} strokeWidth={2.5} />
              Add Helping Hand
            </button>
          </div>

          {/* List of Helping Hands */}
          <div className="space-y-8">
            {artisans.map((artisan, index) => {
              const isExpanded = !!expandedCards[artisan.id];
              return (
                <div key={artisan.id} className="bg-gray-50/40 border border-gray-100 rounded-[2rem] p-6 space-y-6 relative hover:border-[#1BAFAF]/20 transition-all">
                  
                  {/* Card Header Row (always visible) */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Small Photo Circle Preview */}
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-white border border-gray-200 shadow-sm shrink-0 flex items-center justify-center">
                        {artisan.photo ? (
                          <img src={artisan.photo} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon size={18} className="text-gray-300" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-[13px] font-bold text-gray-800">
                          {artisan.name || 'Unnamed Artisan'}
                        </h4>
                        {artisan.product && (
                          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mt-0.5">
                            {artisan.product}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {/* Delete button */}
                      <button 
                        onClick={() => handleRemoveArtisan(artisan)}
                        className="text-gray-300 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-xl"
                        title="Remove Helping Hand"
                      >
                        <Trash2 size={18} />
                      </button>

                      {/* Expand/Collapse Chevron button */}
                      <button
                        onClick={() => toggleCardExpansion(artisan.id)}
                        className="text-gray-400 hover:text-[#1BAFAF] transition-colors p-2 hover:bg-gray-100 rounded-xl"
                        title={isExpanded ? "Collapse Details" : "Expand Details"}
                      >
                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start border-t border-gray-100 pt-6 animate-in fade-in slide-in-from-top-2 duration-300">
                      
                      {/* Left Column: Image upload & Image Link option below */}
                      <div className="lg:col-span-4 space-y-4">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Photo</label>
                        
                        {/* Photo upload container */}
                        <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-white border border-gray-200 shadow-sm group/photo">
                          {artisan.photo ? (
                            <>
                              <img src={artisan.photo} className="w-full h-full object-cover" alt="" />
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-3 backdrop-blur-sm">
                                <button
                                  onClick={() => triggerArtisanFileSelect(artisan.id)}
                                  className="p-3 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all active:scale-95"
                                >
                                  <Camera size={18} />
                                </button>
                              </div>
                            </>
                          ) : (
                            <button
                              onClick={() => triggerArtisanFileSelect(artisan.id)}
                              className="w-full h-full flex flex-col items-center justify-center text-gray-300 hover:text-[#1BAFAF] hover:bg-gray-100/50 transition-all gap-2"
                            >
                              <ImageIcon size={32} strokeWidth={1.5} />
                              <span className="text-[10px] font-bold uppercase tracking-widest">Select Image</span>
                            </button>
                          )}
                          <input 
                            type="file" 
                            id={`file-${artisan.id}`} 
                            className="hidden" 
                            accept="image/*" 
                            onChange={(e) => handleArtisanFileSelect(e, artisan.id)} 
                          />
                        </div>

                        {/* Image Link Option Below */}
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider ml-1">Or Image Link</label>
                          <input 
                            type="text"
                            placeholder="https://..."
                            value={artisan.photo && artisan.photo.startsWith('blob:') ? '' : artisan.photo}
                            onChange={(e) => updateArtisanField(artisan.id, 'photo', e.target.value)}
                            className="w-full bg-white border border-gray-100 px-4 py-2 text-[12px] font-medium text-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-[#1BAFAF]/10"
                          />
                        </div>
                      </div>

                      {/* Right Column: Location, Name, Work, Speciality, Story (multiline) */}
                      <div className="lg:col-span-8 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Name</label>
                            <input 
                              type="text"
                              placeholder="e.g. Rameshwar Prasad"
                              value={artisan.name || ''}
                              onChange={(e) => updateArtisanField(artisan.id, 'name', e.target.value)}
                              className="w-full bg-white border border-gray-100 px-4 py-2.5 text-[13px] font-bold text-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-[#1BAFAF]/10"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Location</label>
                            <input 
                              type="text"
                              placeholder="e.g. Varanasi, Uttar Pradesh"
                              value={artisan.address || ''}
                              onChange={(e) => updateArtisanField(artisan.id, 'address', e.target.value)}
                              className="w-full bg-white border border-gray-100 px-4 py-2.5 text-[13px] font-bold text-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-[#1BAFAF]/10"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Work / Product</label>
                            <input 
                              type="text"
                              placeholder="e.g. Heritage Banarasi Silk"
                              value={artisan.product || ''}
                              onChange={(e) => updateArtisanField(artisan.id, 'product', e.target.value)}
                              className="w-full bg-white border border-gray-100 px-4 py-2.5 text-[13px] font-bold text-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-[#1BAFAF]/10"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Speciality</label>
                            <input 
                              type="text"
                              placeholder="e.g. Mastering the 'Kadhwa' technique"
                              value={artisan.speciality || ''}
                              onChange={(e) => updateArtisanField(artisan.id, 'speciality', e.target.value)}
                              className="w-full bg-white border border-gray-100 px-4 py-2.5 text-[13px] font-bold text-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-[#1BAFAF]/10"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Story (Multiline)</label>
                          <textarea 
                            rows={3}
                            placeholder="The artisan story description..."
                            value={artisan.story || ''}
                            onChange={(e) => updateArtisanField(artisan.id, 'story', e.target.value)}
                            className="w-full bg-white border border-gray-100 px-4 py-2.5 text-[13px] font-medium text-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-[#1BAFAF]/10 leading-relaxed resize-none"
                          />
                        </div>

                        {/* 4 Stats Cards */}
                        <div className="space-y-2 pt-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Artisan Statistics (4 Cards)</label>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            
                            {/* Stat 1 */}
                            <div className="bg-white border border-gray-100 p-3 rounded-xl space-y-1">
                              <input 
                                value={artisan.experience || ''} 
                                onChange={(e) => updateArtisanField(artisan.id, 'experience', e.target.value)} 
                                placeholder="42 Years" 
                                className="w-full bg-transparent border-none text-[13px] font-black text-[#1BAFAF] outline-none p-0 focus:ring-0" 
                              />
                              <input 
                                value={artisan.experienceLabel || 'Experience'} 
                                onChange={(e) => updateArtisanField(artisan.id, 'experienceLabel', e.target.value)} 
                                placeholder="Experience" 
                                className="w-full bg-transparent border-none text-[9px] font-bold text-gray-400 uppercase p-0 focus:ring-0" 
                              />
                            </div>

                            {/* Stat 2 */}
                            <div className="bg-white border border-gray-100 p-3 rounded-xl space-y-1">
                              <input 
                                value={artisan.crafted || ''} 
                                onChange={(e) => updateArtisanField(artisan.id, 'crafted', e.target.value)} 
                                placeholder="1500+ Sarees" 
                                className="w-full bg-transparent border-none text-[13px] font-black text-[#1BAFAF] outline-none p-0 focus:ring-0" 
                              />
                              <input 
                                value={artisan.craftedLabel || 'Masterpieces'} 
                                onChange={(e) => updateArtisanField(artisan.id, 'craftedLabel', e.target.value)} 
                                placeholder="Masterpieces" 
                                className="w-full bg-transparent border-none text-[9px] font-bold text-gray-400 uppercase p-0 focus:ring-0" 
                            />
                            </div>

                            {/* Stat 3 */}
                            <div className="bg-white border border-gray-100 p-3 rounded-xl space-y-1">
                              <input 
                                value={artisan.teamSize || ''} 
                                onChange={(e) => updateArtisanField(artisan.id, 'teamSize', e.target.value)} 
                                placeholder="24 Weavers" 
                                className="w-full bg-transparent border-none text-[13px] font-black text-[#1BAFAF] outline-none p-0 focus:ring-0" 
                              />
                              <input 
                                value={artisan.teamSizeLabel || 'Team'} 
                                onChange={(e) => updateArtisanField(artisan.id, 'teamSizeLabel', e.target.value)} 
                                placeholder="Team" 
                                className="w-full bg-transparent border-none text-[9px] font-bold text-gray-400 uppercase p-0 focus:ring-0" 
                              />
                            </div>

                            {/* Stat 4 */}
                            <div className="bg-white border border-gray-100 p-3 rounded-xl space-y-1">
                              <input 
                                value={artisan.generations || ''} 
                                onChange={(e) => updateArtisanField(artisan.id, 'generations', e.target.value)} 
                                placeholder="5th Gen" 
                                className="w-full bg-transparent border-none text-[13px] font-black text-[#1BAFAF] outline-none p-0 focus:ring-0" 
                              />
                              <input 
                                value={artisan.generationsLabel || 'Heritage'} 
                                onChange={(e) => updateArtisanField(artisan.id, 'generationsLabel', e.target.value)} 
                                placeholder="Heritage" 
                                className="w-full bg-transparent border-none text-[9px] font-bold text-gray-400 uppercase p-0 focus:ring-0" 
                              />
                            </div>

                          </div>
                        </div>

                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Global Impact Summary Settings Card */}
      <div className="bg-white border border-gray-100 rounded-[3rem] p-8 shadow-sm space-y-8">
        <div className="flex items-center justify-between border-b border-gray-100 pb-6">
          <label className="text-[12px] font-black text-gray-400 uppercase tracking-widest ml-2">Global Impact Summary (Bottom Section)</label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Title</label>
            <input 
              type="text"
              placeholder="e.g. Commitment"
              value={data.bottomTitle || ''}
              onChange={(e) => updateField('bottomTitle', e.target.value)}
              className="w-full bg-gray-50 border-none px-5 py-3 text-[13px] font-bold text-gray-800 rounded-2xl focus:ring-2 focus:ring-[#1BAFAF]/10 focus:bg-white transition-all outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Heading</label>
            <input 
              type="text"
              placeholder="e.g. Empowering Heritage"
              value={data.bottomHeading || ''}
              onChange={(e) => updateField('bottomHeading', e.target.value)}
              className="w-full bg-gray-50 border-none px-5 py-3 text-[13px] font-bold text-gray-800 rounded-2xl focus:ring-2 focus:ring-[#1BAFAF]/10 focus:bg-white transition-all outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Subheading / Quote</label>
            <input 
              type="text"
              placeholder='e.g. "We believe that..."'
              value={data.bottomSubheading || ''}
              onChange={(e) => updateField('bottomSubheading', e.target.value)}
              className="w-full bg-gray-50 border-none px-5 py-3 text-[13px] font-bold text-gray-800 rounded-2xl focus:ring-2 focus:ring-[#1BAFAF]/10 focus:bg-white transition-all outline-none"
            />
          </div>
        </div>

        {/* 4 Stat Cards Row */}
        <div className="space-y-4 pt-4 border-t border-gray-100">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 block">Impact Statistics (4 Cards)</label>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[0, 1, 2, 3].map((idx) => {
              const stat = data.bottomStats?.[idx] || { id: idx, value: '', label: '' };
              return (
                <div key={idx} className="bg-gray-50/50 p-4 rounded-2xl border border-transparent hover:border-[#1BAFAF]/10 transition-all flex flex-col gap-2">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Stat Card {idx + 1}</span>
                  <input 
                    placeholder="e.g. 200+"
                    value={stat.value}
                    onChange={(e) => {
                      const newStats = [...(data.bottomStats || [])];
                      newStats[idx] = { ...stat, value: e.target.value };
                      updateField('bottomStats', newStats);
                    }}
                    className="w-full bg-white border-gray-100 border px-3 py-1.5 text-[13px] font-black text-[#1BAFAF] rounded-xl outline-none focus:ring-2 focus:ring-[#1BAFAF]/10"
                  />
                  <input 
                    placeholder="e.g. Artisans"
                    value={stat.label}
                    onChange={(e) => {
                      const newStats = [...(data.bottomStats || [])];
                      newStats[idx] = { ...stat, label: e.target.value };
                      updateField('bottomStats', newStats);
                    }}
                    className="w-full bg-white border-gray-100 border px-3 py-1.5 text-[11px] font-bold text-gray-500 rounded-xl outline-none focus:ring-2 focus:ring-[#1BAFAF]/10"
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        itemName={
          statToDeleteId 
            ? `the "${statToDeleteLabel}" statistic` 
            : artisanToDelete 
              ? `the "${artisanToDelete.name || 'Unnamed'}" helping hand` 
              : 'this item'
        }
      />
    </div>
  );
}
