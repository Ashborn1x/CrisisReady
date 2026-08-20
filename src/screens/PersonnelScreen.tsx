import React, { useState } from 'react';
import { ResponderUnit, ScreenView } from '../types';

interface PersonnelScreenProps {
  responderUnits: ResponderUnit[];
  onUpdateUnitStatus: (unitId: string, status: ResponderUnit['status']) => void;
  onNavigate: (screen: ScreenView) => void;
}

export const PersonnelScreen: React.FC<PersonnelScreenProps> = ({
  responderUnits,
  onUpdateUnitStatus,
  onNavigate
}) => {
  const [filterType, setFilterType] = useState<string>('all');

  const filtered = responderUnits.filter((u) => {
    if (filterType === 'all') return true;
    return u.status === filterType;
  });

  return (
    <div className="flex-1 bg-white min-h-screen p-4 md:p-8 select-none text-left">
      <header className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#1b1c1c] tracking-tight">
            Personnel & Fleet Management
          </h1>
          <p className="text-sm text-[#5b403d] mt-1">
            Active dispatch units, field teams, and vehicle readiness.
          </p>
        </div>

        <div className="flex gap-2">
          {(['all', 'available', 'en_route', 'offline'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilterType(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize cursor-pointer transition-all ${
                filterType === st
                  ? 'bg-[#af101a] text-white shadow-xs'
                  : 'bg-[#f6f3f2] text-[#5b403d] hover:bg-[#eae7e7]'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </header>

      {/* Roster Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((unit) => (
          <div
            key={unit.id}
            className="bg-[#fcf9f8] border border-[#e4beba] rounded-xl p-4 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-base text-[#1b1c1c]">{unit.name}</h3>
                  <span className="text-xs font-semibold text-[#5b403d] font-data-tabular">
                    Callsign: {unit.callsign} • {unit.sector}
                  </span>
                </div>

                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    unit.status === 'available'
                      ? 'bg-[#d4e3ff] text-[#001c3a]'
                      : unit.status === 'en_route'
                      ? 'bg-[#ffdfa0] text-[#261a00]'
                      : 'bg-[#eae7e7] text-[#5b403d]'
                  }`}
                >
                  {unit.status.replace('_', ' ')}
                </span>
              </div>

              <div className="space-y-1 text-xs text-[#5b403d] font-data-tabular my-3 bg-white p-2.5 rounded-lg border border-[#e4beba]/60">
                <div className="flex justify-between">
                  <span>Radio/Phone:</span>
                  <span className="font-bold text-[#1b1c1c]">{unit.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span>Battery Level:</span>
                  <span className="font-bold text-[#1b1c1c]">{unit.battery}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Typical ETA:</span>
                  <span className="font-bold text-[#1b1c1c]">{unit.eta}</span>
                </div>
              </div>
            </div>

            {/* Quick Status Toggle */}
            <div className="pt-2 border-t border-[#e4beba] flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold text-[#5b403d] uppercase">Set Status:</span>
              <div className="flex gap-1.5">
                <button
                  onClick={() => onUpdateUnitStatus(unit.id, 'available')}
                  className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer ${
                    unit.status === 'available'
                      ? 'bg-[#0058a2] text-white'
                      : 'bg-[#eae7e7] text-[#5b403d] hover:bg-[#dcd9d9]'
                  }`}
                >
                  Avail
                </button>
                <button
                  onClick={() => onUpdateUnitStatus(unit.id, 'en_route')}
                  className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer ${
                    unit.status === 'en_route'
                      ? 'bg-[#795900] text-white'
                      : 'bg-[#eae7e7] text-[#5b403d] hover:bg-[#dcd9d9]'
                  }`}
                >
                  En Route
                </button>
                <button
                  onClick={() => onUpdateUnitStatus(unit.id, 'offline')}
                  className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer ${
                    unit.status === 'offline'
                      ? 'bg-[#303030] text-white'
                      : 'bg-[#eae7e7] text-[#5b403d] hover:bg-[#dcd9d9]'
                  }`}
                >
                  Offline
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
