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
import { AIGuidePage } from '../pages/AIGuidePage';
import { AITripPlannerPage } from '../pages/AITripPlannerPage';
import { ManualTripPlannerPage } from '../pages/ManualTripPlannerPage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage';
import { ProfilePage } from '../pages/ProfilePage';
import { ReviewsAndRecommendationsPage } from '../pages/ReviewsAndRecommendationsPage';
import { BookingPage } from '../pages/BookingPage';
import { PaymentPage } from '../pages/PaymentPage';
import { GuideRegistrationForm } from '../components/guide/GuideRegistrationForm';
import { PageContainer } from '../components/layout/PageContainer';
import { PageHeader } from '../components/ui/PageHeader';

import { AdminLayout } from '../components/admin/AdminLayout';
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { AdminUsersPage } from '../pages/admin/AdminUsersPage';
import { AdminDestinationsPage } from '../pages/admin/AdminDestinationsPage';
import { AdminAttractionsPage } from '../pages/admin/AdminAttractionsPage';
import { AdminCategoriesPage } from '../pages/admin/AdminCategoriesPage';
import { AdminActivitiesPage } from '../pages/admin/AdminActivitiesPage';
import { AdminTripsPage } from '../pages/admin/AdminTripsPage';
import { AdminChatbotPaymentsPage } from '../pages/admin/AdminChatbotPaymentsPage';
import { AdminTransportationPage } from '../pages/admin/AdminTransportationPage';
import { AdminAIGuidePage } from '../pages/admin/AdminAIGuidePage';
import { AdminReviewsPage } from '../pages/admin/AdminReviewsPage';
import { AdminSettingsPage } from '../pages/admin/AdminSettingsPage';
import { AdminGuideToursPage } from '../pages/admin/AdminGuideToursPage';
import { ProtectedRoute } from './ProtectedRoute';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Landing, Auth, Destination, Tours Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/landing" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/destinations" element={<DestinationsPage />} />
      <Route path="/destinations/:id" element={<DestinationDetailsPage />} />
      <Route path="/destination/:id" element={<DestinationDetailsPage />} />
      <Route path="/tours" element={<ToursPage />} />
      <Route path="/ai-guide" element={<AIGuidePage />} />
      <Route path="/booking" element={<BookingPage />} />
      <Route path="/payment" element={<PaymentPage />} />
      <Route path="/payment-portal" element={<PaymentPage />} />
      <Route path="/guide/register" element={
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
      } />

      {/* Authenticated USER Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/trips" element={<TripsPage />} />
        <Route path="/plan-trip" element={<ManualTripPlannerPage />} />
        <Route path="/manual-planner" element={<ManualTripPlannerPage />} />
        <Route path="/ai-workflows" element={<AITripPlannerPage />} />
        <Route path="/planner" element={<AITripPlannerPage />} />
        <Route path="/reviews" element={<ReviewsAndRecommendationsPage />} />
        <Route path="/reviews/my-reviews" element={<ReviewsAndRecommendationsPage />} />
        <Route path="/recommendations" element={<ReviewsAndRecommendationsPage />} />
        <Route path="/reviews-recommendations" element={<ReviewsAndRecommendationsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      <Route path="/operator/reviews" element={<Navigate to="/admin/reviews" replace />} />
      <Route path="/operator/customer-satisfaction" element={<Navigate to="/admin/reviews?tab=customer-satisfaction" replace />} />
      <Route path="/operator/recommendation-insights" element={<Navigate to="/admin/reviews?tab=recommendation-insights" replace />} />

      {/* Admin Portal Authentication — redirects to the shared login page */}
      <Route path="/admin/login" element={<Navigate to="/login" replace />} />

      {/* Admin Protected Console Layout Routes - Exactly 10 Sections */}
      <Route element={<AdminLayout />}>
        {/* 1. Dashboard */}
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />

        {/* 2. User Management */}
        <Route path="/admin/users" element={<AdminUsersPage />} />

        {/* 3. Destination Management (Destinations, Activities, Attractions) */}
        <Route path="/admin/destinations" element={<AdminDestinationsPage />} />
        <Route path="/admin/activities" element={<AdminActivitiesPage />} />
        <Route path="/admin/attractions" element={<AdminAttractionsPage />} />
        <Route path="/admin/categories" element={<AdminCategoriesPage />} />

        {/* 4. Trip & Itinerary Management (Read-only monitoring, User Approval) */}
        <Route path="/admin/trips" element={<AdminTripsPage />} />
        <Route path="/admin/approvals" element={<Navigate to="/admin/trips" replace />} />

        {/* 5. Travel Package Bookings & Payments */}
        <Route path="/admin/chatbot-payments" element={<AdminChatbotPaymentsPage />} />
        <Route path="/admin/package-bookings" element={<AdminChatbotPaymentsPage />} />
        <Route path="/admin/bookings" element={<AdminChatbotPaymentsPage />} />


        {/* 6. Transportation (Bus Routes, Train Schedules) */}
        <Route path="/admin/transportation" element={<AdminTransportationPage />} />
        <Route path="/admin/transportation/bus-routes" element={<AdminTransportationPage />} />
        <Route path="/admin/transportation/train-schedules" element={<AdminTransportationPage />} />
        <Route path="/admin/transportation/promo-codes" element={<Navigate to="/admin/transportation" replace />} />

        {/* 8. AI Travel Guide (Usage Statistics, Question & Place Analytics) */}
        <Route path="/admin/ai-guide" element={<AdminAIGuidePage />} />
        <Route path="/admin/ai-guide/purchases" element={<Navigate to="/admin/ai-guide/usage" replace />} />
        <Route path="/admin/ai-guide/usage" element={<AdminAIGuidePage />} />
        <Route path="/admin/ai-guide/analytics" element={<AdminAIGuidePage />} />

        <Route path="/admin/ai-guide/packages" element={<AdminAIGuidePage />} />
        <Route path="/admin/ai-guide/photo-queries" element={<AdminAIGuidePage />} />
        <Route path="/admin/ai-guide/activity" element={<AdminAIGuidePage />} />

        {/* Guide & Tour Operations Management */}
        <Route path="/admin/guide-tours" element={<AdminGuideToursPage />} />
        <Route path="/admin/guides" element={<AdminGuideToursPage />} />
        <Route path="/admin/tour-operations" element={<AdminGuideToursPage />} />

        {/* 9. Reviews & Feedback */}
        <Route path="/admin/reviews" element={<AdminReviewsPage defaultTab="review-management" />} />
        <Route path="/admin/customer-satisfaction" element={<AdminReviewsPage defaultTab="customer-satisfaction" />} />
        <Route path="/admin/recommendation-insights" element={<AdminReviewsPage defaultTab="recommendation-insights" />} />

        <Route path="/admin/monitoring" element={<Navigate to="/admin/dashboard" replace />} />

        {/* 10. Settings & Profile */}
        <Route path="/admin/settings" element={<AdminSettingsPage />} />
        <Route path="/admin/profile" element={<AdminSettingsPage />} />
      </Route>

      {/* Legacy Operator Console (App Shell) */}
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<OverviewPlaceholder />} />
        <Route path="/attractions" element={<AttractionsPlaceholder />} />
        <Route path="/itineraries" element={<ItinerariesPlaceholder />} />
        <Route path="/bookings" element={<BookingsPlaceholder />} />
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
