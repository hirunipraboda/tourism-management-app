import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutGrid,
  Users,
  Compass,
  MapPin,
  Bot,
  Car,
  Bus,
  Train,
  Star,
  Activity as ActivityIcon,
  CreditCard,
  BarChart3,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  LogOut,
  HelpCircle,
  Milestone,
} from 'lucide-react';
import websiteLogo from '../../assets/website-logo.png';
import { adminAuthService } from '../../services/adminAuthService';
import { useAuth } from '../../hooks/useAuth';

interface AdminSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout: touristLogout } = useAuth();
  const session = adminAuthService.getSession();

  // Collapsible Submenu State (when expanded)
  const [destOpen, setDestOpen] = useState(
    location.pathname.startsWith('/admin/destinations') ||
    location.pathname.startsWith('/admin/activities') ||
    location.pathname.startsWith('/admin/attractions')
  );

  const [transportOpen, setTransportOpen] = useState(
    location.pathname.startsWith('/admin/transportation')
  );

  const [aiGuideOpen, setAiGuideOpen] = useState(
    location.pathname.startsWith('/admin/ai-guide')
  );

  const handleLogout = () => {
    adminAuthService.logout();
    try {
      touristLogout();
    } catch {
      // ignore
    }
    navigate('/login');
  };

  const isDestActive =
    location.pathname.startsWith('/admin/destinations') ||
    location.pathname.startsWith('/admin/activities') ||
    location.pathname.startsWith('/admin/attractions');

  const isTransportActive = location.pathname.startsWith('/admin/transportation');

  const isAiGuideActive = location.pathname.startsWith('/admin/ai-guide');

  // Item base classes
  const getItemClass = (isActive: boolean) => {
    if (isCollapsed) {
      return `w-12 h-12 mx-auto rounded-2xl flex items-center justify-center transition-all cursor-pointer ${isActive
        ? 'bg-[#16A6A1] text-white shadow-md shadow-[#16A6A1]/30'
        : 'text-slate-500 hover:text-[#0B3A53] hover:bg-slate-100/80'
        }`;
    }
    return `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all duration-200 group cursor-pointer ${isActive
      ? 'bg-[#16A6A1] text-white shadow-sm shadow-[#16A6A1]/30 font-extrabold'
      : 'text-slate-600 hover:text-[#0B3A53] hover:bg-slate-100/80'
      }`;
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
        className={`fixed top-0 bottom-0 left-0 z-40 bg-white text-slate-800 flex flex-col transition-all duration-300 ease-in-out border-r border-slate-200/80 shadow-sm ${isCollapsed ? 'w-20' : 'w-64'
          } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Logo Header */}
        <div
          className={`h-20 flex items-center border-b border-slate-200/80 shrink-0 bg-slate-50/50 ${isCollapsed ? 'justify-center px-2' : 'justify-between px-5'
            }`}
        >
          {isCollapsed ? (
            <button
              onClick={onToggleCollapse}
              title="Expand Navigation"
              aria-label="Expand navigation"
              className="flex items-center justify-center p-1.5 rounded-xl hover:bg-slate-200/60 transition-all cursor-pointer group"
            >
              <img
                src={websiteLogo}
                alt="NOVA"
                className="h-10 w-auto object-contain transition-transform group-hover:scale-110 drop-shadow-xs"
              />
            </button>
          ) : (
            <>
              <NavLink to="/admin" className="flex items-center gap-3 overflow-hidden group">
                <img
                  src={websiteLogo}
                  alt="NOVA"
                  className="h-11 sm:h-12 w-auto object-contain transition-transform group-hover:scale-105 shrink-0"
                />
                <div className="flex flex-col truncate">
                  <span className="text-sm font-black tracking-tight text-[#0B3A53] font-heading leading-tight truncate">
                    TourLink Admin
                  </span>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#16A6A1] truncate">
                    Control Panel
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

        {/* Navigation Item List (Exactly the 10 sections) */}
        <div className={`flex-1 overflow-y-auto py-4 space-y-2 custom-sidebar-scroll ${isCollapsed ? 'px-2' : 'px-3'}`}>

          {/* 1. Dashboard */}
          <NavLink
            to="/admin/dashboard"
            title={isCollapsed ? 'Dashboard' : undefined}
            className={({ isActive }) => getItemClass(isActive)}
          >
            <LayoutGrid className="w-5 h-5 shrink-0 transition-transform group-hover:scale-110" />
            {!isCollapsed && <span className="truncate">Dashboard</span>}
          </NavLink>

          {/* 2. User Management */}
          <NavLink
            to="/admin/users"
            title={isCollapsed ? 'User Management' : undefined}
            className={({ isActive }) => getItemClass(isActive)}
          >
            <Users className="w-5 h-5 shrink-0 transition-transform group-hover:scale-110" />
            {!isCollapsed && <span className="truncate">User Management</span>}
          </NavLink>

          {/* 3. Destination Management (Collapsible) */}
          <div>
            <button
              onClick={() => {
                if (isCollapsed) {
                  navigate('/admin/destinations');
                } else {
                  setDestOpen(!destOpen);
                }
              }}
              title={isCollapsed ? 'Destination Management' : undefined}
              className={
                isCollapsed
                  ? getItemClass(isDestActive)
                  : `w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all duration-200 group cursor-pointer ${isDestActive
                    ? 'bg-slate-100 text-[#0B3A53] font-black'
                    : 'text-slate-600 hover:text-[#0B3A53] hover:bg-slate-100/80'
                  }`
              }
            >
              <div className="flex items-center gap-3 min-w-0">
                <Compass className={`w-5 h-5 shrink-0 ${isCollapsed ? '' : isDestActive ? 'text-[#16A6A1]' : 'text-slate-500'}`} />
                {!isCollapsed && <span className="truncate">Destination Management</span>}
              </div>
              {!isCollapsed && (
                destOpen ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            {(!isCollapsed && destOpen) && (
              <div className="ml-5 pl-3 border-l-2 border-slate-200/80 mt-1 space-y-1 py-1 animate-in fade-in duration-200">
                <NavLink
                  to="/admin/destinations"
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${isActive ? 'bg-[#16A6A1]/10 text-[#16A6A1] font-black' : 'text-slate-500 hover:text-[#0B3A53] hover:bg-slate-50'
                    }`
                  }
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Destinations</span>
                </NavLink>
                <NavLink
                  to="/admin/activities"
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${isActive ? 'bg-[#16A6A1]/10 text-[#16A6A1] font-black' : 'text-slate-500 hover:text-[#0B3A53] hover:bg-slate-50'
                    }`
                  }
                >
                  <ActivityIcon className="w-3.5 h-3.5" />
                  <span>Activities</span>
                </NavLink>
                <NavLink
                  to="/admin/attractions"
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${isActive ? 'bg-[#16A6A1]/10 text-[#16A6A1] font-black' : 'text-slate-500 hover:text-[#0B3A53] hover:bg-slate-50'
                    }`
                  }
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Attractions</span>
                </NavLink>
              </div>
            )}
          </div>

          {/* 4. Trip & Itinerary Management */}
          <NavLink
            to="/admin/trips"
            title={isCollapsed ? 'Trip & Itinerary Management' : undefined}
            className={({ isActive }) => getItemClass(isActive)}
          >
            <Milestone className="w-5 h-5 shrink-0 transition-transform group-hover:scale-110" />
            {!isCollapsed && <span className="truncate">Trip & Itinerary Management</span>}
          </NavLink>

          {/* 5. Chatbot Payments */}
          <NavLink
            to="/admin/chatbot-payments"
            title={isCollapsed ? 'Chatbot Payments' : undefined}
            className={({ isActive }) => getItemClass(isActive)}
          >
            <CreditCard className="w-5 h-5 shrink-0 transition-transform group-hover:scale-110" />
            {!isCollapsed && <span className="truncate">Chatbot Payments</span>}
          </NavLink>


          {/* 7. Transportation (Collapsible) */}
          <div>
            <button
              onClick={() => {
                if (isCollapsed) {
                  navigate('/admin/transportation/bus-routes');
                } else {
                  setTransportOpen(!transportOpen);
                }
              }}
              title={isCollapsed ? 'Transportation' : undefined}
              className={
                isCollapsed
                  ? getItemClass(isTransportActive)
                  : `w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all duration-200 group cursor-pointer ${isTransportActive
                    ? 'bg-slate-100 text-[#0B3A53] font-black'
                    : 'text-slate-600 hover:text-[#0B3A53] hover:bg-slate-100/80'
                  }`
              }
            >
              <div className="flex items-center gap-3 min-w-0">
                <Bus className={`w-5 h-5 shrink-0 ${isCollapsed ? '' : isTransportActive ? 'text-[#16A6A1]' : 'text-slate-500'}`} />
                {!isCollapsed && <span className="truncate">Transportation</span>}
              </div>
              {!isCollapsed && (
                transportOpen ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            {(!isCollapsed && transportOpen) && (
              <div className="ml-5 pl-3 border-l-2 border-slate-200/80 mt-1 space-y-1 py-1 animate-in fade-in duration-200">
                <NavLink
                  to="/admin/transportation/bus-routes"
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${isActive ? 'bg-[#16A6A1]/10 text-[#16A6A1] font-black' : 'text-slate-500 hover:text-[#0B3A53] hover:bg-slate-50'
                    }`
                  }
                >
                  <Bus className="w-3.5 h-3.5" />
                  <span>Bus Routes</span>
                </NavLink>
                <NavLink
                  to="/admin/transportation/train-schedules"
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${isActive ? 'bg-[#16A6A1]/10 text-[#16A6A1] font-black' : 'text-slate-500 hover:text-[#0B3A53] hover:bg-slate-50'
                    }`
                  }
                >
                  <Train className="w-3.5 h-3.5" />
                  <span>Train Schedules</span>
                </NavLink>
              </div>
            )}
          </div>

          {/* 8. AI Travel Guide (Collapsible) */}
          <div>
            <button
              onClick={() => {
                if (isCollapsed) {
                  navigate('/admin/ai-guide/purchases');
                } else {
                  setAiGuideOpen(!aiGuideOpen);
                }
              }}
              title={isCollapsed ? 'AI Travel Guide' : undefined}
              className={
                isCollapsed
                  ? getItemClass(isAiGuideActive)
                  : `w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all duration-200 group cursor-pointer ${isAiGuideActive
                    ? 'bg-slate-100 text-[#0B3A53] font-black'
                    : 'text-slate-600 hover:text-[#0B3A53] hover:bg-slate-100/80'
                  }`
              }
            >
              <div className="flex items-center gap-3 min-w-0">
                <Bot className={`w-5 h-5 shrink-0 ${isCollapsed ? '' : isAiGuideActive ? 'text-[#16A6A1]' : 'text-slate-500'}`} />
                {!isCollapsed && <span className="truncate">AI Travel Guide</span>}
              </div>
              {!isCollapsed && (
                aiGuideOpen ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            {(!isCollapsed && aiGuideOpen) && (
              <div className="ml-5 pl-3 border-l-2 border-slate-200/80 mt-1 space-y-1 py-1 animate-in fade-in duration-200">
                <NavLink
                  to="/admin/ai-guide/purchases"
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${isActive ? 'bg-[#16A6A1]/10 text-[#16A6A1] font-black' : 'text-slate-500 hover:text-[#0B3A53] hover:bg-slate-50'
                    }`
                  }
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Purchase Details</span>
                </NavLink>
                <NavLink
                  to="/admin/ai-guide/usage"
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${isActive ? 'bg-[#16A6A1]/10 text-[#16A6A1] font-black' : 'text-slate-500 hover:text-[#0B3A53] hover:bg-slate-50'
                    }`
                  }
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Usage Statistics</span>
                </NavLink>
                <NavLink
                  to="/admin/ai-guide/analytics"
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${isActive ? 'bg-[#16A6A1]/10 text-[#16A6A1] font-black' : 'text-slate-500 hover:text-[#0B3A53] hover:bg-slate-50'
                    }`
                  }
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Question & Place Analytics</span>
                </NavLink>
              </div>
            )}
          </div>

          {/* 9. Reviews & Feedback */}
          <NavLink
            to="/admin/reviews"
            title={isCollapsed ? 'Reviews & Feedback' : undefined}
            className={({ isActive }) => getItemClass(isActive)}
          >
            <Star className="w-5 h-5 shrink-0 transition-transform group-hover:scale-110" />
            {!isCollapsed && <span className="truncate">Reviews & Feedback</span>}
          </NavLink>
        </div>

        {/* Footer Admin User / Logout */}
        <div className="p-3 border-t border-slate-200/80 bg-slate-50/60 shrink-0">
          {isCollapsed ? (
            <button
              onClick={handleLogout}
              title="Logout"
              aria-label="Logout"
              className="w-12 h-12 mx-auto rounded-2xl flex items-center justify-center text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
            >
              <LogOut className="w-5 h-5" />
            </button>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-3 px-2 py-1">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#16A6A1] to-[#0B3A53] text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                  {session.adminUser?.name?.charAt(0) || 'A'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-black text-[#0B3A53] truncate">
                    {session.adminUser?.name || 'Administrator'}
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 truncate">
                    {session.adminUser?.email || 'admin@example.com'}
                  </div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 text-xs font-bold rounded-xl transition-all shadow-2xs cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
