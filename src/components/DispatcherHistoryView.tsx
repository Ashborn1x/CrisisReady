import React, { useState } from 'react';
import { DispatchHistoryItem } from '../types';

interface DispatcherHistoryViewProps {
  historyLogs: DispatchHistoryItem[];
  onSelectHistoricalIncident?: (item: DispatchHistoryItem) => void;
  onBackToCAD?: () => void;
}

export const DispatcherHistoryView: React.FC<DispatcherHistoryViewProps> = ({
  historyLogs,
  onBackToCAD
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedOutcome, setSelectedOutcome] = useState<string>('all');
  const [selectedLog, setSelectedLog] = useState<DispatchHistoryItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filter history
  const filteredLogs = historyLogs.filter((item) => {
    const matchesSearch =
      item.incidentCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.callerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.dispatchedUnit.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (selectedType !== 'all' && item.type !== selectedType) return false;
    if (selectedOutcome !== 'all' && item.outcome !== selectedOutcome) return false;
    return true;
  });

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'critical':
        return 'bg-[#ffdad6] text-[#93000a] border-[#ffb4ab]';
      case 'high':
        return 'bg-[#ffebd8] text-[#8c3b00] border-[#ffd0b0]';
      case 'medium':
        return 'bg-[#fff4d4] text-[#7a5800] border-[#ffe8a3]';
      default:
        return 'bg-[#e0f2fe] text-[#0369a1] border-[#bae6fd]';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'medical':
        return 'medical_services';
      case 'fire':
        return 'local_fire_department';
      case 'accident':
        return 'car_crash';
      case 'police':
        return 'local_police';
      default:
        return 'emergency';
    }
  };

  const handleCopyLog = (item: DispatchHistoryItem) => {
    const reportText = `[DISPATCH REPORT - ${item.incidentCode}]\nTitle: ${item.title}\nTime: ${item.timestamp} -> ${item.resolvedAt} (${item.duration})\nLocation: ${item.location}\nCaller: ${item.callerName}\nUnit: ${item.dispatchedUnit} (${item.stationInvolved})\nOutcome: ${item.outcome}\nTriage Speed: ${item.triageTimeSec}s\nNotes: ${item.operatorNotes}`;
    navigator.clipboard?.writeText(reportText);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div id="dispatcher-history-view" className="flex-1 flex flex-col h-full bg-[#f6f3f2] overflow-y-auto p-4 md:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto w-full space-y-6">
        {/* Header with Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
              <h1 className="text-xl md:text-2xl font-bold text-[#1b1c1c]">Call & Dispatch Incident History</h1>
              <p className="text-xs text-[#5b403d]">Historical dispatch records, response durations & operator SITREPs</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-3 py-1.5 bg-white border border-[#e4beba] rounded-xl text-[#1b1c1c] shadow-xs">
              {filteredLogs.length} Records Found
            </span>
          </div>
        </div>

        {/* History Summary KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white p-4 rounded-xl border border-[#e4beba] shadow-xs">
            <span className="text-[11px] text-[#8f6f6c] block font-medium">Logged Dispatches</span>
            <span className="text-2xl font-bold font-mono text-[#1b1c1c] mt-1 block">
              {historyLogs.length}
            </span>
            <span className="text-[10px] text-emerald-600 font-semibold mt-0.5 block">100% Closed & Documented</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#e4beba] shadow-xs">
            <span className="text-[11px] text-[#8f6f6c] block font-medium">Avg Scene Duration</span>
            <span className="text-2xl font-bold font-mono text-[#0058a2] mt-1 block">
              32.6m
            </span>
            <span className="text-[10px] text-[#5b403d] font-semibold mt-0.5 block">Within Target Window</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#e4beba] shadow-xs">
            <span className="text-[11px] text-[#8f6f6c] block font-medium">Fastest Triage Speed</span>
            <span className="text-2xl font-bold font-mono text-emerald-600 mt-1 block">
              20s
            </span>
            <span className="text-[10px] text-emerald-600 font-semibold mt-0.5 block">#INC-8829 Alarm Check</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#e4beba] shadow-xs">
            <span className="text-[11px] text-[#8f6f6c] block font-medium">Lives Assisted</span>
            <span className="text-2xl font-bold font-mono text-[#af101a] mt-1 block">
              8 Persons
            </span>
            <span className="text-[10px] text-[#5b403d] font-semibold mt-0.5 block">Direct Pre-Arrival Care</span>
          </div>
        </div>

        {/* Filter and Search Controls */}
        <div className="bg-white p-4 rounded-2xl border border-[#e4beba] shadow-xs space-y-3">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#5b403d] text-lg">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search history by incident code, location, unit, or caller..."
                className="w-full pl-9 pr-3 py-2 bg-[#f6f3f2] border border-[#e4beba] rounded-xl text-xs text-[#1b1c1c] placeholder:text-[#8f6f6c] focus:outline-none focus:ring-1 focus:ring-[#af101a]"
              />
            </div>

            {/* Type Filters */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1 md:pb-0">
              {(['all', 'medical', 'fire', 'accident'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all capitalize cursor-pointer shrink-0 ${
                    selectedType === type
                      ? 'bg-[#1b1c1c] text-white shadow-xs'
                      : 'bg-[#f0eded] text-[#5b403d] hover:bg-[#eae7e7]'
                  }`}
                >
                  {type === 'all' ? 'All Types' : type}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Historical Call Log List */}
        <div className="space-y-3">
          {filteredLogs.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#e4beba] p-12 text-center text-[#5b403d]">
              <span className="material-symbols-outlined text-4xl text-[#8f6f6c] mb-2">
                manage_search
              </span>
              <p className="font-bold text-sm">No historical dispatch records found</p>
              <p className="text-xs text-[#8f6f6c] mt-1">Try clearing or adjusting your search filters above.</p>
            </div>
          ) : (
            filteredLogs.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-[#e4beba] p-4 md:p-5 shadow-xs hover:border-[#af101a]/40 transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#f0eded]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#f6f3f2] border border-[#e4beba] flex items-center justify-center text-[#af101a]">
                      <span className="material-symbols-outlined text-xl">
                        {getTypeIcon(item.type)}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#1b1c1c]">{item.title}</span>
                        <span className="font-mono text-xs font-bold text-[#5b403d] bg-[#f0eded] px-2 py-0.5 rounded">
                          {item.incidentCode}
                        </span>
                      </div>
                      <p className="text-xs text-[#705754] flex items-center gap-1.5 mt-0.5">
                        <span className="material-symbols-outlined text-sm text-[#af101a]">location_on</span>
                        <span>{item.location}</span>
                        <span>•</span>
                        <span className="text-[#5b403d]">Caller: {item.callerName}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border uppercase ${getUrgencyBadge(item.urgency)}`}>
                      {item.urgency}
                    </span>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {item.outcome}
                    </span>
                  </div>
                </div>

                {/* Dispatch Logistics & Times */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-[#fbf9f8] p-3 rounded-xl border border-[#f0eded]">
                  <div>
                    <span className="text-[#8f6f6c] block text-[10px]">Call Time / Resolved</span>
                    <span className="font-mono font-bold text-[#1b1c1c]">{item.timestamp} &rarr; {item.resolvedAt}</span>
                  </div>

                  <div>
                    <span className="text-[#8f6f6c] block text-[10px]">Total Scene Duration</span>
                    <span className="font-mono font-bold text-[#0058a2]">{item.duration}</span>
                  </div>

                  <div>
                    <span className="text-[#8f6f6c] block text-[10px]">Assigned Unit</span>
                    <span className="font-bold text-[#1b1c1c]">{item.dispatchedUnit}</span>
                  </div>

                  <div>
                    <span className="text-[#8f6f6c] block text-[10px]">Station Involved</span>
                    <span className="font-bold text-[#5b403d]">{item.stationInvolved}</span>
                  </div>
                </div>

                {/* Operator SITREP */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
                  <div className="flex items-start gap-2 text-xs text-[#5b403d]">
                    <span className="font-bold text-[#1b1c1c] shrink-0 flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm text-[#af101a]">description</span>
                      SITREP:
                    </span>
                    <span className="italic">{item.operatorNotes}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => handleCopyLog(item)}
                      className="px-2.5 py-1 text-xs font-semibold bg-white border border-[#e4beba] text-[#5b403d] hover:bg-[#f0eded] rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-sm">
                        {copiedId === item.id ? 'check' : 'content_copy'}
                      </span>
                      <span>{copiedId === item.id ? 'Copied' : 'Copy'}</span>
                    </button>

                    <button
                      onClick={() => setSelectedLog(item)}
                      className="px-3 py-1 text-xs font-bold bg-[#1b1c1c] text-white hover:bg-black rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <span>Full Record</span>
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Detailed Historical Inspection Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-[#e4beba] max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#e4beba]">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-xs bg-[#af101a] text-white px-2 py-0.5 rounded">
                  {selectedLog.incidentCode}
                </span>
                <h2 className="font-bold text-lg text-[#1b1c1c]">{selectedLog.title}</h2>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1 rounded-full text-[#5b403d] hover:bg-[#f0eded] cursor-pointer"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-[#fbf9f8] rounded-xl border border-[#f0eded] space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-[#8f6f6c]">Location</span>
                  <span className="font-bold text-[#1b1c1c]">{selectedLog.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8f6f6c]">Caller Identity</span>
                  <span className="font-bold text-[#1b1c1c]">{selectedLog.callerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8f6f6c]">Intake Time</span>
                  <span className="font-mono font-bold text-[#1b1c1c]">{selectedLog.timestamp}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8f6f6c]">Resolved Time</span>
                  <span className="font-mono font-bold text-[#1b1c1c]">{selectedLog.resolvedAt} ({selectedLog.duration})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8f6f6c]">Triage Response Speed</span>
                  <span className="font-mono font-bold text-emerald-600">{selectedLog.triageTimeSec} seconds</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8f6f6c]">Dispatched Unit</span>
                  <span className="font-bold text-[#af101a]">{selectedLog.dispatchedUnit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8f6f6c]">Station Command</span>
                  <span className="font-bold text-[#5b403d]">{selectedLog.stationInvolved}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8f6f6c]">Final Outcome</span>
                  <span className="font-bold text-emerald-700">{selectedLog.outcome}</span>
                </div>
              </div>

              <div>
                <span className="font-bold text-[#1b1c1c] block mb-1">Operator Action & SITREP Log:</span>
                <p className="p-3 bg-[#f6f3f2] rounded-xl border border-[#e4beba] text-[#1b1c1c] leading-relaxed">
                  {selectedLog.operatorNotes}
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => handleCopyLog(selectedLog)}
                className="px-4 py-2 bg-white border border-[#e4beba] text-[#1b1c1c] rounded-xl text-xs font-bold hover:bg-[#f0eded] cursor-pointer"
              >
                Copy SITREP
              </button>
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-[#1b1c1c] text-white rounded-xl text-xs font-bold hover:bg-black cursor-pointer"
              >
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
