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
        console.error("Error fetching notification prefs:", error);
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

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-brand-orange" size={40} /></div>;

  return (
    <div className="bg-white p-10 md:p-14 rounded-[4rem] shadow-sm border border-gray-50">
      <div className="flex items-center gap-4 mb-12">
        <Bell className="text-brand-orange" size={28} />
        <h2 className="text-3xl font-fashion font-bold text-[#1A1A1A]">Notification Preferences</h2>
      </div>

      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <ToggleCard 
            icon={<Mail size={20} />} 
            label="Email Notifications" 
            sub="Order updates and weekly newsletter"
            active={prefs.email} 
            onToggle={() => setPrefs({...prefs, email: !prefs.email})} 
          />
          <ToggleCard 
            icon={<Phone size={20} />} 
            label="SMS Alerts" 
            sub="Immediate shipping updates"
            active={prefs.sms} 
            onToggle={() => setPrefs({...prefs, sms: !prefs.sms})} 
          />
          <ToggleCard 
            icon={<MessageSquare size={20} />} 
            label="WhatsApp Updates" 
            sub="Personal styling and delivery alerts"
            active={prefs.whatsapp} 
            onToggle={() => setPrefs({...prefs, whatsapp: !prefs.whatsapp})} 
          />
          <ToggleCard 
            icon={<Bell size={20} />} 
            label="Order Status" 
            sub="Tracking and milestone alerts"
            active={prefs.orders} 
            onToggle={() => setPrefs({...prefs, orders: !prefs.orders})} 
          />
        </div>

        <div className="pt-10 border-t border-gray-50 flex justify-end">
          <button 
            onClick={handleSave} 
            disabled={saving}
            className="btn btn-primary px-12 py-5 rounded-2xl flex items-center gap-3 transition-transform active:scale-95"
          >
            {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            <span className="uppercase tracking-widest text-sm font-bold">Save Preferences</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function ToggleCard({ icon, label, sub, active, onToggle }) {
  return (
    <div className={`p-8 rounded-[2.5rem] border-2 transition-all flex items-center justify-between gap-6 cursor-pointer ${
      active ? 'border-brand-orange/20 bg-brand-orange/[0.02]' : 'border-gray-50 bg-[#FAF9F6]/50'
    }`} onClick={onToggle}>
      <div className="flex items-center gap-5">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
          active ? 'bg-brand-orange text-white' : 'bg-white text-gray-300'
        }`}>
          {icon}
        </div>
        <div>
          <h4 className={`text-sm font-bold transition-colors ${active ? 'text-[#1A1A1A]' : 'text-gray-400'}`}>{label}</h4>
          <p className="text-[11px] text-gray-400 font-medium">{sub}</p>
        </div>
      </div>
      <div className={`w-12 h-6 rounded-full relative transition-colors ${active ? 'bg-brand-orange' : 'bg-gray-200'}`}>
        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${active ? 'left-7' : 'left-1'}`} />
      </div>
    </div>
  );
}
