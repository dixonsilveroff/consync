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

// Get unread count
router.get('/unread-count', protect, async (req, res, next) => {
  try {
    const count = await require('../models/notificationModel.js').default.countDocuments({
      user: req.user._id,
      isRead: false
    });
    res.json({ success: true, count });
  } catch (error) {
    next(error);
  }
});

// Mark notification as read
router.patch('/:id/read', protect, markAsRead);

// Mark all user notifications as read
router.post('/mark-all-read', protect, markAllAsRead);

// Delete a notification
router.delete('/:id', protect, deleteNotification);

export default router;