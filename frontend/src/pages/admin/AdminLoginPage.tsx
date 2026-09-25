import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import websiteLogo from '../../assets/website-logo.png';
import sigiriyaImg from '../../assets/destinations/sigiriya.jpg';
import { adminAuthService } from '../../services/adminAuthService';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('admin@travellink.lk');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in both Email and Password');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      adminAuthService.login(email);
      setIsLoading(false);
      navigate('/admin');
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#072537] flex w-full font-sans antialiased text-white selection:bg-[#16A6A1]/20">
      
      {/* LEFT SIDE: Sri Lankan Travel Inspiration */}
      <div className="hidden lg:flex lg:w-[48%] relative overflow-hidden select-none">
        <img
          src={sigiriyaImg}
          alt="Travel Link Sri Lanka"
          className="absolute inset-0 w-full h-full object-cover opacity-80 transition-transform duration-10000 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#072537] via-[#072537]/50 to-transparent" />

        <div className="relative z-10 w-full h-full p-12 flex flex-col justify-between">
          <div>
            <img
              src={websiteLogo}
              alt="Travel Link"
              className="h-16 w-auto object-contain"
            />
          </div>

          <div className="space-y-4 max-w-md pb-6">
            <span className="text-xs uppercase font-extrabold tracking-widest text-[#16A6A1] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#16A6A1]" />
              <span>Travel Link System Console</span>
            </span>

            <h2 className="text-3xl xl:text-4xl font-black text-white font-heading leading-tight tracking-tight">
              Manage Sri Lanka’s Smart Tourism Ecosystem.
            </h2>

            <p className="text-sm text-slate-300 font-medium leading-relaxed">
              Control bookings, manage destinations & tour packages, oversee AI agent workflows, and issue human itinerary approvals.
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Admin Authentication Form */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 sm:px-12 py-12 bg-[#0B3A53]">
        <div className="w-full max-w-[420px] space-y-8 bg-white/5 backdrop-blur-xl p-8 sm:p-10 rounded-3xl border border-white/10 shadow-2xl">
          
          {/* Header */}
          <div className="space-y-3 text-center sm:text-left">
            <img
              src={websiteLogo}
              alt="Travel Link"
              className="h-14 w-auto object-contain mx-auto sm:mx-0"
            />
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-heading">
                Admin Console Sign In
              </h1>
              <p className="text-xs text-slate-300 font-medium mt-1">
                Enter your administrative credentials to access the Travel Link portal.
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleAdminLogin} className="space-y-5">
            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs font-bold animate-in fade-in duration-200">
                {error}
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Admin Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@travellink.lk"
                  className="w-full h-12 pl-11 pr-4 rounded-2xl bg-white/10 border border-white/15 text-sm font-medium text-white placeholder-slate-400 focus:outline-none focus:border-[#16A6A1] focus:bg-white/15 transition-all"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-12 pl-11 pr-11 rounded-2xl bg-white/10 border border-white/15 text-sm font-medium text-white placeholder-slate-400 focus:outline-none focus:border-[#16A6A1] focus:bg-white/15 transition-all"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors p-1 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Quick Demo Info */}
            <div className="bg-white/5 p-3 rounded-2xl border border-white/10 text-[11px] text-slate-300 flex items-center justify-between">
              <span>Demo Credentials:</span>
              <span className="font-mono font-bold text-[#16A6A1]">admin@travellink.lk / admin123</span>
            </div>

            {/* Submit CTA Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-full bg-gradient-to-r from-[#146C86] to-[#16A6A1] hover:from-[#0B3A53] hover:to-[#146C86] text-white font-extrabold text-xs uppercase tracking-wider shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Access Admin Console</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

        </div>
      </div>

    </div>
  );
};
