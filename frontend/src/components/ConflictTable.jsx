import React from 'react';
import { AlertTriangle, CheckCircle, AlertOctagon, ArrowRight, Sparkles, RefreshCw, BookOpen, ShieldCheck } from 'lucide-react';

export default function ConflictTable({ result, onApplyCorrection, isReanalyzing }) {
  if (!result) return null;

  const { conflicts = [], explanations = [], suggestedCalendar, reference } = result;

  const hasConflicts = conflicts.some(c => c.status !== 'Compatible');

  return (
    <div className="space-y-6">
      
      {/* 1. Field-Specific Conflict Identification Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/40 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center space-x-2.5">
              <span>Cultivation Stage Conflict Analysis</span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-black ${
                hasConflicts ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
              }`}>
                {conflicts.filter(c => c.status !== 'Compatible').length} Issues Detected
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Comparison between farmer-submitted dates and verified regional reference agronomy ({reference?.sourceName || 'BRRI / BAMIS'}).
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 uppercase font-black text-[10px] tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-5">Cultivation Stage</th>
                <th className="py-3.5 px-5">Farmer Proposed Input</th>
                <th className="py-3.5 px-5">Regional Reference Standard</th>
                <th className="py-3.5 px-5">Assessment Status</th>
                <th className="py-3.5 px-5 text-right">Deviation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {conflicts.map((item, idx) => {
                const isComp = item.status === 'Compatible';
                const isSevere = item.status?.includes('High') || item.severity === 'danger';
                
                return (
                  <tr key={idx} className="hover:bg-slate-50/70 transition duration-150">
                    <td className="py-4 px-5 font-black text-slate-900">
                      {item.field}
                    </td>
                    <td className="py-4 px-5 font-bold text-slate-800">
                      {item.submitted}
                    </td>
                    <td className="py-4 px-5 text-slate-600">
                      {item.reference}
                    </td>
                    <td className="py-4 px-5">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full font-bold text-[11px] shadow-2xs ${
                        isComp ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                        isSevere ? 'bg-rose-50 text-rose-800 border border-rose-200' :
                        'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}>
                        {isComp ? <CheckCircle className="w-3.5 h-3.5 mr-1.5 text-emerald-600" /> : <AlertTriangle className="w-3.5 h-3.5 mr-1.5 text-amber-600" />}
                        {item.status}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-right font-mono font-bold text-slate-800">
                      {item.deviationDays > 0 ? (
                        <span className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                          +{item.deviationDays} days
                        </span>
                      ) : (
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          0 days
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Explainable Agronomic Insights */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/40 p-6">
        <h3 className="text-base font-black text-slate-900 flex items-center space-x-2.5 mb-4">
          <span className="p-1.5 rounded-xl bg-emerald-100 text-emerald-800">
            <BookOpen className="w-4 h-4 stroke-[2.5]" />
          </span>
          <span>Agronomic Explanation & Impact Assessment</span>
        </h3>
        <div className="space-y-3">
          {explanations.map((exp, i) => (
            <div key={i} className="flex items-start space-x-3 text-xs text-slate-700 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100">
              <span className="text-emerald-600 font-black mt-0.5 text-base leading-none">•</span>
              <p className="leading-relaxed font-medium">{exp}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Reference-Aligned Suggested Calendar Correction (Stunning Glowing Emerald Card) */}
      {suggestedCalendar && (
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 text-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-emerald-500/30">
          
          {/* Subtle background ambient blur */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div>
              <div className="flex items-center space-x-2">
                <span className="p-2 bg-emerald-500 text-slate-950 font-black rounded-xl shadow-md">
                  <Sparkles className="w-4 h-4" />
                </span>
                <h3 className="text-lg font-black text-white tracking-tight">Suggested Reference-Aligned Calendar</h3>
              </div>
              <p className="text-xs text-emerald-200/90 mt-1.5 max-w-xl leading-relaxed">
                {suggestedCalendar.correctionReason}
              </p>
            </div>

            {hasConflicts && (
              <button
                onClick={() => onApplyCorrection(suggestedCalendar)}
                disabled={isReanalyzing}
                className="flex items-center justify-center space-x-2 px-6 py-3.5 bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 disabled:opacity-50 text-slate-950 rounded-2xl text-xs font-black shadow-lg shadow-emerald-500/30 transition-all duration-200 active:scale-95 flex-shrink-0 cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${isReanalyzing ? 'animate-spin' : ''}`} />
                <span>{isReanalyzing ? 'Calibrating & Re-analyzing...' : 'Apply Correction & Re-Analyze'}</span>
              </button>
            )}
          </div>

          {/* Suggested Dates Summary Pill Grid */}
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-5 text-xs">
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15">
              <span className="text-[10px] uppercase font-black tracking-wider text-emerald-300">Recommended Planting</span>
              <div className="font-extrabold text-white text-sm mt-1">{suggestedCalendar.plantingStart} → {suggestedCalendar.plantingEnd}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15">
              <span className="text-[10px] uppercase font-black tracking-wider text-emerald-300">Calibrated Growth Duration</span>
              <div className="font-extrabold text-white text-sm mt-1">{suggestedCalendar.growthDurationDays} days (optimal)</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15">
              <span className="text-[10px] uppercase font-black tracking-wider text-emerald-300">Recommended Harvest</span>
              <div className="font-extrabold text-white text-sm mt-1">{suggestedCalendar.harvestStart} → {suggestedCalendar.harvestEnd}</div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
