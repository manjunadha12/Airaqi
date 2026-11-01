import React, { useState } from 'react';
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
  Leaf
} from 'lucide-react';
import { useAuthStore } from '../context/store';
import { apiService } from '../services/apiService';

const Sidebar = ({ onItemClick, isMobile = false }) => {
  const { logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeRoute, setActiveRoute] = useState(() => {
    if (location.pathname === '/predictions') return 'AI Predictions';
    if (location.pathname === '/reports') return 'City Reports';
    if (location.pathname === '/analytics') return 'Data Visualization';
    if (location.pathname === '/alerts') return 'Alerts';
    if (location.pathname === '/settings') return 'Settings';
    return 'Dashboard';
  });

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Live AQI', path: '/dashboard', icon: Wind },
    { name: 'Air Quality Map', path: '/dashboard', icon: Map },
    { name: 'AI Predictions', path: '/predictions', icon: BrainCircuit },
    { name: 'City Reports', path: '/reports', icon: Building2 },
    { name: 'Historical Analysis', path: '/reports', icon: History },
    { name: 'Data Visualization', path: '/analytics', icon: ChartNoAxesCombined },
    { name: 'Alerts', path: '/alerts', icon: Bell },
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
    setActiveRoute(item.name);
    if (onItemClick) onItemClick();

    if (item.action === 'logout') {
      handleLogout();
      return;
    }

    if (item.path) {
      if (item.name === 'Live AQI' && location.pathname === '/dashboard') {
        window.scrollTo({ top: 380, behavior: 'smooth' });
      } else if (item.name === 'Air Quality Map' && location.pathname === '/dashboard') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        navigate(item.path);
      }
    }
  };

  const NavIcon = ({ item }) => {
    const isCurrentPath = 
      (item.path === '/dashboard' && location.pathname === '/dashboard') ||
      (item.path === '/predictions' && location.pathname === '/predictions') ||
      (item.path === '/reports' && location.pathname === '/reports') ||
      (item.path === '/analytics' && location.pathname === '/analytics') ||
      (item.path === '/alerts' && location.pathname === '/alerts') ||
      (item.path === '/settings' && location.pathname === '/settings');

    const isActive = activeRoute === item.name || (isCurrentPath && activeRoute === item.name);
    const Icon = item.icon;
    
    return (
      <div className="relative group w-full flex justify-center py-2">
        <button
          onClick={() => handleItemClick(item)}
          className={`relative z-10 flex items-center justify-center w-11 h-11 rounded-full transition-all duration-300 ease-out
            ${isActive 
              ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] scale-110' 
              : 'bg-white dark:bg-slate-900 text-gray-400 dark:text-slate-400 hover:text-blue-500 dark:hover:text-cyan-400 hover:scale-110 hover:shadow-md border border-gray-100 dark:border-white/10'
            }`}
        >
          <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
        </button>

        {/* Tooltip */}
        <div className="absolute left-[70px] top-1/2 -translate-y-1/2 px-3 py-1.5 bg-gray-800 dark:bg-slate-900 text-white text-xs font-medium rounded-lg opacity-0 -translate-x-3 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 z-50 whitespace-nowrap shadow-xl border border-transparent dark:border-white/10">
          {item.name}
          {/* Tooltip triangle pointer */}
          <div className="absolute left-[-4px] top-1/2 -translate-y-1/2 w-2 h-2 bg-gray-800 dark:bg-slate-900 rotate-45 border-l border-b border-transparent dark:border-white/10"></div>
        </div>
      </div>
    );
  };

  return (
    <aside className={`h-screen w-[72px] bg-[#f8fafc] dark:bg-[#06141B]/95 backdrop-blur-2xl flex flex-col items-center py-6 z-40 border-r border-gray-200/50 dark:border-white/10 select-none ${
      isMobile ? 'relative h-full' : 'fixed left-0 top-0 hidden md:flex'
    }`}>
      
      {/* The Single Continuous Vertical Line */}
      <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[2px] bg-gray-200 dark:bg-slate-700/60 z-0"></div>

      {/* Logo Section */}
      <div className="relative z-10 mb-6 bg-transparent py-2 px-1">
        <button
          onClick={() => {
            setActiveRoute('Dashboard');
            navigate('/dashboard');
          }}
          className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-white shadow-lg transition-transform duration-300 hover:scale-105 active:scale-95"
          title="AirSense Cloud"
        >
          <Leaf size={24} strokeWidth={2.5} />
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="relative z-10 flex-1 w-full flex flex-col items-center overflow-y-auto scrollbar-hide py-1 bg-transparent">
        {navItems.map((item) => (
          <NavIcon key={item.name} item={item} />
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="relative z-10 mt-auto pt-3 flex flex-col items-center w-full bg-transparent pb-2">
        {bottomItems.map((item) => (
          <NavIcon key={item.name} item={item} />
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;
