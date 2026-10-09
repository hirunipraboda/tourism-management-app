import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  ShieldCheck,
  Star,
  Compass,
  Calendar,
  Clock,
  MapPin,
  Users,
  Award,
  Globe,
  Sparkles,
  ArrowRight,
  ChevronRight,
  CheckCircle2,
  RefreshCw,
  Phone,
  Mail,
  DollarSign,
  Briefcase
} from 'lucide-react';
import { LandingNavbar } from '../components/navigation/LandingNavbar';
import { Footer } from '../components/navigation/Footer';
import { guideService, GuideProfileDetailDto, GuideBookingResponse } from '../services/guideService';
import { TourGuideBookingModal } from '../components/guide/TourGuideBookingModal';
import { MyGuideBookingsSection } from '../components/guide/MyGuideBookingsSection';

export const TourGuidesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const activeTabParam = searchParams.get('tab') === 'my-bookings' ? 'my-bookings' : 'browse';
  const [activeTab, setActiveTab] = useState<'browse' | 'my-bookings'>(activeTabParam);

  // Guide Browsing State
  const [guides, setGuides] = useState<GuideProfileDetailDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [selectedDestination, setSelectedDestination] = useState('All');
  const [sortBy, setSortBy] = useState<'rating' | 'experience' | 'priceLow' | 'priceHigh'>('rating');

  // Booking Modal
  const [selectedGuideForBooking, setSelectedGuideForBooking] = useState<GuideProfileDetailDto | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  useEffect(() => {
    const tab = searchParams.get('tab') === 'my-bookings' ? 'my-bookings' : 'browse';
    setActiveTab(tab);
  }, [searchParams]);

  const fetchGuides = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await guideService.browseGuides();
      setGuides(data);
    } catch (err: any) {
      setError(err.message || 'Unable to load tour guides.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuides();
  }, []);

  const handleTabChange = (tab: 'browse' | 'my-bookings') => {
    setActiveTab(tab);
    setSearchParams(tab === 'my-bookings' ? { tab: 'my-bookings' } : {});
  };

  // Distinct lists for filters
  const languagesList = useMemo(() => {
    const set = new Set<string>();
    guides.forEach(g => g.languages.forEach(l => set.add(l)));
    return ['All', ...Array.from(set)];
  }, [guides]);

  const specialtiesList = useMemo(() => {
    const set = new Set<string>();
    guides.forEach(g => g.specialties.forEach(s => set.add(s)));
    return ['All', ...Array.from(set)];
  }, [guides]);

  const destinationsList = useMemo(() => {
    const set = new Set<string>();
    guides.forEach(g => g.coveredDestinations.forEach(d => set.add(d.destinationName)));
    return ['All', ...Array.from(set)];
  }, [guides]);

  // Filtered & Sorted guides
  const filteredGuides = useMemo(() => {
    return guides
      .filter(g => {
        const matchesQuery =
          searchQuery === '' ||
          g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (g.bio && g.bio.toLowerCase().includes(searchQuery.toLowerCase())) ||
          g.specialties.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesLang =
          selectedLanguage === 'All' || g.languages.includes(selectedLanguage);

        const matchesSpec =
          selectedSpecialty === 'All' || g.specialties.includes(selectedSpecialty);

        const matchesDest =
          selectedDestination === 'All' ||
          g.coveredDestinations.some(d => d.destinationName.toLowerCase() === selectedDestination.toLowerCase());

        return matchesQuery && matchesLang && matchesSpec && matchesDest;
      })
      .sort((a, b) => {
        if (sortBy === 'rating') return b.ratingAvg - a.ratingAvg;
        if (sortBy === 'experience') return b.yearsExperience - a.yearsExperience;
        if (sortBy === 'priceLow') return a.fullDayRate - b.fullDayRate;
        if (sortBy === 'priceHigh') return b.fullDayRate - a.fullDayRate;
        return 0;
      });
  }, [guides, searchQuery, selectedLanguage, selectedSpecialty, selectedDestination, sortBy]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-800 antialiased">
      <LandingNavbar />

      {/* Hero Banner */}
      <section className="relative bg-gradient-to-br from-[#0B3A53] via-[#0E4C6E] to-[#146C86] text-white py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-teal-500/20 via-transparent to-transparent pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-400/20 text-teal-300 border border-teal-400/30 text-xs font-black tracking-wide uppercase">
                <ShieldCheck className="w-4 h-4 text-teal-400" /> SLTDA Certified & Government Licensed
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-heading tracking-tight leading-tight">
                Hire Licensed Tour Guides in Sri Lanka
              </h1>
              <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
                Connect directly with verified local tour guides. Multilingual experts in cultural heritage, UNESCO ancient kingdoms, wildlife expeditions, and scenic trails with 100% transparent pricing.
              </p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 shrink-0">
              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center">
                <div className="text-2xl font-black text-teal-300 font-heading">100%</div>
                <div className="text-[11px] font-bold text-slate-200 uppercase tracking-wider">SLTDA Licensed</div>
              </div>
              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center">
                <div className="text-2xl font-black text-amber-300 font-heading">4.95 ★</div>
                <div className="text-[11px] font-bold text-slate-200 uppercase tracking-wider">Top Rating</div>
              </div>
              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center">
                <div className="text-2xl font-black text-teal-300 font-heading">8+ Yrs</div>
                <div className="text-[11px] font-bold text-slate-200 uppercase tracking-wider">Avg Experience</div>
              </div>
              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center">
                <div className="text-2xl font-black text-emerald-300 font-heading">0% Fee</div>
                <div className="text-[11px] font-bold text-slate-200 uppercase tracking-wider">Cancellation &lt;48h</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Switcher Tabs */}
      <div className="bg-white border-b border-slate-200/80 sticky top-18 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleTabChange('browse')}
                className={`px-5 py-2.5 rounded-full font-extrabold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'browse'
                    ? 'bg-[#0B3A53] text-white shadow-md'
                    : 'text-slate-600 hover:text-[#0B3A53] hover:bg-slate-100'
                }`}
              >
                <Compass className="w-4 h-4" />
                <span>Browse Certified Guides ({filteredGuides.length})</span>
              </button>

              <button
                onClick={() => handleTabChange('my-bookings')}
                className={`px-5 py-2.5 rounded-full font-extrabold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'my-bookings'
                    ? 'bg-[#0B3A53] text-white shadow-md'
                    : 'text-slate-600 hover:text-[#0B3A53] hover:bg-slate-100'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>My Guide Bookings</span>
              </button>
            </div>

            <button
              onClick={() => navigate('/tours')}
              className="text-xs font-bold text-[#146C86] hover:text-[#0B3A53] flex items-center gap-1 hidden sm:flex"
            >
              <span>View Tour Packages</span> <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {activeTab === 'my-bookings' ? (
          <MyGuideBookingsSection />
        ) : (
          <div className="space-y-6">
            {/* Filter Controls Bar */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex flex-col md:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search guides by name, specialties, bio..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full md:w-auto">
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white"
                  >
                    {languagesList.map(l => (
                      <option key={l} value={l}>Language: {l}</option>
                    ))}
                  </select>

                  <select
                    value={selectedSpecialty}
                    onChange={(e) => setSelectedSpecialty(e.target.value)}
                    className="px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white"
                  >
                    {specialtiesList.map(s => (
                      <option key={s} value={s}>Specialty: {s}</option>
                    ))}
                  </select>

                  <select
                    value={selectedDestination}
                    onChange={(e) => setSelectedDestination(e.target.value)}
                    className="px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white"
                  >
                    {destinationsList.map(d => (
                      <option key={d} value={d}>Destination: {d}</option>
                    ))}
                  </select>

                  <select
                    value={sortBy}
                    onChange={(e: any) => setSortBy(e.target.value)}
                    className="px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white"
                  >
                    <option value="rating">Top Rated</option>
                    <option value="experience">Most Experienced</option>
                    <option value="priceLow">Price: Low to High</option>
                    <option value="priceHigh">Price: High to Low</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Guides Grid */}
            {loading ? (
              <div className="py-20 text-center flex flex-col items-center gap-3">
                <RefreshCw className="w-8 h-8 animate-spin text-[#14B8A6]" />
                <span className="text-sm font-bold text-slate-500">Retrieving certified tour guides...</span>
              </div>
            ) : filteredGuides.length === 0 ? (
              <div className="py-16 text-center bg-white rounded-3xl border border-slate-100 p-8 space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Users className="w-7 h-7" />
                </div>
                <h3 className="font-extrabold text-[#0B3A53] text-lg">No tour guides matched your filters</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Try clearing some filter criteria to discover our certified Sri Lankan tour guides.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedLanguage('All');
                    setSelectedSpecialty('All');
                    setSelectedDestination('All');
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 text-[#0B3A53] hover:bg-slate-200"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredGuides.map(guide => (
                  <div
                    key={guide.id}
                    className="bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group"
                  >
                    {/* Card Header & Avatar */}
                    <div className="p-6 pb-4 space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="relative w-18 h-18 rounded-2xl overflow-hidden border-2 border-teal-500 shrink-0 shadow-sm">
                          <img
                            src={guide.avatarUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80'}
                            alt={guide.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>

                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3 text-emerald-600" /> SLTDA LICENSED
                            </span>
                          </div>
                          <h3 className="font-black text-[#0B3A53] text-lg font-heading truncate">
                            {guide.name}
                          </h3>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="font-extrabold text-amber-500 flex items-center gap-1">
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              {guide.ratingAvg.toFixed(2)}
                            </span>
                            <span className="text-slate-400">({guide.ratingCount} reviews)</span>
                            <span className="text-slate-300">•</span>
                            <span className="text-slate-600 font-semibold">{guide.yearsExperience}+ Yrs Exp</span>
                          </div>
                        </div>
                      </div>

                      {/* Bio */}
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {guide.bio || 'Professional national tour guide licensed by SLTDA with comprehensive knowledge of Sri Lankan culture and heritage.'}
                      </p>

                      {/* Specialties & Languages Badges */}
                      <div className="space-y-2 pt-2 border-t border-slate-100">
                        <div className="flex flex-wrap gap-1.5">
                          {guide.specialties.slice(0, 3).map(spec => (
                            <span
                              key={spec}
                              className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold bg-teal-50 text-teal-800 border border-teal-200/60"
                            >
                              {spec}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                          <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">Languages: {guide.languages.join(', ')}</span>
                        </div>
                      </div>
                    </div>

                    {/* Rates & Booking Action Footer */}
                    <div className="p-6 pt-4 mt-auto bg-slate-50/80 border-t border-slate-100 space-y-4">
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="p-2 rounded-xl bg-white border border-slate-200/60">
                          <div className="text-[10px] font-bold text-slate-400 uppercase">Hourly</div>
                          <div className="text-xs font-black text-slate-800">${guide.hourlyRate}/hr</div>
                        </div>
                        <div className="p-2 rounded-xl bg-white border border-slate-200/60">
                          <div className="text-[10px] font-bold text-slate-400 uppercase">Half-Day</div>
                          <div className="text-xs font-black text-slate-800">${guide.halfDayRate}</div>
                        </div>
                        <div className="p-2 rounded-xl bg-teal-50/80 border border-teal-200/80">
                          <div className="text-[10px] font-black text-teal-900 uppercase">Full-Day</div>
                          <div className="text-sm font-black text-[#0B3A53]">${guide.fullDayRate}</div>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedGuideForBooking(guide);
                          setIsBookingModalOpen(true);
                        }}
                        className="w-full py-3 rounded-2xl bg-[#0B3A53] hover:bg-[#146C86] text-white text-xs font-black transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Calendar className="w-3.5 h-3.5 text-teal-300" />
                        <span>Check Availability & Book</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Booking Modal */}
      {selectedGuideForBooking && (
        <TourGuideBookingModal
          guide={selectedGuideForBooking}
          isOpen={isBookingModalOpen}
          onClose={() => {
            setIsBookingModalOpen(false);
            setSelectedGuideForBooking(null);
          }}
          onBookingSuccess={(b) => {
            handleTabChange('my-bookings');
          }}
        />
      )}

      <Footer />
    </div>
  );
};
