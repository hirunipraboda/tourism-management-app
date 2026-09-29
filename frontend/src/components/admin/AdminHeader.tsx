import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Menu,
  Bell,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Info,
  X,
  Save,
  Lock,
  Phone,
  Shield,
  Globe,
} from 'lucide-react';
import { adminAuthService } from '../../services/adminAuthService';
import { useAuth } from '../../hooks/useAuth';

interface AdminHeaderProps {
  onToggleMobileSidebar: () => void;
  title: string;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ onToggleMobileSidebar, title }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout: touristLogout } = useAuth();
  const session = adminAuthService.getSession();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [unreadNotifs, setUnreadNotifs] = useState(3);

  // Modals for My Profile & Settings
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Profile Form State
  const [profileName, setProfileName] = useState(session.adminUser?.name || 'Charlie Admin');
  const [profileEmail, setProfileEmail] = useState(session.adminUser?.email || 'admin@example.com');
  const [profilePhone, setProfilePhone] = useState('+94 77 234 5678');
  const [profileDepartment, setProfileDepartment] = useState('Tourism Platform & AI Operations');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Settings Form State
  const [bookingAlerts, setBookingAlerts] = useState(true);
  const [approvalAlerts, setApprovalAlerts] = useState(true);
  const [dailyDigest, setDailyDigest] = useState(true);
  const [timezone, setTimezone] = useState('Asia/Colombo (GMT+5:30)');
  const [sessionLock, setSessionLock] = useState('30');
  const [settingsSuccess, setSettingsSuccess] = useState('');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword && newPassword !== confirmPassword) {
      setProfileError('Passwords do not match');
      return;
    }
    setProfileError('');
    try {
      const current = adminAuthService.getSession();
      if (current.adminUser) {
        current.adminUser.name = profileName;
        current.adminUser.email = profileEmail;
        localStorage.setItem('travellink_admin_session', JSON.stringify(current));
      }
    } catch (err) {
      console.error(err);
    }
    setProfileSuccess('Profile updated successfully!');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => {
      setProfileSuccess('');
      setIsProfileModalOpen(false);
    }, 1200);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem(
        'nova_admin_settings',
        JSON.stringify({ bookingAlerts, approvalAlerts, dailyDigest, timezone, sessionLock })
      );
    } catch (err) {
      console.error(err);
    }
    setSettingsSuccess('Settings saved successfully!');
    setTimeout(() => {
      setSettingsSuccess('');
      setIsSettingsModalOpen(false);
    }, 1200);
  };

  const notifications = [
    {
      id: 1,
      title: 'New booking received',
      desc: 'Sanath Wickramasinghe booked Grand Cultural Odyssey (#TL10294)',
      time: '10 mins ago',
      icon: CheckCircle2,
      color: 'text-[#16A6A1] bg-[#16A6A1]/10',
    },
    {
      id: 2,
      title: 'AI itinerary awaiting review',
      desc: 'Itinerary WF-TL-801 requires operator human approval',
      time: '25 mins ago',
      icon: Sparkles,
      color: 'text-amber-500 bg-amber-500/10',
    },
    {
      id: 3,
      title: 'Highland railway seat alert',
      desc: 'Route optimization updated Kandy-Ella railway timing',
      time: '1 hour ago',
      icon: Info,
      color: 'text-[#146C86] bg-[#146C86]/10',
    },
  ];

  // Breadcrumbs calculation
  const pathParts = location.pathname.split('/').filter(Boolean);

  const handleLogout = () => {
    adminAuthService.logout();
    try {
      touristLogout();
    } catch {
      // ignore
    }
    navigate('/login');
  };

  return (
    <header className="h-20 bg-white border-b border-slate-200/80 sticky top-0 z-30 px-4 sm:px-8 flex items-center justify-between shadow-2xs">
      
      {/* LEFT: Mobile Sidebar Toggle & Page Title + Breadcrumbs */}
      <div className="flex items-center gap-4 min-w-0">
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
          aria-label="Toggle mobile menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0 space-y-0.5">
          {/* Breadcrumb Path */}
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
            <Link to="/admin" className="hover:text-[#16A6A1] transition-colors">
              Admin
            </Link>
            {pathParts.slice(1).map((part, idx) => (
              <React.Fragment key={idx}>
                <span>/</span>
                <span className={idx === pathParts.length - 2 ? 'text-[#0B3A53]' : ''}>
                  {part.replace('-', ' ')}
                </span>
              </React.Fragment>
            ))}
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-[#0B3A53] tracking-tight font-heading truncate">
            {title}
          </h1>
        </div>
      </div>

      {/* RIGHT: Search, Notifications, Admin Profile */}
      <div className="flex items-center gap-3 sm:gap-4">
        

        {/* Notification Bell Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setIsNotifOpen(!isNotifOpen);
              setIsProfileOpen(false);
            }}
            className="relative p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifs > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white" />
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200/80 p-4 space-y-3 z-50 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-[#0B3A53] font-heading">Notifications</span>
                  <span className="bg-[#16A6A1]/10 text-[#146C86] font-extrabold text-[10px] px-2 py-0.5 rounded-full">
                    {unreadNotifs} New
                  </span>
                </div>
                <button
                  onClick={() => setUnreadNotifs(0)}
                  className="text-[11px] font-bold text-[#146C86] hover:underline cursor-pointer"
                >
                  Mark all as read
                </button>
              </div>

              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {notifications.map((n) => {
                  const Icon = n.icon;
                  return (
                    <div
                      key={n.id}
                      className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors flex items-start gap-3 text-xs"
                    >
                      <div className={`p-2 rounded-xl shrink-0 ${n.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="space-y-0.5 flex-1 min-w-0">
                        <div className="font-extrabold text-[#0B3A53] truncate">{n.title}</div>
                        <div className="text-slate-500 text-[11px] leading-snug">{n.desc}</div>
                        <div className="text-[10px] font-bold text-slate-400 pt-0.5">{n.time}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Admin Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setIsProfileOpen(!isProfileOpen);
              setIsNotifOpen(false);
            }}
            className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200/60"
          >
            <img
              src={session.adminUser?.avatar}
              alt="Admin Profile"
              className="w-8 h-8 rounded-full object-cover border border-slate-300"
            />
            <span className="hidden sm:inline-block text-xs font-black text-[#0B3A53]">
              {session.adminUser?.name || 'Admin'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-3 w-56 bg-white rounded-3xl shadow-2xl border border-slate-200/80 p-2 space-y-1 z-50 animate-in fade-in zoom-in-95 duration-200">
              <div className="p-3 border-b border-slate-100">
                <div className="text-xs font-black text-[#0B3A53]">{session.adminUser?.name}</div>
                <div className="text-[11px] font-medium text-slate-400">{session.adminUser?.email}</div>
                <div className="mt-1 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#16A6A1]/10 text-[#146C86] inline-block">
                  System Operator
                </div>
              </div>

              <button
                onClick={() => {
                  setIsProfileOpen(false);
                  setIsProfileModalOpen(true);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-2xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <User className="w-4 h-4 text-slate-400" />
                <span>My Profile</span>
              </button>

              <button
                onClick={() => {
                  setIsProfileOpen(false);
                  setIsSettingsModalOpen(true);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-2xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                <span>Settings</span>
              </button>

              <div className="border-t border-slate-100 pt-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-2xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* ========================================================= */}
      {/* 1. MY PROFILE MODAL                                      */}
      {/* ========================================================= */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#0B3A53] text-white flex items-center justify-center shadow-xs">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-[#0B3A53] font-heading">My Profile</h2>
                  <p className="text-xs text-slate-500 font-medium">Administrator account details & credentials</p>
                </div>
              </div>
              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="p-2 hover:bg-slate-200/60 rounded-full text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveProfile} className="p-6 overflow-y-auto space-y-5 text-xs flex-1">
              {profileSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{profileSuccess}</span>
                </div>
              )}

              {profileError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{profileError}</span>
                </div>
              )}

              {/* User Overview Card */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <img
                  src={session.adminUser?.avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80'}
                  alt="Profile Avatar"
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-xs"
                />
                <div className="space-y-1 min-w-0">
                  <div className="font-black text-[#0B3A53] text-sm truncate">{profileName}</div>
                  <div className="text-slate-500 font-medium truncate">{profileEmail}</div>
                  <div className="flex flex-wrap items-center gap-2 pt-0.5">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#16A6A1]/10 text-[#146C86]">
                      System Operator
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">ID: {session.adminUser?.id || 'admin-01'}</span>
                  </div>
                </div>
              </div>

              {/* Form Inputs */}
              <div className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-[#16A6A1] focus:bg-white transition-all text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-[#16A6A1] focus:bg-white transition-all text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      placeholder="+94 77 123 4567"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-[#16A6A1] focus:bg-white transition-all text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Department</label>
                    <input
                      type="text"
                      value={profileDepartment}
                      onChange={(e) => setProfileDepartment(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-[#16A6A1] focus:bg-white transition-all text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Password Section */}
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <div className="font-extrabold text-slate-700 text-xs flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Change Password (Optional)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <input
                      type="password"
                      placeholder="New Password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:border-[#16A6A1] focus:bg-white transition-all text-xs"
                    />
                  </div>
                  <div>
                    <input
                      type="password"
                      placeholder="Confirm New Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:border-[#16A6A1] focus:bg-white transition-all text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Action Buttons */}
              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#0B3A53] hover:bg-[#072537] text-white rounded-xl font-bold text-xs transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. SETTINGS MODAL                                        */}
      {/* ========================================================= */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#0B3A53] text-white flex items-center justify-center shadow-xs">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-[#0B3A53] font-heading">Settings</h2>
                  <p className="text-xs text-slate-500 font-medium">Platform preferences, notifications & system config</p>
                </div>
              </div>
              <button
                onClick={() => setIsSettingsModalOpen(false)}
                className="p-2 hover:bg-slate-200/60 rounded-full text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveSettings} className="p-6 overflow-y-auto space-y-5 text-xs flex-1">
              {settingsSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{settingsSuccess}</span>
                </div>
              )}

              {/* Notification Preferences */}
              <div className="space-y-3">
                <div className="font-black text-[#0B3A53] uppercase tracking-wider text-[10px] text-slate-400">
                  Notification Alerts
                </div>

                <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/60 transition-colors">
                  <div>
                    <div className="font-extrabold text-[#0B3A53]">Booking Alerts</div>
                    <div className="text-[11px] text-slate-500">Notify when tourist bookings or tour reservations occur</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={bookingAlerts}
                    onChange={(e) => setBookingAlerts(e.target.checked)}
                    className="w-4 h-4 accent-[#16A6A1] cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/60 transition-colors">
                  <div>
                    <div className="font-extrabold text-[#0B3A53]">AI Itinerary Alerts</div>
                    <div className="text-[11px] text-slate-500">Alert on tourist revision requests and approval updates</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={approvalAlerts}
                    onChange={(e) => setApprovalAlerts(e.target.checked)}
                    className="w-4 h-4 accent-[#16A6A1] cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/60 transition-colors">
                  <div>
                    <div className="font-extrabold text-[#0B3A53]">Daily Audit Digest</div>
                    <div className="text-[11px] text-slate-500">Automated daily summary of 4-agent execution logs</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={dailyDigest}
                    onChange={(e) => setDailyDigest(e.target.checked)}
                    className="w-4 h-4 accent-[#16A6A1] cursor-pointer"
                  />
                </label>
              </div>

              {/* Regional Preferences */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="font-black text-[#0B3A53] uppercase tracking-wider text-[10px] text-slate-400">
                  Regional & Session Preferences
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Timezone</label>
                    <select
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 text-xs focus:outline-none focus:border-[#16A6A1]"
                    >
                      <option value="Asia/Colombo (GMT+5:30)">Asia/Colombo (GMT+5:30)</option>
                      <option value="UTC (GMT+0:00)">UTC (GMT+0:00)</option>
                      <option value="America/New_York (EST)">America/New_York (EST)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Currency Format</label>
                    <input
                      type="text"
                      disabled
                      value="USD ($) / LKR (Rs)"
                      className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-500 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Session Inactivity Lock</label>
                  <select
                    value={sessionLock}
                    onChange={(e) => setSessionLock(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 text-xs focus:outline-none focus:border-[#16A6A1]"
                  >
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="240">4 hours</option>
                  </select>
                </div>
              </div>

              {/* Modal Action Buttons */}
              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsSettingsModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#0B3A53] hover:bg-[#072537] text-white rounded-xl font-bold text-xs transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Settings</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
