import React from 'react';
import { CalendarCheck, Plus } from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { BookingCard } from '../components/travel/BookingCard';
import { MOCK_BOOKINGS } from '../mock/bookings';

export const BookingsPlaceholder: React.FC = () => {
  return (
    <PageContainer>
      <PageHeader
        title="Bookings & Reservations"
        subtitle="Manage tourist reservations, payment transactions and vouchers"
        breadcrumbs={[{ label: 'Bookings' }]}
        actions={
          <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
            Manual Booking Entry
          </Button>
        }
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_BOOKINGS.map(bk => (
          <BookingCard key={bk.id} booking={bk} />
        ))}
      </div>
    </PageContainer>
  );
};
