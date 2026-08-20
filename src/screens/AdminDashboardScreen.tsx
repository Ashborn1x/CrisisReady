import React, { useState } from 'react';
import { Incident, ResponderUnit, ScreenView } from '../types';
import { EMERGENCY_STATIONS } from '../data/mockData';

interface AdminDashboardScreenProps {
  incidents: Incident[];
  responderUnits: ResponderUnit[];
  onNavigate: (screen: ScreenView) => void;
  isOffline: boolean;
  onToggleOffline: () => void;
}

export const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({
  incidents,
  responderUnits,
  onNavigate,
  isOffline,
  onToggleOffline
}) => {
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastBody, setBroadcastBody] = useState('');
  const [broadcastLevel, setBroadcastLevel] = useState<'info' | 'warning' | 'critical'>('warning');
  const [broadcasts, setBroadcasts] = useState<
    { id: string; title: string; body: string; level: string; time: string; author: string }[]
  >([
    {
      id: 'b-1',
      title: 'High Heat Advisory & Water Stations Activated',
      body: 'City OEM cooling centers open at Downtown Library and West Rec Center until 20:00.',
      level: 'info',
      time: '11:00 EST',
      author: 'City OEM Admin'
    }
  ]);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);

  const [auditLogs] = useState([
    { id: 'aud-1', time: '14:35:12', user: 'Dispatcher 042', action: 'Assigned Unit Engine 42 to #INC-8903', status: 'SUCCESS' },
    { id: 'aud-2', time: '14:32:05', user: 'Automated Gateway', action: 'Created Incident #INC-8903 via Fire Sensor API', status: 'SUCCESS' },
    { id: 'aud-3', time: '14:20:18', user: 'Officer Miller', action: 'Patrol 19 changed status to EN_ROUTE', status: 'SUCCESS' },
    { id: 'aud-4', time: '14:15:00', user: 'SysAdmin root', action: 'Cellular Tower Fallback Mesh ping verified (4ms latency)', status: 'OPTIMAL' },
    { id: 'aud-5', time: '13:58:44', user: 'Desk Capt. Vance', action: 'Station #42 test turnout bell sounded', status: 'SUCCESS' }
  ]);

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastBody.trim()) return;

    setBroadcasts((prev) => [
      {
        id: `b-${Date.now()}`,
        title: broadcastTitle.trim(),
        body: broadcastBody.trim(),
        level: broadcastLevel,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        author: 'Executive CAD Admin'
      },
      ...prev
    ]);

    setBroadcastTitle('');
    setBroadcastBody('');
    setShowBroadcastModal(false);
  };

  const activeIncidents = incidents.filter((i) => i.status !== 'resolved');
  const criticalIncidents = incidents.filter((i) => i.urgency === 'critical' && i.status !== 'resolved');
  const availableUnits = responderUnits.filter((u) => u.status === 'available');

  return (
    <div className="flex-1 flex flex-col h-full bg-[#fcf9f8] select-none overflow-y-auto no-scrollbar p-4 md:p-6">
      <div className="max-w-6xl mx-auto w-full flex flex-col gap-6">
        {/* ADMIN PORTAL HEADER */}
        <div className="bg-white border border-[#e4beba] rounded-2xl p-5 md:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#4a154b] text-white flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-2xl">admin_panel_settings</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#f0eded] text-[#5b403d] border border-[#e4beba] uppercase tracking-wider">
                  Admin Authority
                </span>
                <span className="text-xs font-bold text-[#15803d] flex items-center gap-1 font-data-tabular">
                  <span className="w-2 h-2 rounded-full bg-[#15803d] animate-pulse"></span> All Systems Operational
                </span>
              </div>
              <h2 className="text-xl font-bold text-[#1b1c1c] tracking-tight">System Administration & Oversight Hub</h2>
              <p className="text-xs text-[#5b403d]">City Emergency Infrastructure, Agency Rostering & Audit Telemetry</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowBroadcastModal(true)}
              className="bg-[#af101a] text-white px-3.5 py-2 rounded-xl text-xs font-bold hover:bg-[#930010] transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">campaign</span>
              Citywide Alert Broadcast
            </button>
            <button
              onClick={() => onNavigate('settings')}
              className="bg-[#f6f3f2] border border-[#e4beba] text-[#5b403d] hover:text-[#1b1c1c] px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">tune</span>
              System Config
            </button>
          </div>
        </div>

        {/* SYSTEM STATS OVERVIEW */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-white p-4 rounded-xl border border-[#e4beba] shadow-xs">
            <div className="flex items-center justify-between text-[#5b403d] mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">Active CAD Emergencies</span>
              <span className="material-symbols-outlined text-lg text-[#af101a]">emergency</span>
            </div>
            <span className="text-2xl font-bold text-[#1b1c1c] font-data-tabular">{activeIncidents.length}</span>
            <span className="text-[11px] text-[#ba1a1a] font-semibold block mt-1">
              {criticalIncidents.length} Critical Priority
            </span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#e4beba] shadow-xs">
            <div className="flex items-center justify-between text-[#5b403d] mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">Field Fleet Ready</span>
              <span className="material-symbols-outlined text-lg text-[#15803d]">local_shipping</span>
            </div>
            <span className="text-2xl font-bold text-[#1b1c1c] font-data-tabular">
              {availableUnits.length} / {responderUnits.length}
            </span>
            <span className="text-[11px] text-[#15803d] font-semibold block mt-1">
              {Math.round((availableUnits.length / responderUnits.length) * 100)}% Fleet Availability
            </span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#e4beba] shadow-xs">
            <div className="flex items-center justify-between text-[#5b403d] mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">Emergency Stations</span>
              <span className="material-symbols-outlined text-lg text-[#0058a2]">apartment</span>
            </div>
            <span className="text-2xl font-bold text-[#1b1c1c] font-data-tabular">{EMERGENCY_STATIONS.length}</span>
            <span className="text-[11px] text-[#0058a2] font-semibold block mt-1">
              Police, Fire, Trauma & OEM
            </span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#e4beba] shadow-xs">
            <div className="flex items-center justify-between text-[#5b403d] mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">CAD Response SLA</span>
              <span className="material-symbols-outlined text-lg text-[#d97706]">timer</span>
            </div>
            <span className="text-2xl font-bold text-[#1b1c1c] font-data-tabular">3m 48s</span>
            <span className="text-[11px] text-[#15803d] font-semibold block mt-1">
              98.2% within Target SLA
            </span>
          </div>
        </div>

        {/* QUICK ACCESS ADMIN PORTALS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            onClick={() => onNavigate('personnel')}
            className="bg-white border border-[#e4beba] hover:border-[#af101a] rounded-xl p-4 shadow-xs cursor-pointer transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-[#e0f2fe] text-[#0369a1] flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-xl">groups</span>
              </div>
              <h4 className="font-bold text-sm text-[#1b1c1c] group-hover:text-[#af101a] transition-colors">
                Personnel & Rostering
              </h4>
              <p className="text-xs text-[#5b403d] mt-1">
                Manage first responder crews, officer callsigns, radio credentials, and certifications.
              </p>
            </div>
            <span className="text-xs font-bold text-[#af101a] flex items-center gap-1 mt-4">
              Open Personnel Roster <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </span>
          </div>

          <div
            onClick={() => onNavigate('analytics')}
            className="bg-white border border-[#e4beba] hover:border-[#af101a] rounded-xl p-4 shadow-xs cursor-pointer transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-[#fef3c7] text-[#b45309] flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-xl">monitoring</span>
              </div>
              <h4 className="font-bold text-sm text-[#1b1c1c] group-hover:text-[#af101a] transition-colors">
                CAD Performance Analytics
              </h4>
              <p className="text-xs text-[#5b403d] mt-1">
                Detailed heatmaps, SLA turnaround statistics, incident category volume, and response audits.
              </p>
            </div>
            <span className="text-xs font-bold text-[#af101a] flex items-center gap-1 mt-4">
              Open Analytics Dashboard <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </span>
          </div>

          <div
            onClick={() => onNavigate('settings')}
            className="bg-white border border-[#e4beba] hover:border-[#af101a] rounded-xl p-4 shadow-xs cursor-pointer transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-[#f3e8ff] text-[#7e22ce] flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-xl">settings_system_daydream</span>
              </div>
              <h4 className="font-bold text-sm text-[#1b1c1c] group-hover:text-[#af101a] transition-colors">
                Agency & System Config
              </h4>
              <p className="text-xs text-[#5b403d] mt-1">
                Configure emergency SMS gateways, cellular fallback meshes, sector geofences, and API endpoints.
              </p>
            </div>
            <span className="text-xs font-bold text-[#af101a] flex items-center gap-1 mt-4">
              Open System Settings <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </span>
          </div>
        </div>

        {/* ACTIVE PUBLIC BROADCASTS & AUDIT LOG */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Public Alerts */}
          <div className="bg-white border border-[#e4beba] rounded-xl p-4 md:p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-[#1b1c1c] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base text-[#af101a]">campaign</span>
                Active Public Safety Broadcasts
              </h3>
              <button
                onClick={() => setShowBroadcastModal(true)}
                className="text-xs font-bold text-[#af101a] hover:underline cursor-pointer"
              >
                + New Alert
              </button>
            </div>

            <div className="flex flex-col gap-2.5">
              {broadcasts.map((b) => (
                <div key={b.id} className="p-3 rounded-lg border border-[#e4beba] bg-[#fcf9f8] text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-[#1b1c1c]">{b.title}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-[#dbeafe] text-[#1e40af]">
                      {b.level}
                    </span>
                  </div>
                  <p className="text-[#5b403d] mb-1.5 leading-relaxed">{b.body}</p>
                  <span className="text-[10px] text-[#795900] font-data-tabular">
                    Broadcasted: {b.time} by {b.author}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* System Audit Trails */}
          <div className="bg-white border border-[#e4beba] rounded-xl p-4 md:p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-[#1b1c1c] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base text-[#0058a2]">receipt_long</span>
                System Audit & Dispatch Logs
              </h3>
              <span className="text-[11px] font-bold text-[#15803d]">Live Sync</span>
            </div>

            <div className="flex flex-col gap-2 text-xs font-data-tabular">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-2.5 rounded-lg bg-[#f6f3f2] border border-[#e4beba]/60 flex items-start justify-between gap-2">
                  <div>
                    <span className="font-bold text-[#1b1c1c] block">{log.action}</span>
                    <span className="text-[10px] text-[#5b403d]">
                      User: {log.user} • Time: {log.time}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#dcfce7] text-[#15803d] uppercase shrink-0">
                    {log.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Broadcast Modal */}
      {showBroadcastModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#e4beba] p-6 max-w-lg w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-xl text-[#af101a]">campaign</span>
                <h3 className="font-bold text-base text-[#1b1c1c]">Transmit Citywide Public Alert</h3>
              </div>
              <button
                onClick={() => setShowBroadcastModal(false)}
                className="text-[#5b403d] hover:text-[#1b1c1c] cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSendBroadcast} className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-bold text-[#5b403d] block mb-1">Alert Headline</label>
                <input
                  type="text"
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  placeholder="e.g. Flash Flood Warning - Downtown Core"
                  className="w-full bg-[#f6f3f2] border border-[#e4beba] rounded-lg px-3 py-2 text-xs text-[#1b1c1c] focus:outline-none focus:ring-1 focus:ring-[#af101a]"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#5b403d] block mb-1">Alert Severity Level</label>
                <select
                  value={broadcastLevel}
                  onChange={(e: any) => setBroadcastLevel(e.target.value)}
                  className="w-full bg-[#f6f3f2] border border-[#e4beba] rounded-lg px-3 py-2 text-xs text-[#1b1c1c] focus:outline-none focus:ring-1 focus:ring-[#af101a] cursor-pointer"
                >
                  <option value="info">Informational Advisory</option>
                  <option value="warning">Public Warning</option>
                  <option value="critical">Emergency Immediate Evacuation</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#5b403d] block mb-1">Instructions / Description</label>
                <textarea
                  rows={3}
                  value={broadcastBody}
                  onChange={(e) => setBroadcastBody(e.target.value)}
                  placeholder="Provide precise citizen guidance, shelter locations, and emergency contacts..."
                  className="w-full bg-[#f6f3f2] border border-[#e4beba] rounded-lg px-3 py-2 text-xs text-[#1b1c1c] focus:outline-none focus:ring-1 focus:ring-[#af101a]"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#e4beba] mt-2">
                <button
                  type="button"
                  onClick={() => setShowBroadcastModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-[#5b403d] hover:bg-[#f6f3f2] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#af101a] text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#930010] cursor-pointer shadow-xs"
                >
                  Broadcast Alert Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
