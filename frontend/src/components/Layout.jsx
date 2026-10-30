import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
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
          isPinned ? 'w-64' : 'w-24'
        }`}
      />

      {/* Desktop Fixed Floating & Overlapping Sidebar */}
      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`fixed top-3 left-3 bottom-3 h-[calc(100vh-1.5rem)] ${isExpanded ? 'w-64' : 'w-20'} backdrop-blur-3xl bg-slate-950/80 border border-white/15 rounded-3xl shadow-[0_24px_70px_0_rgba(0,0,0,0.85)] transition-all duration-300 ease-in-out hidden md:flex flex-col z-40 overflow-visible`}
      >
        <Sidebar
          collapsed={!isExpanded}
          isPinned={isPinned}
          onTogglePin={togglePin}
        />
      </aside>

      {/* Mobile Sidebar Overlay Drawer */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 md:hidden bg-black/70 backdrop-blur-md flex"
          onClick={() => setMobileOpen(false)}
        >
          <aside
            className="w-72 h-full backdrop-blur-3xl bg-slate-900/95 shadow-2xl border-r border-white/20 p-2 animate-in slide-in-from-left duration-300"
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
            <Sidebar
              collapsed={false}
              isPinned={true}
              onItemClick={() => setMobileOpen(false)}
            />
          </aside>
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
          isPinned={isPinned}
          isExpanded={isExpanded}
          floating={fullBleed}
        />

        {/* Page Content */}
        <main className={`flex-1 overflow-y-auto ${fullBleed ? 'p-0' : 'p-4 md:p-8 space-y-6'}`}>
          {children}
        </main>
      </div>
    </div>
  );
}
