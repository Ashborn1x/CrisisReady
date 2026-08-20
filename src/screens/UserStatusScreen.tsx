import React, { useState } from 'react';
import { Incident, ScreenView } from '../types';

interface UserStatusScreenProps {
  incidents: Incident[];
  onNavigate: (screen: ScreenView) => void;
  onAddCommsMessage: (incidentId: string, text: string) => void;
}

export const UserStatusScreen: React.FC<UserStatusScreenProps> = ({
  incidents,
  onNavigate,
  onAddCommsMessage
}) => {
  const [citizenNote, setCitizenNote] = useState('');

  // Active citizen report (latest active or pending)
  const activeReport = incidents.find((i) => i.status !== 'resolved') || incidents[0];

  const handleSendCitizenUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!citizenNote.trim() || !activeReport) return;

    onAddCommsMessage(activeReport.id, `[Citizen Caller Update]: ${citizenNote.trim()}`);
    setCitizenNote('');
  };

  const getStageStep = (stage: number) => {
    const steps = [
      { num: 1, label: 'Report Received', desc: 'CAD 911 triaged' },
      { num: 2, label: 'Units Dispatched', desc: 'Station crews rolling' },
      { num: 3, label: 'Responders On Scene', desc: 'Field team active' },
      { num: 4, label: 'Assistance Complete', desc: 'Area secured' }
    ];
    return steps;
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#fcf9f8] select-none overflow-y-auto no-scrollbar p-4 md:p-6">
      <div className="max-w-3xl mx-auto w-full flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ffdad6] text-[#93000a] uppercase tracking-wider">
              Citizen Emergency Status
            </span>
            <h2 className="text-xl font-bold text-[#1b1c1c] mt-1">Live Emergency Tracker</h2>
          </div>
          <button
            onClick={() => onNavigate('home')}
            className="text-xs font-bold text-[#af101a] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">home</span> SOS Home
          </button>
        </div>

        {activeReport ? (
          <div className="bg-white border border-[#e4beba] rounded-2xl p-5 md:p-6 shadow-xs flex flex-col gap-5">
            {/* Incident Title & Code */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold font-data-tabular text-[#af101a]">{activeReport.code}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      activeReport.urgency === 'critical'
                        ? 'bg-[#ffdad6] text-[#93000a]'
                        : 'bg-[#ffedd5] text-[#9a3412]'
                    }`}
                  >
                    {activeReport.urgency} Priority
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[#1b1c1c]">{activeReport.title}</h3>
                <p className="text-xs text-[#5b403d] mt-0.5 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm text-[#795900]">location_on</span>
                  {activeReport.locationName}
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-[#5b403d] block uppercase font-bold">Assigned Unit</span>
                <span className="text-xs font-bold text-[#0058a2] block">
                  {activeReport.assignedUnitName || 'Dispatching Nearest Unit...'}
                </span>
              </div>
            </div>

            {/* Live Progress Stepper */}
            <div className="pt-3 border-t border-[#e4beba]">
              <div className="grid grid-cols-4 gap-2">
                {getStageStep(activeReport.stage).map((st) => {
                  const isDone = activeReport.stage >= st.num;
                  const isCurrent = activeReport.stage === st.num;
                  return (
                    <div key={st.num} className="flex flex-col items-center text-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mb-1.5 transition-all ${
                          isDone
                            ? 'bg-[#af101a] text-white shadow-xs'
                            : 'bg-[#f0eded] text-[#5b403d] border border-[#e4beba]'
                        } ${isCurrent ? 'ring-4 ring-[#ffdad6]' : ''}`}
                      >
                        {isDone ? <span className="material-symbols-outlined text-sm">check</span> : st.num}
                      </div>
                      <span className="text-[11px] font-bold text-[#1b1c1c] leading-tight block">{st.label}</span>
                      <span className="text-[9px] text-[#5b403d] hidden sm:block">{st.desc}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Live Dispatch Comms Feed for Citizen */}
            <div className="bg-[#fcf9f8] p-4 rounded-xl border border-[#e4beba] flex flex-col gap-2">
              <span className="text-xs font-bold text-[#5b403d] uppercase tracking-wider block">
                Official Dispatch Instructions & Updates
              </span>

              <div className="flex flex-col gap-2 max-h-48 overflow-y-auto no-scrollbar">
                {activeReport.commsLog.map((c) => (
                  <div key={c.id} className="bg-white p-2.5 rounded-lg border border-[#e4beba]/80 text-xs">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-bold text-[#1b1c1c]">{c.sender}</span>
                      <span className="text-[10px] text-[#5b403d] font-data-tabular">{c.time}</span>
                    </div>
                    <p className="text-[#5b403d]">{c.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Citizen Additional SITREP message box */}
            <form onSubmit={handleSendCitizenUpdate} className="flex gap-2">
              <input
                type="text"
                value={citizenNote}
                onChange={(e) => setCitizenNote(e.target.value)}
                placeholder="Send additional info (e.g. entry code, exact door, injuries)..."
                className="flex-1 bg-[#f6f3f2] border border-[#e4beba] rounded-xl px-3 py-2 text-xs text-[#1b1c1c] focus:outline-none focus:ring-1 focus:ring-[#af101a]"
              />
              <button
                type="submit"
                disabled={!citizenNote.trim()}
                className="bg-[#af101a] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#930010] transition-colors flex items-center gap-1 disabled:opacity-50 cursor-pointer shadow-xs"
              >
                <span className="material-symbols-outlined text-sm">send</span> Update 911
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-white border border-[#e4beba] rounded-2xl p-8 text-center">
            <span className="material-symbols-outlined text-4xl text-[#15803d] mb-2">verified</span>
            <h3 className="font-bold text-base text-[#1b1c1c]">No Active Emergency Reports</h3>
            <p className="text-xs text-[#5b403d] mt-1 mb-4">You have no pending emergency dispatches active right now.</p>
            <button
              onClick={() => onNavigate('report_new')}
              className="bg-[#af101a] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#930010] cursor-pointer"
            >
              Report Emergency Incident
            </button>
          </div>
        )}

        {/* First Aid & Safety Card */}
        <div className="bg-[#f6f3f2] border border-[#e4beba] rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-white text-[#ba1a1a] flex items-center justify-center border border-[#e4beba] shadow-xs">
              <span className="material-symbols-outlined text-2xl">medical_services</span>
            </span>
            <div>
              <h4 className="font-bold text-xs text-[#1b1c1c]">Need Immediate First Aid Guidance?</h4>
              <p className="text-[11px] text-[#5b403d]">Step-by-step CPR, bleeding control, and burn protocols</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('home')}
            className="px-3 py-1.5 bg-white border border-[#e4beba] rounded-lg text-xs font-bold text-[#af101a] hover:bg-[#eae7e7] cursor-pointer"
          >
            Open Guides
          </button>
        </div>
      </div>
    </div>
  );
};
