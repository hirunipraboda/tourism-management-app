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
import { AITripPlannerPage } from '../pages/AITripPlannerPage';
import { ManualTripPlannerPage } from '../pages/ManualTripPlannerPage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage';
import { ProfilePage } from '../pages/ProfilePage';
import { ReviewsAndRecommendationsPage } from '../pages/ReviewsAndRecommendationsPage';

// Admin Console Imports
import { AdminLayout } from '../components/admin/AdminLayout';
import { AdminLoginPage } from '../pages/admin/AdminLoginPage';
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
      <Route path="/payment" element={<Navigate to="/tours" replace />} />
      <Route path="/payment-portal" element={<Navigate to="/tours" replace />} />
      <Route path="/ai-workflows" element={<AITripPlannerPage />} />
      <Route path="/planner" element={<AITripPlannerPage />} />
      <Route path="/reviews" element={<ReviewsAndRecommendationsPage />} />
      <Route path="/reviews/my-reviews" element={<ReviewsAndRecommendationsPage />} />
      <Route path="/recommendations" element={<ReviewsAndRecommendationsPage />} />
      <Route path="/operator/reviews" element={<Navigate to="/admin/reviews" replace />} />
      <Route path="/operator/customer-satisfaction" element={<Navigate to="/admin/reviews?tab=customer-satisfaction" replace />} />
      <Route path="/operator/recommendation-insights" element={<Navigate to="/admin/reviews?tab=recommendation-insights" replace />} />
      <Route path="/reviews-recommendations" element={<ReviewsAndRecommendationsPage />} />
      <Route path="/profile" element={<ProfilePage />} />

      {/* Admin Portal Authentication */}
      <Route path="/admin/login" element={<AdminLoginPage />} />

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

        {/* 5. Chatbot Payments (Safe Masked Payment Info) */}
        <Route path="/admin/chatbot-payments" element={<AdminChatbotPaymentsPage />} />

        {/* 6. Transportation (Bus Routes, Train Schedules) */}
        <Route path="/admin/transportation" element={<AdminTransportationPage />} />
        <Route path="/admin/transportation/bus-routes" element={<AdminTransportationPage />} />
        <Route path="/admin/transportation/train-schedules" element={<AdminTransportationPage />} />
        <Route path="/admin/transportation/promo-codes" element={<Navigate to="/admin/transportation" replace />} />

        {/* 8. AI Travel Guide (Purchase Details, Usage Statistics, Question & Place Analytics) */}
        <Route path="/admin/ai-guide" element={<AdminAIGuidePage />} />
        <Route path="/admin/ai-guide/purchases" element={<AdminAIGuidePage />} />
        <Route path="/admin/ai-guide/usage" element={<AdminAIGuidePage />} />
        <Route path="/admin/ai-guide/analytics" element={<AdminAIGuidePage />} />
        <Route path="/admin/ai-guide/packages" element={<AdminAIGuidePage />} />
        <Route path="/admin/ai-guide/photo-queries" element={<AdminAIGuidePage />} />
        <Route path="/admin/ai-guide/activity" element={<AdminAIGuidePage />} />

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
