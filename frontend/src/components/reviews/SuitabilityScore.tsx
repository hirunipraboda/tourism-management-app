import React from 'react';
import { Sparkles, Info, CheckCircle2, TrendingUp } from 'lucide-react';

interface SuitabilityScoreProps {
  score: number;
  interestMatch?: number;
  ratingMatch?: number;
  budgetMatch?: number;
  locationMatch?: number;
  popularityScore?: number;
  explanation?: string;
  compact?: boolean;
  className?: string;
}

export const SuitabilityScore: React.FC<SuitabilityScoreProps> = ({
  score,
  interestMatch = 95,
  ratingMatch = 92,
  budgetMatch = 90,
  locationMatch = 96,
  popularityScore = 94,
  explanation,
  compact = false,
  className = '',
}) => {
  // Score color gradient
  const getScoreColor = (val: number) => {
    if (val >= 90) return 'from-emerald-500 to-teal-600 text-emerald-700 bg-emerald-50 border-emerald-200';
    if (val >= 80) return 'from-sky-500 to-blue-600 text-sky-700 bg-sky-50 border-sky-200';
    return 'from-amber-500 to-orange-600 text-amber-700 bg-amber-50 border-amber-200';
  };

  const factorBars = [
    { label: 'Interest Match', value: interestMatch, color: 'bg-[#16A6A1]' },
    { label: 'Rating History', value: ratingMatch, color: 'bg-amber-500' },
    { label: 'Budget Match', value: budgetMatch, color: 'bg-emerald-500' },
    { label: 'Location', value: locationMatch, color: 'bg-sky-500' },
    { label: 'Popularity', value: popularityScore, color: 'bg-indigo-500' },
  ];

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black shadow-xs border ${getScoreColor(score)} ${className}`}>
        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
        <span>{score}% Suitable</span>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4 ${className}`}>
      {/* Header with Circular / Pill Score Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="space-y-0.5">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#146C86]">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>AI Suitability Engine</span>
          </div>
          <h4 className="text-base font-black text-[#0B3A53] font-heading">
            Attraction & Tour Suitability
          </h4>
        </div>

        {/* Circular / Badge Score */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-2xl font-black text-slate-900 leading-none">
              {score}%
            </div>
            <div className="text-[11px] font-extrabold text-emerald-600 uppercase tracking-wider">
              Suitable For You
            </div>
          </div>

          <div className="relative w-12 h-12 shrink-0">
            <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-100"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-[#16A6A1] transition-all duration-1000 ease-out"
                strokeDasharray={`${score}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-[#0B3A53]">
              {score}%
            </span>
          </div>
        </div>
      </div>

      {/* Factor Breakdown Bars */}
      <div className="space-y-2.5">
        <div className="text-[11px] font-black uppercase tracking-wider text-slate-400">
          Match Factor Breakdown
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs">
          {factorBars.map((f) => (
            <div key={f.label} className="space-y-1">
              <div className="flex items-center justify-between text-slate-700 font-semibold text-[11px]">
                <span>{f.label}</span>
                <span className="font-extrabold text-slate-900">{f.value}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${f.color} rounded-full transition-all duration-700`}
                  style={{ width: `${f.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Explanation Banner */}
      {explanation && (
        <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3.5 text-xs text-emerald-900 space-y-1">
          <div className="flex items-center gap-1.5 font-black text-emerald-800 text-[11px] uppercase tracking-wider">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Why this is recommended</span>
          </div>
          <p className="font-medium text-emerald-800 leading-relaxed">
            "{explanation}"
          </p>
        </div>
      )}
    </div>
  );
};
