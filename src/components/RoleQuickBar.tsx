import React from 'react';
import { ScreenView, UserRole } from '../types';

interface RoleQuickBarProps {
  currentScreen: ScreenView;
  onNavigate: (screen: ScreenView) => void;
  userRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  isOffline: boolean;
  onToggleOffline: () => void;
}

export const RoleQuickBar: React.FC<RoleQuickBarProps> = ({
  currentScreen,
  onNavigate,
  userRole,
  onRoleChange,
  isOffline,
  onToggleOffline
}) => {
  const normalizedRole = userRole === 'citizen' ? 'user' : userRole;

  return (
    <div className="bg-[#f0eded] border-b border-[#e4beba] px-3 py-1.5 flex items-center justify-between text-xs text-[#5b403d] overflow-x-auto no-scrollbar gap-2 z-40 select-none">
      <div className="flex items-center gap-3 shrink-0">
        {/* Role Cluster: User / Citizen */}
        <div className="flex items-center gap-1 bg-white/70 px-2 py-0.5 rounded-lg border border-[#e4beba]">
          <span className="text-[10px] font-bold text-[#0284c7] uppercase">User:</span>
          <button
            onClick={() => {
              onRoleChange('user');
              onNavigate('home');
            }}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all cursor-pointer ${
              currentScreen === 'home' && normalizedRole === 'user'
                ? 'bg-[#af101a] text-white'
                : 'hover:bg-[#eae7e7] text-[#1b1c1c]'
            }`}
          >
            SOS Home
          </button>
          <button
            onClick={() => {
              onRoleChange('user');
              onNavigate('report_new');
            }}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all cursor-pointer ${
              currentScreen === 'report_new'
                ? 'bg-[#af101a] text-white'
                : 'hover:bg-[#eae7e7] text-[#1b1c1c]'
            }`}
          >
            New Report
          </button>
          <button
            onClick={() => {
              onRoleChange('user');
              onNavigate('user_status');
            }}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all cursor-pointer ${
              currentScreen === 'user_status'
                ? 'bg-[#af101a] text-white'
                : 'hover:bg-[#eae7e7] text-[#1b1c1c]'
            }`}
          >
            My SOS
          </button>
          <button
            onClick={() => {
              onRoleChange('user');
              onNavigate('sms_fallback');
            }}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all cursor-pointer ${
              currentScreen === 'sms_fallback'
                ? 'bg-[#af101a] text-white'
                : 'hover:bg-[#eae7e7] text-[#1b1c1c]'
            }`}
          >
            SMS Fallback
          </button>
        </div>

        {/* Role Cluster: Dispatcher */}
        <div className="flex items-center gap-1 bg-white/70 px-2 py-0.5 rounded-lg border border-[#e4beba]">
          <span className="text-[10px] font-bold text-[#0058a2] uppercase">Dispatcher:</span>
          <button
            onClick={() => {
              onRoleChange('dispatcher');
              onNavigate('dispatcher_dashboard');
            }}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all cursor-pointer ${
              currentScreen === 'dispatcher_dashboard' && normalizedRole === 'dispatcher'
                ? 'bg-[#af101a] text-white'
                : 'hover:bg-[#eae7e7] text-[#1b1c1c]'
            }`}
          >
            CAD Queue
          </button>
          <button
            onClick={() => {
              onRoleChange('dispatcher');
              onNavigate('resource_map');
            }}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all cursor-pointer ${
              currentScreen === 'resource_map' && normalizedRole === 'dispatcher'
                ? 'bg-[#af101a] text-white'
                : 'hover:bg-[#eae7e7] text-[#1b1c1c]'
            }`}
          >
            Tactical Map
          </button>
          <button
            onClick={() => {
              onRoleChange('dispatcher');
              onNavigate('responder_incident');
            }}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all cursor-pointer ${
              currentScreen === 'responder_incident'
                ? 'bg-[#af101a] text-white'
                : 'hover:bg-[#eae7e7] text-[#1b1c1c]'
            }`}
          >
            Responders
          </button>
        </div>

        {/* Role Cluster: Stations */}
        <div className="flex items-center gap-1 bg-white/70 px-2 py-0.5 rounded-lg border border-[#e4beba]">
          <span className="text-[10px] font-bold text-[#ba1a1a] uppercase">Stations:</span>
          <button
            onClick={() => {
              onRoleChange('station');
              onNavigate('station_portal');
            }}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all cursor-pointer ${
              currentScreen === 'station_portal'
                ? 'bg-[#af101a] text-white'
                : 'hover:bg-[#eae7e7] text-[#1b1c1c]'
            }`}
          >
            Station Watch Desk
          </button>
        </div>

        {/* Role Cluster: Admin */}
        <div className="flex items-center gap-1 bg-white/70 px-2 py-0.5 rounded-lg border border-[#e4beba]">
          <span className="text-[10px] font-bold text-[#4a154b] uppercase">Admin:</span>
          <button
            onClick={() => {
              onRoleChange('admin');
              onNavigate('admin_dashboard');
            }}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all cursor-pointer ${
              currentScreen === 'admin_dashboard' && normalizedRole === 'admin'
                ? 'bg-[#af101a] text-white'
                : 'hover:bg-[#eae7e7] text-[#1b1c1c]'
            }`}
          >
            Admin Hub
          </button>
          <button
            onClick={() => {
              onRoleChange('admin');
              onNavigate('personnel');
            }}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all cursor-pointer ${
              currentScreen === 'personnel'
                ? 'bg-[#af101a] text-white'
                : 'hover:bg-[#eae7e7] text-[#1b1c1c]'
            }`}
          >
            Personnel
          </button>
          <button
            onClick={() => {
              onRoleChange('admin');
              onNavigate('analytics');
            }}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all cursor-pointer ${
              currentScreen === 'analytics'
                ? 'bg-[#af101a] text-white'
                : 'hover:bg-[#eae7e7] text-[#1b1c1c]'
            }`}
          >
            Analytics
          </button>
        </div>
      </div>

      {/* Offline Simulator Switch */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onToggleOffline}
          className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
            isOffline
              ? 'bg-[#ffdad6] border-[#ba1a1a] text-[#93000a] animate-pulse'
              : 'bg-[#fcf9f8] border-[#e4beba] text-[#5b403d] hover:bg-[#eae7e7]'
          }`}
          title="Toggle network disconnect simulation to test offline SMS fallback"
        >
          <span
            className="material-symbols-outlined text-[14px]"
            style={{ fontVariationSettings: isOffline ? "'FILL' 1" : "'FILL' 0" }}
          >
            {isOffline ? 'wifi_off' : 'wifi'}
          </span>
          {isOffline ? 'Offline Mode Active' : 'Simulate Offline'}
        </button>
      </div>
    </div>
  );
};
