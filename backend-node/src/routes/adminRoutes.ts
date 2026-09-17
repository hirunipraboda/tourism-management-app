import { Router } from 'express';
import {
  getAdminDashboard,
  getAdminUsers,
  getAdminBookings,
  getAdminStatistics,
} from '../controllers/adminController';
import { protect, requireRole } from '../middleware/authMiddleware';

const router = Router();

router.use(protect, requireRole('ADMIN'));

router.get('/dashboard', getAdminDashboard);
router.get('/users', getAdminUsers);
router.get('/bookings', getAdminBookings);
router.get('/statistics', getAdminStatistics);

export default router;
