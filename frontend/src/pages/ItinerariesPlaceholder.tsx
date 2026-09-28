import React from 'react';
import { Route, Sparkles } from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

export const ItinerariesPlaceholder: React.FC = () => {
  return (
    <PageContainer>
      <PageHeader
        title="Itineraries & Day-by-Day Schedules"
        subtitle="Multi-modal travel routes and AI optimized timelines"
        breadcrumbs={[{ label: 'Itineraries' }]}
        badge={<Badge variant="accent">AI Synthesized</Badge>}
      />
      <Card className="p-8 text-center space-y-3">
        <Route className="w-12 h-12 text-[#16A6A1] mx-auto" />
        <h3 className="text-lg font-bold text-slate-900">Itinerary Builder Architecture Ready</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          The day-by-day itinerary sequence engine foundation is initialized. Detailed drag-and-drop schedule controls will be populated per page specification.
        </p>
      </Card>
    </PageContainer>
  );
};
