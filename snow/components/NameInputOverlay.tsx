
import React, { useState } from 'react';

interface NameInputOverlayProps {
  onSubmit: (name: string) => void;
  onClose: () => void;
}

const NameInputOverlay: React.FC<NameInputOverlayProps> = ({ onSubmit, onClose }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-[20000] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-500">
      <div 
        className="w-full max-w-[280px] bg-gradient-to-br from-[#f4f9ff] via-[#f9f4f8] to-[#fff4f9] border-[3px] border-[#e8dde5] rounded-[40px] p-7 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)] animate-in zoom-in-95 duration-300 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle decorative elements with low saturation blue/grey and red */}
        <div className="absolute top-4 left-6 text-[#d4c4d1] text-2xl opacity-40">
          <i className="fas fa-snowflake"></i>
        </div>
        <div className="absolute bottom-4 right-6 text-[#e4c4d4] text-2xl opacity-40">
          <i className="fas fa-sparkles"></i>
        </div>
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-16 h-16 bg-gradient-to-br from-[#ebf3fc] to-[#f5e8f0] rounded-[28px] flex items-center justify-center mb-5 shadow-inner">
            <i className="fas fa-gift text-[#a894b2] text-3xl"></i>
          </div>
          
          <h3 className="text-[#64748b] text-lg font-bold mb-1 text-center tracking-tight">Gift for you</h3>
          <p className="text-[#94a3b8] text-[11px] text-center mb-6 font-medium"></p>
          
          <form onSubmit={handleSubmit} className="w-full space-y-4">
            <div className="relative">
              <input
                autoFocus
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter name..."
                className="w-full bg-white/80 border-2 border-[#e8dde5] rounded-[20px] px-5 py-3 text-[#475569] placeholder:text-[#d4c4d1] focus:outline-none focus:border-[#d4a5c4] transition-all text-center text-base font-medium"
              />
            </div>
            
            <button
              type="submit"
              disabled={!name.trim()}
              className="w-full py-3.5 rounded-[20px] bg-gradient-to-r from-[#93c5fd] to-[#d4a5c4] text-white hover:from-[#60a5fa] hover:to-[#c895b4] disabled:bg-[#cbd5e1] disabled:text-white/60 transition-all text-xs font-bold uppercase tracking-widest shadow-lg shadow-blue-200/30 shadow-pink-200/30 active:scale-95"
            >
              Okay
            </button>
          </form>
        </div>
      </div>
      <div className="absolute inset-0 -z-10" onClick={onClose}></div>
    </div>
  );
};

export default NameInputOverlay;
