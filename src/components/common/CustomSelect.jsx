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

  const getOptionValue = (opt) => (typeof opt === 'object' && opt !== null) ? (opt.id ?? opt.value) : opt;
  const getOptionLabel = (opt) => (typeof opt === 'object' && opt !== null) ? (opt.name ?? opt.label ?? opt.value) : opt;

  const selectedOption = options.find(opt => getOptionValue(opt) == value);
  const displayValue = selectedOption ? getOptionLabel(selectedOption) : (value || 'Select Option');

  return (
    <div className={`space-y-1.5 relative ${className}`} ref={containerRef} style={{ zIndex: isOpen ? 100 : 'auto' }}>
      {label && <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">{label}</label>}
      <div className="relative group">
        {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-[#1BAFAF] transition-colors" />}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full bg-gray-50 border-2 border-transparent py-1 ${Icon ? 'pl-8' : 'px-2.5'} pr-5 text-[11px] font-bold text-gray-700 rounded-lg outline-none focus:bg-white focus:border-[#1BAFAF]/20 transition-all flex items-center justify-between text-left shadow-sm hover:bg-gray-100/50`}
        >
          <span className="truncate">{displayValue}</span>
          <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} shrink-0`} />
        </button>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl z-[150] py-2 max-h-60 overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95 duration-200">
          {options.map((opt) => {
            const optValue = getOptionValue(opt);
            const optLabel = getOptionLabel(opt);
            const isSelected = optValue == value;

            return (
              <button
                key={optValue}
                type="button"
                onClick={() => {
                  onChange(optValue);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-3 text-[13px] font-bold transition-all flex items-center justify-between group ${
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
