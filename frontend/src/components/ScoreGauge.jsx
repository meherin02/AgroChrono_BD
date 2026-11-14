import React from 'react';
import { ShieldCheck, AlertTriangle, AlertOctagon, CheckCircle2, CloudSun, Calendar, Clock, Gauge } from 'lucide-react';

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

  // Color calculation
  const getScoreColor = (s) => {
    if (s >= 85) return 'from-emerald-500 to-green-600 text-emerald-700';
    if (s >= 70) return 'from-lime-500 to-emerald-600 text-lime-700';
    if (s >= 50) return 'from-amber-500 to-orange-500 text-amber-700';
    return 'from-rose-500 to-red-600 text-rose-700';
  };

  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDashoffset = circumference - (reliabilityScore / 100) * circumference;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 overflow-hidden">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-100">
        
        {/* Left: Circular Reliability Gauge */}
        <div className="flex items-center space-x-6">
          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                className="text-slate-100 stroke-current"
                strokeWidth="8"
                fill="transparent"
              />
              {/* Score circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                className={`transition-all duration-1000 ease-out ${
                  reliabilityScore >= 80 ? 'text-emerald-500' :
                  reliabilityScore >= 65 ? 'text-lime-500' :
                  reliabilityScore >= 50 ? 'text-amber-500' : 'text-rose-500'
                } stroke-current`}
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-extrabold tracking-tight text-slate-900">{reliabilityScore}</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">out of 100</span>
            </div>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${badgeClass}`}>
                {reliabilityScore >= 70 ? <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> : <AlertTriangle className="w-3.5 h-3.5 mr-1" />}
                {reliabilityCategory}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">Calendar Reliability Score</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Multi-factor assessment based on regional reference agronomy & weather.
            </p>

            {/* Assessment Completeness */}
            <div className="mt-3 flex items-center space-x-2">
              <span className="text-xs font-medium text-slate-500">Assessment Completeness:</span>
              <div className="w-24 bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                <div
                  className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${assessmentCompleteness}%` }}
                />
              </div>
              <span className="text-xs font-bold text-slate-700">{assessmentCompleteness}%</span>
            </div>
          </div>
        </div>

        {/* Right: ML Isolation Forest Screening Card */}
        <div className="w-full md:w-auto md:min-w-[280px] bg-slate-50 rounded-xl p-4 border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center">
              <Gauge className="w-3.5 h-3.5 mr-1 text-slate-600" />
              ML Anomaly Detection
            </span>
            <span className="text-[10px] bg-slate-200 text-slate-700 font-mono px-1.5 py-0.5 rounded">
              Isolation Forest
            </span>
          </div>

          <div className="mt-2.5">
            {anomalyDetected ? (
              <div className="flex items-start space-x-2 text-rose-700 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
                <AlertOctagon className="w-4 h-4 mt-0.5 flex-shrink-0 text-rose-600" />
                <div>
                  <div className="text-xs font-bold">Unusual Pattern Flagged</div>
                  <div className="text-[11px] text-rose-600 mt-0.5">
                    Calendar dates deviate from typical multi-variate agricultural distributions (Anomaly Score: {mlResult?.anomaly_score || 'N/A'}).
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-start space-x-2 text-emerald-800 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-emerald-600" />
                <div>
                  <div className="text-xs font-bold">Consistent Timeline Pattern</div>
                  <div className="text-[11px] text-emerald-700 mt-0.5">
                    No multi-dimensional anomalies detected across DOY, duration, and climate indicators.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Parameter Breakdown Grid */}
      <div className="mt-6">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Weighted Parameter Breakdown</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          
          {/* Planting */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex items-center justify-between text-xs text-slate-600 font-medium mb-1">
              <span className="flex items-center"><Calendar className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Planting</span>
              <span className="font-bold text-slate-900">{parameterScores.planting?.score || 0}/100</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
              <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${parameterScores.planting?.score || 0}%` }} />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>Weight: {Math.round((parameterScores.planting?.weight || 0.3) * 100)}%</span>
              <span className="font-semibold text-slate-600">+{parameterScores.planting?.contribution || 0} pts</span>
            </div>
          </div>

          {/* Growth */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex items-center justify-between text-xs text-slate-600 font-medium mb-1">
              <span className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1 text-blue-600" /> Growth</span>
              <span className="font-bold text-slate-900">{parameterScores.growth?.score || 0}/100</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
              <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${parameterScores.growth?.score || 0}%` }} />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>Weight: {Math.round((parameterScores.growth?.weight || 0.2) * 100)}%</span>
              <span className="font-semibold text-slate-600">+{parameterScores.growth?.contribution || 0} pts</span>
            </div>
          </div>

          {/* Harvest */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex items-center justify-between text-xs text-slate-600 font-medium mb-1">
              <span className="flex items-center"><Calendar className="w-3.5 h-3.5 mr-1 text-amber-600" /> Harvest</span>
              <span className="font-bold text-slate-900">{parameterScores.harvest?.score || 0}/100</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
              <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${parameterScores.harvest?.score || 0}%` }} />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>Weight: {Math.round((parameterScores.harvest?.weight || 0.25) * 100)}%</span>
              <span className="font-semibold text-slate-600">+{parameterScores.harvest?.contribution || 0} pts</span>
            </div>
          </div>

          {/* Weather */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex items-center justify-between text-xs text-slate-600 font-medium mb-1">
              <span className="flex items-center"><CloudSun className="w-3.5 h-3.5 mr-1 text-cyan-600" /> Weather</span>
              <span className="font-bold text-slate-900">{parameterScores.weather?.score || 0}/100</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
              <div className="bg-cyan-500 h-1.5 rounded-full" style={{ width: `${parameterScores.weather?.score || 0}%` }} />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>Weight: {Math.round((parameterScores.weather?.weight || 0.25) * 100)}%</span>
              <span className="font-semibold text-slate-600">+{parameterScores.weather?.contribution || 0} pts</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
