import React, { useState, useEffect } from 'react';
import { X, Loader2, User, Mail, Phone, ShieldCheck } from 'lucide-react';
import { db } from '../../firebase';
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';
import CustomSelect from '../common/CustomSelect';

export default function UserModal({ isOpen, onClose, user = null }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    status: 'Active',
    role: 'Client'
  });

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        status: user.status || 'Active',
        role: user.role || 'Client'
      });
    } else {
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        status: 'Active',
        role: 'Client'
      });
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    const nameRegex = /^([^0-9]*)$/;
    if (!nameRegex.test(formData.fullName)) {
      toast.error("Full Name should not contain digits");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    const phoneRegex = /^\d{10}$/;
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      toast.error("Phone number must be exactly 10 digits");
      return;
    }

    if (!formData.fullName || !formData.email) {
      toast.error("Name and Email are required");
      return;
    }

    setLoading(true);
    try {
      if (user) {
        // Update
        await updateDoc(doc(db, 'users', user.id), {
          ...formData,
          updatedAt: serverTimestamp()
        });
        toast.success("User updated successfully");
      } else {
        // Add
        await addDoc(collection(db, 'users'), {
          ...formData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        toast.success("User added successfully");
      }
      onClose();
    } catch (error) {
      console.error("Error saving user:", error);
      toast.error("Failed to save user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-lg bg-white rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
          <div>
            <h2 className="text-[20px] font-bold text-gray-900 tracking-tight">
              {user ? 'Edit User' : 'Add User'}
            </h2>
            <p className="text-[12px] text-gray-400 font-medium">Customer details for e-store</p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-2xl text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-[#1BAFAF] transition-colors" />
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^([^0-9]*)$/.test(val)) {
                      setFormData({ ...formData, fullName: val });
                    }
                  }}
                  placeholder="Enter full name"
                  className="w-full bg-gray-50 border-2 border-transparent py-3.5 pl-12 pr-4 text-[14px] font-medium rounded-2xl outline-none focus:bg-white focus:border-[#1BAFAF]/20 transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-[#1BAFAF] transition-colors" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="customer@example.com"
                  className="w-full bg-gray-50 border-2 border-transparent py-3.5 pl-12 pr-4 text-[14px] font-medium rounded-2xl outline-none focus:bg-white focus:border-[#1BAFAF]/20 transition-all"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
              <div className="relative group">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-[#1BAFAF] transition-colors" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    if (val.length <= 10) {
                      setFormData({ ...formData, phone: val });
                    }
                  }}
                  placeholder="Enter 10-digit phone number"
                  className="w-full bg-gray-50 border-2 border-transparent py-3.5 pl-12 pr-4 text-[14px] font-medium rounded-2xl outline-none focus:bg-white focus:border-[#1BAFAF]/20 transition-all"
                />
              </div>
            </div>

            <CustomSelect
              label="Status"
              value={formData.status}
              onChange={(val) => setFormData({ ...formData, status: val })}
              options={['Active', 'Inactive', 'Suspended']}
              icon={ShieldCheck}
            />
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 text-[14px] font-bold text-gray-500 bg-gray-100 rounded-2xl hover:bg-gray-200 transition-all active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-4 text-[14px] font-bold text-white bg-[#1BAFAF] rounded-2xl hover:bg-[#158e8e] transition-all shadow-lg shadow-[#1BAFAF]/20 active:scale-95 disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {user ? 'Update User' : 'Add User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
