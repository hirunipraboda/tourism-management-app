import React from 'react';
import { Card } from '../ui/Card';
import { AIBadge } from './AIBadge';
import { WorkflowTimeline } from './WorkflowTimeline';
import { Button } from '../ui/Button';
import { AIWorkflowStatus } from '../../types/ai';

export interface AIStatusCardProps {
  workflow: AIWorkflowStatus;
  onApprove?: (id: string) => void;
  onViewDetails?: (id: string) => void;
}

export const AIStatusCard: React.FC<AIStatusCardProps> = ({
  workflow,
  onApprove,
  onViewDetails,
}) => {
  return (
    <Card className="border-l-4 border-l-[#16A6A1] space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <AIBadge label={workflow.agentName} />
            <span className="text-xs text-slate-400">• Updated {workflow.updatedAt}</span>
          </div>
          <h3 className="text-base font-extrabold text-[#0B3A53] mt-1">{workflow.tripTitle}</h3>
          <p className="text-xs text-slate-500">Destination: {workflow.destination}</p>
        </div>

        <div className="text-right">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Confidence Score</div>
          <div className="text-lg font-black text-[#146C86]">
            {Math.round(workflow.confidenceScore * 100)}%
          </div>
        </div>
      </div>

      <WorkflowTimeline currentStep={workflow.currentStep} />

      {workflow.notes && (
        <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-xl text-xs text-amber-900 leading-relaxed">
          <strong className="font-bold">Agent Advisory Note:</strong> {workflow.notes}
        </div>
      )}

      <div className="flex items-center justify-between pt-2">
        <span className="text-xs text-slate-500">
          Progress: <strong className="text-slate-800 font-bold">{workflow.progressPercent}%</strong>
        </span>

        <div className="flex items-center gap-2">
          {onViewDetails && (
            <Button variant="outline" size="sm" onClick={() => onViewDetails(workflow.id)}>
              Inspect Logs
            </Button>
          )}
          {workflow.requiresHumanAction && onApprove && (
            <Button variant="accent" size="sm" onClick={() => onApprove(workflow.id)}>
              Human Approval
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
