import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Compass,
  Plus,
  ArrowRight,
  Calendar,
  Users,
  MapPin,
  Clock,
  Sparkles,
  CheckCircle2,
  X,
  ChevronRight,
  Filter,
  Check,
  TrendingUp,
  Bot,
  Camera,
  Tag,
  Car,
  Trash2,
  AlertTriangle,
  Building2,
  FileText,
  Receipt,
  Search,
} from 'lucide-react';
import { LandingNavbar } from '../components/navigation/LandingNavbar';
import { Footer } from '../components/navigation/Footer';
import { MOCK_USER_TRIPS, UserTrip, TripDayItinerary, TripActivityDetail, TripBookingDetail } from '../mock/tripsData';
import { AIBotGuideModal } from '../components/guide/AIBotGuideModal';
import { BookingConfirmationReceiptModal } from '../components/staycations/BookingConfirmationReceiptModal';
import { tripService } from '../services/tripService';
import {
  getTripTimeline,
  getItineraryDayTimelineStatus,
  getActivityTimelineStatus,
  getTransportTimelineStatus,
  formatTripDateRange,
} from '../utils/tripTimeline';

export const TripsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const normalizeTrip = (t: UserTrip): UserTrip => {
    const timeline = getTripTimeline(
      t.startDate || t.dates,
      t.endDate || t.dates,
      t.status
    );

    const updatedDailyItinerary = t.dailyItinerary?.map((day) => {
      const dayStatus = getItineraryDayTimelineStatus(day.date);
      const updatedActivities = day.activities?.map((act) => ({
        ...act,
        activityStatus: getActivityTimelineStatus(day.date, act.time),
      }));

      return {
        ...day,
        status: dayStatus,
        activities: updatedActivities || [],
      };
    });

    return {
      ...t,
      status: timeline.status,
      timelineLabel: timeline.timelineLabel,
      startDate: timeline.startDate ? timeline.startDate.toISOString().split('T')[0] : t.startDate,
      endDate: timeline.endDate ? timeline.endDate.toISOString().split('T')[0] : t.endDate,
      duration: `${timeline.totalDays} Days`,
      isFeatured: t.isFeatured || timeline.status === 'Ongoing',
      dailyItinerary: updatedDailyItinerary || t.dailyItinerary,
    };
  };

  // Deleted trips tracker (persisted in localStorage)
  const getDeletedTripIds = (): Set<string> => {
    try {
      const deleted = localStorage.getItem('nova_deleted_trip_ids');
      if (deleted) return new Set(JSON.parse(deleted));
    } catch {}
    return new Set();
  };

  // State Management
  const [trips, setTrips] = useState<UserTrip[]>(() => {
    const deletedIds = getDeletedTripIds();
    const saved = localStorage.getItem('nova_user_trips');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const normalized: UserTrip[] = parsed.map(normalizeTrip);
          const existingIds = new Set(normalized.map((t: UserTrip) => t.id));
          const uniqueMocks = MOCK_USER_TRIPS.filter((t) => !existingIds.has(t.id));
          return [...normalized, ...uniqueMocks].filter((t) => !deletedIds.has(t.id));
        }
      } catch (e) {
        console.error('Failed to parse saved trips', e);
      }
    }
    return MOCK_USER_TRIPS.filter((t) => !deletedIds.has(t.id));
  });

  useEffect(() => {
    let isMounted = true;

    // Primary Source of Truth: Fetch from PostgreSQL backend
    const loadBackendTrips = async () => {
      try {
        const deletedIds = getDeletedTripIds();
        const serverTrips = await tripService.getUserTrips('U001');

        // Also retrieve any local trips in localStorage to ensure newly planned trips are visible immediately
        const savedRaw = localStorage.getItem('nova_user_trips');
        let localSaved: UserTrip[] = [];
        if (savedRaw) {
          try {
            const p = JSON.parse(savedRaw);
            if (Array.isArray(p)) localSaved = p.map(normalizeTrip);
          } catch {}
        }

        const combined = [...localSaved, ...serverTrips.map(normalizeTrip)];
        const seenIds = new Set<string>();
        const deduped: UserTrip[] = [];
        for (const t of combined) {
          if (!seenIds.has(t.id) && !deletedIds.has(t.id)) {
            seenIds.add(t.id);
            deduped.push(t);
          }
        }

        const existingIds = new Set(deduped.map((t) => t.id));
        const uniqueMocks = MOCK_USER_TRIPS.filter((t) => !existingIds.has(t.id) && !deletedIds.has(t.id));
        if (isMounted) {
          setTrips([...deduped, ...uniqueMocks]);
        }
      } catch (e) {
        console.warn('Failed to load trips from backend, keeping cached state', e);
      }
    };
    loadBackendTrips();

    const syncTrips = () => {
      const deletedIds = getDeletedTripIds();
      const saved = localStorage.getItem('nova_user_trips');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const normalized: UserTrip[] = parsed.map(normalizeTrip);
            const existingIds = new Set(normalized.map((t: UserTrip) => t.id));
            const uniqueMocks = MOCK_USER_TRIPS.filter((t) => !existingIds.has(t.id));
            setTrips([...normalized, ...uniqueMocks].filter((t) => !deletedIds.has(t.id)));
            return;
          }
        } catch (e) {
          console.error('Failed to parse saved trips', e);
        }
      }
      setTrips(MOCK_USER_TRIPS.filter((t) => !deletedIds.has(t.id)));
    };

    window.addEventListener('storage', syncTrips);
    return () => {
      isMounted = false;
      window.removeEventListener('storage', syncTrips);
    };
  }, []);

  const [activeTab, setActiveTab] = useState<'All' | 'Upcoming' | 'Planning' | 'Ongoing' | 'Completed'>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handledHighlightRef = useRef<string | null>(null);

  // Open saved trip modal and show toast ONLY ONCE when redirected from AI/Manual Trip Planner
  useEffect(() => {
    const targetId = location.state?.highlightedTripId;
    if (targetId && handledHighlightRef.current !== targetId) {
      const foundTrip = trips.find((t) => t.id === targetId);
      if (foundTrip) {
        handledHighlightRef.current = targetId;
        setSelectedTripModal(foundTrip);
        if (location.state?.message) {
          triggerToast(location.state.message);
        }
        // Clear React Router location state so subsequent tab clicks never re-trigger modal opening
        navigate(location.pathname, { replace: true, state: {} });
      }
    }
  }, [location.state, trips, navigate, location.pathname]);

  // Modals State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTripModal, setSelectedTripModal] = useState<UserTrip | null>(null);
  const [tripToDelete, setTripToDelete] = useState<UserTrip | null>(null);
  const [isAIBotModalOpen, setIsAIBotModalOpen] = useState(false);
  const [activeReceiptBooking, setActiveReceiptBooking] = useState<{
    booking: TripBookingDetail;
    tripName: string;
  } | null>(null);

  // Handle Delete Trip (restricted to 'Planning' and 'Upcoming')
  const handleDeleteTrip = (tripId: string) => {
    const targetTrip = trips.find((t) => t.id === tripId);
    if (!targetTrip) return;

    if (targetTrip.status !== 'Planning' && targetTrip.status !== 'Upcoming') {
      return;
    }

    setTrips((prev) => prev.filter((t) => t.id !== tripId));

    // Delete in PostgreSQL backend
    tripService.deleteTrip(tripId).catch((err) => console.warn('Backend delete sync failed:', err));

    // Save to deleted IDs set
    const deletedIds = getDeletedTripIds();
    deletedIds.add(tripId);
    localStorage.setItem('nova_deleted_trip_ids', JSON.stringify(Array.from(deletedIds)));

    // Update localStorage user trips if present
    try {
      const saved = localStorage.getItem('nova_user_trips');
      if (saved) {
        const parsed: UserTrip[] = JSON.parse(saved);
        const filtered = parsed.filter((t) => t.id !== tripId);
        localStorage.setItem('nova_user_trips', JSON.stringify(filtered));
      }
    } catch (e) {
      console.error('Failed to update localStorage trips on delete', e);
    }

    if (selectedTripModal?.id === tripId) {
      setSelectedTripModal(null);
    }
    setTripToDelete(null);
  };

  // Manual Trip Planner Wizard State
  const [plannerStep, setPlannerStep] = useState<number>(1);
  const [manualDestination, setManualDestination] = useState<string>('Kandy');
  const [manualTripName, setManualTripName] = useState<string>('Kandy Heritage Trail');
  const [manualDuration, setManualDuration] = useState<string>('4 Days');
  const [manualDates, setManualDates] = useState<string>('15 – 19 October 2026');
  const [manualTravelersType, setManualTravelersType] = useState<string>('Couple');
  const [manualTravelersCount, setManualTravelersCount] = useState<number>(2);
  const [manualTravelStyle, setManualTravelStyle] = useState<string>('Balanced');
  const [manualInterests, setManualInterests] = useState<string[]>(['Culture', 'Nature']);
  
  // Transport & Guide Preferences
  const [manualTransportMode, setManualTransportMode] = useState<'Private' | 'Public' | 'None'>('Private');
  const [manualVehicle, setManualVehicle] = useState<string>('');
  const [manualHireGuide, setManualHireGuide] = useState<boolean>(true);
  const [manualGuideType, setManualGuideType] = useState<string>('Local Guide');
  
  // Budget Range
  const [manualBudgetTier, setManualBudgetTier] = useState<string>('Moderate');
  const [manualMinBudget, setManualMinBudget] = useState<number>(250);
  const [manualMaxBudget, setManualMaxBudget] = useState<number>(600);

  // Manual Itinerary Builder State
  const [manualItinerary, setManualItinerary] = useState<
    { day: number; title: string; morning: string; afternoon: string; evening: string; location: string }[]
  >([
    {
      day: 1,
      title: 'Arrival & Scenic Exploration',
      morning: 'Morning arrival & hotel check-in',
      afternoon: 'Explore local historical sites & town center',
      evening: 'Lakeside dinner & sunset stroll',
      location: 'City Center',
    },
    {
      day: 2,
      title: 'Heritage & Nature Trail',
      morning: 'Guided visit to ancient temple / landmark',
      afternoon: 'Tea factory or nature trail walk',
      evening: 'Cultural dance show & local dinner',
      location: 'Highland Ridge',
    },
    {
      day: 3,
      title: 'Mountain Panorama & Artisan Markets',
      morning: 'Morning panoramic viewpoint hike',
      afternoon: 'Local artisan shopping & souvenir stop',
      evening: 'Farewell dinner & relaxation',
      location: 'Scenic Viewpoint',
    },
  ]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const getRecommendedVehicle = (count: number) => {
    if (count <= 3) return 'Sedan';
    if (count <= 6) return 'SUV / Large SUV';
    if (count <= 12) return 'Minivan';
    return 'Mini Coach';
  };

  const currentManualVehicle = manualVehicle || getRecommendedVehicle(manualTravelersCount);

  // Filtered Trips List
  const filteredTrips = useMemo(() => {
    let list = trips;
    if (activeTab === 'Planning') {
      list = trips.filter((t) => t.status === 'Planning');
    } else if (activeTab === 'Upcoming') {
      list = trips.filter((t) => t.status === 'Upcoming' || t.status === 'Planning');
    } else if (activeTab !== 'All') {
      list = trips.filter((t) => t.status === activeTab);
    }

    const q = searchQuery.trim().toLowerCase();
    if (!q) return list;

    return list.filter((t) => {
      // Trip title / name
      if (t.name?.toLowerCase().includes(q)) return true;
      // Destination
      if (t.destination?.toLowerCase().includes(q)) return true;
      // Interests
      if (t.interests?.some((i) => i.toLowerCase().includes(q))) return true;
      // Notes
      if (t.notes?.toLowerCase().includes(q)) return true;
      // Dates
      if (t.dates?.toLowerCase().includes(q)) return true;
      // Status
      if (t.status?.toLowerCase().includes(q)) return true;
      // Bookings: Hotel provider, confirmation code, destination
      if (t.bookingsList?.some((b) => 
        b.provider?.toLowerCase().includes(q) ||
        b.confirmationCode?.toLowerCase().includes(q) ||
        b.destination?.toLowerCase().includes(q)
      )) return true;
      // Itinerary activity titles or places
      if (t.dailyItinerary?.some((d) => 
        d.title?.toLowerCase().includes(q) || 
        d.activities?.some((a) => a.title?.toLowerCase().includes(q) || a.location?.toLowerCase().includes(q))
      )) return true;
      return false;
    });
  }, [trips, activeTab, searchQuery]);

  // Featured Trip (Primary active or ongoing trip - prioritizes Ongoing)
  const featuredTrip = useMemo(() => {
    return trips.find((t) => t.status === 'Ongoing') || trips.find((t) => t.isFeatured) || trips[0];
  }, [trips]);

  const handleManualTripSubmit = async () => {
    if (!manualDestination.trim()) {
      triggerToast('Please enter a destination for your trip.');
      return;
    }

    const fallbackImg = featuredTrip?.imageUrl || 'https://images.unsplash.com/photo-1588598198321-9735fd52455b?w=800&auto=format&fit=crop&q=80';
    let savedTripId = `trip-manual-${Date.now()}`;
    const tripTitle = manualTripName || `${manualDestination} Journey`;

    try {
      const res = await tripService.createTrip({
        tripName: tripTitle,
        destination: `${manualDestination}, Sri Lanka`,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 5 * 86400000).toISOString(),
        numberOfTravelers: manualTravelersCount,
        budget: manualMaxBudget,
        interests: manualInterests.length > 0 ? manualInterests : ['Cultural'],
        tripStyle: manualTransportMode === 'Private' ? 'Private Vehicle' : 'Public Transport',
      });
      if (res?.data?.id || (res as any)?.id) {
        savedTripId = res?.data?.id || (res as any)?.id;
      }
    } catch (apiErr) {
      console.warn('Backend save for manual modal trip fallback:', apiErr);
    }

    const createdTrip: UserTrip = {
      id: savedTripId,
      name: tripTitle,
      destination: `${manualDestination}, Sri Lanka`,
      destinationId: manualDestination.toLowerCase().includes('sigiriya')
        ? 'sigiriya'
        : manualDestination.toLowerCase().includes('galle')
        ? 'galle'
        : manualDestination.toLowerCase().includes('mirissa')
        ? 'mirissa'
        : 'kandy',
      dates: manualDates || '15 – 19 October 2026',
      duration: manualDuration,
      travelers: manualTravelersCount,
      travelerNames: ['Sanath Wickramasinghe', 'Anula Wickramasinghe'],
      status: 'Planning',
      imageUrl: fallbackImg,
      budget: `$${manualMinBudget} – $${manualMaxBudget}`,
      spentBudget: '$0',
      interests: manualInterests,
      notes: `Transport: ${manualTransportMode === 'Private' ? currentManualVehicle : 'Public'}. Guide: ${manualHireGuide ? manualGuideType : 'Self-guided'}.`,
      weatherForecast: '25°C · Pleasant & Mild',
      progress: {
        destination: true,
        preferences: true,
        aiPlanning: true,
        itinerary: true,
        bookings: false,
      },
      dailyItinerary: manualItinerary.map((d) => ({
        day: d.day,
        date: `Day ${d.day}`,
        title: d.title,
        activities: [
          {
            time: '09:00 AM',
            title: d.morning,
            location: d.location,
            description: `Planned morning schedule for ${d.title}`,
            status: 'Planned',
            type: 'Sightseeing',
          },
          {
            time: '02:00 PM',
            title: d.afternoon,
            location: d.location,
            description: `Planned afternoon activity`,
            status: 'Planned',
            type: 'Activity',
          },
          {
            time: '07:00 PM',
            title: d.evening,
            location: d.location,
            description: `Evening dining or relaxation`,
            status: 'Planned',
            type: 'Dining',
          },
        ],
      })),
    };

    const updatedTrips = [createdTrip, ...trips.filter((t) => t.id !== savedTripId)];
    setTrips(updatedTrips);
    try {
      localStorage.setItem('nova_user_trips', JSON.stringify(updatedTrips));
      window.dispatchEvent(new Event('storage'));
    } catch {}
    setIsCreateModalOpen(false);
    setPlannerStep(1);
    triggerToast(`🎉 Created new manual trip: ${createdTrip.name}!`);
  };

  const toggleManualInterest = (interest: string) => {
    if (manualInterests.includes(interest)) {
      setManualInterests(manualInterests.filter((i) => i !== interest));
    } else {
      setManualInterests([...manualInterests, interest]);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-[#16A6A1]/20 selection:text-[#0B3A53] flex flex-col">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-[#0B3A53] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-white/15 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#16A6A1]" />
            <span className="text-xs font-bold tracking-wide">{toastMessage}</span>
          </div>
        </div>
      )}

      {/* NAVBAR */}
      <LandingNavbar />

      {/* 3. PAGE HERO */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-8">
        {/* Subtle Ambient Background Atmosphere */}
        <div className="absolute top-20 right-1/4 w-80 h-36 bg-[#16A6A1]/10 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-16 left-10 w-72 h-36 bg-sky-400/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-slate-200/80 pb-8">
          <div className="space-y-2 max-w-2xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#0B3A53] tracking-tight font-heading leading-tight">
              Your Journeys
            </h1>

            <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
              Every trip has a story. Keep your itineraries, active travels, and memories organized in one seamless place.
            </p>
          </div>

          {/* Primary CTA */}
          <button
            onClick={() => navigate('/plan-trip')}
            className="inline-flex items-center justify-center gap-2 bg-[#0B3A53] hover:bg-[#08293B] text-white font-black text-xs uppercase tracking-wider px-6 py-3.5 rounded-2xl shadow-lg shadow-[#0B3A53]/25 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer group shrink-0"
          >
            <Plus className="w-4 h-4 text-white group-hover:rotate-90 transition-transform duration-300" />
            <span>Plan a New Trip</span>
          </button>
        </div>
      </div>

      {/* 4. TRIP STATUS NAVIGATION (TABS) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <div className="flex items-center gap-8 overflow-x-auto border-b border-slate-200/60 no-scrollbar">
          {(['All', 'Upcoming', 'Planning', 'Ongoing', 'Completed'] as const).map((tab) => {
            const isActive = activeTab === tab;
            const count =
              tab === 'All'
                ? trips.length
                : tab === 'Planning'
                ? trips.filter((t) => t.status === 'Planning').length
                : tab === 'Upcoming'
                ? trips.filter((t) => t.status === 'Upcoming' || t.status === 'Planning').length
                : trips.filter((t) => t.status === tab).length;

            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`py-3 text-sm font-bold transition-all cursor-pointer whitespace-nowrap relative flex items-center gap-2 ${
                  isActive
                    ? 'text-[#0B3A53] font-black border-b-2 border-[#0B3A53]'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>{tab}</span>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-[#0B3A53] text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5 & 6. FEATURED / UPCOMING OR ONGOING TRIP CARD */}
      {(activeTab === 'All' || activeTab === 'Ongoing') && featuredTrip && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="bg-white rounded-3xl overflow-hidden border border-slate-200/70 shadow-sm hover:shadow-md transition-all group grid grid-cols-1 lg:grid-cols-12">
            {/* Left Destination Photography */}
            <div className="lg:col-span-6 relative h-64 lg:h-auto overflow-hidden bg-slate-100">
              <img
                src={featuredTrip.imageUrl}
                alt={featuredTrip.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent lg:hidden" />

              <div className="absolute top-4 left-4 px-3.5 py-1.5 rounded-full bg-slate-950/85 backdrop-blur-md text-emerald-400 text-xs font-black uppercase tracking-wider border border-emerald-500/30 flex items-center gap-2 shadow-lg">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
                </span>
                <span>PRIMARY JOURNEY {featuredTrip.status === 'Ongoing' ? '· ONGOING' : ''}</span>
              </div>
            </div>

            {/* Right Trip Details & Progress */}
            <div className="lg:col-span-6 p-6 sm:p-10 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-[#146C86]">
                    {featuredTrip.destination}
                  </span>
                  {featuredTrip.status === 'Ongoing' ? (
                    <span className="px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-black border border-emerald-300 flex items-center gap-1.5 shadow-2xs">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Ongoing</span>
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full bg-[#16A6A1]/10 text-[#146C86] text-xs font-bold border border-[#16A6A1]/20">
                      {featuredTrip.status}
                    </span>
                  )}
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-[#0B3A53] font-heading leading-snug">
                  {featuredTrip.name}
                </h2>

                <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500 pt-1">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-[#16A6A1]" />
                    <span>{featuredTrip.dates}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[#16A6A1]" />
                    <span>{featuredTrip.duration}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-[#16A6A1]" />
                    <span>{featuredTrip.travelers} Travelers</span>
                  </span>
                </div>

                {featuredTrip.budget && (
                  <div className="pt-2">
                    <span className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-extrabold border border-slate-200/60">
                      Budget: {featuredTrip.budget}
                    </span>
                  </div>
                )}

                {/* Staycation Confirmed Receipt Banner inside Featured Trip Card */}
                {(() => {
                  const stayBookings = featuredTrip.bookingsList?.filter((b) => b.type === 'Hotel') || [];
                  if (stayBookings.length === 0) return null;

                  return (
                    <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-emerald-50/50 p-3 rounded-2xl border border-emerald-200/60">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
                          <Building2 className="w-4 h-4" />
                        </span>
                        <div>
                          <span className="text-xs font-extrabold text-slate-800 block">
                            Confirmed Staycation: {stayBookings[0].provider}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            Ref: {stayBookings[0].confirmationCode} · {stayBookings[0].amount}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setActiveReceiptBooking({
                            booking: stayBookings[0],
                            tripName: featuredTrip.name,
                          })
                        }
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow-xs"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        <span>View Confirmation Receipt</span>
                      </button>
                    </div>
                  );
                })()}

                {/* 6. ONGOING JOURNEY LIVE DETAILS OR PLANNING PROGRESS */}
                {featuredTrip.status === 'Ongoing' ? (
                  <div className="pt-4 border-t border-slate-100 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-extrabold text-[#0B3A53] uppercase tracking-wider flex items-center gap-1.5">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                        </span>
                        <span>Ongoing Journey Live Status</span>
                      </span>
                      <span className="text-[11px] font-black text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-full border border-emerald-300">
                        {featuredTrip.timelineLabel || 'Happening Today'}
                      </span>
                    </div>

                    {/* Day-by-Day Live Progress Cards dynamically derived from itinerary days */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-left">
                      {(featuredTrip.dailyItinerary && featuredTrip.dailyItinerary.length > 0
                        ? featuredTrip.dailyItinerary.slice(0, 3)
                        : [
                            { day: 1, date: featuredTrip.dates, title: 'Scenic Exploration', activities: [] },
                          ]
                      ).map((day) => {
                        const dayStatus = day.status || getItineraryDayTimelineStatus(day.date);
                        const isToday = dayStatus === 'Today';
                        const isDone = dayStatus === 'Completed';

                        return (
                          <div
                            key={day.day}
                            className={`p-3 rounded-2xl border space-y-1 ${
                              isToday
                                ? 'border-2 border-emerald-500 bg-emerald-50/70 shadow-xs'
                                : isDone
                                ? 'border-slate-200/80 bg-slate-50'
                                : 'border-slate-200/80 bg-white'
                            }`}
                          >
                            <div className="flex items-center justify-between text-[10px] font-black">
                              <span className={isToday ? 'text-emerald-950 font-black' : 'text-slate-500 font-bold'}>
                                Day {day.day} · {day.date}
                              </span>
                              {isToday ? (
                                <span className="px-1.5 py-0.5 bg-emerald-600 text-white rounded-full text-[9px] font-black animate-pulse">
                                  ACTIVE
                                </span>
                              ) : isDone ? (
                                <span className="text-emerald-600 flex items-center gap-0.5 font-bold">
                                  <Check className="w-3 h-3" /> Done
                                </span>
                              ) : (
                                <span className="text-slate-400 font-medium">Upcoming</span>
                              )}
                            </div>
                            <h4 className={`text-xs truncate ${isToday ? 'font-black text-slate-900' : 'font-bold text-slate-700'}`}>
                              {day.title}
                            </h4>
                            <p className="text-[10px] text-slate-500 truncate">
                              {day.activities?.[0]?.title || `Activities in ${featuredTrip.destination}`}
                            </p>
                          </div>
                        );
                      })}
                    </div>

                    {/* Live Context Indicators */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                      <div className="flex items-center gap-2 text-slate-600 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200/60">
                        <span className="text-base">🏨</span>
                        <span className="truncate"><strong>Stay:</strong> Earl’s Regency Hotel (Kandy)</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200/60">
                        <span className="text-base">⛅</span>
                        <span className="truncate"><strong>Weather:</strong> 24°C · Pleasant & Mild</span>
                      </div>
                    </div>
                  </div>
                ) : featuredTrip.progress ? (
                  <div className="pt-4 border-t border-slate-100 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-extrabold text-slate-700 uppercase tracking-wider">
                        Trip Planning Progress
                      </span>
                      {featuredTrip.progress.aiPlanning && (
                        <span className="text-[11px] font-bold text-[#16A6A1] flex items-center gap-1.5">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#16A6A1] opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#16A6A1]" />
                          </span>
                          <span>NOVA is shaping your journey...</span>
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-5 gap-2 text-center text-xs">
                      <div
                        className={`p-2 rounded-xl border font-bold ${
                          featuredTrip.progress.destination
                            ? 'bg-[#16A6A1]/10 text-[#146C86] border-[#16A6A1]/30'
                            : 'bg-slate-50 text-slate-400 border-slate-200'
                        }`}
                      >
                        Destination {featuredTrip.progress.destination ? '✓' : '○'}
                      </div>
                      <div
                        className={`p-2 rounded-xl border font-bold ${
                          featuredTrip.progress.preferences
                            ? 'bg-[#16A6A1]/10 text-[#146C86] border-[#16A6A1]/30'
                            : 'bg-slate-50 text-slate-400 border-slate-200'
                        }`}
                      >
                        Preferences {featuredTrip.progress.preferences ? '✓' : '○'}
                      </div>
                      <div
                        className={`p-2 rounded-xl border font-bold ${
                          featuredTrip.progress.aiPlanning
                            ? 'bg-[#0B3A53] text-white border-[#0B3A53]'
                            : 'bg-slate-50 text-slate-400 border-slate-200'
                        }`}
                      >
                        AI Planning {featuredTrip.progress.aiPlanning ? '●' : '○'}
                      </div>
                      <div
                        className={`p-2 rounded-xl border font-bold ${
                          featuredTrip.progress.itinerary
                            ? 'bg-[#16A6A1]/10 text-[#146C86] border-[#16A6A1]/30'
                            : 'bg-slate-50 text-slate-400 border-slate-200'
                        }`}
                      >
                        Itinerary {featuredTrip.progress.itinerary ? '✓' : '○'}
                      </div>
                      <div
                        className={`p-2 rounded-xl border font-bold ${
                          featuredTrip.progress.bookings
                            ? 'bg-[#16A6A1]/10 text-[#146C86] border-[#16A6A1]/30'
                            : 'bg-slate-50 text-slate-400 border-slate-200'
                        }`}
                      >
                        Bookings {featuredTrip.progress.bookings ? '✓' : '○'}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* View Trip Action Button */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setSelectedTripModal(featuredTrip)}
                  className="inline-flex items-center gap-2 bg-[#0B3A53] hover:bg-[#072537] text-white font-bold text-xs px-6 py-3 rounded-full shadow-xs hover:shadow-md transition-all cursor-pointer"
                >
                  <span>View Trip</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 7 & 8. YOUR TRIPS GRID SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-slate-200/80 pb-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0B3A53] tracking-tight font-heading">
              Your Trips
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              {searchQuery.trim()
                ? `Showing ${filteredTrips.length} matching journey${filteredTrips.length === 1 ? '' : 's'}`
                : `Showing ${filteredTrips.length} journeys`}
            </p>
          </div>

          {/* Search Input Bar */}
          <div className="relative w-full sm:w-80 md:w-96">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search trips, destinations, staycations..."
                className="w-full pl-10 pr-9 py-2.5 rounded-full border border-slate-300 focus:border-[#16A6A1] focus:ring-2 focus:ring-[#16A6A1]/20 bg-white text-xs font-medium text-slate-800 placeholder-slate-400 shadow-2xs outline-none transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {filteredTrips.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredTrips.map((trip) => (
              <div
                key={trip.id}
                onClick={() => setSelectedTripModal(trip)}
                className="bg-white rounded-3xl overflow-hidden border border-slate-200/70 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group cursor-pointer flex flex-col justify-between"
              >
                <div>
                  {/* 8. Trip Card Image */}
                  <div className="relative h-52 w-full overflow-hidden bg-slate-100">
                    <img
                      src={trip.imageUrl}
                      alt={trip.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-60" />

                    <div className={`absolute top-3 right-3 px-3 py-1 rounded-full backdrop-blur-md text-[11px] font-bold border ${
                      trip.status === 'Ongoing'
                        ? 'bg-emerald-950/90 text-emerald-400 border-emerald-500/40 flex items-center gap-1.5 shadow-md'
                        : trip.status === 'Completed'
                        ? 'bg-slate-900/80 text-slate-300 border-white/20'
                        : trip.status === 'Cancelled'
                        ? 'bg-rose-950/90 text-rose-300 border-rose-500/40'
                        : 'bg-sky-950/90 text-sky-300 border-sky-400/30'
                    }`}>
                      {trip.status === 'Ongoing' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                      <span>{trip.status}</span>
                    </div>
                  </div>

                  {/* Trip Card Content */}
                  <div className="p-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#146C86] block">
                        {trip.destination}
                      </span>
                      {trip.budget && (
                        <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          Budget: {trip.budget}
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl font-black text-slate-900 font-heading group-hover:text-[#146C86] transition-colors leading-snug">
                      {trip.name}
                    </h3>

                    <p className="text-xs font-semibold text-slate-500">
                      {trip.dates} · {trip.duration} · {trip.travelers} Travelers
                    </p>

                    {/* Dynamic Real Calendar Timeline Badge */}
                    {trip.timelineLabel && (
                      <div className="pt-0.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                          trip.status === 'Ongoing'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                            : trip.status === 'Completed'
                            ? 'bg-slate-100 text-slate-600 border border-slate-200'
                            : trip.status === 'Cancelled'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-sky-50 text-[#0B3A53] border border-sky-200'
                        }`}>
                          <Clock className="w-3.5 h-3.5 text-[#16A6A1]" />
                          <span>{trip.timelineLabel}</span>
                        </span>
                      </div>
                    )}

                    {/* Staycation Booked Receipt Bar Inside Trip Card */}
                    {(() => {
                      const stayBookings = trip.bookingsList?.filter((b) => b.type === 'Hotel') || [];
                      if (stayBookings.length === 0) return null;

                      return (
                        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-xl">
                            <Building2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>
                              {stayBookings.length} Staycation{stayBookings.length > 1 ? 's' : ''} Booked
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveReceiptBooking({
                                booking: stayBookings[0],
                                tripName: trip.name,
                              });
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-teal-50 text-[#16A6A1] hover:text-[#146C86] text-xs font-black rounded-lg border border-teal-200 shadow-2xs transition-all cursor-pointer"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                            <span>View Receipt</span>
                          </button>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Card Action Link */}
                <div className="px-6 pb-6 pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-extrabold text-[#0B3A53]">
                  <span>{trip.status === 'Completed' ? 'View Memory' : 'View Full Journey'}</span>
                  <span className="text-[#16A6A1] group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    <span>{trip.status}</span>
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : searchQuery.trim() ? (
          /* SEARCH EMPTY STATE */
          <div className="bg-white py-14 px-6 rounded-3xl border border-slate-200/70 shadow-sm text-center max-w-lg mx-auto space-y-4 my-8">
            <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-500 mx-auto flex items-center justify-center">
              <Search className="w-7 h-7 text-slate-400" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-black text-[#0B3A53] font-heading">
                No journeys found
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
                We couldn't find any trips matching &ldquo;<span className="font-semibold text-slate-800">{searchQuery}</span>&rdquo;. Try searching by destination, hotel, or trip name.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="bg-[#16A6A1] hover:bg-[#146C86] text-white font-extrabold text-xs uppercase tracking-wider px-6 py-2.5 rounded-full shadow-md transition-colors cursor-pointer"
            >
              Clear Search
            </button>
          </div>
        ) : (
          /* 9. DEFAULT EMPTY STATE */
          <div className="bg-white py-16 px-6 rounded-3xl border border-slate-200/70 shadow-sm text-center max-w-lg mx-auto space-y-4 my-8">
            <div className="w-16 h-16 rounded-full bg-[#16A6A1]/10 text-[#16A6A1] mx-auto flex items-center justify-center">
              <Compass className="w-8 h-8 text-[#16A6A1]" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-black text-[#0B3A53] font-heading">
                Your next story starts here.
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
                You haven't planned a journey in this category yet. Let NOVA help you turn an idea into an unforgettable trip.
              </p>
            </div>
            <button
              onClick={() => navigate('/plan-trip')}
              className="bg-[#0B3A53] hover:bg-[#072537] text-white font-extrabold text-xs uppercase tracking-wider px-6 py-3 rounded-full shadow-md transition-colors cursor-pointer"
            >
              Plan a New Trip
            </button>
          </div>
        )}
      </section>

      {/* 11. AI TRIP PLANNING INTEGRATION BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-white py-12 px-6 sm:px-12 rounded-3xl border border-slate-200/70 shadow-sm text-center space-y-4 max-w-4xl mx-auto">
          <h3 className="text-2xl sm:text-3xl font-black text-[#0B3A53] font-heading">
            Let NOVA shape the journey.
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto font-medium leading-relaxed">
            Tell us where you're going, what you love, and how you want to travel. NOVA will help build a journey around you.
          </p>
          <div className="pt-2">
            <button
              onClick={() => navigate('/ai-workflows')}
              className="inline-flex items-center gap-2 bg-[#0B3A53] hover:bg-[#072537] text-white font-bold text-xs uppercase tracking-wider px-8 py-3.5 rounded-full shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer border border-slate-700/40"
            >
              <span>Plan with NOVA</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <Footer />

      {/* 10. MANUAL TRIP PLANNER MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-3xl w-full h-full max-h-[92vh] shadow-2xl border border-slate-200 overflow-y-auto flex flex-col justify-between relative">
            
            {/* Modal Header Bar */}
            <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-slate-200/80 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] font-black uppercase text-[#16A6A1] tracking-widest block">
                  MANUAL TRIP PLANNER
                </span>
                <h3 className="text-xl font-black text-[#0B3A53] font-heading">
                  Plan a New Trip Yourself
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setPlannerStep(1);
                }}
                className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stepper Navigation Bar */}
            <div className="bg-slate-50 px-6 py-3 border-b border-slate-200/60 overflow-x-auto">
              <div className="flex items-center justify-between text-xs font-bold min-w-[500px]">
                {[
                  { id: 1, label: 'Destination' },
                  { id: 2, label: 'Dates' },
                  { id: 3, label: 'Travelers' },
                  { id: 4, label: 'Style' },
                  { id: 5, label: 'Interests' },
                  { id: 6, label: 'Budget' },
                  { id: 7, label: 'Itinerary' },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setPlannerStep(s.id)}
                    className={`transition-all cursor-pointer ${
                      plannerStep === s.id
                        ? 'text-[#0B3A53] font-black border-b-2 border-[#16A6A1] pb-0.5'
                        : plannerStep > s.id
                        ? 'text-[#16A6A1]'
                        : 'text-slate-400'
                    }`}
                  >
                    <span>{plannerStep > s.id ? '✓ ' : ''}{s.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Step Content */}
            <div className="p-6 sm:p-8 space-y-6 flex-1">
              
              {/* STEP 1: DESTINATION & NAME */}
              {plannerStep === 1 && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div className="space-y-1">
                    <span className="text-xs font-black uppercase text-[#16A6A1]">STEP 01</span>
                    <h4 className="text-2xl font-black text-[#0B3A53]">Where do you want to go?</h4>
                  </div>
                  <div className="space-y-4 text-xs font-semibold text-slate-700">
                    <div className="space-y-1">
                      <label className="block text-slate-600 font-bold">Trip Name</label>
                      <input
                        type="text"
                        value={manualTripName}
                        onChange={(e) => setManualTripName(e.target.value)}
                        placeholder="e.g. Kandy Heritage Trail"
                        className="w-full p-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#16A6A1] font-bold text-[#0B3A53]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-slate-600 font-bold font-bold">Destination</label>
                      <input
                        type="text"
                        value={manualDestination}
                        onChange={(e) => setManualDestination(e.target.value)}
                        placeholder="e.g. Kandy, Ella, Galle, Sigiriya..."
                        className="w-full p-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#16A6A1] font-bold text-[#0B3A53]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: DURATION & DATES */}
              {plannerStep === 2 && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div className="space-y-1">
                    <span className="text-xs font-black uppercase text-[#16A6A1]">STEP 02</span>
                    <h4 className="text-2xl font-black text-[#0B3A53]">When are you travelling & for how long?</h4>
                  </div>
                  <div className="space-y-4 text-xs font-semibold text-slate-700">
                    <div className="space-y-1">
                      <label className="block text-slate-600 font-bold">Trip Duration</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        {['3 Days', '4 Days', '5 Days', '7 Days', '10 Days'].map((dur) => (
                          <button
                            key={dur}
                            type="button"
                            onClick={() => setManualDuration(dur)}
                            className={`p-3 rounded-2xl text-center font-extrabold border transition-all cursor-pointer ${
                              manualDuration === dur
                                ? 'bg-[#0B3A53] text-white border-[#0B3A53]'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {dur}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="block text-slate-600 font-bold">Travel Dates</label>
                      <input
                        type="text"
                        value={manualDates}
                        onChange={(e) => setManualDates(e.target.value)}
                        placeholder="e.g. Oct 15 – Oct 19, 2026"
                        className="w-full p-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#16A6A1] font-bold text-[#0B3A53]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: TRAVELERS */}
              {plannerStep === 3 && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div className="space-y-1">
                    <span className="text-xs font-black uppercase text-[#16A6A1]">STEP 03</span>
                    <h4 className="text-2xl font-black text-[#0B3A53]">Who is travelling with you?</h4>
                  </div>
                  <div className="space-y-4 text-xs">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {['Solo', 'Couple', 'Family', 'Friends'].map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setManualTravelersType(t)}
                          className={`p-3.5 rounded-2xl text-center font-extrabold border transition-all cursor-pointer ${
                            manualTravelersType === t
                              ? 'bg-[#0B3A53] text-white border-[#0B3A53]'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>

                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
                      <span className="font-bold text-slate-700">Number of Travelers</span>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setManualTravelersCount(Math.max(1, manualTravelersCount - 1))}
                          className="w-8 h-8 rounded-full bg-white text-slate-800 font-bold border shadow-xs"
                        >
                          -
                        </button>
                        <span className="text-sm font-black text-[#0B3A53] px-2">{manualTravelersCount} Persons</span>
                        <button
                          type="button"
                          onClick={() => setManualTravelersCount(manualTravelersCount + 1)}
                          className="w-8 h-8 rounded-full bg-white text-slate-800 font-bold border shadow-xs"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: STYLE */}
              {plannerStep === 4 && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div className="space-y-1">
                    <span className="text-xs font-black uppercase text-[#16A6A1]">STEP 04</span>
                    <h4 className="text-2xl font-black text-[#0B3A53]">What's your travel style & pace?</h4>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {['Relaxed', 'Balanced', 'Adventure', 'Fast-paced', 'Luxury', 'Budget-friendly'].map((style) => (
                      <button
                        key={style}
                        type="button"
                        onClick={() => setManualTravelStyle(style)}
                        className={`p-3.5 rounded-2xl text-center font-extrabold text-xs border transition-all cursor-pointer ${
                          manualTravelStyle === style
                            ? 'bg-[#0B3A53] text-white border-[#0B3A53]'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 5: INTERESTS */}
              {plannerStep === 5 && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div className="space-y-1">
                    <span className="text-xs font-black uppercase text-[#16A6A1]">STEP 05</span>
                    <h4 className="text-2xl font-black text-[#0B3A53]">What do you want to experience?</h4>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {['Nature', 'Culture', 'Adventure', 'Beaches', 'Food', 'Wildlife', 'Photography', 'Wellness'].map((exp) => {
                      const isSelected = manualInterests.includes(exp);
                      return (
                        <button
                          key={exp}
                          type="button"
                          onClick={() => toggleManualInterest(exp)}
                          className={`px-4 py-2.5 rounded-2xl text-xs font-bold border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#16A6A1] text-white border-[#16A6A1]'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {exp}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 6: BUDGET RANGE */}
              {plannerStep === 6 && (
                <div className="space-y-5 animate-in fade-in duration-200 text-xs">
                  <div className="space-y-1">
                    <span className="text-xs font-black uppercase text-[#16A6A1]">STEP 06</span>
                    <h4 className="text-2xl font-black text-[#0B3A53]">Set Your Specific Budget Range</h4>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[
                      { label: 'Budget', min: 100, max: 250 },
                      { label: 'Moderate', min: 250, max: 600 },
                      { label: 'Premium', min: 600, max: 1200 },
                      { label: 'Luxury', min: 1200, max: 2500 },
                    ].map((p) => (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => {
                          setManualBudgetTier(p.label);
                          setManualMinBudget(p.min);
                          setManualMaxBudget(p.max);
                        }}
                        className={`p-3 rounded-2xl text-center font-bold border transition-all cursor-pointer ${
                          manualBudgetTier === p.label ? 'bg-[#0B3A53] text-[#16A6A1]' : 'bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div>{p.label}</div>
                        <div className="text-[10px] opacity-75">${p.min}–${p.max}</div>
                      </button>
                    ))}
                  </div>

                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex justify-between font-bold text-[#0B3A53]">
                      <span>Specific Range Slider</span>
                      <span className="text-[#146C86]">${manualMinBudget} – ${manualMaxBudget}</span>
                    </div>
                    <input
                      type="range"
                      min="100"
                      max="3000"
                      step="25"
                      value={manualMaxBudget}
                      onChange={(e) => setManualMaxBudget(parseInt(e.target.value))}
                      className="w-full accent-[#16A6A1]"
                    />
                  </div>
                </div>
              )}

              {/* STEP 7: MANUAL DAY-BY-DAY ITINERARY BUILDER */}
              {plannerStep === 7 && (
                <div className="space-y-5 animate-in fade-in duration-200 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <div>
                      <span className="text-xs font-black uppercase text-[#16A6A1]">STEP 07</span>
                      <h4 className="text-2xl font-black text-[#0B3A53]">Manual Itinerary Builder</h4>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setManualItinerary([
                          ...manualItinerary,
                          {
                            day: manualItinerary.length + 1,
                            title: `Day ${manualItinerary.length + 1} Activity`,
                            morning: 'Morning sightseeing',
                            afternoon: 'Afternoon local tour',
                            evening: 'Evening dinner',
                            location: manualDestination,
                          },
                        ])
                      }
                      className="px-3.5 py-1.5 rounded-full bg-[#16A6A1]/10 text-[#146C86] font-bold text-xs border border-[#16A6A1]/30 cursor-pointer"
                    >
                      + Add Day
                    </button>
                  </div>

                  <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
                    {manualItinerary.map((dayItem, idx) => (
                      <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                        <div className="flex items-center justify-between font-extrabold text-[#0B3A53]">
                          <span>Day 0{dayItem.day}: {dayItem.title}</span>
                          <span className="text-slate-400">📍 {dayItem.location}</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="text-[10px] text-slate-400 font-bold uppercase block">Morning</label>
                            <input
                              type="text"
                              value={dayItem.morning}
                              onChange={(e) => {
                                const updated = [...manualItinerary];
                                updated[idx].morning = e.target.value;
                                setManualItinerary(updated);
                              }}
                              className="w-full p-2.5 rounded-xl bg-white border border-slate-200 font-medium text-slate-700"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] text-slate-400 font-bold uppercase block">Afternoon</label>
                            <input
                              type="text"
                              value={dayItem.afternoon}
                              onChange={(e) => {
                                const updated = [...manualItinerary];
                                updated[idx].afternoon = e.target.value;
                                setManualItinerary(updated);
                              }}
                              className="w-full p-2.5 rounded-xl bg-white border border-slate-200 font-medium text-slate-700"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] text-slate-400 font-bold uppercase block">Evening</label>
                            <input
                              type="text"
                              value={dayItem.evening}
                              onChange={(e) => {
                                const updated = [...manualItinerary];
                                updated[idx].evening = e.target.value;
                                setManualItinerary(updated);
                              }}
                              className="w-full p-2.5 rounded-xl bg-white border border-slate-200 font-medium text-slate-700"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Bottom Footer Navigation */}
            <div className="sticky bottom-0 z-30 bg-white border-t border-slate-200/80 px-6 py-4 flex items-center justify-between">
              {plannerStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setPlannerStep(plannerStep - 1)}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  ← Previous Step
                </button>
              ) : (
                <span />
              )}

              {plannerStep < 7 ? (
                <button
                  type="button"
                  onClick={() => setPlannerStep(plannerStep + 1)}
                  className="bg-[#0B3A53] hover:bg-[#072537] text-white font-extrabold text-xs uppercase tracking-wider px-6 py-3 rounded-full shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <span>Next Step</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleManualTripSubmit}
                  className="bg-[#16A6A1] hover:bg-[#146C86] text-white font-extrabold text-xs uppercase tracking-wider px-8 py-3 rounded-full shadow-lg cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Journey to My Trips</span>
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* 12. FULL TRIP DETAILS MODAL */}
      {selectedTripModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-4xl w-full h-full max-h-[92vh] shadow-2xl border border-slate-200 overflow-y-auto flex flex-col justify-between relative">
            
            {/* Modal Sticky Top Header Bar */}
            <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-slate-200/80 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedTripModal(null)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0B3A53] hover:text-[#16A6A1] transition-colors cursor-pointer bg-slate-100 px-3 py-1.5 rounded-full"
                >
                  <ArrowRight className="w-4 h-4 rotate-180" />
                  <span>Back to Journeys</span>
                </button>
                <div className="hidden sm:block border-l border-slate-200 pl-3">
                  <span className="text-xs font-black text-[#0B3A53]">{selectedTripModal.name}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => triggerToast(`Shared ${selectedTripModal.name} itinerary link!`)}
                  className="px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  Share Trip
                </button>
                <button
                  onClick={() => triggerToast(`Exporting ${selectedTripModal.name} PDF Summary...`)}
                  className="px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  Download PDF
                </button>
                <button
                  onClick={() => setSelectedTripModal(null)}
                  className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 space-y-8 flex-1">
              
              {/* Trip Hero Header */}
              <div className="relative h-64 sm:h-72 w-full rounded-3xl overflow-hidden shadow-md">
                <img
                  src={selectedTripModal.imageUrl}
                  alt={selectedTripModal.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent p-6 sm:p-8 flex flex-col justify-between text-white">
                  <div className="flex items-center justify-between">
                    <span className="px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-extrabold border border-white/30">
                      {selectedTripModal.destination}
                    </span>
                    <div className="flex items-center gap-2">
                      {selectedTripModal.timelineLabel && (
                        <span className="px-3 py-1 rounded-full bg-slate-900/70 backdrop-blur-md text-white text-xs font-semibold border border-white/20 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#16A6A1]" />
                          <span>{selectedTripModal.timelineLabel}</span>
                        </span>
                      )}
                      <span className={`px-3.5 py-1.5 rounded-full text-xs font-black border ${
                        selectedTripModal.status === 'Ongoing'
                          ? 'bg-emerald-500 text-white border-emerald-400'
                          : selectedTripModal.status === 'Completed'
                          ? 'bg-slate-700 text-slate-200 border-slate-600'
                          : selectedTripModal.status === 'Cancelled'
                          ? 'bg-rose-600 text-white border-rose-500'
                          : 'bg-[#16A6A1] text-white border-[#146C86]'
                      }`}>
                        {selectedTripModal.status}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-3xl sm:text-4xl font-black text-white font-heading">
                      {selectedTripModal.name}
                    </h2>
                    <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-200">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-[#16A6A1]" />
                        <span>{selectedTripModal.dates}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-[#16A6A1]" />
                        <span>{selectedTripModal.duration}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-[#16A6A1]" />
                        <span>{selectedTripModal.travelers} Travelers</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Total Budget
                  </span>
                  <span className="text-base font-black text-[#0B3A53]">
                    {selectedTripModal.budget || '$250'}
                  </span>
                  {selectedTripModal.spentBudget && (
                    <span className="text-[11px] font-semibold text-[#146C86] block">
                      Spent: {selectedTripModal.spentBudget}
                    </span>
                  )}
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Weather Forecast
                  </span>
                  <span className="text-xs font-extrabold text-[#0B3A53] leading-snug block">
                    {selectedTripModal.weatherForecast || '24°C · Mostly Sunny'}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Travelers
                  </span>
                  <span className="text-xs font-bold text-slate-700 block line-clamp-2">
                    {selectedTripModal.travelerNames?.join(', ') || '2 Travelers'}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Interests
                  </span>
                  <span className="text-xs font-bold text-[#146C86] block line-clamp-2">
                    {selectedTripModal.interests?.join(' · ') || 'Culture, Nature'}
                  </span>
                </div>
              </div>

              {/* Trip Preferences & Transport Details Banner */}
              {selectedTripModal.notes && (
                <div className="bg-gradient-to-r from-teal-50/80 to-sky-50/80 border border-teal-200/80 p-5 rounded-3xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-[#0B3A53] tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-[#16A6A1]" /> Trip Preferences & Transport Details
                    </span>
                  </div>
                  <p className="text-xs font-medium text-slate-700 leading-relaxed">
                    {selectedTripModal.notes}
                  </p>

                </div>
              )}

              {/* AI Travel Insight Banner */}
              {selectedTripModal.aiNotes && (
                <div className="bg-[#16A6A1]/10 border border-[#16A6A1]/30 p-4 sm:p-5 rounded-2xl space-y-1.5 flex items-start gap-3">
                  <Compass className="w-5 h-5 text-[#16A6A1] shrink-0 mt-0.5" />
                  <div className="space-y-1 text-xs">
                    <span className="font-extrabold text-[#0B3A53] block uppercase tracking-wider">
                      NOVA AI Travel Tip
                    </span>
                    <p className="text-slate-700 leading-relaxed font-medium">
                      {selectedTripModal.aiNotes}
                    </p>
                  </div>
                </div>
              )}

              {/* Day-by-Day Itinerary Section */}
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <h3 className="text-xl font-black text-[#0B3A53] font-heading">
                    Day-by-Day Itinerary
                  </h3>
                  <button
                    onClick={() => triggerToast(`Added new activity to ${selectedTripModal.name} itinerary`)}
                    className="text-xs font-extrabold text-[#16A6A1] hover:text-[#146C86] inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Activity</span>
                  </button>
                </div>

                {selectedTripModal.dailyItinerary && selectedTripModal.dailyItinerary.length > 0 ? (
                  <div className="space-y-6">
                    {selectedTripModal.dailyItinerary.map((day: TripDayItinerary) => (
                      <div
                        key={day.day}
                        className="bg-slate-50/80 p-5 rounded-3xl border border-slate-200/80 space-y-4"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-xl bg-[#0B3A53] text-white text-xs font-black flex items-center justify-center">
                              0{day.day}
                            </span>
                            <div>
                              <h4 className="text-base font-extrabold text-[#0B3A53]">
                                Day {day.day}: {day.title}
                              </h4>
                              <span className="text-xs font-semibold text-slate-400">{day.date}</span>
                            </div>
                          </div>
                          {(() => {
                            const dayStatus = day.status || getItineraryDayTimelineStatus(day.date);
                            return (
                              <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider border ${
                                dayStatus === 'Today'
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300 animate-pulse'
                                  : dayStatus === 'Completed'
                                  ? 'bg-slate-100 text-slate-600 border-slate-200'
                                  : 'bg-sky-50 text-sky-800 border-sky-200'
                              }`}>
                                {dayStatus === 'Today' ? '● Today' : dayStatus}
                              </span>
                            );
                          })()}
                        </div>

                        <div className="space-y-3 pl-2 sm:pl-4 border-l-2 border-[#16A6A1]/40">
                          {day.activities.map((act: TripActivityDetail, aIdx: number) => {
                            const actStatus = act.activityStatus || getActivityTimelineStatus(day.date, act.time);
                            return (
                              <div
                                key={aIdx}
                                className="bg-white p-4 rounded-2xl border border-slate-200/70 shadow-xs space-y-1.5"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-2">
                                    <span className="px-2.5 py-0.5 rounded-full bg-[#0B3A53] text-white text-[10px] font-black">
                                      {act.time}
                                    </span>
                                    <span className="text-xs font-extrabold text-[#0B3A53]">
                                      {act.title}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${
                                      actStatus === 'In Progress'
                                        ? 'bg-emerald-500 text-white border-emerald-400 animate-pulse'
                                        : actStatus === 'Completed'
                                        ? 'bg-slate-100 text-slate-500 border-slate-200'
                                        : actStatus === 'Today'
                                        ? 'bg-teal-50 text-teal-800 border-teal-200'
                                        : 'bg-slate-50 text-slate-600 border-slate-200'
                                    }`}>
                                      {actStatus}
                                    </span>
                                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-extrabold">
                                      {act.type}
                                    </span>
                                  </div>
                                </div>
                                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                                  {act.description}
                                </p>
                                <span className="text-[11px] text-[#146C86] font-bold block pt-1">
                                  📍 {act.location}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <p className="text-xs text-slate-500 font-semibold">
                      NOVA AI is generating your customized itinerary. Check back in a moment!
                    </p>
                  </div>
                )}
              </div>

              {/* Confirmed Bookings Section */}
              {selectedTripModal.bookingsList && selectedTripModal.bookingsList.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-slate-200">
                  <h3 className="text-xl font-black text-[#0B3A53] font-heading">
                    Confirmed Bookings & Transfers
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {selectedTripModal.bookingsList.map((bk: TripBookingDetail) => (
                      <div
                        key={bk.id}
                        className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded-full bg-[#16A6A1]/10 text-[#146C86] text-[10px] font-black uppercase">
                            {bk.type}
                          </span>
                          <span className="text-xs font-bold text-emerald-600">✓ {bk.status}</span>
                        </div>
                        <div>
                          <h4 className="text-sm font-extrabold text-[#0B3A53]">{bk.provider}</h4>
                          <p className="text-xs text-slate-500 font-medium">{bk.details}</p>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                          <span className="font-semibold text-slate-400">Ref: {bk.confirmationCode}</span>
                          <span className="font-black text-[#0B3A53]">{bk.amount}</span>
                        </div>
                        {bk.type === 'Hotel' && (
                          <button
                            type="button"
                            onClick={() =>
                              setActiveReceiptBooking({
                                booking: bk,
                                tripName: selectedTripModal.name,
                              })
                            }
                            className="w-full mt-2 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-extrabold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                          >
                            <Receipt className="w-3.5 h-3.5 text-emerald-700" />
                            <span>View Official Confirmation Receipt</span>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Bottom Sticky Footer */}
            <div className="sticky bottom-0 z-30 bg-white border-t border-slate-200/80 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
              <button
                onClick={() => {
                  setSelectedTripModal(null);
                  navigate(`/destinations/${selectedTripModal.destinationId}`);
                }}
                className="text-xs font-extrabold text-[#146C86] hover:text-[#0B3A53] inline-flex items-center gap-1 cursor-pointer"
              >
                <span>View Destination Catalog Details</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3">
                {(selectedTripModal.status === 'Planning' || selectedTripModal.status === 'Upcoming') && (
                  <button
                    type="button"
                    onClick={() => setTripToDelete(selectedTripModal)}
                    className="px-5 py-2.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4 text-rose-600" />
                    <span>Delete Trip</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setSelectedTripModal(null);
                    triggerToast(`Opening edit trip drawer for ${selectedTripModal.name}`);
                  }}
                  className="px-5 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-[#0B3A53] font-bold text-xs transition-colors cursor-pointer"
                >
                  Edit Trip Details
                </button>

                <button
                  onClick={() => {
                    setSelectedTripModal(null);
                    navigate('/ai-workflows');
                  }}
                  className="px-6 py-2.5 rounded-full bg-[#0B3A53] hover:bg-[#072537] text-white font-extrabold text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-md"
                >
                  Plan Next Destination →
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 13. DELETE TRIP CONFIRMATION MODAL */}
      {tripToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-rose-600" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-900 font-heading">Delete Journey</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  Are you sure you want to delete <strong className="text-slate-800 font-bold">{tripToDelete.name}</strong>?
                  This journey is in the <span className="font-bold text-[#146C86]">{tripToDelete.status}</span> category and will be permanently removed.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-1.5">
              <div className="flex items-center justify-between text-slate-700">
                <span className="font-bold text-slate-500">Destination:</span>
                <span className="font-extrabold text-slate-900">{tripToDelete.destination}</span>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span className="font-bold text-slate-500">Dates:</span>
                <span className="font-semibold text-slate-800">{tripToDelete.dates}</span>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span className="font-bold text-slate-500">Category:</span>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-800 font-black text-[10px] uppercase tracking-wider">
                  {tripToDelete.status}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setTripToDelete(null)}
                className="px-5 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteTrip(tripToDelete.id)}
                className="px-6 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 shadow-md shadow-rose-600/20"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Yes, Delete Trip</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI BOT GUIDE MODAL */}
      <AIBotGuideModal
        isOpen={isAIBotModalOpen}
        onClose={() => setIsAIBotModalOpen(false)}
      />

      {/* STAYCATION CONFIRMATION RECEIPT MODAL */}
      <BookingConfirmationReceiptModal
        isOpen={activeReceiptBooking !== null}
        onClose={() => setActiveReceiptBooking(null)}
        booking={activeReceiptBooking?.booking || null}
        tripName={activeReceiptBooking?.tripName}
      />
    </div>
  );
};
