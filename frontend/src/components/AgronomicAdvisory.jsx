import React from 'react';
import { Compass, CheckCircle2, Droplets, Sun, Sprout, ShieldAlert, Award } from 'lucide-react';

export default function AgronomicAdvisory({ result, t }) {
  if (!result || !result.submission || !result.reference) return null;

  const { submission, reference, conflicts = [] } = result;

  const hasPlantingConflict = conflicts.some(c => c.field?.includes('Planting') && c.status !== 'Compatible');
  const hasGrowthConflict = conflicts.some(c => c.field?.includes('Growth') && c.status !== 'Compatible');
  const hasHarvestConflict = conflicts.some(c => c.field?.includes('Harvest') && c.status !== 'Compatible');

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 overflow-hidden">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <Compass className="w-5 h-5 text-emerald-600" />
            <span>{t.advisoryTitle}</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {t.advisorySubtitle} ({submission.crop} • {submission.district} District)
          </p>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-full border border-emerald-200">
          DAE / BRRI Best Practice
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
        
        {/* Advisory 1: Seedling Management */}
        <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-900 mb-1.5">
            <Sprout className="w-4 h-4 text-emerald-600" />
            <span>{t.seedlingTip}</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {hasPlantingConflict
              ? `Due to late transplanting beyond the ideal window, use slightly older seedlings (30–35 days) with closer spacing (20cm × 15cm) and consider short-duration cold-tolerant cultivars (e.g. BRRI dhan75, BRRI dhan71) to avoid winter chill during flowering.`
              : `Optimal transplanting age is 20–25 days for Aman and 35–40 days for Boro. Transplant 2–3 healthy seedlings per hill in puddle soil with 20cm × 20cm spacing.`}
          </p>
        </div>

        {/* Advisory 2: Water & Irrigation */}
        <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-900 mb-1.5">
            <Droplets className="w-4 h-4 text-blue-600" />
            <span>{t.waterTip}</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Maintain 2–4 cm standing water during initial tillering and panicle development. Practice Alternate Wetting and Drying (AWD) where applicable during early vegetative growth to save up to 25% irrigation water.
          </p>
        </div>

        {/* Advisory 3: Fertilizer Management */}
        <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-900 mb-1.5">
            <Award className="w-4 h-4 text-amber-600" />
            <span>{t.nutrientTip}</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Apply full doses of TSP, MoP, Gypsum, and Zinc sulphate as basal during final land preparation. Split Urea into 3 equal top-dressings: 15–20 DAT, maximum tillering stage (30–35 DAT), and 5–7 days before panicle initiation.
          </p>
        </div>

        {/* Advisory 4: Harvest & Subsequent Crop */}
        <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-900 mb-1.5">
            <Sun className="w-4 h-4 text-orange-500" />
            <span>{t.harvestTip}</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {hasHarvestConflict
              ? `Harvest promptly when 80–85% of grains turn golden yellow. Delaying harvest into late winter risks lodging, early morning fog moisture spoilage, and compromises the sowing schedule for upcoming Rabi wheat or potato.`
              : `Harvest when 80–85% of the panicle matures. Dry paddy to 12–14% moisture content before storage in airtight containers to preserve seed viability.`}
          </p>
        </div>

      </div>
    </div>
  );
}
