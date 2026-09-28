import React from 'react';
import { Package, Plus } from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { MOCK_TOURS } from '../services/tourService';
import { formatCurrency } from '../utils/formatters';

export const ToursPlaceholder: React.FC = () => {
  return (
    <PageContainer>
      <PageHeader
        title="Tour Packages"
        subtitle="Pre-packaged operator tours and curated group experiences"
        breadcrumbs={[{ label: 'Tour Packages' }]}
        actions={
          <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
            Create Tour Package
          </Button>
        }
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {MOCK_TOURS.map(tour => (
          <Card key={tour.id} hoverable className="space-y-3 border-l-4 border-l-[#0B3A53]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-400">{tour.code}</span>
              <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                {tour.status}
              </span>
            </div>
            <h3 className="text-base font-extrabold text-[#0B3A53]">{tour.title}</h3>
            <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
              <span>{tour.durationDays} Days • Max {tour.maxGroupSize} Guests</span>
              <strong className="text-sm font-black text-[#146C86]">{formatCurrency(tour.price)}</strong>
            </div>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
};
