import React from 'react';
import { BarChart3, TrendingUp } from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { StatBarChart } from '../components/charts/StatBarChart';

export const ReportsPlaceholder: React.FC = () => {
  const barData = [
    { name: 'Kyoto', bookings: 340 },
    { name: 'Amalfi', bookings: 280 },
    { name: 'Swiss Alps', bookings: 420 },
    { name: 'Reykjavik', bookings: 190 },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Travel Analytics & Reports"
        subtitle="Gross merchandise value, destination performance & traveler demographics"
        breadcrumbs={[{ label: 'Reports' }]}
      />
      <Card className="space-y-3">
        <h3 className="text-sm font-bold text-[#0B3A53]">Bookings per Destination Hub</h3>
        <StatBarChart data={barData} height={260} />
      </Card>
    </PageContainer>
  );
};
