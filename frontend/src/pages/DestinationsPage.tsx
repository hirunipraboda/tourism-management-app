import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  X,
  SlidersHorizontal,
  ArrowRight,
  Star,
  Heart,
  MapPin,
  Compass,
  Filter,
  Check,
  ChevronDown,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  Sun,
  Clock,
  DollarSign,
  Calendar,
  Tag,
  Droplets,
  Wind,
} from 'lucide-react';
import { LandingNavbar } from '../components/navigation/LandingNavbar';
import { Footer } from '../components/navigation/Footer';
import { CATALOG_DESTINATIONS } from '../mock/destinationsCatalog';
import { DestinationWeatherService } from '../services/destinationWeatherService';
import { adminService } from '../services/adminService';
import { AdminDestination } from '../mock/mockAdminData';
import { DestinationLiveWeatherModal } from '../components/admin/DestinationLiveWeatherModal';

// Load and combine all active admin destinations with any additional catalog entries
function loadAllUserDestinations(): AdminDestination[] {
  // 1. Get all active admin destinations (seeded + custom added by admin)
  const adminList = adminService.getDestinations().filter((d) => d.status !== 'Inactive');
  const existingNames = new Set(adminList.map((d) => d.name.toLowerCase().trim()));

  // 2. Map any remaining catalog destinations that aren't yet in the list
  const extraCatalog: AdminDestination[] = CATALOG_DESTINATIONS
    .filter((c) => !existingNames.has(c.name.toLowerCase().trim()) && !existingNames.has(c.id.toLowerCase().trim()))
    .map((c) => ({
      id: c.id,
      name: c.name,
      province: c.region || 'Sri Lanka',
      category: (c.type === 'Mountain' || c.type === 'City' ? 'Nature' : c.type) as AdminDestination['category'],
      location: c.region,
      lat: 7.29,
      lng: 80.63,
      coverImage: c.imageUrl,
      attractionsCount: c.categories.length,
      status: 'Active',
      description: c.description,
      accessibility: 'Highway & Scenic Connected',
      bestTimeToVisit: 'December to April',
      recommendedStayDays: c.duration || '2 - 3 Days',
      avgBudgetPerDay: c.budget === 'Luxury' ? '$120 - $200 / day' : c.budget === 'Budget' ? '$35 - $60 / day' : '$60 - $95 / day',
      topAttractions: c.categories,
      openingHours: '06:00 AM – 06:00 PM Daily',
      entryFeeLocal: 'Free Entry',
      entryFeeForeign: '$25 / LKR 7,500',
      bookingsCount: c.reviewCount,
      growthPercentage: 14.5,
    }));

  return [...adminList, ...extraCatalog];
}

export const DestinationsPage: React.FC = () => {
  const navigate = useNavigate();

  // All destinations state loaded dynamically from admin catalog & custom additions
  const [destinations, setDestinations] = useState<AdminDestination[]>(() => loadAllUserDestinations());

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'recommended' | 'popular' | 'rating' | 'newest'>('recommended');
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [visibleCount, setVisibleCount] = useState(8);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Live Weather & Full Details Modal State
  const [selectedWeatherDest, setSelectedWeatherDest] = useState<AdminDestination | null>(null);
  const [isWeatherModalOpen, setIsWeatherModalOpen] = useState(false);

  const handleOpenDestinationWeather = (dest: AdminDestination) => {
    setSelectedWeatherDest(dest);
    setIsWeatherModalOpen(true);
  };

  // Sync state if admin adds/updates destinations or on window focus
  useEffect(() => {
    const handleSync = () => {
      setDestinations(loadAllUserDestinations());
    };
    window.addEventListener('storage', handleSync);
    window.addEventListener('focus', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('focus', handleSync);
    };
  }, []);

  // Advanced Filter Options State
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedBudget, setSelectedBudget] = useState<string>('All');
  const [selectedDuration, setSelectedDuration] = useState<string>('All');
  const [minRating, setMinRating] = useState<number>(0);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const toggleFavorite = (id: string, name: string) => {
    const isFav = !favorites[id];
    setFavorites((prev) => ({ ...prev, [id]: isFav }));
    triggerToast(isFav ? `Added ${name} to Favorites!` : `Removed ${name} from Favorites.`);
  };

  // Categories list matching Sri Lanka travel styles
  const categories = [
    'All',
    'Cultural',
    'Heritage',
    'Nature',
    'Beach',
    'Wildlife',
    'Adventure',
    'Popular',
  ];

  // Filter logic
  const filteredDestinations = useMemo(() => {
    return destinations.filter((dest) => {
      // 1. Text Search Query
      const query = searchQuery.toLowerCase().trim();
      if (query) {
        const matchesName = dest.name.toLowerCase().includes(query);
        const matchesProvince = dest.province.toLowerCase().includes(query);
        const matchesLocation = dest.location.toLowerCase().includes(query);
        const matchesCategory = dest.category.toLowerCase().includes(query);
        const matchesAttr = dest.topAttractions?.some((a) => a.toLowerCase().includes(query));
        if (!matchesName && !matchesProvince && !matchesLocation && !matchesCategory && !matchesAttr) {
          return false;
        }
      }

      // 2. Horizontal Category Filter
      if (selectedCategory !== 'All') {
        if (selectedCategory === 'Popular') {
          if ((dest.bookingsCount || 0) < 500) return false;
        } else {
          if (dest.category.toLowerCase() !== selectedCategory.toLowerCase()) {
            return false;
          }
        }
      }

      // 3. Region Filter
      if (selectedRegion !== 'All') {
        if (!dest.province.toLowerCase().includes(selectedRegion.toLowerCase())) {
          return false;
        }
      }

      // 4. Type / Category Filter
      if (selectedType !== 'All' && dest.category.toLowerCase() !== selectedType.toLowerCase()) {
        return false;
      }

      // 5. Budget Filter
      if (selectedBudget !== 'All') {
        const budgetLower = (dest.avgBudgetPerDay || '').toLowerCase();
        if (selectedBudget === 'Budget' && !budgetLower.includes('$3') && !budgetLower.includes('$4') && !budgetLower.includes('$5')) {
          return false;
        }
        if (selectedBudget === 'Luxury' && !budgetLower.includes('$1') && !budgetLower.includes('$2')) {
          return false;
        }
      }

      // 6. Duration Filter
      if (selectedDuration !== 'All') {
        const stayStr = String(dest.recommendedStayDays || '').toLowerCase();
        if (selectedDuration === 'Weekend' && !stayStr.includes('1') && !stayStr.includes('2')) return false;
        if (selectedDuration === '3–5 days' && !stayStr.includes('3') && !stayStr.includes('4') && !stayStr.includes('5')) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'rating') return (b.growthPercentage || 0) - (a.growthPercentage || 0);
      if (sortBy === 'popular') return (b.bookingsCount || 0) - (a.bookingsCount || 0);
      if (sortBy === 'newest') return b.id.localeCompare(a.id);
      return 0; // recommended
    });
  }, [
    destinations,
    searchQuery,
    selectedCategory,
    selectedRegion,
    selectedType,
    selectedBudget,
    selectedDuration,
    minRating,
    sortBy,
  ]);

  const featuredDestinations = destinations.slice(0, 4);

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedRegion('All');
    setSelectedType('All');
    setSelectedBudget('All');
    setSelectedDuration('All');
    setMinRating(0);
    setSortBy('recommended');
    triggerToast('All search & category filters cleared');
  };

  const handleLoadMore = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) => prev + 4);
      setIsLoadingMore(false);
    }, 600);
  };

  const activeFilterCount =
    (selectedRegion !== 'All' ? 1 : 0) +
    (selectedType !== 'All' ? 1 : 0) +
    (selectedBudget !== 'All' ? 1 : 0) +
    (selectedDuration !== 'All' ? 1 : 0) +
    (minRating > 0 ? 1 : 0);

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

      {/* 1. PAGE HEADER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-6 text-center space-y-3">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#0B3A53] tracking-tight font-heading leading-tight">
          Explore Destinations
        </h1>
        <p className="text-base sm:text-lg text-slate-600 font-medium max-w-xl mx-auto leading-relaxed">
          Discover Sri Lanka’s UNESCO citadels, misty highlands, coastal surf bays, and wildlife reserves.
        </p>
      </div>

      {/* 2. SEARCH DESTINATIONS BAR */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-8">
        <div className="relative flex items-center shadow-md rounded-full bg-white border border-slate-200/80 hover:border-[#16A6A1]/60 focus-within:border-[#16A6A1] focus-within:ring-4 focus-within:ring-[#16A6A1]/15 transition-all duration-300">
          <div className="pl-5 text-slate-400">
            <Search className="w-5 h-5 text-[#16A6A1]" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search destinations by name, province, attraction, or style..."
            className="w-full py-4 pl-3 pr-12 text-sm sm:text-base font-semibold text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 3. DESTINATION CATEGORIES */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
        <div className="flex items-center justify-center flex-wrap gap-2 sm:gap-2.5">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2.5 rounded-full text-xs font-extrabold transition-all cursor-pointer shadow-2xs ${
                  isActive
                    ? 'bg-[#0B3A53] text-white shadow-md scale-105'
                    : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50 hover:text-[#0B3A53]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. FEATURED DESTINATIONS SECTION */}
      {!searchQuery && selectedCategory === 'All' && activeFilterCount === 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-xs font-black uppercase text-[#16A6A1] tracking-wider block mb-1">
                TOP PICKS FOR TRAVELERS
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#0B3A53] tracking-tight font-heading">
                Featured Destinations
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredDestinations.map((dest) => {
              const liveWeather = DestinationWeatherService.getLiveWeather(dest.name, dest.province);
              return (
                <div
                  key={dest.id}
                  onClick={() => navigate('/destinations/' + dest.id)}
                  className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-teal-300 hover:-translate-y-1.5 transition-all duration-300 group cursor-pointer flex flex-col justify-between"
                  title={`Click to view details for ${dest.name}`}
                >
                  <div>
                    <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                      <img
                        src={dest.coverImage}
                        alt={dest.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-black/25" />

                      {/* Live Weather telemetry pill with active beacon */}
                      <div className="absolute top-3 left-3 bg-slate-950/85 backdrop-blur-md text-white text-[10.5px] font-bold px-2.5 py-1 rounded-full border border-white/20 flex items-center gap-1.5 shadow-md">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                        </span>
                        <span className="font-extrabold text-amber-300 flex items-center gap-1">
                          <Sun className="w-3 h-3 text-amber-400" />
                          {liveWeather.currentTemp}°C
                        </span>
                        <span className="text-slate-400 text-[9px]">·</span>
                        <span className="text-teal-200 font-semibold truncate max-w-[80px]">
                          {liveWeather.condition}
                        </span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(dest.id, dest.name);
                        }}
                        className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md border transition-all duration-300 cursor-pointer shadow-md ${
                          favorites[dest.id]
                            ? 'bg-rose-500 text-white border-rose-400 scale-110'
                            : 'bg-slate-900/60 text-white border-white/30 hover:bg-slate-900/80'
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${favorites[dest.id] ? 'fill-white' : ''}`} />
                      </button>

                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                        <span className="bg-slate-950/75 backdrop-blur-md text-teal-300 text-[9.5px] font-black px-2 py-0.5 rounded-lg border border-teal-500/30 uppercase tracking-wide">
                          {dest.category}
                        </span>
                        {dest.avgBudgetPerDay && (
                          <span className="bg-emerald-950/80 backdrop-blur-md text-emerald-300 text-[9.5px] font-bold px-2 py-0.5 rounded-lg border border-emerald-500/30">
                            {dest.avgBudgetPerDay}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-4 space-y-2">
                      <div className="flex items-start justify-between gap-1">
                        <div>
                          <h3 className="text-base font-black text-[#0B3A53] font-heading group-hover:text-[#146C86] transition-colors truncate">
                            {dest.name}
                          </h3>
                          <p className="text-[11px] font-semibold text-slate-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-[#16A6A1] shrink-0" />
                            <span className="truncate">{dest.province}</span>
                          </p>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-600 font-medium leading-relaxed line-clamp-2">
                        {dest.description}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 pt-0">
                    <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-extrabold text-[#16A6A1]">
                      <span className="text-slate-400 font-bold text-[10px]">
                        {dest.recommendedStayDays || '2 - 3 Days'} Stay
                      </span>
                      <span className="group-hover:translate-x-1 transition-transform flex items-center gap-1">
                        <span>View Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 5. ALL DESTINATIONS GRID & FILTERS HEADER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 border-b border-slate-200/80 pb-4">
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black text-[#0B3A53] tracking-tight font-heading">
              All Destinations
            </h2>
            <p className="text-xs text-slate-500 font-semibold">
              Showing {filteredDestinations.length} destinations with full admin configurations & live weather
            </p>
          </div>

          {/* Filter & Sort Controls */}
          <div className="flex items-center gap-3">
            {/* Filter Drawer Trigger */}
            <button
              onClick={() => setIsFilterDrawerOpen(true)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                activeFilterCount > 0
                  ? 'bg-[#16A6A1] text-white border-[#16A6A1] shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200/80 hover:bg-slate-50'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-white text-[#16A6A1] text-[10px] font-black">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="appearance-none bg-white text-slate-700 text-xs font-bold px-4 py-2.5 pr-8 rounded-full border border-slate-200/80 hover:bg-slate-50 focus:outline-none focus:border-[#16A6A1] cursor-pointer shadow-2xs"
              >
                <option value="recommended">Sort: Recommended</option>
                <option value="popular">Sort: Most Popular</option>
                <option value="rating">Sort: Highest Rated</option>
                <option value="newest">Sort: Newest</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* DESTINATIONS GRID */}
        {filteredDestinations.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredDestinations.slice(0, visibleCount).map((dest) => {
                const liveWeather = DestinationWeatherService.getLiveWeather(dest.name, dest.province);
                return (
                  <div
                    key={dest.id}
                    onClick={() => navigate('/destinations/' + dest.id)}
                    className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-teal-300 transition-all duration-300 space-y-3 flex flex-col justify-between cursor-pointer group hover:-translate-y-1.5 relative"
                    title={`Click to view full destination details for ${dest.name}`}
                  >
                    <div>
                      {/* Image Header with Live Telemetry & Status Badges */}
                      <div className="relative h-52 w-full overflow-hidden bg-slate-100">
                        <img
                          src={dest.coverImage}
                          alt={dest.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-black/25 pointer-events-none" />

                        {/* Top Left: Live Weather telemetry pill with active beacon */}
                        <div className="absolute top-3 left-3 bg-slate-950/85 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1.5 rounded-full border border-white/20 flex items-center gap-2 shadow-lg group-hover:border-teal-400/50 transition-all z-10">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                          </span>
                          <span className="font-black text-amber-300 flex items-center gap-1">
                            <Sun className="w-3.5 h-3.5 text-amber-400" />
                            {liveWeather.currentTemp}°C
                          </span>
                          <span className="text-slate-400 text-[10px]">·</span>
                          <span className="text-teal-200 font-semibold truncate max-w-[105px]">
                            {liveWeather.condition}
                          </span>
                        </div>

                        {/* Top Right: Favorite Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(dest.id, dest.name);
                          }}
                          className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-md border transition-all duration-300 cursor-pointer shadow-md z-10 ${
                            favorites[dest.id]
                              ? 'bg-rose-500 text-white border-rose-400 scale-110'
                              : 'bg-slate-900/60 text-white border-white/30 hover:bg-slate-900/80'
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${favorites[dest.id] ? 'fill-white' : ''}`} />
                        </button>

                        {/* Bottom Overlay: Category and Feels-Like */}
                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
                          <span className="bg-slate-950/75 backdrop-blur-md text-teal-300 text-[10px] font-black px-2.5 py-1 rounded-lg border border-teal-500/30 shadow-xs uppercase tracking-wide">
                            {dest.category}
                          </span>
                          <span className="bg-slate-950/75 backdrop-blur-md text-slate-200 text-[10px] font-semibold px-2.5 py-1 rounded-lg border border-white/15">
                            Feels {liveWeather.feelsLike}°C
                          </span>
                        </div>
                      </div>

                      {/* Card Details Body */}
                      <div className="p-5 space-y-3">
                        {/* Title, Province/Location & Avg Budget Per Day */}
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <h3 className="text-lg font-black text-[#0B3A53] font-heading group-hover:text-[#146C86] transition-colors truncate">
                                {dest.name}
                              </h3>
                              <p className="text-xs font-semibold text-slate-500 flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3.5 h-3.5 text-[#16A6A1] shrink-0" />
                                <span className="truncate">
                                  {dest.province} · {dest.location}
                                </span>
                              </p>
                            </div>
                            {dest.avgBudgetPerDay && (
                              <div className="shrink-0 text-right">
                                <span className="text-xs font-black text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-xl flex items-center gap-1 shadow-2xs">
                                  <DollarSign className="w-3 h-3 text-emerald-600" />
                                  <span>{dest.avgBudgetPerDay}</span>
                                </span>
                                <span className="text-[9px] font-bold text-slate-400 block mt-0.5">Avg / Day</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 font-medium leading-relaxed line-clamp-2">
                          {dest.description}
                        </p>

                        {/* Travel Planning Metrics: Best Time & Recommended Stay Days */}
                        <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50/90 rounded-2xl border border-slate-100 text-[11px]">
                          <div className="truncate">
                            <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block mb-0.5">
                              Best Time
                            </span>
                            <div
                              className="flex items-center gap-1.5 font-bold text-[#0B3A53] truncate"
                              title={`Best Time: ${dest.bestTimeToVisit || 'Year-round'}`}
                            >
                              <Calendar className="w-3.5 h-3.5 text-[#16A6A1] shrink-0" />
                              <span className="truncate">{dest.bestTimeToVisit || 'Year-round'}</span>
                            </div>
                          </div>
                          <div className="truncate">
                            <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block mb-0.5">
                              Recommended Stay
                            </span>
                            <div
                              className="flex items-center gap-1.5 font-bold text-[#0B3A53] truncate"
                              title={`Stay: ${dest.recommendedStayDays || '2 - 3 Days'}`}
                            >
                              <Clock className="w-3.5 h-3.5 text-[#16A6A1] shrink-0" />
                              <span className="truncate">{dest.recommendedStayDays || '2 - 3 Days'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Opening Hours & Separate Entry Fees (Local vs Foreign) */}
                        <div className="pt-2 border-t border-slate-100 text-[11px] space-y-1.5">
                          {dest.openingHours && (
                            <div className="flex items-center justify-between text-[10.5px]">
                              <span className="text-slate-400 font-extrabold uppercase text-[9.5px]">Hours:</span>
                              <span className="font-bold text-slate-700 truncate max-w-[210px]">
                                {dest.openingHours}
                              </span>
                            </div>
                          )}
                          <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
                            <div
                              className="bg-emerald-50/80 border border-emerald-200/70 rounded-xl px-2.5 py-1 text-emerald-800 truncate"
                              title={`Local Entry: ${dest.entryFeeLocal || 'Free'}`}
                            >
                              <span className="text-[9px] uppercase font-black text-emerald-600 block">Local Entry</span>
                              <span className="truncate block font-extrabold">{dest.entryFeeLocal || 'Free Entry'}</span>
                            </div>
                            <div
                              className="bg-cyan-50/80 border border-cyan-200/70 rounded-xl px-2.5 py-1 text-[#0B3A53] truncate"
                              title={`Foreign Entry: ${dest.entryFeeForeign || '$25'}`}
                            >
                              <span className="text-[9px] uppercase font-black text-[#146C86] block">Foreign Entry</span>
                              <span className="truncate block font-extrabold">{dest.entryFeeForeign || '$25 USD'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Top Attractions Highlights */}
                        {dest.topAttractions && dest.topAttractions.length > 0 && (
                          <div className="pt-2 border-t border-slate-100">
                            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5 flex items-center justify-between">
                              <span className="flex items-center gap-1">
                                <Tag className="w-3 h-3 text-[#16A6A1]" />
                                Top Attractions
                              </span>
                              <span className="text-[#146C86] font-bold text-[10px]">
                                {dest.topAttractions.length} Added
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {dest.topAttractions.slice(0, 3).map((attr) => (
                                <span
                                  key={attr}
                                  className="px-2 py-0.5 rounded-lg bg-slate-100 text-[#0B3A53] font-bold text-[10px] truncate max-w-[145px] border border-slate-200/60"
                                >
                                  {attr}
                                </span>
                              ))}
                              {dest.topAttractions.length > 3 && (
                                <span className="px-1.5 py-0.5 rounded-lg bg-teal-50 text-[#146C86] border border-teal-200/60 font-bold text-[10px]">
                                  +{dest.topAttractions.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Live Micro-Telemetry Strip */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-500 bg-slate-50/70 -mx-5 px-5 py-2.5 mt-2">
                          <div className="flex items-center gap-3 text-[10.5px]">
                            <span className="flex items-center gap-1 text-sky-600 font-bold" title="Relative Humidity">
                              <Droplets className="w-3 h-3 text-sky-500" />
                              {liveWeather.humidity}%
                            </span>
                            <span className="flex items-center gap-1 text-slate-600 font-bold" title="Wind Speed">
                              <Wind className="w-3 h-3 text-slate-400" />
                              {liveWeather.windSpeed} km/h
                            </span>
                            <span className="flex items-center gap-1 text-amber-600 font-bold" title="UV Index">
                              <Sun className="w-3 h-3 text-amber-500" />
                              UV {liveWeather.uvIndex}
                            </span>
                          </div>
                          <span className="text-[10px] font-extrabold text-[#16A6A1] group-hover:underline flex items-center gap-1">
                            <span>View Details</span>
                            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 9. LOAD MORE BUTTON */}
            {visibleCount < filteredDestinations.length && (
              <div className="text-center pt-12">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="bg-white hover:bg-slate-50 text-[#0B3A53] border border-slate-200/80 font-extrabold text-xs uppercase tracking-wider px-8 py-3.5 rounded-full shadow-sm hover:shadow-md transition-all cursor-pointer inline-flex items-center gap-2"
                >
                  {isLoadingMore ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-[#16A6A1]" />
                      <span>Loading...</span>
                    </>
                  ) : (
                    <>
                      <span>Load More Destinations</span>
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        ) : (
          /* 10. EMPTY SEARCH STATE */
          <div className="bg-white py-16 px-6 rounded-3xl border border-slate-200/70 shadow-sm text-center max-w-lg mx-auto space-y-4 my-8">
            <div className="w-16 h-16 rounded-full bg-[#16A6A1]/10 text-[#16A6A1] mx-auto flex items-center justify-center">
              <Compass className="w-8 h-8 text-[#16A6A1]" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-black text-[#0B3A53] font-heading">
                No destinations found
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
                Try searching for another place or adjusting your filters.
              </p>
            </div>
            <button
              onClick={clearAllFilters}
              className="bg-[#0B3A53] text-white font-extrabold text-xs uppercase tracking-wider px-6 py-3 rounded-full hover:bg-[#072537] transition-colors cursor-pointer"
            >
              Clear Filters
            </button>
          </div>
        )}
      </section>

      {/* FOOTER */}
      <Footer />

      {/* 7. FILTER DRAWER MODAL */}
      {isFilterDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md h-full p-6 sm:p-8 space-y-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="space-y-0.5">
                  <h3 className="text-xl font-black text-[#0B3A53] font-heading">
                    Filter Destinations
                  </h3>
                  <p className="text-xs text-slate-400">Refine destinations by province, style & budget</p>
                </div>
                <button
                  onClick={() => setIsFilterDrawerOpen(false)}
                  className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Filter 1: Province */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                  Province
                </label>
                <div className="flex flex-wrap gap-2">
                  {['All', 'Central', 'Southern', 'Uva', 'Western', 'Northern', 'Eastern', 'North Western', 'North Central', 'Sabaragamuwa'].map((r) => (
                    <button
                      key={r}
                      onClick={() => setSelectedRegion(r)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                        selectedRegion === r
                          ? 'bg-[#16A6A1] text-white border-[#16A6A1]'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filter 2: Type */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                  Destination Category
                </label>
                <div className="flex flex-wrap gap-2">
                  {['All', 'Cultural', 'Heritage', 'Nature', 'Beach', 'Wildlife', 'Adventure'].map((t) => (
                    <button
                      key={t}
                      onClick={() => setSelectedType(t)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                        selectedType === t
                          ? 'bg-[#16A6A1] text-white border-[#16A6A1]'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filter 3: Budget */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                  Budget Level
                </label>
                <div className="flex flex-wrap gap-2">
                  {['All', 'Budget', 'Moderate', 'Luxury'].map((b) => (
                    <button
                      key={b}
                      onClick={() => setSelectedBudget(b)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                        selectedBudget === b
                          ? 'bg-[#16A6A1] text-white border-[#16A6A1]'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filter 4: Trip Duration */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                  Recommended Duration
                </label>
                <div className="flex flex-wrap gap-2">
                  {['All', 'Weekend', '3–5 days', '1 week+'].map((d) => (
                    <button
                      key={d}
                      onClick={() => setSelectedDuration(d)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                        selectedDuration === d
                          ? 'bg-[#16A6A1] text-white border-[#16A6A1]'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                onClick={clearAllFilters}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                Clear Filters
              </button>

              <button
                onClick={() => {
                  setIsFilterDrawerOpen(false);
                  triggerToast('Filters applied!');
                }}
                className="bg-[#0B3A53] hover:bg-[#072537] text-white font-extrabold text-xs uppercase tracking-wider px-6 py-3 rounded-full shadow-md transition-colors cursor-pointer"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. LIVE WEATHER & FULL DETAILS MODAL */}
      <DestinationLiveWeatherModal
        destination={selectedWeatherDest}
        isOpen={isWeatherModalOpen}
        onClose={() => setIsWeatherModalOpen(false)}
      />
    </div>
  );
};
