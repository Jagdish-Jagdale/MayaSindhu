import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';

const CustomSelect = ({ value, onChange, options, label, icon: Icon, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`space-y-1.5 relative ${className}`} ref={containerRef}>
      {label && <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">{label}</label>}
      <div className="relative group">
        {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-[#1BAFAF] transition-colors" />}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full bg-gray-50 border-2 border-transparent py-3.5 ${Icon ? 'pl-12' : 'px-4'} pr-10 text-[14px] font-bold text-gray-700 rounded-2xl outline-none focus:bg-white focus:border-[#1BAFAF]/20 transition-all flex items-center justify-between`}
        >
          <span className="truncate">
            {options.find(o => (typeof o === 'string' ? o : (o.id || o.value)) === value)?.name || 
             options.find(o => (typeof o === 'string' ? o : (o.id || o.value)) === value)?.label || 
             value || 'Select Option'}
          </span>
          <ChevronDown size={18} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''} absolute right-4`} />
        </button>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl z-[150] py-2 max-h-60 overflow-y-auto custom-scrollbar">
          {options.map((opt) => {
            const optValue = typeof opt === 'string' ? opt : (opt.id || opt.value);
            const optLabel = typeof opt === 'string' ? opt : (opt.name || opt.label);
            const isSelected = optValue === value;

            return (
              <button
                key={optValue}
                type="button"
                onClick={() => {
                  onChange(optValue);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-3 text-[14px] font-bold transition-all flex items-center justify-between group ${
                  isSelected ? 'bg-[#EAF6F6] text-[#1BAFAF]' : 'text-gray-600 hover:bg-[#EAF6F6] hover:text-[#1BAFAF]'
                }`}
              >
                <span>{optLabel}</span>
                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-[#1BAFAF]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
