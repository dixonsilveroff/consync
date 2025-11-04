import express from 'express';
import protect from '../middleware/auth.js';
import authorizeRoles from '../middleware/authorizeRoles.js';
import {
  testRoute,
  createCostLine,
  getCostLines,
  getCostLinesByProject,
  updateCostLine,
  getProjectCostSummary,
  deleteCostLine
} from '../controllers/financeController.js';

const router = express.Router();

router.get('/test', testRoute);

// Cost line CRUD operations
router.post('/', protect, authorizeRoles('contractor', 'engineer'), createCostLine);
router.get('/', protect, getCostLines);
router.get('/project/:projectId', protect, getCostLinesByProject);
router.put('/:id', protect, authorizeRoles('contractor', 'engineer'), updateCostLine);
router.delete('/:id', protect, authorizeRoles('contractor'), deleteCostLine);

// Project cost summary
router.get('/summary/:id', protect, getProjectCostSummary);

export default router;