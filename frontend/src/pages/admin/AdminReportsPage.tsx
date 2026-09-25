import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  Compass,
  CalendarCheck,
  Cpu,
  Sparkles,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { adminService } from '../../services/adminService';

export const AdminReportsPage: React.FC = () => {
  const [dateRange, setDateRange] = useState<'Today' | '7 Days' | '30 Days' | '3 Months'>('30 Days');
  const destinations = adminService.getDestinations();

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0B3A53] font-heading tracking-tight">
            Analytics & Reports
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Data-driven insights into booking growth, destination performance, and AI workflow accuracy.
          </p>
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-1 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-2xs">
          {(['Today', '7 Days', '30 Days', '3 Months'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-4 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                dateRange === range ? 'bg-[#0B3A53] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Analytics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Booking Conversion Rate */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-black text-[#0B3A53]">Booking Conversion Rate</h3>
            <span className="text-xs font-extrabold text-emerald-600">+4.2%</span>
          </div>
          <div className="text-3xl font-black text-[#0B3A53] font-heading">68.4%</div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#146C86] to-[#16A6A1]" style={{ width: '68.4%' }} />
          </div>
          <p className="text-[11px] text-slate-400 font-medium">68% of generated itineraries convert to bookings</p>
        </div>

        {/* AI Agent Success Rate */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-black text-[#0B3A53]">AI Agent Accuracy Rate</h3>
            <span className="text-xs font-extrabold text-emerald-600">99.4%</span>
          </div>
          <div className="text-3xl font-black text-[#0B3A53] font-heading">99.4%</div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-[#16A6A1]" style={{ width: '99.4%' }} />
          </div>
          <p className="text-[11px] text-slate-400 font-medium">Validations passed without operator rejection</p>
        </div>

        {/* Operator Human Approval Rate */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-black text-[#0B3A53]">Human Approval Rate</h3>
            <span className="text-xs font-extrabold text-teal-600">95.2%</span>
          </div>
          <div className="text-3xl font-black text-[#0B3A53] font-heading">95.2%</div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#0B3A53] to-[#16A6A1]" style={{ width: '95.2%' }} />
          </div>
          <p className="text-[11px] text-slate-400 font-medium">Approved on first operator inspection</p>
        </div>

      </div>

      {/* Popular Destination Rankings Report */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-black text-[#0B3A53] font-heading">Regional Destination Demand Report</h3>
            <p className="text-[11px] text-slate-400 font-medium">Booking distribution by province and region</p>
          </div>
        </div>

        <div className="space-y-3">
          {destinations.map((dest) => {
            const percent = Math.min(100, Math.round((dest.bookingsCount / 1240) * 100));
            return (
              <div key={dest.id} className="space-y-1 text-xs font-bold">
                <div className="flex justify-between">
                  <span className="text-[#0B3A53]">{dest.name} ({dest.province})</span>
                  <span className="text-[#146C86]">{dest.bookingsCount} Bookings ({percent}%)</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#0B3A53] via-[#146C86] to-[#16A6A1]"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
