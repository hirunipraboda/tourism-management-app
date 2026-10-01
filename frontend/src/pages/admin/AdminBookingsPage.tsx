import React, { useState, useMemo } from 'react';
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
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { AdminBooking } from '../../mock/mockAdminData';

export const AdminBookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<AdminBooking[]>(adminService.getBookings());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [activeBookingModal, setActiveBookingModal] = useState<AdminBooking | null>(null);

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const matchesSearch =
        b.bookingCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.touristName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.packageName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = selectedStatus === 'All' || b.status === selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }, [bookings, searchQuery, selectedStatus]);

  const handleUpdateStatus = (id: string, status: AdminBooking['status']) => {
    const updated = adminService.updateBookingStatus(id, status);
    setBookings([...updated]);
    if (activeBookingModal && activeBookingModal.id === id) {
      setActiveBookingModal({ ...activeBookingModal, status });
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
            Monitor, confirm, cancel, and review tourist travel bookings and reservation timelines.
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search booking code, tourist, or package..."
            className="w-full h-11 pl-10 pr-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-[#0B3A53] placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#16A6A1]"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs font-bold text-slate-400 uppercase">Filter Status:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs font-bold text-[#0B3A53] px-3 py-2 rounded-xl focus:outline-none focus:border-[#16A6A1] cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Bookings Data Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/80 text-[10px] font-black uppercase tracking-wider text-slate-400">
                <th className="py-4 px-5">Booking Ref</th>
                <th className="py-4 px-5">Tourist</th>
                <th className="py-4 px-5">Package / Destination</th>
                <th className="py-4 px-5">Travel Date</th>
                <th className="py-4 px-5">Travelers</th>
                <th className="py-4 px-5">Amount</th>
                <th className="py-4 px-5">Status</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredBookings.map((bkg) => (
                <tr key={bkg.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-5 font-mono font-bold text-[#0B3A53]">{bkg.bookingCode}</td>
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-2.5">
                      <img src={bkg.touristAvatar} alt="" className="w-7 h-7 rounded-full object-cover" />
                      <div>
                        <div className="font-extrabold text-[#0B3A53]">{bkg.touristName}</div>
                        <div className="text-[10px] text-slate-400">{bkg.touristEmail}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-5">
                    <div className="font-bold text-[#0B3A53] max-w-[200px] truncate">{bkg.packageName}</div>
                    <div className="text-[10px] text-[#146C86] font-extrabold">{bkg.destinationName}</div>
                  </td>
                  <td className="py-4 px-5 text-slate-600">{bkg.travelDate}</td>
                  <td className="py-4 px-5 font-bold text-[#0B3A53]">{bkg.travelersCount} Pax</td>
                  <td className="py-4 px-5 font-black text-[#146C86]">${bkg.totalAmount}</td>
                  <td className="py-4 px-5">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                        bkg.status === 'Confirmed'
                          ? 'bg-emerald-100 text-emerald-700'
                          : bkg.status === 'Pending'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {bkg.status}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-right">
                    <button
                      onClick={() => setActiveBookingModal(bkg)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0B3A53] font-bold text-[11px] transition-colors cursor-pointer inline-flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Details</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* BOOKING DETAILS & TIMELINE MODAL */}
      {activeBookingModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xl h-full p-6 sm:p-8 space-y-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] font-black uppercase text-[#16A6A1]">BOOKING SUMMARY</span>
                  <h3 className="text-xl font-black text-[#0B3A53] font-heading">
                    Booking #{activeBookingModal.bookingCode}
                  </h3>
                </div>
                <button
                  onClick={() => setActiveBookingModal(null)}
                  className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Tourist Info Card */}
              <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200/80 space-y-3">
                <div className="flex items-center gap-3">
                  <img src={activeBookingModal.touristAvatar} alt="" className="w-12 h-12 rounded-full object-cover border" />
                  <div>
                    <h4 className="text-base font-black text-[#0B3A53]">{activeBookingModal.touristName}</h4>
                    <p className="text-xs font-semibold text-slate-500">{activeBookingModal.touristEmail}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-200">
                  <div>
                    <span className="text-slate-400 font-bold">Package:</span>
                    <div className="font-extrabold text-[#0B3A53]">{activeBookingModal.packageName}</div>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold">Total Amount:</span>
                    <div className="font-black text-[#146C86]">${activeBookingModal.totalAmount} ({activeBookingModal.paymentStatus})</div>
                  </div>
                </div>
              </div>

              {/* Booking Timeline */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase text-[#0B3A53]">Reservation Timeline</h4>
                <div className="space-y-3 pl-2 text-xs">
                  {activeBookingModal.timeline.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-3 relative">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                        step.status === 'completed' ? 'bg-[#16A6A1] text-white' : 'bg-slate-200 text-slate-500'
                      }`}>
                        ✓
                      </div>
                      <div>
                        <div className="font-extrabold text-[#0B3A53]">{step.title}</div>
                        <div className="text-[10px] text-slate-400 font-medium">{step.timestamp}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                onClick={() => handleUpdateStatus(activeBookingModal.id, 'Cancelled')}
                className="px-5 py-2.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs cursor-pointer"
              >
                Cancel Booking
              </button>
              <button
                onClick={() => handleUpdateStatus(activeBookingModal.id, 'Confirmed')}
                className="px-6 py-2.5 rounded-full bg-[#0B3A53] hover:bg-[#072537] text-white font-extrabold text-xs uppercase tracking-wider shadow-md cursor-pointer"
              >
                Confirm Booking
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
