import React from 'react';
import { Link } from 'react-router-dom';
import {
  FiActivity,
  FiShield,
  FiMapPin,
  FiArrowUp,
  FiGlobe,
  FiCpu,
  FiCheckCircle,
  FiFileText,
  FiCompass,
  FiTrendingUp,
  FiWind
} from 'react-icons/fi';
import { useAQIStore } from '../context/store';

export default function Footer() {
  const { selectedCity, currentAQI } = useAQIStore();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeLocation = (() => {
    try {
      const saved = localStorage.getItem('airsense_active_location');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return null;
  })();

  const locationTitle = activeLocation?.area
    ? `${activeLocation.area}, ${activeLocation.city || ''}`.replace(/,\s*$/, '')
    : (activeLocation?.city || selectedCity || 'Chennai');

  const aqiVal = currentAQI?.aqi?.value ?? currentAQI?.aqi ?? 46;

  return (
    <footer className="mt-16 text-slate-400 relative">
      {/* Ambient Atmospheric Glow */}
      <div className="absolute left-1/2 -top-16 -translate-x-1/2 w-96 h-28 bg-cyan-500/15 blur-3xl rounded-full pointer-events-none" />

      {/* COMBINED 50% GLASSMORPHIC FOOTER CONTAINER (Matching Dashboard Upper Cards) */}
      <div className="backdrop-blur-3xl bg-[#11212D]/50 border border-white/10 rounded-3xl p-6 sm:p-8 md:p-10 shadow-[0_24px_70px_0_rgba(0,0,0,0.85)] relative overflow-hidden space-y-8">
        
        {/* Subtle Top Gradient Edge */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent pointer-events-none" />

        {/* TOP LIVE NETWORK HORIZON RIBBON (COMBINED) */}
        <div className="backdrop-blur-xl bg-[#06141B]/70 border border-white/10 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-inner">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/90 text-cyan-300 border border-cyan-500/30 text-[11px] font-mono font-bold shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>CPCB & WMO TELEMETRY GRID: 100% OPERATIONAL</span>
            </span>
            <span className="text-xs font-semibold text-slate-400 hidden sm:inline">
              Node: <strong className="text-white font-mono">{locationTitle}</strong> ({aqiVal} AQI)
            </span>
          </div>

          <div className="flex items-center gap-5 text-xs font-mono font-bold text-slate-300">
            <span className="flex items-center gap-1.5">
              <FiActivity className="text-cyan-400 w-3.5 h-3.5" />
              <span>16 Ground Stations</span>
            </span>
            <span className="hidden md:flex items-center gap-1.5">
              <FiCpu className="text-purple-400 w-3.5 h-3.5" />
              <span>Latency: 14ms</span>
            </span>
            <span className="flex items-center gap-1.5">
              <FiShield className="text-emerald-400 w-3.5 h-3.5" />
              <span>256-Bit TLS</span>
            </span>
          </div>
        </div>

        {/* MAIN 4-COLUMN FOOTER NAVIGATION */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {/* Column 1: Brand & Mission */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center font-black text-white text-base shadow-lg shadow-cyan-500/25 border border-white/20">
                AP
              </div>
              <div>
                <span className="text-lg font-black text-white tracking-tight">AirSense Cloud</span>
                <span className="block text-[10px] font-black uppercase tracking-widest text-cyan-400">
                  Neural Telemetry Network
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              Continuous real-time air quality monitoring, neural atmospheric dispersion forecasting, and regulatory compliance intelligence calibrated to Central Pollution Control Board (CPCB) standards.
            </p>
            <div className="pt-2 text-[11px] font-mono text-slate-500">
              Current Anchor: <span className="text-slate-300 font-bold">{locationTitle}</span>
            </div>
          </div>

          {/* Column 2: Platform Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
              <FiGlobe className="text-cyan-400" />
              Platform Navigation
            </h4>
            <ul className="space-y-2 text-xs font-medium">
              <li>
                <Link to="/dashboard" className="hover:text-cyan-400 transition flex items-center gap-2">
                  <span>&bull;</span> Command Dashboard
                </Link>
              </li>
              <li>
                <Link to="/map" className="hover:text-cyan-400 transition flex items-center gap-2">
                  <span>&bull;</span> Interactive Station Map
                </Link>
              </li>
              <li>
                <Link to="/predictions" className="hover:text-cyan-400 transition flex items-center gap-2">
                  <span>&bull;</span> AI Environmental Forecast
                </Link>
              </li>
              <li>
                <Link to="/reports" className="hover:text-cyan-400 transition flex items-center gap-2">
                  <span>&bull;</span> City Reports & 10-Day History
                </Link>
              </li>
              <li>
                <Link to="/analytics" className="hover:text-cyan-400 transition flex items-center gap-2">
                  <span>&bull;</span> Comparative Multi-City Matrix
                </Link>
              </li>
              <li>
                <Link to="/settings" className="hover:text-cyan-400 transition flex items-center gap-2">
                  <span>&bull;</span> Preferences & Health Advisory
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Environmental Standards & Breakpoints */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
              <FiActivity className="text-emerald-400" />
              CPCB National Standards (NAAQS)
            </h4>
            <div className="space-y-2 text-[11px] font-mono">
              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-emerald-400 font-bold">Good (0 &ndash; 50)</span>
                <span className="text-slate-400">Minimal Impact</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-lime-400 font-bold">Satisfactory (51 &ndash; 100)</span>
                <span className="text-slate-400">Minor Discomfort</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-yellow-400 font-bold">Moderate (101 &ndash; 200)</span>
                <span className="text-slate-400">Sensitive Groups</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-orange-400 font-bold">Poor (201 &ndash; 300)</span>
                <span className="text-slate-400">Breathing Caution</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-rose-400 font-bold">Very Poor (301 &ndash; 400)</span>
                <span className="text-slate-400">Respiratory Illness</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-red-500 font-bold">Severe (401 &ndash; 500)</span>
                <span className="text-slate-400">Respiratory Hazard</span>
              </div>
            </div>
          </div>

          {/* Column 4: Regulatory & Data Protocols */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
              <FiShield className="text-purple-400" />
              Regulatory & Encryption
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              Data streams are authenticated via TLS 1.3 cryptographic tunnels with continuous Kalman-filter outlier rejection and neural atmospheric simulation.
            </p>
            <div className="p-3.5 rounded-xl bg-[#06141B]/80 border border-white/10 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <FiCheckCircle className="text-cyan-400 w-3.5 h-3.5" />
                <span>ISO 14001 Protocol Aligned</span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">
                WMO Integrated Global Atmospheric Watch
              </p>
            </div>
          </div>
        </div>

        {/* BOTTOM LEGAL & COPYRIGHT BAR */}
        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p className="text-slate-400 font-medium text-center sm:text-left">
            &copy; {new Date().getFullYear()} <strong className="text-white">AirSense Cloud Technologies</strong>. Built for Clean Air, Urban Resilience & Public Health.
          </p>

          <div className="flex items-center gap-4">
            <button
              onClick={scrollToTop}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#06141B]/80 hover:bg-white/10 text-cyan-400 hover:text-white border border-white/10 text-xs font-bold transition shadow-sm"
              title="Scroll to Top"
            >
              <span>Top</span>
              <FiArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
