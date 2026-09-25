import React from 'react';
import { Compass, Plus, Filter } from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { SearchInput } from '../components/ui/SearchInput';
import { DestinationCard } from '../components/travel/DestinationCard';
import { MOCK_DESTINATIONS } from '../mock/destinations';

export const DestinationsPlaceholder: React.FC = () => {
  return (
    <PageContainer>
      <PageHeader
        title="Destinations"
        subtitle="Manage destination hubs, regional catalog & smart travel metrics"
        breadcrumbs={[{ label: 'Destinations' }]}
        actions={
          <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
            Add Destination
          </Button>
        }
      />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-72">
          <SearchInput placeholder="Filter by region, country..." />
        </div>
        <Button variant="outline" size="sm" leftIcon={<Filter className="w-4 h-4" />}>
          Filter Category
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_DESTINATIONS.map(dest => (
          <DestinationCard key={dest.id} destination={dest} />
        ))}
      </div>
    </PageContainer>
  );
};
