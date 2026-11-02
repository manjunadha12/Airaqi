import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BrainCircuit, 
  TrendingUp,
  ArrowLeftRight,
  Building2, 
  Bell, 
  Leaf,
  Pin,
  PinOff
} from 'lucide-react';

export default function Sidebar({ collapsed, isPinned, onTogglePin, onItemClick }) {
  const location = useLocation();
  const navigate = useNavigate();

  // 6 Primary Core Nodes with Distinct Colors Matching Reference Design (One Icon, One Colour)
  const navItems = [
    { 
      name: 'Dashboard', 
      path: '/dashboard', 
      icon: LayoutDashboard, 
      textClass: 'text-sky-400',
      activeGradient: 'from-blue-600 via-cyan-500 to-indigo-600',
      activeShadow: 'shadow-[0_4px_16px_rgba(37,99,235,0.45),0_0_12px_rgba(6,182,212,0.3)]',
      borderClass: 'border-sky-500/40 hover:border-sky-400 shadow-[0_0_10px_rgba(14,165,233,0.2)]',
      hoverText: 'hover:text-sky-300',
      badge: 'LIVE', 
      badgeInactive: 'border border-sky-400/80 text-sky-300 bg-sky-950/40 shadow-[0_0_8px_rgba(14,165,233,0.3)]',
      badgeActive: 'bg-white/20 text-white border border-white/30 shadow-[0_0_8px_rgba(255,255,255,0.2)]'
    },
    { 
      name: 'AI Predictions', 
      path: '/predictions', 
      icon: BrainCircuit, 
      textClass: 'text-purple-400',
      activeGradient: 'from-purple-600 via-fuchsia-500 to-indigo-600',
      activeShadow: 'shadow-[0_4px_16px_rgba(168,85,247,0.45),0_0_12px_rgba(192,38,211,0.3)]',
      borderClass: 'border-purple-500/40 hover:border-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.2)]',
      hoverText: 'hover:text-purple-300',
      badge: 'FORECAST', 
      badgeInactive: 'border border-purple-400/80 text-purple-300 bg-purple-950/40 shadow-[0_0_8px_rgba(168,85,247,0.3)]',
      badgeActive: 'bg-white/20 text-white border border-white/30 shadow-[0_0_8px_rgba(255,255,255,0.2)]'
    },
    { 
      name: 'Analysis', 
      path: '/analytics', 
      icon: TrendingUp, 
      textClass: 'text-cyan-400',
      activeGradient: 'from-cyan-500 via-teal-500 to-blue-600',
      activeShadow: 'shadow-[0_4px_16px_rgba(6,182,212,0.45),0_0_12px_rgba(20,184,166,0.3)]',
      borderClass: 'border-cyan-500/40 hover:border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.2)]',
      hoverText: 'hover:text-cyan-300',
      badge: 'METRICS', 
      badgeInactive: 'border border-cyan-400/80 text-cyan-300 bg-cyan-950/40 shadow-[0_0_8px_rgba(6,182,212,0.3)]',
      badgeActive: 'bg-white/20 text-white border border-white/30 shadow-[0_0_8px_rgba(255,255,255,0.2)]'
    },
    { 
      name: 'City Compare', 
      path: '/analytics#city-compare', 
      icon: ArrowLeftRight, 
      textClass: 'text-indigo-400',
      activeGradient: 'from-indigo-600 via-violet-600 to-purple-600',
      activeShadow: 'shadow-[0_4px_16px_rgba(99,102,241,0.45),0_0_12px_rgba(139,92,246,0.3)]',
      borderClass: 'border-indigo-500/40 hover:border-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.2)]',
      hoverText: 'hover:text-indigo-300',
      badge: 'COMPARE', 
      badgeInactive: 'border border-indigo-400/80 text-indigo-300 bg-indigo-950/40 shadow-[0_0_8px_rgba(99,102,241,0.3)]',
      badgeActive: 'bg-white/20 text-white border border-white/30 shadow-[0_0_8px_rgba(255,255,255,0.2)]'
    },
    { 
      name: 'City Reports', 
      path: '/reports', 
      icon: Building2, 
      textClass: 'text-emerald-400',
      activeGradient: 'from-emerald-600 via-teal-500 to-cyan-600',
      activeShadow: 'shadow-[0_4px_16px_rgba(16,185,129,0.45),0_0_12px_rgba(20,184,166,0.3)]',
      borderClass: 'border-emerald-500/40 hover:border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]',
      hoverText: 'hover:text-emerald-300',
      badge: 'AUDIT', 
      badgeInactive: 'border border-emerald-400/80 text-emerald-300 bg-emerald-950/40 shadow-[0_0_8px_rgba(16,185,129,0.3)]',
      badgeActive: 'bg-white/20 text-white border border-white/30 shadow-[0_0_8px_rgba(255,255,255,0.2)]'
    },
    { 
      name: 'Alerts', 
      path: '/alerts', 
      icon: Bell, 
      textClass: 'text-amber-400',
      activeGradient: 'from-amber-600 via-orange-500 to-rose-600',
      activeShadow: 'shadow-[0_4px_16px_rgba(245,158,11,0.45),0_0_12px_rgba(249,115,22,0.3)]',
      borderClass: 'border-amber-500/40 hover:border-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.2)]',
      hoverText: 'hover:text-amber-300',
      badge: 'ACTIVE', 
      badgeInactive: 'border border-amber-400/80 text-amber-300 bg-amber-950/40 shadow-[0_0_8px_rgba(245,158,11,0.3)]',
      badgeActive: 'bg-white/20 text-white border border-white/30 shadow-[0_0_8px_rgba(255,255,255,0.2)]'
    },
  ];

  const handleItemClick = (item) => {
    if (onItemClick) onItemClick();

    if (item.name === 'City Compare') {
      if (location.pathname === '/analytics') {
        const el = document.getElementById('city-compare');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
        window.location.hash = '#city-compare';
      } else {
        navigate('/analytics#city-compare');
      }
      return;
    }

    if (item.name === 'Analysis') {
      if (location.pathname === '/analytics') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        window.location.hash = '';
      } else {
        navigate('/analytics');
      }
      return;
    }

    if (item.path) {
      navigate(item.path);
    }
  };

  const isCurrentActive = (item) => {
    if (item.name === 'Dashboard' && (location.pathname === '/dashboard' || location.pathname === '/')) return true;
    if (item.name === 'AI Predictions' && location.pathname === '/predictions') return true;
    if (item.name === 'Analysis' && location.pathname === '/analytics' && !location.hash.includes('compare')) return true;
    if (item.name === 'City Compare' && location.pathname === '/analytics' && location.hash.includes('compare')) return true;
    if (item.name === 'City Reports' && location.pathname === '/reports') return true;
    if (item.name === 'Alerts' && location.pathname === '/alerts') return true;
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
              ? 'w-9 h-9 justify-center rounded-full'
              : 'w-full h-[38px] pl-2 pr-2.5 gap-2 rounded-[16px]'
          } transition-all duration-300 ease-out ${
            isActive
              ? `bg-gradient-to-r ${item.activeGradient} text-white border border-white/30 ${item.activeShadow} scale-[1.02]`
              : `bg-slate-900/40 hover:bg-slate-900/60 backdrop-blur-md border ${item.borderClass} ${item.textClass} hover:scale-[1.02]`
          }`}
        >
          {/* Circular Node Icon Container - precisely centered on the 32px vertical track line */}
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0">
            <Icon size={17} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-white' : item.textClass} />
          </div>

          {/* Expanded Labels and Badges (Compact & Sleek) */}
          {!collapsed && (
            <div className="flex items-center justify-between flex-1 min-w-0 pr-0.5 overflow-hidden animate-in fade-in duration-200">
              <span className={`text-[13px] tracking-wide truncate ${
                isActive ? 'font-semibold text-white' : 'font-medium text-slate-100 group-hover:text-white'
              }`}>
                {item.name}
              </span>
              {item.badge && (
                <span className={`text-[8.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 transition-all ${
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
          <div className="absolute left-[52px] top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-[#06141B]/95 text-white text-xs font-semibold rounded-xl opacity-0 -translate-x-2 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 z-50 whitespace-nowrap shadow-2xl border border-white/15 backdrop-blur-2xl flex items-center gap-1.5">
            <span className={item.textClass}>{item.name}</span>
            {item.badge && (
              <span className={`text-[8.5px] font-bold uppercase px-1.5 py-0.5 rounded-full border ${item.badgeInactive}`}>
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
          <div className="absolute top-8 -right-8 w-32 h-32 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-20 -right-6 w-36 h-36 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
          {/* Subtle 4-Point Star Sparkle in Bottom Right */}
          <div className="absolute bottom-5 right-5 select-none pointer-events-none text-cyan-200/25 animate-pulse">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
            </svg>
          </div>
        </>
      )}

      {/* The Single Continuous Glowing Neon Track Line */}
      <div className={`absolute top-[54px] bottom-6 ${
        collapsed ? 'left-1/2 -translate-x-1/2' : 'left-[32px] -translate-x-1/2'
      } w-[2px] bg-gradient-to-b from-cyan-400 via-teal-400 to-cyan-500/80 shadow-[0_0_8px_rgba(34,211,238,0.7)] rounded-full z-0 pointer-events-none transition-all duration-300`}></div>

      {/* Top: Logo, PRO badge, Enterprise AI & Pin Control */}
      <div className="relative z-10 mb-4 flex items-center justify-between w-full h-10 px-0.5">
        <div
          onClick={() => {
            if (onItemClick) onItemClick();
            navigate('/dashboard');
          }}
          className="flex items-center gap-2.5 cursor-pointer group/logo min-w-0"
        >
          {/* Leaf Squircle */}
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500/30 via-teal-400/25 to-blue-500/30 border border-cyan-400/60 shadow-[0_0_12px_rgba(34,211,238,0.4)] flex items-center justify-center text-cyan-100 shrink-0 transition-transform duration-300 group-hover/logo:scale-105 backdrop-blur-md">
            <Leaf size={19} strokeWidth={2.5} />
          </div>

          {!collapsed && (
            <div className="flex flex-col min-w-0 overflow-hidden animate-in fade-in duration-200">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-white text-sm tracking-tight whitespace-nowrap">
                  AirSense
                </span>
                <span className="text-[9px] font-bold text-cyan-300 border border-cyan-400/60 rounded-full px-1.5 py-0.2 shadow-[0_0_6px_rgba(34,211,238,0.3)] bg-cyan-950/40">
                  PRO
                </span>
              </div>
              <span className="text-[8.5px] font-bold tracking-wider text-emerald-400 uppercase flex items-center gap-1 whitespace-nowrap mt-0.5">
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
            {isPinned ? <PinOff size={15} /> : <Pin size={15} />}
          </button>
        )}
      </div>

      {/* Main Navigation Items: 6 Compact Primary Nodes */}
      <div className="relative z-10 flex-1 w-full flex flex-col items-center justify-start gap-1.5 py-0.5 overflow-y-auto overflow-x-hidden scrollbar-hide">
        {navItems.map((item) => (
          <NavIcon key={item.name} item={item} />
        ))}
      </div>
    </nav>
  );
}
