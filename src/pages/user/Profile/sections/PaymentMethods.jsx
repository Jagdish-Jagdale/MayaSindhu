import React from 'react';
import { CreditCard, Plus, Trash2, Landmark, ShieldCheck } from 'lucide-react';

export default function PaymentMethods() {
  const cards = [
    { id: 1, type: 'Visa', last4: '4242', expiry: '12/26', holder: 'ANJALI SHARMA', brand: 'bg-gradient-to-br from-indigo-600 to-blue-700' },
    { id: 2, type: 'Mastercard', last4: '8812', expiry: '05/27', holder: 'ANJALI SHARMA', brand: 'bg-gradient-to-br from-gray-800 to-black' }
  ];

  return (
    <div className="bg-white p-10 md:p-14 rounded-[4rem] shadow-sm border border-gray-50">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-4">
          <CreditCard className="text-brand-orange" size={28} />
          <h2 className="text-3xl font-fashion font-bold text-[#1A1A1A]">Saved Payments</h2>
        </div>
        <button className="btn btn-primary px-8 py-4 rounded-2xl flex items-center gap-2 text-sm font-bold uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-brand-orange/10">
          <Plus size={18} /> Add Card
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {cards.map(card => (
          <div key={card.id} className={`${card.brand} p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group hover:-translate-y-2 transition-all duration-500`}>
            {/* Glossy Overlay */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32 group-hover:scale-110 transition-transform duration-1000" />
            
            <div className="flex justify-between items-start mb-16 relative z-10">
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-bold tracking-[0.3em] opacity-60">MayaSindhu Vault</p>
                <h4 className="text-xl font-fashion font-bold italic tracking-wider">{card.type}</h4>
              </div>
              <ShieldCheck size={28} className="opacity-20" />
            </div>

            <div className="flex justify-between items-end relative z-10">
              <div>
                <p className="text-2xl font-bold tracking-[0.2em] mb-4">•••• •••• •••• {card.last4}</p>
                <div className="flex gap-8">
                  <div>
                    <p className="text-[8px] uppercase tracking-widest opacity-50 mb-1">Card Holder</p>
                    <p className="text-xs font-bold tracking-widest">{card.holder}</p>
                  </div>
                  <div>
                    <p className="text-[8px] uppercase tracking-widest opacity-50 mb-1">Expires</p>
                    <p className="text-xs font-bold tracking-widest">{card.expiry}</p>
                  </div>
                </div>
              </div>
              <button className="p-3 bg-white/10 rounded-xl hover:bg-red-500 transition-colors">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="p-8 border-2 border-dashed border-gray-100 rounded-[3rem] flex items-center gap-6 bg-[#FAF9F6]/30">
        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-gray-300">
           <Landmark size={24} />
        </div>
        <div>
          <h4 className="text-sm font-bold text-[#1A1A1A]">Link Bank Account</h4>
          <p className="text-xs text-gray-400 font-medium tracking-wide">For instant UPI refunds and simpler settlements</p>
        </div>
        <button className="ml-auto p-3 text-brand-orange hover:bg-brand-orange/5 rounded-xl transition-colors">
          <Plus size={20} />
        </button>
      </div>
    </div>
  );
}
