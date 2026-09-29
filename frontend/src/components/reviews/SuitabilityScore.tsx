import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface SuitabilityScoreProps {
  score: number;
  compact?: boolean;
  className?: string;
  interestPts?: number;
  environmentPts?: number;
  feedbackPts?: number;
  budgetPts?: number;
}

export const SuitabilityScore: React.FC<SuitabilityScoreProps> = ({
  score,
  compact = false,
  className = '',
  interestPts,
  environmentPts,
  feedbackPts,
  budgetPts,
}) => {
  // Deterministic calculation scaled to exact weights: 35, 30, 20, 15
  const calcInterest = interestPts ?? Math.min(35, Math.max(22, Math.round((score / 100) * 35)));
  const calcEnv = environmentPts ?? Math.min(30, Math.max(18, Math.round((score / 100) * 30)));
  const calcFeedback = feedbackPts ?? Math.min(20, Math.max(12, Math.round((score / 100) * 20)));
  const calcBudget = budgetPts ?? Math.max(8, score - (calcInterest + calcEnv + calcFeedback));

  if (compact) {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black shadow-xs bg-emerald-50 text-emerald-700 border border-emerald-200/80 ${className}`}
      >
        <span>{score}% Match</span>
      </div>
    );
  }

  const items = [
    { label: 'Interest Match', value: `${calcInterest}/35`, pct: (calcInterest / 35) * 100 },
    { label: 'Environment', value: `${calcEnv}/30`, pct: (calcEnv / 30) * 100 },
    { label: 'Traveler Feedback', value: `${calcFeedback}/20`, pct: (calcFeedback / 20) * 100 },
    { label: 'Budget', value: `${calcBudget}/15`, pct: (calcBudget / 15) * 100 },
  ];

  return (
    <div className={`bg-slate-50/80 rounded-2xl border border-slate-200/80 p-5 space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200/60">
        <div>
          <h4 className="text-base font-black text-[#0B3A53] font-heading">
            Your Match
          </h4>
          <p className="text-xs text-slate-500 font-medium">
            Based on your interests, preferred vibe, traveler ratings, and budget
          </p>
        </div>

        {/* Circular / Badge Total */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 font-black text-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{score}% Match</span>
        </div>
      </div>

      {/* Breakdown Rows */}
      <div className="space-y-3">
        {items.map((it) => (
          <div key={it.label} className="space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>{it.label}</span>
              <span className="font-black text-slate-900">{it.value}</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-200/70 overflow-hidden">
              <div
                className="h-full rounded-full bg-[#146C86] transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(10, it.pct))}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Total Footer */}
      <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between text-sm font-black">
        <span className="text-slate-800">Total Match Score</span>
        <span className="text-lg text-emerald-700 font-heading">{score} / 100</span>
      </div>
    </div>
  );
};
