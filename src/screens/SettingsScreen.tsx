import React, { useState } from 'react';
import { ScreenView } from '../types';

interface SettingsScreenProps {
  isOffline: boolean;
  onToggleOffline: () => void;
  onNavigate: (screen: ScreenView) => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  isOffline,
  onToggleOffline,
  onNavigate
}) => {
  const [soundAlerts, setSoundAlerts] = useState<boolean>(true);
  const [hapticFeedback, setHapticFeedback] = useState<boolean>(true);
  const [gpsRefreshRate, setGpsRefreshRate] = useState<string>('1s');
  const [emergencyPhone, setEmergencyPhone] = useState<string>('911 / (800) 555-CRISIS');
  const [callsignPrefix, setCallsignPrefix] = useState<string>('CR-CMD-042');
  const [savedNotice, setSavedNotice] = useState<boolean>(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <div className="flex-1 bg-white min-h-screen p-4 md:p-8 select-none text-left max-w-2xl mx-auto w-full">
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-[#1b1c1c] tracking-tight">
          System Settings & Simulation
        </h1>
        <p className="text-sm text-[#5b403d] mt-1">
          Configure telemetry, offline SMS fallback simulation, and dispatch parameters.
        </p>
      </header>

      <form onSubmit={handleSave} className="flex flex-col gap-6">
        {/* Offline Simulator Switch */}
        <div className="bg-[#fcf9f8] border border-[#e4beba] rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2.5">
              <span
                className={`material-symbols-outlined text-2xl ${
                  isOffline ? 'text-[#ba1a1a]' : 'text-[#0058a2]'
                }`}
              >
                {isOffline ? 'wifi_off' : 'wifi'}
              </span>
              <div>
                <h3 className="font-bold text-sm text-[#1b1c1c]">Network Outage Simulation</h3>
                <p className="text-xs text-[#5b403d]">
                  Toggle to test the Offline SMS Fallback flow when internet is lost.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onToggleOffline}
              className={`w-14 h-8 rounded-full transition-colors flex items-center px-1 cursor-pointer ${
                isOffline ? 'bg-[#ba1a1a] justify-end' : 'bg-[#e5e2e1] justify-start'
              }`}
            >
              <div className="w-6 h-6 rounded-full bg-white shadow-xs"></div>
            </button>
          </div>
        </div>

        {/* Audio & Alert Settings */}
        <div className="bg-[#fcf9f8] border border-[#e4beba] rounded-xl p-4 shadow-xs flex flex-col gap-3">
          <h3 className="font-bold text-sm text-[#1b1c1c] uppercase tracking-wider">
            Audio & Haptic Alerts
          </h3>

          <div className="flex items-center justify-between py-2 border-b border-[#e4beba]">
            <div>
              <div className="font-semibold text-xs text-[#1b1c1c]">High-Urgency Siren</div>
              <div className="text-[11px] text-[#5b403d]">Play audio tone when Critical incident arrives</div>
            </div>
            <input
              type="checkbox"
              checked={soundAlerts}
              onChange={(e) => setSoundAlerts(e.target.checked)}
              className="w-4 h-4 accent-[#af101a] cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <div className="font-semibold text-xs text-[#1b1c1c]">Haptic Vibration</div>
              <div className="text-[11px] text-[#5b403d]">Vibrate device on status progression & SOS trigger</div>
            </div>
            <input
              type="checkbox"
              checked={hapticFeedback}
              onChange={(e) => setHapticFeedback(e.target.checked)}
              className="w-4 h-4 accent-[#af101a] cursor-pointer"
            />
          </div>
        </div>

        {/* Telemetry & Dispatch Configuration */}
        <div className="bg-[#fcf9f8] border border-[#e4beba] rounded-xl p-4 shadow-xs flex flex-col gap-3">
          <h3 className="font-bold text-sm text-[#1b1c1c] uppercase tracking-wider">
            Dispatch Configuration
          </h3>

          <div>
            <label className="block text-xs font-bold text-[#1b1c1c] mb-1">
              Central Emergency Relay Number
            </label>
            <input
              type="text"
              value={emergencyPhone}
              onChange={(e) => setEmergencyPhone(e.target.value)}
              className="w-full bg-white border border-[#e4beba] rounded-lg p-2.5 text-xs text-[#1b1c1c]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1b1c1c] mb-1">
              Dispatcher Station Callsign
            </label>
            <input
              type="text"
              value={callsignPrefix}
              onChange={(e) => setCallsignPrefix(e.target.value)}
              className="w-full bg-white border border-[#e4beba] rounded-lg p-2.5 text-xs text-[#1b1c1c]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1b1c1c] mb-1">
              GPS Polling Interval
            </label>
            <select
              value={gpsRefreshRate}
              onChange={(e) => setGpsRefreshRate(e.target.value)}
              className="w-full bg-white border border-[#e4beba] rounded-lg p-2.5 text-xs text-[#1b1c1c]"
            >
              <option value="1s">1 second (High Precision Mission Critical)</option>
              <option value="5s">5 seconds (Standard Battery Balanced)</option>
              <option value="15s">15 seconds (Power Saver Mode)</option>
            </select>
          </div>
        </div>

        {savedNotice && (
          <div className="p-3 bg-[#e8f5e9] border border-[#81c784] text-[#1b5e20] text-xs font-semibold rounded-xl text-center">
            Settings saved successfully.
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            className="flex-1 bg-[#af101a] text-white py-3 rounded-xl font-bold text-sm hover:bg-[#930010] transition-colors shadow-xs cursor-pointer"
          >
            Save Configuration
          </button>
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="px-5 py-3 border border-[#e4beba] text-[#1b1c1c] rounded-xl font-bold text-sm hover:bg-[#f6f3f2] transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </form>
    </div>
  );
};
