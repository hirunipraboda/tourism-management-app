import React, { useState } from 'react';
import {
  CheckSquare,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  X,
  Calendar,
  DollarSign,
  Users,
  MapPin,
  Clock,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { AIApprovalItem } from '../../mock/mockAdminData';

export const AdminAIApprovalsPage: React.FC = () => {
  const [approvals, setApprovals] = useState<AIApprovalItem[]>(adminService.getApprovals());
  const [activeReviewModal, setActiveReviewModal] = useState<AIApprovalItem | null>(null);

  const handleApprove = (id: string) => {
    const updated = adminService.approveItinerary(id);
    setApprovals([...updated]);
    setActiveReviewModal(null);
    alert('Itinerary successfully approved! Voucher & booking notification issued to tourist.');
  };

  const handleReject = (id: string) => {
    const updated = adminService.rejectItinerary(id);
    setApprovals([...updated]);
    setActiveReviewModal(null);
    alert('Itinerary rejected.');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0B3A53] font-heading tracking-tight">
            AI Approval Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Human-in-the-loop review for AI-generated Sri Lankan itineraries prior to traveler confirmation.
          </p>
        </div>
      </div>

      {/* Approvals Cards Grid */}
      {approvals.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {approvals.map((app) => (
            <div
              key={app.id}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#16A6A1]" />
                    <span className="font-mono font-bold text-[#0B3A53] text-xs">{app.workflowId}</span>
                  </div>
                  <span className="text-[10px] font-black uppercase px-3 py-1 rounded-full bg-amber-100 text-amber-700">
                    {app.aiWorkflowStatus}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-black text-[#0B3A53] font-heading">{app.destination}</h3>
                  <p className="text-xs font-semibold text-slate-500">
                    Tourist: <strong className="text-slate-800">{app.touristName}</strong> · {app.travelersCount} Pax
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Dates:</span>
                    <div className="font-extrabold text-[#0B3A53] truncate">{app.travelDates}</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Est. Cost:</span>
                    <div className="font-black text-[#146C86]">${app.totalEstimatedCost}</div>
                  </div>
                </div>

                {/* Warnings preview */}
                {app.warnings.length > 0 && (
                  <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200/70 text-xs space-y-1">
                    <div className="font-extrabold text-amber-800 flex items-center gap-1.5 text-[11px]">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>{app.warnings.length} Operator Review Warnings</span>
                    </div>
                    <p className="text-[11px] text-amber-700 font-medium line-clamp-1">{app.warnings[0]}</p>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#16A6A1]">{app.validationStatus}</span>
                <button
                  onClick={() => setActiveReviewModal(app)}
                  className="bg-[#0B3A53] hover:bg-[#072537] text-white font-extrabold text-xs uppercase tracking-wider px-6 py-3 rounded-full shadow-md transition-all cursor-pointer flex items-center gap-2"
                >
                  <span>Review Itinerary</span>
                  <CheckSquare className="w-4 h-4 text-[#16A6A1]" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white py-16 px-6 rounded-3xl border border-slate-200/70 shadow-xs text-center max-w-lg mx-auto space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#16A6A1]/10 text-[#16A6A1] mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-[#16A6A1]" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-black text-[#0B3A53] font-heading">No Pending Approvals</h3>
            <p className="text-xs text-slate-500 font-medium">All AI-generated itineraries have been reviewed by operators.</p>
          </div>
        </div>
      )}

      {/* DETAILED SPLIT-SCREEN REVIEW MODAL */}
      {activeReviewModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[92vh] shadow-2xl border border-slate-200 overflow-y-auto p-6 sm:p-8 space-y-6">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase text-[#16A6A1]">OPERATOR HUMAN REVIEW</span>
                <h3 className="text-2xl font-black text-[#0B3A53] font-heading">
                  Review Itinerary #{activeReviewModal.workflowId}
                </h3>
              </div>
              <button
                onClick={() => setActiveReviewModal(null)}
                className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Split Screen Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* LEFT SIDE: Day-by-Day Timeline (2 Columns) */}
              <div className="lg:col-span-2 space-y-4 text-xs">
                <h4 className="text-xs font-black uppercase text-[#0B3A53] tracking-wider">
                  AI-Generated Day-by-Day Itinerary
                </h4>

                <div className="space-y-4">
                  {activeReviewModal.generatedItinerary.map((day) => (
                    <div key={day.day} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <span className="font-black text-[#0B3A53] text-xs">Day {day.day}: {day.title}</span>
                      </div>
                      <div className="space-y-1.5 pt-1 font-medium text-slate-700">
                        <div><strong className="text-[#146C86]">Morning:</strong> {day.morning}</div>
                        <div><strong className="text-[#146C86]">Afternoon:</strong> {day.afternoon}</div>
                        <div><strong className="text-[#146C86]">Evening:</strong> {day.evening}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* RIGHT SIDE: Summary, Validation & Warnings */}
              <div className="space-y-4 text-xs">
                <h4 className="text-xs font-black uppercase text-[#0B3A53] tracking-wider">
                  Validation & Risk Summary
                </h4>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 font-medium">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-bold">Tourist:</span>
                    <span className="font-extrabold text-[#0B3A53]">{activeReviewModal.touristName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-bold">Travelers:</span>
                    <span className="font-extrabold text-[#0B3A53]">{activeReviewModal.travelersCount} Pax</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-bold">Budget Tier:</span>
                    <span className="font-extrabold text-[#146C86]">{activeReviewModal.budgetRange}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-bold">Est. Total:</span>
                    <span className="font-black text-[#0B3A53]">${activeReviewModal.totalEstimatedCost}</span>
                  </div>
                </div>

                {/* Warnings */}
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
                  <div className="font-extrabold text-amber-800 flex items-center gap-1.5 text-xs">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Agent Warnings</span>
                  </div>
                  <ul className="space-y-1 list-disc list-inside text-[11px] text-amber-700 font-medium leading-relaxed">
                    {activeReviewModal.warnings.map((w, idx) => (
                      <li key={idx}>{w}</li>
                    ))}
                  </ul>
                </div>
              </div>

            </div>

            {/* Bottom Actions Bar */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                onClick={() => handleReject(activeReviewModal.id)}
                className="w-full sm:w-auto px-6 py-3 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs cursor-pointer"
              >
                Reject Itinerary
              </button>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={() => alert('Revision requested from AI Agent')}
                  className="px-6 py-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Request Revision</span>
                </button>

                <button
                  onClick={() => handleApprove(activeReviewModal.id)}
                  className="bg-[#16A6A1] hover:bg-[#146C86] text-white font-extrabold text-xs uppercase tracking-wider px-8 py-3.5 rounded-full shadow-lg transition-all cursor-pointer flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>Approve & Issue Voucher</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
