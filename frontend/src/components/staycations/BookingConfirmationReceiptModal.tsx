import React, { useState } from 'react';
import {
  X,
  Printer,
  Copy,
  Check,
  CheckCircle2,
  Building2,
  Calendar,
  Users,
  ShieldCheck,
  MapPin,
  Clock,
  Sparkles,
  Tag,
  CreditCard,
  QrCode,
  FileText
} from 'lucide-react';
import { TripBookingDetail } from '../../mock/tripsData';
import { AccommodationItem } from '../../mock/manualPlannerData';

interface BookingConfirmationReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: TripBookingDetail | null;
  tripName?: string;
  staycation?: AccommodationItem | null;
}

export const BookingConfirmationReceiptModal: React.FC<BookingConfirmationReceiptModalProps> = ({
  isOpen,
  onClose,
  booking,
  tripName,
  staycation,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen || !booking) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(booking.confirmationCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  // Derive display values with safe fallbacks
  const guestName = booking.guestName || 'Hiruni Praboda';
  const guestEmail = booking.guestEmail || 'hiruni.praboda@gmail.com';
  const guestPhone = booking.guestPhone || '+94 77 123 4567';
  const propertyName = booking.provider;
  const packageName = booking.packageName || staycation?.packageName || booking.details.split('·')[0].trim();
  const destination = booking.destination || staycation?.destination || 'Sri Lanka';
  const dates = booking.dates;
  const nights = booking.nights || 2;
  const rooms = booking.rooms || 1;
  const totalAmount = booking.amount.startsWith('$') ? booking.amount : `$${booking.amount}`;
  const paymentMethod = booking.paymentMethod || 'Verified Card / Guaranteed Reservation';
  const bookedAt = booking.bookedAt || 'Confirmed on Reservation';
  const facilities = booking.includedFacilities || staycation?.includedFacilities || [
    'Daily Gourmet Breakfast Included',
    'Swimming Pool & Sun Lounger Access',
    'High-Speed Wi-Fi & Lounge Access',
    'Complimentary Welcome Ceylon Tea',
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200 print:p-0 print:bg-white">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col relative my-auto print:shadow-none print:border-none print:max-w-none print:w-full">
        
        {/* Top Control Bar (Hidden during print) */}
        <div className="bg-slate-900 text-white px-6 py-3.5 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#16A6A1]" />
            <span className="text-xs font-black tracking-wider uppercase">
              Official Booking Confirmation & Receipt
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer"
              title="Print Receipt"
            >
              <Printer className="w-3.5 h-3.5 text-teal-300" />
              <span>Print / Save PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* RECEIPT BODY (Print-Friendly) */}
        <div className="p-6 sm:p-8 space-y-6 text-slate-800 bg-white">
          
          {/* Receipt Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b-2 border-dashed border-slate-200 pb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-[#0B3A53] text-teal-300 text-xs font-black rounded-lg uppercase tracking-wider">
                  NOVA STAYCATIONS
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Confirmed & Guaranteed
                </span>
              </div>
              <h2 className="text-2xl font-black text-[#0B3A53] font-heading mt-1">
                Guest Reservation Voucher
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Issued for {tripName || 'Customized Sri Lanka Tour'}
              </p>
            </div>

            {/* Confirmation Reference Pill */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-right sm:text-right space-y-1 shrink-0">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wider">
                Confirmation Code
              </span>
              <div className="flex items-center justify-end gap-2">
                <span className="font-mono font-black text-lg text-[#0B3A53] tracking-wider">
                  {booking.confirmationCode}
                </span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="p-1 text-slate-400 hover:text-teal-600 cursor-pointer print:hidden"
                  title="Copy confirmation code"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <span className="text-[10px] text-slate-400 block font-medium">
                {bookedAt}
              </span>
            </div>
          </div>

          {/* Quick Check-in Bar with QR Symbol */}
          <div className="bg-gradient-to-r from-teal-50 via-sky-50 to-blue-50 border border-teal-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-xl border border-teal-200 flex items-center justify-center shrink-0 shadow-2xs">
                <QrCode className="w-8 h-8 text-[#0B3A53]" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-black uppercase text-teal-800 tracking-wider block">
                  DIGITAL PASS FOR HOTEL CHECK-IN
                </span>
                <h4 className="text-sm font-extrabold text-slate-900">
                  Present this receipt or code at front desk
                </h4>
                <p className="text-[11px] text-slate-500">
                  Instant key issuance upon presenting voucher & ID.
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right shrink-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Check-in Standard</span>
              <span className="text-xs font-black text-[#0B3A53]">In: 02:00 PM · Out: 11:00 AM</span>
            </div>
          </div>

          {/* Two-Column Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Property & Stay Package */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-2xs">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <Building2 className="w-4 h-4 text-[#16A6A1]" />
                <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">
                  Property & Accommodation
                </h3>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">Resort / Property</span>
                  <span className="font-extrabold text-sm text-[#0B3A53]">{propertyName}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">Location</span>
                  <span className="font-bold text-slate-700 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-teal-600" /> {destination}, Sri Lanka
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">Staycation Package</span>
                  <span className="font-extrabold text-teal-800">{packageName}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600 pt-1">
                  <span>Room Allocation:</span>
                  <span className="font-bold text-slate-900">{rooms} Deluxe Room / Suite</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Duration:</span>
                  <span className="font-bold text-slate-900">{nights} Night(s)</span>
                </div>
              </div>
            </div>

            {/* Guest & Reservation Specifics */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-2xs">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <Users className="w-4 h-4 text-[#16A6A1]" />
                <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">
                  Guest & Booking Information
                </h3>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">Primary Guest</span>
                  <span className="font-extrabold text-sm text-slate-900">{guestName}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">Contact Details</span>
                  <span className="font-semibold text-slate-600 block">{guestEmail}</span>
                  <span className="font-semibold text-slate-600 block">{guestPhone}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">Stay Dates</span>
                  <span className="font-bold text-slate-800 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-teal-600" /> {dates}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-600 pt-1">
                  <span>Payment Method:</span>
                  <span className="font-bold text-emerald-700">{paymentMethod}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Included Facilities */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
              Package Inclusions & Privileges:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-semibold text-slate-700">
              {facilities.map((fac, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{fac}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Receipt Breakdown Table */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
            <div className="bg-slate-100/80 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-700">
                Payment Breakdown
              </span>
              <span className="text-[10px] font-extrabold uppercase text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                PAID & VERIFIED
              </span>
            </div>

            <div className="p-4 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Staycation Package ({nights} nights × {rooms} room)</span>
                <span className="font-semibold text-slate-900">{booking.subtotal || totalAmount}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Tourism Development Levy & Service Charge (Included)</span>
                <span className="font-semibold text-slate-900">{booking.taxesAndService || '$0.00'}</span>
              </div>
              
              <div className="border-t border-slate-200 pt-2.5 flex justify-between items-center text-sm font-black text-[#0B3A53]">
                <span>Total Amount Paid / Guaranteed</span>
                <span className="text-base text-emerald-700">{totalAmount} USD</span>
              </div>
            </div>
          </div>

          {/* Important Arrival Notes */}
          <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-1.5 text-xs text-slate-600">
            <span className="font-extrabold text-[#0B3A53] block text-[11px] uppercase tracking-wider">
              Important Guest Instructions
            </span>
            <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-500">
              <li>Present this electronic receipt or printed voucher at check-in.</li>
              <li>A valid passport or national identity card is required for all adult guests.</li>
              <li>Early check-in and late check-out are subject to availability upon arrival.</li>
            </ul>
          </div>
        </div>

        {/* Modal Footer Controls (Hidden during print) */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>NOVA Guaranteed Staycation Voucher</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-extrabold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Receipt</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-[#0B3A53] hover:bg-[#146C86] text-white text-xs font-extrabold rounded-xl transition-all cursor-pointer shadow-sm"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
