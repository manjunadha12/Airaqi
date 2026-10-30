import React from 'react';
import { FiTrendingUp, FiTrendingDown, FiMinus, FiMapPin, FiNavigation } from 'react-icons/fi';

/**
 * Indian National AQI Classification
 * Green (0–50): Good
 * Light Green (51–100): Satisfactory
 * Yellow (101–200): Moderate
 * Orange (201–300): Poor
 * Red (301–400): Very Poor
 * Dark Red (401–500): Severe
 */
export const getAQITheme = (val, cat, hour = new Date().getHours()) => {
  const num = Number(val);
  const key = (cat || '').toLowerCase();

  let levelKey = 'good';
  if (!isNaN(num) && num >= 0) {
    if (num <= 50) levelKey = 'good';
    else if (num <= 100) levelKey = 'satisfactory';
    else if (num <= 200) levelKey = 'moderate';
    else if (num <= 300) levelKey = 'poor';
    else if (num <= 400) levelKey = 'very_poor';
    else levelKey = 'severe';
  } else {
    if (key.includes('good')) levelKey = 'good';
    else if (key.includes('satisfactory')) levelKey = 'satisfactory';
    else if (key.includes('moderate')) levelKey = 'moderate';
    else if (key.includes('very_poor')) levelKey = 'very_poor';
    else if (key.includes('poor')) levelKey = 'poor';
    else if (key.includes('severe')) levelKey = 'severe';
  }

  // Dynamic time-of-day activity tip
  let timeTip = '';
  if (hour >= 5 && hour < 12) {
    timeTip = '🌅 Morning Activity Tip: Excellent time for outdoor jogging, cycling, or morning exercise.';
  } else if (hour >= 12 && hour < 17) {
    timeTip = '☀️ Afternoon Activity Tip: Good conditions for outdoor movement and sports.';
  } else if (hour >= 17 && hour < 21) {
    timeTip = '🌆 Evening Activity Tip: Pleasant evening for outdoor walks and recreation.';
  } else {
    timeTip = '🌙 Night Activity Tip: Clean air overnight. Safe for fresh air ventilation.';
  }

  const themes = {
    good: {
      color: '#16a34a', // Green
      borderColor: 'border-green-500',
      textColor: 'text-green-400',
      badgeColor: 'text-green-300 bg-green-950/70 border-green-500/50 backdrop-blur-xl',
      bgTint: 'bg-green-950/20',
      dotColor: 'bg-green-500',
      pageBg: 'bg-gradient-to-b from-green-950/20 via-transparent to-transparent',
      heroBanner: 'backdrop-blur-3xl bg-gradient-to-r from-green-950/60 via-emerald-950/50 to-green-950/60 border border-green-500/40 text-white shadow-[0_16px_48px_0_rgba(22,163,74,0.18)] hover:border-green-400/60',
      cardBorder: 'border-green-500/30',
      label: 'Good',
      range: '0–50',
      healthAdvice: 'Air quality is Good and poses minimal or no health risk.',
      timeActivityTip: timeTip
    },
    satisfactory: {
      color: '#84cc16', // Light Green
      borderColor: 'border-lime-500',
      textColor: 'text-lime-400',
      badgeColor: 'text-lime-300 bg-lime-950/70 border-lime-500/50 backdrop-blur-xl',
      bgTint: 'bg-lime-950/20',
      dotColor: 'bg-lime-500',
      pageBg: 'bg-gradient-to-b from-lime-950/20 via-transparent to-transparent',
      heroBanner: 'backdrop-blur-3xl bg-gradient-to-r from-lime-950/60 via-emerald-950/45 to-lime-950/60 border border-lime-500/40 text-white shadow-[0_16px_48px_0_rgba(132,204,22,0.18)] hover:border-lime-400/60',
      cardBorder: 'border-lime-500/30',
      label: 'Satisfactory',
      range: '51–100',
      healthAdvice: 'Air quality is Satisfactory. Acceptable for most people; sensitive individuals should consider taking light breaks.',
      timeActivityTip: hour >= 5 && hour < 12 ? '🌅 Morning Tip: Suitable for morning walks; sensitive individuals take light breaks.' : '☀️ Activity Tip: Outdoor activities are generally safe.'
    },
    moderate: {
      color: '#eab308', // Yellow
      borderColor: 'border-yellow-500',
      textColor: 'text-yellow-400',
      badgeColor: 'text-yellow-300 bg-yellow-950/70 border-yellow-500/50 backdrop-blur-xl',
      bgTint: 'bg-yellow-950/20',
      dotColor: 'bg-yellow-500',
      pageBg: 'bg-gradient-to-b from-yellow-950/20 via-transparent to-transparent',
      heroBanner: 'backdrop-blur-3xl bg-gradient-to-r from-yellow-950/60 via-amber-950/50 to-yellow-950/60 border border-yellow-500/40 text-white shadow-[0_16px_48px_0_rgba(234,179,8,0.18)] hover:border-yellow-400/60',
      cardBorder: 'border-yellow-500/30',
      label: 'Moderate',
      range: '101–200',
      healthAdvice: 'Air quality is Moderate. May cause breathing discomfort to people with lung, asthma or heart diseases.',
      timeActivityTip: '⚠️ Activity Tip: Sensitive groups should reduce prolonged outdoor exertion during peak traffic hours.'
    },
    poor: {
      color: '#f97316', // Orange
      borderColor: 'border-orange-500',
      textColor: 'text-orange-400',
      badgeColor: 'text-orange-300 bg-orange-950/70 border-orange-500/50 backdrop-blur-xl',
      bgTint: 'bg-orange-950/20',
      dotColor: 'bg-orange-500',
      pageBg: 'bg-gradient-to-b from-orange-950/20 via-transparent to-transparent',
      heroBanner: 'backdrop-blur-3xl bg-gradient-to-r from-orange-950/60 via-amber-950/50 to-orange-950/60 border border-orange-500/40 text-white shadow-[0_16px_48px_0_rgba(249,115,22,0.18)] hover:border-orange-400/60',
      cardBorder: 'border-orange-500/30',
      label: 'Poor',
      range: '201–300',
      healthAdvice: 'Air quality is Poor. May cause breathing discomfort to most people on prolonged exposure.',
      timeActivityTip: '🛑 Activity Tip: Avoid strenuous outdoor exercise. Wear an N95 mask if heading outdoors.'
    },
    very_poor: {
      color: '#ef4444', // Red
      borderColor: 'border-red-500',
      textColor: 'text-red-400',
      badgeColor: 'text-red-300 bg-red-950/70 border-red-500/50 backdrop-blur-xl',
      bgTint: 'bg-red-950/20',
      dotColor: 'bg-red-500',
      pageBg: 'bg-gradient-to-b from-red-950/20 via-transparent to-transparent',
      heroBanner: 'backdrop-blur-3xl bg-gradient-to-r from-red-950/60 via-rose-950/50 to-red-950/60 border border-red-500/40 text-white shadow-[0_16px_48px_0_rgba(239,68,68,0.2)] hover:border-red-400/60',
      cardBorder: 'border-red-500/30',
      label: 'Very Poor',
      range: '301–400',
      healthAdvice: 'Air quality is Very Poor. Respiratory illness on prolonged exposure. Avoid all outdoor activities.',
      timeActivityTip: '🛑 Emergency Tip: Avoid outdoor movement. Keep windows shut and run indoor air purifiers.'
    },
    severe: {
      color: '#7f1d1d', // Dark Red
      borderColor: 'border-rose-900',
      textColor: 'text-rose-400',
      badgeColor: 'text-rose-200 bg-rose-950/90 border-rose-700/60 backdrop-blur-xl',
      bgTint: 'bg-rose-950/30',
      dotColor: 'bg-rose-900',
      pageBg: 'bg-gradient-to-b from-rose-950/30 via-transparent to-transparent',
      heroBanner: 'backdrop-blur-3xl bg-gradient-to-r from-rose-950/80 via-red-950/70 to-rose-950/80 border border-rose-600/50 text-white shadow-[0_16px_48px_0_rgba(127,29,29,0.35)] hover:border-rose-500/70',
      cardBorder: 'border-rose-700/40',
      label: 'Severe',
      range: '401–500+',
      healthAdvice: 'HAZARDOUS AIR QUALITY EMERGENCY! Affects healthy people and seriously impacts those with existing conditions.',
      timeActivityTip: '🚨 Severe Emergency Tip: Remain indoors immediately with doors and windows completely sealed.'
    }
  };

  return themes[levelKey] || themes.good;
};

export function AQICard({ value, category, trend, lastUpdate, appTime, locationName, isGPS }) {
  const formattedValue = (value !== undefined && value !== null && value !== '-' && !isNaN(Number(value))) ? value : '—';
  const theme = getAQITheme(value, category);
  const categoryLabel = (category || theme.label).replace(/_/g, ' ');

  return (
    <div className={`backdrop-blur-3xl bg-slate-900/40 rounded-3xl p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] border ${theme.cardBorder} ${theme.bgTint} relative overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-cyan-500/20 group`}>
      <div className="flex justify-between items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shrink-0"></span>
            <p className="text-cyan-400 font-black text-xs uppercase tracking-wider">
              Current Air Quality
            </p>
          </div>

          {/* Prominent Detected Location Name */}
          <div className="mt-1.5 flex items-center gap-1.5 text-white font-bold text-sm">
            {isGPS ? (
              <FiNavigation className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            ) : (
              <FiMapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            )}
            <span className="truncate" title={locationName || 'Local Monitoring Station'}>
              {locationName || 'Detecting Location...'}
            </span>
          </div>

          <div className="flex items-baseline gap-2 mt-3">
            <p className={`text-6xl font-black tracking-tight ${theme.textColor}`}>{formattedValue}</p>
            <span className="text-xs font-black uppercase tracking-widest text-slate-300">AQI</span>
          </div>
        </div>
        <div className={`px-3.5 py-1.5 rounded-2xl text-xs font-black uppercase tracking-wider backdrop-blur-xl shadow-sm border shrink-0 ${theme.badgeColor}`}>
          {categoryLabel}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-bold text-slate-300">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: theme.color }}></span>
          Range: {theme.range}
        </span>
        <span className="text-slate-400 font-mono text-[11px]">Sync: {appTime || 'Live'}</span>
      </div>
    </div>
  );
}

export function StatCard({ label, value, unit, color, icon: Icon, threshold }) {
  const isHigh = threshold && value > threshold;

  return (
    <div className="backdrop-blur-3xl bg-slate-900/40 rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] border border-white/15 relative overflow-hidden group hover:border-cyan-400/40 transition-all duration-300">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs font-black uppercase tracking-wider text-slate-400">{label}</p>
          <div className="flex items-baseline gap-1.5 mt-2">
            <p className="text-3xl font-black text-white">{value !== null && value !== undefined ? value : '—'}</p>
            <span className="text-xs font-black text-slate-400">{unit}</span>
          </div>
        </div>
        {Icon && (
          <div className={`p-3 rounded-2xl ${color} text-white shadow-lg backdrop-blur-xl border border-white/20`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      {threshold && (
        <div className={`absolute bottom-0 left-0 h-1 transition-all duration-500 ${isHigh ? 'bg-red-500 w-full' : 'bg-emerald-500 w-1/3'}`}></div>
      )}
    </div>
  );
}

export function AlertCard({ alert, onAcknowledge, onResolve }) {
  const getSeverityColor = (severity) => {
    const colors = {
      info: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
      warning: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30',
      critical: 'bg-red-500/20 text-red-300 border border-red-500/30',
      emergency: 'bg-rose-950/60 text-rose-300 border border-rose-600/50',
    };
    return colors[severity] || colors['info'];
  };

  return (
    <div className="backdrop-blur-3xl bg-slate-900/40 rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] border border-white/15 relative overflow-hidden transition-all duration-300 hover:scale-[1.01] hover:border-red-400/50">
      <div className="flex justify-between items-start mb-3 gap-4">
        <div>
          <p className="font-extrabold text-white text-base leading-tight">{alert.title}</p>
          <p className="text-xs font-semibold text-slate-300 mt-1">{alert.description}</p>
        </div>
        <span className={`px-3 py-1 rounded-2xl text-[10px] font-black uppercase tracking-wider backdrop-blur-xl ${getSeverityColor(alert.severity)}`}>
          {alert.severity}
        </span>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-white/10">
        <p className="text-[10px] font-mono font-bold text-slate-400">
          {new Date(alert.triggeredAt).toLocaleString()}
        </p>
        <div className="flex gap-2">
          {alert.status === 'active' && (
            <>
              <button
                onClick={() => onAcknowledge(alert._id)}
                className="text-xs px-3.5 py-1.5 bg-yellow-500/20 text-yellow-300 rounded-xl hover:bg-yellow-500/30 transition font-bold border border-yellow-500/30 backdrop-blur-xl"
              >
                Acknowledge
              </button>
              <button
                onClick={() => onResolve(alert._id)}
                className="text-xs px-3.5 py-1.5 bg-green-500/20 text-green-300 rounded-xl hover:bg-green-500/30 transition font-bold border border-green-500/30 backdrop-blur-xl"
              >
                Resolve
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function SensorStatusCard({ sensor, status, onSelect }) {
  const num = Number(status?.aqi);
  let badgeBg = 'bg-slate-700/80';
  let categoryLabel = 'Unknown';

  if (!isNaN(num) && num >= 0) {
    if (num <= 50) {
      badgeBg = 'bg-green-600/90 shadow-green-600/30 border-green-400/40';
      categoryLabel = 'Good';
    } else if (num <= 100) {
      badgeBg = 'bg-lime-600/90 shadow-lime-600/30 border-lime-400/40';
      categoryLabel = 'Satisfactory';
    } else if (num <= 200) {
      badgeBg = 'bg-yellow-600/90 shadow-yellow-600/30 border-yellow-400/40';
      categoryLabel = 'Moderate';
    } else if (num <= 300) {
      badgeBg = 'bg-orange-600/90 shadow-orange-600/30 border-orange-400/40';
      categoryLabel = 'Poor';
    } else if (num <= 400) {
      badgeBg = 'bg-red-600/90 shadow-red-600/30 border-red-400/40';
      categoryLabel = 'Very Poor';
    } else {
      badgeBg = 'bg-rose-900/95 shadow-rose-900/40 border-rose-600/50';
      categoryLabel = 'Severe';
    }
  }

  const displayAqi = (!isNaN(num) && num >= 0) ? num : '—';

  return (
    <div
      onClick={onSelect ? () => onSelect(sensor) : undefined}
      className={`backdrop-blur-3xl bg-slate-900/40 rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] border border-white/15 relative overflow-hidden group hover:scale-[1.02] hover:border-cyan-400/50 transition-all duration-300 ${onSelect ? 'cursor-pointer' : ''}`}
    >
      <div className="pt-1">
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1 min-w-0">
            <p className="font-extrabold text-white group-hover:text-cyan-400 transition-colors leading-snug truncate" title={sensor.name}>
              {sensor.name}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate">
                {sensor.location?.name || 'Monitoring Station'}
              </span>
              <span className="text-[10px] text-cyan-400 font-semibold">&bull; {categoryLabel}</span>
            </div>
          </div>
          <div className={`flex flex-col items-center justify-center min-w-[56px] h-[56px] rounded-2xl ${badgeBg} text-white shadow-lg backdrop-blur-xl border border-white/20 shrink-0`}>
            <span className="text-2xl font-black leading-none">{displayAqi}</span>
            <span className="text-[8px] font-black uppercase mt-1 tracking-wider">AQI</span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/10">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${displayAqi !== '—' ? 'bg-green-400 animate-pulse' : 'bg-slate-500'}`}></div>
            <span className="text-[9px] font-black text-slate-300 uppercase tracking-wider">{displayAqi !== '—' ? 'Active Feed' : 'Offline'}</span>
          </div>
          <p className="text-[10px] font-mono text-slate-400">{status?.lastUpdate || 'Live'}</p>
        </div>
      </div>
    </div>
  );
}
