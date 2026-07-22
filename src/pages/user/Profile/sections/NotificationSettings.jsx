/**
 * File: NotificationSettings.jsx
 * Description: Client-facing customer page rendering home banners, blog lists, product details, and profile user sections.
 * Work Done: Integrated baseline UI layouts, state boundaries, CSS theme styling, and routing pathways.
 */

import React, { useState, useEffect } from 'react';
import { db } from '../../../../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { Bell, Mail, MessageSquare, Phone, Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function NotificationSettings({ user }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [prefs, setPrefs] = useState({
    email: true,
    sms: false,
    whatsapp: true,
    orders: true,
    promotions: false
  });

  useEffect(() => {
    const fetchPrefs = async () => {
      try {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().notifications) {
          setPrefs(docSnap.data().notifications);
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };
    fetchPrefs();
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        notifications: prefs
      });
      toast.success('Preferences saved');
    } catch (error) {
      toast.error('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] w-full py-12 my-auto text-center">
      <Loader2 className="animate-spin text-brand-orange mb-4" size={48} />
      <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest">
        <span>Loading Preferences</span>
      </div>
    </div>
  );

  return (
    <div className="bg-white p-6 md:p-10 rounded-[3rem] shadow-xl shadow-gray-200/20 border border-[#f0dda0]/20">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-[#f5aa00] to-[#e07a00] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-[#f5aa00]/20">
          <Bell size={24} strokeWidth={1.5} />
        </div>
        <div>
          <h2 className="text-2xl font-sans font-bold text-[#1A1A1A] tracking-tight">Notification Settings</h2>
          <p className="text-[10px] text-[#f5aa00] font-bold uppercase tracking-[0.2em] mt-0.5">Manage Alerts</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ToggleCard 
            icon={<Mail size={18} />} 
            label="Email Alerts" 
            sub="Orders & Style Guide"
            active={prefs.email} 
            onToggle={() => setPrefs({...prefs, email: !prefs.email})} 
          />
          <ToggleCard 
            icon={<Phone size={18} />} 
            label="SMS Alerts" 
            sub="Live Shipping Status"
            active={prefs.sms} 
            onToggle={() => setPrefs({...prefs, sms: !prefs.sms})} 
          />
          <ToggleCard 
            icon={<MessageSquare size={18} />} 
            label="WhatsApp" 
            sub="Concierge Assistance"
            active={prefs.whatsapp} 
            onToggle={() => setPrefs({...prefs, whatsapp: !prefs.whatsapp})} 
          />
          <ToggleCard 
            icon={<Bell size={18} />} 
            label="Milestones" 
            sub="Order Track & Bag"
            active={prefs.orders} 
            onToggle={() => setPrefs({...prefs, orders: !prefs.orders})} 
          />
        </div>

        <div className="pt-8 border-t border-[#f0dda0]/10 flex justify-end">
          <button 
            onClick={handleSave} 
            disabled={saving}
            className="bg-gradient-to-r from-[#f5aa00] to-[#e07a00] hover:shadow-xl hover:shadow-[#f5aa00]/20 text-white px-10 py-4 rounded-xl flex items-center gap-3 active:scale-95 transition-all text-[11px] font-bold uppercase tracking-widest shadow-lg shadow-[#f5aa00]/10"
          >
            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            <span>Save Preferences</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function ToggleCard({ icon, label, sub, active, onToggle }) {
  return (
    <div className={`p-5 rounded-[2rem] border-2 transition-all flex items-center justify-between gap-4 cursor-pointer group ${
      active ? 'border-[#f5aa00]/20 bg-[#fffbf2]/40 shadow-sm' : 'border-[#f0dda0]/10 bg-white'
    }`} onClick={onToggle}>
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
          active ? 'bg-[#f5aa00] text-white shadow-lg shadow-[#f5aa00]/20' : 'bg-[#fffbf2] text-gray-300'
        }`}>
          {icon}
        </div>
        <div>
          <h4 className={`text-[13px] font-bold uppercase tracking-tight transition-colors ${active ? 'text-[#1A1A1A]' : 'text-gray-400'}`}>{label}</h4>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide opacity-60">{sub}</p>
        </div>
      </div>
      <div className={`w-10 h-5 rounded-full relative transition-all ${active ? 'bg-[#f5aa00]' : 'bg-gray-100'}`}>
        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${active ? 'left-[22px]' : 'left-0.5'}`} />
      </div>
    </div>
  );
}
