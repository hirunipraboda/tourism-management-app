import React, { useState } from 'react';
import {
  Cpu,
  Sparkles,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Eye,
  X,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { AIWorkflowItem } from '../../mock/mockAdminData';

export const AdminAIWorkflowsPage: React.FC = () => {
  const [workflows, setWorkflows] = useState<AIWorkflowItem[]>(adminService.getWorkflows());
  const [activeWorkflowModal, setActiveWorkflowModal] = useState<AIWorkflowItem | null>(null);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0B3A53] font-heading tracking-tight">
            AI Workflow Monitoring
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Realtime multi-agent execution pipeline (Planner → Research → Route → Validation).
          </p>
        </div>
      </div>

      {/* Agents Architecture Overview Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-base font-black text-[#0B3A53] font-heading flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#16A6A1]" />
            <span>Travel Link Multi-Agent System Architecture</span>
          </h2>
          <span className="text-[10px] font-extrabold uppercase bg-[#16A6A1]/10 text-[#146C86] px-3 py-1 rounded-full">
            4 Autonomous Sub-Agents
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-semibold">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="font-extrabold text-[#0B3A53] flex items-center gap-1.5">
              <span>01. Travel Planner Agent</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Drafts initial day-by-day travel sequence & duration allocation.</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="font-extrabold text-[#0B3A53] flex items-center gap-1.5">
              <span>02. Research Agent</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Fetches opening hours, entry fees, and cultural event timetables.</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="font-extrabold text-[#0B3A53] flex items-center gap-1.5">
              <span>03. Environment & Route</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Calculates highway drive times & scenic train seat availability.</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="font-extrabold text-[#0B3A53] flex items-center gap-1.5">
              <span>04. Validation Agent</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Verifies safety constraints & submits to Human Operator Review.</p>
          </div>
        </div>
      </div>

      {/* AI Workflows Monitoring Data Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/80 text-[10px] font-black uppercase tracking-wider text-slate-400">
                <th className="py-4 px-5">Workflow Ref</th>
                <th className="py-4 px-5">Tourist</th>
                <th className="py-4 px-5">Destination</th>
                <th className="py-4 px-5">Active Agent</th>
                <th className="py-4 px-5">Validation Score</th>
                <th className="py-4 px-5">Status</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {workflows.map((wf) => (
                <tr key={wf.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-5 font-mono font-bold text-[#0B3A53]">{wf.workflowId}</td>
                  <td className="py-4 px-5 font-extrabold text-slate-800">{wf.touristName}</td>
                  <td className="py-4 px-5 font-bold text-[#146C86]">{wf.destination}</td>
                  <td className="py-4 px-5 text-slate-600">{wf.currentAgent}</td>
                  <td className="py-4 px-5">
                    <span className="font-black text-[#16A6A1]">{wf.validationScore}%</span>
                  </td>
                  <td className="py-4 px-5">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                        wf.status === 'Awaiting Approval'
                          ? 'bg-amber-100 text-amber-700'
                          : wf.status === 'Running'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {wf.status}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-right">
                    <button
                      onClick={() => setActiveWorkflowModal(wf)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0B3A53] font-bold text-[11px] transition-colors cursor-pointer inline-flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Execution Nodes</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* WORKFLOW PIPELINE NODE TIMELINE MODAL */}
      {activeWorkflowModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xl h-full p-6 sm:p-8 space-y-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] font-black uppercase text-[#16A6A1]">MULTI-AGENT PIPELINE</span>
                  <h3 className="text-xl font-black text-[#0B3A53] font-heading">
                    {activeWorkflowModal.workflowId} Execution Graph
                  </h3>
                </div>
                <button
                  onClick={() => setActiveWorkflowModal(null)}
                  className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Workflow Details */}
              <div className="bg-slate-50 p-4 rounded-3xl border border-slate-200 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="font-bold text-slate-500">Tourist:</span>
                  <span className="font-extrabold text-[#0B3A53]">{activeWorkflowModal.touristName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-slate-500">Target Region:</span>
                  <span className="font-extrabold text-[#146C86]">{activeWorkflowModal.destination}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-slate-500">Overall Validation Confidence:</span>
                  <span className="font-black text-[#16A6A1]">{activeWorkflowModal.validationScore}%</span>
                </div>
              </div>

              {/* Node Execution Flow */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase text-[#0B3A53]">Agent Nodes Execution Sequence</h4>
                <div className="space-y-3">
                  {activeWorkflowModal.agentsTimeline.map((node, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-[#0B3A53]">{node.agent}</span>
                        <span
                          className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                            node.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {node.status} ({node.duration})
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 font-medium leading-relaxed">{node.result}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Modal Bottom Actions */}
            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setActiveWorkflowModal(null)}
                className="px-6 py-3 rounded-full bg-[#0B3A53] text-white font-extrabold text-xs uppercase tracking-wider shadow-md cursor-pointer"
              >
                Close Pipeline View
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
