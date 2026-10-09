import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Search,
  Receipt,
  XCircle,
  FileCheck
} from 'lucide-react';
import { guideService, GuideBookingResponse } from '../../services/guideService';

export const MyGuideBookingsSection: React.FC = () => {
  const [bookings, setBookings] = useState<GuideBookingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<GuideBookingResponse | null>(null);

  const loadBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await guideService.getMyCustomerBookings();
      setBookings(res);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch guide bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handlePayNow = async (bookingId: string) => {
    setActionLoadingId(bookingId);
    try {
      await guideService.payBooking(bookingId, 'Card (Visa)');
      await loadBookings();
    } catch (err: any) {
      alert(err.message || 'Payment failed.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!window.confirm('Are you sure you want to cancel this tour guide booking?')) return;
    setActionLoadingId(bookingId);
    try {
      await guideService.cancelBooking(bookingId, 'Customer requested cancellation via portal');
      await loadBookings();
    } catch (err: any) {
      alert(err.message || 'Cancellation failed.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const filtered = bookings.filter(b => {
    if (statusFilter === 'All') return true;
    return b.status.toLowerCase() === statusFilter.toLowerCase();
  });

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[11px] border border-emerald-200">CONFIRMED</span>;
      case 'pendingguideapproval':
        return <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 font-extrabold text-[11px] border border-blue-200">PENDING GUIDE APPROVAL</span>;
      case 'pendingpayment':
        return <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-extrabold text-[11px] border border-amber-200">PENDING PAYMENT</span>;
      case 'completed':
        return <span className="px-2.5 py-1 rounded-full bg-teal-100 text-teal-800 font-extrabold text-[11px] border border-teal-200">COMPLETED</span>;
      case 'cancelled':
        return <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 font-extrabold text-[11px] border border-rose-200">CANCELLED</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-extrabold text-[11px]">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {['All', 'PendingPayment', 'PendingGuideApproval', 'Confirmed', 'Completed', 'Cancelled'].map(filter => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                statusFilter === filter
                  ? 'bg-[#0B3A53] text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {filter === 'PendingPayment' ? 'Needs Payment' : (filter === 'PendingGuideApproval' ? 'Awaiting Guide' : filter)}
            </button>
          ))}
        </div>

        <button
          onClick={loadBookings}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs font-bold text-[#146C86] hover:text-[#0B3A53] self-end sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* Bookings Content */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#14B8A6]" />
          <span className="text-xs font-bold">Loading your guide reservations...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-100 space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-teal-50 text-[#14B8A6] flex items-center justify-center mx-auto">
            <Calendar className="w-7 h-7" />
          </div>
          <h4 className="text-base font-extrabold text-[#0B3A53]">No Guide Bookings Found</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You don't have any tour guide bookings matching this filter. Explore certified guides to book your next trip!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(booking => (
            <div
              key={booking.id}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <span className="text-[11px] font-mono font-bold text-slate-400">{booking.id}</span>
                    <h4 className="font-extrabold text-[#0B3A53] text-base font-heading">{booking.guideName}</h4>
                    <span className="text-xs text-slate-500 font-medium">Contact: {booking.guideEmail}</span>
                  </div>
                  <div>{getStatusBadge(booking.status)}</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl space-y-2 text-xs text-slate-600 mb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-[#14B8A6] shrink-0" />
                    <span>{booking.startDate} to {booking.endDate} ({booking.billableDays} {booking.billableDays === 1 ? 'day' : 'days'})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-[#14B8A6] shrink-0" />
                    <span>{booking.startTime} - {booking.endTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-[#14B8A6] shrink-0" />
                    <span>{booking.travelers} Travelers</span>
                  </div>
                  {booking.destinations && booking.destinations.length > 0 && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#14B8A6] shrink-0" />
                      <span>{booking.destinations.map(d => d.destinationName).join(', ')}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-baseline justify-between pt-2 border-t border-slate-100">
                  <span className="text-xs text-slate-500 font-semibold">Total Price:</span>
                  <span className="text-lg font-black text-[#0B3A53] font-heading">${booking.totalAmount.toFixed(2)} {booking.currency}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                {booking.status.toLowerCase() === 'pendingpayment' && (
                  <button
                    onClick={() => handlePayNow(booking.id)}
                    disabled={actionLoadingId === booking.id}
                    className="px-4 py-2 rounded-xl text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-xs flex items-center gap-1.5"
                  >
                    {actionLoadingId === booking.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CreditCard className="w-3.5 h-3.5" />}
                    Pay Now
                  </button>
                )}

                <button
                  onClick={() => setSelectedReceipt(booking)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-[#0B3A53] bg-slate-100 hover:bg-slate-200 transition-colors flex items-center gap-1"
                >
                  <Receipt className="w-3.5 h-3.5 text-slate-500" /> Receipt
                </button>

                {['pendingpayment', 'pendingguideapproval', 'confirmed'].includes(booking.status.toLowerCase()) && (
                  <button
                    onClick={() => handleCancelBooking(booking.id)}
                    disabled={actionLoadingId === booking.id}
                    className="px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-teal-600" />
                <h4 className="font-extrabold text-[#0B3A53] text-base">Booking Statement</h4>
              </div>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex justify-between">
                <span className="text-slate-400">Reference:</span>
                <span className="font-mono font-bold text-slate-800">{selectedReceipt.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Tour Guide:</span>
                <span className="font-bold text-slate-800">{selectedReceipt.guideName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <span>{getStatusBadge(selectedReceipt.status)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Dates:</span>
                <span className="font-bold text-slate-800">{selectedReceipt.startDate} to {selectedReceipt.endDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Billable Days:</span>
                <span className="font-bold text-slate-800">{selectedReceipt.billableDays} Days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Subtotal:</span>
                <span className="font-bold text-slate-800">${selectedReceipt.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Platform Insurance Fee (15%):</span>
                <span className="font-bold text-slate-800">${selectedReceipt.serviceFee.toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                <span className="font-black text-[#0B3A53] text-sm">Total Paid / Due:</span>
                <span className="text-xl font-black text-[#0B3A53] font-heading">${selectedReceipt.totalAmount.toFixed(2)} USD</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedReceipt(null)}
              className="w-full py-2.5 rounded-xl bg-[#0B3A53] text-white font-extrabold text-xs shadow-md"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
