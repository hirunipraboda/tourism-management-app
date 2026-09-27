import { Router } from 'express';
import {
  getDestinations,
  getDestinationById,
  createDestination,
  updateDestination,
  deleteDestination,
} from '../controllers/destinationController';
import { getAttractionsByDestination } from '../controllers/attractionController';
import { protect, requireRole } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validationMiddleware';
import { createDestinationSchema } from '../validations';

const router = Router();

router.get('/', getDestinations);
router.get('/:id', getDestinationById);
router.get('/:destinationId/attractions', getAttractionsByDestination);

router.post('/', protect, requireRole('ADMIN'), validateRequest(createDestinationSchema), createDestination);
router.put('/:id', protect, requireRole('ADMIN'), updateDestination);
router.delete('/:id', protect, requireRole('ADMIN'), deleteDestination);

export default router;
