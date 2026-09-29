import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '../navigation/Sidebar';
import { Topbar } from '../navigation/Topbar';
import { useSidebar } from '../../hooks/useSidebar';
import { NAV_ITEMS } from '../../constants/navigation';
import { cn } from '../../utils/cn';

export const AppLayout: React.FC = () => {
  const { isCollapsed, toggleCollapse, isMobileOpen, toggleMobile, closeMobile } = useSidebar();
  const location = useLocation();

  const currentNav = NAV_ITEMS.find(item => item.path === location.pathname);
  const title = currentNav ? currentNav.label : 'NOVA Journey Platform';

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-900 font-sans">
      {/* Left Sidebar */}
      <Sidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={toggleCollapse}
        isMobileOpen={isMobileOpen}
        onCloseMobile={closeMobile}
      />

      {/* Main Content Area */}
      <div
        className={cn(
          'flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out',
          isCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        )}
      >
        {/* Topbar */}
        <Topbar onToggleMobileSidebar={toggleMobile} title={title} />

        {/* Page Main View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
