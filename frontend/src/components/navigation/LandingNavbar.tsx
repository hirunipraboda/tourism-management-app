import React, { useRef, useEffect, useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Search, Bell, Compass, Shield, LogOut, User as UserIcon, Menu, X, Star } from 'lucide-react';
import { BRAND } from '../../constants/brand';
import { Avatar } from '../ui/Avatar';
import { Dropdown } from '../ui/Dropdown';
import { useAuth } from '../../hooks/useAuth';
import { UserRole } from '../../types/auth';

import headerLogo from '../../assets/header-logo.png';

export const LandingNavbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, role, setRole, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getActiveTab = () => {
    const path = location.pathname;
    if (path.startsWith('/destinations')) return 'destinations';
    if (path.startsWith('/trips') || path.startsWith('/plan-trip') || path.startsWith('/manual-planner')) return 'trips';
    if (path.startsWith('/tours')) return 'tours';
    if (path.startsWith('/ai-workflows') || path.startsWith('/planner')) return 'ai';
    if (path.startsWith('/recommendations') || path.startsWith('/reviews') || path.startsWith('/operator')) return 'reviews';
    return 'explore';
  };

  const activeTab = getActiveTab();

  const tabRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
  const [sliderStyle, setSliderStyle] = useState<{ left: number; width: number }>({ left: 0, width: 0 });

  useEffect(() => {
    const updateSlider = () => {
      const activeEl = tabRefs.current[activeTab];
      if (activeEl) {
        setSliderStyle({
          left: activeEl.offsetLeft + 20,
          width: Math.max(0, activeEl.offsetWidth - 40),
        });
      }
    };

    updateSlider();
    window.addEventListener('resize', updateSlider);
    return () => window.removeEventListener('resize', updateSlider);
  }, [activeTab, location.pathname]);

  const profileMenuItems = [
    {
      id: 'my-profile',
      label: 'My Profile',
      icon: <UserIcon className="w-4 h-4 text-[#16A6A1]" />,
      onClick: () => navigate('/profile'),
    },
    {
      id: 'logout',
      label: 'Sign Out',
      icon: <LogOut className="w-4 h-4" />,
      danger: true,
      onClick: logout,
    },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-slate-200/80 px-4 sm:px-8 py-3 transition-all duration-300 shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 min-h-[72px] sm:min-h-[82px]">
        
        {/* Left: Complete Original Travel Link Logo */}
        <div className="flex items-center shrink-0 overflow-visible py-1">
          <NavLink to="/" className="flex items-center group transition-all hover:opacity-90">
            <img
              src={headerLogo}
              alt="Travel Link - Your Island Journey"
              className="w-[185px] sm:w-[220px] md:w-[245px] lg:w-[265px] h-auto object-contain transition-transform group-hover:scale-[1.02] drop-shadow-2xs"
            />
          </NavLink>
        </div>

        {/* Center: Underlined Active Navigation Links with Smooth Sliding Line */}
        <nav className="relative hidden xl:flex items-center gap-1.5 p-1.5 bg-slate-100/90 border border-slate-200/80 rounded-full backdrop-blur-md font-bold text-slate-700 shadow-inner">
          {/* Smooth Sliding Underline Indicator */}
          {sliderStyle.width > 0 && (
            <span
              className="absolute bottom-1.5 h-[3px] bg-[#16A6A1] rounded-full transition-all duration-300 ease-out pointer-events-none z-10"
              style={{
                left: `${sliderStyle.left}px`,
                width: `${sliderStyle.width}px`,
              }}
            />
          )}

          <button
            ref={(el) => { tabRefs.current['explore'] = el; }}
            onClick={() => navigate('/')}
            className={`px-3.5 2xl:px-4.5 py-2 rounded-full transition-all duration-200 cursor-pointer relative font-extrabold text-xs 2xl:text-sm ${
              activeTab === 'explore'
                ? 'text-[#0B3A53] font-black bg-white shadow-xs'
                : 'text-slate-600 hover:text-[#0B3A53] hover:bg-white/60'
            }`}
          >
            <span>Explore</span>
          </button>

          <button
            ref={(el) => { tabRefs.current['destinations'] = el; }}
            onClick={() => navigate('/destinations')}
            className={`px-3.5 2xl:px-4.5 py-2 rounded-full transition-all duration-200 cursor-pointer relative font-extrabold text-xs 2xl:text-sm ${
              activeTab === 'destinations'
                ? 'text-[#0B3A53] font-black bg-white shadow-xs'
                : 'text-slate-600 hover:text-[#0B3A53] hover:bg-white/60'
            }`}
          >
            <span>Destinations</span>
          </button>

          <button
            ref={(el) => { tabRefs.current['trips'] = el; }}
            onClick={() => navigate('/trips')}
            className={`px-3.5 2xl:px-4.5 py-2 rounded-full transition-all duration-200 cursor-pointer relative font-extrabold text-xs 2xl:text-sm ${
              activeTab === 'trips'
                ? 'text-[#0B3A53] font-black bg-white shadow-xs'
                : 'text-slate-600 hover:text-[#0B3A53] hover:bg-white/60'
            }`}
          >
            <span>Trips</span>
          </button>

          <button
            ref={(el) => { tabRefs.current['tours'] = el; }}
            onClick={() => navigate('/tours')}
            className={`px-3.5 2xl:px-4.5 py-2 rounded-full transition-all duration-200 cursor-pointer relative font-extrabold text-xs 2xl:text-sm ${
              activeTab === 'tours'
                ? 'text-[#0B3A53] font-black bg-white shadow-xs'
                : 'text-slate-600 hover:text-[#0B3A53] hover:bg-white/60'
            }`}
          >
            <span>Tour & Guide</span>
          </button>

          <button
            ref={(el) => { tabRefs.current['ai'] = el; }}
            onClick={() => navigate('/ai-workflows')}
            className={`px-3.5 2xl:px-4.5 py-2 rounded-full transition-all duration-200 cursor-pointer relative font-extrabold text-xs 2xl:text-sm ${
              activeTab === 'ai'
                ? 'text-[#0B3A53] font-black bg-white shadow-xs'
                : 'text-slate-600 hover:text-[#0B3A53] hover:bg-white/60'
            }`}
          >
            <span>AI Trip Planner</span>
          </button>

          <button
            ref={(el) => { tabRefs.current['reviews'] = el; }}
            onClick={() => navigate('/recommendations')}
            className={`px-3.5 2xl:px-4.5 py-2 rounded-full transition-all duration-200 cursor-pointer relative font-extrabold text-xs 2xl:text-sm flex items-center gap-1.5 ${
              activeTab === 'reviews'
                ? 'text-[#0B3A53] font-black bg-white shadow-xs'
                : 'text-slate-600 hover:text-[#0B3A53] hover:bg-white/60'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${activeTab === 'reviews' ? 'text-amber-500 fill-amber-500' : 'text-slate-400'}`} />
            <span>Reviews & Recs</span>
          </button>
        </nav>

        {/* Right: Actions & User Avatar */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          {/* Search Icon Button */}
          <button
            aria-label="Search"
            className="p-2.5 sm:p-3 text-slate-700 hover:text-[#0B3A53] hover:bg-slate-100 rounded-full border border-slate-200/90 shadow-2xs transition-all cursor-pointer"
          >
            <Search className="w-4 sm:w-5 h-4 sm:h-5" />
          </button>

          {/* Notification Icon Button */}
          <button
            aria-label="Notifications"
            className="p-2.5 sm:p-3 text-slate-700 hover:text-[#0B3A53] hover:bg-slate-100 rounded-full border border-slate-200/90 shadow-2xs transition-all cursor-pointer relative"
          >
            <Bell className="w-4 sm:w-5 h-4 sm:h-5" />
            <span className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 w-2 sm:w-2.5 h-2 sm:h-2.5 bg-amber-500 rounded-full ring-2 ring-white" />
          </button>

          {/* User Profile Avatar Dropdown */}
          <Dropdown
            trigger={
              <div className="flex items-center gap-1 p-1 rounded-full ring-2 ring-[#16A6A1] hover:ring-[#0B3A53] transition-all cursor-pointer shadow-xs">
                <Avatar src={user?.avatarUrl} name={user?.name || 'Sarah Lin'} size="md" />
              </div>
            }
            items={profileMenuItems}
          />

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="xl:hidden p-2.5 text-slate-700 hover:text-[#0B3A53] hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-slate-200 bg-white/95 backdrop-blur-xl px-4 py-4 space-y-2 shadow-lg animate-in slide-in-from-top-2 duration-200">
          <button
            onClick={() => { navigate('/'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-4 py-2.5 rounded-xl font-bold text-sm transition-colors ${
              activeTab === 'explore' ? 'bg-[#0B3A53] text-white' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            Explore
          </button>
          <button
            onClick={() => { navigate('/destinations'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-4 py-2.5 rounded-xl font-bold text-sm transition-colors ${
              activeTab === 'destinations' ? 'bg-[#0B3A53] text-white' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            Destinations
          </button>
          <button
            onClick={() => { navigate('/trips'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-4 py-2.5 rounded-xl font-bold text-sm transition-colors ${
              activeTab === 'trips' ? 'bg-[#0B3A53] text-white' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            Trips
          </button>
          <button
            onClick={() => { navigate('/tours'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-4 py-2.5 rounded-xl font-bold text-sm transition-colors ${
              activeTab === 'tours' ? 'bg-[#0B3A53] text-white' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            Tour & Guide
          </button>
          <button
            onClick={() => { navigate('/ai-workflows'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-4 py-2.5 rounded-xl font-bold text-sm transition-colors ${
              activeTab === 'ai' ? 'bg-[#0B3A53] text-white' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            AI Trip Planner
          </button>
          <button
            onClick={() => { navigate('/recommendations'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-4 py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center justify-between ${
              activeTab === 'reviews' ? 'bg-[#0B3A53] text-white' : 'text-[#146C86] bg-slate-50 hover:bg-slate-100'
            }`}
          >
            <span className="flex items-center gap-2">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>Reviews & Recommendations</span>
            </span>
            <span className="text-[10px] bg-amber-100 text-amber-800 font-extrabold px-2 py-0.5 rounded-full">
              4.9★
            </span>
          </button>
        </div>
      )}
    </header>
  );
};
