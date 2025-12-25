
import React from 'react';

interface LandingPageProps {
  isSnowing: boolean;
  onToggle: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ isSnowing }) => {
  return (
    <div className="relative flex flex-col items-center justify-center h-full w-full pointer-events-none z-10">
      {/* Background Ambience - minimal subtle glow */}
      <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[120%] aspect-square bg-blue-500/5 blur-[120px] rounded-full transition-opacity duration-1000 ${isSnowing ? 'opacity-100' : 'opacity-20'}`}></div>
      
      {/* Optional minimal visual center point */}
      <div className={`w-px h-24 bg-gradient-to-b from-transparent via-white/5 to-transparent transition-opacity duration-1000 ${isSnowing ? 'opacity-50' : 'opacity-0'}`}></div>
    </div>
  );
};

export default LandingPage;
