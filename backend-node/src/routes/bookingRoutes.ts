import { Router } from 'express';
import {
  getBookings,
  getBookingById,
  createBooking,
  updateBookingStatus,
  cancelBooking,
} from '../controllers/bookingController';
import { protect } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validationMiddleware';
import { createBookingSchema } from '../validations';

const router = Router();

router.use(protect);

router.get('/', getBookings);
router.get('/:id', getBookingById);
router.post('/', validateRequest(createBookingSchema), createBooking);
router.put('/:id', updateBookingStatus);
router.delete('/:id', cancelBooking);

export default router;
