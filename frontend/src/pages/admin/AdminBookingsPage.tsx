import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  Search,
  X,
  Eye,
  CheckCircle2,
  Clock,
  DollarSign,
  User,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { AdminBookingItem } from '../../types/adminTypes';

export const AdminBookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<AdminBookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [activeBookingModal, setActiveBookingModal] = useState<AdminBookingItem | null>(null);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const data = await adminService.fetchBookings(selectedStatus, searchQuery);
      setBookings(data);
    } catch (err) {
      console.error('Failed to load bookings', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [selectedStatus]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadBookings();
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await adminService.updateBookingStatus(id, newStatus);
      loadBookings();
      if (activeBookingModal && activeBookingModal.id === id) {
        setActiveBookingModal({ ...activeBookingModal, status: newStatus as any });
      }
    } catch {
      alert('Failed to update booking status.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0B3A53] font-heading tracking-tight">
            Booking Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Monitor, inspect, and manage service reservations for itineraries, transport transfers, and AI Guide subscriptions.
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearch} className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search booking ref or traveler..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-[#16A6A1]"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </form>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          {['All', 'Confirmed', 'Completed', 'Pending', 'Cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedStatus === status
                  ? 'bg-[#0B3A53] text-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-400">
                <th className="py-4 px-5">Booking Ref</th>
                <th className="py-4 px-5">Traveler</th>
                <th className="py-4 px-5">Service</th>
                <th className="py-4 px-5">Type</th>
                <th className="py-4 px-5">Amount</th>
                <th className="py-4 px-5">Booking Date</th>
                <th className="py-4 px-5">Status</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">Loading bookings...</td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">No bookings found.</td>
                </tr>
              ) : (
                bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-5 font-mono font-bold text-[#0B3A53]">{b.id}</td>
                    <td className="py-4 px-5">
                      <div className="font-extrabold text-slate-800">{b.customerName}</div>
                      <div className="text-[11px] text-slate-400">{b.customerEmail}</div>
                    </td>
                    <td className="py-4 px-5 font-bold text-slate-800">{b.serviceName}</td>
                    <td className="py-4 px-5">
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                        {b.serviceType}
                      </span>
                    </td>
                    <td className="py-4 px-5 font-black text-[#146C86]">${b.amount}</td>
                    <td className="py-4 px-5 text-slate-500">
                      {new Date(b.bookingDate || b.date || b.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-5">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase inline-flex items-center gap-1 ${
                          b.status === 'Confirmed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : b.status === 'Completed'
                            ? 'bg-blue-100 text-blue-800'
                            : b.status === 'Pending'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-right">
                      <button
                        onClick={() => setActiveBookingModal(b)}
                        className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="font-bold text-[11px]">Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* INSPECT BOOKING MODAL */}
      {activeBookingModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-sm text-[#0B3A53]">Booking Record {activeBookingModal.id}</h3>
                <span className="text-[10px] text-slate-400 font-bold uppercase">{activeBookingModal.serviceType}</span>
              </div>
              <button
                onClick={() => setActiveBookingModal(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Customer</span>
                  <div className="font-extrabold text-slate-800">{activeBookingModal.customerName}</div>
                  <div className="text-[11px] text-slate-400">{activeBookingModal.customerEmail}</div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Total Paid</span>
                  <div className="font-black text-[#146C86] text-base">${activeBookingModal.amount}</div>
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-700">Reserved Service</span>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 font-semibold text-slate-800 mt-1">
                  {activeBookingModal.serviceName}
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-700 block mb-1">Update Booking Status</span>
                <div className="flex gap-2">
                  {['Confirmed', 'Completed', 'Cancelled'].map((st) => (
                    <button
                      key={st}
                      onClick={() => handleUpdateStatus(activeBookingModal.id, st)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        activeBookingModal.status === st
                          ? 'bg-[#16A6A1] text-white shadow-2xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setActiveBookingModal(null)}
                className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
