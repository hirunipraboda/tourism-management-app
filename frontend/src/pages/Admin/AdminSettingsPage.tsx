import React, { useState } from 'react';
import {
  Settings,
  User,
  Shield,
  Bell,
  Globe,
  Save,
  CheckCircle2,
  Lock,
  Mail,
  Sliders,
} from 'lucide-react';
import { adminAuthService } from '../../services/adminAuthService';

export const AdminSettingsPage: React.FC = () => {
  const session = adminAuthService.getSession();

  const [name, setName] = useState(session.adminUser?.name || 'Administrator');
  const [email, setEmail] = useState(session.adminUser?.email || 'admin@travellink.lk');
  const [bookingAlerts, setBookingAlerts] = useState(true);
  const [approvalAlerts, setApprovalAlerts] = useState(true);
  const [timezone, setTimezone] = useState('Asia/Colombo (GMT+5:30)');
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0B3A53] font-heading tracking-tight">
            System Settings & Profile
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Manage admin credentials, notification triggers, timezone, and system preferences.
          </p>
        </div>
      </div>

      {isSaved && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>System preferences and admin profile updated successfully!</span>
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="space-y-6 max-w-4xl">
        
        {/* Profile Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <User className="w-5 h-5 text-[#16A6A1]" />
            <h2 className="text-lg font-black text-[#0B3A53] font-heading">Admin Profile Information</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
            <div className="space-y-1">
              <label className="text-slate-600 font-bold block">Display Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 font-bold text-[#0B3A53] focus:bg-white focus:border-[#16A6A1] focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-600 font-bold block">Admin Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 font-bold text-[#0B3A53] focus:bg-white focus:border-[#16A6A1] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <Bell className="w-5 h-5 text-[#16A6A1]" />
            <h2 className="text-lg font-black text-[#0B3A53] font-heading">Notification Alerts</h2>
          </div>

          <div className="space-y-4 text-xs font-semibold">
            <label className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer">
              <div>
                <div className="font-extrabold text-[#0B3A53]">Booking Alerts</div>
                <div className="text-slate-500 font-medium">Receive notifications when new travel bookings are created</div>
              </div>
              <input
                type="checkbox"
                checked={bookingAlerts}
                onChange={(e) => setBookingAlerts(e.target.checked)}
                className="w-4 h-4 accent-[#16A6A1] cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer">
              <div>
                <div className="font-extrabold text-[#0B3A53]">AI Approval Alerts</div>
                <div className="text-slate-500 font-medium">Receive notifications when AI itineraries require human review</div>
              </div>
              <input
                type="checkbox"
                checked={approvalAlerts}
                onChange={(e) => setApprovalAlerts(e.target.checked)}
                className="w-4 h-4 accent-[#16A6A1] cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* System Preferences */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <Globe className="w-5 h-5 text-[#16A6A1]" />
            <h2 className="text-lg font-black text-[#0B3A53] font-heading">System Preferences</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
            <div className="space-y-1">
              <label className="text-slate-600 font-bold block">System Timezone</label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 font-bold text-[#0B3A53]"
              >
                <option value="Asia/Colombo (GMT+5:30)">Asia/Colombo (GMT+5:30)</option>
                <option value="UTC (GMT+0:00)">UTC (GMT+0:00)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-600 font-bold block">Default Currency</label>
              <input
                type="text"
                disabled
                value="USD ($) / LKR (Rs)"
                className="w-full p-3 rounded-2xl bg-slate-100 border border-slate-200 font-bold text-slate-500"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-[#0B3A53] hover:bg-[#072537] text-white font-extrabold text-xs uppercase tracking-wider px-8 py-3.5 rounded-full shadow-lg transition-all cursor-pointer flex items-center gap-2"
          >
            <Save className="w-4 h-4 text-[#16A6A1]" />
            <span>Save Settings</span>
          </button>
        </div>

      </form>

    </div>
  );
};
