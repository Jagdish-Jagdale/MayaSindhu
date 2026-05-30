import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';

const CustomSelect = ({ value, onChange, options, label, icon: Icon, className = "", minimal = false, valuePrefix = "", align = "between" }) => {
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
  
  const getPrefixLabel = (opt) => {
    if (!opt || typeof opt !== 'object') return value;
    return opt.prefixLabel ?? getOptionValue(opt);
  };

  // For the button, if valuePrefix exists, we want to show "Prefix: Value"
  // If it's a "rows" selector, we usually want "Rows: 10" instead of "Rows: 10 rows"
  const buttonDisplay = valuePrefix 
    ? <div className="flex items-center gap-1.5">
        <span className="text-gray-500">{valuePrefix}</span>
        <span className="text-[#1BAFAF]">{getPrefixLabel(selectedOption)}</span>
      </div>
    : displayValue;

  return (
    <div className={`relative ${className}`} ref={containerRef} style={{ zIndex: isOpen ? 100 : 'auto' }}>
      {label && <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-1.5 block">{label}</label>}
      <div className="relative group">
        {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-[#1BAFAF] transition-colors" />}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full transition-all flex items-center ${
            align === 'center' ? 'justify-center gap-1.5 text-center' :
            align === 'left' ? 'justify-start gap-1.5 text-left' : 'justify-between text-left'
          } outline-none ${
            minimal 
              ? `bg-transparent py-1.5 px-2 text-[12px] font-semibold text-gray-500 hover:text-gray-900` 
              : `bg-gray-50 border-2 border-transparent py-2.5 ${Icon ? 'pl-8' : 'px-4'} pr-5 text-[13px] font-bold text-gray-700 rounded-xl shadow-sm hover:bg-gray-100/50 focus:bg-white focus:border-[#1BAFAF]/20`
          }`}
        >
          <div className="truncate">{buttonDisplay}</div>
          <ChevronDown size={minimal ? 12 : 14} className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} shrink-0 ml-1`} />
        </button>
      </div>

      {isOpen && (
        <div className={`absolute top-full ${minimal ? 'right-0 min-w-[120px]' : 'left-0 w-full'} mt-2 bg-white border border-gray-100 rounded-xl shadow-2xl z-[150] py-1 max-h-60 overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95 duration-200`}>
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
                className={`w-full text-left px-4 py-2 text-[13px] font-bold transition-all ${
                  isSelected ? 'bg-[#EAF6F6] text-[#1BAFAF]' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {optLabel}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
