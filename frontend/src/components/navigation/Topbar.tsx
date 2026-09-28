import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Bell, Sparkles, LogOut, User as UserIcon, Shield, ChevronDown } from 'lucide-react';
import { SearchInput } from '../ui/SearchInput';
import { Avatar } from '../ui/Avatar';
import { Dropdown } from '../ui/Dropdown';
import { useAuth } from '../../hooks/useAuth';
import { UserRole } from '../../types/auth';
import { BRAND } from '../../constants/brand';

export interface TopbarProps {
  onToggleMobileSidebar: () => void;
  title?: string;
}

export const Topbar: React.FC<TopbarProps> = ({ onToggleMobileSidebar, title }) => {
  const navigate = useNavigate();
  const { user, role, setRole, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(true);

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
    <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between transition-all">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          aria-label="Open mobile menu"
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {title && (
          <h2 className="text-base font-extrabold text-[#0B3A53] hidden sm:block tracking-tight">
            {title}
          </h2>
        )}
      </div>

      {/* Center: Global Search Bar */}
      <div className="flex-1 max-w-md mx-4 hidden md:block">
        <SearchInput
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          onClear={() => setSearchQuery('')}
          placeholder="Search destinations, bookings, guides, AI itineraries..."
        />
      </div>

      {/* Right: Notifications & User Profile */}
      <div className="flex items-center gap-3">
        {/* AI Quick Telemetry Badge */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#16A6A1]/10 border border-[#16A6A1]/30 text-xs font-bold text-[#138D89]">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          <span>NOVA AI Active</span>
        </div>

        {/* Notifications Icon */}
        <button
          onClick={() => setHasUnreadNotifications(false)}
          aria-label="View notifications"
          className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
        >
          <Bell className="w-5 h-5" />
          {hasUnreadNotifications && (
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-amber-500 rounded-full ring-2 ring-white animate-pulse" />
          )}
        </button>

        <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block" />

        {/* User Profile Dropdown */}
        <Dropdown
          trigger={
            <div className="flex items-center gap-3 p-1 hover:bg-slate-50 rounded-xl transition-colors">
              <Avatar src={user?.avatarUrl} name={user?.name || 'Sarah Lin'} size="md" status="online" />
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-900 leading-tight">
                  {user?.name || 'Sarah Lin'}
                </span>
                <span className="text-[10px] font-semibold text-[#146C86] leading-tight">
                  {role}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden lg:block" />
            </div>
          }
          items={profileMenuItems}
        />
      </div>
    </header>
  );
};
