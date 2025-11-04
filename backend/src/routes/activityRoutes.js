import express from 'express';
import protect from '../middleware/auth.js';
import authorize from '../middleware/authorizeRoles.js';
import {
  getActivities,
  getActivityById,
  deleteActivity,
  testRoute
} from '../controllers/activityController.js';

const router = express.Router();

// Test route
router.get('/test', testRoute);

// Protected routes
router.get('/', protect, getActivities);
router.get('/:id', protect, getActivityById);
router.delete('/:id', protect, authorize('contractor'), deleteActivity);

export default router;