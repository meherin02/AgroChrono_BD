import React from 'react';
import { CloudSun, Thermometer, Droplets, Info, CheckCircle2, AlertTriangle, Wind, Compass } from 'lucide-react';

export default function WeatherWidget({ weather }) {
  if (!weather) return null;

  const {
    meanTemperature = 28,
    minTemperature = 20,
    maxTemperature = 35,
    totalRainfall = 400,
    status = 'Compatible',
    score = 85,
    dataSource = 'Open-Meteo API',
    summary = 'Weather conditions within normal crop tolerance range.',
    note = ''
  } = weather;

  const isGood = status === 'Compatible';

  return (
    <div className="bg-gradient-to-br from-white via-white to-cyan-50/20 rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/40 p-6 sm:p-7 relative overflow-hidden">
      
      {/* Decorative ambient cyan glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16"></div>

      <div className="relative z-10 flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-600 to-sky-500 text-white shadow-xs">
            <CloudSun className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 tracking-tight">Agro-Climatic Weather Telemetry</h3>
            <span className="text-[11px] text-slate-500 font-medium">Open-Meteo Historical Archive & Climate Baseline</span>
          </div>
        </div>
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black border shadow-2xs ${
          isGood ? 'bg-cyan-50 text-cyan-800 border-cyan-200' : 'bg-amber-50 text-amber-800 border-amber-200'
        }`}>
          {isGood ? <CheckCircle2 className="w-3.5 h-3.5 mr-1 stroke-[2.5]" /> : <AlertTriangle className="w-3.5 h-3.5 mr-1 stroke-[2.5]" />}
          {status} ({score}%)
        </span>
      </div>

      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3.5 my-5">
        
        {/* Mean Temperature */}
        <div className="bg-gradient-to-br from-rose-50/60 to-white p-3.5 rounded-2xl border border-rose-100/90 shadow-2xs">
          <span className="text-[10px] font-black text-rose-800 uppercase flex items-center tracking-wider">
            <Thermometer className="w-3.5 h-3.5 mr-1 text-rose-600" /> Mean Temp
          </span>
          <span className="text-xl font-black text-slate-900 block mt-1">{meanTemperature}°C</span>
          <span className="text-[10px] text-slate-400 font-medium">Range {minTemperature}° – {maxTemperature}°C</span>
        </div>

        {/* Estimated Rainfall */}
        <div className="bg-gradient-to-br from-blue-50/60 to-white p-3.5 rounded-2xl border border-blue-100/90 shadow-2xs">
          <span className="text-[10px] font-black text-blue-800 uppercase flex items-center tracking-wider">
            <Droplets className="w-3.5 h-3.5 mr-1 text-blue-600" /> Total Moisture
          </span>
          <span className="text-xl font-black text-slate-900 block mt-1">{totalRainfall} mm</span>
          <span className="text-[10px] text-slate-400 font-medium">Seasonal cultivation sum</span>
        </div>

        {/* Data Source & Telemetry */}
        <div className="col-span-2 bg-gradient-to-br from-slate-50 to-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-center">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center">
            <Compass className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Telemetry Provenance
          </span>
          <span className="text-xs font-black text-slate-900 mt-0.5 truncate">{dataSource}</span>
          <span className="text-[10px] text-slate-500 font-medium line-clamp-1 mt-0.5">{note || 'Regional seasonal climate baseline'}</span>
        </div>

      </div>

      <div className="relative z-10 text-xs text-slate-700 bg-gradient-to-r from-cyan-50/70 to-sky-50/70 p-3.5 rounded-2xl border border-cyan-100 leading-relaxed flex items-start space-x-2.5 shadow-2xs">
        <Info className="w-4 h-4 text-cyan-600 flex-shrink-0 mt-0.5" />
        <span className="font-medium">{summary}</span>
      </div>
    </div>
  );
}
