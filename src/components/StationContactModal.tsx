import React, { useState, useEffect } from 'react';
import { EmergencyStation, Incident, StationType } from '../types';
import { EMERGENCY_STATIONS } from '../data/mockData';

interface StationContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentIncident?: Incident | null;
  onAddIncidentComms?: (incidentId: string, text: string) => void;
  initialStationId?: string | null;
}

export const StationContactModal: React.FC<StationContactModalProps> = ({
  isOpen,
  onClose,
  currentIncident,
  onAddIncidentComms,
  initialStationId
}) => {
  const [selectedStation, setSelectedStation] = useState<EmergencyStation | null>(null);
  const [stationFilter, setStationFilter] = useState<'all' | StationType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Call simulation state
  const [callActive, setCallActive] = useState(false);
  const [callStatus, setCallStatus] = useState<'connecting' | 'connected' | 'ended'>('connecting');
  const [callTimer, setCallTimer] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isRadioIntercom, setIsRadioIntercom] = useState(false);
  const [pttActive, setPttActive] = useState(false);
  
  // Quick Relay & Memo state
  const [memoText, setMemoText] = useState('');
  const [relaySuccessNotice, setRelaySuccessNotice] = useState<string | null>(null);
  const [stationCallLog, setStationCallLog] = useState<{ sender: string; text: string; time: string }[]>([]);

  // Set initial station or default
  useEffect(() => {
    if (initialStationId) {
      const found = EMERGENCY_STATIONS.find((s) => s.id === initialStationId);
      if (found) setSelectedStation(found);
    } else if (currentIncident) {
      // Auto-suggest best station based on incident type
      if (currentIncident.type === 'fire') {
        setSelectedStation(EMERGENCY_STATIONS.find((s) => s.type === 'fire') || EMERGENCY_STATIONS[0]);
      } else if (currentIncident.type === 'police' || currentIncident.type === 'accident') {
        setSelectedStation(EMERGENCY_STATIONS.find((s) => s.type === 'police') || EMERGENCY_STATIONS[0]);
      } else if (currentIncident.type === 'medical') {
        setSelectedStation(EMERGENCY_STATIONS.find((s) => s.type === 'hospital') || EMERGENCY_STATIONS[0]);
      } else {
        setSelectedStation(EMERGENCY_STATIONS[0]);
      }
    } else {
      setSelectedStation(EMERGENCY_STATIONS[0]);
    }
  }, [initialStationId, currentIncident, isOpen]);

  // Call timer interval
  useEffect(() => {
    let interval: any;
    if (callActive && callStatus === 'connected') {
      interval = setInterval(() => {
        setCallTimer((t) => t + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callActive, callStatus]);

  if (!isOpen) return null;

  const filteredStations = EMERGENCY_STATIONS.filter((station) => {
    const matchesFilter = stationFilter === 'all' || station.type === stationFilter;
    const matchesSearch =
      station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      station.badgeCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      station.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      station.sector.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleStartCall = (station: EmergencyStation, isRadio = false) => {
    setSelectedStation(station);
    setIsRadioIntercom(isRadio);
    setCallActive(true);
    setCallStatus('connecting');
    setCallTimer(0);
    setRelaySuccessNotice(null);

    const initialGreeting = isRadio
      ? `[RADIO TAC CHANNEL ${station.radioChannel}] ${station.badgeCode} Command Desk responding to Central CAD dispatch.`
      : `${station.name} (${station.watchCommander} on duty). Go ahead, Central Dispatch.`;

    // Simulate connection after brief ringing delay
    setTimeout(() => {
      setCallStatus('connected');
      setStationCallLog([
        {
          sender: station.watchCommander,
          text: initialGreeting,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        }
      ]);
    }, 1200);
  };

  const handleEndCall = () => {
    setCallStatus('ended');
    setTimeout(() => {
      setCallActive(false);
      setCallTimer(0);
    }, 600);
  };

  const handleSendQuickTransmission = (message: string) => {
    if (!selectedStation) return;
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Add dispatcher transmission to station call log
    const updatedLog = [
      ...stationCallLog,
      { sender: 'Central Dispatcher 042', text: message, time }
    ];

    // Simulate station commander response
    let commanderReply = `Understood Central. ${selectedStation.badgeCode} units alerted and standing by.`;
    if (message.includes('Alarm') || message.includes('Turnout')) {
      commanderReply = `Station alarm sounded. Alerting turnout crews now. ETA lead time: ${selectedStation.responseLeadTime}.`;
    } else if (message.includes('Trauma') || message.includes('Hospital')) {
      commanderReply = `Trauma Bay team notified and prepped. Critical care staff on immediate standby.`;
    } else if (message.includes('Hazmat') || message.includes('Chemical')) {
      commanderReply = `Hazmat team rolling with containment gear and foam unit.`;
    }

    setTimeout(() => {
      setStationCallLog((prev) => [
        ...prev,
        {
          sender: selectedStation.watchCommander,
          text: commanderReply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 900);

    setStationCallLog(updatedLog);

    // Also log to current incident comms log if attached
    if (currentIncident && onAddIncidentComms) {
      onAddIncidentComms(
        currentIncident.id,
        `[STATION HOTLINE: ${selectedStation.badgeCode}] Dispatch -> ${selectedStation.name}: "${message}"`
      );
    }
  };

  const handleRelayCadIncident = (station: EmergencyStation) => {
    if (!currentIncident) return;
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const logNotice = `CAD Relay sent to ${station.name} (${station.badgeCode}) for ${currentIncident.code}: ${currentIncident.title} at ${currentIncident.locationName}`;

    if (onAddIncidentComms) {
      onAddIncidentComms(currentIncident.id, `[CAD DIRECT RELAY] ${logNotice}`);
    }

    setRelaySuccessNotice(`Incident ${currentIncident.code} successfully broadcasted to ${station.name} CAD Terminal.`);
    setTimeout(() => setRelaySuccessNotice(null), 4000);
  };

  const handleSendCustomMemo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memoText.trim() || !selectedStation) return;
    handleSendQuickTransmission(memoText.trim());
    setMemoText('');
  };

  const getStationTypeIcon = (type: StationType) => {
    switch (type) {
      case 'police':
        return 'local_police';
      case 'fire':
        return 'local_fire_department';
      case 'hospital':
        return 'local_hospital';
      case 'ems':
        return 'medical_services';
      case 'emergency_desk':
        return 'domain';
      default:
        return 'emergency';
    }
  };

  const getStationTypeBadge = (type: StationType) => {
    switch (type) {
      case 'police':
        return 'bg-[#d4e3ff] text-[#001c3a] border-[#a5c8ff]';
      case 'fire':
        return 'bg-[#ffdad6] text-[#93000a] border-[#ffb3ac]';
      case 'hospital':
        return 'bg-[#e0f2fe] text-[#0369a1] border-[#bae6fd]';
      case 'ems':
        return 'bg-[#dcfce7] text-[#15803d] border-[#bbf7d0]';
      case 'emergency_desk':
        return 'bg-[#f3e8ff] text-[#6b21a8] border-[#e9d5ff]';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs select-none">
      <div className="bg-white rounded-2xl border border-[#e4beba] shadow-2xl w-full max-w-5xl h-[90vh] max-h-[780px] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-5 py-3.5 bg-[#fcf9f8] border-b border-[#e4beba] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#af101a] text-white flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-2xl">cell_tower</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-lg text-[#1b1c1c]">Emergency Station Contact & CAD Relay</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#d4e3ff] text-[#0058a2] uppercase tracking-wider">
                  Direct Line
                </span>
              </div>
              <p className="text-xs text-[#5b403d]">
                Inter-agency emergency dispatch: Police Precincts, Fire Battalions, Trauma Centers & OEM
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-[#5b403d] hover:bg-[#eae7e7] hover:text-[#1b1c1c] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Success Alert Banner */}
        {relaySuccessNotice && (
          <div className="bg-[#dcfce7] border-b border-[#86efac] px-4 py-2 text-xs font-semibold text-[#15803d] flex items-center gap-2 animate-in slide-in-from-top-2">
            <span className="material-symbols-outlined text-base">check_circle</span>
            {relaySuccessNotice}
          </div>
        )}

        {/* Modal Content Body */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* LEFT: Station Directory List */}
          <div className="w-full md:w-80 lg:w-96 border-r border-[#e4beba] flex flex-col bg-[#fcf9f8] shrink-0 h-full overflow-hidden">
            {/* Search & Filter Header */}
            <div className="p-3 border-b border-[#e4beba] flex flex-col gap-2 bg-white sticky top-0">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[#5b403d] text-base">
                  search
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Station, Precinct, Frequency..."
                  className="w-full pl-8 pr-3 py-1.5 bg-[#f6f3f2] border border-[#e4beba] rounded-lg text-xs text-[#1b1c1c] focus:outline-none focus:ring-1 focus:ring-[#af101a]"
                />
              </div>

              {/* Station Filter Tabs */}
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pt-0.5">
                <button
                  onClick={() => setStationFilter('all')}
                  className={`px-2 py-1 rounded-md text-[11px] font-bold shrink-0 cursor-pointer ${
                    stationFilter === 'all' ? 'bg-[#af101a] text-white' : 'bg-[#f0eded] text-[#5b403d] hover:bg-[#eae7e7]'
                  }`}
                >
                  All ({EMERGENCY_STATIONS.length})
                </button>
                <button
                  onClick={() => setStationFilter('police')}
                  className={`px-2 py-1 rounded-md text-[11px] font-bold shrink-0 cursor-pointer ${
                    stationFilter === 'police' ? 'bg-[#0058a2] text-white' : 'bg-[#f0eded] text-[#5b403d] hover:bg-[#eae7e7]'
                  }`}
                >
                  Police
                </button>
                <button
                  onClick={() => setStationFilter('fire')}
                  className={`px-2 py-1 rounded-md text-[11px] font-bold shrink-0 cursor-pointer ${
                    stationFilter === 'fire' ? 'bg-[#ba1a1a] text-white' : 'bg-[#f0eded] text-[#5b403d] hover:bg-[#eae7e7]'
                  }`}
                >
                  Fire
                </button>
                <button
                  onClick={() => setStationFilter('hospital')}
                  className={`px-2 py-1 rounded-md text-[11px] font-bold shrink-0 cursor-pointer ${
                    stationFilter === 'hospital' ? 'bg-[#0284c7] text-white' : 'bg-[#f0eded] text-[#5b403d] hover:bg-[#eae7e7]'
                  }`}
                >
                  Hospital/EMS
                </button>
              </div>
            </div>

            {/* Station List */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-2.5 flex flex-col gap-2">
              {filteredStations.map((station) => {
                const isSelected = selectedStation?.id === station.id;
                return (
                  <div
                    key={station.id}
                    onClick={() => setSelectedStation(station)}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all duration-150 relative ${
                      isSelected
                        ? 'bg-white border-2 border-[#af101a] shadow-sm'
                        : 'bg-white border-[#e4beba] hover:bg-[#f6f3f2]'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-6 h-6 rounded-md flex items-center justify-center text-xs ${
                            station.type === 'police'
                              ? 'bg-[#d4e3ff] text-[#001c3a]'
                              : station.type === 'fire'
                              ? 'bg-[#ffdad6] text-[#93000a]'
                              : station.type === 'hospital' || station.type === 'ems'
                              ? 'bg-[#e0f2fe] text-[#0369a1]'
                              : 'bg-[#f3e8ff] text-[#6b21a8]'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[15px]">
                            {getStationTypeIcon(station.type)}
                          </span>
                        </span>
                        <span className="text-xs font-bold text-[#1b1c1c] font-data-tabular">
                          {station.badgeCode}
                        </span>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase ${
                          station.status === 'operational'
                            ? 'bg-[#dcfce7] text-[#15803d]'
                            : station.status === 'alerted'
                            ? 'bg-[#ffdad6] text-[#93000a]'
                            : 'bg-[#fef08a] text-[#854d0e]'
                        }`}
                      >
                        {station.status}
                      </span>
                    </div>

                    <h4 className="font-bold text-xs text-[#1b1c1c] mb-1 line-clamp-1">
                      {station.name}
                    </h4>

                    <p className="text-[11px] text-[#5b403d] flex items-center gap-1 mb-1.5 font-data-tabular">
                      <span className="material-symbols-outlined text-[13px] text-[#795900]">location_on</span>
                      <span className="truncate">{station.address.split(',')[0]}</span>
                    </p>

                    <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-[#e4beba]/60 text-[#5b403d]">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px] text-[#0058a2]">local_shipping</span>
                        {station.availableUnitsCount} Units Ready
                      </span>
                      <span className="font-bold text-[#ba1a1a]">{station.responseLeadTime}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT: Detailed Station Comms & Live Hotline HUD */}
          {selectedStation ? (
            <div className="flex-1 flex flex-col bg-white overflow-y-auto no-scrollbar">
              {/* Station Overview Banner */}
              <div className="p-4 bg-[#fcf9f8] border-b border-[#e4beba] text-left">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0 ${
                        selectedStation.type === 'police'
                          ? 'bg-[#0058a2]'
                          : selectedStation.type === 'fire'
                          ? 'bg-[#ba1a1a]'
                          : selectedStation.type === 'hospital' || selectedStation.type === 'ems'
                          ? 'bg-[#0284c7]'
                          : 'bg-[#7e22ce]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-2xl">
                        {getStationTypeIcon(selectedStation.type)}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${getStationTypeBadge(selectedStation.type)}`}>
                          {selectedStation.type.replace('_', ' ')}
                        </span>
                        <span className="text-xs font-bold text-[#5b403d] font-data-tabular">
                          {selectedStation.badgeCode}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-[#1b1c1c] leading-tight">
                        {selectedStation.name}
                      </h3>
                      <p className="text-xs text-[#5b403d] font-data-tabular">
                        {selectedStation.address} • {selectedStation.sector}
                      </p>
                    </div>
                  </div>

                  {/* Primary Dispatch Action Buttons */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleStartCall(selectedStation, false)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                        callActive && !isRadioIntercom
                          ? 'bg-[#15803d] text-white ring-2 ring-[#86efac]'
                          : 'bg-[#af101a] text-white hover:bg-[#930010]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-base">call</span>
                      {callActive && !isRadioIntercom ? 'Call Active' : 'Hotline Call'}
                    </button>

                    <button
                      onClick={() => handleStartCall(selectedStation, true)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                        callActive && isRadioIntercom
                          ? 'bg-[#0058a2] text-white ring-2 ring-[#a5c8ff]'
                          : 'bg-[#1b1c1c] text-white hover:bg-[#333]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-base">radio</span>
                      Radio Patch
                    </button>
                  </div>
                </div>

                {/* Metadata Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-[#e4beba] text-xs">
                  <div className="bg-white p-2 rounded-lg border border-[#e4beba]">
                    <span className="text-[10px] text-[#5b403d] block uppercase font-bold">Watch Commander</span>
                    <span className="font-semibold text-[#1b1c1c]">{selectedStation.watchCommander}</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-[#e4beba]">
                    <span className="text-[10px] text-[#5b403d] block uppercase font-bold">CAD Hotline</span>
                    <span className="font-semibold text-[#0058a2] font-data-tabular">{selectedStation.hotlinePhone}</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-[#e4beba]">
                    <span className="text-[10px] text-[#5b403d] block uppercase font-bold">Radio Channel</span>
                    <span className="font-semibold text-[#1b1c1c] font-data-tabular">{selectedStation.radioChannel}</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-[#e4beba]">
                    <span className="text-[10px] text-[#5b403d] block uppercase font-bold">Lead Response</span>
                    <span className="font-semibold text-[#ba1a1a]">{selectedStation.responseLeadTime}</span>
                  </div>
                </div>
              </div>

              {/* ACTIVE CALL / RADIO HUD IF ENGAGED */}
              {callActive && (
                <div className="mx-4 mt-4 p-4 rounded-xl bg-[#0f172a] text-white shadow-lg border border-slate-700 animate-in fade-in slide-in-from-top-3">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-3 h-3 rounded-full bg-[#22c55e] animate-ping"></div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-[#86efac]">
                            {isRadioIntercom ? 'Tactical Radio Intercom Patch' : 'Secure Station Hotline Active'}
                          </span>
                          <span className="text-xs bg-slate-800 px-2 py-0.5 rounded font-mono text-emerald-400">
                            {formatTimer(callTimer)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300">
                          Connected with: <span className="font-bold text-white">{selectedStation.name}</span> ({selectedStation.watchCommander})
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={handleEndCall}
                      className="px-3 py-1.5 bg-[#ef4444] hover:bg-[#dc2626] text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
                    >
                      <span className="material-symbols-outlined text-base">call_end</span> End Link
                    </button>
                  </div>

                  {/* Audio visualizer wave */}
                  <div className="flex items-center justify-center gap-1.5 h-8 my-2 bg-slate-900/60 rounded-lg p-2">
                    {[40, 70, 90, 60, 30, 80, 100, 75, 45, 65, 85, 50, 95, 40, 70, 85, 30].map((h, i) => (
                      <div
                        key={i}
                        className="w-1 bg-[#38bdf8] rounded-full transition-all duration-150"
                        style={{
                          height: callStatus === 'connected' ? `${Math.max(20, (h * (pttActive || !isMuted ? 1 : 0.2)))}%` : '15%',
                          opacity: callStatus === 'connected' ? 0.9 : 0.3
                        }}
                      />
                    ))}
                  </div>

                  {/* Controls Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-700 text-xs">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsMuted((v) => !v)}
                        className={`px-2.5 py-1.5 rounded-lg font-semibold flex items-center gap-1 cursor-pointer ${
                          isMuted ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                        }`}
                      >
                        <span className="material-symbols-outlined text-base">
                          {isMuted ? 'mic_off' : 'mic'}
                        </span>
                        {isMuted ? 'Muted' : 'Mute Mic'}
                      </button>

                      {isRadioIntercom && (
                        <button
                          onMouseDown={() => setPttActive(true)}
                          onMouseUp={() => setPttActive(false)}
                          onTouchStart={() => setPttActive(true)}
                          onTouchEnd={() => setPttActive(false)}
                          className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 cursor-pointer select-none transition-all ${
                            pttActive
                              ? 'bg-amber-500 text-slate-900 ring-2 ring-amber-300'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                          }`}
                        >
                          <span className="material-symbols-outlined text-base">settings_voice</span>
                          {pttActive ? 'TRANSMITTING (PTT)' : 'Hold PTT to Broadcast'}
                        </button>
                      )}
                    </div>

                    {/* Quick Preset Transmission Chips */}
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                      <button
                        onClick={() => handleSendQuickTransmission('Sounding All-Units Station Bell Alarm. Turnout Immediate.')}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] font-semibold whitespace-nowrap cursor-pointer flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[13px] text-amber-400">notifications_active</span>
                        Sound Station Alarm
                      </button>
                      <button
                        onClick={() => handleSendQuickTransmission('Requesting 2 Backup Units to Stage at Incident Perimeter.')}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] font-semibold whitespace-nowrap cursor-pointer flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[13px] text-sky-400">local_police</span>
                        Request 2 Backup
                      </button>
                      <button
                        onClick={() => handleSendQuickTransmission('Pre-alert: Critical Inbound Patient, Prep Bay 1.')}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] font-semibold whitespace-nowrap cursor-pointer flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[13px] text-emerald-400">local_hospital</span>
                        Prep Trauma Bay
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Station Action Cards & Comms Log */}
              <div className="p-4 flex flex-col gap-4 text-left">
                {/* 1. CAD Relay Box for current incident */}
                {currentIncident && (
                  <div className="bg-[#fcf9f8] border border-[#e4beba] rounded-xl p-3.5 shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#af101a] text-lg">forward_to_inbox</span>
                        <h4 className="font-bold text-xs text-[#1b1c1c] uppercase tracking-wider">
                          Relay Active Incident ({currentIncident.code})
                        </h4>
                      </div>
                      <span className="text-[11px] font-semibold text-[#5b403d]">
                        Target: {selectedStation.badgeCode}
                      </span>
                    </div>

                    <div className="bg-white p-2.5 rounded-lg border border-[#e4beba] mb-3 text-xs">
                      <div className="flex justify-between font-bold text-[#1b1c1c] mb-1">
                        <span>{currentIncident.title}</span>
                        <span className="text-[#ba1a1a] uppercase">{currentIncident.urgency}</span>
                      </div>
                      <p className="text-[#5b403d] line-clamp-2">{currentIncident.description}</p>
                      <div className="mt-1.5 text-[11px] text-[#5b403d] font-data-tabular">
                        Location: <span className="font-semibold text-[#1b1c1c]">{currentIncident.locationName}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRelayCadIncident(selectedStation)}
                        className="flex-1 bg-[#0058a2] text-white py-2 px-3 rounded-lg text-xs font-bold hover:bg-[#004682] transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-base">send_and_archive</span>
                        Broadcast Incident to {selectedStation.badgeCode} CAD
                      </button>
                    </div>
                  </div>
                )}

                {/* 2. Station Fleet & Stationed Units Ready */}
                <div className="bg-white border border-[#e4beba] rounded-xl p-3.5 shadow-xs">
                  <h4 className="font-bold text-xs text-[#5b403d] uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>Stationed Response Units</span>
                    <span className="text-[#0058a2]">{selectedStation.stationedUnits.length} Total Units Assigned</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedStation.stationedUnits.map((unit, i) => (
                      <div
                        key={i}
                        className="p-2 bg-[#f6f3f2] rounded-lg border border-[#e4beba]/60 flex items-center justify-between text-xs"
                      >
                        <span className="font-semibold text-[#1b1c1c] flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#15803d]"></span>
                          {unit}
                        </span>
                        <span className="text-[10px] font-bold text-[#5b403d] px-1.5 py-0.5 bg-white rounded border border-[#e4beba]">
                          Ready
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Live Station Hotline & Terminal Message Feed */}
                <div className="bg-white border border-[#e4beba] rounded-xl shadow-xs flex flex-col min-h-[220px]">
                  <div className="p-3 border-b border-[#e4beba] bg-[#f6f3f2]/40 flex items-center justify-between">
                    <h4 className="font-bold text-xs text-[#5b403d] uppercase tracking-wider">
                      Station Dispatch Comms Feed
                    </h4>
                    <span className="text-[10px] text-[#5b403d] font-semibold font-data-tabular">
                      Frequency: {selectedStation.radioChannel}
                    </span>
                  </div>

                  <div className="p-3 flex-1 overflow-y-auto flex flex-col gap-2 max-h-[200px] text-xs">
                    {stationCallLog.length === 0 ? (
                      <div className="text-center py-6 text-[#5b403d] text-xs">
                        <span className="material-symbols-outlined text-2xl mb-1 text-[#8f6f6c]">headset_mic</span>
                        <p>No active dialogue recorded. Initiate a Hotline Call or Radio Patch above.</p>
                      </div>
                    ) : (
                      stationCallLog.map((log, idx) => (
                        <div key={idx} className="flex gap-2 text-left">
                          <div className="w-6 h-6 rounded-full bg-[#0058a2] text-white flex items-center justify-center shrink-0 text-[10px] font-bold">
                            {log.sender.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="bg-[#f6f3f2] p-2 rounded-lg rounded-tl-none border border-[#e4beba]/60 max-w-[85%]">
                            <span className="font-bold text-[11px] text-[#1b1c1c] block mb-0.5">
                              {log.sender} <span className="text-[10px] text-[#5b403d] font-normal">• {log.time}</span>
                            </span>
                            <p className="text-xs text-[#1b1c1c] leading-relaxed">{log.text}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Send Direct Message / Memo to Station */}
                  <form onSubmit={handleSendCustomMemo} className="p-2.5 border-t border-[#e4beba] bg-white flex gap-2">
                    <input
                      type="text"
                      value={memoText}
                      onChange={(e) => setMemoText(e.target.value)}
                      placeholder={`Message ${selectedStation.watchCommander}...`}
                      className="flex-1 bg-[#f6f3f2] border border-[#e4beba] rounded-lg px-3 py-1.5 text-xs text-[#1b1c1c] focus:outline-none focus:ring-1 focus:ring-[#af101a]"
                    />
                    <button
                      type="submit"
                      disabled={!memoText.trim()}
                      className="bg-[#af101a] text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-[#930010] transition-colors flex items-center gap-1 disabled:opacity-50 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">send</span> Send
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 text-center text-[#5b403d]">
              <div>
                <span className="material-symbols-outlined text-4xl mb-2 text-[#8f6f6c]">cell_tower</span>
                <h4 className="font-bold text-sm text-[#1b1c1c]">Select a Station</h4>
                <p className="text-xs">Choose a police precinct, fire station, or medical center from the list.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
