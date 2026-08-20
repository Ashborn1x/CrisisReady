import React, { useState, useEffect } from 'react';
import { Incident, IncidentType, ScreenView, UrgencyLevel } from '../types';

interface NewReportScreenProps {
  onNavigate: (screen: ScreenView) => void;
  onSubmitReport: (newIncident: Partial<Incident>) => void;
  isOffline: boolean;
  prefillType?: IncidentType;
}

export const NewReportScreen: React.FC<NewReportScreenProps> = ({
  onNavigate,
  onSubmitReport,
  isOffline,
  prefillType = 'medical'
}) => {
  const [urgency, setUrgency] = useState<UrgencyLevel>('critical');
  const [incidentType, setIncidentType] = useState<IncidentType>(prefillType);
  const [description, setDescription] = useState<string>('');
  const [currentTime, setCurrentTime] = useState<string>('14:32:05 PST');
  const [coords] = useState<{ lat: string; lng: string }>({
    lat: '34.0522° N',
    lng: '-118.2437° W'
  });
  const [reporterName, setReporterName] = useState<string>('Jane Doe');
  const [reporterRole, setReporterRole] = useState<string>('Citizen');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour12: false }) + ' Local');
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const codeNum = Math.floor(1000 + Math.random() * 9000);
    const incidentData: Partial<Incident> = {
      id: `inc-${Date.now()}`,
      code: `#INC-${codeNum}`,
      title: `${incidentType.charAt(0).toUpperCase() + incidentType.slice(1)} Incident`,
      type: incidentType,
      urgency,
      status: 'pending',
      locationName: 'Current GPS Location (34.0522° N, -118.2437° W)',
      lat: 34.0522,
      lng: -118.2437,
      timeAgo: 'Just now',
      timestamp: currentTime,
      reporterName,
      reporterRole,
      description: description || 'Immediate assistance requested by citizen reporter.',
      accuracy: '±5 meters',
      stage: 1,
      commsLog: [
        {
          id: `msg-${Date.now()}`,
          sender: 'Automated CAD',
          senderType: 'bot',
          text: `Emergency report received via ${isOffline ? 'SMS fallback dispatch' : 'direct uplink'}. GPS coordinates locked.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
        }
      ]
    };

    setTimeout(() => {
      setIsSubmitting(false);
      onSubmitReport(incidentData);
      if (isOffline) {
        onNavigate('sms_fallback');
      } else {
        onNavigate('responder_incident');
      }
    }, 400);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#fcf9f8] min-h-screen">
      {/* Offline Banner if disconnected */}
      {isOffline && (
        <div
          id="offline-banner"
          className="bg-[#ffdad6] text-[#93000a] px-4 py-3 flex items-center gap-3 w-full z-40 shadow-xs border-b-2 border-[#ba1a1a]"
        >
          <span
            className="material-symbols-outlined text-[#ba1a1a] shrink-0"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            wifi_off
          </span>
          <div className="flex-1 text-left">
            <p className="font-bold text-xs text-[#ba1a1a] uppercase tracking-wide">
              No Internet Connection
            </p>
            <p className="text-xs text-[#5b403d] mt-0.5">
              Switching to SMS Fallback. Report will be encoded and sent via text.
            </p>
          </div>
        </div>
      )}

      {/* Main Form Content Canvas */}
      <main className="flex-1 pt-4 pb-28 px-4 md:px-8 max-w-2xl mx-auto w-full">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Read-Only Metadata Card */}
          <section className="bg-[#f6f3f2] rounded-xl p-4 border border-[#e4beba] flex flex-col gap-3 shadow-xs">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[#0058a2]">my_location</span>
              <div className="flex-1 text-left">
                <p className="font-bold text-xs text-[#5b403d] uppercase tracking-wider">
                  Current Location
                </p>
                <p className="font-data-tabular text-sm font-semibold text-[#1b1c1c]">
                  {coords.lat}, {coords.lng} (Est. 12m)
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[#0058a2]">schedule</span>
              <div className="flex-1 text-left">
                <p className="font-bold text-xs text-[#5b403d] uppercase tracking-wider">Time</p>
                <p className="font-data-tabular text-sm font-semibold text-[#1b1c1c]">{currentTime}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[#0058a2]">person</span>
              <div className="flex-1 text-left">
                <p className="font-bold text-xs text-[#5b403d] uppercase tracking-wider">
                  Reporting As
                </p>
                <p className="text-sm font-semibold text-[#1b1c1c]">
                  {reporterName} ({reporterRole})
                </p>
              </div>
            </div>
          </section>

          {/* Urgency Selector */}
          <section className="text-left">
            <fieldset>
              <legend className="font-bold text-sm text-[#1b1c1c] mb-2.5">
                Urgency Level <span className="text-[#ba1a1a]">*</span>
              </legend>
              <div className="grid grid-cols-2 gap-2.5">
                {/* Low */}
                <label className="relative flex cursor-pointer group">
                  <input
                    type="radio"
                    name="urgency"
                    value="low"
                    checked={urgency === 'low'}
                    onChange={() => setUrgency('low')}
                    className="peer sr-only"
                  />
                  <div className="w-full min-h-[48px] flex items-center justify-center p-3 rounded-xl border-2 border-[#e4beba] bg-[#f6f3f2] peer-checked:border-[#0058a2] peer-checked:bg-[#0770cc] peer-checked:text-white transition-all duration-150 shadow-xs active:scale-[0.98]">
                    <span className="font-bold text-sm">Low</span>
                  </div>
                </label>

                {/* Medium */}
                <label className="relative flex cursor-pointer group">
                  <input
                    type="radio"
                    name="urgency"
                    value="medium"
                    checked={urgency === 'medium'}
                    onChange={() => setUrgency('medium')}
                    className="peer sr-only"
                  />
                  <div className="w-full min-h-[48px] flex items-center justify-center p-3 rounded-xl border-2 border-[#e4beba] bg-[#f6f3f2] peer-checked:border-[#795900] peer-checked:bg-[#fec330] peer-checked:text-[#261a00] transition-all duration-150 shadow-xs active:scale-[0.98]">
                    <span className="font-bold text-sm">Medium</span>
                  </div>
                </label>

                {/* High */}
                <label className="relative flex cursor-pointer group">
                  <input
                    type="radio"
                    name="urgency"
                    value="high"
                    checked={urgency === 'high'}
                    onChange={() => setUrgency('high')}
                    className="peer sr-only"
                  />
                  <div className="w-full min-h-[48px] flex items-center justify-center p-3 rounded-xl border-2 border-[#e4beba] bg-[#f6f3f2] peer-checked:border-[#e65100] peer-checked:bg-[#fff3e0] peer-checked:text-[#e65100] transition-all duration-150 shadow-xs active:scale-[0.98]">
                    <span className="font-bold text-sm">High</span>
                  </div>
                </label>

                {/* Critical */}
                <label className="relative flex cursor-pointer group">
                  <input
                    type="radio"
                    name="urgency"
                    value="critical"
                    checked={urgency === 'critical'}
                    onChange={() => setUrgency('critical')}
                    className="peer sr-only"
                  />
                  <div className="w-full min-h-[48px] flex items-center justify-center p-3 rounded-xl border-2 border-[#e4beba] bg-[#f6f3f2] peer-checked:border-[#ba1a1a] peer-checked:bg-[#ffdad6] peer-checked:text-[#93000a] transition-all duration-150 shadow-xs active:scale-[0.98]">
                    <span className="font-bold text-sm flex items-center gap-1.5">
                      <span
                        className="material-symbols-outlined text-[18px] icon-filled"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        warning
                      </span>
                      Critical
                    </span>
                  </div>
                </label>
              </div>
            </fieldset>
          </section>

          {/* Incident Type Selector */}
          <section className="text-left">
            <fieldset>
              <legend className="font-bold text-sm text-[#1b1c1c] mb-2.5">
                Incident Type <span className="text-[#ba1a1a]">*</span>
              </legend>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                {/* Medical */}
                <label className="relative flex cursor-pointer group">
                  <input
                    type="radio"
                    name="incident_type"
                    value="medical"
                    checked={incidentType === 'medical'}
                    onChange={() => setIncidentType('medical')}
                    className="peer sr-only"
                  />
                  <div className="w-full flex flex-col items-center justify-center p-4 rounded-xl border-2 border-[#e4beba] bg-[#f6f3f2] peer-checked:border-[#af101a] peer-checked:bg-[#d32f2f] peer-checked:text-white transition-all duration-150 shadow-xs active:scale-[0.98]">
                    <span
                      className="material-symbols-outlined mb-2 text-2xl icon-filled"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      medical_services
                    </span>
                    <span className="font-bold text-xs text-center">Medical</span>
                  </div>
                </label>

                {/* Fire */}
                <label className="relative flex cursor-pointer group">
                  <input
                    type="radio"
                    name="incident_type"
                    value="fire"
                    checked={incidentType === 'fire'}
                    onChange={() => setIncidentType('fire')}
                    className="peer sr-only"
                  />
                  <div className="w-full flex flex-col items-center justify-center p-4 rounded-xl border-2 border-[#e4beba] bg-[#f6f3f2] peer-checked:border-[#af101a] peer-checked:bg-[#d32f2f] peer-checked:text-white transition-all duration-150 shadow-xs active:scale-[0.98]">
                    <span
                      className="material-symbols-outlined mb-2 text-2xl icon-filled"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      local_fire_department
                    </span>
                    <span className="font-bold text-xs text-center">Fire</span>
                  </div>
                </label>

                {/* Accident */}
                <label className="relative flex cursor-pointer group">
                  <input
                    type="radio"
                    name="incident_type"
                    value="accident"
                    checked={incidentType === 'accident'}
                    onChange={() => setIncidentType('accident')}
                    className="peer sr-only"
                  />
                  <div className="w-full flex flex-col items-center justify-center p-4 rounded-xl border-2 border-[#e4beba] bg-[#f6f3f2] peer-checked:border-[#af101a] peer-checked:bg-[#d32f2f] peer-checked:text-white transition-all duration-150 shadow-xs active:scale-[0.98]">
                    <span
                      className="material-symbols-outlined mb-2 text-2xl icon-filled"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      car_crash
                    </span>
                    <span className="font-bold text-xs text-center">Accident</span>
                  </div>
                </label>

                {/* Flood */}
                <label className="relative flex cursor-pointer group">
                  <input
                    type="radio"
                    name="incident_type"
                    value="flood"
                    checked={incidentType === 'flood'}
                    onChange={() => setIncidentType('flood')}
                    className="peer sr-only"
                  />
                  <div className="w-full flex flex-col items-center justify-center p-4 rounded-xl border-2 border-[#e4beba] bg-[#f6f3f2] peer-checked:border-[#af101a] peer-checked:bg-[#d32f2f] peer-checked:text-white transition-all duration-150 shadow-xs active:scale-[0.98]">
                    <span
                      className="material-symbols-outlined mb-2 text-2xl icon-filled"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      water_drop
                    </span>
                    <span className="font-bold text-xs text-center">Flood</span>
                  </div>
                </label>
              </div>
            </fieldset>
          </section>

          {/* Description */}
          <section className="text-left">
            <label htmlFor="description" className="block font-bold text-sm text-[#1b1c1c] mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide any additional details about the situation..."
              rows={4}
              className="w-full rounded-xl border-2 border-[#e4beba] bg-white p-3.5 text-sm text-[#1b1c1c] placeholder:text-[#8f6f6c] focus:border-[#af101a] focus:ring-2 focus:ring-[#ffdad6] outline-none transition-all resize-none shadow-xs"
            ></textarea>
          </section>

          {/* Fixed/Sticky Bottom Submit Button */}
          <div className="fixed bottom-0 left-0 w-full p-4 bg-[#fcf9f8]/95 backdrop-blur-md border-t border-[#e4beba] z-40 md:relative md:bg-transparent md:border-none md:p-0 md:mt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full min-h-[56px] h-16 bg-[#af101a] hover:bg-[#930010] text-white font-bold text-lg rounded-xl flex items-center justify-center gap-3 shadow-md transition-all duration-150 focus:outline-none focus:ring-4 focus:ring-[#ffdad6] active:scale-[0.98] uppercase tracking-wider cursor-pointer disabled:opacity-75"
            >
              <span
                className="material-symbols-outlined text-2xl icon-filled"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                send
              </span>
              {isSubmitting ? 'Transmitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};
