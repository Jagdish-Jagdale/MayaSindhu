import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Shield, 
  Bell, 
  Palette, 
  Globe, 
  Layout, 
  ChevronDown,
  Save,
  RotateCcw
} from 'lucide-react';
import { useAdminUI } from '../../context/AdminUIContext';

const Settings = () => {
  const { isCollapsed } = useAdminUI();
  const [selectedHomeSection, setSelectedHomeSection] = useState('Banner');

  const homeSections = [
    'Banner',
    'Curated Realms',
    'Featured Treasures',
    'Artisan Blooms',
    'Stories',
    'Purpose'
  ];

  const sections = [
    { title: 'Atelier Branding', icon: Palette, desc: 'Visual identity, logo variations, and brand typography.', color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { title: 'Boutique Security', icon: Shield, desc: 'Admin roles, MFA, and data encryption protocols.', color: 'text-rose-600', bg: 'bg-rose-50' },
    { title: 'Global Presence', icon: Globe, desc: 'Currency, VAT, and international shipping nodes.', color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'System Notifications', icon: Bell, desc: 'Stock alerts, order triggers, and customer SMS.', color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <div className={`mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 transition-all duration-300 ${isCollapsed ? 'max-w-[1600px]' : 'max-w-[1280px]'}`} style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}>
      
      {/* Header Section */}
      <div className="space-y-2 py-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-semibold text-gray-900 tracking-tight">System Settings</h1>
            <p className="text-[12px] text-gray-400 font-medium font-inter">Configure your boutique experience and technical protocols</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 text-[13px] font-semibold text-gray-500 hover:text-gray-900 transition-colors px-4 py-2 rounded-xl hover:bg-gray-100">
              <RotateCcw size={16} />
              Reset
            </button>
            <button className="flex items-center gap-2 bg-[#1BAFAF] hover:bg-[#17a0a0] text-white px-5 py-2 rounded-xl text-[13px] font-semibold transition-all shadow-sm shadow-[#1BAFAF]/10 active:scale-95">
              <Save size={16} strokeWidth={2.5} />
              Save Changes
            </button>
          </div>
        </div>
        <hr className="border-gray-100" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Homepage Configuration Card (New) */}
        <div className="lg:col-span-1 bg-white border border-gray-100 rounded-[24px] p-8 shadow-sm hover:shadow-md transition-all flex flex-col h-full">
          <div className="w-12 h-12 bg-[#eaf6f6] rounded-2xl flex items-center justify-center text-[#1BAFAF] mb-6">
            <Layout size={24} strokeWidth={2} />
          </div>
          <div className="flex-1">
            <h3 className="text-[18px] font-bold text-gray-900 mb-2">Homepage Modules</h3>
            <p className="text-[13px] text-gray-400 font-medium leading-relaxed mb-8">
              Select which section of the homepage you'd like to configure or rearrange.
            </p>
            
            <div className="space-y-4">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest pl-1">Target Section</label>
              <div className="relative group">
                <select 
                  value={selectedHomeSection}
                  onChange={(e) => setSelectedHomeSection(e.target.value)}
                  className="w-full appearance-none bg-gray-50 border-none py-3.5 pl-5 pr-10 text-[14px] font-semibold text-gray-700 rounded-2xl focus:ring-2 focus:ring-[#1BAFAF]/10 focus:bg-white transition-all outline-none cursor-pointer"
                >
                  {homeSections.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <ChevronDown size={18} strokeWidth={2.5} />
                </div>
              </div>
              <p className="text-[11px] text-[#1BAFAF] font-black italic mt-2 px-1">
                Currently editing: {selectedHomeSection} content
              </p>
            </div>
          </div>
          <button className="mt-8 w-full py-3.5 bg-gray-50 text-gray-900 text-[13px] font-bold rounded-2xl hover:bg-[#1BAFAF] hover:text-white transition-all active:scale-95">
            Configure Module
          </button>
        </div>

        {/* Existing Sections Grid */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          {sections.map((section) => (
            <div key={section.title} className="bg-white border border-gray-100 rounded-[24px] p-8 group cursor-pointer hover:shadow-md transition-all duration-300 flex flex-col items-start">
              <div className={`w-12 h-12 ${section.bg} ${section.color} rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110`}>
                <section.icon size={22} strokeWidth={2} />
              </div>
              <div className="flex-1">
                <h3 className="text-[17px] font-bold text-gray-900 mb-2">{section.title}</h3>
                <p className="text-[13px] text-gray-400 font-medium leading-relaxed mb-6">{section.desc}</p>
              </div>
              <button className="text-[12px] font-bold text-[#1BAFAF] hover:underline decoration-2 underline-offset-4">
                Manage Protocol
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-6 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100">
            <SettingsIcon size={16} className="text-gray-400" />
          </div>
          <div>
            <h4 className="text-[12px] font-bold text-gray-900">Technical Heritage Core</h4>
            <p className="text-[11px] text-gray-400 font-medium">System v4.2.0 • Secured by MayaSindhu Tech Node</p>
          </div>
        </div>
        <button className="text-red-500 hover:text-red-700 text-[11px] font-black uppercase tracking-[0.2em] transition-colors">
          Factory Reset Boutique
        </button>
      </div>

    </div>
  );
};

export default Settings;
