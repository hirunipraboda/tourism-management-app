import React, { useState, useEffect } from 'react';
import { guideService } from '../../services/guideService';
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
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type TabId = 'guides' | 'operations' | 'availability';
type GuideStatus = 'Active' | 'Inactive' | 'Pending';
type OperationStatus = 'Scheduled' | 'Ongoing' | 'Completed' | 'Cancelled';

interface Guide {
  id: string;
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
// Mock Data
// ─────────────────────────────────────────────────────────────────────────────

const MOCK_GUIDES: Guide[] = [
  {
    id: 'guide-001',
    name: 'Kasun Perera',
    email: 'kasun.perera@travellink.lk',
    phone: '+94 77 123 4567',
    languages: ['English', 'Sinhala', 'Tamil'],
    specialties: ['Cultural Heritage', 'Temple History', 'Kandy City'],
    yearsExperience: 8,
    rating: 4.9,
    totalTours: 312,
    status: 'Active',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kasun',
    bio: 'Native Kandyan cultural historian with an Archaeology degree from Peradeniya University.',
    location: 'Kandy, Sri Lanka',
  },
  {
    id: 'guide-002',
    name: 'Suresh Kumar',
    email: 'suresh.kumar@travellink.lk',
    phone: '+94 76 234 5678',
    languages: ['English', 'Sinhala'],
    specialties: ['Mountain Hiking', 'Tea Estates', 'Ella Rock'],
    yearsExperience: 6,
    rating: 4.95,
    totalTours: 218,
    status: 'Active',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Suresh',
    bio: 'Certified mountain ranger and adventure specialist based in Ella highlands.',
    location: 'Ella, Sri Lanka',
  },
  {
    id: 'guide-003',
    name: 'Fatima Nazeer',
    email: 'fatima.nazeer@travellink.lk',
    phone: '+94 71 345 6789',
    languages: ['English', 'Sinhala', 'Arabic'],
    specialties: ['Galle Fort', 'Colonial Heritage', 'Coastal Towns'],
    yearsExperience: 5,
    rating: 4.88,
    totalTours: 176,
    status: 'Active',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fatima',
    bio: '4th generation Galle Fort local with expertise in Portuguese and Dutch maritime history.',
    location: 'Galle, Sri Lanka',
  },
  {
    id: 'guide-004',
    name: 'Dr. Jayatilleke',
    email: 'jaya.tilleke@travellink.lk',
    phone: '+94 72 456 7890',
    languages: ['English', 'Sinhala', 'French'],
    specialties: ['UNESCO Sites', 'Ancient Architecture', 'Sigiriya'],
    yearsExperience: 12,
    rating: 4.96,
    totalTours: 490,
    status: 'Active',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jaya',
    bio: 'Former researcher for the Central Cultural Fund with 12 years of expertise in King Kashyapa era.',
    location: 'Dambulla, Sri Lanka',
  },
  {
    id: 'guide-005',
    name: 'Bandara Herath',
    email: 'bandara.herath@travellink.lk',
    phone: '+94 75 567 8901',
    languages: ['English', 'Sinhala'],
    specialties: ['Wildlife Safari', 'Leopard Tracking', 'Bird Watching'],
    yearsExperience: 10,
    rating: 4.91,
    totalTours: 384,
    status: 'Inactive',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bandara',
    bio: 'Grew up on the borders of Yala National Park with expert knowledge of leopard territory.',
    location: 'Tissamaharama, Sri Lanka',
  },
  {
    id: 'guide-006',
    name: 'Nimal Rodrigo',
    email: 'nimal.rodrigo@travellink.lk',
    phone: '+94 70 678 9012',
    languages: ['English', 'Sinhala'],
    specialties: ['Whale Watching', 'Mirissa Coast', 'Marine Life'],
    yearsExperience: 4,
    rating: 4.72,
    totalTours: 99,
    status: 'Pending',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nimal',
    bio: 'Marine enthusiast and certified boat captain specialising in southern coastal experience.',
    location: 'Mirissa, Sri Lanka',
  },
];

const MOCK_OPERATIONS: TourOperation[] = [
  {
    id: 'op-001',
    tourName: 'Sri Lanka Highlights',
    guideName: 'Kasun Perera',
    guideId: 'guide-001',
    destination: 'Colombo → Kandy → Ella → Galle',
    startDate: '2026-09-25',
    endDate: '2026-10-01',
    travelerCount: 6,
    maxCapacity: 8,
    status: 'Scheduled',
    pricePerPerson: 480,
    duration: '7 Days / 6 Nights',
  },
  {
    id: 'op-002',
    tourName: 'Hill Country Escape',
    guideName: 'Suresh Kumar',
    guideId: 'guide-002',
    destination: 'Kandy → Nuwara Eliya → Ella',
    startDate: '2026-09-20',
    endDate: '2026-09-24',
    travelerCount: 4,
    maxCapacity: 4,
    status: 'Ongoing',
    pricePerPerson: 260,
    duration: '4 Days / 3 Nights',
  },
  {
    id: 'op-003',
    tourName: 'Sigiriya Ancient Fortress',
    guideName: 'Dr. Jayatilleke',
    guideId: 'guide-004',
    destination: 'Sigiriya, Dambulla',
    startDate: '2026-09-15',
    endDate: '2026-09-15',
    travelerCount: 10,
    maxCapacity: 12,
    status: 'Completed',
    pricePerPerson: 35,
    duration: '4 Hours',
  },
  {
    id: 'op-004',
    tourName: 'Southern Coast Journey',
    guideName: 'Fatima Nazeer',
    guideId: 'guide-003',
    destination: 'Galle → Mirissa → Unawatuna',
    startDate: '2026-10-05',
    endDate: '2026-10-09',
    travelerCount: 3,
    maxCapacity: 6,
    status: 'Scheduled',
    pricePerPerson: 310,
    duration: '5 Days / 4 Nights',
  },
  {
    id: 'op-005',
    tourName: 'Yala Wildlife Safari',
    guideName: 'Bandara Herath',
    guideId: 'guide-005',
    destination: 'Yala National Park',
    startDate: '2026-09-18',
    endDate: '2026-09-18',
    travelerCount: 7,
    maxCapacity: 8,
    status: 'Completed',
    pricePerPerson: 50,
    duration: '6 Hours',
  },
  {
    id: 'op-006',
    tourName: 'Kandy Cultural Escape',
    guideName: 'Kasun Perera',
    guideId: 'guide-001',
    destination: 'Kandy, Peradeniya',
    startDate: '2026-10-12',
    endDate: '2026-10-14',
    travelerCount: 0,
    maxCapacity: 8,
    status: 'Cancelled',
    pricePerPerson: 150,
    duration: '3 Days / 2 Nights',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Status Badge Helpers
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// Mock Availability Data
// ─────────────────────────────────────────────────────────────────────────────

const MOCK_AVAILABILITIES: AvailabilitySlotResponse[] = [
  { availabilityId: 101, guideId: 1, guideName: 'Kasun Perera', availableDate: '2026-10-15', startTime: '08:30:00', endTime: '16:30:00', isBooked: false },
  { availabilityId: 102, guideId: 1, guideName: 'Kasun Perera', availableDate: '2026-10-16', startTime: '09:00:00', endTime: '17:00:00', isBooked: true },
  { availabilityId: 103, guideId: 2, guideName: 'Suresh Kumar', availableDate: '2026-10-17', startTime: '07:00:00', endTime: '15:00:00', isBooked: false },
  { availabilityId: 104, guideId: 3, guideName: 'Fatima Nazeer', availableDate: '2026-10-18', startTime: '10:00:00', endTime: '18:00:00', isBooked: false },
  { availabilityId: 105, guideId: 4, guideName: 'Dr. Jayatilleke', availableDate: '2026-10-19', startTime: '08:00:00', endTime: '14:00:00', isBooked: true },
];

function parseNumericGuideId(id: string | number): number {
  if (typeof id === 'number') return id;
  const num = parseInt(id, 10);
  if (!isNaN(num) && num > 0) return num;
  try {
    const hex = parseInt(id.split('-')[0], 16);
    if (!isNaN(hex) && hex > 0) return hex;
  } catch {}
  return 1;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function guidToInt(guidStr: string): number {
  return parseNumericGuideId(guidStr);
}

const guideStatusStyle: Record<GuideStatus, string> = {
  Active: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  Inactive: 'bg-slate-100 text-slate-500 border border-slate-200',
  Pending: 'bg-amber-50 text-amber-600 border border-amber-200',
};

const operationStatusStyle: Record<OperationStatus, string> = {
  Scheduled: 'bg-sky-50 text-sky-700 border border-sky-200',
  Ongoing: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  Completed: 'bg-slate-100 text-slate-600 border border-slate-200',
  Cancelled: 'bg-rose-50 text-rose-600 border border-rose-200',
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Page Component
// ─────────────────────────────────────────────────────────────────────────────

export const AdminGuideToursPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('guides');
  const [guideSearch, setGuideSearch] = useState('');
  const [opSearch, setOpSearch] = useState('');
  const [guides, setGuides] = useState<Guide[]>(MOCK_GUIDES);
  const [operations, setOperations] = useState<TourOperation[]>(MOCK_OPERATIONS);
  const [isLoadingGuides, setIsLoadingGuides] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Guide Add Modal State
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const emptyGuideForm = { name: '', email: '', phone: '', bio: '', location: '', languages: '', specialties: '', yearsExperience: '' };
  const [guideForm, setGuideForm] = useState(emptyGuideForm);

  // Guide Edit Modal State
  const [editingGuide, setEditingGuide] = useState<Guide | null>(null);
  const [editForm, setEditForm] = useState(emptyGuideForm);

  // Operation Modal State
  const [isOpModalOpen, setIsOpModalOpen] = useState(false);
  const [opForm, setOpForm] = useState({
    tourName: '', guideName: '', guideNumericId: 0, destination: '',
    startDate: '', endDate: '', maxCapacity: '', pricePerPerson: '', duration: '',
    numberOfTourists: '',
  });

  // Detail view
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);

  // Availability State
  const [availabilities, setAvailabilities] = useState<AvailabilitySlotResponse[]>(MOCK_AVAILABILITIES);
  const [selectedGuideForAvail, setSelectedGuideForAvail] = useState<Guide | null>(null);
  const [isAvailManagerOpen, setIsAvailManagerOpen] = useState(false);
  const [isAddSlotModalOpen, setIsAddSlotModalOpen] = useState(false);
  const [availGuideFilter, setAvailGuideFilter] = useState('All');
  const [availDateFilter, setAvailDateFilter] = useState('');
  const [newSlotForm, setNewSlotForm] = useState({
    guideId: 0,
    availableDate: new Date().toISOString().split('T')[0],
    startTime: '09:00:00',
    endTime: '17:00:00',
  });

  // ── Load guides from real API on mount ────────────────────────────────────
  useEffect(() => {
    setIsLoadingGuides(true);
    guideService.getGuides()
      .then((apiGuides) => {
        // Map API shape → local Guide shape
        const mapped: Guide[] = apiGuides.map((g: any) => ({
          id: g.id ?? g.Id,
          name: g.name ?? g.Name,
          email: g.email ?? g.Email,
          phone: g.phone ?? g.Phone ?? 'N/A',
          languages: g.languages ?? g.Languages ?? [],
          specialties: g.specialties ?? g.Specialties ?? [],
          yearsExperience: g.yearsExperience ?? g.YearsExperience ?? 0,
          rating: g.rating ?? g.Rating ?? 0,
          totalTours: g.toursCompleted ?? g.ToursCompleted ?? 0,
          status: (g.status ?? g.Status) === 'Available' || (g.status ?? g.Status) === 'Assigned'
            ? 'Active' : (g.status ?? g.Status ?? 'Active'),
          verificationStatus: g.verificationStatus ?? g.VerificationStatus ?? 'Pending',
          avatarUrl: g.avatarUrl ?? g.AvatarUrl ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${g.name ?? g.Name}`,
          bio: g.bio ?? g.Bio ?? '',
          location: g.location ?? g.Location ?? 'Sri Lanka',
        }));
        setGuides(mapped.length > 0 ? mapped : MOCK_GUIDES);
        setApiError(null);
      })
      .catch(() => {
        // API not reachable — keep mock data, show a soft notice
        setApiError('Running on local data — backend not reachable.');
      })
      .finally(() => setIsLoadingGuides(false));
  }, []);

  // ── Filtered lists ────────────────────────────────────────────────────────
  const filteredGuides = guides.filter((g) =>
    g.name.toLowerCase().includes(guideSearch.toLowerCase()) ||
    g.location.toLowerCase().includes(guideSearch.toLowerCase()) ||
    g.specialties.some((s) => s.toLowerCase().includes(guideSearch.toLowerCase()))
  );

  const filteredOps = operations.filter((op) =>
    op.tourName.toLowerCase().includes(opSearch.toLowerCase()) ||
    op.guideName.toLowerCase().includes(opSearch.toLowerCase()) ||
    op.destination.toLowerCase().includes(opSearch.toLowerCase())
  );

  // ── Handlers ──────────────────────────────────────────────────────────────

  // CREATE — calls POST /api/v1/guides
  const handleAddGuide = async () => {
    if (!guideForm.name || !guideForm.email) return;
    const payload = {
      name: guideForm.name,
      email: guideForm.email,
      phone: guideForm.phone || null,
      bio: guideForm.bio || null,
      languages: guideForm.languages.split(',').map((l) => l.trim()).filter(Boolean),
      specialties: guideForm.specialties.split(',').map((s) => s.trim()).filter(Boolean),
      yearsExperience: Number(guideForm.yearsExperience) || null,
      avatarUrl: null,
    };
    setIsSaving(true);
    try {
      const created: any = await guideService.createGuide(payload);
      const newGuide: Guide = {
        id: created.id ?? created.Id ?? `guide-${Date.now()}`,
        name: created.name ?? payload.name,
        email: created.email ?? payload.email,
        phone: created.phone ?? payload.phone ?? 'N/A',
        languages: created.languages ?? payload.languages,
        specialties: created.specialties ?? payload.specialties,
        yearsExperience: created.yearsExperience ?? Number(guideForm.yearsExperience) ?? 0,
        rating: 0,
        totalTours: 0,
        status: 'Pending',
        verificationStatus: 'Pending',
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${payload.name}`,
        bio: created.bio ?? payload.bio ?? '',
        location: guideForm.location || 'Sri Lanka',
      };
      setGuides([newGuide, ...guides]);
    } catch {
      // API failed — add locally so UI stays responsive
      const fallback: Guide = {
        id: `guide-${Date.now()}`,
        name: payload.name, email: payload.email,
        phone: payload.phone ?? 'N/A',
        languages: payload.languages, specialties: payload.specialties,
        yearsExperience: Number(guideForm.yearsExperience) || 0,
        rating: 0, totalTours: 0, status: 'Pending', verificationStatus: 'Pending',
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${payload.name}`,
        bio: payload.bio ?? '', location: guideForm.location || 'Sri Lanka',
      };
      setGuides([fallback, ...guides]);
    } finally {
      setIsSaving(false);
      setGuideForm(emptyGuideForm);
      setIsGuideModalOpen(false);
    }
  };

  // OPEN EDIT — pre-fill form with existing guide data
  const handleOpenEdit = (guide: Guide) => {
    setEditingGuide(guide);
    setEditForm({
      name: guide.name,
      email: guide.email,
      phone: guide.phone,
      bio: guide.bio,
      location: guide.location,
      languages: guide.languages.join(', '),
      specialties: guide.specialties.join(', '),
      yearsExperience: String(guide.yearsExperience),
    });
  };

  // UPDATE — calls PUT /api/v1/guides/{id}
  const handleUpdateGuide = async () => {
    if (!editingGuide || !editForm.name || !editForm.email) return;
    const payload = {
      name: editForm.name,
      email: editForm.email,
      phone: editForm.phone || 'N/A',
      bio: editForm.bio || '',
      languages: editForm.languages.split(',').map((l) => l.trim()).filter(Boolean),
      specialties: editForm.specialties.split(',').map((s) => s.trim()).filter(Boolean),
      yearsExperience: Number(editForm.yearsExperience) || 0,
      avatarUrl: editingGuide.avatarUrl,
    };
    setIsSaving(true);
    try {
      await guideService.updateGuide(editingGuide.id, payload);
    } catch { /* update UI regardless */ }
    finally {
      setGuides(guides.map((g) =>
        g.id === editingGuide.id
          ? { ...g, ...payload }
          : g
      ));
      if (selectedGuide?.id === editingGuide.id) {
        setSelectedGuide((prev) => prev ? { ...prev, ...payload } : null);
      }
      setEditingGuide(null);
      setIsSaving(false);
    }
  };

  // DEACTIVATE — calls DELETE /api/v1/guides/{id}
  const handleToggleGuideStatus = async (id: string) => {
    const guide = guides.find((g) => g.id === id);
    if (!guide) return;
    const nextStatus: GuideStatus = guide.status === 'Active' ? 'Inactive' : 'Active';
    // Optimistic UI update
    setGuides(guides.map((g) => g.id === id ? { ...g, status: nextStatus } : g));
    try {
      if (nextStatus === 'Inactive') {
        await guideService.deactivateGuide(id);
      }
    } catch { /* already updated UI — ignore */ }
  };

  // VERIFY — calls PATCH /api/v1/guides/{id}/verification
  const handleVerifyGuide = async (id: string, verification: 'Verified' | 'Rejected') => {
    const newStatus: GuideStatus = verification === 'Verified' ? 'Active' : 'Inactive';
    setGuides(guides.map((g) => g.id === id ? { ...g, status: newStatus, verificationStatus: verification } : g));
    if (selectedGuide?.id === id) {
      setSelectedGuide((prev) => prev ? { ...prev, status: newStatus, verificationStatus: verification } : null);
    }
    try {
      await guideService.verifyGuide(id, verification);
    } catch { /* optimistic update already applied */ }
  };

  // ADD OPERATION — calls POST /api/v1/tour-operations
  const handleAddOperation = async () => {
    if (!opForm.tourName || !opForm.guideNumericId) return;
    const tourists   = Number(opForm.numberOfTourists) || Number(opForm.maxCapacity) || 1;
    const price      = Number(opForm.pricePerPerson) || 0;
    const totalCost  = price * tourists;
    const scheduled  = opForm.startDate ? `${opForm.startDate}T08:00:00Z` : new Date().toISOString();

    // Optimistic UI update so the row appears immediately
    const optimistic: TourOperation = {
      id: `op-${Date.now()}`,
      tourName: opForm.tourName,
      guideName: opForm.guideName,
      guideId: String(opForm.guideNumericId),
      destination: opForm.destination,
      startDate: opForm.startDate,
      endDate: opForm.endDate,
      travelerCount: tourists,
      maxCapacity: Number(opForm.maxCapacity) || tourists,
      status: 'Scheduled',
      pricePerPerson: price,
      duration: opForm.duration,
    };
    setOperations([optimistic, ...operations]);
    setOpForm({ tourName: '', guideName: '', guideNumericId: 0, destination: '', startDate: '', endDate: '', maxCapacity: '', pricePerPerson: '', duration: '', numberOfTourists: '' });
    setIsOpModalOpen(false);

    try {
      await tourOperationService.create({
        tourPackageId: 1, // will be replaced when TourPackage picker is added
        guideId: opForm.guideNumericId,
        scheduledDate: scheduled,
        numberOfTourists: tourists,
        totalCost,
        notes: opForm.destination,
      });
    } catch (err) {
      console.error('Failed to save operation to DB:', err);
    }
  };

  // ── Stats ─────────────────────────────────────────────────────────────────
  const activeGuides = guides.filter((g) => g.status === 'Active').length;
  const pendingGuides = guides.filter((g) => g.status === 'Pending').length;
  const ongoingOps = operations.filter((o) => o.status === 'Ongoing').length;
  const scheduledOps = operations.filter((o) => o.status === 'Scheduled').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">

      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0B3A53] font-heading tracking-tight">
            Guide & Tour Operations
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Manage licensed guides, availability slots, and coordinate active tour operations across Sri Lanka.
          </p>
        </div>

        <button
          onClick={() => {
            if (activeTab === 'guides') setIsGuideModalOpen(true);
            else if (activeTab === 'operations') setIsOpModalOpen(true);
            else {
              const defaultGuideId = guides.length > 0 ? parseNumericGuideId(guides[0].id) : 1;
              setNewSlotForm({
                guideId: defaultGuideId,
                availableDate: new Date().toISOString().split('T')[0],
                startTime: '09:00:00',
                endTime: '17:00:00',
              });
              setIsAddSlotModalOpen(true);
            }
          }}
          className="bg-[#0B3A53] hover:bg-[#072537] text-white font-extrabold text-xs uppercase tracking-wider px-6 py-3.5 rounded-full shadow-md transition-all cursor-pointer flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-[#16A6A1]" />
          <span>
            {activeTab === 'guides' ? 'Add New Guide' : activeTab === 'operations' ? 'Create Operation' : 'Add Availability Slot'}
          </span>
        </button>
      </div>

      {/* ── Summary Stats ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Guides', value: activeGuides, icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Pending Approval', value: pendingGuides, icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Ongoing Tours', value: ongoingOps, icon: Route, color: 'text-sky-600', bg: 'bg-sky-50' },
          { label: 'Availability Slots', value: availabilities.length, icon: Calendar, color: 'text-[#16A6A1]', bg: 'bg-[#16A6A1]/10' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center shrink-0`}>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <div className="text-2xl font-black text-[#0B3A53]">{stat.value}</div>
                <div className="text-[11px] font-semibold text-slate-500 leading-tight">{stat.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Tabs ──────────────────────────────────────────────────────────── */}
      <div className="flex gap-1 bg-slate-100/80 rounded-2xl p-1 w-fit border border-slate-200/60">
        {([
          { id: 'guides', label: 'Guides', icon: Users },
          { id: 'operations', label: 'Tour Operations', icon: Package },
          { id: 'availability', label: 'Availability Slots', icon: Calendar },
        ] as { id: TabId; label: string; icon: any }[]).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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
      {/* GUIDES TAB                                                          */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'guides' && (
        <div className="space-y-4">
          {/* Search */}
          <div className="relative max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search guides, location, specialty…"
              value={guideSearch}
              onChange={(e) => setGuideSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#16A6A1] focus:ring-2 focus:ring-[#16A6A1]/10"
            />
          </div>

          {/* Guide Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredGuides.map((guide) => (
              <div
                key={guide.id}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all overflow-hidden"
              >
                {/* Card Header */}
                <div className="bg-gradient-to-br from-[#0B3A53] to-[#146C86] p-5 relative">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={guide.avatarUrl}
                        alt={guide.name}
                        className="w-14 h-14 rounded-full border-2 border-white/30 bg-white/20 object-cover"
                      />
                      <div>
                        <h3 className="text-sm font-black text-white leading-tight">{guide.name}</h3>
                        <div className="flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-[#16A6A1]" />
                          <span className="text-[10px] font-semibold text-white/70">{guide.location}</span>
                        </div>
                      </div>
                    </div>
                    <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${guideStatusStyle[guide.status]}`}>
                      {guide.status}
                    </span>
                  </div>

                  {/* Rating & Experience */}
                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span className="text-xs font-black text-white">{guide.rating > 0 ? guide.rating.toFixed(2) : 'New'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-[#16A6A1]" />
                      <span className="text-xs font-semibold text-white/80">{guide.yearsExperience} yrs exp.</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Route className="w-3.5 h-3.5 text-[#16A6A1]" />
                      <span className="text-xs font-semibold text-white/80">{guide.totalTours} tours</span>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 space-y-3">
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{guide.bio}</p>

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

                  {/* Actions */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    {/* Verify buttons — only shown for Pending guides */}
                    {guide.verificationStatus === 'Pending' || guide.status === 'Pending' ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleVerifyGuide(guide.id, 'Verified')}
                          className="flex-1 py-1.5 rounded-xl text-[10px] font-black bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 cursor-pointer transition-colors"
                        >
                          ✓ Approve
                        </button>
                        <button
                          onClick={() => handleVerifyGuide(guide.id, 'Rejected')}
                          className="flex-1 py-1.5 rounded-xl text-[10px] font-black bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 cursor-pointer transition-colors"
                        >
                          ✕ Reject
                        </button>
                      </div>
                    ) : null}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedGuide(guide)}
                          className="flex items-center gap-1.5 text-xs font-bold text-[#146C86] hover:text-[#0B3A53] transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" /> View
                        </button>
                        <button
                          onClick={() => handleOpenEdit(guide)}
                          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#0B3A53] transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button
                          onClick={() => {
                            setSelectedGuideForAvail(guide);
                            setIsAvailManagerOpen(true);
                            const numId = parseNumericGuideId(guide.id);
                            guideAvailabilityService.getByGuide(numId)
                              .then((slots) => {
                                if (slots && slots.length > 0) {
                                  setAvailabilities((prev) => [
                                    ...prev.filter((s) => s.guideId !== numId),
                                    ...slots,
                                  ]);
                                }
                              })
                              .catch(() => {});
                          }}
                          className="flex items-center gap-1 text-[11px] font-bold text-teal-600 hover:text-teal-700 bg-teal-50 px-2 py-1 rounded-lg border border-teal-200/60 transition-colors cursor-pointer"
                          title="Manage Availability Slots"
                        >
                          <Calendar className="w-3 h-3" /> Slots
                        </button>
                      </div>
                      <button
                        onClick={() => handleToggleGuideStatus(guide.id)}
                        className={`px-3.5 py-1.5 rounded-xl text-[10px] font-black cursor-pointer transition-colors ${
                          guide.status === 'Active'
                            ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                            : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                        }`}
                      >
                        {guide.status === 'Active' ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* OPERATIONS TAB                                                      */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'operations' && (
        <div className="space-y-4">
          {/* Search */}
          <div className="relative max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search tour name, guide, destination…"
              value={opSearch}
              onChange={(e) => setOpSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#16A6A1] focus:ring-2 focus:ring-[#16A6A1]/10"
            />
          </div>

          {/* Operations Table */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    {['Tour Name', 'Guide', 'Destination', 'Dates', 'Travelers', 'Revenue', 'Status', ''].map((h) => (
                      <th key={h} className="px-5 py-3.5 text-left text-[10px] font-black uppercase tracking-wider text-slate-400">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOps.map((op) => {
                    const totalRevenue = op.travelerCount * op.pricePerPerson;
                    return (
                      <tr key={op.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-5 py-4">
                          <div className="font-black text-[#0B3A53]">{op.tourName}</div>
                          <div className="text-[10px] text-slate-400 font-semibold mt-0.5 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {op.duration}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-[#16A6A1]/10 flex items-center justify-center shrink-0">
                              <Users className="w-3.5 h-3.5 text-[#16A6A1]" />
                            </div>
                            <span className="font-bold text-slate-700">{op.guideName}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1 text-slate-600 font-semibold max-w-[160px]">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{op.destination}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="font-bold text-slate-700">{op.startDate}</div>
                          {op.endDate !== op.startDate && (
                            <div className="text-[10px] text-slate-400 font-semibold">→ {op.endDate}</div>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5">
                            <div
                              className="h-1.5 rounded-full bg-[#16A6A1]/20 overflow-hidden"
                              style={{ width: '48px' }}
                            >
                              <div
                                className="h-full bg-[#16A6A1] rounded-full"
                                style={{ width: `${op.maxCapacity > 0 ? (op.travelerCount / op.maxCapacity) * 100 : 0}%` }}
                              />
                            </div>
                            <span className="font-bold text-slate-700">{op.travelerCount}/{op.maxCapacity}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1 font-black text-[#0B3A53]">
                            <DollarSign className="w-3 h-3 text-[#16A6A1]" />
                            {totalRevenue.toLocaleString()}
                          </div>
                          <div className="text-[10px] text-slate-400 font-semibold">${op.pricePerPerson}/person</div>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${operationStatusStyle[op.status]}`}>
                            {op.status}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => alert(`Editing operation: ${op.tourName}`)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setOperations(operations.filter((o) => o.id !== op.id))}
                              className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-500 cursor-pointer transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredOps.length === 0 && (
              <div className="py-16 flex flex-col items-center gap-3 text-slate-400">
                <Package className="w-10 h-10 opacity-30" />
                <p className="text-xs font-bold">No tour operations found.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* AVAILABILITY SLOTS TAB                                              */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'availability' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Filter Guide</label>
                <select
                  value={availGuideFilter}
                  onChange={(e) => setAvailGuideFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-[#0B3A53] focus:bg-white focus:outline-none"
                >
                  <option value="All">All Guides</option>
                  {guides.map((g) => (
                    <option key={g.id} value={g.name}>{g.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Filter Date</label>
                <input
                  type="date"
                  value={availDateFilter}
                  onChange={(e) => setAvailDateFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-[#0B3A53] focus:bg-white focus:outline-none"
                />
              </div>
              {availDateFilter && (
                <button
                  onClick={() => setAvailDateFilter('')}
                  className="text-[11px] text-teal-600 font-bold self-end mb-1 hover:underline cursor-pointer"
                >
                  Clear Date
                </button>
              )}
            </div>

            <button
              onClick={() => {
                const defaultGuideId = guides.length > 0 ? parseNumericGuideId(guides[0].id) : 1;
                setNewSlotForm({
                  guideId: defaultGuideId,
                  availableDate: new Date().toISOString().split('T')[0],
                  startTime: '09:00:00',
                  endTime: '17:00:00',
                });
                setIsAddSlotModalOpen(true);
              }}
              className="bg-teal-600 hover:bg-teal-700 text-white font-black text-xs uppercase px-5 py-2.5 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" /> Add Slot
            </button>
          </div>

          {/* Slots Table */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    {['Guide', 'Date', 'Time Window', 'Status', 'Actions'].map((h) => (
                      <th key={h} className="px-5 py-3.5 text-left text-[10px] font-black uppercase tracking-wider text-slate-400">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {availabilities
                    .filter((slot) => {
                      const matchesGuide = availGuideFilter === 'All' || slot.guideName.toLowerCase().includes(availGuideFilter.toLowerCase());
                      const matchesDate = !availDateFilter || slot.availableDate === availDateFilter;
                      return matchesGuide && matchesDate;
                    })
                    .map((slot) => (
                      <tr key={slot.availabilityId} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-teal-50 border border-teal-200 text-teal-700 font-bold flex items-center justify-center text-xs shrink-0">
                              {slot.guideName.charAt(0)}
                            </div>
                            <div>
                              <div className="font-black text-[#0B3A53]">{slot.guideName}</div>
                              <div className="text-[10px] text-slate-400 font-semibold">Guide #{slot.guideId}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5 font-bold text-slate-700">
                            <Calendar className="w-3.5 h-3.5 text-teal-600" />
                            {slot.availableDate}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5 text-slate-600 font-semibold">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {slot.startTime.substring(0, 5)} – {slot.endTime.substring(0, 5)}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                            slot.isBooked
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}>
                            {slot.isBooked ? 'Booked' : 'Available'}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <button
                            onClick={async () => {
                              try {
                                await guideAvailabilityService.delete(slot.guideId, slot.availabilityId);
                              } catch {}
                              setAvailabilities((prev) => prev.filter((s) => s.availabilityId !== slot.availabilityId));
                            }}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-500 cursor-pointer transition-colors"
                            title="Delete Slot"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {availabilities.length === 0 && (
              <div className="py-16 flex flex-col items-center gap-3 text-slate-400">
                <Calendar className="w-10 h-10 opacity-30" />
                <p className="text-xs font-bold">No availability slots scheduled.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* ADD GUIDE MODAL                                                     */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {isGuideModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] shadow-2xl border border-slate-200 overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between rounded-t-3xl">
              <div>
                <span className="text-[10px] font-black uppercase text-[#16A6A1]">GUIDE MANAGEMENT</span>
                <h3 className="text-lg font-black text-[#0B3A53] font-heading">Register New Guide</h3>
              </div>
              <button
                onClick={() => setIsGuideModalOpen(false)}
                className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Full Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Full Name *', key: 'name', placeholder: 'e.g. Kasun Perera' },
                  { label: 'Email Address *', key: 'email', placeholder: 'e.g. kasun@gmail.com' },
                ].map(({ label, key, placeholder }) => (
                  <div key={key} className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-500">{label}</label>
                    <input
                      type="text"
                      placeholder={placeholder}
                      value={(guideForm as any)[key]}
                      onChange={(e) => setGuideForm({ ...guideForm, [key]: e.target.value })}
                      className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-[#0B3A53] focus:bg-white focus:border-[#16A6A1] focus:outline-none focus:ring-2 focus:ring-[#16A6A1]/10"
                    />
                  </div>
                ))}
              </div>

              {/* Phone & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Phone Number', key: 'phone', placeholder: '+94 77 xxx xxxx' },
                  { label: 'Base Location', key: 'location', placeholder: 'e.g. Kandy, Sri Lanka' },
                ].map(({ label, key, placeholder }) => (
                  <div key={key} className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-500">{label}</label>
                    <input
                      type="text"
                      placeholder={placeholder}
                      value={(guideForm as any)[key]}
                      onChange={(e) => setGuideForm({ ...guideForm, [key]: e.target.value })}
                      className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-[#0B3A53] focus:bg-white focus:border-[#16A6A1] focus:outline-none focus:ring-2 focus:ring-[#16A6A1]/10"
                    />
                  </div>
                ))}
              </div>

              {/* Languages & Specialties */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-500">Languages (comma separated)</label>
                <input
                  type="text"
                  placeholder="English, Sinhala, Tamil"
                  value={guideForm.languages}
                  onChange={(e) => setGuideForm({ ...guideForm, languages: e.target.value })}
                  className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-[#0B3A53] focus:bg-white focus:border-[#16A6A1] focus:outline-none focus:ring-2 focus:ring-[#16A6A1]/10"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-500">Specialties (comma separated)</label>
                <input
                  type="text"
                  placeholder="Cultural Heritage, Temple History, Wildlife"
                  value={guideForm.specialties}
                  onChange={(e) => setGuideForm({ ...guideForm, specialties: e.target.value })}
                  className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-[#0B3A53] focus:bg-white focus:border-[#16A6A1] focus:outline-none focus:ring-2 focus:ring-[#16A6A1]/10"
                />
              </div>

              {/* Years Experience */}
              <div className="space-y-1 max-w-[180px]">
                <label className="text-[10px] font-black uppercase text-slate-500">Years of Experience</label>
                <input
                  type="number"
                  placeholder="e.g. 5"
                  value={guideForm.yearsExperience}
                  onChange={(e) => setGuideForm({ ...guideForm, yearsExperience: e.target.value })}
                  className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-[#0B3A53] focus:bg-white focus:border-[#16A6A1] focus:outline-none focus:ring-2 focus:ring-[#16A6A1]/10"
                />
              </div>

              {/* Bio */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-500">Short Bio</label>
                <textarea
                  rows={3}
                  placeholder="Brief description of the guide's background and expertise…"
                  value={guideForm.bio}
                  onChange={(e) => setGuideForm({ ...guideForm, bio: e.target.value })}
                  className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-[#0B3A53] focus:bg-white focus:border-[#16A6A1] focus:outline-none focus:ring-2 focus:ring-[#16A6A1]/10 resize-none"
                />
              </div>

              {/* NOVA Info */}
              <div className="p-3.5 rounded-2xl bg-[#16A6A1]/10 border border-[#16A6A1]/20 flex items-center gap-3">
                <Sparkles className="w-4 h-4 text-[#16A6A1] shrink-0" />
                <span className="text-[10px] font-bold text-[#0B3A53]">
                  This guide will be available for assignment to Tour Operations after admin approval.
                </span>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setIsGuideModalOpen(false)}
                  className="px-6 py-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddGuide}
                  disabled={!guideForm.name || !guideForm.email}
                  className="bg-[#0B3A53] hover:bg-[#072537] disabled:opacity-50 text-white font-extrabold text-xs uppercase tracking-wider px-8 py-3.5 rounded-full shadow-md cursor-pointer transition-all flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#16A6A1]" />
                  Register Guide
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* ADD OPERATION MODAL                                                 */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {isOpModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] shadow-2xl border border-slate-200 overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between rounded-t-3xl">
              <div>
                <span className="text-[10px] font-black uppercase text-[#16A6A1]">TOUR OPERATIONS</span>
                <h3 className="text-lg font-black text-[#0B3A53] font-heading">Create New Operation</h3>
              </div>
              <button
                onClick={() => setIsOpModalOpen(false)}
                className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Tour Name */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-500">Tour Package Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Sri Lanka Highlights"
                  value={opForm.tourName}
                  onChange={(e) => setOpForm({ ...opForm, tourName: e.target.value })}
                  className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-[#0B3A53] focus:bg-white focus:border-[#16A6A1] focus:outline-none focus:ring-2 focus:ring-[#16A6A1]/10"
                />
              </div>

              {/* Guide & Destination */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-500">Assign Guide *</label>
                  <select
                    value={opForm.guideNumericId}
                    onChange={(e) => {
                      const selected = guides.find((g) => String(g.id) === e.target.value);
                      const numericId = selected ? guidToInt(selected.id) : 0;
                      setOpForm({ ...opForm, guideNumericId: numericId, guideName: selected?.name ?? '' });
                    }}
                    className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-[#0B3A53] focus:bg-white focus:border-[#16A6A1] focus:outline-none focus:ring-2 focus:ring-[#16A6A1]/10 cursor-pointer"
                  >
                    <option value={0}>Select a guide…</option>
                    {guides.filter((g) => g.status === 'Active').map((g) => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-500">Destination Route</label>
                  <input
                    type="text"
                    placeholder="e.g. Kandy → Ella → Galle"
                    value={opForm.destination}
                    onChange={(e) => setOpForm({ ...opForm, destination: e.target.value })}
                    className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-[#0B3A53] focus:bg-white focus:border-[#16A6A1] focus:outline-none focus:ring-2 focus:ring-[#16A6A1]/10"
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-500">Start Date</label>
                  <input
                    type="date"
                    value={opForm.startDate}
                    onChange={(e) => setOpForm({ ...opForm, startDate: e.target.value })}
                    className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-[#0B3A53] focus:bg-white focus:border-[#16A6A1] focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-500">End Date</label>
                  <input
                    type="date"
                    value={opForm.endDate}
                    onChange={(e) => setOpForm({ ...opForm, endDate: e.target.value })}
                    className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-[#0B3A53] focus:bg-white focus:border-[#16A6A1] focus:outline-none"
                  />
                </div>
              </div>

              {/* Capacity, Price, Duration */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Max Capacity', key: 'maxCapacity', placeholder: '10', type: 'number' },
                  { label: 'Price / Person ($)', key: 'pricePerPerson', placeholder: '480', type: 'number' },
                  { label: 'Duration', key: 'duration', placeholder: '7 Days', type: 'text' },
                ].map(({ label, key, placeholder, type }) => (
                  <div key={key} className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-500">{label}</label>
                    <input
                      type={type}
                      placeholder={placeholder}
                      value={(opForm as any)[key]}
                      onChange={(e) => setOpForm({ ...opForm, [key]: e.target.value })}
                      className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-[#0B3A53] focus:bg-white focus:border-[#16A6A1] focus:outline-none focus:ring-2 focus:ring-[#16A6A1]/10"
                    />
                  </div>
                ))}
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setIsOpModalOpen(false)}
                  className="px-6 py-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddOperation}
                  disabled={!opForm.tourName || !opForm.guideNumericId}
                  className="bg-[#16A6A1] hover:bg-[#146C86] disabled:opacity-50 text-white font-extrabold text-xs uppercase tracking-wider px-8 py-3.5 rounded-full shadow-md cursor-pointer transition-all flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Create Operation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* GUIDE PROFILE DETAIL MODAL                                         */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {selectedGuide && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-br from-[#0B3A53] to-[#146C86] p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <img
                    src={selectedGuide.avatarUrl}
                    alt={selectedGuide.name}
                    className="w-16 h-16 rounded-full border-2 border-white/30 bg-white/10 object-cover"
                  />
                  <div>
                    <h3 className="text-base font-black text-white">{selectedGuide.name}</h3>
                    <div className="flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-[#16A6A1]" />
                      <span className="text-xs text-white/70 font-semibold">{selectedGuide.location}</span>
                    </div>
                    <span className={`inline-block mt-1.5 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${guideStatusStyle[selectedGuide.status]}`}>
                      {selectedGuide.status}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedGuide(null)}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3 mt-5">
                {[
                  { label: 'Rating', value: selectedGuide.rating > 0 ? `${selectedGuide.rating}★` : 'New', icon: Star },
                  { label: 'Experience', value: `${selectedGuide.yearsExperience} yrs`, icon: Award },
                  { label: 'Tours Done', value: selectedGuide.totalTours, icon: Route },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="bg-white/10 rounded-2xl p-3 text-center">
                    <Icon className="w-4 h-4 text-[#16A6A1] mx-auto mb-1" />
                    <div className="text-sm font-black text-white">{value}</div>
                    <div className="text-[10px] text-white/60 font-semibold">{label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <div>
                <div className="text-[10px] font-black uppercase text-slate-400 mb-1">About</div>
                <p className="text-xs text-slate-600 leading-relaxed">{selectedGuide.bio}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-[10px] font-black uppercase text-slate-400 mb-1.5">Contact</div>
                  <div className="text-xs font-semibold text-slate-700">{selectedGuide.email}</div>
                  <div className="text-xs font-semibold text-slate-700 mt-0.5">{selectedGuide.phone}</div>
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase text-slate-400 mb-1.5">Languages</div>
                  <div className="flex flex-wrap gap-1">
                    {selectedGuide.languages.map((l) => (
                      <span key={l} className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-lg">{l}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-[10px] font-black uppercase text-slate-400 mb-1.5">Specialties</div>
                <div className="flex flex-wrap gap-1">
                  {selectedGuide.specialties.map((s) => (
                    <span key={s} className="bg-[#16A6A1]/10 text-[#0B3A53] text-[10px] font-bold px-2.5 py-1 rounded-xl">{s}</span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                {selectedGuide && (selectedGuide.verificationStatus === 'Pending' || selectedGuide.status === 'Pending') && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleVerifyGuide(selectedGuide.id, 'Verified')}
                      className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 font-black text-[10px] cursor-pointer transition-colors"
                    >
                      ✓ Approve Guide
                    </button>
                    <button
                      onClick={() => handleVerifyGuide(selectedGuide.id, 'Rejected')}
                      className="px-4 py-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 font-black text-[10px] cursor-pointer transition-colors"
                    >
                      ✕ Reject
                    </button>
                  </div>
                )}
                {selectedGuide && selectedGuide.status !== 'Pending' && selectedGuide.verificationStatus !== 'Pending' && (
                  <button
                    onClick={() => { handleOpenEdit(selectedGuide); setSelectedGuide(null); }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Edit Profile
                  </button>
                )}
                <button
                  onClick={() => setSelectedGuide(null)}
                  className="px-6 py-3 rounded-full bg-[#0B3A53] hover:bg-[#072537] text-white font-bold text-xs cursor-pointer transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* EDIT GUIDE MODAL                                                    */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {editingGuide && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] shadow-2xl border border-slate-200 overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between rounded-t-3xl">
              <div>
                <span className="text-[10px] font-black uppercase text-[#16A6A1]">GUIDE MANAGEMENT</span>
                <h3 className="text-lg font-black text-[#0B3A53] font-heading">Edit Guide Profile</h3>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Updating: {editingGuide.name}</p>
              </div>
              <button onClick={() => setEditingGuide(null)} className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Full Name *', key: 'name', placeholder: 'e.g. Kasun Perera' },
                  { label: 'Email Address *', key: 'email', placeholder: 'e.g. kasun@gmail.com' },
                  { label: 'Phone Number', key: 'phone', placeholder: '+94 77 xxx xxxx' },
                  { label: 'Base Location', key: 'location', placeholder: 'e.g. Kandy, Sri Lanka' },
                ].map(({ label, key, placeholder }) => (
                  <div key={key} className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-500">{label}</label>
                    <input
                      type="text"
                      placeholder={placeholder}
                      value={(editForm as any)[key]}
                      onChange={(e) => setEditForm({ ...editForm, [key]: e.target.value })}
                      className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-[#0B3A53] focus:bg-white focus:border-[#16A6A1] focus:outline-none focus:ring-2 focus:ring-[#16A6A1]/10"
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-500">Languages (comma separated)</label>
                <input type="text" placeholder="English, Sinhala, Tamil" value={editForm.languages}
                  onChange={(e) => setEditForm({ ...editForm, languages: e.target.value })}
                  className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-[#0B3A53] focus:bg-white focus:border-[#16A6A1] focus:outline-none focus:ring-2 focus:ring-[#16A6A1]/10" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-500">Specialties (comma separated)</label>
                <input type="text" placeholder="Cultural Heritage, Temple History" value={editForm.specialties}
                  onChange={(e) => setEditForm({ ...editForm, specialties: e.target.value })}
                  className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-[#0B3A53] focus:bg-white focus:border-[#16A6A1] focus:outline-none focus:ring-2 focus:ring-[#16A6A1]/10" />
              </div>
              <div className="space-y-1 max-w-[180px]">
                <label className="text-[10px] font-black uppercase text-slate-500">Years of Experience</label>
                <input type="number" placeholder="e.g. 5" value={editForm.yearsExperience}
                  onChange={(e) => setEditForm({ ...editForm, yearsExperience: e.target.value })}
                  className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-[#0B3A53] focus:bg-white focus:border-[#16A6A1] focus:outline-none focus:ring-2 focus:ring-[#16A6A1]/10" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-500">Short Bio</label>
                <textarea rows={3} placeholder="Brief description…" value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-[#0B3A53] focus:bg-white focus:border-[#16A6A1] focus:outline-none focus:ring-2 focus:ring-[#16A6A1]/10 resize-none" />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button onClick={() => setEditingGuide(null)} className="px-6 py-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs cursor-pointer">
                  Cancel
                </button>
                <button
                  onClick={handleUpdateGuide}
                  disabled={isSaving || !editForm.name || !editForm.email}
                  className="bg-[#0B3A53] hover:bg-[#072537] disabled:opacity-50 text-white font-extrabold text-xs uppercase tracking-wider px-8 py-3.5 rounded-full shadow-md cursor-pointer transition-all flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#16A6A1]" />
                  {isSaving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* GUIDE AVAILABILITY MANAGER MODAL                                    */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {isAvailManagerOpen && selectedGuideForAvail && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="bg-gradient-to-br from-[#0B3A53] to-[#146C86] p-6 text-white flex items-start justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={selectedGuideForAvail.avatarUrl}
                  alt={selectedGuideForAvail.name}
                  className="w-12 h-12 rounded-full border border-white/30 object-cover"
                />
                <div>
                  <span className="text-[10px] font-black uppercase text-[#16A6A1]">AVAILABILITY SLOTS</span>
                  <h3 className="text-base font-black">{selectedGuideForAvail.name}</h3>
                  <p className="text-xs text-white/70">{selectedGuideForAvail.location}</p>
                </div>
              </div>
              <button
                onClick={() => { setIsAvailManagerOpen(false); setSelectedGuideForAvail(null); }}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              {/* Add New Slot Inline */}
              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3">
                <div className="text-xs font-black text-[#0B3A53] uppercase">Add New Working Slot</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">Date</label>
                    <input
                      type="date"
                      value={newSlotForm.availableDate}
                      onChange={(e) => setNewSlotForm({ ...newSlotForm, availableDate: e.target.value })}
                      className="w-full p-2 bg-white rounded-xl border border-slate-200 text-xs font-bold text-[#0B3A53]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">Start Time</label>
                    <input
                      type="time"
                      value={newSlotForm.startTime}
                      onChange={(e) => setNewSlotForm({ ...newSlotForm, startTime: e.target.value })}
                      className="w-full p-2 bg-white rounded-xl border border-slate-200 text-xs font-bold text-[#0B3A53]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">End Time</label>
                    <input
                      type="time"
                      value={newSlotForm.endTime}
                      onChange={(e) => setNewSlotForm({ ...newSlotForm, endTime: e.target.value })}
                      className="w-full p-2 bg-white rounded-xl border border-slate-200 text-xs font-bold text-[#0B3A53]"
                    />
                  </div>
                </div>
                <button
                  onClick={async () => {
                    const numGuideId = parseNumericGuideId(selectedGuideForAvail.id);
                    const payload = {
                      guideId: numGuideId,
                      availableDate: newSlotForm.availableDate,
                      startTime: newSlotForm.startTime.includes(':') && newSlotForm.startTime.split(':').length === 2 ? `${newSlotForm.startTime}:00` : newSlotForm.startTime,
                      endTime: newSlotForm.endTime.includes(':') && newSlotForm.endTime.split(':').length === 2 ? `${newSlotForm.endTime}:00` : newSlotForm.endTime,
                    };
                    try {
                      const created = await guideAvailabilityService.create(numGuideId, payload);
                      setAvailabilities([created, ...availabilities]);
                    } catch {
                      const optimisticSlot: AvailabilitySlotResponse = {
                        availabilityId: Date.now(),
                        guideId: numGuideId,
                        guideName: selectedGuideForAvail.name,
                        availableDate: payload.availableDate,
                        startTime: payload.startTime,
                        endTime: payload.endTime,
                        isBooked: false,
                      };
                      setAvailabilities([optimisticSlot, ...availabilities]);
                    }
                  }}
                  className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-black text-xs uppercase rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Save Slot
                </button>
              </div>

              {/* Existing Slots */}
              <div className="space-y-2">
                <div className="text-xs font-black text-slate-500 uppercase tracking-wider">Scheduled Slots</div>
                {availabilities.filter((s) => s.guideId === parseNumericGuideId(selectedGuideForAvail.id) || s.guideName.toLowerCase() === selectedGuideForAvail.name.toLowerCase()).length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-xs">No availability slots recorded for this guide.</div>
                ) : (
                  availabilities
                    .filter((s) => s.guideId === parseNumericGuideId(selectedGuideForAvail.id) || s.guideName.toLowerCase() === selectedGuideForAvail.name.toLowerCase())
                    .map((slot) => (
                      <div key={slot.availabilityId} className="flex items-center justify-between p-3.5 bg-white border border-slate-200/80 rounded-2xl shadow-2xs">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200/70 text-teal-700 flex items-center justify-center">
                            <Clock className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-[#0B3A53]">{slot.availableDate}</div>
                            <div className="text-[11px] text-slate-500 font-semibold">{slot.startTime.substring(0, 5)} – {slot.endTime.substring(0, 5)}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${slot.isBooked ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
                            {slot.isBooked ? 'Booked' : 'Available'}
                          </span>
                          <button
                            onClick={async () => {
                              try {
                                await guideAvailabilityService.delete(slot.guideId, slot.availabilityId);
                              } catch {}
                              setAvailabilities((prev) => prev.filter((s) => s.availabilityId !== slot.availabilityId));
                            }}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                            title="Remove Slot"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => { setIsAvailManagerOpen(false); setSelectedGuideForAvail(null); }}
                className="px-6 py-2.5 rounded-full bg-[#0B3A53] text-white font-bold text-xs cursor-pointer hover:bg-[#072537]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* GLOBAL ADD AVAILABILITY SLOT MODAL                                  */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {isAddSlotModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase text-[#16A6A1]">DISPATCH ENGINE</span>
                <h3 className="text-lg font-black text-[#0B3A53] font-heading">Add Guide Availability Slot</h3>
              </div>
              <button onClick={() => setIsAddSlotModalOpen(false)} className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-500">Select Guide *</label>
                <select
                  value={newSlotForm.guideId}
                  onChange={(e) => setNewSlotForm({ ...newSlotForm, guideId: Number(e.target.value) })}
                  className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-[#0B3A53] focus:bg-white focus:outline-none"
                >
                  {guides.map((g) => (
                    <option key={g.id} value={parseNumericGuideId(g.id)}>{g.name} ({g.location})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-500">Date *</label>
                <input
                  type="date"
                  value={newSlotForm.availableDate}
                  onChange={(e) => setNewSlotForm({ ...newSlotForm, availableDate: e.target.value })}
                  className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-[#0B3A53] focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-500">Start Time *</label>
                  <input
                    type="time"
                    value={newSlotForm.startTime}
                    onChange={(e) => setNewSlotForm({ ...newSlotForm, startTime: e.target.value })}
                    className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-[#0B3A53] focus:bg-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-500">End Time *</label>
                  <input
                    type="time"
                    value={newSlotForm.endTime}
                    onChange={(e) => setNewSlotForm({ ...newSlotForm, endTime: e.target.value })}
                    className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-[#0B3A53] focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  onClick={() => setIsAddSlotModalOpen(false)}
                  className="px-6 py-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    const guideObj = guides.find((g) => parseNumericGuideId(g.id) === newSlotForm.guideId) || guides[0];
                    const numGuideId = newSlotForm.guideId || (guideObj ? parseNumericGuideId(guideObj.id) : 1);
                    const payload = {
                      guideId: numGuideId,
                      availableDate: newSlotForm.availableDate,
                      startTime: newSlotForm.startTime.includes(':') && newSlotForm.startTime.split(':').length === 2 ? `${newSlotForm.startTime}:00` : newSlotForm.startTime,
                      endTime: newSlotForm.endTime.includes(':') && newSlotForm.endTime.split(':').length === 2 ? `${newSlotForm.endTime}:00` : newSlotForm.endTime,
                    };
                    try {
                      const created = await guideAvailabilityService.create(numGuideId, payload);
                      setAvailabilities([created, ...availabilities]);
                    } catch {
                      const optimisticSlot: AvailabilitySlotResponse = {
                        availabilityId: Date.now(),
                        guideId: numGuideId,
                        guideName: guideObj?.name || 'Licensed Guide',
                        availableDate: payload.availableDate,
                        startTime: payload.startTime,
                        endTime: payload.endTime,
                        isBooked: false,
                      };
                      setAvailabilities([optimisticSlot, ...availabilities]);
                    }
                    setIsAddSlotModalOpen(false);
                  }}
                  className="bg-[#0B3A53] hover:bg-[#072537] text-white font-extrabold text-xs uppercase px-8 py-3.5 rounded-full shadow-md cursor-pointer transition-all"
                >
                  Add Slot
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* API notice banner */}
      {apiError && (
        <div className="fixed bottom-4 right-4 z-40 bg-amber-50 border border-amber-200 text-amber-700 text-[11px] font-bold px-4 py-2.5 rounded-2xl shadow-md flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {apiError}
        </div>
      )}

    </div>
  );
};
