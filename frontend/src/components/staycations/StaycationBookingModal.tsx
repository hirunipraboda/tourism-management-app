import React, { useState } from 'react';
import {
  X,
  Building2,
  Calendar,
  Users,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  Tag,
  Star,
  Sparkles,
  MapPin,
  Clock,
  Check,
  AlertCircle
} from 'lucide-react';
import { AccommodationItem } from '../../mock/manualPlannerData';
import { TripBookingDetail } from '../../mock/tripsData';

interface StaycationBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  staycation: AccommodationItem | null;
  tripName?: string;
  startDate?: string;
  endDate?: string;
  travelersCount?: number;
  onConfirmBooking: (booking: TripBookingDetail) => void;
}

export const StaycationBookingModal: React.FC<StaycationBookingModalProps> = ({
  isOpen,
  onClose,
  staycation,
  tripName,
  startDate,
  endDate,
  travelersCount = 2,
  onConfirmBooking,
}) => {
  if (!isOpen || !staycation) return null;

  // Calculate default dates & nights
  const defaultCheckIn = startDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
  const defaultCheckOut = endDate || new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0];

  const [checkInDate, setCheckInDate] = useState<string>(defaultCheckIn);
  const [checkOutDate, setCheckOutDate] = useState<string>(defaultCheckOut);
  const [guests, setGuests] = useState<number>(travelersCount);
  const [roomCount, setRoomCount] = useState<number>(1);
  const [paymentMethod, setPaymentMethod] = useState<'pay_at_property' | 'card'>('pay_at_property');

  // Lead Guest Details
  const [guestName, setGuestName] = useState<string>('Hiruni Praboda');
  const [guestEmail, setGuestEmail] = useState<string>('hiruni.praboda@gmail.com');
  const [guestPhone, setGuestPhone] = useState<string>('+94 77 123 4567');
  const [specialRequests, setSpecialRequests] = useState<string>('');

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [confirmedBookingRef, setConfirmedBookingRef] = useState<string | null>(null);

  // Nights calculation
  const calculateNights = () => {
    try {
      const d1 = new Date(checkInDate);
      const d2 = new Date(checkOutDate);
      const diff = Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
      return isNaN(diff) || diff <= 0 ? 1 : diff;
    } catch {
      return 1;
    }
  };

  const nights = calculateNights();
  const subtotal = staycation.pricePerNight * nights * roomCount;
  const taxesAndService = Math.round(subtotal * 0.10);
  const totalAmount = subtotal + taxesAndService;

  const handleConfirm = () => {
    setIsProcessing(true);

    setTimeout(() => {
      const destCode = staycation.destination.slice(0, 3).toUpperCase();
      const codeNumber = Math.floor(1000 + Math.random() * 9000);
      const ref = `STAY-${destCode}-${codeNumber}`;
      setConfirmedBookingRef(ref);

      const bookingDetail: TripBookingDetail = {
        id: `bk-stay-${Date.now()}`,
        type: 'Hotel',
        provider: staycation.name,
        details: `${staycation.packageName} (${staycation.type}) · ${nights} Night(s), ${roomCount} Room/Cabana · ${staycation.destination}`,
        dates: `${checkInDate} to ${checkOutDate}`,
        confirmationCode: ref,
        amount: `$${totalAmount}`,
        status: 'Confirmed',
        destination: staycation.destination,
        guestName,
        guestEmail,
        guestPhone,
        packageName: staycation.packageName,
        nights,
        rooms: roomCount,
        checkInDate,
        checkOutDate,
        bookedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' · ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        paymentMethod: paymentMethod === 'card' ? 'Credit / Debit Card (Online Verified)' : 'Pay on Arrival / Guaranteed Reservation',
        taxesAndService: `$${taxesAndService}`,
        subtotal: `$${subtotal}`,
        includedFacilities: staycation.includedFacilities,
        specialRequests,
      };

      onConfirmBooking(bookingDetail);
      setIsProcessing(false);
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] shadow-2xl border border-slate-200 overflow-y-auto flex flex-col justify-between relative">
        
        {/* Modal Header Bar */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] font-black uppercase text-teal-700 tracking-widest block">
              STAYCATION RESERVATION
            </span>
            <h3 className="text-xl font-black text-slate-900">
              {confirmedBookingRef ? 'Booking Confirmed!' : `Book Staycation: ${staycation.name}`}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {confirmedBookingRef ? (
            /* Confirmation Success State */
            <div className="text-center py-6 space-y-5 animate-in fade-in zoom-in-95 duration-300">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto border-2 border-emerald-300">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">
                  Reservation Successful
                </span>
                <h4 className="text-2xl font-black text-slate-900">
                  You are all set for {staycation.name}!
                </h4>
                <p className="text-slate-600 text-sm max-w-md mx-auto">
                  Your staycation reservation has been confirmed and attached directly to your trip itinerary.
                </p>
              </div>

              {/* Confirmation Details Card */}
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-5 text-left max-w-lg mx-auto space-y-3">
                <div className="flex items-center justify-between border-b border-emerald-200/60 pb-3">
                  <div>
                    <span className="text-xs font-bold text-slate-500 block">Booking Reference</span>
                    <span className="font-mono font-black text-lg text-emerald-900">{confirmedBookingRef}</span>
                  </div>
                  <span className="px-3 py-1 bg-emerald-600 text-white rounded-full text-xs font-bold shadow-xs">
                    ✓ Confirmed
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 font-bold block">Staycation</span>
                    <span className="font-extrabold text-slate-900">{staycation.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold block">Destination</span>
                    <span className="font-extrabold text-slate-900">{staycation.destination}, Sri Lanka</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold block">Package</span>
                    <span className="font-extrabold text-teal-800">{staycation.packageName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold block">Dates & Duration</span>
                    <span className="font-extrabold text-slate-900">{checkInDate} to {checkOutDate} ({nights} nights)</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold block">Lead Guest</span>
                    <span className="font-extrabold text-slate-900">{guestName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold block">Total Amount</span>
                    <span className="font-black text-base text-slate-900">${totalAmount} USD</span>
                  </div>
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-8 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl shadow-lg transition-all cursor-pointer"
                >
                  Return to Itinerary
                </button>
              </div>
            </div>
          ) : (
            /* Booking Form State */
            <>
              {/* Hotel / Cabana Preview Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="relative w-full sm:w-36 h-28 rounded-xl overflow-hidden shrink-0">
                  <img src={staycation.image} alt={staycation.name} className="w-full h-full object-cover" />
                  <span className="absolute top-2 left-2 px-2 py-0.5 bg-black/70 backdrop-blur-xs text-white text-[10px] font-black uppercase rounded-md">
                    {staycation.type}
                  </span>
                </div>
                <div className="flex-1 space-y-1.5 w-full">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold text-teal-700 uppercase tracking-wider flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> {staycation.destination}
                    </span>
                    <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{staycation.rating}</span>
                      <span className="text-slate-400 font-normal">({staycation.reviewCount} reviews)</span>
                    </div>
                  </div>
                  <h4 className="text-lg font-black text-slate-900">{staycation.name}</h4>
                  
                  {/* Curated Package Tag */}
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-teal-100/70 border border-teal-200 text-teal-900 text-xs font-bold">
                    <Tag className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                    <span>Package: {staycation.packageName}</span>
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-2">{staycation.description}</p>
                </div>
              </div>

              {/* Package Facilities & Amenities */}
              <div className="bg-teal-50/50 border border-teal-200/70 rounded-2xl p-4 space-y-2.5">
                <span className="text-xs font-bold text-teal-900 uppercase tracking-wider block">
                  Included in this Package
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {staycation.includedFacilities.map((fac, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-white border border-teal-200 rounded-lg text-xs font-medium text-teal-950 flex items-center gap-1.5 shadow-2xs"
                    >
                      <Check className="w-3 h-3 text-teal-600" />
                      {fac}
                    </span>
                  ))}
                </div>
              </div>

              {/* Reservation Dates & Guests */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Check-in Date
                  </label>
                  <input
                    type="date"
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-sm text-slate-900 bg-white focus:outline-none focus:border-teal-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Check-out Date
                  </label>
                  <input
                    type="date"
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-sm text-slate-900 bg-white focus:outline-none focus:border-teal-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Rooms / Cabanas
                  </label>
                  <select
                    value={roomCount}
                    onChange={(e) => setRoomCount(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-sm text-slate-900 bg-white focus:outline-none focus:border-teal-600"
                  >
                    <option value={1}>1 Room / Cabana</option>
                    <option value={2}>2 Rooms / Cabanas</option>
                    <option value={3}>3 Rooms / Cabanas</option>
                  </select>
                </div>
              </div>

              {/* Lead Guest Information */}
              <div className="space-y-3 border-t border-slate-200 pt-4">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Lead Guest Details
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="e.g. Hiruni Praboda"
                      className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-slate-900 focus:outline-none focus:border-teal-600"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Email for Confirmation</label>
                    <input
                      type="email"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      placeholder="e.g. guest@example.com"
                      className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-slate-900 focus:outline-none focus:border-teal-600"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      placeholder="+94 77 123 4567"
                      className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-slate-900 focus:outline-none focus:border-teal-600"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Special Requests (Optional)</label>
                    <input
                      type="text"
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      placeholder="e.g. Honeymoon setup, early check-in, quiet floor"
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:border-teal-600"
                    />
                  </div>
                </div>
              </div>

              {/* Pricing Breakdown & Payment Preference */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>${staycation.pricePerNight} × {nights} Night(s) × {roomCount} Room</span>
                  <span className="font-bold text-slate-900">${subtotal}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>Tourism Tax & Service Charge (10%)</span>
                  <span className="font-bold text-slate-900">${taxesAndService}</span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex items-center justify-between">
                  <div>
                    <span className="text-sm font-black text-slate-900 block">Total Staycation Price</span>
                    <span className="text-[10px] text-emerald-700 font-bold">Includes all package facilities</span>
                  </div>
                  <span className="text-xl font-black text-teal-800">${totalAmount} USD</span>
                </div>

                {/* Payment Option Selection */}
                <div className="pt-2 border-t border-slate-200">
                  <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('pay_at_property')}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        paymentMethod === 'pay_at_property'
                          ? 'bg-teal-50 border-teal-600 text-teal-900 font-black shadow-xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span>Pay at Property (Zero Deposit)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        paymentMethod === 'card'
                          ? 'bg-teal-50 border-teal-600 text-teal-900 font-black shadow-xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span>Instant Card Confirmation</span>
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer Actions */}
        {!confirmedBookingRef && (
          <div className="sticky bottom-0 z-20 bg-white border-t border-slate-200 px-6 py-4 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              disabled={isProcessing}
              className="px-8 py-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-extrabold text-sm rounded-xl shadow-lg flex items-center gap-2 transition-all cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Confirming Reservation...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm Staycation Reservation (${totalAmount})</span>
                </>
              )}
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
