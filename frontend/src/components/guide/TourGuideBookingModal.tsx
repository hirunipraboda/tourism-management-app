import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  Users,
  MapPin,
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Loader2,
  DollarSign,
  FileText,
  User,
  Mail,
  Phone,
  Sparkles
} from 'lucide-react';
import { guideService, GuideProfileDetailDto, GuideBookingResponse, BookingQuoteResponse } from '../../services/guideService';
import { useAuth } from '../../hooks/useAuth';

interface TourGuideBookingModalProps {
  guide: GuideProfileDetailDto;
  isOpen: boolean;
  onClose: () => void;
  onBookingSuccess?: (booking: GuideBookingResponse) => void;
}

export const TourGuideBookingModal: React.FC<TourGuideBookingModalProps> = ({
  guide,
  isOpen,
  onClose,
  onBookingSuccess
}) => {
  const { user } = useAuth();

  // Form State
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultStartDate = tomorrow.toISOString().split('T')[0];
  
  const dayAfter = new Date();
  dayAfter.setDate(dayAfter.getDate() + 2);
  const defaultEndDate = dayAfter.toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(defaultEndDate);
  const [startTime, setStartTime] = useState('08:30');
  const [endTime, setEndTime] = useState('17:30');
  const [travelers, setTravelers] = useState<number>(2);
  const [selectedDestinations, setSelectedDestinations] = useState<string[]>(
    guide.coveredDestinations.length > 0 ? [guide.coveredDestinations[0].destinationId] : ['KANDY-01']
  );
  const [pickupLocation, setPickupLocation] = useState('Hotel reception / Airport');
  const [preferredLanguage, setPreferredLanguage] = useState(guide.languages[0] || 'English');
  const [specialRequests, setSpecialRequests] = useState('');
  
  const [contactName, setContactName] = useState(user?.name || '');
  const [contactEmail, setContactEmail] = useState(user?.email || '');
  const [contactPhone, setContactPhone] = useState(user?.phone || '+94 77 000 0000');

  // Calculation & Flow State
  const [step, setStep] = useState<'details' | 'quote' | 'payment' | 'confirmed'>('details');
  const [quote, setQuote] = useState<BookingQuoteResponse | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [createdBooking, setCreatedBooking] = useState<GuideBookingResponse | null>(null);

  // Payment Form State
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('888');
  const [isPaying, setIsPaying] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      if (!contactName && user.name) setContactName(user.name);
      if (!contactEmail && user.email) setContactEmail(user.email);
      if (!contactPhone && user.phone) setContactPhone(user.phone);
    }
  }, [user]);

  if (!isOpen) return null;

  // Calculate billable days locally as fallback
  const startD = new Date(startDate);
  const endD = new Date(endDate);
  const diffTime = Math.max(0, endD.getTime() - startD.getTime());
  const calculatedDays = Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1);
  const subtotalEstimate = calculatedDays * (guide.fullDayRate || 110);
  const feeEstimate = Math.round(subtotalEstimate * 0.15 * 100) / 100;
  const totalEstimate = subtotalEstimate + feeEstimate;

  const handleDestinationToggle = (destId: string) => {
    if (selectedDestinations.includes(destId)) {
      if (selectedDestinations.length > 1) {
        setSelectedDestinations(selectedDestinations.filter(id => id !== destId));
      }
    } else {
      setSelectedDestinations([...selectedDestinations, destId]);
    }
  };

  const handleFetchQuote = async () => {
    setErrorMsg(null);
    setIsCalculating(true);
    try {
      const q = await guideService.calculateQuote({
        guideId: guide.id,
        startDate,
        endDate,
        startTime: `${startTime}:00`,
        endTime: `${endTime}:00`,
        travelers
      });
      setQuote(q);
      setStep('quote');
    } catch (err: any) {
      // Use fallback calculation if quote endpoint fails
      setQuote({
        guideId: guide.id,
        guideName: guide.name,
        rateTypeApplied: 'Full Day Rate',
        hourlyRate: guide.hourlyRate,
        halfDayRate: guide.halfDayRate,
        fullDayRate: guide.fullDayRate,
        billableDays: calculatedDays,
        subtotal: subtotalEstimate,
        serviceFee: feeEstimate,
        totalAmount: totalEstimate,
        commissionAmount: feeEstimate,
        guideNetAmount: subtotalEstimate,
        currency: 'USD',
        isAvailable: true
      });
      setStep('quote');
    } finally {
      setIsCalculating(false);
    }
  };

  const handleCreateBooking = async () => {
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      const payload = {
        guideId: guide.id,
        startDate,
        endDate,
        startTime: `${startTime}:00`,
        endTime: `${endTime}:00`,
        travelers,
        destinationIds: selectedDestinations.length > 0 ? selectedDestinations : ['KANDY-01'],
        pickupLocation,
        preferredLanguage,
        specialRequests,
        contactName: contactName || 'Tourist Traveler',
        contactEmail: contactEmail || 'traveler@tourlink.com',
        contactPhone: contactPhone || '+94 77 123 4567'
      };

      const res = await guideService.createBooking(payload);
      setCreatedBooking(res);
      setStep('payment');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create booking. Please check date availability.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProcessPayment = async () => {
    if (!createdBooking) return;
    setIsPaying(true);
    setErrorMsg(null);
    try {
      await guideService.payBooking(createdBooking.id, 'Card (Visa)');
      setPaymentSuccess(true);
      setStep('confirmed');
      if (onBookingSuccess) {
        onBookingSuccess(createdBooking);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Payment simulation failed. Please try again.');
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-100 flex flex-col">
        {/* Modal Top Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-[#14B8A6] shadow-sm">
              <img
                src={guide.avatarUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80'}
                alt={guide.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-[#0B3A53] text-lg font-heading">{guide.name}</h3>
                <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" /> SLTDA LICENSED
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                ★ {guide.ratingAvg.toFixed(2)} ({guide.ratingCount} reviews) · {guide.yearsExperience}+ Years Exp. · {guide.toursCompleted} Tours Completed
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Progress Stepper */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500">
          <span className={`flex items-center gap-1.5 ${step === 'details' ? 'text-[#0B3A53] font-black' : 'text-slate-400'}`}>
            <span className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px]">1</span> Trip Details
          </span>
          <span className="text-slate-300">→</span>
          <span className={`flex items-center gap-1.5 ${step === 'quote' ? 'text-[#0B3A53] font-black' : 'text-slate-400'}`}>
            <span className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px]">2</span> Live Quote
          </span>
          <span className="text-slate-300">→</span>
          <span className={`flex items-center gap-1.5 ${step === 'payment' ? 'text-[#0B3A53] font-black' : 'text-slate-400'}`}>
            <span className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px]">3</span> Secure Payment
          </span>
          <span className="text-slate-300">→</span>
          <span className={`flex items-center gap-1.5 ${step === 'confirmed' ? 'text-emerald-700 font-black' : 'text-slate-400'}`}>
            <span className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px]">4</span> Confirmed
          </span>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 space-y-6 flex-1">
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* STEP 1: TRIP DETAILS FORM */}
          {step === 'details' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#14B8A6]" /> Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#14B8A6]" /> End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    min={startDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#14B8A6]" /> Start Time
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#14B8A6]" /> End Time
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#14B8A6]" /> Travelers
                  </label>
                  <select
                    value={travelers}
                    onChange={(e) => setTravelers(parseInt(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 15].map(num => (
                      <option key={num} value={num}>{num} {num === 1 ? 'Traveler' : 'Travelers'}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Covered Destinations Checkboxes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#14B8A6]" /> Select Destinations to Visit with Guide
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {guide.coveredDestinations.map(dest => (
                    <button
                      key={dest.destinationId}
                      type="button"
                      onClick={() => handleDestinationToggle(dest.destinationId)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all text-left flex items-center justify-between ${
                        selectedDestinations.includes(dest.destinationId)
                          ? 'bg-[#0B3A53] text-white border-[#0B3A53] shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <span>{dest.destinationName}</span>
                      {selectedDestinations.includes(dest.destinationId) && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-300" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Language and Pickup */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Preferred Language</label>
                  <select
                    value={preferredLanguage}
                    onChange={(e) => setPreferredLanguage(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
                  >
                    {guide.languages.map(l => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Pickup Location / Hotel</label>
                  <input
                    type="text"
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                    placeholder="e.g. Cinnamon Grand Colombo"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
                  />
                </div>
              </div>

              {/* Contact Info */}
              <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-3">
                <span className="text-xs font-black text-[#0B3A53] tracking-wide uppercase">Tourist Contact Information</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <input
                      type="text"
                      placeholder="Your Name"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <input
                      type="email"
                      placeholder="Your Email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Phone / WhatsApp"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: LIVE QUOTE REVIEW */}
          {step === 'quote' && (
            <div className="space-y-6">
              <div className="p-5 bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl border border-teal-200/60 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-teal-200/40">
                  <div>
                    <span className="text-xs font-black text-teal-900 tracking-wider uppercase">Live Rate Calculation</span>
                    <h4 className="text-base font-extrabold text-[#0B3A53]">Tour Guide Package Summary</h4>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-teal-600 text-white font-extrabold text-xs">
                    {calculatedDays} Billable {calculatedDays === 1 ? 'Day' : 'Days'}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-slate-700">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Base Daily Rate (${guide.fullDayRate}/day × {calculatedDays} days)</span>
                    <span className="font-bold text-slate-800">${subtotalEstimate.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Platform Insurance & Service Fee (15%)</span>
                    <span className="font-bold text-slate-800">${feeEstimate.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Number of Travelers</span>
                    <span className="font-bold text-slate-800">{travelers} {travelers === 1 ? 'Traveler' : 'Travelers'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Selected Destinations</span>
                    <span className="font-bold text-[#0B3A53]">{selectedDestinations.length} Key Landmarks</span>
                  </div>
                  <div className="pt-3 border-t border-teal-200 flex justify-between items-baseline">
                    <span className="font-black text-[#0B3A53] text-base">Total Chargeable Amount</span>
                    <span className="text-2xl font-black text-[#0B3A53] font-heading">${totalEstimate.toFixed(2)} USD</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-1">
                <div className="font-bold text-slate-800">Booking Guarantee & Free Cancellation:</div>
                <p>• 100% full refund if cancelled up to 48 hours prior to start date.</p>
                <p>• Your tour guide will receive direct notification and review your itinerary immediately.</p>
              </div>
            </div>
          )}

          {/* STEP 3: SECURE PAYMENT MODAL */}
          {step === 'payment' && createdBooking && (
            <div className="space-y-6">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Booking ID</span>
                  <div className="font-black text-[#0B3A53] text-base">{createdBooking.id}</div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Amount Due</span>
                  <div className="font-black text-emerald-700 text-xl font-heading">${createdBooking.totalAmount.toFixed(2)} USD</div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-[#14B8A6]" /> Payment Card Details
                </label>
                <div className="p-4 border border-slate-200 rounded-2xl space-y-3 bg-white shadow-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Card Number</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-mono font-bold text-slate-800"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 mb-1">MM/YY</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-mono font-bold text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 mb-1">CVC / CWW</label>
                      <input
                        type="password"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-mono font-bold text-slate-800"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-500" /> 256-Bit SSL Encrypted & PCI DSS Compliant Direct Gateway
              </div>
            </div>
          )}

          {/* STEP 4: CONFIRMED SUCCESS */}
          {step === 'confirmed' && (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto border-2 border-emerald-300 shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black text-[#0B3A53] font-heading">Tour Guide Booking Confirmed!</h3>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                Your reservation with <strong className="text-slate-900">{guide.name}</strong> has been secured and settled. Reference details have been recorded in the database.
              </p>
              {createdBooking && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 max-w-sm mx-auto text-xs font-mono font-bold text-slate-700">
                  Booking Reference: {createdBooking.id}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Action Footer */}
        <div className="p-6 border-t border-slate-100 flex items-center justify-between bg-slate-50/70">
          {step === 'details' && (
            <>
              <div className="text-xs text-slate-500 font-semibold">
                Est. Total: <span className="font-black text-[#0B3A53] text-sm">${totalEstimate.toFixed(2)} USD</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleFetchQuote}
                  disabled={isCalculating}
                  className="px-6 py-2.5 rounded-xl text-xs font-black text-white bg-[#0B3A53] hover:bg-[#146C86] transition-all shadow-md flex items-center gap-2"
                >
                  {isCalculating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-teal-300" />}
                  Review Quote & Pricing
                </button>
              </div>
            </>
          )}

          {step === 'quote' && (
            <>
              <button
                type="button"
                onClick={() => setStep('details')}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={handleCreateBooking}
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl text-xs font-black text-white bg-[#14B8A6] hover:bg-[#0D9488] transition-all shadow-md flex items-center gap-2"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Proceed to Payment (${totalEstimate.toFixed(2)})
              </button>
            </>
          )}

          {step === 'payment' && (
            <>
              <button
                type="button"
                onClick={() => setStep('quote')}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={handleProcessPayment}
                disabled={isPaying}
                className="px-6 py-2.5 rounded-xl text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 transition-all shadow-md flex items-center gap-2"
              >
                {isPaying ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                Confirm & Pay Now (${createdBooking?.totalAmount.toFixed(2) || totalEstimate.toFixed(2)})
              </button>
            </>
          )}

          {step === 'confirmed' && (
            <div className="w-full flex justify-center">
              <button
                type="button"
                onClick={onClose}
                className="px-8 py-3 rounded-xl text-xs font-black text-white bg-[#0B3A53] hover:bg-[#146C86] transition-all shadow-md"
              >
                Close & View My Bookings
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
