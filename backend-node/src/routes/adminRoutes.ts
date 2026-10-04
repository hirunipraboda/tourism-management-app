import { Router } from 'express';
import {
  getAdminDashboard,
  getAdminUsers,
  createAdminUser,
  getAdminBookings,
  getAdminStatistics,
  getAdminReviews,
  updateAdminReviewStatus,
  getAdminUnifiedPayments,
  recordAdminPayment,
} from '../controllers/adminController';
import {
  getAdminChatbotPackages,
  createAdminChatbotPackage,
  updateAdminChatbotPackage,
  deleteAdminChatbotPackage,
  getAdminChatbotPurchases,
  getAdminAIGuideUsage,
  getAdminAIGuideAnalytics,
} from '../controllers/chatController';
import { updateBookingStatus } from '../controllers/bookingController';
import { protect, requireRole } from '../middleware/authMiddleware';

const router = Router();

router.use(protect, requireRole('ADMIN'));

router.get('/dashboard', getAdminDashboard);
router.get('/users', getAdminUsers);
router.post('/users', createAdminUser);
router.get('/bookings', getAdminBookings);
router.put('/bookings/:id/status', updateBookingStatus);
router.get('/payments', getAdminUnifiedPayments);
router.post('/payments', recordAdminPayment);
router.get('/statistics', getAdminStatistics);
router.get('/reviews', getAdminReviews);
router.put('/reviews/:id/status', updateAdminReviewStatus);



// AI Travel Guide Admin Management
router.get('/ai-guide/packages', getAdminChatbotPackages);
router.post('/ai-guide/packages', createAdminChatbotPackage);
router.put('/ai-guide/packages/:id', updateAdminChatbotPackage);
router.delete('/ai-guide/packages/:id', deleteAdminChatbotPackage);
router.get('/ai-guide/purchases', getAdminChatbotPurchases);
router.get('/payments/chatbot', getAdminChatbotPurchases);
router.get('/ai-guide/usage', getAdminAIGuideUsage);
router.get('/ai-guide/analytics', getAdminAIGuideAnalytics);

export default router;

