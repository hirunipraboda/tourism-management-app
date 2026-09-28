import React, { useState, useEffect } from 'react';
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
  Search,
  Check,
  RefreshCw,
  Heart,
  Share2,
  Download,
  SlidersHorizontal,
  ChevronRight,
  Clock,
  Car,
  Bus,
  UserCheck,
} from 'lucide-react';
import { LandingNavbar } from '../components/navigation/LandingNavbar';
import { Footer } from '../components/navigation/Footer';

// Image assets
import sigiriyaImg from '../assets/destinations/sigiriya.jpg';
import ellaImg from '../assets/destinations/Ella.jpg';
import galleImg from '../assets/destinations/Galle.jpg';
import mirissaImg from '../assets/destinations/Mirissa.jpg';
import riverstonImg from '../assets/destinations/riverston.jpg';
import kandyImg from '../assets/destinations/Kandy.jpg';
import hortonPlainsImg from '../assets/destinations/Horton Plains.jpg';

export const AITripPlannerPage: React.FC = () => {
  const navigate = useNavigate();

  // Wizard Step State (1: Dest, 2: Dates, 3: Travelers, 4: Style, 5: Interests, 6: Travel & Guide, 7: Budget, 8: Confirm, 9: Planning Anim, 10: Result)
  const [step, setStep] = useState<number>(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Preference Form Inputs
  const [destination, setDestination] = useState<string>('Sri Lanka');
  const [duration, setDuration] = useState<string>('7 Days');
  const [travelersType, setTravelersType] = useState<string>('Couple');
  const [travelersCount, setTravelersCount] = useState<number>(2);
  const [travelStyle, setTravelStyle] = useState<string>('Balanced');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    'Nature',
    'Culture',
    'Food',
  ]);

  // Travel & Guide Preferences State
  const [transportMode, setTransportMode] = useState<'Private' | 'Public' | 'None'>('Private');
  const [hireGuide, setHireGuide] = useState<boolean>(true);
  const [guideType, setGuideType] = useState<string>('No Preference');
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');

  // Budget Range State
  const [budget, setBudget] = useState<string>('Moderate');
  const [minBudget, setMinBudget] = useState<number>(250);
  const [maxBudget, setMaxBudget] = useState<number>(600);

  // AI Generation Animation Progress State
  const [aiStepIndex, setAiStepIndex] = useState<number>(0);
  const [aiStatusText, setAiStatusText] = useState<string>('Understanding your preferences...');

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Participant-Based Vehicle Allocation Helper
  const getRecommendedVehicle = (count: number) => {
    if (count <= 3) return 'Sedan';
    if (count <= 6) return 'SUV / Large SUV';
    if (count <= 12) return 'Minivan';
    return 'Mini Coach';
  };

  const currentVehicle = selectedVehicle || getRecommendedVehicle(travelersCount);

  // Run AI Planning Animation Sequence when step is 8
  useEffect(() => {
    if (step === 8) {
      setAiStepIndex(0);
      setAiStatusText('Understanding your travel preferences...');

      const timer1 = setTimeout(() => {
        setAiStepIndex(1);
        setAiStatusText('Optimizing your journey & destinations...');
      }, 800);

      const timer2 = setTimeout(() => {
        setAiStepIndex(2);
        setAiStatusText('Configuring independent exploration activities...');
      }, 1600);

      const timer3 = setTimeout(() => {
        setAiStepIndex(3);
        setAiStatusText('Checking travel routes & timing...');
      }, 2400);

      const timer4 = setTimeout(() => {
        setAiStepIndex(4);
        setAiStatusText('Optimizing your days & adding unexpected discoveries...');
      }, 3200);

      const timer5 = setTimeout(() => {
        setAiStepIndex(5);
        setAiStatusText('Finalizing recommendations...');
      }, 4000);

      const timer6 = setTimeout(() => {
        setStep(9); // Show Result
        triggerToast('Your Journey is ready!');
      }, 4600);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
        clearTimeout(timer4);
        clearTimeout(timer5);
        clearTimeout(timer6);
      };
    }
  }, [step, travelersCount]);

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleRefine = (refinementType: string) => {
    triggerToast(`Refining itinerary with ${refinementType}...`);
    setStep(8);
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

      {/* HERO SECTION */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-8 text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#16A6A1]/10 text-[#146C86] text-xs font-extrabold border border-[#16A6A1]/20">
          <Compass className="w-3.5 h-3.5 text-[#16A6A1]" />
          <span>NOVA INTELLIGENCE</span>
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#0B3A53] tracking-tight font-heading leading-tight max-w-4xl mx-auto">
          Your Journey, Designed Around You.
        </h1>
        <p className="text-base sm:text-lg text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">
          Tell NOVA what you love, where you want to go, and how you want to travel. We’ll shape the journey.
        </p>
      </div>

      {/* STEP PROGRESS INDICATOR (STEPS 1-7) */}
      {step >= 1 && step <= 7 && (
        <div className="max-w-4xl mx-auto px-4 pb-8 overflow-x-auto">
          <div className="flex items-center justify-between text-xs font-bold border-b border-slate-200/80 pb-3 min-w-[500px]">
            {[
              { id: 1, label: 'Destination' },
              { id: 2, label: 'Duration' },
              { id: 3, label: 'Travelers' },
              { id: 4, label: 'Style' },
              { id: 5, label: 'Interests' },
              { id: 6, label: 'Budget' },
              { id: 7, label: 'Confirm' },
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => setStep(s.id)}
                className={`transition-all cursor-pointer ${
                  step === s.id
                    ? 'text-[#0B3A53] font-black border-b-2 border-[#16A6A1] pb-1'
                    : step > s.id
                    ? 'text-[#16A6A1]'
                    : 'text-slate-400'
                }`}
              >
                <span>
                  {step > s.id ? '✓ ' : ''}
                  {s.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STEP-BY-STEP WIZARD */}
      {step >= 1 && step <= 7 && (
        <section className="max-w-3xl mx-auto px-4 sm:px-6 pb-20">
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/70 shadow-sm space-y-8 relative">
            
            {/* STEP 1: DESTINATION */}
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="space-y-2">
                  <span className="text-xs font-black uppercase text-[#16A6A1]">STEP 01</span>
                  <h2 className="text-2xl sm:text-3xl font-black text-[#0B3A53] font-heading">
                    Where do you want to go?
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium">
                    Search or select your primary travel destination.
                  </p>
                </div>

                <div className="relative flex items-center shadow-xs rounded-2xl bg-slate-50 border border-slate-200 focus-within:border-[#16A6A1] transition-all">
                  <div className="pl-4 text-slate-400">
                    <Search className="w-5 h-5 text-[#16A6A1]" />
                  </div>
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="Search a destination (e.g. Sri Lanka, Japan, Bali)..."
                    className="w-full py-4 pl-3 pr-4 text-sm font-semibold text-slate-800 bg-transparent focus:outline-none"
                  />
                </div>

                <div className="space-y-2 pt-2">
                  <label className="text-xs font-extrabold text-[#0B3A53] uppercase tracking-wider block">
                    Popular Destinations
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['Sri Lanka', 'Japan', 'Bali', 'Italy', 'Switzerland', 'Thailand', 'Maldives'].map((loc) => (
                      <button
                        key={loc}
                        onClick={() => setDestination(loc)}
                        className={`px-3.5 py-2 rounded-2xl text-xs font-bold border transition-all cursor-pointer ${
                          destination === loc
                            ? 'bg-[#0B3A53] text-white border-[#0B3A53]'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {loc}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    onClick={() => setStep(2)}
                    disabled={!destination.trim()}
                    className="bg-[#0B3A53] hover:bg-[#072537] text-white font-extrabold text-xs uppercase tracking-wider px-7 py-3.5 rounded-full shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-2"
                  >
                    <span>Continue to Duration</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: DURATION */}
            {step === 2 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="space-y-2">
                  <span className="text-xs font-black uppercase text-[#16A6A1]">STEP 02</span>
                  <h2 className="text-2xl sm:text-3xl font-black text-[#0B3A53] font-heading">
                    How long is your journey?
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium">
                    Select your total trip length in days.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  {['3 Days', '5 Days', '7 Days', '10 Days', '14 Days'].map((dur) => (
                    <button
                      key={dur}
                      onClick={() => setDuration(dur)}
                      className={`p-4 rounded-2xl text-center font-extrabold text-xs border transition-all cursor-pointer ${
                        duration === dur
                          ? 'bg-[#0B3A53] text-white border-[#0B3A53] shadow-md ring-2 ring-[#16A6A1]'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {dur}
                    </button>
                  ))}
                </div>

                <div className="pt-4 flex items-center justify-between">
                  <button
                    onClick={() => setStep(1)}
                    className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="bg-[#0B3A53] hover:bg-[#072537] text-white font-extrabold text-xs uppercase tracking-wider px-7 py-3.5 rounded-full shadow-md transition-all cursor-pointer flex items-center gap-2"
                  >
                    <span>Continue to Travelers</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: TRAVELERS */}
            {step === 3 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="space-y-2">
                  <span className="text-xs font-black uppercase text-[#16A6A1]">STEP 03</span>
                  <h2 className="text-2xl sm:text-3xl font-black text-[#0B3A53] font-heading">
                    Who is travelling?
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium">
                    Choose your group type to personalize pace and recommendations.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  {[
                    { type: 'Solo', icon: '👤' },
                    { type: 'Couple', icon: '👩‍❤️‍👨' },
                    { type: 'Family', icon: '👨‍👩‍👧' },
                    { type: 'Friends', icon: '👥' },
                  ].map((group) => (
                    <button
                      key={group.type}
                      onClick={() => setTravelersType(group.type)}
                      className={`p-4 rounded-2xl text-center border transition-all cursor-pointer ${
                        travelersType === group.type
                          ? 'bg-[#0B3A53] text-white border-[#0B3A53] shadow-md ring-2 ring-[#16A6A1]'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <div className="text-2xl mb-1">{group.icon}</div>
                      <div className="font-extrabold text-xs">{group.type}</div>
                    </button>
                  ))}
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-700">Number of Travelers</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setTravelersCount(Math.max(1, travelersCount - 1))}
                      className="w-8 h-8 rounded-full bg-white text-slate-800 font-bold border shadow-xs"
                    >
                      -
                    </button>
                    <span className="text-sm font-black text-[#0B3A53] px-2">{travelersCount}</span>
                    <button
                      onClick={() => setTravelersCount(travelersCount + 1)}
                      className="w-8 h-8 rounded-full bg-white text-slate-800 font-bold border shadow-xs"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between">
                  <button
                    onClick={() => setStep(2)}
                    className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => setStep(4)}
                    className="bg-[#0B3A53] hover:bg-[#072537] text-white font-extrabold text-xs uppercase tracking-wider px-7 py-3.5 rounded-full shadow-md transition-all cursor-pointer flex items-center gap-2"
                  >
                    <span>Continue to Style</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: STYLE */}
            {step === 4 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="space-y-2">
                  <span className="text-xs font-black uppercase text-[#16A6A1]">STEP 04</span>
                  <h2 className="text-2xl sm:text-3xl font-black text-[#0B3A53] font-heading">
                    What's your travel style & pace?
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium">
                    Help NOVA balance your daily schedule.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                  {['Relaxed', 'Balanced', 'Adventure', 'Fast-paced', 'Luxury', 'Budget-friendly'].map((style) => (
                    <button
                      key={style}
                      onClick={() => setTravelStyle(style)}
                      className={`p-4 rounded-2xl text-center font-extrabold text-xs border transition-all cursor-pointer ${
                        travelStyle === style
                          ? 'bg-[#0B3A53] text-white border-[#0B3A53] shadow-md ring-2 ring-[#16A6A1]'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>

                <div className="pt-4 flex items-center justify-between">
                  <button
                    onClick={() => setStep(3)}
                    className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => setStep(5)}
                    className="bg-[#0B3A53] hover:bg-[#072537] text-white font-extrabold text-xs uppercase tracking-wider px-7 py-3.5 rounded-full shadow-md transition-all cursor-pointer flex items-center gap-2"
                  >
                    <span>Continue to Interests</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 5: INTERESTS */}
            {step === 5 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="space-y-2">
                  <span className="text-xs font-black uppercase text-[#16A6A1]">STEP 05</span>
                  <h2 className="text-2xl sm:text-3xl font-black text-[#0B3A53] font-heading">
                    What do you want to experience?
                  </h2>
                </div>

                <div className="flex flex-wrap gap-2.5 pt-2">
                  {[
                    '🌿 Nature', '🏛️ Culture', '🏔️ Adventure', '🌊 Beaches', '🍜 Food',
                    '🦁 Wildlife', '📸 Photography', '🧘 Wellness', '🎨 Arts & Heritage',
                  ].map((exp) => {
                    const cleanName = exp.split(' ')[1];
                    const isSelected = selectedInterests.includes(cleanName);
                    return (
                      <button
                        key={exp}
                        onClick={() => toggleInterest(cleanName)}
                        className={`px-4 py-3 rounded-2xl text-xs font-bold border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#16A6A1] text-white border-[#16A6A1] shadow-sm'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {exp}
                      </button>
                    );
                  })}
                </div>

                <div className="pt-4 flex items-center justify-between">
                  <button
                    onClick={() => setStep(4)}
                    className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => setStep(6)}
                    className="bg-[#0B3A53] hover:bg-[#072537] text-white font-extrabold text-xs uppercase tracking-wider px-7 py-3.5 rounded-full shadow-md transition-all cursor-pointer flex items-center gap-2"
                  >
                    <span>Continue to Budget →</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 6: BUDGET RANGE */}
            {step === 6 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="space-y-2">
                  <span className="text-xs font-black uppercase text-[#16A6A1]">STEP 06</span>
                  <h2 className="text-2xl sm:text-3xl font-black text-[#0B3A53] font-heading">
                    What's your budget range?
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium">
                    Choose a preset style or set a custom budget range for your entire journey.
                  </p>
                </div>

                {/* Preset Tier Buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  {[
                    { label: 'Budget', min: 100, max: 250 },
                    { label: 'Moderate', min: 250, max: 600 },
                    { label: 'Premium', min: 600, max: 1200 },
                    { label: 'Luxury', min: 1200, max: 2500 },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        setBudget(preset.label);
                        setMinBudget(preset.min);
                        setMaxBudget(preset.max);
                      }}
                      className={`p-4 rounded-2xl text-center font-extrabold text-xs sm:text-sm border transition-all cursor-pointer ${
                        budget === preset.label
                          ? 'bg-[#0B3A53] text-white border-[#0B3A53] shadow-md'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <div>{preset.label}</div>
                      <div className={`text-[10px] font-medium mt-0.5 ${budget === preset.label ? 'text-slate-200' : 'text-slate-400'}`}>
                        ${preset.min} - ${preset.max}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Custom Budget Range Slider & Input Controls */}
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200/80 space-y-4 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-[#0B3A53] uppercase tracking-wider">
                      Specific Budget Range Slider
                    </span>
                    <span className="text-xs font-black text-[#146C86] bg-white px-3.5 py-1 rounded-full border border-slate-200 shadow-2xs">
                      ${minBudget} – ${maxBudget}
                    </span>
                  </div>

                  {/* Range Input Slider */}
                  <div className="space-y-2 pt-1">
                    <input
                      type="range"
                      min="100"
                      max="3000"
                      step="25"
                      value={maxBudget}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setMaxBudget(val);
                        if (val < minBudget) setMinBudget(Math.max(100, val - 50));
                      }}
                      className="w-full accent-[#16A6A1] h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                    />

                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                      <span>$100 (Min)</span>
                      <span>$1,000</span>
                      <span>$2,500+ (Max)</span>
                    </div>
                  </div>

                  {/* Min and Max Number Inputs */}
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200/60 text-xs">
                    <div className="space-y-1">
                      <label className="text-slate-500 font-bold block">Min Budget Limit ($)</label>
                      <input
                        type="number"
                        step={25}
                        value={minBudget}
                        onChange={(e) => setMinBudget(parseInt(e.target.value) || 100)}
                        className="w-full p-3 rounded-2xl bg-white border border-slate-200 focus:outline-none focus:border-[#16A6A1] font-bold text-[#0B3A53]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-500 font-bold block">Max Budget Limit ($)</label>
                      <input
                        type="number"
                        step={25}
                        value={maxBudget}
                        onChange={(e) => setMaxBudget(parseInt(e.target.value) || 100000)}
                        className="w-full p-3 rounded-2xl bg-white border border-slate-200 focus:outline-none focus:border-[#16A6A1] font-bold text-[#0B3A53]"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between">
                  <button
                    onClick={() => setStep(5)}
                    className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                  >
                    ← Back to Interests
                  </button>
                  <button
                    onClick={() => setStep(7)}
                    className="bg-[#0B3A53] hover:bg-[#072537] text-white font-extrabold text-xs uppercase tracking-wider px-7 py-3.5 rounded-full shadow-md transition-all cursor-pointer flex items-center gap-2"
                  >
                    <span>Review Summary →</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 7: CONFIRMATION SUMMARY */}
            {step === 7 && (
              <div className="space-y-6 animate-in fade-in duration-300 text-center py-4">
                <div className="space-y-2">
                  <h2 className="text-3xl font-black text-[#0B3A53] font-heading">
                    Ready to discover your journey?
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium">
                    Review your preferences before NOVA shapes your personalized itinerary.
                  </p>
                </div>

                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200/80 text-left space-y-3 max-w-md mx-auto text-xs">
                  <div className="flex justify-between pb-2 border-b border-slate-200">
                    <span className="font-bold text-slate-500">Destination</span>
                    <span className="font-extrabold text-[#0B3A53]">{destination}</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-slate-200">
                    <span className="font-bold text-slate-500">Duration & Travelers</span>
                    <span className="font-extrabold text-[#0B3A53]">{duration} · {travelersCount} Travelers ({travelersType})</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-slate-200">
                    <span className="font-bold text-slate-500">Interests</span>
                    <span className="font-extrabold text-[#146C86]">{selectedInterests.join(' · ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold text-slate-500">Style & Specific Budget</span>
                    <span className="font-extrabold text-[#0B3A53]">{travelStyle} Pace · ${minBudget}–${maxBudget}</span>
                  </div>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={() => setStep(1)}
                    className="px-6 py-3.5 rounded-full bg-slate-100 text-slate-600 font-bold text-xs cursor-pointer hover:bg-slate-200"
                  >
                    ← Edit Preferences
                  </button>
                  <button
                    onClick={() => setStep(8)}
                    className="bg-[#0B3A53] hover:bg-[#072537] text-white font-extrabold text-xs uppercase tracking-wider px-8 py-3.5 rounded-full shadow-lg transition-all cursor-pointer flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-[#16A6A1]" />
                    <span>Create My Journey</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* AI PLANNING ANIMATION SEQUENCE (STEP 8) */}
      {step === 8 && (
        <section className="max-w-xl mx-auto px-4 py-20 text-center space-y-8 animate-in fade-in duration-300">
          <div className="w-20 h-20 rounded-full bg-[#16A6A1]/10 text-[#16A6A1] mx-auto flex items-center justify-center relative">
            <Compass className="w-10 h-10 text-[#16A6A1] animate-spin-slow" />
            <span className="absolute inset-0 rounded-full border-2 border-[#16A6A1] animate-ping opacity-25" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-black uppercase text-[#16A6A1]">
              ✦ NOVA IS SHAPING YOUR JOURNEY
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0B3A53] font-heading">
              {aiStatusText}
            </h2>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm text-left space-y-3 text-xs">
            {[
              'Understanding your travel preferences',
              transportMode === 'Private'
                ? `Matching ${currentVehicle} vehicle to group size (${travelersCount} travelers)`
                : 'Optimizing transport & travel routes',
              hireGuide
                ? `Considering ${guideType} requirements for activities`
                : 'Configuring independent self-guided schedule',
              'Checking travel routes & timing',
              'Optimizing your days for pace',
              'Finalizing your journey recommendations',
            ].map((st, idx) => {
              const isDone = aiStepIndex > idx;
              const isCurrent = aiStepIndex === idx;
              return (
                <div key={idx} className="flex items-center gap-3">
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-[#16A6A1] shrink-0" />
                  ) : isCurrent ? (
                    <span className="w-4 h-4 rounded-full bg-[#0B3A53] animate-pulse shrink-0 flex items-center justify-center text-[10px] text-white font-black">
                      ●
                    </span>
                  ) : (
                    <span className="w-4 h-4 rounded-full border border-slate-300 shrink-0 text-[10px] text-slate-300 text-center">
                      ○
                    </span>
                  )}
                  <span
                    className={`font-bold ${
                      isDone
                        ? 'text-slate-800'
                        : isCurrent
                        ? 'text-[#0B3A53] font-black'
                        : 'text-slate-400'
                    }`}
                  >
                    {st}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* GENERATED ITINERARY PREVIEW (STEP 9) */}
      {step === 9 && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-12 animate-in fade-in duration-500">
          
          {/* Result Header */}
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
              <div className="space-y-1">
                <span className="text-xs font-black uppercase text-[#16A6A1]">
                  ✦ YOUR JOURNEY IS READY
                </span>
                <h2 className="text-3xl sm:text-4xl font-black text-[#0B3A53] font-heading">
                  {duration} in {destination}
                </h2>
                <p className="text-xs sm:text-sm font-bold text-[#146C86]">
                  Colombo → Kandy → Ella → Galle
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleRefine('Slower Pace')}
                  className="px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  ✦ Refine with NOVA
                </button>
                <button
                  onClick={() => triggerToast('Journey saved to your Trips!')}
                  className="px-6 py-2 rounded-full bg-[#0B3A53] hover:bg-[#072537] text-white font-extrabold text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-md"
                >
                  Save to My Trips
                </button>
              </div>
            </div>

            {/* Journey Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60">
                <span className="text-slate-400 font-bold block">Destination & Duration</span>
                <span className="font-extrabold text-[#0B3A53]">{destination} · {duration}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60">
                <span className="text-slate-400 font-bold block">Travelers</span>
                <span className="font-extrabold text-[#0B3A53]">{travelersCount} Persons ({travelersType})</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60">
                <span className="text-slate-400 font-bold block">Transport & Guide</span>
                <span className="font-extrabold text-[#0B3A53]">
                  {transportMode === 'Private' ? currentVehicle : 'Public'} {hireGuide ? `· ${guideType}` : '· Self'}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60">
                <span className="text-slate-400 font-bold block">Estimated Budget</span>
                <span className="font-extrabold text-[#146C86]">
                  ${minBudget}–${maxBudget}
                </span>
              </div>
            </div>
          </div>

          {/* DAY-BY-DAY ITINERARY VERTICAL TIMELINE */}
          <div className="space-y-6">
            <h3 className="text-2xl font-black text-[#0B3A53] font-heading">
              Day-by-Day Itinerary
            </h3>

            <div className="space-y-6">
              {[
                {
                  day: 'DAY 01',
                  title: 'Arrival & Colombo Coastal Vibe',
                  activities: [
                    `✦ 09:00 AM — Airport arrival & ${transportMode === 'Private' ? `private ${currentVehicle}` : 'express transport'} pickup`,
                    '✦ 02:00 PM — Colombo Fort colonial walking tour & lotus tower view',
                    `✦ 06:00 PM — Galle Face Green seaside street food sunset ${hireGuide ? 'with local guide' : ''}`,
                  ],
                  image: galleImg,
                },
                {
                  day: 'DAY 02',
                  title: 'Into the Sacred Hill Capital',
                  activities: [
                    `✦ 08:30 AM — ${transportMode === 'Private' ? `Private ${currentVehicle}` : 'Scenic mainline train'} travel to Kandy`,
                    `✦ 02:00 PM — Temple of the Sacred Tooth Relic tour ${hireGuide ? `with licensed ${guideType}` : ''}`,
                    '✦ 06:30 PM — Traditional Kandyan cultural drumming & dance show',
                  ],
                  image: kandyImg,
                },
                {
                  day: 'DAY 03',
                  title: 'Tea Estates & Botanical Gardens',
                  activities: [
                    `✦ 09:00 AM — Peradeniya Royal Botanical Gardens stroll ${hireGuide ? 'with flora guide' : ''}`,
                    '✦ 01:30 PM — Giragama Tea Factory plucking & tasting flight',
                    '✦ 07:00 PM — Lakeside dinner overlooking Kandy Lake',
                  ],
                  image: hortonPlainsImg,
                },
                {
                  day: 'DAY 04',
                  title: 'Highland Blue Train & Nine Arch Sunrise',
                  activities: [
                    '✦ 08:00 AM — Kandy to Ella scenic observation train journey',
                    `✦ 03:00 PM — Nine Arch Bridge railway photography ${hireGuide ? 'with local guide' : ''}`,
                    '✦ 07:30 PM — Relaxed mountain dinner at Cafe Chill Ella',
                  ],
                  image: ellaImg,
                },
                {
                  day: 'DAY 05',
                  title: 'Ella Rock Peak & Waterfalls',
                  activities: [
                    `✦ 07:00 AM — Guided Ella Rock summit cliff trek ${hireGuide ? `with ${guideType}` : ''}`,
                    '✦ 01:00 PM — Refreshing swim dip by Ravana Waterfalls',
                    '✦ 06:00 PM — Ceylon tea bungalow fireside relaxation',
                  ],
                  image: riverstonImg,
                },
                {
                  day: 'DAY 06',
                  title: 'Southern Dutch Fort Ramparts & Sunset',
                  activities: [
                    `✦ 09:00 AM — Coastal transfer to Galle ${transportMode === 'Private' ? `via private ${currentVehicle}` : ''}`,
                    `✦ 02:00 PM — Galle Dutch Fort cobblestone ramparts tour ${hireGuide ? 'with historian guide' : ''}`,
                    '✦ 06:00 PM — White lighthouse cliff sunset & artisan shopping',
                  ],
                  image: sigiriyaImg,
                },
                {
                  day: 'DAY 07',
                  title: 'Mirissa Palm Beach & Departure',
                  activities: [
                    '✦ 08:30 AM — Coconut Tree Hill palm cove photography',
                    '✦ 12:30 PM — Oceanfront tiger prawn lunch on Mirissa beach',
                    `✦ 04:00 PM — Departure transfer to Colombo Airport ${transportMode === 'Private' ? `via private ${currentVehicle}` : ''}`,
                  ],
                  image: mirissaImg,
                },
              ].map((d, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/70 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-6 items-center"
                >
                  <div className="md:col-span-4 h-48 w-full rounded-2xl overflow-hidden bg-slate-100">
                    <img src={d.image} alt={d.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="md:col-span-8 space-y-3">
                    <span className="text-xs font-black uppercase text-[#16A6A1]">{d.day}</span>
                    <h4 className="text-xl font-extrabold text-[#0B3A53]">{d.title}</h4>
                    <ul className="space-y-1.5 text-xs text-slate-600 font-semibold">
                      {d.activities.map((act, aIdx) => (
                        <li key={aIdx}>{act}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ROUTE MAP SECTION */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/70 shadow-sm space-y-4">
            <h3 className="text-xl font-black text-[#0B3A53] font-heading">
              Route Overview
            </h3>
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200/80 text-center space-y-4">
              <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-extrabold text-[#0B3A53]">
                <span className="px-4 py-2 rounded-full bg-white border shadow-2xs">📍 Colombo</span>
                <span>→</span>
                <span className="px-4 py-2 rounded-full bg-white border shadow-2xs">📍 Kandy (115 km)</span>
                <span>→</span>
                <span className="px-4 py-2 rounded-full bg-white border shadow-2xs">📍 Ella (140 km)</span>
                <span>→</span>
                <span className="px-4 py-2 rounded-full bg-white border shadow-2xs">📍 Galle (200 km)</span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Optimized route minimizes drive time while maximizing scenic mountain rail vistas.
              </p>
            </div>
          </div>

          {/* AI RECOMMENDATIONS ("NOVA ADDED A FEW IDEAS") */}
          <div className="space-y-4">
            <h3 className="text-2xl font-black text-[#0B3A53] font-heading">
              NOVA added a few ideas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: '🌿 Hidden Waterfall',
                  desc: 'A quiet dip near Ella away from main trails.',
                },
                {
                  title: '☕ Local Tea Experience',
                  desc: 'A slower way to experience Ceylon hill country.',
                },
                {
                  title: '🌅 Sunset Viewpoint',
                  desc: 'A perfect final evening overlooking Galle Fort.',
                },
              ].map((rec, idx) => (
                <div
                  key={idx}
                  className="bg-white p-6 rounded-3xl border border-slate-200/70 shadow-sm space-y-2"
                >
                  <h4 className="text-base font-extrabold text-[#0B3A53]">{rec.title}</h4>
                  <p className="text-xs text-slate-500 font-medium">{rec.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* FINAL ACTIONS & REFINE */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200/70 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <button
              onClick={() => setStep(1)}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              ← Edit Journey Preferences
            </button>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => handleRefine('More Adventure')}
                className="px-4 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                + More Adventure
              </button>
              <button
                onClick={() => {
                  triggerToast('Saved journey to your Trips page!');
                  navigate('/trips');
                }}
                className="px-8 py-3.5 rounded-full bg-[#0B3A53] hover:bg-[#072537] text-white font-extrabold text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-md"
              >
                Save to My Trips
              </button>
            </div>
          </div>
        </section>
      )}

      {/* FOOTER */}
      <Footer />
    </div>
  );
};
