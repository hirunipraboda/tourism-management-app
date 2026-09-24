import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Calendar,
  Users,
  DollarSign,
  Plus,
  Trash2,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Clock,
  Sparkles,
  Building2,
  Tag,
  Gift,
  ExternalLink,
  ChevronRight,
  Compass,
  Info,
  Layers,
  HeartHandshake,
  Star,
  Car,
  AlertTriangle,
  GripVertical,
  Check,
  ShieldCheck,
  BedDouble,
  MoveDown,
  MoveUp,
  X,
  BadgeCheck,
  CreditCard,
  Lock,
  Copy,
  Bus,
  Train,
} from 'lucide-react';
import { LandingNavbar } from '../components/navigation/LandingNavbar';
import { Footer } from '../components/navigation/Footer';
import { tripService } from '../services/tripService';
import { UserTrip } from '../mock/tripsData';
import { PublicTransportExplorer } from '../components/transport/PublicTransportExplorer';
import { TransportOption } from '../services/transportService';
import {
  SRI_LANKA_DESTINATIONS,
  TRAVEL_STYLES_LIST,
  ACCOMMODATIONS_CATALOG,
  ACTIVITIES_CATALOG,
  AccommodationItem,
  AccommodationType,
  ActivityItem,
} from '../mock/manualPlannerData';

// Scheduled Activity in Itinerary
export interface ScheduledActivity {
  id: string;
  sourceActivityId?: string;
  name: string;
  destination: string;
  category: string;
  durationMinutes: number;
  cost: number;
  time: string;
  description: string;
}

// Scheduled Day in Itinerary
export interface PlannedDay {
  dayNumber: number;
  dateStr: string;
  destination: string;
  activities: ScheduledActivity[];
}

export const ManualTripPlannerPage: React.FC = () => {
  const navigate = useNavigate();

  // Guided Steps (1 to 6)
  // 1: Trip Details & Destinations
  // 2: Accommodation Preferences & Hotels/Cabanas
  // 3: Travel Styles & Preferences
  // 4: Transportation & Mobility Selection
  // 5: Drag-and-Drop Itinerary Builder & AI Recommendations
  // 6: Trip Review & Finalize
  const [step, setStep] = useState<number>(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isFinalizing, setIsFinalizing] = useState<boolean>(false);

  // ----------------------------------------------------
  // STEP 1: TRIP DETAILS & DESTINATIONS
  // ----------------------------------------------------
  const [tripName, setTripName] = useState<string>('');
  const [selectedDestinations, setSelectedDestinations] = useState<string[]>([]);
  
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const [adultsCount, setAdultsCount] = useState<number>(0);
  const [childrenCount, setChildrenCount] = useState<number>(0);
  const [budgetAmount, setBudgetAmount] = useState<number | ''>('');

  // Calculate Duration
  const calculateDuration = () => {
    if (!startDate || !endDate) return 0;
    const s = new Date(startDate);
    const e = new Date(endDate);
    const diff = Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return isNaN(diff) || diff <= 0 ? 0 : diff;
  };
  const durationDays = calculateDuration();

  const toggleDestination = (dest: string) => {
    if (selectedDestinations.includes(dest)) {
      setSelectedDestinations(selectedDestinations.filter((d) => d !== dest));
    } else {
      setSelectedDestinations([...selectedDestinations, dest]);
    }
  };

  // ----------------------------------------------------
  // STEP 2: ACCOMMODATION PREFERENCES & SELECTION
  // ----------------------------------------------------
  const [preferredAccommodationType, setPreferredAccommodationType] = useState<AccommodationType | null>(null);
  // Selected accommodation per destination: { [destination]: AccommodationItem }
  const [selectedAccommodations, setSelectedAccommodations] = useState<Record<string, AccommodationItem>>({});

  // Filter available accommodations based on selected destinations and type
  const visibleAccommodations = useMemo(() => {
    return ACCOMMODATIONS_CATALOG.filter((acc) => {
      const matchDest = selectedDestinations.includes(acc.destination);
      const matchType = !preferredAccommodationType || acc.type === preferredAccommodationType;
      return matchDest && matchType;
    });
  }, [selectedDestinations, preferredAccommodationType]);

  const handleSelectAccommodation = (dest: string, acc: AccommodationItem) => {
    if (selectedAccommodations[dest]?.id === acc.id) {
      // Toggle off if already selected
      const next = { ...selectedAccommodations };
      delete next[dest];
      setSelectedAccommodations(next);
      triggerToast(`Deselected ${acc.name} for ${dest}.`);
    } else {
      setSelectedAccommodations((prev) => ({
        ...prev,
        [dest]: acc,
      }));
      triggerToast(`Selected ${acc.name} for ${dest}!`);
    }
  };

  // ----------------------------------------------------
  // STEP 3: TRAVEL STYLES & PREFERENCES
  // ----------------------------------------------------
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);

  const toggleTravelStyle = (styleId: string) => {
    if (selectedStyles.includes(styleId)) {
      setSelectedStyles(selectedStyles.filter((s) => s !== styleId));
    } else {
      setSelectedStyles([...selectedStyles, styleId]);
    }
  };

  // ----------------------------------------------------
  // STEP 4: TRANSPORTATION & MOBILITY
  // ----------------------------------------------------
  const [transportMode, setTransportMode] = useState<'PUBLIC_TRANSPORT' | 'PRIVATE'>('PUBLIC_TRANSPORT');
  const [selectedPublicTransport, setSelectedPublicTransport] = useState<TransportOption | null>(null);
  const [privateVehicleType, setPrivateVehicleType] = useState<string>('AC Sedan');

  // ----------------------------------------------------
  // STEP 5: ITINERARY BUILDER (DRAG & DROP + AI RECOMMENDATIONS)
  // ----------------------------------------------------
  // Days structured as: Trip -> Date -> Destination -> Activities (clean initial state: empty)
  const [plannedDays, setPlannedDays] = useState<PlannedDay[]>([]);

  const [activeDateIndex, setActiveDateIndex] = useState<number>(0);
  const [draggedActivity, setDraggedActivity] = useState<ScheduledActivity | null>(null);
  const [draggedFromDayIndex, setDraggedFromDayIndex] = useState<number | null>(null);

  // Sync planned days count and dates whenever dates change
  const syncDaysWithDates = () => {
    if (!startDate || !endDate || durationDays <= 0) {
      setPlannedDays([]);
      return;
    }
    const s = new Date(startDate);
    const newDays: PlannedDay[] = [];

    for (let i = 0; i < durationDays; i++) {
      const d = new Date(s);
      d.setDate(s.getDate() + i);
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      
      // Preserve existing day if present, or create with alternating selected destination
      const existing = plannedDays[i];
      const defaultDest = selectedDestinations.length > 0
        ? selectedDestinations[i % selectedDestinations.length]
        : 'Sri Lanka';
      const assignedDest = existing && existing.destination ? existing.destination : defaultDest;

      newDays.push({
        dayNumber: i + 1,
        dateStr,
        destination: assignedDest,
        activities: existing ? existing.activities : [],
      });
    }

    setPlannedDays(newDays);
  };

  // Re-generate / AI Optimize Itinerary
  const handleAIOptimizeItinerary = () => {
    const updated = plannedDays.map((day, dIdx) => {
      // Find suitable activities for this day's destination
      const available = ACTIVITIES_CATALOG.filter(
        (a) => a.destination.toLowerCase() === day.destination.toLowerCase()
      );

      // Prioritize by user travel styles
      const scored = available.sort((a, b) => {
        const aScore = a.travelStyles.filter((s) => selectedStyles.includes(s)).length;
        const bScore = b.travelStyles.filter((s) => selectedStyles.includes(s)).length;
        return bScore - aScore;
      });

      // Pick up to 3 harmonious activities (Morning, Afternoon, Evening)
      const morningTimes = ['08:30 AM', '09:00 AM'];
      const afternoonTimes = ['01:30 PM', '02:30 PM'];
      const sunsetTimes = ['05:00 PM', '06:30 PM'];

      const chosen = scored.slice(0, 3).map((act, actIdx) => ({
        id: `sched-ai-${dIdx + 1}-${act.id}-${Date.now()}`,
        sourceActivityId: act.id,
        name: act.name,
        destination: act.destination,
        category: act.category,
        durationMinutes: act.durationMinutes,
        cost: act.estimatedCost,
        time: actIdx === 0 ? morningTimes[0] : actIdx === 1 ? afternoonTimes[0] : sunsetTimes[0],
        description: act.description,
      }));

      return {
        ...day,
        activities: chosen,
      };
    });

    setPlannedDays(updated);
    triggerToast('✨ AI Itinerary Optimizer sequenced activities for your travel styles & destinations!');
  };

  // Drag and drop handlers
  const handleDragStartFromPool = (act: ActivityItem) => {
    const scheduled: ScheduledActivity = {
      id: `sched-${Date.now()}-${Math.random()}`,
      sourceActivityId: act.id,
      name: act.name,
      destination: act.destination,
      category: act.category,
      durationMinutes: act.durationMinutes,
      cost: act.estimatedCost,
      time: act.recommendedTime.split(' ')[1] ? `${act.recommendedTime.split(' ')[1]} ${act.recommendedTime.split(' ')[2]}` : '10:00 AM',
      description: act.description,
    };
    setDraggedActivity(scheduled);
    setDraggedFromDayIndex(null);
  };

  const handleDragStartFromDay = (act: ScheduledActivity, fromDayIdx: number) => {
    setDraggedActivity(act);
    setDraggedFromDayIndex(fromDayIdx);
  };

  const handleDropOnDay = (targetDayIdx: number) => {
    if (!draggedActivity) return;

    const updated = [...plannedDays];

    // If moved from another day, remove it from that day first
    if (draggedFromDayIndex !== null) {
      updated[draggedFromDayIndex].activities = updated[draggedFromDayIndex].activities.filter(
        (a) => a.id !== draggedActivity.id
      );
    }

    // Add to target day
    updated[targetDayIdx].activities.push({
      ...draggedActivity,
      destination: updated[targetDayIdx].destination,
    });

    setPlannedDays(updated);
    setDraggedActivity(null);
    setDraggedFromDayIndex(null);
    triggerToast(`Added ${draggedActivity.name} to Day ${targetDayIdx + 1}!`);
  };

  const handleRemoveActivity = (dayIdx: number, actId: string) => {
    const updated = [...plannedDays];
    updated[dayIdx].activities = updated[dayIdx].activities.filter((a) => a.id !== actId);
    setPlannedDays(updated);
  };

  const handleMoveActivityWithinDay = (dayIdx: number, actIdx: number, direction: 'up' | 'down') => {
    const updated = [...plannedDays];
    const activities = [...updated[dayIdx].activities];
    const targetIdx = direction === 'up' ? actIdx - 1 : actIdx + 1;
    if (targetIdx < 0 || targetIdx >= activities.length) return;

    const temp = activities[actIdx];
    activities[actIdx] = activities[targetIdx];
    activities[targetIdx] = temp;
    updated[dayIdx].activities = activities;
    setPlannedDays(updated);
  };

  const handleChangeDayDestination = (dayIdx: number, newDest: string) => {
    const updated = [...plannedDays];
    updated[dayIdx].destination = newDest;
    setPlannedDays(updated);
  };

  // Realism Check: Calculate total hours on day
  const getDayTotalMinutes = (day: PlannedDay) => {
    return day.activities.reduce((acc, a) => acc + (a.durationMinutes || 90), 0);
  };

  // Available activity recommendations for current active day's destination
  const activeDay = plannedDays[activeDateIndex] || plannedDays[0];
  const recommendedActivitiesForDay = useMemo(() => {
    if (!activeDay) return [];
    return ACTIVITIES_CATALOG.filter(
      (a) => a.destination.toLowerCase() === activeDay.destination.toLowerCase()
    );
  }, [activeDay]);

  // ----------------------------------------------------
  // STEP 6: FINANCIAL CALCULATIONS
  // ----------------------------------------------------
  // Total nights
  const totalNights = Math.max(0, durationDays - 1);
  
  // Accommodation total cost: average nights allocated across selected hotels
  const totalAccommodationCost = useMemo(() => {
    const activeHotels = Object.values(selectedAccommodations);
    if (activeHotels.length === 0 || totalNights === 0) return 0;
    const nightsPerHotel = totalNights / activeHotels.length;
    return Math.round(activeHotels.reduce((sum, h) => sum + h.pricePerNight * nightsPerHotel, 0));
  }, [selectedAccommodations, totalNights]);

  // Activity total cost
  const totalActivityCost = useMemo(() => {
    return plannedDays.reduce(
      (sum, d) => sum + d.activities.reduce((dSum, a) => dSum + a.cost, 0),
      0
    );
  }, [plannedDays]);

  // Transport total cost
  const estimatedTransportCost = useMemo(() => {
    if (transportMode === 'PUBLIC_TRANSPORT') {
      if (!selectedPublicTransport) return 0;
      const totalPax = adultsCount + childrenCount > 0 ? adultsCount + childrenCount : 1;
      const fareUSD = selectedPublicTransport.estimatedFare 
        ? Math.round((selectedPublicTransport.estimatedFare / 300) * totalPax)
        : 6 * totalPax;
      return fareUSD;
    }
    if (durationDays <= 0) return 0;
    const ratePerDay = privateVehicleType === 'Tourist Van' ? 55 : privateVehicleType === 'Luxury SUV' ? 75 : 35;
    return durationDays * ratePerDay;
  }, [durationDays, transportMode, selectedPublicTransport, privateVehicleType, adultsCount, childrenCount]);

  const taxesAndFees = Math.round((totalAccommodationCost + totalActivityCost + estimatedTransportCost) * 0.08); // 8% government tourism VAT/levy
  const totalEstimatedTripCost = totalAccommodationCost + totalActivityCost + estimatedTransportCost + taxesAndFees;
  const numBudget = typeof budgetAmount === 'number' ? budgetAmount : 0;
  const remainingBudget = numBudget - totalEstimatedTripCost;

  // Toast Trigger
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // ----------------------------------------------------
  // FINALIZE TRIP HANDLER
  // ----------------------------------------------------
  const handleFinalizeTrip = async () => {
    if (selectedDestinations.length === 0) {
      triggerToast('Please select at least one destination.');
      setStep(1);
      return;
    }
    if (!startDate || !endDate) {
      triggerToast('Please select your travel start and end dates.');
      setStep(1);
      return;
    }
    setIsFinalizing(true);
    try {
      const primaryDestination = selectedDestinations[0] || 'Sri Lanka';
      const totalTravelers = adultsCount + childrenCount > 0 ? adultsCount + childrenCount : 1;
      const finalBudget = typeof budgetAmount === 'number' && budgetAmount > 0 ? budgetAmount : totalEstimatedTripCost;

      // 1. Backend payload
      const tripPayload = {
        destination: selectedDestinations.join(', '),
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        numberOfTravelers: totalTravelers,
        budget: finalBudget,
        interests: selectedStyles.length > 0 ? selectedStyles : ['Cultural'],
        tripStyle: selectedStyles[0] || 'Cultural',
      };

      const apiResult = await tripService.createTrip(tripPayload);

      // Primary accommodation info
      const firstHotel = Object.values(selectedAccommodations)[0];
      const hotelName = firstHotel ? `${firstHotel.name} (${firstHotel.type})` : 'Self-Arranged Accommodation';

      // 2. Format as UserTrip
      const newTrip: UserTrip = {
        id: apiResult?.id || `trip-manual-${Date.now()}`,
        name: tripName.trim() || `${selectedDestinations.join(' & ')} Journey`,
        destination: `${selectedDestinations.join(' · ')}, Sri Lanka`,
        destinationId: primaryDestination.toLowerCase(),
        dates: `${startDate} – ${endDate}`,
        duration: `${durationDays} Days`,
        travelers: totalTravelers,
        travelerNames: [`Lead Traveler (${totalTravelers} Pax)`],
        status: 'Upcoming', // Marked as Upcoming after finalization
        imageUrl: firstHotel?.image || SRI_LANKA_DESTINATIONS.find((d) => d.name === primaryDestination)?.img || '',
        budget: `$${finalBudget}`,
        spentBudget: `$${totalEstimatedTripCost}`,
        isFeatured: true,
        interests: selectedStyles,
        notes: `Accommodation: ${hotelName}. Local Transport: ${
          transportMode === 'PUBLIC_TRANSPORT' && selectedPublicTransport
            ? `Public Transport (${selectedPublicTransport.transportType === 'BUS' ? `Bus Route ${selectedPublicTransport.routeNumber || ''}` : `Train ${selectedPublicTransport.trainNumber || ''}`}: ${selectedPublicTransport.origin} to ${selectedPublicTransport.destination}, Fare: LKR ${(selectedPublicTransport.estimatedFare || 0).toLocaleString()})`
            : transportMode === 'PUBLIC_TRANSPORT'
            ? 'Public Transport (Self-arranged Bus / Train)'
            : `Private Transport (${privateVehicleType})`
        }.`,
        weatherForecast: '27°C · Pleasant & Tropical',
        progress: {
          destination: true,
          preferences: true,
          aiPlanning: false,
          itinerary: true,
          bookings: true,
        },
        dailyItinerary: plannedDays.map((d) => ({
          day: d.dayNumber,
          date: d.dateStr,
          title: `Day in ${d.destination}`,
          activities: d.activities.map((a) => ({
            time: a.time,
            title: a.name,
            location: a.destination,
            description: a.description || `${a.category} in ${a.destination}`,
            status: 'Planned',
            type: a.category === 'Dining' ? 'Dining' : a.category === 'Sightseeing' ? 'Sightseeing' : 'Activity',
          })),
        })),
      };

      // 3. Persist to localStorage for permanent display on TripsPage
      const existingSaved = localStorage.getItem('nova_user_trips');
      let currentTrips: UserTrip[] = [];
      if (existingSaved) {
        try {
          currentTrips = JSON.parse(existingSaved);
        } catch {
          currentTrips = [];
        }
      }
      localStorage.setItem('nova_user_trips', JSON.stringify([newTrip, ...currentTrips]));

      triggerToast('🎉 Your trip has been finalized and added to Upcoming Trips!');
      setTimeout(() => {
        navigate('/trips');
      }, 1200);
    } catch (err: any) {
      triggerToast('Saved locally to Upcoming Trips.');
      setTimeout(() => {
        navigate('/trips');
      }, 1200);
    } finally {
      setIsFinalizing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans antialiased selection:bg-teal-600 selection:text-white">
      <LandingNavbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 pt-24 pb-20">
        
        {/* Header Title & Progress Indicator */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <span className="text-[#16A6A1] font-black text-xs tracking-widest uppercase flex items-center gap-1.5 mb-1">
                <Compass className="w-4 h-4" /> MANUAL TRIP PLANNER MODULE
              </span>
              <h1 className="text-3xl sm:text-4xl font-black text-[#0B3A53] tracking-tight font-heading">
                Plan Your Customized Sri Lanka Journey
              </h1>
              <p className="text-slate-600 text-sm font-medium mt-1">
                Follow the step-by-step planner to choose destinations, select luxury stays & cabanas, build your daily drag-and-drop itinerary, and finalize your adventure.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/trips')}
              className="px-4 py-2 bg-slate-200/80 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-full transition-colors self-start sm:self-auto shrink-0"
            >
              Exit to Trips
            </button>
          </div>

          {/* Stepper Progress Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-2">
            {[
              { num: 1, title: 'Destinations' },
              { num: 2, title: 'Accommodation' },
              { num: 3, title: 'Travel Styles' },
              { num: 4, title: 'Transport' },
              { num: 5, title: 'Itinerary' },
              { num: 6, title: 'Review & Finalize' },
            ].map((st) => (
              <button
                key={st.num}
                type="button"
                onClick={() => {
                  if (st.num < step) setStep(st.num);
                  else if (st.num === 5 && step === 4) {
                    syncDaysWithDates();
                    setStep(5);
                  } else if (st.num <= step) {
                    setStep(st.num);
                  }
                }}
                className={`p-2.5 rounded-2xl border text-left transition-all ${
                  step === st.num
                    ? 'bg-white border-[#16A6A1] shadow-md ring-2 ring-[#16A6A1]/20'
                    : step > st.num
                    ? 'bg-teal-50/70 border-teal-200 text-teal-900 cursor-pointer'
                    : 'bg-white/60 border-slate-200 opacity-60'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`w-5 h-5 rounded-full text-[11px] font-black flex items-center justify-center shrink-0 ${
                      step === st.num
                        ? 'bg-[#16A6A1] text-white'
                        : step > st.num
                        ? 'bg-teal-700 text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {step > st.num ? '✓' : st.num}
                  </span>
                  <div className="min-w-0">
                    <p className="font-extrabold text-xs text-slate-900 truncate">{st.title}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* STEP 1: TRIP DETAILS & MULTI-DESTINATION SELECTION                         */}
        {/* ========================================================================= */}
        {step === 1 && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
              <h2 className="text-xl font-bold text-[#0B3A53] mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#16A6A1]" /> Trip Name & Travel Destinations
              </h2>
              <p className="text-xs text-slate-500 mb-6">
                You can select <strong>one or multiple destinations</strong> to personalize your itinerary and accommodations.
              </p>

              <div className="mb-6">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Trip Name
                </label>
                <input
                  type="text"
                  value={tripName}
                  onChange={(e) => setTripName(e.target.value)}
                  placeholder="e.g. Sri Lanka Heritage, Hills & Waves"
                  className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-300 font-bold text-[#0B3A53] focus:outline-none focus:border-[#16A6A1]"
                />
              </div>

              {/* Destination Multi-Select Grid */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Select Destinations ({selectedDestinations.length} SELECTED)
                  </label>
                  <span className="text-xs text-teal-700 font-semibold">Click cards to toggle destinations</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                  {SRI_LANKA_DESTINATIONS.map((dest) => {
                    const isSelected = selectedDestinations.includes(dest.name);
                    return (
                      <button
                        key={dest.name}
                        type="button"
                        onClick={() => toggleDestination(dest.name)}
                        className={`relative overflow-hidden rounded-2xl text-left border-2 transition-all p-3 flex flex-col justify-between h-40 cursor-pointer ${
                          isSelected
                            ? 'border-[#16A6A1] shadow-lg ring-2 ring-[#16A6A1]/20 scale-[1.01]'
                            : 'border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-95'
                        }`}
                      >
                        <img src={dest.img} alt={dest.name} className="absolute inset-0 w-full h-full object-cover -z-10" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent -z-10" />

                        <div className="flex justify-between items-start">
                          <span className="px-2 py-0.5 bg-black/60 backdrop-blur-md rounded-md text-[10px] font-bold text-white">
                            {dest.region}
                          </span>
                          {isSelected && (
                            <span className="w-5 h-5 rounded-full bg-[#16A6A1] text-white flex items-center justify-center text-xs font-bold shadow-md">
                              ✓
                            </span>
                          )}
                        </div>

                        <div>
                          <p className="text-white font-black text-base leading-tight">{dest.name}</p>
                          <p className="text-slate-200 text-[10px] line-clamp-1">{dest.highlight}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Dates, Travelers & Budget */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
              <h2 className="text-xl font-bold text-[#0B3A53] mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#16A6A1]" /> Dates, Travelers & Estimated Budget
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-300 font-bold text-[#0B3A53] focus:outline-none focus:border-[#16A6A1]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-300 font-bold text-[#0B3A53] focus:outline-none focus:border-[#16A6A1]"
                  />
                </div>

                <div className="bg-teal-50 border border-teal-200 rounded-xl p-3.5 flex flex-col justify-center">
                  <span className="text-[10px] font-extrabold uppercase text-teal-800 tracking-wider">Trip Duration</span>
                  <span className="text-xl font-black text-teal-950">
                    {startDate && endDate && durationDays > 0
                      ? `${durationDays} Days (${Math.max(0, durationDays - 1)} Nights)`
                      : 'Select Dates'}
                  </span>
                </div>
              </div>

              {/* Travelers & Budget Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900 text-sm">Adults</p>
                    <p className="text-xs text-slate-500">Age 13+</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setAdultsCount(Math.max(0, adultsCount - 1))}
                      className="w-8 h-8 rounded-full bg-white text-slate-800 font-bold border shadow-xs cursor-pointer hover:bg-slate-100"
                    >
                      -
                    </button>
                    <span className="font-black text-slate-900 text-base">{adultsCount}</span>
                    <button
                      type="button"
                      onClick={() => setAdultsCount(adultsCount + 1)}
                      className="w-8 h-8 rounded-full bg-white text-slate-800 font-bold border shadow-xs cursor-pointer hover:bg-slate-100"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900 text-sm">Children</p>
                    <p className="text-xs text-slate-500">Age 0–12</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setChildrenCount(Math.max(0, childrenCount - 1))}
                      className="w-8 h-8 rounded-full bg-white text-slate-800 font-bold border shadow-xs cursor-pointer hover:bg-slate-100"
                    >
                      -
                    </button>
                    <span className="font-black text-slate-900 text-base">{childrenCount}</span>
                    <button
                      type="button"
                      onClick={() => setChildrenCount(childrenCount + 1)}
                      className="w-8 h-8 rounded-full bg-white text-slate-800 font-bold border shadow-xs cursor-pointer hover:bg-slate-100"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Estimated Budget ($ USD)
                  </label>
                  <input
                    type="number"
                    value={budgetAmount === '' ? '' : budgetAmount}
                    onChange={(e) => {
                      const v = e.target.value;
                      setBudgetAmount(v === '' ? '' : Math.max(0, Number(v)));
                    }}
                    placeholder="Enter estimated budget (e.g. 1200)"
                    step="50"
                    className="w-full p-2.5 rounded-xl bg-white border border-slate-300 font-bold text-[#0B3A53] text-lg focus:outline-none focus:border-[#16A6A1]"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex justify-between items-center pt-4">
              <button
                type="button"
                onClick={() => navigate('/trips')}
                className="px-6 py-3.5 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs uppercase tracking-wider cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (selectedDestinations.length === 0) {
                    triggerToast('Please select at least one destination to continue.');
                    return;
                  }
                  if (!startDate || !endDate) {
                    triggerToast('Please select travel start and end dates.');
                    return;
                  }
                  if (new Date(endDate) < new Date(startDate)) {
                    triggerToast('End date cannot be earlier than start date.');
                    return;
                  }
                  if (adultsCount + childrenCount === 0) {
                    triggerToast('Please specify at least 1 traveler.');
                    return;
                  }
                  setStep(2);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-2 bg-[#16A6A1] hover:bg-[#146C86] text-white font-extrabold text-xs uppercase tracking-wider px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all cursor-pointer"
              >
                <span>Next: Accommodation Preferences</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: ACCOMMODATION PREFERENCES & BROWSING HOTELS / CABANAS            */}
        {/* ========================================================================= */}
        {step === 2 && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-[#0B3A53] flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-[#16A6A1]" /> Accommodation Preferences
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Select your preferred style and browse verified stays across your chosen destinations (<strong>{selectedDestinations.join(', ')}</strong>).
                  </p>
                </div>

                {/* Filter Tabs: 4-star, 5-star, Private cabanas */}
                <div className="flex flex-wrap gap-2">
                  {(['4-Star Hotel', '5-Star Hotel', 'Private Cabana'] as const).map((type) => {
                    const isFilterActive = preferredAccommodationType === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setPreferredAccommodationType(isFilterActive ? null : type)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold border transition-all cursor-pointer ${
                          isFilterActive
                            ? 'bg-[#0B3A53] text-white border-[#0B3A53] shadow-sm'
                            : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        {type}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Destination-by-Destination Accommodation Cards */}
              <div className="space-y-8">
                {selectedDestinations.length === 0 ? (
                  <div className="p-8 bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-center space-y-2">
                    <p className="text-sm font-bold text-slate-600">No destinations selected yet.</p>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-xs font-bold text-[#16A6A1] hover:underline cursor-pointer"
                    >
                      ← Go back to Step 1 to select destinations
                    </button>
                  </div>
                ) : (
                  selectedDestinations.map((dest) => {
                    const destAccommodations = visibleAccommodations.filter((a) => a.destination === dest);
                    const selectedForThisDest = selectedAccommodations[dest];

                    return (
                      <div key={dest} className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-[#16A6A1]"></span>
                            <h3 className="text-lg font-black text-[#0B3A53]">{dest} Accommodations</h3>
                          </div>
                          {selectedForThisDest ? (
                            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" /> Selected: {selectedForThisDest.name}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-500 font-semibold bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                              Optional: select a stay for {dest}
                            </span>
                          )}
                        </div>

                        {destAccommodations.length === 0 ? (
                          <p className="text-xs text-slate-400 italic bg-slate-50 p-4 rounded-xl">
                            No accommodations {preferredAccommodationType ? `matching "${preferredAccommodationType}"` : 'available'} in {dest}.
                          </p>
                        ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                          {destAccommodations.map((acc) => {
                            const isChosen = selectedForThisDest?.id === acc.id;

                            return (
                              <div
                                key={acc.id}
                                className={`rounded-2xl border-2 transition-all overflow-hidden flex flex-col justify-between bg-white ${
                                  isChosen
                                    ? 'border-[#16A6A1] shadow-lg ring-2 ring-[#16A6A1]/20'
                                    : 'border-slate-200 hover:border-slate-300'
                                }`}
                              >
                                <div>
                                  {/* Photo & Badges */}
                                  <div className="relative h-44 w-full overflow-hidden">
                                    <img src={acc.image} alt={acc.name} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                                    
                                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                                      <span className="px-2.5 py-1 bg-black/70 backdrop-blur-md text-white text-[10px] font-black uppercase rounded-lg">
                                        {acc.type}
                                      </span>
                                      <span
                                        className={`px-2 py-0.5 text-[10px] font-extrabold rounded-md ${
                                          acc.availability === 'Instant Confirmation'
                                            ? 'bg-emerald-600 text-white'
                                            : acc.availability === 'Few Rooms Left'
                                            ? 'bg-amber-600 text-white'
                                            : 'bg-slate-800 text-white'
                                        }`}
                                      >
                                        {acc.availability}
                                      </span>
                                    </div>

                                    <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
                                      <div>
                                        <p className="font-extrabold text-sm leading-tight text-white">{acc.name}</p>
                                        <p className="text-[11px] text-slate-200">📍 {acc.destination}</p>
                                      </div>
                                      <div className="flex items-center gap-1 bg-amber-400/90 text-slate-950 px-2 py-0.5 rounded text-xs font-black">
                                        <Star className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
                                        <span>{acc.rating}</span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Package & Key Amenities Details */}
                                  <div className="p-4 space-y-3">
                                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Featured Package</span>
                                      <p className="text-xs font-extrabold text-[#0B3A53]">{acc.packageName}</p>
                                      <p className="text-[10px] text-slate-500">{acc.packageDuration}</p>
                                    </div>

                                    <div>
                                      <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                                        Included Facilities:
                                      </span>
                                      <ul className="text-[11px] text-slate-600 space-y-1">
                                        {acc.includedFacilities.slice(0, 3).map((fac, i) => (
                                          <li key={i} className="flex items-center gap-1.5 truncate">
                                            <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                                            <span className="truncate">{fac}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>

                                    <div className="flex flex-wrap gap-1 pt-1 border-t border-slate-100">
                                      {acc.keyAmenities.slice(0, 3).map((amenity, i) => (
                                        <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-medium">
                                          {amenity}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                </div>

                                {/* Price & Selection Button */}
                                <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
                                  <div>
                                    <span className="text-base font-black text-[#0B3A53]">${acc.pricePerNight}</span>
                                    <span className="text-[10px] text-slate-500 font-medium"> / night</span>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => handleSelectAccommodation(dest, acc)}
                                    className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                                      isChosen
                                        ? 'bg-emerald-700 text-white'
                                        : 'bg-[#0B3A53] hover:bg-[#146C86] text-white shadow-sm'
                                    }`}
                                  >
                                    {isChosen ? '✓ Selected' : 'Select Stay'}
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex justify-between items-center pt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-6 py-3.5 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs uppercase tracking-wider flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Destinations
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep(3);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-2 bg-[#16A6A1] hover:bg-[#146C86] text-white font-extrabold text-xs uppercase tracking-wider px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all"
              >
                <span>Next: Travel Styles & Preferences</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: TRAVEL STYLES & PREFERENCES                                      */}
        {/* ========================================================================= */}
        {step === 3 && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
              <h2 className="text-xl font-bold text-[#0B3A53] mb-2 flex items-center gap-2">
                <Tag className="w-5 h-5 text-[#16A6A1]" /> Select Your Travel Styles & Preferences
              </h2>
              <p className="text-xs text-slate-500 mb-6">
                Choose one or multiple travel styles to shape your recommended activities and personalized itinerary.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {TRAVEL_STYLES_LIST.map((st) => {
                  const isSelected = selectedStyles.includes(st.id);

                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => toggleTravelStyle(st.id)}
                      className={`p-4 rounded-2xl border-2 text-left transition-all flex items-start gap-3.5 ${
                        isSelected
                          ? 'border-[#16A6A1] bg-teal-50/60 shadow-md ring-2 ring-[#16A6A1]/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-2xl p-2 bg-white rounded-xl shadow-xs border border-slate-200/80">
                        {st.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <h4 className="font-extrabold text-sm text-[#0B3A53]">{st.label}</h4>
                          {isSelected && (
                            <span className="w-4 h-4 rounded-full bg-[#16A6A1] text-white flex items-center justify-center text-[10px] font-bold">
                              ✓
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed">{st.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex justify-between items-center pt-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-6 py-3.5 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs uppercase tracking-wider flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Accommodation
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep(4);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-2 bg-[#16A6A1] hover:bg-[#146C86] text-white font-extrabold text-xs uppercase tracking-wider px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all"
              >
                <span>Next: Transportation & Mobility</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 4: TRANSPORTATION & MOBILITY                                         */}
        {/* ========================================================================= */}
        {step === 4 && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div>
                <h2 className="text-xl font-bold text-[#0B3A53] flex items-center gap-2">
                  <Car className="w-5 h-5 text-[#16A6A1]" /> Transportation & Local Mobility
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Choose how you'd like to get around during your holiday. Explore authentic Public Transport (Intercity Buses & Sri Lanka Railways scenic trains) or arrange dedicated Private Transport.
                </p>
              </div>

              {/* Transport Mode Switcher Tabs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Mode 1: Public Transport (Bus & Train) */}
                <button
                  type="button"
                  onClick={() => setTransportMode('PUBLIC_TRANSPORT')}
                  className={`p-5 rounded-2xl border-2 text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                    transportMode === 'PUBLIC_TRANSPORT'
                      ? 'border-[#16A6A1] bg-teal-50/60 shadow-md ring-2 ring-[#16A6A1]/20'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-teal-100/70 text-[#146C86] flex items-center justify-center shrink-0">
                        <div className="flex items-center gap-0.5">
                          <Bus className="w-4 h-4 text-[#16A6A1]" />
                          <Train className="w-4 h-4 text-[#0B3A53]" />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-extrabold text-slate-900 text-base">1. Public Transport</h3>
                          {selectedPublicTransport && (
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                              Option Selected
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500">Express highway buses & Sri Lanka Railways trains</p>
                      </div>
                    </div>
                    {transportMode === 'PUBLIC_TRANSPORT' && (
                      <span className="w-6 h-6 rounded-full bg-[#16A6A1] text-white flex items-center justify-center text-xs shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-600 bg-white/80 rounded-xl p-3 border border-teal-200/70 space-y-1">
                    <span className="font-bold text-[#0B3A53] block">Features:</span>
                    <span>Subsidized local fares, verified timetables, route intermediate stops, and mountain railways.</span>
                  </div>
                </button>

                {/* Mode 2: Private Transport */}
                <button
                  type="button"
                  onClick={() => setTransportMode('PRIVATE')}
                  className={`p-5 rounded-2xl border-2 text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                    transportMode === 'PRIVATE'
                      ? 'border-[#16A6A1] bg-teal-50/60 shadow-md ring-2 ring-[#16A6A1]/20'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                        <Car className="w-6 h-6 text-[#16A6A1]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-extrabold text-slate-900 text-base">2. Private Transport</h3>
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-200 text-slate-800">
                            {privateVehicleType}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">Dedicated licensed chauffeur vehicle</p>
                      </div>
                    </div>
                    {transportMode === 'PRIVATE' && (
                      <span className="w-6 h-6 rounded-full bg-[#16A6A1] text-white flex items-center justify-center text-xs shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-600 bg-white/80 rounded-xl p-3 border border-slate-200 space-y-1">
                    <span className="font-bold text-[#0B3A53] block">Features:</span>
                    <span>Door-to-door flexibility, English-speaking driver, luggage space, and air conditioning.</span>
                  </div>
                </button>
              </div>

              {/* Mode 1 Content: Private Transport Options */}
              {transportMode === 'PRIVATE' && (
                <div className="space-y-4 pt-2">
                  <h3 className="font-extrabold text-slate-900 text-sm">Select Vehicle Category</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { type: 'AC Sedan', pax: '3 Pax', rate: '$35/day', desc: 'Compact sedan with AC, ideal for couples or solo travelers.' },
                      { type: 'Tourist Van', pax: '7 Pax', rate: '$55/day', desc: 'Spacious high-roof mini-van, perfect for families and small groups.' },
                      { type: 'Luxury SUV', pax: '4 Pax', rate: '$75/day', desc: 'Premium 4WD SUV with extra comfort for hill-country touring.' },
                    ].map((v) => (
                      <div
                        key={v.type}
                        onClick={() => setPrivateVehicleType(v.type)}
                        className={`p-4 rounded-2xl border-2 transition-all cursor-pointer space-y-2 ${
                          privateVehicleType === v.type
                            ? 'border-[#16A6A1] bg-teal-50/50 shadow-sm'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 text-sm">{v.type}</span>
                          <span className="text-[10px] font-black uppercase text-slate-500">{v.pax}</span>
                        </div>
                        <div className="text-base font-black text-[#146C86]">{v.rate}</div>
                        <p className="text-xs text-slate-500">{v.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mode 2 Content: Public Transport Explorer (Bus & Train) */}
              {transportMode === 'PUBLIC_TRANSPORT' && (
                <div className="space-y-6 pt-2">
                  <PublicTransportExplorer
                    defaultOrigin={selectedDestinations[0] || 'Colombo Fort'}
                    defaultDestination={selectedDestinations[1] || selectedDestinations[0] || 'Kandy'}
                    defaultDate={startDate}
                    travelersCount={adultsCount + childrenCount > 0 ? adultsCount + childrenCount : 1}
                    availableDestinations={selectedDestinations}
                    selectedTransport={selectedPublicTransport}
                    onSelectTransport={(opt: TransportOption) => {
                      setSelectedPublicTransport(opt);
                      triggerToast(`Selected ${opt.transportType === 'BUS' ? 'Bus Route ' + (opt.routeNumber || '') : 'Train ' + (opt.trainNumber || '')}: ${opt.origin} to ${opt.destination}!`);
                    }}
                    onClearTransport={() => {
                      setSelectedPublicTransport(null);
                      triggerToast('Cleared public transport choice.');
                    }}
                  />
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="flex justify-between items-center pt-4">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-6 py-3.5 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs uppercase tracking-wider flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Styles
              </button>
              <button
                type="button"
                onClick={() => {
                  syncDaysWithDates();
                  setStep(5);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-2 bg-[#16A6A1] hover:bg-[#146C86] text-white font-extrabold text-xs uppercase tracking-wider px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all"
              >
                <span>Proceed to Drag-and-Drop Itinerary</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 5: DRAG-AND-DROP ITINERARY BUILDER & AI RECOMMENDATIONS              */}
        {/* ========================================================================= */}
        {step === 5 && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Header with AI Recommendations Button */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-black uppercase text-[#16A6A1] tracking-widest block">
                  INTERACTIVE ITINERARY PLANNER
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-[#0B3A53]">
                  Trip → Date → Destination → Activities
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Drag and drop activities into any day, reorder them, or click AI Recommendations to auto-sequence suitable activities.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAIOptimizeItinerary}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#0B3A53] to-[#146C86] hover:from-[#072537] hover:to-[#0B3A53] text-white font-extrabold text-xs uppercase tracking-wider px-6 py-3.5 rounded-full shadow-md hover:shadow-lg transition-all shrink-0 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>AI Auto-Optimize Itinerary</span>
              </button>
            </div>

            {/* Main Builder Two-Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* LEFT: Date-by-Date Schedule Timeline (7 cols) */}
              <div className="lg:col-span-7 space-y-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Days Schedule ({plannedDays.length} Days)
                  </span>
                  <span className="text-[11px] text-teal-800 font-bold bg-teal-50 px-2 py-0.5 rounded-md">
                    Drop items onto any date box
                  </span>
                </div>

                {/* Selected Public Transport Intercity Connection Banner */}
                {transportMode === 'PUBLIC_TRANSPORT' && selectedPublicTransport && (
                  <div className="bg-gradient-to-r from-teal-50 to-blue-50 border border-teal-200/80 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#0B3A53] text-white flex items-center justify-center shrink-0">
                        {selectedPublicTransport.transportType === 'BUS' ? (
                          <Bus className="w-5 h-5 text-emerald-300" />
                        ) : (
                          <Train className="w-5 h-5 text-amber-300" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase tracking-wider bg-teal-100 text-[#0B3A53] px-2 py-0.5 rounded-full">
                            Transit Link: {selectedPublicTransport.transportType === 'BUS' ? `Bus Route ${selectedPublicTransport.routeNumber}` : `Train ${selectedPublicTransport.trainNumber}`}
                          </span>
                          <span className="text-xs font-bold text-slate-700">
                            {selectedPublicTransport.origin} → {selectedPublicTransport.destination}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {selectedPublicTransport.departureTime} – {selectedPublicTransport.arrivalTime} ({selectedPublicTransport.durationMinutes} mins) · Fare: LKR {(selectedPublicTransport.estimatedFare || 0).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep(4)}
                      className="text-xs font-bold text-[#16A6A1] hover:underline shrink-0 cursor-pointer"
                    >
                      Change Transit
                    </button>
                  </div>
                )}

                {plannedDays.map((day, dIdx) => {
                  const dayMinutes = getDayTotalMinutes(day);
                  const isOverloaded = dayMinutes > 480; // > 8 hours of activities in 1 day

                  return (
                    <div
                      key={day.dayNumber}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => handleDropOnDay(dIdx)}
                      className={`bg-white border-2 rounded-2xl p-5 shadow-sm transition-all ${
                        activeDateIndex === dIdx
                          ? 'border-[#16A6A1] ring-2 ring-[#16A6A1]/15'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                      onClick={() => setActiveDateIndex(dIdx)}
                    >
                      {/* Day Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 bg-[#0B3A53] text-white rounded-lg text-xs font-black">
                            Day 0{day.dayNumber}
                          </span>
                          <div>
                            <span className="text-xs font-bold text-slate-800 block">{day.dateStr}</span>
                          </div>
                        </div>

                        {/* Destination selector for this specific date */}
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase text-slate-400">Destination:</span>
                          <select
                            value={day.destination}
                            onChange={(e) => handleChangeDayDestination(dIdx, e.target.value)}
                            className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-bold text-[#0B3A53] focus:outline-none"
                          >
                            {selectedDestinations.map((d) => (
                              <option key={d} value={d}>
                                {d}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Realism Warning Indicator */}
                      {isOverloaded && (
                        <div className="mb-3 p-2.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-xs text-amber-900 font-semibold">
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>
                            Schedule Warning: Total duration ({Math.round(dayMinutes / 60)}h {dayMinutes % 60}m) exceeds 8 hours. Consider moving some activities to another date.
                          </span>
                        </div>
                      )}

                      {/* Activities List inside Day */}
                      <div className="space-y-2.5 min-h-[70px]">
                        {day.activities.length === 0 ? (
                          <div className="p-4 border-2 border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-400">
                            Drag activities from the right panel here, or click "Add" on any recommendation.
                          </div>
                        ) : (
                          day.activities.map((act, actIdx) => (
                            <div
                              key={act.id}
                              draggable
                              onDragStart={() => handleDragStartFromDay(act, dIdx)}
                              className="bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl p-3 flex items-center justify-between gap-3 shadow-2xs cursor-grab active:cursor-grabbing"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <GripVertical className="w-4 h-4 text-slate-400 shrink-0" />
                                <span className="px-2 py-0.5 bg-white border border-slate-200 text-slate-700 rounded text-[11px] font-extrabold shrink-0">
                                  {act.time}
                                </span>
                                <div className="min-w-0">
                                  <p className="font-bold text-xs text-slate-900 truncate">{act.name}</p>
                                  <p className="text-[10px] text-slate-500">
                                    {act.durationMinutes} mins · {act.category}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-xs font-black text-[#0B3A53]">
                                  {act.cost > 0 ? `$${act.cost}` : 'Free'}
                                </span>
                                
                                {/* Move up/down */}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMoveActivityWithinDay(dIdx, actIdx, 'up');
                                  }}
                                  disabled={actIdx === 0}
                                  className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                                  title="Move earlier"
                                >
                                  <MoveUp className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMoveActivityWithinDay(dIdx, actIdx, 'down');
                                  }}
                                  disabled={actIdx === day.activities.length - 1}
                                  className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                                  title="Move later"
                                >
                                  <MoveDown className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveActivity(dIdx, act.id);
                                  }}
                                  className="p-1 text-slate-400 hover:text-rose-600 rounded"
                                  title="Remove activity"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* RIGHT: Activity Recommendations Pool (5 cols) */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm sticky top-24">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
                    <div>
                      <span className="text-[10px] font-black uppercase text-[#16A6A1] block">ACTIVITY POOL</span>
                      <h3 className="text-base font-black text-[#0B3A53]">
                        {activeDay?.destination} Recommendations
                      </h3>
                    </div>
                    <span className="text-xs text-slate-400 font-medium">
                      Day {activeDateIndex + 1} Target
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 mb-3">
                    Drag any card into Day {activeDateIndex + 1} or click <strong>+ Add to Day</strong>.
                  </p>

                  <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                    {recommendedActivitiesForDay.map((act) => (
                      <div
                        key={act.id}
                        draggable
                        onDragStart={() => handleDragStartFromPool(act)}
                        className="p-3.5 bg-slate-50 border border-slate-200 hover:border-[#16A6A1] rounded-2xl transition-all shadow-xs cursor-grab active:cursor-grabbing hover:bg-white"
                      >
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <h4 className="font-extrabold text-xs text-[#0B3A53] leading-snug">{act.name}</h4>
                          <span className="text-xs font-black text-teal-800 shrink-0">
                            {act.estimatedCost > 0 ? `$${act.estimatedCost}` : 'Free'}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-600 line-clamp-2 mb-2">{act.description}</p>

                        <div className="flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-200/70 pt-2">
                          <span>⏱ {act.durationMinutes} mins · {act.recommendedTime}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const scheduled: ScheduledActivity = {
                                id: `sched-click-${Date.now()}-${Math.random()}`,
                                sourceActivityId: act.id,
                                name: act.name,
                                destination: activeDay.destination,
                                category: act.category,
                                durationMinutes: act.durationMinutes,
                                cost: act.estimatedCost,
                                time: act.recommendedTime.split(' ')[1] ? `${act.recommendedTime.split(' ')[1]} ${act.recommendedTime.split(' ')[2]}` : '10:00 AM',
                                description: act.description,
                              };
                              const updated = [...plannedDays];
                              updated[activeDateIndex].activities.push(scheduled);
                              setPlannedDays(updated);
                              triggerToast(`Added ${act.name} to Day ${activeDateIndex + 1}!`);
                            }}
                            className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-teal-50 hover:border-teal-300 text-[#0B3A53] rounded-lg font-bold transition-colors cursor-pointer"
                          >
                            + Add to Day
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>

            {/* Bottom Actions */}
            <div className="flex justify-between items-center pt-4">
              <button
                type="button"
                onClick={() => setStep(4)}
                className="px-6 py-3.5 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs uppercase tracking-wider flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Transport
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep(6);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-2 bg-[#16A6A1] hover:bg-[#146C86] text-white font-extrabold text-xs uppercase tracking-wider px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all"
              >
                <span>Proceed to Trip Review & Summary</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 6: TRIP REVIEW & COMPREHENSIVE FINANCIAL SUMMARY                     */}
        {/* ========================================================================= */}
        {step === 6 && (
          <div className="space-y-8 animate-in fade-in duration-200">
            
            {/* Review Header Banner */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6 mb-6">
                <div>
                  <span className="text-[10px] font-black uppercase text-[#16A6A1] tracking-widest block mb-1">
                    FINAL STEP · TRIP REVIEW
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-[#0B3A53]">{tripName}</h2>
                  <p className="text-slate-600 text-sm font-medium mt-0.5">
                    📍 {selectedDestinations.join(' · ')}, Sri Lanka · {startDate} to {endDate} ({durationDays} Days)
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-400 block">ESTIMATED BUDGET</span>
                  <span className="text-2xl font-black text-[#0B3A53]">
                    {typeof budgetAmount === 'number' && budgetAmount > 0 ? `$${budgetAmount}` : 'Not Set'}
                  </span>
                </div>
              </div>

              {/* 1. Trip Details Summary */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-black uppercase tracking-wider text-[#0B3A53] flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#16A6A1]" /> Trip Details & Destinations
                  </h3>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-xs font-bold text-[#16A6A1] hover:underline cursor-pointer"
                  >
                    Edit Details
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block font-bold">Destinations</span>
                    <span className="font-extrabold text-slate-900">
                      {selectedDestinations.length > 0 ? selectedDestinations.join(', ') : 'None selected'}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block font-bold">Dates & Duration</span>
                    <span className="font-extrabold text-slate-900">
                      {startDate && endDate && durationDays > 0 ? `${durationDays} Days (${startDate} to ${endDate})` : 'Not set'}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block font-bold">Travelers</span>
                    <span className="font-extrabold text-slate-900">
                      {adultsCount + childrenCount > 0 ? `${adultsCount + childrenCount} Persons (${adultsCount} Adults, ${childrenCount} Kids)` : 'None'}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block font-bold">Travel Styles</span>
                    <span className="font-extrabold text-slate-900">
                      {selectedStyles.length > 0 ? selectedStyles.slice(0, 2).join(', ') : 'None selected'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. Accommodation Summary */}
              <div className="mb-6 border-t border-slate-200 pt-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-black uppercase tracking-wider text-[#0B3A53] flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-[#16A6A1]" /> Selected Accommodation(s)
                  </h3>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="text-xs font-bold text-[#16A6A1] hover:underline cursor-pointer"
                  >
                    Edit Stays
                  </button>
                </div>

                {Object.keys(selectedAccommodations).length === 0 ? (
                  <p className="text-xs text-slate-400 italic bg-slate-50 p-4 rounded-xl">
                    No accommodation selected. You can self-arrange lodging or click "Edit Stays" to pick a hotel or cabana.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Object.entries(selectedAccommodations).map(([dest, acc]) => (
                      <div key={dest} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img src={acc.image} alt={acc.name} className="w-14 h-14 rounded-xl object-cover" />
                          <div>
                            <span className="text-[10px] font-black uppercase text-[#16A6A1] block">{dest} · {acc.type}</span>
                            <h4 className="font-extrabold text-sm text-slate-900">{acc.name}</h4>
                            <p className="text-xs text-slate-500">{acc.packageName}</p>
                          </div>
                        </div>
                        <span className="text-sm font-black text-[#0B3A53]">${acc.pricePerNight}/nt</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 3. Transportation & Mobility Summary */}
              <div className="mb-6 border-t border-slate-200 pt-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-black uppercase tracking-wider text-[#0B3A53] flex items-center gap-1.5">
                    <Car className="w-4 h-4 text-[#16A6A1]" /> Transportation & Local Mobility
                  </h3>
                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    className="text-xs font-bold text-[#16A6A1] hover:underline cursor-pointer"
                  >
                    Edit Transport
                  </button>
                </div>

                {transportMode === 'PUBLIC_TRANSPORT' && selectedPublicTransport ? (
                  <div className="bg-teal-50/70 border border-teal-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start sm:items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#0B3A53] text-white flex items-center justify-center shrink-0">
                        {selectedPublicTransport.transportType === 'BUS' ? (
                          <Bus className="w-5 h-5 text-emerald-300" />
                        ) : (
                          <Train className="w-5 h-5 text-amber-300" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase tracking-wider bg-teal-100 text-[#0B3A53] px-2 py-0.5 rounded-full font-bold">
                            {selectedPublicTransport.transportType === 'BUS' ? 'Public Express Bus' : 'Sri Lanka Railways Train'}
                          </span>
                          <span className="text-xs font-mono font-bold text-slate-700">
                            {selectedPublicTransport.transportType === 'BUS' ? `Route ${selectedPublicTransport.routeNumber}` : `No. ${selectedPublicTransport.trainNumber}`}
                          </span>
                        </div>
                        <h4 className="font-extrabold text-sm text-slate-900 mt-0.5">
                          {selectedPublicTransport.routeName || selectedPublicTransport.trainName} ({selectedPublicTransport.origin} → {selectedPublicTransport.destination})
                        </h4>
                        <p className="text-xs text-slate-600">
                          {selectedPublicTransport.departureTime} – {selectedPublicTransport.arrivalTime} ({selectedPublicTransport.durationMinutes} mins) · {selectedPublicTransport.trainType || 'Intercity Express Service'} · {selectedPublicTransport.intermediateStops?.length || 0} Intermediate Stops
                        </p>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-2 sm:pt-0 border-teal-200/50">
                      <span className="text-sm font-black text-[#0B3A53]">
                        LKR {(selectedPublicTransport.estimatedFare || 0).toLocaleString()}
                      </span>
                      <span className="text-[11px] text-teal-800 font-bold">
                        ~${Math.round(((selectedPublicTransport.estimatedFare || 0) / 300) * (adultsCount + childrenCount > 0 ? adultsCount + childrenCount : 1))} ({adultsCount + childrenCount > 0 ? adultsCount + childrenCount : 1} pax)
                      </span>
                    </div>
                  </div>
                ) : transportMode === 'PUBLIC_TRANSPORT' && !selectedPublicTransport ? (
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center">
                        <Bus className="w-5 h-5 text-slate-600" />
                      </div>
                      <div>
                        <span className="text-xs font-extrabold text-slate-800 block">Public Transport (Buses & Trains)</span>
                        <span className="text-[11px] text-slate-500">Flexible public transit chosen. No specific timetable route locked.</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep(4)}
                      className="text-xs font-bold text-[#16A6A1] hover:underline cursor-pointer"
                    >
                      Select Bus/Train
                    </button>
                  </div>
                ) : (
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-extrabold text-slate-700 block">Private Transport ({privateVehicleType})</span>
                      <span className="text-[11px] text-slate-500">Dedicated licensed vehicle for your itinerary days.</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep(4)}
                      className="text-xs font-bold text-[#16A6A1] hover:underline cursor-pointer"
                    >
                      Change
                    </button>
                  </div>
                )}
              </div>

              {/* 4. Activities Itinerary Organized by Date */}
              <div className="mb-6 border-t border-slate-200 pt-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-black uppercase tracking-wider text-[#0B3A53] flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-[#16A6A1]" /> Daily Itinerary Schedule
                  </h3>
                  <button
                    type="button"
                    onClick={() => setStep(5)}
                    className="text-xs font-bold text-[#16A6A1] hover:underline cursor-pointer"
                  >
                    Edit Activities
                  </button>
                </div>

                <div className="space-y-3">
                  {plannedDays.map((d) => (
                    <div key={d.dayNumber} className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-black text-[#0B3A53]">
                          Day {d.dayNumber} · {d.dateStr} (📍 {d.destination})
                        </span>
                        <span className="text-[11px] font-bold text-slate-500">
                          {d.activities.length} activities scheduled
                        </span>
                      </div>

                      {d.activities.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {d.activities.map((a) => (
                            <span
                              key={a.id}
                              className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 flex items-center gap-1.5"
                            >
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>{a.time} {a.name}</span>
                              <strong className="text-teal-800 font-bold">({a.cost > 0 ? `$${a.cost}` : 'Free'})</strong>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">No activities planned for this day.</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 5. Comprehensive Financial Summary */}
              <div className="border-t-2 border-slate-200 pt-6">
                <h3 className="text-base font-black uppercase tracking-wider text-[#0B3A53] mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-[#16A6A1]" /> Comprehensive Financial Summary
                </h3>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-700">
                    <span>Accommodation Subtotal ({totalNights} Nights)</span>
                    <span className="font-bold text-slate-900">${totalAccommodationCost}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-700">
                    <span>Transportation Allowance & Mobility Options</span>
                    <span className="font-bold text-slate-900">${estimatedTransportCost}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-700">
                    <span>Activities & Attraction Admissions</span>
                    <span className="font-bold text-slate-900">${totalActivityCost}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-700">
                    <span>Estimated Tourism Taxes & Service Fees (8%)</span>
                    <span className="font-bold text-slate-900">${taxesAndFees}</span>
                  </div>

                  <div className="border-t border-slate-200 pt-3 flex items-center justify-between">
                    <div>
                      <span className="text-sm font-black text-[#0B3A53] block">Total Estimated Trip Cost</span>
                      <span className="text-[11px] text-slate-500">Includes lodging, transport, & admissions</span>
                    </div>
                    <span className="text-2xl font-black text-teal-800">${totalEstimatedTripCost}</span>
                  </div>

                  {/* Budget Health Indicator */}
                  <div className="pt-2">
                    {typeof budgetAmount === 'number' && budgetAmount > 0 ? (
                      remainingBudget >= 0 ? (
                        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900 font-bold">
                          <span className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            Within Estimated Budget (${budgetAmount})
                          </span>
                          <span>+${remainingBudget} Remaining</span>
                        </div>
                      ) : (
                        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between text-xs text-rose-900 font-bold">
                          <span className="flex items-center gap-1.5">
                            <AlertTriangle className="w-4 h-4 text-rose-600" />
                            Over Initial Budget (${budgetAmount})
                          </span>
                          <span>-${Math.abs(remainingBudget)}</span>
                        </div>
                      )
                    ) : (
                      <div className="p-3 bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-between text-xs text-slate-700 font-semibold">
                        <span>No budget limit set in Step 1.</span>
                        <button
                          type="button"
                          onClick={() => setStep(1)}
                          className="text-[#16A6A1] font-bold hover:underline cursor-pointer"
                        >
                          Set Budget
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>

            {/* Bottom Actions: Finalize Trip */}
            <div className="flex justify-between items-center pt-4">
              <button
                type="button"
                onClick={() => setStep(5)}
                className="px-6 py-3.5 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs uppercase tracking-wider flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Itinerary
              </button>

              <button
                type="button"
                onClick={handleFinalizeTrip}
                disabled={isFinalizing}
                className="inline-flex items-center gap-2 bg-[#16A6A1] hover:bg-[#146C86] text-white font-black text-sm uppercase tracking-wider px-10 py-4 rounded-full shadow-xl hover:shadow-2xl transition-all cursor-pointer disabled:opacity-50"
              >
                {isFinalizing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Finalizing Journey...</span>
                  </>
                ) : (
                  <>
                    <BadgeCheck className="w-5 h-5" />
                    <span>Finalize Trip & Save to Upcoming Trips</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
};

export default ManualTripPlannerPage;
