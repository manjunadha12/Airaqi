import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { FiX, FiHome, FiBarChart2, FiTrendingUp, FiBell, FiMenu } from 'react-icons/fi';
import Sidebar from './Sidebar';
import Header from './Header';
import AirParticlesBackground from './AirParticlesBackground';
import { socketService } from '../services/socketService';
import { toast } from 'react-toastify';
import { useAuthStore, useAQIStore } from '../context/store';

export default function Layout({ children, fullBleed = false }) {
  // Auto-hide by default (isPinned = false). If user pins it, it stays pinned.
  const [isPinned, setIsPinned] = useState(() => {
    return localStorage.getItem('airsense_sidebar_pinned') === 'true';
  });
  const [isHovered, setIsHovered] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const { user } = useAuthStore();
  const { selectedCity } = useAQIStore();

  const togglePin = () => {
    setIsPinned((prev) => {
      const next = !prev;
      localStorage.setItem('airsense_sidebar_pinned', next ? 'true' : 'false');
      return next;
    });
  };

  const isExpanded = isPinned || isHovered;

  useEffect(() => {
    // Request PC notification permission
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    if (user) {
      const socket = socketService.connect(user._id, user.organization);

      socketService.onNewAlert((alert) => {
        console.log('🔔 New Alert Received:', alert);

        // Filter: Popup toasts should match the currently selected location
        if (selectedCity && alert.city && alert.city.toLowerCase() !== selectedCity.toLowerCase()) {
          console.log(`Ignoring popup alert for ${alert.city} as user is viewing ${selectedCity}`);
          return;
        }

        const aqi = alert.value;
        const level = alert.level || (aqi > 100 ? 'High' : (aqi > 50 ? 'Moderate' : 'Good'));
        const pm25Status = alert.pm25 > 50 ? 'High' : 'Low';
        const title = aqi > 100 ? `⚠️ ALERT: ${alert.city}` : `Update: ${alert.city}`;

        // Toast popup matching selected city
        toast.info(
          <div>
            <p className="font-bold">{title}</p>
            <p className="text-xs">AQI: {aqi} | PM2.5: {pm25Status}</p>
          </div>,
          { position: "bottom-right", autoClose: 5000 }
        );

        // Native PC Notification
        if ("Notification" in window && Notification.permission === "granted") {
          try {
            const notification = new Notification(title, {
              body: `AQI: ${aqi} [${level}] | PM2.5: ${pm25Status}\n\n${alert.description}`,
              icon: '/favicon.ico',
              silent: false
            });
            notification.onclick = () => window.focus();
          } catch (e) {
            console.error('Error creating PC notification:', e);
          }
        }
      });
    }

    return () => {
      // Don't disconnect here as it might be used by multiple components
    };
  }, [user, selectedCity]);

  return (
    <div className="flex h-screen bg-[#06141B] text-gray-900 dark:text-gray-100 relative overflow-hidden">
      {/* Cloud Dark Theme with Atmospheric Air Particles & Cloud Nebulas */}
      <AirParticlesBackground />

      {/* Desktop Layout Placeholder (maintains constant space so page never reflows) */}
      <div
        className={`hidden md:block flex-shrink-0 transition-all duration-300 ease-in-out ${
          'w-[72px]'
        }`}
      />

      {/* Backside 50% Blur Backdrop when cursor is placed on sidebar */}
      <div
        className={`fixed inset-0 z-30 transition-all duration-300 pointer-events-none hidden md:block ${
          isHovered
            ? 'opacity-100 backdrop-blur-md bg-black/50'
            : 'opacity-0'
        }`}
      />

      {/* Desktop Fixed Floating & Overlapping Sidebar */}
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="hidden md:block"
      >
        <Sidebar />




      </div>

      {/* Mobile Sidebar Overlay Drawer */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 md:hidden bg-black/70 backdrop-blur-md flex"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="w-[72px] h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-end p-2">
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-white/10"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>
            <Sidebar isMobile onItemClick={() => setMobileOpen(false)} />



    
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden z-10 min-w-0 relative">
        {/* Header */}
        <Header
          onMenuClick={() => {
            if (window.innerWidth < 768) {
              setMobileOpen(true);
            } else {
              togglePin();
            }
          }}

          isExpanded={isExpanded}
          floating={fullBleed}
        />


        {/* Page Content */}
        <main className={`flex-1 overflow-y-auto pb-20 md:pb-0 ${fullBleed ? 'p-0' : 'p-3 sm:p-5 md:p-8 space-y-4 sm:space-y-6'}`}>
          {children}
        </main>

        {/* Mobile Bottom Navigation Bar (Native Mobile Web App Navigation) */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-[#06141B]/95 backdrop-blur-2xl border-t border-white/10 px-2 py-1.5 shadow-[0_-10px_35px_rgba(0,0,0,0.8)] flex items-center justify-around">
          <Link
            to="/dashboard"
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 ${
              location.pathname === '/dashboard'
                ? 'text-cyan-400 bg-cyan-500/15 font-bold shadow-inner'
                : 'text-slate-400 hover:text-slate-200 font-medium'
            }`}
          >
            <FiHome className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">Overview</span>
          </Link>

          <Link
            to="/analytics"
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 ${
              location.pathname === '/analytics'
                ? 'text-cyan-400 bg-cyan-500/15 font-bold shadow-inner'
                : 'text-slate-400 hover:text-slate-200 font-medium'
            }`}
          >
            <FiBarChart2 className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">Analytics</span>
          </Link>

          <Link
            to="/predictions"
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 ${
              location.pathname === '/predictions'
                ? 'text-cyan-400 bg-cyan-500/15 font-bold shadow-inner'
                : 'text-slate-400 hover:text-slate-200 font-medium'
            }`}
          >
            <FiTrendingUp className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">Predict</span>
          </Link>

          <Link
            to="/alerts"
            className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 ${
              location.pathname === '/alerts'
                ? 'text-cyan-400 bg-cyan-500/15 font-bold shadow-inner'
                : 'text-slate-400 hover:text-slate-200 font-medium'
            }`}
          >
            <div className="relative">
              <FiBell className="w-5 h-5 mb-0.5" />
              <span className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-slate-950 animate-pulse" />
            </div>
            <span className="text-[10px] tracking-tight">Alerts</span>
          </Link>

          <button
            onClick={() => setMobileOpen(true)}
            className="flex flex-col items-center justify-center py-1 px-3 rounded-2xl text-slate-400 hover:text-slate-200 transition-all duration-200 font-medium cursor-pointer"
          >
            <FiMenu className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">More</span>
          </button>
        </nav>
      </div>
    </div>
  );
}
