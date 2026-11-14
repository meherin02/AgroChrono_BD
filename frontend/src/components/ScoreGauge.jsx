import React from 'react';
import { ShieldCheck, AlertTriangle, AlertOctagon, CheckCircle2, CloudSun, Calendar, Clock, Gauge, Sparkles } from 'lucide-react';

export default function ScoreGauge({ result }) {
  if (!result) return null;

  const {
    reliabilityScore = 0,
    reliabilityCategory = 'Evaluating',
    badgeClass = '',
    assessmentCompleteness = 100,
    parameterScores = {},
    anomalyDetected = false,
    mlResult = {},
    weatherAssessment = {}
  } = result;

  const circumference = 2 * Math.PI * 46;
  const strokeDashoffset = circumference - (reliabilityScore / 100) * circumference;

  // Visual status config
  const isHigh = reliabilityScore >= 80;
  const isModerate = reliabilityScore >= 65 && reliabilityScore < 80;
  const isMarginal = reliabilityScore >= 50 && reliabilityScore < 65;

  const strokeGradientId = isHigh
    ? 'scoreGradientHigh'
    : isModerate
    ? 'scoreGradientMod'
    : isMarginal
    ? 'scoreGradientWarn'
    : 'scoreGradientDanger';

  return (
    <div className="bg-gradient-to-br from-white via-white to-emerald-50/20 rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/50 p-6 sm:p-7 relative overflow-hidden">
      
      {/* Decorative ambient background glows */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
      <div className="absolute bottom-0 left-0 w-60 h-60 bg-blue-400/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20"></div>

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8 pb-7 border-b border-slate-100">
        
        {/* Left: Glowing Circular Reliability Gauge */}
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-7 text-center sm:text-left">
          
          <div className="relative w-36 h-36 flex items-center justify-center flex-shrink-0">
            {/* Ambient circular glow */}
            <div className={`absolute inset-3 rounded-full blur-md opacity-30 ${
              isHigh ? 'bg-emerald-500' : isModerate ? 'bg-lime-500' : isMarginal ? 'bg-amber-500' : 'bg-rose-500'
            }`}></div>

            <svg className="w-full h-full transform -rotate-90 drop-shadow-sm" viewBox="0 0 106 106">
              <defs>
                <linearGradient id="scoreGradientHigh" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
                <linearGradient id="scoreGradientMod" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#84cc16" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
                <linearGradient id="scoreGradientWarn" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#ea580c" />
                </linearGradient>
                <linearGradient id="scoreGradientDanger" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f43f5e" />
                  <stop offset="100%" stopColor="#be123c" />
                </linearGradient>
              </defs>

              {/* Background Track */}
              <circle
                cx="53"
                cy="53"
                r="46"
                className="text-slate-100 stroke-current"
                strokeWidth="8"
                fill="transparent"
              />
              {/* Dynamic Value Ring */}
              <circle
                cx="53"
                cy="53"
                r="46"
                stroke={`url(#${strokeGradientId})`}
                strokeWidth="8.5"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
              />
            </svg>

            {/* Inner Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-black tracking-tight text-slate-900 leading-none">
                {reliabilityScore}
              </span>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mt-1">
                Score / 100
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-center sm:justify-start space-x-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black border shadow-2xs ${badgeClass}`}>
                {reliabilityScore >= 70 ? (
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 stroke-[2.5]" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 mr-1.5 stroke-[2.5]" />
                )}
                {reliabilityCategory}
              </span>
            </div>
            
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2 tracking-tight">
              Calendar Reliability Assessment
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-md leading-relaxed">
              Multi-factor agronomic validation benchmarking farmer proposal against regional agro-climatic requirements and weather telemetry.
            </p>

            {/* Assessment Completeness Indicator */}
            <div className="mt-3.5 flex items-center justify-center sm:justify-start space-x-2.5">
              <span className="text-xs font-bold text-slate-500">Completeness:</span>
              <div className="w-28 bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/80">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full transition-all duration-700"
                  style={{ width: `${assessmentCompleteness}%` }}
                />
              </div>
              <span className="text-xs font-black text-slate-800">{assessmentCompleteness}%</span>
            </div>
          </div>
        </div>

        {/* Right: AI/ML Anomaly Card */}
        <div className="w-full lg:w-80 bg-gradient-to-br from-slate-50 to-slate-100/80 rounded-2xl p-4.5 border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/60">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 flex items-center">
              <Gauge className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
              ML Anomaly Screening
            </span>
            <span className="text-[10px] bg-slate-900 text-white font-mono px-2 py-0.5 rounded-md font-bold">
              Isolation Forest
            </span>
          </div>

          <div className="mt-3">
            {anomalyDetected ? (
              <div className="bg-rose-50/90 border border-rose-200 p-3 rounded-xl text-rose-800 shadow-2xs">
                <div className="flex items-center space-x-2">
                  <AlertOctagon className="w-4 h-4 text-rose-600 flex-shrink-0 animate-bounce" />
                  <span className="text-xs font-black">Unusual Pattern Detected</span>
                </div>
                <p className="text-[11px] text-rose-700 mt-1 leading-relaxed">
                  Timeline features deviate from typical multi-variate regional distributions (Anomaly Score: <strong>{mlResult?.anomaly_score || 'N/A'}</strong>).
                </p>
              </div>
            ) : (
              <div className="bg-emerald-50/90 border border-emerald-200 p-3 rounded-xl text-emerald-900 shadow-2xs">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span className="text-xs font-black">Normal Pattern Confirmed</span>
                </div>
                <p className="text-[11px] text-emerald-800 mt-1 leading-relaxed">
                  Cultivation timeline features align smoothly with standard training baseline parameters.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Weighted Parameter Breakdown Grid with Vibrant Colors */}
      <div className="mt-6">
        <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3.5 flex items-center">
          <Sparkles className="w-3 h-3 mr-1 text-emerald-600" />
          Weighted Parameter Score Distribution
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          
          {/* Planting (30%) */}
          <div className="p-3.5 bg-gradient-to-br from-emerald-50/60 to-white rounded-2xl border border-emerald-100/90 shadow-2xs">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
              <span className="flex items-center text-emerald-800">
                <Calendar className="w-3.5 h-3.5 mr-1.5 text-emerald-600" /> Planting
              </span>
              <span className="font-black text-slate-900">{parameterScores.planting?.score || 0}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-green-500 h-2 rounded-full transition-all duration-700"
                style={{ width: `${parameterScores.planting?.score || 0}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 mt-1.5 font-medium">
              <span>Weight: {Math.round((parameterScores.planting?.weight || 0.3) * 100)}%</span>
              <span className="font-bold text-emerald-700">+{parameterScores.planting?.contribution || 0} pts</span>
            </div>
          </div>

          {/* Growth Duration (20%) */}
          <div className="p-3.5 bg-gradient-to-br from-blue-50/60 to-white rounded-2xl border border-blue-100/90 shadow-2xs">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
              <span className="flex items-center text-blue-800">
                <Clock className="w-3.5 h-3.5 mr-1.5 text-blue-600" /> Growth Duration
              </span>
              <span className="font-black text-slate-900">{parameterScores.growth?.score || 0}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-700"
                style={{ width: `${parameterScores.growth?.score || 0}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 mt-1.5 font-medium">
              <span>Weight: {Math.round((parameterScores.growth?.weight || 0.2) * 100)}%</span>
              <span className="font-bold text-blue-700">+{parameterScores.growth?.contribution || 0} pts</span>
            </div>
          </div>

          {/* Harvest (25%) */}
          <div className="p-3.5 bg-gradient-to-br from-amber-50/60 to-white rounded-2xl border border-amber-100/90 shadow-2xs">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
              <span className="flex items-center text-amber-800">
                <Calendar className="w-3.5 h-3.5 mr-1.5 text-amber-600" /> Harvest Window
              </span>
              <span className="font-black text-slate-900">{parameterScores.harvest?.score || 0}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-500 to-yellow-500 h-2 rounded-full transition-all duration-700"
                style={{ width: `${parameterScores.harvest?.score || 0}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 mt-1.5 font-medium">
              <span>Weight: {Math.round((parameterScores.harvest?.weight || 0.25) * 100)}%</span>
              <span className="font-bold text-amber-700">+{parameterScores.harvest?.contribution || 0} pts</span>
            </div>
          </div>

          {/* Weather (25%) */}
          <div className="p-3.5 bg-gradient-to-br from-cyan-50/60 to-white rounded-2xl border border-cyan-100/90 shadow-2xs">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
              <span className="flex items-center text-cyan-800">
                <CloudSun className="w-3.5 h-3.5 mr-1.5 text-cyan-600" /> Weather Context
              </span>
              <span className="font-black text-slate-900">{parameterScores.weather?.score || 0}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-cyan-500 to-sky-500 h-2 rounded-full transition-all duration-700"
                style={{ width: `${parameterScores.weather?.score || 0}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 mt-1.5 font-medium">
              <span>Weight: {Math.round((parameterScores.weather?.weight || 0.25) * 100)}%</span>
              <span className="font-bold text-cyan-700">+{parameterScores.weather?.contribution || 0} pts</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
