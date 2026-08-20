import React from 'react';
import { ScreenView } from '../types';

interface BottomNavBarProps {
  currentScreen: ScreenView;
  onNavigate: (screen: ScreenView) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ currentScreen, onNavigate }) => {
  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center h-16 pb-safe px-2 md:hidden bg-[#fcf9f8] border-t border-[#e4beba] shadow-sm select-none">
      {/* 1. Citizen SOS Home */}
      <button
        onClick={() => onNavigate('home')}
        className={`flex flex-col items-center justify-center py-1 transition-all duration-150 active:scale-95 cursor-pointer ${
          currentScreen === 'home' || currentScreen === 'report_new' || currentScreen === 'user_status' || currentScreen === 'sms_fallback'
            ? 'bg-[#af101a] text-white rounded-xl px-3 py-1 font-bold shadow-xs'
            : 'text-[#5b403d] px-2 hover:bg-[#f6f3f2] rounded-lg'
        }`}
      >
        <span className="material-symbols-outlined text-[20px]">person</span>
        <span className="font-bold text-[10px] leading-tight">User</span>
      </button>

      {/* 2. Dispatcher CAD */}
      <button
        onClick={() => onNavigate('dispatcher_dashboard')}
        className={`flex flex-col items-center justify-center py-1 transition-all duration-150 active:scale-95 cursor-pointer ${
          currentScreen === 'dispatcher_dashboard' || currentScreen === 'responder_incident'
            ? 'bg-[#af101a] text-white rounded-xl px-3 py-1 font-bold shadow-xs'
            : 'text-[#5b403d] px-2 hover:bg-[#f6f3f2] rounded-lg'
        }`}
      >
        <span className="material-symbols-outlined text-[20px]">headset_mic</span>
        <span className="font-bold text-[10px] leading-tight">Dispatch</span>
      </button>

      {/* 3. Stations Portal */}
      <button
        onClick={() => onNavigate('station_portal')}
        className={`flex flex-col items-center justify-center py-1 transition-all duration-150 active:scale-95 cursor-pointer ${
          currentScreen === 'station_portal'
            ? 'bg-[#af101a] text-white rounded-xl px-3 py-1 font-bold shadow-xs'
            : 'text-[#5b403d] px-2 hover:bg-[#f6f3f2] rounded-lg'
        }`}
      >
        <span className="material-symbols-outlined text-[20px]">apartment</span>
        <span className="font-bold text-[10px] leading-tight">Stations</span>
      </button>

      {/* 4. Admin Portal */}
      <button
        onClick={() => onNavigate('admin_dashboard')}
        className={`flex flex-col items-center justify-center py-1 transition-all duration-150 active:scale-95 cursor-pointer ${
          currentScreen === 'admin_dashboard' || currentScreen === 'personnel' || currentScreen === 'analytics' || currentScreen === 'settings'
            ? 'bg-[#af101a] text-white rounded-xl px-3 py-1 font-bold shadow-xs'
            : 'text-[#5b403d] px-2 hover:bg-[#f6f3f2] rounded-lg'
        }`}
      >
        <span className="material-symbols-outlined text-[20px]">admin_panel_settings</span>
        <span className="font-bold text-[10px] leading-tight">Admin</span>
      </button>
    </nav>
  );
};
