import React from 'react';
import { AlertTriangle, CheckCircle, AlertOctagon, ArrowRight, Sparkles, RefreshCw, BookOpen } from 'lucide-react';

export default function ConflictTable({ result, onApplyCorrection, isReanalyzing }) {
  if (!result) return null;

  const { conflicts = [], explanations = [], suggestedCalendar, reference } = result;

  const hasConflicts = conflicts.some(c => c.status !== 'Compatible');

  return (
    <div className="space-y-6">
      
      {/* 1. Field-Specific Conflict Identification Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <span>Cultivation Stage Conflict Analysis</span>
              <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-semibold">
                {conflicts.filter(c => c.status !== 'Compatible').length} Issues Detected
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Comparison between farmer-submitted dates and verified regional reference agronomy ({reference?.sourceName || 'BRRI/BAMIS'}).
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[11px] border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Cultivation Stage</th>
                <th className="py-3 px-4">Submitted Input</th>
                <th className="py-3 px-4">Regional Reference Standard</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Deviation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {conflicts.map((item, idx) => {
                const isComp = item.status === 'Compatible';
                const isSevere = item.status?.includes('High') || item.severity === 'danger';
                
                return (
                  <tr key={idx} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {item.field}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">
                      {item.submitted}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {item.reference}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-semibold text-[11px] ${
                        isComp ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        isSevere ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                        'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {isComp ? <CheckCircle className="w-3 h-3 mr-1" /> : <AlertTriangle className="w-3 h-3 mr-1" />}
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-medium text-slate-700">
                      {item.deviationDays > 0 ? `+${item.deviationDays} days` : '0 days'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Explainable Agronomic Insights */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2 mb-3">
          <BookOpen className="w-4 h-4 text-emerald-600" />
          <span>Agronomic Explanation & Impact Assessment</span>
        </h3>
        <div className="space-y-2.5">
          {explanations.map((exp, i) => (
            <div key={i} className="flex items-start space-x-2.5 text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-emerald-600 font-bold mt-0.5">•</span>
              <p className="leading-relaxed">{exp}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Reference-Aligned Suggested Calendar Correction */}
      {suggestedCalendar && (
        <div className="bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent rounded-2xl border border-emerald-200 p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="p-1.5 bg-emerald-600 text-white rounded-lg">
                  <Sparkles className="w-4 h-4" />
                </span>
                <h3 className="text-base font-bold text-slate-900">Suggested Reference-Aligned Calendar</h3>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                {suggestedCalendar.correctionReason}
              </p>
            </div>

            {hasConflicts && (
              <button
                onClick={() => onApplyCorrection(suggestedCalendar)}
                disabled={isReanalyzing}
                className="flex items-center justify-center space-x-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition active:scale-95 flex-shrink-0"
              >
                <RefreshCw className={`w-4 h-4 ${isReanalyzing ? 'animate-spin' : ''}`} />
                <span>{isReanalyzing ? 'Re-analyzing...' : 'Apply Correction & Re-Analyze'}</span>
              </button>
            )}
          </div>

          {/* Suggested Dates Summary Pill Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 text-xs">
            <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-slate-400">Recommended Planting</span>
              <div className="font-bold text-slate-900 mt-0.5">{suggestedCalendar.plantingStart} → {suggestedCalendar.plantingEnd}</div>
            </div>
            <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-slate-400">Calibrated Growth Duration</span>
              <div className="font-bold text-slate-900 mt-0.5">{suggestedCalendar.growthDurationDays} days (optimal)</div>
            </div>
            <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-slate-400">Recommended Harvest</span>
              <div className="font-bold text-slate-900 mt-0.5">{suggestedCalendar.harvestStart} → {suggestedCalendar.harvestEnd}</div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
