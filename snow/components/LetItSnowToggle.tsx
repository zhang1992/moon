
import React from 'react';

interface LetItSnowToggleProps {
  active: boolean;
  onToggle: () => void;
}

const LetItSnowToggle: React.FC<LetItSnowToggleProps> = ({ active, onToggle }) => {
  return (
    <div className="fixed bottom-0 left-0 z-[10001] safe-pb safe-pl p-6">
      <button
        onClick={onToggle}
        className="flex items-center gap-3 px-5 py-3 rounded-full bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all duration-500 shadow-xl backdrop-blur-md active:scale-95 group"
      >
        <div className={`transition-all duration-1000 ${active ? 'rotate-[360deg] scale-110 text-blue-400' : 'rotate-0 text-white/40'}`}>
          <i className="fas fa-snowflake text-base"></i>
        </div>
        <span className="text-[14px] font-medium tracking-tight whitespace-nowrap">
          {active ? 'Stop Snowing' : 'Let It Snow'}
        </span>
      </button>
    </div>
  );
};

export default LetItSnowToggle;
