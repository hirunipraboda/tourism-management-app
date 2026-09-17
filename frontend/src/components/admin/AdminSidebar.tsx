import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Compass,
  MapPin,
  Package,
  CalendarCheck,
  Clock,
  Cpu,
  CheckSquare,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sparkles,
  Star,
} from 'lucide-react';
import websiteLogo from '../../assets/website-logo.png';
import { adminAuthService } from '../../services/adminAuthService';

interface AdminSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

interface NavItem {
  label: string;
  path: string;
  icon: any;
  badge?: string;
  badgeColor?: string;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const navigate = useNavigate();
  const session = adminAuthService.getSession();

  const navSections: { title: string; items: NavItem[] }[] = [
    {
      title: 'OVERVIEW',
      items: [
        { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
      ],
    },
    {
      title: 'MANAGEMENT',
      items: [
        { label: 'Users', path: '/admin/users', icon: Users },
        { label: 'Destinations', path: '/admin/destinations', icon: Compass },
        { label: 'Attractions', path: '/admin/attractions', icon: MapPin },
        { label: 'Tour Packages', path: '/admin/tours', icon: Package },
        { label: 'Bookings', path: '/admin/bookings', icon: CalendarCheck, badge: 'TL' },
        { label: 'Availability', path: '/admin/availability', icon: Clock },
      ],
    },
    {
      title: 'AI MANAGEMENT',
      items: [
        { label: 'AI Workflows', path: '/admin/ai-workflows', icon: Cpu, badge: 'AI', badgeColor: 'bg-[#16A6A1]' },
        { label: 'AI Approvals', path: '/admin/approvals', icon: CheckSquare, badge: 'Awaiting', badgeColor: 'bg-amber-500' },
      ],
    },
    {
      title: 'INSIGHTS & SYSTEM',
      items: [
        { label: 'Reports', path: '/admin/reports', icon: BarChart3 },
        { label: 'Settings', path: '/admin/settings', icon: Settings },
      ],
    },
    {
      title: 'REVIEWS & RECOMMENDATIONS',
      items: [
        { label: 'Review Moderation', path: '/admin/reviews', icon: Star, badge: '128', badgeColor: 'bg-amber-500' },
        { label: 'Satisfaction Analytics', path: '/admin/customer-satisfaction', icon: BarChart3 },
        { label: 'Recommendation Insights', path: '/admin/recommendation-insights', icon: Sparkles },
      ],
    },
  ];

  const handleLogout = () => {
    adminAuthService.logout();
    navigate('/admin/login');
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 bg-white text-slate-800 flex flex-col transition-all duration-300 ease-in-out border-r border-slate-200/80 shadow-xl ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Logo Header */}
        <div className={`h-20 flex items-center border-b border-slate-200/80 shrink-0 bg-slate-50/50 ${
          isCollapsed ? 'justify-center px-2' : 'justify-between px-5'
        }`}>
          {isCollapsed ? (
            <button
              onClick={onToggleCollapse}
              title="Expand Navigation"
              aria-label="Expand navigation"
              className="flex items-center justify-center p-1 rounded-xl hover:bg-slate-200/60 transition-all cursor-pointer group"
            >
              <img
                src={websiteLogo}
                alt="Travel Link - Click to expand"
                className="h-10 w-auto object-contain transition-transform group-hover:scale-110 drop-shadow-xs"
              />
            </button>
          ) : (
            <>
              <NavLink to="/admin" className="flex items-center gap-3 overflow-hidden group">
                <img
                  src={websiteLogo}
                  alt="Travel Link"
                  className="h-11 sm:h-12 w-auto object-contain transition-transform group-hover:scale-105 shrink-0"
                />
                <div className="flex flex-col truncate">
                  <span className="text-sm font-black tracking-tight text-[#0B3A53] font-heading leading-tight truncate">
                    Travel Link
                  </span>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#16A6A1] truncate">
                    Admin Portal
                  </span>
                </div>
              </NavLink>

              <button
                onClick={onToggleCollapse}
                aria-label="Collapse navigation sidebar"
                title="Collapse Navigation"
                className="hidden lg:flex p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {/* Navigation Section List */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6 custom-sidebar-scroll">
          {navSections.map((sec, sIdx) => (
            <div key={sIdx} className="space-y-1">
              {!isCollapsed && (
                <div className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  {sec.title}
                </div>
              )}
              {sec.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/admin'}
                    onClick={onCloseMobile}
                    className={({ isActive }) =>
                      `group relative flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
                        isActive
                          ? 'bg-[#16A6A1]/10 text-[#0B3A53] font-black border border-[#16A6A1]/20 shadow-2xs'
                          : 'text-slate-600 hover:text-[#0B3A53] hover:bg-slate-100/70'
                      } ${isCollapsed ? 'justify-center px-0' : ''}`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-[#16A6A1] rounded-r-full shadow-[0_0_8px_#16A6A1]" />
                        )}
                        <Icon
                          className={`w-5 h-5 shrink-0 transition-colors ${
                            isActive ? 'text-[#16A6A1]' : 'text-slate-400 group-hover:text-[#0B3A53]'
                          }`}
                        />
                        {!isCollapsed && (
                          <span className="truncate flex-1 text-left">{item.label}</span>
                        )}
                        {!isCollapsed && item.badge && (
                          <span
                            className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full text-white ${
                              item.badgeColor || 'bg-slate-700'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer Admin Profile */}
        <div className="p-4 border-t border-slate-200/80 shrink-0 bg-slate-50/80">
          <div className="flex items-center justify-between gap-3">
            {!isCollapsed ? (
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={session.adminUser?.avatar || websiteLogo}
                  alt="Admin Profile"
                  className="w-9 h-9 rounded-full object-cover border border-slate-300 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-900 truncate">
                    {session.adminUser?.name || 'Administrator'}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">
                    {session.adminUser?.email || 'admin@travellink.lk'}
                  </div>
                </div>
              </div>
            ) : (
              <img
                src={session.adminUser?.avatar || websiteLogo}
                alt="Admin Profile"
                className="w-9 h-9 rounded-full object-cover border border-slate-300 mx-auto"
              />
            )}

            {!isCollapsed && (
              <button
                onClick={handleLogout}
                title="Logout from Admin Portal"
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer shrink-0"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
