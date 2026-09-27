import React, { useState } from 'react';
import {
  curateAttractions,
  submitHumanApproval,
  saveApprovedAttractions,
  type Destination,
  type AttractionAiState
} from '../api/destinationApi';

interface Props {
  destination: Destination;
  onAttractionsSaved?: () => void;
}

export default function AttractionAiArchitect({ destination, onAttractionsSaved }: Props) {
  const [budget, setBudget] = useState<number>(75);
  const [maxHours, setMaxHours] = useState<number>(6);
  const [requireAccessible, setRequireAccessible] = useState<boolean>(true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['Cultural', 'Scenic']);
  const [notes, setNotes] = useState<string>('');
  
  const [loading, setLoading] = useState<boolean>(false);
  const [aiState, setAiState] = useState<AttractionAiState | null>(null);
  const [feedbackInput, setFeedbackInput] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const availableCategories = ['Cultural', 'Historical', 'Scenic', 'Adventure'];

  const toggleCategory = (cat: string) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const handleStartCuration = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const res = await curateAttractions({
        destinationId: destination.id,
        destinationName: destination.name,
        preferences: {
          userBudget: budget,
          maxDurationHours: maxHours,
          categories: selectedCategories,
          requireAccessible,
          notes,
        },
      });
      setAiState(res);
    } catch (err: any) {
      setError(err.message || 'Failed to execute AI curation workflow');
    } finally {
      setLoading(false);
    }
  };

  const handleHumanDecision = async (decision: 'APPROVE' | 'REJECT' | 'REVISE') => {
    if (!aiState) return;
    setLoading(true);
    setError(null);
    try {
      const res = await submitHumanApproval({
        threadId: aiState.threadId,
        decision,
        feedback: decision === 'REVISE' ? (feedbackInput || 'Please make it cheaper and shorter.') : undefined,
      });
      setAiState(res);
      setFeedbackInput('');

      if (decision === 'APPROVE') {
        await handleSaveApproved(res.threadId);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit decision to AI service');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveApproved = async (threadId: string) => {
    setSaving(true);
    try {
      const saved = await saveApprovedAttractions(threadId);
      setSuccessMessage(`Successfully saved ${saved.length} AI-curated attractions to ${destination.name}!`);
      if (onAttractionsSaved) onAttractionsSaved();
    } catch (err: any) {
      setError(err.message || 'Failed to save approved attractions');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-slate-900 text-slate-100 rounded-2xl p-6 shadow-2xl border border-slate-800 my-6">
      {/* Header Banner */}
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center font-bold text-white shadow-lg">
            ✨
          </div>
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              LangGraph AI Attraction Architect
            </h3>
            <p className="text-xs text-slate-400">
              Multi-step reasoning • Self-validating • Persisted state • Human-in-the-loop approval
            </p>
          </div>
        </div>
        <span className="text-xs px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-indigo-400 font-mono">
          Internal Service Gateway
        </span>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-950/80 border border-red-800 text-red-300 rounded-lg text-sm">
          ⚠️ {error}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-3 bg-emerald-950/80 border border-emerald-800 text-emerald-300 rounded-lg text-sm flex justify-between items-center">
          <span>🎉 {successMessage}</span>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-xs text-emerald-400 underline hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Preferences Form */}
      <form onSubmit={handleStartCuration} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Budget Slider */}
          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/50">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold text-slate-300">Max Budget (USD)</label>
              <span className="text-sm font-bold text-emerald-400">${budget}</span>
            </div>
            <input
              type="range"
              min="10"
              max="200"
              step="5"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>

          {/* Duration Slider */}
          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/50">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold text-slate-300">Max Duration (Hours)</label>
              <span className="text-sm font-bold text-sky-400">{maxHours} hrs</span>
            </div>
            <input
              type="range"
              min="2"
              max="12"
              step="1"
              value={maxHours}
              onChange={(e) => setMaxHours(Number(e.target.value))}
              className="w-full accent-sky-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Categories & Accessibility */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-800/60 p-4 rounded-xl border border-slate-700/50">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-2">Target Categories</label>
            <div className="flex flex-wrap gap-2">
              {availableCategories.map((cat) => {
                const active = selectedCategories.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-all font-medium ${
                      active
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                        : 'bg-slate-700/50 border-slate-600 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center space-x-3 bg-slate-900/60 px-4 py-2 rounded-lg border border-slate-700/80">
            <input
              type="checkbox"
              id={`accessible_${destination.id}`}
              checked={requireAccessible}
              onChange={(e) => setRequireAccessible(e.target.checked)}
              className="h-4 w-4 rounded accent-indigo-500"
            />
            <label htmlFor={`accessible_${destination.id}`} className="text-xs font-medium text-slate-300 cursor-pointer">
              ♿ Wheelchair Accessible Only
            </label>
          </div>
        </div>

        {/* Notes Input */}
        <div>
          <input
            type="text"
            placeholder="Special notes or interests (e.g. morning strolls, art galleries)..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-semibold text-sm shadow-lg hover:brightness-110 active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
        >
          {loading ? (
            <span>🚀 Executing LangGraph Multi-Step Reasoning Graph...</span>
          ) : (
            <span>✨ Generate AI Attraction Recommendation</span>
          )}
        </button>
      </form>

      {/* LangGraph State Output Display */}
      {aiState && (
        <div className="mt-8 space-y-6 pt-6 border-t border-slate-800 animate-fadeIn">
          {/* Workflow Status Tracker */}
          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Graph Thread: <span className="font-mono text-indigo-400">{aiState.threadId}</span>
              </span>
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase ${
                  aiState.status === 'APPROVED'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : aiState.status === 'PENDING_HUMAN_APPROVAL'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    : aiState.status === 'REJECTED'
                    ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                    : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/40'
                }`}
              >
                Status: {aiState.status} (Iter: {aiState.iterationCount})
              </span>
            </div>

            {/* Visual Step Pipeline */}
            <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-semibold py-2 border-t border-slate-800/80">
              <div className="p-2 rounded bg-indigo-950/60 text-indigo-300 border border-indigo-800/50">
                1. Gather Tools
              </div>
              <div className="p-2 rounded bg-purple-950/60 text-purple-300 border border-purple-800/50">
                2. Reasoning Curation
              </div>
              <div className="p-2 rounded bg-sky-950/60 text-sky-300 border border-sky-800/50">
                3. Self-Validation
              </div>
              <div
                className={`p-2 rounded border ${
                  aiState.status === 'PENDING_HUMAN_APPROVAL'
                    ? 'bg-amber-950/80 text-amber-300 border-amber-600 animate-pulse'
                    : aiState.status === 'APPROVED'
                    ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700'
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                4. Human Review
              </div>
            </div>
          </div>

          {/* Self Validation Report Card */}
          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center justify-between">
              <span>Deterministic Self-Validation Audit Report</span>
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded ${
                  aiState.validationResult.isValid
                    ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700'
                    : 'bg-red-900/60 text-red-300 border border-red-700'
                }`}
              >
                {aiState.validationResult.isValid ? 'PASSED ALL CHECKS' : 'CRITIQUE ERRORS'}
              </span>
            </h4>

            <div className="grid grid-cols-3 gap-3 mb-3">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 block">Budget Check</span>
                <span className={`text-xs font-bold ${aiState.validationResult.budgetPass ? 'text-emerald-400' : 'text-red-400'}`}>
                  {aiState.validationResult.budgetPass ? '✅ Under Budget' : '❌ Exceeded'}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 block">Duration Check</span>
                <span className={`text-xs font-bold ${aiState.validationResult.durationPass ? 'text-emerald-400' : 'text-red-400'}`}>
                  {aiState.validationResult.durationPass ? '✅ Fits Schedule' : '❌ Overtime'}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 block">Accessibility Check</span>
                <span className={`text-xs font-bold ${aiState.validationResult.accessibilityPass ? 'text-emerald-400' : 'text-red-400'}`}>
                  {aiState.validationResult.accessibilityPass ? '✅ 100% Accessible' : '❌ Non-Compliant'}
                </span>
              </div>
            </div>

            {aiState.validationResult.errorMessages.length > 0 && (
              <div className="text-xs text-red-400 bg-red-950/40 p-2 rounded border border-red-900/50">
                {aiState.validationResult.errorMessages.map((err, idx) => (
                  <p key={idx}>• {err}</p>
                ))}
              </div>
            )}
          </div>

          {/* Curated Attraction Plan */}
          <div>
            <h4 className="text-sm font-bold text-white mb-3">
              Curated Itinerary Package ({aiState.curatedPlan.length} Attractions)
            </h4>
            <div className="space-y-3">
              {aiState.curatedPlan.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-slate-800/80 border border-slate-700/80 p-4 rounded-xl hover:border-indigo-500/50 transition-all flex justify-between items-start"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 font-mono font-bold border border-indigo-800">
                        {item.scheduledTime}
                      </span>
                      <h5 className="font-semibold text-white text-sm">{item.name}</h5>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-700 text-slate-300">
                        {item.category}
                      </span>
                    </div>
                    {item.rationale && (
                      <p className="text-xs text-slate-400 italic">"{item.rationale}"</p>
                    )}
                    <div className="flex items-center space-x-4 text-[11px] text-slate-400 pt-1">
                      <span>⏱️ {item.visitDurationMinutes} mins</span>
                      <span>🎟️ ${item.entryFee ?? 0}</span>
                      <span>{item.isAccessible ? '♿ Wheelchair Accessible' : '⚠️ Steps Required'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reasoning Execution Log Accordion */}
          <details className="bg-slate-950/60 rounded-xl border border-slate-800 p-3 text-xs">
            <summary className="font-bold text-slate-300 cursor-pointer hover:text-indigo-400 transition-colors">
              🔍 View LangGraph Multi-Step Reasoning Logs ({aiState.reasoningLog.length} steps)
            </summary>
            <div className="mt-3 space-y-2 pt-2 border-t border-slate-800">
              {aiState.reasoningLog.map((log, idx) => (
                <div key={idx} className="bg-slate-900 p-2.5 rounded border border-slate-800/80 font-mono">
                  <div className="text-indigo-400 font-bold mb-0.5">[{idx + 1}] {log.step}</div>
                  <div className="text-slate-300">{log.description}</div>
                  <div className="text-slate-500 text-[10px] mt-1">{log.outputSummary}</div>
                </div>
              ))}
            </div>
          </details>

          {/* Human-in-the-Loop Review Actions */}
          {aiState.status === 'PENDING_HUMAN_APPROVAL' && (
            <div className="bg-amber-950/40 border border-amber-800/60 p-5 rounded-2xl space-y-4">
              <div className="flex items-center space-x-2 text-amber-300 font-bold text-sm">
                <span>✋ Human Approval Required</span>
                <span className="text-xs font-normal text-amber-400/80">
                  (Graph state paused at checkpointer thread)
                </span>
              </div>

              <div className="flex flex-col md:flex-row gap-3">
                <button
                  type="button"
                  disabled={loading || saving}
                  onClick={() => handleHumanDecision('APPROVE')}
                  className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all disabled:opacity-50"
                >
                  {saving ? 'Saving to Database...' : '✅ Approve & Add to Destination Database'}
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleHumanDecision('REVISE')}
                  className="py-3 px-4 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all disabled:opacity-50"
                >
                  🔄 Request Cheaper / Shorter Revision
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleHumanDecision('REJECT')}
                  className="py-3 px-4 bg-rose-700 hover:bg-rose-600 text-white font-bold text-xs rounded-xl shadow-lg transition-all disabled:opacity-50"
                >
                  ❌ Reject Plan
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
