import { useNotifications } from '../context/useNotifications';
import { NotificationItem } from './NotificationItem';
import { RefreshCw } from 'lucide-react';

export function NotificationDropdown({ onClose }) {
  const { notifications = [], loading = false, fetchNotifications } = useNotifications() || {};

  const handleRefresh = async (e) => {
    e.stopPropagation();
    if (fetchNotifications) {
      await fetchNotifications();
    }
  };

  return (
    <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-lg z-50 animate-fadeIn">
      <div className="flex items-center justify-between p-3 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-700">Notifications</h3>
        <button
          onClick={handleRefresh}
          className={`p-1 rounded-full hover:bg-gray-100 transition-colors duration-200 ${
            loading ? 'animate-spin' : ''
          }`}
          disabled={loading}
          aria-label="Refresh notifications"
        >
          <RefreshCw className="w-4 h-4 text-gray-500" />
        </button>
      </div>
      
      <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center p-4">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center">
            <p className="text-gray-500 text-sm">No notifications yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification._id}
                notification={notification}
              />
            ))}
          </div>
        )}
      </div>

      {notifications.length > 0 && (
        <div className="p-3 border-t border-gray-100 text-center">
          <button
            onClick={onClose}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}