import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Sparkles,
  CheckCircle2,
  Compass,
  MapPin,
  Calendar,
  Check,
  Trash2,
  ArrowRight,
} from 'lucide-react';

export interface UserNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  category: 'ai' | 'booking' | 'transport' | 'recommendation' | 'advisory';
  link?: string;
}

const DEFAULT_NOTIFICATIONS: UserNotification[] = [
  {
    id: 'notif-1',
    title: 'AI Itinerary Generated',
    message: 'Your 5-Day Sri Lanka Cultural Odyssey is ready with optimized train routes and sight pacing.',
    time: '5m ago',
    read: false,
    category: 'ai',
    link: '/ai-workflows',
  },
  {
    id: 'notif-2',
    title: 'Tour Reservation Confirmed',
    message: 'Your booking for "Ella Scenic Odyssey by Rail & Nine Arches" has been confirmed.',
    time: '2h ago',
    read: false,
    category: 'booking',
    link: '/trips',
  },
  {
    id: 'notif-3',
    title: 'Scenic Train Advisory',
    message: 'Kandy to Ella mountain railway services are operating normally with clear scenic weather today.',
    time: '5h ago',
    read: false,
    category: 'transport',
    link: '/destinations',
  },
  {
    id: 'notif-4',
    title: 'Curated Local Experience',
    message: 'A new authentic Ceylon tea tasting session was added near your saved destinations.',
    time: '1d ago',
    read: true,
    category: 'recommendation',
    link: '/recommendations',
  },
  {
    id: 'notif-5',
    title: 'Upcoming Travel Tip',
    message: 'Morning climbs at Sigiriya Rock Citadel are recommended before 8:30 AM to avoid heat.',
    time: '2d ago',
    read: true,
    category: 'advisory',
    link: '/destinations',
  },
];

export const UserNotificationsPopover: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<UserNotification[]>(() => {
    try {
      const saved = localStorage.getItem('nova_user_notifications');
      return saved ? JSON.parse(saved) : DEFAULT_NOTIFICATIONS;
    } catch {
      return DEFAULT_NOTIFICATIONS;
    }
  });
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem('nova_user_notifications', JSON.stringify(notifications));
    } catch {
      // ignore
    }
  }, [notifications]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleItemClick = (notification: UserNotification) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
    );
    if (notification.link) {
      setIsOpen(false);
      navigate(notification.link);
    }
  };

  const filteredNotifications =
    activeTab === 'unread'
      ? notifications.filter((n) => !n.read)
      : notifications;

  const getCategoryDetails = (category: UserNotification['category']) => {
    switch (category) {
      case 'ai':
        return {
          icon: <Sparkles className="w-4 h-4" />,
          color: 'text-[#16A6A1] bg-[#16A6A1]/10',
          badge: 'AI Planner',
        };
      case 'booking':
        return {
          icon: <CheckCircle2 className="w-4 h-4" />,
          color: 'text-emerald-600 bg-emerald-50',
          badge: 'Booking',
        };
      case 'transport':
        return {
          icon: <Compass className="w-4 h-4" />,
          color: 'text-sky-600 bg-sky-50',
          badge: 'Transport',
        };
      case 'recommendation':
        return {
          icon: <MapPin className="w-4 h-4" />,
          color: 'text-amber-600 bg-amber-50',
          badge: 'Discovery',
        };
      case 'advisory':
        return {
          icon: <Calendar className="w-4 h-4" />,
          color: 'text-indigo-600 bg-indigo-50',
          badge: 'Travel Tip',
        };
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
        aria-expanded={isOpen}
        className={`p-2.5 sm:p-3 rounded-full border transition-all cursor-pointer relative ${
          isOpen
            ? 'border-[#0B3A53] bg-slate-100 text-[#0B3A53]'
            : 'border-slate-200/90 text-slate-700 hover:text-[#0B3A53] hover:bg-slate-100 shadow-2xs'
        }`}
      >
        <Bell className="w-4 sm:w-5 h-4 sm:h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 w-2 sm:w-2.5 h-2 sm:h-2.5 bg-amber-500 rounded-full ring-2 ring-white animate-pulse" />
        )}
      </button>

      {/* Popover Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 sm:-right-4 mt-3 w-[calc(100vw-32px)] sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200/90 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-sm font-black text-[#0B3A53] font-heading tracking-tight">
                Notifications
              </span>
              {unreadCount > 0 ? (
                <span className="bg-[#16A6A1]/15 text-[#146C86] font-black text-[10px] px-2.5 py-0.5 rounded-full">
                  {unreadCount} New
                </span>
              ) : (
                <span className="bg-slate-200/70 text-slate-600 font-extrabold text-[10px] px-2 py-0.5 rounded-full">
                  All caught up
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[11px] font-bold text-[#146C86] hover:text-[#0B3A53] transition-colors cursor-pointer flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="px-4 pt-2.5 pb-1 border-b border-slate-100 flex items-center gap-2 text-xs">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-full font-extrabold text-[11px] transition-colors cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-[#0B3A53] text-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setActiveTab('unread')}
              className={`px-3 py-1.5 rounded-full font-extrabold text-[11px] transition-colors cursor-pointer ${
                activeTab === 'unread'
                  ? 'bg-[#0B3A53] text-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100/80">
            {filteredNotifications.length === 0 ? (
              <div className="py-12 px-6 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Bell className="w-5 h-5 opacity-60" />
                </div>
                <div className="text-xs font-bold text-slate-700">No notifications here</div>
                <div className="text-[11px] text-slate-400">
                  {activeTab === 'unread'
                    ? "You've read all your recent notifications."
                    : 'Check back later for trip alerts and travel updates.'}
                </div>
              </div>
            ) : (
              filteredNotifications.map((notif) => {
                const cat = getCategoryDetails(notif.category);
                return (
                  <div
                    key={notif.id}
                    onClick={() => handleItemClick(notif)}
                    className={`p-4 flex items-start gap-3 transition-colors cursor-pointer relative group ${
                      notif.read
                        ? 'bg-white hover:bg-slate-50/80'
                        : 'bg-[#16A6A1]/5 hover:bg-[#16A6A1]/10'
                    }`}
                  >
                    {/* Category Icon */}
                    <div className={`p-2 rounded-2xl shrink-0 mt-0.5 shadow-2xs ${cat.color}`}>
                      {cat.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                          {cat.badge}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400 shrink-0">
                          {notif.time}
                        </span>
                      </div>

                      <div className="text-xs font-black text-[#0B3A53] leading-snug">
                        {notif.title}
                      </div>

                      <div className="text-[11px] font-medium text-slate-600 leading-relaxed line-clamp-2">
                        {notif.message}
                      </div>
                    </div>

                    {/* Unread indicator & Hover Actions */}
                    <div className="flex flex-col items-center gap-1.5 shrink-0 pt-0.5">
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-[#16A6A1]" title="Unread" />
                      )}
                      <button
                        onClick={(e) => handleDelete(notif.id, e)}
                        title="Delete notification"
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-[11px] font-bold">
              <button
                onClick={() => setNotifications([])}
                className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer px-2 py-1 rounded-lg hover:bg-rose-50"
              >
                Clear all
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/ai-workflows');
                }}
                className="text-[#146C86] hover:text-[#0B3A53] transition-colors cursor-pointer flex items-center gap-1 px-2 py-1"
              >
                <span>Plan next trip</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
