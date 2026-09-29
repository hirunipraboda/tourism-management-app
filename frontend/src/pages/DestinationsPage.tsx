import React, { useState, useMemo } from 'react';
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
} from 'lucide-react';
import { LandingNavbar } from '../components/navigation/LandingNavbar';
import { Footer } from '../components/navigation/Footer';
import { CATALOG_DESTINATIONS, CatalogDestination } from '../mock/destinationsCatalog';

export const DestinationsPage: React.FC = () => {
  const navigate = useNavigate();

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'recommended' | 'popular' | 'rating' | 'newest'>('recommended');
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [visibleCount, setVisibleCount] = useState(8);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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

  // Categories list
  const categories = [
    'All',
    'Popular',
    'Beaches',
    'Mountains',
    'Nature',
    'Culture',
    'Adventure',
    'Cities',
  ];

  // Filter logic
  const filteredDestinations = useMemo(() => {
    return CATALOG_DESTINATIONS.filter((dest) => {
      // 1. Text Search Query
      const query = searchQuery.toLowerCase().trim();
      if (query) {
        const matchesName = dest.name.toLowerCase().includes(query);
        const matchesCountry = dest.country.toLowerCase().includes(query);
        const matchesRegion = dest.region.toLowerCase().includes(query);
        const matchesCategory = dest.categories.some((c) => c.toLowerCase().includes(query));
        if (!matchesName && !matchesCountry && !matchesRegion && !matchesCategory) {
          return false;
        }
      }

      // 2. Horizontal Category Filter
      if (selectedCategory !== 'All') {
        if (selectedCategory === 'Popular') {
          if (dest.rating < 4.88) return false;
        } else {
          const matchCat = dest.categories.some(
            (c) => c.toLowerCase() === selectedCategory.toLowerCase()
          );
          if (!matchCat) return false;
        }
      }

      // 3. Region Filter
      if (selectedRegion !== 'All' && dest.continent !== selectedRegion) {
        return false;
      }

      // 4. Type Filter
      if (selectedType !== 'All' && dest.type !== selectedType) {
        return false;
      }

      // 5. Budget Filter
      if (selectedBudget !== 'All' && dest.budget !== selectedBudget) {
        return false;
      }

      // 6. Duration Filter
      if (selectedDuration !== 'All' && dest.duration !== selectedDuration) {
        return false;
      }

      // 7. Minimum Rating Filter
      if (minRating > 0 && dest.rating < minRating) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'popular') return b.reviewCount - a.reviewCount;
      if (sortBy === 'newest') return b.id.localeCompare(a.id);
      return 0; // recommended
    });
  }, [
    searchQuery,
    selectedCategory,
    selectedRegion,
    selectedType,
    selectedBudget,
    selectedDuration,
    minRating,
    sortBy,
  ]);

  const featuredDestinations = CATALOG_DESTINATIONS.filter((d) => d.isFeatured);

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
          Find places worth discovering and start planning your next adventure.
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
            placeholder="Search destinations by name, region, country, or experience..."
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
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#0B3A53] tracking-tight font-heading">
                Featured Destinations
              </h2>
            </div>
          </div>

          {/* Asymmetric Editorial Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredDestinations.map((dest) => (
              <div
                key={dest.id}
                onClick={() => navigate(`/destinations/${dest.id}`)}
                className="bg-white rounded-3xl overflow-hidden border border-slate-200/70 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-56 w-full overflow-hidden bg-slate-100">
                    <img
                      src={dest.imageUrl}
                      alt={dest.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-80" />

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(dest.id, dest.name);
                      }}
                      className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-md border transition-all duration-300 cursor-pointer shadow-md ${
                        favorites[dest.id]
                          ? 'bg-rose-500 text-white border-rose-400 scale-110'
                          : 'bg-white/20 text-white border-white/30 hover:bg-white/40'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${favorites[dest.id] ? 'fill-white' : ''}`} />
                    </button>

                    <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-xs text-amber-400 font-bold bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/15">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{dest.rating}</span>
                    </div>
                  </div>

                  <div className="p-5 space-y-2">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#146C86] block">
                      {dest.country} • {dest.region}
                    </span>
                    <h3 className="text-lg font-black text-slate-900 font-heading group-hover:text-[#146C86] transition-colors leading-snug">
                      {dest.name}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                      "{dest.description}"
                    </p>
                  </div>
                </div>

                <div className="px-5 pb-5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-semibold">{dest.categories.join(' • ')}</span>
                  <span className="font-extrabold text-[#16A6A1] group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    <span>Explore</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
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
              Showing {filteredDestinations.length} destination places
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
              {filteredDestinations.slice(0, visibleCount).map((dest) => (
                <div
                  key={dest.id}
                  onClick={() => navigate(`/destinations/${dest.id}`)}
                  className="bg-white rounded-3xl overflow-hidden border border-slate-200/70 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-52 w-full overflow-hidden bg-slate-100">
                      <img
                        src={dest.imageUrl}
                        alt={dest.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(dest.id, dest.name);
                        }}
                        className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-md border transition-all duration-300 cursor-pointer shadow-md ${
                          favorites[dest.id]
                            ? 'bg-rose-500 text-white border-rose-400 scale-110'
                            : 'bg-white/20 text-white border-white/30 hover:bg-white/40'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${favorites[dest.id] ? 'fill-white' : ''}`} />
                      </button>

                      <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-amber-400 text-xs font-extrabold flex items-center gap-1 border border-white/15">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{dest.rating}</span>
                      </div>
                    </div>

                    <div className="p-5 space-y-2">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#146C86] block">
                        {dest.country} • {dest.region}
                      </span>
                      <h3 className="text-base font-extrabold text-slate-900 font-heading group-hover:text-[#146C86] transition-colors leading-snug">
                        {dest.name}
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                        {dest.description}
                      </p>
                    </div>
                  </div>

                  <div className="px-5 pb-5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-semibold">{dest.categories.slice(0, 2).join(' · ')}</span>
                    <span className="font-extrabold text-[#16A6A1] group-hover:translate-x-1 transition-transform flex items-center gap-1">
                      <span>Explore</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
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
                  <p className="text-xs text-slate-400">Refine catalog by region, budget & duration</p>
                </div>
                <button
                  onClick={() => setIsFilterDrawerOpen(false)}
                  className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Filter 1: Region */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                  Region / Continent
                </label>
                <div className="flex flex-wrap gap-2">
                  {['All', 'Asia', 'Europe', 'Americas', 'Africa', 'Oceania'].map((r) => (
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
                  Destination Type
                </label>
                <div className="flex flex-wrap gap-2">
                  {['All', 'Beach', 'Mountain', 'City', 'Nature', 'Cultural', 'Adventure'].map((t) => (
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

              {/* Filter 5: Minimum Rating */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                  Minimum Rating
                </label>
                <div className="flex flex-wrap gap-2">
                  {[0, 4.5, 4.8, 4.9].map((rate) => (
                    <button
                      key={rate}
                      onClick={() => setMinRating(rate)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                        minRating === rate
                          ? 'bg-[#16A6A1] text-white border-[#16A6A1]'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {rate === 0 ? 'Any Rating' : `${rate}+ ★`}
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
    </div>
  );
};
