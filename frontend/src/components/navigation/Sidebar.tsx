import React from 'react';
import { NavLink } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Sparkles, Compass } from 'lucide-react';
import { NAV_ITEMS } from '../../constants/navigation';
import { BRAND } from '../../constants/brand';
import { Tooltip } from '../ui/Tooltip';
import { cn } from '../../utils/cn';

export interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

import websiteLogo from '../../assets/website-logo.png';

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          'fixed top-0 bottom-0 left-0 z-40 bg-white text-slate-800 flex flex-col transition-all duration-300 ease-in-out border-r border-slate-200/80 shadow-xl',
          isCollapsed ? 'w-20' : 'w-64',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Brand Header */}
        <div className={`h-16 flex items-center border-b border-slate-200/80 shrink-0 bg-slate-50/50 ${
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
                className="h-9 w-auto object-contain transition-transform group-hover:scale-110 drop-shadow-xs"
              />
            </button>
          ) : (
            <>
              <NavLink to="/dashboard" className="flex items-center group">
                <img
                  src={websiteLogo}
                  alt="Travel Link"
                  className="h-10 w-auto object-contain transition-transform group-hover:scale-105"
                />
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

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1.5 custom-sidebar-scroll">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;

            const navLink = (
              <NavLink
                to={item.path}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  cn(
                    'group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer',
                    isActive
                      ? 'bg-[#16A6A1]/10 text-[#0B3A53] font-black border border-[#16A6A1]/20 shadow-2xs'
                      : 'text-slate-600 hover:text-[#0B3A53] hover:bg-slate-100/70',
                    isCollapsed && 'justify-center px-0'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {/* Active Route Indicator Bar */}
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-[#16A6A1] rounded-r-full shadow-[0_0_8px_#16A6A1]" />
                    )}

                    <Icon
                      className={cn(
                        'w-5 h-5 shrink-0 transition-colors',
                        isActive ? 'text-[#16A6A1]' : 'text-slate-400 group-hover:text-[#0B3A53]'
                      )}
                    />

                    {!isCollapsed && (
                      <span className="truncate flex-1">{item.label}</span>
                    )}

                    {!isCollapsed && item.badge && (
                      <span
                        className={cn(
                          'px-2 py-0.5 text-[10px] font-bold rounded-full border',
                          item.badgeVariant === 'accent' && 'bg-[#16A6A1]/20 text-[#16A6A1] border-[#16A6A1]/40',
                          item.badgeVariant === 'amber' && 'bg-amber-500/20 text-amber-600 border-amber-500/40',
                          (!item.badgeVariant || item.badgeVariant === 'neutral') &&
                            'bg-slate-100 text-slate-600 border-slate-200'
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );

            return isCollapsed ? (
              <Tooltip key={item.id} content={item.label} position="right">
                {navLink}
              </Tooltip>
            ) : (
              <React.Fragment key={item.id}>{navLink}</React.Fragment>
            );
          })}
        </div>

        {/* AI Status Card inside Footer when Expanded */}
        {!isCollapsed && (
          <div className="p-3 border-t border-slate-200/80 bg-slate-50/80">
            <div className="p-3 rounded-xl bg-[#16A6A1]/10 border border-[#16A6A1]/30 text-xs">
              <div className="flex items-center gap-2 text-[#138D89] font-bold mb-1">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                <span>NOVA AI Engine</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-tight">
                AI Agent Active • Real-time journey optimization running
              </p>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};
