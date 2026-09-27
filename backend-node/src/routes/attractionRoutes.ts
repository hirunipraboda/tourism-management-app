import { Router } from 'express';
import {
  getAttractionsByDestination,
  getAttractionById,
  createAttraction,
  updateAttraction,
  deleteAttraction,
} from '../controllers/attractionController';
import { protect, requireRole } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validationMiddleware';
import { createAttractionSchema } from '../validations';

const router = Router();

router.get('/:id', getAttractionById);
router.post('/', protect, requireRole('ADMIN'), validateRequest(createAttractionSchema), createAttraction);
router.put('/:id', protect, requireRole('ADMIN'), updateAttraction);
router.delete('/:id', protect, requireRole('ADMIN'), deleteAttraction);

export default router;
