import React, { useState, useEffect } from 'react';
import { EmergencyStation, Incident, ResponderUnit, ScreenView } from '../types';
import { EMERGENCY_STATIONS } from '../data/mockData';

interface StationDeskScreenProps {
  incidents: Incident[];
  responderUnits: ResponderUnit[];
  onNavigate: (screen: ScreenView) => void;
  onAddCommsMessage: (incidentId: string, text: string) => void;
  onUpdateUnitStatus: (unitId: string, status: ResponderUnit['status']) => void;
}

export const StationDeskScreen: React.FC<StationDeskScreenProps> = ({
  incidents,
  responderUnits,
  onNavigate,
  onAddCommsMessage,
  onUpdateUnitStatus
}) => {
  const [selectedStationId, setSelectedStationId] = useState<string>(EMERGENCY_STATIONS[0].id);
  const [stationRoster, setStationRoster] = useState<EmergencyStation[]>(EMERGENCY_STATIONS);
  const [activeTab, setActiveTab] = useState<'dispatches' | 'fleet' | 'intercom' | 'log'>('dispatches');
  const [isAlarmSounding, setIsAlarmSounding] = useState<boolean>(false);
  const [acknowledgedIncidents, setAcknowledgedIncidents] = useState<Record<string, boolean>>({});
  const [intercomConnected, setIntercomConnected] = useState<boolean>(false);
  const [intercomMode, setIntercomMode] = useState<'hotline' | 'radio'>('hotline');
  const [intercomTimer, setIntercomTimer] = useState<number>(0);
  const [deskCommsText, setDeskCommsText] = useState<string>('');
  const [deskCommsLog, setDeskCommsLog] = useState<{ sender: string; text: string; time: string }[]>([
    {
      sender: 'Central CAD Dispatch',
      text: 'Morning briefing: Sector 3 industrial alerts active. Keep engine crews staged.',
      time: '08:00'
    }
  ]);

  const currentStation = stationRoster.find((s) => s.id === selectedStationId) || stationRoster[0];

  // Incidents relevant to this station type or sector
  const relevantIncidents = incidents.filter((inc) => {
    if (currentStation.type === 'fire') return inc.type === 'fire' || inc.type === 'accident';
    if (currentStation.type === 'police') return inc.type === 'police' || inc.type === 'accident' || inc.type === 'other';
    if (currentStation.type === 'hospital' || currentStation.type === 'ems') return inc.type === 'medical' || inc.type === 'accident';
    return true;
  });

  // Station fleet units
  const stationUnits = responderUnits.filter((u) => {
    return currentStation.stationedUnits.some((sUnit) => sUnit.toLowerCase().includes(u.name.toLowerCase()) || u.name.toLowerCase().includes(sUnit.toLowerCase()));
  });

  // Timer for active intercom call
  useEffect(() => {
    let interval: any;
    if (intercomConnected) {
      interval = setInterval(() => {
        setIntercomTimer((t) => t + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [intercomConnected]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleToggleAlarm = () => {
    setIsAlarmSounding((prev) => !prev);
  };

  const handleAcknowledgeIncident = (inc: Incident) => {
    setAcknowledgedIncidents((prev) => ({ ...prev, [inc.id]: true }));
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Add to station desk log
    setDeskCommsLog((prev) => [
      ...prev,
      {
        sender: currentStation.watchCommander,
        text: `Acknowledged CAD dispatch ${inc.code} (${inc.title}). Station turnout bell sounded. Crew rolling.`,
        time
      }
    ]);

    // Send to central CAD comms log
    onAddCommsMessage(
      inc.id,
      `[STATION ACKNOWLEDGED: ${currentStation.badgeCode}] ${currentStation.name} watch desk acknowledged dispatch. Turnout crews mobilized.`
    );
  };

  const handleSendDeskMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deskCommsText.trim()) return;
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setDeskCommsLog((prev) => [
      ...prev,
      {
        sender: `${currentStation.badgeCode} Desk`,
        text: deskCommsText.trim(),
        time
      }
    ]);

    // If attached to active incident
    if (relevantIncidents.length > 0) {
      onAddCommsMessage(
        relevantIncidents[0].id,
        `[STATION TRANSMISSION: ${currentStation.badgeCode}] "${deskCommsText.trim()}"`
      );
    }

    setDeskCommsText('');
  };

  const handleToggleStationStatus = (newStatus: EmergencyStation['status']) => {
    setStationRoster((prev) =>
      prev.map((st) => (st.id === currentStation.id ? { ...st, status: newStatus } : st))
    );
  };

  const getStationTypeIcon = (type: string) => {
    switch (type) {
      case 'police': return 'local_police';
      case 'fire': return 'local_fire_department';
      case 'hospital': return 'local_hospital';
      case 'ems': return 'medical_services';
      case 'emergency_desk': return 'domain';
      default: return 'cell_tower';
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#fcf9f8] select-none overflow-hidden">
      {/* STATION SELECTION STRIP & WATCH COMMANDER BANNER */}
      <div className="bg-white border-b border-[#e4beba] px-4 py-3 shrink-0 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Station Selector Dropdown / Pills */}
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0 ${
                currentStation.type === 'police'
                  ? 'bg-[#0058a2]'
                  : currentStation.type === 'fire'
                  ? 'bg-[#ba1a1a]'
                  : currentStation.type === 'hospital'
                  ? 'bg-[#0284c7]'
                  : 'bg-[#7e22ce]'
              }`}
            >
              <span className="material-symbols-outlined text-2xl">{getStationTypeIcon(currentStation.type)}</span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#f0eded] text-[#5b403d] border border-[#e4beba] uppercase tracking-wider">
                  Station Desk Portal
                </span>
                <span className="text-xs font-bold text-[#af101a] font-data-tabular">
                  {currentStation.badgeCode}
                </span>
              </div>

              {/* Station Picker Dropdown */}
              <div className="flex items-center gap-2 mt-0.5">
                <select
                  value={selectedStationId}
                  onChange={(e) => setSelectedStationId(e.target.value)}
                  className="font-bold text-base text-[#1b1c1c] bg-transparent border-b border-dashed border-[#e4beba] focus:outline-none focus:border-[#af101a] cursor-pointer"
                >
                  {stationRoster.map((station) => (
                    <option key={station.id} value={station.id}>
                      {station.name} ({station.badgeCode})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Quick Station Stats & Alarm Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Alarm Siren Trigger Button */}
            <button
              onClick={handleToggleAlarm}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                isAlarmSounding
                  ? 'bg-[#ba1a1a] text-white animate-bounce ring-4 ring-[#ffdad6]'
                  : 'bg-[#ffdad6] text-[#93000a] border border-[#ba1a1a]/30 hover:bg-[#ffdad6]/80'
              }`}
            >
              <span className="material-symbols-outlined text-base">
                {isAlarmSounding ? 'notifications_active' : 'notifications'}
              </span>
              <span>{isAlarmSounding ? 'TURNOUT ALARM RINGING' : 'Sound Station Bell'}</span>
            </button>

            {/* Station Readiness Status Pill */}
            <div className="flex items-center bg-[#f6f3f2] p-1 rounded-xl border border-[#e4beba] text-xs">
              <button
                onClick={() => handleToggleStationStatus('operational')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  currentStation.status === 'operational'
                    ? 'bg-[#15803d] text-white shadow-xs'
                    : 'text-[#5b403d] hover:bg-[#eae7e7]'
                }`}
              >
                Operational
              </button>
              <button
                onClick={() => handleToggleStationStatus('alerted')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  currentStation.status === 'alerted'
                    ? 'bg-[#ba1a1a] text-white shadow-xs'
                    : 'text-[#5b403d] hover:bg-[#eae7e7]'
                }`}
              >
                Alerted
              </button>
              <button
                onClick={() => handleToggleStationStatus('standby')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  currentStation.status === 'standby'
                    ? 'bg-[#d97706] text-white shadow-xs'
                    : 'text-[#5b403d] hover:bg-[#eae7e7]'
                }`}
              >
                Standby
              </button>
            </div>

            {/* Intercom Call to Central CAD */}
            <button
              onClick={() => {
                setIntercomConnected((v) => !v);
                setIntercomTimer(0);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                intercomConnected
                  ? 'bg-[#0058a2] text-white ring-2 ring-[#a5c8ff]'
                  : 'bg-[#1b1c1c] text-white hover:bg-[#333]'
              }`}
            >
              <span className="material-symbols-outlined text-base">
                {intercomConnected ? 'phone_in_talk' : 'cell_tower'}
              </span>
              <span>{intercomConnected ? `CAD Link (${formatTimer(intercomTimer)})` : 'Patch Central CAD'}</span>
            </button>
          </div>
        </div>

        {/* Station Metadata Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2.5 mt-2.5 border-t border-[#e4beba]/70 text-xs">
          <div className="bg-[#fcf9f8] p-2 rounded-lg border border-[#e4beba]">
            <span className="text-[10px] text-[#5b403d] uppercase font-bold block">Watch Commander</span>
            <span className="font-semibold text-[#1b1c1c] truncate block">{currentStation.watchCommander}</span>
          </div>
          <div className="bg-[#fcf9f8] p-2 rounded-lg border border-[#e4beba]">
            <span className="text-[10px] text-[#5b403d] uppercase font-bold block">Jurisdiction Sector</span>
            <span className="font-semibold text-[#1b1c1c] truncate block">{currentStation.sector}</span>
          </div>
          <div className="bg-[#fcf9f8] p-2 rounded-lg border border-[#e4beba]">
            <span className="text-[10px] text-[#5b403d] uppercase font-bold block">TAC Radio Frequency</span>
            <span className="font-semibold text-[#0058a2] font-data-tabular block">{currentStation.radioChannel}</span>
          </div>
          <div className="bg-[#fcf9f8] p-2 rounded-lg border border-[#e4beba]">
            <span className="text-[10px] text-[#5b403d] uppercase font-bold block">Avg Response Lead</span>
            <span className="font-bold text-[#ba1a1a] block">{currentStation.responseLeadTime}</span>
          </div>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="bg-white border-b border-[#e4beba] px-4 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
        <button
          onClick={() => setActiveTab('dispatches')}
          className={`py-2.5 px-3 border-b-2 font-bold text-xs flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'dispatches'
              ? 'border-[#af101a] text-[#af101a]'
              : 'border-transparent text-[#5b403d] hover:text-[#1b1c1c]'
          }`}
        >
          <span className="material-symbols-outlined text-base">emergency_share</span>
          Inbound CAD Relays ({relevantIncidents.length})
        </button>

        <button
          onClick={() => setActiveTab('fleet')}
          className={`py-2.5 px-3 border-b-2 font-bold text-xs flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'fleet'
              ? 'border-[#af101a] text-[#af101a]'
              : 'border-transparent text-[#5b403d] hover:text-[#1b1c1c]'
          }`}
        >
          <span className="material-symbols-outlined text-base">local_shipping</span>
          Station Apparatus & Fleet ({currentStation.stationedUnits.length})
        </button>

        <button
          onClick={() => setActiveTab('intercom')}
          className={`py-2.5 px-3 border-b-2 font-bold text-xs flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'intercom'
              ? 'border-[#af101a] text-[#af101a]'
              : 'border-transparent text-[#5b403d] hover:text-[#1b1c1c]'
          }`}
        >
          <span className="material-symbols-outlined text-base">podcasts</span>
          Station Intercom & CAD Comms ({deskCommsLog.length})
        </button>

        <button
          onClick={() => setActiveTab('log')}
          className={`py-2.5 px-3 border-b-2 font-bold text-xs flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'log'
              ? 'border-[#af101a] text-[#af101a]'
              : 'border-transparent text-[#5b403d] hover:text-[#1b1c1c]'
          }`}
        >
          <span className="material-symbols-outlined text-base">menu_book</span>
          Station Log & Roster
        </button>
      </div>

      {/* MAIN TAB CONTENT */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-4 md:p-6">
        {/* TAB 1: INBOUND CAD RELAYS & DISPATCHES */}
        {activeTab === 'dispatches' && (
          <div className="max-w-5xl mx-auto flex flex-col gap-4">
            {/* Alarm banner if ringing */}
            {isAlarmSounding && (
              <div className="bg-[#ffdad6] border-2 border-[#ba1a1a] p-4 rounded-xl flex items-center justify-between text-[#93000a] animate-pulse">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-3xl">notifications_active</span>
                  <div>
                    <h4 className="font-bold text-sm">STATION TURNOUT ALARM ENGAGED</h4>
                    <p className="text-xs">All on-duty apparatus crew report to bay staging immediately.</p>
                  </div>
                </div>
                <button
                  onClick={handleToggleAlarm}
                  className="px-3 py-1.5 bg-[#ba1a1a] text-white rounded-lg text-xs font-bold hover:bg-[#930010] cursor-pointer"
                >
                  Silence Bell
                </button>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-[#1b1c1c]">Active Central CAD Broadcasts</h3>
                <p className="text-xs text-[#5b403d]">Direct dispatches transmitted to {currentStation.badgeCode} terminal</p>
              </div>
              <span className="text-xs font-semibold text-[#0058a2] bg-[#d4e3ff] px-2.5 py-1 rounded-full">
                Auto-Syncing with 911 CAD
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {relevantIncidents.map((inc) => {
                const isAck = acknowledgedIncidents[inc.id];
                return (
                  <div
                    key={inc.id}
                    className={`bg-white border rounded-xl p-4 shadow-xs flex flex-col justify-between transition-all ${
                      isAck ? 'border-[#86efac] bg-[#fcfdfc]' : 'border-[#e4beba] hover:border-[#af101a]'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-data-tabular ${
                              inc.urgency === 'critical'
                                ? 'bg-[#ffdad6] text-[#93000a]'
                                : inc.urgency === 'high'
                                ? 'bg-[#ffedd5] text-[#9a3412]'
                                : 'bg-[#e0f2fe] text-[#0369a1]'
                            }`}
                          >
                            {inc.urgency}
                          </span>
                          <span className="text-xs font-bold text-[#5b403d] font-data-tabular">{inc.code}</span>
                        </div>

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            isAck ? 'bg-[#dcfce7] text-[#15803d]' : 'bg-[#fef08a] text-[#854d0e]'
                          }`}
                        >
                          {isAck ? 'Acknowledged' : 'Pending Turnout'}
                        </span>
                      </div>

                      <h4 className="font-bold text-sm text-[#1b1c1c] mb-1">{inc.title}</h4>
                      <p className="text-xs text-[#5b403d] mb-2 leading-relaxed line-clamp-2">{inc.description}</p>

                      <div className="flex items-center gap-1.5 text-xs text-[#5b403d] mb-3 font-data-tabular">
                        <span className="material-symbols-outlined text-[15px] text-[#795900]">location_on</span>
                        <span className="truncate font-medium">{inc.locationName}</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#e4beba]/70 flex items-center justify-between gap-2">
                      <button
                        onClick={() => onNavigate('dispatcher_dashboard')}
                        className="px-3 py-1.5 rounded-lg border border-[#e4beba] text-xs font-semibold text-[#5b403d] hover:bg-[#f6f3f2] cursor-pointer"
                      >
                        View in CAD
                      </button>

                      {isAck ? (
                        <span className="text-xs font-bold text-[#15803d] flex items-center gap-1">
                          <span className="material-symbols-outlined text-base">check_circle</span>
                          Crews Mobilized
                        </span>
                      ) : (
                        <button
                          onClick={() => handleAcknowledgeIncident(inc)}
                          className="bg-[#af101a] text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-[#930010] transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                        >
                          <span className="material-symbols-outlined text-base">check</span>
                          Acknowledge & Turnout
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: STATION APPARATUS & FLEET */}
        {activeTab === 'fleet' && (
          <div className="max-w-5xl mx-auto flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-[#1b1c1c]">Station Apparatus & Apparatus Bay</h3>
                <p className="text-xs text-[#5b403d]">Vehicles, crew assignments and live status for {currentStation.name}</p>
              </div>
              <span className="text-xs font-bold text-[#15803d] bg-[#dcfce7] px-2.5 py-1 rounded-full">
                {currentStation.stationedUnits.length} Vehicles Assigned
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {currentStation.stationedUnits.map((unitName, i) => {
                const matchedUnit = responderUnits.find(
                  (u) => u.name.toLowerCase().includes(unitName.toLowerCase()) || unitName.toLowerCase().includes(u.name.toLowerCase())
                );
                const currentUnitStatus = matchedUnit ? matchedUnit.status : 'available';

                return (
                  <div key={i} className="bg-white border border-[#e4beba] rounded-xl p-4 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="w-8 h-8 rounded-lg bg-[#f0eded] text-[#0058a2] flex items-center justify-center">
                          <span className="material-symbols-outlined text-lg">local_shipping</span>
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            currentUnitStatus === 'available'
                              ? 'bg-[#dcfce7] text-[#15803d]'
                              : currentUnitStatus === 'en_route'
                              ? 'bg-[#ffdad6] text-[#93000a]'
                              : currentUnitStatus === 'on_scene'
                              ? 'bg-[#e0f2fe] text-[#0369a1]'
                              : 'bg-[#f0eded] text-[#5b403d]'
                          }`}
                        >
                          {currentUnitStatus.replace('_', ' ')}
                        </span>
                      </div>

                      <h4 className="font-bold text-sm text-[#1b1c1c] mb-1">{unitName}</h4>
                      <p className="text-xs text-[#5b403d] mb-3">
                        Station Bay #{i + 1} • Radio Tag: {currentStation.badgeCode}-U{i + 1}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-[#e4beba]/60 flex items-center justify-between gap-1">
                      {matchedUnit && (
                        <>
                          <button
                            onClick={() => onUpdateUnitStatus(matchedUnit.id, 'available')}
                            className={`px-2 py-1 rounded text-[11px] font-bold cursor-pointer ${
                              currentUnitStatus === 'available' ? 'bg-[#15803d] text-white' : 'bg-[#f6f3f2] text-[#5b403d] hover:bg-[#eae7e7]'
                            }`}
                          >
                            Ready
                          </button>
                          <button
                            onClick={() => onUpdateUnitStatus(matchedUnit.id, 'en_route')}
                            className={`px-2 py-1 rounded text-[11px] font-bold cursor-pointer ${
                              currentUnitStatus === 'en_route' ? 'bg-[#ba1a1a] text-white' : 'bg-[#f6f3f2] text-[#5b403d] hover:bg-[#eae7e7]'
                            }`}
                          >
                            Roll Out
                          </button>
                          <button
                            onClick={() => onUpdateUnitStatus(matchedUnit.id, 'offline')}
                            className={`px-2 py-1 rounded text-[11px] font-bold cursor-pointer ${
                              currentUnitStatus === 'offline' ? 'bg-[#64748b] text-white' : 'bg-[#f6f3f2] text-[#5b403d] hover:bg-[#eae7e7]'
                            }`}
                          >
                            Maint
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: STATION INTERCOM & CAD COMMS */}
        {activeTab === 'intercom' && (
          <div className="max-w-4xl mx-auto flex flex-col gap-4">
            <div className="bg-white border border-[#e4beba] rounded-xl shadow-xs overflow-hidden flex flex-col h-[500px]">
              {/* Intercom HUD Header */}
              <div className="p-3 bg-[#0f172a] text-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${intercomConnected ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`}></span>
                  <div>
                    <h4 className="font-bold text-xs text-white">Central 911 CAD Dispatch Hotline</h4>
                    <span className="text-[10px] text-slate-300 font-data-tabular">Channel: {currentStation.radioChannel}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs bg-slate-800 px-2.5 py-1 rounded font-mono text-emerald-400">
                    {intercomConnected ? `ACTIVE: ${formatTimer(intercomTimer)}` : 'STANDBY'}
                  </span>
                </div>
              </div>

              {/* Message Feed */}
              <div className="flex-1 p-4 overflow-y-auto no-scrollbar flex flex-col gap-3 bg-[#fcf9f8]">
                {deskCommsLog.map((log, idx) => (
                  <div key={idx} className="flex gap-2.5 text-left text-xs">
                    <div className="w-7 h-7 rounded-full bg-[#af101a] text-white flex items-center justify-center shrink-0 text-[10px] font-bold">
                      {log.sender.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="bg-white p-3 rounded-xl rounded-tl-none border border-[#e4beba] max-w-[80%] shadow-xs">
                      <span className="font-bold text-xs text-[#1b1c1c] block mb-0.5">
                        {log.sender} <span className="text-[10px] text-[#5b403d] font-normal">• {log.time}</span>
                      </span>
                      <p className="text-xs text-[#1b1c1c] leading-relaxed">{log.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input Bar */}
              <form onSubmit={handleSendDeskMessage} className="p-3 bg-white border-t border-[#e4beba] flex gap-2">
                <input
                  type="text"
                  value={deskCommsText}
                  onChange={(e) => setDeskCommsText(e.target.value)}
                  placeholder={`Transmit message to CAD Dispatch as ${currentStation.watchCommander}...`}
                  className="flex-1 bg-[#f6f3f2] border border-[#e4beba] rounded-lg px-3 py-2 text-xs text-[#1b1c1c] focus:outline-none focus:ring-1 focus:ring-[#af101a]"
                />
                <button
                  type="submit"
                  disabled={!deskCommsText.trim()}
                  className="bg-[#af101a] text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#930010] transition-colors flex items-center gap-1 disabled:opacity-50 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">send</span> Transmit
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 4: STATION LOG & ROSTER */}
        {activeTab === 'log' && (
          <div className="max-w-5xl mx-auto flex flex-col gap-4">
            <div className="bg-white border border-[#e4beba] rounded-xl p-5 shadow-xs">
              <h3 className="font-bold text-base text-[#1b1c1c] mb-1">Station Watch Commander Log</h3>
              <p className="text-xs text-[#5b403d] mb-4">Official daily ledger for {currentStation.name}</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                <div className="bg-[#fcf9f8] p-3 rounded-lg border border-[#e4beba]">
                  <span className="text-xs text-[#5b403d] block font-bold">Shift Turnouts Today</span>
                  <span className="text-2xl font-bold text-[#af101a] font-data-tabular">7 Calls</span>
                </div>
                <div className="bg-[#fcf9f8] p-3 rounded-lg border border-[#e4beba]">
                  <span className="text-xs text-[#5b403d] block font-bold">Avg En-Route Turnout</span>
                  <span className="text-2xl font-bold text-[#15803d] font-data-tabular">1m 42s</span>
                </div>
                <div className="bg-[#fcf9f8] p-3 rounded-lg border border-[#e4beba]">
                  <span className="text-xs text-[#5b403d] block font-bold">On-Duty Personnel</span>
                  <span className="text-2xl font-bold text-[#0058a2] font-data-tabular">14 Staff</span>
                </div>
              </div>

              <div className="border-t border-[#e4beba] pt-4">
                <h4 className="font-bold text-xs text-[#5b403d] uppercase tracking-wider mb-2">Station Capabilities & Notes</h4>
                <p className="text-xs text-[#1b1c1c] leading-relaxed bg-[#f6f3f2] p-3 rounded-lg border border-[#e4beba]/60">
                  {currentStation.notes || 'Full multi-agency response capacity equipped with direct high-priority telemetry to Central CAD.'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
