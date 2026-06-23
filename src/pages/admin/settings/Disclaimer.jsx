import React, { useState, useEffect } from 'react';
import { Shield, Save } from 'lucide-react';
import { useAdminUI } from '../../../context/AdminUIContext';
import { db } from '../../../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';

export default function Disclaimer() {
  const { isCollapsed } = useAdminUI();
  const [globalDisclaimer, setGlobalDisclaimer] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'general');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().productDisclaimer !== undefined) {
          setGlobalDisclaimer(docSnap.data().productDisclaimer);
        } else {
          setGlobalDisclaimer("The actual product color may vary slightly from the images shown due to photography lighting, camera settings, and differences in screen/display settings");
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      await setDoc(doc(db, 'settings', 'general'), {
        productDisclaimer: globalDisclaimer
      }, { merge: true });
      toast.success("Disclaimer updated successfully!");
    } catch (error) {
      toast.error("Failed to save disclaimer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 transition-all duration-300 ${isCollapsed ? 'max-w-[1600px]' : 'max-w-[1280px]'}`} style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}>
      
      {/* Header Section */}
      <div className="space-y-2 py-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-[22px] font-semibold text-gray-900 tracking-tight">
              Product Disclaimer
            </h1>
            <p className="text-[12px] text-gray-400 font-medium tracking-tight">Manage the global disclaimer text shown on product pages</p>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={handleSave}
              disabled={loading}
              className="flex items-center gap-2 bg-[#1BAFAF] hover:bg-[#17a0a0] text-white px-5 py-2.5 rounded-xl text-[13px] font-bold transition-all shadow-sm shadow-[#1BAFAF]/10 active:scale-95 disabled:opacity-50"
            >
              <Save size={18} strokeWidth={2.5} />
              {loading ? 'Saving...' : 'Save Disclaimer'}
            </button>
          </div>
        </div>
        <hr className="border-gray-100" />
      </div>

      <div className="bg-white border border-gray-100 rounded-[1.5rem] p-8 shadow-sm">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
            <Shield size={24} strokeWidth={2} />
          </div>
          <div>
            <h3 className="text-[18px] font-bold text-gray-900">Disclaimer Content</h3>
            <p className="text-[13px] text-gray-400 font-medium">This text will be displayed below the care instructions on every product detail page.</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest pl-1">Disclaimer Text</label>
          <textarea
            value={globalDisclaimer}
            onChange={(e) => setGlobalDisclaimer(e.target.value)}
            placeholder="The actual product color may vary slightly from the images shown due to photography lighting, camera settings, and differences in screen/display settings"
            rows={5}
            className="w-full bg-gray-50 border-none px-6 py-4 rounded-2xl text-[14px] font-medium text-gray-700 outline-none focus:ring-2 focus:ring-[#1BAFAF]/20 focus:bg-white transition-all resize-none shadow-sm"
          />
        </div>
      </div>
      
    </div>
  );
}
