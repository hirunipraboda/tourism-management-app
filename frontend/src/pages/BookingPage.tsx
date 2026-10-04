import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Calendar,
    Users,
    MapPin,
    Clock,
    CreditCard,
    Lock,
    Check,
    Sparkles,
    Shield,
    Zap,
    AlertCircle,
    Loader2,
    XCircle,
    CheckCircle2,
    User,
    Mail,
    Phone,
} from 'lucide-react';
import { LandingNavbar } from '../components/navigation/LandingNavbar';
import { Footer } from '../components/navigation/Footer';

// ─── Types ────────────────────────────────────────────────────────────────────

type BookingStep = 'details' | 'payment' | 'result';
type BookingResult = 'success' | 'fail' | null;

// ─── Component ────────────────────────────────────────────────────────────────

export const BookingPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // Package info from URL
    const pkgId = searchParams.get('pkgId') ?? '';
    const pkgName = searchParams.get('name') ?? 'Travel Package';
    const pkgPrice = searchParams.get('price') ?? '$899';
    const pkgDuration = searchParams.get('duration') ?? '5 Days';
    const pkgDestination = searchParams.get('destination') ?? 'Sri Lanka';

    // Parse price number from string like "$899/person" or "$899"
    const priceNum = parseFloat(pkgPrice.replace(/[^0-9.]/g, '')) || 899;

    // ── Step state ───────────────────────────────────────────────────────────
    const [step, setStep] = useState<BookingStep>('details');
    const [bookingResult, setBookingResult] = useState<BookingResult>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // ── Booking details form ─────────────────────────────────────────────────
    const [travelDate, setTravelDate] = useState('');
    const [travelers, setTravelers] = useState(2);
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [specialRequests, setSpecialRequests] = useState('');
    const [detailErrors, setDetailErrors] = useState<Record<string, string>>({});

    // ── Payment form ─────────────────────────────────────────────────────────
    const [cardNumber, setCardNumber] = useState('');
    const [cardName, setCardName] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');
    const [payErrors, setPayErrors] = useState<Record<string, string>>({});

    // ── Computed ──────────────────────────────────────────────────────────────
    const totalPrice = priceNum * travelers;
    const bookingRef = `BK-${Date.now().toString(36).toUpperCase()}`;

    // ── Formatters ───────────────────────────────────────────────────────────
    const handleCardNumber = (val: string) => {
        const digits = val.replace(/\D/g, '').slice(0, 16);
        const parts = digits.match(/.{1,4}/g);
        setCardNumber(parts ? parts.join(' ') : '');
    };

    const handleExpiry = (val: string) => {
        const digits = val.replace(/\D/g, '').slice(0, 4);
        if (digits.length > 2) {
            setExpiry(`${digits.slice(0, 2)}/${digits.slice(2)}`);
        } else {
            setExpiry(digits);
        }
    };

    // ── Validators ───────────────────────────────────────────────────────────
    const validateDetails = () => {
        const e: Record<string, string> = {};
        if (!fullName.trim()) e.fullName = 'Full name is required.';
        if (!email || !email.includes('@')) e.email = 'Valid email is required.';
        if (!phone || phone.replace(/\D/g, '').length < 7) e.phone = 'Valid phone number is required.';
        if (!travelDate) e.travelDate = 'Select a travel date.';
        if (travelers < 1 || travelers > 20) e.travelers = 'Between 1 and 20 travelers.';
        setDetailErrors(e);
        return Object.keys(e).length === 0;
    };

    const validatePayment = () => {
        const e: Record<string, string> = {};
        if (cardNumber.replace(/\s/g, '').length < 16) e.cardNumber = 'Enter 16-digit card number.';
        if (!cardName.trim()) e.cardName = 'Cardholder name is required.';
        if (expiry.length < 5) e.expiry = 'Valid expiry required.';
        if (cvv.length < 3) e.cvv = 'Valid CVV required.';
        setPayErrors(e);
        return Object.keys(e).length === 0;
    };

    // ── Handlers ─────────────────────────────────────────────────────────────
    const handleContinueToPayment = () => {
        if (!validateDetails()) return;
        setStep('payment');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handlePayNow = async () => {
        if (!validatePayment()) return;
        setIsProcessing(true);

        // Simulate payment processing
        await new Promise((r) => setTimeout(r, 2500));

        // Simulate 90% success / 10% fail for demo
        const succeeded = Math.random() > 0.1;
        setBookingResult(succeeded ? 'success' : 'fail');
        setStep('result');
        setIsProcessing(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // ── Helper: input class ──────────────────────────────────────────────────
    const inputClass = (hasError: boolean) =>
        `w-full bg-transparent outline-none text-[15px] font-semibold text-[#0B3A53] placeholder:text-slate-300`;
    const fieldClass = (hasError: boolean) =>
        `border rounded-lg p-3 bg-white transition-colors focus-within:border-[#0B3A53] ${hasError ? 'border-rose-400' : 'border-slate-300'}`;

    // ─── Step progress indicator ─────────────────────────────────────────────
    const StepIndicator = () => (
        <div className="flex items-center justify-center gap-0 max-w-md mx-auto py-6">
            {(['details', 'payment', 'result'] as BookingStep[]).map((s, i) => {
                const labels = ['Booking Details', 'Payment', 'Confirmation'];
                const icons = [Calendar, CreditCard, CheckCircle2];
                const Icon = icons[i];
                const isActive = step === s;
                const isPast = (step === 'payment' && i === 0) || (step === 'result' && i <= 1);
                return (
                    <React.Fragment key={s}>
                        {i > 0 && (
                            <div className={`flex-1 h-0.5 mx-1 rounded ${isPast ? 'bg-[#16A6A1]' : 'bg-slate-200'}`} />
                        )}
                        <div className="flex flex-col items-center gap-1.5">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                                isActive ? 'bg-[#0B3A53] text-white scale-110 shadow-lg' :
                                isPast ? 'bg-[#16A6A1] text-white' :
                                'bg-slate-100 text-slate-400'
                            }`}>
                                {isPast ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                            </div>
                            <span className={`text-[10px] font-bold whitespace-nowrap ${isActive ? 'text-[#0B3A53]' : 'text-slate-400'}`}>
                                {labels[i]}
                            </span>
                        </div>
                    </React.Fragment>
                );
            })}
        </div>
    );

    // ═════════════════════════════════════════════════════════════════════════
    // RESULT SCREEN
    // ═════════════════════════════════════════════════════════════════════════
    if (step === 'result') {
        const isSuccess = bookingResult === 'success';
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
                <LandingNavbar />
                <div className="flex-1 flex items-center justify-center px-4 py-16">
                    <div className="max-w-lg w-full text-center space-y-8">

                        {/* Animated icon */}
                        <div className="relative mx-auto w-32 h-32">
                            {isSuccess && <div className="absolute inset-0 rounded-full bg-emerald-100 animate-ping opacity-30" />}
                            <div className={`relative w-32 h-32 rounded-full flex items-center justify-center shadow-2xl ${
                                isSuccess
                                    ? 'bg-gradient-to-br from-emerald-400 to-teal-500 shadow-emerald-200'
                                    : 'bg-gradient-to-br from-rose-400 to-red-500 shadow-rose-200'
                            }`}>
                                {isSuccess
                                    ? <Check className="w-16 h-16 text-white stroke-[3]" />
                                    : <XCircle className="w-16 h-16 text-white stroke-[2]" />
                                }
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h1 className={`text-3xl sm:text-4xl font-black font-heading tracking-tight ${isSuccess ? 'text-[#0B3A53]' : 'text-rose-700'}`}>
                                {isSuccess ? 'Booking Successful!' : 'Booking Failed'}
                            </h1>
                            <p className="text-slate-500 font-medium text-base max-w-sm mx-auto">
                                {isSuccess
                                    ? <>Your trip to <strong className="text-[#16A6A1]">{pkgDestination}</strong> has been confirmed. We've sent a confirmation email to <strong className="text-[#0B3A53]">{email}</strong>.</>
                                    : <>We couldn't process your payment. Please try again or use a different card.</>
                                }
                            </p>
                        </div>

                        {/* Receipt / error detail */}
                        {isSuccess ? (
                            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-lg text-left">
                                <div className="bg-gradient-to-r from-[#0B3A53] to-[#146C86] px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-white/70" />
                                        <span className="text-white font-black text-sm uppercase tracking-wide">Booking Confirmation</span>
                                    </div>
                                </div>
                                <div className="p-6 space-y-3 text-sm">
                                    {[
                                        { label: 'Booking Ref', value: bookingRef },
                                        { label: 'Package', value: pkgName },
                                        { label: 'Destination', value: pkgDestination },
                                        { label: 'Travel Date', value: travelDate },
                                        { label: 'Travelers', value: `${travelers} person${travelers > 1 ? 's' : ''}` },
                                        { label: 'Total Paid', value: `$${totalPrice.toFixed(2)}` },
                                        { label: 'Status', value: '✅ Confirmed' },
                                    ].map(({ label, value }) => (
                                        <div key={label} className="flex items-center justify-between border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                                            <span className="text-slate-400 font-bold">{label}</span>
                                            <span className="font-black text-[#0B3A53]">{value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-left space-y-2">
                                <div className="flex items-center gap-2 text-rose-700 font-black text-sm">
                                    <AlertCircle className="w-4 h-4" /> Payment Declined
                                </div>
                                <p className="text-rose-600 text-xs font-medium">
                                    Your card issuer declined the transaction. This could be due to insufficient funds, incorrect card details, or a security block. Please contact your bank or try a different payment method.
                                </p>
                            </div>
                        )}

                        <div className="space-y-3">
                            {isSuccess ? (
                                <button
                                    onClick={() => navigate('/tours')}
                                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#0B3A53] to-[#146C86] hover:from-[#072537] hover:to-[#0B3A53] text-white font-extrabold text-sm transition-all cursor-pointer shadow-xl flex items-center justify-center gap-2"
                                >
                                    <Sparkles className="w-4 h-4 text-[#16A6A1]" />
                                    Explore More Packages
                                </button>
                            ) : (
                                <button
                                    onClick={() => { setStep('payment'); setBookingResult(null); }}
                                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-extrabold text-sm transition-all cursor-pointer shadow-xl flex items-center justify-center gap-2"
                                >
                                    <CreditCard className="w-4 h-4" />
                                    Try Again
                                </button>
                            )}
                            <button
                                onClick={() => navigate('/')}
                                className="w-full py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-sm transition-all cursor-pointer"
                            >
                                Back to Home
                            </button>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    // ═════════════════════════════════════════════════════════════════════════
    // MAIN BOOKING / PAYMENT FORM
    // ═════════════════════════════════════════════════════════════════════════
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <LandingNavbar />

            {/* Hero strip */}
            <div className="bg-gradient-to-r from-[#0B3A53] via-[#146C86] to-[#0B3A53] py-8 px-4">
                <div className="max-w-5xl mx-auto">
                    <button
                        onClick={() => step === 'payment' ? setStep('details') : navigate('/tours')}
                        className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm font-bold transition-colors cursor-pointer mb-3"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        {step === 'payment' ? 'Back to Details' : 'Back to Packages'}
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center border border-white/20">
                            <MapPin className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-white/60 text-xs font-black uppercase tracking-widest">Book Your Trip</p>
                            <h1 className="text-xl sm:text-2xl font-black text-white font-heading tracking-tight">
                                {pkgName}
                            </h1>
                        </div>
                    </div>
                </div>
            </div>

            {/* Step Indicator */}
            <StepIndicator />

            {/* Main content */}
            <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 pb-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* ══ LEFT COLUMN ══════════════════════════════════════════════ */}
                    <div className="lg:col-span-7 space-y-6">

                        {/* ── STEP 1: BOOKING DETAILS ─────────────────────────────── */}
                        {step === 'details' && (
                            <>
                                {/* Personal Info */}
                                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
                                    <h2 className="text-sm font-black tracking-wide text-[#0B3A53] uppercase flex items-center gap-2">
                                        <User className="w-4 h-4 text-[#16A6A1]" />
                                        Lead Traveler Information
                                    </h2>

                                    <div className={fieldClass(!!detailErrors.fullName)}>
                                        <label className="block text-[11px] text-slate-400 mb-0.5">Full Name</label>
                                        <div className="flex items-center">
                                            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Silva" className={inputClass(!!detailErrors.fullName)} />
                                            {fullName.trim().length > 2 && <Check className="w-4 h-4 text-emerald-500 shrink-0 ml-2 stroke-[3]" />}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className={fieldClass(!!detailErrors.email)}>
                                            <label className="block text-[11px] text-slate-400 mb-0.5">Email Address</label>
                                            <div className="flex items-center">
                                                <Mail className="w-4 h-4 text-slate-300 shrink-0 mr-2" />
                                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={inputClass(!!detailErrors.email)} />
                                            </div>
                                        </div>
                                        <div className={fieldClass(!!detailErrors.phone)}>
                                            <label className="block text-[11px] text-slate-400 mb-0.5">Phone Number</label>
                                            <div className="flex items-center">
                                                <Phone className="w-4 h-4 text-slate-300 shrink-0 mr-2" />
                                                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+94 77 123 4567" className={inputClass(!!detailErrors.phone)} />
                                            </div>
                                        </div>
                                    </div>

                                    {(detailErrors.fullName || detailErrors.email || detailErrors.phone) && (
                                        <p className="text-rose-500 text-xs font-bold flex items-center gap-1">
                                            <AlertCircle className="w-3.5 h-3.5" /> Please fill in all required fields correctly.
                                        </p>
                                    )}
                                </div>

                                {/* Trip Details */}
                                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
                                    <h2 className="text-sm font-black tracking-wide text-[#0B3A53] uppercase flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-[#16A6A1]" />
                                        Trip Details
                                    </h2>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className={fieldClass(!!detailErrors.travelDate)}>
                                            <label className="block text-[11px] text-slate-400 mb-0.5">Travel Start Date</label>
                                            <input
                                                type="date"
                                                value={travelDate}
                                                onChange={(e) => setTravelDate(e.target.value)}
                                                min={new Date().toISOString().split('T')[0]}
                                                className={inputClass(!!detailErrors.travelDate)}
                                            />
                                        </div>
                                        <div className={fieldClass(!!detailErrors.travelers)}>
                                            <label className="block text-[11px] text-slate-400 mb-0.5">Number of Travelers</label>
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => setTravelers(Math.max(1, travelers - 1))}
                                                    className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#0B3A53] font-black text-lg flex items-center justify-center cursor-pointer transition-colors"
                                                >−</button>
                                                <span className="text-lg font-black text-[#0B3A53] min-w-[2rem] text-center">{travelers}</span>
                                                <button
                                                    onClick={() => setTravelers(Math.min(20, travelers + 1))}
                                                    className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#0B3A53] font-black text-lg flex items-center justify-center cursor-pointer transition-colors"
                                                >+</button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className={fieldClass(false)}>
                                        <label className="block text-[11px] text-slate-400 mb-0.5">Special Requests (optional)</label>
                                        <textarea
                                            value={specialRequests}
                                            onChange={(e) => setSpecialRequests(e.target.value)}
                                            placeholder="Dietary requirements, accessibility needs, celebrations…"
                                            rows={3}
                                            className="w-full bg-transparent outline-none text-sm font-medium text-[#0B3A53] placeholder:text-slate-300 resize-none"
                                        />
                                    </div>

                                    {detailErrors.travelDate && (
                                        <p className="text-rose-500 text-xs font-bold flex items-center gap-1">
                                            <AlertCircle className="w-3.5 h-3.5" /> {detailErrors.travelDate}
                                        </p>
                                    )}
                                </div>

                                {/* Continue button */}
                                <button
                                    onClick={handleContinueToPayment}
                                    className="w-full py-5 rounded-xl text-white font-black text-base tracking-wide transition-all duration-300 shadow-xl flex items-center justify-center gap-3 cursor-pointer bg-gradient-to-r from-[#0B3A53] to-[#146C86] hover:from-[#072537] hover:to-[#0B3A53] hover:scale-[1.01]"
                                >
                                    Continue to Payment
                                    <ArrowLeft className="w-5 h-5 rotate-180" />
                                </button>
                            </>
                        )}

                        {/* ── STEP 2: PAYMENT ────────────────────────────────────── */}
                        {step === 'payment' && (
                            <>
                                {/* SSL badge */}
                                <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold px-4 py-2 rounded-full">
                                    <Lock className="w-3.5 h-3.5 shrink-0" />
                                    256-bit SSL encrypted · PCI DSS Compliant
                                </div>

                                {/* Card form */}
                                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <h2 className="text-sm font-black tracking-wide text-[#0B3A53] uppercase">Credit / Debit Card</h2>
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-10 h-6 bg-blue-700 text-white rounded flex items-center justify-center text-[9px] font-black italic">VISA</div>
                                            <div className="w-10 h-6 bg-[#FF5F00] rounded flex items-center justify-center">
                                                <div className="flex -space-x-1">
                                                    <div className="w-3 h-3 rounded-full bg-[#EB001B]" />
                                                    <div className="w-3 h-3 rounded-full bg-[#F79E1B]" />
                                                </div>
                                            </div>
                                            <div className="w-10 h-6 bg-blue-500 text-white rounded flex items-center justify-center text-[8px] font-bold leading-none text-center">AMEX</div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {/* Card Number */}
                                        <div className={fieldClass(!!payErrors.cardNumber)}>
                                            <label className="block text-[11px] text-slate-400 mb-0.5">Card number</label>
                                            <div className="flex items-center">
                                                <input
                                                    type="text" inputMode="numeric" autoComplete="off"
                                                    value={cardNumber} onChange={(e) => handleCardNumber(e.target.value)}
                                                    placeholder="0000 0000 0000 0000" maxLength={19}
                                                    className={inputClass(!!payErrors.cardNumber)}
                                                />
                                                {cardNumber.replace(/\s/g, '').length === 16
                                                    ? <Check className="w-4 h-4 text-emerald-500 shrink-0 ml-2 stroke-[3]" />
                                                    : <CreditCard className="w-4 h-4 text-slate-300 shrink-0 ml-2" />
                                                }
                                            </div>
                                        </div>

                                        {/* Expiry + CVV */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className={fieldClass(!!payErrors.expiry)}>
                                                <label className="block text-[11px] text-slate-400 mb-0.5">Expiry date</label>
                                                <div className="flex items-center">
                                                    <input
                                                        type="text" inputMode="numeric"
                                                        value={expiry} onChange={(e) => handleExpiry(e.target.value)}
                                                        placeholder="MM/YY" maxLength={5}
                                                        className={inputClass(!!payErrors.expiry)}
                                                    />
                                                    {expiry.length === 5 && <Check className="w-4 h-4 text-emerald-500 shrink-0 ml-2 stroke-[3]" />}
                                                </div>
                                            </div>
                                            <div className={fieldClass(!!payErrors.cvv)}>
                                                <label className="block text-[11px] text-slate-400 mb-0.5">CVC / CVV</label>
                                                <div className="flex items-center">
                                                    <input
                                                        type="password" inputMode="numeric"
                                                        value={cvv} onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                                        placeholder="123" maxLength={4}
                                                        className={inputClass(!!payErrors.cvv)}
                                                    />
                                                    {cvv.length >= 3 && <Check className="w-4 h-4 text-emerald-500 shrink-0 ml-2 stroke-[3]" />}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Name on card */}
                                        <div className={fieldClass(!!payErrors.cardName)}>
                                            <label className="block text-[11px] text-slate-400 mb-0.5">Name on card</label>
                                            <div className="flex items-center">
                                                <input
                                                    type="text" value={cardName} onChange={(e) => setCardName(e.target.value)}
                                                    placeholder="Samanta Smith"
                                                    className={inputClass(!!payErrors.cardName)}
                                                />
                                                {cardName.trim().length > 3 && <Check className="w-4 h-4 text-emerald-500 shrink-0 ml-2 stroke-[3]" />}
                                            </div>
                                        </div>
                                    </div>

                                    {Object.keys(payErrors).length > 0 && (
                                        <p className="text-rose-500 text-xs font-bold flex items-center gap-1">
                                            <AlertCircle className="w-3.5 h-3.5" /> Please correct the payment fields above.
                                        </p>
                                    )}
                                </div>

                                {/* Pay button */}
                                <button
                                    onClick={handlePayNow}
                                    disabled={isProcessing}
                                    className="w-full py-5 rounded-xl text-white font-black text-base tracking-wide transition-all duration-300 shadow-xl flex items-center justify-center gap-3 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed bg-gradient-to-r from-[#0B3A53] via-[#146C86] to-[#16A6A1] hover:shadow-[#16A6A1]/30 hover:scale-[1.01]"
                                >
                                    {isProcessing ? (
                                        <><Loader2 className="w-5 h-5 animate-spin" /> Processing Payment…</>
                                    ) : (
                                        <><Lock className="w-5 h-5" /> Pay ${totalPrice.toFixed(2)} — Confirm Booking</>
                                    )}
                                </button>

                                <p className="text-center text-xs text-slate-400 font-medium leading-relaxed">
                                    🔒 Your payment is secured with 256-bit encryption.
                                    By paying you agree to our{' '}
                                    <span className="text-[#16A6A1] cursor-pointer hover:underline">Terms</span>{' '}
                                    and{' '}
                                    <span className="text-[#16A6A1] cursor-pointer hover:underline">Cancellation Policy</span>.
                                </p>
                            </>
                        )}
                    </div>

                    {/* ══ RIGHT COLUMN: Order Summary ══════════════════════════════ */}
                    <div className="lg:col-span-5 space-y-5 lg:sticky lg:top-6">

                        {/* Package Summary */}
                        <div className="bg-gradient-to-br from-[#0B3A53] to-[#146C86] text-white rounded-2xl overflow-hidden shadow-2xl">
                            <div className="px-6 pt-6 pb-4 border-b border-white/10">
                                <p className="text-white/50 text-[10px] font-black uppercase tracking-widest">Package Summary</p>
                                <h3 className="text-lg font-black text-white leading-tight mt-1">{pkgName}</h3>
                            </div>

                            <div className="px-6 py-4 space-y-3 border-b border-white/10">
                                <div className="flex items-center gap-2 text-sm text-white/80 font-medium">
                                    <MapPin className="w-4 h-4 text-[#16A6A1] shrink-0" /> {pkgDestination}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-white/80 font-medium">
                                    <Clock className="w-4 h-4 text-[#16A6A1] shrink-0" /> {pkgDuration}
                                </div>
                                {travelDate && (
                                    <div className="flex items-center gap-2 text-sm text-white/80 font-medium">
                                        <Calendar className="w-4 h-4 text-[#16A6A1] shrink-0" /> {new Date(travelDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                    </div>
                                )}
                                <div className="flex items-center gap-2 text-sm text-white/80 font-medium">
                                    <Users className="w-4 h-4 text-[#16A6A1] shrink-0" /> {travelers} traveler{travelers > 1 ? 's' : ''}
                                </div>
                            </div>

                            <div className="px-6 py-5 space-y-2.5">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-white/50 font-bold">Price per person</span>
                                    <span className="text-white font-bold">${priceNum.toFixed(2)}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-white/50 font-bold">Travelers</span>
                                    <span className="text-white font-bold">× {travelers}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-white/50 font-bold">Tax</span>
                                    <span className="text-white font-bold">$0.00</span>
                                </div>
                                <div className="flex items-center justify-between border-t border-white/10 pt-3 mt-1">
                                    <span className="text-white font-black text-base">Total</span>
                                    <span className="text-2xl font-black text-[#16A6A1]">${totalPrice.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        {/* What's included mini list */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3">
                            <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">What's Included</h4>
                            {[
                                'Accommodation & meals',
                                'Local transport throughout',
                                'Licensed English-speaking guide',
                                'NOVA AI Guide Bot 24/7',
                                'All entrance fees',
                            ].map((item) => (
                                <div key={item} className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-[#16A6A1] shrink-0" />
                                    {item}
                                </div>
                            ))}
                        </div>

                        {/* Trust badges */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3">
                            {[
                                { icon: Shield, label: 'Free cancellation', desc: 'Full refund up to 48h before', color: 'bg-emerald-50 text-emerald-600' },
                                { icon: Zap, label: 'Instant confirmation', desc: 'Booking confirmed in seconds', color: 'bg-amber-50 text-amber-600' },
                                { icon: Lock, label: 'Secure payment', desc: '256-bit encrypted', color: 'bg-violet-50 text-violet-600' },
                            ].map(({ icon: Icon, label, desc, color }) => (
                                <div key={label} className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center shrink-0`}>
                                        <Icon className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-[#0B3A53]">{label}</p>
                                        <p className="text-[11px] text-slate-400 font-medium">{desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>

            <Footer />
        </div>
    );
};
