/**
 * File: PaymentMethods.jsx
 * Description: Client-facing customer page rendering home banners, blog lists, product details, and profile user sections.
 * Work Done: Integrated baseline UI layouts, state boundaries, CSS theme styling, and routing pathways.
 */

import React, { useState, useEffect } from 'react';
import { db } from '../../../../firebase';
import { collection, query, onSnapshot, doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { CreditCard, Plus, Trash2, Landmark, ShieldCheck, Loader2, X, PlusCircle, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PaymentMethods({ user }) {
  const [cards, setCards] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    type: 'Visa',
    last4: '',
    expiry: '',
    holder: '',
    brand: 'bg-gradient-to-br from-indigo-600 to-blue-700'
  });

  const [bankFormData, setBankFormData] = useState({
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    holderName: ''
  });

  useEffect(() => {
    if (!user) return;
    
    const cardsQuery = query(collection(db, 'users', user.uid, 'paymentMethods'));
    const bankQuery = query(collection(db, 'users', user.uid, 'bankAccounts'));

    const unsubCards = onSnapshot(cardsQuery, (snapshot) => {
      setCards(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubBank = onSnapshot(bankQuery, (snapshot) => {
      setBankAccounts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    return () => {
      unsubCards();
      unsubBank();
    };
  }, [user]);

  const handleDelete = async (id, type) => {
    if (!window.confirm(`Remove this ${type}?`)) return;
    try {
      const collectionName = type === 'card' ? 'paymentMethods' : 'bankAccounts';
      await deleteDoc(doc(db, 'users', user.uid, collectionName, id));
      toast.success(`${type === 'card' ? 'Card' : 'Bank account'} removed`);
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.last4 || !formData.holder || !formData.expiry) {
      toast.error('Please fill all fields');
      return;
    }
    try {
      const newRef = doc(collection(db, 'users', user.uid, 'paymentMethods'));
      await setDoc(newRef, {
        ...formData,
        createdAt: serverTimestamp()
      });
      toast.success('Card added to vault');
      setIsModalOpen(false);
      setFormData({ type: 'Visa', last4: '', expiry: '', holder: '', brand: 'bg-gradient-to-br from-indigo-600 to-blue-700' });
    } catch (error) {
      toast.error('Error saving card');
    }
  };

  const handleBankSubmit = async (e) => {
    e.preventDefault();
    if (!bankFormData.bankName || !bankFormData.accountNumber || !bankFormData.ifscCode) {
      toast.error('Please fill all bank details');
      return;
    }
    try {
      const newRef = doc(collection(db, 'users', user.uid, 'bankAccounts'));
      await setDoc(newRef, {
        ...bankFormData,
        createdAt: serverTimestamp()
      });
      toast.success('Bank account linked successfully');
      setIsBankModalOpen(false);
      setBankFormData({ bankName: '', accountNumber: '', ifscCode: '', holderName: '' });
    } catch (error) {
      toast.error('Error linking bank account');
    }
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-[#f5aa00]" size={40} /></div>;

  return (
    <div className="bg-white p-6 md:p-10 rounded-xl shadow-xl shadow-gray-200/20 border border-[#f0dda0]/20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-[#f5aa00] to-[#e07a00] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-[#f5aa00]/20">
            <CreditCard size={24} strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="text-2xl font-sans font-bold text-[#1A1A1A] tracking-tight">Saved Payments</h2>
            <p className="text-[10px] text-[#f5aa00] font-bold uppercase tracking-[0.2em] mt-0.5">Secure Vault</p>
          </div>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-gradient-to-r from-[#f5aa00] to-[#e07a00] hover:shadow-xl hover:shadow-[#f5aa00]/20 text-white px-8 py-3.5 rounded-xl flex items-center gap-2 active:scale-95 transition-all text-[11px] font-bold uppercase tracking-widest shadow-lg shadow-[#f5aa00]/10"
        >
          <Plus size={16} strokeWidth={3} /> Add Card
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {cards.map(card => (
          <div key={card.id} className={`${card.brand || 'bg-gray-800'} p-8 rounded-xl text-white shadow-2xl relative overflow-hidden group transition-all duration-500`}>
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-24 translate-x-24 group-hover:scale-110 transition-transform duration-1000" />
            <div className="flex justify-between items-start mb-12 relative z-10">
              <div className="space-y-0.5">
                <p className="text-[9px] uppercase font-bold tracking-[0.3em] opacity-40">MayaSindhu Vault</p>
                <h4 className="text-lg font-sans font-bold italic tracking-wider">{card.type}</h4>
              </div>
              <ShieldCheck size={24} className="opacity-20" />
            </div>
            <div className="flex justify-between items-end relative z-10">
              <div>
                <p className="text-xl font-bold tracking-[0.2em] mb-4 font-sans">•••• •••• •••• {card.last4}</p>
                <div className="flex gap-6">
                  <div>
                    <p className="text-[7px] uppercase font-bold tracking-widest opacity-40 mb-1">Card Holder</p>
                    <p className="text-[10px] font-bold tracking-widest uppercase">{card.holder}</p>
                  </div>
                  <div>
                    <p className="text-[7px] uppercase font-bold tracking-widest opacity-40 mb-1">Expires</p>
                    <p className="text-[10px] font-bold tracking-widest">{card.expiry}</p>
                  </div>
                </div>
              </div>
              <button onClick={() => handleDelete(card.id, 'card')} className="p-2.5 bg-white/10 hover:bg-red-500/80 rounded-xl transition-all active:scale-90">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
        {cards.length === 0 && (
          <div className="col-span-1 md:col-span-2 border-2 border-dashed border-[#f0dda0]/30 rounded-xl p-12 flex flex-col items-center justify-center text-center bg-[#fffbf2]/20">
            <CreditCard size={40} className="text-[#f5aa00]/20 mb-4" />
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">No saved cards found in your vault</p>
          </div>
        )}
      </div>

      {/* Bank Accounts Section */}
      <div className="space-y-4">
        {bankAccounts.map(bank => (
          <div key={bank.id} className="p-6 border border-[#f0dda0]/30 rounded-xl flex items-center gap-5 bg-[#fffbf2]/30 shadow-sm group">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#f5aa00] shadow-sm border border-[#f0dda0]/10 group-hover:scale-105 transition-transform">
               <Landmark size={20} />
            </div>
            <div className="flex-grow">
              <div className="flex items-center gap-2">
                <h4 className="text-[13px] font-bold text-[#1A1A1A] uppercase tracking-tight">{bank.bankName}</h4>
                <CheckCircle2 size={14} className="text-green-500" />
              </div>
              <p className="text-[11px] text-gray-400 font-bold tracking-tight uppercase">A/C: ••••{bank.accountNumber.slice(-4)} • IFSC: {bank.ifscCode}</p>
            </div>
            <button onClick={() => handleDelete(bank.id, 'bank')} className="p-2.5 text-gray-300 hover:text-red-500 rounded-xl transition-all active:scale-90 bg-white shadow-sm border border-gray-100">
              <Trash2 size={16} />
            </button>
          </div>
        ))}

        <div className="p-6 border border-[#f0dda0]/30 rounded-xl flex items-center gap-5 bg-[#fffbf2]/30 shadow-sm">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#f5aa00]/40 shadow-sm">
             <Landmark size={20} />
          </div>
          <div>
            <h4 className="text-[13px] font-bold text-[#1A1A1A] uppercase tracking-tight">Link Bank Account</h4>
            <p className="text-[11px] text-gray-400 font-bold tracking-tight">For instant UPI refunds and simpler settlements</p>
          </div>
          <button 
            onClick={() => setIsBankModalOpen(true)}
            className="ml-auto p-2.5 text-[#f5aa00] hover:bg-[#f5aa00] hover:text-white rounded-xl transition-all shadow-sm bg-white active:scale-90"
          >
            <PlusCircle size={20} />
          </button>
        </div>
      </div>

      {/* Add Card Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-[#1A1A1A]/10 backdrop-blur-md overflow-y-auto py-10 md:py-20">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 border border-[#f0dda0]/20 my-auto">
            <div className="p-8 md:p-10 max-h-[90vh] overflow-y-auto no-scrollbar">
              <div className="flex items-center justify-between mb-8 sticky top-0 bg-white z-10 pb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#fffbf2] rounded-xl flex items-center justify-center text-[#f5aa00]">
                    <Plus size={20} />
                  </div>
                  <h3 className="text-xl font-sans font-bold text-[#1A1A1A] uppercase tracking-tight">Add New Card</h3>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 bg-gray-50 rounded-full text-gray-400 hover:text-red-500 transition-colors">
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-[#f5aa00] block px-2">Card Theme</label>
                  <div className="flex gap-3">
                    {[{ name: 'Blue', class: 'bg-gradient-to-br from-indigo-600 to-blue-700' }, { name: 'Black', class: 'bg-gradient-to-br from-gray-800 to-black' }, { name: 'Golden', class: 'bg-gradient-to-br from-[#f5aa00] to-[#e07a00]' }].map(theme => (
                      <button key={theme.name} type="button" onClick={() => setFormData({...formData, brand: theme.class})} className={`flex-1 h-10 rounded-xl transition-all border-4 ${theme.class} ${formData.brand === theme.class ? 'border-[#f5aa00]' : 'border-transparent'}`} />
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-[#f5aa00] block px-2">Card Type</label>
                    <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full bg-[#fffbf2] px-5 py-3.5 rounded-xl border border-[#f0dda0]/20 focus:outline-none focus:border-[#f5aa00] font-bold text-[13px]"><option>Visa</option><option>Mastercard</option><option>Rupay</option></select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-[#f5aa00] block px-2">Last 4 Digits</label>
                    <input type="text" maxLength={4} value={formData.last4} onChange={e => setFormData({...formData, last4: e.target.value.replace(/\D/g, '')})} className="w-full bg-[#fffbf2] px-5 py-3.5 rounded-xl border border-[#f0dda0]/20 focus:outline-none focus:border-[#f5aa00] font-bold text-[13px]" placeholder="4242" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-[#f5aa00] block px-2">Card Holder Name</label>
                  <input type="text" value={formData.holder} onChange={e => setFormData({...formData, holder: e.target.value.toUpperCase()})} className="w-full bg-[#fffbf2] px-5 py-3.5 rounded-xl border border-[#f0dda0]/20 focus:outline-none focus:border-[#f5aa00] font-bold text-[13px]" placeholder="FULL NAME" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-[#f5aa00] block px-2">Expiry Date</label>
                  <input type="text" placeholder="MM/YY" value={formData.expiry} onChange={e => setFormData({...formData, expiry: e.target.value})} className="w-full bg-[#fffbf2] px-5 py-3.5 rounded-xl border border-[#f0dda0]/20 focus:outline-none focus:border-[#f5aa00] font-bold text-[13px]" />
                </div>
                <button type="submit" className="w-full bg-gradient-to-r from-[#f5aa00] to-[#e07a00] text-white py-4 rounded-2xl uppercase tracking-[0.2em] font-black text-[11px] shadow-lg shadow-[#f5aa00]/10 mt-4 transition-all active:scale-95">Securely Save Card</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Link Bank Modal */}
      {isBankModalOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-[#1A1A1A]/10 backdrop-blur-md overflow-y-auto py-10 md:py-20">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 border border-[#f0dda0]/20 my-auto">
            <div className="p-8 md:p-10 max-h-[90vh] overflow-y-auto no-scrollbar">
              <div className="flex items-center justify-between mb-8 sticky top-0 bg-white z-10 pb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#fffbf2] rounded-xl flex items-center justify-center text-[#f5aa00]">
                    <Landmark size={20} />
                  </div>
                  <h3 className="text-xl font-sans font-black text-[#1A1A1A] uppercase tracking-tight">Link Bank Account</h3>
                </div>
                <button onClick={() => setIsBankModalOpen(false)} className="p-2 bg-gray-50 rounded-full text-gray-400 hover:text-red-500 transition-colors">
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleBankSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black tracking-widest text-[#f5aa00] block px-2">Account Holder Name</label>
                  <input type="text" value={bankFormData.holderName} onChange={e => setBankFormData({...bankFormData, holderName: e.target.value.toUpperCase()})} className="w-full bg-[#fffbf2] px-5 py-3.5 rounded-xl border border-[#f0dda0]/20 focus:outline-none focus:border-[#f5aa00] font-bold text-[13px]" placeholder="FULL NAME" required />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black tracking-widest text-[#f5aa00] block px-2">Bank Name</label>
                  <input type="text" value={bankFormData.bankName} onChange={e => setBankFormData({...bankFormData, bankName: e.target.value})} className="w-full bg-[#fffbf2] px-5 py-3.5 rounded-xl border border-[#f0dda0]/20 focus:outline-none focus:border-[#f5aa00] font-bold text-[13px]" placeholder="e.g. HDFC Bank" required />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black tracking-widest text-[#f5aa00] block px-2">Account Number</label>
                  <input type="text" value={bankFormData.accountNumber} onChange={e => setBankFormData({...bankFormData, accountNumber: e.target.value.replace(/\D/g, '')})} className="w-full bg-[#fffbf2] px-5 py-3.5 rounded-xl border border-[#f0dda0]/20 focus:outline-none focus:border-[#f5aa00] font-bold text-[13px]" placeholder="1234 5678 9012" required />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black tracking-widest text-[#f5aa00] block px-2">IFSC Code</label>
                  <input type="text" value={bankFormData.ifscCode} onChange={e => setBankFormData({...bankFormData, ifscCode: e.target.value.toUpperCase()})} className="w-full bg-[#fffbf2] px-5 py-3.5 rounded-xl border border-[#f0dda0]/20 focus:outline-none focus:border-[#f5aa00] font-bold text-[13px]" placeholder="HDFC0001234" required />
                </div>
                <button type="submit" className="w-full bg-gradient-to-r from-[#f5aa00] to-[#e07a00] text-white py-4 rounded-2xl uppercase tracking-[0.2em] font-black text-[11px] shadow-lg shadow-[#f5aa00]/10 mt-4 transition-all active:scale-95">Link Account Now</button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
