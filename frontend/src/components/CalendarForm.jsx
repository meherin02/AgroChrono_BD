import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Wheat, Sun, AlertCircle, ArrowRight, RefreshCw, CheckCircle2, Sparkles } from 'lucide-react';

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

  // Update when initialValues changes
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

  // Common varieties based on crop & season
  const popularVarieties = {
    'Rice-Aman': ['BRRI dhan49', 'BRRI dhan75', 'BRRI dhan87', 'Swarna'],
    'Rice-Boro': ['BRRI dhan28', 'BRRI dhan29', 'BRRI dhan89', 'BRRI dhan92'],
    'Rice-Aus': ['BRRI dhan48', 'BRRI dhan82', 'Parija'],
    'Wheat-Rabi': ['BARI Gom-25', 'BARI Gom-30', 'BARI Gom-33'],
    'Potato-Rabi': ['Diamant', 'Cardinal', 'Asterix'],
    'Mustard-Rabi': ['BARI Sarisha-14', 'BARI Sarisha-17']
  };

  const currentVarieties = popularVarieties[`${formData.crop}-${formData.season}`] || [];

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

  const handleSelectVariety = (v) => {
    setFormData(prev => ({ ...prev, variety: v }));
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

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-emerald-600" />
            <span>{t.formTitle}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {t.formDesc}
          </p>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition px-3 py-1 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200"
        >
          {t.reset}
        </button>
      </div>

      {validationError && (
        <div className="mb-5 flex items-start space-x-2.5 bg-rose-50 border border-rose-200 text-rose-700 p-3.5 rounded-xl text-xs animate-shake">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
          <span>{validationError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Section 1: Basic Information */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">{t.sec1}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Crop */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">{t.crop}</label>
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

            {/* District */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">{t.district}</label>
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">{t.season}</label>
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">{t.variety}</label>
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

          {/* Variety quick chips */}
          {currentVarieties.length > 0 && (
            <div className="mt-2.5 flex items-center space-x-1.5 flex-wrap text-[11px]">
              <span className="text-slate-400 font-semibold text-[10px] uppercase">Common Varieties:</span>
              {currentVarieties.map(v => (
                <button
                  key={v}
                  type="button"
                  onClick={() => handleSelectVariety(v)}
                  className={`px-2 py-0.5 rounded-md border text-[10px] font-semibold transition ${
                    formData.variety === v
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-emerald-300 hover:text-emerald-700'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Section 2: Cultivation Stage Dates */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">{t.sec2}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Planting Stage */}
            <div className="bg-emerald-50/40 p-4 rounded-xl border border-emerald-100/80 hover:border-emerald-200 transition">
              <span className="text-xs font-bold text-emerald-900 block mb-2">{t.stagePlanting}</span>
              <div className="space-y-2">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase">{t.startDate}</label>
                  <input
                    type="date"
                    name="plantingStart"
                    value={formData.plantingStart}
                    onChange={handleChange}
                    required
                    className="w-full text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-2 font-medium text-slate-800 focus:outline-none focus:border-emerald-500 shadow-2xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase">{t.endDate}</label>
                  <input
                    type="date"
                    name="plantingEnd"
                    value={formData.plantingEnd}
                    onChange={handleChange}
                    required
                    className="w-full text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-2 font-medium text-slate-800 focus:outline-none focus:border-emerald-500 shadow-2xs"
                  />
                </div>
              </div>
            </div>

            {/* Growth Stage */}
            <div className="bg-blue-50/40 p-4 rounded-xl border border-blue-100/80 hover:border-blue-200 transition">
              <span className="text-xs font-bold text-blue-900 block mb-2">{t.stageGrowth}</span>
              <div className="space-y-2">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase">{t.startDate}</label>
                  <input
                    type="date"
                    name="growthStart"
                    value={formData.growthStart}
                    onChange={handleChange}
                    required
                    className="w-full text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-2 font-medium text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase">{t.endDate}</label>
                  <input
                    type="date"
                    name="growthEnd"
                    value={formData.growthEnd}
                    onChange={handleChange}
                    required
                    className="w-full text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-2 font-medium text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs"
                  />
                </div>
              </div>
            </div>

            {/* Harvest Stage */}
            <div className="bg-amber-50/40 p-4 rounded-xl border border-amber-100/80 hover:border-amber-200 transition">
              <span className="text-xs font-bold text-amber-900 block mb-2">{t.stageHarvest}</span>
              <div className="space-y-2">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase">{t.startDate}</label>
                  <input
                    type="date"
                    name="harvestStart"
                    value={formData.harvestStart}
                    onChange={handleChange}
                    required
                    className="w-full text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-2 font-medium text-slate-800 focus:outline-none focus:border-amber-500 shadow-2xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase">{t.endDate}</label>
                  <input
                    type="date"
                    name="harvestEnd"
                    value={formData.harvestEnd}
                    onChange={handleChange}
                    required
                    className="w-full text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-2 font-medium text-slate-800 focus:outline-none focus:border-amber-500 shadow-2xs"
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
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/25 transition active:scale-95"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{t.analyzingBtn}</span>
              </>
            ) : (
              <>
                <span>{t.submitBtn}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
