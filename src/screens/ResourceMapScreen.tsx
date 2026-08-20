import React, { useState } from 'react';
import { Incident, ResponderUnit, ScreenView } from '../types';
import { MAP_TEXTURE_URL_CHICAGO, EMERGENCY_STATIONS } from '../data/mockData';
import { StationContactModal } from '../components/StationContactModal';

interface ResourceMapScreenProps {
  incidents: Incident[];
  responderUnits: ResponderUnit[];
  onSelectIncident: (incident: Incident) => void;
  onNavigate: (screen: ScreenView) => void;
}

export const ResourceMapScreen: React.FC<ResourceMapScreenProps> = ({
  incidents,
  responderUnits,
  onSelectIncident,
  onNavigate
}) => {
  const [activeLayer, setActiveLayer] = useState<'all' | 'units' | 'incidents' | 'stations'>('all');
  const [selectedUnit, setSelectedUnit] = useState<ResponderUnit | null>(null);
  const [isStationModalOpen, setIsStationModalOpen] = useState(false);
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);

  const handleOpenStationModal = (stationId: string) => {
    setSelectedStationId(stationId);
    setIsStationModalOpen(true);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#fcf9f8] relative select-none">
      {/* Station Contact Modal */}
      <StationContactModal
        isOpen={isStationModalOpen}
        onClose={() => setIsStationModalOpen(false)}
        initialStationId={selectedStationId}
      />

      {/* Top Filter Bar */}
      <div className="bg-white border-b border-[#e4beba] px-4 py-2.5 flex items-center justify-between z-20 shadow-xs flex-wrap gap-2 text-left">
        <div className="flex items-center gap-2">
          <span className="font-bold text-xs text-[#1b1c1c] uppercase tracking-wider flex items-center gap-1">
            <span className="material-symbols-outlined text-[#0058a2] text-lg">layers</span>
            Tactical GIS:
          </span>

          <div className="flex items-center gap-1 bg-[#f6f3f2] p-1 rounded-lg border border-[#e4beba]">
            <button
              onClick={() => setActiveLayer('all')}
              className={`px-2.5 py-1 rounded-md text-xs font-bold cursor-pointer ${
                activeLayer === 'all' ? 'bg-[#af101a] text-white' : 'text-[#5b403d] hover:bg-[#eae7e7]'
              }`}
            >
              All Assets ({incidents.length + responderUnits.length + EMERGENCY_STATIONS.length})
            </button>
            <button
              onClick={() => setActiveLayer('stations')}
              className={`px-2.5 py-1 rounded-md text-xs font-bold cursor-pointer ${
                activeLayer === 'stations' ? 'bg-[#7e22ce] text-white' : 'text-[#5b403d] hover:bg-[#eae7e7]'
              }`}
            >
              Stations ({EMERGENCY_STATIONS.length})
            </button>
            <button
              onClick={() => setActiveLayer('incidents')}
              className={`px-2.5 py-1 rounded-md text-xs font-bold cursor-pointer ${
                activeLayer === 'incidents' ? 'bg-[#ba1a1a] text-white' : 'text-[#5b403d] hover:bg-[#eae7e7]'
              }`}
            >
              Emergencies ({incidents.length})
            </button>
            <button
              onClick={() => setActiveLayer('units')}
              className={`px-2.5 py-1 rounded-md text-xs font-bold cursor-pointer ${
                activeLayer === 'units' ? 'bg-[#0058a2] text-white' : 'text-[#5b403d] hover:bg-[#eae7e7]'
              }`}
            >
              Units ({responderUnits.length})
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-semibold text-[#5b403d]">
          <button
            onClick={() => {
              setSelectedStationId(null);
              setIsStationModalOpen(true);
            }}
            className="bg-[#af101a] text-white px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs hover:bg-[#930010] cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">cell_tower</span>
            Station Hotlines
          </button>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ba1a1a]"></span> Incidents
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0058a2]"></span> Units
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#7e22ce]"></span> Stations
          </span>
        </div>
      </div>

      {/* Map Body */}
      <div className="flex-1 relative bg-[#eae7e7] overflow-hidden">
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center"
          style={{ backgroundImage: `url(${MAP_TEXTURE_URL_CHICAGO})` }}
        >
          {/* Emergency Stations Layer */}
          {(activeLayer === 'all' || activeLayer === 'stations') &&
            EMERGENCY_STATIONS.map((station, i) => {
              let sTop = `${20 + i * 11}%`;
              let sLeft = `${16 + i * 13}%`;
              if (station.id === 'stn-fire-42') {
                sTop = '52%';
                sLeft = '35%';
              } else if (station.id === 'stn-police-01') {
                sTop = '40%';
                sLeft = '68%';
              } else if (station.id === 'stn-hospital-mgh') {
                sTop = '68%';
                sLeft = '75%';
              }

              return (
                <div
                  key={station.id}
                  onClick={() => handleOpenStationModal(station.id)}
                  className="absolute flex flex-col items-center cursor-pointer group -translate-x-1/2 -translate-y-1/2 z-25 hover:scale-115 transition-transform"
                  style={{ top: sTop, left: sLeft }}
                >
                  <div className="bg-[#1b1c1c] text-white px-2 py-0.5 rounded shadow-sm border border-slate-700 text-[9px] font-bold whitespace-nowrap mb-0.5 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]"></span>
                    {station.badgeCode}
                  </div>
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-md border-2 border-white text-white ${
                      station.type === 'police'
                        ? 'bg-[#0058a2]'
                        : station.type === 'fire'
                        ? 'bg-[#ba1a1a]'
                        : station.type === 'hospital' || station.type === 'ems'
                        ? 'bg-[#0284c7]'
                        : 'bg-[#7e22ce]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[15px]">
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

          {/* Incidents Layer */}
          {(activeLayer === 'all' || activeLayer === 'incidents') &&
            incidents.map((inc, i) => (
              <div
                key={inc.id}
                onClick={() => {
                  onSelectIncident(inc);
                  onNavigate('dispatcher_dashboard');
                }}
                className="absolute flex flex-col items-center cursor-pointer group -translate-x-1/2 -translate-y-1/2 z-20 hover:scale-110 transition-transform"
                style={{
                  top: `${30 + (i % 3) * 22}%`,
                  left: `${25 + (i % 4) * 20}%`
                }}
              >
                <div className="bg-white px-2 py-0.5 rounded shadow-sm border border-[#e4beba] text-[10px] font-bold text-[#1b1c1c] mb-1">
                  {inc.code}
                </div>
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center shadow-lg border-2 border-white text-white ${
                    inc.urgency === 'critical' ? 'bg-[#ba1a1a] animate-pulse' : 'bg-[#fec330] text-[#6f5100]'
                  }`}
                >
                  <span className="material-symbols-outlined text-lg icon-filled">
                    {inc.type === 'fire' ? 'local_fire_department' : inc.type === 'medical' ? 'local_hospital' : 'car_crash'}
                  </span>
                </div>
              </div>
            ))}

          {/* Responder Units Layer */}
          {(activeLayer === 'all' || activeLayer === 'units') &&
            responderUnits.map((unit, i) => (
              <div
                key={unit.id}
                onClick={() => setSelectedUnit(unit)}
                className="absolute flex flex-col items-center cursor-pointer group -translate-x-1/2 -translate-y-1/2 z-20 hover:scale-110 transition-transform"
                style={{
                  top: `${42 + (i % 2) * 26}%`,
                  left: `${38 + (i % 3) * 22}%`
                }}
              >
                <div className="bg-[#1b1c1c] text-white px-2 py-0.5 rounded text-[10px] font-bold mb-1 shadow-xs">
                  {unit.callsign}
                </div>
                <div className="w-8 h-8 rounded-lg bg-[#0058a2] text-white flex items-center justify-center shadow-md border-2 border-white">
                  <span className="material-symbols-outlined text-base">directions_car</span>
                </div>
              </div>
            ))}
        </div>

        {/* Selected Unit Flyout */}
        {selectedUnit && (
          <div className="absolute bottom-4 left-4 bg-white border border-[#e4beba] rounded-xl p-4 shadow-lg z-30 max-w-sm w-full text-left">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-bold text-sm text-[#1b1c1c]">{selectedUnit.name}</h3>
                <p className="text-xs text-[#5b403d] font-data-tabular">
                  Callsign: {selectedUnit.callsign} • Sector: {selectedUnit.sector}
                </p>
              </div>
              <button
                onClick={() => setSelectedUnit(null)}
                className="text-[#5b403d] hover:text-[#1b1c1c] text-xs cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-data-tabular mt-2 pt-2 border-t border-[#e4beba]">
              <div>Status: <span className="font-bold uppercase text-[#0058a2]">{selectedUnit.status}</span></div>
              <div>Battery: <span className="font-bold text-[#1b1c1c]">{selectedUnit.battery}%</span></div>
              <div>Direct: <span className="font-bold text-[#1b1c1c]">{selectedUnit.phone}</span></div>
              <div>ETA: <span className="font-bold text-[#ba1a1a]">{selectedUnit.eta}</span></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
