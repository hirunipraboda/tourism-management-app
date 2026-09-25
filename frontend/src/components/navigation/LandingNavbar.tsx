import React, { useRef, useEffect, useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Search, Bell, Compass, Shield, LogOut, User as UserIcon } from 'lucide-react';
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

  const getActiveTab = () => {
    const path = location.pathname;
    if (path.startsWith('/destinations')) return 'destinations';
    if (path.startsWith('/trips')) return 'trips';
    if (path.startsWith('/tours')) return 'tours';
    if (path.startsWith('/ai-workflows') || path.startsWith('/planner')) return 'ai';
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
        <nav className="relative hidden md:flex items-center gap-2 p-2 bg-slate-100/90 border border-slate-200/80 rounded-full backdrop-blur-md font-bold text-slate-700 shadow-inner">
          {/* Smooth Sliding Underline Indicator */}
          {sliderStyle.width > 0 && (
            <span
              className="absolute bottom-2 h-[3px] bg-[#16A6A1] rounded-full transition-all duration-300 ease-out pointer-events-none z-10"
              style={{
                left: `${sliderStyle.left}px`,
                width: `${sliderStyle.width}px`,
              }}
            />
          )}

          <button
            ref={(el) => { tabRefs.current['explore'] = el; }}
            onClick={() => navigate('/')}
            className={`px-5 py-2.5 rounded-full transition-all duration-200 cursor-pointer relative font-extrabold text-sm ${
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
            className={`px-5 py-2.5 rounded-full transition-all duration-200 cursor-pointer relative font-extrabold text-sm ${
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
            className={`px-5 py-2.5 rounded-full transition-all duration-200 cursor-pointer relative font-extrabold text-sm ${
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
            className={`px-5 py-2.5 rounded-full transition-all duration-200 cursor-pointer relative font-extrabold text-sm ${
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
            className={`px-5 py-2.5 rounded-full transition-all duration-200 cursor-pointer relative font-extrabold text-sm ${
              activeTab === 'ai'
                ? 'text-[#0B3A53] font-black bg-white shadow-xs'
                : 'text-slate-600 hover:text-[#0B3A53] hover:bg-white/60'
            }`}
          >
            <span>AI Trip Planner</span>
          </button>
        </nav>

        {/* Right: Actions & User Avatar */}
        <div className="flex items-center gap-3.5 sm:gap-4">
          {/* Light Search Icon Button */}
          <button
            aria-label="Search"
            className="p-3 text-slate-700 hover:text-[#0B3A53] hover:bg-slate-100 rounded-full border border-slate-200/90 shadow-2xs transition-all cursor-pointer"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Light Notification Icon Button */}
          <button
            aria-label="Notifications"
            className="p-3 text-slate-700 hover:text-[#0B3A53] hover:bg-slate-100 rounded-full border border-slate-200/90 shadow-2xs transition-all cursor-pointer relative"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-amber-500 rounded-full ring-2 ring-white" />
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
        </div>
      </div>
    </header>
  );
};
