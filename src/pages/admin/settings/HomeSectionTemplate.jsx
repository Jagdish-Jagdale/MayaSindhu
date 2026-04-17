import React from 'react';
import { useAdminUI } from '../../../context/AdminUIContext';
import { Save, RotateCcw, Layout } from 'lucide-react';

export default function HomeSectionTemplate({ title, description }) {
  const { isCollapsed } = useAdminUI();

  return (
    <div className={`mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 transition-all duration-300 ${isCollapsed ? 'max-w-[1600px]' : 'max-w-[1280px]'}`} style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}>
      
      {/* Header Section */}
      <div className="space-y-2 py-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-semibold text-gray-900 tracking-tight">{title}</h1>
            <p className="text-[12px] text-gray-400 font-medium font-inter">{description}</p>
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

      {/* Main Content Area */}
      <div className="bg-white border border-gray-100 rounded-[24px] p-8 shadow-sm">
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="w-16 h-16 bg-[#eaf6f6] rounded-2xl flex items-center justify-center text-[#1BAFAF]">
            <Layout size={32} />
          </div>
          <div>
            <h3 className="text-[18px] font-bold text-gray-900">Configure {title}</h3>
            <p className="text-[14px] text-gray-400 max-w-sm mx-auto">
              This module allows you to edit the content and layout of the {title} section on your homepage.
            </p>
          </div>
          <button className="px-6 py-2.5 bg-gray-50 text-gray-900 text-[13px] font-bold rounded-xl hover:bg-gray-100 transition-all">
            Start Editing
          </button>
        </div>
      </div>

    </div>
  );
}
