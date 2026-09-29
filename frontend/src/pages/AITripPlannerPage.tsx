import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  Sparkles,
  ArrowRight,
  Calendar,
  Users,
  MapPin,
  CheckCircle2,
  X,
  Check,
  RefreshCw,
  Clock,
  Car,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  DollarSign,
  ShieldCheck,
  Tag,
  Smartphone,
  ExternalLink,
  Gift,
  Building2,
  BedDouble,
  Shield,
} from 'lucide-react';
import { LandingNavbar } from '../components/navigation/LandingNavbar';
import { Footer } from '../components/navigation/Footer';
import { tripPlannerService } from '../services/tripPlannerService';
import { TripPlan, ItineraryDayItem, ItineraryActivityItem } from '../types/tripPlanner';
import { UserTrip, TripBookingDetail } from '../mock/tripsData';
import { AccommodationItem, ACCOMMODATIONS_CATALOG } from '../mock/manualPlannerData';
import { StaycationSelector } from '../components/staycations/StaycationSelector';
import { StaycationBookingModal } from '../components/staycations/StaycationBookingModal';
import kandyImg from '../assets/destinations/Kandy.jpg';
import ellaImg from '../assets/destinations/Ella.jpg';
import galleImg from '../assets/destinations/Galle.jpg';
import sigiriyaImg from '../assets/destinations/sigiriya.jpg';
import yalaImg from '../assets/destinations/Yala.jpg';
import mirissaImg from '../assets/destinations/Mirissa.jpg';
import anuradhapuraImg from '../assets/destinations/Anuradhapura.jpg';
import hortonPlainsImg from '../assets/destinations/Horton Plains.jpg';

export const AITripPlannerPage: React.FC = () => {
  const navigate = useNavigate();

  // Wizard Step State (1..7 wizard steps, 8 = AI Loading Animation, 9 = Generated Itinerary View)
  const [step, setStep] = useState<number>(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Form Inputs
  const [tripName, setTripName] = useState<string>('');
  const [destination, setDestination] = useState<string>('Sri Lanka');
  const [selectedDestinations, setSelectedDestinations] = useState<string[]>([]);
  const [letAiRecommend, setLetAiRecommend] = useState<boolean>(false);
  const [customDestinations, setCustomDestinations] = useState<string[]>([]);
  const [customDestinationInput, setCustomDestinationInput] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [travelersCount, setTravelersCount] = useState<number>(2);
  const [adultsCount, setAdultsCount] = useState<number>(2);
  const [childrenCount, setChildrenCount] = useState<number>(0);

  const [currency, setCurrency] = useState<string>('USD');
  const [budgetAmount, setBudgetAmount] = useState<number>(600);
  const [budgetCategory, setBudgetCategory] = useState<'Budget' | 'Moderate' | 'Luxury' | ''>('');

  const [selectedTravelStyles, setSelectedTravelStyles] = useState<string[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [specialRequirements, setSpecialRequirements] = useState<string>('');

  const [accommodationPref, setAccommodationPref] = useState<string>('');
  const [transportPref, setTransportPref] = useState<string>('');

  // Staycation Selection & Booking State
  const [selectedStaycations, setSelectedStaycations] = useState<Record<string, AccommodationItem>>({});
  const [aiDecidesStaycation, setAiDecidesStaycation] = useState<boolean>(true);
  const [bookedStaycations, setBookedStaycations] = useState<Record<string, TripBookingDetail>>({});
  const [activeStaycationToBook, setActiveStaycationToBook] = useState<AccommodationItem | null>(null);

  // AI Animation State
  const [aiStepIndex, setAiStepIndex] = useState<number>(0);
  const [aiStatusText, setAiStatusText] = useState<string>('Understanding your travel preferences...');

  // Generated Plan & Editing State
  const [generatedPlan, setGeneratedPlan] = useState<TripPlan | null>(null);
  const [isEditingTitle, setIsEditingTitle] = useState<boolean>(false);
  const [customTitleInput, setCustomTitleInput] = useState<string>('');
  const [editingActivity, setEditingActivity] = useState<{ dayIndex: number; activityIndex: number; activity: ItineraryActivityItem } | null>(null);
  const [showAddActivityModal, setShowAddActivityModal] = useState<number | null>(null); // day index
  const [newActivityTitle, setNewActivityTitle] = useState<string>('');
  const [newActivityTime, setNewActivityTime] = useState<string>('02:00 PM');
  const [newActivityCost, setNewActivityCost] = useState<number>(15);
  const [regeneratingDayIndex, setRegeneratingDayIndex] = useState<number | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Duration helper
  const calculateDurationDays = () => {
    if (!startDate || !endDate) return 0;
    const s = new Date(startDate);
    const e = new Date(endDate);
    const diff = Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
    return isNaN(diff) || diff <= 0 ? 0 : diff;
  };

  const durationDays = calculateDurationDays();

  const destinationOptions = ['Kandy', 'Ella', 'Galle', 'Sigiriya', 'Yala', 'Nuwara Eliya', 'Mirissa', 'Anuradhapura', 'Trincomalee'];

  const toggleDestination = (dest: string) => {
    if (selectedDestinations.includes(dest)) {
      setSelectedDestinations(selectedDestinations.filter((d) => d !== dest));
    } else {
      setSelectedDestinations([...selectedDestinations, dest]);
    }
  };

  const handleAddCustomDestination = () => {
    const trimmed = customDestinationInput.trim();
    if (!trimmed) return;

    const newPlaces = trimmed
      .split(',')
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    let updatedSelected = [...selectedDestinations];
    let updatedCustom = [...customDestinations];

    newPlaces.forEach((place) => {
      const formatted = place.charAt(0).toUpperCase() + place.slice(1);
      if (!updatedSelected.some((d) => d.toLowerCase() === formatted.toLowerCase())) {
        updatedSelected.push(formatted);
      }
      if (!updatedCustom.some((d) => d.toLowerCase() === formatted.toLowerCase())) {
        updatedCustom.push(formatted);
      }
    });

    if (letAiRecommend) setLetAiRecommend(false);
    setSelectedDestinations(updatedSelected);
    setCustomDestinations(updatedCustom);
    setCustomDestinationInput('');
    triggerToast(`Added ${newPlaces.length > 1 ? 'destinations' : `"${newPlaces[0]}"`} to your trip!`);
  };

  const handleRemoveCustomDestination = (placeToRemove: string) => {
    setCustomDestinations(customDestinations.filter((d) => d !== placeToRemove));
    setSelectedDestinations(selectedDestinations.filter((d) => d !== placeToRemove));
    triggerToast(`Removed "${placeToRemove}"`);
  };

  const travelStyleOptions = [
    { label: 'Adventure', icon: '🧗' },
    { label: 'Relaxation', icon: '🧘' },
    { label: 'Cultural', icon: '🏛️' },
    { label: 'Nature', icon: '🌿' },
    { label: 'Beach', icon: '🏖️' },
    { label: 'Wildlife', icon: '🐆' },
    { label: 'Photography', icon: '📸' },
    { label: 'Food', icon: '🍛' },
    { label: 'Shopping', icon: '🛍️' },
    { label: 'Family', icon: '👨‍👩‍👧‍👦' },
    { label: 'Romantic', icon: '💖' },
    { label: 'Backpacking', icon: '🎒' },
    { label: 'Luxury', icon: '✨' },
  ];

  const toggleTravelStyle = (style: string) => {
    if (selectedTravelStyles.includes(style)) {
      setSelectedTravelStyles(selectedTravelStyles.filter((s) => s !== style));
    } else {
      setSelectedTravelStyles([...selectedTravelStyles, style]);
    }
  };

  const activityOptions = ['Hiking', 'Beaches', 'Historical sites', 'Temples', 'Wildlife safaris', 'Water activities', 'Museums', 'Local food', 'Photography', 'Nightlife', 'Shopping'];

  const toggleActivity = (act: string) => {
    if (selectedActivities.includes(act)) {
      setSelectedActivities(selectedActivities.filter((a) => a !== act));
    } else {
      setSelectedActivities([...selectedActivities, act]);
    }
  };

  const accommodationOptions = ['Budget', '3 Star', '4 Star', '5 Star', 'Boutique', 'Hostel', 'Guesthouse', 'Let AI decide'];

  const transportOptions = ['Private vehicle', 'Taxi', 'Public transport', 'Train', 'Bus', 'Rental vehicle', 'Let AI decide'];

  // Step 7: Generate Trip Handler
  const handleGenerateTrip = async () => {
    if (new Date(endDate) < new Date(startDate)) {
      triggerToast('End date cannot be earlier than start date!');
      return;
    }

    setStep(8); // Show AI Planning Animation
    setAiStepIndex(0);
    setAiStatusText('Understanding your travel preferences...');

    const loadingSteps = [
      'Understanding your travel preferences...',
      'Finding suitable destinations...',
      'Building your route...',
      'Planning daily activities...',
      'Optimizing your itinerary...',
      'Validating your trip...',
    ];

    let currentStep = 0;
    const stepInterval = setInterval(() => {
      currentStep++;
      if (currentStep < loadingSteps.length) {
        setAiStepIndex(currentStep);
        setAiStatusText(loadingSteps[currentStep]);
      }
    }, 700);

    try {
      const plan = await tripPlannerService.generateTripPlan({
        tripName: tripName.trim() || undefined,
        destination,
        destinations: selectedDestinations.length > 0 ? selectedDestinations : ['Sigiriya', 'Kandy', 'Ella'],
        startDate: startDate || new Date().toISOString().split('T')[0],
        endDate: endDate || new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
        travelers: travelersCount,
        adults: adultsCount,
        children: childrenCount,
        budget: {
          amount: budgetAmount,
          currency,
          category: (budgetCategory as any) || 'Moderate',
        },
        travelStyle: selectedTravelStyles.length > 0 ? selectedTravelStyles : ['Cultural', 'Nature'],
        activities: selectedActivities.length > 0 ? selectedActivities : ['Hiking', 'Temples'],
        accommodationPreference: accommodationPref || '3 Star',
        transportPreference: transportPref || 'Public Transport (Trains & Buses)',
        specialRequirements,
      });

      clearInterval(stepInterval);
      if (tripName.trim() && plan && plan.trip) {
        plan.trip.title = tripName.trim();
      }
      setCustomTitleInput(plan.trip?.title || tripName.trim());
      setGeneratedPlan(plan);
      setStep(9); // Show Result Page
      triggerToast('AI Trip Plan generated successfully!');
    } catch (err: any) {
      clearInterval(stepInterval);
      setStep(7);
      triggerToast(err.message || 'Failed to generate itinerary. Please try again.');
    }
  };

  // Activity Edit & Management Handlers
  const handleSaveEditedActivity = () => {
    if (!editingActivity || !generatedPlan) return;
    const { dayIndex, activityIndex, activity } = editingActivity;

    const newDays = [...generatedPlan.days];
    newDays[dayIndex].activities[activityIndex] = activity;
    newDays[dayIndex].estimatedCost = newDays[dayIndex].activities.reduce((s, a) => s + a.estimatedCost, 0);

    setGeneratedPlan({ ...generatedPlan, days: newDays });
    setEditingActivity(null);
    triggerToast('Activity updated!');
  };

  const handleDeleteActivity = (dayIdx: number, actIdx: number) => {
    if (!generatedPlan) return;
    const newDays = [...generatedPlan.days];
    newDays[dayIdx].activities.splice(actIdx, 1);
    newDays[dayIdx].estimatedCost = newDays[dayIdx].activities.reduce((s, a) => s + a.estimatedCost, 0);
    setGeneratedPlan({ ...generatedPlan, days: newDays });
    triggerToast('Activity removed');
  };

  const handleAddActivitySubmit = (dayIdx: number) => {
    if (!generatedPlan || !newActivityTitle.trim()) return;
    const newDays = [...generatedPlan.days];
    const newAct: ItineraryActivityItem = {
      id: `act-new-${Date.now()}`,
      time: newActivityTime,
      title: newActivityTitle,
      location: newDays[dayIdx].location,
      durationMinutes: 90,
      estimatedCost: newActivityCost,
      description: 'Custom activity added by traveler.',
      type: 'Activity',
    };
    newDays[dayIdx].activities.push(newAct);
    newDays[dayIdx].estimatedCost = newDays[dayIdx].activities.reduce((s, a) => s + a.estimatedCost, 0);
    setGeneratedPlan({ ...generatedPlan, days: newDays });
    setShowAddActivityModal(null);
    setNewActivityTitle('');
    triggerToast('New activity added to schedule!');
  };

  const handleRegenerateDay = async (dayIdx: number) => {
    if (!generatedPlan) return;
    setRegeneratingDayIndex(dayIdx);
    try {
      const targetDay = generatedPlan.days[dayIdx];
      const newDay = await tripPlannerService.regenerateDay(targetDay.day, targetDay.location, {
        destination,
        destinations: selectedDestinations,
        startDate,
        endDate,
        travelers: travelersCount,
        budget: { amount: budgetAmount, currency },
        travelStyle: selectedTravelStyles,
        activities: selectedActivities,
      });

      const newDays = [...generatedPlan.days];
      newDays[dayIdx] = newDay;
      setGeneratedPlan({ ...generatedPlan, days: newDays });
      triggerToast(`Day ${targetDay.day} recalculated with fresh recommendations!`);
    } catch (err: any) {
      triggerToast(err.message || 'Failed to regenerate day');
    } finally {
      setRegeneratingDayIndex(null);
    }
  };

  const handleReplaceActivity = async (dayIdx: number, actIdx: number) => {
    if (!generatedPlan) return;
    try {
      const act = generatedPlan.days[dayIdx].activities[actIdx];
      const alt = await tripPlannerService.regenerateActivity(act.id, act.title, generatedPlan.days[dayIdx].location);

      const newDays = [...generatedPlan.days];
      newDays[dayIdx].activities[actIdx] = alt;
      setGeneratedPlan({ ...generatedPlan, days: newDays });
      triggerToast('Alternative activity selected!');
    } catch (err: any) {
      triggerToast(err.message || 'Failed to replace activity');
    }
  };

  // Helper to select realistic destination image
  const getDestinationImage = (dest: string) => {
    const d = dest.toLowerCase();
    if (d.includes('sigiriya')) return sigiriyaImg;
    if (d.includes('ella')) return ellaImg;
    if (d.includes('galle')) return galleImg;
    if (d.includes('yala')) return yalaImg;
    if (d.includes('mirissa')) return mirissaImg;
    if (d.includes('anuradhapura')) return anuradhapuraImg;
    if (d.includes('horton')) return hortonPlainsImg;
    return kandyImg;
  };

  // Helper to format dates
  const formatTripDates = (startStr: string, endStr: string) => {
    try {
      const s = new Date(startStr);
      const e = new Date(endStr);
      if (!isNaN(s.getTime()) && !isNaN(e.getTime())) {
        const sDay = s.getDate();
        const eDay = e.getDate();
        const sMonth = s.toLocaleDateString('en-US', { month: 'short' });
        const eMonth = e.toLocaleDateString('en-US', { month: 'short' });
        const year = s.getFullYear();
        if (sMonth === eMonth) {
          return `${sDay} – ${eDay} ${sMonth} ${year}`;
        }
        return `${sDay} ${sMonth} – ${eDay} ${eMonth} ${year}`;
      }
    } catch {}
    return `${startStr} – ${endStr}`;
  };

  // Save Trip Handler
  const handleSaveTrip = async () => {
    if (!generatedPlan) return;
    setIsSaving(true);
    try {
      // 1. Persist to PostgreSQL database via backend API
      const savedRes = await tripPlannerService.saveTripPlan(generatedPlan, {
        destination,
        destinations: selectedDestinations.length > 0 ? selectedDestinations : [destination],
        startDate: startDate || new Date().toISOString().split('T')[0],
        endDate: endDate || new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
        travelers: travelersCount,
        budget: { amount: budgetAmount, currency, category: (budgetCategory as any) || 'Moderate' },
        travelStyle: selectedTravelStyles,
        activities: selectedActivities,
        accommodationPreference: accommodationPref || '3 Star',
        transportPreference: transportPref || 'Public Transport (Trains & Buses)',
        specialRequirements,
      });

      // 2. Build full UserTrip object for instant display on the Trips section
      const destList = generatedPlan.trip.destinations.length > 0 ? generatedPlan.trip.destinations : [destination];
      const primaryDest = destList[0] || 'Sri Lanka';
      const destTitle = destList.join(' & ');
      const newTripId = (savedRes && (savedRes as any).tripId) || `trip-ai-${Date.now()}`;

      const finalTripName = (isEditingTitle && customTitleInput.trim())
        ? customTitleInput.trim()
        : generatedPlan.trip.title || tripName.trim() || `${generatedPlan.trip.duration}-Day Tour: ${destTitle}`;

      const savedUserTrip: UserTrip = {
        id: newTripId,
        name: finalTripName,
        destination: `${destTitle}, Sri Lanka`,
        destinationId: primaryDest.toLowerCase().replace(/\s+/g, '-'),
        dates: formatTripDates(startDate, endDate),
        duration: `${generatedPlan.trip.duration || durationDays} Days`,
        travelers: generatedPlan.trip.travelers || travelersCount,
        travelerNames: ['Tourist Explorer', 'Travel Companion'],
        status: 'Upcoming',
        imageUrl: getDestinationImage(primaryDest),
        budget: `$${generatedPlan.budget.total} ${generatedPlan.budget.currency || 'USD'}`,
        spentBudget: '$0',
        isFeatured: true,
        progress: {
          destination: true,
          preferences: true,
          aiPlanning: true,
          itinerary: true,
          bookings: true,
        },
        interests: selectedTravelStyles.length > 0 ? selectedTravelStyles : ['Culture', 'Nature', 'AI Guided'],
        notes: `${generatedPlan.trip.description}. Transport: ${generatedPlan.trip.transportPreference}. Accommodation: ${generatedPlan.trip.accommodationPreference}.`,
        weatherForecast: '26°C · Pleasant & Mild',
        aiNotes: `AI-Synthesized multi-agent journey with Feasibility Score of ${generatedPlan.metadata.aiScore}%.`,
        dailyItinerary: generatedPlan.days.map((d) => ({
          day: d.day,
          date: d.date,
          title: d.title,
          activities: d.activities.map((a) => ({
            time: a.time,
            title: a.title,
            location: a.location,
            description: a.description || a.notes || 'Activity curated by AI.',
            status: 'Planned',
            type: a.type === 'Dining' ? 'Dining'
              : a.type === 'Transport' ? 'Transit'
              : a.type === 'Lodging' ? 'Stay'
              : a.type === 'Attraction' ? 'Sightseeing'
              : 'Activity',
          })),
        })),
        bookingsList: Object.values(bookedStaycations),
        budgetBreakdown: [
          { category: 'Accommodation', amount: `$${generatedPlan.budget.accommodation}` },
          { category: 'Transportation', amount: `$${generatedPlan.budget.transportation}` },
          { category: 'Activities', amount: `$${generatedPlan.budget.activities}` },
          { category: 'Food & Dining', amount: `$${generatedPlan.budget.food}` },
          { category: 'Sundry / Other', amount: `$${generatedPlan.budget.other}` },
        ],
      };

      if (Object.values(bookedStaycations).length > 0) {
        const bookedTotal = Object.values(bookedStaycations).reduce((sum, b) => {
          const num = parseInt(b.amount.replace(/[^0-9]/g, '') || '0', 10);
          return sum + num;
        }, 0);
        savedUserTrip.spentBudget = `$${bookedTotal}`;
      }

      // 3. Persist in localStorage 'nova_user_trips' so TripsPage displays it immediately
      try {
        const existingRaw = localStorage.getItem('nova_user_trips');
        let existingList: UserTrip[] = [];
        if (existingRaw) {
          try {
            existingList = JSON.parse(existingRaw);
          } catch {
            existingList = [];
          }
        }
        const updatedList = [savedUserTrip, ...existingList.filter((t) => t.id !== newTripId)];
        localStorage.setItem('nova_user_trips', JSON.stringify(updatedList));
        window.dispatchEvent(new Event('storage'));
      } catch (storageErr) {
        console.warn('LocalStorage save error:', storageErr);
      }

      setSaveSuccess(true);
      triggerToast('Trip saved! Redirecting to Your Trips...');
      setTimeout(() => {
        navigate('/trips', {
          state: {
            highlightedTripId: newTripId,
            message: `🎉 "${savedUserTrip.name}" has been added to Your Trips!`,
          },
        });
      }, 1000);
    } catch (err: any) {
      triggerToast(err.message || 'Failed to save trip. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans antialiased selection:bg-teal-600 selection:text-white">
      <LandingNavbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-8 py-8">
        {/* Step Indicator Header (Steps 1 to 7) */}
        {step <= 7 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-teal-700 font-bold text-xs tracking-wider uppercase">AI Agent Journey Planner</span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Design Your Sri Lanka Adventure</h1>
              </div>
              <span className="px-3.5 py-1 bg-teal-100/80 text-teal-800 border border-teal-200/80 rounded-full text-xs font-extrabold">
                Step {step} of 7
              </span>
            </div>

            <div className="w-full bg-slate-200/80 rounded-full h-2.5 flex overflow-hidden border border-slate-300/50">
              <div
                className="bg-teal-600 h-2.5 transition-all duration-500 ease-out"
                style={{ width: `${(step / 7) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* STEP 1: DESTINATION */}
        {step === 1 && (
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-10 shadow-xl backdrop-blur-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3.5 bg-teal-50 rounded-2xl text-teal-700 border border-teal-200/80">
                <MapPin className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Where do you want to explore?</h2>
                <p className="text-slate-600 text-sm">Select primary country and specific Sri Lankan destinations.</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Trip Name Customization */}
              <div className="bg-gradient-to-r from-teal-50/70 to-slate-50 border border-teal-200/80 rounded-2xl p-5 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-slate-900 font-bold text-sm">
                    Name Your Trip
                  </label>
                  <span className="text-[11px] font-bold text-teal-700 bg-teal-100/70 border border-teal-200/60 px-2.5 py-0.5 rounded-full">
                    Optional · Custom Name
                  </span>
                </div>
                <input
                  type="text"
                  value={tripName}
                  onChange={(e) => setTripName(e.target.value)}
                  placeholder="e.g. My Ceylon Adventure, Tropical Honeymoon, Kandy & Ella Discovery..."
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-900 font-bold text-sm focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 placeholder:text-slate-400 placeholder:font-normal"
                />
                <p className="text-xs text-slate-500 mt-2">
                  Give your journey a personalized name of your choice, or leave it blank and NOVA will automatically generate one for you.
                </p>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold text-sm mb-2">Target Island Country</label>
                <select
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-slate-900 font-medium focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20"
                >
                  <option value="Sri Lanka">Sri Lanka (Pearl of the Indian Ocean)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold text-sm mb-2">Choose Specific Destinations (Select multiple or AI Recommend)</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (letAiRecommend) {
                        setLetAiRecommend(false);
                      } else {
                        setLetAiRecommend(true);
                        setSelectedDestinations([]);
                      }
                    }}
                    className={`p-3.5 rounded-xl border text-sm font-semibold transition-all text-left flex items-center justify-between ${
                      letAiRecommend
                        ? 'bg-teal-50 border-2 border-teal-600 text-teal-900 shadow-sm'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-teal-500/50 hover:bg-slate-50'
                    }`}
                  >
                    <span>✨ Let AI Recommend</span>
                    {letAiRecommend && <Check className="w-4 h-4 text-teal-700" />}
                  </button>

                  {destinationOptions.map((dest) => {
                    const isSelected = selectedDestinations.includes(dest);
                    return (
                      <button
                        key={dest}
                        type="button"
                        onClick={() => {
                          setLetAiRecommend(false);
                          toggleDestination(dest);
                        }}
                        className={`p-3.5 rounded-xl border text-sm font-semibold transition-all text-left flex items-center justify-between ${
                          isSelected
                            ? 'bg-teal-50 border-2 border-teal-600 text-teal-900 shadow-sm'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-teal-500/50 hover:bg-slate-50'
                        }`}
                      >
                        <span>{dest}</span>
                        {isSelected && <Check className="w-4 h-4 text-teal-700" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Destination Write Section */}
              <div className="bg-slate-50/90 border border-slate-200/90 rounded-2xl p-5 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-teal-100/70 text-teal-800 rounded-lg">
                      <Plus className="w-4 h-4" />
                    </div>
                    <label className="text-slate-900 font-bold text-sm">
                      Can't find your destination? Type a custom place
                    </label>
                  </div>
                  {customDestinations.length > 0 && (
                    <span className="text-xs font-semibold px-2.5 py-0.5 bg-teal-100 text-teal-800 rounded-full">
                      {customDestinations.length} custom {customDestinations.length === 1 ? 'place' : 'places'}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-500 mb-3">
                  Write any specific town, city, beach, or national park (e.g. Jaffna, Bentota, Arugam Bay, Polonnaruwa, Wilpattu, Tangalle) if not listed above.
                </p>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customDestinationInput}
                    onChange={(e) => setCustomDestinationInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomDestination();
                      }
                    }}
                    placeholder="Enter place name (e.g. Jaffna, Bentota)..."
                    className="flex-1 bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 text-sm font-medium focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomDestination}
                    disabled={!customDestinationInput.trim()}
                    className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl flex items-center gap-1.5 shadow-sm transition-all whitespace-nowrap cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Add Place
                  </button>
                </div>

                {/* Display custom destinations badges */}
                {customDestinations.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-200/80">
                    <span className="text-xs font-bold text-slate-600 block mb-2">Custom destinations in your trip:</span>
                    <div className="flex flex-wrap gap-2">
                      {customDestinations.map((place) => (
                        <span
                          key={place}
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-teal-50 text-teal-900 border border-teal-300/80 rounded-xl text-xs font-semibold shadow-xs"
                        >
                          <span>📍 {place}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveCustomDestination(place)}
                            className="p-0.5 hover:bg-teal-200/80 rounded-full text-teal-700 hover:text-teal-900 transition-colors"
                            title={`Remove ${place}`}
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-6 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl flex items-center gap-2 shadow-md transition-all"
              >
                Next: Dates & Travelers <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: DATES & TRAVELERS */}
        {step === 2 && (
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-10 shadow-xl backdrop-blur-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3.5 bg-teal-50 rounded-2xl text-teal-700 border border-teal-200/80">
                <Calendar className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">When are you traveling & with whom?</h2>
                <p className="text-slate-600 text-sm">Select dates and headcount for automatic duration calculation.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-slate-700 font-semibold text-sm mb-2">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-slate-900 font-medium focus:outline-none focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold text-sm mb-2">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-slate-900 font-medium focus:outline-none focus:border-teal-600"
                />
              </div>
            </div>

            <div className="bg-teal-50 border border-teal-200 p-4 rounded-2xl flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-teal-700" />
                <span className="text-slate-700 font-medium text-sm">Calculated Duration:</span>
              </div>
              <span className="text-teal-800 font-extrabold text-base bg-white px-3 py-1 rounded-xl border border-teal-200 shadow-sm">
                {durationDays > 0 ? `${durationDays} Days / ${Math.max(1, durationDays - 1)} Nights` : 'Select dates to calculate'}
              </span>
            </div>

            <div className="space-y-4 mb-6">
              <label className="block text-slate-700 font-semibold text-sm">Number of Travelers</label>
              <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 p-4 rounded-2xl w-fit">
                <button
                  type="button"
                  onClick={() => setTravelersCount(Math.max(1, travelersCount - 1))}
                  className="w-10 h-10 rounded-xl bg-white text-slate-800 border border-slate-300 font-bold hover:bg-slate-100 flex items-center justify-center text-lg shadow-sm"
                >
                  -
                </button>
                <span className="text-xl font-bold text-slate-900 w-8 text-center">{travelersCount}</span>
                <button
                  type="button"
                  onClick={() => setTravelersCount(travelersCount + 1)}
                  className="w-10 h-10 rounded-xl bg-white text-slate-800 border border-slate-300 font-bold hover:bg-slate-100 flex items-center justify-center text-lg shadow-sm"
                >
                  +
                </button>
                <span className="text-slate-600 text-xs ml-2 font-medium">Traveler(s) Total</span>
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-6 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl flex items-center gap-2 shadow-md"
              >
                Next: Budget <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: BUDGET */}
        {step === 3 && (
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-10 shadow-xl backdrop-blur-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3.5 bg-teal-50 rounded-2xl text-teal-700 border border-teal-200/80">
                <DollarSign className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">What is your trip budget?</h2>
                <p className="text-slate-600 text-sm">Specify currency, maximum total budget, and comfort category.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-slate-700 font-semibold text-sm mb-2">Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-slate-900 font-medium focus:outline-none focus:border-teal-600"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="LKR">LKR (Rs)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold text-sm mb-2">Maximum Budget ({currency})</label>
                <input
                  type="number"
                  min="50"
                  step="50"
                  value={budgetAmount}
                  onChange={(e) => setBudgetAmount(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-slate-900 font-bold focus:outline-none focus:border-teal-600"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-slate-700 font-semibold text-sm mb-3">Comfort & Experience Category</label>
              <div className="grid grid-cols-3 gap-4">
                {(['Budget', 'Moderate', 'Luxury'] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setBudgetCategory(cat)}
                    className={`p-4 rounded-2xl border text-center transition-all ${
                      budgetCategory === cat
                        ? 'bg-teal-50 border-2 border-teal-600 text-teal-900 font-bold shadow-sm'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-teal-500/50 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-lg font-bold">{cat}</div>
                    <div className="text-xs text-slate-500 mt-1">
                      {cat === 'Budget' ? 'Hostels & Local Food' : cat === 'Moderate' ? '3-Star & Private Transfers' : '5-Star Resorts & Fine Dining'}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(4)}
                className="px-6 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl flex items-center gap-2 shadow-md"
              >
                Next: Travel Style <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: TRAVEL STYLE */}
        {step === 4 && (
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-10 shadow-xl backdrop-blur-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3.5 bg-teal-50 rounded-2xl text-teal-700 border border-teal-200/80">
                <Compass className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">What is your travel style?</h2>
                <p className="text-slate-600 text-sm">Select one or multiple styles to tailor the journey's pace and theme.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
              {travelStyleOptions.map((opt) => {
                const isSel = selectedTravelStyles.includes(opt.label);
                return (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => toggleTravelStyle(opt.label)}
                    className={`p-4 rounded-2xl border transition-all text-left flex items-center gap-3 ${
                      isSel
                        ? 'bg-teal-50 border-2 border-teal-600 text-teal-900 font-bold shadow-sm'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-teal-500/50 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-2xl">{opt.icon}</span>
                    <span className="text-sm">{opt.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-between mt-8">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(5)}
                className="px-6 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl flex items-center gap-2 shadow-md"
              >
                Next: Activities <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: ACTIVITIES & NOTES */}
        {step === 5 && (
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-10 shadow-xl backdrop-blur-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3.5 bg-teal-50 rounded-2xl text-teal-700 border border-teal-200/80">
                <Sparkles className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Preferred activities & special requests</h2>
                <p className="text-slate-600 text-sm">Tell us what you love to do and any specific requirements.</p>
              </div>
            </div>

            <div className="space-y-6 mb-6">
              <div>
                <label className="block text-slate-700 font-semibold text-sm mb-3">Preferred Activities</label>
                <div className="flex flex-wrap gap-2">
                  {activityOptions.map((act) => {
                    const isSel = selectedActivities.includes(act);
                    return (
                      <button
                        key={act}
                        type="button"
                        onClick={() => toggleActivity(act)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                          isSel
                            ? 'bg-teal-600 text-white font-bold shadow-sm'
                            : 'bg-slate-50 border border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        {act}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold text-sm mb-2">Anything else you'd like us to know?</label>
                <textarea
                  rows={3}
                  value={specialRequirements}
                  onChange={(e) => setSpecialRequirements(e.target.value)}
                  placeholder="e.g. Vegetarian food preference, traveling with elderly parents, interest in photography sunrise spots..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-4 text-slate-900 focus:outline-none focus:border-teal-600 placeholder:text-slate-400 text-sm"
                />
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <button
                type="button"
                onClick={() => setStep(4)}
                className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(6)}
                className="px-6 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl flex items-center gap-2 shadow-md"
              >
                Next: Stay & Transport <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 6: ACCOMMODATION & MOBILITY SELECTION */}
        {step === 6 && (
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-10 shadow-xl backdrop-blur-sm space-y-8">
            <div className="flex items-center gap-4 border-b border-slate-200/80 pb-5">
              <div className="p-3.5 bg-teal-50 rounded-2xl text-teal-700 border border-teal-200/80">
                <Building2 className="w-7 h-7 text-[#16A6A1]" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Destination Staycations & Transport</h2>
                <p className="text-slate-600 text-sm">
                  Select best available luxury hotels, boutique villas, and private cabanas according to packages & prices, plus your mobility preference.
                </p>
              </div>
            </div>

            {/* Staycation Selector Component */}
            <div>
              <StaycationSelector
                destinations={selectedDestinations.length > 0 ? selectedDestinations : ['Sigiriya', 'Kandy', 'Ella']}
                selectedStaycations={selectedStaycations}
                onSelectStaycation={(dest, stay) => {
                  setAiDecidesStaycation(false);
                  if (selectedStaycations[dest]?.id === stay.id) {
                    const next = { ...selectedStaycations };
                    delete next[dest];
                    setSelectedStaycations(next);
                    triggerToast(`Deselected ${stay.name}`);
                  } else {
                    setSelectedStaycations((prev) => ({ ...prev, [dest]: stay }));
                    setAccommodationPref(stay.type);
                    triggerToast(`Selected ${stay.name} (${stay.packageName}) for ${dest}!`);
                  }
                }}
                allowAiOption={true}
                aiDecidesStaycation={aiDecidesStaycation}
                onToggleAiDecides={() => {
                  const nextVal = !aiDecidesStaycation;
                  setAiDecidesStaycation(nextVal);
                  if (nextVal) {
                    setSelectedStaycations({});
                    triggerToast('AI will select optimal staycations matched to your budget.');
                  }
                }}
              />
            </div>

            {/* Transport Preference Card */}
            <div className="p-6 bg-slate-50 border border-slate-200/90 rounded-2xl">
              <div className="flex items-center gap-2 mb-2">
                <Car className="w-5 h-5 text-[#16A6A1]" />
                <label className="text-slate-900 font-bold text-base">Transportation Preference</label>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Select your preferred mobility method for scenic intercity travel and sightseeing.
              </p>
              <select
                value={transportPref}
                onChange={(e) => setTransportPref(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3.5 text-slate-900 font-semibold focus:outline-none focus:border-teal-600 shadow-sm"
              >
                <option value="">Select transportation preference (or let AI decide)</option>
                <option value="Public Transport (Trains & Buses)">Public Transport (Scenic Trains & Express Buses)</option>
                <option value="Private Chauffeur / Dedicated Van">Private Licensed Chauffeur / Dedicated Car</option>
                <option value="Self-Arranged Travel">Self-Arranged Local Transit & Taxis</option>
              </select>
            </div>

            <div className="flex justify-between mt-8">
              <button
                type="button"
                onClick={() => setStep(5)}
                className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(7)}
                className="px-6 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl flex items-center gap-2 shadow-md"
              >
                Next: Final Review <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 7: CONFIRMATION SUMMARY */}
        {step === 7 && (
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-10 shadow-xl backdrop-blur-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3.5 bg-teal-50 rounded-2xl text-teal-700 border border-teal-200/80">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Review Your Trip Parameters</h2>
                <p className="text-slate-600 text-sm">Verify your specifications before triggering the AI Trip Planner Agent.</p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-8 space-y-4">
              {/* Trip Name Display & Fast Edit in Step 7 */}
              <div className="bg-teal-50/80 border border-teal-200/90 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex-1 w-full">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold text-teal-800 uppercase tracking-wider block">
                      Trip Name
                    </span>
                    <span className="text-[10px] text-teal-600 font-semibold">Click to customize</span>
                  </div>
                  <input
                    type="text"
                    value={tripName}
                    onChange={(e) => setTripName(e.target.value)}
                    placeholder="e.g. My Ceylon Adventure (or leave blank for AI generated name)..."
                    className="w-full bg-white border border-teal-300 rounded-lg px-3.5 py-2 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 placeholder:text-slate-400 placeholder:font-normal"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm border-b border-slate-200 pb-4">
                <div>
                  <span className="text-slate-500 block text-xs font-semibold">DESTINATION</span>
                  <span className="text-slate-900 font-bold">{destination}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-xs font-semibold">DURATION</span>
                  <span className="text-slate-900 font-bold">
                    {durationDays > 0 && startDate && endDate ? `${durationDays} Days (${startDate} to ${endDate})` : 'Flexible / AI Optimized'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-xs font-semibold">TRAVELERS</span>
                  <span className="text-slate-900 font-bold">{travelersCount} Traveler(s)</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-xs font-semibold">BUDGET</span>
                  <span className="text-teal-700 font-extrabold">
                    ${budgetAmount} {currency} {budgetCategory ? `(${budgetCategory})` : ''}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-500 block text-xs font-semibold mb-1">SELECTED CITIES</span>
                  <div className="flex flex-wrap gap-1">
                    {selectedDestinations.length > 0 ? (
                      selectedDestinations.map((d) => (
                        <span key={d} className="px-2.5 py-0.5 bg-white border border-slate-200 text-slate-700 rounded text-xs font-medium">
                          {d}
                        </span>
                      ))
                    ) : (
                      <span className="text-teal-700 text-xs font-semibold">AI Recommended Destinations</span>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 block text-xs font-semibold mb-1">STYLES & ACTIVITIES</span>
                  <div className="flex flex-wrap gap-1">
                    {selectedTravelStyles.length > 0 || selectedActivities.length > 0 ? (
                      <>
                        {selectedTravelStyles.map((s) => (
                          <span key={s} className="px-2.5 py-0.5 bg-teal-50 border border-teal-200 text-teal-800 rounded text-xs font-medium">
                            {s}
                          </span>
                        ))}
                        {selectedActivities.map((a) => (
                          <span key={a} className="px-2.5 py-0.5 bg-slate-100 border border-slate-200 text-slate-700 rounded text-xs font-medium">
                            {a}
                          </span>
                        ))}
                      </>
                    ) : (
                      <span className="text-slate-500 text-xs italic">All travel styles (General Discovery)</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm border-t border-slate-200 pt-3">
                <div>
                  <span className="text-slate-500 block text-xs font-semibold mb-1">SELECTED STAYCATIONS & HOTELS</span>
                  {Object.keys(selectedStaycations).length > 0 ? (
                    <div className="space-y-1.5">
                      {Object.entries(selectedStaycations).map(([dest, stay]) => (
                        <div key={dest} className="text-xs bg-white p-2 rounded-lg border border-slate-200">
                          <span className="font-extrabold text-teal-800">{dest}:</span> {stay.name} ({stay.type})
                          <div className="text-[11px] text-slate-600 font-semibold">
                            {stay.packageName} · ${stay.pricePerNight}/night
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-slate-900 font-bold">
                      {aiDecidesStaycation ? 'AI Curated Best Hotels & Cabanas (Optimal Budget)' : accommodationPref || 'Standard Hotels'}
                    </span>
                  )}
                </div>
                <div>
                  <span className="text-slate-500 block text-xs font-semibold mb-1">LOCAL TRANSPORT & MOBILITY</span>
                  <span className="text-slate-900 font-bold text-xs">{transportPref || 'AI Optimized Scenic Routing'}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <button
                type="button"
                onClick={() => setStep(6)}
                className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleGenerateTrip}
                className="px-8 py-4 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-lg rounded-2xl shadow-xl flex items-center gap-3 transition-all transform hover:scale-[1.01]"
              >
                <Sparkles className="w-6 h-6 fill-white" /> Generate My AI Trip Plan
              </button>
            </div>
          </div>
        )}

        {/* STEP 8: AI GENERATION ANIMATION */}
        {step === 8 && (
          <div className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center shadow-xl max-w-2xl mx-auto my-12">
            <div className="relative w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-teal-200 border-t-teal-600 animate-spin" />
              <Sparkles className="w-10 h-10 text-teal-600 animate-pulse" />
            </div>

            <h2 className="text-2xl font-extrabold text-slate-900 mb-2">AI Planner Orchestrator Active</h2>
            <p className="text-teal-700 font-bold text-lg mb-6">{aiStatusText}</p>

            <div className="w-full bg-slate-100 rounded-full h-3 max-w-md mx-auto overflow-hidden border border-slate-200 mb-6">
              <div
                className="bg-teal-600 h-3 transition-all duration-300 ease-out"
                style={{ width: `${((aiStepIndex + 1) / 6) * 100}%` }}
              />
            </div>

            <div className="space-y-2 text-slate-600 text-sm max-w-sm mx-auto text-left font-medium">
              <div className={`flex items-center gap-2 ${aiStepIndex >= 0 ? 'text-teal-800 font-bold' : 'opacity-40'}`}>
                <CheckCircle2 className="w-4 h-4 text-teal-600" /> Understanding travel preferences
              </div>
              <div className={`flex items-center gap-2 ${aiStepIndex >= 1 ? 'text-teal-800 font-bold' : 'opacity-40'}`}>
                <CheckCircle2 className="w-4 h-4 text-teal-600" /> Finding suitable destinations
              </div>
              <div className={`flex items-center gap-2 ${aiStepIndex >= 2 ? 'text-teal-800 font-bold' : 'opacity-40'}`}>
                <CheckCircle2 className="w-4 h-4 text-teal-600" /> Building optimized travel route
              </div>
              <div className={`flex items-center gap-2 ${aiStepIndex >= 3 ? 'text-teal-800 font-bold' : 'opacity-40'}`}>
                <CheckCircle2 className="w-4 h-4 text-teal-600" /> Scheduling daily activities & timings
              </div>
              <div className={`flex items-center gap-2 ${aiStepIndex >= 4 ? 'text-teal-800 font-bold' : 'opacity-40'}`}>
                <CheckCircle2 className="w-4 h-4 text-teal-600" /> Evaluating budget & travel pacing
              </div>
              <div className={`flex items-center gap-2 ${aiStepIndex >= 5 ? 'text-teal-800 font-bold' : 'opacity-40'}`}>
                <CheckCircle2 className="w-4 h-4 text-teal-600" /> Validating final itinerary plan
              </div>
            </div>
          </div>
        )}

        {/* STEP 9: GENERATED ITINERARY RESULT VIEW */}
        {step === 9 && generatedPlan && (
          <div className="space-y-8 animate-fadeIn">
            {/* Header Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-slate-200/80 p-6 sm:p-8 rounded-3xl shadow-xl">
              <div className="flex-1">
                <div className="flex items-center gap-2 text-teal-700 text-xs font-extrabold uppercase tracking-wider mb-1">
                  <ShieldCheck className="w-4 h-4 text-teal-600" /> Quality Verified: {generatedPlan.metadata.aiScore}% Match
                </div>
                {isEditingTitle ? (
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="text"
                      value={customTitleInput}
                      onChange={(e) => setCustomTitleInput(e.target.value)}
                      className="text-xl sm:text-2xl font-extrabold text-slate-900 border-2 border-teal-500 rounded-xl px-3 py-1.5 bg-teal-50/40 focus:outline-none w-full max-w-md"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newTitle = customTitleInput.trim() || generatedPlan.trip.title;
                        setGeneratedPlan({
                          ...generatedPlan,
                          trip: { ...generatedPlan.trip, title: newTitle },
                        });
                        setTripName(newTitle);
                        setIsEditingTitle(false);
                        triggerToast(`Trip renamed to "${newTitle}"!`);
                      }}
                      className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCustomTitleInput(generatedPlan.trip.title);
                        setIsEditingTitle(false);
                      }}
                      className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 group mt-1">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{generatedPlan.trip.title}</h1>
                    <button
                      type="button"
                      onClick={() => {
                        setCustomTitleInput(generatedPlan.trip.title);
                        setIsEditingTitle(true);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition-colors cursor-pointer"
                      title="Rename your trip"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <p className="text-slate-600 text-sm mt-1">{generatedPlan.trip.description}</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" /> Plan Another
                </button>

                <button
                  type="button"
                  onClick={handleSaveTrip}
                  disabled={isSaving || saveSuccess}
                  className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-sm font-bold rounded-xl flex items-center gap-2 shadow-md transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {isSaving ? 'Saving to Database...' : saveSuccess ? 'Saved to Trips!' : 'Save Trip'}
                </button>
              </div>
            </div>

            {/* Travel Advisories & Warnings Alert Banner (Filters out internal constraint checks) */}
            {(() => {
              const realWarnings = (generatedPlan.warnings || []).filter((w) => {
                const text = `${w.title || ''} ${w.message || ''}`.toLowerCase();
                return (
                  !text.includes('constraint') &&
                  !text.includes('deterministic') &&
                  !text.includes('buffer') &&
                  !text.includes('safety check') &&
                  !text.includes('verification')
                );
              });
              if (realWarnings.length === 0) return null;
              return (
                <div className="space-y-3">
                  {realWarnings.map((w) => (
                    <div key={w.id} className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start gap-3 text-amber-900 text-sm">
                      <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-amber-950 block">{w.title}</span>
                        <span>{w.message}</span>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}

            {/* Staycations & Lodging Booking Section */}
            {(() => {
              const tripDestinations = (generatedPlan.trip.destinations && generatedPlan.trip.destinations.length > 0)
                ? generatedPlan.trip.destinations
                : selectedDestinations.length > 0
                ? selectedDestinations
                : ['Sigiriya', 'Kandy', 'Ella'];

              // Stays list: User chosen stays + default best recommendations for destinations
              const displayStays: AccommodationItem[] = [];
              tripDestinations.forEach((dest) => {
                if (selectedStaycations[dest]) {
                  displayStays.push(selectedStaycations[dest]);
                } else {
                  const match = ACCOMMODATIONS_CATALOG.find(
                    (a) => a.destination.toLowerCase() === dest.toLowerCase()
                  );
                  if (match && !displayStays.some((s) => s.id === match.id)) {
                    displayStays.push(match);
                  }
                }
              });

              if (displayStays.length === 0) {
                displayStays.push(...ACCOMMODATIONS_CATALOG.slice(0, 3));
              }

              return (
                <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-teal-700" />
                        <h2 className="text-xl font-bold text-slate-900">
                          Selected Staycations & Lodging Bookings
                        </h2>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Review your chosen staycation packages and reserve rooms directly to lock in availability for your trip.
                      </p>
                    </div>

                    <div className="text-xs font-bold px-3 py-1 bg-teal-50 border border-teal-200 text-teal-800 rounded-xl self-start sm:self-auto">
                      {Object.keys(bookedStaycations).length} of {displayStays.length} Stays Reserved
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {displayStays.map((stay) => {
                      const isBooked = !!bookedStaycations[stay.id];
                      const booking = bookedStaycations[stay.id];

                      return (
                        <div
                          key={stay.id}
                          className={`rounded-2xl border-2 transition-all flex flex-col justify-between overflow-hidden bg-white ${
                            isBooked
                              ? 'border-emerald-600 ring-2 ring-emerald-500/20 shadow-md'
                              : 'border-slate-200 hover:border-teal-500 shadow-xs'
                          }`}
                        >
                          <div>
                            {/* Photo & Badges */}
                            <div className="relative h-44 w-full overflow-hidden">
                              <img src={stay.image} alt={stay.name} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                              <div className="absolute top-3 left-3 flex items-center gap-1.5">
                                <span className="px-2.5 py-1 bg-black/70 backdrop-blur-md text-white text-[10px] font-black uppercase rounded-lg">
                                  {stay.type}
                                </span>
                                {isBooked && (
                                  <span className="px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-black rounded-md flex items-center gap-1">
                                    <Check className="w-3 h-3" /> Booked
                                  </span>
                                )}
                              </div>

                              <div className="absolute bottom-3 left-3 right-3 text-white">
                                <h3 className="font-extrabold text-sm leading-tight">{stay.name}</h3>
                                <p className="text-[11px] text-slate-200">📍 {stay.destination}</p>
                              </div>
                            </div>

                            {/* Package Details */}
                            <div className="p-4 space-y-3">
                              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                                <span className="text-[10px] font-bold text-slate-400 uppercase block">Selected Package</span>
                                <p className="text-xs font-extrabold text-slate-900">{stay.packageName}</p>
                                <p className="text-[10px] text-teal-700 font-semibold">{stay.packageDuration}</p>
                              </div>

                              <div>
                                <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                                  Included Facilities:
                                </span>
                                <ul className="text-[11px] text-slate-600 space-y-1">
                                  {stay.includedFacilities.slice(0, 3).map((f, i) => (
                                    <li key={i} className="flex items-center gap-1.5 truncate">
                                      <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                                      <span className="truncate">{f}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>

                          {/* Price & Action Button */}
                          <div className="p-4 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between gap-2">
                            <div>
                              <span className="text-xs font-bold text-slate-400 block">Rate</span>
                              <span className="text-sm font-extrabold text-slate-900">${stay.pricePerNight}<span className="text-xs font-normal text-slate-500">/nt</span></span>
                            </div>

                            {isBooked ? (
                              <button
                                type="button"
                                onClick={() => setActiveStaycationToBook(stay)}
                                className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Code: {booking.confirmationCode}</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setActiveStaycationToBook(stay)}
                                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                              >
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Book Staycation Now</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Main Content Layout (Itinerary Days + Budget Breakdown Sidebar) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Day-by-Day Timeline (2 Cols) */}
              <div className="lg:col-span-2 space-y-6">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-teal-700" /> Day-by-Day Schedule ({generatedPlan.days.length} Days)
                </h2>

                {generatedPlan.days.map((dayItem, dIdx) => (
                  <div key={dayItem.day} className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
                    {/* Day Title Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-4">
                      <div>
                        <span className="px-3 py-1 bg-teal-50 text-teal-800 font-extrabold text-xs rounded-lg border border-teal-200 inline-block mb-1">
                          DAY {dayItem.day} — {dayItem.date}
                        </span>
                        <h3 className="text-lg font-bold text-slate-900">{dayItem.title}</h3>
                        <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-teal-600" /> Location: {dayItem.location}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-teal-800 font-bold text-sm bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                          Est. ${dayItem.estimatedCost}
                        </span>
                        <button
                          type="button"
                          disabled={regeneratingDayIndex === dIdx}
                          onClick={() => handleRegenerateDay(dIdx)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1 transition-all"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${regeneratingDayIndex === dIdx ? 'animate-spin' : ''}`} />
                          Regenerate Day
                        </button>
                      </div>
                    </div>

                    {/* Activities List */}
                    <div className="space-y-3 pt-2">
                      {dayItem.activities.map((act, aIdx) => (
                        <div key={act.id} className="bg-slate-50/80 border border-slate-200/80 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-slate-300 transition-all">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-0.5 bg-slate-200 text-slate-800 font-mono text-xs rounded font-bold">
                                {act.time}
                              </span>
                              <span className="text-xs text-slate-500 font-medium">({act.durationMinutes} mins)</span>
                              <span className="px-2 py-0.5 bg-white text-slate-600 text-xs rounded border border-slate-200 font-medium">
                                {act.type}
                              </span>
                            </div>
                            <h4 className="text-slate-900 font-bold text-base">{act.title}</h4>
                            <p className="text-slate-600 text-xs">{act.description}</p>
                            {act.travelTimeToNext && (
                              <span className="text-slate-500 text-xs block italic mt-1 font-medium">
                                🚗 {act.travelTimeToNext}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-slate-700 font-bold text-xs mr-2">${act.estimatedCost}</span>
                            <button
                              type="button"
                              onClick={() => handleReplaceActivity(dIdx, aIdx)}
                              title="Replace activity with alternative"
                              className="p-2 bg-white hover:bg-slate-100 text-teal-700 rounded-lg border border-slate-200 shadow-sm"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingActivity({ dayIndex: dIdx, activityIndex: aIdx, activity: { ...act } })}
                              title="Edit activity details"
                              className="p-2 bg-white hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-200 shadow-sm"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteActivity(dIdx, aIdx)}
                              title="Delete activity"
                              className="p-2 bg-white hover:bg-red-50 text-red-600 rounded-lg border border-slate-200 shadow-sm"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() => setShowAddActivityModal(dIdx)}
                        className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 border border-dashed border-slate-300 text-slate-600 hover:text-teal-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all mt-3"
                      >
                        <Plus className="w-4 h-4" /> Add Activity to Day {dayItem.day}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Right Column: Budget Breakdown & Recommendations (1 Col) */}
              <div className="space-y-6">
                {/* Budget Breakdown Card */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-teal-700" /> Budget Breakdown
                  </h3>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between text-slate-600">
                      <span>Accommodation</span>
                      <span className="font-semibold text-slate-900">${generatedPlan.budget.accommodation}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Transportation</span>
                      <span className="font-semibold text-slate-900">${generatedPlan.budget.transportation}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Activities</span>
                      <span className="font-semibold text-slate-900">${generatedPlan.budget.activities}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Food & Dining</span>
                      <span className="font-semibold text-slate-900">${generatedPlan.budget.food}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Sundry / Other</span>
                      <span className="font-semibold text-slate-900">${generatedPlan.budget.other}</span>
                    </div>

                    <div className="border-t border-slate-200 pt-3 flex justify-between text-slate-900 font-bold text-base">
                      <span>Total Estimated Cost</span>
                      <span className="text-teal-700">${generatedPlan.budget.total} {generatedPlan.budget.currency}</span>
                    </div>

                    <div className="bg-teal-50 border border-teal-200 p-3 rounded-xl flex justify-between text-xs font-bold text-teal-800">
                      <span>Allocated Budget Remaining:</span>
                      <span>${generatedPlan.budget.remaining} {generatedPlan.budget.currency}</span>
                    </div>
                  </div>
                </div>

                {/* Recommendations & Partner Offers */}
                {generatedPlan.recommendations && generatedPlan.recommendations.length > 0 && (
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-teal-700" /> AI Partner Advice
                    </h3>
                    <div className="space-y-3">
                      {generatedPlan.recommendations.map((rec) => (
                        <div key={rec.id} className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-1">
                          <span className="text-xs text-teal-700 font-extrabold uppercase">{rec.category}</span>
                          <h4 className="text-slate-900 font-bold text-sm">{rec.title}</h4>
                          <p className="text-slate-600 text-xs">{rec.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* MODAL: EDIT ACTIVITY */}
        {editingActivity && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h3 className="text-lg font-bold text-slate-900">Edit Activity Details</h3>
                <button onClick={() => setEditingActivity(null)} className="text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-sm">
                <div>
                  <label className="block text-slate-700 font-semibold text-xs mb-1">Time</label>
                  <input
                    type="text"
                    value={editingActivity.activity.time}
                    onChange={(e) =>
                      setEditingActivity({
                        ...editingActivity,
                        activity: { ...editingActivity.activity, time: e.target.value },
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold text-xs mb-1">Title</label>
                  <input
                    type="text"
                    value={editingActivity.activity.title}
                    onChange={(e) =>
                      setEditingActivity({
                        ...editingActivity,
                        activity: { ...editingActivity.activity, title: e.target.value },
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold text-xs mb-1">Estimated Cost ($)</label>
                  <input
                    type="number"
                    value={editingActivity.activity.estimatedCost}
                    onChange={(e) =>
                      setEditingActivity({
                        ...editingActivity,
                        activity: { ...editingActivity.activity, estimatedCost: Number(e.target.value) },
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold text-xs mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={editingActivity.activity.description}
                    onChange={(e) =>
                      setEditingActivity({
                        ...editingActivity,
                        activity: { ...editingActivity.activity, description: e.target.value },
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setEditingActivity(null)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold">
                  Cancel
                </button>
                <button type="button" onClick={handleSaveEditedActivity} className="px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold shadow-md">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: ADD ACTIVITY */}
        {showAddActivityModal !== null && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h3 className="text-lg font-bold text-slate-900">Add Custom Activity to Day {showAddActivityModal + 1}</h3>
                <button onClick={() => setShowAddActivityModal(null)} className="text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-sm">
                <div>
                  <label className="block text-slate-700 font-semibold text-xs mb-1">Time</label>
                  <input
                    type="text"
                    value={newActivityTime}
                    onChange={(e) => setNewActivityTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold text-xs mb-1">Activity Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Evening Sunset Beach Walk"
                    value={newActivityTitle}
                    onChange={(e) => setNewActivityTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold text-xs mb-1">Estimated Cost ($)</label>
                  <input
                    type="number"
                    value={newActivityCost}
                    onChange={(e) => setNewActivityCost(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowAddActivityModal(null)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold">
                  Cancel
                </button>
                <button type="button" onClick={() => handleAddActivitySubmit(showAddActivityModal)} className="px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold shadow-md">
                  Add Activity
                </button>
              </div>
            </div>
          </div>
        )}
        {/* STAYCATION RESERVATION MODAL */}
        <StaycationBookingModal
          isOpen={activeStaycationToBook !== null}
          onClose={() => setActiveStaycationToBook(null)}
          staycation={activeStaycationToBook}
          tripName={(isEditingTitle && customTitleInput.trim()) ? customTitleInput.trim() : generatedPlan?.trip.title || tripName}
          startDate={startDate}
          endDate={endDate}
          travelersCount={travelersCount}
          onConfirmBooking={(booking) => {
            if (activeStaycationToBook) {
              setBookedStaycations((prev) => ({
                ...prev,
                [activeStaycationToBook.id]: booking,
              }));
              triggerToast(`🎉 Reserved ${booking.provider}! Confirmation Code: ${booking.confirmationCode}`);
            }
            setActiveStaycationToBook(null);
          }}
        />
      </main>

      <Footer />
    </div>
  );
};
