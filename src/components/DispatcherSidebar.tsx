import React from 'react';
import { DispatcherProfile } from '../types';

export type DispatcherTab = 'live_cad' | 'history' | 'profile' | 'fleet' | 'stations';

interface DispatcherSidebarProps {
  activeTab: DispatcherTab;
  onTabChange: (tab: DispatcherTab) => void;
  profile: DispatcherProfile;
  activeIncidentsCount: number;
  criticalCount: number;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const DispatcherSidebar: React.FC<DispatcherSidebarProps> = ({
  activeTab,
  onTabChange,
  profile,
  activeIncidentsCount,
  criticalCount,
  isCollapsed,
  onToggleCollapse
}) => {
  const getStatusBadge = () => {
    switch (profile.status) {
      case 'on_duty':
        return { label: 'On Duty', color: 'bg-emerald-500', text: 'text-emerald-400' };
      case 'on_call':
        return { label: 'On Call', color: 'bg-amber-500', text: 'text-amber-400' };
      case 'break':
        return { label: 'On Break', color: 'bg-slate-400', text: 'text-slate-300' };
      default:
        return { label: 'Training', color: 'bg-indigo-400', text: 'text-indigo-300' };
    }
  };

  const statusBadge = getStatusBadge();

  return (
    <aside
      id="dispatcher-sidebar"
      className={`bg-[#1c1d22] text-white flex flex-col shrink-0 border-r border-[#2d2f39] transition-all duration-200 z-20 select-none ${
        isCollapsed ? 'w-16' : 'w-56 md:w-60'
      }`}
    >
      {/* Top Header with Profile Card & Collapse Button */}
      <div className="p-2.5 border-b border-[#2d2f39] flex items-center justify-between gap-1">
        {!isCollapsed ? (
          <>
            <button
              onClick={() => onTabChange('profile')}
              className={`flex-1 text-left p-1.5 rounded-xl transition-colors cursor-pointer flex items-center gap-2.5 min-w-0 ${
                activeTab === 'profile'
                  ? 'bg-[#2f3240] ring-1 ring-[#e4beba]/30'
                  : 'hover:bg-[#252834]'
              }`}
              title="View Dispatcher Profile"
            >
              <div className="relative shrink-0">
                <img
                  src={profile.avatarUrl}
                  alt={profile.name}
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-full object-cover border border-[#4a4e61]"
                />
                <span
                  className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#1c1d22] ${statusBadge.color}`}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="font-bold text-xs text-white truncate">{profile.name}</span>
                  <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-[#af101a]/30 text-[#ffb4ab] border border-[#af101a]/40 shrink-0">
                    {profile.badgeNumber}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.color} animate-pulse`} />
                  <span className="text-[10px] text-[#9ca3af] truncate">{profile.consoleNumber}</span>
                </div>
              </div>
            </button>

            <button
              onClick={onToggleCollapse}
              className="p-1.5 text-[#83899f] hover:text-white hover:bg-[#252834] rounded-lg transition-colors cursor-pointer shrink-0"
              title="Collapse Sidebar"
              aria-label="Collapse Sidebar"
            >
              <span className="material-symbols-outlined text-lg">chevron_left</span>
            </button>
          </>
        ) : (
          <div className="w-full flex flex-col items-center gap-2 py-1">
            <button
              onClick={() => onTabChange('profile')}
              className="relative cursor-pointer group"
              title={`${profile.name} (${profile.badgeNumber}) - View Profile`}
            >
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-full object-cover border border-[#4a4e61] group-hover:border-white transition-colors"
              />
              <span
                className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#1c1d22] ${statusBadge.color}`}
              />
            </button>

            <button
              onClick={onToggleCollapse}
              className="p-1 text-[#83899f] hover:text-white hover:bg-[#252834] rounded-md transition-colors cursor-pointer"
              title="Expand Sidebar"
              aria-label="Expand Sidebar"
            >
              <span className="material-symbols-outlined text-base">chevron_right</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Navigation Menu */}
      <div className="flex-1 p-2 space-y-1 overflow-y-auto no-scrollbar">
        {!isCollapsed && (
          <div className="px-2 py-1 text-[10px] font-bold text-[#83899f] uppercase tracking-wider">
            CAD Console
          </div>
        )}

        {/* 1. Live CAD Queue */}
        <button
          onClick={() => onTabChange('live_cad')}
          className={`w-full flex items-center ${
            isCollapsed ? 'justify-center px-0 py-2.5' : 'gap-2.5 px-2.5 py-2'
          } rounded-xl font-medium text-xs transition-all cursor-pointer relative group ${
            activeTab === 'live_cad'
              ? 'bg-[#af101a] text-white shadow-sm font-semibold'
              : 'text-[#c7cbd9] hover:bg-[#252834] hover:text-white'
          }`}
          title="Live CAD Incident Control"
        >
          <span className="material-symbols-outlined text-lg shrink-0">
            emergency
          </span>
          {!isCollapsed ? (
            <div className="flex-1 flex items-center justify-between text-left min-w-0">
              <span className="truncate">Live CAD</span>
              {criticalCount > 0 ? (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#ffdad6] text-[#93000a] shrink-0">
                  {criticalCount} Crit
                </span>
              ) : activeIncidentsCount > 0 ? (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white shrink-0">
                  {activeIncidentsCount}
                </span>
              ) : null}
            </div>
          ) : (
            criticalCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#ffdad6] ring-1 ring-[#93000a] animate-pulse" />
            )
          )}
        </button>

        {/* 2. Dispatch History */}
        <button
          onClick={() => onTabChange('history')}
          className={`w-full flex items-center ${
            isCollapsed ? 'justify-center px-0 py-2.5' : 'gap-2.5 px-2.5 py-2'
          } rounded-xl font-medium text-xs transition-all cursor-pointer relative group ${
            activeTab === 'history'
              ? 'bg-[#af101a] text-white shadow-sm font-semibold'
              : 'text-[#c7cbd9] hover:bg-[#252834] hover:text-white'
          }`}
          title="Call & Dispatch History"
        >
          <span className="material-symbols-outlined text-lg shrink-0">
            history
          </span>
          {!isCollapsed && (
            <div className="flex-1 flex items-center justify-between text-left min-w-0">
              <span className="truncate">Call Logs</span>
              <span className="text-[10px] text-[#9ca3af] font-mono">Archive</span>
            </div>
          )}
        </button>

        {/* 3. Dispatcher Profile */}
        <button
          onClick={() => onTabChange('profile')}
          className={`w-full flex items-center ${
            isCollapsed ? 'justify-center px-0 py-2.5' : 'gap-2.5 px-2.5 py-2'
          } rounded-xl font-medium text-xs transition-all cursor-pointer relative group ${
            activeTab === 'profile'
              ? 'bg-[#af101a] text-white shadow-sm font-semibold'
              : 'text-[#c7cbd9] hover:bg-[#252834] hover:text-white'
          }`}
          title="Operator Profile & Shift Details"
        >
          <span className="material-symbols-outlined text-lg shrink-0">
            badge
          </span>
          {!isCollapsed && (
            <span className="flex-1 text-left truncate">Operator Profile</span>
          )}
        </button>

        {/* 4. Active Fleet */}
        <button
          onClick={() => onTabChange('fleet')}
          className={`w-full flex items-center ${
            isCollapsed ? 'justify-center px-0 py-2.5' : 'gap-2.5 px-2.5 py-2'
          } rounded-xl font-medium text-xs transition-all cursor-pointer relative group ${
            activeTab === 'fleet'
              ? 'bg-[#af101a] text-white shadow-sm font-semibold'
              : 'text-[#c7cbd9] hover:bg-[#252834] hover:text-white'
          }`}
          title="Field Responders & Fleet Status"
        >
          <span className="material-symbols-outlined text-lg shrink-0">
            local_shipping
          </span>
          {!isCollapsed && (
            <span className="flex-1 text-left truncate">Units Fleet</span>
          )}
        </button>

        {/* 5. Station Hotlines */}
        <button
          onClick={() => onTabChange('stations')}
          className={`w-full flex items-center ${
            isCollapsed ? 'justify-center px-0 py-2.5' : 'gap-2.5 px-2.5 py-2'
          } rounded-xl font-medium text-xs transition-all cursor-pointer relative group ${
            activeTab === 'stations'
              ? 'bg-[#af101a] text-white shadow-sm font-semibold'
              : 'text-[#c7cbd9] hover:bg-[#252834] hover:text-white'
          }`}
          title="Station Intercom & Direct Speed Dial"
        >
          <span className="material-symbols-outlined text-lg shrink-0">
            apartment
          </span>
          {!isCollapsed && (
            <span className="flex-1 text-left truncate">Station Hotlines</span>
          )}
        </button>
      </div>

      {/* Footer Shift Telemetry */}
      <div className="p-2 border-t border-[#2d2f39] bg-[#16171b]">
        {!isCollapsed ? (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[10px] text-[#9ca3af]">
              <span>Shift: <strong className="text-white font-mono">{profile.shiftStartTime}</strong></span>
              <span className="text-emerald-400 font-bold font-mono">SLA {profile.stats.slaCompliance}</span>
            </div>
            <div className="bg-[#242630] px-2 py-1.5 rounded-lg border border-[#373a4a] flex items-center justify-between">
              <div className="text-[10px]">
                <span className="text-[#9ca3af] block text-[9px]">Today's Triage</span>
                <span className="text-white font-bold font-mono text-[11px]">{profile.stats.callsAnsweredToday} Calls ({profile.stats.avgTriageTime})</span>
              </div>
              <span className="material-symbols-outlined text-emerald-400 text-sm">
                verified
              </span>
            </div>
            <button
              onClick={onToggleCollapse}
              className="w-full flex items-center justify-center gap-1 text-[10px] text-[#83899f] hover:text-white py-1 cursor-pointer transition-colors"
            >
              <span className="material-symbols-outlined text-xs">chevron_left</span>
              <span>Collapse Sidebar</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1.5 py-1">
            <span
              title={`SLA ${profile.stats.slaCompliance} • ${profile.stats.callsAnsweredToday} Calls`}
              className="w-2 h-2 rounded-full bg-emerald-400"
            />
            <button
              onClick={onToggleCollapse}
              className="text-[#83899f] hover:text-white p-1 cursor-pointer transition-colors"
              title="Expand Sidebar"
            >
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};

