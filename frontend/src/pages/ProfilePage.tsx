import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  User as UserIcon,
  Camera,
  Mail,
  Phone,
  MapPin,
  Shield,
  Check,
  ArrowLeft,
  Sparkles,
  Save,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  LogOut,
  Upload,
  Lock,
  Loader2,
  Calendar,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';
import { LandingNavbar } from '../components/navigation/LandingNavbar';
import { Footer } from '../components/navigation/Footer';
import { MyGuideBookingsSection } from '../components/guide/MyGuideBookingsSection';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=300&q=80',
];

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, updateUser, logout } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initialTab = searchParams.get('tab') === 'guide-bookings' ? 'guide-bookings' : 'profile';
  const [activeTab, setActiveTab] = useState<'profile' | 'guide-bookings'>(initialTab);

  const [name,      setName]      = useState(user?.name     || '');
  const [phone,     setPhone]     = useState(user?.phone    || '');
  const [location,  setLocation]  = useState(user?.location || '');
  const [bio,       setBio]       = useState(user?.bio      || '');
  const [avatarUrl, setAvatarUrl] = useState<string>(user?.avatarUrl || PRESET_AVATARS[0]);

  useEffect(() => {
    if (user) {
      if (user.name) setName(user.name);
      if (user.phone) setPhone(user.phone);
      if (user.location) setLocation(user.location);
      if (user.bio) setBio(user.bio);
      if (user.avatarUrl) setAvatarUrl(user.avatarUrl);
    }
  }, [user]);

  const [isSaving,    setIsSaving]    = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError,   setSaveError]   = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setSaveError('Please select a valid image file.'); return; }
    if (file.size > 5 * 1024 * 1024)    { setSaveError('Image must be smaller than 5 MB.'); return; }
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') { setAvatarUrl(reader.result); setSaveError(''); }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true); setSaveSuccess(false); setSaveError('');
    const result = await authService.updateProfile({
      name: name.trim(), phone: phone.trim(), bio: bio.trim(),
      location: location.trim(), profileImage: avatarUrl,
    });
    setIsSaving(false);
    if (result.success) {
      if (result.user) updateUser(result.user);
      else updateUser({ name, phone, bio, location, avatarUrl });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } else {
      setSaveError(result.message || result.error || 'Failed to save profile.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased">
      <LandingNavbar />
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-8 py-8 space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
          <div className="space-y-1">
            <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-xs font-bold text-[#146C86] hover:text-[#0B3A53] transition-colors mb-2 cursor-pointer">
              <ArrowLeft className="w-4 h-4" /><span>Back</span>
            </button>
            <h1 className="text-3xl font-black text-[#0B3A53] font-heading tracking-tight">My Account</h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Manage your personal information, profile photo, and tour guide bookings.
            </p>
          </div>
          {activeTab === 'profile' && (
            <button onClick={handleSave} disabled={isSaving} className="bg-[#16A6A1] hover:bg-[#146C86] text-white text-xs font-black uppercase tracking-wider px-6 py-3 rounded-full shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50">
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save Changes</span>
            </button>
          )}
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
          <button
            onClick={() => { setActiveTab('profile'); setSearchParams({}); }}
            className={`px-5 py-2.5 rounded-full font-extrabold text-xs transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-[#0B3A53] text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>Profile Details</span>
          </button>
          <button
            onClick={() => { setActiveTab('guide-bookings'); setSearchParams({ tab: 'guide-bookings' }); }}
            className={`px-5 py-2.5 rounded-full font-extrabold text-xs transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'guide-bookings'
                ? 'bg-[#0B3A53] text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>My Tour Guide Bookings</span>
          </button>
        </div>

        {activeTab === 'guide-bookings' ? (
          <MyGuideBookingsSection />
        ) : (
          <>
            {saveSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-3 animate-in fade-in duration-200">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" /><span>Profile updated successfully!</span>
              </div>
            )}
            {saveError && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-3 animate-in fade-in duration-200">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" /><span>{saveError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* LEFT column */}
          <div className="space-y-6">

            {/* Avatar card */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col items-center text-center space-y-5">
              <div className="relative group">
                <img src={avatarUrl} alt={name} className="w-32 h-32 rounded-full object-cover border-4 border-[#16A6A1] shadow-md transition-transform group-hover:scale-105" />
                <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute bottom-1 right-1 p-2.5 rounded-full bg-[#0B3A53] hover:bg-[#146C86] text-white shadow-lg transition-all cursor-pointer" title="Upload photo">
                  <Camera className="w-4 h-4" />
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-black text-[#0B3A53] font-heading">{name || user?.name}</h2>
                <p className="text-xs text-slate-500 font-medium">{user?.email}</p>
                <div className="pt-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#16A6A1]/10 text-[#138D89] text-xs font-black uppercase tracking-wider border border-[#16A6A1]/20">
                    <Shield className="w-3.5 h-3.5" /><span>{user?.role || 'Tourist'}</span>
                  </span>
                </div>
              </div>
              <div className="w-full pt-2 flex flex-col gap-2">
                <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full py-2.5 px-4 rounded-full border border-slate-200 hover:border-[#16A6A1] text-slate-700 hover:text-[#0B3A53] text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer">
                  <Upload className="w-3.5 h-3.5 text-[#16A6A1]" /><span>Upload from Computer</span>
                </button>
                <button type="button" onClick={() => setAvatarUrl(PRESET_AVATARS[0])} className="w-full py-2 px-4 rounded-full text-slate-400 hover:text-rose-600 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer">
                  <Trash2 className="w-3.5 h-3.5" /><span>Reset to Default</span>
                </button>
              </div>
            </div>

            {/* Preset Avatars */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
              <h3 className="text-xs font-black text-[#0B3A53] uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#16A6A1]" /><span>Preset Travel Avatars</span>
              </h3>
              <p className="text-[11px] text-slate-500">Choose from curated traveller profile images:</p>
              <div className="grid grid-cols-3 gap-3 pt-1">
                {PRESET_AVATARS.map((preset, idx) => (
                  <button key={idx} type="button" onClick={() => setAvatarUrl(preset)}
                    className={`relative rounded-2xl overflow-hidden aspect-square border-2 transition-all cursor-pointer ${avatarUrl === preset ? 'border-[#16A6A1] ring-2 ring-[#16A6A1]/40 scale-105' : 'border-slate-200 hover:border-slate-300'}`}>
                    <img src={preset} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                    {avatarUrl === preset && (
                      <div className="absolute inset-0 bg-[#16A6A1]/30 flex items-center justify-center">
                        <Check className="w-5 h-5 text-white drop-shadow-md" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Password notice */}
            <div className="bg-white p-5 rounded-3xl border border-amber-200 shadow-xs space-y-2">
              <div className="flex items-center gap-2 text-xs font-black text-amber-700 uppercase tracking-wider">
                <Lock className="w-3.5 h-3.5" /><span>Password</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                For security, password changes are only available via the reset password flow.
              </p>
              <Link
                to="/forgot-password"
                state={{ email: user?.email }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#16A6A1] hover:underline"
              >
                <Lock className="w-3 h-3" /><span>Reset Password</span>
              </Link>
            </div>
          </div>

          {/* RIGHT column */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSave} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-lg font-black text-[#0B3A53] font-heading">Personal Details</h3>
                <p className="text-xs text-slate-500 mt-1">These details are saved to your account in the database.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <UserIcon className="w-3.5 h-3.5 text-[#16A6A1]" /><span>Full Name</span>
                  </label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Enter your full name"
                    className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-[#0B3A53] focus:outline-none focus:bg-white focus:border-[#16A6A1] transition-all" />
                </div>

                {/* Email (read-only) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#16A6A1]" /><span>Email Address</span>
                    <span className="text-[9px] font-bold text-slate-400 normal-case tracking-normal ml-1">(read‑only)</span>
                  </label>
                  <input type="email" value={user?.email || ''} readOnly
                    className="w-full h-11 px-4 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-400 cursor-not-allowed" />
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#16A6A1]" /><span>Phone Number</span>
                  </label>
                  <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+94 77 123 4567"
                    className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-[#0B3A53] focus:outline-none focus:bg-white focus:border-[#16A6A1] transition-all" />
                </div>

                {/* Location */}
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#16A6A1]" /><span>Location / City</span>
                  </label>
                  <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Colombo, Sri Lanka"
                    className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-[#0B3A53] focus:outline-none focus:bg-white focus:border-[#16A6A1] transition-all" />
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">About Me</label>
                <textarea rows={4} value={bio} onChange={(e) => setBio(e.target.value)}
                  className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium text-[#0B3A53] focus:outline-none focus:bg-white focus:border-[#16A6A1] transition-all resize-none"
                  placeholder="Tell us a bit about yourself and your travel interests..." />
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button type="button" onClick={() => { logout(); navigate('/login'); }}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-2 hover:bg-rose-50 px-4 py-2.5 rounded-full transition-colors cursor-pointer">
                  <LogOut className="w-4 h-4" /><span>Sign Out</span>
                </button>
                <button type="submit" disabled={isSaving}
                  className="bg-[#16A6A1] hover:bg-[#146C86] text-white text-xs font-black uppercase tracking-wider px-8 py-3.5 rounded-full shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50">
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Save Profile</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </>
    )}
      </main>
      <Footer />
    </div>
  );
};
