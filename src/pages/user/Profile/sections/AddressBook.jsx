/**
 * File: AddressBook.jsx
 * Description: Client-facing customer page rendering home banners, blog lists, product details, and profile user sections.
 * Work Done: Integrated baseline UI layouts, state boundaries, CSS theme styling, and routing pathways.
 */

import React, { useState, useEffect } from 'react';
import { db } from '../../../../firebase';
import { collection, query, onSnapshot, doc, addDoc, updateDoc, deleteDoc, writeBatch, getDocs } from 'firebase/firestore';
import {
  Plus, MapPin, Home, Briefcase, Trash2, Edit3, CheckCircle2,
  X, Loader2, Save, Map
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const addrData = { ...formData, updatedAt: new Date() };

      if (formData.isDefault) {
        const batch = writeBatch(db);
        const querySnapshot = await getDocs(collection(db, 'users', user.uid, 'addresses'));
        querySnapshot.forEach((doc) => {
          batch.update(doc.ref, { isDefault: false });
        });
        await batch.commit();
      }

      if (editingId) {
        await updateDoc(doc(db, 'users', user.uid, 'addresses', editingId), addrData);
        toast.success('Address updated');
      } else {
        await addDoc(collection(db, 'users', user.uid, 'addresses'), addrData);
        toast.success('Address added');
      }
      setIsModalOpen(false);
    } catch (error) {
      toast.error('Error saving address');
    }
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-brand-orange" size={40} /></div>;

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h2 className="text-xl font-bold text-[#1A1A1A]">Address Book</h2>
          <p className="text-xs text-gray-400 font-medium mt-1">Manage your shipping and billing addresses.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-brand-orange text-white px-8 py-3 rounded-xl flex items-center gap-2 hover:bg-brand-orange-dark transition-all text-xs font-bold uppercase tracking-widest shadow-lg shadow-brand-orange/20"
        >
          <Plus size={16} strokeWidth={3} /> New Address
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {addresses.map((addr) => (
          <div
            key={addr.id}
            className={`p-6 rounded-xl border-2 transition-all relative group ${addr.isDefault ? 'border-brand-orange/20 bg-brand-orange/[0.02]' : 'border-gray-50 bg-white shadow-sm'
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

            <div className="space-y-1 mb-6">
              <h4 className="text-base font-bold text-[#1A1A1A]">{addr.fullName}</h4>
              <p className="text-sm text-gray-400 font-medium leading-relaxed">
                {addr.address}, {addr.city}, {addr.state} - {addr.zip}
              </p>
              <p className="text-xs font-bold text-brand-orange mt-2 uppercase tracking-wider">{addr.phone}</p>
            </div>

            <div className="flex items-center gap-3 border-t border-gray-50 pt-5 mt-2">
              <button onClick={() => handleOpenModal(addr)} className="p-2.5 bg-white text-gray-400 hover:text-brand-orange rounded-xl border border-gray-100 shadow-sm transition-all">
                <Edit3 size={14} />
              </button>
              <button onClick={() => handleDelete(addr.id)} className="p-2.5 bg-white text-gray-400 hover:text-red-500 rounded-xl border border-gray-100 shadow-sm transition-all">
                <Trash2 size={14} />
              </button>
              {!addr.isDefault && (
                <button
                  onClick={() => handleSetDefault(addr.id)}
                  className="ml-auto text-[10px] font-bold uppercase tracking-widest text-gray-300 hover:text-brand-orange transition-colors"
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
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/10 backdrop-blur-md overflow-y-auto py-10 md:py-20" onClick={(e) => { if (e.target === e.currentTarget) { const closeFn = () => setIsModalOpen(false); closeFn(); } }}>
          <div className="bg-white w-full max-w-xl rounded-xl shadow-2xl overflow-hidden border border-gray-100 my-auto">
            <div className="p-8 md:p-10 max-h-[90vh] overflow-y-auto no-scrollbar">
              <div className="flex items-center justify-between mb-8 sticky top-0 bg-white z-10 pb-2">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold text-[#1A1A1A]">
                    {editingId ? 'Edit Address' : 'Add New Address'}
                  </h3>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 bg-gray-50 rounded-full text-gray-400 hover:text-red-500 transition-colors">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  {ADDRESS_TYPES.map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, type: t.id })}
                      className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all font-bold text-[10px] uppercase tracking-widest ${formData.type === t.id ? 'border-brand-orange bg-brand-orange/[0.03] text-brand-orange' : 'border-gray-50 text-gray-400'
                        }`}
                    >
                      {t.icon} {t.label}
                    </button>
                  ))}
                </div>

                <div className="space-y-4">
                  <ModalInput label="Full Name" value={formData.fullName} onChange={(v) => setFormData({ ...formData, fullName: v })} />
                  <ModalInput label="Phone Number" value={formData.phone} onChange={(v) => setFormData({ ...formData, phone: v })} type="tel" />
                  <ModalInput label="Street Address" value={formData.address} onChange={(v) => setFormData({ ...formData, address: v })} />
                  <div className="grid grid-cols-2 gap-4">
                    <ModalInput label="City" value={formData.city} onChange={(v) => setFormData({ ...formData, city: v })} />
                    <ModalInput label="State" value={formData.state} onChange={(v) => setFormData({ ...formData, state: v })} />
                  </div>
                  <ModalInput label="ZIP / Postal Code" value={formData.zip} onChange={(v) => setFormData({ ...formData, zip: v })} />
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={formData.isDefault}
                    onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                    className="w-4 h-4 accent-brand-orange"
                  />
                  <label htmlFor="isDefault" className="text-xs font-bold text-gray-500">Set as default address</label>
                </div>

                <button
                  type="submit"
                  className="w-full bg-brand-orange text-white py-4 rounded-xl font-bold uppercase tracking-[0.2em] text-xs shadow-lg shadow-brand-orange/20 hover:bg-brand-orange-dark transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <Save size={16} /> Save Address
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ModalInput({ label, value, onChange, type = 'text' }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">{label}</label>
      <input
        type={type}
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white border-2 border-gray-50 rounded-xl px-5 py-3.5 text-sm font-bold text-[#1A1A1A] focus:outline-none focus:border-brand-orange transition-all"
      />
    </div>
  );
}
