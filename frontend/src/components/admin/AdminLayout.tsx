import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';

export const AdminLayout: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  const getPageTitle = (pathname: string) => {
    switch (pathname) {
      case '/admin':
        return 'Admin Dashboard';
      case '/admin/users':
        return 'User Management';
      case '/admin/destinations':
        return 'Destination Management';
      case '/admin/attractions':
        return 'Attraction Management';
      case '/admin/tours':
        return 'Tour Package Management';
      case '/admin/bookings':
        return 'Booking Management';
      case '/admin/availability':
        return 'Availability & Schedule';
      case '/admin/ai-workflows':
        return 'AI Workflow Monitoring';
      case '/admin/approvals':
        return 'AI Approval Center';
      case '/admin/reports':
        return 'Analytics & Reports';
      case '/admin/settings':
        return 'System Settings';
      default:
        return 'Travel Link Administration';
    }
  };

  const title = getPageTitle(location.pathname);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-[#16A6A1]/20 selection:text-[#0B3A53] flex">
      
      {/* Admin Left Sidebar */}
      <AdminSidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Main Content Workspace */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'lg:pl-20' : 'lg:pl-64'
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
