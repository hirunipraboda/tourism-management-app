import { Router } from 'express';
import { getUsers, toggleUserStatus } from '../controllers/userController';
import { protect, requireRole } from '../middleware/authMiddleware';

const router = Router();

router.get('/', protect, requireRole('ADMIN'), getUsers);
router.patch('/:id/toggle-status', protect, requireRole('ADMIN'), toggleUserStatus);

export default router;
