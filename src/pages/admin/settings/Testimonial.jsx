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
  updateDoc,
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
  Star,
  Quote
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Testimonial() {
  const { isCollapsed } = useAdminUI();
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [deletedIds, setDeletedIds] = useState([]);
  
  const fileInputRef = useRef(null);
  const [currentFileIndex, setCurrentFileIndex] = useState(null);

  // Load Testimonials
  useEffect(() => {
    const q = query(collection(db, 'testimonials'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTestimonials(data);
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
      if (currentFileIndex !== null) {
        setTestimonials(prev => prev.map((t, idx) => 
          idx === currentFileIndex 
            ? { ...t, imageUrl: reader.result, isModified: true } 
            : t
        ));
        setHasChanges(true);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = null;
  };

  const triggerImageUpload = (index) => {
    setCurrentFileIndex(index);
    fileInputRef.current?.click();
  };

  const addTestimonial = () => {
    const newTestimonial = {
      id: 'temp-' + Date.now(),
      name: '',
      location: '',
      text: '',
      rating: 5,
      imageUrl: 'https://images.unsplash.com/photo-1594744803329-a584af1cae21?w=400&q=80',
      isNew: true
    };
    setTestimonials(prev => [newTestimonial, ...prev]);
    setHasChanges(true);
  };

  const removeTestimonial = (testimonial) => {
    setTestimonials(prev => prev.filter(t => t.id !== testimonial.id));
    if (!testimonial.isNew) {
      setDeletedIds(prev => [...prev, testimonial.id]);
    }
    setHasChanges(true);
  };

  const updateField = (id, field, value) => {
    setTestimonials(prev => prev.map(t => 
      t.id === id ? { ...t, [field]: value, isModified: true } : t
    ));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const batch = writeBatch(db);

      // Handle Deletions
      deletedIds.forEach(id => {
        batch.delete(doc(db, 'testimonials', id));
      });

      // Handle Adds and Updates
      for (const t of testimonials) {
        if (t.isNew) {
          const docRef = doc(collection(db, 'testimonials'));
          batch.set(docRef, {
            name: t.name || 'Anonymous',
            location: t.location || '',
            text: t.text || '',
            rating: t.rating || 5,
            imageUrl: t.imageUrl,
            createdAt: serverTimestamp()
          });
        } else if (t.isModified) {
          const docRef = doc(db, 'testimonials', t.id);
          batch.update(docRef, {
            name: t.name,
            location: t.location,
            text: t.text,
            rating: t.rating,
            imageUrl: t.imageUrl,
            updatedAt: serverTimestamp()
          });
        }
      }

      await batch.commit();
      setDeletedIds([]);
      setHasChanges(false);
      toast.success("Testimonials updated successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  const seedInitialData = async () => {
    try {
      setIsSaving(true);
      const batch = writeBatch(db);
      
      const defaultReviews = [
        {
          name: "Ananya Sharma",
          location: "Mumbai, India",
          text: "The craftsmanship is unparalleled. I felt like I was wearing a piece of history. The Banarasi silk has a weight and sheen that only true hand-weaving can achieve.",
          imageUrl: "https://images.unsplash.com/photo-1594744803329-a584af1cae21?w=400&q=80",
          rating: 5,
          createdAt: serverTimestamp()
        },
        {
          name: "Priya Kapoor",
          location: "London, UK",
          text: "MayaSindhu doesn't just sell sarees; they sell stories. My bridal ensemble was a masterpiece that drew compliments from everyone. Truly soulful artistry.",
          imageUrl: "https://images.unsplash.com/photo-1610030469668-9de19bd49031?w=400&q=80",
          rating: 5,
          createdAt: serverTimestamp()
        },
        {
          name: "Meera Reddy",
          location: "Hyderabad, India",
          text: "Supporting local artisans while looking elegant is a beautiful combination. The attention to detail in the embroidery is something you simply can't find in mass-produced fashion.",
          imageUrl: "https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?w=400&q=80",
          rating: 5,
          createdAt: serverTimestamp()
        }
      ];

      defaultReviews.forEach(review => {
        const docRef = doc(collection(db, 'testimonials'));
        batch.set(docRef, review);
      });

      await batch.commit();
      toast.success("Initial testimonials seeded successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to seed initial data");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] w-full flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#1BAFAF]" />
        <p className="text-[14px] font-medium text-gray-400">Loading testimonials...</p>
      </div>
    );
  }

  return (
    <div className={`mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 transition-all duration-300 ${isCollapsed ? 'max-w-[1600px]' : 'max-w-[1280px]'}`} style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}>
      
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />

      {/* Header */}
      <div className="space-y-4 py-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-[22px] font-semibold text-gray-900 tracking-tight">Testimonial Management</h1>
            <p className="text-[12px] text-gray-400 font-medium font-inter tracking-tight">Manage customer reviews and success stories to build trust and credibility.</p>
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
              onClick={addTestimonial}
              className="flex items-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-900 px-5 py-2.5 rounded-xl text-[13px] font-semibold transition-all active:scale-95"
            >
              <Plus size={16} strokeWidth={2.5} />
              Add Review
            </button>
          </div>
        </div>
        <hr className="border-gray-100" />
      </div>

      {/* Grid */}
      {testimonials.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-[24px] p-8 shadow-sm">
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="w-16 h-16 bg-[#eaf6f6] rounded-2xl flex items-center justify-center text-[#1BAFAF]">
              <Quote size={32} />
            </div>
            <div>
              <h3 className="text-[18px] font-bold text-gray-900">No Testimonials Yet</h3>
              <p className="text-[14px] text-gray-400 max-w-sm mx-auto mb-6">Start by adding your first customer review or seed initial data to build social proof on your homepage.</p>
              <button
                onClick={seedInitialData}
                disabled={isSaving}
                className="flex items-center gap-2 bg-[#1BAFAF] hover:bg-[#17a0a0] text-white px-6 py-2.5 rounded-xl text-[13px] font-semibold transition-all shadow-sm shadow-[#1BAFAF]/10 active:scale-95 disabled:opacity-50 mx-auto"
              >
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Layout size={16} />}
                Seed Initial Testimonials
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, index) => (
            <div key={t.id} className="bg-white border border-gray-100 rounded-[24px] overflow-hidden shadow-sm hover:shadow-md transition-all group p-6 space-y-5 relative">
              
              {/* Delete Button */}
              <button 
                onClick={() => removeTestimonial(t)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={14} />
              </button>

              {/* Status Badge */}
              {(t.isNew || t.isModified) && (
                <div className="absolute top-4 left-4 px-2 py-0.5 bg-[#1BAFAF] text-white text-[9px] font-bold rounded-lg uppercase tracking-wider">
                  {t.isNew ? 'Unsaved' : 'Modified'}
                </div>
              )}

              {/* Image and Name Section */}
              <div className="flex items-center gap-4">
                <div className="relative group/img cursor-pointer" onClick={() => triggerImageUpload(index)}>
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 border-2 border-white shadow-sm">
                    <img src={t.imageUrl} alt={t.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity">
                    <Camera size={16} className="text-white" />
                  </div>
                </div>
                <div className="flex-1 space-y-1">
                  <input 
                    type="text" 
                    placeholder="Customer Name"
                    value={t.name}
                    onChange={(e) => updateField(t.id, 'name', e.target.value)}
                    className="w-full bg-transparent border-none p-0 text-[15px] font-bold text-gray-900 focus:ring-0 outline-none"
                  />
                  <input 
                    type="text" 
                    placeholder="Location (e.g. Mumbai, India)"
                    value={t.location}
                    onChange={(e) => updateField(t.id, 'location', e.target.value)}
                    className="w-full bg-transparent border-none p-0 text-[11px] font-medium text-[#B08968] uppercase tracking-wider focus:ring-0 outline-none"
                  />
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button 
                    key={star}
                    onClick={() => updateField(t.id, 'rating', star)}
                    className="transition-transform active:scale-90"
                  >
                    <Star 
                      size={14} 
                      className={star <= t.rating ? 'fill-[#FFB800] text-[#FFB800]' : 'text-gray-200'} 
                    />
                  </button>
                ))}
              </div>

              {/* Review Text */}
              <textarea 
                rows={4}
                placeholder="Enter the customer testimonial here..."
                value={t.text}
                onChange={(e) => updateField(t.id, 'text', e.target.value)}
                className="w-full bg-gray-50 border-none px-4 py-3 text-[13px] leading-relaxed text-gray-600 rounded-xl focus:ring-1 focus:ring-[#1BAFAF] focus:bg-white transition-all outline-none resize-none italic"
              />

            </div>
          ))}
          
          <button 
            onClick={addTestimonial}
            className="border-2 border-dashed border-gray-100 rounded-[24px] p-8 flex flex-col items-center justify-center gap-3 text-gray-400 hover:border-[#1BAFAF] hover:text-[#1BAFAF] transition-all group min-h-[200px]"
          >
            <div className="w-12 h-12 rounded-full bg-gray-50 group-hover:bg-[#eaf6f6] flex items-center justify-center transition-all">
              <Plus size={24} />
            </div>
            <span className="text-[13px] font-semibold">New Testimonial</span>
          </button>
        </div>
      )}
    </div>
  );
}
