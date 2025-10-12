import express from 'express';
import protect from '../middleware/auth.js';
import authorizeRoles from '../middleware/authorizeRoles.js';
import {
  createNotification,
  getAllNotifications,
  getUserNotifications,
  markAsRead
} from '../controllers/notificationController.js';

const router = express.Router();

// Create notification (admin only)
router.post('/', protect, authorizeRoles(['admin']), createNotification);

// Get all notifications (admin only)
router.get('/', protect, authorizeRoles(['admin']), getAllNotifications);

// Get user's notifications
router.get('/me', protect, getUserNotifications);

// Mark notification as read
router.patch('/:id/read', protect, markAsRead);

export default router;