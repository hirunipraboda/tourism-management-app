import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Star,
  ArrowRight,
  Sliders,
  Route,
  Ticket,
  Lightbulb,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Compass,
  Sparkles,
  Globe,
  Users,
} from 'lucide-react';
import { LandingNavbar } from '../components/navigation/LandingNavbar';
import { SplashScreen } from '../components/common/SplashScreen';
import { MOCK_DESTINATIONS } from '../mock/destinations';
import { BRAND } from '../constants/brand';
import websiteLogo from '../assets/website-logo.png';

// Local High-Resolution Sri Lanka Landmark Assets
import sigiriyaImg from '../assets/destinations/sigiriya.jpg';
import ellaImg from '../assets/destinations/Ella.jpg';
import mirissaImg from '../assets/destinations/Mirissa.jpg';
import galleImg from '../assets/destinations/Galle.jpg';
import yalaImg from '../assets/destinations/Yala.jpg';
import kandyImg from '../assets/destinations/Kandy.jpg';
import hortonPlainsImg from '../assets/destinations/Horton Plains.jpg';
import nilaveliImg from '../assets/destinations/Nilaweli.png';
import anuradhapuraImg from '../assets/destinations/Anuradhapura.jpg';
import riverstonImg from '../assets/destinations/riverston.jpg';

interface HeroDestination {
  id: string;
  name: string;
  subtitle: string;
  location: string;
  description: string;
  imageUrl: string;
  category: string;
  rating: number;
}

// 100% Accurate Sri Lankan Destination Photography Dataset (Local Assets)
const SRI_LANKA_HERO_DESTINATIONS: HeroDestination[] = [
  {
    id: 'hero-sigiriya',
    name: 'Sigiriya (Lion Rock)',
    subtitle: 'Ancient Rock Citadel & Royal Water Gardens',
    location: 'Matale, Central Province',
    description:
      'Ascend the 5th-century Lion Rock fortress to discover ancient frescoes, royal water gardens, and 360° jungle canopy panoramas.',
    imageUrl: sigiriyaImg,
    category: 'ANCIENT MONUMENTS',
    rating: 4.9,
  },
  {
    id: 'hero-ella',
    name: 'Ella & Nine Arch Bridge',
    subtitle: 'Highland Landscapes & Scenic Rail Trails',
    location: 'Badulla District, Highlands',
    description:
      'Ride iconic blue mountain trains through misty tea estates, trek to Little Adam’s Peak, and marvel at the Nine Arch Bridge.',
    imageUrl: ellaImg,
    category: 'TEA HIGHLANDS',
    rating: 4.8,
  },
  {
    id: 'hero-mirissa',
    name: 'Mirissa Coast',
    subtitle: 'Golden Palm Bays & Ocean Safaris',
    location: 'Matara, Southern Province',
    description:
      'Unwind on palm-fringed golden beaches, surf azure Indian Ocean swells, and embark on world-renowned blue whale watching safaris.',
    imageUrl: mirissaImg,
    category: 'SOUTHERN COAST',
    rating: 4.9,
  },
  {
    id: 'hero-galle',
    name: 'Galle Fort',
    subtitle: 'Seaside Colonial Citadel & Ramparts',
    location: 'Galle, Southern Province',
    description:
      'Wander 16th-century oceanfront ramparts, cobblestone alleys, Dutch colonial mansions, and vibrant artisan cafes overlooking the lighthouse.',
    imageUrl: galleImg,
    category: 'HERITAGE CITADEL',
    rating: 4.85,
  },
  {
    id: 'hero-yala',
    name: 'Yala National Park',
    subtitle: 'Leopard Sanctuaries & Untamed Wilderness',
    location: 'Hambantota, Southern Coast',
    description:
      'Embark on open-top 4x4 safaris to track wild leopards, Asian elephants, sloth bears, and crocodiles across coastal savannahs.',
    imageUrl: yalaImg,
    category: 'WILDLIFE SAFARI',
    rating: 4.92,
  },
  {
    id: 'hero-kandy',
    name: 'Kandy',
    subtitle: 'Sacred Temple & Lakeside Culture',
    location: 'Central Highlands',
    description:
      'Immerse in Sri Lanka’s cultural heart, home to the sacred Temple of the Tooth Relic, mist-shrouded hills, and serene central lake.',
    imageUrl: kandyImg,
    category: 'CULTURAL CAPITAL',
    rating: 4.88,
  },
];

interface ExplorePlace {
  id: string;
  name: string;
  location: string;
  imageUrl: string;
  category: 'Nature' | 'Culture' | 'Adventure' | 'Beach';
}

interface CounterProps {
  target: number;
  duration?: number;
  formatter?: (val: number) => string;
  isVisible: boolean;
}

const AnimatedCounter: React.FC<CounterProps> = ({
  target,
  duration = 2000,
  formatter = (val) => val.toLocaleString(),
  isVisible,
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    let startTime: number | null = null;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(easeProgress * target));

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      }
    };

    animationFrameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrameId);
  }, [target, duration, isVisible]);

  return <span>{formatter(count)}</span>;
};

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [showSplash, setShowSplash] = useState<boolean>(() => {
    // Show splash screen on initial session start
    return !sessionStorage.getItem('nova_splash_seen');
  });

  const handleSplashComplete = () => {
    sessionStorage.setItem('nova_splash_seen', 'true');
    setShowSplash(false);
  };

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const statsRef = React.useRef<HTMLDivElement>(null);
  const [isStatsVisible, setIsStatsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsStatsVisible(true);
        }
      },
      { threshold: 0.05, rootMargin: '0px 0px 50px 0px' }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const EXPLORE_PLACES: ExplorePlace[] = [
    {
      id: 'exp-kandy',
      name: 'Kandy',
      location: 'Sri Lanka',
      imageUrl: kandyImg,
      category: 'Culture',
    },
    {
      id: 'exp-ella',
      name: 'Ella',
      location: 'Sri Lanka',
      imageUrl: ellaImg,
      category: 'Nature',
    },
    {
      id: 'exp-galle',
      name: 'Galle',
      location: 'Sri Lanka',
      imageUrl: galleImg,
      category: 'Culture',
    },
    {
      id: 'exp-sigiriya',
      name: 'Sigiriya',
      location: 'Sri Lanka',
      imageUrl: sigiriyaImg,
      category: 'Culture',
    },
    {
      id: 'exp-mirissa',
      name: 'Mirissa',
      location: 'Sri Lanka',
      imageUrl: mirissaImg,
      category: 'Beach',
    },
    {
      id: 'exp-yala',
      name: 'Yala National Park',
      location: 'Sri Lanka',
      imageUrl: yalaImg,
      category: 'Adventure',
    },
  ];

  const filteredPlaces =
    selectedCategory === 'All'
      ? EXPLORE_PLACES
      : EXPLORE_PLACES.filter(p => p.category === selectedCategory);

  // Active Sri Lankan Destination
  const activeDest = SRI_LANKA_HERO_DESTINATIONS[activeIndex];

  // Auto-slide every 6 seconds unless user pauses/hovers
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % SRI_LANKA_HERO_DESTINATIONS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const handleNext = () => {
    setActiveIndex(prev => (prev + 1) % SRI_LANKA_HERO_DESTINATIONS.length);
  };

  const handlePrev = () => {
    setActiveIndex(prev => (prev - 1 + SRI_LANKA_HERO_DESTINATIONS.length) % SRI_LANKA_HERO_DESTINATIONS.length);
  };

  // Destinations for bottom popular section
  const mainFeatured = MOCK_DESTINATIONS[0];
  const topRightCard = MOCK_DESTINATIONS[1];
  const bottomRightCard = MOCK_DESTINATIONS[2];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans antialiased">
      {/* Animated Minimalist Splash Screen */}
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}

      {/* Top Navbar */}
      <LandingNavbar />

      {/* Main Content */}
      <main className="flex-1">
        {/* INTERACTIVE DESTINATION SHOWCASE HERO SECTION */}
        <section
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="relative w-full min-h-[660px] lg:min-h-[740px] flex items-center overflow-hidden bg-slate-950 text-white select-none"
        >
          {/* Dynamic Local High-Res Background Images Layer */}
          {SRI_LANKA_HERO_DESTINATIONS.map((dest, idx) => (
            <div
              key={dest.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === activeIndex ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`}
            >
              <img
                src={dest.imageUrl}
                alt={dest.name}
                className={`w-full h-full object-cover object-center transition-transform duration-[9000ms] ease-out ${idx === activeIndex ? 'scale-105' : 'scale-100'
                  }`}
              />
            </div>
          ))}

          {/* Vignette & High-Contrast Gradient Masks for Readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/80 to-slate-950/35 z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/50 z-10" />

          {/* Hero Main Content Grid */}
          <div className="relative z-20 max-w-7xl mx-auto px-6 sm:px-8 w-full py-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

            {/* LEFT COLUMN: Active Destination Details & Headline */}
            <div
              key={activeDest.id}
              className="lg:col-span-7 space-y-6 text-left"
            >
              {/* Brand Slogan Badge */}
              <div className="animate-hero-stagger-1 inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#16A6A1]/15 border border-[#16A6A1]/40 text-[#16A6A1] text-xs font-bold shadow-xs">
                <Compass className="w-3.5 h-3.5 animate-spin-slow text-[#16A6A1]" />
                <span>Every Destination Has a Story</span>
              </div>

              {/* Destination Geography & Title */}
              <div className="animate-hero-stagger-2">
                <span className="text-xs uppercase font-extrabold tracking-widest text-[#16A6A1] flex items-center gap-1.5 drop-shadow-xs">
                  <MapPin className="w-3.5 h-3.5" />
                  {activeDest.location}
                </span>
                <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight mt-1 font-heading leading-tight drop-shadow-md">
                  {activeDest.name}
                </h1>
                <p className="text-sm font-semibold text-slate-200 mt-1">
                  {activeDest.subtitle}
                </p>
              </div>

              {/* Short Copy */}
              <div className="animate-hero-stagger-3 space-y-2">
                <p className="text-sm sm:text-base text-slate-200 max-w-xl leading-relaxed font-normal drop-shadow-sm">
                  "{activeDest.description}"
                </p>
                <p className="text-xs text-[#16A6A1] italic font-semibold">
                  Let NOVA help you discover yours.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="animate-hero-stagger-4 flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => navigate('/ai-workflows')}
                  className="bg-gradient-to-r from-[#146C86] to-[#16A6A1] hover:from-[#0E5367] hover:to-[#138D89] text-white font-extrabold text-xs uppercase tracking-wider px-8 py-3.5 rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200 cursor-pointer flex items-center gap-2"
                >
                  <span>→ EXPLORE</span>
                </button>

                <button
                  onClick={() => navigate('/destinations')}
                  className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-6 py-3.5 rounded-full border border-white/30 backdrop-blur-md transition-all duration-200 cursor-pointer"
                >
                  View All Places
                </button>
              </div>
            </div>

            {/* RIGHT COLUMN: Hero Destination Cards Carousel (3-Card Spotlight View) */}
            <div className="lg:col-span-5 flex items-center justify-between gap-2 sm:gap-3 w-full">

              {/* Left Arrow Button (<) */}
              <button
                onClick={handlePrev}
                aria-label="Previous destination"
                className="p-3 sm:p-3.5 text-white bg-slate-900/60 hover:bg-[#16A6A1] hover:text-slate-950 rounded-full border border-white/25 backdrop-blur-xl transition-all duration-300 hover:scale-110 cursor-pointer shadow-2xl z-30 shrink-0"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Floating Cards Outer Window Wrapper */}
              <div className="w-full flex items-center justify-center min-h-[440px] sm:min-h-[480px] overflow-visible py-4">
                <div className="flex items-center justify-center transition-all duration-700 ease-out">
                  {SRI_LANKA_HERO_DESTINATIONS.map((dest, idx) => {
                    const total = SRI_LANKA_HERO_DESTINATIONS.length;
                    
                    // Determine if card is prev, active, or next relative to activeIndex
                    const isCurrent = idx === activeIndex;
                    const isPrev = idx === (activeIndex - 1 + total) % total;
                    const isNext = idx === (activeIndex + 1) % total;

                    if (!isCurrent && !isPrev && !isNext) return null;

                    // Order array so prev is left (1), current is center (2), next is right (3)
                    const renderOrder = isPrev ? 1 : isCurrent ? 2 : 3;

                    return (
                      <div
                        key={dest.id}
                        onClick={() => setActiveIndex(idx)}
                        style={{ order: renderOrder }}
                        className={`relative shrink-0 rounded-2xl overflow-hidden transition-all duration-500 cursor-pointer ${
                          isCurrent
                            ? 'w-56 h-[400px] sm:w-[270px] sm:h-[430px] ring-2 ring-[#16A6A1] shadow-[0_20px_50px_rgba(0,0,0,0.7)] z-30 scale-105'
                            : isPrev
                            ? 'w-44 h-[330px] sm:w-52 sm:h-[360px] -mr-16 sm:-mr-20 opacity-80 hover:opacity-100 z-10 scale-95 shadow-xl'
                            : 'w-44 h-[330px] sm:w-52 sm:h-[360px] -ml-16 sm:-ml-20 opacity-80 hover:opacity-100 z-10 scale-95 shadow-xl'
                        }`}
                      >
                        {/* Local Verified Asset Preview Image */}
                        <img
                          src={dest.imageUrl}
                          alt={dest.name}
                          className="w-full h-full object-cover"
                        />

                        {/* Full Overlay Gradient & Flex Content Container */}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-transparent p-4 sm:p-5 flex flex-col justify-end text-white z-10">
                          {/* Rating Badge */}
                          <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-slate-950/85 backdrop-blur-md text-[10px] font-bold text-amber-400 flex items-center gap-0.5 border border-white/15">
                            <Star className="w-3 h-3 fill-amber-400" />
                            <span>{dest.rating}</span>
                          </div>

                          {/* Category & Title Overlay */}
                          <span className="text-[9px] uppercase font-black tracking-widest text-[#16A6A1] bg-slate-950/85 px-2 py-0.5 rounded-xs border border-[#16A6A1]/30 self-start mb-1.5 shadow-sm">
                            {dest.category}
                          </span>
                          <h4 className="text-xs sm:text-sm font-extrabold text-white leading-snug font-heading drop-shadow-md">
                            {dest.name}
                          </h4>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Arrow Button (>) */}
              <button
                onClick={handleNext}
                aria-label="Next destination"
                className="p-3 sm:p-3.5 text-white bg-slate-900/60 hover:bg-[#16A6A1] hover:text-slate-950 rounded-full border border-white/25 backdrop-blur-xl transition-all duration-300 hover:scale-110 cursor-pointer shadow-2xl z-30 shrink-0"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </section>

        {/* SECTION 2: EXPLORE BY EXPERIENCE */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 border-t border-slate-200/60">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight font-heading">
              Find What Moves You.
            </h2>
            <p className="text-sm sm:text-base text-slate-500 font-medium">
              Explore places shaped around the experiences you love.
            </p>
          </div>

          {/* 6 Large Horizontal Image Tiles */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Tile 1: Nature */}
            <div
              onClick={() => navigate('/destinations')}
              className="relative h-60 rounded-3xl overflow-hidden group cursor-pointer shadow-lg border border-slate-200/50"
            >
              <img
                src="https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80"
                alt="Nature"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent p-6 flex flex-col justify-end text-white">
                <h3 className="text-2xl font-black text-white font-heading">
                  Nature
                </h3>
                <p className="text-sm font-medium text-slate-200 mt-1">
                  Wild & untamed
                </p>
              </div>
            </div>

            {/* Tile 2: Culture */}
            <div
              onClick={() => navigate('/destinations')}
              className="relative h-60 rounded-3xl overflow-hidden group cursor-pointer shadow-lg border border-slate-200/50"
            >
              <img
                src={sigiriyaImg}
                alt="Culture"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent p-6 flex flex-col justify-end text-white">
                <h3 className="text-2xl font-black text-white font-heading">
                  Culture
                </h3>
                <p className="text-sm font-medium text-slate-200 mt-1">
                  Stories, heritage & traditions
                </p>
              </div>
            </div>

            {/* Tile 3: Adventure */}
            <div
              onClick={() => navigate('/destinations')}
              className="relative h-60 rounded-3xl overflow-hidden group cursor-pointer shadow-lg border border-slate-200/50"
            >
              <img
                src="https://images.unsplash.com/photo-1530866495561-507c9faab2ed?auto=format&fit=crop&w=1200&q=80"
                alt="Adventure"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent p-6 flex flex-col justify-end text-white">
                <h3 className="text-2xl font-black text-white font-heading">
                  Adventure
                </h3>
                <p className="text-sm font-medium text-slate-200 mt-1">
                  Thrills beyond the ordinary
                </p>
              </div>
            </div>

            {/* Tile 4: Beach */}
            <div
              onClick={() => navigate('/destinations')}
              className="relative h-60 rounded-3xl overflow-hidden group cursor-pointer shadow-lg border border-slate-200/50"
            >
              <img
                src={mirissaImg}
                alt="Beach"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent p-6 flex flex-col justify-end text-white">
                <h3 className="text-2xl font-black text-white font-heading">
                  Beach
                </h3>
                <p className="text-sm font-medium text-slate-200 mt-1">
                  Sun, sand & slow days
                </p>
              </div>
            </div>

            {/* Tile 5: Food */}
            <div
              onClick={() => navigate('/destinations')}
              className="relative h-60 rounded-3xl overflow-hidden group cursor-pointer shadow-lg border border-slate-200/50"
            >
              <img
                src="https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=1200&q=80"
                alt="Food"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent p-6 flex flex-col justify-end text-white">
                <h3 className="text-2xl font-black text-white font-heading">
                  Food
                </h3>
                <p className="text-sm font-medium text-slate-200 mt-1">
                  Taste the soul of a destination
                </p>
              </div>
            </div>

            {/* Tile 6: Wellness */}
            <div
              onClick={() => navigate('/destinations')}
              className="relative h-60 rounded-3xl overflow-hidden group cursor-pointer shadow-lg border border-slate-200/50"
            >
              <img
                src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80"
                alt="Wellness"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent p-6 flex flex-col justify-end text-white">
                <h3 className="text-2xl font-black text-white font-heading">
                  Wellness
                </h3>
                <p className="text-sm font-medium text-slate-200 mt-1">
                  Rest, recharge & reconnect
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: PLACES WORTH DISCOVERING */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight font-heading">
                Places Worth Discovering
              </h2>
              <p className="text-sm sm:text-base text-slate-500 font-medium mt-1">
                From iconic landmarks to places you haven't heard of yet.
              </p>
            </div>

            <button
              onClick={() => navigate('/destinations')}
              className="text-xs sm:text-sm font-extrabold text-[#146C86] hover:text-[#0B3A53] flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              <span>View Catalog</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Minimal 3-Column Destination Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1: Horton Plains */}
            <div
              onClick={() => navigate('/destinations/ella')}
              className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group cursor-pointer flex flex-col"
            >
              <div className="relative h-64 w-full overflow-hidden bg-slate-100">
                <img
                  src={hortonPlainsImg}
                  alt="Horton Plains"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black text-slate-900 font-heading group-hover:text-[#146C86] transition-colors">
                    Horton Plains
                  </h3>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#16A6A1] group-hover:translate-x-1 transition-all" />
                </div>
                <p className="text-xs font-semibold text-slate-600">
                  Mist-shrouded plateau & World's End precipice
                </p>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pt-2 block border-t border-slate-100 mt-2">
                  Sri Lanka
                </span>
              </div>
            </div>

            {/* Card 2: Nilaveli */}
            <div
              onClick={() => navigate('/destinations/ella')}
              className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group cursor-pointer flex flex-col"
            >
              <div className="relative h-64 w-full overflow-hidden bg-slate-100">
                <img
                  src={nilaveliImg}
                  alt="Nilaveli"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black text-slate-900 font-heading group-hover:text-[#146C86] transition-colors">
                    Nilaveli
                  </h3>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#16A6A1] group-hover:translate-x-1 transition-all" />
                </div>
                <p className="text-xs font-semibold text-slate-600">
                  Pristine white sand & coral island reefs
                </p>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pt-2 block border-t border-slate-100 mt-2">
                  Sri Lanka
                </span>
              </div>
            </div>

            {/* Card 3: Anuradhapura */}
            <div
              onClick={() => navigate('/destinations/ella')}
              className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group cursor-pointer flex flex-col"
            >
              <div className="relative h-64 w-full overflow-hidden bg-slate-100">
                <img
                  src={anuradhapuraImg}
                  alt="Anuradhapura"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black text-slate-900 font-heading group-hover:text-[#146C86] transition-colors">
                    Anuradhapura
                  </h3>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#16A6A1] group-hover:translate-x-1 transition-all" />
                </div>
                <p className="text-xs font-semibold text-slate-600">
                  Sacred ancient stupas & royal kingdom ruins
                </p>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pt-2 block border-t border-slate-100 mt-2">
                  Sri Lanka
                </span>
              </div>
            </div>
          </div>
        </section>



        {/* SECTION 5: MINIMAL EDITORIAL AI JOURNEY CTA */}
        <section className="bg-white py-20 border-t border-slate-200/60">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
            {/* AI Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#16A6A1]/10 border border-[#16A6A1]/30 text-[#146C86] text-xs font-bold shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#16A6A1] animate-pulse" />
              <span>AGENTIC AI PLANNER</span>
            </div>

            {/* Headline & Subtitle */}
            <div className="space-y-2 max-w-2xl mx-auto">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0B3A53] tracking-tight font-heading leading-tight">
                Not sure where to go?
              </h2>
              <p className="text-base sm:text-lg text-slate-600 font-semibold leading-relaxed">
                Tell NOVA what you're looking for.
              </p>
            </div>

            {/* Constraint Selection Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2 text-xs font-bold text-slate-700">
              <span className="px-5 py-2.5 rounded-full bg-slate-100/90 border border-slate-200/80 shadow-2xs hover:bg-[#0B3A53] hover:text-white transition-all cursor-pointer">
                Mood
              </span>
              <span className="text-slate-300 font-bold">•</span>
              <span className="px-5 py-2.5 rounded-full bg-slate-100/90 border border-slate-200/80 shadow-2xs hover:bg-[#0B3A53] hover:text-white transition-all cursor-pointer">
                Interests
              </span>
              <span className="text-slate-300 font-bold">•</span>
              <span className="px-5 py-2.5 rounded-full bg-slate-100/90 border border-slate-200/80 shadow-2xs hover:bg-[#0B3A53] hover:text-white transition-all cursor-pointer">
                Budget
              </span>
              <span className="text-slate-300 font-bold">•</span>
              <span className="px-5 py-2.5 rounded-full bg-slate-100/90 border border-slate-200/80 shadow-2xs hover:bg-[#0B3A53] hover:text-white transition-all cursor-pointer">
                Time
              </span>
            </div>

            <p className="text-xs sm:text-sm text-[#146C86] font-bold italic tracking-wide">
              And let NOVA discover the possibilities.
            </p>

            {/* CTA Button */}
            <div className="pt-4">
              <button
                onClick={() => navigate('/ai-workflows')}
                className="inline-flex items-center gap-2 bg-[#0B3A53] hover:bg-[#072537] text-white font-bold text-xs uppercase tracking-wider px-8 py-3.5 rounded-full shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer border border-slate-700/40"
              >
                <span>Plan My Journey</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </section>

        {/* LIVE GLOBAL IMPACT COUNTER SECTION */}
        <section ref={statsRef} className="bg-[#F8FAFA] py-16 sm:py-20 border-t border-slate-200/60 relative overflow-hidden">
          <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
            {/* Live Indicator Badge */}
            <div className="flex items-center justify-center gap-2.5 mb-12">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#16A6A1] opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#16A6A1]" />
              </span>
            </div>

            {/* 3 Impact Stat Columns */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center divide-y sm:divide-y-0 sm:divide-x divide-slate-200/80">
              {/* Stat 1: Active Users */}
              <div className="pt-6 sm:pt-0 sm:px-6 space-y-2">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white border border-slate-200/80 text-[#146C86] mb-2 shadow-2xs">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#0B3A53] font-heading tracking-tight">
                  <AnimatedCounter target={128450} isVisible={isStatsVisible} />+
                </h3>
                <p className="text-xs sm:text-sm font-extrabold text-slate-800 uppercase tracking-wider">
                  Active Global Users
                </p>
                <p className="text-xs text-slate-500 font-medium">Across 84+ countries worldwide</p>
              </div>

              {/* Stat 2: Trips Planned */}
              <div className="pt-6 sm:pt-0 sm:px-6 space-y-2">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white border border-slate-200/80 text-[#146C86] mb-2 shadow-2xs">
                  <Compass className="w-6 h-6" />
                </div>
                <h3 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#0B3A53] font-heading tracking-tight">
                  <AnimatedCounter target={482900} isVisible={isStatsVisible} />+
                </h3>
                <p className="text-xs sm:text-sm font-extrabold text-slate-800 uppercase tracking-wider">
                  Trips Planned
                </p>
                <p className="text-xs text-slate-500 font-medium">Generated & verified by NOVA AI</p>
              </div>

              {/* Stat 3: Satisfaction Rate */}
              <div className="pt-6 sm:pt-0 sm:px-6 space-y-2">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white border border-slate-200/80 text-[#146C86] mb-2 shadow-2xs">
                  <Globe className="w-6 h-6" />
                </div>
                <h3 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#0B3A53] font-heading tracking-tight">
                  <AnimatedCounter
                    target={994}
                    formatter={(val) => `${(val / 10).toFixed(1)}%`}
                    isVisible={isStatsVisible}
                  />
                </h3>
                <p className="text-xs sm:text-sm font-extrabold text-slate-800 uppercase tracking-wider">
                  Traveler Satisfaction Rate
                </p>
                <p className="text-xs text-slate-500 font-medium">Based on 50,000+ verified reviews</p>
              </div>
            </div>
          </div>
        </section>

        {/* WHY TRAVEL WITH NOVA? FEATURE SECTION */}
        <section className="bg-[#F8FAFA] py-20 sm:py-24 border-t border-slate-200/60">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-14">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <h2 className="text-3xl sm:text-4xl font-black text-[#0B3A53] tracking-tight font-heading leading-tight">
                Why travel with NOVA?
              </h2>
              <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
                We blend intelligent agentic technology with expert curation to deliver seamless, unforgettable travel experiences.
              </p>
            </div>

            {/* 4 Feature Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {/* Feature 1: AI-Powered Planning */}
              <div className="bg-white p-8 rounded-3xl border border-slate-200/70 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group cursor-default flex flex-col justify-between space-y-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                  <Lightbulb className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-extrabold text-slate-900 font-heading group-hover:text-[#146C86] transition-colors">
                    AI-Powered Planning
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
                    Our intelligent engine creates perfect itineraries in seconds, adapting to your preferences dynamically.
                  </p>
                </div>
              </div>

              {/* Feature 2: Highly Personalized */}
              <div className="bg-white p-8 rounded-3xl border border-slate-200/70 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group cursor-default flex flex-col justify-between space-y-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-500 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                  <Sliders className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-extrabold text-slate-900 font-heading group-hover:text-[#146C86] transition-colors">
                    Highly Personalized
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
                    Every recommendation is tailored to your travel style, ensuring a truly bespoke journey.
                  </p>
                </div>
              </div>

              {/* Feature 3: Smart Routing */}
              <div className="bg-white p-8 rounded-3xl border border-slate-200/70 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group cursor-default flex flex-col justify-between space-y-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#0B3A53] to-[#146C86] text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                  <Route className="w-6 h-6 text-[#16A6A1]" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-extrabold text-slate-900 font-heading group-hover:text-[#146C86] transition-colors">
                    Smart Routing
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
                    Optimize travel time between attractions with logistically sound, map-verified daily routes.
                  </p>
                </div>
              </div>

              {/* Feature 4: Seamless Booking */}
              <div className="bg-white p-8 rounded-3xl border border-slate-200/70 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group cursor-default flex flex-col justify-between space-y-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-400 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                  <Ticket className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-extrabold text-slate-900 font-heading group-hover:text-[#146C86] transition-colors">
                    Seamless Booking
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
                    Reserve hotels, flights, and local tours instantly from within your approved itinerary.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-[#072537] text-white py-10 px-4 sm:px-8 border-t border-white/10">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <img
              src={websiteLogo}
              alt="NOVA"
              className="h-12 sm:h-16 w-auto object-contain mb-2"
            />
            <p className="text-[11px] text-slate-400">
              © 2026 Tour Link. Your Island Journey
            </p>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-300 font-medium">
            <button onClick={() => setShowSplash(true)} className="hover:text-[#16A6A1] transition-colors cursor-pointer text-[#16A6A1] font-bold">
              ✦ Replay Splash Reveal
            </button>
            <button onClick={() => navigate('/dashboard')} className="hover:text-white transition-colors cursor-pointer">
              Sitemap
            </button>
            <button onClick={() => navigate('/settings')} className="hover:text-white transition-colors cursor-pointer">
              Privacy Policy
            </button>
            <button onClick={() => navigate('/settings')} className="hover:text-white transition-colors cursor-pointer">
              Terms of Service
            </button>
            <button onClick={() => navigate('/settings')} className="hover:text-white transition-colors cursor-pointer">
              Contact Us
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
