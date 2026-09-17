import { Router } from 'express';
import {
  getTours,
  getTourById,
  createTour,
  updateTour,
  deleteTour,
} from '../controllers/tourController';
import { protect, requireRole } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validationMiddleware';
import { createTourSchema } from '../validations';

const router = Router();

router.get('/', getTours);
router.get('/:id', getTourById);

router.post('/', protect, requireRole('ADMIN'), validateRequest(createTourSchema), createTour);
router.put('/:id', protect, requireRole('ADMIN'), updateTour);
router.delete('/:id', protect, requireRole('ADMIN'), deleteTour);

export default router;
