import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, CheckCircle2, ShieldCheck, Loader2, Check, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import websiteLogo from '../assets/website-logo.png';

// High-resolution local Sri Lanka landmark asset
import sigiriyaImg from '../assets/destinations/sigiriya.jpg';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Field errors
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [termsError, setTermsError] = useState('');

  // Password requirements criteria
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  const getPasswordStrength = () => {
    if (!password) return { label: 'None', score: 0, color: 'bg-slate-200' };
    let score = 0;
    if (hasMinLength) score++;
    if (hasUppercase) score++;
    if (hasNumber) score++;

    if (score === 1) return { label: 'Weak', score: 33, color: 'bg-rose-500', text: 'text-rose-600' };
    if (score === 2) return { label: 'Medium', score: 66, color: 'bg-amber-500', text: 'text-amber-600' };
    if (score === 3) return { label: 'Strong', score: 100, color: 'bg-[#16A6A1]', text: 'text-[#16A6A1]' };
    return { label: 'Weak', score: 20, color: 'bg-rose-500', text: 'text-rose-600' };
  };

  const strength = getPasswordStrength();

  const validateForm = () => {
    let isValid = true;
    setNameError('');
    setEmailError('');
    setPasswordError('');
    setConfirmError('');
    setTermsError('');
    setError(null);

    if (!fullName.trim()) {
      setNameError('This field is required.');
      isValid = false;
    }

    if (!email.trim()) {
      setEmailError('This field is required.');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Please enter a valid email address.');
      isValid = false;
    }

    if (!password) {
      setPasswordError('This field is required.');
      isValid = false;
    } else if (!hasMinLength || !hasUppercase || !hasNumber) {
      setPasswordError('Please choose a stronger password.');
      isValid = false;
    }

    if (!confirmPassword) {
      setConfirmError('This field is required.');
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmError("Passwords don't match.");
      isValid = false;
    }

    if (!agreeTerms) {
      setTermsError('You must agree to the Terms of Service to create an account.');
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    // Simulate account registration
    setTimeout(() => {
      register(fullName, email);
      setIsLoading(false);
      setSuccess(true);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#FCFCFA] flex w-full font-sans antialiased text-slate-800">
      
      {/* LEFT SIDE: Cinematic Travel Photography (45% Width on Desktop) */}
      <div className="hidden lg:flex lg:w-[45%] relative bg-slate-950 overflow-hidden select-none">
        <img
          src={sigiriyaImg}
          alt="Sri Lanka Sigiriya Heritage"
          className="absolute inset-0 w-full h-full object-cover opacity-90 transition-transform duration-10000 hover:scale-105"
        />
        
        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-slate-950/30" />

        {/* Content Overlay */}
        <div className="relative z-10 w-full h-full p-12 flex flex-col justify-between text-white">
          {/* Top Logo Asset */}
          <div>
            <img
              src={websiteLogo}
              alt="Tour Link"
              className="h-14 sm:h-16 w-auto object-contain"
            />
          </div>

          {/* Bottom Copy */}
          <div className="space-y-4 max-w-md pb-6">
            <span className="text-xs uppercase font-extrabold tracking-widest text-[#38BDF8] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#38BDF8]" />
              <span>Smart Journeys. Lasting Memories.</span>
            </span>

            <h2 className="text-3xl xl:text-4xl font-black text-white font-heading leading-tight tracking-tight">
              Begin your travel story with Tour Link.
            </h2>

            <p className="text-sm text-slate-300 font-medium leading-relaxed">
              Create your account to unlock personalized recommendations, custom itineraries, and expert Sri Lankan tour guides.
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Clean Premium Registration Form */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 sm:px-12 py-12 bg-white sm:bg-[#FCFCFA]">
        <div className="w-full max-w-[440px] space-y-7">
          
          {/* Logo & Header */}
          <div className="flex flex-col items-start space-y-3">
            <Link to="/" className="inline-block transition-opacity hover:opacity-90">
              <img
                src={websiteLogo}
                alt="Tour Link"
                className="h-12 sm:h-16 w-auto object-contain"
              />
            </Link>

            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-black text-[#0B3A53] tracking-tight font-heading">
                Start your journey
              </h1>
              <p className="text-xs sm:text-sm font-semibold text-slate-500 leading-relaxed">
                Create your Tour Link account and turn your travel ideas into unforgettable journeys.
              </p>
            </div>
          </div>

          {/* SUCCESS STATE */}
          {success ? (
            <div className="bg-[#16A6A1]/10 border border-[#16A6A1]/30 rounded-3xl p-8 text-center space-y-5 animate-in fade-in zoom-in duration-300">
              <div className="w-14 h-14 rounded-full bg-[#16A6A1] text-white mx-auto flex items-center justify-center shadow-lg">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-black text-[#0B3A53] font-heading">
                  Welcome to Tour Link, {fullName.split(' ')[0]}.
                </h3>
                <p className="text-sm font-bold text-[#146C86]">
                  Your journey starts here. Let's start creating unforgettable travel memories.
                </p>
              </div>

              <button
                onClick={() => navigate('/')}
                className="w-full h-12 rounded-full bg-[#0B3A53] hover:bg-[#072537] text-white font-extrabold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Start Exploring</span>
                <ArrowRight className="w-4 h-4 text-[#16A6A1]" />
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* GLOBAL ERROR BANNER */}
              {error && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold animate-in fade-in duration-200">
                  {error}
                </div>
              )}

              {/* Full Name */}
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (nameError) setNameError('');
                  }}
                  placeholder="Enter your full name"
                  disabled={isLoading}
                  className={`w-full h-12 px-4 rounded-2xl bg-slate-50 border font-medium text-sm text-[#0B3A53] placeholder-slate-400 transition-all duration-200 focus:outline-none focus:bg-white ${
                    nameError
                      ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-200'
                      : 'border-slate-200 focus:border-[#16A6A1] focus:ring-2 focus:ring-[#16A6A1]/20'
                  }`}
                />
                {nameError && (
                  <p className="text-[11px] font-bold text-rose-600 pl-1">{nameError}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1">
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
                  placeholder="Enter your email address"
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

              {/* Password */}
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onFocus={() => setIsPasswordFocused(true)}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (passwordError) setPasswordError('');
                    }}
                    placeholder="Create a password"
                    disabled={isLoading}
                    className={`w-full h-12 pl-4 pr-12 rounded-2xl bg-slate-50 border font-medium text-sm text-[#0B3A53] placeholder-slate-400 transition-all duration-200 focus:outline-none focus:bg-white ${
                      passwordError
                        ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-200'
                        : 'border-slate-200 focus:border-[#16A6A1] focus:ring-2 focus:ring-[#16A6A1]/20'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordError && (
                  <p className="text-[11px] font-bold text-rose-600 pl-1">{passwordError}</p>
                )}

                {/* Subtle Password Strength & Requirements Indicator */}
                {(isPasswordFocused || password.length > 0) && (
                  <div className="pt-2 pb-1 px-1 space-y-2 text-xs animate-in fade-in duration-200">
                    <div className="flex items-center justify-between font-bold text-[11px]">
                      <span className="text-slate-500 uppercase tracking-wider">Password strength</span>
                      <span className={strength.text}>{strength.label}</span>
                    </div>

                    <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${strength.color} transition-all duration-300`}
                        style={{ width: `${strength.score}%` }}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-1 pt-1 text-[10px] font-semibold">
                      <div className={`flex items-center gap-1 ${hasMinLength ? 'text-[#16A6A1]' : 'text-slate-400'}`}>
                        {hasMinLength ? <Check className="w-3 h-3 shrink-0" /> : <X className="w-3 h-3 shrink-0" />}
                        <span>8+ chars</span>
                      </div>
                      <div className={`flex items-center gap-1 ${hasUppercase ? 'text-[#16A6A1]' : 'text-slate-400'}`}>
                        {hasUppercase ? <Check className="w-3 h-3 shrink-0" /> : <X className="w-3 h-3 shrink-0" />}
                        <span>1 Uppercase</span>
                      </div>
                      <div className={`flex items-center gap-1 ${hasNumber ? 'text-[#16A6A1]' : 'text-slate-400'}`}>
                        {hasNumber ? <Check className="w-3 h-3 shrink-0" /> : <X className="w-3 h-3 shrink-0" />}
                        <span>1 Number</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (confirmError) setConfirmError('');
                  }}
                  placeholder="Confirm your password"
                  disabled={isLoading}
                  className={`w-full h-12 px-4 rounded-2xl bg-slate-50 border font-medium text-sm text-[#0B3A53] placeholder-slate-400 transition-all duration-200 focus:outline-none focus:bg-white ${
                    confirmError
                      ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-200'
                      : 'border-slate-200 focus:border-[#16A6A1] focus:ring-2 focus:ring-[#16A6A1]/20'
                  }`}
                />
                {confirmError && (
                  <p className="text-[11px] font-bold text-rose-600 pl-1">{confirmError}</p>
                )}
              </div>

              {/* Terms & Privacy Checkbox */}
              <div className="pt-1">
                <label className="flex items-start gap-2.5 cursor-pointer text-xs font-semibold text-slate-600 leading-snug">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => {
                      setAgreeTerms(e.target.checked);
                      if (termsError) setTermsError('');
                    }}
                    className="mt-0.5 w-4 h-4 rounded border-slate-300 text-[#16A6A1] focus:ring-[#16A6A1] cursor-pointer shrink-0"
                  />
                  <span>
                    I agree to Tour Link's{' '}
                    <a href="#terms" className="font-extrabold text-[#146C86] hover:underline">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="#privacy" className="font-extrabold text-[#146C86] hover:underline">
                      Privacy Policy
                    </a>.
                  </span>
                </label>
                {termsError && (
                  <p className="text-[11px] font-bold text-rose-600 pl-1 pt-1">{termsError}</p>
                )}
              </div>

              {/* Submit CTA Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 rounded-full bg-[#0B3A53] hover:bg-[#072537] text-white font-extrabold text-xs uppercase tracking-wider shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#16A6A1]" />
                    <span>Creating your account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Social Login Divider */}
              <div className="relative py-1 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <span className="relative px-4 bg-white sm:bg-[#FCFCFA] text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  or continue with
                </span>
              </div>

              {/* Social Registration Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    register('Alex Morgan', 'traveler.google@gmail.com');
                    navigate('/');
                  }}
                  className="h-11 px-4 rounded-2xl bg-white border border-slate-200/90 text-slate-700 hover:border-slate-300 hover:bg-slate-50 font-bold text-xs flex items-center justify-center gap-2.5 transition-all shadow-2xs cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Google</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    register('Alex Morgan', 'traveler.apple@icloud.com');
                    navigate('/');
                  }}
                  className="h-11 px-4 rounded-2xl bg-white border border-slate-200/90 text-slate-700 hover:border-slate-300 hover:bg-slate-50 font-bold text-xs flex items-center justify-center gap-2.5 transition-all shadow-2xs cursor-pointer"
                >
                  <svg className="w-4 h-4 fill-current text-slate-800" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.63c.69-.84 1.16-2.01 1.03-3.18-1 .04-2.22.67-2.93 1.5-.64.74-1.2 1.94-1.05 3.09 1.12.09 2.26-.57 2.95-1.41z" />
                  </svg>
                  <span>Apple</span>
                </button>
              </div>

              {/* Bottom Login Link */}
              <div className="text-center pt-3 text-xs font-semibold text-slate-500">
                <span>Already have an account? </span>
                <Link
                  to="/login"
                  className="font-extrabold text-[#146C86] hover:text-[#0B3A53] transition-colors underline underline-offset-4"
                >
                  Sign in
                </Link>
              </div>
            </form>
          )}

        </div>
      </div>

    </div>
  );
};
