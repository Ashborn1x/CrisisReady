import React, { useState } from 'react';
import { DispatcherProfile } from '../types';

interface DispatcherProfileViewProps {
  profile: DispatcherProfile;
  onUpdateProfile: (updated: Partial<DispatcherProfile>) => void;
  onBackToCAD?: () => void;
}

export const DispatcherProfileView: React.FC<DispatcherProfileViewProps> = ({
  profile,
  onUpdateProfile,
  onBackToCAD
}) => {
  const [shiftNote, setShiftNote] = useState('');
  const [savedNotes, setSavedNotes] = useState<string[]>([
    'Shift started 07:00. Radio checks confirmed with TAC-1 and TAC-3.',
    'Console 04 headset calibrated. Backup cellular failover verified.'
  ]);
  const [activeFrequency, setActiveFrequency] = useState<string>(profile.assignedFrequencies[0]);
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [phoneExt, setPhoneExt] = useState(profile.phoneExtension);
  const [email, setEmail] = useState(profile.email);

  const handleStatusChange = (status: DispatcherProfile['status']) => {
    onUpdateProfile({ status });
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shiftNote.trim()) return;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setSavedNotes([`[${timestamp}] ${shiftNote.trim()}`, ...savedNotes]);
    setShiftNote('');
  };

  const handleSaveContact = () => {
    onUpdateProfile({ phoneExtension: phoneExt, email });
    setIsEditingContact(false);
  };

  return (
    <div id="dispatcher-profile-view" className="flex-1 flex flex-col h-full bg-[#f6f3f2] overflow-y-auto p-4 md:p-6 lg:p-8">
      {/* Header with Navigation */}
      <div className="max-w-5xl mx-auto w-full space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onBackToCAD && (
              <button
                onClick={onBackToCAD}
                className="p-2 rounded-xl bg-white border border-[#e4beba] text-[#5b403d] hover:bg-[#f0eded] transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold"
              >
                <span className="material-symbols-outlined text-base">arrow_back</span>
                <span>Back to Live CAD</span>
              </button>
            )}
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-[#1b1c1c]">Dispatcher Profile & Console Hub</h1>
              <p className="text-xs text-[#5b403d]">Operator credential verification, shift performance & frequency status</p>
            </div>
          </div>

          <span className="px-3 py-1 bg-[#af101a]/10 border border-[#af101a]/20 text-[#af101a] text-xs font-mono font-bold rounded-lg flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm">verified_user</span>
            <span>Badge {profile.badgeNumber}</span>
          </span>
        </div>

        {/* Primary Profile Card */}
        <div className="bg-white rounded-2xl border border-[#e4beba] p-5 md:p-6 shadow-xs">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 pb-6 border-b border-[#f0eded]">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={profile.avatarUrl}
                  alt={profile.name}
                  referrerPolicy="no-referrer"
                  className="w-18 h-18 md:w-20 md:h-20 rounded-2xl object-cover border-2 border-[#af101a]/20 shadow-sm"
                />
                <span
                  className={`absolute -bottom-1 -right-1 px-2 py-0.5 rounded-md text-[10px] font-bold text-white uppercase ${
                    profile.status === 'on_duty'
                      ? 'bg-[#15803d]'
                      : profile.status === 'on_call'
                      ? 'bg-[#d97706]'
                      : 'bg-[#64748b]'
                  }`}
                >
                  {profile.status.replace('_', ' ')}
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-[#1b1c1c]">{profile.name}</h2>
                  <span className="text-xs font-mono bg-[#f0eded] text-[#5b403d] px-2 py-0.5 rounded font-semibold">
                    {profile.badgeNumber}
                  </span>
                </div>
                <p className="text-sm text-[#5b403d] font-medium">{profile.roleTitle}</p>
                <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-[#705754]">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm text-[#0058a2]">apartment</span>
                    {profile.center}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-mono">
                    <span className="material-symbols-outlined text-sm text-[#af101a]">desktop_windows</span>
                    {profile.consoleNumber}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Duty Status Switcher */}
            <div className="flex flex-col gap-2 w-full md:w-auto">
              <span className="text-[11px] font-bold text-[#5b403d] uppercase tracking-wider">
                Duty Mode Control:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-[#f6f3f2] rounded-xl border border-[#e4beba]">
                {(['on_duty', 'on_call', 'break', 'training'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => handleStatusChange(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all capitalize cursor-pointer ${
                      profile.status === st
                        ? 'bg-[#1b1c1c] text-white shadow-xs'
                        : 'text-[#5b403d] hover:bg-white'
                    }`}
                  >
                    {st.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Details & Shift Info */}
          <div className="pt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-3 bg-[#fbf9f8] rounded-xl border border-[#f0eded]">
              <span className="text-[#8f6f6c] block text-[11px] mb-0.5">Shift Window</span>
              <span className="font-bold text-[#1b1c1c]">{profile.shift}</span>
              <span className="text-[10px] text-emerald-600 block mt-0.5 font-medium">Logged in: {profile.shiftStartTime}</span>
            </div>

            <div className="p-3 bg-[#fbf9f8] rounded-xl border border-[#f0eded]">
              <span className="text-[#8f6f6c] block text-[11px] mb-0.5">Direct Extension</span>
              {isEditingContact ? (
                <input
                  type="text"
                  value={phoneExt}
                  onChange={(e) => setPhoneExt(e.target.value)}
                  className="w-full text-xs font-bold text-[#1b1c1c] bg-white border border-[#e4beba] rounded px-1.5 py-0.5"
                />
              ) : (
                <span className="font-bold font-mono text-[#1b1c1c]">{profile.phoneExtension}</span>
              )}
              <span className="text-[10px] text-[#5b403d] block mt-0.5">Secure CAD Intercom</span>
            </div>

            <div className="p-3 bg-[#fbf9f8] rounded-xl border border-[#f0eded]">
              <span className="text-[#8f6f6c] block text-[11px] mb-0.5">Official Email</span>
              {isEditingContact ? (
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs font-bold text-[#1b1c1c] bg-white border border-[#e4beba] rounded px-1.5 py-0.5"
                />
              ) : (
                <span className="font-bold text-[#1b1c1c] truncate block">{profile.email}</span>
              )}
              <span className="text-[10px] text-[#5b403d] block mt-0.5">Emergency Gov Network</span>
            </div>

            <div className="p-3 bg-[#fbf9f8] rounded-xl border border-[#f0eded] flex items-center justify-between">
              <div>
                <span className="text-[#8f6f6c] block text-[11px] mb-0.5">Contact Settings</span>
                <span className="text-[10px] text-[#5b403d]">Station Handover</span>
              </div>
              {isEditingContact ? (
                <button
                  onClick={handleSaveContact}
                  className="px-2.5 py-1 bg-[#af101a] text-white rounded text-xs font-bold cursor-pointer"
                >
                  Save
                </button>
              ) : (
                <button
                  onClick={() => setIsEditingContact(true)}
                  className="px-2 py-1 bg-white border border-[#e4beba] text-[#5b403d] hover:bg-[#f0eded] rounded text-xs font-semibold cursor-pointer"
                >
                  Edit
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Shift Performance Metrics */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-[#1b1c1c] uppercase tracking-wider flex items-center gap-2">
            <span className="material-symbols-outlined text-base text-[#af101a]">analytics</span>
            <span>Shift Telemetry & Performance Metrics</span>
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="bg-white p-4 rounded-xl border border-[#e4beba] shadow-xs">
              <span className="text-[11px] text-[#8f6f6c] block font-medium">Calls Answered</span>
              <span className="text-2xl font-bold font-mono text-[#1b1c1c] mt-1 block">
                {profile.stats.callsAnsweredToday}
              </span>
              <span className="text-[10px] text-emerald-600 font-semibold mt-0.5 block">100% Picked Up &lt; 3 Rings</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-[#e4beba] shadow-xs">
              <span className="text-[11px] text-[#8f6f6c] block font-medium">Avg Triage Speed</span>
              <span className="text-2xl font-bold font-mono text-[#0058a2] mt-1 block">
                {profile.stats.avgTriageTime}
              </span>
              <span className="text-[10px] text-[#5b403d] font-semibold mt-0.5 block">Target: &lt; 60s SLA</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-[#e4beba] shadow-xs">
              <span className="text-[11px] text-[#8f6f6c] block font-medium">Dispatches Made</span>
              <span className="text-2xl font-bold font-mono text-[#af101a] mt-1 block">
                {profile.stats.totalDispatches}
              </span>
              <span className="text-[10px] text-[#5b403d] font-semibold mt-0.5 block">Units En Route</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-[#e4beba] shadow-xs">
              <span className="text-[11px] text-[#8f6f6c] block font-medium">SLA Compliance</span>
              <span className="text-2xl font-bold font-mono text-emerald-600 mt-1 block">
                {profile.stats.slaCompliance}
              </span>
              <span className="text-[10px] text-emerald-600 font-semibold mt-0.5 block">Exceeds 98% Benchmark</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-[#e4beba] shadow-xs col-span-2 md:col-span-1">
              <span className="text-[11px] text-[#8f6f6c] block font-medium">Critical Priority 1</span>
              <span className="text-2xl font-bold font-mono text-[#ba1a1a] mt-1 block">
                {profile.stats.criticalHandled}
              </span>
              <span className="text-[10px] text-[#ba1a1a] font-semibold mt-0.5 block">Zero Escalation Drops</span>
            </div>
          </div>
        </div>

        {/* Radio Channels & Certifications Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Radio Frequency Channels */}
          <div className="bg-white p-5 rounded-2xl border border-[#e4beba] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#1b1c1c] flex items-center gap-2">
                <span className="material-symbols-outlined text-base text-[#0058a2]">radio</span>
                <span>Active Radio Frequency Channels</span>
              </h3>
              <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                VOICE NET LIVE
              </span>
            </div>

            <div className="space-y-2">
              {profile.assignedFrequencies.map((freq, idx) => {
                const isSelected = activeFrequency === freq;
                return (
                  <div
                    key={idx}
                    onClick={() => setActiveFrequency(freq)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border-[#0058a2] bg-[#f0f7ff] shadow-xs'
                        : 'border-[#f0eded] hover:bg-[#fbf9f8]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-2.5 h-2.5 rounded-full ${isSelected ? 'bg-[#0058a2] animate-ping' : 'bg-emerald-500'}`} />
                      <div>
                        <span className="text-xs font-mono font-bold text-[#1b1c1c] block">{freq}</span>
                        <span className="text-[10px] text-[#5b403d]">Direct Inter-agency Link</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                        isSelected
                          ? 'bg-[#0058a2] text-white'
                          : 'bg-[#f0eded] text-[#5b403d] hover:bg-[#e4beba]'
                      }`}
                    >
                      {isSelected ? 'Transmitting' : 'Listen'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Telecommunicator Certifications */}
          <div className="bg-white p-5 rounded-2xl border border-[#e4beba] shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-[#1b1c1c] flex items-center gap-2">
              <span className="material-symbols-outlined text-base text-[#af101a]">school</span>
              <span>Operator Certifications & Credentials</span>
            </h3>

            <div className="space-y-2">
              {profile.certifications.map((cert, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-[#fbf9f8] rounded-xl border border-[#f0eded] flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-emerald-600 text-lg">verified</span>
                    <span className="text-xs font-bold text-[#1b1c1c]">{cert}</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                    ACTIVE
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Shift Handoff Notes */}
        <div className="bg-white p-5 rounded-2xl border border-[#e4beba] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#1b1c1c] flex items-center gap-2">
              <span className="material-symbols-outlined text-base text-[#5b403d]">edit_note</span>
              <span>Shift Handoff Log & Operator Notes</span>
            </h3>
            <span className="text-xs text-[#8f6f6c]">{savedNotes.length} notes logged</span>
          </div>

          <form onSubmit={handleAddNote} className="flex gap-2">
            <input
              type="text"
              value={shiftNote}
              onChange={(e) => setShiftNote(e.target.value)}
              placeholder="Log dispatch handover note, equipment check, or incident remark..."
              className="flex-1 px-3 py-2 bg-[#f6f3f2] border border-[#e4beba] rounded-xl text-xs text-[#1b1c1c] placeholder:text-[#8f6f6c] focus:outline-none focus:ring-1 focus:ring-[#af101a]"
            />
            <button
              type="submit"
              disabled={!shiftNote.trim()}
              className="px-4 py-2 bg-[#af101a] text-white rounded-xl text-xs font-bold hover:bg-[#8f0d15] disabled:opacity-50 transition-colors cursor-pointer"
            >
              Add Entry
            </button>
          </form>

          <div className="space-y-2 pt-1">
            {savedNotes.map((note, idx) => (
              <div
                key={idx}
                className="p-3 bg-[#fbf9f8] rounded-xl border border-[#f0eded] text-xs text-[#1b1c1c] font-medium flex items-start gap-2"
              >
                <span className="material-symbols-outlined text-base text-[#af101a] shrink-0 mt-0.5">
                  sticky_note_2
                </span>
                <span>{note}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
