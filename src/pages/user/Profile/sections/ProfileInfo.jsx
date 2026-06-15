import React, { useState, useEffect } from 'react';
import { db } from '../../../../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Loader2, Save, Mail, User, Phone, Calendar, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfileInfo({ user }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    dob: '',
    gender: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      try {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFormData({
            fullName: data.fullName || user.displayName || '',
            email: data.email || user.email || '',
            phone: data.phone || '',
            dob: data.dob || '',
            gender: data.gender || ''
          });
        }
      } catch (error) {
        console.error("Fetch error:", error);
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
      await setDoc(doc(db, 'users', user.uid), {
        ...formData,
        updatedAt: new Date()
      }, { merge: true });
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error("Update error:", error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const [isEditing, setIsEditing] = useState(false);

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-brand-orange" size={40} /></div>;

  return (
    <div className="space-y-8">
      {/* Personal Information Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#1A1A1A]">Personal Information</h2>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2 text-brand-orange hover:text-brand-orange-dark font-bold text-sm transition-colors"
          >
            <Sparkles size={16} />
            <span>{isEditing ? 'Cancel' : 'Edit Details'}</span>
          </button>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
              <InfoField
                label="Full Name"
                value={formData.fullName}
                isEditing={isEditing}
                onChange={(v) => setFormData({ ...formData, fullName: v })}
              />
              <InfoField
                label="Email Address"
                value={formData.email}
                isEditing={false}
              />
              <InfoField
                label="Phone Number"
                value={formData.phone}
                isEditing={isEditing}
                onChange={(v) => setFormData({ ...formData, phone: v })}
                type="tel"
              />
              <InfoField
                label="Date of Birth"
                value={formData.dob}
                isEditing={isEditing}
                onChange={(v) => setFormData({ ...formData, dob: v })}
                type="date"
              />
            </div>

            {isEditing && (
              <div className="pt-6 border-t border-gray-50 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-brand-orange text-white px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-brand-orange-dark transition-all shadow-lg shadow-brand-orange/20 flex items-center gap-2"
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  Save Changes
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

function InfoField({ label, value, isEditing, onChange, type = 'text' }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block px-1">{label}</label>
      {isEditing ? (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className="w-full bg-gray-50/50 border border-gray-100 rounded-lg px-4 py-3 text-sm font-bold text-[#1A1A1A] focus:outline-none focus:border-brand-orange focus:bg-white transition-all"
        />
      ) : (
        <p className="text-base font-bold text-[#1A1A1A] px-1">{value || 'Not provided'}</p>
      )}
    </div>
  );
}
