import React from 'react';
import { X, History, ArrowRight, CheckCircle2, AlertTriangle, Calendar } from 'lucide-react';

export default function HistoryDrawer({ isOpen, onClose, history = [], onSelectResult, currentResultId }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <History className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900">Analysis History</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {history.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No previous analyses recorded yet.
            </div>
          ) : (
            history.map((item, idx) => {
              const isSelected = item.id === currentResultId || item._id === currentResultId;
              const dateStr = item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' }) : '';
              
              return (
                <div
                  key={idx}
                  onClick={() => {
                    onSelectResult(item);
                    onClose();
                  }}
                  className={`p-4 rounded-xl border transition cursor-pointer ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50/40 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-emerald-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">
                      {item.submission?.crop || 'Crop'} ({item.submission?.season || 'Season'})
                    </span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${item.badgeClass || 'bg-slate-100 text-slate-700'}`}>
                      Score: {item.reliabilityScore || 0}%
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 text-[11px] text-slate-500 mt-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{item.submission?.district || 'District'}</span>
                    <span>•</span>
                    <span>{dateStr}</span>
                  </div>

                  <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between">
                    <span>{item.conflicts?.filter(c => c.status !== 'Compatible').length || 0} issues</span>
                    <span className="text-emerald-600 font-semibold flex items-center">
                      View details <ArrowRight className="w-3 h-3 ml-0.5" />
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}
