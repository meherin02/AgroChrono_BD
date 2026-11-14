import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from './components/Header';
import CalendarForm from './components/CalendarForm';
import ScoreGauge from './components/ScoreGauge';
import ConflictTable from './components/ConflictTable';
import WeatherWidget from './components/WeatherWidget';
import HistoryDrawer from './components/HistoryDrawer';
import { Sprout, ShieldAlert, Award, FileSpreadsheet, ArrowUpRight } from 'lucide-react';

const API_BASE = '/api';

export default function App() {
  const [options, setOptions] = useState({ crops: [], districts: [] });
  const [systemHealth, setSystemHealth] = useState(null);
  const [history, setHistory] = useState([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [activeResult, setActiveResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isReanalyzing, setIsReanalyzing] = useState(false);
  const [formInitialValues, setFormInitialValues] = useState(null);
  const [comparisonBanner, setComparisonBanner] = useState(null);

  // Load system health and form options on mount
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

  // Submit calendar analysis
  const handleAnalyze = async (formData) => {
    setIsAnalyzing(true);
    setComparisonBanner(null);
    try {
      const res = await axios.post(`${API_BASE}/analyze`, formData);
      if (res.data?.success) {
        setActiveResult(res.data.data);
        fetchHistory();
        // Scroll to results smoothly
        window.scrollTo({ top: 380, behavior: 'smooth' });
      }
    } catch (err) {
      alert(`Validation / Analysis Error: ${err.response?.data?.error || err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Apply suggested correction and re-analyze
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

  // Preset loader
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
        plantingStart: '2026-09-10', // Delayed planting
        plantingEnd: '2026-09-20',
        growthStart: '2026-09-22',
        growthEnd: '2026-12-15',
        harvestStart: '2026-12-28', // Delayed harvest
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
        growthEnd: '2027-02-10', // 200 days growth (abnormal anomaly)
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
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      
      {/* Top Header */}
      <Header
        systemHealth={systemHealth}
        onOpenHistory={() => setIsHistoryOpen(true)}
        historyCount={history.length}
        onLoadPreset={handleLoadPreset}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Hero Banner */}
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-lg relative overflow-hidden">
          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-3">
              Decision Support for Bangladesh Agriculture
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
              Validate Farmer-Proposed Crop Cultivation Timelines Before Field Planting
            </h1>
            <p className="mt-2 text-sm text-emerald-100/90 leading-relaxed">
              AgroChrono-BD compares submitted schedules against regional agro-climatic reference data (BAMIS, BRRI, BARC), runs an Isolation Forest ML anomaly screening, and generates field-level conflict explanations with reference-calibrated corrections.
            </p>
          </div>
          {/* Subtle decoration */}
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-10 translate-y-10">
            <Sprout className="w-80 h-80 text-white" />
          </div>
        </div>

        {/* Input Module */}
        <CalendarForm
          options={options}
          onSubmit={handleAnalyze}
          isAnalyzing={isAnalyzing}
          initialValues={formInitialValues}
          onReset={handleReset}
        />

        {/* Comparison Banner after Re-analyzing */}
        {comparisonBanner && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between text-xs text-emerald-900 shadow-xs animate-fade-in">
            <div className="flex items-center space-x-3">
              <span className="p-2 bg-emerald-600 text-white rounded-xl">
                <Award className="w-5 h-5" />
              </span>
              <div>
                <span className="font-bold text-sm">Suggested Calendar Applied!</span>
                <p className="text-emerald-700 mt-0.5">
                  Reliability score improved from <strong>{comparisonBanner.originalScore}%</strong> to <strong>{comparisonBanner.newScore}%</strong> (+{comparisonBanner.scoreImprovement}% improvement).
                </p>
              </div>
            </div>
            <span className="font-bold bg-white text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-200">
              {comparisonBanner.resolvedConflicts} Discrepancies Resolved
            </span>
          </div>
        )}

        {/* Result Dashboard (Sections 3.5 - 3.10) */}
        {activeResult && (
          <div className="space-y-6">
            
            {/* Score & Anomaly Gauge */}
            <ScoreGauge result={activeResult} />

            {/* Weather & Reference Summary Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              <div className="lg:col-span-2">
                <WeatherWidget weather={activeResult.weatherAssessment} />
              </div>

              {/* Reference Dataset Info Card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Benchmark Reference Dataset
                  </span>
                  <h4 className="text-sm font-bold text-slate-900">{activeResult.reference?.crop} ({activeResult.reference?.season})</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{activeResult.reference?.district} District Zone</p>

                  <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                    <div><strong>Planting:</strong> {activeResult.reference?.plantingWindow}</div>
                    <div><strong>Duration:</strong> {activeResult.reference?.growthDurationDays?.min}–{activeResult.reference?.growthDurationDays?.max} days (typ. {activeResult.reference?.growthDurationDays?.typical}d)</div>
                    <div><strong>Harvest:</strong> {activeResult.reference?.harvestWindow}</div>
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
                      BAMIS/BARC <ArrowUpRight className="w-3 h-3 ml-0.5" />
                    </a>
                  )}
                </div>
              </div>

            </div>

            {/* Conflict Table & Suggested Correction */}
            <ConflictTable
              result={activeResult}
              onApplyCorrection={handleApplyCorrection}
              isReanalyzing={isReanalyzing}
            />

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
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4">
          <p className="font-medium text-slate-700">AgroChrono-BD • Agricultural Decision Support System for Bangladesh</p>
          <p className="text-[11px] text-slate-400 mt-1">
            Compliant with BAMIS (DAE), BRRI, and BARC agro-ecological guidelines. Weather powered by Open-Meteo. ML Anomaly Detection powered by Scikit-learn Isolation Forest.
          </p>
        </div>
      </footer>

    </div>
  );
}
