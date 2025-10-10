import express from 'express';
import protect from '../middleware/auth.js';
import authorizeRoles from '../middleware/authorizeRoles.js';
import {
  testRoute,
  createCostLine,
  getCostLines,
  getProjectCostSummary,
  deleteCostLine
} from '../controllers/financeController.js';

const router = express.Router();

router.get('/test', testRoute);
router.post('/', protect, authorizeRoles('admin', 'engineer'), createCostLine);
router.get('/', protect, getCostLines);
router.get('/summary/:id', protect, getProjectCostSummary);
router.delete('/:id', protect, authorizeRoles('admin'), deleteCostLine);

export default router;