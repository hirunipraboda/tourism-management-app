import React, { useState } from 'react';
import {
  Clock,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckCircle2,
  AlertCircle,
  Package,
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { AdminAvailabilityEvent } from '../../mock/mockAdminData';

export const AdminAvailabilityPage: React.FC = () => {
  const [availability, setAvailability] = useState<AdminAvailabilityEvent[]>(adminService.getAvailability());
  const [viewMode, setViewMode] = useState<'Month' | 'Week' | 'Day'>('Month');
  const [currentMonth, setCurrentMonth] = useState('October 2026');

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0B3A53] font-heading tracking-tight">
            Availability & Schedule
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Monitor capacity, tour package availability calendars, and booking slot conflicts.
          </p>
        </div>

        {/* Month / Week / Day Switcher */}
        <div className="flex items-center gap-1 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-2xs">
          {(['Month', 'Week', 'Day'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-4 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                viewMode === mode ? 'bg-[#0B3A53] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar Control Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-lg font-black text-[#0B3A53] font-heading">{currentMonth}</span>
          <button className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Legend Indicators */}
        <div className="flex items-center gap-4 text-xs font-bold">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-slate-600">Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-slate-600">Partially Booked</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500" />
            <span className="text-slate-600">Fully Booked</span>
          </div>
        </div>
      </div>

      {/* Calendar Grid Representation */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-black uppercase text-slate-400 border-b border-slate-100 pb-3">
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
          <div>Sun</div>
        </div>

        {/* 5 Weeks Calendar Matrix */}
        <div className="grid grid-cols-7 gap-2 text-xs font-bold">
          {Array.from({ length: 35 }).map((_, idx) => {
            const dayNum = idx - 2; // Offset for month starting day
            const isValidDay = dayNum > 0 && dayNum <= 31;
            const slot = availability.find((a) => a.date.endsWith(dayNum < 10 ? `0${dayNum}` : `${dayNum}`));

            return (
              <div
                key={idx}
                className={`min-h-[90px] p-2.5 rounded-2xl border transition-all flex flex-col justify-between ${
                  isValidDay
                    ? 'bg-slate-50/70 border-slate-200/70 hover:border-[#16A6A1]'
                    : 'bg-slate-100/40 border-transparent text-slate-300 pointer-events-none'
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className={isValidDay ? 'text-[#0B3A53] font-black' : 'text-slate-300'}>
                    {isValidDay ? dayNum : ''}
                  </span>
                  {slot && (
                    <span
                      className={`w-2 h-2 rounded-full ${
                        slot.status === 'Fully Booked' ? 'bg-rose-500' : 'bg-amber-500'
                      }`}
                    />
                  )}
                </div>

                {slot && isValidDay && (
                  <div className="bg-white p-1.5 rounded-xl border border-slate-200 shadow-2xs space-y-0.5">
                    <div className="text-[10px] font-black text-[#0B3A53] truncate">{slot.title}</div>
                    <div className="text-[9px] text-[#146C86] font-extrabold">
                      {slot.bookedCount}/{slot.capacity} Booked
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
