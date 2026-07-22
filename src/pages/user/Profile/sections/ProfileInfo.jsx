/**
 * File: ProfileInfo.jsx
 * Description: Client-facing customer page rendering home banners, blog lists, product details, and profile user sections.
 * Work Done: Integrated baseline UI layouts, state boundaries, CSS theme styling, and routing pathways.
 */

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
    mobile: '',
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
            mobile: data.mobile || data.phone || data.phoneNumber || user.phoneNumber || '',
            dob: data.dob || '',
            gender: data.gender || ''
          });
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const mobileTrimmed = (formData.mobile || '').trim();
    if (mobileTrimmed && !/^[6-9]\d{9}$/.test(mobileTrimmed)) {
      toast.error('Mobile number must be a valid 10-digit number starting with 6, 7, 8, or 9');
      return;
    }

    setSaving(true);
    try {
      await setDoc(doc(db, 'users', user.uid), {
        ...formData,
        mobile: mobileTrimmed,
        updatedAt: new Date()
      }, { merge: true });
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const [isEditing, setIsEditing] = useState(false);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] w-full py-12 my-auto text-center">
      <Loader2 className="animate-spin text-brand-orange mb-4" size={48} />
      <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest">
        <span>Loading Profile</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Personal Information Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#1A1A1A]">Personal Information</h2>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2 text-brand-orange hover:text-brand-orange-dark font-bold text-sm transition-colors cursor-pointer"
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
                maxLength={50}
              />
              <InfoField
                label="Email Address"
                value={formData.email}
                isEditing={false}
              />
              <InfoField
                label="Mobile Number"
                value={formData.mobile}
                isEditing={isEditing}
                onChange={(v) => {
                  const numeric = v.replace(/\D/g, '').slice(0, 10);
                  setFormData({ ...formData, mobile: numeric });
                }}
                type="tel"
                maxLength={10}
                placeholder="10-digit number (starts with 6, 7, 8, 9)"
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
                  className="bg-brand-orange text-white px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-brand-orange-dark transition-all shadow-lg shadow-brand-orange/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
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

function InfoField({ label, value, isEditing, onChange, type = 'text', maxLength, placeholder }) {
  return (
    <div className="space-y-2 min-w-0">
      <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block px-1">{label}</label>
      {isEditing ? (
        <input
          type={type}
          maxLength={maxLength}
          placeholder={placeholder}
          value={value || ''}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={!onChange}
          className={`w-full border rounded-xl px-4 py-3 text-sm font-bold text-[#1A1A1A] focus:outline-none focus:border-brand-orange transition-all shadow-sm ${
            !onChange ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200' : 'bg-white border-gray-300'
          }`}
        />
      ) : (
        <div className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-[#1A1A1A] truncate overflow-hidden text-ellipsis" title={value || ''}>
          {value || 'Not provided'}
        </div>
      )}
    </div>
  );
}
