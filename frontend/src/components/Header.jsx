import React from 'react';
import { Sprout, Printer, History, Globe, Sparkles } from 'lucide-react';

export default function Header({
  systemHealth,
  onOpenHistory,
  historyCount,
  onLoadPreset,
  language,
  onToggleLanguage,
  t
}) {
  const isMlOnline = systemHealth?.mlMicroservice?.status === 'healthy';

  const handlePrint = () => {
    window.print();
  };

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 ring-2 ring-emerald-500/20">
              <Sprout className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight text-slate-900">
                  {t.appName}<span className="text-emerald-600">{t.appSuffix}</span>
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                  {t.targetCountry}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block truncate max-w-sm">
                {t.tagline}
              </p>
            </div>
          </div>

          {/* Presets & Controls */}
          <div className="flex items-center space-x-2.5">
            {/* Quick Presets (desktop) */}
            <div className="hidden xl:flex items-center space-x-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200 text-xs font-medium text-slate-600">
              <span className="px-2 text-slate-400 font-semibold uppercase text-[10px] flex items-center">
                <Sparkles className="w-3 h-3 mr-1 text-emerald-600" /> {t.presets}:
              </span>
              <button
                onClick={() => onLoadPreset('ideal')}
                className="px-2.5 py-1 bg-white hover:bg-emerald-50 hover:text-emerald-700 rounded-lg shadow-2xs transition"
              >
                {t.presetIdeal}
              </button>
              <button
                onClick={() => onLoadPreset('conflict')}
                className="px-2.5 py-1 bg-white hover:bg-amber-50 hover:text-amber-700 rounded-lg shadow-2xs transition"
              >
                {t.presetConflict}
              </button>
              <button
                onClick={() => onLoadPreset('anomaly')}
                className="px-2.5 py-1 bg-white hover:bg-rose-50 hover:text-rose-700 rounded-lg shadow-2xs transition"
              >
                {t.presetAnomaly}
              </button>
            </div>

            {/* Microservice health pill */}
            <div className="flex items-center space-x-1.5 bg-slate-100/80 px-2.5 py-1.5 rounded-full border border-slate-200 text-xs">
              <span className={`w-2 h-2 rounded-full ${isMlOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <span className="font-medium text-slate-700 hidden sm:inline text-[11px]">
                {isMlOnline ? t.mlStatusOnline : t.mlStatusOffline}
              </span>
            </div>

            {/* Language Switcher */}
            <button
              onClick={onToggleLanguage}
              className="flex items-center space-x-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-bold text-slate-700 transition"
              title="Toggle English / বাংলা"
            >
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <span>{t.langToggle}</span>
            </button>

            {/* Print / Export Report Button */}
            <button
              onClick={handlePrint}
              className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-2xs transition"
              title="Print or save as PDF"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>{t.printReport}</span>
            </button>

            {/* History Button */}
            <button
              onClick={onOpenHistory}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition"
            >
              <History className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.historyBtn}</span>
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
