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