import React, { useState, useEffect } from 'react';
import {
  guideService,
  type GuideProfileDetailDto,
  type GuideBookingResponse,
  type AdminGuideStatsResponse,
} from '../../services/guideService';
import { tourOperationService } from '../../services/tourOperationService';
import { guideAvailabilityService, type AvailabilitySlotResponse } from '../../services/guideAvailabilityService';
import {
  Users,
  Package,
  Plus,
  Search,
  Star,
  MapPin,
  Clock,
  Globe,
  X,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  UserCheck,
  Route,
  Eye,
  Edit2,
  Trash2,
  Calendar,
  DollarSign,
  Award,
  CreditCard,
  ShieldCheck,
  Send,
  RefreshCw,
  Archive,
  Phone,
  Mail,
  User,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type TabId = 'guides' | 'bookings' | 'payouts' | 'operations' | 'availability';
type GuideStatus = 'Active' | 'Inactive' | 'Pending';
type OperationStatus = 'Scheduled' | 'Ongoing' | 'Completed' | 'Cancelled';

interface GuideDisplayItem {
  id: string;
  numericId: number;
  userId?: string;
  name: string;
  email: string;
  phone: string;
  languages: string[];
  specialties: string[];
  yearsExperience: number;
  rating: number;
  totalTours: number;
  status: GuideStatus;
  verificationStatus?: 'Pending' | 'Verified' | 'Rejected';
  avatarUrl: string;
  bio: string;
  location: string;
  hourlyRate: number;
  halfDayRate: number;
  fullDayRate: number;
  acceptingBookings: boolean;
  isArchived: boolean;
  payoutAccountNote?: string;
  coveredDestinations: string[];
}

interface TourOperation {
  id: string;
  tourName: string;
  guideName: string;
  guideId: string;
  destination: string;
  startDate: string;
  endDate: string;
  travelerCount: number;
  maxCapacity: number;
  status: OperationStatus;
  pricePerPerson: number;
  duration: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Fallback / Initial Mock Data for graceful degradation
// ─────────────────────────────────────────────────────────────────────────────

const FALLBACK_GUIDES: GuideDisplayItem[] = [
  {
    id: 'guide-001',
    numericId: 1,
    name: 'Samantha Perera',
    email: 'guide@tourlink.com',
    phone: '+94 77 123 4567',
    languages: ['English', 'Sinhala', 'Tamil'],
    specialties: ['Cultural Heritage', 'Ancient Cities', 'Temple History'],
    yearsExperience: 7,
    rating: 4.95,
    totalTours: 284,
    status: 'Active',
    verificationStatus: 'Verified',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    bio: 'Licensed national tourist guide specializing in UNESCO World Heritage sites, Sigiriya, Polonnaruwa, and Kandy Sacred Tooth Relic Temple.',
    location: 'Kandy & Cultural Triangle',
    hourlyRate: 15.0,
    halfDayRate: 50.0,
    fullDayRate: 90.0,
    acceptingBookings: true,
    isArchived: false,
    payoutAccountNote: 'BOC Account: 789123445 (Kandy Branch)',
    coveredDestinations: ['Sigiriya Ancient Rock Fortress', 'Temple of the Sacred Tooth Relic', 'Dambulla Cave Temple'],
  },
  {
    id: 'guide-002',
    numericId: 2,
    name: 'Dinesh Jayawardena',
    email: 'dinesh.guide@tourlink.com',
    phone: '+94 71 890 1234',
    languages: ['English', 'Sinhala'],
    specialties: ['Hiking & Trekking', 'Tea Plantations', 'Knuckles Ranges'],
    yearsExperience: 5,
    rating: 4.88,
    totalTours: 196,
    status: 'Active',
    verificationStatus: 'Verified',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    bio: 'Certified wilderness guide and birding specialist with profound knowledge of Ella Rock, Little Adams Peak, and Horton Plains.',
    location: 'Ella & Central Highlands',
    hourlyRate: 14.0,
    halfDayRate: 45.0,
    fullDayRate: 80.0,
    acceptingBookings: true,
    isArchived: false,
    payoutAccountNote: 'Commercial Bank: 8001298412',
    coveredDestinations: ['Nine Arches Bridge', 'Ella Rock & Little Adams Peak', 'Horton Plains National Park'],
  },
  {
    id: 'guide-003',
    numericId: 3,
    name: 'Ruwan Silva',
    email: 'ruwan.silva@tourlink.com',
    phone: '+94 76 456 7890',
    languages: ['English', 'German', 'Sinhala'],
    specialties: ['Wildlife Safari', 'Leopard Tracking', 'Bird Watching'],
    yearsExperience: 9,
    rating: 4.92,
    totalTours: 340,
    status: 'Active',
    verificationStatus: 'Verified',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    bio: 'Veteran naturalist guide registered with Sri Lanka Department of Wildlife Conservation, active across Yala, Udawalawe, and Bundala.',
    location: 'Yala & Southern Province',
    hourlyRate: 18.0,
    halfDayRate: 60.0,
    fullDayRate: 110.0,
    acceptingBookings: true,
    isArchived: false,
    payoutAccountNote: 'HNB Bank: 0142981723',
    coveredDestinations: ['Yala National Park', 'Udawalawe National Park', 'Mirissa Coast'],
  },
];

const MOCK_OPERATIONS: TourOperation[] = [
  {
    id: 'op-001',
    tourName: 'Sigiriya & Dambulla Heritage Day',
    guideName: 'Samantha Perera',
    guideId: '1',
    destination: 'Sigiriya → Dambulla',
    startDate: '2026-10-15',
    endDate: '2026-10-15',
    travelerCount: 4,
    maxCapacity: 6,
    status: 'Scheduled',
    pricePerPerson: 45,
    duration: 'Full Day (8 Hours)',
  },
  {
    id: 'op-002',
    tourName: 'Ella High Country Peaks Trek',
    guideName: 'Dinesh Jayawardena',
    guideId: '2',
    destination: 'Ella Rock & Nine Arches Bridge',
    startDate: '2026-10-12',
    endDate: '2026-10-12',
    travelerCount: 3,
    maxCapacity: 4,
    status: 'Ongoing',
    pricePerPerson: 40,
    duration: 'Half Day (5 Hours)',
  },
];

function parseNumericGuideId(id: string | number): number {
  if (typeof id === 'number') return id;
  const num = parseInt(id, 10);
  if (!isNaN(num) && num > 0) return num;
  return 1;
}

const guideStatusStyle: Record<GuideStatus, string> = {
  Active: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  Inactive: 'bg-slate-100 text-slate-500 border border-slate-200',
  Pending: 'bg-amber-50 text-amber-600 border border-amber-200',
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export const AdminGuideToursPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('guides');
  const [guideSearch, setGuideSearch] = useState('');
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState('All');
  const [opSearch, setOpSearch] = useState('');

  // Live Data States
  const [guides, setGuides] = useState<GuideDisplayItem[]>(FALLBACK_GUIDES);
  const [bookings, setBookings] = useState<GuideBookingResponse[]>([]);
  const [stats, setStats] = useState<AdminGuideStatsResponse | null>(null);
  const [operations, setOperations] = useState<TourOperation[]>(MOCK_OPERATIONS);
  const [availabilities, setAvailabilities] = useState<AvailabilitySlotResponse[]>([]);

  const [isLoadingGuides, setIsLoadingGuides] = useState(false);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Modals
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [selectedGuide, setSelectedGuide] = useState<GuideDisplayItem | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<GuideBookingResponse | null>(null);

  // Payout Modal
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [payoutTargetBooking, setPayoutTargetBooking] = useState<GuideBookingResponse | null>(null);
  const [payoutForm, setPayoutForm] = useState({
    payoutReference: '',
    payoutMethod: 'Bank Transfer (BOC)',
    notes: 'Direct transfer to registered guide bank account',
  });

  // Guide Create Form
  const emptyGuideForm = {
    name: '',
    email: '',
    password: 'guide123',
    phone: '',
    bio: '',
    location: '',
    languages: 'English, Sinhala',
    specialties: 'Cultural Heritage, Wildlife',
    yearsExperience: '5',
    hourlyRate: '15.00',
    halfDayRate: '50.00',
    fullDayRate: '90.00',
    payoutAccountNote: '',
  };
  const [guideForm, setGuideForm] = useState(emptyGuideForm);

  // ── Load Stats, Guides, and Bookings ─────────────────────────────────────
  const loadStats = async () => {
    try {
      const data = await guideService.fetchAdminStats();
      if (data) setStats(data);
    } catch {
      // Backend not yet reachable or error
    }
  };

  const loadGuides = async () => {
    setIsLoadingGuides(true);
    try {
      const apiGuides = await guideService.fetchAdminGuides();
      if (apiGuides && apiGuides.length > 0) {
        const mapped: GuideDisplayItem[] = apiGuides.map((g) => ({
          id: `guide-${g.id}`,
          numericId: g.id,
          userId: g.userId,
          name: g.name,
          email: g.email,
          phone: g.phone || 'N/A',
          languages: g.languages || [],
          specialties: g.specialties || [],
          yearsExperience: g.yearsExperience || 0,
          rating: g.ratingAvg || 0,
          totalTours: g.toursCompleted || 0,
          status: g.isArchived ? 'Inactive' : (g.isActive ? 'Active' : 'Inactive'),
          verificationStatus: (g.verificationStatus as any) || 'Verified',
          avatarUrl: g.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${g.name}`,
          bio: g.bio || '',
          location: g.coveredDestinations && g.coveredDestinations.length > 0
            ? g.coveredDestinations.map(d => d.destinationName).join(', ')
            : 'Sri Lanka',
          hourlyRate: g.hourlyRate || 0,
          halfDayRate: g.halfDayRate || 0,
          fullDayRate: g.fullDayRate || 0,
          acceptingBookings: g.acceptingBookings,
          isArchived: g.isArchived,
          payoutAccountNote: g.payoutAccountNote,
          coveredDestinations: (g.coveredDestinations || []).map(d => d.destinationName),
        }));
        setGuides(mapped);
      }
      setApiError(null);
    } catch {
      setApiError('Connected to local offline data.');
    } finally {
      setIsLoadingGuides(false);
    }
  };

  const loadBookings = async () => {
    setIsLoadingBookings(true);
    try {
      const logs = await guideService.fetchAdminBookingLogs();
      if (logs) setBookings(logs);
    } catch {
      // ignore
    } finally {
      setIsLoadingBookings(false);
    }
  };

  useEffect(() => {
    loadStats();
    loadGuides();
    loadBookings();
  }, []);

  // ── Actions ───────────────────────────────────────────────────────────────

  const handleToggleGuideStatus = async (guide: GuideDisplayItem) => {
    const nextActive = guide.status !== 'Active';
    // Optimistic
    setGuides(guides.map(g => g.numericId === guide.numericId ? { ...g, status: nextActive ? 'Active' : 'Inactive' } : g));
    try {
      await guideService.setGuideActiveStatus(guide.numericId, nextActive);
      await loadStats();
    } catch (err) {
      console.error(err);
      loadGuides();
    }
  };

  const handleArchiveGuide = async (numericId: number) => {
    if (!window.confirm('Are you sure you want to archive this guide? They will no longer be visible for new bookings.')) return;
    setGuides(guides.filter(g => g.numericId !== numericId));
    try {
      await guideService.archiveGuide(numericId);
      await loadStats();
    } catch (err) {
      console.error(err);
      loadGuides();
    }
  };

  const handleCreateGuide = async () => {
    if (!guideForm.name || !guideForm.email) {
      alert('Please enter Name and Email.');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        name: guideForm.name,
        email: guideForm.email,
        phone: guideForm.phone,
        bio: guideForm.bio,
        languages: guideForm.languages.split(',').map(s => s.trim()).filter(Boolean),
        specialties: guideForm.specialties.split(',').map(s => s.trim()).filter(Boolean),
        yearsExperience: Number(guideForm.yearsExperience) || 1,
        hourlyRate: Number(guideForm.hourlyRate) || 15,
        halfDayRate: Number(guideForm.halfDayRate) || 50,
        fullDayRate: Number(guideForm.fullDayRate) || 90,
        password: guideForm.password || 'guide123',
        payoutAccountNote: guideForm.payoutAccountNote,
      };

      await guideService.createAdminGuide(payload);
      setIsGuideModalOpen(false);
      setGuideForm(emptyGuideForm);
      await loadGuides();
      await loadStats();
      alert(`Guide ${payload.name} created successfully! Guide can login using ${payload.email} / ${payload.password}`);
    } catch (err: any) {
      alert(err.message || 'Failed to create guide.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenPayoutModal = (booking: GuideBookingResponse) => {
    setPayoutTargetBooking(booking);
    setPayoutForm({
      payoutReference: `TRX-WIRE-${Date.now().toString().slice(-6)}`,
      payoutMethod: 'Bank Transfer (BOC)',
      notes: `Settlement for Guide ${booking.guideName} - Booking #${booking.id}`,
    });
    setIsPayoutModalOpen(true);
  };

  const handleProcessPayout = async () => {
    if (!payoutTargetBooking) return;
    if (!payoutForm.payoutReference) {
      alert('Please provide a Payout Reference.');
      return;
    }

    setIsSaving(true);
    try {
      await guideService.processAdminPayout(
        payoutTargetBooking.id,
        payoutForm.payoutReference,
        payoutForm.payoutMethod,
        payoutForm.notes
      );
      setIsPayoutModalOpen(false);
      setPayoutTargetBooking(null);
      await loadBookings();
      await loadStats();
      alert('Payout recorded and status updated successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to process payout.');
    } finally {
      setIsSaving(false);
    }
  };

  // ── Filtered Views ────────────────────────────────────────────────────────
  const filteredGuides = guides.filter(g =>
    g.name.toLowerCase().includes(guideSearch.toLowerCase()) ||
    g.email.toLowerCase().includes(guideSearch.toLowerCase()) ||
    g.location.toLowerCase().includes(guideSearch.toLowerCase()) ||
    g.specialties.some(s => s.toLowerCase().includes(guideSearch.toLowerCase()))
  );

  const filteredBookings = bookings.filter(b => {
    const matchSearch =
      b.id.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.guideName.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.customerName.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.customerEmail.toLowerCase().includes(bookingSearch.toLowerCase());
    const matchStatus = bookingStatusFilter === 'All' || b.status.toLowerCase() === bookingStatusFilter.toLowerCase();
    return matchSearch && matchStatus;
  });

  const filteredOps = operations.filter(op =>
    op.tourName.toLowerCase().includes(opSearch.toLowerCase()) ||
    op.guideName.toLowerCase().includes(opSearch.toLowerCase()) ||
    op.destination.toLowerCase().includes(opSearch.toLowerCase())
  );

  // Financial summary numbers
  const displayTotalRevenue = stats?.totalRevenue ?? bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  const displayGuideAccrued = stats?.guideEarningsAccrued ?? bookings.reduce((sum, b) => sum + (b.guideNetAmount || 0), 0);
  const displayPayoutsPending = stats?.guidePayoutsPending ?? bookings.filter(b => b.payout?.status === 'Pending').reduce((sum, b) => sum + (b.guideNetAmount || 0), 0);
  const displayPayoutsCompleted = stats?.guidePayoutsCompleted ?? bookings.filter(b => b.payout?.status === 'Completed').reduce((sum, b) => sum + (b.guideNetAmount || 0), 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">

      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0B3A53] font-heading tracking-tight">
            Tour Guide Management & Payouts
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Administer licensed guide accounts, monitor customer bookings, track payments, and disburse guide payouts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              loadStats();
              loadGuides();
              loadBookings();
            }}
            className="p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              if (activeTab === 'guides') setIsGuideModalOpen(true);
              else if (activeTab === 'bookings') alert('Customer bookings are placed through the tourist mobile app and synchronized here in real-time.');
              else if (activeTab === 'payouts') alert('Select any booking below to disburse or verify guide payout.');
            }}
            className="bg-[#0B3A53] hover:bg-[#072537] text-white font-extrabold text-xs uppercase tracking-wider px-6 py-3.5 rounded-full shadow-md transition-all cursor-pointer flex items-center gap-2"
          >
            <Plus className="w-4 h-4 text-[#16A6A1]" />
            <span>Add Guide Account</span>
          </button>
        </div>
      </div>

      {/* ── Summary Stats ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        {[
          { label: 'Registered Guides', value: stats?.totalGuides ?? guides.length, icon: Users, color: 'text-[#0B3A53]', bg: 'bg-slate-100' },
          { label: 'Active Guides', value: stats?.activeGuides ?? guides.filter(g => g.status === 'Active').length, icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Total Bookings', value: stats?.totalBookings ?? bookings.length, icon: Calendar, color: 'text-sky-600', bg: 'bg-sky-50' },
          { label: 'Customer Payments', value: `$${displayTotalRevenue.toFixed(0)}`, icon: DollarSign, color: 'text-teal-600', bg: 'bg-teal-50' },
          { label: 'Guide Earnings (85%)', value: `$${displayGuideAccrued.toFixed(0)}`, icon: Award, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Payouts Pending', value: `$${displayPayoutsPending.toFixed(0)}`, icon: CreditCard, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-xs flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center shrink-0`}>
                <Icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <div>
                <div className="text-xl font-black text-[#0B3A53]">{stat.value}</div>
                <div className="text-[10px] font-semibold text-slate-500 leading-tight">{stat.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Tabs Navigation ───────────────────────────────────────────────── */}
      <div className="flex gap-1 bg-slate-100/80 rounded-2xl p-1 w-fit border border-slate-200/60 overflow-x-auto">
        {([
          { id: 'guides', label: 'Guides Directory & Accounts', icon: Users },
          { id: 'bookings', label: 'Guide Bookings & Monitoring', icon: Calendar },
          { id: 'payouts', label: 'Payments & Guide Payouts', icon: DollarSign },
          { id: 'operations', label: 'Tour Operations', icon: Package },
        ] as { id: TabId; label: string; icon: any }[]).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === id
                ? 'bg-white text-[#0B3A53] shadow-sm border border-slate-200/60'
                : 'text-slate-500 hover:text-[#0B3A53]'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* 1. GUIDES DIRECTORY TAB                                             */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'guides' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search guides, email, specialty, regions…"
                value={guideSearch}
                onChange={(e) => setGuideSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#16A6A1] focus:ring-2 focus:ring-[#16A6A1]/10"
              />
            </div>
            <div className="text-xs text-slate-500 font-semibold">
              Showing {filteredGuides.length} licensed guides
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredGuides.map((guide) => (
              <div
                key={guide.id}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="bg-gradient-to-br from-[#0B3A53] to-[#146C86] p-5 relative text-white">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={guide.avatarUrl}
                          alt={guide.name}
                          className="w-14 h-14 rounded-full border-2 border-white/30 bg-white/20 object-cover"
                        />
                        <div>
                          <h3 className="text-sm font-black text-white leading-tight">{guide.name}</h3>
                          <div className="flex items-center gap-1 mt-0.5 text-white/80">
                            <Mail className="w-3 h-3 text-[#16A6A1]" />
                            <span className="text-[10px] font-semibold">{guide.email}</span>
                          </div>
                          <div className="flex items-center gap-1 mt-0.5 text-white/70">
                            <Phone className="w-3 h-3 text-[#16A6A1]" />
                            <span className="text-[10px] font-semibold">{guide.phone}</span>
                          </div>
                        </div>
                      </div>
                      <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${guideStatusStyle[guide.status]}`}>
                        {guide.status}
                      </span>
                    </div>

                    {/* Stats & Rates */}
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/10 text-xs">
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span className="font-black">{guide.rating > 0 ? guide.rating.toFixed(2) : '5.0'}</span>
                      </div>
                      <div className="text-white/80 text-[11px] font-bold">
                        {guide.totalTours} tours
                      </div>
                      <div className="bg-emerald-500/20 text-emerald-300 font-black text-[11px] px-2 py-0.5 rounded-lg border border-emerald-400/30">
                        ${guide.fullDayRate}/day
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 space-y-3">
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{guide.bio}</p>

                    {/* Pricing Breakdown */}
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between text-center text-[10px]">
                      <div>
                        <div className="text-slate-400 font-bold uppercase">Hourly</div>
                        <div className="font-black text-[#0B3A53] text-xs">${guide.hourlyRate}</div>
                      </div>
                      <div className="border-l border-slate-200 pl-3">
                        <div className="text-slate-400 font-bold uppercase">Half Day</div>
                        <div className="font-black text-[#0B3A53] text-xs">${guide.halfDayRate}</div>
                      </div>
                      <div className="border-l border-slate-200 pl-3">
                        <div className="text-slate-400 font-bold uppercase">Full Day</div>
                        <div className="font-black text-emerald-700 text-xs">${guide.fullDayRate}</div>
                      </div>
                    </div>

                    {/* Languages */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-[10px] font-black uppercase text-slate-400">
                        <Globe className="w-3 h-3" /> Languages
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {guide.languages.map((lang) => (
                          <span key={lang} className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-lg">
                            {lang}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Specialties */}
                    <div className="space-y-1">
                      <div className="text-[10px] font-black uppercase text-slate-400">Specialties</div>
                      <div className="flex flex-wrap gap-1">
                        {guide.specialties.map((spec) => (
                          <span key={spec} className="bg-[#16A6A1]/10 text-[#0B3A53] text-[10px] font-bold px-2 py-0.5 rounded-lg">
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>

                    {guide.payoutAccountNote && (
                      <div className="text-[10px] text-slate-400 flex items-center gap-1">
                        <CreditCard className="w-3 h-3 text-slate-400" />
                        <span className="truncate">{guide.payoutAccountNote}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="p-5 pt-0 border-t border-slate-100 flex items-center justify-between gap-2 mt-2">
                  <button
                    onClick={() => setSelectedGuide(guide)}
                    className="flex items-center gap-1 text-xs font-bold text-[#146C86] hover:text-[#0B3A53] cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" /> Profile
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleGuideStatus(guide)}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-black cursor-pointer transition-colors ${
                        guide.status === 'Active'
                          ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                          : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                      }`}
                    >
                      {guide.status === 'Active' ? 'Deactivate' : 'Activate'}
                    </button>

                    <button
                      onClick={() => handleArchiveGuide(guide.numericId)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Archive Guide"
                    >
                      <Archive className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* 2. GUIDE BOOKINGS & MONITORING TAB                                  */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 max-w-lg w-full">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search booking ID, customer, guide..."
                  value={bookingSearch}
                  onChange={(e) => setBookingSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#16A6A1]"
                />
              </div>

              <select
                value={bookingStatusFilter}
                onChange={(e) => setBookingStatusFilter(e.target.value)}
                className="px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-[#0B3A53] focus:outline-none"
              >
                <option value="All">All Statuses</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Completed">Completed</option>
                <option value="PendingPayment">Pending Payment</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div className="text-xs text-slate-500 font-semibold">
              Showing {filteredBookings.length} bookings
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-wider">
                    <th className="px-5 py-3.5 text-left">Booking ID</th>
                    <th className="px-5 py-3.5 text-left">Guide</th>
                    <th className="px-5 py-3.5 text-left">Customer</th>
                    <th className="px-5 py-3.5 text-left">Dates & Time</th>
                    <th className="px-5 py-3.5 text-left">Total / Fee</th>
                    <th className="px-5 py-3.5 text-left">Guide Net (85%)</th>
                    <th className="px-5 py-3.5 text-left">Status</th>
                    <th className="px-5 py-3.5 text-left">Payment</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-5 py-12 text-center text-slate-400 font-semibold">
                        No guide bookings found matching criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-5 py-4 font-mono font-bold text-[#0B3A53]">{b.id}</td>
                        <td className="px-5 py-4">
                          <div className="font-bold text-[#0B3A53]">{b.guideName}</div>
                          <div className="text-[10px] text-slate-400">ID #{b.guideId}</div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="font-bold text-slate-700">{b.customerName}</div>
                          <div className="text-[10px] text-slate-400">{b.customerEmail}</div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="font-semibold text-slate-700">{b.startDate} to {b.endDate}</div>
                          <div className="text-[10px] text-slate-400">{b.startTime} - {b.endTime} ({b.billableDays}d)</div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="font-bold text-[#0B3A53]">${b.totalAmount.toFixed(2)}</div>
                          <div className="text-[10px] text-teal-600">Comm: ${b.commissionAmount.toFixed(2)}</div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="font-black text-emerald-700">${b.guideNetAmount.toFixed(2)}</div>
                          <div className="text-[10px] text-slate-400">
                            Payout: {b.payout?.status || 'Pending'}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                            b.status === 'Confirmed' ? 'bg-sky-50 text-sky-700 border border-sky-200' :
                            b.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            b.status === 'Cancelled' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                            'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {b.status}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                            b.payment?.status === 'Completed' ? 'bg-emerald-50 text-emerald-700' :
                            b.payment?.status === 'Refunded' ? 'bg-purple-50 text-purple-700' :
                            'bg-amber-50 text-amber-700'
                          }`}>
                            {b.payment?.status || 'Pending'}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() => setSelectedBooking(b)}
                            className="text-xs font-bold text-[#146C86] hover:text-[#0B3A53] cursor-pointer"
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* 3. PAYMENTS & GUIDE PAYOUTS TAB                                     */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'payouts' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-[#0B3A53] to-[#146C86] rounded-3xl p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 className="text-lg font-black tracking-tight">Guide Settlement & Payout Engine</h2>
              <p className="text-xs text-white/80 max-w-xl mt-1 leading-relaxed">
                TourLink automatically calculates a 15% platform commission and sets aside 85% net earnings for licensed guides upon verified tourist completion.
              </p>
            </div>
            <div className="flex gap-4">
              <div className="bg-white/10 rounded-2xl p-4 border border-white/10 text-center min-w-[120px]">
                <div className="text-[10px] font-bold uppercase text-white/70">Total Net Earned</div>
                <div className="text-xl font-black text-emerald-300 mt-0.5">${displayGuideAccrued.toFixed(2)}</div>
              </div>
              <div className="bg-white/10 rounded-2xl p-4 border border-white/10 text-center min-w-[120px]">
                <div className="text-[10px] font-bold uppercase text-white/70">Pending Disbursement</div>
                <div className="text-xl font-black text-amber-300 mt-0.5">${displayPayoutsPending.toFixed(2)}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-black text-[#0B3A53] text-sm">Disbursement Ledger</h3>
                <p className="text-[11px] text-slate-400">List of bookings with allocated guide net earnings</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-wider">
                    <th className="px-5 py-3.5 text-left">Booking Ref</th>
                    <th className="px-5 py-3.5 text-left">Guide Account</th>
                    <th className="px-5 py-3.5 text-left">Customer Paid</th>
                    <th className="px-5 py-3.5 text-left">Fee (15%)</th>
                    <th className="px-5 py-3.5 text-left">Net to Guide</th>
                    <th className="px-5 py-3.5 text-left">Payout Status</th>
                    <th className="px-5 py-3.5 text-left">Payout Reference</th>
                    <th className="px-5 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bookings.map((b) => {
                    const isPaidOut = b.payout?.status === 'Completed';
                    return (
                      <tr key={b.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-5 py-4 font-mono font-bold text-[#0B3A53]">{b.id}</td>
                        <td className="px-5 py-4">
                          <div className="font-bold text-[#0B3A53]">{b.guideName}</div>
                          <div className="text-[10px] text-slate-400">{b.guideEmail}</div>
                        </td>
                        <td className="px-5 py-4 font-bold text-slate-700">${b.totalAmount.toFixed(2)}</td>
                        <td className="px-5 py-4 text-teal-600 font-bold">${b.commissionAmount.toFixed(2)}</td>
                        <td className="px-5 py-4 font-black text-emerald-700 text-sm">${b.guideNetAmount.toFixed(2)}</td>
                        <td className="px-5 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                            isPaidOut ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                          }`}>
                            {isPaidOut ? 'Completed' : 'Pending'}
                          </span>
                        </td>
                        <td className="px-5 py-4 font-mono text-[11px] text-slate-500">
                          {b.payout?.payoutReference || '—'}
                        </td>
                        <td className="px-5 py-4 text-right">
                          {isPaidOut ? (
                            <span className="text-[11px] text-emerald-600 font-bold flex items-center justify-end gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Disbursed
                            </span>
                          ) : (
                            <button
                              onClick={() => handleOpenPayoutModal(b)}
                              className="bg-[#0B3A53] hover:bg-[#072537] text-white text-[10px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full shadow-xs cursor-pointer transition-all"
                            >
                              Process Payout
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* 4. TOUR OPERATIONS TAB                                               */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'operations' && (
        <div className="space-y-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search tour name, guide, destination…"
              value={opSearch}
              onChange={(e) => setOpSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#16A6A1]"
            />
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-wider">
                    {['Tour Name', 'Assigned Guide', 'Destination', 'Date', 'Capacity', 'Price', 'Status'].map((h) => (
                      <th key={h} className="px-5 py-3.5 text-left">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOps.map((op) => (
                    <tr key={op.id} className="hover:bg-slate-50/60">
                      <td className="px-5 py-4 font-bold text-[#0B3A53]">{op.tourName}</td>
                      <td className="px-5 py-4 font-semibold text-slate-700">{op.guideName}</td>
                      <td className="px-5 py-4 text-slate-500">{op.destination}</td>
                      <td className="px-5 py-4 font-mono text-[11px]">{op.startDate}</td>
                      <td className="px-5 py-4 font-semibold">{op.travelerCount}/{op.maxCapacity}</td>
                      <td className="px-5 py-4 font-bold text-emerald-700">${op.pricePerPerson}</td>
                      <td className="px-5 py-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-sky-50 text-sky-700 border border-sky-200">
                          {op.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* MODAL: ADD GUIDE ACCOUNT                                            */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {isGuideModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-black text-[#0B3A53]">Register New Guide Account</h2>
                <p className="text-xs text-slate-400">Creates both the user credentials and guide profile</p>
              </div>
              <button onClick={() => setIsGuideModalOpen(false)} className="p-1 rounded-full hover:bg-slate-100 cursor-pointer">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-500">Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Kasun Fernando"
                  value={guideForm.name}
                  onChange={(e) => setGuideForm({ ...guideForm, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:bg-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-500">Email Address (Login) *</label>
                <input
                  type="email"
                  placeholder="e.g. guide@tourlink.com"
                  value={guideForm.email}
                  onChange={(e) => setGuideForm({ ...guideForm, email: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:bg-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-500">Initial Password</label>
                <input
                  type="text"
                  value={guideForm.password}
                  onChange={(e) => setGuideForm({ ...guideForm, password: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:bg-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-500">Phone</label>
                <input
                  type="text"
                  placeholder="+94 77 123 4567"
                  value={guideForm.phone}
                  onChange={(e) => setGuideForm({ ...guideForm, phone: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            {/* Rates */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
              <div className="text-[11px] font-black uppercase text-[#0B3A53]">Standard Rates (USD)</div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Hourly</label>
                  <input
                    type="number"
                    value={guideForm.hourlyRate}
                    onChange={(e) => setGuideForm({ ...guideForm, hourlyRate: e.target.value })}
                    className="w-full p-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-[#0B3A53]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Half Day (4h)</label>
                  <input
                    type="number"
                    value={guideForm.halfDayRate}
                    onChange={(e) => setGuideForm({ ...guideForm, halfDayRate: e.target.value })}
                    className="w-full p-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-[#0B3A53]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Full Day (8h)</label>
                  <input
                    type="number"
                    value={guideForm.fullDayRate}
                    onChange={(e) => setGuideForm({ ...guideForm, fullDayRate: e.target.value })}
                    className="w-full p-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-emerald-700"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-500">Languages (comma-separated)</label>
              <input
                type="text"
                placeholder="English, Sinhala, German"
                value={guideForm.languages}
                onChange={(e) => setGuideForm({ ...guideForm, languages: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:bg-white focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-500">Specialties (comma-separated)</label>
              <input
                type="text"
                placeholder="Ancient Cities, Wildlife Safari, Hiking"
                value={guideForm.specialties}
                onChange={(e) => setGuideForm({ ...guideForm, specialties: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:bg-white focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-500">Bank / Payout Note</label>
              <input
                type="text"
                placeholder="Bank Name, Branch & Account number for disbursements"
                value={guideForm.payoutAccountNote}
                onChange={(e) => setGuideForm({ ...guideForm, payoutAccountNote: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:bg-white focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-500">Biography / Experience Overview</label>
              <textarea
                rows={3}
                placeholder="Licensed SLTDA guide credentials and career highlights..."
                value={guideForm.bio}
                onChange={(e) => setGuideForm({ ...guideForm, bio: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:bg-white focus:outline-none"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                onClick={() => setIsGuideModalOpen(false)}
                className="px-5 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateGuide}
                disabled={isSaving}
                className="bg-[#0B3A53] hover:bg-[#072537] text-white font-extrabold text-xs uppercase px-6 py-2.5 rounded-full shadow-md cursor-pointer disabled:opacity-50"
              >
                {isSaving ? 'Registering...' : 'Create Guide Account'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* MODAL: PROCESS GUIDE PAYOUT                                         */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {isPayoutModalOpen && payoutTargetBooking && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-black text-[#0B3A53]">Process Guide Payout</h2>
                <p className="text-xs text-slate-400">Booking #{payoutTargetBooking.id}</p>
              </div>
              <button onClick={() => setIsPayoutModalOpen(false)} className="p-1 rounded-full hover:bg-slate-100 cursor-pointer">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-emerald-800 font-bold">Guide Beneficiary:</span>
                <span className="text-xs text-[#0B3A53] font-black">{payoutTargetBooking.guideName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-emerald-800 font-bold">Total Customer Paid:</span>
                <span className="text-xs text-slate-700 font-semibold">${payoutTargetBooking.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-emerald-800 font-bold">Platform Fee (15%):</span>
                <span className="text-xs text-teal-700 font-semibold">${payoutTargetBooking.commissionAmount.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-emerald-200/60">
                <span className="text-sm font-black text-emerald-900">Net Disbursed to Guide:</span>
                <span className="text-base font-black text-emerald-700">${payoutTargetBooking.guideNetAmount.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-500">Payout Reference / Wire ID *</label>
              <input
                type="text"
                placeholder="e.g. BOC-WIRE-99214"
                value={payoutForm.payoutReference}
                onChange={(e) => setPayoutForm({ ...payoutForm, payoutReference: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-[#0B3A53] focus:bg-white focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-500">Payout Channel / Method</label>
              <select
                value={payoutForm.payoutMethod}
                onChange={(e) => setPayoutForm({ ...payoutForm, payoutMethod: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-[#0B3A53] focus:bg-white focus:outline-none"
              >
                <option value="Bank Transfer (BOC)">Bank Transfer (Bank of Ceylon)</option>
                <option value="Bank Transfer (Commercial Bank)">Bank Transfer (Commercial Bank)</option>
                <option value="Bank Transfer (HNB)">Bank Transfer (Hatton National Bank)</option>
                <option value="Wise Direct Payout">Wise Direct Payout</option>
                <option value="Cash Voucher">Cash Voucher</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-500">Settlement Notes</label>
              <input
                type="text"
                value={payoutForm.notes}
                onChange={(e) => setPayoutForm({ ...payoutForm, notes: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:bg-white focus:outline-none"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                onClick={() => setIsPayoutModalOpen(false)}
                className="px-5 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleProcessPayout}
                disabled={isSaving}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase px-6 py-2.5 rounded-full shadow-md cursor-pointer disabled:opacity-50"
              >
                {isSaving ? 'Processing...' : 'Confirm Payout'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* MODAL: BOOKING DETAIL VIEW                                          */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-black text-[#0B3A53]">Booking #{selectedBooking.id}</h2>
                <span className="text-[10px] font-bold text-slate-400">Placed on TourLink Platform</span>
              </div>
              <button onClick={() => setSelectedBooking(null)} className="p-1 rounded-full hover:bg-slate-100 cursor-pointer">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Guide Information</div>
                <div className="font-black text-[#0B3A53]">{selectedBooking.guideName}</div>
                <div className="text-slate-500">{selectedBooking.guideEmail}</div>
                <div className="text-slate-500">{selectedBooking.guidePhone}</div>
              </div>

              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Tourist Client</div>
                <div className="font-black text-[#0B3A53]">{selectedBooking.customerName}</div>
                <div className="text-slate-500">{selectedBooking.customerEmail}</div>
                <div className="text-slate-500">{selectedBooking.customerPhone || 'N/A'}</div>
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Travel Period:</span>
                <span className="font-bold text-[#0B3A53]">{selectedBooking.startDate} to {selectedBooking.endDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Service Hours:</span>
                <span className="font-bold text-[#0B3A53]">{selectedBooking.startTime} - {selectedBooking.endTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Traveler Group:</span>
                <span className="font-bold text-[#0B3A53]">{selectedBooking.travelers} Guests</span>
              </div>
              {selectedBooking.pickupLocation && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Pickup Location:</span>
                  <span className="font-bold text-slate-700">{selectedBooking.pickupLocation}</span>
                </div>
              )}
            </div>

            <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-3.5 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-600">Subtotal:</span>
                <span className="font-bold text-slate-800">${selectedBooking.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Service Fee:</span>
                <span className="font-bold text-slate-800">${selectedBooking.serviceFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-emerald-200">
                <span className="font-black text-emerald-900">Total Customer Charge:</span>
                <span className="font-black text-emerald-800">${selectedBooking.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-teal-800">
                <span>Platform Commission (15%):</span>
                <span>${selectedBooking.commissionAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-black text-emerald-700 pt-1 border-t border-emerald-200">
                <span>Net Guide Remittance (85%):</span>
                <span>${selectedBooking.guideNetAmount.toFixed(2)}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedBooking(null)}
                className="px-6 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* MODAL: GUIDE PROFILE DETAIL VIEW                                    */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {selectedGuide && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <img
                  src={selectedGuide.avatarUrl}
                  alt={selectedGuide.name}
                  className="w-12 h-12 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <h2 className="text-base font-black text-[#0B3A53]">{selectedGuide.name}</h2>
                  <div className="text-xs text-slate-500">{selectedGuide.email}</div>
                </div>
              </div>
              <button onClick={() => setSelectedGuide(null)} className="p-1 rounded-full hover:bg-slate-100 cursor-pointer">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <p className="text-slate-600 leading-relaxed">{selectedGuide.bio}</p>

              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1">
                <div className="font-bold text-slate-700">Rates:</div>
                <div className="flex gap-4 text-slate-600">
                  <span>Hourly: <strong>${selectedGuide.hourlyRate}</strong></span>
                  <span>Half Day: <strong>${selectedGuide.halfDayRate}</strong></span>
                  <span>Full Day: <strong>${selectedGuide.fullDayRate}</strong></span>
                </div>
              </div>

              {selectedGuide.coveredDestinations && selectedGuide.coveredDestinations.length > 0 && (
                <div className="space-y-1">
                  <div className="text-[10px] font-black uppercase text-slate-400">Covered Destinations</div>
                  <div className="flex flex-wrap gap-1">
                    {selectedGuide.coveredDestinations.map(d => (
                      <span key={d} className="bg-sky-50 text-sky-700 text-[10px] font-bold px-2 py-0.5 rounded-lg border border-sky-200/60">
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedGuide.payoutAccountNote && (
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-[11px]">
                  <span className="font-bold text-slate-700">Bank Note: </span>
                  <span className="text-slate-500">{selectedGuide.payoutAccountNote}</span>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedGuide(null)}
                className="px-6 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* API Notice */}
      {apiError && (
        <div className="fixed bottom-4 right-4 z-40 bg-amber-50 border border-amber-200 text-amber-700 text-[11px] font-bold px-4 py-2.5 rounded-2xl shadow-md flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {apiError}
        </div>
      )}

    </div>
  );
};
