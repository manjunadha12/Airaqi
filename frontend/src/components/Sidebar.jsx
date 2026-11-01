import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FiHome,
  FiTrendingUp,
  FiBell,
  FiDownload,
  FiSettings,
  FiBarChart2
} from 'react-icons/fi';
import { useAuthStore } from '../context/store';

export default function Sidebar({ collapsed, isPinned, onTogglePin, onItemClick }) {
  const { user } = useAuthStore();
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
            {/* Logo Emblem (Crisp, No Neon Glow) */}
            <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500/30 via-blue-500/20 to-indigo-600/20 p-[1px] flex-shrink-0 transition-transform duration-300 group-hover:scale-105 border border-white/15">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
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
              <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-slate-950/95 border border-white/20 shadow-2xl backdrop-blur-3xl text-xs font-bold text-cyan-300 whitespace-nowrap z-50 pointer-events-none opacity-0 group-hover:opacity-100 group-hover:translate-x-0 translate-x-1 transition-all duration-200">
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
                      ? 'w-11 h-11 justify-center rounded-xl'
                      : 'w-full gap-3 px-3.5 py-2.5 rounded-xl'
                  } transition-all duration-200 ${
                    isActive
                      ? 'text-cyan-400 font-bold bg-white/[0.04]'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.06] font-medium'
                  }`}
                >
                  {/* Single Line Active Indicator (Crisp, No Glow Effect) */}
                  {isActive && (
                    <span className={`absolute left-0 w-1 ${collapsed ? 'h-5 top-1/2 -translate-y-1/2' : 'top-2.5 bottom-2.5'} bg-cyan-400 rounded-r-full`} />
                  )}

                  <div className="relative">
                    <item.icon
                      className={`w-5 h-5 flex-shrink-0 transition-colors duration-200 ${
                        isActive ? 'text-cyan-400' : 'text-slate-400 group-hover/item:text-slate-200'
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

      {/* Bottom Area: Clean Divider & Optional User Profile */}
      <div className="pt-2 border-t border-white/10">
        {user && !collapsed && (
          <div className="p-2.5 bg-slate-900/60 rounded-2xl border border-white/10 backdrop-blur-2xl flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-black text-xs shrink-0">
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
      </div>
    </nav>
  );
}
