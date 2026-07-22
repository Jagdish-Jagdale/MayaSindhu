/**
 * File: AddressBook.jsx
 * Description: Client-facing address book component with form validation (50 chars max for name, 10-digit phone starting with 6, 7, 8, 9), text truncation/word-wrap for address cards, state management for saving, and expanded modal width.
 */

import React, { useState, useEffect } from 'react';
import { db } from '../../../../firebase';
import { collection, query, onSnapshot, doc, addDoc, updateDoc, deleteDoc, writeBatch, getDocs } from 'firebase/firestore';
import {
  Plus, MapPin, Home, Briefcase, Trash2, Edit3, CheckCircle2,
  X, Loader2, Save
} from 'lucide-react';
import toast from 'react-hot-toast';

const ADDRESS_TYPES = [
  { id: 'HOME', label: 'Home', icon: <Home size={14} /> },
  { id: 'OFFICE', label: 'Office', icon: <Briefcase size={14} /> },
  { id: 'OTHER', label: 'Other', icon: <MapPin size={14} /> }
];

export default function AddressBook({ user }) {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    type: 'HOME',
    isDefault: false
  });

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'users', user.uid, 'addresses'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setAddresses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  const handleOpenModal = (addr = null) => {
    setErrors({});
    if (addr) {
      setFormData(addr);
      setEditingId(addr.id);
    } else {
      setFormData({
        fullName: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zip: '',
        type: 'HOME',
        isDefault: addresses.length === 0
      });
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'addresses', id));
      toast.success('Address deleted');
    } catch (error) {
      toast.error('Error deleting address');
    }
  };

  const handleSetDefault = async (id) => {
    try {
      const batch = writeBatch(db);
      addresses.forEach(addr => {
        batch.update(doc(db, 'users', user.uid, 'addresses', addr.id), { isDefault: addr.id === id });
      });
      await batch.commit();
      toast.success('Default address updated');
    } catch (error) {
      toast.error('Error setting default');
    }
  };

  const validate = () => {
    const errs = {};

    const nameTrimmed = (formData.fullName || '').trim();
    if (!nameTrimmed) {
      errs.fullName = 'Full Name is required';
    } else if (nameTrimmed.length > 50) {
      errs.fullName = 'Full Name must not exceed 50 characters';
    }

    const phoneTrimmed = (formData.phone || '').trim();
    if (!phoneTrimmed) {
      errs.phone = 'Phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(phoneTrimmed)) {
      errs.phone = 'Phone number must be a 10-digit number starting with 6, 7, 8, or 9';
    }

    if (!(formData.address || '').trim()) {
      errs.address = 'Street Address is required';
    }

    if (!(formData.city || '').trim()) {
      errs.city = 'City is required';
    }

    if (!(formData.state || '').trim()) {
      errs.state = 'State is required';
    }

    if (!(formData.zip || '').trim()) {
      errs.zip = 'ZIP / Postal Code is required';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSaving(true);
    try {
      const addrData = {
        ...formData,
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        zip: formData.zip.trim(),
        updatedAt: new Date()
      };

      if (formData.isDefault) {
        const batch = writeBatch(db);
        const querySnapshot = await getDocs(collection(db, 'users', user.uid, 'addresses'));
        querySnapshot.forEach((docSnap) => {
          batch.update(docSnap.ref, { isDefault: false });
        });
        await batch.commit();
      }

      if (editingId) {
        await updateDoc(doc(db, 'users', user.uid, 'addresses', editingId), addrData);
        toast.success('Address updated successfully');
      } else {
        await addDoc(collection(db, 'users', user.uid, 'addresses'), addrData);
        toast.success('Address added successfully');
      }
      setIsModalOpen(false);
    } catch (error) {
      toast.error('Error saving address');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] w-full py-12 my-auto text-center">
      <Loader2 className="animate-spin text-brand-orange mb-4" size={48} />
      <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest">
        <span>Loading Addresses</span>
      </div>
    </div>
  );

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h2 className="text-xl font-bold text-[#1A1A1A]">Address Book</h2>
          <p className="text-xs text-gray-400 font-medium mt-1">Manage your shipping and billing addresses.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-brand-orange text-white px-8 py-3 rounded-xl flex items-center gap-2 hover:bg-brand-orange-dark transition-all text-xs font-bold uppercase tracking-widest shadow-lg shadow-brand-orange/20 cursor-pointer"
        >
          <Plus size={16} strokeWidth={3} /> New Address
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {addresses.map((addr) => (
          <div
            key={addr.id}
            className={`p-6 rounded-xl border-2 transition-all relative group overflow-hidden ${
              addr.isDefault ? 'border-brand-orange/20 bg-brand-orange/[0.02]' : 'border-gray-50 bg-white shadow-sm'
            }`}
          >
            {addr.isDefault && (
              <div className="absolute top-6 right-6 flex items-center gap-1.5 text-brand-orange bg-white px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest shadow-sm border border-brand-orange/10">
                <CheckCircle2 size={10} strokeWidth={3} /> Default
              </div>
            )}

            <div className="flex items-center gap-2 text-gray-400 mb-4 font-bold uppercase tracking-widest text-[9px] bg-gray-50 w-fit px-3 py-1 rounded-lg">
              {ADDRESS_TYPES.find(t => t.id === addr.type)?.icon} {addr.type}
            </div>

            <div className="space-y-1.5 mb-6 overflow-hidden">
              <h4 className="text-base font-bold text-[#1A1A1A] truncate max-w-full" title={addr.fullName}>
                {addr.fullName}
              </h4>
              <p className="text-sm text-gray-400 font-medium leading-relaxed break-words line-clamp-2 overflow-hidden text-ellipsis max-w-full">
                {addr.address}, {addr.city}, {addr.state} - {addr.zip}
              </p>
              <p className="text-xs font-bold text-brand-orange mt-2 uppercase tracking-wider">{addr.phone}</p>
            </div>

            <div className="flex items-center gap-3 border-t border-gray-50 pt-5 mt-2">
              <button onClick={() => handleOpenModal(addr)} className="p-2.5 bg-white text-gray-400 hover:text-brand-orange rounded-xl border border-gray-100 shadow-sm transition-all cursor-pointer">
                <Edit3 size={14} />
              </button>
              <button onClick={() => handleDelete(addr.id)} className="p-2.5 bg-white text-gray-400 hover:text-red-500 rounded-xl border border-gray-100 shadow-sm transition-all cursor-pointer">
                <Trash2 size={14} />
              </button>
              {!addr.isDefault && (
                <button
                  onClick={() => handleSetDefault(addr.id)}
                  className="ml-auto text-[10px] font-bold uppercase tracking-widest text-gray-300 hover:text-brand-orange transition-colors cursor-pointer"
                >
                  Set as Default
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Address Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md overflow-y-auto py-10 md:py-20" onClick={(e) => { if (e.target === e.currentTarget && !isSaving) { setIsModalOpen(false); } }}>
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-gray-100 my-auto">
            <div className="p-6 sm:p-10 max-h-[90vh] overflow-y-auto no-scrollbar">
              <div className="flex items-center justify-between mb-8 sticky top-0 bg-white z-10 pb-2">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold text-[#1A1A1A]">
                    {editingId ? 'Edit Address' : 'Add New Address'}
                  </h3>
                </div>
                <button onClick={() => !isSaving && setIsModalOpen(false)} className="p-2 bg-gray-50 rounded-full text-gray-400 hover:text-red-500 transition-colors cursor-pointer">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-3 gap-3">
                  {ADDRESS_TYPES.map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, type: t.id })}
                      className={`flex items-center justify-center gap-2 p-3.5 rounded-xl border-2 transition-all font-bold text-[10px] uppercase tracking-widest cursor-pointer ${
                        formData.type === t.id ? 'border-brand-orange bg-brand-orange/[0.03] text-brand-orange' : 'border-gray-100 text-gray-400 hover:bg-gray-50'
                      }`}
                    >
                      {t.icon} {t.label}
                    </button>
                  ))}
                </div>

                <div className="space-y-4">
                  <ModalInput
                    label="Full Name"
                    value={formData.fullName}
                    onChange={(v) => {
                      setFormData({ ...formData, fullName: v });
                      if (errors.fullName) setErrors({ ...errors, fullName: '' });
                    }}
                    maxLength={50}
                    error={errors.fullName}
                    placeholder="Enter recipient full name (max 50 chars)"
                  />

                  <ModalInput
                    label="Phone Number"
                    value={formData.phone}
                    onChange={(v) => {
                      const numericVal = v.replace(/\D/g, '').slice(0, 10);
                      setFormData({ ...formData, phone: numericVal });
                      if (errors.phone) setErrors({ ...errors, phone: '' });
                    }}
                    type="tel"
                    maxLength={10}
                    error={errors.phone}
                    placeholder="10-digit number (starts with 6, 7, 8, or 9)"
                  />

                  <ModalInput
                    label="Street Address"
                    value={formData.address}
                    onChange={(v) => {
                      setFormData({ ...formData, address: v });
                      if (errors.address) setErrors({ ...errors, address: '' });
                    }}
                    error={errors.address}
                    placeholder="House/Flat No., Building Name, Street Area"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <ModalInput
                      label="City"
                      value={formData.city}
                      onChange={(v) => {
                        setFormData({ ...formData, city: v });
                        if (errors.city) setErrors({ ...errors, city: '' });
                      }}
                      error={errors.city}
                      placeholder="City/District"
                    />
                    <ModalInput
                      label="State"
                      value={formData.state}
                      onChange={(v) => {
                        setFormData({ ...formData, state: v });
                        if (errors.state) setErrors({ ...errors, state: '' });
                      }}
                      error={errors.state}
                      placeholder="State"
                    />
                  </div>

                  <ModalInput
                    label="ZIP / Postal Code"
                    value={formData.zip}
                    onChange={(v) => {
                      setFormData({ ...formData, zip: v });
                      if (errors.zip) setErrors({ ...errors, zip: '' });
                    }}
                    error={errors.zip}
                    placeholder="6-digit Pincode"
                  />
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={formData.isDefault}
                    onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                    className="w-4 h-4 accent-brand-orange cursor-pointer"
                  />
                  <label htmlFor="isDefault" className="text-xs font-bold text-gray-500 cursor-pointer">
                    Set as default address
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full bg-brand-orange text-white py-4 rounded-xl font-bold uppercase tracking-[0.2em] text-xs shadow-lg shadow-brand-orange/20 hover:bg-brand-orange-dark transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isSaving ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      <span>Save Address</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ModalInput({ label, value, onChange, type = 'text', maxLength, error, placeholder }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center px-1">
        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">{label}</label>
        {maxLength && (
          <span className="text-[9px] font-bold text-gray-300">
            {value ? value.length : 0}/{maxLength}
          </span>
        )}
      </div>
      <input
        type={type}
        maxLength={maxLength}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full bg-white border-2 rounded-xl px-5 py-3.5 text-sm font-bold text-[#1A1A1A] focus:outline-none transition-all ${
          error ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-brand-orange'
        }`}
      />
      {error && <p className="text-[11px] font-bold text-red-500 px-1 mt-0.5">{error}</p>}
    </div>
  );
}
