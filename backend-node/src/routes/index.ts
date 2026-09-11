import { Router } from 'express';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import destinationRoutes from './destinationRoutes';
import attractionRoutes from './attractionRoutes';
import tourRoutes from './tourRoutes';
import transportRoutes from './transportRoutes';
import tripRoutes from './tripRoutes';
import bookingRoutes from './bookingRoutes';
import reviewRoutes from './reviewRoutes';
import adminRoutes from './adminRoutes';
import aiRoutes from './aiRoutes';
import tripPlannerRoutes from '../modules/trip-planner/trip-planner.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/destinations', destinationRoutes);
router.use('/attractions', attractionRoutes);
router.use('/tours', tourRoutes);
router.use('/transport', transportRoutes);
router.use('/trips', tripRoutes);
router.use('/bookings', bookingRoutes);
router.use('/reviews', reviewRoutes);
router.use('/admin', adminRoutes);
router.use('/ai', aiRoutes);
router.use('/trip-planner', tripPlannerRoutes);

export default router;
