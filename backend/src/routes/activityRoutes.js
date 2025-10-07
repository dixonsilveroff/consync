import express from 'express';
import auth from '../middleware/auth.js';
import authorizeRoles from '../middleware/authorizeRoles.js';
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
router.get('/', auth, getActivities);
router.get('/:id', auth, getActivityById);
router.delete('/:id', auth, authorizeRoles('admin'), deleteActivity);

export default router;