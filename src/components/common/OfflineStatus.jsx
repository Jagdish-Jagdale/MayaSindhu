import React from 'react';
import { WifiOff, RefreshCcw } from 'lucide-react';

const OfflineStatus = () => {
  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-6"
      style={{
        background: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(15px)',
        WebkitBackdropFilter: 'blur(15px)',
        fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif"
      }}
    >
      <div 
        className="w-full max-w-[400px] p-10 text-center animate-in fade-in zoom-in duration-500"
        style={{
          background: 'rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
          borderRadius: '32px',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        }}
      >
        <div className="mb-8 flex justify-center">
          <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center relative">
            <WifiOff size={40} className="text-white opacity-90" />
            <div className="absolute inset-0 rounded-full border-2 border-white/20 animate-ping" />
          </div>
        </div>

        <h2 className="text-[24px] font-bold text-white mb-2 tracking-tight">Offline Mode</h2>
        <p className="text-[14px] text-white/70 mb-8 leading-relaxed font-medium">
          It looks like your connection has been interrupted. <br />
          MayaSindhuu will sync once you are back online.
        </p>

        <div className="flex items-center justify-center gap-3 text-white/90 font-bold text-[12px] uppercase tracking-widest bg-white/10 py-3 px-6 rounded-full border border-white/10 transition-all hover:bg-white/20">
          <RefreshCcw size={14} className="animate-spin" />
          <span>Attempting Reconnection...</span>
        </div>
      </div>
    </div>
  );
};

export default OfflineStatus;
