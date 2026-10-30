import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Footer from '../components/Footer';
import { useAuthStore, useAQIStore } from '../context/store';
import { apiService } from '../services/apiService';
import { INDIAN_CITIES } from '../config/cities';
import { toast } from 'react-toastify';
import {
  FiSettings,
  FiUser,
  FiBell,
  FiLock,
  FiEye,
  FiMapPin,
  FiSliders,
  FiCompass,
  FiSave,
  FiRefreshCw,
  FiLogOut,
  FiDownload,
  FiCheckCircle,
  FiClock,
  FiActivity,
  FiHeart,
  FiTrash2,
  FiPlus,
  FiCheck,
  FiEyeOff,
  FiSun,
  FiWind
} from 'react-icons/fi';

export default function Settings() {
  const { user, setUser, logout } = useAuthStore();
  const { selectedCity, setSelectedCity, currentAQI } = useAQIStore();

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'health' | 'display' | 'notifications' | 'security'
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    city: selectedCity || 'Chennai',
    organization: user?.organization?.name || 'AirSense Network User',
    department: user?.department || 'Urban Environmental Health'
  });

  // Health Sensitivity Profile State
  const [healthProfile, setHealthProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('airsense_health_profile');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      sensitivityGroup: 'general', // 'general' | 'asthma' | 'elderly' | 'children' | 'athlete'
      dailyWalkAdvisory: true,
      maskRecommendation: true,
      purifierAutomation: true,
      savedPlaces: [
        { id: 1, name: 'Home', area: 'Poonamallee', city: 'Chennai' },
        { id: 2, name: 'Workplace', area: 'Guindy Industrial Estate', city: 'Chennai' }
      ]
    };
  });

  // Display & Visual Preferences State
  const [displayPrefs, setDisplayPrefs] = useState(() => {
    try {
      const saved = localStorage.getItem('airsense_display_prefs');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      ambientParticles: true,
      highContrastAQI: false,
      temperatureUnit: 'celsius', // 'celsius' | 'fahrenheit'
      defaultLandingPage: '/dashboard', // '/dashboard' | '/map' | '/predictions' | '/reports'
      compactTelemetry: false
    };
  });

  // Notification & Daily Digest Preferences
  const [notifPrefs, setNotifPrefs] = useState(() => {
    try {
      const saved = localStorage.getItem('airsense_notif_prefs');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      morningDigest: true,
      digestTime: '07:30',
      eveningWalkTip: true,
      severeAirAlert: true,
      alertThreshold: 100, // Trigger when AQI > 100 (Moderate+)
      emailUpdates: true,
      browserPush: true
    };
  });

  // Security Form State
  const [securityForm, setSecurityForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // New Place modal/input state
  const [newPlaceName, setNewPlaceName] = useState('');
  const [newPlaceArea, setNewPlaceArea] = useState('');

  // Active Location Title
  const activeLocation = (() => {
    try {
      const saved = localStorage.getItem('airsense_active_location');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return null;
  })();

  const locationTitle = activeLocation?.area
    ? `${activeLocation.area}, ${activeLocation.city || ''}`.replace(/,\s*$/, '')
    : (activeLocation?.city || selectedCity || 'Chennai');

  const liveAQIValue = currentAQI?.aqi?.value ?? currentAQI?.aqi ?? 46;

  // Indian National AQI Category helper
  const getCatInfo = (val) => {
    const v = Number(val);
    if (isNaN(v) || v < 0) return { label: 'Unknown', color: '#94a3b8' };
    if (v <= 50) return { label: 'Good', color: '#16a34a' };
    if (v <= 100) return { label: 'Satisfactory', color: '#84cc16' };
    if (v <= 200) return { label: 'Moderate', color: '#eab308' };
    if (v <= 300) return { label: 'Poor', color: '#f97316' };
    if (v <= 400) return { label: 'Very Poor', color: '#ef4444' };
    return { label: 'Severe', color: '#7f1d1d' };
  };

  const cat = getCatInfo(liveAQIValue);

  // Sync profile when store user updates
  useEffect(() => {
    if (user) {
      setProfileForm((prev) => ({
        ...prev,
        firstName: user.firstName || prev.firstName,
        lastName: user.lastName || prev.lastName,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
        department: user.department || prev.department
      }));
    }
  }, [user]);

  // Refresh profile from backend
  const refreshUserProfile = async () => {
    try {
      setRefreshing(true);
      const res = await apiService.getMe();
      if (res?.data?.success && res.data.user) {
        setUser(res.data.user);
        toast.success('User profile updated from cloud');
      }
    } catch (err) {
      console.warn('Could not refresh profile:', err.message);
    } finally {
      setRefreshing(false);
    }
  };

  // Save Profile Changes
  const handleSaveProfile = async (e) => {
    e?.preventDefault();
    try {
      setSaving(true);
      const payload = {
        firstName: profileForm.firstName,
        lastName: profileForm.lastName,
        phone: profileForm.phone,
        department: profileForm.department
      };

      const res = await apiService.updateProfile(payload);
      if (res?.data?.success) {
        setUser(res.data.user);
        toast.success('Profile details saved successfully');
      } else {
        const updatedUser = { ...user, ...payload };
        setUser(updatedUser);
        toast.success('Profile preferences saved in session');
      }
    } catch (err) {
      console.warn('Backend update note:', err.message);
      const updatedUser = { ...user, ...profileForm };
      setUser(updatedUser);
      toast.success('Profile updated in session');
    } finally {
      setSaving(false);
    }
  };

  // Save Health Sensitivity Profile
  const handleSaveHealthProfile = (newProfile) => {
    setHealthProfile(newProfile);
    localStorage.setItem('airsense_health_profile', JSON.stringify(newProfile));
    toast.success('Health advisory profile updated');
  };

  // Add Saved Favorite Place
  const handleAddPlace = () => {
    if (!newPlaceName.trim() || !newPlaceArea.trim()) {
      toast.warn('Please provide a place label (e.g. Home) and neighborhood');
      return;
    }
    const updated = {
      ...healthProfile,
      savedPlaces: [
        ...healthProfile.savedPlaces,
        {
          id: Date.now(),
          name: newPlaceName.trim(),
          area: newPlaceArea.trim(),
          city: selectedCity || 'Chennai'
        }
      ]
    };
    handleSaveHealthProfile(updated);
    setNewPlaceName('');
    setNewPlaceArea('');
  };

  // Remove Saved Place
  const handleRemovePlace = (id) => {
    const updated = {
      ...healthProfile,
      savedPlaces: healthProfile.savedPlaces.filter((p) => p.id !== id)
    };
    handleSaveHealthProfile(updated);
    toast.info('Saved location removed');
  };

  // Save Display Preferences
  const handleSaveDisplay = (newPrefs) => {
    setDisplayPrefs(newPrefs);
    localStorage.setItem('airsense_display_prefs', JSON.stringify(newPrefs));
    toast.success('Display and visual preferences updated');
  };

  // Save Notification Preferences
  const handleSaveNotifications = (newPrefs) => {
    setNotifPrefs(newPrefs);
    localStorage.setItem('airsense_notif_prefs', JSON.stringify(newPrefs));
    toast.success('Notification settings saved');
  };

  // Change Password
  const handleChangePassword = async (e) => {
    e?.preventDefault();
    if (!securityForm.currentPassword) {
      toast.error('Please enter your current security password');
      return;
    }
    if (securityForm.newPassword.length < 8) {
      toast.error('New password must contain at least 8 characters');
      return;
    }
    if (securityForm.newPassword !== securityForm.confirmPassword) {
      toast.error('New password confirmation does not match');
      return;
    }

    try {
      setSaving(true);
      const res = await apiService.changePassword({
        currentPassword: securityForm.currentPassword,
        newPassword: securityForm.newPassword
      });

      if (res?.data?.success) {
        toast.success('Security password updated successfully');
        setSecurityForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        toast.error(res?.data?.message || 'Failed to change password');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Error updating password';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  // Export User Profile Summary JSON
  const handleExportData = () => {
    const backup = {
      user: {
        name: `${profileForm.firstName} ${profileForm.lastName}`,
        email: profileForm.email,
        phone: profileForm.phone
      },
      healthProfile,
      displayPreferences: displayPrefs,
      notificationPreferences: notifPrefs,
      primaryLocation: locationTitle,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AirSense_Profile_Settings_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Account preferences exported');
  };

  const displayName = profileForm.firstName
    ? `${profileForm.firstName} ${profileForm.lastName}`.trim()
    : (user?.username || 'AirSense User');

  const avatarInitials = (profileForm.firstName?.[0] || 'A') + (profileForm.lastName?.[0] || 'S');

  return (
    <Layout>
      <div className="space-y-8 pb-16">
        {/* UNBOXED ATMOSPHERIC HEADER */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5 pt-2 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-500/10">
                  <FiSettings className="w-5 h-5" />
                </div>
                <span>Preferences & Account Settings</span>
              </h1>
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/30 text-[11px] font-mono font-bold shadow-sm backdrop-blur-xl">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                <span>PERSONALIZED ENVIRONMENTAL PROFILE</span>
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-400 mt-2 flex items-center gap-2 flex-wrap">
              <span>Account: <strong className="text-white">{displayName}</strong></span>
              <span>&bull;</span>
              <span>Primary Hub: <strong className="text-cyan-400">{locationTitle}</strong></span>
              <span>&bull;</span>
              <span>Health Protocol: <strong className="text-emerald-400 capitalize">{healthProfile.sensitivityGroup} Profile</strong></span>
            </p>
          </div>

          {/* Action Hub */}
          <div className="flex items-center gap-3 w-full lg:w-auto flex-wrap sm:flex-nowrap">
            {/* Export Settings */}
            <button
              onClick={handleExportData}
              className="px-4 py-2.5 bg-[#11212D] hover:bg-[#11212D]/80 text-slate-300 hover:text-white border border-white/15 rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg backdrop-blur-xl transition hover:scale-105 active:scale-95 flex items-center gap-2"
              title="Download Personal Preferences JSON"
            >
              <FiDownload className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Export Settings</span>
            </button>

            {/* Refresh */}
            <button
              onClick={refreshUserProfile}
              disabled={refreshing}
              className="p-2.5 bg-[#11212D] hover:bg-[#11212D]/80 text-white rounded-2xl border border-white/15 shadow-lg backdrop-blur-xl transition hover:scale-105 active:scale-95 disabled:opacity-60 flex items-center justify-center shrink-0"
              title="Sync with Cloud Profile"
            >
              <FiRefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-cyan-400' : ''}`} />
            </button>

            {/* Sign Out */}
            <button
              onClick={logout}
              className="px-4 py-2.5 bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 hover:text-rose-100 border border-rose-500/30 rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg transition hover:scale-105 active:scale-95 flex items-center gap-2 shrink-0"
              title="Sign Out of Account"
            >
              <FiLogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* SECTION 1: REPLACED USER-CENTRIC TELEMETRY HORIZON STRIP (#11212D) */}
        <div className="backdrop-blur-3xl bg-[#11212D]/90 border border-white/10 rounded-3xl p-5 md:p-6 shadow-[0_16px_50px_rgba(0,0,0,0.6)] grid grid-cols-2 lg:grid-cols-4 gap-6 divide-y lg:divide-y-0 lg:divide-x divide-white/10 relative overflow-hidden group">
          {/* Ambient Glow */}
          <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full blur-3xl opacity-15 pointer-events-none bg-cyan-500" />

          {/* Metric 1: Monitored Location & Real-time AQI */}
          <div className="flex flex-col justify-between pt-2 lg:pt-0">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
              <FiMapPin className="w-3.5 h-3.5 text-cyan-400" />
              Primary Monitored Hub
            </span>
            <div className="my-2.5 flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-black text-white tracking-tight truncate max-w-[170px]">
                {locationTitle}
              </span>
              <span
                className="ml-auto px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider"
                style={{ backgroundColor: `${cat.color}25`, color: cat.color, border: `1px solid ${cat.color}40` }}
              >
                {liveAQIValue} {cat.label}
              </span>
            </div>
            <p className="text-[11px] font-bold text-slate-400">
              Auto-Synced Ground Station Feed
            </p>
          </div>

          {/* Metric 2: Health Sensitivity Protocol */}
          <div className="flex flex-col justify-between pt-4 lg:pt-0 lg:pl-6">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
              <FiHeart className="w-3.5 h-3.5 text-emerald-400" />
              Health Advisory Profile
            </span>
            <div className="my-2.5 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-emerald-400 capitalize">
                {healthProfile.sensitivityGroup}
              </span>
              <span className="ml-auto px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Active Tier
              </span>
            </div>
            <p className="text-[11px] font-bold text-slate-400">
              Personalized Outdoor & Mask Guidance
            </p>
          </div>

          {/* Metric 3: Morning Air Digest */}
          <div className="flex flex-col justify-between pt-4 lg:pt-0 lg:pl-6">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
              <FiClock className="w-3.5 h-3.5 text-amber-400" />
              Daily Morning Air Digest
            </span>
            <div className="my-2.5 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-amber-300 font-mono">
                {notifPrefs.digestTime} AM
              </span>
              <span className="ml-auto text-xs font-bold text-amber-400 font-mono">
                {notifPrefs.morningDigest ? 'Scheduled' : 'Paused'}
              </span>
            </div>
            <p className="text-[11px] font-bold text-slate-400">
              Spike Alerts: AQI &gt; {notifPrefs.alertThreshold}
            </p>
          </div>

          {/* Metric 4: Visual Experience */}
          <div className="flex flex-col justify-between pt-4 lg:pt-0 lg:pl-6">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
              <FiSliders className="w-3.5 h-3.5 text-purple-400" />
              Visual Experience
            </span>
            <div className="my-2.5 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-purple-300">
                {displayPrefs.ambientParticles ? 'Atmospheric' : 'Minimal'}
              </span>
              <span className="ml-auto text-xs font-bold text-purple-400 font-mono uppercase">
                {displayPrefs.temperatureUnit === 'celsius' ? '°C Metric' : '°F Imperial'}
              </span>
            </div>
            <p className="text-[11px] font-bold text-slate-400">
              Floating Dust Particles: {displayPrefs.ambientParticles ? 'On' : 'Off'}
            </p>
          </div>
        </div>

        {/* SECTION 2: REPLACED USER-CENTRIC NAVIGATION TABS */}
        <div className="flex bg-[#11212D] p-1.5 rounded-2xl border border-white/10 overflow-x-auto gap-1">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition whitespace-nowrap ${
              activeTab === 'profile'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <FiUser className="w-4 h-4" />
            <span>Profile & Identity</span>
          </button>

          <button
            onClick={() => setActiveTab('health')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition whitespace-nowrap ${
              activeTab === 'health'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <FiHeart className="w-4 h-4" />
            <span>Health & Sensitivity Advisory</span>
          </button>

          <button
            onClick={() => setActiveTab('display')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition whitespace-nowrap ${
              activeTab === 'display'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <FiEye className="w-4 h-4" />
            <span>Display & Visual Experience</span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition whitespace-nowrap ${
              activeTab === 'notifications'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <FiBell className="w-4 h-4" />
            <span>Daily Air Digest & Alerts</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition whitespace-nowrap ${
              activeTab === 'security'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <FiLock className="w-4 h-4" />
            <span>Security & Password</span>
          </button>
        </div>

        {/* SECTION 3: TAB CONTENT PANELS */}

        {/* TAB 1: PROFILE & IDENTITY */}
        {activeTab === 'profile' && (
          <div className="backdrop-blur-3xl bg-[#11212D]/80 rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/10 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-white/10">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700 flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-cyan-500/20 border border-white/20">
                  {avatarInitials.toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-black text-white">{displayName}</h2>
                  <p className="text-xs text-slate-400 mt-0.5">{profileForm.email || 'user@airsense.com'}</p>
                  <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
                    Verified User Account
                  </span>
                </div>
              </div>

              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/25 transition hover:scale-105 active:scale-95 disabled:opacity-60 flex items-center gap-2"
              >
                <FiSave className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  value={profileForm.firstName}
                  onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                  placeholder="First name"
                  className="w-full bg-[#06141B] border border-white/15 text-white text-sm font-semibold rounded-2xl px-4 py-3 focus:outline-none focus:border-cyan-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  value={profileForm.lastName}
                  onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                  placeholder="Last name"
                  className="w-full bg-[#06141B] border border-white/15 text-white text-sm font-semibold rounded-2xl px-4 py-3 focus:outline-none focus:border-cyan-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={profileForm.email}
                  disabled
                  className="w-full bg-[#06141B]/60 border border-white/10 text-slate-400 text-sm font-mono rounded-2xl px-4 py-3 cursor-not-allowed"
                />
                <p className="text-[10px] text-slate-500 mt-1">Primary authentication address linked to session.</p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Mobile Number / WhatsApp Advisory
                </label>
                <input
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full bg-[#06141B] border border-white/15 text-white text-sm font-semibold rounded-2xl px-4 py-3 focus:outline-none focus:border-cyan-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Primary Home City
                </label>
                <select
                  value={selectedCity || 'Chennai'}
                  onChange={(e) => {
                    setSelectedCity(e.target.value);
                    toast.info(`Primary city set to ${e.target.value}`);
                  }}
                  className="w-full bg-[#06141B] border border-white/15 text-white text-sm font-semibold rounded-2xl px-4 py-3 focus:outline-none focus:border-cyan-500 transition"
                >
                  {INDIAN_CITIES.map((c) => (
                    <option key={c.name} value={c.name} className="bg-[#06141B] text-white">
                      {c.name} ({c.state || 'India'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Organization / Workplace
                </label>
                <input
                  type="text"
                  value={profileForm.organization}
                  onChange={(e) => setProfileForm({ ...profileForm, organization: e.target.value })}
                  placeholder="e.g. Health Center, University, or Company"
                  className="w-full bg-[#06141B] border border-white/15 text-white text-sm font-semibold rounded-2xl px-4 py-3 focus:outline-none focus:border-cyan-500 transition"
                />
              </div>
            </form>
          </div>
        )}

        {/* TAB 2: HEALTH & SENSITIVITY ADVISORY */}
        {activeTab === 'health' && (
          <div className="backdrop-blur-3xl bg-[#11212D]/80 rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/10 space-y-8">
            <div>
              <h2 className="text-xl font-black text-white">Health & Sensitivity Advisory Profile</h2>
              <p className="text-xs text-slate-400 mt-1">
                AirSense tailors outdoor exercise recommendations, HEPA purifier triggers, and mask reminders based on your health tier.
              </p>
            </div>

            {/* Sensitivity Tier Selection */}
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-cyan-400">
                Select Your Health Sensitivity Category
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  {
                    id: 'general',
                    title: 'General Population',
                    desc: 'Normal lung capacity. Outdoor activities safe in Good & Satisfactory air.',
                    color: 'cyan'
                  },
                  {
                    id: 'asthma',
                    title: 'Asthma & Respiratory',
                    desc: 'Heightened sensitivity to PM2.5 & NO₂. Early mask & HEPA automation alerts.',
                    color: 'emerald'
                  },
                  {
                    id: 'children',
                    title: 'Children & Elderly',
                    desc: 'Vulnerable respiratory systems. Strict caution during midday pollution peaks.',
                    color: 'amber'
                  },
                  {
                    id: 'athlete',
                    title: 'Outdoor Runner / Athlete',
                    desc: 'High ventilation rates during aerobic workouts. Commute air optimization.',
                    color: 'blue'
                  },
                  {
                    id: 'cardiac',
                    title: 'Cardiovascular Care',
                    desc: 'Blood pressure and circulatory protection against fine particulate ingress.',
                    color: 'rose'
                  }
                ].map((tier) => (
                  <div
                    key={tier.id}
                    onClick={() => handleSaveHealthProfile({ ...healthProfile, sensitivityGroup: tier.id })}
                    className={`p-5 rounded-2xl cursor-pointer transition border relative ${
                      healthProfile.sensitivityGroup === tier.id
                        ? 'bg-cyan-500/15 border-cyan-500 shadow-lg shadow-cyan-500/20'
                        : 'bg-[#06141B] border-white/10 hover:border-white/25'
                    }`}
                  >
                    {healthProfile.sensitivityGroup === tier.id && (
                      <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-cyan-400 text-[#06141B] flex items-center justify-center font-bold text-xs">
                        ✓
                      </span>
                    )}
                    <h3 className="text-sm font-black text-white">{tier.title}</h3>
                    <p className="text-xs text-slate-400 mt-1">{tier.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Health Automation Toggles */}
            <div className="p-5 rounded-2xl bg-[#06141B] border border-white/10 space-y-4">
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Health Protocols</h3>

              <div className="flex items-center justify-between py-2 border-b border-white/10">
                <div>
                  <p className="text-xs font-bold text-white">Daily Outdoor Activity Guidance</p>
                  <p className="text-[11px] text-slate-400">Suggest optimal times of day for walks, running, and outdoor sports.</p>
                </div>
                <input
                  type="checkbox"
                  checked={healthProfile.dailyWalkAdvisory}
                  onChange={(e) => handleSaveHealthProfile({ ...healthProfile, dailyWalkAdvisory: e.target.checked })}
                  className="w-5 h-5 accent-cyan-500 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between py-2 border-b border-white/10">
                <div>
                  <p className="text-xs font-bold text-white">HEPA Air Purifier & Window Recirculation Alerts</p>
                  <p className="text-[11px] text-slate-400">Notifies when to close vehicle windows or turn on indoor air purifiers.</p>
                </div>
                <input
                  type="checkbox"
                  checked={healthProfile.purifierAutomation}
                  onChange={(e) => handleSaveHealthProfile({ ...healthProfile, purifierAutomation: e.target.checked })}
                  className="w-5 h-5 accent-cyan-500 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-xs font-bold text-white">N95 Mask Advisory for Commute Corridors</p>
                  <p className="text-[11px] text-slate-400">Automatic recommendation when navigating arterial highway congestion.</p>
                </div>
                <input
                  type="checkbox"
                  checked={healthProfile.maskRecommendation}
                  onChange={(e) => handleSaveHealthProfile({ ...healthProfile, maskRecommendation: e.target.checked })}
                  className="w-5 h-5 accent-cyan-500 rounded cursor-pointer"
                />
              </div>
            </div>

            {/* Saved Commute & Favorite Neighborhoods */}
            <div className="p-5 rounded-2xl bg-[#06141B] border border-white/10 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">Saved Places & Commute Pins</h3>
                  <p className="text-xs text-slate-400">Quickly monitor air quality at your frequent destinations.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {healthProfile.savedPlaces?.map((p) => (
                  <div key={p.id} className="p-3.5 rounded-xl bg-[#11212D] border border-white/10 flex justify-between items-center">
                    <div>
                      <p className="text-xs font-bold text-white flex items-center gap-1.5">
                        <FiMapPin className="text-cyan-400 w-3.5 h-3.5" />
                        <span>{p.name}: {p.area}</span>
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{p.city}</p>
                    </div>
                    <button
                      onClick={() => handleRemovePlace(p.id)}
                      className="text-slate-400 hover:text-rose-400 p-1.5 rounded transition"
                      title="Remove Place"
                    >
                      <FiTrash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add New Place */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="Label (e.g. Gym, School)"
                  value={newPlaceName}
                  onChange={(e) => setNewPlaceName(e.target.value)}
                  className="bg-[#11212D] border border-white/15 text-white text-xs rounded-xl px-3 py-2 flex-1 focus:outline-none focus:border-cyan-500"
                />
                <input
                  type="text"
                  placeholder="Neighborhood or Area"
                  value={newPlaceArea}
                  onChange={(e) => setNewPlaceArea(e.target.value)}
                  className="bg-[#11212D] border border-white/15 text-white text-xs rounded-xl px-3 py-2 flex-1 focus:outline-none focus:border-cyan-500"
                />
                <button
                  onClick={handleAddPlace}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <FiPlus className="w-3.5 h-3.5" />
                  <span>Add Place</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: DISPLAY & VISUAL EXPERIENCE */}
        {activeTab === 'display' && (
          <div className="backdrop-blur-3xl bg-[#11212D]/80 rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/10 space-y-8">
            <div>
              <h2 className="text-xl font-black text-white">Display & Visual Experience</h2>
              <p className="text-xs text-slate-400 mt-1">Customize the atmospheric UI physics, temperature units, and accessibility.</p>
            </div>

            <div className="space-y-4">
              {/* Particle Effects */}
              <div className="flex items-center justify-between p-5 rounded-2xl bg-[#06141B] border border-white/10">
                <div>
                  <p className="text-sm font-bold text-white">Atmospheric Ambient Particles</p>
                  <p className="text-xs text-slate-400">Render floating micro-particles in the background canvas.</p>
                </div>
                <input
                  type="checkbox"
                  checked={displayPrefs.ambientParticles}
                  onChange={(e) => handleSaveDisplay({ ...displayPrefs, ambientParticles: e.target.checked })}
                  className="w-5 h-5 accent-cyan-500 rounded cursor-pointer"
                />
              </div>

              {/* High Contrast AQI */}
              <div className="flex items-center justify-between p-5 rounded-2xl bg-[#06141B] border border-white/10">
                <div>
                  <p className="text-sm font-bold text-white">Color-Blind / High-Contrast AQI Markers</p>
                  <p className="text-xs text-slate-400">Enhanced border outlines and distinct iconography for air quality badges.</p>
                </div>
                <input
                  type="checkbox"
                  checked={displayPrefs.highContrastAQI}
                  onChange={(e) => handleSaveDisplay({ ...displayPrefs, highContrastAQI: e.target.checked })}
                  className="w-5 h-5 accent-cyan-500 rounded cursor-pointer"
                />
              </div>

              {/* Temperature Unit */}
              <div className="p-5 rounded-2xl bg-[#06141B] border border-white/10 space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-cyan-400">
                  Ambient Temperature Metric
                </label>
                <div className="grid grid-cols-2 gap-3 max-w-md">
                  <button
                    type="button"
                    onClick={() => handleSaveDisplay({ ...displayPrefs, temperatureUnit: 'celsius' })}
                    className={`py-2.5 px-4 rounded-xl text-xs font-bold transition border ${
                      displayPrefs.temperatureUnit === 'celsius'
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500 shadow'
                        : 'bg-[#11212D] text-slate-400 border-white/10 hover:text-white'
                    }`}
                  >
                    Celsius (°C)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveDisplay({ ...displayPrefs, temperatureUnit: 'fahrenheit' })}
                    className={`py-2.5 px-4 rounded-xl text-xs font-bold transition border ${
                      displayPrefs.temperatureUnit === 'fahrenheit'
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500 shadow'
                        : 'bg-[#11212D] text-slate-400 border-white/10 hover:text-white'
                    }`}
                  >
                    Fahrenheit (°F)
                  </button>
                </div>
              </div>

              {/* Default Landing Page */}
              <div className="p-5 rounded-2xl bg-[#06141B] border border-white/10 space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-cyan-400">
                  Default Startup Page on Login
                </label>
                <select
                  value={displayPrefs.defaultLandingPage}
                  onChange={(e) => handleSaveDisplay({ ...displayPrefs, defaultLandingPage: e.target.value })}
                  className="w-full sm:w-80 bg-[#11212D] border border-white/15 text-white text-xs font-bold rounded-xl px-4 py-2.5 focus:outline-none focus:border-cyan-500"
                >
                  <option value="/dashboard">Command Dashboard (Overview)</option>
                  <option value="/map">Interactive Ground Map</option>
                  <option value="/predictions">AI Environmental Predictions</option>
                  <option value="/reports">City Reports & 10-Day History</option>
                  <option value="/analytics">Comparative Multi-City Analytics</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: DAILY AIR DIGEST & ALERTS */}
        {activeTab === 'notifications' && (
          <div className="backdrop-blur-3xl bg-[#11212D]/80 rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/10 space-y-8">
            <div>
              <h2 className="text-xl font-black text-white">Daily Air Digest & Notification Schedule</h2>
              <p className="text-xs text-slate-400 mt-1">Receive proactive morning weather & air quality briefings and hazardous spike notifications.</p>
            </div>

            <div className="space-y-4">
              {/* Morning Briefing Schedule */}
              <div className="p-5 rounded-2xl bg-[#06141B] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      <FiSun className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Morning Air Quality & Forecast Digest</p>
                      <p className="text-xs text-slate-400">Daily 24h forecast summary delivered before morning commute.</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifPrefs.morningDigest}
                    onChange={(e) => handleSaveNotifications({ ...notifPrefs, morningDigest: e.target.checked })}
                    className="w-5 h-5 accent-cyan-500 rounded cursor-pointer"
                  />
                </div>

                {notifPrefs.morningDigest && (
                  <div className="pt-3 border-t border-white/10 flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-300">Delivery Time:</span>
                    <input
                      type="time"
                      value={notifPrefs.digestTime}
                      onChange={(e) => handleSaveNotifications({ ...notifPrefs, digestTime: e.target.value })}
                      className="bg-[#11212D] border border-white/15 text-white text-xs font-mono rounded-xl px-3 py-1.5 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                )}
              </div>

              {/* Evening Outdoor Walk Guidance */}
              <div className="flex items-center justify-between p-5 rounded-2xl bg-[#06141B] border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    <FiWind className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Evening Outdoor Recreation Tip</p>
                    <p className="text-xs text-slate-400">Alerts when ground particulate dispersion is optimal for walks.</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={notifPrefs.eveningWalkTip}
                  onChange={(e) => handleSaveNotifications({ ...notifPrefs, eveningWalkTip: e.target.checked })}
                  className="w-5 h-5 accent-cyan-500 rounded cursor-pointer"
                />
              </div>

              {/* Severe Air Quality Spikes */}
              <div className="p-5 rounded-2xl bg-[#06141B] border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-white">Severe Pollution Spike Notification</p>
                    <p className="text-xs text-slate-400">Instant alert when local air quality crosses into poor or hazardous bands.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifPrefs.severeAirAlert}
                    onChange={(e) => handleSaveNotifications({ ...notifPrefs, severeAirAlert: e.target.checked })}
                    className="w-5 h-5 accent-cyan-500 rounded cursor-pointer"
                  />
                </div>

                {notifPrefs.severeAirAlert && (
                  <div className="pt-3 border-t border-white/10 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300 font-bold">Alert Trigger Threshold:</span>
                      <span className="text-amber-400 font-mono font-bold">{notifPrefs.alertThreshold} AQI (or higher)</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="250"
                      step="10"
                      value={notifPrefs.alertThreshold}
                      onChange={(e) => handleSaveNotifications({ ...notifPrefs, alertThreshold: Number(e.target.value) })}
                      className="w-full h-2 bg-[#11212D] rounded-lg appearance-none cursor-pointer accent-amber-400"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>50 (Good)</span>
                      <span>100 (Satisfactory)</span>
                      <span>150 (Moderate)</span>
                      <span>200 (Poor)</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: SECURITY & PASSWORD */}
        {activeTab === 'security' && (
          <div className="backdrop-blur-3xl bg-[#11212D]/80 rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/10 space-y-8">
            <div>
              <h2 className="text-xl font-black text-white">Security & Password</h2>
              <p className="text-xs text-slate-400 mt-1">Update your login password and manage active device sessions.</p>
            </div>

            <form onSubmit={handleChangePassword} className="p-6 rounded-2xl bg-[#06141B] border border-white/10 space-y-5">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <FiLock className="text-cyan-400" />
                Change Password
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={securityForm.currentPassword}
                      onChange={(e) => setSecurityForm({ ...securityForm, currentPassword: e.target.value })}
                      placeholder="••••••••"
                      className="w-full bg-[#11212D] border border-white/15 text-white text-xs rounded-xl px-3 py-2.5 pr-9 focus:outline-none focus:border-cyan-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showPassword ? <FiEyeOff className="w-3.5 h-3.5" /> : <FiEye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={securityForm.newPassword}
                      onChange={(e) => setSecurityForm({ ...securityForm, newPassword: e.target.value })}
                      placeholder="Min 8 characters"
                      className="w-full bg-[#11212D] border border-white/15 text-white text-xs rounded-xl px-3 py-2.5 pr-9 focus:outline-none focus:border-cyan-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showNewPassword ? <FiEyeOff className="w-3.5 h-3.5" /> : <FiEye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={securityForm.confirmPassword}
                    onChange={(e) => setSecurityForm({ ...securityForm, confirmPassword: e.target.value })}
                    placeholder="••••••••"
                    className="w-full bg-[#11212D] border border-white/15 text-white text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-lg transition hover:scale-105 active:scale-95 disabled:opacity-60 flex items-center gap-2"
                >
                  <FiLock className="w-4 h-4" />
                  <span>Update Password</span>
                </button>
              </div>
            </form>

            {/* Active Device Session */}
            <div className="p-6 rounded-2xl bg-[#06141B] border border-white/10 space-y-4">
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Active Device Session</h3>
              <div className="p-4 rounded-xl bg-[#11212D] border border-cyan-500/30 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center font-bold">
                    PC
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-white">Current Browser Session</p>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Active
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Location: {locationTitle} &bull; Security: SSL/TLS Encrypted
                    </p>
                  </div>
                </div>
                <span className="text-xs text-emerald-400 font-mono font-bold">Secure</span>
              </div>
            </div>
          </div>
        )}
        {/* FOOTER */}
        <Footer />
      </div>
    </Layout>
  );
}
