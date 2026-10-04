import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Loader2,
  ArrowLeft,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  Mail,
  KeyRound,
} from 'lucide-react';
import { authService } from '../services/authService';

// High-resolution local Sri Lanka landmark asset
import galleImg from '../assets/destinations/Galle.jpg';
import websiteLogo from '../assets/website-logo.png';

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const initialEmail = (location.state as any)?.email || '';

  const [email, setEmail] = useState(initialEmail);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (initialEmail) {
      setEmail(initialEmail);
    }
  }, [initialEmail]);

  const validateForm = () => {
    let isValid = true;
    setEmailError('');
    setPasswordError('');
    setConfirmError('');
    setGeneralError('');

    if (!email.trim()) {
      setEmailError('Email is required.');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Please enter a valid email address.');
      isValid = false;
    }

    if (!newPassword) {
      setPasswordError('New password is required.');
      isValid = false;
    } else if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long.');
      isValid = false;
    }

    if (!confirmPassword) {
      setConfirmError('Please confirm your new password.');
      isValid = false;
    } else if (newPassword !== confirmPassword) {
      setConfirmError('Passwords do not match.');
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setGeneralError('');

    const res = await authService.resetPassword({
      email: email.trim(),
      newPassword,
      confirmPassword,
    });

    setIsLoading(false);

    if (res.success) {
      setSubmitted(true);
    } else {
      setGeneralError(res.message || 'Failed to reset password. Please check your email.');
    }
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
              src={websiteLogo}
              alt="TourLink"
              className="h-11 w-auto object-contain"
            />
          </div>

          <div className="space-y-4 max-w-md pb-6">
            <span className="text-xs uppercase font-extrabold tracking-widest text-[#38BDF8] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#38BDF8]" />
              <span>Secure Authentication</span>
            </span>

            <h2 className="text-3xl xl:text-4xl font-black text-white font-heading leading-tight tracking-tight">
              Reset Your Password
            </h2>

            <p className="text-sm text-slate-300 font-medium leading-relaxed">
              For security, password changes can only be performed through this official reset flow. Set your new password to restore full account access.
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Password Reset Form */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 sm:px-12 py-12 bg-white sm:bg-[#FCFCFA]">
        <div className="w-full max-w-[440px] space-y-7">
          
          {/* Logo & Header */}
          <div className="flex flex-col items-start space-y-3">
            <Link to="/" className="inline-block transition-opacity hover:opacity-90">
              <img
                src={websiteLogo}
                alt="TourLink"
                className="h-10 sm:h-12 w-auto object-contain"
              />
            </Link>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#16A6A1]/10 text-[#138D89] text-[11px] font-black uppercase tracking-wider mb-1">
                <KeyRound className="w-3.5 h-3.5" />
                <span>Account Security</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#0B3A53] tracking-tight font-heading">
                Reset Password
              </h1>
              <p className="text-xs sm:text-sm font-semibold text-slate-500 leading-relaxed">
                Enter your registered email and choose a new secure password.
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
                  Password Updated!
                </h3>
                <p className="text-xs font-semibold text-[#146C86] leading-relaxed">
                  Your password has been successfully reset in the database for <span className="font-extrabold text-[#0B3A53]">{email}</span>. You can now sign in using your new credentials.
                </p>
              </div>

              <button
                onClick={() => navigate('/login')}
                className="w-full h-12 rounded-full bg-[#0B3A53] hover:bg-[#072537] text-white font-extrabold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Proceed to Sign In</span>
                <ArrowRight className="w-4 h-4 text-[#16A6A1]" />
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">

              {generalError && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2.5 animate-in fade-in duration-200">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{generalError}</span>
                </div>
              )}
              
              {/* Registered Email */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#16A6A1]" />
                  <span>Registered Email</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError('');
                  }}
                  placeholder="Enter your registered email address"
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

              {/* New Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#16A6A1]" />
                  <span>New Password</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (passwordError) setPasswordError('');
                    }}
                    placeholder="Minimum 6 characters"
                    disabled={isLoading}
                    className={`w-full h-12 pl-4 pr-11 rounded-2xl bg-slate-50 border font-medium text-sm text-[#0B3A53] placeholder-slate-400 transition-all duration-200 focus:outline-none focus:bg-white ${
                      passwordError
                        ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-200'
                        : 'border-slate-200 focus:border-[#16A6A1] focus:ring-2 focus:ring-[#16A6A1]/20'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordError && (
                  <p className="text-[11px] font-bold text-rose-600 pl-1">{passwordError}</p>
                )}
              </div>

              {/* Confirm New Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#16A6A1]" />
                  <span>Confirm New Password</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (confirmError) setConfirmError('');
                    }}
                    placeholder="Repeat new password"
                    disabled={isLoading}
                    className={`w-full h-12 pl-4 pr-11 rounded-2xl bg-slate-50 border font-medium text-sm text-[#0B3A53] placeholder-slate-400 transition-all duration-200 focus:outline-none focus:bg-white ${
                      confirmError
                        ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-200'
                        : 'border-slate-200 focus:border-[#16A6A1] focus:ring-2 focus:ring-[#16A6A1]/20'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmError && (
                  <p className="text-[11px] font-bold text-rose-600 pl-1">{confirmError}</p>
                )}
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 mt-2 rounded-full bg-[#0B3A53] hover:bg-[#072537] text-white font-extrabold text-xs uppercase tracking-wider shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#16A6A1]" />
                    <span>Resetting Password...</span>
                  </>
                ) : (
                  <>
                    <span>Reset Password</span>
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
