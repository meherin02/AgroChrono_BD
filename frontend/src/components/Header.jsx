import React from 'react';
import { Sprout, Cpu, Database, History, Activity, ShieldCheck } from 'lucide-react';

export default function Header({ systemHealth, onOpenHistory, historyCount, onLoadPreset }) {
  const isHealthy = systemHealth?.status === 'ok';
  const isMlOnline = systemHealth?.mlMicroservice?.status === 'healthy';

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Sprout className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight text-slate-900">AgroChrono<span className="text-emerald-600">-BD</span></span>
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">Bangladesh</span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">AI/ML Crop-Calendar Reliability & Conflict Decision Support</p>
            </div>
          </div>

          {/* Quick Presets & Status */}
          <div className="flex items-center space-x-3">
            <div className="hidden lg:flex items-center space-x-2 bg-slate-50 p-1 rounded-lg border border-slate-200 text-xs font-medium text-slate-600">
              <span className="px-2 text-slate-400 font-semibold uppercase text-[10px]">Presets:</span>
              <button
                onClick={() => onLoadPreset('ideal')}
                className="px-2.5 py-1 bg-white hover:bg-emerald-50 hover:text-emerald-700 rounded shadow-xs transition"
              >
                🌾 Ideal Aman (Rangpur)
              </button>
              <button
                onClick={() => onLoadPreset('conflict')}
                className="px-2.5 py-1 bg-white hover:bg-amber-50 hover:text-amber-700 rounded shadow-xs transition"
              >
                ⚠️ Delayed Conflict
              </button>
              <button
                onClick={() => onLoadPreset('anomaly')}
                className="px-2.5 py-1 bg-white hover:bg-rose-50 hover:text-rose-700 rounded shadow-xs transition"
              >
                🚨 ML Anomaly Sample
              </button>
            </div>

            {/* Microservice health pill */}
            <div className="flex items-center space-x-1.5 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200 text-xs">
              <span className={`w-2 h-2 rounded-full ${isMlOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <span className="font-medium text-slate-700 hidden sm:inline">
                {isMlOnline ? 'ML Online (FastAPI)' : 'ML Offline'}
              </span>
            </div>

            {/* History Button */}
            <button
              onClick={onOpenHistory}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition"
            >
              <History className="w-4 h-4" />
              <span>History</span>
              {historyCount > 0 && (
                <span className="ml-1 bg-emerald-500 text-slate-950 font-bold px-1.5 py-0.2 rounded-full text-[10px]">
                  {historyCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
