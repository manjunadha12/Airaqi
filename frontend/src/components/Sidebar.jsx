import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BrainCircuit, 
  Building2, 
  Bell, 
  Leaf,
  Pin,
  PinOff
} from 'lucide-react';

export default function Sidebar({ collapsed, isPinned, onTogglePin, onItemClick }) {
  const location = useLocation();
  const navigate = useNavigate();

  // 4 Primary Core Nodes with Distinct Colors Matching Reference Design
  const navItems = [
    { 
      name: 'Dashboard', 
      path: '/dashboard', 
      icon: LayoutDashboard, 
      textClass: 'text-sky-400',
      activeGradient: 'from-blue-600 via-cyan-500 to-indigo-600',
      activeShadow: 'shadow-[0_8px_25px_rgba(37,99,235,0.45),0_0_15px_rgba(6,182,212,0.35)]',
      borderClass: 'border-sky-500/45 hover:border-sky-400 shadow-[0_0_12px_rgba(14,165,233,0.2)]',
      hoverText: 'hover:text-sky-300',
      badge: 'LIVE', 
      badgeInactive: 'border border-sky-400/80 text-sky-300 bg-sky-950/40 shadow-[0_0_10px_rgba(14,165,233,0.35)]',
      badgeActive: 'bg-white/20 text-white border border-white/30 shadow-[0_0_8px_rgba(255,255,255,0.2)]'
    },
    { 
      name: 'AI Predictions', 
      path: '/predictions', 
      icon: BrainCircuit, 
      textClass: 'text-purple-400',
      activeGradient: 'from-purple-600 via-fuchsia-500 to-indigo-600',
      activeShadow: 'shadow-[0_8px_25px_rgba(168,85,247,0.45),0_0_15px_rgba(192,38,211,0.35)]',
      borderClass: 'border-purple-500/45 hover:border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.25)]',
      hoverText: 'hover:text-purple-300',
      badge: 'FORECAST', 
      badgeInactive: 'border border-purple-400/80 text-purple-300 bg-purple-950/40 shadow-[0_0_10px_rgba(168,85,247,0.35)]',
      badgeActive: 'bg-white/20 text-white border border-white/30 shadow-[0_0_8px_rgba(255,255,255,0.2)]'
    },
    { 
      name: 'City Reports', 
      path: '/reports', 
      icon: Building2, 
      textClass: 'text-emerald-400',
      activeGradient: 'from-emerald-600 via-teal-500 to-cyan-600',
      activeShadow: 'shadow-[0_8px_25px_rgba(16,185,129,0.45),0_0_15px_rgba(20,184,166,0.35)]',
      borderClass: 'border-emerald-500/45 hover:border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.25)]',
      hoverText: 'hover:text-emerald-300',
      badge: 'AUDIT', 
      badgeInactive: 'border border-emerald-400/80 text-emerald-300 bg-emerald-950/40 shadow-[0_0_10px_rgba(16,185,129,0.35)]',
      badgeActive: 'bg-white/20 text-white border border-white/30 shadow-[0_0_8px_rgba(255,255,255,0.2)]'
    },
    { 
      name: 'Alerts', 
      path: '/alerts', 
      icon: Bell, 
      textClass: 'text-amber-400',
      activeGradient: 'from-amber-600 via-orange-500 to-rose-600',
      activeShadow: 'shadow-[0_8px_25px_rgba(245,158,11,0.45),0_0_15px_rgba(249,115,22,0.35)]',
      borderClass: 'border-amber-500/45 hover:border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.25)]',
      hoverText: 'hover:text-amber-300',
      badge: 'ACTIVE', 
      badgeInactive: 'border border-amber-400/80 text-amber-300 bg-amber-950/40 shadow-[0_0_10px_rgba(245,158,11,0.35)]',
      badgeActive: 'bg-white/20 text-white border border-white/30 shadow-[0_0_8px_rgba(255,255,255,0.2)]'
    },
  ];

  const handleItemClick = (item) => {
    if (onItemClick) onItemClick();
    if (item.path) {
      navigate(item.path);
    }
  };

  const isCurrentActive = (item) => {
    if (item.path === '/dashboard' && (location.pathname === '/dashboard' || location.pathname === '/')) return true;
    if (item.path === '/predictions' && location.pathname === '/predictions') return true;
    if (item.path === '/reports' && location.pathname === '/reports') return true;
    if (item.path === '/alerts' && location.pathname === '/alerts') return true;
    return false;
  };

  const NavIcon = ({ item }) => {
    const isActive = isCurrentActive(item);
    const Icon = item.icon;

    return (
      <div className={`relative group w-full flex ${collapsed ? 'justify-center' : 'justify-start'}`}>
        <button
          onClick={() => handleItemClick(item)}
          className={`relative z-10 flex items-center ${
            collapsed
              ? 'w-11 h-11 justify-center rounded-full'
              : 'w-full h-12 rounded-[20px] pl-1.5 pr-3 gap-2.5'
          } transition-all duration-300 ease-out ${
            isActive
              ? `bg-gradient-to-r ${item.activeGradient} text-white border border-white/30 ${item.activeShadow} scale-[1.02]`
              : `bg-slate-900/40 hover:bg-slate-900/60 backdrop-blur-md border ${item.borderClass} ${item.textClass} hover:scale-[1.02]`
          }`}
        >
          {/* Circular Node Icon Container - precisely centered on the vertical line */}
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0">
            <Icon size={20} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-white' : item.textClass} />
          </div>

          {/* Expanded Labels and Badges (Matching Reference Design) */}
          {!collapsed && (
            <div className="flex items-center justify-between flex-1 min-w-0 pr-1 overflow-hidden animate-in fade-in duration-200">
              <span className={`text-sm tracking-wide truncate ${
                isActive ? 'font-semibold text-white' : 'font-medium text-slate-100 group-hover:text-white'
              }`}>
                {item.name}
              </span>
              {item.badge && (
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full shrink-0 transition-all ${
                  isActive ? item.badgeActive : item.badgeInactive
                }`}>
                  {item.badge}
                </span>
              )}
            </div>
          )}
        </button>

        {/* Floating Tooltip (When Collapsed) */}
        {collapsed && (
          <div className="absolute left-[56px] top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[#06141B]/95 text-white text-xs font-semibold rounded-xl opacity-0 -translate-x-2 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 z-50 whitespace-nowrap shadow-2xl border border-white/15 backdrop-blur-2xl flex items-center gap-2">
            <span className={item.textClass}>{item.name}</span>
            {item.badge && (
              <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full border ${item.badgeInactive}`}>
                {item.badge}
              </span>
            )}
            {/* Tooltip triangle pointer */}
            <div className="absolute left-[-4px] top-1/2 -translate-y-1/2 w-2 h-2 bg-[#06141B]/95 rotate-45 border-l border-b border-white/15"></div>
          </div>
        )}
      </div>
    );
  };

  return (
    <nav className="h-full w-full flex flex-col p-2 select-none overflow-hidden relative">
      {/* Background Atmosphere Nebula Blobs (When Expanded) */}
      {!collapsed && (
        <>
          <div className="absolute top-10 -right-8 w-36 h-36 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-24 -right-6 w-40 h-40 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
          {/* Subtle 4-Point Star Sparkle in Bottom Right */}
          <div className="absolute bottom-6 right-6 select-none pointer-events-none text-cyan-200/25 animate-pulse">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
            </svg>
          </div>
        </>
      )}

      {/* The Single Continuous Glowing Neon Track Line */}
      <div className={`absolute top-[68px] bottom-8 ${
        collapsed ? 'left-1/2 -translate-x-1/2' : 'left-[36px] -translate-x-1/2'
      } w-[2px] bg-gradient-to-b from-cyan-400 via-teal-400 to-cyan-500/80 shadow-[0_0_10px_rgba(34,211,238,0.7)] rounded-full z-0 pointer-events-none transition-all duration-300`}></div>

      {/* Top: Logo, PRO badge, Enterprise AI & Pin Control */}
      <div className="relative z-10 mb-6 flex items-center justify-between w-full h-11 px-1">
        <div
          onClick={() => {
            if (onItemClick) onItemClick();
            navigate('/dashboard');
          }}
          className="flex items-center gap-3 cursor-pointer group/logo min-w-0"
        >
          {/* Leaf Squircle */}
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500/30 via-teal-400/25 to-blue-500/30 border border-cyan-400/60 shadow-[0_0_15px_rgba(34,211,238,0.4)] flex items-center justify-center text-cyan-100 shrink-0 transition-transform duration-300 group-hover/logo:scale-105 backdrop-blur-md">
            <Leaf size={22} strokeWidth={2.5} />
          </div>

          {!collapsed && (
            <div className="flex flex-col min-w-0 overflow-hidden animate-in fade-in duration-200">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-[15px] tracking-tight whitespace-nowrap">
                  AirSense
                </span>
                <span className="text-[10px] font-bold text-cyan-300 border border-cyan-400/60 rounded-full px-2 py-0.5 shadow-[0_0_8px_rgba(34,211,238,0.3)] bg-cyan-950/40">
                  PRO
                </span>
              </div>
              <span className="text-[9.5px] font-bold tracking-wider text-emerald-400 uppercase flex items-center gap-1.5 whitespace-nowrap mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)] animate-pulse"></span>
                ENTERPRISE AI
              </span>
            </div>
          )}
        </div>

        {!collapsed && onTogglePin && (
          <button
            onClick={onTogglePin}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition shrink-0 ml-1"
            title={isPinned ? 'Unpin Sidebar' : 'Pin Sidebar (Keep Open)'}
          >
            {isPinned ? <PinOff size={16} /> : <Pin size={16} />}
          </button>
        )}
      </div>

      {/* Main Navigation Items: 4 Clean Primary Nodes */}
      <div className="relative z-10 flex-1 w-full flex flex-col items-center justify-start gap-3 py-1 overflow-y-auto overflow-x-hidden scrollbar-hide">
        {navItems.map((item) => (
          <NavIcon key={item.name} item={item} />
        ))}
      </div>
    </nav>
  );
}
