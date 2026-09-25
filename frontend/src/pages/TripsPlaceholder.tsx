import React from 'react';
import { Map, Plus } from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Table } from '../components/ui/Table';
import { StatusBadge } from '../components/ui/StatusBadge';
import { MOCK_TRIPS } from '../mock/trips';
import { formatCurrency, formatDate } from '../utils/formatters';
import { TableColumn } from '../types/ui';
import { Trip } from '../types/travel';

export const TripsPlaceholder: React.FC = () => {
  const columns: TableColumn<Trip>[] = [
    {
      key: 'title',
      header: 'Trip Title',
      render: item => (
        <div>
          <h4 className="font-bold text-slate-900">{item.title}</h4>
          <span className="text-xs text-slate-400">{item.destinationName}</span>
        </div>
      ),
    },
    {
      key: 'travelerName',
      header: 'Traveler',
      render: item => (
        <div>
          <span className="font-semibold text-slate-800">{item.travelerName}</span>
          <p className="text-[11px] text-slate-400">{item.paxCount} Travelers</p>
        </div>
      ),
    },
    {
      key: 'dates',
      header: 'Dates & Duration',
      render: item => (
        <span className="text-xs text-slate-600">
          {formatDate(item.startDate)} ({item.durationDays} Days)
        </span>
      ),
    },
    {
      key: 'budget',
      header: 'Budget',
      render: item => <span className="font-extrabold text-[#0B3A53]">{formatCurrency(item.budget)}</span>,
    },
    {
      key: 'aiScore',
      header: 'AI Match Score',
      render: item => (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#16A6A1]/10 text-[#138D89] border border-[#16A6A1]/30">
          {item.aiScore}% Match
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: item => <StatusBadge status={item.status} />,
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Trips & Journey Plans"
        subtitle="Active, upcoming, and planned custom traveler journeys"
        breadcrumbs={[{ label: 'Trips' }]}
        actions={
          <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
            Create New Trip
          </Button>
        }
      />
      <Table columns={columns} data={MOCK_TRIPS} keyExtractor={item => item.id} />
    </PageContainer>
  );
};
