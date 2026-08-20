import React, { useState } from 'react';
import { Incident, ResponderUnit, ScreenView, EmergencyStation } from '../types';
import { MAP_TEXTURE_URL_CHICAGO, EMERGENCY_STATIONS } from '../data/mockData';
import { StationContactModal } from '../components/StationContactModal';

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
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedUnitToDispatch, setSelectedUnitToDispatch] = useState<string>('');
  const [commsInput, setCommsInput] = useState<string>('');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [filterUrgency, setFilterUrgency] = useState<string>('all');

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
      return EMERGENCY_STATIONS.find((s) => s.id === 'stn-hospital-mgh') || EMERGENCY_STATIONS[4];
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

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden bg-white select-none relative">
      {/* Station Contact Modal */}
      <StationContactModal
        isOpen={isStationModalOpen}
        onClose={() => setIsStationModalOpen(false)}
        currentIncident={currentIncident}
        onAddIncidentComms={onAddCommsMessage}
        initialStationId={targetStationId}
      />

      {/* LEFT PANEL: Incoming Reports (w-full md:w-[360px] lg:w-[390px]) */}
      <section className="w-full md:w-[360px] lg:w-[390px] flex flex-col border-r border-[#e4beba] bg-white h-full z-10 shadow-[2px_0_8px_rgba(0,0,0,0.02)] shrink-0">
        <div className="p-4 border-b border-[#e4beba] bg-white sticky top-0">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-bold text-lg text-[#1b1c1c]">Incoming Reports</h2>
            <span className="text-xs font-semibold px-2 py-0.5 bg-[#f6f3f2] rounded-full text-[#5b403d]">
              {filteredIncidents.length} active
            </span>
          </div>

          <div className="relative mb-2">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#5b403d] text-lg">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ID or Keyword..."
              className="w-full pl-9 pr-3 py-2 bg-[#f6f3f2] border border-[#e4beba] rounded-lg text-xs text-[#1b1c1c] placeholder:text-[#8f6f6c] focus:outline-none focus:ring-1 focus:ring-[#af101a]"
            />
          </div>

          {/* Quick Filter chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
            <button
              onClick={() => setFilterUrgency('all')}
              className={`px-2 py-1 rounded-md text-[11px] font-semibold cursor-pointer ${
                filterUrgency === 'all'
                  ? 'bg-[#1b1c1c] text-white'
                  : 'bg-[#f0eded] text-[#5b403d] hover:bg-[#eae7e7]'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterUrgency('critical')}
              className={`px-2 py-1 rounded-md text-[11px] font-semibold cursor-pointer ${
                filterUrgency === 'critical'
                  ? 'bg-[#ba1a1a] text-white'
                  : 'bg-[#ffdad6] text-[#93000a] hover:bg-[#ffb3ac]'
              }`}
            >
              Critical
            </button>
            <button
              onClick={() => setFilterUrgency('high')}
              className={`px-2 py-1 rounded-md text-[11px] font-semibold cursor-pointer ${
                filterUrgency === 'high'
                  ? 'bg-[#795900] text-white'
                  : 'bg-[#ffdfa0] text-[#261a00] hover:bg-[#f8bd2a]'
              }`}
            >
              High
            </button>
            <button
              onClick={() => setFilterUrgency('routine')}
              className={`px-2 py-1 rounded-md text-[11px] font-semibold cursor-pointer ${
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
        <div className="flex-1 overflow-y-auto no-scrollbar p-2.5 flex flex-col gap-2.5">
          {filteredIncidents.map((incident) => {
            const isSelected = currentIncident?.id === incident.id;
            const isCritical = incident.urgency === 'critical';
            const isHigh = incident.urgency === 'high';

            return (
              <div
                key={incident.id}
                onClick={() => onSelectIncident(incident)}
                className={`rounded-xl p-3 cursor-pointer transition-all duration-150 relative overflow-hidden group shadow-xs ${
                  isSelected
                    ? 'bg-[#af101a]/5 border-2 border-[#af101a] shadow-[0_2px_8px_rgba(175,16,26,0.12)]'
                    : 'bg-white border border-[#e4beba] hover:bg-[#f6f3f2]'
                }`}
              >
                {/* Criticality Bar on left */}
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                    isCritical
                      ? 'bg-[#ba1a1a]'
                      : isHigh
                      ? 'bg-[#fec330]'
                      : 'bg-[#0770cc]'
                  }`}
                ></div>

                <div className="flex justify-between items-start mb-1.5 pl-2">
                  <div className="flex gap-2 items-center">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                        isCritical
                          ? 'bg-[#ffdad6] text-[#93000a]'
                          : isHigh
                          ? 'bg-[#fec330] text-[#6f5100]'
                          : 'bg-[#d4e3ff] text-[#001c3a]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[12px]">
                        {isCritical ? 'warning' : isHigh ? 'priority_high' : 'info'}
                      </span>
                      {incident.urgency.toUpperCase()}
                    </span>
                    <span className="font-data-tabular text-xs font-semibold text-[#5b403d]">
                      {incident.code}
                    </span>
                  </div>
                  <span className="font-data-tabular text-xs text-[#5b403d]">
                    {incident.timeAgo}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-[#1b1c1c] pl-2 mb-1 truncate text-left">
                  {incident.title}
                </h3>

                <div className="flex items-center gap-1.5 pl-2 text-[#5b403d] text-xs font-data-tabular">
                  <span className="material-symbols-outlined text-[15px] shrink-0 text-[#795900]">
                    location_on
                  </span>
                  <span className="truncate">{incident.locationName}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CENTER PANEL: Map Canvas with Station Quick Bar & Tactical Pins */}
      <section className="flex-1 relative bg-[#eae7e7] min-h-[360px] md:h-full z-0 overflow-hidden flex flex-col">
        {/* Top Tactical Station Hotline Bar */}
        <div className="absolute top-3 left-3 right-16 z-30 flex items-center gap-2 overflow-x-auto no-scrollbar pointer-events-auto">
          {/* Master Open Hotline Center Button */}
          <button
            onClick={() => handleOpenStationModal()}
            className="bg-[#af101a] text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-md hover:bg-[#930010] transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95"
          >
            <span className="material-symbols-outlined text-base">cell_tower</span>
            <span>Station Hotlines ({EMERGENCY_STATIONS.length})</span>
          </button>

          {/* Quick Direct Station Call Chips */}
          <button
            onClick={() => handleOpenStationModal('stn-fire-42')}
            className="bg-white/95 backdrop-blur-xs border border-[#e4beba] text-[#93000a] px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm hover:bg-[#ffdad6]/50 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-[#ba1a1a] animate-pulse"></span>
            <span className="material-symbols-outlined text-sm">local_fire_department</span>
            <span>Fire Stn 42</span>
          </button>

          <button
            onClick={() => handleOpenStationModal('stn-police-01')}
            className="bg-white/95 backdrop-blur-xs border border-[#e4beba] text-[#001c3a] px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm hover:bg-[#d4e3ff]/50 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-[#0058a2]"></span>
            <span className="material-symbols-outlined text-sm">local_police</span>
            <span>Police HQ 1st Pct</span>
          </button>

          <button
            onClick={() => handleOpenStationModal('stn-hospital-mgh')}
            className="bg-white/95 backdrop-blur-xs border border-[#e4beba] text-[#0369a1] px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm hover:bg-[#e0f2fe]/50 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-[#0284c7]"></span>
            <span className="material-symbols-outlined text-sm">local_hospital</span>
            <span>Metro Gen Trauma</span>
          </button>
        </div>

        {/* Map Background Layer */}
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center transition-transform duration-300"
          style={{
            backgroundImage: `url(${MAP_TEXTURE_URL_CHICAGO})`,
            transform: `scale(${zoomLevel})`
          }}
        >
          {/* Subtle Grid overlay */}
          <div
            className="absolute inset-0 bg-[#000]/5"
            style={{
              backgroundImage:
                'radial-gradient(circle at 2px 2px, rgba(0,0,0,0.12) 1px, transparent 0)',
              backgroundSize: '24px 24px'
            }}
          ></div>

          {/* Station Map Pins (Clickable to Contact Station) */}
          {EMERGENCY_STATIONS.map((station, sIdx) => {
            // Position stations at strategic perimeter anchors
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
            } else if (station.id === 'stn-fire-14') {
              sTop = '22%';
              sLeft = '72%';
            } else if (station.id === 'stn-police-04') {
              sTop = '18%';
              sLeft = '42%';
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
                <div className="bg-[#1b1c1c] text-white px-2 py-0.5 rounded shadow-md border border-slate-700 text-[10px] font-bold whitespace-nowrap opacity-90 group-hover:opacity-100 flex items-center gap-1 mb-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]"></span>
                  {station.badgeCode}
                </div>
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-lg border-2 border-white text-white ${
                    station.type === 'police'
                      ? 'bg-[#0058a2]'
                      : station.type === 'fire'
                      ? 'bg-[#ba1a1a]'
                      : station.type === 'hospital' || station.type === 'ems'
                      ? 'bg-[#0284c7]'
                      : 'bg-[#7e22ce]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {station.type === 'police'
                      ? 'local_police'
                      : station.type === 'fire'
                      ? 'local_fire_department'
                      : station.type === 'hospital'
                      ? 'local_hospital'
                      : 'domain'}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Interactive Incident Map Pins */}
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
            } else if (inc.id === 'inc-8899') {
              topPercent = '65%';
              leftPercent = '70%';
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
                onClick={() => onSelectIncident(inc)}
                className="absolute flex flex-col items-center cursor-pointer group -translate-x-1/2 -translate-y-1/2 transition-transform duration-150 hover:scale-110 z-20"
                style={{ top: topPercent, left: leftPercent }}
              >
                {/* Pin Tooltip */}
                <div className="bg-white px-2.5 py-1 rounded-md shadow-md border border-[#e4beba] mb-1 font-data-tabular text-[11px] font-bold text-[#1b1c1c] whitespace-nowrap opacity-90 group-hover:opacity-100 transition-opacity">
                  {inc.code}: {inc.locationName.split(',')[0]}
                </div>

                {/* Marker Shape */}
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center shadow-lg border-2 border-white transition-all ${
                    isSelected
                      ? 'bg-[#d32f2f] text-white ring-4 ring-[#af101a]/30 animate-bounce'
                      : inc.urgency === 'critical'
                      ? 'bg-[#ba1a1a] text-white animate-pulse'
                      : inc.urgency === 'high'
                      ? 'bg-[#fec330] text-[#6f5100]'
                      : 'bg-[#0770cc] text-white'
                  }`}
                >
                  <span
                    className="material-symbols-outlined text-lg icon-filled"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    {inc.type === 'fire'
                      ? 'local_fire_department'
                      : inc.type === 'accident'
                      ? 'directions_car'
                      : inc.type === 'medical'
                      ? 'local_hospital'
                      : 'warning'}
                  </span>
                </div>
                <div className="w-1.5 h-1.5 bg-[#1b1c1c] rounded-full mt-0.5"></div>
              </div>
            );
          })}

          {/* Active Units On Map */}
          {responderUnits.slice(0, 3).map((unit, idx) => (
            <div
              key={unit.id}
              className="absolute flex flex-col items-center pointer-events-none -translate-x-1/2 -translate-y-1/2 z-10"
              style={{
                top: `${40 + idx * 16}%`,
                left: `${42 + idx * 14}%`
              }}
            >
              <div className="bg-[#1b1c1c] text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs mb-0.5">
                {unit.callsign}
              </div>
              <div className="w-6 h-6 rounded-md bg-[#0058a2] text-white flex items-center justify-center shadow-md border border-white">
                <span className="material-symbols-outlined text-[13px]">local_shipping</span>
              </div>
            </div>
          ))}
        </div>

        {/* Map Controls */}
        <div className="absolute top-16 right-4 flex flex-col gap-2 z-30">
          <button
            onClick={() => setZoomLevel((z) => Math.min(1.6, z + 0.15))}
            aria-label="Zoom In"
            className="bg-white p-2 rounded-lg border border-[#e4beba] shadow-sm hover:bg-[#f6f3f2] transition-colors cursor-pointer text-[#1b1c1c]"
          >
            <span className="material-symbols-outlined text-lg">add</span>
          </button>
          <button
            onClick={() => setZoomLevel((z) => Math.max(0.8, z - 0.15))}
            aria-label="Zoom Out"
            className="bg-white p-2 rounded-lg border border-[#e4beba] shadow-sm hover:bg-[#f6f3f2] transition-colors cursor-pointer text-[#1b1c1c]"
          >
            <span className="material-symbols-outlined text-lg">remove</span>
          </button>
          <button
            onClick={() => setZoomLevel(1)}
            aria-label="Center Location"
            className="bg-white p-2 rounded-lg border border-[#e4beba] shadow-sm hover:bg-[#f6f3f2] transition-colors cursor-pointer text-[#1b1c1c] mt-1"
          >
            <span className="material-symbols-outlined text-lg">my_location</span>
          </button>
        </div>
      </section>

      {/* RIGHT PANEL: Incident Details, Station Contact & Dispatch Actions (w-full md:w-[390px] lg:w-[440px]) */}
      {currentIncident && (
        <section className="w-full md:w-[390px] lg:w-[440px] bg-white flex flex-col border-l border-[#e4beba] h-full z-10 shadow-[-2px_0_8px_rgba(0,0,0,0.02)] shrink-0 overflow-y-auto no-scrollbar">
          {/* Header */}
          <div className="p-4 border-b border-[#e4beba] bg-white text-left">
            <div className="flex justify-between items-start mb-2">
              <div className="flex gap-2 items-center">
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                    currentIncident.urgency === 'critical'
                      ? 'bg-[#ffdad6] text-[#93000a]'
                      : currentIncident.urgency === 'high'
                      ? 'bg-[#fec330] text-[#6f5100]'
                      : 'bg-[#d4e3ff] text-[#001c3a]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[13px]">
                    {currentIncident.urgency === 'critical' ? 'warning' : 'priority_high'}
                  </span>
                  {currentIncident.urgency.toUpperCase()}
                </span>
                <span className="font-data-tabular text-xs font-bold text-[#5b403d]">
                  {currentIncident.code}
                </span>
              </div>

              <button
                onClick={() => onNavigate('responder_incident')}
                className="text-xs font-bold text-[#0058a2] hover:underline flex items-center gap-1 cursor-pointer"
              >
                Responder View <span className="material-symbols-outlined text-xs">open_in_new</span>
              </button>
            </div>

            <h2 className="text-xl font-bold text-[#1b1c1c] leading-tight mb-1">
              {currentIncident.title}
            </h2>
            <p className="text-xs text-[#5b403d] flex items-center gap-1 font-data-tabular">
              <span className="material-symbols-outlined text-[16px] text-[#795900]">
                location_on
              </span>
              {currentIncident.locationName}
            </p>
          </div>

          {/* Body Content */}
          <div className="p-4 flex flex-col gap-4 text-left">
            {/* STATION INTER-AGENCY CONTACT CARD */}
            <div className="bg-[#fcf9f8] border border-[#e4beba] rounded-xl p-3.5 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[#af101a] text-lg">cell_tower</span>
                  <h3 className="font-bold text-xs text-[#1b1c1c] uppercase tracking-wider">
                    Contact Station / Precinct
                  </h3>
                </div>
                <span className="text-[10px] font-bold text-[#0058a2] bg-[#d4e3ff] px-2 py-0.5 rounded-full">
                  CAD Link
                </span>
              </div>

              {/* Recommended Station preview */}
              <div className="bg-white p-2.5 rounded-lg border border-[#e4beba] mb-3 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#af101a] text-white flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-lg">
                      {recommendedStation.type === 'police'
                        ? 'local_police'
                        : recommendedStation.type === 'fire'
                        ? 'local_fire_department'
                        : 'local_hospital'}
                    </span>
                  </div>
                  <div>
                    <div className="font-bold text-[#1b1c1c] leading-tight">
                      {recommendedStation.name}
                    </div>
                    <div className="text-[11px] text-[#5b403d] font-data-tabular">
                      {recommendedStation.badgeCode} • {recommendedStation.watchCommander}
                    </div>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-[#ba1a1a]">{recommendedStation.responseLeadTime}</span>
              </div>

              {/* Station Quick Contact Action Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleOpenStationModal(recommendedStation.id)}
                  className="bg-[#af101a] text-white py-2 px-3 rounded-lg font-bold text-xs hover:bg-[#930010] transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">call</span> Call Station
                </button>
                <button
                  onClick={() => handleOpenStationModal(recommendedStation.id)}
                  className="bg-[#1b1c1c] text-white py-2 px-3 rounded-lg font-bold text-xs hover:bg-[#333] transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">radio</span> Radio Patch
                </button>
              </div>

              <button
                onClick={() => handleOpenStationModal()}
                className="w-full mt-2 text-center text-xs font-semibold text-[#0058a2] hover:underline cursor-pointer py-1"
              >
                Browse All Police, Fire & Medical Stations →
              </button>
            </div>

            {/* Status Update Card */}
            <div className="bg-white border border-[#e4beba] rounded-xl p-3.5 shadow-xs">
              <h3 className="font-bold text-xs text-[#5b403d] mb-2.5 uppercase tracking-wider">
                Status Update
              </h3>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {(['pending', 'assigned', 'responding', 'resolved'] as const).map((st) => {
                  const isActive = currentIncident.status === st;
                  return (
                    <button
                      key={st}
                      onClick={() => onUpdateStatus(currentIncident.id, st)}
                      className={`py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer capitalize flex items-center justify-center gap-1.5 ${
                        isActive
                          ? 'bg-[#0770cc] text-white border-transparent shadow-xs font-bold'
                          : 'bg-[#f6f3f2] text-[#1b1c1c] border-[#e4beba] hover:bg-[#eae7e7]'
                      }`}
                    >
                      {isActive && (
                        <span className="material-symbols-outlined text-[14px]">
                          directions_run
                        </span>
                      )}
                      {st}
                    </button>
                  );
                })}
              </div>

              {/* Assign Responder Unit */}
              <div className="flex flex-col gap-2 pt-3 border-t border-[#e4beba]">
                <label className="font-bold text-xs text-[#5b403d] uppercase tracking-wider">
                  Assign Responder
                </label>
                <div className="relative">
                  <select
                    value={selectedUnitToDispatch}
                    onChange={(e) => setSelectedUnitToDispatch(e.target.value)}
                    className="w-full appearance-none bg-[#f6f3f2] border border-[#e4beba] rounded-lg py-2.5 pl-3 pr-8 text-xs font-semibold text-[#1b1c1c] focus:outline-none focus:ring-1 focus:ring-[#af101a]"
                  >
                    <option value="">
                      {currentIncident.assignedUnitName
                        ? `Assigned: ${currentIncident.assignedUnitName}`
                        : 'Select Unit...'}
                    </option>
                    {responderUnits.map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        {unit.name} (ETA: {unit.eta} • {unit.status})
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#5b403d] text-lg">
                    arrow_drop_down
                  </span>
                </div>

                <button
                  onClick={handleDispatch}
                  disabled={!selectedUnitToDispatch}
                  className="mt-1 w-full bg-[#af101a] text-white py-2.5 rounded-lg font-bold text-xs uppercase tracking-wide hover:bg-[#930010] transition-colors shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">send</span> Dispatch Unit
                </button>
              </div>
            </div>

            {/* Details Table */}
            <div className="bg-white border border-[#e4beba] rounded-xl overflow-hidden shadow-xs">
              <table className="w-full text-left border-collapse text-xs">
                <tbody>
                  <tr className="border-b border-[#e4beba] bg-[#f6f3f2]/60">
                    <th className="py-2 px-3 text-[#5b403d] font-semibold w-1/3 font-data-tabular">
                      Reported By
                    </th>
                    <td className="py-2 px-3 text-[#1b1c1c] font-data-tabular">
                      {currentIncident.reporterName} ({currentIncident.reporterRole})
                    </td>
                  </tr>
                  <tr className="border-b border-[#e4beba]">
                    <th className="py-2 px-3 text-[#5b403d] font-semibold font-data-tabular">
                      Time Received
                    </th>
                    <td className="py-2 px-3 text-[#1b1c1c] font-data-tabular">
                      {currentIncident.timestamp}
                    </td>
                  </tr>
                  <tr className="border-b border-[#e4beba] bg-[#f6f3f2]/60">
                    <th className="py-2 px-3 text-[#5b403d] font-semibold font-data-tabular">
                      Occupancy
                    </th>
                    <td className="py-2 px-3 text-[#1b1c1c] font-data-tabular">
                      {currentIncident.occupancy || 'Unknown'}
                    </td>
                  </tr>
                  <tr>
                    <th className="py-2 px-3 text-[#5b403d] font-semibold font-data-tabular">
                      Hazmat
                    </th>
                    <td className="py-2 px-3 text-[#ba1a1a] font-bold font-data-tabular flex items-center gap-1">
                      <span className="material-symbols-outlined text-[15px]">warning</span>
                      {currentIncident.hazmat || 'None Reported'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Comms Log */}
            <div className="bg-white border border-[#e4beba] rounded-xl shadow-xs flex flex-col min-h-[260px]">
              <div className="p-3 border-b border-[#e4beba] bg-[#f6f3f2]/40 flex items-center justify-between">
                <h3 className="font-bold text-xs text-[#5b403d] uppercase tracking-wider">
                  Comms Log
                </h3>
                <span className="text-[10px] text-[#5b403d] font-semibold font-data-tabular">
                  Secure Channel #4
                </span>
              </div>

              {/* Messages stream */}
              <div className="p-3 flex-1 overflow-y-auto flex flex-col gap-2.5 max-h-[220px]">
                {currentIncident.commsLog.map((msg) => (
                  <div key={msg.id} className="flex gap-2 text-left">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                        msg.senderType === 'bot'
                          ? 'bg-[#eae7e7] text-[#5b403d]'
                          : msg.senderType === 'dispatcher'
                          ? 'bg-[#0770cc] text-white'
                          : 'bg-[#fec330] text-[#6f5100]'
                      }`}
                    >
                      {msg.senderType === 'bot' ? (
                        <span className="material-symbols-outlined text-sm">smart_toy</span>
                      ) : (
                        msg.avatarInitials || msg.sender.slice(0, 2).toUpperCase()
                      )}
                    </div>

                    <div className="bg-[#f6f3f2] p-2 rounded-lg rounded-tl-none border border-[#e4beba]/60 max-w-[85%]">
                      <p className="text-xs text-[#1b1c1c] leading-relaxed">{msg.text}</p>
                      <span className="text-[10px] text-[#5b403d] mt-1 block font-data-tabular">
                        {msg.time} • {msg.sender}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input for new Comms Message */}
              <form onSubmit={handleSendComms} className="p-2.5 border-t border-[#e4beba] bg-white flex gap-2">
                <input
                  type="text"
                  value={commsInput}
                  onChange={(e) => setCommsInput(e.target.value)}
                  placeholder="Add note or update..."
                  className="flex-1 bg-[#f6f3f2] border border-[#e4beba] rounded-lg px-3 py-1.5 text-xs text-[#1b1c1c] focus:outline-none focus:ring-1 focus:ring-[#af101a]"
                />
                <button
                  type="submit"
                  className="bg-[#af101a] text-white p-2 rounded-lg hover:bg-[#930010] transition-colors flex items-center justify-center cursor-pointer active:scale-95"
                >
                  <span className="material-symbols-outlined text-base">send</span>
                </button>
              </form>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

