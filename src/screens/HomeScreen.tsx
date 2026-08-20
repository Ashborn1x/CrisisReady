import React, { useState, useEffect, useRef } from 'react';
import { Incident, ScreenView } from '../types';

interface HomeScreenProps {
  onNavigate: (screen: ScreenView) => void;
  incidents: Incident[];
  onSelectIncident: (incident: Incident) => void;
  isOffline: boolean;
  onInstantEmergency: (type: 'medical' | 'fire' | 'accident' | 'flood') => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigate,
  incidents,
  onSelectIncident,
  isOffline,
  onInstantEmergency
}) => {
  const [timeStr, setTimeStr] = useState<string>('00:00:00');
  const [coords, setCoords] = useState<{ lat: string; lng: string }>({
    lat: '40.7128° N',
    lng: '74.0060° W'
  });
  const [gpsAccuracy, setGpsAccuracy] = useState<string>('±4m (High)');
  const [isHolding, setIsHolding] = useState<boolean>(false);
  const [holdProgress, setHoldProgress] = useState<number>(0);
  const holdIntervalRef = useRef<number | null>(null);

  // Live Clock & GPS Simulation
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);

    // Try real geolocation if available, otherwise mock GPS
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const latVal = pos.coords.latitude;
          const lngVal = pos.coords.longitude;
          setCoords({
            lat: `${latVal.toFixed(4)}° ${latVal >= 0 ? 'N' : 'S'}`,
            lng: `${Math.abs(lngVal).toFixed(4)}° ${lngVal >= 0 ? 'E' : 'W'}`
          });
          setGpsAccuracy(`±${Math.round(pos.coords.accuracy || 5)}m`);
        },
        () => {
          // Keep default simulated coordinates
        },
        { timeout: 5000 }
      );
    }

    return () => clearInterval(timer);
  }, []);

  // Handle Press & Hold trigger
  const handleStartHold = () => {
    setIsHolding(true);
    setHoldProgress(0);
    const startTime = Date.now();
    const duration = 1200; // 1.2s hold triggers instant emergency

    if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);

    holdIntervalRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, (elapsed / duration) * 100);
      setHoldProgress(progress);

      if (progress >= 100) {
        if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
        setIsHolding(false);
        setHoldProgress(0);
        // Trigger report screen or offline fallback
        if (isOffline) {
          onNavigate('sms_fallback');
        } else {
          onNavigate('report_new');
        }
      }
    }, 30);
  };

  const handleEndHold = () => {
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
    if (isHolding && holdProgress < 90) {
      // If clicked without holding all the way, also navigate to report screen!
      setIsHolding(false);
      setHoldProgress(0);
      if (isOffline) {
        onNavigate('sms_fallback');
      } else {
        onNavigate('report_new');
      }
    } else {
      setIsHolding(false);
      setHoldProgress(0);
    }
  };

  // Filter recent activities
  const recentActivities = incidents.slice(0, 3);

  return (
    <div className="flex-1 flex flex-col relative w-full pb-20 md:pb-6">
      {/* Connection Status Banner */}
      <div
        className={`px-4 py-3 flex items-start gap-3 border-b transition-colors ${
          isOffline
            ? 'bg-[#ffdad6] text-[#93000a] border-[#ba1a1a]/30'
            : 'bg-[#0770cc] text-[#f0f4ff] border-[#0770cc]/30'
        }`}
      >
        <span
          className="material-symbols-outlined icon-filled mt-0.5 text-xl shrink-0"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          {isOffline ? 'wifi_off' : 'check_circle'}
        </span>
        <div className="flex flex-col text-left">
          <span className="font-bold text-sm tracking-tight">
            {isOffline ? 'No Internet Connection (SMS Fallback Active)' : 'System Online & Secured'}
          </span>
          <span className="text-xs opacity-90 leading-relaxed">
            {isOffline
              ? 'Reports will be encoded directly into emergency SMS dispatch format with GPS telemetry.'
              : 'Emergency reports can be submitted directly to dispatch. GPS tracking active.'}
          </span>
        </div>
      </div>

      {/* Main Action Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 max-w-xl mx-auto w-full">
        {/* Current Location Info Box */}
        <div className="bg-[#f6f3f2] border border-[#e4beba] rounded-xl p-3.5 mb-6 w-full flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#795900] text-2xl">my_location</span>
            <div className="flex flex-col">
              <span className="font-bold text-[11px] text-[#5b403d] tracking-wider font-data-tabular">
                CURRENT LOCATION ({gpsAccuracy})
              </span>
              <span className="font-semibold text-sm text-[#1b1c1c] font-data-tabular">
                Lat: {coords.lat}
                <br />
                Lon: {coords.lng}
              </span>
            </div>
          </div>
          <span className="font-data-tabular text-xs font-semibold text-[#5b403d] bg-[#e5e2e1] px-2.5 py-1 rounded-md">
            {timeStr}
          </span>
        </div>

        {/* Big Circular Emergency SOS Button with Ripple & Pulse */}
        <div className="relative flex flex-col items-center justify-center my-3">
          {/* Progress Ring Overlay during hold */}
          {isHolding && (
            <svg className="absolute -inset-3 w-[248px] h-[248px] -rotate-90 pointer-events-none z-10">
              <circle
                cx="124"
                cy="124"
                r="116"
                stroke="#d32f2f"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray="728"
                strokeDashoffset={728 - (728 * holdProgress) / 100}
                className="transition-all duration-75"
              />
            </svg>
          )}

          <button
            onMouseDown={handleStartHold}
            onMouseUp={handleEndHold}
            onMouseLeave={handleEndHold}
            onTouchStart={handleStartHold}
            onTouchEnd={handleEndHold}
            aria-label="Report Emergency"
            className="w-56 h-56 rounded-full bg-[#af101a] text-white shadow-[0_8px_30px_rgb(175,16,26,0.4)] pulse-effect ripple-btn flex flex-col items-center justify-center gap-2.5 border-4 md:border-8 border-[#f0eded] transition-transform active:scale-95 cursor-pointer select-none"
          >
            <span
              className="material-symbols-outlined text-6xl icon-filled drop-shadow-md"
              style={{ fontSize: '64px', fontVariationSettings: "'FILL' 1" }}
            >
              warning
            </span>
            <span className="text-xl font-black uppercase tracking-wider text-center leading-tight">
              REPORT
              <br />
              EMERGENCY
            </span>
          </button>
        </div>

        <p className="text-sm text-[#5b403d] mt-5 text-center max-w-xs leading-relaxed">
          Press and hold to immediately transmit your location and status to command.
        </p>

        {/* Quick One-Tap Triage Buttons */}
        <div className="grid grid-cols-4 gap-2 w-full mt-6 max-w-md">
          <button
            onClick={() => onInstantEmergency('medical')}
            className="flex flex-col items-center justify-center p-2.5 bg-white rounded-xl border border-[#e4beba] hover:bg-[#fff2f0] hover:border-[#af101a] transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <span className="material-symbols-outlined text-[#af101a] text-xl icon-filled">
              local_hospital
            </span>
            <span className="text-[11px] font-bold text-[#1b1c1c] mt-1">Medical</span>
          </button>

          <button
            onClick={() => onInstantEmergency('fire')}
            className="flex flex-col items-center justify-center p-2.5 bg-white rounded-xl border border-[#e4beba] hover:bg-[#ffdfa0]/30 hover:border-[#795900] transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <span className="material-symbols-outlined text-[#795900] text-xl icon-filled">
              local_fire_department
            </span>
            <span className="text-[11px] font-bold text-[#1b1c1c] mt-1">Fire</span>
          </button>

          <button
            onClick={() => onInstantEmergency('accident')}
            className="flex flex-col items-center justify-center p-2.5 bg-white rounded-xl border border-[#e4beba] hover:bg-[#ffdad6] hover:border-[#ba1a1a] transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <span className="material-symbols-outlined text-[#ba1a1a] text-xl icon-filled">
              car_crash
            </span>
            <span className="text-[11px] font-bold text-[#1b1c1c] mt-1">Accident</span>
          </button>

          <button
            onClick={() => onInstantEmergency('flood')}
            className="flex flex-col items-center justify-center p-2.5 bg-white rounded-xl border border-[#e4beba] hover:bg-[#d4e3ff]/30 hover:border-[#0058a2] transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <span className="material-symbols-outlined text-[#0058a2] text-xl icon-filled">
              water_drop
            </span>
            <span className="text-[11px] font-bold text-[#1b1c1c] mt-1">Flood</span>
          </button>
        </div>
      </div>

      {/* Recent Activity Panel (Bottom Sheet style on Mobile / Card on Desktop) */}
      <div className="bg-white border-t border-[#e4beba] rounded-t-2xl p-4 md:p-6 shadow-[0_-4px_12px_rgba(0,0,0,0.03)] md:mx-6 md:mb-6 md:rounded-2xl md:border md:shadow-xs max-w-2xl md:mx-auto w-full">
        <div className="flex items-center justify-between mb-3.5">
          <h2 className="text-lg font-bold text-[#1b1c1c] tracking-tight">Recent Activity</h2>
          <button
            onClick={() => onNavigate('dispatcher_dashboard')}
            className="text-[#0058a2] font-bold text-xs flex items-center gap-1 hover:underline cursor-pointer"
          >
            View All <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>

        <div className="flex flex-col gap-2.5">
          {recentActivities.map((item) => {
            const isResolved = item.status === 'resolved';
            const isCritical = item.urgency === 'critical';

            return (
              <div
                key={item.id}
                onClick={() => onSelectIncident(item)}
                className="flex items-center p-3 rounded-xl bg-[#fcf9f8] border border-[#e4beba]/60 hover:bg-[#f6f3f2] transition-colors cursor-pointer"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 shrink-0 ${
                    item.type === 'medical'
                      ? 'bg-[#ffdad6] text-[#93000a]'
                      : item.type === 'fire'
                      ? 'bg-[#fec330] text-[#6f5100]'
                      : 'bg-[#ffdad6] text-[#ba1a1a]'
                  }`}
                >
                  <span
                    className="material-symbols-outlined icon-filled text-xl"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    {item.type === 'medical'
                      ? 'local_hospital'
                      : item.type === 'fire'
                      ? 'local_fire_department'
                      : 'car_crash'}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <span className="font-bold text-sm text-[#1b1c1c] truncate">{item.title}</span>
                    <span className="font-data-tabular text-xs text-[#5b403d] ml-2 shrink-0">
                      {item.timeAgo}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        isResolved
                          ? 'bg-[#e5e2e1] text-[#5b403d]'
                          : isCritical
                          ? 'bg-[#ffdad6] text-[#93000a]'
                          : 'bg-[#ffdfa0] text-[#261a00]'
                      }`}
                    >
                      {item.status.toUpperCase()}
                    </span>
                    <span className="text-xs text-[#5b403d] truncate">{item.locationName}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
