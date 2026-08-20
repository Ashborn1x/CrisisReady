import React from 'react';
import { ScreenView, UserRole } from '../types';
import { CrisisReadyLogo } from './CrisisReadyLogo';

export interface TopAppBarProps {
  currentScreen?: ScreenView;
  onNavigate?: (screen: ScreenView) => void;
  userRole?: UserRole;
  onRoleChange?: (role: UserRole) => void;
  isOffline?: boolean;
  totalIncidents?: number;
  activeCount?: number;
  criticalCount?: number;
  onBack?: () => void;
  customTitle?: string;
  title?: string;
  showBack?: boolean;
  onToggleDrawer?: () => void;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({
  currentScreen = 'home',
  onNavigate,
  userRole,
  onRoleChange,
  isOffline = false,
  totalIncidents = 0,
  activeCount = 0,
  criticalCount = 0,
  onBack,
  customTitle,
  title,
  showBack,
  onToggleDrawer
}) => {
  const displayTitle = customTitle || title;

  const handleNav = (screen: ScreenView) => {
    if (typeof onNavigate === 'function') {
      onNavigate(screen);
    }
  };

  const handleBack = () => {
    if (typeof onBack === 'function') {
      onBack();
    } else {
      handleNav('home');
    }
  };

  return (
    <header className="w-full shrink-0 z-30 flex justify-between items-center px-4 md:px-8 h-16 bg-[#fcf9f8] border-b border-[#e4beba] transition-colors duration-200 ease-in-out shadow-xs select-none">
      <div className="flex items-center gap-3">
        {onToggleDrawer && (
          <button
            onClick={onToggleDrawer}
            aria-label="Toggle navigation"
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#eae7e7] transition-colors text-[#af101a] cursor-pointer"
          >
            <span className="material-symbols-outlined text-2xl">menu</span>
          </button>
        )}

        {showBack ? (
          <div className="flex items-center gap-2">
            <button
              onClick={handleBack}
              aria-label="Go back"
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#eae7e7] transition-colors duration-150 text-[#af101a] active:scale-95 cursor-pointer"
            >
              <span className="material-symbols-outlined font-bold text-2xl">arrow_back</span>
            </button>
            <h1 className="text-lg md:text-xl font-bold text-[#af101a] tracking-tight truncate max-w-[200px] sm:max-w-md">
              {displayTitle}
            </h1>
          </div>
        ) : (
          <CrisisReadyLogo
            size="md"
            onClick={() => handleNav('home')}
            className="cursor-pointer"
          />
        )}
      </div>

      {/* Stats Summary Header (Visible on Tablet/Desktop for Dispatcher & Command) */}
      <div className="hidden xl:flex items-center gap-5 bg-[#f6f3f2] px-4 py-1.5 rounded-full border border-[#e4beba]">
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-[#5b403d] font-medium font-data-tabular">System Health:</span>
          <span className={`flex items-center gap-1 font-semibold ${isOffline ? 'text-[#ba1a1a]' : 'text-[#0770cc]'}`}>
            <span className="material-symbols-outlined text-[16px] icon-filled">
              {isOffline ? 'cloud_off' : 'check_circle'}
            </span>
            {isOffline ? 'Offline (Fallback Mode)' : 'Optimal'}
          </span>
        </div>

        <div className="w-px h-3.5 bg-[#e4beba]"></div>
        <div className="flex items-center gap-1.5 text-xs font-data-tabular">
          <span className="text-[#5b403d]">Total:</span>
          <span className="font-bold text-[#1b1c1c]">{totalIncidents}</span>
        </div>

        <div className="w-px h-3.5 bg-[#e4beba]"></div>
        <div className="flex items-center gap-1.5 text-xs font-data-tabular">
          <span className="text-[#5b403d]">Active:</span>
          <span className="font-bold text-[#6f5100]">{activeCount}</span>
        </div>

        <div className="w-px h-3.5 bg-[#e4beba]"></div>
        <div className="flex items-center gap-1.5 text-xs font-data-tabular">
          <span className="text-[#5b403d]">Critical:</span>
          <span className="font-bold text-[#ba1a1a] flex items-center gap-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a] animate-ping"></span>
            {criticalCount}
          </span>
        </div>
      </div>

      {/* Primary Experience Mode Switcher */}
      <div className="flex items-center gap-2">
        <div className="bg-[#f0eded] p-1 rounded-xl border border-[#e4beba] flex items-center gap-1 text-xs">
          <button
            onClick={() => {
              if (onRoleChange) onRoleChange('user');
              handleNav('home');
            }}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              userRole === 'user' || userRole === 'citizen'
                ? 'bg-[#af101a] text-white shadow-xs'
                : 'text-[#5b403d] hover:bg-[#eae7e7]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">smartphone</span>
            <span className="font-bold">Citizen Mobile App</span>
          </button>

          <button
            onClick={() => {
              if (onRoleChange) onRoleChange('dispatcher');
              handleNav('dispatcher_dashboard');
            }}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              userRole === 'dispatcher'
                ? 'bg-[#af101a] text-white shadow-xs'
                : 'text-[#5b403d] hover:bg-[#eae7e7]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">desktop_windows</span>
            <span className="font-bold">Dispatcher CAD</span>
          </button>
        </div>

        {/* Connection status indicator (shown only on Citizen Mobile App; removed for Dispatcher) */}
        {(userRole === 'user' || userRole === 'citizen') && (
          <div
            title={isOffline ? 'Connection: Offline' : 'Cellular Connection: 4 Bars LTE'}
            className={`flex items-center justify-center w-9 h-9 rounded-full transition-colors ${
              isOffline ? 'text-[#ba1a1a] bg-[#ffdad6]' : 'text-[#0284c7] bg-[#e0f2fe]'
            }`}
          >
            <span className="material-symbols-outlined text-xl">
              {isOffline ? 'signal_cellular_connected_no_internet_4_bar' : 'signal_cellular_4_bar'}
            </span>
          </div>
        )}
      </div>

    </header>
  );
};

