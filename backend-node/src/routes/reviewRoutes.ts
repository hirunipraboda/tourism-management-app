import { Router } from 'express';
import {
  getReviews,
  getMyReviews,
  createReview,
  updateReview,
  deleteReview,
} from '../controllers/reviewController';
import { protect, protectOptional } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validationMiddleware';
import { createReviewSchema } from '../validations';

const router = Router();

router.get('/', getReviews);
router.get('/my-reviews', protectOptional, getMyReviews);
router.post('/', protectOptional, validateRequest(createReviewSchema), createReview);
router.put('/:id', protectOptional, updateReview);
router.delete('/:id', protectOptional, deleteReview);

export default router;

