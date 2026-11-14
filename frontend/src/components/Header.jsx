import React, { useState } from 'react';
import { Sprout, Printer, History, Globe, Sparkles, Database, CheckCircle2, Server, ExternalLink, X } from 'lucide-react';

export default function Header({
  systemHealth,
  onOpenHistory,
  historyCount,
  onLoadPreset,
  language,
  onToggleLanguage,
  t
}) {
  const [showDbModal, setShowDbModal] = useState(false);
  const isMlOnline = systemHealth?.mlMicroservice?.status === 'healthy';
  const dbStatus = systemHealth?.database;

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <header className="bg-white/85 backdrop-blur-xl border-b border-emerald-900/10 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo & Brand */}
            <div className="flex items-center space-x-3.5">
              <div className="relative group cursor-pointer">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl blur-xs opacity-75 group-hover:opacity-100 transition duration-300"></div>
                <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-700 via-emerald-600 to-green-500 flex items-center justify-center text-white shadow-md">
                  <Sprout className="w-5 h-5 stroke-[2.4]" />
                </div>
              </div>

              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xl font-extrabold tracking-tight text-slate-900">
                    Agro<span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Chrono</span>
                    <span className="text-emerald-700 font-black">{t.appSuffix}</span>
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100/80 text-emerald-900 border border-emerald-300/50 shadow-2xs">
                    🇧🇩 {t.targetCountry}
                  </span>
                </div>
                <p className="text-[11px] font-medium text-slate-500 hidden sm:block truncate max-w-sm">
                  {t.tagline}
                </p>
              </div>
            </div>

            {/* Presets & Controls */}
            <div className="flex items-center space-x-2">
              
              {/* Quick Presets (desktop) */}
              <div className="hidden xl:flex items-center space-x-1.5 bg-slate-100/70 p-1 rounded-xl border border-slate-200/80 text-xs font-medium text-slate-600">
                <span className="px-2 text-slate-400 font-bold uppercase text-[9px] flex items-center tracking-wider">
                  <Sparkles className="w-3 h-3 mr-1 text-emerald-600 animate-pulse" /> {t.presets}:
                </span>
                <button
                  onClick={() => onLoadPreset('ideal')}
                  className="px-2.5 py-1 bg-white hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 rounded-lg shadow-2xs transition font-semibold text-[11px] border border-transparent"
                >
                  {t.presetIdeal}
                </button>
                <button
                  onClick={() => onLoadPreset('conflict')}
                  className="px-2.5 py-1 bg-white hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200 rounded-lg shadow-2xs transition font-semibold text-[11px] border border-transparent"
                >
                  {t.presetConflict}
                </button>
                <button
                  onClick={() => onLoadPreset('anomaly')}
                  className="px-2.5 py-1 bg-white hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 rounded-lg shadow-2xs transition font-semibold text-[11px] border border-transparent"
                >
                  {t.presetAnomaly}
                </button>
              </div>

              {/* MongoDB Status Pill (Interactive Modal trigger) */}
              <button
                onClick={() => setShowDbModal(true)}
                className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100/80 text-emerald-800 border border-emerald-200/80 text-xs font-bold transition shadow-2xs group"
                title="Click to view MongoDB connection details"
              >
                <Database className="w-3.5 h-3.5 text-emerald-600 group-hover:scale-110 transition" />
                <span className="text-[11px] hidden md:inline">MongoDB: Connected</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              </button>

              {/* Microservice health pill */}
              <div className="flex items-center space-x-1.5 bg-slate-100/80 px-2.5 py-1.5 rounded-full border border-slate-200/80 text-xs">
                <span className={`w-2 h-2 rounded-full ${isMlOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                <span className="font-semibold text-slate-700 hidden sm:inline text-[11px]">
                  {isMlOnline ? t.mlStatusOnline : t.mlStatusOffline}
                </span>
              </div>

              {/* Language Switcher */}
              <button
                onClick={onToggleLanguage}
                className="flex items-center space-x-1 px-2.5 py-1.5 bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 border border-emerald-200/60 rounded-xl text-xs font-bold text-emerald-800 transition shadow-2xs active:scale-95"
                title="Toggle English / বাংলা"
              >
                <Globe className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t.langToggle}</span>
              </button>

              {/* Print / Export Report Button */}
              <button
                onClick={handlePrint}
                className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-2xs transition active:scale-95"
                title="Print or save as PDF"
              >
                <Printer className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-[11px]">{t.printReport}</span>
              </button>

              {/* History Button */}
              <button
                onClick={onOpenHistory}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-slate-900/20 transition active:scale-95"
              >
                <History className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline text-[11px]">{t.historyBtn}</span>
                {historyCount > 0 && (
                  <span className="ml-1 bg-emerald-500 text-slate-950 font-black px-1.5 py-0.2 rounded-full text-[10px]">
                    {historyCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* MongoDB Connection Modal */}
      {showDbModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-scale-in">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">MongoDB Integration Architecture</h3>
                  <span className="text-xs text-emerald-600 font-semibold flex items-center">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Active Mongoose Connection
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowDbModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3.5 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                <div className="text-slate-400 uppercase font-bold text-[10px] tracking-wider mb-1">Database Engine</div>
                <div className="font-bold text-slate-900 text-sm flex items-center justify-between">
                  <span>{dbStatus?.provider || 'MongoDB (Mongoose ODM)'}</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    {dbStatus?.mode || 'Active'}
                  </span>
                </div>
                <div className="text-slate-500 mt-1 font-mono text-[11px] truncate">
                  URI: {dbStatus?.uri || 'Local Mongoose Storage Engine'}
                </div>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                <div className="text-slate-400 uppercase font-bold text-[10px] tracking-wider mb-2">Registered Mongoose Schemas & Collections</div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-2xs">
                    <span className="font-bold text-slate-800 block text-xs">submissions</span>
                    <span className="text-[10px] text-slate-400">Farmer Inputs</span>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-2xs">
                    <span className="font-bold text-slate-800 block text-xs">analysisresults</span>
                    <span className="text-[10px] text-slate-400">ML & Scoring</span>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-2xs">
                    <span className="font-bold text-slate-800 block text-xs">referencecalendars</span>
                    <span className="text-[10px] text-slate-400">BAMIS/BRRI</span>
                  </div>
                </div>
              </div>

              <div className="bg-emerald-50/60 p-3.5 rounded-2xl border border-emerald-200/80 text-emerald-900">
                <span className="font-bold text-xs block mb-1">💡 Cloud MongoDB Atlas Ready</span>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  You can connect your production MongoDB Atlas cluster anytime by setting <code className="bg-white/80 px-1 py-0.5 rounded font-mono text-[10px]">MONGODB_URI</code> inside <code className="bg-white/80 px-1 py-0.5 rounded font-mono text-[10px]">backend/.env</code>. The backend connects and synchronizes models automatically on boot.
                </p>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setShowDbModal(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
