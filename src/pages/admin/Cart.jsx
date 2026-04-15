import React from 'react';
import { ShoppingCart, Clock, UserCheck } from 'lucide-react';

const Cart = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h1 className="text-3xl font-serif text-[#390000] mb-2 tracking-tight">Active Consultations</h1>
        <p className="text-[11px] font-bold text-black/40 uppercase tracking-[0.2em]">View pieces currently held in client selection sessions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white border border-black/[0.03] p-8 shadow-sm relative group overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#D4AF37]/40"></div>
            <div className="flex justify-between items-start mb-6">
              <div className="w-10 h-10 bg-[#f5f5f7] flex items-center justify-center text-[#600000]">
                <ShoppingCart size={18} />
              </div>
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] px-2 py-1 bg-[#600000] text-white">Active session</span>
            </div>
            
            <div className="space-y-1 mb-8">
              <h3 className="text-lg font-serif text-[#390000]">Collection 0{i}52</h3>
              <div className="flex items-center gap-4 text-[11px] text-black/40 font-bold uppercase tracking-widest">
                <span className="flex items-center gap-1"><Clock size={12} /> 12m ago</span>
                <span className="flex items-center gap-1"><UserCheck size={12} /> Guest ID: 4122</span>
              </div>
            </div>

            <div className="space-y-3 pt-6 border-t border-black/[0.03]">
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                <span className="text-black/30">Masterpieces</span>
                <span className="text-[#390000]">02 Items</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase tracking-widest text-black/30">Current Value</span>
                <span className="text-sm font-serif font-bold text-[#600000]">\u20B91,45,000</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="bg-[#fefccf] p-10 flex items-center justify-between border border-[#600000]/5">
        <div className="max-w-md">
          <h2 className="text-xl font-serif text-[#390000] mb-2">Automated Follow-ups</h2>
          <p className="text-xs text-[#390000]/60 leading-relaxed font-medium">Boutique clients with abandoned collections for more than 24 hours will automatically be filtered for personal outreach by our lead curators.</p>
        </div>
        <button className="bg-[#600000] text-white px-8 py-4 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-[#390000] transition-colors"> Configure Alerts </button>
      </div>
    </div>
  );
};

export default Cart;
