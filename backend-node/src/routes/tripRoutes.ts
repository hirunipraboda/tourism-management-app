import { Router } from 'express';
import {
  getTrips,
  getTripById,
  createTrip,
  updateTrip,
  deleteTrip,
} from '../controllers/tripController';
import { protect } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validationMiddleware';
import { createTripSchema } from '../validations';

const router = Router();

router.use(protect);

router.get('/', getTrips);
router.get('/:id', getTripById);
router.post('/', validateRequest(createTripSchema), createTrip);
router.put('/:id', updateTrip);
router.delete('/:id', deleteTrip);

export default router;
