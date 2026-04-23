import React, { useState, useEffect } from 'react';
import { db } from '../../../../firebase';
import { doc, getDoc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { User, Phone, Mail, Calendar, Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfileInfo({ user }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    gender: '',
    dob: '',
    email: user.email || ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFormData({
            fullName: data.fullName || user.displayName || '',
            phone: data.phone || '',
            gender: data.gender || '',
            dob: data.dob || '',
            email: user.email || ''
          });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const docRef = doc(db, 'users', user.uid);
      await setDoc(docRef, {
        ...formData,
        updatedAt: serverTimestamp()
      }, { merge: true });
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error("Update error:", error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-brand-orange" size={40} /></div>;

  return (
    <div className="bg-white p-10 md:p-14 rounded-[4rem] shadow-sm border border-gray-50">
      <div className="flex items-center gap-4 mb-12">
        <User className="text-brand-orange underline decoration-2 underline-offset-8" size={28} />
        <h2 className="text-3xl font-fashion font-bold text-[#1A1A1A]">Personal Information</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <FormInput 
            label="Full Name" 
            icon={<User size={18} />} 
            value={formData.fullName}
            onChange={(v) => setFormData({...formData, fullName: v})}
          />
          <FormInput 
            label="Email Address" 
            icon={<Mail size={18} />} 
            value={formData.email}
            disabled
          />
          <FormInput 
            label="Phone Number" 
            icon={<Phone size={18} />} 
            value={formData.phone}
            onChange={(v) => setFormData({...formData, phone: v})}
            type="tel"
          />
          <div className="space-y-3">
            <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-gray-400 block px-2">Gender</label>
            <div className="flex gap-4 p-2 bg-[#FAF9F6] rounded-2xl">
              {['Male', 'Female', 'Other'].map(g => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setFormData({...formData, gender: g})}
                  className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${
                    formData.gender === g 
                    ? 'bg-brand-orange text-white shadow-lg shadow-brand-orange/20' 
                    : 'text-gray-400 hover:text-text-main'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
          <FormInput 
            label="Date of Birth" 
            icon={<Calendar size={18} />} 
            value={formData.dob}
            onChange={(v) => setFormData({...formData, dob: v})}
            type="date"
          />
        </div>

        <div className="pt-8 border-t border-gray-50 flex justify-end">
          <button 
            type="submit" 
            disabled={saving}
            className="btn btn-primary px-12 py-5 rounded-2xl flex items-center gap-3 transition-transform active:scale-95 disabled:opacity-50"
          >
            {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            <span className="uppercase tracking-widest text-sm font-bold">Save Changes</span>
          </button>
        </div>
      </form>
    </div>
  );
}

function FormInput({ label, icon, value, onChange, type = 'text', disabled = false }) {
  return (
    <div className="space-y-3">
      <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-gray-400 block px-2">{label}</label>
      <div className="relative group">
        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-brand-orange transition-colors">
          {icon}
        </div>
        <input 
          type={type} 
          value={value}
          disabled={disabled}
          onChange={(e) => onChange?.(e.target.value)}
          className={`
            w-full bg-[#FAF9F6] pl-14 pr-6 py-5 rounded-2xl border border-transparent 
            focus:outline-none focus:border-brand-orange/20 focus:bg-white transition-all font-medium text-sm
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        />
      </div>
    </div>
  );
}
