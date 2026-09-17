import React, { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  X,
  Star,
  Clock,
  MapPin,
  Compass,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Users,
  ShieldCheck,
  Calendar,
  Car,
  ChevronLeft,
  ChevronRight,
  Info,
  DollarSign,
  Camera,
  MessageSquare,
  Globe,
  Award,
  Layers,
  HeartHandshake,
  Check
} from 'lucide-react';
import { LandingNavbar } from '../components/navigation/LandingNavbar';
import { Footer } from '../components/navigation/Footer';
import { TRAVEL_PACKAGES, TravelPackage } from '../mock/tourAndGuideData';
import { NOVAGuideIcon } from '../components/guide/NOVAGuideChat';
import { NOVAGuideFloatingWidget } from '../components/guide/NOVAGuideFloatingWidget';
import { BotWaveVector } from '../components/guide/BotWaveVector';
import sriLankaBeautyImg from '../assets/destinations/Sri_lanka_beauty.jpg';
import websiteLogo from '../assets/website-logo.png';
import pickmeLogoImg from '../assets/pickme-logo.png';
import { PickMeLogo } from '../components/icons/PickMeLogo';
import { PickMePaymentModal } from '../components/payment/PickMePaymentModal';

export const ToursPage: React.FC = () => {
  const navigate = useNavigate();

  // State Management
  const [selectedDestinationFilter, setSelectedDestinationFilter] = useState<string>('All');
  const [searchDestination, setSearchDestination] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedTravelPkgModal, setSelectedTravelPkgModal] = useState<TravelPackage | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('explorer');
  const [isGuideWidgetOpen, setIsGuideWidgetOpen] = useState<boolean>(false);
  const [isPickMePaymentOpen, setIsPickMePaymentOpen] = useState<boolean>(false);

  // Booking Form State inside Details Modal
  const [bookingDate, setBookingDate] = useState<string>('2026-10-15');
  const [bookingTravelersCount, setBookingTravelersCount] = useState<number>(2);

  const guideSectionRef = useRef<HTMLDivElement>(null);
  const travelPackagesRef = useRef<HTMLDivElement>(null);
  const packageRowRef = useRef<HTMLDivElement>(null);

  const scrollPackages = (direction: 'left' | 'right') => {
    if (packageRowRef.current) {
      const scrollAmount = direction === 'left' ? -380 : 380;
      packageRowRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const destinationsList = [
    'All',
    'Kandy',
    'Ella',
    'Sigiriya',
    'Galle',
    'Nuwara Eliya',
    'Yala',
    'Mirissa',
    'Colombo'
  ];

  // Filtered Travel Packages
  const filteredTravelPackages = useMemo(() => {
    return TRAVEL_PACKAGES.filter((pkg) => {
      if (selectedDestinationFilter !== 'All') {
        const matchesDest =
          pkg.destination.toLowerCase().includes(selectedDestinationFilter.toLowerCase()) ||
          pkg.destinationsList.some((d) =>
            d.toLowerCase().includes(selectedDestinationFilter.toLowerCase())
          );
        if (!matchesDest) return false;
      }
      if (searchDestination.trim()) {
        const query = searchDestination.toLowerCase().trim();
        const matchesQuery =
          pkg.name.toLowerCase().includes(query) ||
          pkg.destination.toLowerCase().includes(query) ||
          pkg.destinationsList.some((d) => d.toLowerCase().includes(query));
        if (!matchesQuery) return false;
      }
      return true;
    });
  }, [selectedDestinationFilter, searchDestination]);

  const scrollToGuide = () => {
    setIsGuideWidgetOpen(true);
  };

  const scrollToPackages = () => {
    travelPackagesRef.current?.scrollIntoView({ behavior: 'smooth' });
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

      {/* 1. NAVBAR */}
      <LandingNavbar />

      {/* 2. HERO SECTION */}
      <section className="relative overflow-hidden bg-slate-900 text-white py-28 sm:py-36 px-4 sm:px-6 lg:px-8">
        {/* Background Image - Fully Visible */}
        <div className="absolute inset-0 z-0">
          <img
            src={sriLankaBeautyImg}
            alt="Sri Lanka Beauty Travel"
            className="w-full h-full object-cover opacity-90 sm:opacity-95 object-center"
          />
          {/* Subtle Scrim Gradient Overlay for Text Legibility */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/50 via-slate-950/35 to-slate-950/60"></div>
          <div className="absolute inset-0 bg-[#0B3A53]/15 mix-blend-multiply"></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-6">

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl font-black font-heading tracking-tight text-white leading-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]">
            Travel Better.{' '}
            <span className="bg-gradient-to-r from-teal-300 via-[#16A6A1] to-emerald-400 bg-clip-text text-transparent drop-shadow-md">
              Explore Smarter.
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-base sm:text-xl text-slate-100 max-w-2xl mx-auto font-semibold leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
            Discover carefully planned travel packages and get instant help from your personal{' '}
            <strong className="text-white font-black">NOVA AI Guide</strong>.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
            <button
              onClick={scrollToPackages}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-[#146C86] via-[#16A6A1] to-emerald-400 hover:from-[#0B3A53] hover:to-[#146C86] text-white text-sm font-black transition-all duration-300 shadow-2xl shadow-emerald-950/50 hover:scale-105 flex items-center justify-center gap-2 cursor-pointer group"
            >
              <span>Explore Travel Packages</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={scrollToGuide}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900/60 hover:bg-slate-900/80 text-white border border-white/40 hover:border-white/60 text-sm font-black transition-all duration-300 backdrop-blur-md shadow-xl flex items-center justify-center gap-2 cursor-pointer"
            >
              <NOVAGuideIcon className="w-4 h-4 text-emerald-400" />
              <span>Talk to NOVA Guide</span>
            </button>
          </div>
        </div>
      </section>

      {/* 3. MEET NOVA GUIDE SECTION */}
      <section ref={guideSectionRef} id="nova-ai-guide-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-r from-[#0B3A53] via-[#146C86] to-[#0B3A53] text-white rounded-3xl p-8 sm:p-12 shadow-xl border border-[#16A6A1]/30 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-48 h-48 bg-[#16A6A1]/20 rounded-full blur-3xl pointer-events-none"></div>

          <div className="space-y-4 max-w-2xl text-center md:text-left relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-teal-300 text-xs font-black uppercase tracking-wider backdrop-blur-md">
              <Compass className="w-3.5 h-3.5 text-teal-300" />
              <span>AI Travel Companion</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black font-heading tracking-tight text-white">
              Meet NOVA Guide
            </h2>

            <p className="text-sm sm:text-base text-slate-200 font-medium leading-relaxed">
              Your journey, guided by NOVA. Discover hidden gems, understand what you see, and get instant answers wherever your adventure takes you.
            </p>
          </div>

          <button
            onClick={() => setIsGuideWidgetOpen(true)}
            className="group relative flex flex-col items-center justify-center cursor-pointer shrink-0 bg-transparent border-0 focus:outline-none"
            title="Click to chat with NOVA Guide!"
          >
            <div className="relative transform group-hover:scale-105 transition-transform duration-300">
              <BotWaveVector className="w-44 h-44 sm:w-56 sm:h-56 drop-shadow-[0_16px_32px_rgba(0,0,0,0.4)]" />
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-[#16A6A1] text-white text-xs font-black uppercase tracking-wider shadow-lg flex items-center gap-1.5 whitespace-nowrap group-hover:bg-[#146C86] transition-colors">
                <span>Chat with NOVA Guide 💬</span>
              </div>
            </div>
          </button>
        </div>
      </section>

      {/* 4. AI GUIDE CAPABILITIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-white rounded-3xl border border-slate-200/80 shadow-xs my-12">
        <div className="text-center space-y-3 max-w-3xl mx-auto mb-12">
          <span className="text-xs font-black uppercase text-[#16A6A1] tracking-wider">
            Introducing
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#0B3A53] font-heading tracking-tight">
            Your Travel Companion, Wherever You Go
          </h2>
          <p className="text-sm text-slate-500 font-medium">
            From identifying ancient monuments to recommending Sri Lankan street food, NOVA Guide is ready 24/7.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 hover:border-[#16A6A1]/50 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-[#0B3A53] text-[#16A6A1] flex items-center justify-center p-2.5 shadow-sm">
              <Camera className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-[#0B3A53] font-heading group-hover:text-[#16A6A1] transition-colors">
              Understand What You See
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Upload an image of a landmark, temple, dish, or building and let NOVA analyze it with instant historical context and visitor tips.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 hover:border-[#16A6A1]/50 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-[#0B3A53] text-[#16A6A1] flex items-center justify-center p-2.5 shadow-sm">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-[#0B3A53] font-heading group-hover:text-[#16A6A1] transition-colors">
              Ask Anything
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Ask questions about destinations, attractions, local customs, entry fees, and travel etiquette in plain conversational language.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 hover:border-[#16A6A1]/50 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-[#0B3A53] text-[#16A6A1] flex items-center justify-center p-2.5 shadow-sm">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-[#0B3A53] font-heading group-hover:text-[#16A6A1] transition-colors">
              Discover Experiences
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Find things to do, hidden waterfalls, local spice markets, and scenic viewpoints worth visiting in every region.
            </p>
          </div>

          {/* Card 4 */}
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 hover:border-[#16A6A1]/50 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-[#0B3A53] text-[#16A6A1] flex items-center justify-center p-2.5 shadow-sm">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-[#0B3A53] font-heading group-hover:text-[#16A6A1] transition-colors">
              Build Your Day
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Generate personalized daily itineraries tailored to your pace, morning preferences, and preferred travel style.
            </p>
          </div>

          {/* Card 5 */}
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 hover:border-[#16A6A1]/50 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-[#0B3A53] text-[#16A6A1] flex items-center justify-center p-2.5 shadow-sm">
              <DollarSign className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-[#0B3A53] font-heading group-hover:text-[#16A6A1] transition-colors">
              Travel Within Your Budget
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Receive smart recommendations for accommodations, food, transportation, and activities based on your budget.
            </p>
          </div>

          {/* Card 6 */}
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 hover:border-[#16A6A1]/50 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-[#0B3A53] text-[#16A6A1] flex items-center justify-center p-2.5 shadow-sm">
              <Globe className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-[#0B3A53] font-heading group-hover:text-[#16A6A1] transition-colors">
              Learn Local Culture
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Understand traditional Sri Lankan food, ancient royal history, local island traditions, and authentic cultural experiences.
            </p>
          </div>
        </div>
      </section>

      {/* 5. AI GUIDE PRICING SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center space-y-3 max-w-3xl mx-auto mb-12">
          <span className="text-xs font-black uppercase text-[#16A6A1] tracking-wider">
            Flexible Plans
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#0B3A53] font-heading tracking-tight">
            Choose Your NOVA Guide Plan
          </h2>
          <p className="text-sm text-slate-500 font-medium">
            Get more from your AI travel companion.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">

          {/* Plan 1: FREE */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-2xl hover:-translate-y-2.5 hover:border-[#16A6A1] transition-all duration-300 flex flex-col justify-between space-y-6 group cursor-pointer">
            <div className="space-y-4">
              <h3 className="text-lg font-black text-[#0B3A53] font-heading group-hover:text-[#16A6A1] transition-colors">FREE</h3>
              <div className="space-y-0.5">
                <span className="text-3xl font-black text-[#0B3A53]">$0</span>
                <span className="text-xs text-slate-400 font-bold block">Forever Free</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-600 font-medium border-t border-slate-100 pt-4">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#16A6A1]" /> 10 AI questions/month</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#16A6A1]" /> 3 image uploads/month</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#16A6A1]" /> Basic destination info</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#16A6A1]" /> Basic recommendations</li>
              </ul>
            </div>
            <button
              onClick={() => {
                setSelectedPlanId('free');
                triggerToast('Activated FREE NOVA Guide Plan!');
              }}
              className="w-full py-2.5 rounded-xl bg-slate-100 group-hover:bg-[#0B3A53] group-hover:text-white font-extrabold text-xs transition-all duration-200 cursor-pointer shadow-xs"
            >
              Start Free
            </button>
          </div>

          {/* Plan 2: AI GUIDE */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-2xl hover:-translate-y-2.5 hover:border-[#16A6A1] transition-all duration-300 flex flex-col justify-between space-y-6 group cursor-pointer">
            <div className="space-y-4">
              <h3 className="text-lg font-black text-[#0B3A53] font-heading group-hover:text-[#16A6A1] transition-colors">AI GUIDE</h3>
              <div className="space-y-0.5">
                <span className="text-3xl font-black text-[#0B3A53]">$4.99</span>
                <span className="text-xs text-slate-400 font-bold block">/ week</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-600 font-medium border-t border-slate-100 pt-4">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#16A6A1]" /> 50 AI questions</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#16A6A1]" /> 10 image analyses</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#16A6A1]" /> Destination recommendations</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#16A6A1]" /> Basic itinerary suggestions</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#16A6A1]" /> Food recognition</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#16A6A1]" /> Landmark recognition</li>
              </ul>
            </div>
            <button
              onClick={() => {
                setSelectedPlanId('guide');
                triggerToast('Selected AI Guide Weekly Plan ($4.99/wk)');
              }}
              className="w-full py-2.5 rounded-xl bg-slate-100 group-hover:bg-[#0B3A53] group-hover:text-white font-extrabold text-xs transition-all duration-200 cursor-pointer shadow-xs"
            >
              Choose Weekly
            </button>
          </div>

          {/* Plan 3: AI EXPLORER (MOST POPULAR - HIGHLIGHTED) */}
          <div className="bg-[#0B3A53] text-white rounded-3xl p-6 border-2 border-[#16A6A1] shadow-2xl hover:shadow-[#16A6A1]/40 hover:scale-110 hover:-translate-y-3.5 transition-all duration-300 flex flex-col justify-between space-y-6 relative scale-105 group cursor-pointer">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#16A6A1] text-white text-[10px] font-black uppercase tracking-wider shadow-md group-hover:bg-emerald-400 group-hover:text-slate-950 transition-colors">
              MOST POPULAR
            </div>
            <div className="space-y-4 pt-2">
              <h3 className="text-lg font-black text-white font-heading group-hover:text-teal-300 transition-colors">AI EXPLORER</h3>
              <div className="space-y-0.5">
                <span className="text-3xl font-black text-white">$9.99</span>
                <span className="text-xs text-slate-300 font-bold block">/ week</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-200 font-medium border-t border-white/10 pt-4">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#16A6A1]" /> 150 AI questions</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#16A6A1]" /> 40 image analyses</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#16A6A1]" /> Personalized itineraries</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#16A6A1]" /> Advanced image analysis</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#16A6A1]" /> Budget planning</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#16A6A1]" /> Transportation recommendations</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#16A6A1]" /> Multi-day trip planning</li>
              </ul>
            </div>
            <button
              onClick={() => {
                setSelectedPlanId('explorer');
                triggerToast('Selected AI Explorer Plan ($9.99/wk) - Most Popular!');
              }}
              className="w-full py-2.5 rounded-xl bg-[#16A6A1] group-hover:bg-emerald-400 group-hover:text-slate-950 font-black text-xs transition-all duration-200 shadow-md group-hover:shadow-lg cursor-pointer"
            >
              Choose Explorer
            </button>
          </div>

          {/* Plan 4: AI TRAVELER */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-2xl hover:-translate-y-2.5 hover:border-[#16A6A1] transition-all duration-300 flex flex-col justify-between space-y-6 group cursor-pointer">
            <div className="space-y-4">
              <h3 className="text-lg font-black text-[#0B3A53] font-heading group-hover:text-[#16A6A1] transition-colors">AI TRAVELER</h3>
              <div className="space-y-0.5">
                <span className="text-3xl font-black text-[#0B3A53]">$19.99</span>
                <span className="text-xs text-slate-400 font-bold block">/ month</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-600 font-medium border-t border-slate-100 pt-4">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#16A6A1]" /> 500 AI questions</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#16A6A1]" /> 150 image analyses</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#16A6A1]" /> Advanced itinerary generation</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#16A6A1]" /> Multi-destination planning</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#16A6A1]" /> Personalized recommendations</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#16A6A1]" /> Budget optimization</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#16A6A1]" /> Saved AI conversations</li>
              </ul>
            </div>
            <button
              onClick={() => {
                setSelectedPlanId('traveler');
                triggerToast('Selected AI Traveler Monthly Plan ($19.99/mo)');
              }}
              className="w-full py-2.5 rounded-xl bg-slate-100 group-hover:bg-[#0B3A53] group-hover:text-white font-extrabold text-xs transition-all duration-200 cursor-pointer shadow-xs"
            >
              Choose Traveler
            </button>
          </div>

          {/* Plan 5: AI WANDERER */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-2xl hover:-translate-y-2.5 hover:border-[#16A6A1] transition-all duration-300 flex flex-col justify-between space-y-6 group cursor-pointer">
            <div className="space-y-4">
              <h3 className="text-lg font-black text-[#0B3A53] font-heading group-hover:text-[#16A6A1] transition-colors">AI WANDERER</h3>
              <div className="space-y-0.5">
                <span className="text-3xl font-black text-[#0B3A53]">$34.99</span>
                <span className="text-xs text-slate-400 font-bold block">/ month</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-600 font-medium border-t border-slate-100 pt-4">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#16A6A1]" /> Unlimited AI conversations</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#16A6A1]" /> 500 image analyses</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#16A6A1]" /> Advanced trip planning</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#16A6A1]" /> Multi-country itineraries</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#16A6A1]" /> Advanced budget planning</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#16A6A1]" /> Priority AI responses</li>
              </ul>
            </div>
            <button
              onClick={() => {
                setSelectedPlanId('wanderer');
                triggerToast('Selected AI Wanderer Premium Plan ($34.99/mo)');
              }}
              className="w-full py-2.5 rounded-xl bg-[#0B3A53] group-hover:bg-[#16A6A1] text-white font-extrabold text-xs transition-all duration-200 cursor-pointer shadow-xs"
            >
              Go Premium
            </button>
          </div>

        </div>
      </section>

      {/* 6. TRAVEL PACKAGES SECTION */}
      <section ref={travelPackagesRef} id="travel-packages-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4 border-b border-slate-200/80 pb-4">
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black text-[#0B3A53] tracking-tight font-heading">
              Travel Packages
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Ready-made journeys for travelers who want everything thoughtfully arranged.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => scrollPackages('left')}
              className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-xs hover:bg-[#0B3A53] hover:text-white text-slate-700 transition-all cursor-pointer hover:shadow-md"
              title="Scroll Left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scrollPackages('right')}
              className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-xs hover:bg-[#0B3A53] hover:text-white text-slate-700 transition-all cursor-pointer hover:shadow-md"
              title="Scroll Right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <span className="text-xs font-extrabold text-slate-400 ml-2">
              {filteredTravelPackages.length} Journeys
            </span>
          </div>
        </div>

        {/* PACKAGE CARDS ROW WITH SIDE ARROWS */}
        <div className="relative flex items-center gap-2 sm:gap-4">
          {/* Left Arrow Button (<) */}
          <button
            onClick={() => scrollPackages('left')}
            className="hidden md:flex p-3 rounded-full bg-[#0B3A53]/85 hover:bg-[#16A6A1] hover:text-slate-950 text-white border border-white/20 backdrop-blur-xl transition-all duration-300 cursor-pointer shrink-0 hover:scale-110 z-20 shadow-2xl"
            aria-label="Scroll Left"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Scrollable Package Cards Row */}
          <div
            ref={packageRowRef}
            className="flex gap-6 overflow-x-auto scroll-smooth py-4 px-1 w-full no-scrollbar focus:outline-none"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {filteredTravelPackages.map((pkg) => (
              <div
                key={pkg.id}
                onClick={() => setSelectedTravelPkgModal(pkg)}
                className="w-[300px] sm:w-[360px] shrink-0 bg-white rounded-3xl overflow-hidden border border-slate-200/70 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group cursor-pointer flex flex-col justify-between"
              >
                <div>
                  {/* Image */}
                  <div className="relative h-56 w-full overflow-hidden bg-slate-100">
                    <img
                      src={pkg.imageUrl}
                      alt={pkg.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-xs font-extrabold border border-white/15">
                      {pkg.duration}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-6 space-y-2">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#146C86] block">
                      {pkg.destinationsList.join(' · ')}
                    </span>
                    <h3 className="text-xl font-black text-slate-900 font-heading group-hover:text-[#146C86] transition-colors leading-snug">
                      {pkg.name}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium line-clamp-2 leading-relaxed">
                      {pkg.about}
                    </p>
                  </div>
                </div>

                {/* Price & Action */}
                <div className="px-6 pb-6 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
                      From
                    </span>
                    <span className="font-black text-[#0B3A53] text-base">{pkg.priceFrom}</span>
                  </div>

                  <span className="font-extrabold text-[#16A6A1] group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    <span>View Package</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Right Arrow Button (>) */}
          <button
            onClick={() => scrollPackages('right')}
            className="hidden md:flex p-3 rounded-full bg-[#0B3A53]/85 hover:bg-[#16A6A1] hover:text-slate-950 text-white border border-white/20 backdrop-blur-xl transition-all duration-300 cursor-pointer shrink-0 hover:scale-110 z-20 shadow-2xl"
            aria-label="Scroll Right"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </section>

      {/* 7. TRANSPORT SECTION - PICKME PARTNER */}
      <section id="transport-partner-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-12">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-400/15 text-amber-800 dark:text-amber-300 text-xs font-black uppercase tracking-wider border border-amber-400/30">
              <Car className="w-3.5 h-3.5 text-amber-500" />
              <span>TRANSPORTATION PARTNER</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-[#0B3A53] tracking-tight font-heading">
              Need a Ride? We've Got You Covered.
            </h2>
            <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
              Introducing PickMe, NOVA's transportation partner. Get where you need to go with ease and enjoy an exclusive 20% discount on your rides.
            </p>
          </div>

          {/* PickMe Premium Partnership Card */}
          <div className="bg-gradient-to-br from-[#475569] via-[#334155] to-[#1E293B] rounded-3xl p-8 sm:p-12 text-white shadow-2xl border border-slate-400/40 relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute -right-10 -top-10 w-72 h-72 bg-slate-300/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -left-10 -bottom-10 w-72 h-72 bg-slate-400/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              
              {/* Left Column: Brand & Copy */}
              <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-slate-800/90 border border-slate-500/70 text-amber-300 text-xs font-black uppercase tracking-wider backdrop-blur-md">
                  <Car className="w-3.5 h-3.5 text-amber-400" />
                  <span>YOUR JOURNEY DOESN'T STOP HERE</span>
                </div>

                <div className="space-y-3">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-amber-300 block">
                    Meet Our Transportation Partner
                  </span>
                  <div className="flex items-center justify-center lg:justify-start pt-1">
                    <img
                      src={pickmeLogoImg}
                      alt="PickMe Logo"
                      className="h-28 sm:h-36 md:h-44 w-auto object-contain rounded-3xl drop-shadow-2xl hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </div>

                <p className="text-sm sm:text-base text-slate-100 font-medium leading-relaxed max-w-xl">
                  Travel around Sri Lanka with ease. Download the PickMe app through NOVA and enjoy 20% off your eligible rides.
                </p>

                {/* 3 Transport Feature Items */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="bg-slate-900/40 backdrop-blur-md border border-slate-400/30 rounded-2xl p-4 text-left hover:bg-slate-900/60 hover:border-slate-300/50 transition-all group">
                    <div className="text-xl mb-1">🚗</div>
                    <h4 className="text-xs font-black text-white font-heading group-hover:text-amber-300 transition-colors">Private Rides</h4>
                    <p className="text-[11px] text-slate-200 font-medium leading-tight mt-1">
                      Arrange convenient private transportation for getting around your destination.
                    </p>
                  </div>

                  <div className="bg-slate-900/40 backdrop-blur-md border border-slate-400/30 rounded-2xl p-4 text-left hover:bg-slate-900/60 hover:border-slate-300/50 transition-all group">
                    <div className="text-xl mb-1">📍</div>
                    <h4 className="text-xs font-black text-white font-heading group-hover:text-amber-300 transition-colors">Destination Transfers</h4>
                    <p className="text-[11px] text-slate-200 font-medium leading-tight mt-1">
                      Use PickMe when travelling between attractions, hotels and other locations.
                    </p>
                  </div>

                  <div className="bg-slate-900/40 backdrop-blur-md border border-slate-400/30 rounded-2xl p-4 text-left hover:bg-slate-900/60 hover:border-slate-300/50 transition-all group">
                    <div className="text-xl mb-1">🧳</div>
                    <h4 className="text-xs font-black text-white font-heading group-hover:text-amber-300 transition-colors">Easy Travel</h4>
                    <p className="text-[11px] text-slate-200 font-medium leading-tight mt-1">
                      Arrange transportation through PickMe while keeping your trip planning inside NOVA.
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column: Prominent 20% OFF Badge & CTA */}
              <div className="lg:col-span-5 flex flex-col items-center justify-center text-center space-y-6 bg-slate-900/85 backdrop-blur-xl border border-slate-500/50 rounded-3xl p-8 shadow-2xl">
                <div className="space-y-2">
                  <span className="text-xs font-black uppercase tracking-widest text-amber-400 block">
                    EXCLUSIVE PARTNER OFFER
                  </span>
                  <div className="inline-block bg-gradient-to-r from-[#FFD200] via-[#FFC400] to-[#FFA800] text-slate-950 font-black text-4xl sm:text-5xl px-8 py-3.5 rounded-2xl shadow-xl shadow-amber-500/20 font-heading tracking-tight border border-amber-200/50">
                    20% OFF
                  </div>
                  <span className="text-sm font-extrabold text-white block pt-1">
                    YOUR RIDES
                  </span>
                </div>

                <p className="text-xs text-slate-200 font-medium max-w-xs leading-relaxed">
                  Download PickMe and arrange your ride. Enjoy 20% off eligible rides with PickMe.
                </p>

                <div className="w-full space-y-3">
                  <button
                    type="button"
                    onClick={() => setIsPickMePaymentOpen(true)}
                    className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#FFD200] via-[#FFC400] to-[#FFA800] hover:from-[#FFE033] hover:to-[#FFC400] text-slate-950 text-sm font-black transition-all duration-300 shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer group hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <span>Get 20% Off with PickMe →</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsPickMePaymentOpen(true)}
                    className="inline-flex items-center gap-1.5 text-xs font-extrabold text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
                  >
                    <span>Need transportation? Use PickMe →</span>
                  </button>
                </div>

                <p className="text-[10px] text-slate-400 italic font-medium">
                  *Terms and eligibility may apply.
                </p>
              </div>

            </div>
          </div>
        </div>
      </section>





      {/* 9. TRAVEL PACKAGE DETAILS MODAL (100% PRESERVED EXPERIENCE) */}
      {selectedTravelPkgModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-4xl w-full h-full max-h-[92vh] shadow-2xl border border-slate-200 overflow-y-auto flex flex-col justify-between relative">

            {/* Header Bar */}
            <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-slate-200/80 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedTravelPkgModal(null)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0B3A53] hover:text-[#16A6A1] transition-colors cursor-pointer bg-slate-100 px-3 py-1.5 rounded-full"
                >
                  <ArrowRight className="w-4 h-4 rotate-180" />
                  <span>Back to Packages</span>
                </button>
                <div className="hidden sm:block border-l border-slate-200 pl-3">
                  <span className="text-xs font-black text-[#0B3A53]">{selectedTravelPkgModal.name}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedTravelPkgModal(null)}
                  className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 space-y-8 flex-1">

              {/* Package Hero Banner */}
              <div className="relative h-64 sm:h-80 w-full rounded-3xl overflow-hidden shadow-md bg-slate-900">
                <img
                  src={selectedTravelPkgModal.imageUrl}
                  alt={selectedTravelPkgModal.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent"></div>

                <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-[#16A6A1] uppercase tracking-wider">
                    <MapPin className="w-3.5 h-3.5 text-[#16A6A1]" />
                    <span>{selectedTravelPkgModal.destinationsList.join(' · ')}</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black font-heading">
                    {selectedTravelPkgModal.name}
                  </h2>
                  <div className="flex items-center gap-4 text-xs font-bold text-slate-200">
                    <span>{selectedTravelPkgModal.duration} ({selectedTravelPkgModal.nights})</span>
                    <span>•</span>
                    <span>Style: {selectedTravelPkgModal.travelStyle}</span>
                    <span>•</span>
                    <span>Group: {selectedTravelPkgModal.groupSize}</span>
                  </div>
                </div>
              </div>

              {/* Overview & Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-4">
                  <h3 className="text-lg font-black text-[#0B3A53] font-heading">
                    About this Journey
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                    {selectedTravelPkgModal.about}
                  </p>
                </div>

                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-bold uppercase">Duration</span>
                    <span className="font-bold text-[#0B3A53]">{selectedTravelPkgModal.duration}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-bold uppercase">Destination</span>
                    <span className="font-bold text-[#0B3A53]">{selectedTravelPkgModal.destination}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-bold uppercase">Best For</span>
                    <span className="font-bold text-[#0B3A53]">{selectedTravelPkgModal.bestFor}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-slate-400 font-bold uppercase">Starting From</span>
                    <span className="text-base font-black text-[#0B3A53]">{selectedTravelPkgModal.priceFrom}</span>
                  </div>
                </div>
              </div>

              {/* What's Included & Not Included */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase text-[#0B3A53] tracking-wider">
                    What's Included
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-700 font-medium">
                    {selectedTravelPkgModal.inclusions.map((inc, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#16A6A1] shrink-0 mt-0.5" />
                        <span>{inc}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                    What's Not Included
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-500 font-medium">
                    {selectedTravelPkgModal.exclusions.map((exc, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <X className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        <span>{exc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Day-by-Day Itinerary Timeline */}
              <div className="space-y-4 pt-4 border-t border-slate-200">
                <h3 className="text-lg font-black text-[#0B3A53] font-heading">
                  Day-by-Day Itinerary
                </h3>
                <div className="space-y-4">
                  {selectedTravelPkgModal.dailyItinerary.map((day) => (
                    <div key={day.day} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
                      <div className="flex items-center gap-2 text-[#0B3A53] font-bold">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#0B3A53] text-white text-[10px] font-black">
                          Day {day.day}
                        </span>
                        <h4 className="font-extrabold text-sm">{day.title}</h4>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-slate-600">
                        <div><strong className="text-slate-800">Morning:</strong> {day.morning}</div>
                        <div><strong className="text-slate-800">Afternoon:</strong> {day.afternoon}</div>
                        <div><strong className="text-slate-800">Evening:</strong> {day.evening}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Price & Booking Footer */}
            <div className="sticky bottom-0 z-30 bg-white border-t border-slate-200/80 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Starting From</span>
                <span className="text-xl font-black text-[#0B3A53]">{selectedTravelPkgModal.priceFrom}</span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={() => {
                    setSelectedTravelPkgModal(null);
                    triggerToast(`Added ${selectedTravelPkgModal.name} to your trip!`);
                  }}
                  className="px-5 py-3 rounded-full bg-slate-100 hover:bg-slate-200 text-[#0B3A53] font-bold text-xs cursor-pointer w-full sm:w-auto text-center"
                >
                  Add to My Trip
                </button>

                <button
                  onClick={() => {
                    setSelectedTravelPkgModal(null);
                    triggerToast(`Booking requested for ${selectedTravelPkgModal.name}!`);
                  }}
                  className="bg-[#0B3A53] hover:bg-[#072537] text-white font-extrabold text-xs uppercase tracking-wider px-7 py-3 rounded-full shadow-md cursor-pointer w-full sm:w-auto text-center"
                >
                  Book Package
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* PICKME MOBILITY PASS PAYMENT PORTAL MODAL */}
      <PickMePaymentModal
        isOpen={isPickMePaymentOpen}
        onClose={() => setIsPickMePaymentOpen(false)}
        passFee={7.50}
        durationDays={3}
        onSuccess={(code) => {
          triggerToast(`PickMe 20% Off Promo Pass activated: ${code}!`);
        }}
      />

      {/* FOOTER */}
      <Footer />

      {/* FLOATING AI GUIDE BOT WIDGET (BOTTOM-RIGHT CORNER) */}
      <NOVAGuideFloatingWidget
        isOpen={isGuideWidgetOpen}
        onToggle={() => setIsGuideWidgetOpen(!isGuideWidgetOpen)}
        onSelectPackage={(pkg) => setSelectedTravelPkgModal(pkg)}
      />
    </div>
  );
};
