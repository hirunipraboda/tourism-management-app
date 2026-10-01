import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  CreditCard,
  Lock,
  ShieldCheck,
  Copy,
  Check,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';
import pickmeLogoImg from '../../assets/pickme-logo.png';

interface PickMePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  passFee?: number;
  durationDays?: number;
  onSuccess?: (promoCode: string, txnId: string) => void;
}

export const PickMePaymentModal: React.FC<PickMePaymentModalProps> = ({
  isOpen,
  onClose,
  passFee = 7.50,
  durationDays = 3,
  onSuccess
}) => {
  const [cardHolder, setCardHolder] = useState('Alex Morgan');
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('888');
  const [cardError, setCardError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentTxnId, setPaymentTxnId] = useState('');
  const [generatedPromoCode, setGeneratedPromoCode] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen) return null;

  const generatePromoCode = () => {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let rand = '';
    for (let i = 0; i < 6; i++) {
      rand += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `PICKME-NOVA20-${rand}`;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = val.replace(/(\d{4})/g, '$1 ').trim();
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (val.length >= 3) {
      val = `${val.slice(0, 2)}/${val.slice(2)}`;
    }
    setCardExpiry(val);
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
    setCardCvv(val);
  };

  const handleAutoFillDemo = () => {
    setCardHolder('Alex Morgan');
    setCardNumber('4242 4242 4242 4242');
    setCardExpiry('12/28');
    setCardCvv('888');
    setCardError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCardError('');

    const rawNum = cardNumber.replace(/\s/g, '');
    if (!cardHolder.trim()) {
      setCardError('Please enter the cardholder name.');
      return;
    }
    if (rawNum.length < 15) {
      setCardError('Please enter a valid 15 or 16-digit card number.');
      return;
    }
    if (cardExpiry.length < 5) {
      setCardError('Please enter card expiry date (MM/YY).');
      return;
    }
    if (cardCvv.length < 3) {
      setCardError('Please enter card CVV (3-4 digits).');
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      const code = generatePromoCode();
      const txn = `TXN-${Math.floor(100000 + Math.random() * 900000)}`;
      setGeneratedPromoCode(code);
      setPaymentTxnId(txn);
      setIsProcessing(false);
      setPaymentSuccess(true);
      if (onSuccess) onSuccess(code, txn);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-amber-500 via-[#FFC400] to-amber-500 p-5 text-slate-950 flex items-center justify-between relative shadow-md">
          <div className="flex items-center gap-3">
            <div className="h-10 px-3.5 bg-slate-950 rounded-xl flex items-center justify-center shadow">
              <img src={pickmeLogoImg} alt="PickMe" className="h-8 w-auto object-contain brightness-110" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-black text-base leading-tight font-heading">PickMe Mobility Payment Portal</h3>
                <span className="px-2 py-0.5 rounded-full bg-slate-950 text-amber-300 text-[10px] font-black uppercase">
                  20% OFF
                </span>
              </div>
              <p className="text-[11px] font-bold text-slate-900/80">
                Official Ride-Hailing Partner · Sri Lanka
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-950/15 hover:bg-slate-950/25 text-slate-950 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close Payment Portal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {paymentSuccess ? (
            /* Payment Success View */
            <div className="text-center py-4 space-y-4 animate-in fade-in duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <span className="text-xs font-black uppercase tracking-wider text-emerald-600 block">
                  Payment Completed Successfully
                </span>
                <h4 className="text-2xl font-black text-slate-900 mt-1 font-heading">
                  PickMe 20% Off Mobility Pass Activated!
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Transaction Ref: <strong>{paymentTxnId}</strong> · Amount Paid: <strong>${passFee.toFixed(2)} USD</strong>
                </p>
              </div>

              {/* Revealed Promo Code */}
              <div className="bg-amber-50 border-2 border-dashed border-amber-400 rounded-2xl p-5 space-y-2">
                <span className="text-[10px] font-black uppercase text-amber-900 tracking-widest block">
                  YOUR EXCLUSIVE UNIQUE PROMO CODE
                </span>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-2xl sm:text-3xl font-black font-mono tracking-widest text-slate-950 bg-white px-4 py-1.5 rounded-xl border border-amber-300 shadow-sm">
                    {generatedPromoCode}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(generatedPromoCode);
                      setCopiedCode(true);
                      setTimeout(() => setCopiedCode(false), 2000);
                    }}
                    className="p-3 bg-slate-950 hover:bg-black text-white rounded-xl shadow transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold"
                    title="Copy Code"
                  >
                    {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-700 font-medium pt-1">
                  Enter this promo code in the <strong>PickMe App</strong> to automatically claim <strong>20% OFF your next 5 rides</strong> in Sri Lanka.
                </p>
              </div>

              <div className="bg-slate-50 rounded-xl p-3 text-left text-xs text-slate-600 border border-slate-200 flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>
                  Valid for Tuk-Tuks, Air-Conditioned Cars, Vans, and Airport Pickups across Colombo, Kandy, Galle, Ella, and Mirissa.
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <a
                  href="https://pickme.lk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#FFD200] via-[#FFC400] to-[#FFA800] hover:from-[#FFE033] hover:to-[#FFC400] text-slate-950 font-black text-xs uppercase tracking-wider shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <span>Open PickMe App</span>
                  <ExternalLink className="w-4 h-4" />
                </a>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-3.5 px-6 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            /* Card Payment Form View */
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Dynamic Pricing Banner */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2.5 mb-2.5">
                  <div>
                    <span className="text-xs font-black text-slate-900 block font-heading">
                      PickMe Mobility Pass
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Standard {durationDays} Days Duration · $2.50 / day
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-[#0B3A53] font-heading">
                      ${passFee.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-slate-400 block font-bold">USD</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-600">
                  <span className="flex items-center gap-1">
                    🎁 <strong>Benefit:</strong> 20% off 5 rides
                  </span>
                  <span className="text-amber-800 font-bold">
                    Instant Voucher Activation
                  </span>
                </div>
              </div>

              {/* Payment Method Option */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-amber-500" />
                    <span>Payment Method</span>
                  </label>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md">
                    Instant Clearance
                  </span>
                </div>

                <div className="p-3.5 rounded-xl border-2 border-amber-400 bg-amber-50/40 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full border-4 border-amber-500 bg-white shrink-0" />
                    <div>
                      <span className="text-xs font-black text-slate-900 block">Credit / Debit Card</span>
                      <span className="text-[10px] text-slate-500">Visa, Mastercard, American Express, JCB</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-700">VISA</span>
                    <span className="text-[10px] font-bold bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-700">MC</span>
                    <span className="text-[10px] font-bold bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-700">AMEX</span>
                  </div>
                </div>
              </div>

              {/* Form Inputs */}
              <div className="space-y-3 pt-1">
                <div>
                  <label className="text-[11px] font-extrabold text-slate-700 block mb-1">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Alex Morgan"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-extrabold text-slate-700 block mb-1">
                    Card Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="4242 4242 4242 4242"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      maxLength={19}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white transition-all tracking-wider"
                      required
                    />
                    <CreditCard className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-extrabold text-slate-700 block mb-1">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      value={cardExpiry}
                      onChange={handleExpiryChange}
                      maxLength={5}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-extrabold text-slate-700 block mb-1 flex items-center justify-between">
                      <span>CVV / CVC</span>
                      <span className="text-[9px] text-slate-400 font-normal">3-4 digits</span>
                    </label>
                    <input
                      type="password"
                      placeholder="•••"
                      value={cardCvv}
                      onChange={handleCvvChange}
                      maxLength={4}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white transition-all"
                      required
                    />
                  </div>
                </div>

                {cardError && (
                  <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-[11px] font-bold text-rose-700 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span>{cardError}</span>
                  </div>
                )}

                <div className="pt-1 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-emerald-600" /> 256-Bit Encrypted Portal
                  </span>
                  <button
                    type="button"
                    onClick={handleAutoFillDemo}
                    className="text-[11px] font-extrabold text-amber-700 hover:text-amber-800 hover:underline cursor-pointer"
                  >
                    ⚡ 1-Click Demo Card
                  </button>
                </div>
              </div>

              {/* Submit Pay Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-3.5 px-6 rounded-xl bg-slate-950 hover:bg-black text-white font-black text-xs uppercase tracking-wider shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Processing Payment & Issuing 20% Pass...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 text-amber-300" />
                      <span>Pay ${passFee.toFixed(2)} & Activate 20% Off Pass</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
