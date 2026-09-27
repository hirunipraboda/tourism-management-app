import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  MapPin,
  Star,
  Heart,
  Calendar,
  Thermometer,
  Clock,
  Compass,
  DollarSign,
  Sun,
  CloudRain,
  Cloud,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Share2,
  Plus,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Users,
  Camera,
  Utensils,
  Hotel,
  Award,
  Info,
  X,
  ExternalLink,
  ShieldCheck,
  ThumbsUp,
  Sliders,
} from 'lucide-react';
import { LandingNavbar } from '../components/navigation/LandingNavbar';
import {
  getDestinationDetails,
  AttractionItem,
  ActivityItem,
  MapPinLocation,
  UserReview,
  ItineraryDay,
} from '../mock/destinationDetails';

export const DestinationDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const destinationId = id || 'ella';
  const destination = getDestinationDetails(destinationId);

  // Component States
  const [isFavorite, setIsFavorite] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [selectedAttractionModal, setSelectedAttractionModal] = useState<AttractionItem | null>(null);
  const [showAddTripModal, setShowAddTripModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeMapCategory, setActiveMapCategory] = useState<string>('all');
  const [selectedMapPin, setSelectedMapPin] = useState<MapPinLocation | null>(
    destination.mapLocations[0] || null
  );
  const [expandedDay, setExpandedDay] = useState<number | null>(1);

  const heroRef = useRef<HTMLDivElement>(null);

  // Scroll observer for floating sticky action bar
  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const heroBottom = heroRef.current.getBoundingClientRect().bottom;
        setShowStickyBar(heroBottom < 100);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Toast helper
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleFavoriteToggle = () => {
    setIsFavorite(!isFavorite);
    triggerToast(
      !isFavorite
        ? `Added ${destination.shortName} to your Saved Destinations!`
        : `Removed ${destination.shortName} from Saved Destinations.`
    );
  };

  const handleAddToTrip = () => {
    setShowAddTripModal(true);
  };

  const filteredMapLocations =
    activeMapCategory === 'all'
      ? destination.mapLocations
      : destination.mapLocations.filter((loc) => loc.type === activeMapCategory);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-[#16A6A1]/20 selection:text-[#0B3A53] pb-24">
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

      {/* DESTINATION HEADER BAR WITH BACK BUTTON & PLACE NAME */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-4">
        <div className="flex items-center justify-between gap-4">
          {/* Back Button on Left */}
          <button
            onClick={() => navigate('/destinations')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200/80 hover:border-[#16A6A1] text-[#0B3A53] text-xs font-extrabold shadow-2xs hover:shadow-md hover:-translate-x-1 transition-all duration-200 cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 text-[#16A6A1] group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Destinations</span>
          </button>

          {/* Place Name on Right */}
          <div className="flex items-center gap-2 text-right">
            <span className="text-xs sm:text-sm font-black text-[#0B3A53] tracking-tight uppercase">
              {destination.name}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#16A6A1]/10 text-[#146C86] text-[11px] font-bold border border-[#16A6A1]/20 hidden sm:inline-block">
              {destination.country}
            </span>
          </div>
        </div>
      </div>

      {/* 1. DESTINATION HERO SECTION */}
      <div ref={heroRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="relative h-[440px] sm:h-[520px] lg:h-[580px] w-full rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80 group">
          {/* Main Background Image */}
          <img
            src={destination.heroImage}
            alt={destination.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-slate-950/10 p-6 sm:p-10 lg:p-12 flex flex-col justify-between text-white z-10" />

          {/* Top Badges & Favorite Button */}
          <div className="relative z-20 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white text-xs font-extrabold tracking-wider shadow-xs">
                {destination.category}
              </span>
              <span className="px-3.5 py-1.5 rounded-full bg-[#16A6A1]/20 backdrop-blur-md border border-[#16A6A1]/40 text-[#16A6A1] text-xs font-extrabold tracking-wider shadow-xs flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#16A6A1]" />
                <span>NOVA Verified</span>
              </span>
            </div>

            <button
              onClick={handleFavoriteToggle}
              className={`p-3 rounded-full backdrop-blur-md border transition-all duration-300 cursor-pointer shadow-lg ${
                isFavorite
                  ? 'bg-rose-500 text-white border-rose-400 scale-110'
                  : 'bg-white/20 text-white border-white/30 hover:bg-white/30 hover:scale-105'
              }`}
              title={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-white' : ''}`} />
            </button>
          </div>

          {/* Bottom Hero Headline & Info */}
          <div className="relative z-20 space-y-4 max-w-3xl">
            <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-200 font-semibold">
              <span className="inline-flex items-center gap-1.5 text-[#16A6A1] font-bold">
                <MapPin className="w-4 h-4 text-[#16A6A1]" />
                <span>
                  {destination.region}, {destination.country}
                </span>
              </span>
              <span className="text-white/40">•</span>
              <span className="inline-flex items-center gap-1 text-amber-400 font-bold">
                <Star className="w-4 h-4 fill-amber-400" />
                <span>{destination.rating}</span>
                <span className="text-slate-300 font-normal">
                  ({destination.reviewCount.toLocaleString()} reviews)
                </span>
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight font-heading leading-tight drop-shadow-md">
              {destination.name}
            </h1>

            <p className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-2xl font-medium italic drop-shadow-xs">
              "{destination.tagline}"
            </p>

            {/* Hero Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => navigate('/ai-workflows')}
                className="bg-[#16A6A1] hover:bg-[#146C86] text-white font-extrabold text-xs uppercase tracking-wider px-7 py-3.5 rounded-full shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer flex items-center gap-2"
              >
                <span>Plan Trip</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={handleAddToTrip}
                className="bg-white/15 hover:bg-white/25 text-white font-bold text-xs px-7 py-4 rounded-full border border-white/30 backdrop-blur-md hover:scale-105 transition-all duration-300 cursor-pointer flex items-center gap-2 shadow-lg"
              >
                <Plus className="w-4 h-4" />
                <span>Add to Trip</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* DESTINATION ABOUT / DESCRIPTION CARD SECTION */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/70 shadow-sm relative overflow-hidden">
          {/* Subtle Ambient Accent Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#16A6A1]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-4xl space-y-4">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0B3A53] tracking-tight font-heading leading-tight">
              An Unforgettable Journey into {destination.name}
            </h2>

            {/* Multi-Paragraph Detailed Narrative */}
            <div className="space-y-4 text-sm sm:text-base text-slate-600 leading-relaxed font-medium">
              {destination.description.split('\n\n').map((paragraph, pIdx) => (
                <p key={pIdx}>{paragraph}</p>
              ))}
            </div>

            {/* Highlight Feature Badges */}
            <div className="pt-2 flex flex-wrap items-center gap-2 text-xs font-bold">
              <span className="px-3.5 py-1.5 rounded-full bg-slate-100/90 border border-slate-200/80 text-slate-700">
                Heritage & Culture
              </span>
              <span className="px-3.5 py-1.5 rounded-full bg-slate-100/90 border border-slate-200/80 text-slate-700">
                Panoramas & Trails
              </span>
              <span className="px-3.5 py-1.5 rounded-full bg-slate-100/90 border border-slate-200/80 text-slate-700">
                Local Gastronomy
              </span>
              <span className="px-3.5 py-1.5 rounded-full bg-slate-100/90 border border-slate-200/80 text-slate-700">
                Verified Eco Spots
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. QUICK INFORMATION BAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/70 shadow-sm hover:shadow-md transition-shadow">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-slate-200/60 text-left">
            {/* Item 1: Best Time */}
            <div className="pt-2 sm:pt-0 sm:px-4 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <Calendar className="w-4 h-4 text-[#16A6A1]" />
                <span>Best Time</span>
              </div>
              <p className="text-sm font-extrabold text-[#0B3A53]">
                {destination.quickInfo.bestTime}
              </p>
            </div>

            {/* Item 2: Avg Temp */}
            <div className="pt-4 sm:pt-0 sm:px-4 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <Thermometer className="w-4 h-4 text-[#16A6A1]" />
                <span>Avg Temperature</span>
              </div>
              <p className="text-sm font-extrabold text-[#0B3A53]">
                {destination.quickInfo.avgTemp}
              </p>
            </div>

            {/* Item 3: Recommended Stay */}
            <div className="pt-4 sm:pt-0 sm:px-4 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <Clock className="w-4 h-4 text-[#16A6A1]" />
                <span>Recommended Stay</span>
              </div>
              <p className="text-sm font-extrabold text-[#0B3A53]">
                {destination.quickInfo.recommendedStay}
              </p>
            </div>

            {/* Item 4: Travel Difficulty */}
            <div className="pt-4 sm:pt-0 sm:px-4 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <Compass className="w-4 h-4 text-[#16A6A1]" />
                <span>Difficulty</span>
              </div>
              <p className="text-sm font-extrabold text-[#0B3A53]">
                {destination.quickInfo.difficulty}
              </p>
            </div>

            {/* Item 5: Daily Budget */}
            <div className="pt-4 sm:pt-0 sm:px-4 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <DollarSign className="w-4 h-4 text-[#16A6A1]" />
                <span>Est. Daily Budget</span>
              </div>
              <p className="text-sm font-extrabold text-[#0B3A53]">
                {destination.quickInfo.dailyBudget}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. TOP ATTRACTIONS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0B3A53] tracking-tight font-heading">
              Top Attractions in {destination.shortName}
            </h2>
          </div>
          <button
            onClick={() => triggerToast(`Showing all ${destination.attractions.length} attractions in ${destination.shortName}`)}
            className="text-xs font-extrabold text-[#146C86] hover:text-[#0B3A53] inline-flex items-center gap-1 group transition-colors cursor-pointer"
          >
            <span>View all attractions</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Attractions 4-Column Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {destination.attractions.map((attraction) => (
            <div
              key={attraction.id}
              onClick={() => setSelectedAttractionModal(attraction)}
              className="bg-white rounded-3xl overflow-hidden border border-slate-200/70 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                  <img
                    src={attraction.image}
                    alt={attraction.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-900/70 backdrop-blur-md text-white text-[11px] font-bold border border-white/15">
                    {attraction.category}
                  </div>
                  <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-amber-600 text-xs font-bold flex items-center gap-1 shadow-xs">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{attraction.rating}</span>
                  </div>
                </div>

                <div className="p-5 space-y-2">
                  <h3 className="text-base font-extrabold text-slate-900 font-heading group-hover:text-[#146C86] transition-colors leading-snug">
                    {attraction.name}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                    {attraction.shortDesc}
                  </p>
                </div>
              </div>

              <div className="px-5 pb-5 pt-2 border-t border-slate-100/80 flex items-center justify-between text-xs text-slate-500">
                <span className="inline-flex items-center gap-1 font-medium">
                  <Clock className="w-3.5 h-3.5 text-[#16A6A1]" />
                  <span>{attraction.duration}</span>
                </span>
                <span className="font-extrabold text-[#146C86] group-hover:underline">
                  View Details →
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. WEATHER SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/70 shadow-sm">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            {/* Left Weather Widget Overview */}
            <div className="space-y-3 max-w-md">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#16A6A1]/10 text-[#146C86] text-xs font-bold border border-[#16A6A1]/20">
                <Sun className="w-3.5 h-3.5 text-[#16A6A1]" />
                <span>CLIMATE & FORECAST</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#0B3A53] tracking-tight font-heading">
                Weather in {destination.shortName}
              </h2>
              <div className="flex items-center gap-4 pt-1">
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600">
                  <Sun className="w-8 h-8 text-amber-500" />
                </div>
                <div>
                  <div className="text-3xl sm:text-4xl font-black text-[#0B3A53]">
                    {destination.weather.currentTemp}°C
                  </div>
                  <div className="text-xs font-bold text-slate-500">
                    {destination.weather.condition} • Humidity: {destination.weather.humidity}
                  </div>
                </div>
              </div>
            </div>

            {/* Right 6-Day Forecast Row */}
            <div className="w-full lg:w-auto grid grid-cols-3 sm:grid-cols-6 gap-3">
              {destination.weather.forecast.map((fc, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60 text-center space-y-1.5 hover:bg-white hover:shadow-md transition-all cursor-default"
                >
                  <p className="text-xs font-extrabold text-slate-400 uppercase">{fc.day}</p>
                  <div className="flex justify-center py-1">
                    {fc.condition === 'Sunny' ? (
                      <Sun className="w-5 h-5 text-amber-500" />
                    ) : fc.condition === 'Rainy' ? (
                      <CloudRain className="w-5 h-5 text-sky-500" />
                    ) : (
                      <Cloud className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                  <p className="text-sm font-black text-[#0B3A53]">{fc.temp}°C</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. OPENING HOURS & ENTRY FEES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-black text-[#0B3A53] tracking-tight font-heading">
            Opening Hours & Entry Fees
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {destination.attractions.map((attraction) => (
            <div
              key={attraction.id}
              className="bg-white p-6 rounded-3xl border border-slate-200/70 shadow-sm space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#16A6A1]/10 text-[#146C86] flex items-center justify-center font-bold">
                  <Info className="w-5 h-5 text-[#16A6A1]" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 font-heading">
                    {attraction.name}
                  </h3>
                  <span className="text-xs text-slate-400 font-medium">
                    {attraction.category}
                  </span>
                </div>
              </div>

              <div className="space-y-2 pt-1 text-xs">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/60">
                  <span className="font-bold text-slate-600 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[#16A6A1]" />
                    <span>Opening Hours</span>
                  </span>
                  <span className="font-extrabold text-[#0B3A53]">
                    {attraction.openingHours}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60">
                    <span className="text-slate-400 block font-bold">Foreign Travelers</span>
                    <span className="text-sm font-black text-[#146C86] mt-0.5 block">
                      {attraction.entryFee.foreign}
                    </span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60">
                    <span className="text-slate-400 block font-bold">Local Visitors</span>
                    <span className="text-sm font-black text-[#0B3A53] mt-0.5 block">
                      {attraction.entryFee.local}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. ACTIVITIES SECTION ("THINGS TO DO") */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-black text-[#0B3A53] tracking-tight font-heading">
            Things to Do in {destination.shortName}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {destination.activities.map((activity) => (
            <div
              key={activity.id}
              className="bg-white rounded-3xl overflow-hidden border border-slate-200/70 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group cursor-default flex flex-col justify-between"
            >
              <div>
                <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                  <img
                    src={activity.image}
                    alt={activity.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-900/75 backdrop-blur-md text-white text-[11px] font-bold border border-white/15">
                    {activity.category}
                  </div>
                </div>

                <div className="p-5 space-y-2">
                  <h3 className="text-base font-extrabold text-slate-900 font-heading group-hover:text-[#146C86] transition-colors leading-snug">
                    {activity.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                    {activity.desc}
                  </p>
                </div>
              </div>

              <div className="px-5 pb-5 pt-2 border-t border-slate-100/80 flex items-center justify-between text-xs">
                <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-extrabold">
                  {activity.difficulty}
                </span>
                <span className="font-black text-[#146C86]">
                  {activity.price}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. INTERACTIVE MAP SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0B3A53] tracking-tight font-heading">
              Explore Nearby Locations
            </h2>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {['all', 'attraction', 'restaurant', 'hotel', 'activity'].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveMapCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer capitalize ${
                  activeMapCategory === cat
                    ? 'bg-[#0B3A53] text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white p-6 rounded-3xl border border-slate-200/70 shadow-sm">
          {/* Interactive Map Visual Box */}
          <div className="lg:col-span-7 relative h-[380px] sm:h-[450px] w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-200/60 shadow-inner group">
            {/* Map Canvas Background */}
            <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#16A6A1_1px,transparent_1px)] [background-size:16px_16px]" />

            {/* Stylized Simulated Map Pins */}
            {filteredMapLocations.map((loc, idx) => {
              const isSelected = selectedMapPin?.id === loc.id;
              // Map positions
              const positions = [
                { top: '35%', left: '42%' },
                { top: '55%', left: '65%' },
                { top: '48%', left: '28%' },
                { top: '68%', left: '45%' },
                { top: '25%', left: '72%' },
              ];
              const pos = positions[idx % positions.length];

              return (
                <div
                  key={loc.id}
                  onClick={() => setSelectedMapPin(loc)}
                  style={{ top: pos.top, left: pos.left }}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 transition-all duration-300 ${
                    isSelected ? 'scale-125 z-30' : 'hover:scale-110'
                  }`}
                >
                  <div
                    className={`p-2.5 rounded-full shadow-2xl flex items-center justify-center border-2 ${
                      isSelected
                        ? 'bg-[#16A6A1] text-white border-white ring-4 ring-[#16A6A1]/40'
                        : 'bg-white text-[#0B3A53] border-[#16A6A1]'
                    }`}
                  >
                    {loc.type === 'attraction' && <MapPin className="w-4 h-4" />}
                    {loc.type === 'restaurant' && <Utensils className="w-4 h-4" />}
                    {loc.type === 'hotel' && <Hotel className="w-4 h-4" />}
                    {loc.type === 'activity' && <Camera className="w-4 h-4" />}
                  </div>
                </div>
              );
            })}

            {/* Map Info Card Overlay */}
            {selectedMapPin && (
              <div className="absolute bottom-4 left-4 right-4 bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-white flex items-center justify-between gap-4 z-30 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedMapPin.image}
                    alt={selectedMapPin.name}
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                  <div>
                    <h4 className="text-sm font-extrabold text-white">{selectedMapPin.name}</h4>
                    <p className="text-xs text-slate-300">{selectedMapPin.address}</p>
                  </div>
                </div>
                <button
                  onClick={() => triggerToast(`Navigating to ${selectedMapPin.name}...`)}
                  className="px-4 py-2 rounded-full bg-[#16A6A1] text-white text-xs font-bold hover:bg-[#138D89] transition-colors cursor-pointer"
                >
                  Get Directions
                </button>
              </div>
            )}
          </div>

          {/* Right Side Location List */}
          <div className="lg:col-span-5 space-y-3 max-h-[450px] overflow-y-auto pr-1">
            {filteredMapLocations.map((loc) => {
              const isSelected = selectedMapPin?.id === loc.id;
              return (
                <div
                  key={loc.id}
                  onClick={() => setSelectedMapPin(loc)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                    isSelected
                      ? 'bg-[#16A6A1]/10 border-[#16A6A1] shadow-xs'
                      : 'bg-slate-50/80 border-slate-200/70 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={loc.image}
                      alt={loc.name}
                      className="w-12 h-12 rounded-xl object-cover"
                    />
                    <div>
                      <h4 className="text-xs sm:text-sm font-extrabold text-[#0B3A53]">{loc.name}</h4>
                      <p className="text-[11px] text-slate-500 capitalize">{loc.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-500">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{loc.rating}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 8. TRAVELER REVIEWS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0B3A53] tracking-tight font-heading">
              Traveler Reviews & Scores
            </h2>
          </div>
          <button
            onClick={() => triggerToast('Opening full review drawer...')}
            className="text-xs font-extrabold text-[#146C86] hover:text-[#0B3A53] inline-flex items-center gap-1 group transition-colors cursor-pointer"
          >
            <span>Read all reviews</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Rating Overview */}
          <div className="lg:col-span-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/70 shadow-sm space-y-6">
            <div className="text-center space-y-2">
              <div className="text-5xl font-black text-[#0B3A53]">{destination.rating}</div>
              <div className="flex justify-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs font-bold text-slate-400">
                Based on {destination.reviewCount.toLocaleString()} verified traveler ratings
              </p>
            </div>

            {/* Rating Breakdown Bars */}
            <div className="space-y-2.5 pt-2 border-t border-slate-100">
              {Object.entries(destination.ratingBreakdown)
                .reverse()
                .map(([star, percent]) => (
                  <div key={star} className="flex items-center gap-3 text-xs">
                    <span className="w-8 font-bold text-slate-600">{star} ★</span>
                    <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#146C86] to-[#16A6A1] rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="w-8 text-right font-bold text-slate-400">{percent}%</span>
                  </div>
                ))}
            </div>
          </div>

          {/* Right Featured Reviews Grid */}
          <div className="lg:col-span-8 space-y-4">
            {destination.reviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-white p-6 rounded-3xl border border-slate-200/70 shadow-sm space-y-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={rev.userAvatar}
                      alt={rev.userName}
                      className="w-11 h-11 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <h4 className="text-sm font-extrabold text-[#0B3A53]">{rev.userName}</h4>
                      <p className="text-xs text-slate-400 font-medium">
                        {rev.userCountry} • {rev.date}
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 text-xs font-extrabold flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{rev.rating}.0</span>
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed italic">
                  "{rev.text}"
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 font-bold">
                    Visited: {rev.visitedLocation}
                  </span>
                  <button
                    onClick={() => triggerToast('Marked review as helpful!')}
                    className="inline-flex items-center gap-1.5 text-slate-500 hover:text-[#146C86] font-bold cursor-pointer transition-colors"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>Helpful ({rev.helpfulCount})</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. RECOMMENDED ITINERARY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0B3A53] tracking-tight font-heading">
              Recommended Itinerary: 3 Days in {destination.shortName}
            </h2>
          </div>
          <button
            onClick={() => triggerToast(`Added 3-Day ${destination.shortName} Itinerary to your trips!`)}
            className="bg-[#0B3A53] hover:bg-[#072537] text-white font-bold text-xs px-5 py-2.5 rounded-full shadow-xs hover:shadow-md transition-all cursor-pointer inline-flex items-center gap-2 border border-slate-700/40"
          >
            <Plus className="w-4 h-4 text-[#16A6A1]" />
            <span>Add Itinerary to Trip</span>
          </button>
        </div>

        {/* Timeline Days */}
        <div className="space-y-6">
          {destination.itinerary.map((day) => {
            const isExpanded = expandedDay === day.day;
            return (
              <div
                key={day.day}
                className="bg-white rounded-3xl border border-slate-200/70 shadow-sm overflow-hidden transition-all"
              >
                {/* Day Header Bar */}
                <div
                  onClick={() => setExpandedDay(isExpanded ? null : day.day)}
                  className="p-6 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/80 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className="w-12 h-12 rounded-2xl bg-[#16A6A1]/10 text-[#146C86] font-black text-lg flex items-center justify-center">
                      0{day.day}
                    </span>
                    <div>
                      <h3 className="text-base sm:text-lg font-extrabold text-[#0B3A53]">
                        Day {day.day}: {day.title}
                      </h3>
                      <span className="text-xs text-slate-400 font-medium">
                        Estimated Duration: {day.estimatedDuration}
                      </span>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </div>

                {/* Day Activities List */}
                {isExpanded && (
                  <div className="px-6 pb-6 pt-2 border-t border-slate-100 space-y-4 animate-in fade-in duration-300">
                    {day.activities.map((act, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-slate-50/90 border border-slate-200/60 flex items-start gap-4"
                      >
                        <span className="px-3 py-1 rounded-full bg-[#0B3A53] text-white text-[11px] font-extrabold shrink-0 mt-0.5">
                          {act.time}
                        </span>
                        <div className="space-y-1">
                          <h4 className="text-sm font-extrabold text-slate-900">{act.title}</h4>
                          <p className="text-xs text-slate-600 leading-relaxed">{act.desc}</p>
                          <span className="text-[11px] text-[#146C86] font-bold block pt-0.5">
                            📍 {act.location}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 14 & 15. FINAL CTA SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-white py-16 px-6 sm:px-12 rounded-3xl border border-slate-200/70 shadow-sm text-center space-y-6 max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0B3A53] font-heading tracking-tight">
            Ready to explore {destination.shortName}?
          </h2>

          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto font-medium">
            Build your perfect intelligent itinerary with NOVA’s agentic AI travel planner.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={() => navigate('/ai-workflows')}
              className="bg-[#0B3A53] hover:bg-[#072537] text-white font-bold text-xs uppercase tracking-wider px-8 py-3.5 rounded-full shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer flex items-center gap-2 border border-slate-700/40"
            >
              <span>Plan My Trip</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={handleFavoriteToggle}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-8 py-4 rounded-full border border-slate-200 transition-all cursor-pointer"
            >
              Save Destination
            </button>
          </div>
        </div>
      </section>

      {/* 10. STICKY TRIP ACTION BAR */}
      {showStickyBar && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-8 sm:right-8 lg:left-1/2 lg:-translate-x-1/2 lg:w-[720px] z-50 animate-in fade-in slide-in-from-bottom-6 duration-300">
          <div className="bg-white/90 backdrop-blur-xl border border-slate-200/80 shadow-2xl p-3 sm:p-4 rounded-full flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 pl-2">
              <img
                src={destination.heroImage}
                alt={destination.shortName}
                className="w-10 h-10 rounded-full object-cover border border-slate-200"
              />
              <div className="hidden sm:block">
                <h4 className="text-xs font-extrabold text-[#0B3A53] line-clamp-1">
                  {destination.name}
                </h4>
                <p className="text-[11px] text-slate-400">{destination.country}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleFavoriteToggle}
                className={`p-2.5 rounded-full border transition-all cursor-pointer ${
                  isFavorite
                    ? 'bg-rose-500 text-white border-rose-400'
                    : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                }`}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-white' : ''}`} />
              </button>

              <button
                onClick={handleAddToTrip}
                className="hidden sm:inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-[#0B3A53] font-bold text-xs px-4 py-2.5 rounded-full border border-slate-200 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add to Trip</span>
              </button>

              <button
                onClick={() => navigate('/ai-workflows')}
                className="bg-[#0B3A53] hover:bg-[#072537] text-white font-bold text-xs px-5 py-2.5 rounded-full shadow-xs hover:shadow-md transition-all cursor-pointer inline-flex items-center gap-1.5"
              >
                <span>Plan My Trip</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ATTRACTION DETAILS MODAL */}
      {selectedAttractionModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setSelectedAttractionModal(null)}
              className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative h-56 w-full rounded-2xl overflow-hidden">
              <img
                src={selectedAttractionModal.image}
                alt={selectedAttractionModal.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-900/80 text-white text-xs font-bold">
                {selectedAttractionModal.category}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-extrabold text-[#0B3A53]">
                  {selectedAttractionModal.name}
                </h3>
                <span className="inline-flex items-center gap-1 text-amber-500 font-bold text-sm">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span>{selectedAttractionModal.rating}</span>
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {selectedAttractionModal.details}
              </p>
            </div>

            <div className="space-y-2 p-4 rounded-2xl bg-slate-50 border border-slate-200/60 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="font-bold text-slate-500">Opening Hours</span>
                <span className="font-extrabold text-[#0B3A53]">
                  {selectedAttractionModal.openingHours}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="font-bold text-slate-500">Foreign Entry Fee</span>
                <span className="font-extrabold text-[#146C86]">
                  {selectedAttractionModal.entryFee.foreign}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="font-bold text-slate-500">Local Entry Fee</span>
                <span className="font-extrabold text-[#0B3A53]">
                  {selectedAttractionModal.entryFee.local}
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                onClick={() => {
                  setSelectedAttractionModal(null);
                  triggerToast(`Added ${selectedAttractionModal.name} to custom itinerary`);
                }}
                className="w-full bg-[#0B3A53] hover:bg-[#072537] text-white font-bold text-xs uppercase tracking-wider py-3.5 rounded-full transition-colors cursor-pointer"
              >
                Add Attraction to Trip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD TO TRIP MODAL */}
      {showAddTripModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 relative">
            <button
              onClick={() => setShowAddTripModal(false)}
              className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h3 className="text-xl font-extrabold text-[#0B3A53]">
                Add {destination.shortName} to Trip
              </h3>
              <p className="text-xs text-slate-500">
                Select an existing trip or start a new Sri Lanka journey.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => {
                  setShowAddTripModal(false);
                  triggerToast(`Added ${destination.shortName} to "Sri Lanka Summer 2026"!`);
                }}
                className="w-full p-4 rounded-2xl border border-slate-200 hover:border-[#16A6A1] hover:bg-[#16A6A1]/5 text-left transition-all cursor-pointer flex items-center justify-between"
              >
                <div>
                  <h4 className="text-xs font-extrabold text-[#0B3A53]">Sri Lanka Summer 2026</h4>
                  <p className="text-[11px] text-slate-400">July 12 – July 24 (12 Days)</p>
                </div>
                <Plus className="w-4 h-4 text-[#16A6A1]" />
              </button>

              <button
                onClick={() => {
                  setShowAddTripModal(false);
                  triggerToast(`Added ${destination.shortName} to "Highland Exploration"!`);
                }}
                className="w-full p-4 rounded-2xl border border-slate-200 hover:border-[#16A6A1] hover:bg-[#16A6A1]/5 text-left transition-all cursor-pointer flex items-center justify-between"
              >
                <div>
                  <h4 className="text-xs font-extrabold text-[#0B3A53]">Highland Exploration</h4>
                  <p className="text-[11px] text-slate-400">Aug 01 – Aug 07 (7 Days)</p>
                </div>
                <Plus className="w-4 h-4 text-[#16A6A1]" />
              </button>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  setShowAddTripModal(false);
                  navigate('/ai-workflows');
                }}
                className="w-full bg-[#146C86] hover:bg-[#0E5367] text-white font-bold text-xs uppercase tracking-wider py-3.5 rounded-full transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Trip with AI</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
