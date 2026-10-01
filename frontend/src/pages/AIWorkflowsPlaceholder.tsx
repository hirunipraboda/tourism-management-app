import React from 'react';
import { Cpu, Sparkles, CheckCircle2 } from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';
import { PageHeader } from '../components/ui/PageHeader';
import { AIStatusCard } from '../components/ai/AIStatusCard';
import { AgentCard } from '../components/ai/AgentCard';
import { SectionHeader } from '../components/ui/SectionHeader';
import { MOCK_AI_WORKFLOWS, MOCK_AGENTS } from '../mock/workflows';

export const AIWorkflowsPlaceholder: React.FC = () => {
  return (
    <PageContainer>
      <PageHeader
        title="AI Journey Workflows & Agent Telemetry"
        subtitle="Transparent multi-agent pipeline monitoring and validation steps"
        breadcrumbs={[{ label: 'AI Workflows' }]}
        badge={
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#16A6A1]/10 text-[#138D89] border border-[#16A6A1]/30">
            <Sparkles className="w-3.5 h-3.5 text-[#16A6A1]" />
            <span>3 Agents Active</span>
          </span>
        }
      />

      <div className="space-y-4">
        <SectionHeader title="Autonomous Agents" subtitle="Active LLM synthesis engines and validation guards" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {MOCK_AGENTS.map(agent => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <SectionHeader title="Active Workflow Pipelines" subtitle="Real-time trip synthesis progress" />
        <div className="space-y-4">
          {MOCK_AI_WORKFLOWS.map(wf => (
            <AIStatusCard key={wf.id} workflow={wf} />
          ))}
        </div>
      </div>
    </PageContainer>
  );
};
