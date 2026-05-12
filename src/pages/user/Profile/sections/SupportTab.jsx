import React from 'react';
import { HelpCircle, ChevronDown, MessageCircle, PhoneCall, Mail, FileText } from 'lucide-react';

export default function SupportTab() {
  const faqs = [
    { q: "How can I track my heritage order?", a: "You can track your order in real-time through the 'My Orders' section of your dashboard. We also send a unique tracking link via SMS once the product is shipped." },
    { q: "What is your return policy for sarees?", a: "We offer a 7-day return policy for all unworn products. Since our products are handcrafted, please ensure the heritage tags are intact." },
    { q: "How long does a refund take?", a: "Once your return is approved, refunds are processed within 3-5 business days directly to your original payment method." },
  ];

  return (
    <div className="bg-white p-6 md:p-10 rounded-xl shadow-xl shadow-gray-200/20 border border-[#f0dda0]/20">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-[#f5aa00] to-[#e07a00] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-[#f5aa00]/20">
          <HelpCircle size={24} strokeWidth={1.5} />
        </div>
        <div>
          <h2 className="text-2xl font-sans font-bold text-[#1A1A1A] tracking-tight">Help & Support</h2>
          <p className="text-[10px] text-[#f5aa00] font-bold uppercase tracking-[0.2em] mt-0.5">Assistance Center</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="space-y-6">
          <h3 className="text-[15px] font-bold text-[#1A1A1A] uppercase tracking-wider mb-4 px-2">Frequently Asked Questions</h3>
          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <details key={idx} className="group p-5 bg-[#fffbf2]/40 rounded-2xl border border-[#f0dda0]/10 hover:border-[#f5aa00]/20 transition-all cursor-pointer">
                <summary className="flex items-center justify-between list-none text-[13px] font-bold text-gray-700">
                  {faq.q}
                  <ChevronDown size={16} className="text-[#f5aa00] group-open:rotate-180 transition-transform" />
                </summary>
                <p className="mt-3 text-[12px] text-gray-500 leading-relaxed font-medium">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-[15px] font-bold text-[#1A1A1A] uppercase tracking-wider mb-4 px-2">Direct Assistance</h3>
          <div className="grid grid-cols-2 gap-3">
            <SupportOption icon={<MessageCircle size={18} />} label="WhatsApp" color="text-green-500" />
            <SupportOption icon={<PhoneCall size={18} />} label="Call Us" color="text-blue-500" />
            <SupportOption icon={<Mail size={18} />} label="Email" color="text-[#f5aa00]" />
            <SupportOption icon={<FileText size={18} />} label="Tickets" color="text-indigo-500" />
          </div>
          
          <div className="bg-[#fffbf2]/40 p-8 rounded-xl border border-[#f0dda0]/20 shadow-sm">
             <h4 className="text-[13px] font-bold text-[#f5aa00] uppercase tracking-widest mb-2">Our Boutique Studio</h4>
             <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider leading-relaxed">
               Heritage Row, Block C-14, <br />
               Crafts District, Jaipur, Rajasthan.<br />
               Mon — Sat, 10am — 7pm
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SupportOption({ icon, label, color }) {
  return (
    <div className="p-5 bg-white border border-[#f0dda0]/10 rounded-xl flex flex-col items-center gap-3 hover:shadow-lg hover:border-[#f5aa00]/20 transition-all cursor-pointer active:scale-95 group shadow-sm">
      <div className={`w-10 h-10 rounded-xl bg-[#fffbf2] flex items-center justify-center ${color} transition-transform group-hover:scale-110 shadow-sm`}>
        {icon}
      </div>
      <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">{label}</span>
    </div>
  );
}
