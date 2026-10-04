import { Router } from 'express';
import { register, login, getMe, updateProfile, resetPassword, forgotPassword, socialLogin } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validationMiddleware';
import { registerSchema, loginSchema } from '../validations';

const router = Router();

router.post('/register', validateRequest(registerSchema), register);
router.post('/login', validateRequest(loginSchema), login);
router.post('/social-login', socialLogin);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/reset-password', resetPassword);
router.post('/forgot-password', forgotPassword);

export default router;

