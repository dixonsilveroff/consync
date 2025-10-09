import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  testRoute,
  createCostLine,
  getCostLines,
  getProjectCostSummary,
  deleteCostLine
} from '../controllers/financeController.js';

const router = express.Router();

router.get('/test', testRoute);
router.post('/', protect, authorize(['admin','engineer']), createCostLine);
router.get('/', protect, getCostLines);
router.get('/summary/:id', protect, getProjectCostSummary);
router.delete('/:id', protect, authorize(['admin']), deleteCostLine);

export default router;