import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Wheat, Sun, AlertCircle, ArrowRight, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function CalendarForm({ options, onSubmit, isAnalyzing, initialValues, onReset }) {
  const [formData, setFormData] = useState({
    crop: 'Rice',
    district: 'Rangpur',
    season: 'Aman',
    variety: 'BRRI dhan49',
    plantingStart: '2026-07-20',
    plantingEnd: '2026-07-30',
    growthStart: '2026-08-01',
    growthEnd: '2026-11-01',
    harvestStart: '2026-11-15',
    harvestEnd: '2026-11-30'
  });

  const [validationError, setValidationError] = useState('');

  // Update when initialValues changes (e.g. from preset or suggestion)
  useEffect(() => {
    if (initialValues) {
      setFormData(prev => ({
        ...prev,
        ...initialValues
      }));
    }
  }, [initialValues]);

  // Adjust available seasons when crop changes
  const selectedCropObj = options?.crops?.find(c => c.id === formData.crop);
  const availableSeasons = selectedCropObj?.seasons || ['Aman'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      // If crop changed, reset season to its first valid season
      if (name === 'crop') {
        const crop = options?.crops?.find(c => c.id === value);
        if (crop && !crop.seasons.includes(prev.season)) {
          updated.season = crop.seasons[0];
        }
      }
      return updated;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError('');

    // Pre-flight validation checks
    const pStart = new Date(formData.plantingStart);
    const pEnd = new Date(formData.plantingEnd);
    const gStart = new Date(formData.growthStart);
    const gEnd = new Date(formData.growthEnd);
    const hStart = new Date(formData.harvestStart);
    const hEnd = new Date(formData.harvestEnd);

    if (pStart > pEnd) {
      setValidationError('Planting start date cannot be later than planting end date.');
      return;
    }
    if (gStart > gEnd) {
      setValidationError('Growth phase start date cannot be later than growth end date.');
      return;
    }
    if (hStart > hEnd) {
      setValidationError('Harvest start date cannot be later than harvest end date.');
      return;
    }
    if (pStart > hStart) {
      setValidationError('Logical Sequence Error: Planting cannot begin after harvest begins.');
      return;
    }
    if (gStart < pStart) {
      setValidationError('Logical Sequence Error: Growth phase cannot begin before planting.');
      return;
    }

    onSubmit(formData);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-emerald-600" />
            <span>Farmer Cultivation Schedule Input</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Submit your proposed crop timeline for agro-ecological validation.
          </p>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
        >
          Reset
        </button>
      </div>

      {validationError && (
        <div className="mb-5 flex items-start space-x-2.5 bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
          <span>{validationError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Section 1: Basic Information */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">1. Basic Agricultural Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            
            {/* Crop */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Crop</label>
              <div className="relative">
                <select
                  name="crop"
                  value={formData.crop}
                  onChange={handleChange}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                >
                  {(options?.crops || []).map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* District */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">District</label>
              <select
                name="district"
                value={formData.district}
                onChange={handleChange}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
              >
                {(options?.districts || []).map(d => (
                  <option key={d.id} value={d.name}>{d.name} ({d.division})</option>
                ))}
              </select>
            </div>

            {/* Season */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Season</label>
              <select
                name="season"
                value={formData.season}
                onChange={handleChange}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
              >
                {availableSeasons.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Variety */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Crop Variety (Optional)</label>
              <input
                type="text"
                name="variety"
                value={formData.variety}
                onChange={handleChange}
                placeholder="e.g. BRRI dhan49"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
              />
            </div>

          </div>
        </div>

        {/* Section 2: Cultivation Stage Dates */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">2. Cultivation Timeline Schedule</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Planting Stage */}
            <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
              <span className="text-xs font-bold text-emerald-900 block mb-2">Stage 1: Planting / Sowing</span>
              <div className="space-y-2">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase">Start Date</label>
                  <input
                    type="date"
                    name="plantingStart"
                    value={formData.plantingStart}
                    onChange={handleChange}
                    required
                    className="w-full text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-800 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase">End Date</label>
                  <input
                    type="date"
                    name="plantingEnd"
                    value={formData.plantingEnd}
                    onChange={handleChange}
                    required
                    className="w-full text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-800 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Growth Stage */}
            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
              <span className="text-xs font-bold text-blue-900 block mb-2">Stage 2: Vegetative Growth</span>
              <div className="space-y-2">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase">Growth Start</label>
                  <input
                    type="date"
                    name="growthStart"
                    value={formData.growthStart}
                    onChange={handleChange}
                    required
                    className="w-full text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase">Growth End</label>
                  <input
                    type="date"
                    name="growthEnd"
                    value={formData.growthEnd}
                    onChange={handleChange}
                    required
                    className="w-full text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Harvest Stage */}
            <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100">
              <span className="text-xs font-bold text-amber-900 block mb-2">Stage 3: Harvest Window</span>
              <div className="space-y-2">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase">Harvest Start</label>
                  <input
                    type="date"
                    name="harvestStart"
                    value={formData.harvestStart}
                    onChange={handleChange}
                    required
                    className="w-full text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-800 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase">Harvest End</label>
                  <input
                    type="date"
                    name="harvestEnd"
                    value={formData.harvestEnd}
                    onChange={handleChange}
                    required
                    className="w-full text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-800 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2 flex items-center justify-end">
          <button
            type="submit"
            disabled={isAnalyzing}
            className="flex items-center space-x-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition active:scale-95"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Validating & Running ML Inference...</span>
              </>
            ) : (
              <>
                <span>Validate & Analyze Crop Calendar</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
