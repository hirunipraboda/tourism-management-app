import React from 'react';
import { Card } from '../ui/Card';
import { StatusBadge } from '../ui/StatusBadge';
import { AIAgent } from '../../types/ai';
import { Cpu, ShieldAlert, Sparkles, Route } from 'lucide-react';

export interface AgentCardProps {
  agent: AIAgent;
}

export const AgentCard: React.FC<AgentCardProps> = ({ agent }) => {
  const getIcon = () => {
    switch (agent.avatarIcon) {
      case 'Route':
        return <Route className="w-5 h-5 text-[#16A6A1]" />;
      case 'ShieldAlert':
        return <ShieldAlert className="w-5 h-5 text-amber-500" />;
      default:
        return <Sparkles className="w-5 h-5 text-[#146C86]" />;
    }
  };

  return (
    <Card hoverable className="space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-slate-100 rounded-xl">{getIcon()}</div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">{agent.name}</h4>
            <p className="text-xs text-slate-500">{agent.role}</p>
          </div>
        </div>
        <StatusBadge status={agent.status} />
      </div>

      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
        <div>
          <span className="text-slate-400">Tasks Today:</span>
          <p className="font-bold text-slate-800">{agent.tasksCompletedToday}</p>
        </div>
        <div>
          <span className="text-slate-400">Accuracy Rate:</span>
          <p className="font-bold text-emerald-600">{agent.accuracyRate}%</p>
        </div>
      </div>
    </Card>
  );
};
