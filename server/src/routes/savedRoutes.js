import { Router } from 'express';
import {
  listSaved, saveOpportunity, updateSavedStatus, unsaveOpportunity,
} from '../controllers/savedController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);
router.get('/', listSaved);
router.post('/:opportunityId', saveOpportunity);
router.put('/:opportunityId', updateSavedStatus);
router.delete('/:opportunityId', unsaveOpportunity);

export default router;
