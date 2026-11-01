import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Wind, 
  Map, 
  BrainCircuit, 
  Building2, 
  History, 
  ChartNoAxesCombined, 
  Bell, 
  Settings, 
  User, 
  LogOut,
  Leaf,
  Pin,
  PinOff
} from 'lucide-react';
import { useAuthStore } from '../context/store';
import { apiService } from '../services/apiService';

export default function Sidebar({ collapsed, isPinned, onTogglePin, onItemClick }) {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, badge: 'LIVE', badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
    { name: 'Live AQI', path: '/dashboard#aqi-metrics', icon: Wind },
    { name: 'Air Quality Map', path: '/dashboard#map', icon: Map },
    { name: 'AI Predictions', path: '/predictions', icon: BrainCircuit, badge: 'FORECAST', badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' },
    { name: 'City Reports', path: '/reports', icon: Building2, badge: 'AUDIT', badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
    { name: 'Historical Analysis', path: '/reports', icon: History },
    { name: 'Data Visualization', path: '/analytics', icon: ChartNoAxesCombined, badge: 'PRO', badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
    { name: 'Alerts', path: '/alerts', icon: Bell, ping: true },
  ];

  const bottomItems = [
    { name: 'Profile', path: '/settings', icon: User },
    { name: 'Settings', path: '/settings', icon: Settings },
    { name: 'Logout', action: 'logout', icon: LogOut },
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

  const handleItemClick = (item) => {
    if (onItemClick) onItemClick();

    if (item.action === 'logout') {
      handleLogout();
      return;
    }

    if (item.path) {
      if (item.name === 'Live AQI' && location.pathname === '/dashboard') {
        const el = document.getElementById('air-quality-station-section') || document.querySelector('main');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      } else if (item.name === 'Air Quality Map' && location.pathname === '/dashboard') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        navigate(item.path);
      }
    }
  };

  const isCurrentActive = (item) => {
    if (item.path === '/dashboard' && (location.pathname === '/dashboard' || location.pathname === '/')) return true;
    if (item.path === '/predictions' && location.pathname === '/predictions') return true;
    if (item.path === '/reports' && location.pathname === '/reports') return true;
    if (item.path === '/analytics' && location.pathname === '/analytics') return true;
    if (item.path === '/alerts' && location.pathname === '/alerts') return true;
    if (item.path === '/settings' && location.pathname === '/settings') return true;
    return false;
  };

  const NavIcon = ({ item }) => {
    const isActive = isCurrentActive(item);
    const Icon = item.icon;
    const isLogout = item.action === 'logout';

    return (
      <div className={`relative group w-full flex ${collapsed ? 'justify-center' : 'justify-start'} py-1 px-1`}>
        <button
          onClick={() => handleItemClick(item)}
          className={`relative z-10 flex items-center ${
            collapsed
              ? 'w-11 h-11 justify-center rounded-full'
              : 'w-full gap-3 px-2 py-1.5 rounded-2xl'
          } transition-all duration-300 ease-out ${
            isActive
              ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] scale-[1.03]'
              : isLogout
                ? 'bg-slate-900/90 text-rose-400 hover:text-white hover:bg-rose-500/20 border border-white/10 hover:border-rose-500/30'
                : 'bg-slate-900/90 text-slate-400 hover:text-cyan-400 hover:bg-slate-800/80 hover:scale-[1.03] border border-white/10'
          }`}
        >
          {/* Circular Node Button */}
          <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0">
            <Icon size={19} strokeWidth={isActive ? 2.5 : 2} />
          </div>

          {/* Expanded Labels and Badges (Auto Open on Hover) */}
          {!collapsed && (
            <div className="flex items-center justify-between flex-1 min-w-0 pr-2 overflow-hidden animate-in fade-in duration-200">
              <span className={`text-xs whitespace-nowrap overflow-hidden text-ellipsis ${
                isActive ? 'font-black text-white' : 'font-bold text-slate-300 group-hover:text-white'
              }`}>
                {item.name}
              </span>
              {item.badge && (
                <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border shrink-0 ${item.badgeColor || 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'}`}>
                  {item.badge}
                </span>
              )}
            </div>
          )}
        </button>

        {/* Floating Tooltip (When Collapsed) */}
        {collapsed && (
          <div className="absolute left-[64px] top-1/2 -translate-y-1/2 px-3 py-1.5 bg-slate-900/95 text-white text-xs font-semibold rounded-lg opacity-0 -translate-x-2 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 z-50 whitespace-nowrap shadow-2xl border border-white/15 backdrop-blur-2xl flex items-center gap-1.5">
            <span>{item.name}</span>
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
    <nav className="h-full w-full flex flex-col p-3 select-none justify-between overflow-hidden relative">
      {/* The Single Continuous Vertical Line (Centered when collapsed, behind icons when expanded) */}
      <div className={`absolute top-0 bottom-0 ${
        collapsed ? 'left-1/2 -translate-x-1/2' : 'left-[32px] -translate-x-1/2'
      } w-[2px] bg-slate-700/60 z-0 transition-all duration-300`}></div>

      {/* Top: Logo & Pin Control */}
      <div className="relative z-10 mb-4 flex items-center justify-between w-full px-1">
        <div
          onClick={() => {
            if (onItemClick) onItemClick();
            navigate('/dashboard');
          }}
          className="flex items-center gap-3 cursor-pointer group/logo min-w-0"
        >
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-white shadow-lg shrink-0 transition-transform duration-300 group-hover/logo:scale-105">
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

      {/* Main Navigation Items */}
      <div className="relative z-10 flex-1 w-full flex flex-col items-center overflow-y-auto overflow-x-hidden scrollbar-hide py-1">
        {navItems.map((item) => (
          <NavIcon key={item.name} item={item} />
        ))}
      </div>

      {/* Bottom Section: Profile, Settings, Logout */}
      <div className="relative z-10 mt-auto pt-2 border-t border-white/10 flex flex-col items-center w-full">
        {bottomItems.map((item) => (
          <NavIcon key={item.name} item={item} />
        ))}
      </div>
    </nav>
  );
}
