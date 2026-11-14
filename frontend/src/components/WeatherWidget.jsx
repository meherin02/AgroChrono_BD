import React from 'react';
import { CloudSun, Thermometer, Droplets, Info, CheckCircle2, AlertTriangle } from 'lucide-react';

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
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <CloudSun className="w-5 h-5 text-cyan-600" />
          <h3 className="text-sm font-bold text-slate-900">Agro-Climatic Weather Context</h3>
        </div>
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold border ${
          isGood ? 'bg-cyan-50 text-cyan-800 border-cyan-200' : 'bg-amber-50 text-amber-800 border-amber-200'
        }`}>
          {isGood ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <AlertTriangle className="w-3 h-3 mr-1" />}
          {status} ({score}%)
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
          <span className="text-[10px] font-semibold text-slate-400 uppercase flex items-center">
            <Thermometer className="w-3 h-3 mr-1 text-rose-500" /> Mean Temp
          </span>
          <span className="text-base font-extrabold text-slate-900 block mt-0.5">{meanTemperature}°C</span>
          <span className="text-[10px] text-slate-400">Min {minTemperature}° / Max {maxTemperature}°</span>
        </div>

        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
          <span className="text-[10px] font-semibold text-slate-400 uppercase flex items-center">
            <Droplets className="w-3 h-3 mr-1 text-blue-500" /> Est. Rainfall
          </span>
          <span className="text-base font-extrabold text-slate-900 block mt-0.5">{totalRainfall} mm</span>
          <span className="text-[10px] text-slate-400">Cultivation total</span>
        </div>

        <div className="col-span-2 bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col justify-center">
          <span className="text-[10px] font-semibold text-slate-400 uppercase">Telemetry Source</span>
          <span className="text-xs font-bold text-slate-800 mt-0.5 truncate">{dataSource}</span>
          <span className="text-[10px] text-slate-500 line-clamp-1">{note || 'Regional agricultural climate normal'}</span>
        </div>
      </div>

      <div className="text-xs text-slate-600 bg-cyan-50/50 p-3 rounded-xl border border-cyan-100 leading-relaxed flex items-start space-x-2">
        <Info className="w-4 h-4 text-cyan-600 flex-shrink-0 mt-0.5" />
        <span>{summary}</span>
      </div>
    </div>
  );
}
