import asyncHandler from 'express-async-handler';
import Notification from '../models/notificationModel.js';

// Create a new notification
export const createNotification = asyncHandler(async (req, res) => {
  const { user, title, message, type, relatedProject, relatedTask } = req.body;

  const notification = await Notification.create({
    user,
    title,
    message,
    type,
    relatedProject,
    relatedTask,
  });

  res.status(201).json({ success: true, data: notification });
});

// Get all notifications (admin view)
export const getAllNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find()
    .populate('user relatedProject relatedTask')
    .sort({ createdAt: -1 });
  res.json({ success: true, data: notifications });
});

// Get user-specific notifications
export const getUserNotifications = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const notifications = await Notification.find({ user: userId })
    .sort({ createdAt: -1 });
  res.json({ success: true, data: notifications });
});

// Mark notification as read
export const markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const notification = await Notification.findByIdAndUpdate(
    id, 
    { isRead: true }, 
    { new: true }
  );
  
  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }

  res.json({ success: true, data: notification });
});

// Mark all user notifications as read
export const markAllAsRead = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  
  const result = await Notification.updateMany(
    { user: userId, isRead: false },
    { isRead: true }
  );

  res.json({ 
    success: true, 
    message: `${result.modifiedCount} notifications marked as read`,
    count: result.modifiedCount
  });
});

// Delete a notification
export const deleteNotification = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;
  
  const notification = await Notification.findById(id);
  
  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }

  // Verify notification belongs to current user
  if (notification.user.toString() !== userId.toString()) {
    res.status(403);
    throw new Error('Not authorized to delete this notification');
  }

  await notification.deleteOne();

  res.json({ 
    success: true, 
    message: 'Notification deleted successfully'
  });
});