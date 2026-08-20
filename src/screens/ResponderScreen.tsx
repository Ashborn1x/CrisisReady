import React, { useState } from 'react';
import { Incident, ScreenView } from '../types';
import { MAP_TEXTURE_URL_NYC } from '../data/mockData';

interface ResponderScreenProps {
  activeIncident: Incident | null;
  onUpdateStage: (incidentId: string, stage: number) => void;
  onAddNote: (incidentId: string, note: string) => void;
  onNavigate: (screen: ScreenView) => void;
}

export const ResponderScreen: React.FC<ResponderScreenProps> = ({
  activeIncident,
  onUpdateStage,
  onAddNote,
  onNavigate
}) => {
  const [fieldNote, setFieldNote] = useState<string>('');
  const [navigatingNotice, setNavigatingNotice] = useState<boolean>(false);

  if (!activeIncident) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#fcf9f8]">
        <span className="material-symbols-outlined text-5xl text-[#5b403d] mb-3">
          assignment_late
        </span>
        <h2 className="text-xl font-bold text-[#1b1c1c] mb-2">No Active Assignment</h2>
        <p className="text-sm text-[#5b403d] max-w-xs mb-6">
          You are currently on standby. New dispatch assignments will appear here automatically.
        </p>
        <button
          onClick={() => onNavigate('dispatcher_dashboard')}
          className="bg-[#af101a] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-xs hover:bg-[#930010] cursor-pointer"
        >
          View Dispatch Queue
        </button>
      </div>
    );
  }

  const currentStage = activeIncident.stage || 2;

  const handleNextStage = () => {
    const next = currentStage < 4 ? currentStage + 1 : 4;
    onUpdateStage(activeIncident.id, next);
  };

  const handlePostNote = () => {
    if (!fieldNote.trim()) return;
    onAddNote(activeIncident.id, fieldNote.trim());
    setFieldNote('');
  };

  const handleLaunchNavigation = () => {
    setNavigatingNotice(true);
    // Open external navigation route or simulate GPS guidance
    const url = `https://www.google.com/maps/dir/?api=1&destination=${activeIncident.lat},${activeIncident.lng}`;
    window.open(url, '_blank');
    setTimeout(() => setNavigatingNotice(false), 4000);
  };

  const getStageButtonText = () => {
    if (currentStage === 1) return 'ACCEPT DISPATCH';
    if (currentStage === 2) return 'MARK AS RESPONDING';
    if (currentStage === 3) return 'MARK AS ON SCENE';
    return 'MISSION COMPLETED';
  };

  return (
    <div className="flex-1 flex flex-col bg-[#fcf9f8] min-h-screen text-[#1b1c1c] select-none pb-44">
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto px-4 md:px-8 py-4 max-w-xl mx-auto w-full flex flex-col gap-4">
        {/* Status Header & Title */}
        <div className="flex flex-col gap-1 text-left pt-1">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#795900] shadow-[0_0_8px_rgba(121,89,0,0.5)] animate-pulse"></div>
            <span className="font-bold text-[11px] text-[#5b403d] uppercase tracking-wider">
              Responder Online
            </span>
          </div>

          <h1 className="text-2xl font-bold text-[#1b1c1c] leading-tight">
            Assigned: {activeIncident.title}
          </h1>
          <p className="text-xs text-[#5b403d] font-data-tabular">
            Incident {activeIncident.code} • Dispatched {activeIncident.timeAgo}
          </p>
        </div>

        {/* Urgency & Description Card */}
        <div className="bg-white border border-[#e4beba] rounded-xl p-4 flex flex-col gap-3 relative overflow-hidden shadow-xs text-left">
          {/* Criticality Indicator Bar */}
          <div
            className={`absolute left-0 top-0 bottom-0 w-1.5 ${
              activeIncident.urgency === 'critical'
                ? 'bg-[#ba1a1a]'
                : activeIncident.urgency === 'high'
                ? 'bg-[#fec330]'
                : 'bg-[#0058a2]'
            }`}
          ></div>

          <div className="pl-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5 bg-[#ffdad6] text-[#93000a] px-3 py-1 rounded-full text-xs font-bold">
              <span
                className="material-symbols-outlined text-[16px] icon-filled"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                warning
              </span>
              <span>{activeIncident.urgency.toUpperCase()} URGENCY</span>
            </div>
            <span className="text-xs font-semibold text-[#5b403d]">
              {activeIncident.occupancy || 'Multi-Vehicle'}
            </span>
          </div>

          <div className="pl-2 text-sm text-[#1b1c1c] leading-relaxed">
            {activeIncident.description}
          </div>
        </div>

        {/* Location & Map Card */}
        <div className="bg-white border border-[#e4beba] rounded-xl p-4 flex flex-col gap-3 shadow-xs text-left">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-[#0058a2] mt-0.5">location_on</span>
            <div>
              <h3 className="font-bold text-sm text-[#1b1c1c]">{activeIncident.locationName}</h3>
              <p className="text-xs text-[#5b403d] font-data-tabular mt-0.5">
                Est. arrival: 4 mins (1.2 mi) • GPS Accuracy {activeIncident.accuracy || '±5m'}
              </p>
            </div>
          </div>

          {/* Map Preview Canvas */}
          <div className="relative w-full h-[150px] rounded-lg overflow-hidden border border-[#e4beba]">
            <div
              className="absolute inset-0 bg-cover bg-center w-full h-full"
              style={{ backgroundImage: `url(${MAP_TEXTURE_URL_NYC})` }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#fcf9f8]/80 to-transparent"></div>

            {/* Target Red Beacon */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-[#af101a] text-white flex items-center justify-center shadow-lg border-2 border-white animate-bounce">
                <span className="material-symbols-outlined text-sm">priority_high</span>
              </div>
            </div>

            <button
              onClick={handleLaunchNavigation}
              className="absolute bottom-3 right-3 bg-[#0058a2] hover:bg-[#0770cc] text-white h-10 px-4 rounded-full flex items-center gap-1.5 text-xs font-bold shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">navigation</span>
              Navigate
            </button>
          </div>

          {navigatingNotice && (
            <p className="text-[11px] text-[#0058a2] font-semibold text-center">
              Route navigation calculated. Heading southwest on Main St.
            </p>
          )}
        </div>

        {/* Notes/Updates Card */}
        <div className="bg-white border border-[#e4beba] rounded-xl p-4 flex flex-col gap-3 shadow-xs text-left">
          <div className="flex items-center gap-2 text-[#1b1c1c]">
            <span className="material-symbols-outlined text-base text-[#5b403d]">sticky_note_2</span>
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#5b403d]">
              Field Notes & Updates
            </h3>
          </div>

          <div className="relative">
            <textarea
              value={fieldNote}
              onChange={(e) => setFieldNote(e.target.value)}
              placeholder="Enter sitrep or log an update..."
              className="w-full bg-[#fcf9f8] border border-[#e4beba] rounded-lg p-3 min-h-[76px] text-xs text-[#1b1c1c] placeholder:text-[#8f6f6c] focus:border-[#af101a] focus:ring-1 focus:ring-[#af101a] outline-none resize-none transition-all"
            ></textarea>
            <button
              onClick={handlePostNote}
              disabled={!fieldNote.trim()}
              className="absolute bottom-2.5 right-2.5 bg-[#eae7e7] hover:bg-[#e5e2e1] text-[#1b1c1c] h-8 px-3 rounded-md font-bold text-xs transition-colors disabled:opacity-40 cursor-pointer"
            >
              Post
            </button>
          </div>
        </div>
      </main>

      {/* Fixed Action Bar (Status Progression Tracker) */}
      <div className="fixed bottom-20 md:bottom-4 left-0 w-full px-4 py-2 z-40">
        <div className="bg-[#f0eded] border border-[#e4beba] rounded-2xl p-3 shadow-lg flex flex-col gap-2.5 max-w-xl mx-auto">
          {/* Progression Tracker Dots */}
          <div className="flex justify-between items-center px-4 pt-1 pb-1 relative">
            <div className="absolute top-1/2 left-6 right-6 h-0.5 bg-[#e4beba] -z-0 -translate-y-1/2"></div>

            {/* Step 1: Accept */}
            <div className="flex flex-col items-center gap-1 bg-[#f0eded] z-10 px-1">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                  currentStage >= 1
                    ? 'bg-[#af101a] text-white border-[#f0eded]'
                    : 'bg-white border-[#e4beba] text-[#5b403d]'
                }`}
              >
                {currentStage >= 1 ? (
                  <span className="material-symbols-outlined text-[14px]">done</span>
                ) : (
                  '1'
                )}
              </div>
              <span
                className={`font-data-tabular text-[10px] font-bold ${
                  currentStage >= 1 ? 'text-[#af101a]' : 'text-[#8f6f6c]'
                }`}
              >
                Accept
              </span>
            </div>

            {/* Step 2: Responding */}
            <div className="flex flex-col items-center gap-1 bg-[#f0eded] z-10 px-1">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                  currentStage >= 2
                    ? 'bg-[#af101a] text-white border-[#f0eded]'
                    : 'bg-white border-[#e4beba] text-[#5b403d]'
                }`}
              >
                {currentStage >= 2 ? (
                  <span className="material-symbols-outlined text-[14px]">done</span>
                ) : (
                  '2'
                )}
              </div>
              <span
                className={`font-data-tabular text-[10px] font-bold ${
                  currentStage >= 2 ? 'text-[#1b1c1c]' : 'text-[#8f6f6c]'
                }`}
              >
                Responding
              </span>
            </div>

            {/* Step 3: On Scene */}
            <div className="flex flex-col items-center gap-1 bg-[#f0eded] z-10 px-1">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                  currentStage >= 3
                    ? 'bg-[#af101a] text-white border-[#f0eded]'
                    : 'bg-white border-[#e4beba] text-[#5b403d]'
                }`}
              >
                {currentStage >= 3 ? (
                  <span className="material-symbols-outlined text-[14px]">done</span>
                ) : (
                  '3'
                )}
              </div>
              <span
                className={`font-data-tabular text-[10px] font-bold ${
                  currentStage >= 3 ? 'text-[#1b1c1c]' : 'text-[#8f6f6c]'
                }`}
              >
                On Scene
              </span>
            </div>

            {/* Step 4: Complete */}
            <div className="flex flex-col items-center gap-1 bg-[#f0eded] z-10 px-1">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                  currentStage >= 4
                    ? 'bg-[#af101a] text-white border-[#f0eded]'
                    : 'bg-white border-[#e4beba] text-[#5b403d]'
                }`}
              >
                {currentStage >= 4 ? (
                  <span className="material-symbols-outlined text-[14px]">done</span>
                ) : (
                  '4'
                )}
              </div>
              <span
                className={`font-data-tabular text-[10px] font-bold ${
                  currentStage >= 4 ? 'text-[#1b1c1c]' : 'text-[#8f6f6c]'
                }`}
              >
                Complete
              </span>
            </div>
          </div>

          {/* Primary Action Button */}
          <button
            onClick={handleNextStage}
            className="w-full bg-[#af101a] hover:bg-[#930010] text-white h-14 rounded-xl flex items-center justify-center gap-2 font-bold text-base tracking-wide active:scale-[0.98] transition-all duration-150 shadow-md cursor-pointer uppercase"
          >
            <span
              className="material-symbols-outlined icon-filled text-xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              directions_car
            </span>
            {getStageButtonText()}
          </button>
        </div>
      </div>
    </div>
  );
};
