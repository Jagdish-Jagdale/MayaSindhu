/**
 * File: SupportTab.jsx
 * Description: Help & Support section providing direct contact options (WhatsApp, Call, Email) and boutique studio address.
 */

import React from 'react';
import { HelpCircle, ChevronDown, MessageCircle, PhoneCall, Mail } from 'lucide-react';

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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <SupportOption
              href="https://wa.me/919172020494"
              target="_blank"
              icon={<MessageCircle size={20} />}
              label="WhatsApp"
              value="+91 9172020494"
              color="text-green-500"
            />
            <SupportOption
              href="tel:+919172020494"
              icon={<PhoneCall size={20} />}
              label="Call Us"
              value="+91 9172020494"
              color="text-blue-500"
            />
            <SupportOption
              href="mailto:mayasindhu2124@gmail.com"
              icon={<Mail size={20} />}
              label="Email"
              value="mayasindhu2124@gmail.com"
              color="text-[#f5aa00]"
            />
          </div>

          <div className="bg-[#fffbf2]/40 p-6 sm:p-8 rounded-xl border border-[#f0dda0]/20 shadow-sm">
            <h4 className="text-[13px] font-bold text-[#f5aa00] uppercase tracking-widest mb-2">Our Boutique Studio</h4>
            <p className="text-[11px] text-gray-600 font-bold uppercase tracking-wider leading-relaxed">
              Shop No. 5, Grandstand Apartment,<br />
              Survey No. 2945, K/10, Pratibha Nagar Road,<br />
              Kolhapur, Maharashtra.<br />
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SupportOption({ href, target, icon, label, value, color }) {
  return (
    <a
      href={href}
      target={target}
      rel={target === '_blank' ? 'noopener noreferrer' : undefined}
      className="p-4 bg-white border border-[#f0dda0]/10 rounded-xl flex flex-col items-center text-center gap-2 hover:shadow-lg hover:border-[#f5aa00]/30 transition-all active:scale-95 group shadow-sm"
    >
      <div className={`w-10 h-10 rounded-xl bg-[#fffbf2] flex items-center justify-center ${color} transition-transform group-hover:scale-110 shadow-sm`}>
        {icon}
      </div>
      <span className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]">{label}</span>
      {value && <span className="text-[9px] font-medium text-gray-500 break-all">{value}</span>}
    </a>
  );
}
