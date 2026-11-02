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

  // 6 Primary Core Nodes with Distinct Colors (One Icon, One Colour - Clean Project Style without Glow Effects)
  const navItems = [
    { 
      name: 'Dashboard', 
      path: '/dashboard', 
      icon: LayoutDashboard, 
      textClass: 'text-sky-400',
      activeGradient: 'from-blue-600 to-cyan-600',
      borderClass: 'border-white/10 hover:border-sky-500/30',
      hoverText: 'hover:text-sky-300',
      badge: 'LIVE', 
      badgeInactive: 'border border-sky-500/30 text-sky-400 bg-sky-950/50',
      badgeActive: 'bg-white/20 text-white border border-white/30'
    },
    { 
      name: 'AI Predictions', 
      path: '/predictions', 
      icon: BrainCircuit, 
      textClass: 'text-purple-400',
      activeGradient: 'from-purple-600 to-indigo-600',
      borderClass: 'border-white/10 hover:border-purple-500/30',
      hoverText: 'hover:text-purple-300',
      badge: 'FORECAST', 
      badgeInactive: 'border border-purple-500/30 text-purple-400 bg-purple-950/50',
      badgeActive: 'bg-white/20 text-white border border-white/30'
    },
    { 
      name: 'Analysis', 
      path: '/analytics', 
      icon: TrendingUp, 
      textClass: 'text-cyan-400',
      activeGradient: 'from-cyan-600 to-teal-600',
      borderClass: 'border-white/10 hover:border-cyan-500/30',
      hoverText: 'hover:text-cyan-300',
      badge: 'METRICS', 
      badgeInactive: 'border border-cyan-500/30 text-cyan-400 bg-cyan-950/50',
      badgeActive: 'bg-white/20 text-white border border-white/30'
    },
    { 
      name: 'City Compare', 
      path: '/analytics#city-compare', 
      icon: ArrowLeftRight, 
      textClass: 'text-indigo-400',
      activeGradient: 'from-indigo-600 to-violet-600',
      borderClass: 'border-white/10 hover:border-indigo-500/30',
      hoverText: 'hover:text-indigo-300',
      badge: 'COMPARE', 
      badgeInactive: 'border border-indigo-500/30 text-indigo-400 bg-indigo-950/50',
      badgeActive: 'bg-white/20 text-white border border-white/30'
    },
    { 
      name: 'City Reports', 
      path: '/reports', 
      icon: Building2, 
      textClass: 'text-emerald-400',
      activeGradient: 'from-emerald-600 to-teal-600',
      borderClass: 'border-white/10 hover:border-emerald-500/30',
      hoverText: 'hover:text-emerald-300',
      badge: 'AUDIT', 
      badgeInactive: 'border border-emerald-500/30 text-emerald-400 bg-emerald-950/50',
      badgeActive: 'bg-white/20 text-white border border-white/30'
    },
    { 
      name: 'Alerts', 
      path: '/alerts', 
      icon: Bell, 
      textClass: 'text-amber-400',
      activeGradient: 'from-amber-600 to-rose-600',
      borderClass: 'border-white/10 hover:border-amber-500/30',
      hoverText: 'hover:text-amber-300',
      badge: 'ACTIVE', 
      badgeInactive: 'border border-amber-500/30 text-amber-400 bg-amber-950/50',
      badgeActive: 'bg-white/20 text-white border border-white/30'
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
          } transition-all duration-200 ease-out ${
            isActive
              ? `bg-gradient-to-r ${item.activeGradient} text-white border border-white/20 shadow-md`
              : `bg-slate-900/60 hover:bg-slate-800/80 backdrop-blur-md border ${item.borderClass} ${item.textClass}`
          }`}
        >
          {/* Circular Node Icon Container - precisely centered on the 32px vertical track line */}
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0">
            <Icon size={17} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-white' : item.textClass} />
          </div>

          {/* Expanded Labels and Badges (Compact & Sleek) */}
          {!collapsed && (
            <div className="flex items-center justify-between flex-1 min-w-0 pr-0.5 overflow-hidden animate-in fade-in duration-150">
              <span className={`text-[13px] tracking-wide truncate ${
                isActive ? 'font-semibold text-white' : 'font-medium text-slate-200 group-hover:text-white'
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
          <div className="absolute left-[52px] top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-slate-950/95 text-white text-xs font-semibold rounded-xl opacity-0 -translate-x-2 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 z-50 whitespace-nowrap shadow-xl border border-white/15 backdrop-blur-2xl flex items-center gap-1.5">
            <span className={item.textClass}>{item.name}</span>
            {item.badge && (
              <span className={`text-[8.5px] font-bold uppercase px-1.5 py-0.5 rounded-full border ${item.badgeInactive}`}>
                {item.badge}
              </span>
            )}
            {/* Tooltip triangle pointer */}
            <div className="absolute left-[-4px] top-1/2 -translate-y-1/2 w-2 h-2 bg-slate-950/95 rotate-45 border-l border-b border-white/15"></div>
          </div>
        )}
      </div>
    );
  };

  return (
    <nav className="h-full w-full flex flex-col p-2 select-none overflow-hidden relative">
      {/* The Single Continuous Clean Vertical Track Line (No Glow Effect) */}
      <div className={`absolute top-[54px] bottom-6 ${
        collapsed ? 'left-1/2 -translate-x-1/2' : 'left-[32px] -translate-x-1/2'
      } w-[1.5px] bg-slate-700/60 rounded-full z-0 pointer-events-none transition-all duration-300`}></div>

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
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 border border-white/10 shadow-sm flex items-center justify-center text-white shrink-0 transition-transform duration-300 group-hover/logo:scale-105">
            <Leaf size={19} strokeWidth={2.5} />
          </div>

          {!collapsed && (
            <div className="flex flex-col min-w-0 overflow-hidden animate-in fade-in duration-150">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-white text-sm tracking-tight whitespace-nowrap">
                  AirSense
                </span>
                <span className="text-[9px] font-bold text-cyan-300 border border-cyan-500/30 rounded-full px-1.5 py-0.2 bg-cyan-950/60">
                  PRO
                </span>
              </div>
              <span className="text-[8.5px] font-bold tracking-wider text-emerald-400 uppercase flex items-center gap-1 whitespace-nowrap mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
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
