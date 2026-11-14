import React from 'react';
import { Calendar, Clock, CheckCircle2, AlertTriangle, ArrowRight, Layers, Sparkles } from 'lucide-react';

export default function TimelineVisualizer({ result, t }) {
  if (!result || !result.submission || !result.reference) return null;

  const { submission, reference } = result;

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

  const minDOY = Math.max(1, Math.min(pStartDOY, refPStart) - 15);
  const maxDOY = Math.min(365, Math.max(hEndDOY, refHEnd) + 15);
  const totalRange = Math.max(60, maxDOY - minDOY);

  const getPercent = (doy) => {
    const val = ((doy - minDOY) / totalRange) * 100;
    return Math.max(0, Math.min(100, val));
  };

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
    <div className="bg-gradient-to-br from-white via-white to-slate-50 rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/40 p-6 sm:p-7 overflow-hidden">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-100 gap-3">
        <div>
          <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
              <Clock className="w-4 h-4 stroke-[2.5]" />
            </span>
            <span>{t.timelineTitle}</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {t.timelineDesc}
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center space-x-3.5 text-xs font-bold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/80">
          <span className="flex items-center">
            <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 mr-1.5 shadow-2xs" />
            {t.planting}
          </span>
          <span className="flex items-center">
            <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 mr-1.5 shadow-2xs" />
            {t.growth}
          </span>
          <span className="flex items-center">
            <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 mr-1.5 shadow-2xs" />
            {t.harvest}
          </span>
        </div>
      </div>

      <div className="mt-6 space-y-7">
        
        {/* Track A: Farmer Proposed Schedule */}
        <div>
          <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-2.5">
            <span className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded-md bg-slate-900 text-white font-mono text-[10px] font-black">
                TRACK A
              </span>
              <span className="font-extrabold text-slate-900">{t.submittedTimeline}</span>
            </span>
            <span className="text-slate-500 font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded-md font-semibold">
              {submission.plantingStart} → {submission.harvestEnd}
            </span>
          </div>

          <div className="relative h-12 bg-slate-100/90 rounded-2xl overflow-hidden border border-slate-200 shadow-inner flex items-center p-1">
            {/* Planting Stage */}
            <div
              className="absolute h-9 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl flex items-center justify-center text-[11px] font-black text-white shadow-md shadow-emerald-500/25 transition-all hover:brightness-110 cursor-pointer"
              style={{
                left: `${getPercent(pStartDOY)}%`,
                width: `${Math.max(4, getPercent(pEndDOY) - getPercent(pStartDOY))}%`
              }}
              title={`Planting: ${submission.plantingStart} – ${submission.plantingEnd}`}
            >
              <span className="truncate px-1">Planting</span>
            </div>

            {/* Growth Stage */}
            <div
              className="absolute h-9 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-[11px] font-black text-white shadow-md shadow-blue-500/25 transition-all hover:brightness-110 cursor-pointer"
              style={{
                left: `${getPercent(gStartDOY)}%`,
                width: `${Math.max(6, getPercent(gEndDOY) - getPercent(gStartDOY))}%`
              }}
              title={`Vegetative Growth: ${submission.growthStart} – ${submission.growthEnd}`}
            >
              <span className="truncate px-1">Vegetative Growth Phase</span>
            </div>

            {/* Harvest Stage */}
            <div
              className="absolute h-9 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center text-[11px] font-black text-white shadow-md shadow-amber-500/25 transition-all hover:brightness-110 cursor-pointer"
              style={{
                left: `${getPercent(hStartDOY)}%`,
                width: `${Math.max(4, getPercent(hEndDOY) - getPercent(hStartDOY))}%`
              }}
              title={`Harvest: ${submission.harvestStart} – ${submission.harvestEnd}`}
            >
              <span className="truncate px-1">Harvest</span>
            </div>
          </div>
        </div>

        {/* Track B: Regional Reference Benchmark */}
        <div>
          <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-2.5">
            <span className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white font-mono text-[10px] font-black">
                TRACK B
              </span>
              <span className="font-extrabold text-emerald-950">
                {t.benchmarkTimeline} ({reference.sourceName})
              </span>
            </span>
            <span className="text-emerald-800 font-mono text-[11px] bg-emerald-50 px-2 py-0.5 rounded-md font-bold border border-emerald-200">
              Optimal: {reference.growthDurationDays?.typical || 125} days
            </span>
          </div>

          <div className="relative h-12 bg-emerald-50/40 rounded-2xl overflow-hidden border border-emerald-200 shadow-inner flex items-center p-1">
            {/* Reference Sowing Window */}
            <div
              className="absolute h-9 bg-emerald-600/20 border-2 border-emerald-600/60 rounded-xl flex items-center justify-center text-[11px] font-black text-emerald-950"
              style={{
                left: `${getPercent(refPStart)}%`,
                width: `${Math.max(5, getPercent(refPEnd) - getPercent(refPStart))}%`
              }}
              title={`Reference Planting Window: ${reference.plantingWindow?.label}`}
            >
              <span className="truncate px-1">Optimal Sowing</span>
            </div>

            {/* Reference Maturity Window */}
            <div
              className="absolute h-9 bg-blue-500/15 border-2 border-blue-500/50 rounded-xl flex items-center justify-center text-[11px] font-black text-blue-950"
              style={{
                left: `${getPercent(refGStart)}%`,
                width: `${Math.max(8, getPercent(refGEnd) - getPercent(refGStart))}%`
              }}
              title={`Reference Growth Window: ${reference.growthDurationDays?.min}–${reference.growthDurationDays?.max} days`}
            >
              <span className="truncate px-1">Standard Variety Maturity Window</span>
            </div>

            {/* Reference Harvest Window */}
            <div
              className="absolute h-9 bg-amber-500/20 border-2 border-amber-500/60 rounded-xl flex items-center justify-center text-[11px] font-black text-amber-950"
              style={{
                left: `${getPercent(refHStart)}%`,
                width: `${Math.max(5, getPercent(refHEnd) - getPercent(refHStart))}%`
              }}
              title={`Reference Harvest Window: ${reference.harvestWindow?.label}`}
            >
              <span className="truncate px-1">Optimal Harvest</span>
            </div>
          </div>
        </div>

        {/* Month Scale Bar */}
        <div className="pt-2 border-t border-slate-100 flex justify-between text-[11px] font-black text-slate-400 px-2 font-mono">
          {monthMarkers.map((m, i) => (
            <span key={i} className="flex flex-col items-center">
              <span className="w-0.5 h-2 bg-slate-300 rounded-full mb-1" />
              <span>{m.name}</span>
            </span>
          ))}
        </div>

      </div>
    </div>
  );
}
