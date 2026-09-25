import React from 'react';
import { Compass, CalendarCheck, Cpu, DollarSign, ArrowUpRight, Plus, Sparkles, Map } from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';
import { PageHeader } from '../components/ui/PageHeader';
import { StatCard } from '../components/ui/StatCard';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { SectionHeader } from '../components/ui/SectionHeader';
import { StatusBadge } from '../components/ui/StatusBadge';
import { AIStatusCard } from '../components/ai/AIStatusCard';
import { DestinationCard } from '../components/travel/DestinationCard';
import { StatAreaChart } from '../components/charts/StatAreaChart';
import { MOCK_DESTINATIONS } from '../mock/destinations';
import { MOCK_AI_WORKFLOWS } from '../mock/workflows';
import { MOCK_BOOKINGS } from '../mock/bookings';
import { formatCurrency, formatDate } from '../utils/formatters';

export const OverviewPlaceholder: React.FC = () => {
  const chartData = [
    { name: 'Jan', value: 120, aiOptimized: 140 },
    { name: 'Feb', value: 180, aiOptimized: 210 },
    { name: 'Mar', value: 240, aiOptimized: 290 },
    { name: 'Apr', value: 310, aiOptimized: 380 },
    { name: 'May', value: 420, aiOptimized: 510 },
    { name: 'Jun', value: 580, aiOptimized: 720 },
  ];

  return (
    <PageContainer>
      {/* Top Banner Header */}
      <PageHeader
        title="Dashboard Overview"
        subtitle="NOVA Smart Journey Telemetry & Operator Console"
        breadcrumbs={[{ label: 'Overview' }]}
        badge={
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#16A6A1]/10 text-[#138D89] border border-[#16A6A1]/30">
            <Sparkles className="w-3.5 h-3.5 text-[#16A6A1]" />
            <span>AI Telemetry Syncing</span>
          </span>
        }
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" leftIcon={<Sparkles className="w-4 h-4 text-[#16A6A1]" />}>
              Run AI Optimization
            </Button>
            <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
              New Trip Blueprint
            </Button>
          </div>
        }
      />

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Active Journeys"
          value="142"
          change="+18.4%"
          changeType="positive"
          icon={<Map className="w-5 h-5 text-[#0B3A53]" />}
          subtitle="28 destinations"
        />
        <StatCard
          title="Monthly Bookings"
          value="1,248"
          change="+12.1%"
          changeType="positive"
          icon={<CalendarCheck className="w-5 h-5 text-[#146C86]" />}
          subtitle="$480k gross volume"
        />
        <StatCard
          title="AI Workflows Running"
          value="24"
          change="3 approvals"
          changeType="neutral"
          icon={<Cpu className="w-5 h-5 text-[#16A6A1]" />}
          accentBorder
        />
        <StatCard
          title="Gross Revenue"
          value="$512.4K"
          change="+24.6%"
          changeType="positive"
          icon={<DollarSign className="w-5 h-5 text-amber-500" />}
          subtitle="Avg $4.1k/booking"
        />
      </div>

      {/* AI Workflows & Chart Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: AI Active Workflows */}
        <div className="lg:col-span-2 space-y-4">
          <SectionHeader
            title="Active AI Journey Workflows"
            subtitle="Autonomous route synthesis & multi-agent validation"
            actions={
              <Button variant="ghost" size="sm" rightIcon={<ArrowUpRight className="w-4 h-4" />}>
                View All Workflows
              </Button>
            }
          />
          <AIStatusCard workflow={MOCK_AI_WORKFLOWS[0]} />
        </div>

        {/* Right: Booking Trends Chart */}
        <div className="space-y-4">
          <SectionHeader title="Journey Growth & AI Uplift" subtitle="Comparing standard vs AI optimized" />
          <Card>
            <StatAreaChart data={chartData} height={210} />
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0B3A53]" /> Standard
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#16A6A1]" /> AI Optimized
              </span>
            </div>
          </Card>
        </div>
      </div>

      {/* Featured Destinations & Recent Bookings Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <SectionHeader title="Featured Destination Hubs" subtitle="Top performing smart tourism regions" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <DestinationCard destination={MOCK_DESTINATIONS[0]} />
            <DestinationCard destination={MOCK_DESTINATIONS[1]} />
          </div>
        </div>

        <div className="space-y-4">
          <SectionHeader title="Recent Booking Activity" subtitle="Live operator transaction feed" />
          <Card padding="none">
            <div className="divide-y divide-slate-100">
              {MOCK_BOOKINGS.map(booking => (
                <div key={booking.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono font-bold text-slate-400">{booking.bookingRef}</span>
                    <StatusBadge status={booking.bookingStatus} />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{booking.tourName}</h4>
                  <div className="flex items-center justify-between mt-2 text-[11px] text-slate-500">
                    <span>{booking.customerName}</span>
                    <strong className="text-[#0B3A53] font-bold">{formatCurrency(booking.totalAmount)}</strong>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
};
