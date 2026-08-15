import { Router } from 'express';
import { getMatches, getMatchDetail } from '../controllers/matchController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);
router.get('/', getMatches);
router.get('/:id', getMatchDetail);

export default router;
