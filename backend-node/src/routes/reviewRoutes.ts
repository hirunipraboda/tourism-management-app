import { Router } from 'express';
import {
  getReviews,
  createReview,
  updateReview,
  deleteReview,
} from '../controllers/reviewController';
import { protect } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validationMiddleware';
import { createReviewSchema } from '../validations';

const router = Router();

router.get('/', getReviews);
router.post('/', protect, validateRequest(createReviewSchema), createReview);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);

export default router;
