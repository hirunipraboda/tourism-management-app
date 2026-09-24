import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Compass,
  Milestone,
  Bot,
  Car,
  Ticket,
  Bus,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  CreditCard,
  Star,
  MapPin,
  Activity as ActivityIcon,
  CheckCircle2,
  Clock,
  RotateCcw,
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { AdminDashboardData } from '../../types/adminTypes';

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await adminService.fetchDashboard();
      setData(result);
    } catch (err: any) {
      console.error('Failed to load dashboard data', err);
      setError('Failed to fetch real-time dashboard statistics from backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const kpis = data?.kpis || {
    totalUsers: 0,
    totalDestinations: 0,
    totalAttractions: 0,
    totalActivities: 0,
    totalTrips: 0,
    aiGeneratedTrips: 0,
    chatbotPurchases: 0,
    transportRoutes: 0,
    aiGuideQueries: 0,
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. WELCOME HERO SECTION */}
      <div className="bg-gradient-to-r from-slate-900 via-[#0B3A53] to-teal-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#16A6A1]/20 text-[#16A6A1] text-xs font-extrabold border border-[#16A6A1]/30">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>NOVA SMART TOURISM PLATFORM</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-heading tracking-tight text-white leading-tight">
            Administrator Command Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
            Live database operations: Traveler accounts, multi-agent AI itineraries, tourist confirmation statuses, and public transport schedules.
          </p>
        </div>

        <div className="flex items-center gap-3 z-10 shrink-0">

          <button
            onClick={() => navigate('/admin/trips')}
            className="bg-[#16A6A1] hover:bg-[#146C86] text-white font-extrabold text-xs uppercase tracking-wider px-6 py-3.5 rounded-2xl shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center gap-2"
          >
            <Milestone className="w-4 h-4" />
            <span>Monitor Itineraries ({kpis.totalTrips})</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>{error}</span>
          </div>
          <button onClick={loadDashboard} className="underline font-bold cursor-pointer">
            Retry
          </button>
        </div>
      )}

      {/* 2. THE 9 CORE LIVE KPIS (Real Database Calculations) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Total Users */}
        <div
          onClick={() => navigate('/admin/users')}
          className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
              Total Users
            </span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center transition-transform group-hover:scale-110">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#0B3A53] font-heading">
            {kpis.totalUsers}
          </div>
          <p className="text-[11px] text-slate-400 font-medium">Registered tourists & staff</p>
        </div>

        {/* Total Destinations */}
        <div
          onClick={() => navigate('/admin/destinations')}
          className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
              Total Destinations
            </span>
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-[#16A6A1] flex items-center justify-center transition-transform group-hover:scale-110">
              <Compass className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#0B3A53] font-heading">
            {kpis.totalDestinations}
          </div>
          <p className="text-[11px] text-slate-400 font-medium">Active Sri Lanka tourism hubs</p>
        </div>

        {/* Total Attractions */}
        <div
          onClick={() => navigate('/admin/attractions')}
          className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
              Total Attractions
            </span>
            <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center transition-transform group-hover:scale-110">
              <MapPin className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#0B3A53] font-heading">
            {kpis.totalAttractions}
          </div>
          <p className="text-[11px] text-slate-400 font-medium">Landmarks, forts, & nature sites</p>
        </div>

        {/* Total Activities */}
        <div
          onClick={() => navigate('/admin/activities')}
          className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
              Total Activities
            </span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center transition-transform group-hover:scale-110">
              <ActivityIcon className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#0B3A53] font-heading">
            {kpis.totalActivities}
          </div>
          <p className="text-[11px] text-slate-400 font-medium">Surfing, safaris, tea tasting, hikes</p>
        </div>

        {/* Total Trips */}
        <div
          onClick={() => navigate('/admin/trips')}
          className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
              Total Trips
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center transition-transform group-hover:scale-110">
              <Milestone className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#0B3A53] font-heading">
            {kpis.totalTrips}
          </div>
          <p className="text-[11px] text-slate-400 font-medium">All traveler formulated itineraries</p>
        </div>

        {/* AI Generated Trips */}
        <div
          onClick={() => navigate('/admin/trips')}
          className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
              AI Generated Trips
            </span>
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center transition-transform group-hover:scale-110">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-indigo-700 font-heading">
            {kpis.aiGeneratedTrips}
          </div>
          <p className="text-[11px] text-slate-400 font-medium">Formulated by 4-agent pipeline</p>
        </div>

        {/* Chatbot Purchases */}
        <div
          onClick={() => navigate('/admin/chatbot-payments')}
          className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
              Chatbot Purchases
            </span>
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center transition-transform group-hover:scale-110">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#0B3A53] font-heading">
            {kpis.chatbotPurchases}
          </div>
          <p className="text-[11px] text-slate-400 font-medium">Virtual guide subscription tiers</p>
        </div>

        {/* Transport Routes & Schedules */}
        <div
          onClick={() => navigate('/admin/transportation')}
          className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
              Transport Routes
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center transition-transform group-hover:scale-110">
              <Bus className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#0B3A53] font-heading">
            {kpis.transportRoutes ?? 0}
          </div>
          <p className="text-[11px] text-slate-400 font-medium">Verified bus & train timetables</p>
        </div>

        {/* AI Guide Queries */}
        <div
          onClick={() => navigate('/admin/ai-guide/usage')}
          className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
              AI Guide Queries
            </span>
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-[#16A6A1] flex items-center justify-center transition-transform group-hover:scale-110">
              <Bot className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#0B3A53] font-heading">
            {kpis.aiGuideQueries}
          </div>
          <p className="text-[11px] text-slate-400 font-medium">Traveler questions & landmark scans</p>
        </div>
      </div>

      {/* 3. RECENT ACTIVITY GRIDS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Itineraries */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-black text-[#0B3A53] font-heading flex items-center gap-2">
              <Milestone className="w-4 h-4 text-[#16A6A1]" />
              <span>Recent Trips & User Approvals</span>
            </h3>
            <button
              onClick={() => navigate('/admin/trips')}
              className="text-xs font-bold text-[#16A6A1] hover:underline cursor-pointer flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 text-xs font-medium">
            {data?.recentTrips && data.recentTrips.length > 0 ? (
              data.recentTrips.map((t) => (
                <div
                  key={t.id}
                  className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <div className="space-y-0.5">
                    <div className="font-extrabold text-slate-800 flex items-center gap-2">
                      <span>{t.destination}</span>
                      <span
                        className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                          t.tripType === 'AI GENERATED'
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {t.tripType}
                      </span>
                    </div>
                    <div className="text-slate-400 text-[11px]">
                      Traveler: <strong className="text-slate-600">{t.userName}</strong> · {t.startDate}
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                        t.approvalStatus === 'APPROVED_BY_USER'
                          ? 'bg-emerald-100 text-emerald-800'
                          : t.approvalStatus === 'REVISION_REQUESTED'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {t.approvalStatus.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs">No trips formulated yet.</div>
            )}
          </div>
        </div>

        {/* Recent Chatbot Purchases */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-black text-[#0B3A53] font-heading flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-purple-600" />
              <span>Recent Chatbot Purchases</span>
            </h3>
            <button
              onClick={() => navigate('/admin/chatbot-payments')}
              className="text-xs font-bold text-[#16A6A1] hover:underline cursor-pointer flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 text-xs font-medium">
            {data?.recentChatbotPurchases && data.recentChatbotPurchases.length > 0 ? (
              data.recentChatbotPurchases.map((p) => (
                <div
                  key={p.id}
                  className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <div className="space-y-0.5">
                    <div className="font-extrabold text-slate-800">{p.packageName}</div>
                    <div className="text-slate-400 text-[11px]">
                      {p.userName} · <span className="font-mono">{p.maskedCardNumber}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-[#146C86]">${p.amount.toFixed(2)}</div>
                    <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {p.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs">No chatbot purchases recorded.</div>
            )}
          </div>
        </div>

        {/* Recent AI Guide Activity */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-black text-[#0B3A53] font-heading flex items-center gap-2">
              <Bot className="w-4 h-4 text-teal-600" />
              <span>Recent AI Guide Activity</span>
            </h3>
            <button
              onClick={() => navigate('/admin/ai-guide/activity')}
              className="text-xs font-bold text-[#16A6A1] hover:underline cursor-pointer flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 text-xs font-medium">
            {data?.recentAiGuideActivity && data.recentAiGuideActivity.length > 0 ? (
              data.recentAiGuideActivity.map((a: any) => (
                <div
                  key={a.id}
                  className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <div className="space-y-0.5">
                    <div className="font-extrabold text-slate-800">{a.topic || 'General Travel Inquiry'}</div>
                    <div className="text-slate-400 text-[11px]">
                      {a.userName} · {a.queryCount} queries
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                      {a.status}
                    </span>
                    <div className="text-[10px] text-slate-400 mt-0.5">{a.lastActivity}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs">No recent AI sessions recorded.</div>
            )}
          </div>
        </div>

        {/* Recent Reviews */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-black text-[#0B3A53] font-heading flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500" />
              <span>Recent Reviews & Feedback</span>
            </h3>
            <button
              onClick={() => navigate('/admin/reviews')}
              className="text-xs font-bold text-[#16A6A1] hover:underline cursor-pointer flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 text-xs font-medium">
            {data?.recentReviews && data.recentReviews.length > 0 ? (
              data.recentReviews.map((r) => (
                <div
                  key={r.id}
                  className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-800">{r.destinationName}</span>
                      <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-black">
                        ★ {r.rating}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 line-clamp-1 italic">
                      "{r.comment}"
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium">
                      By {r.userName} · {new Date(r.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs">No reviews submitted yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
