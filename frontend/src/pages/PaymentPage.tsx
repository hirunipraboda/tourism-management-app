import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
    CreditCard,
    Lock,
    ArrowLeft,
    Sparkles,
    Shield,
    Zap,
    Star,
    AlertCircle,
    Loader2,
    Check,
} from 'lucide-react';
import { LandingNavbar } from '../components/navigation/LandingNavbar';
import { Footer } from '../components/navigation/Footer';

// ─── Plan data ────────────────────────────────────────────────────────────────

const PLAN_FEATURES: Record<string, string[]> = {
    guide: [
        '50 AI questions per week',
        '10 image analyses',
        'Destination recommendations',
        'Basic itinerary suggestions',
        'Food & landmark recognition',
    ],
    explorer: [
        '150 AI questions per week',
        '40 image analyses',
        'Personalized itineraries',
        'Advanced image analysis',
        'Budget planning tools',
        'Transportation recommendations',
        'Multi-day trip planning',
    ],
    traveler: [
        '500 AI questions per month',
        '150 image analyses',
        'Advanced itinerary generation',
        'Multi-destination planning',
        'Personalized recommendations',
        'Budget optimization',
        'Saved AI conversations',
    ],
    wanderer: [
        'Unlimited AI conversations',
        '500 image analyses / month',
        'Advanced trip planning',
        'Multi-country itineraries',
        'Priority AI responses',
        'Advanced budget planning',
        'Dedicated support',
    ],
};

const PLAN_COLORS: Record<string, string> = {
    guide: 'from-[#146C86] to-[#0B3A53]',
    explorer: 'from-[#16A6A1] to-[#146C86]',
    traveler: 'from-[#0B3A53] to-[#146C86]',
    wanderer: 'from-slate-800 to-[#0B3A53]',
};

// ─── Component ────────────────────────────────────────────────────────────────

export const PaymentPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const planName = searchParams.get('plan') ?? 'AI EXPLORER';
    const price = searchParams.get('price') ?? '9.99';
    const period = searchParams.get('period') ?? 'week';
    const planId = searchParams.get('planId') ?? 'explorer';
    const features = PLAN_FEATURES[planId] ?? PLAN_FEATURES['explorer'];
    const gradient = PLAN_COLORS[planId] ?? PLAN_COLORS['explorer'];

    // Form state
    const [email, setEmail] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [cardName, setCardName] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Auto-format card number → groups of 4
    const handleCardNumber = (val: string) => {
        const digits = val.replace(/\D/g, '').slice(0, 16);
        const parts = digits.match(/.{1,4}/g);
        setCardNumber(parts ? parts.join(' ') : '');
    };

    // Auto-format expiry → MM/YY
    const handleExpiry = (val: string) => {
        const digits = val.replace(/\D/g, '').slice(0, 4);
        if (digits.length > 2) {
            setExpiry(`${digits.slice(0, 2)}/${digits.slice(2)}`);
        } else {
            setExpiry(digits);
        }
    };

    const validate = () => {
        const e: Record<string, string> = {};
        if (!email || !email.includes('@')) e.email = 'Required.';
        if (cardNumber.replace(/\s/g, '').length < 16) e.cardNumber = 'Required.';
        if (!cardName.trim()) e.cardName = 'Required.';
        if (expiry.length < 5) e.expiry = 'Required.';
        if (cvv.length < 3) e.cvv = 'Required.';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handlePay = async () => {
        if (!validate()) return;
        setIsProcessing(true);
        await new Promise((r) => setTimeout(r, 2200));
        setIsProcessing(false);
        setIsSuccess(true);
    };

    // ── Success Screen ────────────────────────────────────────────────────────

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
                <LandingNavbar />
                <div className="flex-1 flex items-center justify-center px-4 py-16">
                    <div className="max-w-lg w-full text-center space-y-8">
                        <div className="relative mx-auto w-32 h-32">
                            <div className="absolute inset-0 rounded-full bg-emerald-100 animate-ping opacity-30" />
                            <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-2xl shadow-emerald-200">
                                <Check className="w-16 h-16 text-white stroke-[3]" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-4xl font-black text-[#0B3A53] font-heading tracking-tight">Payment Successful!</h1>
                            <p className="text-slate-500 font-medium text-base">
                                Your <strong className="text-[#16A6A1]">{planName}</strong> plan is now active.
                            </p>
                        </div>
                        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-lg text-left">
                            <div className={`bg-gradient-to-r ${gradient} px-6 py-4`}>
                                <div className="flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-white/70" />
                                    <span className="text-white font-black text-sm uppercase tracking-wide">Order Receipt</span>
                                </div>
                            </div>
                            <div className="p-6 space-y-3 text-sm">
                                {[
                                    { label: 'Plan', value: planName },
                                    { label: 'Amount Charged', value: `$${price} / ${period}` },
                                    { label: 'Email', value: email },
                                    { label: 'Status', value: '✅ Confirmed' },
                                ].map(({ label, value }) => (
                                    <div key={label} className="flex items-center justify-between border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                                        <span className="text-slate-400 font-bold">{label}</span>
                                        <span className="font-black text-[#0B3A53]">{value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-3">
                            <button onClick={() => navigate('/tours')} className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#0B3A53] to-[#146C86] hover:from-[#072537] hover:to-[#0B3A53] text-white font-extrabold text-sm transition-all cursor-pointer shadow-xl flex items-center justify-center gap-2">
                                <Sparkles className="w-4 h-4 text-[#16A6A1]" /> Start Exploring
                            </button>
                            <button onClick={() => navigate('/')} className="w-full py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-sm transition-all cursor-pointer">
                                Back to Home
                            </button>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    // ── Payment Form ──────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <LandingNavbar />

            {/* Hero strip */}
            <div className={`bg-gradient-to-r ${gradient} py-10 px-4`}>
                <div className="max-w-5xl mx-auto">
                    <button
                        onClick={() => navigate('/tours')}
                        className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm font-bold transition-colors cursor-pointer mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Plans
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center border border-white/20">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-white/60 text-xs font-black uppercase tracking-widest">Secure Checkout</p>
                            <h1 className="text-2xl sm:text-3xl font-black text-white font-heading tracking-tight">
                                Activate {planName}
                            </h1>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* ══ LEFT COLUMN: Form ══════════════════════════════════════════════ */}
                    <div className="lg:col-span-7 space-y-6">

                        {/* ── Email section ── */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-6">
                            <h2 className="text-sm font-black tracking-wide text-[#0B3A53] uppercase mb-4">Account Details</h2>
                            <div className={`border rounded p-2.5 bg-white transition-colors focus-within:border-[#0B3A53] ${errors.email ? 'border-rose-400' : 'border-slate-300'}`}>
                                <label className="block text-[11px] text-slate-400 mb-0.5">Email Address</label>
                                <div className="flex items-center justify-between">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        className="w-full bg-transparent outline-none text-sm font-semibold text-[#0B3A53] placeholder:text-slate-300"
                                    />
                                    {email.includes('@') && <Check className="w-4 h-4 text-emerald-500 shrink-0 ml-2" />}
                                </div>
                            </div>
                        </div>

                        {/* ── Payment section ── */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-6">

                            {/* Header row exactly like reference image */}
                            <div>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                                    <h2 className="text-sm font-black tracking-wide text-[#0B3A53] uppercase">Credit / Debit Card</h2>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-10 h-6 bg-blue-700 text-white rounded flex items-center justify-center text-[9px] font-black italic">VISA</div>
                                        <div className="w-10 h-6 bg-[#FF5F00] text-white rounded flex items-center justify-center text-[9px] font-bold">
                                            <div className="flex -space-x-1">
                                                <div className="w-3 h-3 rounded-full bg-[#EB001B] mix-blend-multiply" />
                                                <div className="w-3 h-3 rounded-full bg-[#F79E1B] mix-blend-multiply" />
                                            </div>
                                        </div>
                                        <div className="w-10 h-6 bg-blue-500 text-white rounded flex items-center justify-center text-[8px] font-bold leading-none text-center">AM<br />EX</div>
                                    </div>
                                </div>
                                <p className="text-[13px] text-slate-400">You may be directed to your bank's 3D secure process to authenticate your information.</p>
                            </div>

                            {/* Inputs grid matching reference image */}
                            <div className="space-y-4">

                                {/* Card Number (Icon on right) */}
                                <div className={`border rounded p-2.5 bg-white transition-colors focus-within:border-[#0B3A53] ${errors.cardNumber ? 'border-rose-400' : 'border-slate-800'}`}>
                                    <label className="block text-[11px] text-slate-400 mb-0.5">Card number</label>
                                    <div className="flex items-center justify-between">
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            autoComplete="off"
                                            value={cardNumber}
                                            onChange={(e) => handleCardNumber(e.target.value)}
                                            placeholder="0000 0000 0000 0000"
                                            maxLength={19}
                                            className="w-full bg-transparent outline-none text-[15px] font-semibold text-[#0B3A53] tracking-wide placeholder:text-slate-200"
                                        />
                                        {/* Dynamic right-side icon based on state */}
                                        {cardNumber.replace(/\s/g, '').length === 16 ? (
                                            <div className="flex -space-x-1 shrink-0 ml-2">
                                                <div className="w-3.5 h-3.5 rounded-full bg-[#EB001B]" />
                                                <div className="w-3.5 h-3.5 rounded-full bg-[#F79E1B]" />
                                            </div>
                                        ) : (
                                            <CreditCard className="w-4 h-4 text-slate-300 shrink-0 ml-2" />
                                        )}
                                    </div>
                                </div>

                                {/* Expiry and CVV Row */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className={`border rounded p-2.5 bg-white transition-colors focus-within:border-[#0B3A53] ${errors.expiry ? 'border-rose-400' : 'border-slate-800'}`}>
                                        <label className="block text-[11px] text-slate-400 mb-0.5">Expiry date</label>
                                        <div className="flex items-center justify-between">
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                value={expiry}
                                                onChange={(e) => handleExpiry(e.target.value)}
                                                placeholder="MM/YY"
                                                maxLength={5}
                                                className="w-full bg-transparent outline-none text-[15px] font-semibold text-[#0B3A53] placeholder:text-slate-200"
                                            />
                                            {expiry.length === 5 && <Check className="w-4 h-4 text-emerald-500 shrink-0 ml-2 stroke-[3]" />}
                                        </div>
                                    </div>

                                    <div className={`border rounded p-2.5 bg-white transition-colors focus-within:border-[#0B3A53] ${errors.cvv ? 'border-rose-400' : 'border-slate-800'}`}>
                                        <label className="block text-[11px] text-slate-400 mb-0.5">CVC / CVV</label>
                                        <div className="flex items-center justify-between">
                                            <input
                                                type="password"
                                                inputMode="numeric"
                                                value={cvv}
                                                onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                                placeholder="123"
                                                maxLength={4}
                                                className="w-full bg-transparent outline-none text-[15px] font-semibold text-[#0B3A53] placeholder:text-slate-200"
                                            />
                                            {cvv.length >= 3 && <Check className="w-4 h-4 text-emerald-500 shrink-0 ml-2 stroke-[3]" />}
                                        </div>
                                    </div>
                                </div>

                                {/* Name on Card */}
                                <div className={`border rounded p-2.5 bg-white transition-colors focus-within:border-[#0B3A53] ${errors.cardName ? 'border-rose-400' : 'border-slate-800'}`}>
                                    <label className="block text-[11px] text-slate-400 mb-0.5">Name on card</label>
                                    <div className="flex items-center justify-between">
                                        <input
                                            type="text"
                                            value={cardName}
                                            onChange={(e) => setCardName(e.target.value)}
                                            placeholder="Samanta Smith"
                                            className="w-full bg-transparent outline-none text-[15px] font-semibold text-[#0B3A53] placeholder:text-slate-200"
                                        />
                                        {cardName.trim().length > 3 && <Check className="w-4 h-4 text-emerald-500 shrink-0 ml-2 stroke-[3]" />}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ── Pay Button ── */}
                        <button
                            onClick={handlePay}
                            disabled={isProcessing}
                            className={`w-full py-5 rounded-xl text-white font-black text-base tracking-wide transition-all duration-300 shadow-xl flex items-center justify-center gap-3 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed bg-gradient-to-r ${gradient} hover:shadow-[#16A6A1]/30 hover:scale-[1.01]`}
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Processing Payment…
                                </>
                            ) : (
                                <>
                                    <Lock className="w-5 h-5" />
                                    Pay ${price} / {period} — Activate {planName}
                                </>
                            )}
                        </button>

                        <p className="text-center text-xs text-slate-400 font-medium leading-relaxed">
                            🔒 By completing this purchase you agree to our{' '}
                            <span className="text-[#16A6A1] cursor-pointer hover:underline">Terms of Service</span>{' '}
                            and{' '}
                            <span className="text-[#16A6A1] cursor-pointer hover:underline">Privacy Policy</span>.
                        </p>
                    </div>

                    {/* ══ RIGHT COLUMN: Summary ══════════════════════════════════════════ */}
                    <div className="lg:col-span-5 space-y-5 lg:sticky lg:top-6">
                        {/* Plan Summary */}
                        <div className={`bg-gradient-to-br ${gradient} text-white rounded-3xl overflow-hidden shadow-2xl`}>
                            <div className="px-6 pt-6 pb-4 border-b border-white/10">
                                <div className="flex items-center gap-3">
                                    <div className="w-11 h-11 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center shrink-0">
                                        <Sparkles className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-white/50 text-[10px] font-black uppercase tracking-widest">Selected Plan</p>
                                        <h3 className="text-xl font-black text-white leading-tight">{planName}</h3>
                                    </div>
                                </div>
                            </div>
                            <div className="px-6 py-4 border-b border-white/10 space-y-2.5">
                                {features.map((f, i) => (
                                    <div key={i} className="flex items-center gap-2.5">
                                        <div className="w-5 h-5 rounded-full bg-[#16A6A1]/30 border border-[#16A6A1]/50 flex items-center justify-center shrink-0">
                                            <Check className="w-3 h-3 text-[#16A6A1]" />
                                        </div>
                                        <span className="text-sm text-white/80 font-medium">{f}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="px-6 py-5 space-y-2.5">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-white/50 font-bold">Subtotal</span>
                                    <span className="text-white font-bold">${price}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-white/50 font-bold">Tax</span>
                                    <span className="text-white font-bold">$0.00</span>
                                </div>
                                <div className="flex items-center justify-between border-t border-white/10 pt-3 mt-1">
                                    <span className="text-white font-black text-base">Total Due</span>
                                    <div className="text-right">
                                        <span className="text-2xl font-black text-[#16A6A1]">${price}</span>
                                        <span className="text-white/50 text-xs font-bold ml-1">/ {period}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Trust badges */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
                            <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider pt-1">Why Trust NOVA?</h4>
                            {[
                                {
                                    icon: Shield,
                                    label: 'Cancel Anytime',
                                    desc: 'No lock-in contracts. Cancel with one click.',
                                    color: 'bg-emerald-50 text-emerald-600',
                                },
                                {
                                    icon: Zap,
                                    label: 'Instant Activation',
                                    desc: 'Your plan activates the moment payment clears.',
                                    color: 'bg-amber-50 text-amber-500',
                                },
                                {
                                    icon: Lock,
                                    label: 'Secure Payments',
                                    desc: '256-bit encrypted · PCI DSS compliant.',
                                    color: 'bg-violet-50 text-violet-500',
                                },
                            ].map(({ icon: Icon, label, desc, color }) => (
                                <div key={label} className="flex items-start gap-3">
                                    <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center shrink-0 mt-0.5`}>
                                        <Icon className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-[#0B3A53]">{label}</p>
                                        <p className="text-xs text-slate-400 font-medium leading-relaxed mt-0.5">{desc}</p>
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
