import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { LandingPage } from '../pages/LandingPage';
import { OverviewPlaceholder } from '../pages/OverviewPlaceholder';
import { DestinationsPlaceholder } from '../pages/DestinationsPlaceholder';
import { AttractionsPlaceholder } from '../pages/AttractionsPlaceholder';
import { TripsPlaceholder } from '../pages/TripsPlaceholder';
import { ItinerariesPlaceholder } from '../pages/ItinerariesPlaceholder';
import { ToursPlaceholder } from '../pages/ToursPlaceholder';
import { BookingsPlaceholder } from '../pages/BookingsPlaceholder';
import { GuidesPlaceholder } from '../pages/GuidesPlaceholder';
import { AvailabilityPlaceholder } from '../pages/AvailabilityPlaceholder';
import { AIWorkflowsPlaceholder } from '../pages/AIWorkflowsPlaceholder';
import { ApprovalsPlaceholder } from '../pages/ApprovalsPlaceholder';
import { ReportsPlaceholder } from '../pages/ReportsPlaceholder';
import { UsersPlaceholder } from '../pages/UsersPlaceholder';
import { SettingsPlaceholder } from '../pages/SettingsPlaceholder';
import { ComponentShowcase } from '../pages/ComponentShowcase';
import { DestinationDetailsPage } from '../pages/DestinationDetailsPage';
import { DestinationsPage } from '../pages/DestinationsPage';
import { TripsPage } from '../pages/TripsPage';
import { ToursPage } from '../pages/ToursPage';
import { AITripPlannerPage } from '../pages/AITripPlannerPage';
import { ManualTripPlannerPage } from '../pages/ManualTripPlannerPage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage';
import { ProfilePage } from '../pages/ProfilePage';
import { PaymentPortalPage } from '../pages/PaymentPortalPage';
import { ReviewsAndRecommendationsPage } from '../pages/ReviewsAndRecommendationsPage';

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
import { AdminReviewsPage } from '../pages/admin/AdminReviewsPage';

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
      <Route path="/plan-trip" element={<ManualTripPlannerPage />} />
      <Route path="/manual-planner" element={<ManualTripPlannerPage />} />
      <Route path="/tours" element={<ToursPage />} />
      <Route path="/payment" element={<PaymentPortalPage />} />
      <Route path="/payment-portal" element={<PaymentPortalPage />} />
      <Route path="/ai-workflows" element={<AITripPlannerPage />} />
      <Route path="/planner" element={<AITripPlannerPage />} />
      <Route path="/reviews" element={<ReviewsAndRecommendationsPage />} />
      <Route path="/reviews/my-reviews" element={<ReviewsAndRecommendationsPage />} />
      <Route path="/recommendations" element={<ReviewsAndRecommendationsPage />} />
      <Route path="/operator/reviews" element={<Navigate to="/admin/reviews" replace />} />
      <Route path="/operator/customer-satisfaction" element={<Navigate to="/admin/customer-satisfaction" replace />} />
      <Route path="/operator/recommendation-insights" element={<Navigate to="/admin/recommendation-insights" replace />} />
      <Route path="/reviews-recommendations" element={<ReviewsAndRecommendationsPage />} />
      <Route path="/profile" element={<ProfilePage />} />

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
        <Route path="/admin/reviews" element={<AdminReviewsPage defaultTab="recommendation-management" />} />
        <Route path="/admin/recommendations" element={<AdminReviewsPage defaultTab="recommendation-management" />} />
        <Route path="/admin/recommendation-insights" element={<AdminReviewsPage defaultTab="recommendation-management" />} />
        <Route path="/admin/customer-satisfaction" element={<AdminReviewsPage defaultTab="satisfaction-analytics" />} />
      </Route>

      {/* Legacy Operator Console (App Shell) */}
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<OverviewPlaceholder />} />
        <Route path="/attractions" element={<AttractionsPlaceholder />} />
        <Route path="/itineraries" element={<ItinerariesPlaceholder />} />
        <Route path="/bookings" element={<BookingsPlaceholder />} />
        <Route path="/guides" element={<GuidesPlaceholder />} />
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

