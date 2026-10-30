import React, { useState, useRef, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  FiBell,
  FiMoon,
  FiSun,
  FiLogOut,
  FiUser,
  FiMaximize,
  FiMinimize,
  FiSettings,
  FiActivity,
  FiCpu,
  FiMenu,
  FiTrendingUp,
  FiFileText
} from 'react-icons/fi';
import { useUIStore, useAuthStore } from '../context/store';
import { apiService } from '../services/apiService';

export default function Header({ onMenuClick, isPinned, isExpanded, floating = false }) {
  const { isDarkMode, toggleDarkMode } = useUIStore();
  const { user, logout } = useAuthStore();
  const location = useLocation();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  // Sample Interactive Atmospheric Notifications
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Atmospheric Forecast Calibrated',
      desc: '24-hour predictive forecast refreshed with continuous ground feeds and satellite data.',
      time: '2m ago',
      type: 'info',
      read: false
    },
    {
      id: 2,
      title: 'CPCB Ground Feed Synced',
      desc: 'Live telemetry received from Tamil Nadu & Central Pollution Control network.',
      time: '8m ago',
      type: 'success',
      read: false
    },
    {
      id: 3,
      title: 'Moderate PM2.5 Advisory',
      desc: 'Sensitive groups in metropolitan corridors advised to reduce peak-hour exertion.',
      time: '24m ago',
      type: 'warning',
      read: false
    }
  ]);

  // Click outside listener for all popups
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
      }
    }
  };

  const handleLogout = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setDropdownOpen(false);
    logout();
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    try {
      apiService.logout().catch(() => {});
    } catch (err) {}
    window.location.href = '/login';
  };

  const userInitial = user?.firstName?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase() || 'A';

  // Compute Page Title from Route
  const getPageInfo = () => {
    switch (location.pathname) {
      case '/dashboard':
        return { title: 'Live Command Dashboard', badge: 'Real-time Telemetry', icon: FiActivity, color: 'text-cyan-400' };
      case '/predictions':
        return { title: 'AI Environmental Predictions', badge: 'Multi-Horizon Model', icon: FiTrendingUp, color: 'text-cyan-400' };
      case '/reports':
        return { title: 'City Reports & Historical Log', badge: 'Audit Compliance', icon: FiFileText, color: 'text-emerald-400' };
      case '/analytics':
        return { title: 'Analytics Matrix & Global Rankings', badge: 'Comparative KPI', icon: FiActivity, color: 'text-purple-400' };
      case '/alerts':
        return { title: 'Incident Alerts & Warning Hub', badge: 'Active Sensors', icon: FiBell, color: 'text-amber-400' };
      case '/settings':
        return { title: 'Enterprise Cloud Settings', badge: 'System Config', icon: FiSettings, color: 'text-slate-400' };
      default:
        return { title: 'AirSense Environmental Intelligence', badge: 'Cloud AI', icon: FiActivity, color: 'text-cyan-400' };
    }
  };

  const pageInfo = getPageInfo();
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className={`${floating ? "absolute top-0 left-0 right-0 z-40 bg-gradient-to-b from-[#06141B]/90 via-[#06141B]/35 to-transparent border-b-0 shadow-none backdrop-blur-sm" : "backdrop-blur-3xl bg-slate-950/75 border-b border-white/10 shadow-[0_12px_40px_0_rgba(0,0,0,0.6)] sticky top-0 z-30"} transition-all duration-300 select-none`}>
      <div className="flex items-center justify-between h-16 px-4 md:px-6 gap-3">
        {/* Left: Mobile Toggle + Breadcrumbs / Page Identity */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onMenuClick}
            className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-2xl transition border border-white/10 active:scale-95 flex items-center justify-center md:hidden"
            title="Toggle Menu"
          >
            <FiMenu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5 min-w-0">
            <div className="hidden sm:flex p-2 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-inner">
              <pageInfo.icon className={`w-4 h-4 ${pageInfo.color}`} />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-black text-white text-sm md:text-base tracking-tight truncate">
                  {pageInfo.title}
                </h1>
                <span className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-cyan-950/60 text-cyan-300 border border-cyan-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                  {pageInfo.badge}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Unified Frosted Glass HUD Capsule */}
        <div className="flex items-center p-1.5 rounded-full bg-slate-950/80 hover:bg-slate-950/90 border border-white/15 backdrop-blur-2xl shadow-[0_12px_36px_0_rgba(0,0,0,0.65)] transition-all duration-300 flex-shrink-0">
          {/* Incident Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative p-2 text-slate-300 hover:text-white rounded-full hover:bg-white/10 transition"
              title="Incident & Calibration Notifications"
            >
              <FiBell className="w-4 h-4" />
              {unreadCount > 0 && (
                <>
                  <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full animate-ping"></span>
                  <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full"></span>
                </>
              )}
            </button>

            {/* Notifications Flyout Drawer */}
            {notifOpen && (
              <div className="absolute top-full right-0 mt-3 w-80 md:w-96 rounded-3xl bg-slate-900/95 border border-white/20 p-4 shadow-2xl backdrop-blur-3xl z-50 text-white animate-scaleUp">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-cyan-400">Live Telemetry Alerts</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300">
                      {unreadCount} New
                    </span>
                  </div>
                  <button
                    onClick={() => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))}
                    className="text-[11px] text-slate-400 hover:text-cyan-400 font-semibold transition"
                  >
                    Mark All Read
                  </button>
                </div>

                <div className="divide-y divide-white/10 mt-2 max-h-72 overflow-y-auto">
                  {notifications.map((item) => (
                    <div key={item.id} className="py-3 flex items-start gap-3 hover:bg-white/5 p-2 rounded-2xl transition">
                      <span className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${
                        item.type === 'warning' ? 'bg-amber-400 shadow-[0_0_8px_#f59e0b]' : 'bg-cyan-400 shadow-[0_0_8px_#06b6d4]'
                      }`}></span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-bold text-white truncate">{item.title}</p>
                          <span className="text-[10px] font-mono text-slate-400 shrink-0">{item.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-snug mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-white/10 text-center">
                  <Link
                    to="/alerts"
                    onClick={() => setNotifOpen(false)}
                    className="text-xs font-bold text-cyan-400 hover:text-cyan-300 tracking-wider uppercase"
                  >
                    View All Incident Logs &rarr;
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Fullscreen Zen Mode Button */}
          <button
            onClick={toggleFullscreen}
            className="hidden sm:flex p-2 text-slate-300 hover:text-white rounded-full hover:bg-white/10 transition"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen Zen Mode'}
          >
            {isFullscreen ? <FiMinimize className="w-4 h-4 text-cyan-400" /> : <FiMaximize className="w-4 h-4" />}
          </button>

          {/* Theme Switcher Button */}
          <button
            onClick={toggleDarkMode}
            className="p-2 text-slate-300 hover:text-white rounded-full hover:bg-white/10 transition"
            title="Toggle theme appearance"
          >
            {isDarkMode ? <FiSun className="w-4 h-4 text-amber-400" /> : <FiMoon className="w-4 h-4 text-indigo-400" />}
          </button>

          <div className="h-4 w-[1px] bg-white/15 mx-0.5" />

          {/* User Profile Capsule & Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 pl-2.5 pr-1 py-1 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 transition text-left"
              title={user ? `${user.firstName} ${user.lastName}` : 'User Profile'}
            >
              <div className="flex flex-col text-right hidden sm:block leading-tight">
                <span className="text-xs font-black text-white block truncate max-w-[80px]">
                  {user?.firstName || 'Analyst'}
                </span>
                <span className="text-[9px] font-bold text-cyan-400 capitalize block">
                  {user?.role?.replace('_', ' ') || 'User'}
                </span>
              </div>
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-md border border-white/30">
                {userInitial}
              </div>
            </button>

            {dropdownOpen && (
              <div className="absolute top-full right-0 mt-3 w-64 rounded-3xl bg-slate-900/95 border border-white/20 p-3.5 shadow-2xl backdrop-blur-3xl z-50 text-white animate-scaleUp">
                <div className="flex items-center gap-3 p-2 border-b border-white/10 pb-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-md">
                    {userInitial}
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-bold text-sm text-white truncate">
                      {user ? `${user.firstName} ${user.lastName}` : 'Authenticated Analyst'}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {user?.email || 'analyst@airsense.cloud'}
                    </p>
                  </div>
                </div>

                <div className="py-2.5 px-2 flex items-center justify-between text-[11px] border-b border-white/10">
                  <span className="text-slate-400 uppercase font-bold tracking-wider">Access Tier</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-cyan-950/70 text-cyan-300 border border-cyan-500/30 font-black capitalize">
                    {user?.role?.replace('_', ' ') || 'Enterprise Analyst'}
                  </span>
                </div>

                <div className="py-2 space-y-1">
                  <Link
                    to="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition"
                  >
                    <FiUser className="w-4 h-4 text-cyan-400" />
                    <span>Profile Management</span>
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition"
                  >
                    <FiSettings className="w-4 h-4 text-cyan-400" />
                    <span>System Settings</span>
                  </Link>
                </div>

                <div className="pt-2 border-t border-white/10">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-300 hover:text-white hover:bg-rose-500/20 transition cursor-pointer"
                  >
                    <FiLogOut className="w-4 h-4 text-rose-400" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
