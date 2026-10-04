import { Router } from 'express';
import {
  createSession,
  listSessions,
  getSession,
  deleteSession,
  sendMessage,
  getUserPackageStatus,
  listAvailablePackages,
  purchasePackage,
  upload,
} from '../controllers/chatController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// All chat routes require authentication
router.use(protect);

// Package & Quota status
router.get('/package-status', getUserPackageStatus);
router.get('/packages', listAvailablePackages);
router.post('/packages/purchase', purchasePackage);

// Session management
router.post('/sessions', createSession);
router.get('/sessions', listSessions);
router.get('/sessions/:sessionId', getSession);
router.delete('/sessions/:sessionId', deleteSession);

// Messaging — multipart form for image support
router.post(
  '/sessions/:sessionId/messages',
  upload.single('image'),
  sendMessage
);

export default router;
