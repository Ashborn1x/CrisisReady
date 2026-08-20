import React, { useState } from 'react';
import { Incident, ResponderUnit, ScreenView, EmergencyStation, DispatcherProfile, DispatchHistoryItem } from '../types';
import { MAP_TEXTURE_URL_CHICAGO, EMERGENCY_STATIONS, DEFAULT_DISPATCHER_PROFILE, DISPATCHER_CALL_HISTORY } from '../data/mockData';
import { StationContactModal } from '../components/StationContactModal';
import { DispatcherSidebar, DispatcherTab } from '../components/DispatcherSidebar';
import { DispatcherProfileView } from '../components/DispatcherProfileView';
import { DispatcherHistoryView } from '../components/DispatcherHistoryView';

interface DispatcherDashboardScreenProps {
  incidents: Incident[];
  selectedIncident: Incident | null;
  onSelectIncident: (incident: Incident) => void;
  onUpdateStatus: (incidentId: string, status: Incident['status']) => void;
  onDispatchUnit: (incidentId: string, unitId: string, unitName: string) => void;
  onAddCommsMessage: (incidentId: string, text: string) => void;
  responderUnits: ResponderUnit[];
  onNavigate: (screen: ScreenView) => void;
}

type MapLayerMode = 'tactical_dark' | 'light_street' | 'satellite';
type MobileCadTab = 'queue' | 'map' | 'action';

export const DispatcherDashboardScreen: React.FC<DispatcherDashboardScreenProps> = ({
  incidents,
  selectedIncident,
  onSelectIncident,
  onUpdateStatus,
  onDispatchUnit,
  onAddCommsMessage,
  responderUnits,
  onNavigate
}) => {
  // Navigation & View Tab state
  const [activeTab, setActiveTab] = useState<DispatcherTab>('live_cad');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  // Panel sizing & collapse state for maximizing map space
  const [isQueueCollapsed, setIsQueueCollapsed] = useState<boolean>(false);
  const [isDetailsCollapsed, setIsDetailsCollapsed] = useState<boolean>(false);
  const [isMapFullscreen, setIsMapFullscreen] = useState<boolean>(false);
  const [mobileCadTab, setMobileCadTab] = useState<MobileCadTab>('map');
  const [mapLayer, setMapLayer] = useState<MapLayerMode>('tactical_dark');

  // Dispatcher Profile & History state
  const [profile, setProfile] = useState<DispatcherProfile>(DEFAULT_DISPATCHER_PROFILE);
  const [historyLogs, setHistoryLogs] = useState<DispatchHistoryItem[]>(DISPATCHER_CALL_HISTORY);

  // CAD Filters & inputs
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedUnitToDispatch, setSelectedUnitToDispatch] = useState<string>('');
  const [commsInput, setCommsInput] = useState<string>('');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [filterUrgency, setFilterUrgency] = useState<string>('all');
  const [mapCenterOffset, setMapCenterOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Station contact modal state
  const [isStationModalOpen, setIsStationModalOpen] = useState<boolean>(false);
  const [targetStationId, setTargetStationId] = useState<string | null>(null);

  const currentIncident = selectedIncident || incidents[0] || null;

  // Find best matching station for current incident
  const getRecommendedStation = (): EmergencyStation => {
    if (!currentIncident) return EMERGENCY_STATIONS[0];
    if (currentIncident.type === 'fire') {
      return EMERGENCY_STATIONS.find((s) => s.id === 'stn-fire-42') || EMERGENCY_STATIONS[0];
    }
    if (currentIncident.type === 'medical') {
      return EMERGENCY_STATIONS.find((s) => s.id === 'stn-hospital-mgh') || EMERGENCY_STATIONS[2];
    }
    if (currentIncident.type === 'accident' || currentIncident.type === 'police') {
      return EMERGENCY_STATIONS.find((s) => s.id === 'stn-police-01') || EMERGENCY_STATIONS[1];
    }
    return EMERGENCY_STATIONS[0];
  };

  const recommendedStation = getRecommendedStation();

  // Filtered incidents
  const filteredIncidents = incidents.filter((inc) => {
    const matchesSearch =
      inc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.locationName.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (filterUrgency === 'all') return true;
    if (filterUrgency === 'critical') return inc.urgency === 'critical';
    if (filterUrgency === 'high') return inc.urgency === 'high';
    if (filterUrgency === 'routine') return inc.urgency === 'low' || inc.urgency === 'medium';
    return true;
  });

  const handleDispatch = () => {
    if (!currentIncident || !selectedUnitToDispatch) return;
    const unit = responderUnits.find((u) => u.id === selectedUnitToDispatch);
    if (unit) {
      onDispatchUnit(currentIncident.id, unit.id, `${unit.name} (ETA: ${unit.eta})`);
      setProfile((prev) => ({
        ...prev,
        stats: {
          ...prev.stats,
          totalDispatches: prev.stats.totalDispatches + 1
        }
      }));
    }
  };

  const handleSendComms = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentIncident || !commsInput.trim()) return;
    onAddCommsMessage(currentIncident.id, commsInput.trim());
    setCommsInput('');
  };

  const handleOpenStationModal = (stationId?: string) => {
    setTargetStationId(stationId || null);
    setIsStationModalOpen(true);
  };

  const handleUpdateProfile = (updated: Partial<DispatcherProfile>) => {
    setProfile((prev) => ({ ...prev, ...updated }));
  };

  const recenterOnIncident = () => {
    setZoomLevel(1.2);
    setMapCenterOffset({ x: 0, y: 0 });
  };

  const criticalCount = incidents.filter((i) => i.urgency === 'critical' && i.status !== 'resolved').length;

  return (
    <div className="flex-1 flex h-full overflow-hidden bg-white select-none relative">
      {/* Station Contact Modal */}
      <StationContactModal
        isOpen={isStationModalOpen}
        onClose={() => setIsStationModalOpen(false)}
        currentIncident={currentIncident}
        onAddIncidentComms={onAddCommsMessage}
        initialStationId={targetStationId}
      />

      {/* DISPATCHER LEFT SIDEBAR (Collapsible) */}
      <DispatcherSidebar
        activeTab={activeTab}
        onTabChange={(tab) => {
          if (tab === 'stations') {
            handleOpenStationModal();
          } else {
            setActiveTab(tab);
          }
        }}
        profile={profile}
        activeIncidentsCount={incidents.filter((i) => i.status !== 'resolved').length}
        criticalCount={criticalCount}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((v) => !v)}
      />

      {/* MAIN WORKSPACE ROUTING ACCORDING TO ACTIVE TAB */}

      {/* 1. DISPATCHER PROFILE VIEW */}
      {activeTab === 'profile' && (
        <DispatcherProfileView
          profile={profile}
          onUpdateProfile={handleUpdateProfile}
          onBackToCAD={() => setActiveTab('live_cad')}
        />
      )}

      {/* 2. DISPATCHER HISTORY VIEW */}
      {activeTab === 'history' && (
        <DispatcherHistoryView
          historyLogs={historyLogs}
          onBackToCAD={() => setActiveTab('live_cad')}
        />
      )}

      {/* 3. ACTIVE FLEET VIEW */}
      {activeTab === 'fleet' && (
        <div className="flex-1 flex flex-col h-full bg-[#f6f3f2] overflow-y-auto p-4 md:p-6 lg:p-8 space-y-6">
          <div className="max-w-5xl mx-auto w-full space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveTab('live_cad')}
                  className="p-2 rounded-xl bg-white border border-[#e4beba] text-[#5b403d] hover:bg-[#f0eded] transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold"
                >
                  <span className="material-symbols-outlined text-base">arrow_back</span>
                  <span>Back to Live CAD</span>
                </button>
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-[#1b1c1c]">Field Responder Units Fleet</h1>
                  <p className="text-xs text-[#5b403d]">Live apparatus status, battery telemetry & sector deployment</p>
                </div>
              </div>

              <span className="text-xs font-bold px-3 py-1.5 bg-white border border-[#e4beba] rounded-xl text-[#1b1c1c] shadow-xs">
                {responderUnits.length} Registered Units
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {responderUnits.map((unit) => {
                const isEnRoute = unit.status === 'en_route';
                const isAvailable = unit.status === 'available';

                return (
                  <div
                    key={unit.id}
                    className="bg-white rounded-2xl border border-[#e4beba] p-5 shadow-xs space-y-4 hover:border-[#af101a]/40 transition-all"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-[#f0eded]">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${
                            unit.type === 'engine'
                              ? 'bg-[#ba1a1a]'
                              : unit.type === 'patrol'
                              ? 'bg-[#0058a2]'
                              : 'bg-[#0284c7]'
                          }`}
                        >
                          <span className="material-symbols-outlined text-xl">
                            {unit.type === 'engine'
                              ? 'local_fire_department'
                              : unit.type === 'patrol'
                              ? 'local_police'
                              : 'medical_services'}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-[#1b1c1c]">{unit.name}</h3>
                          <span className="text-xs font-mono text-[#5b403d]">{unit.callsign}</span>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                          isEnRoute
                            ? 'bg-[#ffebd8] text-[#8c3b00] border border-[#ffd0b0]'
                            : isAvailable
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {unit.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between text-[#5b403d]">
                        <span>Assigned Sector</span>
                        <span className="font-bold text-[#1b1c1c]">{unit.sector}</span>
                      </div>
                      <div className="flex justify-between text-[#5b403d]">
                        <span>Standard ETA</span>
                        <span className="font-bold font-mono text-[#0058a2]">{unit.eta}</span>
                      </div>
                      <div className="flex justify-between text-[#5b403d]">
                        <span>Battery & Telemetry</span>
                        <span className="font-mono font-bold text-emerald-600">{unit.battery}% Battery</span>
                      </div>
                      <div className="flex justify-between text-[#5b403d]">
                        <span>Direct Radio / Tel</span>
                        <span className="font-mono text-[#1b1c1c]">{unit.phone}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#f0eded] flex gap-2">
                      <button
                        onClick={() => {
                          if (currentIncident) {
                            onDispatchUnit(currentIncident.id, unit.id, `${unit.name} (ETA: ${unit.eta})`);
                            setActiveTab('live_cad');
                          }
                        }}
                        className="flex-1 py-2 bg-[#af101a] hover:bg-[#8f0d15] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                      >
                        Assign to Active Incident
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 4. LIVE CAD INCIDENT CONTROL (Default) */}
      {activeTab === 'live_cad' && (
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-white select-none relative">
          {/* Mobile Tab Bar for small viewports (< 768px) */}
          <div className="md:hidden flex items-center justify-between p-2 bg-[#1c1d22] text-white border-b border-[#2d2f39] text-xs">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setMobileCadTab('queue')}
                className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-colors ${
                  mobileCadTab === 'queue' ? 'bg-[#af101a] text-white' : 'text-[#c7cbd9] hover:bg-[#252834]'
                }`}
              >
                Queue ({filteredIncidents.length})
              </button>
              <button
                onClick={() => setMobileCadTab('map')}
                className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-colors ${
                  mobileCadTab === 'map' ? 'bg-[#af101a] text-white' : 'text-[#c7cbd9] hover:bg-[#252834]'
                }`}
              >
                Tactical Map
              </button>
              <button
                onClick={() => setMobileCadTab('action')}
                className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-colors ${
                  mobileCadTab === 'action' ? 'bg-[#af101a] text-white' : 'text-[#c7cbd9] hover:bg-[#252834]'
                }`}
              >
                Dispatch Action
              </button>
            </div>

            <button
              onClick={() => setIsSidebarCollapsed((v) => !v)}
              className="p-1.5 text-[#9ca3af] hover:text-white rounded"
              title="Toggle Sidebar"
            >
              <span className="material-symbols-outlined text-base">menu</span>
            </button>
          </div>

          {/* Desktop 3-Column / Flexible Workspace */}
          <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden relative">
            {/* LEFT PANEL: Incoming Reports Queue (Collapsible) */}
            <section
              className={`border-r border-[#e4beba] bg-white h-full z-10 shadow-[2px_0_8px_rgba(0,0,0,0.02)] shrink-0 transition-all duration-200 flex flex-col ${
                mobileCadTab !== 'queue' ? 'hidden md:flex' : 'flex'
              } ${
                isMapFullscreen || isQueueCollapsed ? 'md:w-11 md:overflow-hidden' : 'w-full md:w-64 lg:w-72'
              }`}
            >
              {isQueueCollapsed || isMapFullscreen ? (
                /* Collapsed Queue Strip */
                <div className="hidden md:flex flex-col items-center py-3 h-full bg-[#fcf9f8] justify-between">
                  <div className="flex flex-col items-center gap-3">
                    <button
                      onClick={() => {
                        setIsQueueCollapsed(false);
                        setIsMapFullscreen(false);
                      }}
                      className="p-1.5 bg-white border border-[#e4beba] text-[#5b403d] hover:text-[#af101a] rounded-lg shadow-xs cursor-pointer transition-colors"
                      title="Expand Incident Queue"
                    >
                      <span className="material-symbols-outlined text-base">chevron_right</span>
                    </button>

                    <div className="writing-vertical text-[11px] font-bold text-[#5b403d] uppercase tracking-wider py-2 select-none">
                      Active Queue ({filteredIncidents.length})
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-2">
                    {criticalCount > 0 && (
                      <span
                        title={`${criticalCount} Critical incidents`}
                        className="w-5 h-5 rounded-full bg-[#ba1a1a] text-white text-[10px] font-bold flex items-center justify-center animate-pulse"
                      >
                        {criticalCount}
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                /* Expanded Queue List */
                <>
                  <div className="p-3 border-b border-[#e4beba] bg-white sticky top-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <h2 className="font-bold text-sm text-[#1b1c1c]">Incoming Reports</h2>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 bg-[#f6f3f2] rounded-full text-[#5b403d]">
                          {filteredIncidents.length}
                        </span>
                      </div>

                      <button
                        onClick={() => setIsQueueCollapsed(true)}
                        className="hidden md:flex p-1 text-[#8f6f6c] hover:text-[#1b1c1c] hover:bg-[#f6f3f2] rounded-md transition-colors cursor-pointer"
                        title="Collapse Queue Panel (Gives more space to map)"
                      >
                        <span className="material-symbols-outlined text-base">chevron_left</span>
                      </button>
                    </div>

                    <div className="relative mb-2">
                      <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[#5b403d] text-base">
                        search
                      </span>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search ID or Keyword..."
                        className="w-full pl-8 pr-2.5 py-1 bg-[#f6f3f2] border border-[#e4beba] rounded-lg text-xs text-[#1b1c1c] placeholder:text-[#8f6f6c] focus:outline-none focus:ring-1 focus:ring-[#af101a]"
                      />
                    </div>

                    {/* Quick Filter chips */}
                    <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pt-0.5">
                      <button
                        onClick={() => setFilterUrgency('all')}
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold cursor-pointer ${
                          filterUrgency === 'all'
                            ? 'bg-[#1b1c1c] text-white'
                            : 'bg-[#f0eded] text-[#5b403d] hover:bg-[#eae7e7]'
                        }`}
                      >
                        All
                      </button>
                      <button
                        onClick={() => setFilterUrgency('critical')}
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold cursor-pointer ${
                          filterUrgency === 'critical'
                            ? 'bg-[#ba1a1a] text-white'
                            : 'bg-[#ffdad6] text-[#93000a] hover:bg-[#ffb3ac]'
                        }`}
                      >
                        Critical
                      </button>
                      <button
                        onClick={() => setFilterUrgency('high')}
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold cursor-pointer ${
                          filterUrgency === 'high'
                            ? 'bg-[#795900] text-white'
                            : 'bg-[#ffdfa0] text-[#261a00] hover:bg-[#f8bd2a]'
                        }`}
                      >
                        High
                      </button>
                      <button
                        onClick={() => setFilterUrgency('routine')}
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold cursor-pointer ${
                          filterUrgency === 'routine'
                            ? 'bg-[#0058a2] text-white'
                            : 'bg-[#d4e3ff] text-[#001c3a] hover:bg-[#a5c8ff]'
                        }`}
                      >
                        Routine
                      </button>
                    </div>
                  </div>

                  {/* Scrollable list of incoming reports */}
                  <div className="flex-1 overflow-y-auto no-scrollbar p-2 flex flex-col gap-2">
                    {filteredIncidents.map((incident) => {
                      const isSelected = currentIncident?.id === incident.id;
                      const isCritical = incident.urgency === 'critical';
                      const isHigh = incident.urgency === 'high';

                      return (
                        <div
                          key={incident.id}
                          onClick={() => {
                            onSelectIncident(incident);
                            if (window.innerWidth < 768) setMobileCadTab('map');
                          }}
                          className={`rounded-xl p-2.5 cursor-pointer transition-all duration-150 relative overflow-hidden group shadow-xs ${
                            isSelected
                              ? 'bg-[#af101a]/5 border-2 border-[#af101a] shadow-[0_2px_8px_rgba(175,16,26,0.12)]'
                              : 'bg-white border border-[#e4beba] hover:bg-[#f6f3f2]'
                          }`}
                        >
                          {/* Criticality Bar on left */}
                          <div
                            className={`absolute left-0 top-0 bottom-0 w-1 ${
                              isCritical
                                ? 'bg-[#ba1a1a]'
                                : isHigh
                                ? 'bg-[#fec330]'
                                : 'bg-[#0770cc]'
                            }`}
                          />

                          <div className="flex justify-between items-start mb-1 pl-1.5">
                            <div className="flex gap-1.5 items-center">
                              <span
                                className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider flex items-center gap-0.5 ${
                                  isCritical
                                    ? 'bg-[#ffdad6] text-[#93000a]'
                                    : isHigh
                                    ? 'bg-[#fec330] text-[#6f5100]'
                                    : 'bg-[#d4e3ff] text-[#001c3a]'
                                }`}
                              >
                                <span className="material-symbols-outlined text-[11px]">
                                  {isCritical ? 'warning' : isHigh ? 'priority_high' : 'info'}
                                </span>
                                {incident.urgency.toUpperCase()}
                              </span>
                              <span className="font-data-tabular text-[11px] font-semibold text-[#5b403d]">
                                {incident.code}
                              </span>
                            </div>
                            <span className="font-data-tabular text-[10px] text-[#5b403d]">
                              {incident.timeAgo}
                            </span>
                          </div>

                          <h3 className="font-bold text-xs text-[#1b1c1c] pl-1.5 mb-1 truncate text-left">
                            {incident.title}
                          </h3>

                          <div className="flex items-center gap-1 pl-1.5 text-[#5b403d] text-[11px] font-data-tabular">
                            <span className="material-symbols-outlined text-[13px] shrink-0 text-[#795900]">
                              location_on
                            </span>
                            <span className="truncate">{incident.locationName}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </section>

            {/* CENTER PANEL: Expanded Tactical Map Canvas */}
            <section
              className={`flex-1 relative bg-[#111317] h-full z-0 overflow-hidden flex flex-col ${
                mobileCadTab !== 'map' ? 'hidden md:flex' : 'flex'
              }`}
            >
              {/* TOP GIS TOOLBAR & MAP CONTROLS */}
              <div className="absolute top-2.5 left-2.5 right-2.5 z-30 flex items-center justify-between gap-2 pointer-events-auto">
                {/* Left side: Station Hotlines Pill Bar */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                  <button
                    onClick={() => handleOpenStationModal()}
                    className="bg-[#af101a] text-white px-2.5 py-1.5 rounded-xl text-xs font-bold shadow-md hover:bg-[#930010] transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95"
                    title="Open Full Station Intercom Hub"
                  >
                    <span className="material-symbols-outlined text-sm">cell_tower</span>
                    <span className="hidden sm:inline">Station Hotlines</span>
                    <span className="sm:hidden">Stations</span>
                  </button>

                  <button
                    onClick={() => handleOpenStationModal('stn-fire-42')}
                    className="bg-[#1c1d22]/90 backdrop-blur-md border border-[#3a3d4a] text-[#ffb4ab] px-2 py-1 rounded-xl text-[11px] font-bold shadow-sm hover:bg-[#2f3240] transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a] animate-pulse" />
                    <span>Fire 42</span>
                  </button>

                  <button
                    onClick={() => handleOpenStationModal('stn-police-01')}
                    className="bg-[#1c1d22]/90 backdrop-blur-md border border-[#3a3d4a] text-[#93c5fd] px-2 py-1 rounded-xl text-[11px] font-bold shadow-sm hover:bg-[#2f3240] transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6]" />
                    <span>Police HQ</span>
                  </button>

                  <button
                    onClick={() => handleOpenStationModal('stn-hospital-mgh')}
                    className="bg-[#1c1d22]/90 backdrop-blur-md border border-[#3a3d4a] text-[#7dd3fc] px-2 py-1 rounded-xl text-[11px] font-bold shadow-sm hover:bg-[#2f3240] transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0284c7]" />
                    <span>Metro Gen</span>
                  </button>
                </div>

                {/* Right side: Map Sizing & Focus Mode Controls */}
                <div className="flex items-center gap-1.5 bg-[#1c1d22]/90 backdrop-blur-md border border-[#3a3d4a] p-1 rounded-xl shadow-lg shrink-0">
                  {/* Layer switcher */}
                  <button
                    onClick={() =>
                      setMapLayer((prev) =>
                        prev === 'tactical_dark'
                          ? 'light_street'
                          : prev === 'light_street'
                          ? 'satellite'
                          : 'tactical_dark'
                      )
                    }
                    className="px-2 py-1 rounded-lg text-[11px] font-bold text-[#c7cbd9] hover:text-white hover:bg-[#2f3240] transition-colors flex items-center gap-1 cursor-pointer"
                    title="Cycle Map Style (Tactical Dark, Street, Satellite)"
                  >
                    <span className="material-symbols-outlined text-sm">layers</span>
                    <span className="hidden lg:inline capitalize">{mapLayer.replace('_', ' ')}</span>
                  </button>

                  {/* Recenter on Active Incident */}
                  <button
                    onClick={recenterOnIncident}
                    className="p-1 text-[#c7cbd9] hover:text-white hover:bg-[#2f3240] rounded-lg transition-colors cursor-pointer"
                    title="Center on Selected Incident"
                  >
                    <span className="material-symbols-outlined text-base">my_location</span>
                  </button>

                  {/* Map Fullscreen / Maximize Toggle */}
                  <button
                    onClick={() => {
                      const next = !isMapFullscreen;
                      setIsMapFullscreen(next);
                      if (next) {
                        setIsQueueCollapsed(true);
                        setIsDetailsCollapsed(true);
                      } else {
                        setIsQueueCollapsed(false);
                        setIsDetailsCollapsed(false);
                      }
                    }}
                    className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                      isMapFullscreen
                        ? 'bg-[#af101a] text-white'
                        : 'text-[#c7cbd9] hover:text-white hover:bg-[#2f3240]'
                    }`}
                    title={isMapFullscreen ? 'Restore Normal CAD 3-Pane View' : 'Maximize Map Focus Mode (Collapses side panels)'}
                  >
                    <span className="material-symbols-outlined text-sm">
                      {isMapFullscreen ? 'close_fullscreen' : 'open_in_full'}
                    </span>
                    <span className="hidden sm:inline">
                      {isMapFullscreen ? 'Exit Focus' : 'Focus Map'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Map Background Layer with Multi-Layer Styling */}
              <div
                className="absolute inset-0 w-full h-full bg-cover bg-center transition-all duration-300"
                style={{
                  backgroundImage: `url(${MAP_TEXTURE_URL_CHICAGO})`,
                  transform: `scale(${zoomLevel}) translate(${mapCenterOffset.x}px, ${mapCenterOffset.y}px)`,
                  filter:
                    mapLayer === 'tactical_dark'
                      ? 'brightness(0.65) contrast(1.3) saturate(0.8) hue-rotate(190deg)'
                      : mapLayer === 'satellite'
                      ? 'brightness(0.85) contrast(1.1) saturate(1.2)'
                      : 'brightness(1.02) contrast(1.02)'
                }}
              >
                {/* Tactical Grid / Sonar Overlay */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    backgroundImage:
                      mapLayer === 'tactical_dark'
                        ? 'radial-gradient(circle at 2px 2px, rgba(56, 189, 248, 0.18) 1px, transparent 0)'
                        : 'radial-gradient(circle at 2px 2px, rgba(0,0,0,0.12) 1px, transparent 0)',
                    backgroundSize: '28px 28px'
                  }}
                />

                {/* Emergency Station Pins */}
                {EMERGENCY_STATIONS.map((station, sIdx) => {
                  let sTop = '20%';
                  let sLeft = '20%';
                  if (station.id === 'stn-fire-42') {
                    sTop = '52%';
                    sLeft = '35%';
                  } else if (station.id === 'stn-police-01') {
                    sTop = '40%';
                    sLeft = '68%';
                  } else if (station.id === 'stn-hospital-mgh') {
                    sTop = '68%';
                    sLeft = '75%';
                  } else {
                    sTop = `${25 + sIdx * 12}%`;
                    sLeft = `${18 + sIdx * 14}%`;
                  }

                  return (
                    <div
                      key={station.id}
                      onClick={() => handleOpenStationModal(station.id)}
                      className="absolute flex flex-col items-center cursor-pointer group -translate-x-1/2 -translate-y-1/2 transition-transform duration-150 hover:scale-115 z-25"
                      style={{ top: sTop, left: sLeft }}
                    >
                      <div className="bg-[#1b1c1c]/90 text-white px-2 py-0.5 rounded shadow-lg border border-slate-700 text-[9px] font-bold whitespace-nowrap opacity-90 group-hover:opacity-100 flex items-center gap-1 mb-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
                        {station.badgeCode}
                      </div>
                      <div
                        className={`w-7 h-7 md:w-8 md:h-8 rounded-xl flex items-center justify-center shadow-xl border-2 border-white text-white ${
                          station.type === 'police'
                            ? 'bg-[#0058a2]'
                            : station.type === 'fire'
                            ? 'bg-[#ba1a1a]'
                            : 'bg-[#0284c7]'
                        }`}
                      >
                        <span className="material-symbols-outlined text-sm md:text-base">
                          {station.type === 'police'
                            ? 'local_police'
                            : station.type === 'fire'
                            ? 'local_fire_department'
                            : 'local_hospital'}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {/* Live Incidents Interactive Pins */}
                {incidents.map((inc) => {
                  const isSelected = currentIncident?.id === inc.id;
                  let topPercent = '45%';
                  let leftPercent = '50%';

                  if (inc.id === 'inc-8903') {
                    topPercent = '48%';
                    leftPercent = '52%';
                  } else if (inc.id === 'inc-8902' || inc.type === 'accident') {
                    topPercent = '32%';
                    leftPercent = '28%';
                  } else if (inc.id === 'inc-8870') {
                    topPercent = '72%';
                    leftPercent = '38%';
                  } else {
                    topPercent = '58%';
                    leftPercent = '62%';
                  }

                  return (
                    <div
                      key={inc.id}
                      onClick={() => {
                        onSelectIncident(inc);
                        if (isDetailsCollapsed && !isMapFullscreen) {
                          setIsDetailsCollapsed(false);
                        }
                      }}
                      className="absolute flex flex-col items-center cursor-pointer group -translate-x-1/2 -translate-y-1/2 transition-transform duration-150 hover:scale-110 z-20"
                      style={{ top: topPercent, left: leftPercent }}
                    >
                      {/* Radar beacon ring for critical or active */}
                      {isSelected && (
                        <span className="absolute -inset-3 rounded-full bg-[#ba1a1a]/40 animate-ping pointer-events-none" />
                      )}

                      <div className="bg-white/95 backdrop-blur-xs px-2 py-0.5 rounded-md shadow-md border border-[#e4beba] mb-1 font-data-tabular text-[9px] md:text-[10px] font-bold text-[#1b1c1c] whitespace-nowrap opacity-90 group-hover:opacity-100 transition-opacity">
                        {inc.code}: {inc.locationName.split(',')[0]}
                      </div>

                      <div
                        className={`w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center shadow-lg border-2 border-white transition-all ${
                          isSelected
                            ? 'bg-[#d32f2f] text-white ring-4 ring-[#af101a]/40 scale-110'
                            : inc.urgency === 'critical'
                            ? 'bg-[#ba1a1a] text-white animate-pulse'
                            : inc.urgency === 'high'
                            ? 'bg-[#fec330] text-[#6f5100]'
                            : 'bg-[#0770cc] text-white'
                        }`}
                      >
                        <span className="material-symbols-outlined text-base md:text-lg">
                          {inc.type === 'fire'
                            ? 'local_fire_department'
                            : inc.type === 'medical'
                            ? 'medical_services'
                            : inc.type === 'accident'
                            ? 'car_crash'
                            : 'warning'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Floating Bottom HUD Overlay when Map is in Focus / Fullscreen Mode */}
              {isMapFullscreen && currentIncident && (
                <div className="absolute bottom-4 left-4 right-20 z-30 flex items-center justify-between bg-[#1c1d22]/95 backdrop-blur-md border border-[#3a3d4a] p-3 rounded-2xl shadow-2xl text-white max-w-xl animate-fade-in pointer-events-auto">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 ${
                        currentIncident.urgency === 'critical'
                          ? 'bg-[#ba1a1a]'
                          : currentIncident.urgency === 'high'
                          ? 'bg-[#d97706]'
                          : 'bg-[#0058a2]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-lg">
                        {currentIncident.type === 'fire'
                          ? 'local_fire_department'
                          : currentIncident.type === 'medical'
                          ? 'medical_services'
                          : 'emergency'}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-amber-400">
                          {currentIncident.code}
                        </span>
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-white/10 text-white">
                          {currentIncident.urgency}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-white truncate">{currentIncident.title}</h4>
                      <p className="text-[11px] text-[#9ca3af] truncate">{currentIncident.locationName}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        setIsMapFullscreen(false);
                        setIsDetailsCollapsed(false);
                      }}
                      className="px-3 py-1.5 bg-[#af101a] hover:bg-[#8f0d15] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-md"
                    >
                      <span>Dispatch Console</span>
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Floating Bottom-Right Zoom & View Controls */}
              <div className="absolute bottom-4 right-4 flex flex-col gap-1.5 z-30">
                <button
                  onClick={() => setZoomLevel((prev) => Math.min(prev + 0.2, 2.2))}
                  className="w-8 h-8 bg-white/95 backdrop-blur-xs border border-[#e4beba] rounded-lg flex items-center justify-center text-[#5b403d] hover:bg-[#f6f3f2] shadow-md cursor-pointer transition-transform active:scale-95"
                  title="Zoom In"
                >
                  <span className="material-symbols-outlined text-base">add</span>
                </button>
                <button
                  onClick={() => setZoomLevel((prev) => Math.max(prev - 0.2, 0.7))}
                  className="w-8 h-8 bg-white/95 backdrop-blur-xs border border-[#e4beba] rounded-lg flex items-center justify-center text-[#5b403d] hover:bg-[#f6f3f2] shadow-md cursor-pointer transition-transform active:scale-95"
                  title="Zoom Out"
                >
                  <span className="material-symbols-outlined text-base">remove</span>
                </button>
                <button
                  onClick={() => {
                    setZoomLevel(1);
                    setMapCenterOffset({ x: 0, y: 0 });
                  }}
                  className="w-8 h-8 bg-white/95 backdrop-blur-xs border border-[#e4beba] rounded-lg flex items-center justify-center text-[#5b403d] hover:bg-[#f6f3f2] shadow-md cursor-pointer transition-transform active:scale-95"
                  title="Reset Map View"
                >
                  <span className="material-symbols-outlined text-base">center_focus_strong</span>
                </button>
              </div>
            </section>

            {/* RIGHT PANEL: Incident Action & Dispatch Console (Collapsible) */}
            {currentIncident && (
              <section
                className={`border-l border-[#e4beba] bg-white h-full z-10 shadow-[-2px_0_8px_rgba(0,0,0,0.02)] shrink-0 transition-all duration-200 flex flex-col overflow-y-auto ${
                  mobileCadTab !== 'action' ? 'hidden md:flex' : 'flex'
                } ${
                  isMapFullscreen || isDetailsCollapsed ? 'md:w-11 md:overflow-hidden' : 'w-full md:w-72 lg:w-80'
                }`}
              >
                {isDetailsCollapsed || isMapFullscreen ? (
                  /* Collapsed Details Strip */
                  <div className="hidden md:flex flex-col items-center py-3 h-full bg-[#fcf9f8] justify-between">
                    <div className="flex flex-col items-center gap-3">
                      <button
                        onClick={() => {
                          setIsDetailsCollapsed(false);
                          setIsMapFullscreen(false);
                        }}
                        className="p-1.5 bg-white border border-[#e4beba] text-[#5b403d] hover:text-[#af101a] rounded-lg shadow-xs cursor-pointer transition-colors"
                        title="Expand Dispatch Action Panel"
                      >
                        <span className="material-symbols-outlined text-base">chevron_left</span>
                      </button>

                      <div className="writing-vertical text-[11px] font-bold text-[#5b403d] uppercase tracking-wider py-2 select-none">
                        Action Console • {currentIncident.code}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setIsDetailsCollapsed(false);
                        setIsMapFullscreen(false);
                      }}
                      className="w-7 h-7 rounded-full bg-[#af101a] text-white flex items-center justify-center shadow-md cursor-pointer hover:bg-[#8f0d15]"
                      title="Quick Dispatch"
                    >
                      <span className="material-symbols-outlined text-sm">send</span>
                    </button>
                  </div>
                ) : (
                  /* Expanded Details Panel */
                  <>
                    {/* Header Info */}
                    <div className="p-3 border-b border-[#e4beba] bg-white sticky top-0 z-10 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs font-bold text-[#5b403d]">
                            {currentIncident.code}
                          </span>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                              currentIncident.urgency === 'critical'
                                ? 'bg-[#ffdad6] text-[#93000a]'
                                : currentIncident.urgency === 'high'
                                ? 'bg-[#ffdfa0] text-[#795900]'
                                : 'bg-[#d4e3ff] text-[#0058a2]'
                            }`}
                          >
                            {currentIncident.urgency}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-[#f0eded] text-[#5b403d] uppercase font-mono">
                            {currentIncident.status}
                          </span>

                          <button
                            onClick={() => setIsDetailsCollapsed(true)}
                            className="hidden md:flex p-1 text-[#8f6f6c] hover:text-[#1b1c1c] hover:bg-[#f6f3f2] rounded-md transition-colors cursor-pointer"
                            title="Collapse Action Panel (Gives more space to map)"
                          >
                            <span className="material-symbols-outlined text-base">chevron_right</span>
                          </button>
                        </div>
                      </div>

                      <h2 className="text-sm font-bold text-[#1b1c1c] text-left leading-tight">
                        {currentIncident.title}
                      </h2>

                      <p className="text-[11px] text-[#5b403d] flex items-center gap-1 text-left">
                        <span className="material-symbols-outlined text-xs text-[#af101a]">location_on</span>
                        <span className="truncate">{currentIncident.locationName}</span>
                      </p>
                    </div>

                    {/* Action Box: Dispatch Unit */}
                    <div className="p-3 space-y-3">
                      <div className="p-3 bg-[#fbf9f8] rounded-xl border border-[#e4beba] space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-[#1b1c1c] uppercase tracking-wider flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm text-[#af101a]">send</span>
                            Dispatch Unit
                          </span>
                          {currentIncident.assignedUnitName && (
                            <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                              Assigned
                            </span>
                          )}
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-medium text-[#5b403d] block text-left">
                            Select Available Unit:
                          </label>
                          <select
                            value={selectedUnitToDispatch}
                            onChange={(e) => setSelectedUnitToDispatch(e.target.value)}
                            className="w-full text-[11px] font-medium bg-white border border-[#e4beba] rounded-lg p-1.5 text-[#1b1c1c] focus:outline-none focus:ring-1 focus:ring-[#af101a]"
                          >
                            <option value="">-- Choose Unit to Dispatch --</option>
                            {responderUnits.map((unit) => (
                              <option key={unit.id} value={unit.id}>
                                {unit.name} ({unit.type.toUpperCase()}) - ETA: {unit.eta} [{unit.status}]
                              </option>
                            ))}
                          </select>
                        </div>

                        <button
                          onClick={handleDispatch}
                          disabled={!selectedUnitToDispatch}
                          className="w-full py-1.5 bg-[#af101a] hover:bg-[#8f0d15] text-white rounded-lg text-xs font-bold disabled:opacity-50 transition-colors cursor-pointer flex items-center justify-center gap-1 active:scale-98"
                        >
                          <span className="material-symbols-outlined text-sm">emergency_share</span>
                          <span>Confirm Dispatch Order</span>
                        </button>

                        {/* Recommended Station Speed Dial */}
                        <div className="pt-2 border-t border-[#e4beba]/60 flex items-center justify-between text-[11px]">
                          <div className="flex items-center gap-1 text-[#5b403d] min-w-0">
                            <span className="material-symbols-outlined text-xs text-[#0058a2]">apartment</span>
                            <span className="truncate">{recommendedStation.name}</span>
                          </div>
                          <button
                            onClick={() => handleOpenStationModal(recommendedStation.id)}
                            className="text-[10px] font-bold text-[#af101a] hover:underline cursor-pointer flex items-center gap-0.5 shrink-0"
                          >
                            <span>Hotline</span>
                            <span className="material-symbols-outlined text-[10px]">call</span>
                          </button>
                        </div>
                      </div>

                      {/* Details Table */}
                      <div className="border border-[#e4beba] rounded-xl overflow-hidden text-[11px]">
                        <table className="w-full text-left">
                          <tbody>
                            <tr className="border-b border-[#e4beba] bg-[#f6f3f2]/60">
                              <th className="py-1.5 px-2.5 text-[#5b403d] font-semibold w-1/3">Caller</th>
                              <td className="py-1.5 px-2.5 text-[#1b1c1c]">
                                {currentIncident.reporterName} ({currentIncident.reporterRole})
                              </td>
                            </tr>
                            <tr className="border-b border-[#e4beba]">
                              <th className="py-1.5 px-2.5 text-[#5b403d] font-semibold">Time</th>
                              <td className="py-1.5 px-2.5 text-[#1b1c1c] font-mono">{currentIncident.timestamp}</td>
                            </tr>
                            <tr className="border-b border-[#e4beba] bg-[#f6f3f2]/60">
                              <th className="py-1.5 px-2.5 text-[#5b403d] font-semibold">Hazmat</th>
                              <td className="py-1.5 px-2.5 text-[#ba1a1a] font-bold flex items-center gap-1">
                                <span className="material-symbols-outlined text-[13px]">warning</span>
                                {currentIncident.hazmat || 'None Reported'}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      {/* Comms Feed Log */}
                      <div className="bg-white border border-[#e4beba] rounded-xl shadow-xs flex flex-col min-h-[180px]">
                        <div className="p-2 border-b border-[#e4beba] bg-[#f6f3f2]/40 flex items-center justify-between">
                          <h3 className="font-bold text-[10px] text-[#5b403d] uppercase tracking-wider">
                            Comms Feed
                          </h3>
                          <span className="text-[9px] text-[#5b403d] font-semibold font-mono">
                            TAC-1 Intercom
                          </span>
                        </div>

                        <div className="p-2 flex-1 overflow-y-auto flex flex-col gap-1.5 max-h-[150px]">
                          {currentIncident.commsLog.map((msg) => (
                            <div key={msg.id} className="flex gap-1.5 text-left">
                              <div
                                className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[9px] font-bold ${
                                  msg.senderType === 'bot'
                                    ? 'bg-[#eae7e7] text-[#5b403d]'
                                    : msg.senderType === 'dispatcher'
                                    ? 'bg-[#0770cc] text-white'
                                    : 'bg-[#fec330] text-[#6f5100]'
                                }`}
                              >
                                {msg.senderType === 'bot' ? (
                                  <span className="material-symbols-outlined text-[10px]">smart_toy</span>
                                ) : (
                                  msg.avatarInitials || msg.sender.slice(0, 2).toUpperCase()
                                )}
                              </div>

                              <div className="bg-[#f6f3f2] p-1.5 rounded-lg rounded-tl-none border border-[#e4beba]/60 max-w-[88%] text-[11px]">
                                <p className="text-[#1b1c1c] leading-tight">{msg.text}</p>
                                <span className="text-[8px] text-[#5b403d] mt-0.5 block font-mono">
                                  {msg.time} • {msg.sender}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>

                        <form onSubmit={handleSendComms} className="p-1.5 border-t border-[#e4beba] bg-white flex gap-1">
                          <input
                            type="text"
                            value={commsInput}
                            onChange={(e) => setCommsInput(e.target.value)}
                            placeholder="Transmit SITREP message..."
                            className="flex-1 bg-[#f6f3f2] border border-[#e4beba] rounded-lg px-2 py-1 text-xs text-[#1b1c1c] focus:outline-none focus:ring-1 focus:ring-[#af101a]"
                          />
                          <button
                            type="submit"
                            className="bg-[#af101a] text-white px-2 py-1 rounded-lg hover:bg-[#930010] transition-colors flex items-center justify-center cursor-pointer active:scale-95"
                          >
                            <span className="material-symbols-outlined text-xs">send</span>
                          </button>
                        </form>
                      </div>
                    </div>
                  </>
                )}
              </section>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DispatcherDashboardScreen;

