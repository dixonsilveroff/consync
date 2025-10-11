import express from 'express';
import protect from '../middleware/auth.js';
import authorizeRoles from '../middleware/authorizeRoles.js';
import {
  testRoute,
  getGlobalSummary,
  getProjectAnalytics,
  getActivityTrends,
  getCostTrend
} from '../controllers/analyticsController.js';

const router = express.Router();

router.get('/test', testRoute);
router.get('/summary/global', protect, getGlobalSummary);
router.get('/summary/project/:id', protect, getProjectAnalytics);
router.get('/trends/activity', protect, getActivityTrends);
router.get('/trends/cost', protect, getCostTrend);

export default router;