import React from 'react';
import { Calendar, Clock, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

export default function TimelineVisualizer({ result, t }) {
  if (!result || !result.submission || !result.reference) return null;

  const { submission, reference } = result;

  // Convert dates to Day of Year (1 - 365)
  const getDOY = (dateStr) => {
    if (!dateStr) return 1;
    const d = new Date(dateStr);
    const start = new Date(d.getFullYear(), 0, 1);
    return Math.floor((d - start) / (1000 * 60 * 60 * 24)) + 1;
  };

  const pStartDOY = getDOY(submission.plantingStart);
  const pEndDOY = Math.max(pStartDOY + 2, getDOY(submission.plantingEnd));
  const gStartDOY = Math.max(pEndDOY, getDOY(submission.growthStart));
  const gEndDOY = Math.max(gStartDOY + 5, getDOY(submission.growthEnd));
  const hStartDOY = Math.max(gEndDOY, getDOY(submission.harvestStart));
  const hEndDOY = Math.max(hStartDOY + 3, getDOY(submission.harvestEnd));

  const refPStart = reference.plantingWindow?.startDOY || 195;
  const refPEnd = reference.plantingWindow?.endDOY || 235;
  const refHStart = reference.harvestWindow?.startDOY || 315;
  const refHEnd = reference.harvestWindow?.endDOY || 345;
  const refGStart = refPEnd;
  const refGEnd = refHStart;

  // Find min and max DOY across both for scale
  const minDOY = Math.max(1, Math.min(pStartDOY, refPStart) - 15);
  const maxDOY = Math.min(365, Math.max(hEndDOY, refHEnd) + 15);
  const totalRange = Math.max(60, maxDOY - minDOY);

  const getPercent = (doy) => {
    const val = ((doy - minDOY) / totalRange) * 100;
    return Math.max(0, Math.min(100, val));
  };

  // Month labels generator across range
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthMarkers = [
    { name: 'Jul', doy: 182 },
    { name: 'Aug', doy: 213 },
    { name: 'Sep', doy: 244 },
    { name: 'Oct', doy: 274 },
    { name: 'Nov', doy: 305 },
    { name: 'Dec', doy: 335 },
    { name: 'Jan', doy: 15 },
    { name: 'Feb', doy: 45 },
    { name: 'Mar', doy: 75 },
    { name: 'Apr', doy: 105 },
    { name: 'May', doy: 135 }
  ].filter(m => m.doy >= minDOY - 10 && m.doy <= maxDOY + 10);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <Clock className="w-4 h-4 text-emerald-600" />
            <span>{t.timelineTitle}</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {t.timelineDesc}
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center space-x-3 text-[11px] font-semibold text-slate-600">
          <span className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-1.5" /> Planting</span>
          <span className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 mr-1.5" /> Growth</span>
          <span className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 mr-1.5" /> Harvest</span>
        </div>
      </div>

      <div className="mt-6 space-y-6">
        
        {/* Timeline 1: Farmer Submitted */}
        <div>
          <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-2">
            <span className="flex items-center space-x-1.5">
              <span className="px-2 py-0.5 rounded bg-slate-900 text-white text-[10px]">A</span>
              <span>{t.submittedTimeline}</span>
            </span>
            <span className="text-slate-500 font-medium font-mono text-[11px]">
              {submission.plantingStart} → {submission.harvestEnd}
            </span>
          </div>

          <div className="relative h-10 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 flex items-center">
            {/* Planting bar */}
            <div
              className="absolute h-7 bg-emerald-500 hover:bg-emerald-600 rounded-lg flex items-center justify-center text-[10px] font-bold text-white shadow-xs transition"
              style={{
                left: `${getPercent(pStartDOY)}%`,
                width: `${Math.max(3, getPercent(pEndDOY) - getPercent(pStartDOY))}%`
              }}
              title={`Planting: ${submission.plantingStart} to ${submission.plantingEnd}`}
            >
              Plant
            </div>

            {/* Growth bar */}
            <div
              className="absolute h-7 bg-blue-500 hover:bg-blue-600 rounded-lg flex items-center justify-center text-[10px] font-bold text-white shadow-xs transition"
              style={{
                left: `${getPercent(gStartDOY)}%`,
                width: `${Math.max(4, getPercent(gEndDOY) - getPercent(gStartDOY))}%`
              }}
              title={`Growth: ${submission.growthStart} to ${submission.growthEnd}`}
            >
              Growth Phase
            </div>

            {/* Harvest bar */}
            <div
              className="absolute h-7 bg-amber-500 hover:bg-amber-600 rounded-lg flex items-center justify-center text-[10px] font-bold text-white shadow-xs transition"
              style={{
                left: `${getPercent(hStartDOY)}%`,
                width: `${Math.max(3, getPercent(hEndDOY) - getPercent(hStartDOY))}%`
              }}
              title={`Harvest: ${submission.harvestStart} to ${submission.harvestEnd}`}
            >
              Harvest
            </div>
          </div>
        </div>

        {/* Timeline 2: Reference Standard */}
        <div>
          <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-2">
            <span className="flex items-center space-x-1.5">
              <span className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px]">B</span>
              <span>{t.benchmarkTimeline} ({reference.sourceName})</span>
            </span>
            <span className="text-emerald-700 font-medium text-[11px]">
              {reference.plantingWindow?.label} • {reference.growthDurationDays?.min}–{reference.growthDurationDays?.max}d • {reference.harvestWindow?.label}
            </span>
          </div>

          <div className="relative h-10 bg-emerald-50/50 rounded-xl overflow-hidden border border-emerald-200/80 flex items-center">
            {/* Reference Planting Window */}
            <div
              className="absolute h-7 bg-emerald-600/30 border border-emerald-600/50 rounded-lg flex items-center justify-center text-[10px] font-bold text-emerald-900"
              style={{
                left: `${getPercent(refPStart)}%`,
                width: `${Math.max(4, getPercent(refPEnd) - getPercent(refPStart))}%`
              }}
            >
              Optimal Sowing
            </div>

            {/* Reference Growth Window */}
            <div
              className="absolute h-7 bg-blue-500/20 border border-blue-500/40 rounded-lg flex items-center justify-center text-[10px] font-bold text-blue-900"
              style={{
                left: `${getPercent(refGStart)}%`,
                width: `${Math.max(6, getPercent(refGEnd) - getPercent(refGStart))}%`
              }}
            >
              Maturity Window (~{reference.growthDurationDays?.typical}d)
            </div>

            {/* Reference Harvest Window */}
            <div
              className="absolute h-7 bg-amber-500/30 border border-amber-500/50 rounded-lg flex items-center justify-center text-[10px] font-bold text-amber-900"
              style={{
                left: `${getPercent(refHStart)}%`,
                width: `${Math.max(4, getPercent(refHEnd) - getPercent(refHStart))}%`
              }}
            >
              Optimal Harvest
            </div>
          </div>
        </div>

        {/* Month Scale Bar */}
        <div className="pt-2 border-t border-slate-100 flex justify-between text-[10px] font-semibold text-slate-400 px-1">
          {monthMarkers.map((m, i) => (
            <span key={i} className="flex flex-col items-center">
              <span className="w-0.5 h-1.5 bg-slate-300 mb-0.5" />
              <span>{m.name}</span>
            </span>
          ))}
        </div>

      </div>
    </div>
  );
}
