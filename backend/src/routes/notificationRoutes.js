import express from 'express';
import protect from '../middleware/auth.js';
import authorizeRoles from '../middleware/authorizeRoles.js';
import {
  createNotification,
  getAllNotifications,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
} from '../controllers/notificationController.js';

const router = express.Router();

// Create notification (contractor only)
router.post('/', protect, authorizeRoles(['contractor']), createNotification);

// Get all notifications (contractor only)
router.get('/', protect, authorizeRoles(['contractor']), getAllNotifications);

// Get user's notifications
router.get('/me', protect, getUserNotifications);

// Mark notification as read
router.patch('/:id/read', protect, markAsRead);

// Mark all user notifications as read
router.post('/mark-all-read', protect, markAllAsRead);

// Delete a notification
router.delete('/:id', protect, deleteNotification);

export default router;