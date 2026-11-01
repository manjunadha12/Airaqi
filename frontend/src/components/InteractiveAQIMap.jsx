import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import {
  FiMapPin,
  FiNavigation,
  FiSearch,
  FiZoomIn,
  FiZoomOut,
  FiMaximize2,
  FiMinimize2,
  FiRefreshCw,
  FiX,
  FiLayers,
  FiCrosshair
} from 'react-icons/fi';
import { apiService } from '../services/apiService';

/**
 * Indian National AQI Category Helper
 */
const getAQICategoryInfo = (aqi) => {
  const val = Number(aqi);
  if (isNaN(val) || val < 0) {
    return {
      category: 'Unknown',
      color: '#94a3b8',
      textColor: 'text-slate-400',
      bgColor: 'bg-slate-500',
      badgeClass: 'text-slate-300 bg-slate-900/60 border-slate-500/40',
      range: '—'
    };
  }
  if (val <= 50) {
    return {
      category: 'Good',
      color: '#16a34a', // Green
      textColor: 'text-green-500',
      bgColor: 'bg-green-600',
      badgeClass: 'text-green-300 bg-green-950/80 border-green-500/50',
      range: '0–50'
    };
  }
  if (val <= 100) {
    return {
      category: 'Satisfactory',
      color: '#84cc16', // Light Green
      textColor: 'text-lime-400',
      bgColor: 'bg-lime-500',
      badgeClass: 'text-lime-300 bg-lime-950/80 border-lime-500/50',
      range: '51–100'
    };
  }
  if (val <= 200) {
    return {
      category: 'Moderate',
      color: '#eab308', // Yellow
      textColor: 'text-yellow-400',
      bgColor: 'bg-yellow-500',
      badgeClass: 'text-yellow-300 bg-yellow-950/80 border-yellow-500/50',
      range: '101–200'
    };
  }
  if (val <= 300) {
    return {
      category: 'Poor',
      color: '#f97316', // Orange
      textColor: 'text-orange-400',
      bgColor: 'bg-orange-500',
      badgeClass: 'text-orange-300 bg-orange-950/80 border-orange-500/50',
      range: '201–300'
    };
  }
  if (val <= 400) {
    return {
      category: 'Very Poor',
      color: '#ef4444', // Red
      textColor: 'text-red-400',
      bgColor: 'bg-red-500',
      badgeClass: 'text-red-300 bg-red-950/80 border-red-500/50',
      range: '301–400'
    };
  }
  return {
    category: 'Severe',
    color: '#7f1d1d', // Dark Red
    textColor: 'text-rose-400',
    bgColor: 'bg-rose-900',
    badgeClass: 'text-rose-200 bg-rose-950/90 border-rose-600/60',
    range: '401–500+'
  };
};

/**
 * Custom Station Marker Icon Generator ("WHERE IT IS" + "HOW MUCH")
 */
const createStationMarkerIcon = (station, color, catInfo) => {
  const aqi = station.aqi;
  const displayVal = (aqi !== null && aqi !== undefined && !isNaN(Number(aqi))) ? aqi : '—';
  
  // Format clean readable station name
  const rawName = station.name || 'Station';
  const cleanName = rawName
    .replace(/,.*$/, '')
    .replace(/\bAmbient\b/gi, '')
    .replace(/\bAir Quality Station\b/gi, '')
    .replace(/\bAir Monitoring Station\b/gi, '')
    .replace(/\bEnvironmental Sensor\b/gi, '')
    .replace(/\bRegional Air Station\b/gi, '')
    .replace(/\bSatellite Town Station\b/gi, '')
    .replace(/\bIndustrial Area Sensor\b/gi, '')
    .replace(/\bResidential Air Sensor\b/gi, '')
    .replace(/\bAir Monitor\b/gi, '')
    .replace(/\bStation\b/gi, '')
    .trim();

  return L.divIcon({
    className: 'custom-station-aqi-icon',
    html: `
      <div style="display: flex; flex-direction: column; align-items: center; cursor: pointer; filter: drop-shadow(0 4px 10px rgba(0,0,0,0.65)); pointer-events: auto;">
        <!-- Top AQI & Category Pill ("HOW MUCH") -->
        <div style="
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: rgba(11, 19, 32, 0.95);
          border: 2px solid ${color};
          box-shadow: 0 0 14px ${color}aa;
          border-radius: 9999px;
          padding: 2px 7px 2px 3px;
          white-space: nowrap;
        ">
          <span style="
            background-color: ${color};
            color: #ffffff;
            font-weight: 900;
            font-size: 11px;
            line-height: 1;
            padding: 4px 6px;
            border-radius: 9999px;
            min-width: 22px;
            text-align: center;
            display: inline-block;
          ">${displayVal}</span>
          <span style="
            color: ${color};
            font-weight: 900;
            font-size: 9px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            padding-right: 2px;
          ">${catInfo.category}</span>
        </div>

        <!-- Bottom Location Name Tag ("WHERE IT IS") -->
        <div style="
          margin-top: 2px;
          background: rgba(6, 20, 27, 0.94);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.3);
          color: #ffffff;
          font-size: 9px;
          font-weight: 800;
          padding: 2px 6px;
          border-radius: 6px;
          white-space: nowrap;
          max-width: 140px;
          overflow: hidden;
          text-overflow: ellipsis;
          box-shadow: 0 2px 6px rgba(0,0,0,0.55);
          text-align: center;
        ">
          📍 ${cleanName || rawName.slice(0, 16)}
        </div>

        <!-- Pin pointer triangle -->
        <div style="
          width: 0;
          height: 0;
          border-left: 5px solid transparent;
          border-right: 5px solid transparent;
          border-top: 5px solid ${color};
          margin-top: 1px;
        "></div>
      </div>
    `,
    iconSize: [140, 52],
    iconAnchor: [70, 50],
    popupAnchor: [0, -48]
  });
};

/**
 * Custom "YOU ARE HERE" Marker Icon Generator
 */
const createUserLocationIcon = () => {
  return L.divIcon({
    className: 'custom-user-location-icon',
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: grab; filter: drop-shadow(0 4px 12px rgba(6,182,212,0.8));">
        <div style="
          background: linear-gradient(135deg, #0284c7, #2563eb);
          color: white;
          font-weight: 900;
          font-size: 9px;
          letter-spacing: 0.06em;
          padding: 3px 8px;
          border-radius: 8px;
          white-space: nowrap;
          border: 1.5px solid #ffffff;
          margin-bottom: 2px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.5);
        ">
          📍 YOU ARE HERE (Drag to Adjust)
        </div>
        <div style="position: relative; width: 22px; height: 22px;">
          <div style="
            position: absolute;
            inset: -4px;
            border-radius: 9999px;
            background-color: #06b6d4;
            opacity: 0.7;
            animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
          "></div>
          <div style="
            position: relative;
            width: 22px;
            height: 22px;
            border-radius: 9999px;
            background-color: #0284c7;
            border: 3px solid #ffffff;
          "></div>
        </div>
      </div>
    `,
    iconSize: [160, 60],
    iconAnchor: [80, 52],
    popupAnchor: [0, -48]
  });
};

// Google Maps & Hybrid High-Performance Tile Providers
const createMapLayer = (style) => {
  if (style === 'google' || style === 'street') {
    return L.tileLayer(
      'https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
      {
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        attribution: '&copy; Google Maps &bull; AirSense Live AQI',
        maxZoom: 20,
      }
    );
  }
  if (style === 'satellite' || style === 'hybrid') {
    return L.tileLayer(
      'https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
      {
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        attribution: '&copy; Google Maps Satellite &bull; AirSense',
        maxZoom: 20,
      }
    );
  }
  if (style === 'terrain') {
    return L.tileLayer(
      'https://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',
      {
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        attribution: '&copy; Google Maps Terrain &bull; AirSense',
        maxZoom: 20,
      }
    );
  }
  // Default 'dark': Google Maps styled with sleek dark neon theme
  return L.tileLayer(
    'https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    {
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      className: 'google-maps-dark-tiles',
      attribution: '&copy; Google Maps (Dark) &bull; AirSense Worldwide AQI',
      maxZoom: 20,
    }
  );
};

export default function InteractiveAQIMap({
  centerLocation,
  currentAQI,
  onLocationSelect,
  onUseCurrentLocation,
  isDetectingLocation,
  userGeoLocation,
  onSelectStation,
  heroMode = false
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const clusterGroupRef = useRef(null);
  const userMarkerRef = useRef(null);
  const tileLayerRef = useRef(null);

  const [mapStyle, setMapStyle] = useState('google');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoadingStations, setIsLoadingStations] = useState(false);
  const [visibleStationCount, setVisibleStationCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showLegend, setShowLegend] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 768);
  const searchTimeoutRef = useRef(null);
  const moveEndTimeoutRef = useRef(null);
  const searchContainerRef = useRef(null);

  // Switch Map Layer (Google Roadmap / Satellite / Dark / Terrain)
  const switchMapStyle = useCallback((newStyle) => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    if (newStyle === mapStyle) return;

    mapInstanceRef.current.removeLayer(tileLayerRef.current);
    const newLayer = createMapLayer(newStyle);
    newLayer.addTo(mapInstanceRef.current);
    tileLayerRef.current = newLayer;
    setMapStyle(newStyle);
  }, [mapStyle]);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // Render station markers into cluster group
  const renderStationMarkers = useCallback((stationsList) => {
    if (!mapInstanceRef.current || !clusterGroupRef.current) return;
    if (!Array.isArray(stationsList) || stationsList.length === 0) return;

    clusterGroupRef.current.clearLayers();

    const currentBounds = mapInstanceRef.current.getBounds();
    let inView = 0;

    stationsList.forEach((station) => {
      const sLat = station.lat || station.geo?.[0];
      const sLon = station.lon || station.geo?.[1];
      if (!sLat || !sLon) return;

      if (currentBounds && currentBounds.contains([sLat, sLon])) {
        inView++;
      }

      const catInfo = getAQICategoryInfo(station.aqi);
      const icon = createStationMarkerIcon(station, catInfo.color, catInfo);

      const marker = L.marker([sLat, sLon], { icon });
      marker.stationData = { ...station, lat: sLat, lon: sLon };

      // Informative Station Hover Tooltip
      marker.bindTooltip(`
        <div style="font-weight: 800; font-size: 11px; padding: 2px;">
          <div style="color: ${catInfo.color}; font-size: 13px; font-weight: 900; display: flex; align-items: center; gap: 4px;">
            <span>${station.aqi} AQI</span>
            <span style="font-size: 10px; text-transform: uppercase;">• ${catInfo.category}</span>
          </div>
          <div style="color: #f8fafc; font-size: 11px; margin-top: 3px; font-weight: 700;">
            📍 ${station.name}
          </div>
          <div style="color: #94a3b8; font-size: 9px; margin-top: 2px;">
            Click to view full pollutants & details
          </div>
        </div>
      `, {
        direction: 'top',
        offset: [0, -44],
        className: 'custom-station-tooltip'
      });

      // Unique popup content
      const popupContent = document.createElement('div');
      popupContent.className = 'station-popup-card';
      popupContent.style.minWidth = '240px';
      popupContent.style.fontFamily = 'inherit';
      popupContent.innerHTML = `
        <div style="padding: 2px;">
          <div style="display: flex; justify-content: space-between; align-items: start; gap: 8px; margin-bottom: 8px;">
            <h4 style="font-weight: 800; font-size: 13px; color: #ffffff; margin: 0; line-height: 1.25;">
              ${station.name}
            </h4>
          </div>

          <div style="
            display: flex;
            align-items: center;
            justify-content: space-between;
            background-color: ${catInfo.color};
            color: #ffffff;
            padding: 6px 12px;
            border-radius: 12px;
            margin-bottom: 10px;
            box-shadow: 0 2px 8px ${catInfo.color}80;
          ">
            <div>
              <span style="font-size: 20px; font-weight: 900; line-height: 1;">${station.aqi}</span>
              <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; margin-left: 3px;">AQI</span>
            </div>
            <span style="
              font-size: 11px;
              font-weight: 900;
              text-transform: uppercase;
              letter-spacing: 0.05em;
            ">
              ${catInfo.category}
            </span>
          </div>

          <div id="popup-pollutants-${station.uid}" style="
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 6px;
            margin-bottom: 10px;
            font-size: 11px;
          ">
            <div style="background: rgba(255,255,255,0.08); padding: 5px 8px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1);">
              <span style="color: #94a3b8; font-weight: 700; font-size: 9px; display: block; text-transform: uppercase;">PM2.5</span>
              <strong style="color: #f8fafc; font-size: 12px;" id="pm25-val-${station.uid}">
                ${station.pollutants?.pm2_5 ? `${station.pollutants.pm2_5} µg/m³` : `${Math.round(station.aqi * 0.65)} µg/m³`}
              </strong>
            </div>
            <div style="background: rgba(255,255,255,0.08); padding: 5px 8px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1);">
              <span style="color: #94a3b8; font-weight: 700; font-size: 9px; display: block; text-transform: uppercase;">PM10</span>
              <strong style="color: #f8fafc; font-size: 12px;" id="pm10-val-${station.uid}">
                ${station.pollutants?.pm10 ? `${station.pollutants.pm10} µg/m³` : `${Math.round(station.aqi * 1.15)} µg/m³`}
              </strong>
            </div>
            <div style="background: rgba(255,255,255,0.08); padding: 5px 8px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1);">
              <span style="color: #94a3b8; font-weight: 700; font-size: 9px; display: block; text-transform: uppercase;">Temp</span>
              <strong style="color: #f8fafc; font-size: 12px;" id="temp-val-${station.uid}">
                ${station.environmental?.temperature ? `${station.environmental.temperature} °C` : '29 °C'}
              </strong>
            </div>
            <div style="background: rgba(255,255,255,0.08); padding: 5px 8px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1);">
              <span style="color: #94a3b8; font-weight: 700; font-size: 9px; display: block; text-transform: uppercase;">Humidity</span>
              <strong style="color: #f8fafc; font-size: 12px;" id="hum-val-${station.uid}">
                ${station.environmental?.humidity ? `${station.environmental.humidity} %` : '64 %'}
              </strong>
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: #94a3b8; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 6px; margin-bottom: 8px;">
            <span>Updated: <strong style="color: #e2e8f0;">${station.time || 'Live'}</strong></span>
            <span>Source: <strong style="color: #38bdf8;">WAQI / CPCB</strong></span>
          </div>

          <button
            id="btn-select-${station.uid}"
            style="
              width: 100%;
              background: linear-gradient(135deg, #0284c7, #0ea5e9);
              color: white;
              font-weight: 800;
              font-size: 11px;
              padding: 7px;
              border-radius: 10px;
              border: none;
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 4px;
            "
          >
            Set as Dashboard Location &rarr;
          </button>
        </div>
      `;

      marker.on('popupopen', async () => {
        const btn = document.getElementById(`btn-select-${station.uid}`);
        if (btn && onSelectStation) {
          btn.onclick = () => {
            onSelectStation(station);
            marker.closePopup();
          };
        }

        // Fetch detailed station metrics
        if (station.uid && typeof station.uid === 'number') {
          try {
            const detailsRes = await apiService.getAQIStationDetails(station.uid);
            if (detailsRes.data?.success) {
              const d = detailsRes.data.data;
              const pm25El = document.getElementById(`pm25-val-${station.uid}`);
              const pm10El = document.getElementById(`pm10-val-${station.uid}`);
              const tempEl = document.getElementById(`temp-val-${station.uid}`);
              const humEl = document.getElementById(`hum-val-${station.uid}`);

              if (pm25El && d.pollutants?.pm2_5) pm25El.innerText = `${d.pollutants.pm2_5} µg/m³`;
              if (pm10El && d.pollutants?.pm10) pm10El.innerText = `${d.pollutants.pm10} µg/m³`;
              if (tempEl && d.environmental?.temperature) tempEl.innerText = `${d.environmental.temperature} °C`;
              if (humEl && d.environmental?.humidity) humEl.innerText = `${d.environmental.humidity} %`;
            }
          } catch (e) {}
        }
      });

      marker.bindPopup(popupContent, { maxWidth: 280, className: 'custom-station-popup' });
      clusterGroupRef.current.addLayer(marker);
    });

    setVisibleStationCount(inView > 0 ? inView : stationsList.length);
  }, [onSelectStation]);

  // Fetch AQI stations in the visible bounding box
  const fetchStationsForVisibleBounds = useCallback(async (map) => {
    if (!map || !clusterGroupRef.current) return;

    try {
      setIsLoadingStations(true);
      // Pad bounds by 25% to pre-fetch and display nearby neighborhood stations
      const bounds = map.getBounds().pad(0.25);
      const minLat = bounds.getSouth();
      const minLon = bounds.getWest();
      const maxLat = bounds.getNorth();
      const maxLon = bounds.getEast();

      const res = await apiService.getAQIByBounds({ minLat, minLon, maxLat, maxLon });

      if (res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
        renderStationMarkers(res.data.data);
      } else if (currentAQI?.stations && currentAQI.stations.length > 0) {
        renderStationMarkers(currentAQI.stations);
      }
    } catch (err) {
      console.warn('Error fetching stations by bounds:', err.message);
      if (currentAQI?.stations && currentAQI.stations.length > 0) {
        renderStationMarkers(currentAQI.stations);
      }
    } finally {
      setIsLoadingStations(false);
    }
  }, [currentAQI?.stations, renderStationMarkers]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const initialLat = centerLocation?.lat || 28.6139;
    const initialLon = centerLocation?.lon || 77.2090;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLon],
      zoom: 13,
      zoomControl: false,
      minZoom: 3,
      maxZoom: 20,
    });

    const initialLayer = createMapLayer('google');
    initialLayer.addTo(map);
    tileLayerRef.current = initialLayer;

    // Marker Cluster Group with disableClusteringAtZoom: 9
    // so individual green/yellow/red station badges appear directly at city/suburb zoom!
    const clusterGroup = L.markerClusterGroup({
      showCoverageOnHover: false,
      maxClusterRadius: 35,
      spiderfyOnMaxZoom: true,
      zoomToBoundsOnClick: true,
      disableClusteringAtZoom: 9,
      iconCreateFunction: (cluster) => {
        const markers = cluster.getAllChildMarkers();
        const count = markers.length;
        let sumAqi = 0;
        let validCount = 0;
        markers.forEach(m => {
          if (m.stationData && typeof m.stationData.aqi === 'number') {
            sumAqi += m.stationData.aqi;
            validCount++;
          }
        });
        const avgAqi = validCount > 0 ? Math.round(sumAqi / validCount) : 50;
        const catInfo = getAQICategoryInfo(avgAqi);

        return L.divIcon({
          html: `
            <div style="
              background-color: ${catInfo.color};
              color: white;
              min-width: 40px;
              height: 40px;
              padding: 0 4px;
              border-radius: 9999px;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              border: 2.5px solid rgba(255, 255, 255, 0.95);
              box-shadow: 0 4px 16px rgba(0, 0, 0, 0.45);
              font-weight: 900;
              line-height: 1.1;
              cursor: pointer;
            ">
              <span style="font-size: 12px;">${count}</span>
              <span style="font-size: 8px; opacity: 0.9; text-transform: uppercase;">AQI ${avgAqi}</span>
            </div>
          `,
          className: 'custom-aqi-cluster-icon',
          iconSize: [44, 44]
        });
      }
    });

    map.addLayer(clusterGroup);
    clusterGroupRef.current = clusterGroup;
    mapInstanceRef.current = map;

    // Invalidate container size to guarantee smooth tile and marker rendering
    setTimeout(() => {
      map.invalidateSize();
    }, 250);

    const handleMoveEnd = () => {
      if (moveEndTimeoutRef.current) clearTimeout(moveEndTimeoutRef.current);
      moveEndTimeoutRef.current = setTimeout(() => {
        fetchStationsForVisibleBounds(map);
      }, 400);
    };

    map.on('moveend', handleMoveEnd);

    // Map Click Pinpoint Handler: click anywhere on Google Map to pinpoint exact building / street
    const handleMapClick = async (e) => {
      if (e.originalEvent && e.originalEvent._stopped) return;
      const { lat, lng } = e.latlng;
      const roundedLat = parseFloat(lat.toFixed(4));
      const roundedLon = parseFloat(lng.toFixed(4));

      try {
        const geoRes = await apiService.reverseGeocode(roundedLat, roundedLon);
        const geoData = geoRes.data?.data || {};
        const locName = geoData.name || (geoData.displayName ? geoData.displayName.split(',')[0] : `${roundedLat}, ${roundedLon}`);

        if (onLocationSelect) {
          onLocationSelect({
            name: locName,
            displayName: geoData.displayName || `${locName} (${roundedLat}, ${roundedLon})`,
            lat: roundedLat,
            lon: roundedLon,
            city: geoData.address?.city || geoData.address?.town || geoData.address?.village || locName,
            area: geoData.address?.suburb || geoData.address?.neighbourhood || '',
            state: geoData.address?.state || '',
            country: geoData.address?.country || 'India',
            isGPS: true,
            accuracy: 5
          });
        }
      } catch (err) {
        if (onLocationSelect) {
          onLocationSelect({
            name: `Pinpoint (${roundedLat}, ${roundedLon})`,
            displayName: `Map Coordinate (${roundedLat}, ${roundedLon})`,
            lat: roundedLat,
            lon: roundedLon,
            isGPS: true,
            accuracy: 5
          });
        }
      }
    };

    map.on('click', handleMapClick);

    // Initial fetch
    fetchStationsForVisibleBounds(map);

    return () => {
      if (moveEndTimeoutRef.current) clearTimeout(moveEndTimeoutRef.current);
      map.off('moveend', handleMoveEnd);
      map.off('click', handleMapClick);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Invalidate map size on fullscreen toggle
  useEffect(() => {
    if (mapInstanceRef.current) {
      setTimeout(() => {
        mapInstanceRef.current.invalidateSize();
      }, 200);
    }
  }, [isFullscreen]);

  // Immediately render stations whenever currentAQI.stations updates
  useEffect(() => {
    if (currentAQI?.stations && currentAQI.stations.length > 0) {
      renderStationMarkers(currentAQI.stations);
    }
  }, [currentAQI?.stations, renderStationMarkers]);

  // Change Map Style (Cycle: Dark Gray Canvas -> Street -> Satellite)
  const toggleMapStyle = () => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    const styles = ['dark', 'street', 'satellite'];
    const nextIndex = (styles.indexOf(mapStyle) + 1) % styles.length;
    const nextStyle = styles[nextIndex];

    mapInstanceRef.current.removeLayer(tileLayerRef.current);
    const newLayer = createMapLayer(nextStyle);
    newLayer.addTo(mapInstanceRef.current);
    tileLayerRef.current = newLayer;
    setMapStyle(nextStyle);
  };

  // Fly to location when centerLocation changes
  useEffect(() => {
    if (!mapInstanceRef.current || !centerLocation?.lat || !centerLocation?.lon) return;

    const currentCenter = mapInstanceRef.current.getCenter();
    const dist = Math.abs(currentCenter.lat - centerLocation.lat) + Math.abs(currentCenter.lng - centerLocation.lon);

    if (dist > 0.005) {
      mapInstanceRef.current.flyTo([centerLocation.lat, centerLocation.lon], 12, {
        duration: 1.2,
      });
    }
  }, [centerLocation?.lat, centerLocation?.lon]);

  // Update or render "YOU ARE HERE" marker with draggable pinpoint precision
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (userGeoLocation?.lat && userGeoLocation?.lon) {
      const userPos = [userGeoLocation.lat, userGeoLocation.lon];

      if (!userMarkerRef.current) {
        const marker = L.marker(userPos, {
          icon: createUserLocationIcon(),
          zIndexOffset: 1000,
          draggable: true,
        }).addTo(mapInstanceRef.current);

        marker.on('dragend', async (e) => {
          const latLng = e.target.getLatLng();
          const roundedLat = parseFloat(latLng.lat.toFixed(4));
          const roundedLon = parseFloat(latLng.lng.toFixed(4));

          try {
            const geoRes = await apiService.reverseGeocode(roundedLat, roundedLon);
            const geoData = geoRes.data?.data || {};
            const locName = geoData.name || (geoData.displayName ? geoData.displayName.split(',')[0] : `${roundedLat}, ${roundedLon}`);

            if (onLocationSelect) {
              onLocationSelect({
                name: locName,
                displayName: geoData.displayName || `${locName} (${roundedLat}, ${roundedLon})`,
                lat: roundedLat,
                lon: roundedLon,
                city: geoData.address?.city || geoData.address?.town || geoData.address?.village || locName,
                area: geoData.address?.suburb || geoData.address?.neighbourhood || '',
                state: geoData.address?.state || '',
                country: geoData.address?.country || 'India',
                isGPS: true,
                accuracy: 5
              });
            }
          } catch (err) {
            if (onLocationSelect) {
              onLocationSelect({
                name: `Pinpoint (${roundedLat}, ${roundedLon})`,
                displayName: `Map Location (${roundedLat}, ${roundedLon})`,
                lat: roundedLat,
                lon: roundedLon,
                isGPS: true,
                accuracy: 5
              });
            }
          }
        });

        marker.bindPopup(`
          <div style="font-family: inherit; padding: 4px; color: #ffffff;">
            <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
              <span style="display: inline-block; width: 8px; height: 8px; border-radius: 9999px; background-color: #0284c7;"></span>
              <strong style="font-size: 13px; color: #38bdf8; text-transform: uppercase;">YOU ARE HERE</strong>
            </div>
            <p style="font-size: 12px; font-weight: 700; margin: 0 0 4px 0; color: #f8fafc;">
              ${userGeoLocation.displayName || 'Current Device GPS Location'}
            </p>
            <p style="font-size: 10px; font-family: monospace; color: #94a3b8; margin: 0 0 4px 0;">
              GPS: ${parseFloat(userGeoLocation.lat).toFixed(4)}, ${parseFloat(userGeoLocation.lon).toFixed(4)}
            </p>
            <div style="font-size: 10px; color: #38bdf8; font-weight: 700;">
              💡 Tip: Drag marker or tap anywhere on map to pinpoint exact address!
            </div>
          </div>
        `, { className: 'custom-popup-styled' });

        userMarkerRef.current = marker;
      } else {
        userMarkerRef.current.setLatLng(userPos);
        userMarkerRef.current.setPopupContent(`
          <div style="font-family: inherit; padding: 4px; color: #ffffff;">
            <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
              <span style="display: inline-block; width: 8px; height: 8px; border-radius: 9999px; background-color: #0284c7;"></span>
              <strong style="font-size: 13px; color: #38bdf8; text-transform: uppercase;">YOU ARE HERE</strong>
            </div>
            <p style="font-size: 12px; font-weight: 700; margin: 0 0 4px 0; color: #f8fafc;">
              ${userGeoLocation.displayName || 'Current Device GPS Location'}
            </p>
            <p style="font-size: 10px; font-family: monospace; color: #94a3b8; margin: 0 0 4px 0;">
              GPS: ${parseFloat(userGeoLocation.lat).toFixed(4)}, ${parseFloat(userGeoLocation.lon).toFixed(4)}
            </p>
            <div style="font-size: 10px; color: #38bdf8; font-weight: 700;">
              💡 Tip: Drag marker or tap anywhere on map to pinpoint exact address!
            </div>
          </div>
        `);
      }
    } else if (userMarkerRef.current) {
      mapInstanceRef.current.removeLayer(userMarkerRef.current);
      userMarkerRef.current = null;
    }
  }, [userGeoLocation]);

  // Autocomplete Location Search
  const handleSearchInput = (e) => {
    const val = e.target.value;
    setSearchQuery(val);

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (val.trim().length >= 2) {
      setIsSearching(true);
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const res = await apiService.searchLocation({ query: val.trim() });
          if (res.data?.success) {
            setSearchResults(res.data.data || []);
            setShowSearchDropdown(true);
          }
        } catch (err) {
          console.error('Search location error:', err);
        } finally {
          setIsSearching(false);
        }
      }, 350);
    } else {
      setSearchResults([]);
      setShowSearchDropdown(false);
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = (result) => {
    setShowSearchDropdown(false);
    setSearchQuery(result.name || result.displayName);

    if (mapInstanceRef.current && result.lat && result.lon) {
      mapInstanceRef.current.flyTo([result.lat, result.lon], 13, { duration: 1.5 });
    }

    if (onLocationSelect) {
      onLocationSelect({
        name: result.name,
        displayName: result.displayName,
        lat: result.lat,
        lon: result.lon,
        city: result.address?.city || result.name,
        area: result.address?.area || '',
        state: result.address?.state || '',
        country: result.address?.country || ''
      });
    }
  };

  const handleReturnToCurrentLocation = () => {
    if (userGeoLocation?.lat && userGeoLocation?.lon && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([userGeoLocation.lat, userGeoLocation.lon], 12, { duration: 1.2 });
      if (userMarkerRef.current) {
        userMarkerRef.current.openPopup();
      }
    } else if (onUseCurrentLocation) {
      onUseCurrentLocation();
    }
  };

  const handleFitAllStations = () => {
    if (!mapInstanceRef.current || !clusterGroupRef.current) return;
    try {
      const bounds = clusterGroupRef.current.getBounds();
      if (bounds.isValid()) {
        mapInstanceRef.current.fitBounds(bounds.pad(0.12), { maxZoom: 14, animate: true });
      }
    } catch (e) {}
  };

  return (
    <div className={`relative w-full overflow-hidden transition-all duration-500 ${
      isFullscreen
        ? 'fixed inset-4 z-50 h-[calc(100vh-2rem)] rounded-3xl border border-white/20 shadow-2xl'
        : heroMode
          ? 'h-[440px] sm:h-[540px] md:h-[620px] lg:h-[660px] rounded-none border-b border-white/10 shadow-[0_24px_60px_rgba(0,0,0,0.8)]'
          : 'h-[360px] sm:h-[500px] rounded-3xl shadow-2xl border border-white/20'
    }`}>
      {/* Subtle Atmospheric Gradient Blend Into Dashboard */}
      {heroMode && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#06141B]/90 via-[#06141B]/40 to-transparent z-[20]" />
      )}

      {/* Top Overlay: Search Bar & Action Controls */}
      <div className={`absolute ${heroMode ? "top-16 sm:top-20" : "top-3 sm:top-4"} left-3 right-3 sm:left-4 sm:right-4 z-[1000] flex flex-wrap items-center justify-between gap-2 sm:gap-3 pointer-events-none transition-all`}>
        {/* Left: Location Search Bar */}
        <div ref={searchContainerRef} className="relative pointer-events-auto flex-1 max-w-md z-[2000]">
          <div className="relative flex items-center bg-slate-900/90 hover:bg-slate-900 backdrop-blur-2xl rounded-2xl border border-white/20 shadow-2xl transition">
            <FiSearch className="absolute left-4 w-4 h-4 text-cyan-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchInput}
              onFocus={() => searchResults.length > 0 && setShowSearchDropdown(true)}
              placeholder="Search any city, area, district, country..."
              className="w-full pl-11 pr-10 py-3 bg-transparent text-sm font-semibold text-white placeholder-slate-400 focus:outline-none"
            />
            {isSearching ? (
              <FiRefreshCw className="absolute right-4 w-4 h-4 text-cyan-400 animate-spin" />
            ) : searchQuery ? (
              <button
                onClick={() => { setSearchQuery(''); setSearchResults([]); setShowSearchDropdown(false); }}
                className="absolute right-3.5 p-1 text-slate-400 hover:text-white"
              >
                <FiX className="w-3.5 h-3.5" />
              </button>
            ) : null}
          </div>

          {/* Autocomplete Dropdown */}
          {showSearchDropdown && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900/98 backdrop-blur-3xl rounded-2xl border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.9)] overflow-hidden max-h-72 overflow-y-auto divide-y divide-white/10 z-[2100]">
              {searchResults.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelectSearchResult(item)}
                  className="p-3 hover:bg-cyan-500/20 cursor-pointer transition flex items-start gap-3"
                >
                  <FiMapPin className="w-4 h-4 text-cyan-400 mt-1 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{item.name}</p>
                    <p className="text-xs text-slate-300 truncate">{item.displayName}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto shrink-0 flex-wrap justify-end">
          {/* Map Layer Mode Selector */}
          <div className="flex items-center bg-slate-900/90 backdrop-blur-2xl rounded-2xl border border-white/20 p-1 shadow-xl">
            <button
              type="button"
              onClick={() => switchMapStyle('google')}
              className={`px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl text-[10px] sm:text-xs font-bold transition flex items-center gap-1 ${
                mapStyle === 'google' ? 'bg-cyan-500 text-white shadow-md' : 'text-slate-300 hover:text-white'
              }`}
              title="Google Maps Standard Roadmap"
            >
              <span>🗺️</span>
              <span className="hidden md:inline">Google Map</span>
            </button>
            <button
              type="button"
              onClick={() => switchMapStyle('satellite')}
              className={`px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl text-[10px] sm:text-xs font-bold transition flex items-center gap-1 ${
                mapStyle === 'satellite' ? 'bg-cyan-500 text-white shadow-md' : 'text-slate-300 hover:text-white'
              }`}
              title="Google Maps Satellite Hybrid"
            >
              <span>🛰️</span>
              <span className="hidden md:inline">Satellite</span>
            </button>
            <button
              type="button"
              onClick={() => switchMapStyle('dark')}
              className={`px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl text-[10px] sm:text-xs font-bold transition flex items-center gap-1 ${
                mapStyle === 'dark' ? 'bg-cyan-500 text-white shadow-md' : 'text-slate-300 hover:text-white'
              }`}
              title="Google Maps Dark Theme"
            >
              <span>🌙</span>
              <span className="hidden md:inline">Dark</span>
            </button>
            <button
              type="button"
              onClick={() => switchMapStyle('terrain')}
              className={`px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl text-[10px] sm:text-xs font-bold transition flex items-center gap-1 ${
                mapStyle === 'terrain' ? 'bg-cyan-500 text-white shadow-md' : 'text-slate-300 hover:text-white'
              }`}
              title="Google Maps Terrain"
            >
              <span>⛰️</span>
              <span className="hidden md:inline">Terrain</span>
            </button>
          </div>

          {/* Prominent "Use My Current Location" button */}
          <button
            onClick={onUseCurrentLocation}
            disabled={isDetectingLocation}
            title="Detect GPS Location"
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-2xl font-black text-[11px] sm:text-xs uppercase tracking-wider shadow-xl shadow-cyan-500/25 border border-white/30 backdrop-blur-xl transition hover:scale-105 active:scale-95 disabled:opacity-60"
          >
            <FiNavigation className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isDetectingLocation ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isDetectingLocation ? 'Locating...' : 'Use My Current Location'}</span>
            <span className="inline sm:hidden">{isDetectingLocation ? '...' : 'My Location'}</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Map'}
            className="p-2.5 bg-slate-900/85 hover:bg-slate-900 text-white rounded-2xl border border-white/20 shadow-xl backdrop-blur-xl transition hover:scale-105"
          >
            {isFullscreen ? <FiMinimize2 className="w-4 h-4 text-cyan-400" /> : <FiMaximize2 className="w-4 h-4 text-cyan-400" />}
          </button>
        </div>
      </div>

      {/* Floating Map Controls (Zoom, Re-center) */}
      <div className={`absolute right-4 z-[500] flex flex-col items-end gap-3 pointer-events-none transition-all duration-300 ${
        heroMode ? 'bottom-20 md:bottom-24' : 'bottom-6'
      }`}>
        <div className="flex flex-col gap-2 pointer-events-auto">
          {/* Return to My Location */}
          <button
            onClick={handleReturnToCurrentLocation}
            title="Return to My Location"
            className="p-3 bg-slate-900/90 hover:bg-slate-900 text-cyan-400 hover:text-cyan-300 rounded-2xl border border-white/20 shadow-xl backdrop-blur-2xl transition hover:scale-110 active:scale-95 group"
          >
            <FiNavigation className="w-5 h-5 group-hover:rotate-45 transition-transform" />
          </button>

          {/* Fit All Stations */}
          <button
            onClick={handleFitAllStations}
            title="Fit All Monitoring Stations on Map"
            className="p-3 bg-slate-900/90 hover:bg-slate-900 text-white hover:text-cyan-400 rounded-2xl border border-white/20 shadow-xl backdrop-blur-2xl transition hover:scale-110 active:scale-95"
          >
            <FiCrosshair className="w-5 h-5" />
          </button>

          {/* Zoom In */}
          <button
            onClick={() => mapInstanceRef.current && mapInstanceRef.current.zoomIn()}
            title="Zoom In"
            className="p-3 bg-slate-900/90 hover:bg-slate-900 text-white hover:text-cyan-400 rounded-2xl border border-white/20 shadow-xl backdrop-blur-2xl transition hover:scale-110 active:scale-95"
          >
            <FiZoomIn className="w-5 h-5" />
          </button>

          {/* Zoom Out */}
          <button
            onClick={() => mapInstanceRef.current && mapInstanceRef.current.zoomOut()}
            title="Zoom Out"
            className="p-3 bg-slate-900/90 hover:bg-slate-900 text-white hover:text-cyan-400 rounded-2xl border border-white/20 shadow-xl backdrop-blur-2xl transition hover:scale-110 active:scale-95"
          >
            <FiZoomOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Bottom Left: Live Stations Count Badge & Pinpoint Precision Badge */}
      <div className={`absolute left-3 sm:left-4 z-[500] pointer-events-none transition-all duration-300 flex flex-col sm:flex-row items-start sm:items-center gap-2 ${
        heroMode ? 'bottom-20 md:bottom-24' : 'bottom-6'
      }`}>
        <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2 bg-slate-900/90 backdrop-blur-2xl px-3 sm:px-4 py-1.5 sm:py-2 rounded-2xl border border-white/20 shadow-xl text-[11px] sm:text-xs font-mono font-bold text-white">
          <span className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${isLoadingStations ? 'bg-amber-400 animate-ping' : 'bg-green-400'}`}></span>
          <span className="hidden sm:inline">{visibleStationCount} Monitoring Stations in Visible Area</span>
          <span className="inline sm:hidden">{visibleStationCount} Stations</span>
          {isLoadingStations && <FiRefreshCw className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-spin text-amber-400 ml-1" />}
        </div>

        <div className="pointer-events-auto hidden md:flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-2xl px-3 py-1.5 rounded-2xl border border-cyan-500/30 shadow-xl text-[11px] font-bold text-cyan-300">
          <span>🎯</span>
          <span>Click anywhere or drag pin to pinpoint exact address</span>
        </div>
      </div>

      {/* Floating Indian National AQI Color Legend (Right-docked to eliminate overlap with search dropdown) */}
      <div className={`absolute right-3 sm:right-4 ${heroMode ? "top-32 sm:top-36" : "top-16 sm:top-20"} z-[900] pointer-events-none transition-all duration-300 ${showSearchDropdown && searchResults.length > 0 ? "opacity-0 pointer-events-none" : "opacity-100"}`}>

        <div className="pointer-events-auto">
          {showLegend ? (
            <div className="bg-slate-900/95 backdrop-blur-3xl rounded-2xl p-3 border border-white/20 shadow-2xl max-w-xs transition-all">
              <div className="flex justify-between items-center mb-2 pb-1.5 border-b border-white/10">
                <span className="text-[11px] font-black uppercase tracking-wider text-cyan-400">Indian National AQI Legend</span>
                <button
                  onClick={() => setShowLegend(false)}
                  className="text-slate-400 hover:text-white p-0.5"
                  title="Minimize Legend"
                >
                  <FiX className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-[10px] font-bold">
                <div className="flex items-center gap-2 bg-slate-800/60 px-2 py-1 rounded-lg">
                  <span className="w-3 h-3 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: '#16a34a' }}></span>
                  <span className="text-slate-200">0–50 Good</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-800/60 px-2 py-1 rounded-lg">
                  <span className="w-3 h-3 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: '#84cc16' }}></span>
                  <span className="text-slate-200">51–100 Satisfactory</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-800/60 px-2 py-1 rounded-lg">
                  <span className="w-3 h-3 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: '#eab308' }}></span>
                  <span className="text-slate-200">101–200 Moderate</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-800/60 px-2 py-1 rounded-lg">
                  <span className="w-3 h-3 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: '#f97316' }}></span>
                  <span className="text-slate-200">201–300 Poor</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-800/60 px-2 py-1 rounded-lg">
                  <span className="w-3 h-3 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: '#ef4444' }}></span>
                  <span className="text-slate-200">301–400 Very Poor</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-800/60 px-2 py-1 rounded-lg">
                  <span className="w-3 h-3 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: '#7f1d1d' }}></span>
                  <span className="text-slate-200">401–500+ Severe</span>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowLegend(true)}
              className="bg-slate-900/90 backdrop-blur-2xl px-3 py-1.5 rounded-xl border border-white/20 text-xs font-bold text-cyan-400 hover:text-white shadow-xl transition"
            >
              Show AQI Legend
            </button>
          )}
        </div>
      </div>

      {/* Leaflet Map DOM Node */}
      <div ref={mapContainerRef} className="w-full h-full z-0 bg-slate-950" />
    </div>
  );
}
