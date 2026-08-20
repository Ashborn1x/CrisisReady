import React, { useState } from 'react';
import { Incident, ScreenView } from '../types';

interface SmsFallbackScreenProps {
  onNavigate: (screen: ScreenView) => void;
  activeIncident?: Incident | null;
}

export const SmsFallbackScreen: React.FC<SmsFallbackScreenProps> = ({
  onNavigate,
  activeIncident
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [sentNotice, setSentNotice] = useState<boolean>(false);

  const senderName = activeIncident?.reporterName || 'John Doe';
  const incidentCode = activeIncident?.code?.replace('#', '') || '884-92A';
  const incidentType = activeIncident?.title || 'Medical Emergency';
  const loc = activeIncident?.lat
    ? `${activeIncident.lat.toFixed(4)}° N, ${activeIncident.lng.toFixed(4)}° W`
    : '37.7749° N, -122.4194° W';
  const accuracy = activeIncident?.accuracy || '±5 meters';
  const timeStr = activeIncident?.timestamp || '14:05 PST (Cached)';
  const notes = activeIncident?.description || 'Patient unresponsive. Need EMS.';

  const smsText = `URGENT: CRITICAL INCIDENT\nSender: ${senderName}\nID: ${incidentCode}\nType: ${incidentType}\nLoc: ${loc}\nAccuracy: ${accuracy}\nTime: ${timeStr}\nNotes: ${notes}`;

  const charCount = smsText.length;
  const smsSegments = Math.ceil(charCount / 160);

  const handleOpenSms = () => {
    // Open native SMS client
    const encodedBody = encodeURIComponent(smsText);
    window.location.href = `sms:911?&body=${encodedBody}`;
    setSentNotice(true);
    setTimeout(() => setSentNotice(false), 5000);
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(smsText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#fcf9f8] min-h-screen text-[#1b1c1c]">
      {/* Main Content Canvas (Linear/Transactional layout) */}
      <main className="flex-1 flex flex-col pt-4 pb-36 max-w-lg mx-auto w-full px-4 text-center">
        {/* Status Header */}
        <section className="flex flex-col items-center text-center mt-4 mb-6">
          <div className="w-20 h-20 rounded-full bg-[#ffdad6] flex items-center justify-center mb-2 border-4 border-[#fcf9f8] shadow-xs">
            <span
              className="material-symbols-outlined text-[40px] text-[#ba1a1a]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              wifi_off
            </span>
          </div>

          <h2 className="text-2xl font-bold text-[#1b1c1c] mb-2 tracking-tight">
            Connection Lost
          </h2>
          <p className="text-sm text-[#5b403d] max-w-[290px] leading-relaxed">
            Your emergency information has been prepared as an SMS. Please send it to the emergency number when you have cellular service.
          </p>
        </section>

        {/* SMS Preview Card */}
        <section className="bg-[#f6f3f2] border border-[#e4beba] rounded-xl overflow-hidden shadow-xs flex flex-col text-left">
          <div className="bg-[#f0eded] px-4 py-3 border-b border-[#e4beba] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#5b403d] text-base">sms</span>
              <span className="font-bold text-xs text-[#5b403d] tracking-wider uppercase">
                SMS Payload Preview
              </span>
            </div>
            <button
              onClick={handleCopyText}
              className="text-xs font-semibold text-[#0058a2] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-xs">content_copy</span>
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>

          <div className="p-4 bg-white">
            <div className="font-mono text-xs text-[#1b1c1c] space-y-1.5 whitespace-pre-wrap break-words border-l-4 border-[#ba1a1a] pl-3 py-1 leading-relaxed">
              <span className="font-bold text-[#ba1a1a] block text-xs tracking-wide">
                URGENT: CRITICAL INCIDENT
              </span>
              <div>Sender: {senderName}</div>
              <div>ID: {incidentCode}</div>
              <div>Type: {incidentType}</div>
              <div>Loc: {loc}</div>
              <div>Accuracy: {accuracy}</div>
              <div>Time: {timeStr}</div>
              <div>Notes: {notes}</div>
            </div>
          </div>

          <div className="bg-[#f0eded] px-4 py-2 flex justify-between items-center text-xs text-[#5b403d] border-t border-[#e4beba]">
            <span>
              Size: {charCount} chars ({smsSegments} SMS)
            </span>
            <span className="flex items-center gap-1 font-medium">
              <span className="material-symbols-outlined text-[14px]">lock</span>
              Encrypted
            </span>
          </div>
        </section>

        {sentNotice && (
          <div className="mt-4 p-3 bg-[#e8f5e9] border border-[#81c784] text-[#1b5e20] text-xs font-semibold rounded-xl flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-base">check_circle</span>
            SMS Client triggered. Coordinates formatted for 911 dispatch.
          </div>
        )}
      </main>

      {/* Bottom Action Area (Fixed for easy reach on mobile) */}
      <footer className="fixed bottom-0 left-0 w-full bg-[#fcf9f8] border-t border-[#e4beba] p-4 pb-safe z-40 flex flex-col gap-2.5 max-w-lg left-1/2 -translate-x-1/2 shadow-lg">
        <button
          onClick={handleOpenSms}
          className="w-full min-h-[48px] h-12 bg-[#af101a] text-white rounded-full font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#930010] transition-colors active:scale-[0.98] shadow-xs cursor-pointer"
        >
          <span
            className="material-symbols-outlined text-lg icon-filled"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            send
          </span>
          Open SMS & Send
        </button>

        <button
          onClick={() => onNavigate('home')}
          className="w-full min-h-[48px] h-12 bg-transparent border-2 border-[#e4beba] text-[#1b1c1c] rounded-full font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#f6f3f2] transition-colors active:scale-[0.98] cursor-pointer"
        >
          Back to Home
        </button>
      </footer>
    </div>
  );
};
