import { Router } from 'express';
import {
  generateTripPlan,
  saveTripPlan,
  getTripPlanById,
  updateTripPlan,
  deleteTripPlan,
  regenerateDay,
  regenerateActivity,
} from './trip-planner.controller';
import { protectOptional } from '../../middleware/authMiddleware';

const router = Router();

router.post('/generate', generateTripPlan);
router.post('/save', protectOptional, saveTripPlan);
router.get('/:id', protectOptional, getTripPlanById);
router.put('/:id', protectOptional, updateTripPlan);
router.delete('/:id', protectOptional, deleteTripPlan);
router.post('/regenerate-day', regenerateDay);
router.post('/regenerate-activity', regenerateActivity);

export default router;
