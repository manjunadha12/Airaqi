import React from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function AQILineChart({ data, title }) {
  return (
    <div className="backdrop-blur-3xl bg-slate-900/60 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] border border-white/15 transition-all duration-500">
      <div className="flex justify-between items-center mb-3 sm:mb-4 flex-wrap gap-2">
        <h3 className="text-base sm:text-xl font-black text-white tracking-tight">{title}</h3>
        <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
          Wave Motion
        </span>
      </div>
      <div className="h-[240px] sm:h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="dashboardWaveGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.6}>
                  <animate attributeName="stop-opacity" values="0.45;0.75;0.45" dur="3.5s" repeatCount="indefinite" />
                </stop>
                <stop offset="60%" stopColor="#0891b2" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#06141B" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.12} />
            <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} tickLine={false} />
            <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} domain={[0, 'dataMax + 20']} />
            <Tooltip
              contentStyle={{ backgroundColor: 'rgba(17, 33, 45, 0.9)', backdropFilter: 'blur(24px)', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}
            />
            <Area
              type="monotone"
              dataKey="aqi"
              stroke="#06b6d4"
              strokeWidth={3}
              fill="url(#dashboardWaveGrad)"
              className="animate-wave-curve"
              isAnimationActive={true}
              animationDuration={1200}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function AQIPollutantsChart({ data, title }) {
  return (
    <div className="backdrop-blur-3xl bg-slate-900/35 dark:bg-slate-900/35 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] border border-white/15 dark:border-white/10 transition-all duration-500">
      <h3 className="text-base sm:text-xl font-black mb-3 sm:mb-4 text-white tracking-tight">{title}</h3>
      <div className="h-[240px] sm:h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.15} />
          <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
          <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
          <Tooltip
            contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(24px)', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '16px' }}
          />
          <Legend wrapperStyle={{ color: '#cbd5e1' }} />
          <Bar dataKey="pm2_5" fill="#ef4444" radius={[6, 6, 0, 0]} />
          <Bar dataKey="pm10" fill="#f97316" radius={[6, 6, 0, 0]} />
          <Bar dataKey="no2" fill="#eab308" radius={[6, 6, 0, 0]} />
          <Bar dataKey="co" fill="#06b6d4" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      </div>
    </div>
  );
}

export function AQITrendChart({ data, title }) {
  return (
    <div className="backdrop-blur-3xl bg-slate-900/35 dark:bg-slate-900/35 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] border border-white/15 dark:border-white/10 transition-all duration-500">
      <h3 className="text-base sm:text-xl font-black mb-3 sm:mb-4 text-white tracking-tight">{title}</h3>
      <div className="h-[240px] sm:h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.15} />
          <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} />
          <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
          <Tooltip
            contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(24px)', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '16px' }}
          />
          <Area
            type="monotone"
            dataKey="average"
            fill="#38bdf8"
            stroke="#0284c7"
            fillOpacity={0.3}
          />
        </AreaChart>
      </ResponsiveContainer>
      </div>
    </div>
  );
}

export function AQIComparisonChart({ data, title }) {
  return (
    <div className="backdrop-blur-3xl bg-slate-900/35 dark:bg-slate-900/35 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] border border-white/15 dark:border-white/10 transition-all duration-500">
      <h3 className="text-base sm:text-xl font-black mb-3 sm:mb-4 text-white tracking-tight">{title}</h3>
      <div className="h-[280px] sm:h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 20, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.15} />
            <XAxis type="number" domain={[0, 'dataMax + 50']} stroke="#94a3b8" fontSize={11} />
            <YAxis type="category" dataKey="city" width={70} stroke="#94a3b8" fontSize={11} />
            <Tooltip
               contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(24px)', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '16px' }}
               itemStyle={{ color: '#fff' }}
            />
            <Bar dataKey="aqi" radius={[0, 8, 8, 0]}>
              {data.map((entry, index) => (
                <Bar
                  key={`cell-${index}`}
                  fill={entry.aqi > 200 ? '#ef4444' : (entry.aqi > 100 ? '#f97316' : '#10b981')}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
