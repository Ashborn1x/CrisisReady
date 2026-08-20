import React from 'react';
import { ScreenView, UserRole } from '../types';
import { CrisisReadyLogo } from './CrisisReadyLogo';

export interface NavigationDrawerProps {
  currentScreen: ScreenView;
  onNavigate: (screen: ScreenView) => void;
  isOffline?: boolean;
  activeCriticalCount?: number;
  isOpen?: boolean;
  onClose?: () => void;
  userRole?: UserRole;
  onRoleChange?: (role: UserRole) => void;
}

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  currentScreen,
  onNavigate,
  isOffline = false,
  activeCriticalCount = 0,
  isOpen = false,
  onClose,
  userRole = 'user',
  onRoleChange
}) => {
  const handleNav = (screen: ScreenView) => {
    if (typeof onNavigate === 'function') {
      onNavigate(screen);
    }
    if (typeof onClose === 'function') {
      onClose();
    }
  };

  const handleRoleSelect = (newRole: UserRole, targetScreen: ScreenView) => {
    if (onRoleChange) {
      onRoleChange(newRole);
    }
    handleNav(targetScreen);
  };

  const isCitizenMode = userRole === 'user' || userRole === 'citizen';

  const navContent = (
    <div className="flex flex-col h-full w-72 bg-[#f0eded] border-r border-[#e4beba] select-none py-5 shadow-md md:shadow-none">
      {/* Brand Header */}
      <div className="px-5 mb-4 pb-3 border-b border-[#e4beba]/60 flex items-center justify-between">
        <CrisisReadyLogo
          size="sm"
          onClick={() => handleNav(isCitizenMode ? 'home' : 'dispatcher_dashboard')}
          className="cursor-pointer"
        />
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden text-[#5b403d] hover:text-[#1b1c1c] p-1 rounded-lg cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        )}
      </div>

      {/* Primary Role Switcher */}
      <div className="px-4 mb-4">
        <span className="text-[10px] font-bold text-[#5b403d] uppercase tracking-wider px-1 block mb-2">
          Select Primary Interface:
        </span>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => handleRoleSelect('user', 'home')}
            className={`p-3 rounded-xl text-left text-xs font-bold transition-all flex items-center gap-3 cursor-pointer ${
              isCitizenMode
                ? 'bg-[#af101a] text-white shadow-xs'
                : 'bg-white text-[#5b403d] hover:bg-[#eae7e7] border border-[#e4beba]'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                isCitizenMode ? 'bg-white/20 text-white' : 'bg-[#0284c7]/10 text-[#0284c7]'
              }`}
            >
              <span className="material-symbols-outlined text-lg">smartphone</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm">Citizen Mobile App</span>
              <span className={`text-[10px] font-normal ${isCitizenMode ? 'text-white/80' : 'text-[#5b403d]'}`}>
                One-tap SOS, status tracking & guides
              </span>
            </div>
          </button>

          <button
            onClick={() => handleRoleSelect('dispatcher', 'dispatcher_dashboard')}
            className={`p-3 rounded-xl text-left text-xs font-bold transition-all flex items-center gap-3 cursor-pointer ${
              userRole === 'dispatcher'
                ? 'bg-[#af101a] text-white shadow-xs'
                : 'bg-white text-[#5b403d] hover:bg-[#eae7e7] border border-[#e4beba]'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                userRole === 'dispatcher' ? 'bg-white/20 text-white' : 'bg-[#0058a2]/10 text-[#0058a2]'
              }`}
            >
              <span className="material-symbols-outlined text-lg">desktop_windows</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm">Dispatcher CAD Dashboard</span>
              <span className={`text-[10px] font-normal ${userRole === 'dispatcher' ? 'text-white/80' : 'text-[#5b403d]'}`}>
                911 Triage queue, GIS map & unit dispatch
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* System Status Summary */}
      <div className="px-4 mb-4">
        <div className="bg-white p-3 rounded-xl border border-[#e4beba] flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0 font-bold ${
              isCitizenMode ? 'bg-[#0284c7]' : 'bg-[#0058a2]'
            }`}
          >
            <span className="material-symbols-outlined text-xl">
              {isCitizenMode ? 'person' : 'headset_mic'}
            </span>
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="font-bold text-xs text-[#1b1c1c] truncate">
              {isCitizenMode ? 'Citizen User' : 'Dispatcher (CAD-042)'}
            </span>
            <span className="text-[11px] text-[#5b403d] truncate">
              {isCitizenMode ? 'Mobile Emergency Portal' : 'CAD Central 911'}
            </span>
            <span className="text-[10px] flex items-center gap-1 mt-0.5 font-semibold">
              <span
                className={`w-1.5 h-1.5 rounded-full inline-block ${
                  isOffline ? 'bg-[#ba1a1a]' : 'bg-[#15803d] animate-pulse'
                }`}
              ></span>
              <span className={isOffline ? 'text-[#ba1a1a]' : 'text-[#15803d]'}>
                {isOffline ? 'Offline Mode' : isCitizenMode ? 'Connected (LTE / 5G)' : 'CAD Workstation Online'}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Quick Nav Links */}
      <div className="flex-1 flex flex-col gap-1 overflow-y-auto no-scrollbar px-3">
        {isCitizenMode ? (
          <>
            <span className="text-[10px] font-bold text-[#5b403d] uppercase tracking-wider px-2 block mb-1">
              Citizen Navigation:
            </span>
            <button
              onClick={() => handleNav('home')}
              className="flex items-center gap-3.5 w-full rounded-lg px-4 py-2.5 text-left text-[#5b403d] hover:bg-[#eae7e7] font-medium cursor-pointer"
            >
              <span className="material-symbols-outlined text-xl text-[#ba1a1a]">emergency</span>
              <span className="text-sm">SOS Emergency Home</span>
            </button>
            <button
              onClick={() => handleNav('report_new')}
              className="flex items-center gap-3.5 w-full rounded-lg px-4 py-2.5 text-left text-[#5b403d] hover:bg-[#eae7e7] font-medium cursor-pointer"
            >
              <span className="material-symbols-outlined text-xl text-[#0284c7]">add_alert</span>
              <span className="text-sm">File Incident Report</span>
            </button>
            <button
              onClick={() => handleNav('user_status')}
              className="flex items-center gap-3.5 w-full rounded-lg px-4 py-2.5 text-left text-[#5b403d] hover:bg-[#eae7e7] font-medium cursor-pointer"
            >
              <span className="material-symbols-outlined text-xl text-[#15803d]">track_changes</span>
              <span className="text-sm">My Emergency Tracker</span>
            </button>
            <button
              onClick={() => handleNav('sms_fallback')}
              className="flex items-center gap-3.5 w-full rounded-lg px-4 py-2.5 text-left text-[#5b403d] hover:bg-[#eae7e7] font-medium cursor-pointer"
            >
              <span className="material-symbols-outlined text-xl text-[#ea580c]">sms</span>
              <span className="text-sm">Offline SMS Beacon</span>
            </button>
          </>
        ) : (
          <>
            <span className="text-[10px] font-bold text-[#5b403d] uppercase tracking-wider px-2 block mb-1">
              CAD Command Navigation:
            </span>
            <button
              onClick={() => handleNav('dispatcher_dashboard')}
              className="flex items-center justify-between w-full rounded-lg px-4 py-2.5 text-left text-[#5b403d] hover:bg-[#eae7e7] font-medium cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <span className="material-symbols-outlined text-xl text-[#ba1a1a]">emergency</span>
                <span className="text-sm">CAD Incident Control</span>
              </div>
              {activeCriticalCount > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ffdad6] text-[#93000a]">
                  {activeCriticalCount} Crit
                </span>
              )}
            </button>
            <button
              onClick={() => handleNav('resource_map')}
              className="flex items-center gap-3.5 w-full rounded-lg px-4 py-2.5 text-left text-[#5b403d] hover:bg-[#eae7e7] font-medium cursor-pointer"
            >
              <span className="material-symbols-outlined text-xl text-[#0058a2]">map</span>
              <span className="text-sm">Tactical GIS Map</span>
            </button>
            <button
              onClick={() => handleNav('responder_incident')}
              className="flex items-center gap-3.5 w-full rounded-lg px-4 py-2.5 text-left text-[#5b403d] hover:bg-[#eae7e7] font-medium cursor-pointer"
            >
              <span className="material-symbols-outlined text-xl text-[#d97706]">local_shipping</span>
              <span className="text-sm">Field Responders Live</span>
            </button>
          </>
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-auto px-4 pt-3 border-t border-[#e4beba] text-[11px] text-[#5b403d]">
        <div className="flex items-center justify-between">
          <span>CrisisReady CAD v2.4</span>
          <span className="font-data-tabular">911 Central</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Slide-over Drawer with Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={onClose}
          />
          <div className="relative z-10 animate-in slide-in-from-left duration-200">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
};
