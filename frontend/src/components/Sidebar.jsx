import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FiHome,
  FiTrendingUp,
  FiBell,
  FiDownload,
  FiSettings,
  FiLogOut,
  FiBarChart2,
  FiZap
} from 'react-icons/fi';
import { useAuthStore } from '../context/store';
import { apiService } from '../services/apiService';

export default function Sidebar({ collapsed, isPinned, onTogglePin, onItemClick }) {
  const { user, logout } = useAuthStore();
  const location = useLocation();

  const menuItems = [
    {
      icon: FiHome,
      label: 'Dashboard',
      path: '/dashboard',
      badge: 'LIVE',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
    },
    {
      icon: FiTrendingUp,
      label: 'AI Predictions',
      path: '/predictions',
      badge: 'FORECAST',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
    },
    {
      icon: FiDownload,
      label: 'City Reports & History',
      path: '/reports',
      badge: 'AUDIT',
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30'
    },
    {
      icon: FiBarChart2,
      label: 'Analytics Matrix',
      path: '/analytics',
      badge: 'PRO',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30'
    },
    {
      icon: FiBell,
      label: 'Incident Alerts',
      path: '/alerts',
      ping: true
    },
    {
      icon: FiSettings,
      label: 'Cloud Settings',
      path: '/settings'
    },
  ];

  const handleLogout = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (onItemClick) onItemClick();

    logout();
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');

    try {
      apiService.logout().catch(() => {});
    } catch (err) {}

    window.location.href = '/login';
  };

  return (
    <nav className="h-full flex flex-col p-3 select-none justify-between overflow-visible">
      {/* Top: Brand Emblem & Pin Control */}
      <div>
        <div className={`mb-6 flex items-center ${collapsed ? 'justify-center' : 'justify-start'} px-1 pt-1`}>
          <Link
            to="/dashboard"
            onClick={() => onItemClick && onItemClick()}
            className="flex items-center gap-3 group relative"
          >
            {/* Animated Logo Emblem */}
            <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-600 p-[1.5px] shadow-[0_0_22px_rgba(6,182,212,0.45)] flex-shrink-0 transition-transform duration-300 group-hover:scale-105">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <span className="font-black text-sm tracking-wider bg-gradient-to-r from-cyan-300 via-sky-300 to-blue-400 bg-clip-text text-transparent">
                  AP
                </span>
              </div>
            </div>

            {!collapsed && (
              <div className="flex flex-col overflow-hidden transition-all duration-300">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-white text-base tracking-tight whitespace-nowrap">
                    AirSense
                  </span>
                  <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-cyan-950/80 text-cyan-400 border border-cyan-500/30">
                    PRO
                  </span>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 whitespace-nowrap flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Enterprise AI
                </span>
              </div>
            )}

            {collapsed && (
              <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-slate-950/95 border border-cyan-500/40 shadow-2xl backdrop-blur-3xl text-xs font-black text-cyan-300 whitespace-nowrap z-50 pointer-events-none opacity-0 group-hover:opacity-100 group-hover:translate-x-0 translate-x-1 transition-all duration-200">
                AirSense Pro
              </div>
            )}
          </Link>

        </div>

        {/* Navigation Menu List */}
        <div className="space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <div key={item.path} className="relative group/item flex justify-center">
                <Link
                  to={item.path}
                  onClick={() => onItemClick && onItemClick()}
                  className={`relative flex items-center ${
                    collapsed
                      ? 'w-11 h-11 justify-center rounded-2xl'
                      : 'w-full gap-3 px-3.5 py-2.5 rounded-2xl'
                  } backdrop-blur-2xl transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-tr from-cyan-500/25 via-blue-600/20 to-cyan-500/10 text-white border border-cyan-400/50 shadow-[0_0_24px_rgba(6,182,212,0.35)] font-black'
                      : 'text-slate-400 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/15 font-bold hover:scale-[1.03] active:scale-95'
                  }`}
                >
                  {/* Left Laser Glow Bar on Expanded Active */}
                  {isActive && !collapsed && (
                    <span className="absolute left-0 top-2 bottom-2 w-1 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-r-full shadow-[0_0_12px_#06b6d4]"></span>
                  )}

                  <div className="relative">
                    <item.icon
                      className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 group-hover/item:scale-110 ${
                        isActive ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]' : 'text-slate-400 group-hover/item:text-cyan-300'
                      }`}
                    />
                    {item.ping && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                    )}
                  </div>

                  {!collapsed && (
                    <div className="flex items-center justify-between flex-1 min-w-0">
                      <span className="text-xs tracking-wide whitespace-nowrap overflow-hidden text-ellipsis">
                        {item.label}
                      </span>
                      {item.badge && (
                        <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${item.badgeColor || 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'}`}>
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </Link>

                {/* Floating Tooltip in Collapsed Mode */}
                {collapsed && (
                  <div className="absolute left-full ml-3.5 top-1/2 -translate-y-1/2 px-3.5 py-1.5 rounded-2xl bg-slate-950/95 border border-white/20 shadow-[0_12px_30px_rgba(0,0,0,0.8)] backdrop-blur-3xl text-xs font-bold text-white whitespace-nowrap z-50 pointer-events-none opacity-0 group-hover/item:opacity-100 group-hover/item:translate-x-0 translate-x-1 transition-all duration-200 flex items-center gap-2">
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md border ${item.badgeColor || 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'}`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom: Live Telemetry Capsule & User Sign Out */}
      <div className="pt-3 border-t border-white/10 space-y-2.5">
        {/* Real-Time Micro Capsule (when expanded) */}
        {!collapsed && (
          <div className="p-3 bg-slate-900/60 rounded-2xl border border-white/10 backdrop-blur-2xl space-y-2">
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
              <span className="flex items-center gap-1.5">
                <FiZap className="w-3.5 h-3.5 text-cyan-400" />
                Live Telemetry
              </span>
              <span className="text-emerald-400 font-mono">ONLINE</span>
            </div>
            <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full w-[94%] animate-pulse"></div>
            </div>
            <div className="flex items-center justify-between text-[9px] font-mono text-slate-400">
              <span>Sync: 1.2s</span>
              <span>CPCB Verified</span>
            </div>
          </div>
        )}

        {/* User Badge (when expanded) */}
        {user && !collapsed && (
          <div className="p-2.5 bg-slate-900/60 rounded-2xl border border-white/10 backdrop-blur-2xl flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-black text-xs shrink-0 shadow-md">
                {user.firstName?.charAt(0) || 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-black text-white truncate leading-tight">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-[10px] font-bold text-cyan-400 truncate capitalize leading-none mt-0.5">
                  {user.role?.replace('_', ' ') || 'Analyst'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Animated Logout Button */}
        <div className="relative group/logout flex justify-center">
          <button
            onClick={handleLogout}
            className={`flex items-center ${
              collapsed
                ? 'w-11 h-11 justify-center rounded-2xl'
                : 'w-full gap-3 px-3.5 py-2.5 rounded-2xl'
            } text-rose-400 hover:text-white hover:bg-rose-500/20 border border-transparent hover:border-rose-500/30 transition-all duration-300 backdrop-blur-2xl font-bold text-xs active:scale-95`}
          >
            <FiLogOut className="w-4 h-4 flex-shrink-0 group-hover/logout:-translate-x-0.5 transition-transform" />
            {!collapsed && <span className="whitespace-nowrap">Sign Out</span>}
          </button>

          {collapsed && (
            <div className="absolute left-full ml-3.5 top-1/2 -translate-y-1/2 px-3.5 py-1.5 rounded-2xl bg-slate-950/95 border border-rose-500/40 shadow-[0_12px_30px_rgba(0,0,0,0.8)] backdrop-blur-3xl text-xs font-black text-rose-300 whitespace-nowrap z-50 pointer-events-none opacity-0 group-hover/logout:opacity-100 group-hover/logout:translate-x-0 translate-x-1 transition-all duration-200">
              Sign Out
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
