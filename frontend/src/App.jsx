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
import { Sprout, ShieldAlert, Award, FileSpreadsheet, ArrowUpRight, CheckCircle2 } from 'lucide-react';

const API_BASE = '/api';

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
        window.scrollTo({ top: 380, behavior: 'smooth' });
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
        window.scrollTo({ top: 380, behavior: 'smooth' });
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
    <div className={`min-h-screen flex flex-col bg-slate-50 text-slate-900 ${language === 'bn' ? 'font-bangla' : ''}`}>
      
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

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-emerald-800/40">
          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-3 backdrop-blur-xs">
              🌾 {t.tagline}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
              {t.heroTitle}
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
              {t.heroDesc}
            </p>
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
          <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-900 shadow-sm animate-fade-in">
            <div className="flex items-center space-x-3">
              <span className="p-2 bg-emerald-600 text-white rounded-xl shadow-xs">
                <Award className="w-5 h-5" />
              </span>
              <div>
                <span className="font-bold text-sm">Suggested Calendar Successfully Applied!</span>
                <p className="text-emerald-700 mt-0.5">
                  Reliability score improved from <strong>{comparisonBanner.originalScore}%</strong> to <strong>{comparisonBanner.newScore}%</strong> (+{comparisonBanner.scoreImprovement}% increase).
                </p>
              </div>
            </div>
            <span className="font-bold bg-white text-emerald-800 px-3 py-1.5 rounded-lg border border-emerald-200 self-start sm:self-auto shadow-2xs">
              ✓ {comparisonBanner.resolvedConflicts} Discrepancies Resolved
            </span>
          </div>
        )}

        {/* Analysis Dashboard */}
        {activeResult && (
          <div className="space-y-6">
            
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
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Verified Reference Benchmark
                  </span>
                  <h4 className="text-base font-bold text-slate-900">
                    {activeResult.reference?.crop} ({activeResult.reference?.season})
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">
                    {activeResult.reference?.district} District Agro-Ecological Region
                  </p>

                  <div className="mt-4 space-y-2 text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div><span className="font-semibold text-slate-500">Planting Window:</span> <span className="font-bold">{activeResult.reference?.plantingWindow}</span></div>
                    <div><span className="font-semibold text-slate-500">Growth Duration:</span> <span className="font-bold">{activeResult.reference?.growthDurationDays?.min}–{activeResult.reference?.growthDurationDays?.max} days</span> (typ. {activeResult.reference?.growthDurationDays?.typical}d)</div>
                    <div><span className="font-semibold text-slate-500">Harvest Window:</span> <span className="font-bold">{activeResult.reference?.harvestWindow}</span></div>
                    {activeResult.reference?.varieties && (
                      <div className="pt-1 text-[11px] text-slate-500">
                        <span className="font-semibold">Recommended Cultivars:</span> {activeResult.reference.varieties.join(', ')}
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 mt-4 flex items-center justify-between">
                  <span>Source: {activeResult.reference?.sourceName}</span>
                  {activeResult.reference?.sourceUrl && (
                    <a
                      href={activeResult.reference.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-600 hover:text-emerald-700 font-semibold inline-flex items-center"
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
      <footer className="bg-white border-t border-slate-200 py-8 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-semibold text-slate-800">
            AgroChrono-BD • AI/ML Crop-Calendar Reliability Assessment for Bangladesh
          </p>
          <p className="text-[11px] text-slate-400 max-w-2xl mx-auto">
            Developed in alignment with the Bangladesh Agro-Meteorological Information Service (BAMIS - DAE), Bangladesh Rice Research Institute (BRRI), and Bangladesh Agricultural Research Council (BARC). Weather telemetry provided by Open-Meteo API.
          </p>
        </div>
      </footer>

    </div>
  );
}
