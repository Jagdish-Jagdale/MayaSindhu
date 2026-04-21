import React from 'react';
import { HelpCircle, ChevronDown, MessageCircle, PhoneCall, Mail, FileText } from 'lucide-react';

export default function SupportTab() {
  const faqs = [
    { q: "How can I track my heritage order?", a: "You can track your order in real-time through the 'My Orders' section of your dashboard. We also send a unique tracking link via SMS once the product is shipped." },
    { q: "What is your return policy for sarees?", a: "We offer a 7-day return policy for all unworn products. Since our products are handcrafted, please ensure the heritage tags are intact." },
    { q: "How long does a refund take?", a: "Once your return is approved, refunds are processed within 3-5 business days directly to your original payment method." },
  ];

  return (
    <div className="bg-white p-10 md:p-14 rounded-[4rem] shadow-sm border border-gray-50">
      <div className="flex items-center gap-4 mb-12">
        <HelpCircle className="text-brand-orange" size={28} />
        <h2 className="text-3xl font-fashion font-bold text-[#1A1A1A]">Help & Support</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
        <div className="space-y-6">
          <h3 className="text-xl font-fashion font-bold text-[#1A1A1A] mb-8">Frequently Asked Questions</h3>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <details key={idx} className="group p-6 bg-[#FAF9F6] rounded-3xl border border-transparent hover:border-brand-orange/10 transition-all cursor-pointer">
                <summary className="flex items-center justify-between list-none text-sm font-bold text-gray-700">
                  {faq.q}
                  <ChevronDown size={18} className="text-gray-400 group-open:rotate-180 transition-transform" />
                </summary>
                <p className="mt-4 text-xs text-gray-500 leading-relaxed font-medium">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          <h3 className="text-xl font-fashion font-bold text-[#1A1A1A] mb-8">Direct Assistance</h3>
          <div className="grid grid-cols-2 gap-4">
            <SupportOption icon={<MessageCircle />} label="WhatsApp" color="text-green-500" />
            <SupportOption icon={<PhoneCall />} label="Call Us" color="text-blue-500" />
            <SupportOption icon={<Mail />} label="Email" color="text-brand-orange" />
            <SupportOption icon={<FileText />} label="Tickets" color="text-indigo-500" />
          </div>
          
          <div className="bg-brand-orange/[0.03] p-10 rounded-[3rem] border border-brand-orange/5">
             <h4 className="font-fashion font-bold text-brand-orange mb-2">Our Boutique Studio</h4>
             <p className="text-xs text-gray-400 font-medium leading-relaxed">
               Heritage Row, Block C-14, <br />
               Crafts District, Jaipur, Rajasthan.<br />
               Monday — Saturday, 10am — 7pm
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SupportOption({ icon, label, color }) {
  return (
    <div className="p-6 bg-white border border-gray-50 rounded-[2.5rem] flex flex-col items-center gap-4 hover:shadow-md transition-all cursor-pointer active:scale-95 group">
      <div className={`w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center ${color} transition-transform group-hover:scale-110`}>
        {icon}
      </div>
      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{label}</span>
    </div>
  );
}
