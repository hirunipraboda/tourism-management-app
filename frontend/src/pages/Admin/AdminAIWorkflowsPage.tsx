import React, { useState, useEffect } from 'react';
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
  GitCommit,
  Check,
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { AIWorkflowMonitoringItem } from '../../types/adminTypes';

export const AdminAIWorkflowsPage: React.FC = () => {
  const [workflows, setWorkflows] = useState<AIWorkflowMonitoringItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeWorkflowModal, setActiveWorkflowModal] = useState<any | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  const loadWorkflows = async () => {
    setLoading(true);
    try {
      const data = await adminService.fetchWorkflows();
      setWorkflows(data);
    } catch (err) {
      console.error('Failed to load workflows', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkflows();
  }, []);

  const handleOpenWorkflow = async (id: string) => {
    setModalLoading(true);
    setActiveWorkflowModal({ id });
    try {
      const data = await adminService.fetchWorkflowDetails(id);
      setActiveWorkflowModal(data);
    } catch (err) {
      console.error('Failed to load workflow trace', err);
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0B3A53] font-heading tracking-tight">
            AI Multi-Agent Workflow Monitoring
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Autonomous multi-agent execution pipeline & deterministic safety validation engine.
          </p>
        </div>


      </div>

      {/* Visual Multi-Agent Architecture Timeline Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-base font-black text-[#0B3A53] font-heading flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#16A6A1]" />
            <span>NOVA 4-Agent Execution Pipeline & Human-in-the-Loop Protocol</span>
          </h2>
          <span className="text-[10px] font-extrabold uppercase bg-[#16A6A1]/10 text-[#146C86] px-3 py-1 rounded-full">
            Supervisor State Graph
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-semibold">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="font-extrabold text-[#0B3A53] flex items-center gap-1.5">
              <span>01. Travel Planning Agent</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Coordinates workflow, orchestrates day plan sequences and budget limits.</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="font-extrabold text-[#0B3A53] flex items-center gap-1.5">
              <span>02. Destination Research Agent</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Extracts attraction hours, entrance tariffs, and historical landmark context.</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="font-extrabold text-[#0B3A53] flex items-center gap-1.5">
              <span>03. Recommendation & Feedback Agent</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Analyzes sentiment reviews and personalizes pacing according to traveler preferences.</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="font-extrabold text-[#0B3A53] flex items-center gap-1.5">
              <span>04. Travel Logistics & Availability Agent</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Integrates express bus routes and Sri Lanka Railways train schedules.</p>
          </div>
        </div>
      </div>

      {/* Workflows Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-400">
                <th className="py-4 px-5">Workflow ID</th>
                <th className="py-4 px-5">Traveler</th>
                <th className="py-4 px-5">Destination</th>
                <th className="py-4 px-5">Current Step</th>
                <th className="py-4 px-5">Audit Steps</th>
                <th className="py-4 px-5">Status</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">Loading workflows...</td>
                </tr>
              ) : workflows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">No active AI workflows recorded.</td>
                </tr>
              ) : (
                workflows.map((wf) => (
                  <tr key={wf.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-5 font-mono font-bold text-[#0B3A53]">{wf.id}</td>
                    <td className="py-4 px-5 font-extrabold text-slate-800">{wf.userName}</td>
                    <td className="py-4 px-5 font-bold text-[#0B3A53]">{wf.destination}</td>
                    <td className="py-4 px-5 text-slate-600">{wf.currentStep}</td>
                    <td className="py-4 px-5 font-black text-indigo-600">{wf.auditLogsCount} logs</td>
                    <td className="py-4 px-5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-teal-50 text-teal-800 border border-teal-200">
                        {wf.status}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-right">
                      <button
                        onClick={() => handleOpenWorkflow(wf.id)}
                        className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1 font-bold text-[11px]"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Inspect Trace</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* WORKFLOW DETAIL MODAL */}
      {activeWorkflowModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-[#16A6A1]" />
                <h3 className="font-black text-base text-[#0B3A53]">
                  Workflow Trace Telemetry: {activeWorkflowModal.id}
                </h3>
              </div>
              <button
                onClick={() => setActiveWorkflowModal(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 text-xs">
              {modalLoading || !activeWorkflowModal.agentsTrace ? (
                <div className="py-16 text-center text-slate-400 font-semibold">
                  Loading multi-agent execution telemetry...
                </div>
              ) : (
                <>
                  {/* Pipeline Stepper */}
                  <div className="space-y-3">
                    <h4 className="font-black text-sm text-[#0B3A53] font-heading">
                      Operational Agent Execution Timeline
                    </h4>

                    <div className="space-y-2">
                      {activeWorkflowModal.agentsTrace.map((step: any, sIdx: number) => (
                        <div key={sIdx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-xl bg-teal-100 text-[#146C86] font-black text-xs flex items-center justify-center shrink-0">
                              {sIdx + 1}
                            </div>
                            <div>
                              <div className="font-extrabold text-slate-800">{step.Agent}</div>
                              <div className="text-[11px] text-slate-500 font-medium">{step.Step} · Tool: <code className="font-mono text-[10px] text-indigo-700">{step.ToolUsed}</code></div>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-100 text-emerald-800">
                              {step.Status}
                            </span>
                            {step.LatencyMs > 0 && (
                              <div className="text-[10px] text-slate-400 font-mono mt-0.5">{step.LatencyMs}ms</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Audit Logs */}
                  {activeWorkflowModal.AuditLogs && (
                    <div className="space-y-3">
                      <h4 className="font-black text-sm text-[#0B3A53] font-heading">
                        Step-by-Step State Audit Logs
                      </h4>

                      <div className="divide-y divide-slate-100 bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
                        {activeWorkflowModal.AuditLogs.map((log: any, lIdx: number) => (
                          <div key={lIdx} className="p-3 flex items-center justify-between text-[11px]">
                            <div>
                              <span className="font-black text-[#0B3A53]">{log.actor}</span>: {log.action}
                              <div className="text-slate-500 text-[10px]">{log.details}</div>
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {new Date(log.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 flex justify-end bg-slate-50/50">
              <button
                onClick={() => setActiveWorkflowModal(null)}
                className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold cursor-pointer"
              >
                Close Telemetry
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
