import React from 'react';
import { Wifi, Battery } from 'lucide-react';

interface StatusBarProps {
  isDark?: boolean;
}

export const StatusBar: React.FC<StatusBarProps> = ({ isDark }) => {
  return (
    <>
      {/* Desktop / Large Screen Phone Simulator Header */}
      <div className={`hidden sm:flex w-full h-8 px-6 justify-between items-center text-xs font-semibold select-none sticky top-0 z-30 shrink-0 transition-colors ${
        isDark ? 'bg-[#12131C] text-gray-200' : 'bg-white/80 backdrop-blur-md text-gray-800'
      }`}>
        <span className="font-medium tracking-tight">10:24</span>
        {/* Front camera punch hole */}
        <div className="w-3.5 h-3.5 bg-black rounded-full mx-auto" />
        <div className="flex items-center gap-1.5">
          <Wifi className="w-3.5 h-3.5 stroke-[2.5]" />
          <span className="text-[11px] font-bold">5G</span>
          <Battery className={`w-4 h-4 stroke-[1.5] ${isDark ? 'fill-gray-200' : 'fill-gray-800'}`} />
        </div>
      </div>

      {/* Real Mobile Device Safe Area Top Notch Spacer */}
      <div className="sm:hidden w-full h-[env(safe-area-inset-top,0px)] shrink-0" />
    </>
  );
};
