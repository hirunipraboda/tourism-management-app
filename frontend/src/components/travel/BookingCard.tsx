import React from 'react';
import { Calendar, User, CreditCard } from 'lucide-react';
import { Card } from '../ui/Card';
import { StatusBadge } from '../ui/StatusBadge';
import { Booking } from '../../types/travel';
import { formatCurrency, formatDate } from '../../utils/formatters';

export interface BookingCardProps {
  booking: Booking;
}

export const BookingCard: React.FC<BookingCardProps> = ({ booking }) => {
  return (
    <Card hoverable className="space-y-3 border-l-4 border-l-[#146C86]">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-mono font-bold text-slate-400">{booking.bookingRef}</span>
          <h4 className="text-sm font-bold text-slate-900 mt-0.5">{booking.tourName}</h4>
        </div>
        <StatusBadge status={booking.bookingStatus} />
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
        <div className="flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-semibold text-slate-800">{booking.customerName}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>{formatDate(booking.travelDate)}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-1 text-xs">
        <span className="text-slate-400">
          Pax: <strong className="text-slate-700">{booking.pax} travelers</strong>
        </span>
        <div className="flex items-center gap-1">
          <CreditCard className="w-3.5 h-3.5 text-[#16A6A1]" />
          <span className="text-sm font-black text-[#0B3A53]">{formatCurrency(booking.totalAmount)}</span>
        </div>
      </div>
    </Card>
  );
};
