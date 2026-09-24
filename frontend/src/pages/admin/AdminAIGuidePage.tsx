import React, { useEffect, useState } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import {
  Bot,
  CreditCard,
  BarChart3,
  HelpCircle,
  Camera,
  MessageSquare,
  Search,
  CheckCircle2,
  Clock,
  MapPin,
  TrendingUp,
  PieChart,
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import {
  ChatbotPaymentItem,
  AIGuideUsageData,
  AIGuideAnalyticsData,
} from '../../types/adminTypes';

export const AdminAIGuidePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  // Determine active tab from URL path or search params
  const getInitialTab = () => {
    if (location.pathname.endsWith('/purchases')) return 'purchases';
    if (location.pathname.endsWith('/usage')) return 'usage';
    if (location.pathname.endsWith('/analytics')) return 'analytics';
    return searchParams.get('tab') || 'purchases';
  };

  const [currentTab, setCurrentTab] = useState(getInitialTab());

  const setTab = (tab: string) => {
    setCurrentTab(tab);
    setSearchParams({ tab });
  };

  useEffect(() => {
    const tabFromUrl = getInitialTab();
    if (tabFromUrl !== currentTab) {
      setCurrentTab(tabFromUrl);
    }
  }, [location.pathname]);

  // Data states
  const [purchases, setPurchases] = useState<ChatbotPaymentItem[]>([]);
  const [usage, setUsage] = useState<AIGuideUsageData | null>(null);
  const [analytics, setAnalytics] = useState<AIGuideAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      if (currentTab === 'purchases') {
        const data = await adminService.fetchChatbotPayments(searchQuery);
        setPurchases(data);
      } else if (currentTab === 'usage') {
        const data = await adminService.fetchAiGuideUsage();
        setUsage(data);
      } else if (currentTab === 'analytics') {
        const data = await adminService.fetchAiGuideAnalytics();
        setAnalytics(data);
      }
    } catch (err) {
      console.error('Failed to load AI Guide data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentTab]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0B3A53] font-heading tracking-tight">
            AI Travel Guide (Virtual Guide)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Monitor chatbot package purchases, multimodal vision query usage, and semantic place & question analytics.
          </p>
        </div>


      </div>

      {/* 3 Main Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
        {[
          { id: 'purchases', label: 'Purchase Details', icon: CreditCard },
          { id: 'usage', label: 'Usage Statistics', icon: BarChart3 },
          { id: 'analytics', label: 'Question & Place Analytics', icon: HelpCircle },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-[#16A6A1] text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SUB-VIEW 1: PURCHASE DETAILS */}
      {currentTab === 'purchases' && (
        <div className="space-y-6">
          {/* Search bar */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-96">
              <input
                type="text"
                placeholder="Search by traveler or package tier..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadData()}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-[#16A6A1]"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>

            <span className="text-xs font-bold text-slate-400">
              Showing {purchases.length} package purchases
            </span>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-400">
                    <th className="py-4 px-5">Order ID</th>
                    <th className="py-4 px-5">Traveler</th>
                    <th className="py-4 px-5">Package Tier</th>
                    <th className="py-4 px-5">Amount Paid</th>
                    <th className="py-4 px-5">Payment Method</th>
                    <th className="py-4 px-5">Masked Card</th>
                    <th className="py-4 px-5">Date</th>
                    <th className="py-4 px-5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        Loading purchase records...
                      </td>
                    </tr>
                  ) : purchases.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        No chatbot package purchases found.
                      </td>
                    </tr>
                  ) : (
                    purchases.map((p) => {
                      const isDone = p.status === 'Completed' || p.status === 'Successful';
                      return (
                        <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-4 px-5 font-mono font-bold text-[#0B3A53]">{p.id}</td>
                          <td className="py-4 px-5">
                            <div className="font-extrabold text-slate-800">{p.userName}</div>
                            <div className="text-[11px] text-slate-400">{p.userEmail}</div>
                          </td>
                          <td className="py-4 px-5 font-bold text-[#0B3A53]">{p.packageName}</td>
                          <td className="py-4 px-5 font-black text-[#146C86]">${p.amount.toFixed(2)}</td>
                          <td className="py-4 px-5">{p.paymentMethod}</td>
                          <td className="py-4 px-5 font-mono text-[11px] text-slate-600">
                            {p.maskedCardNumber || 'N/A'}
                          </td>
                          <td className="py-4 px-5 text-slate-500">
                            {new Date(p.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-4 px-5">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                isDone
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {p.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: USAGE STATISTICS */}
      {currentTab === 'usage' && (
        <div className="space-y-6">
          {/* Summary KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-1">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                Total Queries
              </span>
              <div className="text-3xl font-black text-[#0B3A53] font-heading">
                {usage?.totalQueries ?? 0}
              </div>
              <p className="text-[11px] text-slate-400">All-time tourist queries answered</p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-1">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                Text Chat Queries
              </span>
              <div className="text-3xl font-black text-teal-600 font-heading">
                {usage?.textQueries ?? 0}
              </div>
              <p className="text-[11px] text-slate-400">Conversational questions & itinerary tips</p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-1">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                Photo Vision Queries
              </span>
              <div className="text-3xl font-black text-indigo-600 font-heading">
                {usage?.photoQueries ?? 0}
              </div>
              <p className="text-[11px] text-slate-400">Multimodal monument & fresco scans</p>
            </div>
          </div>

          {/* Time Window Usage Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">Today</span>
                <Clock className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-[#0B3A53]">
                {usage?.todayQueries ?? usage?.queriesToday ?? 0}
              </div>
              <span className="text-[10px] text-slate-400 font-medium">Queries in last 24 hours</span>
            </div>

            <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">This Week</span>
                <TrendingUp className="w-4 h-4 text-teal-600" />
              </div>
              <div className="text-2xl font-black text-[#0B3A53]">
                {usage?.weekQueries ?? usage?.queriesThisWeek ?? 0}
              </div>
              <span className="text-[10px] text-slate-400 font-medium">Queries in last 7 days</span>
            </div>

            <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">This Month</span>
                <BarChart3 className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-2xl font-black text-[#0B3A53]">
                {usage?.monthQueries ?? usage?.queriesThisMonth ?? 0}
              </div>
              <span className="text-[10px] text-slate-400 font-medium">Queries in last 30 days</span>
            </div>
          </div>

          {/* Daily Usage Breakdown */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
            <h3 className="font-black text-sm text-[#0B3A53] font-heading">
              Daily Usage Breakdown (Recent 7 Days)
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase text-slate-400">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Text Queries</th>
                    <th className="py-3 px-4">Photo Queries</th>
                    <th className="py-3 px-4">Total Daily Volume</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {usage?.dailyUsage && usage.dailyUsage.length > 0 ? (
                    usage.dailyUsage.map((d, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-bold text-[#0B3A53]">{d.date}</td>
                        <td className="py-3 px-4 text-teal-700">{d.textQueries}</td>
                        <td className="py-3 px-4 text-indigo-700">{d.photoQueries}</td>
                        <td className="py-3 px-4 font-black text-slate-800">{d.total}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-400">
                        No daily usage data recorded.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 3: QUESTION & PLACE ANALYTICS */}
      {currentTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Question Categories */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#16A6A1]" />
                <h3 className="font-black text-sm text-[#0B3A53] font-heading">
                  Most Asked Question Types
                </h3>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Semantic Intent</span>
            </div>

            <div className="space-y-4">
              {analytics?.topQuestionTypes && analytics.topQuestionTypes.length > 0 ? (
                analytics.topQuestionTypes.map((q, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-extrabold text-slate-800">{q.type || q.category}</span>
                      <span className="font-bold text-slate-500">
                        {q.count} queries ({q.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-[#16A6A1] to-[#0B3A53] h-full rounded-full transition-all duration-500"
                        style={{ width: `${q.percentage}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-slate-400 text-xs">
                  No question category data recorded.
                </div>
              )}
            </div>
          </div>

          {/* Top Places Asked */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <h3 className="font-black text-sm text-[#0B3A53] font-heading">
                  Most Asked Places & Attractions
                </h3>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Geographic Interest</span>
            </div>

            <div className="divide-y divide-slate-100">
              {analytics?.topPlaces && analytics.topPlaces.length > 0 ? (
                analytics.topPlaces.map((p, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-xl bg-teal-50 text-[#16A6A1] flex items-center justify-center font-bold text-xs">
                        #{idx + 1}
                      </div>
                      <div>
                        <div className="font-extrabold text-slate-800 text-xs">{p.place || p.placeName}</div>
                        <div className="text-[11px] text-slate-400">{p.category}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-[#146C86] text-xs">{p.count || p.queriesCount}</span>
                      <span className="text-[10px] text-slate-400 font-medium"> queries</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-slate-400 text-xs">
                  No place analytics recorded.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
