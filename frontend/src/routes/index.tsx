import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { LandingPage } from '../pages/LandingPage';
import { OverviewPlaceholder } from '../pages/OverviewPlaceholder';
import { AttractionsPlaceholder } from '../pages/AttractionsPlaceholder';
import { ItinerariesPlaceholder } from '../pages/ItinerariesPlaceholder';
import { BookingsPlaceholder } from '../pages/BookingsPlaceholder';
import { GuidesPlaceholder } from '../pages/GuidesPlaceholder';
import { AvailabilityPlaceholder } from '../pages/AvailabilityPlaceholder';
import { ApprovalsPlaceholder } from '../pages/ApprovalsPlaceholder';
import { ReportsPlaceholder } from '../pages/ReportsPlaceholder';
import { UsersPlaceholder } from '../pages/UsersPlaceholder';
import { SettingsPlaceholder } from '../pages/SettingsPlaceholder';
import { ComponentShowcase } from '../pages/ComponentShowcase';
import { DestinationDetailsPage } from '../pages/DestinationDetailsPage';
import { DestinationsPage } from '../pages/DestinationsPage';
import { TripsPage } from '../pages/TripsPage';
import { ToursPage } from '../pages/ToursPage';
import { PaymentPage } from '../pages/PaymentPage';
import { BookingPage } from '../pages/BookingPage';
import { AITripPlannerPage } from '../pages/AITripPlannerPage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage';
import { ProfilePage } from '../pages/ProfilePage';
import { GuideRegistrationForm } from '../components/guide/GuideRegistrationForm';
import { PageContainer } from '../components/layout/PageContainer';
import { PageHeader } from '../components/ui/PageHeader';

// Admin Console Imports
import { AdminLayout } from '../components/admin/AdminLayout';
import { AdminLoginPage } from '../pages/admin/AdminLoginPage';
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { AdminUsersPage } from '../pages/admin/AdminUsersPage';
import { AdminDestinationsPage } from '../pages/admin/AdminDestinationsPage';
import { AdminAttractionsPage } from '../pages/admin/AdminAttractionsPage';
import { AdminToursPage } from '../pages/admin/AdminToursPage';
import { AdminBookingsPage } from '../pages/admin/AdminBookingsPage';
import { AdminAvailabilityPage } from '../pages/admin/AdminAvailabilityPage';
import { AdminAIWorkflowsPage } from '../pages/admin/AdminAIWorkflowsPage';
import { AdminAIApprovalsPage } from '../pages/admin/AdminAIApprovalsPage';
import { AdminReportsPage } from '../pages/admin/AdminReportsPage';
import { AdminSettingsPage } from '../pages/admin/AdminSettingsPage';
import { AdminGuideToursPage } from '../pages/admin/AdminGuideToursPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Landing, Auth, Destination, Trips, Tours & AI Planner Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/landing" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/destinations" element={<DestinationsPage />} />
      <Route path="/destinations/:id" element={<DestinationDetailsPage />} />
      <Route path="/destination/:id" element={<DestinationDetailsPage />} />
      <Route path="/trips" element={<TripsPage />} />
      <Route path="/tours" element={<ToursPage />} />
      <Route path="/payment" element={<PaymentPage />} />
      <Route path="/booking" element={<BookingPage />} />
      <Route path="/ai-workflows" element={<AITripPlannerPage />} />
      <Route path="/planner" element={<AITripPlannerPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/guide/register" element={<GuideRegistrationForm />} />

      {/* Admin Portal Authentication */}
      <Route path="/admin/login" element={<AdminLoginPage />} />

      {/* Admin Protected Console Layout Routes */}
      <Route element={<AdminLayout />}>
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/users" element={<AdminUsersPage />} />
        <Route path="/admin/destinations" element={<AdminDestinationsPage />} />
        <Route path="/admin/attractions" element={<AdminAttractionsPage />} />
        <Route path="/admin/tours" element={<AdminToursPage />} />
        <Route path="/admin/bookings" element={<AdminBookingsPage />} />
        <Route path="/admin/availability" element={<AdminAvailabilityPage />} />
        <Route path="/admin/ai-workflows" element={<AdminAIWorkflowsPage />} />
        <Route path="/admin/approvals" element={<AdminAIApprovalsPage />} />
        <Route path="/admin/reports" element={<AdminReportsPage />} />
        <Route path="/admin/settings" element={<AdminSettingsPage />} />
        <Route path="/admin/guide-tours" element={<AdminGuideToursPage />} />
      </Route>

      {/* Legacy Operator Console (App Shell) */}
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<OverviewPlaceholder />} />
        <Route path="/attractions" element={<AttractionsPlaceholder />} />
        <Route path="/itineraries" element={<ItinerariesPlaceholder />} />
        <Route path="/bookings" element={<BookingsPlaceholder />} />
        <Route path="/guides" element={<GuidesPlaceholder />} />
        <Route
          path="/guides/register"
          element={
            <PageContainer>
              <PageHeader
                title="Register Tour Guide"
                subtitle="Fill out the details below to add a new licensed tour guide"
                breadcrumbs={[{ label: 'Guides', href: '/guides' }, { label: 'Register' }]}
              />
              <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-100 max-w-2xl">
                <GuideRegistrationForm />
              </div>
            </PageContainer>
          }
        />
        <Route
          path="/guide/register"
          element={
            <PageContainer>
              <PageHeader
                title="Register Tour Guide"
                subtitle="Fill out the details below to add a new licensed tour guide"
                breadcrumbs={[{ label: 'Guides', href: '/guides' }, { label: 'Register' }]}
              />
              <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-100 max-w-2xl">
                <GuideRegistrationForm />
              </div>
            </PageContainer>
          }
        />
        <Route path="/availability" element={<AvailabilityPlaceholder />} />
        <Route path="/approvals" element={<ApprovalsPlaceholder />} />
        <Route path="/reports" element={<ReportsPlaceholder />} />
        <Route path="/users" element={<UsersPlaceholder />} />
        <Route path="/settings" element={<SettingsPlaceholder />} />
        <Route path="/showcase" element={<ComponentShowcase />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};


