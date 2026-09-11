import { Router } from 'express';
import { planTripWithAI, novaGuideBotChat } from '../controllers/aiController';

const router = Router();

router.post('/planner', planTripWithAI);
router.post('/nova-guide', novaGuideBotChat);

export default router;
