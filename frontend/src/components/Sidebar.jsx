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

  // 4 Primary Core Nodes with Distinct Colors ("One Icon, One Colour")
  const navItems = [
    { 
      name: 'Dashboard', 
      path: '/dashboard', 
      icon: LayoutDashboard, 
      textClass: 'text-sky-400',
      activeGradient: 'from-sky-500 to-blue-600',
      activeShadow: 'shadow-[0_0_16px_rgba(14,165,233,0.55)]',
      borderClass: 'border-sky-500/40 hover:border-sky-400 hover:shadow-[0_0_12px_rgba(14,165,233,0.35)]',
      hoverText: 'hover:text-sky-300',
      badge: 'LIVE', 
      badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/40' 
    },
    { 
      name: 'AI Predictions', 
      path: '/predictions', 
      icon: BrainCircuit, 
      textClass: 'text-purple-400',
      activeGradient: 'from-purple-500 to-indigo-600',
      activeShadow: 'shadow-[0_0_16px_rgba(168,85,247,0.55)]',
      borderClass: 'border-purple-500/40 hover:border-purple-400 hover:shadow-[0_0_12px_rgba(168,85,247,0.35)]',
      hoverText: 'hover:text-purple-300',
      badge: 'FORECAST', 
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40' 
    },
    { 
      name: 'City Reports', 
      path: '/reports', 
      icon: Building2, 
      textClass: 'text-emerald-400',
      activeGradient: 'from-emerald-500 to-teal-600',
      activeShadow: 'shadow-[0_0_16px_rgba(16,185,129,0.55)]',
      borderClass: 'border-emerald-500/40 hover:border-emerald-400 hover:shadow-[0_0_12px_rgba(16,185,129,0.35)]',
      hoverText: 'hover:text-emerald-300',
      badge: 'AUDIT', 
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
    },
    { 
      name: 'Alerts', 
      path: '/alerts', 
      icon: Bell, 
      textClass: 'text-amber-400',
      activeGradient: 'from-amber-500 to-rose-600',
      activeShadow: 'shadow-[0_0_16px_rgba(245,158,11,0.55)]',
      borderClass: 'border-amber-500/40 hover:border-amber-400 hover:shadow-[0_0_12px_rgba(245,158,11,0.35)]',
      hoverText: 'hover:text-amber-300',
      badge: 'ACTIVE', 
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      ping: true 
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
      <div className={`relative group w-full flex ${collapsed ? 'justify-center' : 'justify-start'} py-2`}>
        <button
          onClick={() => handleItemClick(item)}
          className={`relative z-10 flex items-center ${
            collapsed
              ? 'w-11 h-11 justify-center rounded-full'
              : 'w-full gap-3 px-2.5 py-2 rounded-2xl'
          } transition-all duration-300 ease-out ${
            isActive
              ? `bg-gradient-to-tr ${item.activeGradient} text-white ${item.activeShadow} scale-[1.05]`
              : `bg-slate-950/90 ${item.textClass} ${item.borderClass} ${item.hoverText} border hover:scale-[1.05]`
          }`}
        >
          {/* Circular Node Icon */}
          <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0">
            <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
          </div>

          {/* Expanded Labels and Badges (Auto Open on Hover) */}
          {!collapsed && (
            <div className="flex items-center justify-between flex-1 min-w-0 pr-1 overflow-hidden animate-in fade-in duration-200">
              <span className={`text-xs whitespace-nowrap overflow-hidden text-ellipsis ${
                isActive ? 'font-black text-white' : 'font-bold text-slate-200 group-hover:text-white'
              }`}>
                {item.name}
              </span>
              {item.badge && (
                <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border shrink-0 ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}
            </div>
          )}
        </button>

        {/* Floating Tooltip (When Collapsed) */}
        {collapsed && (
          <div className="absolute left-[60px] top-1/2 -translate-y-1/2 px-3 py-1.5 bg-slate-900/95 text-white text-xs font-semibold rounded-xl opacity-0 -translate-x-2 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 z-50 whitespace-nowrap shadow-2xl border border-white/15 backdrop-blur-2xl flex items-center gap-2">
            <span className={item.textClass}>{item.name}</span>
            {item.badge && (
              <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded border ${item.badgeColor}`}>
                {item.badge}
              </span>
            )}
            {/* Tooltip triangle pointer */}
            <div className="absolute left-[-4px] top-1/2 -translate-y-1/2 w-2 h-2 bg-slate-900/95 rotate-45 border-l border-b border-white/15"></div>
          </div>
        )}
      </div>
    );
  };

  return (
    <nav className="h-full w-full flex flex-col p-2 select-none overflow-hidden relative">
      {/* The Single Continuous Vertical Line */}
      <div className={`absolute top-0 bottom-0 ${
        collapsed ? 'left-1/2 -translate-x-1/2' : 'left-[30px] -translate-x-1/2'
      } w-[2px] bg-slate-700/60 z-0 transition-all duration-300`}></div>

      {/* Top: Logo & Pin Control */}
      <div className="relative z-10 mb-5 flex items-center justify-between w-full px-1 pt-1">
        <div
          onClick={() => {
            if (onItemClick) onItemClick();
            navigate('/dashboard');
          }}
          className="flex items-center gap-3 cursor-pointer group/logo min-w-0"
        >
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-[0_0_16px_rgba(6,182,212,0.4)] shrink-0 transition-transform duration-300 group-hover/logo:scale-105">
            <Leaf size={22} strokeWidth={2.5} />
          </div>

          {!collapsed && (
            <div className="flex flex-col min-w-0 overflow-hidden transition-all duration-300">
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
      <div className="relative z-10 flex-1 w-full flex flex-col items-center justify-start gap-1 py-1 overflow-y-auto overflow-x-hidden scrollbar-hide">
        {navItems.map((item) => (
          <NavIcon key={item.name} item={item} />
        ))}
      </div>
    </nav>
  );
}
