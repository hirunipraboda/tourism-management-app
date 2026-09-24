import React, { useEffect, useState, useMemo } from 'react';
import {
  Milestone,
  Search,
  Eye,
  X,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  User,
  Calendar,
  DollarSign,
  Compass,
  Train,
  Bus,
  MapPin,
  Filter,
  Bot,
  UserCheck,
  ChevronRight,
  Info,
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { AdminTripItem, AdminTripDetail } from '../../types/adminTypes';

export const AdminTripsPage: React.FC = () => {
  const [trips, setTrips] = useState<AdminTripItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [selectedQuickTab, setSelectedQuickTab] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterTripType, setFilterTripType] = useState<string>('All');
  const [filterTripStatus, setFilterTripStatus] = useState<string>('All');
  const [filterApprovalStatus, setFilterApprovalStatus] = useState<string>('All');
  const [filterDestination, setFilterDestination] = useState<string>('All');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);

  // Inspector modal state
  const [activeModalTripId, setActiveModalTripId] = useState<string | null>(null);
  const [tripDetail, setTripDetail] = useState<AdminTripDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedItineraryDay, setSelectedItineraryDay] = useState<number>(1);

  const loadTrips = async () => {
    setLoading(true);
    try {
      const data = await adminService.fetchTrips({
        status: selectedQuickTab !== 'All' ? selectedQuickTab : filterTripStatus,
        search: searchTerm,
        tripType: filterTripType,
        approvalStatus: filterApprovalStatus,
        destination: filterDestination,
        startDate: startDate,
        endDate: endDate,
      });
      setTrips(data);
    } catch (err) {
      console.error('Failed to load trips', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrips();
  }, [
    selectedQuickTab,
    filterTripType,
    filterTripStatus,
    filterApprovalStatus,
    filterDestination,
    startDate,
    endDate,
  ]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadTrips();
  };

  const handleResetFilters = () => {
    setSelectedQuickTab('All');
    setSearchTerm('');
    setFilterTripType('All');
    setFilterTripStatus('All');
    setFilterApprovalStatus('All');
    setFilterDestination('All');
    setStartDate('');
    setEndDate('');
  };

  const handleOpenDetail = async (tripId: string) => {
    setActiveModalTripId(tripId);
    setDetailLoading(true);
    setSelectedItineraryDay(1);
    try {
      const detail = await adminService.fetchTripDetails(tripId);
      setTripDetail(detail);
    } catch (err) {
      console.error('Failed to load trip details', err);
    } finally {
      setDetailLoading(false);
    }
  };

  // Unique destinations for dropdown
  const uniqueDestinations = useMemo(() => {
    const set = new Set<string>();
    trips.forEach((t) => {
      if (t.destination) {
        set.add(t.destination);
      }
    });
    return Array.from(set);
  }, [trips]);

  const getTripTypeBadge = (type?: string) => {
    const isAi = (type || '').toUpperCase().includes('AI');
    if (isAi) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black tracking-wide bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs">
          <span>🤖</span>
          <span>AI GENERATED</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black tracking-wide bg-teal-50 text-teal-800 border border-teal-200 shadow-2xs">
        <span>👤</span>
        <span>USER CREATED</span>
      </span>
    );
  };

  const getTripStatusBadge = (status?: string) => {
    const s = (status || 'Active').toLowerCase();
    if (s.includes('active') || s.includes('confirmed') || s.includes('planned')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span>Active</span>
        </span>
      );
    }
    if (s.includes('draft')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-slate-100 text-slate-700">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
          <span>Draft</span>
        </span>
      );
    }
    if (s.includes('completed')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-blue-100 text-blue-800">
          <CheckCircle2 className="w-3 h-3 text-blue-600" />
          <span>Completed</span>
        </span>
      );
    }
    if (s.includes('cancelled')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-rose-100 text-rose-800">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
          <span>Cancelled</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-slate-100 text-slate-700">
        <span>{status}</span>
      </span>
    );
  };

  const getUserApprovalBadge = (approvalStatus?: string, isAiTrip = true) => {
    if (!isAiTrip || approvalStatus === 'NOT_APPLICABLE') {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
          Not Applicable
        </span>
      );
    }

    const s = (approvalStatus || '').toUpperCase();
    if (s.includes('APPROVED')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
          <span>🟢</span>
          <span>Approved by User</span>
        </span>
      );
    }
    if (s.includes('REVISION')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black bg-amber-100 text-amber-900 border border-amber-300">
          <span>🟠</span>
          <span>Revision Requested</span>
        </span>
      );
    }
    if (s.includes('REJECTED')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black bg-rose-100 text-rose-800 border border-rose-200">
          <span>🔴</span>
          <span>Rejected by User</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black bg-yellow-100 text-yellow-900 border border-yellow-300">
        <span>🟡</span>
        <span>Pending User Approval</span>
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0B3A53] font-heading tracking-tight flex items-center gap-2.5">
            <Milestone className="w-7 h-7 text-[#16A6A1]" />
            <span>Trip & Itinerary Management</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Supervisory monitoring of tourist trips, AI-generated itineraries, user approval decisions, and public transportation schedules.
          </p>
        </div>
      </div>

      {/* Quick Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-sidebar-scroll">
        {[
          { label: 'All Trips', value: 'All' },
          { label: '🤖 AI Generated', value: 'ai_generated' },
          { label: '👤 User Created', value: 'user_created' },
          { label: '🟡 Pending User Approval', value: 'pending_user_approval' },
          { label: '🟢 Approved by User', value: 'approved_by_user' },
          { label: '🟠 Revision Requested', value: 'revision_requested' },
          { label: 'Active', value: 'active' },
          { label: 'Completed', value: 'completed' },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setSelectedQuickTab(tab.value)}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition-all whitespace-nowrap cursor-pointer ${
              selectedQuickTab === tab.value
                ? 'bg-[#0B3A53] text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search & Advanced Filters Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <form onSubmit={handleSearch} className="flex-1 relative flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by Trip ID (e.g. TR001), user name, or destination..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50/80 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-[#16A6A1] focus:bg-white transition-all"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-[#16A6A1] hover:bg-[#146C86] text-white text-xs font-extrabold rounded-2xl transition-all shadow-xs cursor-pointer shrink-0"
            >
              Search
            </button>
          </form>

          {/* Toggle Filters Button */}
          <button
            type="button"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`px-4 py-3 rounded-2xl text-xs font-extrabold border transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              showAdvancedFilters || filterTripType !== 'All' || filterTripStatus !== 'All' || filterApprovalStatus !== 'All' || filterDestination !== 'All'
                ? 'bg-[#0B3A53] text-white border-[#0B3A53]'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filters</span>
          </button>
        </div>

        {/* Expandable Advanced Filters */}
        {showAdvancedFilters && (
          <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Trip Type */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                Trip Type
              </label>
              <select
                value={filterTripType}
                onChange={(e) => setFilterTripType(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-hidden focus:border-[#16A6A1]"
              >
                <option value="All">All Types</option>
                <option value="USER_CREATED">User Created</option>
                <option value="AI_GENERATED">AI Generated</option>
              </select>
            </div>

            {/* Trip Status */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                Trip Status
              </label>
              <select
                value={filterTripStatus}
                onChange={(e) => setFilterTripStatus(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-hidden focus:border-[#16A6A1]"
              >
                <option value="All">All Trip Statuses</option>
                <option value="Active">Active</option>
                <option value="Draft">Draft</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            {/* User Approval Status */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                User Approval Status
              </label>
              <select
                value={filterApprovalStatus}
                onChange={(e) => setFilterApprovalStatus(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-hidden focus:border-[#16A6A1]"
              >
                <option value="All">All Approval Statuses</option>
                <option value="PENDING_USER_APPROVAL">Pending User Approval</option>
                <option value="APPROVED_BY_USER">Approved by User</option>
                <option value="REVISION_REQUESTED">Revision Requested</option>
                <option value="NOT_APPLICABLE">Not Applicable (User Created)</option>
              </select>
            </div>

            {/* Destination */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                Destination
              </label>
              <select
                value={filterDestination}
                onChange={(e) => setFilterDestination(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-hidden focus:border-[#16A6A1]"
              >
                <option value="All">All Destinations</option>
                {uniqueDestinations.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Reset Button */}
            <div className="flex items-end">
              <button
                type="button"
                onClick={handleResetFilters}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Trips Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-400">
                <th className="py-4 px-5">Trip ID</th>
                <th className="py-4 px-5">User Name</th>
                <th className="py-4 px-5">Destination</th>
                <th className="py-4 px-5">Start Date</th>
                <th className="py-4 px-5">End Date</th>
                <th className="py-4 px-5">Trip Type</th>
                <th className="py-4 px-5">Status</th>
                <th className="py-4 px-5">User Approval Status</th>
                <th className="py-4 px-5">Created Date</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-16 text-center text-slate-400 font-bold">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-[#16A6A1] border-t-transparent rounded-full animate-spin"></div>
                      <span>Loading trips and itineraries...</span>
                    </div>
                  </td>
                </tr>
              ) : trips.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-16 text-center text-slate-400 font-bold">
                    <div className="flex flex-col items-center justify-center gap-1">
                      <Milestone className="w-8 h-8 text-slate-300 mb-1" />
                      <p className="text-slate-600 font-extrabold text-sm">No trips found matching filter criteria</p>
                      <p className="text-xs text-slate-400">Try adjusting your search keywords or resetting filters.</p>
                      <button
                        onClick={handleResetFilters}
                        className="mt-3 px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs cursor-pointer transition-colors"
                      >
                        Reset All Filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                trips.map((t) => {
                  const isAiTrip = (t.tripType || '').toUpperCase().includes('AI');
                  return (
                    <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Trip ID */}
                      <td className="py-4 px-5 font-mono">
                        <span className="font-extrabold text-[#0B3A53] bg-slate-100 px-2 py-1 rounded-lg text-xs">
                          {t.displayId || t.id.substring(0, 8)}
                        </span>
                        {t.displayId && (
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate max-w-[100px]">
                            {t.id}
                          </div>
                        )}
                      </td>

                      {/* User Name */}
                      <td className="py-4 px-5">
                        <div className="font-extrabold text-slate-800">{t.userName}</div>
                        <div className="text-[11px] text-slate-400">{t.userEmail}</div>
                      </td>

                      {/* Destination */}
                      <td className="py-4 px-5">
                        <span className="font-bold text-[#0B3A53] flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#16A6A1] shrink-0" />
                          <span>{t.destination}</span>
                        </span>
                      </td>

                      {/* Start Date */}
                      <td className="py-4 px-5 text-slate-700 font-semibold whitespace-nowrap">
                        {t.startDate}
                      </td>

                      {/* End Date */}
                      <td className="py-4 px-5 text-slate-700 font-semibold whitespace-nowrap">
                        {t.endDate}
                      </td>

                      {/* Trip Type */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        {getTripTypeBadge(t.tripType)}
                      </td>

                      {/* Trip Status */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        {getTripStatusBadge(t.status)}
                      </td>

                      {/* User Approval Status */}
                      <td className="py-4 px-5">
                        {getUserApprovalBadge(t.userApprovalStatus, isAiTrip)}
                      </td>

                      {/* Created Date */}
                      <td className="py-4 px-5 text-slate-500 font-medium whitespace-nowrap">
                        {t.createdAt}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleOpenDetail(t.id)}
                          className="px-3 py-1.5 bg-[#0B3A53]/5 hover:bg-[#0B3A53] text-[#0B3A53] hover:text-white rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5 font-extrabold text-xs shadow-2xs"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================= */}
      {/* TRIP DETAILS & ITINERARY MODAL (READ-ONLY MONITORING)     */}
      {/* ========================================================= */}
      {activeModalTripId && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#0B3A53] text-white flex items-center justify-center font-mono font-bold text-sm shadow-xs">
                  {tripDetail?.displayId || 'TR'}
                </div>
                <div>
                  <h2 className="text-lg font-black text-[#0B3A53] font-heading flex items-center gap-2">
                    <span>Trip Details & Itinerary Audit</span>
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Trip ID: <span className="font-mono font-bold text-slate-700">{tripDetail?.displayId || tripDetail?.id}</span> · Reference: {tripDetail?.id}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setActiveModalTripId(null);
                  setTripDetail(null);
                }}
                className="p-2 hover:bg-slate-200/60 rounded-full text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs">
              {detailLoading || !tripDetail ? (
                <div className="py-20 text-center text-slate-400 font-bold flex flex-col items-center justify-center gap-3">
                  <div className="w-8 h-8 border-3 border-[#16A6A1] border-t-transparent rounded-full animate-spin"></div>
                  <span>Loading full trip trace, day itineraries, and transport links...</span>
                </div>
              ) : (
                <>

                  {/* Top Status & Type Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Trip Type */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Trip Type
                      </span>
                      <div>{getTripTypeBadge(tripDetail.tripType)}</div>
                    </div>

                    {/* Trip Status */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Trip Status
                      </span>
                      <div>{getTripStatusBadge(tripDetail.status)}</div>
                    </div>

                    {/* User Approval Status */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        User Approval Status
                      </span>
                      <div>
                        {getUserApprovalBadge(
                          tripDetail.userApproval?.status,
                          (tripDetail.tripType || '').toUpperCase().includes('AI')
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Revision Information Card (if revision requested) */}
                  {tripDetail.userApproval?.status === 'REVISION_REQUESTED' && (
                    <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-300 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                          <RotateCcw className="w-4 h-4 text-amber-700" />
                          <span>Revision Requested by Tourist</span>
                        </span>
                        {tripDetail.userApproval.requestedDate && (
                          <span className="text-[11px] font-bold text-amber-700 bg-white/70 px-2.5 py-1 rounded-lg border border-amber-200">
                            Requested: {tripDetail.userApproval.requestedDate}
                          </span>
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="text-[11px] font-extrabold text-amber-900">User Request:</div>
                        <div className="p-3 bg-white rounded-xl border border-amber-200 text-amber-950 font-semibold italic text-xs leading-relaxed">
                          "{tripDetail.userApproval.revisionReason || 'Tourist requested schedule adjustments.'}"
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Trip Details Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                    <div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">User</span>
                      <div className="font-black text-slate-800 text-xs mt-0.5">{tripDetail.user?.name || 'Tourist'}</div>
                      <div className="text-[11px] text-slate-500">{tripDetail.user?.email || 'N/A'}</div>
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Destination</span>
                      <div className="font-black text-[#0B3A53] text-xs mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#16A6A1]" />
                        <span>{tripDetail.destination}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Travel Dates</span>
                      <div className="font-extrabold text-slate-800 text-xs mt-0.5">
                        {tripDetail.startDate}
                      </div>
                      <div className="text-[11px] text-slate-500">to {tripDetail.endDate}</div>
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Duration</span>
                      <div className="font-black text-slate-800 text-xs mt-0.5">
                        {tripDetail.numberOfDays || 1} Days / {Math.max(1, (tripDetail.numberOfDays || 1) - 1)} Nights
                      </div>
                      <div className="text-[11px] text-slate-500">{tripDetail.numberOfTravelers} Travelers</div>
                    </div>
                  </div>

                  {/* Budget & Preferences Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Budget</span>
                      <div className="font-black text-[#146C86] text-sm mt-0.5">${tripDetail.budget}</div>
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Est. Itinerary Cost</span>
                      <div className="font-black text-[#0B3A53] text-sm mt-0.5">
                        ${tripDetail.itinerary?.totalEstimatedCost || 0}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Travel Pace / Style</span>
                      <div className="font-bold text-slate-700 capitalize mt-0.5">
                        {tripDetail.tripStyle || 'Standard'}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Interests</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {tripDetail.interests && tripDetail.interests.length > 0 ? (
                          tripDetail.interests.map((i, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 bg-white border border-slate-200 rounded-md text-[10px] font-bold text-slate-600 capitalize"
                            >
                              {i}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 italic">None specified</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ITINERARY DETAILS (MOST IMPORTANT SECTION) */}
                  <div className="space-y-4 pt-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                      <div>
                        <h3 className="font-black text-[#0B3A53] text-base font-heading flex items-center gap-2">
                          <Compass className="w-5 h-5 text-[#16A6A1]" />
                          <span>Complete Itinerary Details</span>
                        </h3>
                        <p className="text-slate-500 text-[11px] font-medium">
                          {tripDetail.itinerary?.title || `${tripDetail.destination} Itinerary Plan`}
                        </p>
                      </div>

                      {/* Day Tabs Switcher */}
                      {tripDetail.itinerary?.days && tripDetail.itinerary.days.length > 1 && (
                        <div className="flex items-center gap-1.5 overflow-x-auto">
                          {tripDetail.itinerary.days.map((d) => (
                            <button
                              key={d.dayNumber}
                              onClick={() => setSelectedItineraryDay(d.dayNumber)}
                              className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer whitespace-nowrap ${
                                selectedItineraryDay === d.dayNumber
                                  ? 'bg-[#0B3A53] text-white shadow-xs'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                              }`}
                            >
                              Day {d.dayNumber}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Day Itinerary Schedule View */}
                    {tripDetail.itinerary?.days && tripDetail.itinerary.days.length > 0 ? (
                      <div className="space-y-4">
                        {tripDetail.itinerary.days
                          .filter((d) =>
                            tripDetail.itinerary!.days.length > 1 ? d.dayNumber === selectedItineraryDay : true
                          )
                          .map((day) => (
                            <div
                              key={day.dayNumber}
                              className="p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-4"
                            >
                              {/* Day Title & Location */}
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-3 border-b border-slate-100">
                                <div>
                                  <h4 className="font-black text-[#0B3A53] text-sm font-heading">
                                    {day.title || `Day ${day.dayNumber}`}
                                  </h4>
                                  {day.date && (
                                    <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                                      <Calendar className="w-3 h-3 text-slate-400" />
                                      <span>{day.date}</span>
                                    </div>
                                  )}
                                </div>
                                <div className="text-xs font-black text-[#16A6A1] bg-[#16A6A1]/10 px-3 py-1 rounded-full self-start sm:self-auto">
                                  {day.location}
                                </div>
                              </div>

                              {/* Items Timeline */}
                              <div className="space-y-3 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200">
                                {day.items.map((item, idx) => (
                                  <div key={idx} className="relative flex items-start gap-4 pl-1">
                                    {/* Timeline Marker */}
                                    <div className="w-6 h-6 rounded-full bg-white border-2 border-[#16A6A1] flex items-center justify-center shrink-0 z-10 text-[10px] font-black text-[#16A6A1]">
                                      {idx + 1}
                                    </div>

                                    {/* Item Card */}
                                    <div className="flex-1 p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-2">
                                      {/* Time & Cost Header */}
                                      <div className="flex flex-wrap items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                          <span className="font-extrabold text-[#0B3A53] text-xs bg-white px-2.5 py-0.5 rounded-lg border border-slate-200 font-mono">
                                            {item.startTime} – {item.endTime}
                                          </span>
                                          {item.durationMinutes && (
                                            <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                                              <Clock className="w-3 h-3" />
                                              <span>{item.durationMinutes} mins</span>
                                            </span>
                                          )}
                                        </div>

                                        <span className="font-black text-[#146C86] text-xs">
                                          {item.estimatedCost > 0 ? `$${item.estimatedCost}` : 'Free Entry'}
                                        </span>
                                      </div>

                                      {/* Activity / Attraction Name */}
                                      <div className="font-black text-slate-800 text-sm">
                                        {item.activityName}
                                      </div>

                                      {/* Location & Travel Time */}
                                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 font-medium">
                                        <span className="flex items-center gap-1">
                                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                          <span>{item.location}</span>
                                        </span>

                                        {item.travelTime && (
                                          <span className="text-slate-400">
                                            · Travel transfer: {item.travelTime}
                                          </span>
                                        )}
                                      </div>

                                      {/* Transportation Card (Public Train / Bus) */}
                                      {item.transport && (
                                        <div className="mt-3 p-3 rounded-xl bg-white border border-indigo-200 text-slate-700 space-y-1 shadow-2xs">
                                          <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1.5 font-black text-xs text-indigo-950">
                                              {item.transport.type === 'Train' ? (
                                                <Train className="w-4 h-4 text-indigo-600" />
                                              ) : (
                                                <Bus className="w-4 h-4 text-emerald-600" />
                                              )}
                                              <span>
                                                {item.transport.type}: {item.transport.name}
                                              </span>
                                            </div>

                                            {item.transport.fare && item.transport.fare > 0 && (
                                              <span className="font-black text-indigo-700 text-xs">
                                                Fare: ${item.transport.fare}
                                              </span>
                                            )}
                                          </div>

                                          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1">
                                            <div>
                                              <span className="text-slate-400 font-bold">Route: </span>
                                              <span className="font-semibold">
                                                {item.transport.from} → {item.transport.to}
                                              </span>
                                            </div>
                                            <div className="text-right">
                                              <span className="text-slate-400 font-bold">Time: </span>
                                              <span className="font-mono font-semibold">
                                                {item.transport.departure} → {item.transport.arrival}
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-2xl border border-slate-200">
                        No day-by-day itinerary records available for this trip.
                      </div>
                    )}
                  </div>

                  {/* Deterministic Constraint Validation Checks */}
                  {tripDetail.validationResults && tripDetail.validationResults.length > 0 && (
                    <div className="space-y-3 pt-2">
                      <h3 className="font-black text-[#0B3A53] text-sm font-heading flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>Deterministic Constraint Checks (8 Safety Rules)</span>
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {tripDetail.validationResults.map((val, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-xl border border-slate-200 bg-white flex items-start justify-between gap-2 shadow-2xs"
                          >
                            <div>
                              <div className="font-black text-slate-800 text-xs">{val.rule}</div>
                              <div className="text-[11px] text-slate-500">{val.detail}</div>
                            </div>
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 shrink-0">
                              {val.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Dates & Trace Footer */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      Created: <span className="font-bold text-slate-700">{tripDetail.createdAt}</span> · Last Updated: <span className="font-bold text-slate-700">{tripDetail.updatedAt || tripDetail.createdAt}</span>
                    </div>
                    {tripDetail.workflowTrace && (
                      <div className="text-slate-400">
                        AI Workflow Trace ID: {tripDetail.workflowTrace.id}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer (READ-ONLY: STRICTLY NO APPROVE/REJECT BUTTONS) */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
              <span className="text-[11px] text-slate-500 font-medium">
                Admin read-only monitoring mode · User approval is handled directly by the tourist.
              </span>
              <button
                onClick={() => {
                  setActiveModalTripId(null);
                  setTripDetail(null);
                }}
                className="px-6 py-2.5 bg-[#0B3A53] hover:bg-[#072537] text-white rounded-xl font-bold text-xs transition-colors cursor-pointer shadow-xs"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
