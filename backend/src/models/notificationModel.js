import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false, // optional if general alert
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['info', 'warning', 'error', 'success', 'project', 'task', 'material', 'budget'],
      default: 'info',
    },
    relatedProject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: false,
    },
    relatedTask: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      required: false,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;