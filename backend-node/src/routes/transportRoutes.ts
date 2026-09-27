import { Router } from 'express';
import { getTransportPartners } from '../controllers/transportController';

const router = Router();

router.get('/', getTransportPartners);

export default router;
