import { Router } from 'express';
import {
  listOpportunities, getOpportunity, createOpportunity,
  updateOpportunity, deleteOpportunity, listOpportunitiesAdmin,
} from '../controllers/opportunityController.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', listOpportunities);
router.get('/admin/all', requireAuth, requireAdmin, listOpportunitiesAdmin);
router.get('/:id', getOpportunity);
router.post('/', requireAuth, requireAdmin, createOpportunity);
router.put('/:id', requireAuth, requireAdmin, updateOpportunity);
router.delete('/:id', requireAuth, requireAdmin, deleteOpportunity);

export default router;
