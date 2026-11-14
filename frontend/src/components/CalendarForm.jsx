import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Wheat, Sun, AlertCircle, ArrowRight, RefreshCw, CheckCircle2, Sparkles, Layers } from 'lucide-react';

export default function CalendarForm({ options, onSubmit, isAnalyzing, initialValues, onReset, t }) {
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

  useEffect(() => {
    if (initialValues) {
      setFormData(prev => ({
        ...prev,
        ...initialValues
      }));
    }
  }, [initialValues]);

  const selectedCropObj = options?.crops?.find(c => c.id === formData.crop);
  const availableSeasons = selectedCropObj?.seasons || ['Aman'];

  const popularVarieties = {
    'Rice-Aman': ['BRRI dhan49', 'BRRI dhan75', 'BRRI dhan87', 'Swarna'],
    'Rice-Boro': ['BRRI dhan28', 'BRRI dhan29', 'BRRI dhan89', 'BRRI dhan92'],
    'Rice-Aus': ['BRRI dhan48', 'BRRI dhan82', 'Parija'],
    'Wheat-Rabi': ['BARI Gom-25', 'BARI Gom-30', 'BARI Gom-33'],
    'Potato-Rabi': ['Diamant', 'Cardinal', 'Asterix'],
    'Mustard-Rabi': ['BARI Sarisha-14', 'BARI Sarisha-17']
  };

  const currentVarieties = popularVarieties[`${formData.crop}-${formData.season}`] || [];

  const handleCropSelect = (cropId) => {
    const crop = options?.crops?.find(c => c.id === cropId);
    setFormData(prev => ({
      ...prev,
      crop: cropId,
      season: crop?.seasons[0] || 'Aman'
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
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

  // Crop styling configuration
  const cropIcons = {
    Rice: '🌾',
    Wheat: '🌱',
    Potato: '🥔',
    Mustard: '🌼'
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/40 p-6 sm:p-7 relative">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-5 border-b border-slate-100 mb-6">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center space-x-2.5 tracking-tight">
            <span className="p-2 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-500 text-white shadow-xs">
              <Calendar className="w-5 h-5" />
            </span>
            <span>{t.formTitle}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {t.formDesc}
          </p>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="text-xs font-bold text-slate-600 hover:text-slate-900 transition px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-200/80 active:scale-95"
        >
          {t.reset}
        </button>
      </div>

      {validationError && (
        <div className="mb-6 flex items-start space-x-3 bg-rose-50 border border-rose-300 text-rose-800 p-4 rounded-2xl text-xs font-semibold shadow-sm animate-shake">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
          <span>{validationError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Section 1: Visual Crop Selector Tabs */}
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3 flex items-center">
            <Layers className="w-3.5 h-3.5 mr-1 text-emerald-600" />
            {t.sec1}: Crop & Location
          </h3>

          {/* Crop Selector Segmented Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {(options?.crops || []).map(c => {
              const isSelected = formData.crop === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleCropSelect(c.id)}
                  className={`p-3 rounded-2xl border text-left transition duration-200 flex items-center space-x-3 ${
                    isSelected
                      ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white border-emerald-600 shadow-md shadow-emerald-600/25 ring-2 ring-emerald-500/30'
                      : 'bg-slate-50/80 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  <span className="text-2xl">{cropIcons[c.id] || '🌾'}</span>
                  <div>
                    <span className="font-extrabold text-xs block leading-tight">{c.name}</span>
                    <span className={`text-[10px] block ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                      {c.seasons.join(', ')}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* District */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center">
                <MapPin className="w-3.5 h-3.5 mr-1 text-emerald-600" /> {t.district}
              </label>
              <select
                name="district"
                value={formData.district}
                onChange={handleChange}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition shadow-2xs"
              >
                {(options?.districts || []).map(d => (
                  <option key={d.id} value={d.name}>{d.name} ({d.division} Division)</option>
                ))}
              </select>
            </div>

            {/* Season */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center">
                <Sun className="w-3.5 h-3.5 mr-1 text-amber-500" /> {t.season}
              </label>
              <select
                name="season"
                value={formData.season}
                onChange={handleChange}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition shadow-2xs"
              >
                {availableSeasons.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Variety */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center">
                <Sparkles className="w-3.5 h-3.5 mr-1 text-purple-600" /> {t.variety}
              </label>
              <input
                type="text"
                name="variety"
                value={formData.variety}
                onChange={handleChange}
                placeholder="e.g. BRRI dhan49"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition shadow-2xs"
              />
            </div>
          </div>

          {/* Variety quick chips */}
          {currentVarieties.length > 0 && (
            <div className="mt-3 flex items-center space-x-1.5 flex-wrap gap-y-1 text-[11px]">
              <span className="text-slate-400 font-extrabold text-[10px] uppercase tracking-wider">Common Varieties:</span>
              {currentVarieties.map(v => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setFormData(p => ({ ...p, variety: v }))}
                  className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold transition active:scale-95 ${
                    formData.variety === v
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300 hover:text-emerald-700 hover:bg-emerald-50/50 shadow-2xs'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Section 2: Cultivation Stage Dates with Rich Color Panels */}
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3 flex items-center">
            <Calendar className="w-3.5 h-3.5 mr-1 text-emerald-600" />
            {t.sec2}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Stage 1: Planting (Emerald) */}
            <div className="bg-gradient-to-br from-emerald-50/80 to-emerald-100/30 p-4.5 rounded-2xl border border-emerald-200 shadow-2xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black text-emerald-950 flex items-center">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse" />
                  {t.stagePlanting}
                </span>
                <span className="text-[10px] font-extrabold bg-emerald-200/70 text-emerald-900 px-2 py-0.5 rounded-md">
                  Stage 1
                </span>
              </div>
              <div className="space-y-2.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">{t.startDate}</label>
                  <input
                    type="date"
                    name="plantingStart"
                    value={formData.plantingStart}
                    onChange={handleChange}
                    required
                    className="w-full text-xs bg-white border border-emerald-200 rounded-xl px-3 py-2 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-2xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">{t.endDate}</label>
                  <input
                    type="date"
                    name="plantingEnd"
                    value={formData.plantingEnd}
                    onChange={handleChange}
                    required
                    className="w-full text-xs bg-white border border-emerald-200 rounded-xl px-3 py-2 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-2xs"
                  />
                </div>
              </div>
            </div>

            {/* Stage 2: Growth (Blue/Indigo) */}
            <div className="bg-gradient-to-br from-blue-50/80 to-blue-100/30 p-4.5 rounded-2xl border border-blue-200 shadow-2xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black text-blue-950 flex items-center">
                  <span className="w-2 h-2 rounded-full bg-blue-500 mr-2" />
                  {t.stageGrowth}
                </span>
                <span className="text-[10px] font-extrabold bg-blue-200/70 text-blue-900 px-2 py-0.5 rounded-md">
                  Stage 2
                </span>
              </div>
              <div className="space-y-2.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">{t.startDate}</label>
                  <input
                    type="date"
                    name="growthStart"
                    value={formData.growthStart}
                    onChange={handleChange}
                    required
                    className="w-full text-xs bg-white border border-blue-200 rounded-xl px-3 py-2 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">{t.endDate}</label>
                  <input
                    type="date"
                    name="growthEnd"
                    value={formData.growthEnd}
                    onChange={handleChange}
                    required
                    className="w-full text-xs bg-white border border-blue-200 rounded-xl px-3 py-2 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs"
                  />
                </div>
              </div>
            </div>

            {/* Stage 3: Harvest (Sunlit Amber) */}
            <div className="bg-gradient-to-br from-amber-50/80 to-amber-100/30 p-4.5 rounded-2xl border border-amber-200 shadow-2xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black text-amber-950 flex items-center">
                  <span className="w-2 h-2 rounded-full bg-amber-500 mr-2" />
                  {t.stageHarvest}
                </span>
                <span className="text-[10px] font-extrabold bg-amber-200/70 text-amber-900 px-2 py-0.5 rounded-md">
                  Stage 3
                </span>
              </div>
              <div className="space-y-2.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">{t.startDate}</label>
                  <input
                    type="date"
                    name="harvestStart"
                    value={formData.harvestStart}
                    onChange={handleChange}
                    required
                    className="w-full text-xs bg-white border border-amber-200 rounded-xl px-3 py-2 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 shadow-2xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">{t.endDate}</label>
                  <input
                    type="date"
                    name="harvestEnd"
                    value={formData.harvestEnd}
                    onChange={handleChange}
                    required
                    className="w-full text-xs bg-white border border-amber-200 rounded-xl px-3 py-2 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 shadow-2xs"
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
            className="flex items-center space-x-2.5 px-7 py-3.5 bg-gradient-to-r from-emerald-600 via-emerald-700 to-green-700 hover:from-emerald-700 hover:to-green-800 disabled:opacity-50 text-white rounded-2xl text-xs font-black shadow-lg shadow-emerald-700/30 transition duration-200 active:scale-95"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>{t.analyzingBtn}</span>
              </>
            ) : (
              <>
                <span>{t.submitBtn}</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
