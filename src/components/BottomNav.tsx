import React from 'react';
import { Calendar as CalendarIcon, Settings as SettingsIcon } from 'lucide-react';
import type { ViewScreen } from '../types';

interface BottomNavProps {
  currentScreen: ViewScreen;
  isDark?: boolean;
  onNavigate: (screen: ViewScreen) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentScreen, isDark, onNavigate }) => {
  const isCalendar = currentScreen === 'calendar' || currentScreen === 'day_detail';
  const isSettings = currentScreen === 'settings';

  return (
    <div className={`w-full border-t px-4 sm:px-8 pt-2 pb-[max(0.6rem,env(safe-area-inset-bottom))] flex justify-around items-center sticky bottom-0 z-30 shadow-[0_-2px_10px_rgba(0,0,0,0.03)] transition-colors shrink-0 ${
      isDark ? 'bg-[#181924] border-gray-800' : 'bg-white border-gray-100'
    }`}>
      {/* Calendar Tab */}
      <button
        onClick={() => onNavigate('calendar')}
        className={`flex flex-col items-center justify-center py-1.5 px-4 sm:px-6 rounded-2xl transition-all duration-200 cursor-pointer active:scale-95 ${
          isCalendar
            ? isDark
              ? 'bg-purple-950/60 text-[#6C47FF]'
              : 'bg-[#F3E8FF] text-[#6C47FF]'
            : isDark
            ? 'text-gray-400 hover:text-gray-200'
            : 'text-gray-400 hover:text-gray-700'
        }`}
      >
        <CalendarIcon className="w-5 h-5 mb-0.5 stroke-[2.2]" />
        <span className="text-[11px] font-bold tracking-wide">Calendar</span>
      </button>

      {/* Settings Tab */}
      <button
        onClick={() => onNavigate('settings')}
        className={`flex flex-col items-center justify-center py-1.5 px-4 sm:px-6 rounded-2xl transition-all duration-200 cursor-pointer active:scale-95 ${
          isSettings
            ? isDark
              ? 'bg-purple-950/60 text-[#6C47FF]'
              : 'bg-[#F3E8FF] text-[#6C47FF]'
            : isDark
            ? 'text-gray-400 hover:text-gray-200'
            : 'text-gray-400 hover:text-gray-700'
        }`}
      >
        <SettingsIcon className="w-5 h-5 mb-0.5 stroke-[2.2]" />
        <span className="text-[11px] font-bold tracking-wide">Settings</span>
      </button>
    </div>
  );
};