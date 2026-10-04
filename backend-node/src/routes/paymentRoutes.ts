import { Router } from 'express';
import { processCheckout } from '../controllers/paymentController';

const router = Router();

// Endpoint for users completing checkout (both Travel Package and AI Chatbot subscriptions)
router.post('/checkout', processCheckout);

export default router;
