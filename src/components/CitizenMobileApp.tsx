import React, { useState, useEffect, useRef } from 'react';
import { Incident, IncidentType, ScreenView, ResponderUnit } from '../types';
import { HomeScreen } from '../screens/HomeScreen';
import { NewReportScreen } from '../screens/NewReportScreen';
import { UserStatusScreen } from '../screens/UserStatusScreen';
import { SmsFallbackScreen } from '../screens/SmsFallbackScreen';

interface CitizenMobileAppProps {
  incidents: Incident[];
  onSubmitReport: (newIncident: Partial<Incident>) => void;
  onSelectIncident: (incident: Incident) => void;
  isOffline: boolean;
  onToggleOffline: () => void;
  onAddCommsMessage: (incidentId: string, text: string) => void;
}

export type MobileTab = 'sos' | 'report' | 'status' | 'guides' | 'sms';

export const CitizenMobileApp: React.FC<CitizenMobileAppProps> = ({
  incidents,
  onSubmitReport,
  onSelectIncident,
  isOffline,
  onToggleOffline,
  onAddCommsMessage
}) => {
  const [activeTab, setActiveTab] = useState<MobileTab>('sos');
  const [phoneFrameMode, setPhoneFrameMode] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<string>('09:41');
  const [batteryLevel] = useState<number>(92);
  const [isSirenActive, setIsSirenActive] = useState<boolean>(false);
  const [isStrobeActive, setIsStrobeActive] = useState<boolean>(false);
  const [strobeState, setStrobeState] = useState<boolean>(false);
  const [cprCount, setCprCount] = useState<number>(0);
  const [isCprRunning, setIsCprRunning] = useState<boolean>(false);
  const [activeGuide, setActiveGuide] = useState<string | null>(null);

  // Audio Context for Siren & CPR Beep
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sirenIntervalRef = useRef<number | null>(null);
  const cprIntervalRef = useRef<number | null>(null);

  // Live time ticker
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Strobe simulator effect
  useEffect(() => {
    let strobeTimer: number;
    if (isStrobeActive) {
      strobeTimer = window.setInterval(() => {
        setStrobeState((prev) => !prev);
      }, 120);
    } else {
      setStrobeState(false);
    }
    return () => clearInterval(strobeTimer);
  }, [isStrobeActive]);

  // Audio helper
  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtxRef.current = new AudioCtx();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  const playTone = (freq: number, durationMs: number) => {
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationMs / 1000);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + durationMs / 1000);
    } catch {
      // Audio not supported or blocked by browser policy
    }
  };

  // Toggle Siren Sound
  const toggleSiren = () => {
    if (isSirenActive) {
      if (sirenIntervalRef.current) clearInterval(sirenIntervalRef.current);
      setIsSirenActive(false);
    } else {
      setIsSirenActive(true);
      let high = true;
      playTone(880, 200);
      sirenIntervalRef.current = window.setInterval(() => {
        playTone(high ? 960 : 720, 220);
        high = !high;
      }, 250);
    }
  };

  // CPR Metronome (105 BPM target for chest compressions)
  const toggleCprMetronome = () => {
    if (isCprRunning) {
      if (cprIntervalRef.current) clearInterval(cprIntervalRef.current);
      setIsCprRunning(false);
    } else {
      setIsCprRunning(true);
      setCprCount(0);
      playTone(600, 80);
      const intervalMs = (60 / 105) * 1000; // ~571ms per beat
      cprIntervalRef.current = window.setInterval(() => {
        setCprCount((c) => {
          const next = c + 1;
          playTone(next % 30 === 0 ? 900 : 600, 80);
          return next;
        });
      }, intervalMs);
    }
  };

  useEffect(() => {
    return () => {
      if (sirenIntervalRef.current) clearInterval(sirenIntervalRef.current);
      if (cprIntervalRef.current) clearInterval(cprIntervalRef.current);
    };
  }, []);

  const activeIncident = incidents.find((i) => i.status !== 'resolved') || incidents[0];

  // Render content of active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'sos':
        return (
          <HomeScreen
            onNavigate={(screen: ScreenView) => {
              if (screen === 'report_new') setActiveTab('report');
              else if (screen === 'user_status') setActiveTab('status');
              else if (screen === 'sms_fallback') setActiveTab('sms');
            }}
            incidents={incidents}
            onSelectIncident={(inc) => {
              onSelectIncident(inc);
              setActiveTab('status');
            }}
            isOffline={isOffline}
            onInstantEmergency={(type: IncidentType) => {
              if (isOffline) {
                setActiveTab('sms');
              } else {
                setActiveTab('report');
              }
            }}
          />
        );

      case 'report':
        return (
          <NewReportScreen
            onNavigate={(screen: ScreenView) => {
              if (screen === 'home') setActiveTab('sos');
              else if (screen === 'sms_fallback') setActiveTab('sms');
              else if (screen === 'user_status' || screen === 'responder_incident') setActiveTab('status');
            }}
            onSubmitReport={(inc) => {
              onSubmitReport(inc);
              setActiveTab('status');
            }}
            isOffline={isOffline}
            prefillType="medical"
          />
        );

      case 'status':
        return (
          <UserStatusScreen
            incidents={incidents}
            onNavigate={(screen: ScreenView) => {
              if (screen === 'home') setActiveTab('sos');
              else if (screen === 'report_new') setActiveTab('report');
              else if (screen === 'sms_fallback') setActiveTab('sms');
            }}
            onAddCommsMessage={onAddCommsMessage}
          />
        );

      case 'sms':
        return (
          <SmsFallbackScreen
            onNavigate={(screen: ScreenView) => {
              if (screen === 'home') setActiveTab('sos');
              else if (screen === 'report_new') setActiveTab('report');
            }}
            activeIncident={activeIncident}
          />
        );

      case 'guides':
        return (
          <div className="flex-1 flex flex-col bg-[#fcf9f8] p-4 overflow-y-auto no-scrollbar pb-24">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#e0f2fe] text-[#0369a1] uppercase tracking-wider">
                  Offline First Aid & Rescue
                </span>
                <h2 className="text-lg font-bold text-[#1b1c1c] mt-0.5">Emergency Guides</h2>
              </div>
              <span className="material-symbols-outlined text-[#0284c7] text-2xl">medical_services</span>
            </div>

            {/* CPR Metronome Interactive Tool */}
            <div className="bg-white border border-[#e4beba] rounded-2xl p-4 mb-4 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#ba1a1a]">cardiology</span>
                  <span className="font-bold text-sm text-[#1b1c1c]">CPR Chest Compression Metronome</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#f0eded] text-[#5b403d]">
                  105 BPM Standard
                </span>
              </div>
              <p className="text-xs text-[#5b403d] mb-3">
                Push hard and fast in the center of the chest. 30 compressions followed by 2 rescue breaths.
              </p>

              <div className="flex items-center justify-between bg-[#fcf9f8] p-3 rounded-xl border border-[#e4beba]">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-base transition-all ${
                      isCprRunning
                        ? 'bg-[#ba1a1a] text-white scale-105 shadow-sm animate-pulse'
                        : 'bg-[#f0eded] text-[#5b403d]'
                    }`}
                  >
                    {isCprRunning ? cprCount : 0}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#1b1c1c] block">
                      {isCprRunning ? `Compression #${cprCount}` : 'Metronome Stopped'}
                    </span>
                    <span className="text-[10px] text-[#5b403d]">
                      {isCprRunning ? `Cycle: ${Math.floor(cprCount / 30) + 1}` : 'Tap Start to begin rhythm audio'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={toggleCprMetronome}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isCprRunning
                      ? 'bg-[#ba1a1a] text-white shadow-xs'
                      : 'bg-[#0058a2] text-white hover:bg-[#004785]'
                  }`}
                >
                  {isCprRunning ? 'Stop Beep' : 'Start CPR Pace'}
                </button>
              </div>
            </div>

            {/* Guide Accordions */}
            <div className="flex flex-col gap-2.5">
              {/* Guide 1: Severe Bleeding */}
              <div className="bg-white border border-[#e4beba] rounded-xl overflow-hidden shadow-xs">
                <button
                  onClick={() => setActiveGuide(activeGuide === 'bleeding' ? null : 'bleeding')}
                  className="w-full p-3.5 flex items-center justify-between text-left cursor-pointer hover:bg-[#faf7f6]"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[#ba1a1a] text-xl">bloodtype</span>
                    <div>
                      <span className="font-bold text-xs text-[#1b1c1c] block">Severe Bleeding & Hemorrhage</span>
                      <span className="text-[10px] text-[#5b403d]">Direct pressure, wound packing, tourniquet</span>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-[#5b403d]">
                    {activeGuide === 'bleeding' ? 'expand_less' : 'expand_more'}
                  </span>
                </button>
                {activeGuide === 'bleeding' && (
                  <div className="p-4 pt-1 border-t border-[#e4beba]/60 bg-[#fcf9f8] text-xs text-[#5b403d] flex flex-col gap-2">
                    <p className="font-semibold text-[#1b1c1c]">Step-by-step action:</p>
                    <ol className="list-decimal pl-4 space-y-1">
                      <li>Apply firm, continuous direct pressure with a clean cloth or bandage.</li>
                      <li>Do not remove the cloth if it soaks through; add more layers on top.</li>
                      <li>For limb wounds with arterial spurting, apply a commercial tourniquet 2-3 inches above the wound (not over a joint) and tighten until bleeding ceases.</li>
                      <li>Keep the patient warm and lying flat to prevent shock.</li>
                    </ol>
                  </div>
                )}
              </div>

              {/* Guide 2: Choking / Heimlich */}
              <div className="bg-white border border-[#e4beba] rounded-xl overflow-hidden shadow-xs">
                <button
                  onClick={() => setActiveGuide(activeGuide === 'choking' ? null : 'choking')}
                  className="w-full p-3.5 flex items-center justify-between text-left cursor-pointer hover:bg-[#faf7f6]"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[#d97706] text-xl">air</span>
                    <div>
                      <span className="font-bold text-xs text-[#1b1c1c] block">Choking (Adult / Child)</span>
                      <span className="text-[10px] text-[#5b403d]">Back blows & abdominal thrusts (Heimlich)</span>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-[#5b403d]">
                    {activeGuide === 'choking' ? 'expand_less' : 'expand_more'}
                  </span>
                </button>
                {activeGuide === 'choking' && (
                  <div className="p-4 pt-1 border-t border-[#e4beba]/60 bg-[#fcf9f8] text-xs text-[#5b403d] flex flex-col gap-2">
                    <p className="font-semibold text-[#1b1c1c]">Step-by-step action:</p>
                    <ol className="list-decimal pl-4 space-y-1">
                      <li>Ask: "Are you choking?" If they cannot speak, cough, or breathe, act immediately.</li>
                      <li>Give 5 sharp back blows between shoulder blades with heel of your hand.</li>
                      <li>Stand behind, place fist thumb-in just above navel, grasp with other hand and give 5 inward/upward thrusts.</li>
                      <li>Repeat 5 back blows and 5 thrusts until airway is clear or person becomes unresponsive (begin CPR if unresponsive).</li>
                    </ol>
                  </div>
                )}
              </div>

              {/* Guide 3: Burns */}
              <div className="bg-white border border-[#e4beba] rounded-xl overflow-hidden shadow-xs">
                <button
                  onClick={() => setActiveGuide(activeGuide === 'burns' ? null : 'burns')}
                  className="w-full p-3.5 flex items-center justify-between text-left cursor-pointer hover:bg-[#faf7f6]"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[#ea580c] text-xl">local_fire_department</span>
                    <div>
                      <span className="font-bold text-xs text-[#1b1c1c] block">Burns & Scalds</span>
                      <span className="text-[10px] text-[#5b403d]">Cooling, sterile covering, chemical flush</span>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-[#5b403d]">
                    {activeGuide === 'burns' ? 'expand_less' : 'expand_more'}
                  </span>
                </button>
                {activeGuide === 'burns' && (
                  <div className="p-4 pt-1 border-t border-[#e4beba]/60 bg-[#fcf9f8] text-xs text-[#5b403d] flex flex-col gap-2">
                    <p className="font-semibold text-[#1b1c1c]">Step-by-step action:</p>
                    <ol className="list-decimal pl-4 space-y-1">
                      <li>Cool burn immediately under cool running tap water for at least 10–20 minutes.</li>
                      <li>Never use ice, butter, or ointments on severe burns.</li>
                      <li>Cover loosely with clean plastic cling wrap or sterile non-adherent dressing.</li>
                      <li>Remove tight clothing or jewelry near the burn before swelling occurs, unless stuck to the skin.</li>
                    </ol>
                  </div>
                )}
              </div>

              {/* Guide 4: Shock & Hypothermia */}
              <div className="bg-white border border-[#e4beba] rounded-xl overflow-hidden shadow-xs">
                <button
                  onClick={() => setActiveGuide(activeGuide === 'shock' ? null : 'shock')}
                  className="w-full p-3.5 flex items-center justify-between text-left cursor-pointer hover:bg-[#faf7f6]"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[#0284c7] text-xl">ac_unit</span>
                    <div>
                      <span className="font-bold text-xs text-[#1b1c1c] block">Shock & Trauma Positioning</span>
                      <span className="text-[10px] text-[#5b403d]">Elevating legs, thermal blanket, calm reassurance</span>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-[#5b403d]">
                    {activeGuide === 'shock' ? 'expand_less' : 'expand_more'}
                  </span>
                </button>
                {activeGuide === 'shock' && (
                  <div className="p-4 pt-1 border-t border-[#e4beba]/60 bg-[#fcf9f8] text-xs text-[#5b403d] flex flex-col gap-2">
                    <p className="font-semibold text-[#1b1c1c]">Step-by-step action:</p>
                    <ol className="list-decimal pl-4 space-y-1">
                      <li>Lay the person down flat. Elevate feet 6-12 inches if no spine/head trauma is suspected.</li>
                      <li>Keep the person warm with a blanket or jacket to prevent hypothermia.</li>
                      <li>Do NOT give food or drink (as surgery may be required upon hospital arrival).</li>
                      <li>Loosen tight belts and clothing at neck, chest, and waist.</li>
                    </ol>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
    }
  };

  const mobileAppInner = (
    <div
      className={`flex flex-col h-full w-full bg-[#fcf9f8] select-none relative overflow-hidden transition-colors ${
        isStrobeActive && strobeState ? 'bg-white' : ''
      }`}
    >
      {/* 1. NATIVE MOBILE STATUS BAR */}
      <div className="bg-[#1b1c1c] text-white px-5 pt-3 pb-2 flex items-center justify-between text-xs font-semibold shrink-0 z-30">
        <span className="font-data-tabular tracking-tight text-[13px]">{currentTime}</span>

        {/* Dynamic Island / Speaker Pill */}
        <div className="w-20 h-4 bg-black rounded-full flex items-center justify-center gap-1.5 px-2">
          <div className="w-2 h-2 rounded-full bg-[#1b1c1c] border border-[#333]"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-[#0770cc] animate-ping"></div>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-data-tabular">
          <span className="material-symbols-outlined text-[14px]">
            {isOffline ? 'signal_cellular_off' : 'signal_cellular_4_bar'}
          </span>
          <span className="text-[10px] font-bold">{isOffline ? 'SOS ONLY' : '5G'}</span>
          <div className="flex items-center gap-0.5">
            <span>{batteryLevel}%</span>
            <span className="material-symbols-outlined text-[14px]">battery_5_bar</span>
          </div>
        </div>
      </div>

      {/* 2. MOBILE TOP APP HEADER */}
      <header className="bg-white border-b border-[#e4beba] px-4 py-2.5 flex items-center justify-between shrink-0 shadow-xs z-20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#af101a] flex items-center justify-center text-white font-bold shadow-xs">
            <span className="material-symbols-outlined text-lg">emergency</span>
          </div>
          <div className="flex flex-col">
            <span className="font-black text-sm text-[#1b1c1c] tracking-tight leading-none">
              CRISIS<span className="text-[#af101a]">READY</span>
            </span>
            <span className="text-[10px] text-[#5b403d] font-semibold mt-0.5">
              Citizen Emergency SOS
            </span>
          </div>
        </div>

        {/* Action Pills: Flashlight & Siren */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsStrobeActive((v) => !v)}
            className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
              isStrobeActive
                ? 'bg-[#ffe082] text-[#e65100] border-[#ffb300] shadow-xs'
                : 'bg-[#f6f3f2] text-[#5b403d] border-[#e4beba] hover:bg-[#eae7e7]'
            }`}
            title="Emergency Strobe / Beacon"
          >
            <span className="material-symbols-outlined text-base">
              {isStrobeActive ? 'flashlight_on' : 'flashlight_off'}
            </span>
          </button>

          <button
            onClick={toggleSiren}
            className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
              isSirenActive
                ? 'bg-[#ba1a1a] text-white border-[#93000a] animate-bounce shadow-xs'
                : 'bg-[#f6f3f2] text-[#5b403d] border-[#e4beba] hover:bg-[#eae7e7]'
            }`}
            title="Audible Emergency Siren Beacon"
          >
            <span className="material-symbols-outlined text-base">
              {isSirenActive ? 'volume_up' : 'volume_off'}
            </span>
          </button>

          <button
            onClick={onToggleOffline}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer border ${
              isOffline
                ? 'bg-[#ffdad6] text-[#93000a] border-[#ba1a1a]'
                : 'bg-[#e0f2fe] text-[#0369a1] border-[#7dd3fc]'
            }`}
            title="Toggle simulated connection state"
          >
            {isOffline ? 'Offline' : 'Online'}
          </button>
        </div>
      </header>

      {/* 3. ACTIVE SCREEN CONTENT */}
      <div className="flex-1 overflow-hidden flex flex-col relative">
        {renderTabContent()}
      </div>

      {/* 4. TACTILE MOBILE BOTTOM NAVIGATION TAB BAR */}
      <nav className="bg-white border-t border-[#e4beba] px-3 py-1.5 flex items-center justify-around shrink-0 shadow-lg z-30">
        {/* Tab 1: SOS Home */}
        <button
          onClick={() => setActiveTab('sos')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'sos'
              ? 'bg-[#af101a] text-white font-bold shadow-xs scale-105'
              : 'text-[#5b403d] hover:bg-[#f6f3f2]'
          }`}
        >
          <span className="material-symbols-outlined text-xl">emergency</span>
          <span className="text-[10px] font-bold tracking-tight">SOS Home</span>
        </button>

        {/* Tab 2: Report */}
        <button
          onClick={() => setActiveTab('report')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'report'
              ? 'bg-[#af101a] text-white font-bold shadow-xs scale-105'
              : 'text-[#5b403d] hover:bg-[#f6f3f2]'
          }`}
        >
          <span className="material-symbols-outlined text-xl">add_alert</span>
          <span className="text-[10px] font-bold tracking-tight">Report</span>
        </button>

        {/* Tab 3: Track Status */}
        <button
          onClick={() => setActiveTab('status')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'status'
              ? 'bg-[#af101a] text-white font-bold shadow-xs scale-105'
              : 'text-[#5b403d] hover:bg-[#f6f3f2]'
          }`}
        >
          <div className="relative">
            <span className="material-symbols-outlined text-xl">track_changes</span>
            {activeIncident && activeIncident.status !== 'resolved' && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#ba1a1a] animate-ping"></span>
            )}
          </div>
          <span className="text-[10px] font-bold tracking-tight">My SOS</span>
        </button>

        {/* Tab 4: Guides / CPR */}
        <button
          onClick={() => setActiveTab('guides')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'guides'
              ? 'bg-[#af101a] text-white font-bold shadow-xs scale-105'
              : 'text-[#5b403d] hover:bg-[#f6f3f2]'
          }`}
        >
          <span className="material-symbols-outlined text-xl">medical_services</span>
          <span className="text-[10px] font-bold tracking-tight">First Aid</span>
        </button>

        {/* Tab 5: Offline SMS */}
        <button
          onClick={() => setActiveTab('sms')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'sms'
              ? 'bg-[#af101a] text-white font-bold shadow-xs scale-105'
              : 'text-[#5b403d] hover:bg-[#f6f3f2]'
          }`}
        >
          <span className="material-symbols-outlined text-xl">sms</span>
          <span className="text-[10px] font-bold tracking-tight">SMS Beacon</span>
        </button>
      </nav>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-[#ece8e7] relative overflow-y-auto no-scrollbar">
      {/* Top Mobile Viewport Controls Bar (Desktop only helper) */}
      <div className="bg-[#1b1c1c] text-white px-4 py-2 flex items-center justify-between text-xs z-30 shrink-0">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#af101a] text-base">smartphone</span>
          <span className="font-bold">Citizen Mobile App Viewport</span>
          <span className="text-[10px] text-[#c5a3a0] hidden sm:inline">
            Optimized for iOS & Android handheld emergency response
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setPhoneFrameMode((v) => !v)}
            className="px-2.5 py-1 rounded bg-[#333] hover:bg-[#444] text-[11px] font-semibold text-white flex items-center gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[14px]">
              {phoneFrameMode ? 'fullscreen' : 'devices'}
            </span>
            {phoneFrameMode ? 'Expand Fullscreen' : 'Phone Frame View'}
          </button>
        </div>
      </div>

      {/* Main Container: Either Framed in Smartphone or Fullscreen */}
      <div className="flex-1 flex items-center justify-center p-0 md:p-6 overflow-hidden">
        {phoneFrameMode ? (
          <div className="w-full max-w-[420px] h-full md:h-[840px] max-h-full bg-black md:rounded-[44px] shadow-2xl p-0 md:p-3 border-0 md:border-4 border-[#333] flex flex-col relative overflow-hidden">
            {/* Phone speaker notch on desktop */}
            <div className="hidden md:block absolute top-1.5 left-1/2 -translate-x-1/2 w-24 h-4 bg-black rounded-full z-40"></div>
            <div className="flex-1 w-full h-full md:rounded-[36px] overflow-hidden flex flex-col bg-[#fcf9f8]">
              {mobileAppInner}
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col bg-[#fcf9f8]">
            {mobileAppInner}
          </div>
        )}
      </div>
    </div>
  );
};
