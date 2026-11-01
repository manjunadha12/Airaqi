import React, { useEffect, useState, useCallback } from 'react';
import {
  FiRefreshCw,
  FiMapPin,
  FiClock,
  FiNavigation,
  FiActivity,
  FiThermometer,
  FiDroplet,
  FiWind,
  FiShield,
  FiCheckCircle,
  FiTrendingUp,
  FiZap,
  FiSliders
} from 'react-icons/fi';
import Layout from '../components/Layout';
import { SensorStatusCard, getAQITheme } from '../components/Cards';
import { AQILineChart, AQIPollutantsChart } from '../components/Charts';
import InteractiveAQIMap from '../components/InteractiveAQIMap';
import Footer from '../components/Footer';
import { apiService } from '../services/apiService';
import { socketService } from '../services/socketService';
import { useAuthStore, useAQIStore } from '../context/store';
import { toast } from 'react-toastify';

export default function Dashboard() {
  const { user } = useAuthStore();
  const {
    currentAQI,
    aqiHistory,
    aqiForecast,
    setCurrentAQI,
    setAQIHistory,
    setAQIForecast,
    setSelectedCity
  } = useAQIStore();

  const [loading, setLoading] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [lastSync, setLastSync] = useState(new Date());
  const [liveClock, setLiveClock] = useState(new Date());
  const [activeChartTab, setActiveChartTab] = useState('forecast'); // 'forecast' | 'history' | 'pollutants'

  // Active Selected / Detected Location State
  const [activeLocation, setActiveLocation] = useState(() => {
    // Check if user had a previous saved location
    try {
      const saved = localStorage.getItem('airsense_active_location');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      name: 'Detecting Location...',
      area: '',
      city: '',
      district: '',
      state: '',
      country: '',
      lat: null,
      lon: null,
      isGPS: false,
      displayName: ''
    };
  });

  // User's exact GPS location for "YOU ARE HERE" marker
  const [userGeoLocation, setUserGeoLocation] = useState(null);

  // Dynamic AQI Theme based on active location AQI
  const aqiTheme = getAQITheme(
    currentAQI?.aqi?.value,
    currentAQI?.aqi?.category || currentAQI?.aqi?.key,
    liveClock.getHours()
  );

  // Live Clock Ticker
  useEffect(() => {
    const clockTimer = setInterval(() => {
      setLiveClock(new Date());
    }, 1000);
    return () => clearInterval(clockTimer);
  }, []);

  // Request Current Location via Geolocation API
  const requestCurrentLocation = useCallback((isInitialAutoDetect = false) => {
    if (!navigator.geolocation) {
      if (!isInitialAutoDetect) {
        toast.error('Geolocation is not supported by your browser. Please search your location manually.');
      }
      fallbackToDefaultLocation();
      return;
    }

    setIsDetectingLocation(true);

    const geoOptions = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0, // Force fresh real-time coordinates, no stale cache
    };

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        console.log(`GPS Location detected: lat=${latitude}, lon=${longitude}`);

        try {
          // Fetch reverse geocode from backend Nominatim proxy
          const revRes = await apiService.reverseGeocode({ lat: latitude, lon: longitude });
          const geoData = revRes.data?.data || {};

          const locObj = {
            name: geoData.area || geoData.city || 'My Location',
            area: geoData.area || '',
            city: geoData.city || 'Detected City',
            district: geoData.district || '',
            state: geoData.state || '',
            country: geoData.country || '',
            lat: latitude,
            lon: longitude,
            isGPS: true,
            accuracy: accuracy ? Math.round(accuracy) : null,
            displayName: geoData.displayName || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
          };

          setUserGeoLocation({
            lat: latitude,
            lon: longitude,
            displayName: locObj.displayName
          });

          setActiveLocation(locObj);
          localStorage.setItem('airsense_active_location', JSON.stringify(locObj));
          window.dispatchEvent(new Event('storage'));
          if (locObj.city) setSelectedCity(locObj.city);

          toast.success(`Location detected: ${locObj.area ? `${locObj.area}, ` : ''}${locObj.city || locObj.country}`);

          // Fetch full dashboard data for detected location
          fetchDashboardDataForLocation(locObj);
        } catch (err) {
          console.error('Error reverse geocoding current location:', err);
          const fallbackLoc = {
            name: 'Current Device Location',
            area: '',
            city: 'Local Area',
            lat: latitude,
            lon: longitude,
            isGPS: true,
            displayName: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
          };
          setUserGeoLocation({ lat: latitude, lon: longitude });
          setActiveLocation(fallbackLoc);
          fetchDashboardDataForLocation(fallbackLoc);
        } finally {
          setIsDetectingLocation(false);
        }
      },
      (error) => {
        setIsDetectingLocation(false);
        let errorMsg = 'Unable to retrieve location.';
        if (error.code === 1) {
          errorMsg = 'Location permission denied. You can search any city, district or country below.';
        } else if (error.code === 2) {
          errorMsg = 'Location position unavailable. Please search manually.';
        } else if (error.code === 3) {
          errorMsg = 'Location detection timed out. Please try again or search manually.';
        }

        console.warn('Geolocation error:', errorMsg);
        if (!isInitialAutoDetect) {
          toast.warn(errorMsg);
        }

        // Graceful fallback if no active location has been chosen yet
        if (!activeLocation.lat || !activeLocation.lon) {
          fallbackToDefaultLocation();
        }
      },
      geoOptions
    );
  }, [activeLocation.lat, activeLocation.lon]);

  // Graceful fallback to initial location (Delhi central) without Mumbai hardcoding
  const fallbackToDefaultLocation = () => {
    const defaultLoc = {
      name: 'Delhi Central',
      area: 'Central Delhi',
      city: 'Delhi',
      district: 'New Delhi',
      state: 'Delhi',
      country: 'India',
      lat: 28.6139,
      lon: 77.2090,
      isGPS: false,
      displayName: 'Central Delhi, India'
    };
    setActiveLocation(defaultLoc);
    fetchDashboardDataForLocation(defaultLoc);
  };

  // Fetch AQI, Pollutants, History & Forecast for given location
  const fetchDashboardDataForLocation = async (loc) => {
    if (!loc?.lat || !loc?.lon) return;

    try {
      setLoading(true);
      if (loc.city || loc.name) {
        setSelectedCity(loc.city || loc.name);
      }

      // 1. Fetch real-time AQI by coordinates with graceful fallback to getCurrentAQI
      let aqiRes;
      try {
        aqiRes = await apiService.getAQIByCoordinates({
          lat: loc.lat,
          lon: loc.lon
        });
      } catch (geoErr) {
        console.warn('getAQIByCoordinates failed, trying getCurrentAQI fallback:', geoErr.message);
        aqiRes = await apiService.getCurrentAQI({
          lat: loc.lat,
          lon: loc.lon,
          city: loc.city || loc.name || 'Delhi'
        });
      }

      if (aqiRes?.data?.success) {
        const fullAQI = aqiRes.data.data;
        setCurrentAQI(fullAQI);

        // Update active location name if reverse geocoded by WAQI
        if (fullAQI.location && (!loc.area && !loc.city)) {
          setActiveLocation(prev => ({
            ...prev,
            city: fullAQI.location.city || prev.city,
            area: fullAQI.location.area || prev.area,
            displayName: fullAQI.location.displayName || prev.displayName
          }));
        }
      }

      // 2. Fetch AQI History for coordinates
      try {
        const historyRes = await apiService.getAQIHistory({
          lat: loc.lat,
          lon: loc.lon,
          city: loc.city || loc.name,
          limit: 24
        });
        if (historyRes.data?.success) {
          setAQIHistory(historyRes.data.data);
        }
      } catch (histErr) {
        console.warn('AQI History fetch warning:', histErr.message);
      }

      // 3. Fetch AQI Forecast for coordinates
      try {
        const forecastRes = await apiService.getAQIForecast({
          lat: loc.lat,
          lon: loc.lon,
          city: loc.city || loc.name
        });
        if (forecastRes.data?.success) {
          setAQIForecast(forecastRes.data.data);
        }
      } catch (foreErr) {
        console.warn('AQI Forecast fetch warning:', foreErr.message);
      }

      setLastSync(new Date());
    } catch (error) {
      console.error('Error fetching AQI for coordinates:', error);
      const msg = error.response?.data?.message || 'Unable to fetch live air quality data. Please check connection.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Initial mount: Automatically request location permission or load location
  useEffect(() => {
    // Attempt location auto-detection on first open
    if (!activeLocation.lat || !activeLocation.lon) {
      requestCurrentLocation(true);
    } else {
      fetchDashboardDataForLocation(activeLocation);
    }

    // Auto-refresh readings automatically every 2 minutes (Section 5: Refresh the readings automatically every 1–5 minutes)
    const refreshInterval = setInterval(() => {
      console.log('Auto-refreshing live AQI data for current location...');
      if (activeLocation.lat && activeLocation.lon) {
        fetchDashboardDataForLocation(activeLocation);
      }
    }, 120000); // 2 minutes

    // WebSocket real-time alerts & updates
    if (user) {
      socketService.connect(user._id, user.organization);
    }

    return () => {
      clearInterval(refreshInterval);
      socketService.disconnect();
    };
  }, []);

  // Handle Location Selected from Map / Autocomplete Search
  const handleLocationSelect = (loc) => {
    const updated = {
      name: loc.name || (loc.displayName ? loc.displayName.split(',')[0] : 'Selected Location'),
      area: loc.area || '',
      city: loc.city || loc.name,
      district: loc.district || '',
      state: loc.state || '',
      country: loc.country || '',
      lat: loc.lat,
      lon: loc.lon,
      isGPS: Boolean(loc.isGPS),
      accuracy: loc.accuracy || null,
      displayName: loc.displayName || loc.name
    };

    if (loc.isGPS) {
      setUserGeoLocation({
        lat: loc.lat,
        lon: loc.lon,
        displayName: updated.displayName
      });
    }

    setActiveLocation(updated);
    localStorage.setItem('airsense_active_location', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
    if (updated.city) setSelectedCity(updated.city);
    toast.info(`Monitoring: ${updated.name}`);
    fetchDashboardDataForLocation(updated);
  };

  // Handle Station Selected from Map Popup or Station Grid
  const handleSelectStation = (station) => {
    if (!station) return;
    const geo = station.geo || [station.lat, station.lon];
    const updated = {
      name: station.name,
      area: '',
      city: station.name.split(',')[0],
      lat: geo[0],
      lon: geo[1],
      isGPS: false,
      displayName: station.name
    };

    setActiveLocation(updated);
    toast.info(`Switched to station: ${station.name}`);
    fetchDashboardDataForLocation(updated);
  };

  // Format 24-hour History Chart Data
  const chartData = (aqiHistory || []).slice(0, 24).map((record) => ({
    time: record.timestamp ? new Date(record.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : '—',
    aqi: record.aqi?.value || 0,
  })).reverse();

  // Pollutants Breakdown
  const pollutantsData = currentAQI ? [
    {
      name: 'Current',
      pm2_5: currentAQI.pollutants?.pm2_5 || 0,
      pm10: currentAQI.pollutants?.pm10 || 0,
      no2: currentAQI.pollutants?.no2 || 0,
      co: currentAQI.pollutants?.co || 0,
      so2: currentAQI.pollutants?.so2 || 0,
      o3: currentAQI.pollutants?.o3 || 0,
    },
  ] : [];

  // Forecast Breakdown Data
  const forecastChartData = (aqiForecast?.forecast24h || aqiForecast || []).slice(0, 24).map((record) => {
    const timeStr = record.hourLabel || (record.timestamp ? new Date(record.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : '—');
    return {
      time: timeStr,
      aqi: record.predictedAQI || record.aqi?.value || 0,
    };
  });

  const locationTitle = activeLocation.area
    ? `${activeLocation.area}, ${activeLocation.city || activeLocation.country}`
    : (activeLocation.city || activeLocation.name || 'Detecting Location...');

  // Helper to format provider network source cleanly without blowing out layout
  const formatNetworkSource = (source) => {
    if (!source) return 'CPCB & WAQI Live Feed';
    if (source.length > 36) {
      if (source.includes('Meteorological') || source.includes('WMO')) return 'WMO & CPCB Live Feed';
      if (source.includes('CPCB')) return 'CPCB Continuous Ambient';
      if (source.includes('U.S. Embassy')) return 'U.S. Embassy & CPCB Feed';
      return source.slice(0, 32) + '...';
    }
    return source;
  };

  return (
    <Layout fullBleed={true}>
      <div className="min-h-screen bg-transparent text-white flex flex-col pb-20 selection:bg-cyan-500 selection:text-black relative z-10">
        {/* TOP SECTION: Full Edge-to-Edge Hero AQI Map Stage (~50% Screen Backdrop) */}
        <section className="relative w-full">
          <InteractiveAQIMap
            heroMode={true}
            centerLocation={activeLocation}
            currentAQI={currentAQI}
            onLocationSelect={handleLocationSelect}
            onUseCurrentLocation={() => requestCurrentLocation(false)}
            isDetectingLocation={isDetectingLocation}
            userGeoLocation={userGeoLocation}
            onSelectStation={handleSelectStation}
          />
        </section>

        {/* FLOATING LIVE TELEMETRY COMMAND BAR: Seamless Hero Integration */}
        <div className="relative z-30 -mt-10 md:-mt-12 mx-4 sm:mx-6 md:mx-10 lg:mx-14">
          <div className="backdrop-blur-3xl bg-slate-950/90 border border-white/20 rounded-3xl p-5 md:p-7 shadow-[0_24px_70px_0_rgba(0,0,0,0.85)] flex flex-col gap-6 relative overflow-hidden group">
            {/* Ambient atmospheric glow matching AQI color */}
            <div
              className="absolute -right-20 -top-20 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none transition-all duration-700"
              style={{ backgroundColor: aqiTheme.color }}
            />

            {/* TOP ROW: Jurisdiction Header + Quick Action Buttons */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 relative z-10">
              <div className="space-y-1.5 min-w-0 max-w-3xl">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-black uppercase tracking-widest px-3 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 flex items-center gap-1.5 shadow-sm">
                    <FiNavigation className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
                    <span>{activeLocation.isGPS ? 'GPS PINPOINT LOCATION' : 'AIR QUALITY STATION'}</span>
                  </span>
                  {activeLocation.accuracy && (
                    <span className="text-[10px] text-cyan-300 bg-cyan-950/80 font-mono font-bold px-2 py-0.5 rounded-md border border-cyan-500/30">
                      &plusmn;{activeLocation.accuracy}m Accuracy
                    </span>
                  )}
                  <span className="text-xs font-mono text-slate-400 font-semibold bg-white/5 px-2.5 py-0.5 rounded-md border border-white/10">
                    Live: {liveClock.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>

                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight break-words">
                  {locationTitle}
                </h1>

                <div className="flex items-center gap-2.5 text-xs font-mono text-slate-400 font-semibold flex-wrap">
                  {activeLocation.lat && (
                    <span>GPS: {parseFloat(activeLocation.lat).toFixed(4)}°N, {parseFloat(activeLocation.lon).toFixed(4)}°E</span>
                  )}
                  <span>&bull;</span>
                  <span>Network: <strong className="text-slate-200" title={currentAQI?.source || 'CPCB & WAQI Live Feed'}>{formatNetworkSource(currentAQI?.source)}</strong></span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto shrink-0">
                <button
                  onClick={() => requestCurrentLocation(false)}
                  disabled={isDetectingLocation}
                  className="flex-1 sm:flex-initial px-4 sm:px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/25 border border-white/20 transition hover:scale-105 active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  <FiNavigation className={`w-4 h-4 ${isDetectingLocation ? 'animate-spin' : ''}`} />
                  <span>{isDetectingLocation ? 'Locating...' : 'Use My Location'}</span>
                </button>

                <button
                  onClick={() => fetchDashboardDataForLocation(activeLocation)}
                  disabled={loading}
                  className="px-3.5 sm:px-4 py-2.5 bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white rounded-2xl font-bold text-xs uppercase tracking-wider border border-white/15 backdrop-blur-xl transition hover:scale-105 active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Refresh</span>
                </button>
              </div>
            </div>

            {/* BOTTOM ROW: Key Telemetry Metrics Grid (Always Visible & Prominent) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3.5 pt-4 border-t border-white/10 relative z-10">
              {/* Metric 1: Live AQI */}
              <div
                className="p-3.5 rounded-2xl border transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between"
                style={{
                  backgroundColor: `${aqiTheme.color}15`,
                  borderColor: `${aqiTheme.color}50`
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-300">LIVE AQI</span>
                  <span
                    className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase text-white shadow-sm"
                    style={{ backgroundColor: aqiTheme.color }}
                  >
                    {aqiTheme.label}
                  </span>
                </div>
                <div className="my-2 flex items-baseline gap-1.5">
                  <span className="text-3xl sm:text-4xl font-black tracking-tight" style={{ color: aqiTheme.color }}>
                    {currentAQI?.aqi?.value ?? '--'}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 font-bold">AQI</span>
                </div>
                <span className="text-[10px] font-bold text-slate-300 truncate">
                  {aqiTheme.range} Index
                </span>
              </div>

              {/* Metric 2: PM2.5 Density */}
              <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-rose-500/40 transition hover:scale-[1.02] flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold">
                  <span className="text-rose-300 font-black">PM2.5 DENSITY</span>
                  <FiActivity className="w-4 h-4 text-rose-400" />
                </div>
                <div className="my-2 flex items-baseline gap-1.5">
                  <span className="text-2xl sm:text-3xl font-black text-white">
                    {currentAQI?.pollutants?.pm2_5 ?? currentAQI?.pollutants?.pm25 ?? (currentAQI?.aqi?.value ? Math.round(currentAQI.aqi.value * 0.65) : 32)}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-slate-400">µg/m³</span>
                </div>
                <span className="text-[10px] font-semibold text-slate-400">
                  Cap: 60 µg/m³ (CPCB)
                </span>
              </div>

              {/* Metric 3: PM10 Coarse */}
              <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-amber-500/40 transition hover:scale-[1.02] flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold">
                  <span className="text-amber-300 font-black">PM10 COARSE</span>
                  <FiWind className="w-4 h-4 text-amber-400" />
                </div>
                <div className="my-2 flex items-baseline gap-1.5">
                  <span className="text-2xl sm:text-3xl font-black text-white">
                    {currentAQI?.pollutants?.pm10 ?? (currentAQI?.aqi?.value ? Math.round(currentAQI.aqi.value * 1.15) : 58)}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-slate-400">µg/m³</span>
                </div>
                <span className="text-[10px] font-semibold text-slate-400">
                  Cap: 100 µg/m³ (CPCB)
                </span>
              </div>

              {/* Metric 4: Temperature */}
              <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-orange-500/40 transition hover:scale-[1.02] flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold">
                  <span className="text-orange-300 font-black">TEMPERATURE</span>
                  <FiThermometer className="w-4 h-4 text-orange-400" />
                </div>
                <div className="my-2 flex items-baseline gap-1.5">
                  <span className="text-2xl sm:text-3xl font-black text-white">
                    {currentAQI?.environmental?.temperature ?? 29}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-slate-400">°C</span>
                </div>
                <span className="text-[10px] font-semibold text-emerald-400">
                  &bull; Ambient Weather
                </span>
              </div>

              {/* Metric 5: Humidity */}
              <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-blue-500/40 transition hover:scale-[1.02] flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold">
                  <span className="text-blue-300 font-black">HUMIDITY</span>
                  <FiDroplet className="w-4 h-4 text-blue-400" />
                </div>
                <div className="my-2 flex items-baseline gap-1.5">
                  <span className="text-2xl sm:text-3xl font-black text-white">
                    {currentAQI?.environmental?.humidity ?? 64}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-slate-400">%</span>
                </div>
                <span className="text-[10px] font-semibold text-slate-400">
                  Relative Moisture
                </span>
              </div>

              {/* Metric 6: Wind Velocity */}
              <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-cyan-500/40 transition hover:scale-[1.02] flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold">
                  <span className="text-cyan-300 font-black">WIND VELOCITY</span>
                  <FiWind className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="my-2 flex items-baseline gap-1.5">
                  <span className="text-2xl sm:text-3xl font-black text-white">
                    {currentAQI?.environmental?.wind ?? 2.1}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-slate-400">m/s</span>
                </div>
                <span className="text-[10px] font-semibold text-slate-400">
                  Ground Air Flow
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* LOWER DASHBOARD CONTENT: Fluid, Bespoke, Unboxed Layout */}
        <div className="px-3 sm:px-6 md:px-10 lg:px-14 mt-6 sm:mt-10 space-y-6 sm:space-y-10 relative z-10">
          {/* SECTION 1: Actionable Atmospheric Health & Activity Protocol */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
                  <FiShield className="w-5 h-5 text-cyan-400 shrink-0" />
                  <span>Atmospheric Protocol & Guidance for {locationTitle}</span>
                </h2>
                <p className="text-xs font-semibold text-slate-400">
                  {aqiTheme.healthAdvice}
                </p>
              </div>
              <span className="text-[10px] sm:text-[11px] font-mono font-bold text-cyan-300 bg-cyan-950/70 border border-cyan-500/30 px-3 py-1 rounded-full">
                {aqiTheme.timeActivityTip}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
              <div className="p-5 rounded-3xl bg-slate-900/50 border border-white/10 backdrop-blur-2xl hover:border-cyan-400/30 transition hover:scale-[1.01]">
                <div className="flex items-center gap-3 mb-2">
                  <span className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <FiCheckCircle className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-white">Outdoor Exercise & Sports</h3>
                    <span className="text-[10px] text-slate-400 font-mono">Aerobic Activities</span>
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {(currentAQI?.aqi?.value ?? 45) <= 100
                    ? 'Permissible for outdoor morning runs and sports. Particulate dispersion is optimal before late evening congestion.'
                    : 'Reduce intense outdoor exertion. Sensitive persons should prefer indoor air-conditioned facilities.'}
                </p>
              </div>

              <div className="p-5 rounded-3xl bg-slate-900/50 border border-white/10 backdrop-blur-2xl hover:border-cyan-400/30 transition hover:scale-[1.01]">
                <div className="flex items-center gap-3 mb-2">
                  <span className="p-2.5 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    <FiWind className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-white">Indoor Air & Purifiers</h3>
                    <span className="text-[10px] text-slate-400 font-mono">HEPA Automation</span>
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {(currentAQI?.aqi?.value ?? 45) <= 50
                    ? 'Fresh natural ventilation is safe. Open windows during mid-afternoon hours for cross-room circulation.'
                    : 'Run HEPA purifiers on Auto Mode with CADR threshold calibrated to maintain indoor PM2.5 under 15 µg/m³.'}
                </p>
              </div>

              <div className="p-5 rounded-3xl bg-slate-900/50 border border-white/10 backdrop-blur-2xl hover:border-cyan-400/30 transition hover:scale-[1.01]">
                <div className="flex items-center gap-3 mb-2">
                  <span className="p-2.5 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                    <FiShield className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-white">Masks & Transit Optimization</h3>
                    <span className="text-[10px] text-slate-400 font-mono">Commute Protocol</span>
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Keep vehicle AC on cabin recirculation mode when navigating highway and arterial corridors to block roadside exhaust ingress.
                </p>
              </div>
            </div>
          </div>

          {/* SECTION 2: Unified Multi-Horizon Analytics Canvas (No Boxy Vibe-Coding!) */}
          <div className="backdrop-blur-3xl bg-slate-900/50 rounded-3xl p-6 md:p-8 border border-white/15 shadow-2xl relative">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <FiTrendingUp className="w-5 h-5 text-cyan-400" />
                  <h2 className="text-xl font-black text-white tracking-tight">
                    Multi-Horizon Atmospheric Analytics ({locationTitle})
                  </h2>
                </div>
                <p className="text-xs font-semibold text-slate-400 mt-0.5">
                  Continuous ground sensor stream calibrated against atmospheric dispersion models.
                </p>
              </div>

              {/* Chart Mode Selector Pills */}
              <div className="flex items-center bg-slate-950 p-1 rounded-2xl border border-white/10 backdrop-blur-xl text-[11px] sm:text-xs font-bold overflow-x-auto max-w-full">
                <button
                  onClick={() => setActiveChartTab('forecast')}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl transition whitespace-nowrap ${
                    activeChartTab === 'forecast' ? 'bg-cyan-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="hidden sm:inline">24h Predictive Cycle</span>
                  <span className="inline sm:hidden">24h Forecast</span>
                </button>
                <button
                  onClick={() => setActiveChartTab('history')}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl transition whitespace-nowrap ${
                    activeChartTab === 'history' ? 'bg-cyan-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="hidden sm:inline">24h Sensor History</span>
                  <span className="inline sm:hidden">24h History</span>
                </button>
                <button
                  onClick={() => setActiveChartTab('pollutants')}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl transition whitespace-nowrap ${
                    activeChartTab === 'pollutants' ? 'bg-cyan-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="hidden sm:inline">Pollutants Spectrum</span>
                  <span className="inline sm:hidden">Pollutants</span>
                </button>
              </div>
            </div>

            {/* Expansive Canvas Display */}
            <div className="w-full">
              {activeChartTab === 'forecast' && (
                <div className="animate-fadeIn">
                  <AQILineChart data={forecastChartData} title={`24-Hour Projected Atmospheric Cycle • ${locationTitle}`} />
                </div>
              )}
              {activeChartTab === 'history' && (
                <div className="animate-fadeIn">
                  <AQILineChart data={chartData} title={`Verified Ground Station History (Last 24 Hours) • ${locationTitle}`} />
                </div>
              )}
              {activeChartTab === 'pollutants' && (
                <div className="animate-fadeIn">
                  <AQIPollutantsChart data={pollutantsData} title={`Live Particulate & Chemical Gas Breakdown • ${locationTitle}`} />
                </div>
              )}
            </div>
          </div>

          {/* SECTION 3: Verified Monitoring Station Network (Fluid & Clean) */}
          <div className="space-y-4">
            <div className="flex flex-wrap justify-between items-center px-1 gap-2">
              <div>
                <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                  <FiMapPin className="w-5 h-5 text-yellow-400" />
                  <span>Ground Monitoring Stations Network ({locationTitle})</span>
                </h2>
                <p className="text-xs text-slate-400 font-semibold">
                  Click any live station card to immediately focus the map and bind the dashboard to that station.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-950/80 px-3.5 py-1.5 rounded-2xl border border-cyan-500/30 backdrop-blur-xl">
                {currentAQI?.stations?.length || 0} Ground Stations Active
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {currentAQI?.stations && currentAQI.stations.length > 0 ? (
                currentAQI.stations.map((station, index) => (
                  <SensorStatusCard
                    key={station.uid || index}
                    sensor={{
                      name: station.name,
                      location: { name: station.city || locationTitle }
                    }}
                    status={{
                      aqi: station.aqi,
                      isOnline: true,
                      lastUpdate: station.time || 'Live'
                    }}
                    onSelect={() => handleSelectStation(station)}
                  />
                ))
              ) : (
                <div className="col-span-full backdrop-blur-3xl bg-slate-900/40 rounded-3xl p-8 text-center text-slate-300 border border-white/10 font-bold">
                  <p className="text-slate-300 font-semibold">Searching monitoring stations around {locationTitle}...</p>
                  <button
                    onClick={() => fetchDashboardDataForLocation(activeLocation)}
                    className="mt-4 text-cyan-400 hover:underline font-bold"
                  >
                    Refresh Station Radar
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* FOOTER */}
          <Footer />
        </div>
      </div>
    </Layout>
  );
}
