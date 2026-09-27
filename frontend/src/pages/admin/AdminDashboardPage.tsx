import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Compass,
  Package,
  CalendarCheck,
  Cpu,
  CheckSquare,
  TrendingUp,
  MapPin,
  Clock,
  Plus,
  ArrowRight,
  Sparkles,
  Bot,
  ChevronRight,
  Eye,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { adminService } from '../../services/adminService';

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const kpis = adminService.getKPIs();
  const destinations = adminService.getDestinations();
  const bookings = adminService.getBookings();
  const workflows = adminService.getWorkflows();

  const [bookingTimeframe, setBookingTimeframe] = useState<'7 Days' | '30 Days' | '3 Months' | '12 Months'>('30 Days');

  // Quick Action Handler
  const handleQuickAction = (route: string) => {
    navigate(route);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* 1. WELCOME SECTION */}
      <div className="bg-gradient-to-r from-slate-50 via-teal-50/50 to-sky-50/50 border border-slate-200/90 rounded-3xl p-6 sm:p-8 text-slate-800 shadow-xs relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#16A6A1]/10 text-[#138D89] text-xs font-extrabold border border-[#16A6A1]/20">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>TRAVEL LINK COMMAND CENTER</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-heading tracking-tight text-[#0B3A53] leading-tight">
            Welcome back, System Operator 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
            Monitor live travel analytics, active bookings, and AI-generated journey optimizations across Sri Lanka in real time.
          </p>
        </div>

        <div className="flex items-center gap-3 z-10 shrink-0">
          <button
            onClick={() => navigate('/admin/approvals')}
            className="bg-[#16A6A1] hover:bg-[#146C86] text-white font-extrabold text-xs uppercase tracking-wider px-6 py-3.5 rounded-full shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2"
          >
            <CheckSquare className="w-4 h-4" />
            <span>Review AI Approvals ({kpis.pendingApprovals})</span>
          </button>
        </div>
      </div>

      {/* 2. KPI STATISTIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Card 1: Total Users */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Total Users</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl sm:text-3xl font-black text-[#0B3A53] font-heading">
              {kpis.totalUsers.toLocaleString()}
            </div>
            <div className="text-xs font-extrabold text-emerald-600 flex items-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+12.4%</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">Tourists & registered operators</p>
        </div>

        {/* Card 2: Active Destinations */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Active Destinations</span>
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-[#16A6A1] flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl sm:text-3xl font-black text-[#0B3A53] font-heading">
              {kpis.activeDestinations}
            </div>
            <div className="text-xs font-extrabold text-[#16A6A1]">
              +4 this month
            </div>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">Kandy, Ella, Galle, Sigiriya & more</p>
        </div>

        {/* Card 3: Tour Packages */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Tour Packages</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl sm:text-3xl font-black text-[#0B3A53] font-heading">
              {kpis.tourPackages}
            </div>
            <div className="text-xs font-extrabold text-emerald-600 flex items-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+8.2%</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">Cultural & coastal itineraries</p>
        </div>

        {/* Card 4: Total Bookings */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Total Bookings</span>
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl sm:text-3xl font-black text-[#0B3A53] font-heading">
              {kpis.totalBookings.toLocaleString()}
            </div>
            <div className="text-xs font-extrabold text-emerald-600 flex items-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+18.6%</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">Confirmed & upcoming bookings</p>
        </div>

        {/* Card 5: AI Guide Bot Engine */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">AI Guide Bot</span>
            <div className="w-10 h-10 rounded-2xl bg-[#16A6A1]/10 text-[#16A6A1] flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl sm:text-3xl font-black text-[#0B3A53] font-heading">
              99.8%
            </div>
            <div className="text-xs font-extrabold text-[#16A6A1]">
              Online Engine
            </div>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">NOVA AI Guide live assistant</p>
        </div>

        {/* Card 6: Pending Approvals */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Pending Approvals</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <CheckSquare className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl sm:text-3xl font-black text-[#0B3A53] font-heading">
              {kpis.pendingApprovals}
            </div>
            <div className="text-xs font-extrabold text-amber-600">
              Needs Review
            </div>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">Human operator verification</p>
        </div>

        {/* Card 7: Active AI Workflows */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">AI Workflows</span>
            <div className="w-10 h-10 rounded-2xl bg-cyan-50 text-[#146C86] flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl sm:text-3xl font-black text-[#0B3A53] font-heading">
              {kpis.activeWorkflows}
            </div>
            <div className="text-xs font-extrabold text-[#146C86]">
              Running
            </div>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">Planner, Route & Validation agents</p>
        </div>

        {/* Card 8: Completed Trips */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Completed Trips</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl sm:text-3xl font-black text-[#0B3A53] font-heading">
              {kpis.completedTrips.toLocaleString()}
            </div>
            <div className="text-xs font-extrabold text-emerald-600 flex items-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+15.2%</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">Fully executed itineraries</p>
        </div>

      </div>

      {/* 3. QUICK ACTIONS & POPULAR DESTINATIONS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Quick Actions Panel */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-black text-[#0B3A53] font-heading">Quick Actions</h2>
            <span className="text-[11px] text-slate-400 font-bold">Admin shortcuts</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleQuickAction('/admin/destinations')}
              className="p-3.5 rounded-2xl bg-slate-50 hover:bg-[#16A6A1]/10 text-slate-700 hover:text-[#0B3A53] border border-slate-200/70 text-xs font-bold transition-all text-left flex flex-col gap-2 group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-white shadow-2xs flex items-center justify-center text-[#16A6A1]">
                <Plus className="w-4 h-4" />
              </div>
              <span>Add Destination</span>
            </button>

            <button
              onClick={() => handleQuickAction('/admin/attractions')}
              className="p-3.5 rounded-2xl bg-slate-50 hover:bg-[#16A6A1]/10 text-slate-700 hover:text-[#0B3A53] border border-slate-200/70 text-xs font-bold transition-all text-left flex flex-col gap-2 group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-white shadow-2xs flex items-center justify-center text-[#16A6A1]">
                <MapPin className="w-4 h-4" />
              </div>
              <span>Add Attraction</span>
            </button>

            <button
              onClick={() => handleQuickAction('/admin/tours')}
              className="p-3.5 rounded-2xl bg-slate-50 hover:bg-[#16A6A1]/10 text-slate-700 hover:text-[#0B3A53] border border-slate-200/70 text-xs font-bold transition-all text-left flex flex-col gap-2 group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-white shadow-2xs flex items-center justify-center text-[#16A6A1]">
                <Package className="w-4 h-4" />
              </div>
              <span>Create Package</span>
            </button>

            <button
              onClick={() => handleQuickAction('/admin/approvals')}
              className="p-3.5 rounded-2xl bg-slate-50 hover:bg-[#16A6A1]/10 text-slate-700 hover:text-[#0B3A53] border border-slate-200/70 text-xs font-bold transition-all text-left flex flex-col gap-2 group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-white shadow-2xs flex items-center justify-center text-amber-500">
                <CheckSquare className="w-4 h-4" />
              </div>
              <span>AI Approvals</span>
            </button>
          </div>
        </div>

        {/* Ranked Popular Destinations */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-black text-[#0B3A53] font-heading">Popular Destinations</h2>
              <p className="text-[11px] text-slate-400 font-medium">Ranked by current tourist booking volume</p>
            </div>
            <button
              onClick={() => navigate('/admin/destinations')}
              className="text-xs font-bold text-[#146C86] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View All ({destinations.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {destinations.slice(0, 5).map((dest, idx) => (
              <div
                key={dest.id}
                className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors flex items-center justify-between gap-4 text-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-6 text-center font-black text-slate-400 text-xs">0{idx + 1}</span>
                  <img
                    src={dest.coverImage}
                    alt={dest.name}
                    className="w-12 h-10 rounded-xl object-cover shrink-0 border border-slate-200"
                  />
                  <div className="min-w-0">
                    <div className="font-extrabold text-[#0B3A53] truncate">{dest.name}</div>
                    <div className="text-[11px] text-slate-400 font-medium">{dest.province}</div>
                  </div>
                </div>

                <div className="flex items-center gap-6 shrink-0">
                  <div className="text-right">
                    <div className="font-extrabold text-[#0B3A53]">{dest.bookingsCount} Bookings</div>
                    <div className="text-[10px] font-bold text-emerald-600">+{dest.growthPercentage}% this month</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 4. RECENT BOOKINGS TABLE & RECENT ACTIVITY TIMELINE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Bookings Table */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-black text-[#0B3A53] font-heading">Recent Bookings</h2>
              <p className="text-[11px] text-slate-400 font-medium">Latest tourist travel reservations</p>
            </div>
            <button
              onClick={() => navigate('/admin/bookings')}
              className="text-xs font-bold text-[#146C86] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Manage Bookings</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  <th className="pb-3 px-2">Booking ID</th>
                  <th className="pb-3 px-2">Tourist</th>
                  <th className="pb-3 px-2">Package</th>
                  <th className="pb-3 px-2">Amount</th>
                  <th className="pb-3 px-2">Status</th>
                  <th className="pb-3 px-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {bookings.map((bkg) => (
                  <tr key={bkg.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-2 font-mono font-bold text-[#0B3A53]">{bkg.bookingCode}</td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <img src={bkg.touristAvatar} alt="" className="w-6 h-6 rounded-full object-cover" />
                        <span className="font-bold text-slate-800">{bkg.touristName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-slate-600 truncate max-w-[150px]">{bkg.packageName}</td>
                    <td className="py-3 px-2 font-bold text-[#0B3A53]">${bkg.totalAmount}</td>
                    <td className="py-3 px-2">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                          bkg.status === 'Confirmed'
                            ? 'bg-emerald-100 text-emerald-700'
                            : bkg.status === 'Pending'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {bkg.status}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <button
                        onClick={() => navigate('/admin/bookings')}
                        className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity Timeline */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-black text-[#0B3A53] font-heading">Live Activity Feed</h2>
            <span className="text-[10px] font-bold text-[#16A6A1] bg-[#16A6A1]/10 px-2 py-0.5 rounded-full">Realtime</span>
          </div>

          <div className="space-y-4 text-xs">
            {[
              {
                title: 'Booking #TL10294 confirmed',
                time: '12 mins ago',
                desc: 'Sanath W. completed payment for Grand Cultural Odyssey.',
                icon: CheckCircle2,
                color: 'text-emerald-500 bg-emerald-50',
              },
              {
                title: 'AI Itinerary WF-TL-801 generated',
                time: '25 mins ago',
                desc: 'Validation agent score: 96%. Awaiting operator review.',
                icon: Sparkles,
                color: 'text-[#16A6A1] bg-[#16A6A1]/10',
              },
              {
                title: 'Destination Kandy catalog updated',
                time: '1 hour ago',
                desc: 'Added Temple of Tooth festival timetable notes.',
                icon: Compass,
                color: 'text-[#146C86] bg-[#146C86]/10',
              },
              {
                title: 'New User Registered',
                time: '3 hours ago',
                desc: 'Samantha Perera created a traveler profile.',
                icon: Users,
                color: 'text-blue-500 bg-blue-50',
              },
            ].map((act, idx) => {
              const Icon = act.icon;
              return (
                <div key={idx} className="flex items-start gap-3">
                  <div className={`p-2 rounded-xl shrink-0 ${act.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="font-extrabold text-[#0B3A53]">{act.title}</div>
                    <div className="text-[11px] text-slate-500 leading-relaxed">{act.desc}</div>
                    <div className="text-[10px] font-bold text-slate-400 pt-0.5">{act.time}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
