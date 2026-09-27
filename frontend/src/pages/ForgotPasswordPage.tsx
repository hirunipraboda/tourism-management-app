import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, ShieldCheck, Loader2, ArrowLeft } from 'lucide-react';

// High-resolution local Sri Lanka landmark asset
import galleImg from '../assets/destinations/Galle.jpg';

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const validateForm = () => {
    setEmailError('');
    if (!email.trim()) {
      setEmailError('This field is required.');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Please enter a valid email address.');
      return false;
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setSubmitted(true);
    }, 900);
  };

  return (
    <div className="min-h-screen bg-[#FCFCFA] flex w-full font-sans antialiased text-slate-800">
      
      {/* LEFT SIDE: Cinematic Travel Photography (45% Width on Desktop) */}
      <div className="hidden lg:flex lg:w-[45%] relative bg-slate-950 overflow-hidden select-none">
        <img
          src={galleImg}
          alt="Sri Lanka Galle Fort"
          className="absolute inset-0 w-full h-full object-cover opacity-90 transition-transform duration-10000 hover:scale-105"
        />
        
        {/* Subtle Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-slate-950/30" />

        {/* Content Overlay */}
        <div className="relative z-10 w-full h-full p-12 flex flex-col justify-between text-white">
          <div>
            <img
              src="/assets/images/nova-logo-light.svg"
              alt="NOVA"
              className="h-11 w-auto object-contain"
            />
          </div>

          <div className="space-y-4 max-w-md pb-6">
            <span className="text-xs uppercase font-extrabold tracking-widest text-[#38BDF8] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#38BDF8]" />
              <span>Smart Journeys. Lasting Memories.</span>
            </span>

            <h2 className="text-3xl xl:text-4xl font-black text-white font-heading leading-tight tracking-tight">
              We'll get you back on track.
            </h2>

            <p className="text-sm text-slate-300 font-medium leading-relaxed">
              Don't worry — password reset instructions will be sent straight to your email.
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Clean Password Reset Form */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 sm:px-12 py-12 bg-white sm:bg-[#FCFCFA]">
        <div className="w-full max-w-[440px] space-y-8">
          
          {/* Logo & Back Button */}
          <div className="flex flex-col items-start space-y-4">
            <Link to="/" className="inline-block transition-opacity hover:opacity-90">
              <img
                src="/assets/images/nova-logo-dark.svg"
                alt="NOVA"
                className="h-10 sm:h-12 w-auto object-contain"
              />
            </Link>

            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-black text-[#0B3A53] tracking-tight font-heading">
                Reset your password
              </h1>
              <p className="text-xs sm:text-sm font-semibold text-slate-500 leading-relaxed">
                Enter your email address and we'll send you instructions to reset your password.
              </p>
            </div>
          </div>

          {/* SUCCESS STATE */}
          {submitted ? (
            <div className="bg-[#16A6A1]/10 border border-[#16A6A1]/30 rounded-3xl p-8 text-center space-y-5 animate-in fade-in zoom-in duration-300">
              <div className="w-14 h-14 rounded-full bg-[#16A6A1] text-white mx-auto flex items-center justify-center shadow-lg">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-black text-[#0B3A53] font-heading">
                  Check your inbox
                </h3>
                <p className="text-xs font-semibold text-[#146C86] leading-relaxed">
                  We've sent a password reset link to <span className="font-extrabold text-[#0B3A53]">{email}</span>.
                </p>
              </div>

              <button
                onClick={() => navigate('/login')}
                className="w-full h-12 rounded-full bg-[#0B3A53] hover:bg-[#072537] text-white font-extrabold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Sign In</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Email */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError('');
                  }}
                  placeholder="Enter your registered email"
                  disabled={isLoading}
                  className={`w-full h-12 px-4 rounded-2xl bg-slate-50 border font-medium text-sm text-[#0B3A53] placeholder-slate-400 transition-all duration-200 focus:outline-none focus:bg-white ${
                    emailError
                      ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-200'
                      : 'border-slate-200 focus:border-[#16A6A1] focus:ring-2 focus:ring-[#16A6A1]/20'
                  }`}
                />
                {emailError && (
                  <p className="text-[11px] font-bold text-rose-600 pl-1">{emailError}</p>
                )}
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 rounded-full bg-[#0B3A53] hover:bg-[#072537] text-white font-extrabold text-xs uppercase tracking-wider shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#16A6A1]" />
                    <span>Sending instructions...</span>
                  </>
                ) : (
                  <>
                    <span>Send Reset Link</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Back to Login Link */}
              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#146C86] hover:text-[#0B3A53] transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </form>
          )}

        </div>
      </div>

    </div>
  );
};
