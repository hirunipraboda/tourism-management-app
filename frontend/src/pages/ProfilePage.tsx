import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
  LogOut,
  Upload,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { LandingNavbar } from '../components/navigation/LandingNavbar';
import { Footer } from '../components/navigation/Footer';
import { UserRole } from '../types/auth';

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
  const { user, updateUser, logout } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(user?.name || 'Sarah Lin');
  const [email, setEmail] = useState(user?.email || 'sarah.lin@nova-travel.ai');
  const [phone, setPhone] = useState(user?.phone || '+94 77 890 1234');
  const [location, setLocation] = useState(user?.location || 'Colombo, Sri Lanka');
  const [role, setRole] = useState<UserRole>(user?.role || 'Tour Operator');
  const [bio, setBio] = useState(
    user?.bio ||
      'Passionate travel coordinator specializing in luxury Sri Lankan eco-tours, cultural odysseys, and AI-curated island itineraries.'
  );
  const [avatarUrl, setAvatarUrl] = useState<string>(
    user?.avatarUrl || PRESET_AVATARS[0]
  );

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // File upload handler for custom profile picture
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setAvatarUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    setTimeout(() => {
      updateUser({
        name,
        email,
        phone,
        location,
        role,
        bio,
        avatarUrl,
      });
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    }, 600);
  };

  const roleOptions: UserRole[] = [
    'Tourist',
    'Tour Operator',
    'Administrator',
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased">
      <LandingNavbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-8 py-8 space-y-8">
        
        {/* Top Header & Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
          <div className="space-y-1">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 text-xs font-bold text-[#146C86] hover:text-[#0B3A53] transition-colors mb-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <h1 className="text-3xl font-black text-[#0B3A53] font-heading tracking-tight">
              My Profile
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Manage your personal information, profile picture, role, and account preferences.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-[#16A6A1] hover:bg-[#146C86] text-white text-xs font-black uppercase tracking-wider px-6 py-3 rounded-full shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>Save Changes</span>
            </button>
          </div>
        </div>

        {/* Success Alert Banner */}
        {saveSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-3 animate-in fade-in duration-200">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Your profile information and avatar picture have been updated successfully!</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: Profile Avatar & Quick Status Card */}
          <div className="space-y-6">
            
            {/* Avatar Card */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col items-center text-center space-y-5">
              <div className="relative group">
                <img
                  src={avatarUrl}
                  alt={name}
                  className="w-32 h-32 rounded-full object-cover border-4 border-[#16A6A1] shadow-md transition-transform group-hover:scale-105"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-1 right-1 p-2.5 rounded-full bg-[#0B3A53] hover:bg-[#146C86] text-white shadow-lg transition-all cursor-pointer"
                  title="Upload profile picture"
                >
                  <Camera className="w-4 h-4" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              <div className="space-y-1">
                <h2 className="text-xl font-black text-[#0B3A53] font-heading">{name}</h2>
                <p className="text-xs text-slate-500 font-medium">{email}</p>
                <div className="pt-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#16A6A1]/10 text-[#138D89] text-xs font-black uppercase tracking-wider border border-[#16A6A1]/20">
                    <Shield className="w-3.5 h-3.5" />
                    <span>{role}</span>
                  </span>
                </div>
              </div>

              {/* Upload & Reset Buttons */}
              <div className="w-full pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2.5 px-4 rounded-full border border-slate-200 hover:border-[#16A6A1] text-slate-700 hover:text-[#0B3A53] text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-[#16A6A1]" />
                  <span>Upload Photo from Computer</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAvatarUrl(PRESET_AVATARS[0])}
                  className="w-full py-2 px-4 rounded-full text-slate-400 hover:text-rose-600 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Reset to Default</span>
                </button>
              </div>
            </div>

            {/* Curated Preset Avatars */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
              <h3 className="text-xs font-black text-[#0B3A53] uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#16A6A1]" />
                <span>Preset Travel Avatars</span>
              </h3>
              <p className="text-[11px] text-slate-500">Choose from curated traveler profile images:</p>
              
              <div className="grid grid-cols-3 gap-3 pt-1">
                {PRESET_AVATARS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAvatarUrl(preset)}
                    className={`relative rounded-2xl overflow-hidden aspect-square border-2 transition-all cursor-pointer ${
                      avatarUrl === preset
                        ? 'border-[#16A6A1] ring-2 ring-[#16A6A1]/40 scale-105'
                        : 'border-slate-200 hover:border-slate-300 hover:scale-102'
                    }`}
                  >
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

          </div>

          {/* RIGHT COLUMN: Personal Details Form */}
          <div className="lg:col-span-2 space-y-6">
            
            <form onSubmit={handleSave} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-lg font-black text-[#0B3A53] font-heading">Personal Details</h3>
                <p className="text-xs text-slate-500">Update your profile info and contact details below.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <UserIcon className="w-3.5 h-3.5 text-[#16A6A1]" />
                    <span>Full Name</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-[#0B3A53] focus:outline-none focus:bg-white focus:border-[#16A6A1] transition-all"
                  />
                </div>

                {/* Email Address */}
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#16A6A1]" />
                    <span>Email Address</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-[#0B3A53] focus:outline-none focus:bg-white focus:border-[#16A6A1] transition-all"
                  />
                </div>

                {/* Phone Number */}
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#16A6A1]" />
                    <span>Phone Number</span>
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-[#0B3A53] focus:outline-none focus:bg-white focus:border-[#16A6A1] transition-all"
                  />
                </div>

                {/* Location */}
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#16A6A1]" />
                    <span>Location</span>
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-[#0B3A53] focus:outline-none focus:bg-white focus:border-[#16A6A1] transition-all"
                  />
                </div>

              </div>

              {/* Role Selection */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-[#16A6A1]" />
                  <span>Account Role & Permissions</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {roleOptions.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`p-3 rounded-2xl text-xs font-bold border transition-all text-center cursor-pointer ${
                        role === r
                          ? 'bg-[#16A6A1]/10 border-[#16A6A1] text-[#0B3A53] shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bio / Travel Summary */}
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                  Bio / Travel Coordinator Notes
                </label>
                <textarea
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium text-[#0B3A53] focus:outline-none focus:bg-white focus:border-[#16A6A1] transition-all resize-none"
                  placeholder="Tell us about yourself..."
                />
              </div>

              {/* Action Footer */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => logout()}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-2 hover:bg-rose-50 px-4 py-2.5 rounded-full transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-[#16A6A1] hover:bg-[#146C86] text-white text-xs font-black uppercase tracking-wider px-8 py-3.5 rounded-full shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>Save Profile</span>
                </button>
              </div>

            </form>

          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
};
