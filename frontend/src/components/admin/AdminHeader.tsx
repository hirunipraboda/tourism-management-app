import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Menu,
  Bell,
  Search,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { adminAuthService } from '../../services/adminAuthService';

interface AdminHeaderProps {
  onToggleMobileSidebar: () => void;
  title: string;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ onToggleMobileSidebar, title }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const session = adminAuthService.getSession();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [unreadNotifs, setUnreadNotifs] = useState(3);

  const notifications = [
    {
      id: 1,
      title: 'New booking received',
      desc: 'Sanath Wickramasinghe booked Grand Cultural Odyssey (#TL10294)',
      time: '10 mins ago',
      icon: CheckCircle2,
      color: 'text-[#16A6A1] bg-[#16A6A1]/10',
    },
    {
      id: 2,
      title: 'AI itinerary awaiting review',
      desc: 'Itinerary WF-TL-801 requires operator human approval',
      time: '25 mins ago',
      icon: Sparkles,
      color: 'text-amber-500 bg-amber-500/10',
    },
    {
      id: 3,
      title: 'Highland railway seat alert',
      desc: 'Route optimization updated Kandy-Ella railway timing',
      time: '1 hour ago',
      icon: Info,
      color: 'text-[#146C86] bg-[#146C86]/10',
    },
  ];

  // Breadcrumbs calculation
  const pathParts = location.pathname.split('/').filter(Boolean);

  const handleLogout = () => {
    adminAuthService.logout();
    navigate('/admin/login');
  };

  return (
    <header className="h-20 bg-white border-b border-slate-200/80 sticky top-0 z-30 px-4 sm:px-8 flex items-center justify-between shadow-2xs">
      
      {/* LEFT: Mobile Sidebar Toggle & Page Title + Breadcrumbs */}
      <div className="flex items-center gap-4 min-w-0">
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
          aria-label="Toggle mobile menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0 space-y-0.5">
          {/* Breadcrumb Path */}
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
            <Link to="/admin" className="hover:text-[#16A6A1] transition-colors">
              Admin
            </Link>
            {pathParts.slice(1).map((part, idx) => (
              <React.Fragment key={idx}>
                <span>/</span>
                <span className={idx === pathParts.length - 2 ? 'text-[#0B3A53]' : ''}>
                  {part.replace('-', ' ')}
                </span>
              </React.Fragment>
            ))}
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-[#0B3A53] tracking-tight font-heading truncate">
            {title}
          </h1>
        </div>
      </div>

      {/* RIGHT: Search, Notifications, Admin Profile */}
      <div className="flex items-center gap-3 sm:gap-4">
        
        {/* Global Admin Search Bar */}
        <div className="relative hidden md:block w-64">
          <input
            type="text"
            placeholder="Search users, tours, bookings..."
            className="w-full h-10 pl-9 pr-4 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-[#0B3A53] placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#16A6A1] transition-all"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Notification Bell Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setIsNotifOpen(!isNotifOpen);
              setIsProfileOpen(false);
            }}
            className="relative p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifs > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white" />
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200/80 p-4 space-y-3 z-50 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-[#0B3A53] font-heading">Notifications</span>
                  <span className="bg-[#16A6A1]/10 text-[#146C86] font-extrabold text-[10px] px-2 py-0.5 rounded-full">
                    {unreadNotifs} New
                  </span>
                </div>
                <button
                  onClick={() => setUnreadNotifs(0)}
                  className="text-[11px] font-bold text-[#146C86] hover:underline cursor-pointer"
                >
                  Mark all as read
                </button>
              </div>

              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {notifications.map((n) => {
                  const Icon = n.icon;
                  return (
                    <div
                      key={n.id}
                      className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors flex items-start gap-3 text-xs"
                    >
                      <div className={`p-2 rounded-xl shrink-0 ${n.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="space-y-0.5 flex-1 min-w-0">
                        <div className="font-extrabold text-[#0B3A53] truncate">{n.title}</div>
                        <div className="text-slate-500 text-[11px] leading-snug">{n.desc}</div>
                        <div className="text-[10px] font-bold text-slate-400 pt-0.5">{n.time}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Admin Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setIsProfileOpen(!isProfileOpen);
              setIsNotifOpen(false);
            }}
            className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200/60"
          >
            <img
              src={session.adminUser?.avatar}
              alt="Admin Profile"
              className="w-8 h-8 rounded-full object-cover border border-slate-300"
            />
            <span className="hidden sm:inline-block text-xs font-black text-[#0B3A53]">
              {session.adminUser?.name || 'Admin'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-3 w-56 bg-white rounded-3xl shadow-2xl border border-slate-200/80 p-2 space-y-1 z-50 animate-in fade-in zoom-in-95 duration-200">
              <div className="p-3 border-b border-slate-100">
                <div className="text-xs font-black text-[#0B3A53]">{session.adminUser?.name}</div>
                <div className="text-[11px] font-medium text-slate-400">{session.adminUser?.email}</div>
                <div className="mt-1 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#16A6A1]/10 text-[#146C86] inline-block">
                  System Operator
                </div>
              </div>

              <button
                onClick={() => {
                  setIsProfileOpen(false);
                  navigate('/admin/settings');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-2xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <User className="w-4 h-4 text-slate-400" />
                <span>My Profile</span>
              </button>

              <button
                onClick={() => {
                  setIsProfileOpen(false);
                  navigate('/admin/settings');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-2xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                <span>Settings</span>
              </button>

              <div className="border-t border-slate-100 pt-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-2xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};
