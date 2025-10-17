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

// Create notification (admin only)
router.post('/', protect, authorizeRoles(['admin']), createNotification);

// Get all notifications (admin only)
router.get('/', protect, authorizeRoles(['admin']), getAllNotifications);

// Get user's notifications
router.get('/me', protect, getUserNotifications);

// Mark notification as read
router.patch('/:id/read', protect, markAsRead);

// Mark all user notifications as read
router.post('/mark-all-read', protect, markAllAsRead);

// Delete a notification
router.delete('/:id', protect, deleteNotification);

export default router;