import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from 'lucide-react';
import { LandingNavbar } from '../components/navigation/LandingNavbar';
import { Footer } from '../components/navigation/Footer';
import { MOCK_USER_TRIPS, UserTrip, TripDayItinerary, TripActivityDetail, TripBookingDetail } from '../mock/tripsData';
import { AIBotGuideModal } from '../components/guide/AIBotGuideModal';

export const TripsPage: React.FC = () => {
  const navigate = useNavigate();

  // State Management
  const [trips, setTrips] = useState<UserTrip[]>(MOCK_USER_TRIPS);
  const [activeTab, setActiveTab] = useState<'All' | 'Upcoming' | 'Planning' | 'Ongoing' | 'Completed'>('All');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTripModal, setSelectedTripModal] = useState<UserTrip | null>(null);
  const [isAIBotModalOpen, setIsAIBotModalOpen] = useState(false);

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
    if (activeTab === 'All') return trips;
    return trips.filter((t) => t.status === activeTab);
  }, [trips, activeTab]);

  // Featured Trip (Primary active or upcoming trip)
  const featuredTrip = useMemo(() => {
    return trips.find((t) => t.isFeatured) || trips[0];
  }, [trips]);

  const handleManualTripSubmit = () => {
    if (!manualDestination.trim()) {
      triggerToast('Please enter a destination for your trip.');
      return;
    }

    const createdTrip: UserTrip = {
      id: `trip-manual-${Date.now()}`,
      name: manualTripName || `${manualDestination} Journey`,
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
      imageUrl: featuredTrip.imageUrl,
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

    setTrips([createdTrip, ...trips]);
    setIsCreateModalOpen(false);
    setPlannerStep(1);
    triggerToast(`Created new manual trip: ${createdTrip.name}!`);
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-slate-200/80 pb-8">
          <div className="space-y-2 max-w-xl">
            <h1 className="text-4xl sm:text-5xl font-black text-[#0B3A53] tracking-tight font-heading leading-tight">
              Your Journeys
            </h1>
            <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed">
              Every trip has a story. Keep yours in one place.
            </p>
          </div>

          {/* Primary CTA */}
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-2 bg-[#16A6A1] hover:bg-[#146C86] text-white font-extrabold text-xs uppercase tracking-wider px-6 py-3.5 rounded-full shadow-sm hover:shadow-md transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 text-white" />
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
              tab === 'All' ? trips.length : trips.filter((t) => t.status === tab).length;

            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 text-sm font-bold transition-all cursor-pointer whitespace-nowrap relative flex items-center gap-2 ${
                  isActive
                    ? 'text-[#0B3A53] font-black border-b-2 border-[#16A6A1]'
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

      {/* 5 & 6. FEATURED / UPCOMING TRIP CARD */}
      {activeTab === 'All' && featuredTrip && (
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

              <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-[#16A6A1] text-xs font-black uppercase tracking-wider border border-white/15">
                PRIMARY JOURNEY
              </div>
            </div>

            {/* Right Trip Details & Progress */}
            <div className="lg:col-span-6 p-6 sm:p-10 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-[#146C86]">
                    {featuredTrip.destination}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-[#16A6A1]/10 text-[#146C86] text-xs font-bold border border-[#16A6A1]/20">
                    {featuredTrip.status}
                  </span>
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

                {/* 6. FRIENDLY TRIP PLANNING PROGRESS */}
                {featuredTrip.progress && (
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
                )}
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
        <div className="flex items-center justify-between mb-8 border-b border-slate-200/80 pb-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0B3A53] tracking-tight font-heading">
              Your Trips
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Showing {filteredTrips.length} journeys
            </p>
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

                    <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-bold border border-white/15">
                      {trip.status}
                    </div>
                  </div>

                  {/* Trip Card Content */}
                  <div className="p-6 space-y-2">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#146C86] block">
                      {trip.destination}
                    </span>
                    <h3 className="text-xl font-black text-slate-900 font-heading group-hover:text-[#146C86] transition-colors leading-snug">
                      {trip.name}
                    </h3>
                    <p className="text-xs font-semibold text-slate-500">
                      {trip.dates} · {trip.duration} · {trip.travelers} Travelers
                    </p>
                  </div>
                </div>

                {/* Card Action Link */}
                <div className="px-6 pb-6 pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-extrabold text-[#0B3A53]">
                  <span>{trip.status === 'Completed' ? 'View Memory' : 'Continue Planning'}</span>
                  <span className="text-[#16A6A1] group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    <span>{trip.status}</span>
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* 9. EMPTY STATE */
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
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-[#0B3A53] hover:bg-[#072537] text-white font-extrabold text-xs uppercase tracking-wider px-6 py-3 rounded-full shadow-md transition-colors cursor-pointer"
            >
              Plan My First Trip
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
                    <span className="px-3.5 py-1.5 rounded-full bg-[#16A6A1] text-white text-xs font-black">
                      {selectedTripModal.status}
                    </span>
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
                            <h4 className="text-base font-extrabold text-[#0B3A53]">
                              Day {day.day}: {day.title}
                            </h4>
                          </div>
                          <span className="text-xs font-semibold text-slate-400">{day.date}</span>
                        </div>

                        <div className="space-y-3 pl-2 sm:pl-4 border-l-2 border-[#16A6A1]/40">
                          {day.activities.map((act: TripActivityDetail, aIdx: number) => (
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
                                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-extrabold">
                                  {act.type}
                                </span>
                              </div>
                              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                                {act.description}
                              </p>
                              <span className="text-[11px] text-[#146C86] font-bold block pt-1">
                                📍 {act.location}
                              </span>
                            </div>
                          ))}
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

      {/* AI BOT GUIDE MODAL */}
      <AIBotGuideModal
        isOpen={isAIBotModalOpen}
        onClose={() => setIsAIBotModalOpen(false)}
      />
    </div>
  );
};
