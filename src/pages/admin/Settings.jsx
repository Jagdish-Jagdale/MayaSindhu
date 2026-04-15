import React from 'react';
import { Settings as SettingsIcon, Shield, Bell, Palette, Globe } from 'lucide-react';

const Settings = () => {
  const sections = [
    { title: 'Atelier Branding', icon: Palette, desc: 'Visual identity, logo variations, and brand typography.' },
    { title: 'Boutique Security', icon: Shield, desc: 'Admin roles, MFA, and data encryption protocols.' },
    { title: 'Global Presence', icon: Globe, desc: 'Currency configurations, VAT, and international shipping nodes.' },
    { title: 'System Notifications', icon: Bell, desc: 'Stock alerts, order success triggers, and customer SMS.' },
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div>
        <h1 className="text-3xl font-serif text-[#390000] mb-2 tracking-tight">System Refinement</h1>
        <p className="text-[11px] font-bold text-black/40 uppercase tracking-[0.2em]">Calibrate your MayaSindhu digital experience</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {sections.map((section) => (
          <div key={section.title} className="bg-white border border-black/[0.03] p-10 group cursor-pointer hover:shadow-[0_20px_50px_rgba(57,0,0,0.05)] transition-all duration-500 flex items-start gap-8">
            <div className="w-16 h-16 bg-[#f5f5f7] flex items-center justify-center text-[#600000] group-hover:bg-[#600000] group-hover:text-white transition-all duration-700 rounded-0">
              <section.icon size={28} strokeWidth={1.5} />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-serif text-[#390000] mb-2">{section.title}</h3>
              <p className="text-sm text-black/40 font-medium leading-relaxed mb-6">{section.desc}</p>
              <button className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#D4AF37] hover:text-[#600000] transition-colors">Configure System</button>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-black/[0.03] pt-12 flex flex-col md:flex-row justify-between items-start gap-8">
        <div className="max-w-md">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#600000] mb-2">Technical Core</h4>
          <p className="text-xs text-black/30 font-medium leading-relaxed">System running version 4.2.0-Editorial. Current server latency: 24ms. All blockchain fulfillment nodes are active and verified.</p>
        </div>
        <button className="bg-[#f5f5f7] text-black/40 px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-red-50 hover:text-red-700 transition-all duration-500">
          Factory Reset Boutique
        </button>
      </div>
    </div>
  );
};

export default Settings;
