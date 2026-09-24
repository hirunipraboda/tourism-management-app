import React, { useState } from 'react';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { adminAuthService } from '../../services/adminAuthService';

export const AdminLayout: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    const saved = localStorage.getItem('nova_admin_sidebar_collapsed');
    return saved !== null ? saved === 'true' : true;
  });
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  const handleToggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('nova_admin_sidebar_collapsed', String(next));
      return next;
    });
  };

  // Authentication & Role Authorization Guard
  const session = adminAuthService.getSession();
  if (!session.isAuthenticated || session.adminUser?.role !== 'Admin') {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const getPageTitle = (pathname: string) => {
    if (pathname === '/admin' || pathname === '/admin/dashboard') return 'Admin Dashboard';
    if (pathname.startsWith('/admin/users')) return 'User Management';
    if (pathname.startsWith('/admin/destinations')) return 'Destination Management';
    if (pathname.startsWith('/admin/attractions')) return 'Attraction Management';
    if (pathname.startsWith('/admin/categories')) return 'Destination Categories';
    if (pathname.startsWith('/admin/activities')) return 'Tourism Activities';
    if (pathname.startsWith('/admin/trips')) return 'Trip & Itinerary Monitoring';
    if (pathname.startsWith('/admin/bookings')) return 'Booking Management';
    if (pathname.startsWith('/admin/transportation/bus-routes')) return 'Bus Routes & Schedules';
    if (pathname.startsWith('/admin/transportation/train-schedules')) return 'Train Routes & Schedules';
    if (pathname.startsWith('/admin/transportation')) return 'Transportation Suite';
    if (pathname.startsWith('/admin/ai-guide/packages')) return 'AI Travel Guide Packages';
    if (pathname.startsWith('/admin/ai-guide/purchases')) return 'Chatbot Package Purchases';
    if (pathname.startsWith('/admin/ai-guide/usage')) return 'AI Guide Usage Analytics';
    if (pathname.startsWith('/admin/ai-guide/photo-queries')) return 'Photo Query Analytics';
    if (pathname.startsWith('/admin/ai-guide/activity')) return 'Chat Session Activity';
    if (pathname.startsWith('/admin/ai-guide')) return 'AI Travel Guide Management';
    if (pathname.startsWith('/admin/reviews')) return 'Reviews & Feedback';
    if (pathname.startsWith('/admin/ai-workflows')) return 'AI Workflow Monitoring';
    if (pathname.startsWith('/admin/analytics') || pathname.startsWith('/admin/reports')) return 'Analytics & Reports';
    if (pathname.startsWith('/admin/settings')) return 'System Settings';
    return 'TourLink Admin Console';
  };

  const title = getPageTitle(location.pathname);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-[#16A6A1]/20 selection:text-[#0B3A53] flex">
      {/* Admin Left Sidebar */}
      <AdminSidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={handleToggleCollapse}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Main Content Workspace */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${isCollapsed ? 'lg:pl-20' : 'lg:pl-64'
          }`}
      >
        {/* Admin Top Header */}
        <AdminHeader
          onToggleMobileSidebar={() => setIsMobileOpen(!isMobileOpen)}
          title={title}
        />

        {/* Dynamic Nested Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
