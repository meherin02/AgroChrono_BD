import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from './components/Header';
import CalendarForm from './components/CalendarForm';
import ScoreGauge from './components/ScoreGauge';
import TimelineVisualizer from './components/TimelineVisualizer';
import ConflictTable from './components/ConflictTable';
import AgronomicAdvisory from './components/AgronomicAdvisory';
import WeatherWidget from './components/WeatherWidget';
import HistoryDrawer from './components/HistoryDrawer';
import { translations } from './utils/translations';
import { Sprout, ShieldAlert, Award, FileSpreadsheet, ArrowUpRight, CheckCircle2, Database, Cpu, CloudSun, ShieldCheck } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export default function App() {
  const [language, setLanguage] = useState('en');
  const t = translations[language] || translations.en;

  const [options, setOptions] = useState({ crops: [], districts: [] });
  const [systemHealth, setSystemHealth] = useState(null);
  const [history, setHistory] = useState([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [activeResult, setActiveResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isReanalyzing, setIsReanalyzing] = useState(false);
  const [formInitialValues, setFormInitialValues] = useState(null);
  const [comparisonBanner, setComparisonBanner] = useState(null);

  useEffect(() => {
    fetchHealth();
    fetchOptions();
    fetchHistory();
  }, []);

  const fetchHealth = async () => {
    try {
      const res = await axios.get(`${API_BASE}/health`);
      setSystemHealth(res.data);
    } catch (err) {
      console.warn('Backend health check error:', err.message);
    }
  };

  const fetchOptions = async () => {
    try {
      const res = await axios.get(`${API_BASE}/options`);
      setOptions(res.data);
    } catch (err) {
      console.error('Failed to fetch options:', err);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${API_BASE}/history`);
      if (res.data?.data) {
        setHistory(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch history:', err);
    }
  };

  const handleToggleLanguage = () => {
    setLanguage(prev => (prev === 'en' ? 'bn' : 'en'));
  };

  const handleAnalyze = async (formData) => {
    setIsAnalyzing(true);
    setComparisonBanner(null);
    try {
      const res = await axios.post(`${API_BASE}/analyze`, formData);
      if (res.data?.success) {
        setActiveResult(res.data.data);
        fetchHistory();
        window.scrollTo({ top: 440, behavior: 'smooth' });
      }
    } catch (err) {
      alert(`Validation / Analysis Error: ${err.response?.data?.error || err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApplyCorrection = async (suggestedCalendar) => {
    setIsReanalyzing(true);
    try {
      const res = await axios.post(`${API_BASE}/reanalyze`, {
        correctedCalendar: suggestedCalendar,
        originalResultId: activeResult?.id || activeResult?._id
      });
      if (res.data?.success) {
        const newResult = res.data.data;
        setActiveResult(newResult);
        if (res.data.comparison) {
          setComparisonBanner(res.data.comparison);
        }
        setFormInitialValues(suggestedCalendar);
        fetchHistory();
        window.scrollTo({ top: 440, behavior: 'smooth' });
      }
    } catch (err) {
      alert(`Re-analysis error: ${err.response?.data?.error || err.message}`);
    } finally {
      setIsReanalyzing(false);
    }
  };

  const handleLoadPreset = (type) => {
    setComparisonBanner(null);
    if (type === 'ideal') {
      const preset = {
        crop: 'Rice',
        district: 'Rangpur',
        season: 'Aman',
        variety: 'BRRI dhan49',
        plantingStart: '2026-07-20',
        plantingEnd: '2026-07-30',
        growthStart: '2026-08-01',
        growthEnd: '2026-11-20',
        harvestStart: '2026-11-25',
        harvestEnd: '2026-12-10'
      };
      setFormInitialValues(preset);
      handleAnalyze(preset);
    } else if (type === 'conflict') {
      const preset = {
        crop: 'Rice',
        district: 'Rangpur',
        season: 'Aman',
        variety: 'BRRI dhan49',
        plantingStart: '2026-09-10',
        plantingEnd: '2026-09-20',
        growthStart: '2026-09-22',
        growthEnd: '2026-12-15',
        harvestStart: '2026-12-28',
        harvestEnd: '2027-01-15'
      };
      setFormInitialValues(preset);
      handleAnalyze(preset);
    } else if (type === 'anomaly') {
      const preset = {
        crop: 'Rice',
        district: 'Rajshahi',
        season: 'Aman',
        variety: 'BRRI dhan71',
        plantingStart: '2026-07-15',
        plantingEnd: '2026-07-25',
        growthStart: '2026-07-26',
        growthEnd: '2027-02-10',
        harvestStart: '2027-02-15',
        harvestEnd: '2027-02-28'
      };
      setFormInitialValues(preset);
      handleAnalyze(preset);
    }
  };

  const handleReset = () => {
    setFormInitialValues({
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
    setActiveResult(null);
    setComparisonBanner(null);
  };

  return (
    <div className={`min-h-screen flex flex-col bg-slate-50/70 text-slate-900 ${language === 'bn' ? 'font-bangla' : ''}`}>
      
      {/* Header */}
      <Header
        systemHealth={systemHealth}
        onOpenHistory={() => setIsHistoryOpen(true)}
        historyCount={history.length}
        onLoadPreset={handleLoadPreset}
        language={language}
        onToggleLanguage={handleToggleLanguage}
        t={t}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Stunning Hero Section with Ambient Glow */}
        <div className="relative overflow-hidden bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-950 text-white rounded-3xl p-7 sm:p-9 shadow-2xl border border-emerald-800/40">
          
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 mb-3.5 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>{t.tagline}</span>
            </div>
            
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
              {t.heroTitle}
            </h1>
            
            <p className="mt-3 text-xs sm:text-sm text-emerald-100/90 leading-relaxed max-w-2xl font-medium">
              {t.heroDesc}
            </p>

            {/* Micro KPI Pills */}
            <div className="mt-6 flex flex-wrap items-center gap-2.5 text-xs">
              <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15">
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-bold text-white">MongoDB Ready</span>
              </div>
              <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15">
                <Cpu className="w-3.5 h-3.5 text-teal-400" />
                <span className="font-bold text-white">Isolation Forest (FastAPI)</span>
              </div>
              <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15">
                <CloudSun className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-bold text-white">Open-Meteo Telemetry</span>
              </div>
              <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15">
                <ShieldCheck className="w-3.5 h-3.5 text-green-400" />
                <span className="font-bold text-white">BAMIS / BRRI Grounded</span>
              </div>
            </div>
          </div>

          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-10 translate-y-10">
            <Sprout className="w-80 h-80 text-white" />
          </div>
        </div>

        {/* Input Form */}
        <CalendarForm
          options={options}
          onSubmit={handleAnalyze}
          isAnalyzing={isAnalyzing}
          initialValues={formInitialValues}
          onReset={handleReset}
          t={t}
        />

        {/* Comparison Alert Banner */}
        {comparisonBanner && (
          <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-green-50 border border-emerald-300 rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-emerald-950 shadow-md animate-fade-in">
            <div className="flex items-center space-x-3.5">
              <span className="p-2.5 bg-emerald-600 text-white rounded-2xl shadow-md">
                <Award className="w-6 h-6" />
              </span>
              <div>
                <span className="font-black text-sm">Suggested Calendar Successfully Applied & Re-analyzed!</span>
                <p className="text-emerald-800 mt-0.5 font-medium">
                  Reliability score boosted from <strong>{comparisonBanner.originalScore}%</strong> to <strong>{comparisonBanner.newScore}%</strong> (+{comparisonBanner.scoreImprovement}% increase).
                </p>
              </div>
            </div>
            <span className="font-black bg-white text-emerald-900 px-3.5 py-2 rounded-xl border border-emerald-300 shadow-xs self-start sm:self-auto text-xs">
              ✓ {comparisonBanner.resolvedConflicts} Discrepancies Resolved
            </span>
          </div>
        )}

        {/* Analysis Dashboard */}
        {activeResult && (
          <div className="space-y-7">
            
            {/* Reliability Score Gauge */}
            <ScoreGauge result={activeResult} />

            {/* Visual Gantt Timeline Comparison */}
            <TimelineVisualizer result={activeResult} t={t} />

            {/* Weather Context & Benchmark Info */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <WeatherWidget weather={activeResult.weatherAssessment} />
              </div>

              {/* Reference Dataset Card */}
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/40 p-6 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                    Verified Regional Benchmark
                  </span>
                  <h4 className="text-lg font-black text-slate-900">
                    {activeResult.reference?.crop} ({activeResult.reference?.season})
                  </h4>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">
                    {activeResult.reference?.district} District Agro-Ecological Region
                  </p>

                  <div className="mt-4 space-y-2 text-xs text-slate-700 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100 font-medium">
                    <div><span className="font-bold text-slate-500">Planting Window:</span> <span className="font-black text-slate-900">{activeResult.reference?.plantingWindow}</span></div>
                    <div><span className="font-bold text-slate-500">Growth Duration:</span> <span className="font-black text-slate-900">{activeResult.reference?.growthDurationDays?.min}–{activeResult.reference?.growthDurationDays?.max} days</span> (typ. {activeResult.reference?.growthDurationDays?.typical}d)</div>
                    <div><span className="font-bold text-slate-500">Harvest Window:</span> <span className="font-black text-slate-900">{activeResult.reference?.harvestWindow}</span></div>
                    {activeResult.reference?.varieties && (
                      <div className="pt-1.5 text-[11px] text-slate-500 border-t border-slate-200/60 mt-1">
                        <span className="font-bold">Official Cultivars:</span> {activeResult.reference.varieties.join(', ')}
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3.5 border-t border-slate-100 text-[11px] text-slate-400 mt-4 flex items-center justify-between">
                  <span className="font-semibold truncate max-w-[180px]">Source: {activeResult.reference?.sourceName}</span>
                  {activeResult.reference?.sourceUrl && (
                    <a
                      href={activeResult.reference.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-700 hover:text-emerald-800 font-bold inline-flex items-center"
                    >
                      BAMIS Portal <ArrowUpRight className="w-3 h-3 ml-0.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Field Conflicts Table & Suggested Correction */}
            <ConflictTable
              result={activeResult}
              onApplyCorrection={handleApplyCorrection}
              isReanalyzing={isReanalyzing}
            />

            {/* Actionable Field Agronomic Advisory */}
            <AgronomicAdvisory result={activeResult} t={t} />

          </div>
        )}

      </main>

      {/* History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelectResult={(item) => setActiveResult(item)}
        currentResultId={activeResult?.id || activeResult?._id}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 mt-14 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-bold text-slate-800">
            AgroChrono-BD • AI/ML Crop-Calendar Reliability Assessment for Bangladesh
          </p>
          <p className="text-[11px] text-slate-400 max-w-2xl mx-auto">
            Aligned with the Bangladesh Agro-Meteorological Information Service (BAMIS - DAE), Bangladesh Rice Research Institute (BRRI), and Bangladesh Agricultural Research Council (BARC). Weather telemetry provided by Open-Meteo API.
          </p>
        </div>
      </footer>

    </div>
  );
}
