import React from 'react';
import { MapPin, Plus } from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { AttractionCard } from '../components/travel/AttractionCard';
import { MOCK_ATTRACTIONS } from '../mock/attractions';

export const AttractionsPlaceholder: React.FC = () => {
  return (
    <PageContainer>
      <PageHeader
        title="Attractions & Points of Interest"
        subtitle="Catalog of natural, cultural, and historical traveler experiences"
        breadcrumbs={[{ label: 'Attractions' }]}
        actions={
          <Button variant="accent" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
            New Attraction
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_ATTRACTIONS.map(attr => (
          <AttractionCard key={attr.id} attraction={attr} />
        ))}
      </div>
    </PageContainer>
  );
};
