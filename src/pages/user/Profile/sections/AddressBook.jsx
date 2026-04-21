import React, { useState, useEffect } from 'react';
import { db } from '../../../../firebase';
import { collection, query, onSnapshot, doc, setDoc, updateDoc, deleteDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { MapPin, Plus, Trash2, Edit3, CheckCircle2, Home, Briefcase, Landmark, Loader2, X } from 'lucide-react';
import toast from 'react-hot-toast';

const ADDRESS_TYPES = [
  { id: 'Home', icon: <Home size={16} /> },
  { id: 'Work', icon: <Briefcase size={16} /> },
  { id: 'Office', icon: <Landmark size={16} /> },
];

export default function AddressBook({ user }) {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    type: 'Home',
    fullName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    isDefault: false
  });

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'users', user.uid, 'addresses'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAddresses(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  const handleOpenModal = (address = null) => {
    if (address) {
      setFormData(address);
      setEditingId(address.id);
    } else {
      setFormData({
        type: 'Home',
        fullName: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zip: '',
        isDefault: false
      });
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const handleSetDefault = async (id) => {
    try {
      const batch = [];
      addresses.forEach(addr => {
        const ref = doc(db, 'users', user.uid, 'addresses', addr.id);
        batch.push(updateDoc(ref, { isDefault: addr.id === id }));
      });
      await Promise.all(batch);
      toast.success('Default address updated');
    } catch (error) {
      toast.error('Failed to set default address');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this address?')) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'addresses', id));
      toast.success('Address deleted');
    } catch (error) {
      toast.error('Failed to delete address');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.isDefault) {
        // Unset others if this is default
        const batch = [];
        addresses.forEach(addr => {
          if (addr.id !== editingId) {
             batch.push(updateDoc(doc(db, 'users', user.uid, 'addresses', addr.id), { isDefault: false }));
          }
        });
        await Promise.all(batch);
      }

      if (editingId) {
        await updateDoc(doc(db, 'users', user.uid, 'addresses', editingId), {
          ...formData,
          updatedAt: serverTimestamp()
        });
        toast.success('Address updated');
      } else {
        const newRef = doc(collection(db, 'users', user.uid, 'addresses'));
        await setDoc(newRef, {
          ...formData,
          isDefault: addresses.length === 0 ? true : formData.isDefault,
          createdAt: serverTimestamp()
        });
        toast.success('Address added');
      }
      setIsModalOpen(false);
    } catch (error) {
      toast.error('Error saving address');
    }
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-brand-orange" size={40} /></div>;

  return (
    <div className="bg-white p-10 md:p-14 rounded-[4rem] shadow-sm border border-gray-50">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-4">
          <MapPin className="text-brand-orange" size={28} />
          <h2 className="text-3xl font-fashion font-bold text-[#1A1A1A]">Address Book</h2>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="btn btn-primary px-8 py-4 rounded-2xl flex items-center gap-2 active:scale-95 transition-all text-sm font-bold uppercase tracking-widest"
        >
          <Plus size={18} /> New Address
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {addresses.map((addr) => (
          <div 
            key={addr.id} 
            className={`p-10 rounded-[3rem] border-2 transition-all relative group ${
              addr.isDefault ? 'border-brand-orange/20 bg-brand-orange/[0.02]' : 'border-gray-50 bg-[#FAF9F6]/50'
            }`}
          >
            {addr.isDefault && (
              <div className="absolute top-8 right-8 flex items-center gap-2 text-brand-orange bg-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm">
                <CheckCircle2 size={12} strokeWidth={3} /> Default
              </div>
            )}

            <div className="flex items-center gap-3 text-gray-400 mb-6 font-bold uppercase tracking-widest text-[10px]">
              {ADDRESS_TYPES.find(t => t.id === addr.type)?.icon} {addr.type}
            </div>

            <div className="space-y-1 mb-8">
              <h4 className="text-lg font-fashion font-bold text-[#1A1A1A]">{addr.fullName}</h4>
              <p className="text-sm text-gray-500 leading-relaxed max-w-[200px]">
                {addr.address}, {addr.city}, {addr.state} - {addr.zip}
              </p>
              <p className="text-sm font-bold text-gray-400 mt-2">{addr.phone}</p>
            </div>

            <div className="flex items-center gap-4 border-t border-gray-100 pt-8 mt-4">
              <button onClick={() => handleOpenModal(addr)} className="p-3 bg-white text-gray-400 hover:text-brand-orange rounded-xl shadow-sm hover:shadow-md transition-all active:scale-90">
                <Edit3 size={16} />
              </button>
              <button onClick={() => handleDelete(addr.id)} className="p-3 bg-white text-gray-400 hover:text-red-500 rounded-xl shadow-sm hover:shadow-md transition-all active:scale-90">
                <Trash2 size={16} />
              </button>
              {!addr.isDefault && (
                <button 
                  onClick={() => handleSetDefault(addr.id)}
                  className="ml-auto text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-brand-orange transition-colors"
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#1A1A1A]/20 backdrop-blur-md">
          <div className="bg-white w-full max-w-2xl rounded-[4rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-10 md:p-14">
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-2xl font-fashion font-bold text-[#1A1A1A]">
                  {editingId ? 'Edit Address' : 'Add New Address'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="p-3 bg-gray-50 rounded-full text-gray-400 hover:text-[#1A1A1A] transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block px-2">Address Type</label>
                  <div className="flex gap-4 p-2 bg-[#FAF9F6] rounded-2xl">
                    {ADDRESS_TYPES.map(t => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setFormData({...formData, type: t.id})}
                        className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                          formData.type === t.id 
                          ? 'bg-brand-orange text-white shadow-lg shadow-brand-orange/20' 
                          : 'text-gray-400 hover:text-text-main'
                        }`}
                      >
                        {t.icon} {t.id}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ModalInput label="Full Name" value={formData.fullName} onChange={v => setFormData({...formData, fullName: v})} />
                  <ModalInput label="Phone" type="tel" value={formData.phone} onChange={v => setFormData({...formData, phone: v})} />
                </div>
                
                <ModalInput label="Street Address" value={formData.address} onChange={v => setFormData({...formData, address: v})} />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <ModalInput label="City" value={formData.city} onChange={v => setFormData({...formData, city: v})} />
                  <ModalInput label="State" value={formData.state} onChange={v => setFormData({...formData, state: v})} />
                  <ModalInput label="Zip Code" value={formData.zip} onChange={v => setFormData({...formData, zip: v})} />
                </div>

                <div className="flex items-center gap-3 px-2">
                  <input 
                    type="checkbox" 
                    id="isDefault" 
                    checked={formData.isDefault} 
                    onChange={e => setFormData({...formData, isDefault: e.target.checked})}
                    className="w-5 h-5 accent-brand-orange rounded-md"
                  />
                  <label htmlFor="isDefault" className="text-sm font-medium text-gray-500">Set as my default shipping address</label>
                </div>

                <div className="pt-8 border-t border-gray-50 mt-10">
                  <button type="submit" className="btn btn-primary w-full py-5 rounded-3xl uppercase tracking-[0.2em] font-bold text-sm">
                    {editingId ? 'Update Address' : 'Save Address'}
                  </button>
                </div>
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
    <div className="space-y-2">
      <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block px-2">{label}</label>
      <input 
        type={type} 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#FAF9F6] px-6 py-4 rounded-2xl border border-transparent focus:outline-none focus:border-brand-orange/20 focus:bg-white transition-all font-medium text-sm"
        required
      />
    </div>
  );
}
