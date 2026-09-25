import React from 'react';
import { CheckSquare, ShieldAlert } from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';
import { PageHeader } from '../components/ui/PageHeader';
import { AIStatusCard } from '../components/ai/AIStatusCard';
import { MOCK_AI_WORKFLOWS } from '../mock/workflows';

export const ApprovalsPlaceholder: React.FC = () => {
  const pendingApprovals = MOCK_AI_WORKFLOWS.filter(w => w.requiresHumanAction);

  return (
    <PageContainer>
      <PageHeader
        title="Human Approval Queue"
        subtitle="Operator validation gates for AI-generated trip recommendations & safety alerts"
        breadcrumbs={[{ label: 'Approvals' }]}
      />
      <div className="space-y-4">
        {pendingApprovals.map(wf => (
          <AIStatusCard key={wf.id} workflow={wf} />
        ))}
      </div>
    </PageContainer>
  );
};
