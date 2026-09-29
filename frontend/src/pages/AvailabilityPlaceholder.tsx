import React from 'react';
import { Clock, Calendar } from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';

export const AvailabilityPlaceholder: React.FC = () => {
  return (
    <PageContainer>
      <PageHeader
        title="Resource & Guide Availability Calendar"
        subtitle="Real-time capacity tracking for guides, transport fleets & tour slots"
        breadcrumbs={[{ label: 'Availability' }]}
      />
      <Card className="p-8 text-center space-y-3">
        <Clock className="w-12 h-12 text-[#146C86] mx-auto" />
        <h3 className="text-lg font-bold text-slate-900">Availability Dispatch Engine Initialized</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          The calendar matrix container is ready for high-density guide scheduling and resource allocation views.
        </p>
      </Card>
    </PageContainer>
  );
};
