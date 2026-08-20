import React, { useState } from 'react';
import { ScreenView } from '../types';

interface AnalyticsScreenProps {
  onNavigate: (screen: ScreenView) => void;
}

export const AnalyticsScreen: React.FC<AnalyticsScreenProps> = ({ onNavigate }) => {
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const [exportedNotice, setExportedNotice] = useState<boolean>(false);

  const daysData = [
    { day: 'Mon', count: 150, heightPercent: '40%' },
    { day: 'Tue', count: 240, heightPercent: '60%' },
    { day: 'Wed', count: 120, heightPercent: '30%' },
    { day: 'Thu', count: 320, heightPercent: '80%' },
    { day: 'Fri', count: 200, heightPercent: '50%' },
    { day: 'Sat', count: 380, heightPercent: '90%' },
    { day: 'Sun', count: 280, heightPercent: '70%' }
  ];

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Metric,Value,Change\n' +
      'Total Incidents (24h),1248,+12%\n' +
      'Active Critical,42,Units deployed\n' +
      'Resolved (24h),1180,94.5% Resolution Rate\n' +
      'Avg. Response Time,4m 12s,-15s from avg\n\n' +
      'Day,Volume\n' +
      daysData.map((d) => `${d.day},${d.count}`).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `crisisready_analytics_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportedNotice(true);
    setTimeout(() => setExportedNotice(false), 3500);
  };

  return (
    <div className="flex-1 bg-white min-h-screen p-4 md:p-8 select-none text-left">
      {/* Header */}
      <header className="mb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#1b1c1c] tracking-tight">
            Analytics Overview
          </h1>
          <p className="text-sm text-[#5b403d] mt-1">
            System-wide performance and active incident metrics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {exportedNotice && (
            <span className="text-xs text-[#0058a2] font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">check_circle</span>
              CSV Report Exported
            </span>
          )}
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 border border-[#8f6f6c] rounded-lg text-[#1b1c1c] font-bold text-xs hover:bg-[#f6f3f2] transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <span className="material-symbols-outlined text-sm">download</span> Export Report
          </button>
        </div>
      </header>

      {/* KPI Grid (4 cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Incidents */}
        <div className="bg-[#fcf9f8] rounded-xl p-4 border border-[#e4beba] shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="font-bold text-xs text-[#5b403d]">Total Incidents (24h)</span>
            <span className="material-symbols-outlined text-[#af101a] bg-[#ffdad6] p-1 rounded-md text-base">
              timeline
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#1b1c1c] font-data-tabular">1,248</span>
            <span className="font-data-tabular text-xs font-bold text-[#795900]">+12%</span>
          </div>
        </div>

        {/* Active Critical */}
        <div className="bg-[#fcf9f8] rounded-xl p-4 border border-[#e4beba] shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="font-bold text-xs text-[#5b403d]">Active Critical</span>
            <span className="material-symbols-outlined text-[#ba1a1a] bg-[#ffdad6] p-1 rounded-md text-base">
              warning
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#ba1a1a] font-data-tabular">42</span>
            <span className="font-data-tabular text-xs text-[#5b403d]">Units deployed</span>
          </div>
        </div>

        {/* Resolved (24h) */}
        <div className="bg-[#fcf9f8] rounded-xl p-4 border border-[#e4beba] shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="font-bold text-xs text-[#5b403d]">Resolved (24h)</span>
            <span className="material-symbols-outlined text-[#0058a2] bg-[#d4e3ff] p-1 rounded-md text-base">
              check_circle
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#1b1c1c] font-data-tabular">1,180</span>
            <span className="font-data-tabular text-xs text-[#5b403d]">94.5% Resolution Rate</span>
          </div>
        </div>

        {/* Avg Response Time */}
        <div className="bg-[#fcf9f8] rounded-xl p-4 border border-[#e4beba] shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="font-bold text-xs text-[#5b403d]">Avg. Response Time</span>
            <span className="material-symbols-outlined text-[#795900] bg-[#ffdfa0] p-1 rounded-md text-base">
              timer
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#1b1c1c] font-data-tabular">4m 12s</span>
            <span className="font-data-tabular text-xs font-bold text-[#af101a]">-15s from avg</span>
          </div>
        </div>
      </div>

      {/* Charts Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Incident Heatmap (Span 2) */}
        <div className="lg:col-span-2 bg-[#fcf9f8] rounded-xl border border-[#e4beba] shadow-xs flex flex-col overflow-hidden h-[380px]">
          <div className="p-4 border-b border-[#e4beba] bg-[#f6f3f2] flex justify-between items-center">
            <h3 className="font-bold text-base text-[#1b1c1c]">Incident Heatmap</h3>
            <div className="flex gap-2">
              <span className="w-3 h-3 rounded-full bg-[#ba1a1a]" title="Critical Hotspot"></span>
              <span className="w-3 h-3 rounded-full bg-[#795900]" title="High Severity"></span>
              <span className="w-3 h-3 rounded-full bg-[#0058a2]" title="Active Unit"></span>
            </div>
          </div>

          <div className="flex-1 bg-[#eae7e7] relative overflow-hidden">
            {/* Dot Grid Map Representation */}
            <div
              className="absolute inset-0 opacity-60"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 2px 2px, rgba(0,0,0,0.15) 1px, transparent 0)',
                backgroundSize: '20px 20px'
              }}
            ></div>

            {/* Hotspot 1: Critical Fire/Collision */}
            <div className="absolute top-1/4 left-1/3 w-16 h-16 rounded-full bg-[#ba1a1a] opacity-35 animate-ping"></div>
            <div className="absolute top-1/4 left-1/3 w-6 h-6 rounded-full bg-[#ba1a1a] border-2 border-white shadow-md z-10 flex items-center justify-center text-white text-[10px] font-bold">
              18
            </div>

            {/* Hotspot 2: High Traffic Zone */}
            <div className="absolute top-1/2 left-2/3 w-20 h-20 rounded-full bg-[#fec330] opacity-40 animate-pulse"></div>
            <div className="absolute top-1/2 left-2/3 w-6 h-6 rounded-full bg-[#795900] border-2 border-white shadow-md z-10 flex items-center justify-center text-white text-[10px] font-bold">
              14
            </div>

            {/* Hotspot 3: Medical Cluster */}
            <div className="absolute bottom-1/4 right-1/4 w-12 h-12 rounded-full bg-[#0058a2] opacity-45"></div>
            <div className="absolute bottom-1/4 right-1/4 w-5 h-5 rounded-full bg-[#0770cc] border-2 border-white shadow-md z-10 flex items-center justify-center text-white text-[9px] font-bold">
              9
            </div>

            {/* Overlay Info label */}
            <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-[#e4beba] text-xs font-data-tabular font-semibold text-[#5b403d]">
              Live GPS Density: Sector 3 & Expressway Corridor
            </div>
          </div>
        </div>

        {/* Incidents by Type (Donut / Breakdown) */}
        <div className="bg-[#fcf9f8] rounded-xl border border-[#e4beba] shadow-xs p-4 flex flex-col h-[380px] justify-between">
          <h3 className="font-bold text-base text-[#1b1c1c] mb-2">Incidents by Type</h3>

          <div className="flex-1 flex items-center justify-center relative my-2">
            {/* CSS Conic-gradient Donut Chart */}
            <div
              className="w-44 h-44 rounded-full relative overflow-hidden shadow-inner"
              style={{
                background:
                  'conic-gradient(#ba1a1a 0% 35%, #795900 35% 65%, #0058a2 65% 90%, #e5e2e1 90% 100%)'
              }}
            >
              <div className="absolute inset-5 bg-[#fcf9f8] rounded-full flex flex-col items-center justify-center shadow-xs">
                <span className="text-2xl font-bold text-[#1b1c1c] font-data-tabular">1.2k</span>
                <span className="font-data-tabular text-xs text-[#5b403d] font-semibold">Total</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 font-data-tabular text-xs pt-2 border-t border-[#e4beba]">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-[#ba1a1a] rounded-xs"></span>
                <span className="font-semibold text-[#1b1c1c]">Medical</span>
              </div>
              <span className="font-bold text-[#5b403d]">35% (437)</span>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-[#795900] rounded-xs"></span>
                <span className="font-semibold text-[#1b1c1c]">Fire</span>
              </div>
              <span className="font-bold text-[#5b403d]">30% (374)</span>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-[#0058a2] rounded-xs"></span>
                <span className="font-semibold text-[#1b1c1c]">Police</span>
              </div>
              <span className="font-bold text-[#5b403d]">25% (312)</span>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-[#e5e2e1] border border-[#8f6f6c] rounded-xs"></span>
                <span className="font-semibold text-[#1b1c1c]">Other</span>
              </div>
              <span className="font-bold text-[#5b403d]">10% (125)</span>
            </div>
          </div>
        </div>

        {/* Incident Volume (Past 7 Days) - Full Width */}
        <div className="lg:col-span-3 bg-[#fcf9f8] rounded-xl border border-[#e4beba] shadow-xs p-4 h-[300px] flex flex-col justify-between">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-base text-[#1b1c1c]">Incident Volume (Past 7 Days)</h3>
            <span className="text-xs text-[#5b403d] font-semibold">Weekly Average: 241/day</span>
          </div>

          <div className="flex-1 w-full flex items-end gap-3 pb-6 px-8 relative border-l border-b border-[#e4beba] mt-4">
            {/* Y Axis Labels */}
            <div className="absolute -left-7 bottom-0 h-full flex flex-col justify-between text-[11px] font-data-tabular text-[#5b403d] py-4">
              <span>400</span>
              <span>200</span>
              <span>0</span>
            </div>

            {/* Bars */}
            {daysData.map((item, index) => (
              <div
                key={item.day}
                onMouseEnter={() => setHoveredBar(index)}
                onMouseLeave={() => setHoveredBar(null)}
                className="flex-1 bg-[#d32f2f] hover:bg-[#af101a] rounded-t-sm transition-all duration-150 relative cursor-pointer group"
                style={{ height: item.heightPercent }}
              >
                {/* Tooltip on hover */}
                {hoveredBar === index && (
                  <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-[#303030] text-white text-[11px] font-bold py-1 px-2.5 rounded-md shadow-md whitespace-nowrap z-20">
                    {item.day}: {item.count} calls
                  </div>
                )}
              </div>
            ))}

            {/* X Axis Labels */}
            <div className="absolute -bottom-6 left-0 w-full flex justify-between px-8 text-xs font-data-tabular text-[#5b403d] font-semibold">
              {daysData.map((d) => (
                <span key={d.day}>{d.day}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
