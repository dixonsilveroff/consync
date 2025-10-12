import { useNotifications } from '../context/useNotifications';
import { formatDate } from '../utils/formatDate';
import { X } from 'lucide-react';

export function NotificationItem({ notification = {} }) {
  const { markAsRead, clearNotification } = useNotifications() || {};

  const typeColors = {
    info: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
    warning: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200',
    success: 'bg-green-100 text-green-700 hover:bg-green-200',
    error: 'bg-red-100 text-red-700 hover:bg-red-200',
  };

  if (!notification._id) return null;

  return (
    <div
      className={`group flex justify-between items-start p-4 hover:bg-gray-50 transition-colors duration-200 ${
        notification.isRead ? 'opacity-70' : ''
      }`}
    >
      <div className="flex-1 min-w-0 pr-4">
        <div className="flex items-start justify-between">
          <p className="font-medium text-gray-800 text-sm truncate">
            {notification.title}
          </p>
          <button
            onClick={() => clearNotification(notification._id)}
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 hover:bg-gray-200 rounded-full"
            aria-label="Clear notification"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <p className="text-gray-600 text-xs mt-1 line-clamp-2">
          {notification.message}
        </p>
        <div className="flex items-center justify-between mt-2">
          <p className="text-gray-400 text-[11px]">
            {formatDate(notification.createdAt)}
          </p>
          {!notification.isRead && (
            <button
              onClick={() => markAsRead(notification._id)}
              className={`text-xs px-2 py-1 rounded-lg font-medium ${
                typeColors[notification.type]
              } transition-colors duration-200`}
            >
              Mark as Read
            </button>
          )}
        </div>
      </div>
    </div>
  );
}